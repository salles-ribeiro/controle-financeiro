const repositorioDeUsuarios = require('../repositorios/repositorioDeUsuarios');
const repositorioDeCategorias = require('../repositorios/repositorioDeCategorias');
const {
  gerarHashDaSenha,
  senhaCorrespondeAoHash,
  gerarTokenDeAcessoParaUsuario,
} = require('../utilitarios/utilitarioDeAutenticacao');

const EXPRESSAO_REGULAR_DE_EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QUANTIDADE_MINIMA_DE_CARACTERES_DA_SENHA = 8;
const DIA_DE_VIRADA_MINIMO_PERMITIDO = 1;
const DIA_DE_VIRADA_MAXIMO_PERMITIDO = 28;

function removerSenhaCriptografadaDoRetorno(usuario) {
  const { senhaCriptografada, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}

async function cadastrarNovoUsuario(requisicao, resposta) {
  const {
    nomeCompleto,
    enderecoDeEmail,
    senha,
    diaDeViradaDoCartao,
    possuiRegistroDeRendaMensal,
  } = requisicao.body;

  if (!nomeCompleto || !enderecoDeEmail || !senha) {
    return resposta.status(400).json({ mensagemDeErro: 'Nome completo, e-mail e senha são obrigatórios.' });
  }

  if (!EXPRESSAO_REGULAR_DE_EMAIL_VALIDO.test(enderecoDeEmail)) {
    return resposta.status(400).json({ mensagemDeErro: 'Informe um e-mail válido.' });
  }

  if (senha.length < QUANTIDADE_MINIMA_DE_CARACTERES_DA_SENHA) {
    return resposta.status(400).json({
      mensagemDeErro: `A senha deve ter pelo menos ${QUANTIDADE_MINIMA_DE_CARACTERES_DA_SENHA} caracteres.`,
    });
  }

  const diaDeViradaEscolhido = Number(diaDeViradaDoCartao) || 1;
  if (diaDeViradaEscolhido < DIA_DE_VIRADA_MINIMO_PERMITIDO || diaDeViradaEscolhido > DIA_DE_VIRADA_MAXIMO_PERMITIDO) {
    return resposta.status(400).json({
      mensagemDeErro: `O dia de virada deve estar entre ${DIA_DE_VIRADA_MINIMO_PERMITIDO} e ${DIA_DE_VIRADA_MAXIMO_PERMITIDO}.`,
    });
  }

  const usuarioComEsteEmailJaExiste = await repositorioDeUsuarios.buscarUsuarioPorEmail(enderecoDeEmail);
  if (usuarioComEsteEmailJaExiste) {
    return resposta.status(409).json({ mensagemDeErro: 'Já existe uma conta cadastrada com este e-mail.' });
  }

  const novoUsuario = await repositorioDeUsuarios.criarNovoUsuario({
    nomeCompleto,
    enderecoDeEmail,
    senhaCriptografada: gerarHashDaSenha(senha),
    diaDeViradaDoCartao: diaDeViradaEscolhido,
    possuiRegistroDeRendaMensal: Boolean(possuiRegistroDeRendaMensal),
  });

  await repositorioDeCategorias.criarCategoriasPadraoParaUsuario(novoUsuario.id);

  const tokenDeAcesso = gerarTokenDeAcessoParaUsuario(novoUsuario.id);

  return resposta.status(201).json({
    tokenDeAcesso,
    usuario: removerSenhaCriptografadaDoRetorno(novoUsuario),
  });
}

async function autenticarUsuarioExistente(requisicao, resposta) {
  const { enderecoDeEmail, senha } = requisicao.body;

  if (!enderecoDeEmail || !senha) {
    return resposta.status(400).json({ mensagemDeErro: 'Informe e-mail e senha.' });
  }

  const usuarioEncontrado = await repositorioDeUsuarios.buscarUsuarioPorEmail(enderecoDeEmail);
  const credenciaisSaoValidas =
    usuarioEncontrado && senhaCorrespondeAoHash(senha, usuarioEncontrado.senhaCriptografada);

  if (!credenciaisSaoValidas) {
    return resposta.status(401).json({ mensagemDeErro: 'E-mail ou senha incorretos.' });
  }

  const tokenDeAcesso = gerarTokenDeAcessoParaUsuario(usuarioEncontrado.id);

  return resposta.status(200).json({
    tokenDeAcesso,
    usuario: removerSenhaCriptografadaDoRetorno(usuarioEncontrado),
  });
}

module.exports = { cadastrarNovoUsuario, autenticarUsuarioExistente };
