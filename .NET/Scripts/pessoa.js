// --------------- Prototypes ------------------ //

String.prototype.aplicarMascara = function (mascara) {
    // Esta função esta preparada para receber um texto e
    // aplicar nele uma máscara. 
    // Exemplos: 00000-000
    //           000.000.000-00
    var indiceMeu = this.length - 1;
    var indiceMascara = mascara.length - 1;
    while (indiceMeu > -1 && indiceMascara > -1) {
        if (mascara[indiceMascara] == "0") {
            mascara = mascara.substr(0, indiceMascara) + this[indiceMeu] + mascara.substr(indiceMascara + 1);
            indiceMeu--;
        }
        indiceMascara--;
    }
    return mascara;
}

// --------------- Variáveis ------------------ //

var _pessoas = [];
var _copia = 'x';
var _msgPessoa;

// ------------------ Ações ------------------- //

function buscarPessoa() {
    console.log(_pessoas.length);
    if (_pessoas.length > 0) apresentarModalPessoas();
    else getJsonP("f_get_pessoas", "p_user=" + encodeURIComponent(_usuarioLogado.Nome));
}

function apresentarModalPessoas() {
    obterPaginaParcial("../modal_buscar_cliente.htm", function (htmlModal) {
        $("body").css("overflow", "hidden").prepend(htmlModal);
        window.scrollTo(0, 0);
        jPut.pessoas.data = _pessoas;
    });
}

function fecharModalPessoas() {
    $("#modalBuscaCliente").remove();
    $("body").css("overflow", "auto");
}

function filtrarListaPessoas(filtro) {
    var listaFiltrada = filtro == "" ? _pessoas : $(_pessoas).filter(function () {
        return this.f_cnpj.indexOf(filtro) > -1 || this.nome.toUpperCase().indexOf(filtro.toUpperCase()) > -1;
    }).toArray();

    jPut.pessoas.data = listaFiltrada;
}

function selecionarPessoa(indicePessoa) {
    fecharModalPessoas();

    setTimeout(function () {
        f_get_pessoa_OnBind(_pessoas[indicePessoa]);
        f_get_pessoa_OnAfterBind(true);
    }, 50);

}


// --------------- Automaçções ---------------- //

function tipoPessoa(tipoEndereco) {
    $("#" + tipoEndereco + "_cnpj, #" + tipoEndereco + "_ie").val("");
    if (tipoEndereco == "f") $("#nome").val("");
    $("#" + tipoEndereco + "_cnpj").focus();
    if ($("#" + tipoEndereco + "_tipo_pessoa").val() == "J") {
        $("#lbl_" + tipoEndereco + "_ie").show();
        $("#" + tipoEndereco + "_cnpj").inputmask({
            mask: '99.999.999/9999-99',
            oncomplete: function () {
                $('#erro').hide();
                if (tipoEndereco == "f") $("#ulCliente input:not([id='f_cnpj'])").val("");
                var s_cpf = globalReplace($(this).val(), ".", "").replace("/", "").replace("-", "");
                if (validarCNPJ(s_cpf)) {
                    _msgPessoa = true;
                    if (tipoEndereco == "f") {
                        var s_e_cnpj = globalReplace($("#e_cnpj").val(), ".", "").replace("/", "").replace("-", "");
                        var s_c_cnpj = globalReplace($("#c_cnpj").val(), ".", "").replace("/", "").replace("-", "");
                        getJsonP("f_get_pessoa", "p_cnpj_f=" + encodeURIComponent(s_cpf)
                            + "&p_cnpj_e=" + encodeURIComponent(s_e_cnpj)
                            + "&p_cnpj_c=" + encodeURIComponent(s_c_cnpj));
                    }/*
                    else {
                        getJsonP("f_get_endereco", "p_cnpj=" + encodeURIComponent(s_cpf)
                                                + "&p_tipo=" + encodeURIComponent(tipoEndereco));
                    }*/
                }
                else {
                    erro('Erro de Preenchimento', 'O CNPJ informado não está preenchido corretamente.');
                    $(this).val('').focus();
                }
            }
        });
    }
    else {
        $("#lbl_" + tipoEndereco + "_ie").hide();
        $("#" + tipoEndereco + "_cnpj").inputmask({
            mask: '999.999.999-99',
            oncomplete: function () {

                $('#erro').hide();
                if (tipoEndereco == "f") $("#ulCliente input:not([id='f_cnpj'])").val("");
                var s_cpf = globalReplace($(this).val(), ".", "").replace("/", "").replace("-", "");
                if (validarCPF(s_cpf)) {
                    _msgPessoa = true;
                    if (tipoEndereco == "f") {
                        var s_e_cnpj = globalReplace($("#e_cnpj").val(), ".", "").replace("/", "").replace("-", "");
                        var s_c_cnpj = globalReplace($("#c_cnpj").val(), ".", "").replace("/", "").replace("-", "");
                        getJsonP("f_get_pessoa", "p_cnpj_f=" + encodeURIComponent(s_cpf)
                            + "&p_cnpj_e=" + encodeURIComponent(s_e_cnpj)
                            + "&p_cnpj_c=" + encodeURIComponent(s_c_cnpj));
                    }/*
                    else {
                        getJsonP("f_get_endereco", "p_cnpj=" + encodeURIComponent(s_cpf)
                                                + "&p_tipo=" + encodeURIComponent(tipoEndereco));
                    }*/
                }
                else {
                    erro('Erro de Preenchimento', 'O CNPJ informado não está preenchido corretamente.');
                    $(this).val('').focus();
                }
            }
        });
    }
}

function tipoPessoaArquiteto() {
    $("#cnpj_arquiteto").val("");
    if ($("#a_tipo_pessoa").val() == "J") {
        $("#lbl_a_ie").show();
        $("#cnpj_arquiteto").inputmask({
            mask: '99.999.999/9999-99',
            oncomplete: function () {
                $('#erro').hide();
                var s_cpf = globalReplace($(this).val(), ".", "").replace("/", "").replace("-", "");
                if (validarCNPJ(s_cpf)) {
                    getJsonP("f_get_arquiteto", "p_cnpj_arquiteto=" + encodeURIComponent(s_cpf));
                }
                else {
                    erro('Erro de Preenchimento', 'O CNPJ informado não está preenchido corretamente.');
                    $(this).val('').focus();
                }
            }
        });
    }
    else {
        $("#a_ie").val("");
        $("#lbl_a_ie").hide();
        $("#cnpj_arquiteto").inputmask({
            mask: '999.999.999-99',
            oncomplete: function () {
                $('#erro').hide();
                var s_cpf = globalReplace($(this).val(), ".", "").replace("-", "");
                if (validarCPF(s_cpf)) {

                    getJsonP("f_get_arquiteto", "p_cnpj_arquiteto=" + encodeURIComponent(s_cpf));
                }
                else {
                    erro('Erro de Preenchimento', 'O CPF informado não está preenchido corretamente.');
                    $(this).val('').focus();
                }
            }
        });
    }
}

function copiar(tipoCopia) {
    _copia = tipoCopia;
}

function colar(tipoCola) {
    if (_copia != 'x') {
        var camposCola = ["_tipo_pessoa", "_cnpj", "_cep", "_logradouro", "_numero", "_complemento", "_bairro", "_cidade", "_ie", "_uf"];
        for (var iCola = 0; iCola < camposCola.length; iCola++) {
            $('#' + tipoCola + camposCola[iCola]).val($('#' + _copia + camposCola[iCola]).val());
            if (camposCola[iCola] == "_uf" || camposCola[iCola] == "_tipo_pessoa") $('#' + tipoCola + camposCola[iCola]).change();
        }
    }
}


// ----------------- Validações ----------------- //

function validarCampoArq(objCampo) {
    var valCampoTrim = $(objCampo).val().trim();
    var possuiDigito = valCampoTrim.indexOf("1") > -1 || valCampoTrim.indexOf("2") > -1 || valCampoTrim.indexOf("3") > -1 ||
        valCampoTrim.indexOf("4") > -1 || valCampoTrim.indexOf("5") > -1 || valCampoTrim.indexOf("6") > -1 ||
        valCampoTrim.indexOf("7") > -1 || valCampoTrim.indexOf("8") > -1 || valCampoTrim.indexOf("9") > -1;
    var bOkCnpj = $(objCampo).attr("id") == "cnpj_arquiteto" ? possuiDigito : true;
    var reservaArq = parseFloat($("#pc_reserva_arquiteto").val().replace(",", "."));
    return reservaArq > 0 ? (valCampoTrim != "" && bOkCnpj) : true;
}

// ----------------- Callbacks ---------------- //


function f_get_pessoas(dados) {
    endAjax();

    var mascaraCnpj = {
        F: "000.000.000-00",
        J: "00.000.000/0000-00"
    }
    // tratamento do retorno
    _pessoas = dados;
    _pessoas = _pessoas.slice(1); // o primeiro da lista é um objeto vazio
    for (var i = 0; i < _pessoas.length; i++) {
        _pessoas[i].id = i; // este ID artificial serve para auxiliar o método que seleciona uma pessoa
        _pessoas[i].f_cnpj = _pessoas[i].f_cnpj.aplicarMascara(mascaraCnpj[_pessoas[i].f_tipo_pessoa]);
    }
    apresentarModalPessoas();
}

function f_get_endereco(dados) {
    endAjax();
    mergeXml($("#ulCliente input, #ulCliente select"), dados);
    if (dados.e_cnpj) {
        $("e_cnpj").val(dados.e_cnpj).change();
        if ($('#e_ie').is(':visible')) $('#e_ie').focus();
        else $('#e_cep').focus();
    }
    else if (dados.c_cnpj) {
        $("c_cnpj").val(dados.c_cnpj).change();
        if ($('#c_ie').is(':visible')) $('#c_ie').focus();
        else $('#c_cep').focus();
    }
}

function f_get_pessoa(dados) {
    endAjax();
    f_get_pessoa_OnBind(dados)
    var bFound = _msgPessoa && $("#nome").val() != "";
    f_get_pessoa_OnAfterBind(bFound);
    if (bFound) mensagem("Cliente Existente", "Cliente já cadastrado, favor conferir os dados.");
}

function f_get_pessoa_OnBind(jsonDados) {
    mergeXml($("#ulCliente input, #ulCliente select"), jsonDados);
    $("f_cnpj").val(jsonDados.f_cnpj).change();
    $("d_cnpj").val(jsonDados.e_cnpj).change();
    $("c_cnpj").val(jsonDados.c_cnpj).change();
    if ($('#f_ie').is(':visible')) $('#f_ie').focus();
    else $('#nome').focus();
}

function f_get_pessoa_OnAfterBind(found) {
    var numeros = ["#e", "#c", "#f"];
    if (found) {
        for (var iNum = 0; iNum < numeros.length; iNum++) {
            var valNumero = $(numeros[iNum] + "_numero").val();
            var checkNumero = $(numeros[iNum] + "_numero_sn").is(":checked");
            if ((valNumero == "" && !checkNumero) || (valNumero != "" && checkNumero)) $(numeros[iNum] + "_numero_sn").click();
        }
    } else {
        for (var iNum = 0; iNum < numeros.length; iNum++)
            if ($(numeros[iNum] + "_numero_sn").is(":checked")) $(numeros[iNum] + "_numero_sn").click();
    }
}

function f_get_uf(dados) {
    endAjax();
    jPut.fUf.data = dados;
    jPut.eUf.data = dados;
    jPut.cUf.data = dados;
    jPut.aUf.data = dados;
    setTimeout(function () { $('#f_uf, #e_uf, #c_uf', "#a_uf").val("SP").change(); }, 500);
}

function f_get_arquiteto(dados) {
    endAjax();
    console.log(dados);
    mergeXml($("#liArquiteto input, #liArquiteto select"), dados);
    $('#a_ie').focus();
    var valNumero = $("#a_numero").val();
    var checkNumero = $("#a_numero_sn").is(":checked");

    if (_msgPessoa && $('#a_nome').val() != '') {
        var valNumero = $("#a_numero").val();
        var checkNumero = $("#a_numero_sn").is(":checked");
        if ((valNumero == "" && !checkNumero) || (valNumero != "" && checkNumero)) $("#a_numero_sn").click();
    }
    else {
        if ($("#a_numero_sn").is(":checked")) $("#a_numero_sn").click();
    }
}