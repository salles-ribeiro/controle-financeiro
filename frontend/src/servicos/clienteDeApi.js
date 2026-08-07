const URL_BASE_DA_API = import.meta.env.VITE_URL_BASE_DA_API || '/api';
const CHAVE_DE_ARMAZENAMENTO_DO_TOKEN = 'tokenDeAcessoDoControleFinanceiro';

function obterTokenDeAcessoArmazenado() {
  return localStorage.getItem(CHAVE_DE_ARMAZENAMENTO_DO_TOKEN);
}

function armazenarTokenDeAcesso(tokenDeAcesso) {
  localStorage.setItem(CHAVE_DE_ARMAZENAMENTO_DO_TOKEN, tokenDeAcesso);
}

function removerTokenDeAcessoArmazenado() {
  localStorage.removeItem(CHAVE_DE_ARMAZENAMENTO_DO_TOKEN);
}

async function realizarRequisicao(caminho, opcoes = {}) {
  const tokenDeAcesso = obterTokenDeAcessoArmazenado();

  const resposta = await fetch(`${URL_BASE_DA_API}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(tokenDeAcesso ? { Authorization: `Bearer ${tokenDeAcesso}` } : {}),
      ...opcoes.headers,
    },
  });

  if (resposta.status === 204) {
    return null;
  }

  const corpoDaResposta = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagemDeErro = corpoDaResposta?.mensagemDeErro || 'Erro inesperado ao comunicar com o servidor.';
    const erro = new Error(mensagemDeErro);
    erro.statusHttp = resposta.status;
    throw erro;
  }

  return corpoDaResposta;
}

// --- Autenticação ---
function cadastrarUsuario(dadosDeCadastro) {
  return realizarRequisicao('/autenticacao/cadastrar', {
    method: 'POST',
    body: JSON.stringify(dadosDeCadastro),
  });
}

function entrarComEmailESenha(credenciais) {
  return realizarRequisicao('/autenticacao/entrar', {
    method: 'POST',
    body: JSON.stringify(credenciais),
  });
}

// --- Perfil do usuário ---
function obterPerfil() {
  return realizarRequisicao('/usuarios/perfil');
}

function atualizarPerfil(dadosDoPerfil) {
  return realizarRequisicao('/usuarios/perfil', {
    method: 'PUT',
    body: JSON.stringify(dadosDoPerfil),
  });
}

// --- Categorias ---
function listarCategorias() {
  return realizarRequisicao('/categorias');
}

function criarCategoria(dadosDaCategoria) {
  return realizarRequisicao('/categorias', {
    method: 'POST',
    body: JSON.stringify(dadosDaCategoria),
  });
}

function excluirCategoria(id) {
  return realizarRequisicao(`/categorias/${id}`, { method: 'DELETE' });
}

// --- Gastos ---
function listarGastos() {
  return realizarRequisicao('/gastos');
}

function criarGasto(dadosDoGasto) {
  return realizarRequisicao('/gastos', {
    method: 'POST',
    body: JSON.stringify(dadosDoGasto),
  });
}

function atualizarGasto(id, dadosDoGasto) {
  return realizarRequisicao(`/gastos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dadosDoGasto),
  });
}

function excluirGasto(id) {
  return realizarRequisicao(`/gastos/${id}`, { method: 'DELETE' });
}

// --- Receitas ---
function listarReceitas() {
  return realizarRequisicao('/receitas');
}

function criarReceita(dadosDaReceita) {
  return realizarRequisicao('/receitas', {
    method: 'POST',
    body: JSON.stringify(dadosDaReceita),
  });
}

function atualizarReceita(id, dadosDaReceita) {
  return realizarRequisicao(`/receitas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dadosDaReceita),
  });
}

function excluirReceita(id) {
  return realizarRequisicao(`/receitas/${id}`, { method: 'DELETE' });
}

// --- Projeção financeira ---
function obterProjecao(quantidadeDeMesesAFrente) {
  return realizarRequisicao(`/projecao?quantidadeDeMesesAFrente=${quantidadeDeMesesAFrente}`);
}

function obterProjecaoDeUmMesEspecifico(mesReferencia) {
  return realizarRequisicao(`/projecao?mesReferencia=${mesReferencia}`);
}

export const clienteDeApi = {
  armazenarTokenDeAcesso,
  removerTokenDeAcessoArmazenado,
  obterTokenDeAcessoArmazenado,
  cadastrarUsuario,
  entrarComEmailESenha,
  obterPerfil,
  atualizarPerfil,
  listarCategorias,
  criarCategoria,
  excluirCategoria,
  listarGastos,
  criarGasto,
  atualizarGasto,
  excluirGasto,
  listarReceitas,
  criarReceita,
  atualizarReceita,
  excluirReceita,
  obterProjecao,
  obterProjecaoDeUmMesEspecifico,
};
