const identificadorUnicoUniversal = require('node:crypto');
const { conexaoComBancoDeDados } = require('../configuracao/conexaoComBancoDeDados');

function converterLinhaDaReceitaParaObjeto(linhaDoBanco) {
  if (!linhaDoBanco) return null;
  return {
    id: linhaDoBanco.id,
    usuarioId: linhaDoBanco.usuarioId,
    descricaoDaReceita: linhaDoBanco.descricaoDaReceita,
    tipoDaReceita: linhaDoBanco.tipoDaReceita,
    valorMensalDaReceitaFixa: linhaDoBanco.valorMensalDaReceitaFixa,
    valorDaReceitaVariavel: linhaDoBanco.valorDaReceitaVariavel,
    dataDoRecebimentoOuInicio: linhaDoBanco.dataDoRecebimentoOuInicio,
    dataDeTerminoDaRecorrenciaFixa: linhaDoBanco.dataDeTerminoDaRecorrenciaFixa,
    receitaAtiva: Boolean(linhaDoBanco.receitaAtiva),
    dataDeCriacaoDoRegistro: linhaDoBanco.dataDeCriacaoDoRegistro,
    dataDaUltimaAtualizacao: linhaDoBanco.dataDaUltimaAtualizacao,
  };
}

async function criarNovaReceita({
  usuarioId,
  descricaoDaReceita,
  tipoDaReceita,
  valorMensalDaReceitaFixa,
  valorDaReceitaVariavel,
  dataDoRecebimentoOuInicio,
  dataDeTerminoDaRecorrenciaFixa,
}) {
  const identificadorDaNovaReceita = identificadorUnicoUniversal.randomUUID();
  const dataAtualEmFormatoIso = new Date().toISOString();

  await conexaoComBancoDeDados.execute({
    sql: `
      INSERT INTO receitas (
        id, usuarioId, descricaoDaReceita, tipoDaReceita,
        valorMensalDaReceitaFixa, valorDaReceitaVariavel,
        dataDoRecebimentoOuInicio, dataDeTerminoDaRecorrenciaFixa,
        receitaAtiva, dataDeCriacaoDoRegistro, dataDaUltimaAtualizacao
      ) VALUES (
        :id, :usuarioId, :descricaoDaReceita, :tipoDaReceita,
        :valorMensalDaReceitaFixa, :valorDaReceitaVariavel,
        :dataDoRecebimentoOuInicio, :dataDeTerminoDaRecorrenciaFixa,
        1, :dataDeCriacaoDoRegistro, :dataDaUltimaAtualizacao
      )
    `,
    args: {
      id: identificadorDaNovaReceita,
      usuarioId,
      descricaoDaReceita,
      tipoDaReceita,
      valorMensalDaReceitaFixa: valorMensalDaReceitaFixa ?? null,
      valorDaReceitaVariavel: valorDaReceitaVariavel ?? null,
      dataDoRecebimentoOuInicio,
      dataDeTerminoDaRecorrenciaFixa: dataDeTerminoDaRecorrenciaFixa || null,
      dataDeCriacaoDoRegistro: dataAtualEmFormatoIso,
      dataDaUltimaAtualizacao: dataAtualEmFormatoIso,
    },
  });

  return buscarReceitaPorIdEUsuario(identificadorDaNovaReceita, usuarioId);
}

async function listarReceitasAtivasDoUsuario(usuarioId) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: `
      SELECT * FROM receitas
      WHERE usuarioId = :usuarioId AND receitaAtiva = 1
      ORDER BY dataDoRecebimentoOuInicio DESC
    `,
    args: { usuarioId },
  });
  return resultado.rows.map(converterLinhaDaReceitaParaObjeto);
}

async function buscarReceitaPorIdEUsuario(id, usuarioId) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: 'SELECT * FROM receitas WHERE id = :id AND usuarioId = :usuarioId',
    args: { id, usuarioId },
  });
  return converterLinhaDaReceitaParaObjeto(resultado.rows[0]);
}

async function atualizarReceita(id, usuarioId, dadosParaAtualizar) {
  const receitaExistente = await buscarReceitaPorIdEUsuario(id, usuarioId);
  if (!receitaExistente) return null;

  const dadosFinais = { ...receitaExistente, ...dadosParaAtualizar };
  const dataAtualEmFormatoIso = new Date().toISOString();

  await conexaoComBancoDeDados.execute({
    sql: `
      UPDATE receitas SET
        descricaoDaReceita = :descricaoDaReceita,
        tipoDaReceita = :tipoDaReceita,
        valorMensalDaReceitaFixa = :valorMensalDaReceitaFixa,
        valorDaReceitaVariavel = :valorDaReceitaVariavel,
        dataDoRecebimentoOuInicio = :dataDoRecebimentoOuInicio,
        dataDeTerminoDaRecorrenciaFixa = :dataDeTerminoDaRecorrenciaFixa,
        dataDaUltimaAtualizacao = :dataDaUltimaAtualizacao
      WHERE id = :id AND usuarioId = :usuarioId
    `,
    args: {
      id,
      usuarioId,
      descricaoDaReceita: dadosFinais.descricaoDaReceita,
      tipoDaReceita: dadosFinais.tipoDaReceita,
      valorMensalDaReceitaFixa: dadosFinais.valorMensalDaReceitaFixa ?? null,
      valorDaReceitaVariavel: dadosFinais.valorDaReceitaVariavel ?? null,
      dataDoRecebimentoOuInicio: dadosFinais.dataDoRecebimentoOuInicio,
      dataDeTerminoDaRecorrenciaFixa: dadosFinais.dataDeTerminoDaRecorrenciaFixa || null,
      dataDaUltimaAtualizacao: dataAtualEmFormatoIso,
    },
  });

  return buscarReceitaPorIdEUsuario(id, usuarioId);
}

async function excluirReceita(id, usuarioId) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: `
      UPDATE receitas SET receitaAtiva = 0, dataDaUltimaAtualizacao = :dataDaUltimaAtualizacao
      WHERE id = :id AND usuarioId = :usuarioId
    `,
    args: {
      id,
      usuarioId,
      dataDaUltimaAtualizacao: new Date().toISOString(),
    },
  });
  return Number(resultado.rowsAffected) > 0;
}

module.exports = {
  criarNovaReceita,
  listarReceitasAtivasDoUsuario,
  buscarReceitaPorIdEUsuario,
  atualizarReceita,
  excluirReceita,
};
