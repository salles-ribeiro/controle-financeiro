const { verificarTokenDeAcessoEObterConteudo } = require('../utilitarios/utilitarioDeAutenticacao');

function autenticacaoMiddleware(requisicao, resposta, proximoMiddleware) {
  const cabecalhoDeAutorizacao = requisicao.headers.authorization;

  if (!cabecalhoDeAutorizacao || !cabecalhoDeAutorizacao.startsWith('Bearer ')) {
    return resposta.status(401).json({ mensagemDeErro: 'Token de acesso não informado.' });
  }

  const tokenDeAcesso = cabecalhoDeAutorizacao.replace('Bearer ', '');

  try {
    const conteudoDoToken = verificarTokenDeAcessoEObterConteudo(tokenDeAcesso);
    requisicao.usuarioAutenticadoId = conteudoDoToken.identificadorDoUsuario;
    return proximoMiddleware();
  } catch (erroDeValidacaoDoToken) {
    return resposta.status(401).json({ mensagemDeErro: 'Token de acesso inválido ou expirado.' });
  }
}

module.exports = autenticacaoMiddleware;
