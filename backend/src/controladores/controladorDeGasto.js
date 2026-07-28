const repositorioDeGastos = require('../repositorios/repositorioDeGastos');
const repositorioDeCategorias = require('../repositorios/repositorioDeCategorias');

const TIPOS_DE_GASTO_VALIDOS = ['FIXO', 'A_VISTA', 'PARCELADO'];
const QUANTIDADE_MINIMA_DE_PARCELAS = 2;
const QUANTIDADE_MAXIMA_DE_PARCELAS = 60;

function validarDadosDoGastoRecebidos(dadosDoGasto) {
  const { descricaoDoGasto, tipoDoGasto, dataDaCompraOuContratacao, valorTotalDoGasto, valorMensalDoGastoFixo, quantidadeDeParcelas } =
    dadosDoGasto;

  if (!descricaoDoGasto || !descricaoDoGasto.trim()) {
    return 'Informe a descrição do gasto.';
  }

  if (!TIPOS_DE_GASTO_VALIDOS.includes(tipoDoGasto)) {
    return 'O tipo do gasto deve ser FIXO, A_VISTA ou PARCELADO.';
  }

  if (!dataDaCompraOuContratacao || Number.isNaN(new Date(dataDaCompraOuContratacao).getTime())) {
    return 'Informe uma data de compra/contratação válida.';
  }

  if (tipoDoGasto === 'A_VISTA') {
    if (!valorTotalDoGasto || Number(valorTotalDoGasto) <= 0) {
      return 'Informe o valor total do gasto à vista.';
    }
  }

  if (tipoDoGasto === 'PARCELADO') {
    if (!valorTotalDoGasto || Number(valorTotalDoGasto) <= 0) {
      return 'Informe o valor total do gasto parcelado.';
    }
    const quantidade = Number(quantidadeDeParcelas);
    if (!Number.isInteger(quantidade) || quantidade < QUANTIDADE_MINIMA_DE_PARCELAS || quantidade > QUANTIDADE_MAXIMA_DE_PARCELAS) {
      return `A quantidade de parcelas deve ser um número inteiro entre ${QUANTIDADE_MINIMA_DE_PARCELAS} e ${QUANTIDADE_MAXIMA_DE_PARCELAS}.`;
    }
  }

  if (tipoDoGasto === 'FIXO') {
    if (!valorMensalDoGastoFixo || Number(valorMensalDoGastoFixo) <= 0) {
      return 'Informe o valor mensal do gasto fixo.';
    }
  }

  return null;
}

async function garantirQueACategoriaPertenceAoUsuario(categoriaId, usuarioId) {
  if (!categoriaId) return null;
  const categoria = await repositorioDeCategorias.buscarCategoriaPorIdEUsuario(categoriaId, usuarioId);
  // Se o ID de categoria enviado não pertence a este usuário (seja por erro
  // ou por tentativa de manipulação), simplesmente ignoramos a categoria
  // em vez de vincular o gasto a uma categoria de outra pessoa.
  return categoria ? categoriaId : null;
}

function normalizarDadosDoGastoConformeOTipo(dadosDoGasto) {
  const dadosNormalizados = { ...dadosDoGasto };

  if (dadosNormalizados.tipoDoGasto === 'FIXO') {
    dadosNormalizados.valorTotalDoGasto = null;
    dadosNormalizados.quantidadeDeParcelas = null;
    dadosNormalizados.valorMensalDoGastoFixo = Number(dadosNormalizados.valorMensalDoGastoFixo);
  } else if (dadosNormalizados.tipoDoGasto === 'A_VISTA') {
    dadosNormalizados.valorMensalDoGastoFixo = null;
    dadosNormalizados.quantidadeDeParcelas = null;
    dadosNormalizados.dataDeTerminoDaRecorrenciaFixa = null;
    dadosNormalizados.valorTotalDoGasto = Number(dadosNormalizados.valorTotalDoGasto);
  } else if (dadosNormalizados.tipoDoGasto === 'PARCELADO') {
    dadosNormalizados.valorMensalDoGastoFixo = null;
    dadosNormalizados.dataDeTerminoDaRecorrenciaFixa = null;
    dadosNormalizados.valorTotalDoGasto = Number(dadosNormalizados.valorTotalDoGasto);
    dadosNormalizados.quantidadeDeParcelas = Number(dadosNormalizados.quantidadeDeParcelas);
  }

  return dadosNormalizados;
}

async function listarGastosDoUsuarioAutenticado(requisicao, resposta) {
  const gastos = await repositorioDeGastos.listarGastosAtivosDoUsuario(requisicao.usuarioAutenticadoId);
  return resposta.status(200).json({ gastos });
}

async function criarNovoGasto(requisicao, resposta) {
  const mensagemDeErroDeValidacao = validarDadosDoGastoRecebidos(requisicao.body);
  if (mensagemDeErroDeValidacao) {
    return resposta.status(400).json({ mensagemDeErro: mensagemDeErroDeValidacao });
  }

  const dadosNormalizados = normalizarDadosDoGastoConformeOTipo(requisicao.body);
  const categoriaValidada = await garantirQueACategoriaPertenceAoUsuario(
    dadosNormalizados.categoriaId,
    requisicao.usuarioAutenticadoId
  );

  const novoGasto = await repositorioDeGastos.criarNovoGasto({
    usuarioId: requisicao.usuarioAutenticadoId,
    categoriaId: categoriaValidada,
    descricaoDoGasto: dadosNormalizados.descricaoDoGasto.trim(),
    tipoDoGasto: dadosNormalizados.tipoDoGasto,
    valorTotalDoGasto: dadosNormalizados.valorTotalDoGasto,
    valorMensalDoGastoFixo: dadosNormalizados.valorMensalDoGastoFixo,
    quantidadeDeParcelas: dadosNormalizados.quantidadeDeParcelas,
    dataDaCompraOuContratacao: dadosNormalizados.dataDaCompraOuContratacao,
    dataDeTerminoDaRecorrenciaFixa: dadosNormalizados.dataDeTerminoDaRecorrenciaFixa,
  });

  return resposta.status(201).json({ gasto: novoGasto });
}

async function atualizarGastoExistente(requisicao, resposta) {
  const mensagemDeErroDeValidacao = validarDadosDoGastoRecebidos(requisicao.body);
  if (mensagemDeErroDeValidacao) {
    return resposta.status(400).json({ mensagemDeErro: mensagemDeErroDeValidacao });
  }

  const dadosNormalizados = normalizarDadosDoGastoConformeOTipo(requisicao.body);
  const categoriaValidada = await garantirQueACategoriaPertenceAoUsuario(
    dadosNormalizados.categoriaId,
    requisicao.usuarioAutenticadoId
  );

  const gastoAtualizado = await repositorioDeGastos.atualizarGasto(
    requisicao.params.id,
    requisicao.usuarioAutenticadoId,
    {
      categoriaId: categoriaValidada,
      descricaoDoGasto: dadosNormalizados.descricaoDoGasto.trim(),
      tipoDoGasto: dadosNormalizados.tipoDoGasto,
      valorTotalDoGasto: dadosNormalizados.valorTotalDoGasto,
      valorMensalDoGastoFixo: dadosNormalizados.valorMensalDoGastoFixo,
      quantidadeDeParcelas: dadosNormalizados.quantidadeDeParcelas,
      dataDaCompraOuContratacao: dadosNormalizados.dataDaCompraOuContratacao,
      dataDeTerminoDaRecorrenciaFixa: dadosNormalizados.dataDeTerminoDaRecorrenciaFixa,
    }
  );

  if (!gastoAtualizado) {
    return resposta.status(404).json({ mensagemDeErro: 'Gasto não encontrado.' });
  }

  return resposta.status(200).json({ gasto: gastoAtualizado });
}

async function excluirGastoExistente(requisicao, resposta) {
  const gastoFoiExcluido = await repositorioDeGastos.excluirGasto(requisicao.params.id, requisicao.usuarioAutenticadoId);

  if (!gastoFoiExcluido) {
    return resposta.status(404).json({ mensagemDeErro: 'Gasto não encontrado.' });
  }

  return resposta.status(204).send();
}

module.exports = {
  listarGastosDoUsuarioAutenticado,
  criarNovoGasto,
  atualizarGastoExistente,
  excluirGastoExistente,
};
