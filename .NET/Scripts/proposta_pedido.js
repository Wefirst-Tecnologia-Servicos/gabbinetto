var dtHoje = new Date();
var validarAnexo = true;
var mudouPP = false;
var tipoFolha;
var _carregouPP = false;
var _ipiAtual;
var _orcamentoCarregado;

// --------------------- Carga da Tela -------------------- //

$(document).ready(function () {

    tipoFolha = window.location.href.indexOf("_r.htm") > 0 ? "R"
            : window.location.href.indexOf("_v.htm") > 0 ? "V"
            : "P";

    // ------------- Estado Inicial da Tela -------------- //

    setTimeout(function () { $("#dt_sinal").val("") }, 1000);
    changeJanelaPagto(false);
    $('label:not([extende])').css('display', 'inline-table');
    $('li').css('white-space', 'normal');
    $('li.ui-li-divider').css('text-align', 'center');
    $('label[max]').each(function () {
        $(this)
            .css('width', '100%')
            .css('max-width', $(this).attr('max'));
    });
    tipoPessoa("f");
    tipoPessoa("c");
    tipoPessoa("e");
    tipoPessoaArquiteto();

    $('.cep').inputmask({
        mask: '99999-999',
        oncomplete: function () {
            buscarCep($(this).val().replace("-", ""), $(this).attr("tipo_endereco"));
        }
    });
    $('.celular').inputmask({ mask: '(99) 9999-99999' });
    $('.fixo').inputmask({ mask: '(99) 9999-9999' });
    $('.moeda:not(#vl_total_com_ipi_desc)')
        .maskMoney({ thousands: '.', decimal: ',', allowZero: true, prefix: 'R$ ' })
        .attr("onchange", "calcular();")
        .css("text-align", "right");
    $('#vl_total_com_ipi_desc')
        .maskMoney({ thousands: '.', decimal: ',', allowZero: true, prefix: 'R$ ' })
        .attr("onchange", "encontrarValor();")
        .css("text-align", "right");
    $(".percentual").each(function () { setDecimalInput(this); });
    $(".percentual")
        .attr("onchange", "calcular();")
        .css("text-align", "right");
    $('#criado_em').val(dtHoje.getDate() + "/" + (dtHoje.getMonth() + 1) + "/" + dtHoje.getFullYear());
    changeNumOcNF();
    changeTaxaUrgencia();

    // pedido veio de uma proposta
    if (GetQueryStringParam("fromProposta") == "S") {
        habilitarProdutosPP(true);
    }

    // folha de vendedor
    if ("VP".indexOf(tipoFolha) > -1) {
        enable(0);
        if (tipoFolha == "V") {
            $("#entrega_prazo").change();
        } else if (tipoFolha == "P") {
            $("#tipo").val(GetQueryStringParam("tipo").toUpperCase().trim());
        }
    }

    // ------------------ Chamadas Ajax ------------------ //

    getJsonP("f_get_ipi", "");
    getJsonP("f_get_cartoes", "");
    if ("VP".indexOf(tipoFolha) > -1) getJsonP("f_get_opcao_nf_servico", "");
    if (tipoFolha == "P") {
        calcular();
    } else {
        getJsonP("f_get_uf", "");
    }
    $('#pp').focus();
    var ppEdit = GetQueryStringParam("pp");
    if (ppEdit); else ppEdit = "";
    if (ppEdit.trim() != "") {
        setTimeout(function () {
            mudouPP = true;
            $("#pp").val(ppEdit).blur();
        }, 5000);
    }

    getJsonP("f_get_entrega_dias", "XX dias úteis");

    window.setTimeout(function () { window.scrollTo(0, 0) }, 2000);
});

// ---------------------- Automações ---------------------- //

function mudarPP() {
    mudouPP = true;
}

function somenteProducao() {
    // automação do código do PP
    var sufixoPP = {
        "N": "",
        "F": "FAT",
        "S": "PROD"
    };
    var sTipoPP = $("#so_producao").val();
    sufixoPP = sufixoPP[sTipoPP];
    if (sufixoPP); else sufixoPP = "";
    if (sufixoPP != "") {
        var codigoPP = $("#pp").val().trim().split("-");
        if (codigoPP[codigoPP.length - 1] != sufixoPP) {
            if (codigoPP[codigoPP.length - 1] == "PROD" || codigoPP[codigoPP.length - 1] == "FAT")
                codigoPP[codigoPP.length - 1] = sufixoPP;
            else
                codigoPP.push(sufixoPP);
        }
        $("#pp").val(codigoPP.join("-"));
    }
    // segue com as demais automações
    var bRet = sTipoPP == "S";
    var camposProdutos = ["assentos", "mobiliario", "divisorias", "arq_deslizante", "painel", "outros"];
    for (var i = 0; i < camposProdutos.length; i++) {
        if (bRet) $("#vl_" + camposProdutos[i]).val(0).maskMoney({ thousands: '.', decimal: ',', allowZero: true, prefix: 'R$ ' }).attr("disabled", "disabled");
        else $("#vl_" + camposProdutos[i]).removeAttr("disabled");
    }
    if (bRet) {
        $("#janela_pagto").val("");
        $("#janela_pagto").attr("disabled", "disabled");
        $("#janela_pagto").change();
        $("#nf_diferenciada").val("");
        $("#nf_diferenciada").attr("disabled", "disabled");
        $("#nf_diferenciada").change();
        $("#cod_fopag").val("-1");
        $("#cod_fopag").attr("disabled", "disabled");
        $("#cod_fopag-button span").text("--- Selecione ---");

    } else {
        $("#janela_pagto, #cod_fopag, #nf_diferenciada").removeAttr("disabled");
    }
}

function enable(idFopag) {
    // dados exclusivos de determinada forma de pagamento
    $("#liFopag label[exclusivo]").each(function () {
        if ($(this).attr("exclusivo").indexOf("," + idFopag + ",") > -1) $(this).show();
        else $(this).hide();
    });
    // dados de cartão de crédito
    if (idFopag == 11) $("#dadosCartao").show();
    else $("#dadosCartao").hide();
    // _AVista setado durante o cálculo das parcelas em calculo.js
    if (_AVista) $("#desconto_a_vista").removeAttr("disabled");
    else $("#desconto_a_vista").val(0).attr("disabled", "disabled");
}

function changeJanelaPagto(bClear) {
    if ($("#janela_pagto").val() == "S") {
        $("#lblObsJanelaPagto").text("A informação passará por análise e aprovação do faturamento.");
        if (bClear) $("#janela_pagto_descricao").val("");
        $("#lblJanelaPagtoDescricao, #lblObsJanelaPagto").show();
    } else if ($("#janela_pagto").val() == "N") {
        $("#lblObsJanelaPagto").text("Informação sobre sua responsabilidade.").show();
        $("#lblJanelaPagtoDescricao").hide();
        if (bClear) $("#janela_pagto_descricao").val("");
    } else {
        if (bClear) $("#janela_pagto_descricao").val("");
        $("#lblJanelaPagtoDescricao, #lblObsJanelaPagto").hide();
    }
}

// nos tipos R e P, o desconto é desabilitado e carregado de
// acordo com parametrizações da forma de pagamento
function getDesconto() {
    if (_carregouPP) _carregouPP = false;
    else {
        try {
            if (window.location.href.indexOf("fast.htm") > -1) {
                $("#desconto").val($("#cod_fopag option:selected").attr("desconto").replace(".", ","));
            } else {
                $("#desconto").val($("#cod_fopag option:selected").attr(
                    ($("#f_ie").val().trim() == "" && $("#f_uf").val().toUpperCase().trim() != "SP") ?
                        $("#f_uf option:selected").attr("taxa_fecop") :
                        "desconto").replace(".", ","));
            }
        } catch (err) {

        }
    }
}

function mudouFreteMontagem() {
    if ($("#lblFopagFM").length > 0) {
        if (parseInt($("#vl_total_nf_fm").maskMoney('unmasked')[0]) == 0) {
            $("#lblFopagFM, #table_parc_fm").hide();
        } else {
            $("#lblFopagFM, #table_parc_fm").show();
        }
    }
}

function changeNumOcNF() {
    if ($("#oc_nf").val() == "S") $("#lblGrupoOcNF").show();
    else $("#lblGrupoOcNF").hide();
}

function changeTaxaUrgencia() {
    if ($("#taxa_urgencia").val() == "S") $("#lblValorTaxaUrgencia").show();
    else $("#lblValorTaxaUrgencia").hide();
}

function changePrazoEntrega() {
    if ($("#entrega_prazo").val() == "A") {
        $("label[dataconsult]").show();
        $("#lblTaxaUrgencia").show();
        changeTaxaUrgencia();
    } else {
        $("label[dataconsult]").hide();
        $("#lblTaxaUrgencia").hide();
        $("#lblValorTaxaUrgencia").hide();
    }
}

// ---------------------- Validações ---------------------- //

function validaDescontoAVista(strDesc) {
    return parseFloat(strDesc.replace(",", ".")) <= ($("#cod_fopag").val() == "4" ? 1 : 2);
}

function validarDescServico() {
    return parseFloat($("#desconto_servico").val().replace(",", ".")) <= 5;
}

function validarDescArquiteto() {
    /*
    var camposSoma = ["#desconto_arquiteto", "#pc_reserva_arquiteto"];
    var vlSoma = 0;
    for (var i = 0; i < camposSoma.length; i++)
        vlSoma += parseFloat($(camposSoma[i]).val().replace(",", "."));
    return vlSoma <= 10;
    */
    return true;
}

function validarDescComercial() {
    /*
    var camposSoma = ["#desconto"];
    var vlSoma = 0;
    for (var i = 0; i < camposSoma.length; i++)
        vlSoma += parseFloat($(camposSoma[i]).val().replace(",", "."));
    return vlSoma <= 10;
    */
    return true;
}

function validaEntregaData(elem) {
    if ($('#entrega_prazo').val() == 'U') return true;
    else {
        // valida o conteúdo do campo
        var dtElem = $(elem).val().trim().split("/");
        if (dtElem.length != 3) return false;
        for (var i = 0; i < 3; i++) {
            dtElem[i] = dtElem[i].trim();
            if (dtElem[i] == "" || isNaN(dtElem[i])) return false;
            dtElem[i] = parseInt(dtElem[i]);
        }
        // valida se não está na data atual
        var dtNow = new Date();
        if (dtElem[0] == dtNow.getDate() &&
            dtElem[1] == (dtNow.getMonth() + 1) &&
            dtElem[2] == dtNow.getFullYear()) return false;
        else return true;
    }
}

// --------------------- Chamadas Ajax -------------------- //

function buscarOrcamento(pp) {
    if (mudouPP) {
        mudouPP = false;
        validarAnexo = true;
        getJsonP("f_get_orcamento",
            "p_pp=" + encodeURIComponent(pp) +
            "&p_criado_por=" + encodeURIComponent(/*$('#criado_por').val()*/ _usuarioLogado.Nome) +
            "&p_tipo=X");
    }
}

function buscarProposta(pp) {
    if (mudouPP) {
        mudouPP = false;
        getJsonP("f_get_orcamento",
            "p_pp=" + encodeURIComponent(pp) +
            "&p_criado_por=" + encodeURIComponent(/*$('#criado_por').val()*/ _usuarioLogado.Nome) +
            "&p_tipo=P");
    }
}

function gerarVisita(sohAlt) {
    sohAltera = sohAlt;
    var erroValidacao = validar();
    if (erroValidacao == '') {
        var lstParams = [];
        $('[parametro]:not(.moeda, .cnpj, .percentual)').each(function () {
            lstParams.push("p_" + $(this).attr("id") + "=" + encodeURIComponent($(this).val()));
        });
        $('input[parametro].cnpj').each(function () {
            lstParams.push("p_" + $(this).attr("id") + "=" + encodeURIComponent(globalReplace($(this).val(), ".", "").replace("-", "").replace("/", "")));
        });
        $('input[parametro].moeda').each(function () {
            lstParams.push("p_" + $(this).attr("id") + "=" + encodeURIComponent($(this).maskMoney('unmasked')[0]));
        });
        $('input[parametro].percentual').each(function () {
            lstParams.push("p_" + $(this).attr("id") + "=" + encodeURIComponent($(this).val().replace(",", ".")));
        });
        getJsonP("f_pedido_header", lstParams.join("&"));
    }
    else erro('Erro de Preenchimento', erroValidacao);
}

// ---------------------- Callbacks ----------------------- //

function f_get_orcamento(dados) {

    var bOkUF = true;
    $(["#a_uf", "#e_uf", "#c_uf", "#f_uf"]).each(function (elementSelector) {
        if ($(elementSelector).is(":visible") && $(elementSelector + " option").length < 1) bOkUF = false;
    });
    
    if (!bOkUF) { // aguarda carregar os DDL de UF
        setTimeout(function () {
            f_get_orcamento(dados);
        }, 500);
    }
    else {
        _orcamentoCarregado = dados;
        endAjax();
        validarAnexo = dados.criado_por && dados.criado_por.trim() == "";
        if (dados.permitir == 'N') {
            $("#pp").val("").focus();
            erro("Código inválido", "Este código de PP não pode ser utilizado.");
        }
        else if (dados.f_cnpj && dados.f_cnpj.trim() != "") {
            $('[parametro]').each(function () {
                var vlJson = dados[$(this).attr('id')];
                if (vlJson) {
                    if ($(this).attr('class') == 'moeda' || $(this).attr('class') == 'percentual') {
                        $(this).maskMoney('mask', parseFloat(vlJson));
                    }
                    else if ($(this).attr('id') == 'desconto') $(this).val(vlJson.replace('.', ','));
                    else $(this).val(vlJson);
                    if ($(this)[0].tagName.toUpperCase() == 'SELECT') $(this).change();
                }
            });
            $("#desconto, #desconto_r, #desconto_v").val(dados.desconto);
            if (dados.use_acustica) $("spnArqDesl").text("Arq. Desl.");
            $("input.percentual").each(function () {
                $(this).val($(this).val().replace(".", ","));
            });
            carregarProdutosPP(dados);
            habilitarProdutosPP(dados.produtos.length > 0);
            calcular();
            $("#entrega_prazo").change();
            $("input[id *= 'ipi_']").each(function () {
                $("#spn_" + $(this).attr('id')).empty().append(globalReplace($(this).val(), ".", ","));
            });
            _msgPessoa = false;
            _carregouPP = true;

            setTimeout(() => { f_verificar_diferencas(dados); }, 1000);

            if (tipoFolha == "V") {
                tipoPessoaArquiteto();
                getJsonP("f_get_arquiteto", "p_cnpj_arquiteto=" + encodeURIComponent(dados.cnpj_arquiteto));
            }
        }
        getJsonP("f_get_entrega_dias", encodeURIComponent($("#pp").val()));
        endAjax();
    }
}

function f_get_pp(dados) {
    endAjax();
    $('#pp').val(dados.pp);
}

function f_get_ipi(dados) {
    _ipiAtual = dados;
    endAjax();
    $("#obs_prazo").append(tipoFolha == "V" ? dados.obs_prazo_v : dados.obs_prazo_r);
    mergeXml($("input[id *= 'ipi_']"), dados);
    $("input[id *= 'ipi_']").each(function () {
        $("#spn_" + $(this).attr('id')).empty().append(globalReplace($(this).val(), ".", ","));
    });
}

function f_get_forma_pagamento(dados) {
    endAjax();
    jPut.fopag.data = dados;
    endAjax();
    setTimeout(function () { $("#cod_fopag").change(); enable($("#cod_fopag").val()); }, 500);
}

function f_get_forma_pagamento_nf_fm(dados) {
    endAjax();
    jPut.fopag_nf_fm.data = dados;
    setTimeout(endAjax, 1000);
    setTimeout(function () { $("#cod_fopag_nf_fm").change(); enable($("#cod_fopag_nf_fm").val()); }, 500);
}

function f_get_cartoes(dados) {
    endAjax();
    jPut.cartoes.data = dados;
    setTimeout(function () { $("#cartao_bandeira").val("-1").change(); }, 500);
}

function f_get_opcao_nf_servico(dados) {
    endAjax();
    jPut.nf_servico.data = dados;
    $("#nf_servico").change();
}

function f_verificar_diferencas(orcamento) {

    var diferente = false;

    // ------------------ verifica IPI ------------------- //

    for (var k in _ipiAtual) {
        if (k.substr(0, 3) == "ipi" && _ipiAtual[k] != orcamento[k]) {
            console.log("----------- Diferença de IPI -----------");
            console.log(`${k} -> ATUAL: ${_ipiAtual[k]}   PP: ${orcamento[k]}`);
            console.log("----------------------------------------");
            diferente = true;
            break;
        }
    }

    // ----- verifica valores unitários dos produtos ----- //

    if (!diferente) {
        for (var i = 0; i < orcamento.produtos; i++) {
            if (parseFloat(orcamento.produtos[i].valor_cadastro) > 0 && orcamento.produtos[i].valor_cadastro.replace(".", ",") != orcamento.produtos[i].valor) {
                console.log("--------- Diferença de Produto ---------");
                console.log(`${orcamento.produtos[i].cd_produto} -> ATUAL: ${orcamento.produtos[i].valor_cadastro}   PP: ${orcamento.produtos[i].valor}`);
                console.log("----------------------------------------");
                diferente = true;
                break;
            }
        }
    }

    // ------------------- Abre a Modal ------------------ //

    if (diferente) {
        _orcamentoCarregado = orcamento;
        f_modal_diferencas();
    } else {
        console.log("Não possui diferenças de valores de IPI e de produtos");
    }

}

function f_modal_diferencas() {

    window.scroll(0, 0);
    
    $("body").prepend("<input type='hidden' id='hdnDiferencaValores' validationRule='false' validationMessage='Existem diferença entre os valores antigos e atuais dos produtos e/ou do IPI.' />");

    $("body")
        .css("overflow", "hidden")
        .prepend("<div id='divModalBG'></div>" +
            "<center id='centerModal'>" +
                "<div class='dialogModal ui-corner-all'>" +
                    "<div class='ui-bar-a ui-first-child ui-corner-all'>Alerta</div>" +
                    "<p>Existem diferenças entre os valores atuais de IPI e/ou dos produtos e os valores antigos definidos neste pedido/proposta.</p>" +
                    "<p>Por este motivo, é necessário atualizar estes valores para que o mesmo possa ser enviado.</p>" +
                    "<p>Deseja atualizar?.</p>" +
                    "<div style='text-align:right; padding:10px 10px 0 0;'>" +
                        "<button class='ui-button ui-corner-all' style='padding:5px 10px; border:solid 1px #bbb;' onclick='f_manter_diferencas()'>Cancelar</button>" +
                        "<button class='ui-button ui-corner-all' style='padding:5px 10px; border:solid 1px #bbb;' onclick='f_corrigir_diferencas()'>Corrigir</button>" +
                    "</div>" +
                "</div>" +
            "</center>");

    $("#divModalBG").css({
        position: "absolute",
        width: "100%",
        height: "100%",
        "background-color": "#000",
        "z-index": 1000,
        opacity: 0.5,
        "text-align": "center"
    });

    $("#centerModal").css({
        "z-index": 1000,
        position: "absolute",
        width: "100%"
    });

    $("#centerModal p").css({
        "text-align": "left",
        "margin": "0",
        "padding": "10px 10px 0 10px"
    });

    $("#centerModal div.dialogModal")
        .css({
            background: "#fff",
            width: "600px",
            "margin-top": "50px",
            "padding-bottom": "10px",
            display: "inline-table"
        });

    $("#centerModal div.dialogModal div.ui-first-child")
        .css({
            "text-align": "left",
            padding: "5px 10px"
        });

    $("#centerModal ul")
        .css({
            "list-style-type": "none",
            "margin": "10px 10px 0 10px",
            "padding": 0
        });
    
    $("#centerModal h5").css({
        "text-align": "left",
        "font-size": "12pt",
        "font-weight": "bold",
        "margin": 0,
        "padding": "0 0 10px 0"
    });
}

function f_manter_diferencas() {
    $("#divModalBG, #centerModal").remove();
    $("body").css("overflow", "auto");
}

function f_corrigir_diferencas() {
    
    // ------------------ verifica IPI ------------------- //

    for (var k in _ipiAtual) {
        if (k.substr(0, 3) == "ipi") {
            _orcamentoCarregado[k] = _ipiAtual[k];
            $(`#${k}`).val(_orcamentoCarregado[k]);
            $(`#spn_${k}`).empty().append(globalReplace(_orcamentoCarregado[k], ".", ","));
        }
    }

    // ----- verifica valores unitários dos produtos ----- //

    for (var i = 0; i < _orcamentoCarregado.produtos; i++) {

        if (parseFloat(_orcamentoCarregado.produtos[i].valor_cadastro) > 0) {
            _orcamentoCarregado.produtos[i].valor = _orcamentoCarregado.produtos[i].valor_cadastro;
            $($("#bdProdutos tr").filter(function () {
                return $(this).find("td:first").text().trim() == _orcamentoCarregado.produtos[i].cd_produto;
            })[0]).find("[vl_unit]").attr("vl_unit", _orcamentoCarregado.produtos[i].valor_cadastro.replace(",", ","))
        }
    }

    calcular();
    $("#divModalBG, #centerModal, #hdnDiferencaValores").remove();
    $("body").css("overflow", "auto");
}

