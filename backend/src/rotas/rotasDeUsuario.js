const expressFramework = require('express');
const controladorDeUsuario = require('../controladores/controladorDeUsuario');
const autenticacaoMiddleware = require('../middlewares/autenticacaoMiddleware');

const roteador = expressFramework.Router();

roteador.use(autenticacaoMiddleware);
roteador.get('/perfil', controladorDeUsuario.obterPerfilDoUsuarioAutenticado);
roteador.put('/perfil', controladorDeUsuario.atualizarPerfilDoUsuarioAutenticado);

module.exports = roteador;
