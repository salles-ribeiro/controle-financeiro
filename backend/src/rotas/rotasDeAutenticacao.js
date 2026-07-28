const expressFramework = require('express');
const controladorDeAutenticacao = require('../controladores/controladorDeAutenticacao');
const limitadorDeTentativasDeAutenticacao = require('../middlewares/limitadorDeTentativasDeAutenticacao');

const roteador = expressFramework.Router();

roteador.use(limitadorDeTentativasDeAutenticacao);
roteador.post('/cadastrar', controladorDeAutenticacao.cadastrarNovoUsuario);
roteador.post('/entrar', controladorDeAutenticacao.autenticarUsuarioExistente);

module.exports = roteador;
