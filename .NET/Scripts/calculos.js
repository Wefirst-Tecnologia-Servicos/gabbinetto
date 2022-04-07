/*
 * Cálculos utilizados nas páginas de propostas e pedidos;
 * 
 * [Data]      [Responsável]    [Descrição]
 * 02/07/2021  Victor Prospero  - Criação.
 * 
 */

// ------------------------------ Prototypes ------------------------------ //

var _AVista = false;

Number.prototype.arredondar = function (casasDecimais) {
    var constanteArredondamento = 10 ** casasDecimais;
    var resultadoCalculado = Math.round(this * constanteArredondamento) / constanteArredondamento;
    return resultadoCalculado;
}
Number.prototype.aplicarPercentual = function (percentual) {
    var resultadoCalculado = this * percentual / 100;
    return resultadoCalculado.arredondar(2);
}
Number.prototype.formatarMoeda = function () {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'USD',
    }).format(this).replace("US$", "R$");
}

// ------------------------- Mapeamento de Campos ------------------------- //

var dicionarioCampos = {
    inputs: {
        exportacao: "#exportacao",
        divisaoNfServico: "#nf_servico",
        produtos: ["assentos", "mobiliario", "divisorias", "arq_deslizante", "outros"],
        descontos: "#desconto, #desconto_arquiteto, #desconto_servico, #desconto_a_vista",
        fm: "#vl_entrega, #vl_montagem, #vl_taxa_urgencia",
        forma_pagamento: {
            fm: "#cod_fopag_nf_fm",
            produtos: "#cod_fopag"
        }
    },
    resultados: {
        total_sem_ipi: "#vl_total_sem_ipi",
        total_com_ipi: "#vl_total_com_ipi",
        total_sem_ipi_desc: "",
        total_com_ipi_desc: "#vl_total_com_ipi_desc",
        tipo_nf_servico: "#nf_servico",
        total_venda: "#vl_venda",
        total_servico: "#vl_servico",
        total_fm: "#vl_total_nf_fm",
        porcentagem_venda: "#percent_venda",
        porcentagem_servico: "#percent_servico",
        forma_pagamento: {
            fm: "#table_parc_fm tr td center",
            produtos: "#table_parc tr td center"
        }
    }
};

// ------------------------------- Cálculos ------------------------------- //

function calcularTudo() {
    // valores dos produtos
    var totalSemDesconto   = obterTotal();
    var totalComDesconto   = obterTotalComDescontos(totalSemDesconto);
    var totalVendaServico  = obterTotalVendaServico(totalComDesconto);
    var parcelasCalculadas = obterParcelamento("PRODUTOS", totalVendaServico);
    _AVista = parcelasCalculadas.length < 2;
    // valores de FM
    var totalFM = obterTotalFM();
    obterParcelamento("FM", totalFM);
}
// aplica um valor decimal a um campo do tipo moeda
function aplicarValorMoeda(seletor, valor) {
    if (seletor != "") $(seletor).maskMoney('mask', valor);
}
// obtem uma constante que representa a aplicação de todos os descontos
function obterFatorDesconto() {
    var fatorCalculado = 1;
    var $camposDesconto = $(dicionarioCampos.inputs.descontos);
    for (var iCampoDesc = 0; iCampoDesc < $camposDesconto.length; iCampoDesc++) {
        var $campoDesconto = $($camposDesconto[iCampoDesc]);
        var descontoPreenchido = $campoDesconto.val();
        if (descontoPreenchido.trim() == "") $campoDesconto.val(0);
        else fatorCalculado *= (100 - parseFloat(descontoPreenchido.replace(",", "."))) / 100;
    }
    return fatorCalculado;
}
// calcula o valor total de NF FM
function obterTotalFM() {
    var valorTotalFM = 0;
    var $camposFM = $(dicionarioCampos.inputs.fm);
    for (var iCampoFM = 0; iCampoFM < $camposFM.length; iCampoFM++) {
        var $campoFM = $($camposFM[iCampoFM]);
        if ($campoFM.val().trim() == "") $campoFM.maskMoney(0);
        else valorTotalFM += parseFloat($campoFM.maskMoney('unmasked')[0]);
    }
    valorTotalFM = valorTotalFM.arredondar(2);
    aplicarValorMoeda(dicionarioCampos.resultados.total_fm, valorTotalFM);
    return valorTotalFM;
}
// calcula o total sem desconto
// retorno: { comIpi: decimal semIpi: decimal }
function obterTotal() {
    var resultadoCalculado = {
        comIpi: 0,
        semIpi: 0
    };
    var ehExportacao = $(dicionarioCampos.inputs.exportacao).val() == "1";
    for (var iTipoProduto = 0; iTipoProduto < dicionarioCampos.inputs.produtos.length; iTipoProduto++) {
        var tipoProduto   = dicionarioCampos.inputs.produtos[iTipoProduto];
        var $campoProduto = $("#vl_" + tipoProduto);
        var $campoIpi     = $("#ipi_" + tipoProduto);
        if ($campoProduto.val().trim() == "") $campoProduto.maskMoney(0);
        else {
            var valorProduto = parseFloat($campoProduto.maskMoney('unmasked')[0]);
            var fatorIpi = ehExportacao ? 0 : (0 + parseFloat($campoIpi.val()) / 100);
            fatorIpi = (fatorIpi * obterPercentualVenda() / 100).arredondar(4);
            fatorIpi += 1;
            resultadoCalculado.semIpi += valorProduto;
            resultadoCalculado.comIpi += valorProduto * fatorIpi;
        }
    }
    resultadoCalculado.comIpi = resultadoCalculado.comIpi.arredondar(2);
    resultadoCalculado.semIpi = resultadoCalculado.semIpi.arredondar(2);
    aplicarValorMoeda(dicionarioCampos.resultados.total_sem_ipi, resultadoCalculado.semIpi);
    aplicarValorMoeda(dicionarioCampos.resultados.total_com_ipi, resultadoCalculado.comIpi);
    return resultadoCalculado;
}
// calcula o total com desconto
// input e retorno: { comIpi: decimal semIpi: decimal }
function obterTotalComDescontos(valoresCalculados) {
    var fatorDesconto = obterFatorDesconto();
    var resultadoCalculado = {
        comIpi: (valoresCalculados.comIpi * fatorDesconto).arredondar(2),
        semIpi: (valoresCalculados.semIpi * fatorDesconto).arredondar(2)
    }
    aplicarValorMoeda(dicionarioCampos.resultados.total_sem_ipi_desc, resultadoCalculado.semIpi);
    aplicarValorMoeda(dicionarioCampos.resultados.total_com_ipi_desc, resultadoCalculado.comIpi);
    return resultadoCalculado;
}
// busca o percentual de venda
function obterPercentualVenda() {
    var percentualVenda = $(dicionarioCampos.inputs.divisaoNfServico + " option:selected").attr("porc_venda");
    if (isNaN(percentualVenda) || percentualVenda == "") percentualVenda = 100;
    else percentualVenda = parseInt(parseFloat(percentualVenda));
    return percentualVenda;
}
// calcula o valor de venda e de serviço
// inputs: { comIpi: decimal semIpi: decimal }
// retorno: { vlTotal: decimal, vlVenda: decimal, vlServico: decimal }
function obterTotalVendaServico(valoresComDesconto) {
    // percentuais
    var percentualVenda = obterPercentualVenda();
    var percentualServico = 100 - percentualVenda;
    $(dicionarioCampos.resultados.porcentagem_venda).empty().append(percentualVenda);
    $(dicionarioCampos.resultados.porcentagem_servico).empty().append(percentualServico);
    // valores
    var valoresCalculados = {
        vlTotal: valoresComDesconto.comIpi,
        vlServico: (valoresComDesconto.semIpi * percentualServico / 100).arredondar(2)
    };
    valoresCalculados.vlVenda = (valoresComDesconto.comIpi - valoresCalculados.vlServico).arredondar(2);
    aplicarValorMoeda(dicionarioCampos.resultados.total_venda, valoresCalculados.vlVenda);
    aplicarValorMoeda(dicionarioCampos.resultados.total_servico, valoresCalculados.vlServico);

    return valoresCalculados;
}
// calcula o parcelamento
// valores: { vlTotal: decimal, vlVenda: decimal, vlServico: decimal } se tipo = PRODUTOS
//            decimal se tipo = FM
// retorno: [ { dias: int, vlTotal: decimal, vlVenda: decimal, vlServico: decimal } ]
function obterParcelamento(tipo, valores) {
    // prepara os dados
    var parcelasCalculadas = [];
    var diasParcelas = [0, 7, 10, 14, 20, 28, 30, 42, 56, 60, 90, 120, 150];
    var $selectedOption = dicionarioCampos.inputs.forma_pagamento.produtos;
    var $camposRetorno = dicionarioCampos.resultados.forma_pagamento.produtos;
    if (tipo == "FM") {
        valores = {
            vlTotal: valores,
            vlVenda: 0,
            vlServico: 0
        };
        $selectedOption = dicionarioCampos.inputs.forma_pagamento.fm;
        $camposRetorno = dicionarioCampos.resultados.forma_pagamento.fm;
    }
    $selectedOption = $($selectedOption + " option:selected");
    $camposRetorno = $($camposRetorno);
    // calcula as parcelas
    for (var iDiasParcela = 0; iDiasParcela < diasParcelas.length; iDiasParcela++) {
        var diasParcela = diasParcelas[iDiasParcela];
        var porcentagemParcela = $selectedOption.attr("dias_" + diasParcela.toString());
        porcentagemParcela = (isNaN(porcentagemParcela) || porcentagemParcela == "") ? 0 : parseFloat(porcentagemParcela);
        if (porcentagemParcela > 0)
            parcelasCalculadas.push({
                dias: diasParcela,
                vlTotal: (valores.vlTotal * porcentagemParcela / 100).arredondar(2),
                vlVenda: (valores.vlVenda * porcentagemParcela / 100).arredondar(2),
                vlServico: (valores.vlServico * porcentagemParcela / 100).arredondar(2)
            });
    }
    // retorno
    $camposRetorno.empty().append("&nbsp;");
    for (var iParc = 0; iParc < $camposRetorno.length; iParc++) {
        if (iParc >= parcelasCalculadas.length) break;
        $($camposRetorno[iParc]).empty().append(parcelasCalculadas[iParc].vlTotal.formatarMoeda());
    }
    return parcelasCalculadas;
}