// Este arquivo concentra toda a regra de negócio da "virada do cartão":
// se a compra/contratação acontece DEPOIS do dia de virada configurado
// pelo usuário, ela só entra na fatura do mês seguinte. Por isso o dia
// logo após a virada costuma ser o "melhor dia de compra" (maior prazo
// para pagar).
//
// "mesReferencia" é sempre representado como uma string no formato
// "AAAA-MM" (ano de 4 dígitos, mês de 2 dígitos), o que facilita
// comparação, ordenação e uso como chave de objeto.

const NOMES_DOS_MESES_EM_PORTUGUES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatarAnoEMesComoMesReferencia(anoComQuatroDigitos, mesIndexadoEmZero) {
  const mesComDoisDigitos = String(mesIndexadoEmZero + 1).padStart(2, '0');
  return `${anoComQuatroDigitos}-${mesComDoisDigitos}`;
}

function calcularMesDeReferenciaDaFatura(dataDoEventoEmTextoIso, diaDeViradaDoCartao) {
  const dataDoEvento = new Date(dataDoEventoEmTextoIso);
  const diaDoEvento = dataDoEvento.getUTCDate();

  let mesDeReferenciaIndexadoEmZero = dataDoEvento.getUTCMonth();
  let anoDeReferencia = dataDoEvento.getUTCFullYear();

  if (diaDoEvento > diaDeViradaDoCartao) {
    mesDeReferenciaIndexadoEmZero += 1;
    if (mesDeReferenciaIndexadoEmZero > 11) {
      mesDeReferenciaIndexadoEmZero = 0;
      anoDeReferencia += 1;
    }
  }

  return formatarAnoEMesComoMesReferencia(anoDeReferencia, mesDeReferenciaIndexadoEmZero);
}

function adicionarMesesAoMesReferencia(mesReferencia, quantidadeDeMesesAAdicionar) {
  const [anoEmTexto, mesEmTexto] = mesReferencia.split('-');
  let anoResultante = parseInt(anoEmTexto, 10);
  let mesResultanteIndexadoEmZero = parseInt(mesEmTexto, 10) - 1 + quantidadeDeMesesAAdicionar;

  while (mesResultanteIndexadoEmZero > 11) {
    mesResultanteIndexadoEmZero -= 12;
    anoResultante += 1;
  }
  while (mesResultanteIndexadoEmZero < 0) {
    mesResultanteIndexadoEmZero += 12;
    anoResultante -= 1;
  }

  return formatarAnoEMesComoMesReferencia(anoResultante, mesResultanteIndexadoEmZero);
}

function calcularDiferencaEmMesesEntreDoisMesesReferencia(mesReferenciaInicial, mesReferenciaFinal) {
  const [anoInicial, mesInicial] = mesReferenciaInicial.split('-').map(Number);
  const [anoFinal, mesFinal] = mesReferenciaFinal.split('-').map(Number);
  return (anoFinal - anoInicial) * 12 + (mesFinal - mesInicial);
}

function formatarNomeDoMesReferenciaParaExibicao(mesReferencia) {
  const [anoEmTexto, mesEmTexto] = mesReferencia.split('-');
  const nomeDoMes = NOMES_DOS_MESES_EM_PORTUGUES[parseInt(mesEmTexto, 10) - 1];
  return `${nomeDoMes}/${anoEmTexto}`;
}

// "quantidadeDeMesesParaTras" permite estender a lista para meses ANTES de
// hoje (histórico). Por exemplo, com quantidadeDeMesesParaTras=3 e
// quantidadeDeMesesAFrente=0, a lista contém os 3 meses anteriores ao atual.
function gerarListaDeMesesReferenciaAPartirDeHoje(quantidadeDeMesesAFrente, diaDeViradaDoCartao, quantidadeDeMesesParaTras = 0) {
  const mesReferenciaDeHoje = calcularMesDeReferenciaDaFatura(new Date().toISOString(), diaDeViradaDoCartao);
  const listaDeMesesReferencia = [];
  for (let indiceDoMes = -quantidadeDeMesesParaTras; indiceDoMes < quantidadeDeMesesAFrente; indiceDoMes += 1) {
    listaDeMesesReferencia.push(adicionarMesesAoMesReferencia(mesReferenciaDeHoje, indiceDoMes));
  }
  return listaDeMesesReferencia;
}

module.exports = {
  calcularMesDeReferenciaDaFatura,
  adicionarMesesAoMesReferencia,
  calcularDiferencaEmMesesEntreDoisMesesReferencia,
  formatarNomeDoMesReferenciaParaExibicao,
  gerarListaDeMesesReferenciaAPartirDeHoje,
};
