const repositorioDeUsuarios = require('../repositorios/repositorioDeUsuarios');
const repositorioDeGastos = require('../repositorios/repositorioDeGastos');
const repositorioDeReceitas = require('../repositorios/repositorioDeReceitas');
const { gerarProjecaoFinanceiraCompleta } = require('../servicos/servicoDeProjecaoFinanceira');

const QUANTIDADE_PADRAO_DE_MESES_A_FRENTE = 12;
const QUANTIDADE_MAXIMA_DE_MESES_A_FRENTE = 36;

async function obterProjecaoFinanceiraMensal(requisicao, resposta) {
  const usuario = await repositorioDeUsuarios.buscarUsuarioPorId(requisicao.usuarioAutenticadoId);
  if (!usuario) {
    return resposta.status(404).json({ mensagemDeErro: 'Usuário não encontrado.' });
  }

  const quantidadeDeMesesAFrenteSolicitada = Number(requisicao.query.quantidadeDeMesesAFrente);
  const quantidadeDeMesesAFrente =
    Number.isInteger(quantidadeDeMesesAFrenteSolicitada) &&
    quantidadeDeMesesAFrenteSolicitada > 0 &&
    quantidadeDeMesesAFrenteSolicitada <= QUANTIDADE_MAXIMA_DE_MESES_A_FRENTE
      ? quantidadeDeMesesAFrenteSolicitada
      : QUANTIDADE_PADRAO_DE_MESES_A_FRENTE;

  const listaDeGastosAtivos = await repositorioDeGastos.listarGastosAtivosDoUsuario(usuario.id);
  const listaDeReceitasAtivas = usuario.possuiRegistroDeRendaMensal
    ? await repositorioDeReceitas.listarReceitasAtivasDoUsuario(usuario.id)
    : [];

  const projecaoFinanceiraCompleta = gerarProjecaoFinanceiraCompleta({
    diaDeViradaDoCartao: usuario.diaDeViradaDoCartao,
    possuiRegistroDeRendaMensal: usuario.possuiRegistroDeRendaMensal,
    listaDeGastosAtivos,
    listaDeReceitasAtivas,
    quantidadeDeMesesAFrente,
  });

  return resposta.status(200).json(projecaoFinanceiraCompleta);
}

module.exports = { obterProjecaoFinanceiraMensal };
