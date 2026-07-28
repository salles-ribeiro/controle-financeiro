const repositorioDeCategorias = require('../repositorios/repositorioDeCategorias');

async function listarCategoriasDoUsuarioAutenticado(requisicao, resposta) {
  const categorias = await repositorioDeCategorias.listarCategoriasDoUsuario(requisicao.usuarioAutenticadoId);
  return resposta.status(200).json({ categorias });
}

async function criarNovaCategoria(requisicao, resposta) {
  const { nomeDaCategoria, corDeExibicao } = requisicao.body;

  if (!nomeDaCategoria || !nomeDaCategoria.trim()) {
    return resposta.status(400).json({ mensagemDeErro: 'Informe o nome da categoria.' });
  }

  try {
    const novaCategoria = await repositorioDeCategorias.criarNovaCategoria({
      usuarioId: requisicao.usuarioAutenticadoId,
      nomeDaCategoria: nomeDaCategoria.trim(),
      corDeExibicao,
    });
    return resposta.status(201).json({ categoria: novaCategoria });
  } catch (erroAoCriarCategoria) {
    return resposta.status(409).json({ mensagemDeErro: 'Você já possui uma categoria com este nome.' });
  }
}

async function excluirCategoriaExistente(requisicao, resposta) {
  const categoriaFoiExcluida = await repositorioDeCategorias.excluirCategoria(
    requisicao.params.id,
    requisicao.usuarioAutenticadoId
  );

  if (!categoriaFoiExcluida) {
    return resposta.status(404).json({ mensagemDeErro: 'Categoria não encontrada.' });
  }

  return resposta.status(204).send();
}

module.exports = {
  listarCategoriasDoUsuarioAutenticado,
  criarNovaCategoria,
  excluirCategoriaExistente,
};
