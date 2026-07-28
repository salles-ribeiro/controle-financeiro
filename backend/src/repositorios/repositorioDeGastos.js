const identificadorUnicoUniversal = require('node:crypto');
const { conexaoComBancoDeDados } = require('../configuracao/conexaoComBancoDeDados');

function converterLinhaDoGastoParaObjeto(linhaDoBanco) {
  if (!linhaDoBanco) return null;
  return {
    id: linhaDoBanco.id,
    usuarioId: linhaDoBanco.usuarioId,
    categoriaId: linhaDoBanco.categoriaId,
    nomeDaCategoria: linhaDoBanco.nomeDaCategoria || null,
    corDeExibicaoDaCategoria: linhaDoBanco.corDeExibicao || null,
    descricaoDoGasto: linhaDoBanco.descricaoDoGasto,
    tipoDoGasto: linhaDoBanco.tipoDoGasto,
    valorTotalDoGasto: linhaDoBanco.valorTotalDoGasto,
    valorMensalDoGastoFixo: linhaDoBanco.valorMensalDoGastoFixo,
    quantidadeDeParcelas: linhaDoBanco.quantidadeDeParcelas,
    dataDaCompraOuContratacao: linhaDoBanco.dataDaCompraOuContratacao,
    dataDeTerminoDaRecorrenciaFixa: linhaDoBanco.dataDeTerminoDaRecorrenciaFixa,
    gastoAtivo: Boolean(linhaDoBanco.gastoAtivo),
    dataDeCriacaoDoRegistro: linhaDoBanco.dataDeCriacaoDoRegistro,
    dataDaUltimaAtualizacao: linhaDoBanco.dataDaUltimaAtualizacao,
  };
}

const TRECHO_SQL_COM_JUNCAO_DE_CATEGORIA = `
  SELECT gastos.*, categorias_de_gasto.nomeDaCategoria, categorias_de_gasto.corDeExibicao
  FROM gastos
  LEFT JOIN categorias_de_gasto ON categorias_de_gasto.id = gastos.categoriaId
`;

async function criarNovoGasto({
  usuarioId,
  categoriaId,
  descricaoDoGasto,
  tipoDoGasto,
  valorTotalDoGasto,
  valorMensalDoGastoFixo,
  quantidadeDeParcelas,
  dataDaCompraOuContratacao,
  dataDeTerminoDaRecorrenciaFixa,
}) {
  const identificadorDoNovoGasto = identificadorUnicoUniversal.randomUUID();
  const dataAtualEmFormatoIso = new Date().toISOString();

  await conexaoComBancoDeDados.execute({
    sql: `
      INSERT INTO gastos (
        id, usuarioId, categoriaId, descricaoDoGasto, tipoDoGasto,
        valorTotalDoGasto, valorMensalDoGastoFixo, quantidadeDeParcelas,
        dataDaCompraOuContratacao, dataDeTerminoDaRecorrenciaFixa,
        gastoAtivo, dataDeCriacaoDoRegistro, dataDaUltimaAtualizacao
      ) VALUES (
        :id, :usuarioId, :categoriaId, :descricaoDoGasto, :tipoDoGasto,
        :valorTotalDoGasto, :valorMensalDoGastoFixo, :quantidadeDeParcelas,
        :dataDaCompraOuContratacao, :dataDeTerminoDaRecorrenciaFixa,
        1, :dataDeCriacaoDoRegistro, :dataDaUltimaAtualizacao
      )
    `,
    args: {
      id: identificadorDoNovoGasto,
      usuarioId,
      categoriaId: categoriaId || null,
      descricaoDoGasto,
      tipoDoGasto,
      valorTotalDoGasto: valorTotalDoGasto ?? null,
      valorMensalDoGastoFixo: valorMensalDoGastoFixo ?? null,
      quantidadeDeParcelas: quantidadeDeParcelas ?? null,
      dataDaCompraOuContratacao,
      dataDeTerminoDaRecorrenciaFixa: dataDeTerminoDaRecorrenciaFixa || null,
      dataDeCriacaoDoRegistro: dataAtualEmFormatoIso,
      dataDaUltimaAtualizacao: dataAtualEmFormatoIso,
    },
  });

  return buscarGastoPorIdEUsuario(identificadorDoNovoGasto, usuarioId);
}

async function listarGastosAtivosDoUsuario(usuarioId) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: `
      ${TRECHO_SQL_COM_JUNCAO_DE_CATEGORIA}
      WHERE gastos.usuarioId = :usuarioId AND gastos.gastoAtivo = 1
      ORDER BY gastos.dataDaCompraOuContratacao DESC
    `,
    args: { usuarioId },
  });
  return resultado.rows.map(converterLinhaDoGastoParaObjeto);
}

async function buscarGastoPorIdEUsuario(id, usuarioId) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: `
      ${TRECHO_SQL_COM_JUNCAO_DE_CATEGORIA}
      WHERE gastos.id = :id AND gastos.usuarioId = :usuarioId
    `,
    args: { id, usuarioId },
  });
  return converterLinhaDoGastoParaObjeto(resultado.rows[0]);
}

async function atualizarGasto(id, usuarioId, dadosParaAtualizar) {
  const gastoExistente = await buscarGastoPorIdEUsuario(id, usuarioId);
  if (!gastoExistente) return null;

  const dadosFinais = { ...gastoExistente, ...dadosParaAtualizar };
  const dataAtualEmFormatoIso = new Date().toISOString();

  await conexaoComBancoDeDados.execute({
    sql: `
      UPDATE gastos SET
        categoriaId = :categoriaId,
        descricaoDoGasto = :descricaoDoGasto,
        tipoDoGasto = :tipoDoGasto,
        valorTotalDoGasto = :valorTotalDoGasto,
        valorMensalDoGastoFixo = :valorMensalDoGastoFixo,
        quantidadeDeParcelas = :quantidadeDeParcelas,
        dataDaCompraOuContratacao = :dataDaCompraOuContratacao,
        dataDeTerminoDaRecorrenciaFixa = :dataDeTerminoDaRecorrenciaFixa,
        dataDaUltimaAtualizacao = :dataDaUltimaAtualizacao
      WHERE id = :id AND usuarioId = :usuarioId
    `,
    args: {
      id,
      usuarioId,
      categoriaId: dadosFinais.categoriaId || null,
      descricaoDoGasto: dadosFinais.descricaoDoGasto,
      tipoDoGasto: dadosFinais.tipoDoGasto,
      valorTotalDoGasto: dadosFinais.valorTotalDoGasto ?? null,
      valorMensalDoGastoFixo: dadosFinais.valorMensalDoGastoFixo ?? null,
      quantidadeDeParcelas: dadosFinais.quantidadeDeParcelas ?? null,
      dataDaCompraOuContratacao: dadosFinais.dataDaCompraOuContratacao,
      dataDeTerminoDaRecorrenciaFixa: dadosFinais.dataDeTerminoDaRecorrenciaFixa || null,
      dataDaUltimaAtualizacao: dataAtualEmFormatoIso,
    },
  });

  return buscarGastoPorIdEUsuario(id, usuarioId);
}

async function excluirGasto(id, usuarioId) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: `
      UPDATE gastos SET gastoAtivo = 0, dataDaUltimaAtualizacao = :dataDaUltimaAtualizacao
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
  criarNovoGasto,
  listarGastosAtivosDoUsuario,
  buscarGastoPorIdEUsuario,
  atualizarGasto,
  excluirGasto,
};
