const identificadorUnicoUniversal = require('node:crypto');
const { conexaoComBancoDeDados } = require('../configuracao/conexaoComBancoDeDados');

const CATEGORIAS_PADRAO_CRIADAS_NO_CADASTRO = [
  { nomeDaCategoria: 'Moradia', corDeExibicao: '#C9A25D' },
  { nomeDaCategoria: 'Alimentação', corDeExibicao: '#4FBF8B' },
  { nomeDaCategoria: 'Transporte', corDeExibicao: '#5B9BD5' },
  { nomeDaCategoria: 'Saúde', corDeExibicao: '#E0665A' },
  { nomeDaCategoria: 'Lazer', corDeExibicao: '#A78BDA' },
  { nomeDaCategoria: 'Outros', corDeExibicao: '#8B96A3' },
];

function converterLinhaDaCategoriaParaObjeto(linhaDoBanco) {
  if (!linhaDoBanco) return null;
  return {
    id: linhaDoBanco.id,
    usuarioId: linhaDoBanco.usuarioId,
    nomeDaCategoria: linhaDoBanco.nomeDaCategoria,
    corDeExibicao: linhaDoBanco.corDeExibicao,
  };
}

async function criarCategoriasPadraoParaUsuario(usuarioId) {
  for (const categoriaPadrao of CATEGORIAS_PADRAO_CRIADAS_NO_CADASTRO) {
    await criarNovaCategoria({ usuarioId, ...categoriaPadrao });
  }
}

async function criarNovaCategoria({ usuarioId, nomeDaCategoria, corDeExibicao }) {
  const identificadorDaNovaCategoria = identificadorUnicoUniversal.randomUUID();

  await conexaoComBancoDeDados.execute({
    sql: `
      INSERT INTO categorias_de_gasto (id, usuarioId, nomeDaCategoria, corDeExibicao)
      VALUES (:id, :usuarioId, :nomeDaCategoria, :corDeExibicao)
    `,
    args: {
      id: identificadorDaNovaCategoria,
      usuarioId,
      nomeDaCategoria,
      corDeExibicao: corDeExibicao || '#C9A25D',
    },
  });

  return buscarCategoriaPorIdEUsuario(identificadorDaNovaCategoria, usuarioId);
}

async function listarCategoriasDoUsuario(usuarioId) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: 'SELECT * FROM categorias_de_gasto WHERE usuarioId = :usuarioId ORDER BY nomeDaCategoria ASC',
    args: { usuarioId },
  });
  return resultado.rows.map(converterLinhaDaCategoriaParaObjeto);
}

async function buscarCategoriaPorIdEUsuario(id, usuarioId) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: 'SELECT * FROM categorias_de_gasto WHERE id = :id AND usuarioId = :usuarioId',
    args: { id, usuarioId },
  });
  return converterLinhaDaCategoriaParaObjeto(resultado.rows[0]);
}

async function excluirCategoria(id, usuarioId) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: 'DELETE FROM categorias_de_gasto WHERE id = :id AND usuarioId = :usuarioId',
    args: { id, usuarioId },
  });
  return Number(resultado.rowsAffected) > 0;
}

module.exports = {
  criarCategoriasPadraoParaUsuario,
  criarNovaCategoria,
  listarCategoriasDoUsuario,
  buscarCategoriaPorIdEUsuario,
  excluirCategoria,
};
