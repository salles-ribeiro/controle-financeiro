const repositorioDeReceitas = require('../repositorios/repositorioDeReceitas');
const repositorioDeUsuarios = require('../repositorios/repositorioDeUsuarios');

const TIPOS_DE_RECEITA_VALIDOS = ['FIXA', 'VARIAVEL'];

async function usuarioAutenticadoPossuiRegistroDeRendaHabilitado(requisicao) {
  const usuario = await repositorioDeUsuarios.buscarUsuarioPorId(requisicao.usuarioAutenticadoId);
  return Boolean(usuario && usuario.possuiRegistroDeRendaMensal);
}

function validarDadosDaReceitaRecebidos(dadosDaReceita) {
  const { descricaoDaReceita, tipoDaReceita, dataDoRecebimentoOuInicio, valorMensalDaReceitaFixa, valorDaReceitaVariavel } =
    dadosDaReceita;

  if (!descricaoDaReceita || !descricaoDaReceita.trim()) {
    return 'Informe a descrição da receita.';
  }

  if (!TIPOS_DE_RECEITA_VALIDOS.includes(tipoDaReceita)) {
    return 'O tipo da receita deve ser FIXA ou VARIAVEL.';
  }

  if (!dataDoRecebimentoOuInicio || Number.isNaN(new Date(dataDoRecebimentoOuInicio).getTime())) {
    return 'Informe uma data de recebimento válida.';
  }

  if (tipoDaReceita === 'FIXA' && (!valorMensalDaReceitaFixa || Number(valorMensalDaReceitaFixa) <= 0)) {
    return 'Informe o valor mensal da receita fixa.';
  }

  if (tipoDaReceita === 'VARIAVEL' && (!valorDaReceitaVariavel || Number(valorDaReceitaVariavel) <= 0)) {
    return 'Informe o valor da receita variável.';
  }

  return null;
}

function normalizarDadosDaReceitaConformeOTipo(dadosDaReceita) {
  const dadosNormalizados = { ...dadosDaReceita };

  if (dadosNormalizados.tipoDaReceita === 'FIXA') {
    dadosNormalizados.valorDaReceitaVariavel = null;
    dadosNormalizados.valorMensalDaReceitaFixa = Number(dadosNormalizados.valorMensalDaReceitaFixa);
  } else if (dadosNormalizados.tipoDaReceita === 'VARIAVEL') {
    dadosNormalizados.valorMensalDaReceitaFixa = null;
    dadosNormalizados.dataDeTerminoDaRecorrenciaFixa = null;
    dadosNormalizados.valorDaReceitaVariavel = Number(dadosNormalizados.valorDaReceitaVariavel);
  }

  return dadosNormalizados;
}

async function listarReceitasDoUsuarioAutenticado(requisicao, resposta) {
  if (!(await usuarioAutenticadoPossuiRegistroDeRendaHabilitado(requisicao))) {
    return resposta.status(200).json({ receitas: [], registroDeRendaHabilitado: false });
  }
  const receitas = await repositorioDeReceitas.listarReceitasAtivasDoUsuario(requisicao.usuarioAutenticadoId);
  return resposta.status(200).json({ receitas, registroDeRendaHabilitado: true });
}

async function criarNovaReceita(requisicao, resposta) {
  if (!(await usuarioAutenticadoPossuiRegistroDeRendaHabilitado(requisicao))) {
    return resposta.status(403).json({
      mensagemDeErro: 'Ative o registro de renda mensal nas configurações antes de cadastrar receitas.',
    });
  }

  const mensagemDeErroDeValidacao = validarDadosDaReceitaRecebidos(requisicao.body);
  if (mensagemDeErroDeValidacao) {
    return resposta.status(400).json({ mensagemDeErro: mensagemDeErroDeValidacao });
  }

  const dadosNormalizados = normalizarDadosDaReceitaConformeOTipo(requisicao.body);

  const novaReceita = await repositorioDeReceitas.criarNovaReceita({
    usuarioId: requisicao.usuarioAutenticadoId,
    descricaoDaReceita: dadosNormalizados.descricaoDaReceita.trim(),
    tipoDaReceita: dadosNormalizados.tipoDaReceita,
    valorMensalDaReceitaFixa: dadosNormalizados.valorMensalDaReceitaFixa,
    valorDaReceitaVariavel: dadosNormalizados.valorDaReceitaVariavel,
    dataDoRecebimentoOuInicio: dadosNormalizados.dataDoRecebimentoOuInicio,
    dataDeTerminoDaRecorrenciaFixa: dadosNormalizados.dataDeTerminoDaRecorrenciaFixa,
  });

  return resposta.status(201).json({ receita: novaReceita });
}

async function atualizarReceitaExistente(requisicao, resposta) {
  const mensagemDeErroDeValidacao = validarDadosDaReceitaRecebidos(requisicao.body);
  if (mensagemDeErroDeValidacao) {
    return resposta.status(400).json({ mensagemDeErro: mensagemDeErroDeValidacao });
  }

  const dadosNormalizados = normalizarDadosDaReceitaConformeOTipo(requisicao.body);

  const receitaAtualizada = await repositorioDeReceitas.atualizarReceita(
    requisicao.params.id,
    requisicao.usuarioAutenticadoId,
    {
      descricaoDaReceita: dadosNormalizados.descricaoDaReceita.trim(),
      tipoDaReceita: dadosNormalizados.tipoDaReceita,
      valorMensalDaReceitaFixa: dadosNormalizados.valorMensalDaReceitaFixa,
      valorDaReceitaVariavel: dadosNormalizados.valorDaReceitaVariavel,
      dataDoRecebimentoOuInicio: dadosNormalizados.dataDoRecebimentoOuInicio,
      dataDeTerminoDaRecorrenciaFixa: dadosNormalizados.dataDeTerminoDaRecorrenciaFixa,
    }
  );

  if (!receitaAtualizada) {
    return resposta.status(404).json({ mensagemDeErro: 'Receita não encontrada.' });
  }

  return resposta.status(200).json({ receita: receitaAtualizada });
}

async function excluirReceitaExistente(requisicao, resposta) {
  const receitaFoiExcluida = await repositorioDeReceitas.excluirReceita(
    requisicao.params.id,
    requisicao.usuarioAutenticadoId
  );

  if (!receitaFoiExcluida) {
    return resposta.status(404).json({ mensagemDeErro: 'Receita não encontrada.' });
  }

  return resposta.status(204).send();
}

module.exports = {
  listarReceitasDoUsuarioAutenticado,
  criarNovaReceita,
  atualizarReceitaExistente,
  excluirReceitaExistente,
};
