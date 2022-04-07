using MySql.Data.MySqlClient;
using System.Configuration;
using System.Web;

namespace WebApplication1.HttpHandlers
{
    /// <summary>
    /// Summary description for download
    /// </summary>
    public class download : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string ls_pp = context.Request.Params["pp"];
            context.Response.ContentType = "application/octet-stream";
            MySqlConnection conn = new MySqlConnection(ConfigurationManager.ConnectionStrings["folharosto"].ConnectionString);
            MySqlCommand cmd = new MySqlCommand("SELECT anexo_nome, anexo_arquivo from orcamento WHERE pp = '" + ls_pp + "'", conn);
            cmd.CommandType = System.Data.CommandType.Text;
            conn.Open();
            MySqlDataReader dr = cmd.ExecuteReader();
            dr.Read();
            string nomeArquivo = dr["anexo_nome"].ToString();
            nomeArquivo = nomeArquivo.Substring(nomeArquivo.LastIndexOf("\\") + 1);
            context.Response.AddHeader("Content-Disposition", "attachment; filename=" + nomeArquivo);
            byte[] outbyte = new byte[100];
            long startIndex = 0;
            long retorno = dr.GetBytes(1, startIndex, outbyte, 0, outbyte.Length);
            while (retorno == outbyte.Length)
            {
                context.Response.OutputStream.Write(outbyte, 0, outbyte.Length);
                context.Response.OutputStream.Flush();
                startIndex += outbyte.Length;
                retorno = dr.GetBytes(1, startIndex, outbyte, 0, outbyte.Length);
            }
            if (retorno > 0)
            {
                context.Response.OutputStream.Write(outbyte, 0, (int)retorno);
                context.Response.OutputStream.Flush();
            }
            conn.Close();
            conn.Dispose();
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}