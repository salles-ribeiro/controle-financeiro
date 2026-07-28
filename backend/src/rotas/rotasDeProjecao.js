const expressFramework = require('express');
const controladorDeProjecao = require('../controladores/controladorDeProjecao');
const autenticacaoMiddleware = require('../middlewares/autenticacaoMiddleware');

const roteador = expressFramework.Router();

roteador.use(autenticacaoMiddleware);
roteador.get('/', controladorDeProjecao.obterProjecaoFinanceiraMensal);

module.exports = roteador;
