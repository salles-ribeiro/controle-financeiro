const expressFramework = require('express');
const controladorDeGasto = require('../controladores/controladorDeGasto');
const autenticacaoMiddleware = require('../middlewares/autenticacaoMiddleware');

const roteador = expressFramework.Router();

roteador.use(autenticacaoMiddleware);
roteador.get('/', controladorDeGasto.listarGastosDoUsuarioAutenticado);
roteador.post('/', controladorDeGasto.criarNovoGasto);
roteador.put('/:id', controladorDeGasto.atualizarGastoExistente);
roteador.delete('/:id', controladorDeGasto.excluirGastoExistente);

module.exports = roteador;
