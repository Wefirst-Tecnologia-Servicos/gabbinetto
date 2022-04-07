using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace WebApplication1.Aspx
{
    public class BasePage : System.Web.UI.Page
    {
        protected virtual void Page_Load(object sender, EventArgs e)
        {
            if (HttpContext.Current.Session["LOGIN"] == null) throw new Exception("Sessão expirada. Favor se logar novamente no sistema.");
        }
    }
}