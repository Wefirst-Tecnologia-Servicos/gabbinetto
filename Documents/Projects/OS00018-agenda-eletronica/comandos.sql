$("#cep-pernoite").val("{{condutor.cep_pernoite}}").change().blur(); 
$("#placa").val("{{veiculo.placa}}").change().blur(); 
$("#chassi").val("{{veiculo.chassi}}").change().blur(); 
if ("{{veiculo.chassi_remarcado}}"=="true") $("[name=Ind_Chassi_Remarcado]")[0].click(); 
else $("[name=Ind_Chassi_Remarcado]")[1].click(); 
$("#Ind_Veiculo_Financiado").val({{veiculo.financiado}} ? 1 : 2); 
var vlIsencao = 2; 
if ("{{seguro.cd_isencao}}" == "1" || "{{seguro.cd_isencao}}" == "2" || "{{seguro.cd_isencao}}" == "3") { 
 if ("{{condutor.cdUso}}" == "P") vlIsencao = 1; 
 if ("{{condutor.cdUso}}" == "O") vlIsencao = 4; 
} 
$("#IndPessoaDeficiencia").val(vlIsencao).change(); 
$("#CdAntiFurto").val("{{veiculo.rastreador}}".trim() == "" ? "{{veiculo.bloqueador}}".trim() == "" ? 1 : 2 : 3); 
var gas = "{{coberturas.kit_gas.contratar}}" == "N" ? 2 : {{coberturas.kit_gas.valor}} > 0 ? 3 : 1; 
$("#kit-gas").val(gas).change(); 
if (gas == 3) $("#ValISKitGas").val(parseInt({{coberturas.kit_gas.valor}})).change().focus().blur(); 
var blin = "{{coberturas.blindagem.contratar}}" == "N" || {{coberturas.blindagem.valor}} <= 0; 
$("#blindagem" + (blin ? "sim" : "nao"))[0].click(); 
if (blin) $("#ValISBlindagem").val(parseInt({{coberturas.blindagem.valor}})).change().focus().blur(); 
$("#tip-cobertura").val({{seguro.franquia}}); 
if ("{{condutor.cdUso}}" == "A") $("#uso-veiculo").val(29).change(); 
if ("{{condutor.cdUso}}" == "T") $("#uso-veiculo").val(9).change(); 
$("#submit-veiculo").click();