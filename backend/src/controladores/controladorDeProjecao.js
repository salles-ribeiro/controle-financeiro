const repositorioDeUsuarios = require('../repositorios/repositorioDeUsuarios');
const repositorioDeGastos = require('../repositorios/repositorioDeGastos');
const repositorioDeReceitas = require('../repositorios/repositorioDeReceitas');
const { gerarProjecaoFinanceiraCompleta } = require('../servicos/servicoDeProjecaoFinanceira');

const QUANTIDADE_PADRAO_DE_MESES_A_FRENTE = 12;
const QUANTIDADE_MAXIMA_DE_MESES_A_FRENTE = 36;
const EXPRESSAO_REGULAR_DE_MES_REFERENCIA = /^\d{4}-(0[1-9]|1[0-2])$/;

async function obterProjecaoFinanceiraMensal(requisicao, resposta) {
  const usuario = await repositorioDeUsuarios.buscarUsuarioPorId(requisicao.usuarioAutenticadoId);
  if (!usuario) {
    return resposta.status(404).json({ mensagemDeErro: 'Usuário não encontrado.' });
  }

  // Quando "mesReferencia" (formato AAAA-MM) é informado, a resposta traz
  // somente aquele mês específico — usado pelo painel de histórico, onde o
  // usuário escolhe um único mês passado em vez de um intervalo.
  const mesReferenciaSolicitado = requisicao.query.mesReferencia;
  const mesReferenciaEspecifico =
    typeof mesReferenciaSolicitado === 'string' && EXPRESSAO_REGULAR_DE_MES_REFERENCIA.test(mesReferenciaSolicitado)
      ? mesReferenciaSolicitado
      : null;

  const quantidadeDeMesesAFrenteSolicitada = Number(requisicao.query.quantidadeDeMesesAFrente);
  const quantidadeDeMesesAFrente =
    Number.isInteger(quantidadeDeMesesAFrenteSolicitada) &&
    quantidadeDeMesesAFrenteSolicitada >= 0 &&
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
    mesReferenciaEspecifico,
  });

  return resposta.status(200).json(projecaoFinanceiraCompleta);
}

module.exports = { obterProjecaoFinanceiraMensal };
