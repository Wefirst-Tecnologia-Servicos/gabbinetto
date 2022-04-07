using MySql.Data.MySqlClient;
using SelectPdf;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Security;
using System.Security.Permissions;
using System.Text;
using System.Web;

namespace WebApplication1.Aspx
{
    public partial class report : BasePage
    {
        protected override void Page_Load(object sender, EventArgs e)
        {
            base.Page_Load(sender, e);
            StringBuilder sbRetorno = null;
            List<MySqlParameter> outParameters = null;
            new WebApplication1.HttpHandlers.BaseHandler().ExecuteProcedure(HttpContext.Current, ref outParameters, ref sbRetorno);
            if (sbRetorno == null) sbRetorno = new StringBuilder("<p>Ocorreu um erro ao gerar o arquivo.</p>");
            if (Request.Params["pdf"] == null) Response.Write(sbRetorno.ToString());
            else
            {
                PdfDocument doc = new HtmlToPdf().ConvertHtmlString(sbRetorno.ToString());
                doc.Save(Response, true, "orcamento.pdf");
            }
        }
    }
}