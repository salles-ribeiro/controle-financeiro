const expressFramework = require('express');
const controladorDeReceita = require('../controladores/controladorDeReceita');
const autenticacaoMiddleware = require('../middlewares/autenticacaoMiddleware');

const roteador = expressFramework.Router();

roteador.use(autenticacaoMiddleware);
roteador.get('/', controladorDeReceita.listarReceitasDoUsuarioAutenticado);
roteador.post('/', controladorDeReceita.criarNovaReceita);
roteador.put('/:id', controladorDeReceita.atualizarReceitaExistente);
roteador.delete('/:id', controladorDeReceita.excluirReceitaExistente);

module.exports = roteador;
