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

export const RESUMO_DOS_TIPOS_DE_GASTO = {
  FIXO: { rotulo: 'Fixo', descricaoCurta: 'Todo mês' },
  A_VISTA: { rotulo: 'À vista', descricaoCurta: 'Pagamento único' },
  PARCELADO: { rotulo: 'Parcelado', descricaoCurta: 'Parcelas mensais' },
};

export const RESUMO_DOS_TIPOS_DE_RECEITA = {
  FIXA: { rotulo: 'Fixa', descricaoCurta: 'Todo mês' },
  VARIAVEL: { rotulo: 'Variável', descricaoCurta: 'Recebimento único' },
};
