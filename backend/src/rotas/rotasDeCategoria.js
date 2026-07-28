const expressFramework = require('express');
const controladorDeCategoria = require('../controladores/controladorDeCategoria');
const autenticacaoMiddleware = require('../middlewares/autenticacaoMiddleware');

const roteador = expressFramework.Router();

roteador.use(autenticacaoMiddleware);
roteador.get('/', controladorDeCategoria.listarCategoriasDoUsuarioAutenticado);
roteador.post('/', controladorDeCategoria.criarNovaCategoria);
roteador.delete('/:id', controladorDeCategoria.excluirCategoriaExistente);

module.exports = roteador;
