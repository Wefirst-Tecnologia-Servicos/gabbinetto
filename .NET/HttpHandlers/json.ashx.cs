using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Security;
using System.Security.Permissions;
using System.Text;
using System.Web;

//[assembly: AllowPartiallyTrustedCallers]

namespace WebApplication1.HttpHandlers
{
    public class json : BaseHandler
    {

        public override void ProcessRequest(HttpContext context)
        {
            StringBuilder sbResult = null;
            try
            {
                base.TipoSaida = context.Request.Params["pdf"] != null ? tipoSaida.pdf : tipoSaida.json;
                base.ProcessRequest(context);
                string action = context.Request.Params["action"];

                // valida a sessão
                if (action == "f_logout") this.Logout(context, ref sbResult);
                else if (action == "f_get_session") this.GetSession(ref sbResult);
                else
                {
                    List<MySqlParameter> outParameters = null;
                    base.ExecuteProcedure(context, ref outParameters, ref sbResult);
                    if (action == "f_login")
                    {
                        int idUsuario = Convert.ToInt32(outParameters.Find(x => x.ParameterName == "p_id_usuario").Value);
                        base.LOGIN = idUsuario > 0 ? new Login(context.Request.Params["p_usuario"], idUsuario) : null;
                    }
                    MySqlParameter p_smtp = outParameters.Find(x => x.ParameterName == "p_email_smtp");
                    if (p_smtp != null)
                    {
                        MySqlParameter p_usuario = outParameters.Find(x => x.ParameterName == "p_email_usuario");
                        MySqlParameter p_senha = outParameters.Find(x => x.ParameterName == "p_email_senha");
                        MySqlParameter p_ssl = outParameters.Find(x => x.ParameterName == "p_email_ssl");
                        MySqlParameter p_destinatario = outParameters.Find(x => x.ParameterName == "p_email_destinatario");
                        MySqlParameter p_assunto = outParameters.Find(x => x.ParameterName == "p_email_assunto");
                        MySqlParameter p_mensagem = outParameters.Find(x => x.ParameterName == "p_email_mensagem");

                        base.SendMail(p_usuario.Value.ToString(),
                                      p_senha.Value.ToString(),
                                      p_smtp.Value.ToString(),
                                      p_ssl.Value.ToString(),
                                      p_destinatario.Value.ToString(),
                                      p_assunto.Value.ToString(),
                                      p_mensagem.Value.ToString());
                    }
                }
            }
            catch (Exception err)
            {
                sbResult = new StringBuilder();
                sbResult.Append("f_erro({ \"mensagem\" : \"");
                sbResult.Append((err.Message).Replace("\t", " ").Replace("\n", "\\n").Replace("\r", " ").Replace("\"", "'").Replace("\\", "\\\\").Trim());
                sbResult.Append("\" });");
            }
            finally
            {
                if (sbResult != null)
                {
                    if (base.TipoSaida == tipoSaida.pdf) base.GerarPdf(sbResult.ToString(), "", context.Response.OutputStream);
                    else context.Response.Write(sbResult.ToString().Replace("\n", "").Replace("\r", ""));
                }
            }
        }

        private void Logout(HttpContext context, ref StringBuilder sbText)
        {
            base.LOGIN = null;
            sbText.Append("f_logout({ \"retorno\" : \"true\" });");
        }

        private void GetSession(ref StringBuilder sbText)
        {
            sbText = new StringBuilder();
            sbText.Append("f_get_session({ \"Nome\": \"");
            sbText.Append(base.LOGIN.Nome);
            sbText.Append("\", \"Id\": \"");
            sbText.Append(base.LOGIN.Id);
            sbText.Append("\" });");
        }
    }
}