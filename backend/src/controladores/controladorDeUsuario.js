const repositorioDeUsuarios = require('../repositorios/repositorioDeUsuarios');

const DIA_DE_VIRADA_MINIMO_PERMITIDO = 1;
const DIA_DE_VIRADA_MAXIMO_PERMITIDO = 28;

function removerSenhaCriptografadaDoRetorno(usuario) {
  const { senhaCriptografada, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}

async function obterPerfilDoUsuarioAutenticado(requisicao, resposta) {
  const usuario = await repositorioDeUsuarios.buscarUsuarioPorId(requisicao.usuarioAutenticadoId);
  if (!usuario) {
    return resposta.status(404).json({ mensagemDeErro: 'Usuário não encontrado.' });
  }
  return resposta.status(200).json({ usuario: removerSenhaCriptografadaDoRetorno(usuario) });
}

async function atualizarPerfilDoUsuarioAutenticado(requisicao, resposta) {
  const { diaDeViradaDoCartao, possuiRegistroDeRendaMensal } = requisicao.body;

  const diaDeViradaEscolhido = Number(diaDeViradaDoCartao);
  if (
    Number.isNaN(diaDeViradaEscolhido) ||
    diaDeViradaEscolhido < DIA_DE_VIRADA_MINIMO_PERMITIDO ||
    diaDeViradaEscolhido > DIA_DE_VIRADA_MAXIMO_PERMITIDO
  ) {
    return resposta.status(400).json({
      mensagemDeErro: `O dia de virada deve estar entre ${DIA_DE_VIRADA_MINIMO_PERMITIDO} e ${DIA_DE_VIRADA_MAXIMO_PERMITIDO}.`,
    });
  }

  const usuarioAtualizado = await repositorioDeUsuarios.atualizarPerfilDoUsuario(requisicao.usuarioAutenticadoId, {
    diaDeViradaDoCartao: diaDeViradaEscolhido,
    possuiRegistroDeRendaMensal: Boolean(possuiRegistroDeRendaMensal),
  });

  return resposta.status(200).json({ usuario: removerSenhaCriptografadaDoRetorno(usuarioAtualizado) });
}

module.exports = { obterPerfilDoUsuarioAutenticado, atualizarPerfilDoUsuarioAutenticado };
