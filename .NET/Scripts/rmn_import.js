/*
 * Importação de arquivos RMN
 */

var rmnImportConfig = {
    dialogId: "ImportRMN",
    fileIsLoaded: false,
    importingProductIndex: 0
};

function RMNImportOpenDialog() {
    rmnImportConfig.fileIsLoaded = false;
    obterPaginaParcial("../modal_rmn_import.htm", function (htmlModal) {
        $("body").css("overflow", "hidden").prepend(htmlModal);
        window.scrollTo(0, 0);
    });
}

function RMNImportCloseDialog() {
    rmnImportConfig.fileIsLoaded = false;
    $("#div" + rmnImportConfig.dialogId + ", #center" + rmnImportConfig.dialogId).remove();
    $("body").css("overflow", "auto");
}

function ReadRMNFile(input) {
    var file = input.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            console.log(evt)
            rmnImportConfig.fileIsLoaded = true;
            rmnImportConfig.fileContents = evt.target.result;
            $("#center" + rmnImportConfig.dialogId + " p").empty().append(globalReplace(globalReplace(rmnImportConfig.fileContents, "\n", "<br />"), " ", "&nbsp;"));
        }
        reader.onerror = function (evt) {
            console.log(evt)
            rmnImportConfig.fileIsLoaded = false;
            $("#center" + rmnImportConfig.dialogId + " p").text("Erro ao ler o arquivo");
        }
    }
}

function RMNImportProcess() {

    /*
     * Inicializa os parâmetros
     */
    rmnImportConfig.importingProductIndex = 0;
    delete rmnImportConfig.pp;
    delete rmnImportConfig.rowsToImport;
    delete rmnImportConfig.errors;

    if (rmnImportConfig.fileIsLoaded) {
        /*
         * Parse do código do PP:
         * No nome do arquivo, retira as primeiras duas letras (PP) e o sufixo (_RMN.TXT)
         */
        rmnImportConfig.pp = $("#center" + rmnImportConfig.dialogId + " input[type=file]").val().split("\\");
        rmnImportConfig.pp = rmnImportConfig.pp[rmnImportConfig.pp.length - 1].substr(2).toUpperCase().replace("_RMN.TXT", "");

        /*
         * Separa as linhas a serem importadas (não irá importar as datas):
         * Lê todas as linhas do arquivo, mas separa apenas as que possuirem 
         * mais de 100 caracteres e não começarem com '#'
         */
        var rmnRows = rmnImportConfig.fileContents.split("\n");
        rmnImportConfig.rowsToImport = [];
        for (var i = 0; i < rmnRows.length; i++)
            if (rmnRows[i].substr(0, 1) != "#" && rmnRows[i].length > 100)
                rmnImportConfig.rowsToImport.push(rmnRows[i]);

        // Inicia a importação
        if (rmnImportConfig.rowsToImport.length > 0) {
            rmnImportConfig.errors = [];
            RMNImportNextProduct();
        } else alert("Este arquivo não possui produtos para serem importados.");

    } else alert("O arquivo ainda não foi carregado.")
}

/*
 * Função que controla o LOOP do envio de cada produto do arquivo RMN
 */
function RMNImportNextProduct() {
    if (rmnImportConfig.importingProductIndex < rmnImportConfig.rowsToImport.length) {
        // faz o parse da linha a ser importada
        var rmnImportingRow = rmnImportConfig.rowsToImport[rmnImportConfig.importingProductIndex];
        rmnImportConfig.importingProductIndex++;

        var rmnCodigo = { length: 20 };
        var rmnDescricao = { length: 70 };
        var rmnQtde = { length: 4 };
        var rmnRevest = { length: 3 };
        var rmnValor = { length: 15 };

        rmnCodigo.value = rmnImportingRow.substr(0, rmnCodigo.length).trim();
        rmnImportingRow = rmnImportingRow.substr(rmnCodigo.length);
        rmnDescricao.value = rmnImportingRow.substr(0, rmnDescricao.length).trim();
        rmnImportingRow = rmnImportingRow.substr(rmnDescricao.length);
        rmnQtde.value = rmnImportingRow.substr(0, rmnQtde.length).trim();
        rmnImportingRow = rmnImportingRow.substr(rmnQtde.length);
        rmnRevest.value = rmnImportingRow.substr(0, rmnRevest.length).trim();
        rmnImportingRow = rmnImportingRow.substr(rmnRevest.length);
        rmnValor.value = rmnImportingRow.substr(0, rmnCodigo.length).trim().replace(",", ".");
        rmnImportingRow = rmnImportingRow.substr(rmnValor.length);

        // envia o ajax
        startAjax();

        var rmnRequest = "HttpHandlers/json.ashx?action=f_get_produto" +
            "&p_codigo=" + encodeURIComponent(rmnCodigo.value) +
            "&p_descricao=" + encodeURIComponent(rmnDescricao.value) +
            "&p_valor=" + rmnValor.value +
            "&p_quantidade=" + rmnQtde.value + 
            "&p_revestimento=" + rmnRevest.value;
        console.log(rmnRequest);
        $.ajax({
            type: "POST",
            url: rmnRequest,
//            dataType: "json",
            crossDomain: true,
            processData: false,
            contentType: false
        }).done(function (data) {
            f_get_produto(data);
        }) 
        .fail(function (jsonData) {
            console.log('erro: ' + jsonData.responseText);
        })
        .always(function (data) {
            endAjax();
        });
                                         
    } else {
        if (rmnImportConfig.errors.length > 0) alert("A importação foi processada com os seguintes avisos:\n" + rmnImportConfig.errors.join("\n"));
        else alert("Importação processada com suceso.");
        if ($("#bdProdutos tr").length > 0) habilitarProdutosPP(true);
        RMNImportCloseDialog();
        setTimeout(function () {
            $("#bdProdutos select[db_value]").each(function () {
                var $op = $(this).find("option[value='" + $(this).attr("db_value") + "']");
                if ($op.length > 0) $(this).val($op.val());
            });
        }, 1000);

    }
}

// ========================  CALLBACKS =========================== //

function f_get_produto(resultado) {
    if (resultado.found) escolheuProduto(null, resultado); // verificar Site.js
    if (resultado.message && resultado.message != "") rmnImportConfig.errors.push(resultado.message);
    RMNImportNextProduct();
}