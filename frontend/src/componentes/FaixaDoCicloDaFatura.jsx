const UM_DIA_EM_MILISSEGUNDOS = 24 * 60 * 60 * 1000;

// Formata um Date local (já construído com ano/mês/dia locais) sem
// convertê-lo para UTC, evitando que o dia mude para fusos a leste de UTC.
function formatarDataLocalParaExibicao(dataLocal) {
  return dataLocal.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function calcularInformacoesDoCicloDaFatura(diaDeViradaDoCartao) {
  const agora = new Date();
  const hojeZerado = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

  let inicioDoCiclo;
  let fimDoCiclo;

  if (hojeZerado.getDate() <= diaDeViradaDoCartao) {
    fimDoCiclo = new Date(hojeZerado.getFullYear(), hojeZerado.getMonth(), diaDeViradaDoCartao);
    inicioDoCiclo = new Date(hojeZerado.getFullYear(), hojeZerado.getMonth() - 1, diaDeViradaDoCartao + 1);
  } else {
    fimDoCiclo = new Date(hojeZerado.getFullYear(), hojeZerado.getMonth() + 1, diaDeViradaDoCartao);
    inicioDoCiclo = new Date(hojeZerado.getFullYear(), hojeZerado.getMonth(), diaDeViradaDoCartao + 1);
  }

  const duracaoTotalDoCicloEmDias = Math.max(
    1,
    Math.round((fimDoCiclo - inicioDoCiclo) / UM_DIA_EM_MILISSEGUNDOS) + 1
  );
  const diasDecorridosDesdeOInicio = Math.round((hojeZerado - inicioDoCiclo) / UM_DIA_EM_MILISSEGUNDOS);
  const percentualDeProgresso = Math.min(
    100,
    Math.max(0, (diasDecorridosDesdeOInicio / Math.max(1, duracaoTotalDoCicloEmDias - 1)) * 100)
  );

  return { inicioDoCiclo, fimDoCiclo, percentualDeProgresso };
}

export function FaixaDoCicloDaFatura({ diaDeViradaDoCartao }) {
  const { inicioDoCiclo, fimDoCiclo, percentualDeProgresso } = calcularInformacoesDoCicloDaFatura(diaDeViradaDoCartao);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-texto-secundario">Ciclo atual da fatura</p>
        <p className="text-xs text-texto-terciario">
          Vira todo dia <span className="font-semibold text-acento-principal">{diaDeViradaDoCartao}</span>
        </p>
      </div>

      <div className="relative h-2 w-full rounded-full bg-fundo-elevado">
        <div
          className="h-full rounded-full bg-acento-principal-suave"
          style={{ width: `${percentualDeProgresso}%` }}
        />
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fundo-painel bg-acento-principal"
          style={{ left: `${percentualDeProgresso}%` }}
          title="Hoje"
        />
      </div>

      <div className="flex items-start justify-between text-xs">
        <div className="flex flex-col">
          <span className="font-medium text-positivo">Melhor dia de compra</span>
          <span className="text-texto-terciario">{formatarDataLocalParaExibicao(inicioDoCiclo)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="font-medium text-texto-secundario">Fecha a fatura</span>
          <span className="text-texto-terciario">{formatarDataLocalParaExibicao(fimDoCiclo)}</span>
        </div>
      </div>
    </div>
  );
}
