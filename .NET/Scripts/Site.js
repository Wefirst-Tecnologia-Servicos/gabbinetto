String.prototype.removeSpecialCharacters = function () {
	var strSource = "ÁÀÂÃÄÉÈÊËÌÍÎÏÓÒÔÕÖÚÙÛÜÇ";
	var strTarget = "AAAAAEEEEIIIIOOOOOUUUUC";
	var comparing = this.toString();
	var result = "";
	for (var i = 0; i < comparing.length; i++) {
		var readenChar = comparing.substr(i, 1);
		var found = strSource.indexOf(readenChar);
		result += found > -1 ? strTarget.substr(found, 1) : readenChar;
	}
	return result;
};

var _iAjax = 0;
var _usuarioLogado = null;
var _adm = 0;


function setDecimalInput(elInput) {
	$(elInput).keyup(function(e) {
		var strVal = $(elInput).val();
		for (var i = strVal.length - 1; i >= 0; i--) {
			if (strVal.substr(i, 1) != "," && isNaN(strVal.substr(i, 1)))
				strVal = strVal.substr(0, i) + strVal.substr(i + 1);
		}
		while (strVal.split(",").length > 2) strVal = strVal.replace(",", "");
		$(elInput).val(strVal);
	});
}

$(document).ready(function () {
    // inputs maiúsculos
    $("input[type='text']:not(.moeda, [data-type='search']), ttttextarea").keyup(function () {
		try {
			var strSource = "ÁÀÂÃÄÉÈÊËÌÍÎÏÓÒÔÕÖÚÙÛÜÇ";
			var strTarget = "AAAAAEEEEIIIIOOOOOUUUUC";
			var alfaDecim = "1234567890QWERTYUIOPASDFGHJKLZXCVBNM.-, ªº%;";
			// letras maiúsculas
			if ($(this).attr("id").indexOf("mail") > -1) alfaDecim += "@";

			if ($(this).attr("id").indexOf("complemento") > -1){
				alfaDecim = alfaDecim.replace("-, ªº%;", "");
            }


			var oldText = $(this).val().toUpperCase();
			var newText = [];
			for (var iCharacter = 0; iCharacter < oldText.length; iCharacter++) {
				var sReadenCharacter = oldText.substr(iCharacter, 1);
				//remove acentuação
				var indSpecialChar = strSource.indexOf(sReadenCharacter);
				if (indSpecialChar > -1) sReadenCharacter = strTarget.substr(indSpecialChar, 1);
				// remove caractere especial
				if (alfaDecim.indexOf(sReadenCharacter) < 0) sReadenCharacter = "";
				newText.push(sReadenCharacter);
			}
			$(this).val(newText.join(""));
		}
        catch (e) { }
	});

	// inputs de números inteiros
	$("input[type='text'].inteiro").keyup(function () {
		try {
			var numericChars = "1234567890";
			// letras maiúsculas
			var oldText = $(this).val().toUpperCase();
			var newText = [];
			for (var iCharacter = 0; iCharacter < oldText.length; iCharacter++) {
				var sReadenCharacter = oldText.substr(iCharacter, 1);
				// mantem apenas os números
				if (numericChars.indexOf(sReadenCharacter) < 0) sReadenCharacter = "";
				newText.push(sReadenCharacter);
			}
			$(this).val(newText.join(""));
		}
		catch (e) {  }
	});

    // valida sessão
    if (window.location.href.indexOf('/folharosto_') > 0 || window.location.href.indexOf("/home.htm") > 0 || window.location.href.indexOf("/fast.htm") > 0) getJsonP("f_get_session", "");
    try {
        var atual = new Date();
        $('input.date').datepicker({
            dateFormat: "dd/mm/yy",
            dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
            dayNamesMin: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            monthNames: ["Janeiro", "Fevereito", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
            monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            nextText: "Próx",
            prevText: "Ant",
            gotoCurrent: true
        })
        .val(atual.getDate() + "/" + (atual.getMonth() + 1) + "/" + atual.getFullYear())
        .attr('readonly', 'readonly');
    }
    catch (e) { /* a página de login não faz referencia ao jquery ui */ }
    $('input.integer').each(function () { $(this).bind('keydown', function (e) { return somenteNumeros(e); }); });
});

function somenteNumeros(e) {
    //teclas adicionais permitidas (tab,delete,backspace,setas direita e esquerda)
    keyCodesPermitidos = new Array(8, 9, 37, 39, 46);
    //numeros e 0 a 9 do teclado alfanumerico
    for (x = 48; x <= 57; x++) keyCodesPermitidos.push(x);
    //numeros e 0 a 9 do teclado numerico
    for (x = 96; x <= 105; x++) keyCodesPermitidos.push(x);
    //Pega a tecla digitada
    keyCode = e.which;
    //Verifica se a tecla digitada é permitida
    return $.inArray(keyCode, keyCodesPermitidos) != -1;
}
function f_get_session(retorno) {
    endAjax();
    _usuarioLogado = retorno;
    $('#criado_por').val(_usuarioLogado.Nome);
    if (window.location.href.indexOf('/folharosto_r.htm') > 0) getJsonP("f_get_forma_pagamento", "p_tipo=R&p_responsavel=" + encodeURIComponent(_usuarioLogado.Nome));
    else if (window.location.href.indexOf('/folharosto_v.htm') > 0) {
		getJsonP("f_get_forma_pagamento", "p_tipo=V&p_responsavel=" + encodeURIComponent(_usuarioLogado.Nome));
		getJsonP("f_get_forma_pagamento_nf_fm", "&p_responsavel=" + encodeURIComponent(_usuarioLogado.Nome));
	}
	else if (window.location.href.indexOf("/fast.htm") > 0) getJsonP("f_get_forma_pagamento", "p_tipo=" + GetQueryStringParam("tipo") + "&p_responsavel=" + encodeURIComponent(_usuarioLogado.Nome));
    getJsonP("f_eh_adm", "p_criado_por=" + encodeURIComponent(_usuarioLogado.Nome));
}
function f_eh_adm(retorno) {
    endAjax();
    if (retorno.administrador != 1) $("#alterar").remove();
    _adm = retorno.administrador;
	if (window.location.href.indexOf("/home.htm") > 0) {
		if (_adm == 1) {
			$("#lblCriadoPor").show();
			getJsonP("f_get_criadores", "p_pedido=X&c_entregue=N");
		} else {
			$("#lblCriadoPor").hide();
			$("#lblTotal").remove();
			filterList();
		}
	}
}

function f_get_criadores(retorno) {
	endAjax();
	$("#lblCriadoPor").show();
	jPut.criadores.data = retorno;
	$("#selCriadoPor").val("");
	$("#selCriadoPor").prev().text("-- Selecione --");
	filterList();
}

function f_get_entrega_dias(retorno) {
	endAjax();
	$("#entrega_prazo option[value = 'U']").text( retorno.dias + " dias úteis");
}

// ------------------------ Ajax -------------------------- //

var _jputLoadedData = false;

function obterPaginaParcial(urlPaginaParcial, callback) {

	var templateItemFopag = '<option value="{{json.codigo}}" desconto="{{json.desconto}}" desc_sem_ie_com_fecop="{{json.desc_sem_ie_com_fecop}}" desc_sem_ie_sem_fecop="{{json.desc_sem_ie_sem_fecop}}" tipo_dias="{{json.tipo_dias}}" tipo_dias_primeira="{{json.tipo_dias_primeira}}" dias_0="{{json.dias_0}}" dias_7="{{json.dias_7}}" dias_10="{{json.dias_10}}" dias_14="{{json.dias_14}}" dias_20="{{json.dias_20}}" dias_28="{{json.dias_28}}" dias_30="{{json.dias_30}}" dias_42="{{json.dias_42}}" dias_56="{{json.dias_56}}" dias_60="{{json.dias_60}}" dias_90="{{json.dias_90}}" dias_120="{{json.dias_120}}" dias_150="{{json.dias_150}}">{{json.descricao}}</option>';
	                       
	// ao inputar elementos no DOM, os jputs são perdidos
	if (!_jputLoadedData) {
		_jputLoadedData = {};
		$("*[jput]").each(function () {
			var k = $(this).attr("jput");
			_jputLoadedData[k] = eval("jPut." + k + ".data");
		});
	}
	$.get(urlPaginaParcial, function (data) {
		callback(data);
		setTimeout(function () {
			for (k in _jputLoadedData) {
				if (k.indexOf("fopag") < 0) jPut[k].data = _jputLoadedData[k];
				else {
					// popula manualmente os jPut das formas de pagto (desempenho)
					var $fopag = $("*[jput='" + k + "']");
					$fopag.empty();
					for (var i = 0; i < _jputLoadedData[k].length; i++) {
						var opFopag = templateItemFopag.toString();
						var jsonFopag = _jputLoadedData[k][i];
						for (var ki in jsonFopag) {
							var markup = "{{json." + ki + "}}";
							while (opFopag.indexOf(markup) > -1) opFopag = opFopag.replace(markup, jsonFopag[ki]);
						}
						$fopag.append(opFopag);
					}
				}
			}
		}, 100);
	});
}

function startAjax() {
    _iAjax++;
    $.mobile.loading('show', {
        text: "Aguarde",
        textVisible: true,
        //theme: theme,
        textonly: false,
        html: ''
    });
}
function endAjax() {
    _iAjax--;
    if (_iAjax <= 0) $.mobile.loading('hide');
}
function getJsonP(procName, params) {
    startAjax();
    if (params && params != "") params = "&" + params;

    $.ajax({
        url: "HttpHandlers/json.ashx?action=" + procName + params,
        jsonp: procName,
        dataType: "jsonp"
    }).fail(function( jqXHR, textStatus ) {
		//console.log(jqXHR);
		console.log("HttpHandlers/json.ashx?action=" + procName + params)
		console.log("Request failed (" + procName + "): " + textStatus );
	});
}
function f_erro(retorno) {
    endAjax();
    console.log(retorno.mensagem);
    window.location.href = "index.htm";
}
function buscarCep(sCep, tipoEndereco) {
    startAjax();
    $('#' + tipoEndereco + '_logradouro, #' + tipoEndereco + '_numero, #' + tipoEndereco + '_bairro, #' + tipoEndereco + '_cidade').val('');
    $.ajax({
        url: "http://viacep.com.br/ws/" + sCep + "/json/?callback=cep_" + tipoEndereco,
        jsonp: "cep_" + tipoEndereco,
        dataType: "jsonp"
    });
}
function cep_e(retorno) { cep_callback(retorno, 'e'); }
function cep_c(retorno) { cep_callback(retorno, 'c'); }
function cep_f(retorno) { cep_callback(retorno, 'f'); }
function cep_a(retorno) { cep_callback(retorno, 'a'); }
function cep_callback(retorno, tipoEndereco) {
    endAjax();
    if (retorno.erro) { }
	else {
		

		$('#' + tipoEndereco + '_logradouro').val(retorno.logradouro.toUpperCase().removeSpecialCharacters());
		$('#' + tipoEndereco + '_bairro').val(retorno.bairro.toUpperCase().removeSpecialCharacters());
		$('#' + tipoEndereco + '_cidade').val(retorno.localidade.toUpperCase().removeSpecialCharacters());
        $('#' + tipoEndereco + '_uf').val(retorno.uf).change();
    }
    $($('#' + tipoEndereco + '_logradouro').val().trim() == '' ? ('#' + tipoEndereco + '_logradouro') : ('#' + tipoEndereco + '_numero')).focus();
}

// -------------------- Métodos de Formulário -------------------- //

function validar() {
    var retorno = '';
    $('[validationRule]').each(function () {
        $(this).removeClass('erroValidacao');
        if (!eval($(this).attr('validationRule'))) {
            $(this).addClass('erroValidacao');
            retorno += "<p>" + $(this).attr('validationMessage') + "</p>";
        }
    });
    return retorno;
}
function mergeXml(listaCampos, dadosJson) {
    $(listaCampos).each(function () {
        var vlJson = dadosJson[$(this).attr('id')];
        if (vlJson) $(this).val(vlJson).change();
    });
}

function erro(titulo, mensagem) {
	$('#erro').empty().append('<h1>' + titulo + '</h1><p>' + mensagem + '</p>').show();
	window.scrollTo(0, 0);
}

function mensagem(titulo, mensagem) {
	$('#mensagem').empty().append('<h1>' + titulo + '</h1><p>' + mensagem + '</p>').show();
	window.scrollTo(0, 0);
}

// -------------------- Utilidades Gerais -------------------- //

function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj == '') return false;
    // Elimina CNPJs invalidos conhecidos
    if (cnpj.length != 14 || cnpj == "00000000000000" || cnpj == "11111111111111" || cnpj == "22222222222222" || cnpj == "33333333333333" || cnpj == "44444444444444" || cnpj == "55555555555555" || cnpj == "66666666666666" || cnpj == "77777777777777" || cnpj == "88888888888888" || cnpj == "99999999999999")
        return false;
    // Valida DVs
    tamanho = cnpj.length - 2
    numeros = cnpj.substring(0, tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    return true;
}
function validarCPF(cpf) { return true; }
function GetQueryStringParam(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) return decodeURIComponent(sParameterName[1]);
    }
    return null;
}
function globalReplace(texto, palavra, substituir) {
    while (texto.indexOf(palavra) > -1) texto = texto.replace(palavra, substituir);
    return texto;
}
/*
    Formato to PP: YY
                  -{L || LL}{0}0000
				  {-L} 
				  {-AD || -PT || -PO}
				  {-LOC || -FST || -FAT || -PROD}
 */
function validarCodigoPP(strPP) {
	
    var strLetras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var lstDuplas = ["AD", "PT", "PO"];
	var lstTriplas = ["LOC", "FST", "FAT", "PROD"];
	var mapTriplas = {
		"N": "",
		"F": "FAT",
		"S": "PROD"
	};
	var lstPP = strPP.split('-');
	console.log(lstPP);
    
	// ----------------------- validando os hífens (número de posições) ----------------------- //
	
	if (lstPP.length < 2 || lstPP.length > 5) return false;
    console.log("Validou PP 0.0");
	
	// ---------------------------- validando a primeira posição ------------------------------ //
	
    if (lstPP[0] != (new Date()).getFullYear().toString().substr(2)) return false; 
	console.log("Validou PP 1.0");
	
	// ----------------------------- validando a segunda posição ------------------------------ //
	
	// verifica o comprimento
    if (lstPP[1].length < 4 || lstPP[1].length > 7) return false;
	console.log("Validou PP 2.0");
	
	// verifica em qual índice inicia a parte numérica e valida as letras
    var inicioNumero;
	if (strLetras.indexOf(lstPP[1].substr(1, 1)) > -1) {
		console.log("Entrou 2.1 -- " + lstPP[1].substr(0, 1));
		inicioNumero = 2;
		// se o segundo caractere é letra, o primeiro também deve ser
		if (strLetras.indexOf(lstPP[1].substr(0, 1)) < 0) return false;
		console.log("Validou PP 2.1");
	}
	else if (strLetras.indexOf(lstPP[1].substr(0, 1)) > -1)
		inicioNumero = 1;
	else 
		inicioNumero = 0;
	
	// verifica a parte numérica 
	console.log("Entrou 2.2");
	if (isNaN(lstPP[1].substr(inicioNumero))) return false;
	console.log("Validou PP 2.2");
	
	console.log("Entrou 2.3");
	if (lstPP[1].substr(inicioNumero).length > 5) return false;
	console.log("Validou PP 2.3");
	
	// ------------------------------ validando terceira posição ------------------------------ //
	
	var caracsLidos = 0;
	if (lstPP.length > 2) {
		// verifica {-L}
		if (lstPP[2].length == 1) {
			console.log("Entrou 3.1");
			if (strLetras.indexOf(lstPP[2]) < 0) return false;
			caracsLidos = 1;
			console.log("Validou PP 3.1");
		}
		// verifica {-AD || -PT || -PO}
		else if (lstPP[2].length == 2) {
			console.log("Entrou 3.2");
			if (lstDuplas.indexOf(lstPP[2]) < 0) return false;
			console.log("Validou PP 3.2");
	
			console.log("Entrou 3.3");
			if (lstPP.length > 4) return false;
			console.log("Validou PP 3.3");
			caracsLidos = 2;
		}
		// verifica  {-LOC || -FST || -FAT || -PROD}
		else if (lstPP[2].length > 2) {
			console.log("Entrou 3.4");
			if (lstTriplas.indexOf(lstPP[2]) < 0) return false;
			console.log("Validou PP 3.4");
			
			console.log("Entrou 3.5");
			if (lstPP.length > 3) return false; // a tripla deve ser a última
			console.log("Validou PP 3.5");
		}
		else 
			return false;
	}
	
	// ------------------------------- validando quarta posição ------------------------------- //
	
	if (lstPP.length > 3) {
		
		// verifica {-AD || -PT || -PO}
		if (lstPP[3].length == 2) {
			console.log("Entrou 4.1");
			if (caracsLidos > 1) return false; // verifica se já leu as duplas (ou triplas) em uma posição anterior
			console.log("Validou PP 4.1");
			
			console.log("Entrou 4.2");
			if (lstDuplas.indexOf(lstPP[3]) < 0) return false;
			console.log("Validou PP 4.2");
		}
		// verifica  {-LOC || -FST || -FAT || -PROD}
		else if (lstPP[3].length > 2) {
			console.log("Entrou 4.3");
			if (lstTriplas.indexOf(lstPP[3]) < 0) return false;
			console.log("Validou PP 4.3");
			
			console.log("Entrou 4.4");
			if (lstPP.length > 4) return false; // a tripla deve ser a última
			console.log("Validou PP 4.4");
		}
		else 
			return false;
	}
	
	// ---------------------- validando quinta (ultima possível) posição ---------------------- //
	
	if (lstPP.length > 4) {
		
		if (lstPP[4].length > 2) {
			console.log("Entrou 5.1");
			if (lstTriplas.indexOf(lstPP[4]) < 0) return false;
			console.log("Validou PP 5.1");
		}else 
			return false;
		
	}
	
	// ---------- valida o sufixo de acordo com o tipo de PP (somente para pedidos) ---------- //
		
	var sTipoPP = $("#so_producao").val();
	mapTriplas = mapTriplas[sTipoPP];
	if (mapTriplas); else mapTriplas = "";
	console.log("Validando saida");
	return mapTriplas == "" || lstPP[lstPP.length - 1] == mapTriplas;
}


function semNumeroClick(elCheckbox, elInput) {
    if ($(elCheckbox).is(":checked")) $(elInput).val("").attr("disabled", "disabled");
    else $(elInput).removeAttr("disabled").focus();
}
function semNumeroValida(elCheckbox, elInput) {
    return $(elCheckbox).is(":checked") || ($(elInput).val().trim() != "" && !isNaN($(elInput).val()));
}

// -------------------- Busca de Endereço -------------------- //

var _sTipoBuscaEndereco;
function buscarEndereco(tipo) {
    _sTipoBuscaEndereco = tipo;
    getJsonP("f_get_lista_endereco", "p_cnpj=" + encodeURIComponent($("#f_cnpj").val()));
}
function f_get_lista_endereco(dados) {
    endAjax();
    window.scroll(0, 0);
    $("body")
        .css("overflow", "hidden")
        .prepend("<div id='divBuscaEnderecoBG'></div>" +
                 "<center id='centerBuscaEnderecoModal'>" +
                     "<div class='dialogEnd ui-corner-all'>" +
                         "<div class='ui-bar-a ui-first-child ui-corner-all'>Selecione o Endere&ccedil;o</div>" +
                         "<ul></ul>" +
                         "<div style='text-align:right; padding:10px 10px 0 0;'><button class='ui-button ui-corner-all' style='padding:5px 10px; border:solid 1px #bbb;' onclick='$(\"#divBuscaEnderecoBG, #centerBuscaEnderecoModal\").remove(); $(\"body\").css(\"overflow\", \"auto\");'>Cancelar</button></div>" +
                     "</div>" +
                 "</center>");
    $("#divBuscaEnderecoBG").css({
        position: "absolute",
        width: "100%",
        height: "100%",
        "background-color": "#000",
        "z-index": 1000,
        opacity: 0.5,
        "text-align": "center"
    });
    $("#centerBuscaEnderecoModal").css({
        "z-index": 1000,
        position: "absolute",
        width: "100%"
    });
    $("#centerBuscaEnderecoModal div.dialogEnd")
        .css({
            background: "#fff",
            width: "600px",
            "margin-top": "50px",
            "padding-bottom": "10px",
            display: "inline-table"
        });
    $("#centerBuscaEnderecoModal div.dialogEnd div.ui-first-child")
        .css({
            "text-align": "left",
            padding: "5px 10px"
        });
    $("#centerBuscaEnderecoModal ul")
        .css({
            "list-style-type": "none",
            "margin": "10px 10px 0 10px",
            "padding": 0
        });
    for (var iEndereco = 1; iEndereco < dados.length; iEndereco++)
        $("#centerBuscaEnderecoModal ul").append("<li onclick='selectEndereco(this);'>" +
            "<h5>CPF/CNPJ: <span name='cnpj'>" + formatCnpj(dados[iEndereco].cnpj, dados[iEndereco].tipo_pessoa) + "</cnpj><input type='hidden' name='tipo_pessoa' value='" + dados[iEndereco].tipo_pessoa + "' /></h5>" +
            "<span name='logradouro'>" + dados[iEndereco].logradouro + "</span>, <span name='numero'>" + dados[iEndereco].numero.toString() + "</span> <span name='complemento'>" + dados[iEndereco].complemento + "</span><br />" +
            "<span name='bairro'>" + dados[iEndereco].bairro + "</span> - CEP: <span name='cep'>" + dados[iEndereco].cep + "</span> - <span name='cidade'>" + dados[iEndereco].cidade + "</span>/<span name='uf'>" + dados[iEndereco].uf + "</span>" +
        "</li>");
    $("#centerBuscaEnderecoModal li")
        .attr("class", "ui-corner-all")
        .css({
            "text-align": "left",
            "font-size" : "12pt",
            "padding" : "10px",
            "cursor": "pointer",
            "border": "solid 1px #bbb",
            "background": "#eee"
        });
    $("#centerBuscaEnderecoModal h5").css({
        "text-align": "left",
        "font-size" : "12pt",
        "font-weight" : "bold",
        "margin":0,
        "padding": "0 0 10px 0"
    });
}

function formatCnpj(cnpj, tipoPessoa) {
    return tipoPessoa.toUpperCase() == "F"
         ? cnpj.substr(0, 3) + "." + cnpj.substr(3, 3) + "." + cnpj.substr(6, 3) + "-" + cnpj.substr(9, 2)
         : cnpj.substr(0, 2) + "." + cnpj.substr(2, 3) + "." + cnpj.substr(5, 3) + "/" + cnpj.substr(8, 4) + "-" + cnpj.substr(12, 2);
}

function selectEndereco(li) {
    $(li).find("*[name]").each(function () {
        $("#" + _sTipoBuscaEndereco + "_" + $(this).attr("name")).val($(this).val() + $(this).text());
    });
    $("#divBuscaEnderecoBG, #centerBuscaEnderecoModal").remove();
    $("body").css("overflow", "auto");
}


// -------------- Listagem de Produtos no Pedido/Proposta-------------- //


function carregarProdutosPP(dados) {
	$("#bdProdutos").empty();
	if (dados.produtos) {
		for (var iProd in dados.produtos)
			try {
				if (!isNaN(dados.produtos[iProd].quantidade.split(",")[0])) {
					var oProduto = dados.produtos[iProd];
					
					oProduto.vl_total = oProduto.valor * oProduto.quantidade;
					oProduto.vl_total = (Math.round(oProduto.vl_total * 100) / 100).toString().replace(".", ",");
					oProduto.valor = (Math.round(oProduto.valor * 100) / 100).toString().replace(".", ",");
					
					if (oProduto.vl_total.indexOf(",") < 0) oProduto.vl_total += ",00";
					else if (oProduto.vl_total.split(",")[1].length < 2) oProduto.vl_total += "0";
					
					if (oProduto.valor.indexOf(",") < 0) oProduto.valor += ",00";
					else if (oProduto.valor.split(",")[1].length < 2) oProduto.valor += "0";
					
					$("#bdProdutos").append("<tr>" +
						"<td>" + oProduto.cd_produto + "</td>" +
						"<td>" + oProduto.descritivo + "</td>" +
						"<td style='display:none;'>" + oProduto.cor + "</td>" +
						"<td>" + obterRevestimentos(oProduto.tp_revestimento, oProduto.cd_revestimento) + "</td>" +
						"<td style='text-align:right' vl_unit='" + oProduto.valor + "'>" + oProduto.valor + "</td>" +
						'<td><input onchange="calcular();" validationRule="!isNaN($(this).val().replace(' + "',', '.'" + ')) && $(this).val() != 0" validationMessage="Informe a quantidade do produto" style="text-align:right; border:solid 0;" qtde="" type="text" value="' + oProduto.quantidade + '" tp_produto="' + oProduto.tp_produto + '" /></td>' +
						'<td><input style="text-align:right; border:solid 0;" vl_total="" type="text" value="' + oProduto.vl_total + '" disabled="disabled" /></td>' +
						'<td style="text-align:center"><div class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext ui-btn-inline" style="background:#f66; border: solid 1px #c33;" onclick="removerProduto(this);">&nbsp;</div></td>' +
					"</tr>");
				}
			} catch(err) { }
		
		$("#bdProdutos select").each(function() {
			$(this).val($(this).attr("db_value"));
		})
	}
}

function habilitarProdutosPP(bState) {
	if (bState) {
		$("#ttblProdutos, #lblAgravo").show();
		$("#btnAdicionarProduto").removeAttr("disabled");
		$("#vl_assentos, #vl_mobiliario, #vl_divisorias, #vl_arq_deslizante, #vl_painel, #vl_outros").attr("disabled", "disabled");
	} else {
		$("#bdProdutos").empty();
		$("#ttblProdutos, #lblAgravo").hide();
		$("#btnAdicionarProduto").attr("disabled", "disabled");
		$("#vl_assentos, #vl_mobiliario, #vl_divisorias, #vl_arq_deslizante, #vl_painel, #vl_outros").removeAttr("disabled");
	}
}

function getStringProdutos() {
	var sProdutos = [];
	$("#bdProdutos tr").each(function() {
		var sQtd = $($(this).find("td")[5]).find("input").val();
		while (sQtd.indexOf(".") > -1) sQtd = sQtd.replace(".", "");
		sQtd = sQtd.replace(",", ".");
		sProdutos.push([$($(this).find("td")[0]).text(), // codigo
						$($(this).find("td")[1]).text(), // descritivo
						$($(this).find("td")[2]).text(), // cor
						$($(this).find("td")[3]).find("select").val(), // cd_revestimento
						$($(this).find("td")[4]).attr("vl_unit").replace(",", "."), // preco
						sQtd, // qtde
						$($(this).find("td")[5]).find("input").attr("tp_produto")].join("§")); // tipo
		
	});
	return sProdutos.join("|");
}

// -------------------- Seleção de Produtos -------------------- //

var _ultimaLinha = -1;

function selecionarProduto() {

	if(window.location.href.indexOf("/folharosto_") > -1) {
		sTipo = window.location.href.split("/")[window.location.href.split("/").length - 1].split(".")[0].substr(-1).toUpperCase();
	}
	else {
		sTipo = GetQueryStringParam("tipo").toUpperCase();
	}

	getJsonP("f_get_produto_linha", "p_tipo=" + sTipo);
}

function f_get_produto_linha(dados) {
	endAjax();
	endAjax();
	window.scroll(0, 0);
    $("body")
        .css("overflow", "hidden")
        .prepend("<style>#centerSelecionarProdutoModal table.grid * { font-size: 10pt; } " +
		                "#centerSelecionarProdutoModal table.grid p { padding: 0; margin: 0; border: 0; background-color: transparent; } " +
		                "#centerSelecionarProdutoModal table.grid *.selected { background-color: #cfc; } " +
						"#centerSelecionarProdutoModal td.colzebra { background-color: #ddd; }</style>" +
		         "<div id='divSelecionarProdutoBG'></div>" +
                 "<center id='centerSelecionarProdutoModal'>" +
                     "<div class='dialogEnd ui-corner-all'>" +
                         "<div class='ui-bar-a ui-first-child ui-corner-all'>Selecione o Produto</div>" +
                         "<div id='divSelectProdutoFiltros' style='padding: 10px 0 0 20px; text-align: left;'>" +
						   "<label style='max-width:350px; white-space:nowrap;'>" +
							"Linha:" +
							"<select id='selSelecionarProdutoLinha' class='ui-corner-all' style='padding:5px 10px; margin-right:10px;' onchange='filterSelecionarProduto($(this).val())'>" +
								"<option value='0'>-- Selecione uma linha --</option>" +
							"</select>" +
							"<button style='margin-right: 10px' onclick='indiceLinhas();'>Verificar Índice</button>" +
							"<button onclick='formPlataformas();'>Plataformas</button>" +
						   "</label>" +
						 "</div>" +
						 "<div style='height:600px; overflow:scroll; display: block; padding: 0 20px 20px 0; text-align: left'>" + 
							"<table id='tblSelecaoProdutos' cellpadding='0' cellspacing='0' class='ui-corner-all grid'>" + 
								"<thead>" +
									"<tr><th class='static' style='text-align:center; position: sticky; top:0;'>MODELO</th><th class='static' style='text-align:center; position: sticky; top:0;'>DESCRI&Ccedil;&Atilde;O</th></tr>" +
								"</thead>" +
								"<tbody>" +
								"</tbody>" +
							"</table>" +
							"<table id='tblFiltroLinhas' style='display:none; width:100%;' cellpadding='0' cellspacing='5'></table>" +
							"<div id='divFormPlataformas' style='display:none;'>" +
								"<p style='text-align:center; font-size:20px;'>Plataformas</p>" +
								"<style>.div-form{margin: 0 0 50px 0;display: flex;}" +
								".select-form{margin: 0 15px 0 0;}" +
								".col-md-4 {display:inline-flex;width: 25%;}" +
								".container {margin:25px 0 0 150px !important;}" +
								"#divFormPlataformas {margin: 10px 0px 10px 20px;}</style>" +
								"<form>" +
									"<div class='container'>" +
										"<div class='row div-form'>" +
											"<div class='col-md-4'> " +
												"<label for'selPlataformaTipo'>Tipo:</label>" +
												"<select class='select-form ui-corner-all' id='selPlataformaTipo'>" +
													"<option value = '1'></option>" +
												"</select >" +
											"</div>" +
											"<div class='col-md-4'> " +
												"<label for'selPlataformaLinha'>Linha:</label>" +
												"<select class='select-form ui-corner-all' id='selPlataformaLinha'>" +
													"<option value = '1'></option>" +
												"</select >" +
											"</div>" +
											"<div class='col-md-4'> " +
												"<label for'selPlataformaCorEstrutura'>Cor Estrutura:</label>" +
												"<select class='select-form ui-corner-all' id='selPlataformaCorEstrutura'>" +
													"<option value = '1'></option>" +
												"</select >" +
											"</div>" +
											"<div class='col-md-4'> " +
												"<label for'selPlataformaCorTampo'>Cor Tampo:</label>" +
												"<select class='select-form ui-corner-all' id='selPlataformaCorTampo'>" +
													"<option value = '1'></option>" +
												"</select >" +
											"</div>" +
										"</div>" +
										"<div class='row div-form'>" +
											"<div class='col-md-4'> " +
												"<label for'selPlataformaPosicoes'>Posições:</label>" +
												"<select class='select-form ui-corner-all' id='selPlataformaPosicoes'>" +
													"<option value = '1'></option>" +
												"</select >" +
											"</div>" +
											"<div class='col-md-4'> " +
												"<label for'selPlataformaComprimento'>Comprimento:</label>" +
												"<select class='select-form ui-corner-all' id='selPlataformaComprimento'>" +
													"<option value = '1'></option>" +
												"</select >" +
											"</div>" +
											"<div class='col-md-4'> " +
												"<label for'selPlataformaProfundidade'>Profundidade:</label>" +
												"<select class='select-form ui-corner-all' id='profundidade' name='selPlataformaProfundidade'>" +
													"<option value = '1'></option>" +
												"</select >" +
											"</div>" +
										"</div>" +
									"</div>" +
								"</form>" +
								"<button class='ui-button ui-corner-all' style='padding: 5px 10px; border: solid 1px #bbb;float:right;' onclick='confirmarPlataformas()'>Confirmar</button>" +
							"</div>" +
						 "</div>" +
                         "<div style='text-align:right; padding:10px 10px 0 0;'><button class='ui-button ui-corner-all' style='padding:5px 10px; border:solid 1px #bbb;' onclick='$(\"#divSelecionarProdutoBG, #centerSelecionarProdutoModal\").remove(); $(\"body\").css(\"overflow\", \"auto\");'>Cancelar</button></div>" +
                     "</div>" +
                 "</center>");

	for (var iProdutoLinha in dados)
		if (dados[iProdutoLinha].titulo)
			$("#selSelecionarProdutoLinha").append("<option value='" + dados[iProdutoLinha].id + "' descricao='" + dados[iProdutoLinha].descricao + "'>" + dados[iProdutoLinha].titulo + "</option>");
		
	var qtTRFilter = $("#selSelecionarProdutoLinha option").length - 1;
	qtTRFilter = Math.trunc(qtTRFilter / 2) + (qtTRFilter % 2 > 0 ? 1 : 0);
	for (iTrFilter = 0; iTrFilter < qtTRFilter; iTrFilter++) {
		var tdEsq = $("#selSelecionarProdutoLinha option")[iTrFilter + 1];
		var tdDir = $("#selSelecionarProdutoLinha option")[qtTRFilter + iTrFilter + 1];
		$("#tblFiltroLinhas").append("<tr><td><a onclick='selecionarLinhaProd(" + $(tdEsq).val() + ");' href='#'>" + $(tdEsq).text() + "</a></td>"
		                             + (tdDir ? ("<td><a onclick='selecionarLinhaProd(" +  $(tdDir).val() + ");' href='#'>" + $(tdDir).text() + "</a></td>") : "")
									 + "</tr>");
	}

	
	$("#divSelecionarProdutoBG").css({
		position: "absolute",
		width: "100%",
		height: "100%",
		"background-color": "#000",
		"z-index": 1000,
		opacity: 0.5,
		"text-align": "center"
	});
	$("#centerSelecionarProdutoModal").css({
		"z-index": 1000,
		position: "absolute",
		width: "100%"
	});
	$("#centerSelecionarProdutoModal div.dialogEnd")
		.css({
			background: "#fff",
			width: "95%",
			"margin-top": "10px",
			"padding-bottom": "10px",
			display: "inline-table"
		});
	$("#centerSelecionarProdutoModal div.dialogEnd div.ui-first-child")
		.css({
			"text-align": "left",
			padding: "5px 10px"
		});
	$("#centerSelecionarProdutoModal h5").css({
		"text-align": "left",
		"font-size" : "12pt",
		"font-weight" : "bold",
		"margin":0,
		"padding": "0 0 10px 0"
	});
	
	
	$("#tblFiltroLinhas td").css({
		"background-color": "#ddd"
	});
	
	$("#tblFiltroLinhas a").css({
		"text-decoration": "none",
		"color": "#000",
		"display": "block"
	});
	
	if (_ultimaLinha > 0) {
		$("#selSelecionarProdutoLinha").val(_ultimaLinha).change();
	}
}

function selecionarLinhaProd(idLinha) {
	$("#selSelecionarProdutoLinha").val(idLinha).change();
}

function indiceLinhas() {
	$("#tblSelecaoProdutos, #divSelectProdutoFiltros, #divFormPlataformas").hide();
	$("#tblFiltroLinhas").show();
}

function formPlataformas() {
	$("#tblSelecaoProdutos, #divSelectProdutoFiltros, #tblFiltroLinhas").hide();
	$("#divFormPlataformas").show();
}

function confirmarPlataformas() {
	alert("Em desenvolvimento");
}

var lstGruposDescr = [];
var lstCores = [];
function filterSelecionarProduto(cdLinhaProduto) {
	$("#tblFiltroLinhas").hide();
	$("#tblSelecaoProdutos, #divSelectProdutoFiltros").show();
	_ultimaLinha = cdLinhaProduto;
	// reseta a grid
	$("#tblSelecaoProdutos tbody tr, #tblSelecaoProdutos th:not(.static)").remove();
	if (cdLinhaProduto != 0) { // 0 = 'Selecione'
		// carrega as cores e grupos de forma assíncrona
		lstCores = [];
		getJsonP("f_get_produto_cor", "p_id_linha=" + cdLinhaProduto);
		lstGruposDescr = [];
		getJsonP("f_get_produto_grupo", "p_id_linha=" + cdLinhaProduto);
		var intLoadCoresEModelos = setInterval(function() {
			if (lstCores.length > 0 && lstGruposDescr.length > 0) {
				getJsonP("f_get_produtos", "p_id_linha=" + cdLinhaProduto);
				clearInterval(intLoadCoresEModelos);
			}
		});
	}
}
function f_get_produto_cor(dados) {
	endAjax();
	var lstTemp = []
	for (var iCor in dados)
		if (dados[iCor].descricao){
			$("#tblSelecaoProdutos thead tr").append("<th style='text-align:center; position: sticky; top:0;' id_cor='" + dados[iCor].id + "'>" + dados[iCor].descricao + "</th>")
			lstTemp.push(dados[iCor].id);
		}
	lstCores = lstTemp;
}

function f_get_produto_grupo(dados) {
	console.log(dados);
	endAjax();
	var lstTemp = []
	for (var iGrupo in dados)
		if (!isNaN(dados[iGrupo].id))
		{
			console.log("Carregando grupo: " + iGrupo);
			$("#tblSelecaoProdutos tbody")
				.append("<tr tipo='" + dados[iGrupo].tipo + "'><td colspan='2' style='text-align:center;'><strong id_grupo_titulo='" + dados[iGrupo].id + "'>" + dados[iGrupo].titulo + "</strong></td></tr>");
			var nRowspan = 0;
			for (var iDescr in dados[iGrupo].descricoes)
				if (!isNaN(dados[iGrupo].descricoes[iDescr].id))
				{
					console.log("Carregando descricao: " + iDescr);
					nRowspan++;
					var sRow = "<tr tipo='" + dados[iGrupo].tipo + "'";
					if (nRowspan == 1) sRow += " id='trGrupoProd" + dados[iGrupo].id + "' "
					sRow += ">";
					if (nRowspan == 1) sRow += "<td style='text-align:center;'><strong id_grupo_descricao='" + dados[iGrupo].id + "'>" + dados[iGrupo].descricao + "</strong></td>";
					sRow += "<td style='text-align:center;' descricao=''>" + dados[iGrupo].descricoes[iDescr].descricao + "</td>";
					$("#tblSelecaoProdutos tbody").append(sRow);
					lstTemp.push({ grupo: dados[iGrupo].id, descricao: dados[iGrupo].descricoes[iDescr].id });
				}
			$("#trGrupoProd" + dados[iGrupo].id + " td:first").attr("rowspan", nRowspan);
			$("#tblSelecaoProdutos strong").css("border", "solid 0");
		}
	lstGruposDescr = lstTemp;
}

var _lstProdutos = [];
function f_get_produtos(dados) {
	endAjax();
	_lstProdutos = dados;
	//1) cria as células vazias na grid
	var iGruposDescr = -1;
	var lstTR = $("#tblSelecaoProdutos tbody tr");
	for (var iTr = 0; iTr < lstTR.length; iTr++) {
		// se possui colspan é TR do nome do grupo
		var iColspan = $(lstTR[iTr]).find("td:first").attr("colspan");
		if (isNaN(iColspan)) iColspan = 1;
		else iColspan = parseInt(iColspan);
		if (iColspan > 1)
			$(lstTR[iTr]).find("td:first").attr("colspan", iColspan + lstCores.length)
		else {
			iGruposDescr++;
			for (var iCor = 0; iCor < lstCores.length; iCor++)
				$(lstTR[iTr]).append("<td id='g" + lstGruposDescr[iGruposDescr].grupo + "d" + lstGruposDescr[iGruposDescr].descricao + "c" + lstCores[iCor] + "' " + 
									   (iCor % 2 == 0 ? " class='colzebra'" : "") + ">&nbsp;</td>");
		    
			
		}
	}
	endAjax();
	popularProdutos(dados);
	
}

function popularProdutos(lstProdutos)
{
	for (var iPreco = 0; iPreco < lstProdutos.length; iPreco++) {
		if (!isNaN(lstProdutos[iPreco].cor)) {
			var sPrec = lstProdutos[iPreco].valor.toString().replace(".", ",");
			if (sPrec.indexOf(",") < 0) sPrec += ",00";
			else if (sPrec.split(",")[1].length < 2) sPrec += "0";
			$("#g" + lstProdutos[iPreco].grupo + "d" + lstProdutos[iPreco].descricao + "c" + lstProdutos[iPreco].cor)
				.attr("descr", lstProdutos[iPreco].descritivo)
				.attr("tp_produto", lstProdutos[iPreco].tp_produto)
				.attr("tp_revestimento", lstProdutos[iPreco].revestimento)
				.hover(function() { $(this ).addClass("selected"); },
					function() { $( this ).removeClass( "selected" ); } )
				.append("<p style='text-align:left;'>" + lstProdutos[iPreco].codigo + "<input type='hidden' value='" + lstProdutos[iPreco].id + "' /></p><p>&nbsp;</p><p style='text-align:right;'>" + sPrec + "</p>")
				.click(function() {
					escolheuProduto($(this)[0]);
				});
		}
	}
	endAjax();
}

function escolheuProduto(tdProduto, jsonDados)
{
	if (jsonDados) {

	} else {
		var idCell = $(tdProduto).attr("id").substr(1); //id == g000d000c000
		jsonDados = {
			"preco": $(tdProduto).find("p:last").text(),
			"codigo": $(tdProduto).find("p:first").text().trim(),
			"id_grupo": idCell.split("d")[0],
			"id_descricao": idCell.split("d")[1].split("c")[0],
			"id_cor": idCell.split("c")[1],
			"id_linha": $("#selSelecionarProdutoLinha").val(),
			"tipo": $(tdProduto).attr("tp_produto"),
			"tipo_revestimento": $(tdProduto).attr("tp_revestimento"),
			"revestimento_selecionado": "",
			"descricao":  $(tdProduto).parent().find("[descricao]").text().trim(),
			"linha": $("#selSelecionarProdutoLinha option:selected").text(),
			"grupo_titulo": $("strong[id_grupo_titulo='" + idCell.split("d")[0] + "']").text().trim(),
			"grupo_descricao": $("strong[id_grupo_descricao='" + idCell.split("d")[0] + "']").text().trim(),
			"cor": $("th[id_cor='" + idCell.split("c")[1] + "']").text().trim(),
			"descritivo": $(tdProduto).attr("descr"),
			"quantidade": "0"
		};
	}
	
	var bExists = false;
	/*
	$("#bdProdutos tr").each(function() {
		if ($(this).find("td:first").text() == jsonDados.codigo &&
		{
			bExists = true;
			return;
		}
	});
	*/
	//Permitir Código duplicado para poder inferir diferentes revestimentos
	if (bExists) 
		alert("Este produto já está na lista, favor verificar a quantidade.")
	else {
		console.log(jsonDados);
		if (jsonDados.descritivo); else jsonDados.descritivo = " ";
		if (jsonDados.descritivo.trim() == "") jsonDados.descritivo = "DESCR. NÃO IMPORTADA";
		if (jsonDados.revestimento_selecionado); else jsonDados.revestimento_selecionado = "";
		while (jsonDados.revestimento_selecionado.trim().length < 2) jsonDados.revestimento_selecionado = jsonDados.revestimento_selecionado.trim() + "0";

		console.log(jsonDados);
		console.log(obterRevestimentos(jsonDados.tipo_revestimento, jsonDados.revestimento_selecionado));

		$("#bdProdutos").append("<tr>" +
						"<td>" + jsonDados.codigo + "</td>" +
						"<td>" + /*jsonDados.grupo_titulo + " " + jsonDados.grupo_descricao + " " + jsonDados.descricao + */ jsonDados.descritivo + "</td>" +
						"<td cor='' style='display:none;'>" + jsonDados.cor + "</td>" +
						"<td>" + obterRevestimentos(jsonDados.tipo_revestimento, jsonDados.revestimento_selecionado) +"</td>" +
						"<td style='text-align:right' vl_unit='" + jsonDados.preco + "'>" + jsonDados.preco + "</td>" +
						'<td><input value="' + jsonDados.quantidade + '" onchange="calcular();" validationRule="!isNaN($(this).val().replace(' + "',', '.'" + ')) && $(this).val() != 0" validationMessage="Informe a quantidade do produto" style="text-align:right; border:solid 0;" qtde="" type="text" value="0" tp_produto="' + jsonDados.tipo + '" id_linha="' + jsonDados.id_linha + '" id_grupo="' + jsonDados.id_grupo + '" id_descricao="' + jsonDados.id_descricao + '" id_cor="' + jsonDados.id_cor + '" /></td>' +
						'<td><input style="text-align:right; border:solid 0;" vl_total="" type="text" value="" disabled="disabled" /></td>' +
						'<td style="text-align:center"><div class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext ui-btn-inline" style="background:#f66; border: solid 1px #c33;" onclick="removerProduto(this);">&nbsp;</div></td>' +
					"</tr>");					
		$("#divSelecionarProdutoBG, #centerSelecionarProdutoModal").remove();
		$("body").css("overflow", "auto");
		calcular();
	}
}

function obterRevestimentos(tp_revestimento, cdRevestimento) {
	return "<select cd_revestimento='' style='border: solid 0;' db_value='" + cdRevestimento + "'>" + 
				(tp_revestimento == "D" ?
				("<option value='FS'>FOSCO</option>" +
				"<option value='PT'>PRETO</option>") :
				 tp_revestimento == "T" ?
				("<option value='00'>00 - cor a definir</option>" +
				"<option value='02'>T-02AZ</option>" +
				"<option value='05'>T-05AZ</option>" +
				"<option value='06'>T-06VM</option>" +
				"<option value='07'>T-07VM</option>" +
				"<option value='20'>T-20VD</option>" +
				"<option value='31'>T-31PT</option>" +
				"<option value='61'>T-61RX</option>" +
				"<option value='63'>T-63RS</option>" +
				"<option value='65'>T-65AZ</option>" +
				"<option value='67'>T-67VD</option>" +
				"<option value='32'>T-32CZ</option>" +
				"<option value='111'>T-111AZ</option>" +
				"<option value='108'>T-108AZ</option>" +
				"<option value='38'>T-38VD</option>" +
				"<option value='106'>T-106VD</option>" +
				"<option value='109'>T-109AZ</option>" +
				"<option value='110'>T-110CZ</option>" +
				"<option value='107'>T-107AZ</option>" +
				"<option value='36'>T-36BG</option>" +
				"<option value='35'>T-35LJ</option>" +
				"<option value='33'>T-33RX</option>" +
				"<option value='37'>T-37MR</option>" +
				"<option value='34'>T-34LJ</option>" +
				"<option value='99'>T-99AM</option>" +
				"<option value='112'>T-112AZ</option>" +
				"<option value='113'>T-113CZ</option>" +
				"<option value='08'>08</option>" +
				"<option value='09'>09</option>") :
				tp_revestimento == "K" ?
			   ("<option value='00'>00 - cor a definir</option>" +
				"<option value='25'>K-25AM</option>" +
				"<option value='200'>K-200AM</option>" +
				"<option value='134'>K-134AZ</option>" +
				"<option value='984'>K-984AZ</option>" +
				"<option value='136'>K-136AZ</option>" +
				"<option value='137'>K-137AZ</option>" +
				"<option value='124'>K-124BG</option>" +
				"<option value='125'>K-125BG</option>" +
				"<option value='121'>K-121BR</option>" +
				"<option value='204'>K-204CZ</option>" +
				"<option value='122'>K-122CZ</option>" +
				"<option value='902'>K-902LJ</option>" +
				"<option value='126'>K-126MR</option>" +
				"<option value='123'>K-123PT</option>" +
				"<option value='127'>K-127RS</option>" +
				"<option value='128'>K-128RX</option>" +
				"<option value='29'>K-29VD</option>" +
				"<option value='26'>K-26VD</option>" +
				"<option value='132'>K-132VD</option>" +
				"<option value='129'>K-129VM</option>" +
				"<option value='130'>K-130VM</option>" +
				"<option value='131'>K-131VM</option>") :
				tp_revestimento == "PET" ?
			   ("<option value='00'>00 - cor a definir</option>" +
				"<option value='11'>11</option>" +
				"<option value='12'>12</option>" +
				"<option value='14'>14</option>" +
				"<option value='15'>15</option>" +
				"<option value='16'>16</option>" +
				"<option value='17'>17</option>" +
				"<option value='18'>18</option>" +
				"<option value='19'>19</option>" +
				"<option value='21'>21</option>" +
				"<option value='22'>22</option>" +
				"<option value='48'>48</option>" +
				"<option value='100'>100</option>" +
				"<option value='102'>102</option>" +
				"<option value='103'>103</option>" +
				"<option value='104'>104</option>" +
				"<option value='105'>105</option>") :
				tp_revestimento == "SPACER" ?
			   ("<option value='00'>00 - cor a definir</option>" +
				"<option value='68'>68</option>" +
				"<option value='69'>69</option>" +
				"<option value='78'>78</option>") :
				tp_revestimento == "KT" ?
				("<option value='00'>00 - cor a definir</option>" +
				"<option value='25'>K-25AM</option>" +
				"<option value='200'>K-200AM</option>" +
				"<option value='134'>K-134AZ</option>" +
				"<option value='984'>K-984AZ</option>" +
				"<option value='136'>K-136AZ</option>" +
				"<option value='137'>K-137AZ</option>" +
				"<option value='124'>K-124BG</option>" +
				"<option value='125'>K-125BG</option>" +
				"<option value='121'>K-121BR</option>" +
				"<option value='204'>K-204CZ</option>" +
				"<option value='122'>K-122CZ</option>" +
				"<option value='902'>K-902LJ</option>" +
				"<option value='126'>K-126MR</option>" +
				"<option value='123'>K-123PT</option>" +
				"<option value='127'>K-127RS</option>" +
				"<option value='128'>K-128RX</option>" +
				"<option value='29'>K-29VD</option>" +
				"<option value='26'>K-26VD</option>" +
				"<option value='132'>K-132VD</option>" +
				"<option value='129'>K-129VM</option>" +
				"<option value='130'>K-130VM</option>" +
				"<option value='131'>K-131VM</option>" +
				"<option value='02'>T-02AZ</option>" +
				"<option value='05'>T-05AZ</option>" +
				"<option value='06'>T-06VM</option>" +
				"<option value='07'>T-07VM</option>" +
				"<option value='20'>T-20VD</option>" +
				"<option value='31'>T-31PT</option>" +
				"<option value='61'>T-61RX</option>" +
				"<option value='63'>T-63RS</option>" +
				"<option value='65'>T-65AZ</option>" +
				"<option value='67'>T-67VD</option>" +
				"<option value='32'>T-32CZ</option>" +
				"<option value='111'>T-111AZ</option>" +
				"<option value='108'>T-108AZ</option>" +
				"<option value='38'>T-38VD</option>" +
				"<option value='106'>T-106VD</option>" +
				"<option value='109'>T-109AZ</option>" +
				"<option value='110'>T-110CZ</option>" +
				"<option value='107'>T-107AZ</option>" +
				"<option value='36'>T-36BG</option>" +
				"<option value='35'>T-35LJ</option>" +
				"<option value='33'>T-33RX</option>" +
				"<option value='37'>T-37MR</option>" +
				"<option value='34'>T-34LJ</option>" +
				"<option value='99'>T-99AM</option>" +
				"<option value='112'>T-112AZ</option>" +
				"<option value='113'>T-113CZ</option>" +
				"<option value='08'>08</option>" +
				"<option value='09'>09</option>") :
				"<option value='00'>00 - cor a definir</option>") +
			"</select>";
}

function somarProdutos() {

	if ($("#bdProdutos tr").length > 0) {

		var pcAgravoProd = 0;
		try {
			pcAgravoProd = $("#agravo").val().trim().replace(".", "").replace(",", ".");
		} catch (err) {
			pcAgravoProd = 0;
		}
		pcAgravoProd = isNaN(pcAgravoProd) ? 0 : parseFloat(pcAgravoProd);
		var vlAssentos = 0;
		var vlMobiliario = 0;
		var vlDivisorias = 0
		var vlArqDeslizante = 0;
		var vlOutros = 0;

		$("#bdProdutos tr").each(function () {

			// aplica o agravo no valor unitário do produto
			var vlUnitProduto = parseFloat($(this).find("[vl_unit]").attr("vl_unit").trim().replace(",", ".")) * (100 + pcAgravoProd) / 100;
			vlUnitProduto = Math.round(vlUnitProduto * 100) / 100;
			var sTmpVl = vlUnitProduto.toString().replace(".", ",");
			if (sTmpVl.indexOf(",") < 0) sTmpVl += ",00";
			else if (sTmpVl.split(",")[1].sTmpVl < 2) sTmpVl += "0";
			$(this).find("[vl_unit]").text(sTmpVl);
			//obtem a quantidade de produtos
			var qtdProduto = $(this).find("input[qtde]").val();
			while (qtdProduto.indexOf(".") > -1) qtdProduto = qtdProduto.replace(".", "");
			qtdProduto = qtdProduto.replace(",", ".");
			if (isNaN(qtdProduto)) qtdProduto = 0;
			// multiplica o valor unitário pela quantidade
			var vlTotalProduto = vlUnitProduto * qtdProduto;
			vlTotalProduto = Math.round(vlTotalProduto * 100) / 100;
			sTmpVl = vlTotalProduto.toString().replace(".", ",")
			if (sTmpVl.indexOf(",") < 0) sTmpVl += ",00";
			else if (sTmpVl.split(",")[1].length < 2) sTmpVl += "0";
			$(this).find("input[vl_total]").val(sTmpVl);
			// acumula o valor multiplicado ao tipo de produto
			switch ($(this).find("input[tp_produto]").attr("tp_produto")) {
				case "ASSENTOS":
					vlAssentos += vlTotalProduto;
					break;
				case "MOBILIARIO":
					vlMobiliario += vlTotalProduto;
					break;
				case "DIVISORIAS":
					vlDivisorias += vlTotalProduto;
					break;
				case "ARQ_DESLIZANTE":
					vlArqDeslizante += vlTotalProduto;
					break;
				default:
					vlOutros += vlTotalProduto;
					break;
			}
		});
		//aplica os valores acumulados à somatoria dos produtos e corrige os arredondamentos
		vlAssentos = Math.round(vlAssentos * 100) / 100;
		vlMobiliario = Math.round(vlMobiliario * 100) / 100;
		vlDivisorias = Math.round(vlDivisorias * 100) / 100;
		vlArqDeslizante = Math.round(vlArqDeslizante * 100) / 100;
		vlOutros = Math.round(vlOutros * 100) / 100;
		$("#vl_assentos").maskMoney('mask', vlAssentos);
		$("#vl_mobiliario").maskMoney('mask', vlMobiliario);
		$("#vl_divisorias").maskMoney('mask', vlDivisorias);
		$("#vl_arq_deslizante").maskMoney('mask', vlArqDeslizante);
		$("#vl_outros").maskMoney('mask', vlOutros);
		$("#vl_assentos, #vl_mobiliario, #vl_divisorias, #vl_arq_deslizante, #vl_outros").each(function () {
			if ($(this).val().indexOf(",") < 0) $(this).val($(this).val() + ",00");
			else if ($(this).val().split(",")[1].length < 2) $(this).val($(this).val() + "0");
			else if ($(this).val().split(",")[1].substr(2, 3) == "999") {
				var vlFloat = parseFloat($(this).val().replace(",", "."));
				vlFloat = Math.round(vlFloat * 100) / 100;
				vlFloat = vlFloat.toString().replace(".", ",");
				if (vlFloat.indexOf(",") < 0) vlFloat += ",00";
				else if (vlFloat.split(",")[1].length < 2) vlFloat += "0";
				$(this).val(vlFloat);
			}
		});
	}
}

function removerProduto(divBtn) {
	$(divBtn).parent().parent().remove();
	calcular();
}