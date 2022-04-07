using iTextSharp.text;
using iTextSharp.tool.xml.css;
using iTextSharp.text.html.simpleparser;
using iTextSharp.text.xml.simpleparser;
using iTextSharp.text.pdf;
using iTextSharp.tool.xml.pipeline.css;
using iTextSharp.tool.xml.pipeline.html;
using iTextSharp.tool.xml;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Web;
using System.Web.SessionState;

namespace WebApplication1.HttpHandlers
{
    public class BaseHandler : IHttpHandler, IRequiresSessionState
    {
        protected tipoSaida TipoSaida;

        protected enum tipoSaida
        {
            json = 0,
            html = 2,
            text = 3,
            download = 4,
            pdf = 5
        }

        public bool IsReusable
        {
            get { return false; }
        }

        [Serializable]
        public class Login
        {
            public string Nome;
            public int Id;

            public Login(string nome, int id)
            {
                this.Nome = nome;
                this.Id = id;
            }

            ~Login() { this.Nome = null; }
        }

        protected Login LOGIN
        {
            get { return (Login)HttpContext.Current.Session["LOGIN"]; }
            set { HttpContext.Current.Session["LOGIN"] = value; }
        }

        public virtual void ProcessRequest(HttpContext context)
        {
            switch (this.TipoSaida)
            {
                case tipoSaida.json:
                    context.Response.ContentType = "application/json";
                    break;
                case tipoSaida.download:
                    context.Response.ContentType = "application/octet-stream";
                    break;
                case tipoSaida.pdf:
                    context.Response.ContentType = "application/pdf";
                    context.Response.AddHeader("content-disposition", "filename=relatorio.pdf");
                    break;
                default:
                    context.Response.ContentType = "text/plain";
                    break;
            }

            context.Response.ContentEncoding = System.Text.Encoding.UTF8;
            string sAction = context.Request.Params["action"];
            if (string.IsNullOrEmpty(sAction)) sAction = "";
            if (sAction != "f_login" && sAction.Substring(0, 5) != "loja_" && this.LOGIN == null)
                throw new Exception("Não existe um usuário logado no sistema.");

        }

        protected Document GerarPdf(string html, string css, Stream streamSaida)
        {
            using (Document doc = new Document(PageSize.A4, 20, 20, 20, 20))
            using (PdfWriter writer = PdfWriter.GetInstance(doc, streamSaida))
            {
                doc.Open();

                using (MemoryStream msCss = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(css)))
                using (MemoryStream msHtml = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(html)))
                    iTextSharp.tool.xml.XMLWorkerHelper.GetInstance().ParseXHtml(writer, doc, msHtml, msCss);

                writer.CloseStream = false;
                doc.Close();
                return doc;
            }
        }

        /// <summary>
        /// Roda uma procedure, retornando os parâmetros de saída e serializando o resultado
        /// </summary>
        /// <param name="context">Contexto da chamada http</param>
        /// <param name="paramSaida">Parâmetros do topo OUT já populados</param>
        /// <param name="sbResultSet">Resultado da procedure, serializado</param>
        public void ExecuteProcedure(HttpContext context, ref List<MySqlParameter> paramSaida, ref StringBuilder sbResultSet)
        {
            sbResultSet = new StringBuilder();
            List<MySqlParameter> parametros = this.GetParameters(context, ref paramSaida);

            MySqlParameter bbArquivo = parametros.Find(x => x.ParameterName == "p_anexo_arquivo");

            if (bbArquivo != null && context.Request.Files.Count > 0)
            {
                byte[] fileContents = new byte[context.Request.Files[0].ContentLength];
                context.Request.Files[0].InputStream.Read(fileContents, 0, context.Request.Files[0].ContentLength);
                bbArquivo.Value = (object)fileContents;
            }

            MySqlConnection conn = new MySqlConnection(ConfigurationManager.ConnectionStrings["folharosto"].ConnectionString);
            string nomeProc = context.Request.Params["action"];
            MySqlCommand cmd = new MySqlCommand(nomeProc, conn);
            cmd.CommandType = System.Data.CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parametros.ToArray());    
            conn.Open();
            if (nomeProc.IndexOf("sp_noresult_") > -1) 
                cmd.ExecuteNonQuery();
            else
            {
                MySqlDataReader dr = cmd.ExecuteReader();
                while (dr.Read())
                    for (int i = 0; i < dr.FieldCount; i++)
                    {
                        object objValue = dr[i];
                        if (objValue != null)
                            sbResultSet.Append(objValue.ToString());

                    }
            }
            conn.Close();
        }

        /// <summary>
        /// Obtêm os parametros de entrada de uma procedure (já populados com os valores enviados pela querystring)
        /// </summary>
        /// <param name="context">contexto da chamada http</param>
        /// <param name="paramSaida">lista dos parâmetros de saída (para possível utilização posterior)</param>
        /// <returns></returns>
        private List<MySqlParameter> GetParameters(HttpContext context, ref List<MySqlParameter> paramSaida)
        {
            paramSaida = new List<MySqlParameter>();
            string comando = @"SELECT parameter_mode as saida,
                                      parameter_name as campo,
                                      data_type as tipo,
                                      character_maximum_length,
                                      numeric_precision,
                                      numeric_scale,
                                      dtd_identifier
                                 FROM information_schema.parameters 
                                WHERE SPECIFIC_NAME = '{0}'
                             ORDER BY ordinal_position";
            string nomeProcedure = context.Request.Params["action"];
            comando = string.Format(comando, nomeProcedure);
            List<MySqlParameter> parametros = new List<MySqlParameter>();
            MySqlConnection conn = new MySqlConnection(ConfigurationManager.ConnectionStrings["folharosto"].ConnectionString);
            MySqlCommand cmd = new MySqlCommand(comando, conn);
            try
            {
                conn.Open();
            }
            catch (MySql.Data.MySqlClient.MySqlException err)
            {
                throw new Exception(err.Message);
            }
            MySqlDataReader dr = cmd.ExecuteReader();
            while (dr.Read())
            {
                string paramName = dr["campo"].ToString();
                string paramType = dr["tipo"].ToString().ToLower();
                object value = context.Request.Params[paramName];
                if (value == null || value.ToString() == "" || value.ToString() == "null")
                {
                    value = Convert.DBNull;
                }
                else if (paramType.IndexOf("int") > -1)
                {
                    value = Convert.ToInt32(value);
                }
                else if (paramType.IndexOf("decimal") > -1)
                {
                    string strValue = value.ToString().Trim();
                    while (strValue.Length > 0 && ("0123456789").IndexOf(strValue.Substring(strValue.Length - 1)) < 0) strValue = strValue.Substring(0, strValue.Length - 1);
                    value = Convert.ToDecimal(strValue.Replace("R$", "").Replace("%", "").Trim().Replace(" ", ""), new System.Globalization.CultureInfo("en-US"));
                }
                else if (paramType.IndexOf("date") > -1)
                {
                    string[] campoData = value.ToString().Trim().Split('/');
                    value = new DateTime(Convert.ToInt32(campoData[2]), Convert.ToInt32(campoData[1]), Convert.ToInt32(campoData[0]));
                }
                MySqlParameter parametro = null;
                if (paramType.IndexOf("varchar") > -1)
                {
                    parametro = new MySqlParameter(paramName, MySqlDbType.VarChar, Convert.ToInt32(dr["character_maximum_length"]));
                    parametro.Value = value;
                }
                else parametro = new MySqlParameter(paramName, value);

                bool parametroDeSaida = dr["saida"].ToString() == "OUT";

                if (parametroDeSaida)
                {
                    if (paramType.IndexOf("int") > -1) parametro.DbType = System.Data.DbType.Int32;
                    parametro.Direction = System.Data.ParameterDirection.Output;
                }

                parametros.Add(parametro);

                if (parametroDeSaida) paramSaida.Add(parametro);
            }
            conn.Close();
            conn.Dispose();
            return parametros;
        }


        /// <summary>
        /// Envia um e-mail
        /// </summary>
        /// <param name="destinatario">Destinatário</param>
        /// <param name="assunto">Assunto</param>
        /// <param name="mensagem">Mensagem</param>
        protected void SendMail(string remetente, string senha, string smtp, string ssl,string destinatario, string assunto, string mensagem)
        {
            MailMessage Email = new MailMessage();
            //Define o Remetente 
            Email.From = new MailAddress(remetente);
            Email.ReplyToList.Add(remetente);
            //Define o destinatário
            Email.To.Add(destinatario);
            //Define o assunto
            Email.Subject = assunto.Trim();
            //Define o formato da mensagem que pode ser Texto ou Html 
            Email.IsBodyHtml = true;
            // Define a mensagem
            Email.Body = mensagem;
            //Define a prioridade da mensagem
            Email.Priority = MailPriority.Normal;
            //Define o charset da mensagem
            //Email.SubjectEncoding = Encoding.GetEncoding("ISO-8859-1");
            Email.BodyEncoding = Encoding.GetEncoding("ISO-8859-1");
            //Define qual o host a ser usado para envio de mensagens. 
            string[] serverSmtp = smtp.Split(':');
            SmtpClient smtpClient = new SmtpClient(serverSmtp[0], Convert.ToInt32(serverSmtp[1]));
            smtpClient.EnableSsl = ssl == "SIM";
            smtpClient.Credentials = new NetworkCredential(remetente, senha);
            //Envia a mensagem
            smtpClient.Send(Email);
        }
    }
}