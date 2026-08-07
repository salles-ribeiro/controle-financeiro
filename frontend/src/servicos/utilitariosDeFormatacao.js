export function formatarValorComoMoedaBrasileira(valorNumerico) {
  const valorSeguro = Number.isFinite(valorNumerico) ? valorNumerico : 0;
  return valorSeguro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarDataIsoParaExibicaoBrasileira(dataEmTextoIso) {
  if (!dataEmTextoIso) return '';
  const data = new Date(dataEmTextoIso);
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
}

export function converterDataParaFormatoDeCampoDeInput(dataEmTextoIso) {
  if (!dataEmTextoIso) return '';
  return dataEmTextoIso.slice(0, 10);
}

const NOMES_DOS_MESES_EM_PORTUGUES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// "mesReferencia" é sempre uma string "AAAA-MM", igual ao formato usado pelo backend.
export function adicionarMesesAoMesReferencia(mesReferencia, quantidadeDeMesesAAdicionar) {
  const [anoEmTexto, mesEmTexto] = mesReferencia.split('-');
  let anoResultante = parseInt(anoEmTexto, 10);
  let mesResultanteIndexadoEmZero = parseInt(mesEmTexto, 10) - 1 + quantidadeDeMesesAAdicionar;

  while (mesResultanteIndexadoEmZero > 11) {
    mesResultanteIndexadoEmZero -= 12;
    anoResultante += 1;
  }
  while (mesResultanteIndexadoEmZero < 0) {
    mesResultanteIndexadoEmZero += 12;
    anoResultante -= 1;
  }

  return `${anoResultante}-${String(mesResultanteIndexadoEmZero + 1).padStart(2, '0')}`;
}

export function formatarNomeDoMesReferenciaParaExibicao(mesReferencia) {
  const [anoEmTexto, mesEmTexto] = mesReferencia.split('-');
  return `${NOMES_DOS_MESES_EM_PORTUGUES[parseInt(mesEmTexto, 10) - 1]} de ${anoEmTexto}`;
}

export const RESUMO_DOS_TIPOS_DE_GASTO = {
  FIXO: { rotulo: 'Fixo', descricaoCurta: 'Todo mês' },
  A_VISTA: { rotulo: 'À vista', descricaoCurta: 'Pagamento único' },
  PARCELADO: { rotulo: 'Parcelado', descricaoCurta: 'Parcelas mensais' },
};

export const RESUMO_DOS_TIPOS_DE_RECEITA = {
  FIXA: { rotulo: 'Fixa', descricaoCurta: 'Todo mês' },
  VARIAVEL: { rotulo: 'Variável', descricaoCurta: 'Recebimento único' },
};
