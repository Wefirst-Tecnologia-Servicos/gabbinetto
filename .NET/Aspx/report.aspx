<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="report.aspx.cs" Inherits="WebApplication1.Aspx.report" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Relatório: Folha de Rosto</title>
    <style type="text/css">
        * { -webkit-print-color-adjust:exact; }
    </style>
    <script src="../Scripts/jquery-1.11.3.min.js" type="text/javascript"></script>
    <script type="text/javascript" language="javascript">
        $(document).ready(function () {
            $("input, textarea").attr("readonly", "readonly").css("font-size", "8pt");
            window.print();
        });
    </script>
</head>
<body></body>
</html>
