const {
  calcularMesDeReferenciaDaFatura,
  calcularDiferencaEmMesesEntreDoisMesesReferencia,
  formatarNomeDoMesReferenciaParaExibicao,
  gerarListaDeMesesReferenciaAPartirDeHoje,
} = require('../utilitarios/utilitarioDeCalculoDeFatura');

function arredondarParaDuasCasasDecimais(valorNumerico) {
  return Math.round((valorNumerico + Number.EPSILON) * 100) / 100;
}

// Divide o valor total em N parcelas, garantindo que a soma das parcelas
// bata exatamente com o valor total (a última parcela absorve os
// centavos restantes do arredondamento).
function calcularValorDaParcelaIndividual(valorTotalDoGasto, quantidadeDeParcelas, indiceDaParcelaAtualIndexadoEmZero) {
  const valorTotalEmCentavos = Math.round(valorTotalDoGasto * 100);
  const valorBaseDaParcelaEmCentavos = Math.floor(valorTotalEmCentavos / quantidadeDeParcelas);
  const ehAUltimaParcela = indiceDaParcelaAtualIndexadoEmZero === quantidadeDeParcelas - 1;

  if (!ehAUltimaParcela) {
    return valorBaseDaParcelaEmCentavos / 100;
  }

  const totalDistribuidoNasParcelasAnteriores = valorBaseDaParcelaEmCentavos * (quantidadeDeParcelas - 1);
  const valorDaUltimaParcelaEmCentavos = valorTotalEmCentavos - totalDistribuidoNasParcelasAnteriores;
  return valorDaUltimaParcelaEmCentavos / 100;
}

function calcularContribuicaoDoGastoNoMesReferencia(gasto, mesReferenciaAvaliado, diaDeViradaDoCartao) {
  const mesDeReferenciaInicialDoGasto = calcularMesDeReferenciaDaFatura(
    gasto.dataDaCompraOuContratacao,
    diaDeViradaDoCartao
  );

  if (gasto.tipoDoGasto === 'A_VISTA') {
    return mesReferenciaAvaliado === mesDeReferenciaInicialDoGasto ? gasto.valorTotalDoGasto : 0;
  }

  if (gasto.tipoDoGasto === 'PARCELADO') {
    const indiceDaParcelaNesteMes = calcularDiferencaEmMesesEntreDoisMesesReferencia(
      mesDeReferenciaInicialDoGasto,
      mesReferenciaAvaliado
    );
    const estaDentroDoPeriodoDeParcelamento =
      indiceDaParcelaNesteMes >= 0 && indiceDaParcelaNesteMes < gasto.quantidadeDeParcelas;
    if (!estaDentroDoPeriodoDeParcelamento) return 0;
    return calcularValorDaParcelaIndividual(gasto.valorTotalDoGasto, gasto.quantidadeDeParcelas, indiceDaParcelaNesteMes);
  }

  if (gasto.tipoDoGasto === 'FIXO') {
    const jaComecouNesteMes = mesReferenciaAvaliado >= mesDeReferenciaInicialDoGasto;
    if (!jaComecouNesteMes) return 0;

    if (gasto.dataDeTerminoDaRecorrenciaFixa) {
      const mesDeTerminoDaRecorrencia = calcularMesDeReferenciaDaFatura(
        gasto.dataDeTerminoDaRecorrenciaFixa,
        diaDeViradaDoCartao
      );
      if (mesReferenciaAvaliado > mesDeTerminoDaRecorrencia) return 0;
    }

    return gasto.valorMensalDoGastoFixo;
  }

  return 0;
}

function calcularContribuicaoDaReceitaNoMesReferencia(receita, mesReferenciaAvaliado, diaDeViradaDoCartao) {
  const mesDeReferenciaInicialDaReceita = calcularMesDeReferenciaDaFatura(
    receita.dataDoRecebimentoOuInicio,
    diaDeViradaDoCartao
  );

  if (receita.tipoDaReceita === 'VARIAVEL') {
    return mesReferenciaAvaliado === mesDeReferenciaInicialDaReceita ? receita.valorDaReceitaVariavel : 0;
  }

  if (receita.tipoDaReceita === 'FIXA') {
    const jaComecouNesteMes = mesReferenciaAvaliado >= mesDeReferenciaInicialDaReceita;
    if (!jaComecouNesteMes) return 0;

    if (receita.dataDeTerminoDaRecorrenciaFixa) {
      const mesDeTerminoDaRecorrencia = calcularMesDeReferenciaDaFatura(
        receita.dataDeTerminoDaRecorrenciaFixa,
        diaDeViradaDoCartao
      );
      if (mesReferenciaAvaliado > mesDeTerminoDaRecorrencia) return 0;
    }

    return receita.valorMensalDaReceitaFixa;
  }

  return 0;
}

// Uma linha só faz sentido aparecer se ela contribuir em pelo menos um dos
// meses exibidos; caso contrário (ex.: parcelamento cujas parcelas já
// terminaram antes do período consultado) ela não deveria mais ocupar
// espaço na tela.
function possuiAlgumValorNaoNuloNosMesesExibidos(valoresPorMesReferencia) {
  return Object.values(valoresPorMesReferencia).some((valor) => valor !== 0);
}

function gerarProjecaoFinanceiraCompleta({
  diaDeViradaDoCartao,
  possuiRegistroDeRendaMensal,
  listaDeGastosAtivos,
  listaDeReceitasAtivas,
  quantidadeDeMesesAFrente,
  quantidadeDeMesesParaTras = 0,
}) {
  const listaDeMesesReferencia = gerarListaDeMesesReferenciaAPartirDeHoje(
    quantidadeDeMesesAFrente,
    diaDeViradaDoCartao,
    quantidadeDeMesesParaTras
  );

  const detalhamentoPorGasto = listaDeGastosAtivos
    .map((gasto) => {
      const valoresPorMesReferencia = {};
      listaDeMesesReferencia.forEach((mesReferencia) => {
        valoresPorMesReferencia[mesReferencia] = arredondarParaDuasCasasDecimais(
          calcularContribuicaoDoGastoNoMesReferencia(gasto, mesReferencia, diaDeViradaDoCartao)
        );
      });
      return { ...gasto, valoresPorMesReferencia };
    })
    .filter((gasto) => possuiAlgumValorNaoNuloNosMesesExibidos(gasto.valoresPorMesReferencia));

  const detalhamentoPorReceita = possuiRegistroDeRendaMensal
    ? listaDeReceitasAtivas
        .map((receita) => {
          const valoresPorMesReferencia = {};
          listaDeMesesReferencia.forEach((mesReferencia) => {
            valoresPorMesReferencia[mesReferencia] = arredondarParaDuasCasasDecimais(
              calcularContribuicaoDaReceitaNoMesReferencia(receita, mesReferencia, diaDeViradaDoCartao)
            );
          });
          return { ...receita, valoresPorMesReferencia };
        })
        .filter((receita) => possuiAlgumValorNaoNuloNosMesesExibidos(receita.valoresPorMesReferencia))
    : [];

  const resumoMensal = listaDeMesesReferencia.map((mesReferencia) => {
    const totalDeGastosNoMes = detalhamentoPorGasto.reduce(
      (somaAcumulada, gasto) => somaAcumulada + gasto.valoresPorMesReferencia[mesReferencia],
      0
    );

    const totalDeReceitasNoMes = possuiRegistroDeRendaMensal
      ? detalhamentoPorReceita.reduce(
          (somaAcumulada, receita) => somaAcumulada + receita.valoresPorMesReferencia[mesReferencia],
          0
        )
      : null;

    return {
      mesReferencia,
      nomeDoMesFormatadoParaExibicao: formatarNomeDoMesReferenciaParaExibicao(mesReferencia),
      totalDeGastosNoMes: arredondarParaDuasCasasDecimais(totalDeGastosNoMes),
      totalDeReceitasNoMes: totalDeReceitasNoMes !== null ? arredondarParaDuasCasasDecimais(totalDeReceitasNoMes) : null,
      saldoPrevistoNoMes:
        totalDeReceitasNoMes !== null ? arredondarParaDuasCasasDecimais(totalDeReceitasNoMes - totalDeGastosNoMes) : null,
    };
  });

  return {
    listaDeMesesReferencia,
    resumoMensal,
    detalhamentoPorGasto,
    detalhamentoPorReceita,
  };
}

module.exports = { gerarProjecaoFinanceiraCompleta };
