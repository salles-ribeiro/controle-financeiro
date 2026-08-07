import { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatarNomeDoMesReferenciaParaExibicao } from '../servicos/utilitariosDeFormatacao';

const ABREVIACOES_DOS_MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function construirMesReferencia(ano, mesIndexadoEmZero) {
  return `${ano}-${String(mesIndexadoEmZero + 1).padStart(2, '0')}`;
}

// "mesReferenciaLimite" é exclusive: só meses estritamente anteriores a ele
// podem ser selecionados (usado para restringir o histórico ao passado).
export function SeletorDeMesEmCalendario({ valor, aoSelecionar, mesReferenciaLimite }) {
  const [aberto, setAberto] = useState(false);
  const [anoExibido, setAnoExibido] = useState(() => parseInt((valor || mesReferenciaLimite).split('-')[0], 10));

  useEffect(() => {
    function tratarTeclaEsc(evento) {
      if (evento.key === 'Escape') setAberto(false);
    }
    document.addEventListener('keydown', tratarTeclaEsc);
    return () => document.removeEventListener('keydown', tratarTeclaEsc);
  }, []);

  function alternarAberto() {
    if (!aberto) {
      setAnoExibido(parseInt((valor || mesReferenciaLimite).split('-')[0], 10));
    }
    setAberto((atual) => !atual);
  }

  const podeAvancarAno = `${anoExibido + 1}-01` < mesReferenciaLimite;

  return (
    <div className="relative w-fit">
      <button
        type="button"
        onClick={alternarAberto}
        className="flex items-center gap-2 rounded-lg border border-borda-sutil bg-fundo-elevado px-3 py-1.5 text-sm text-texto-primario"
      >
        <Calendar className="h-4 w-4 text-texto-secundario" strokeWidth={1.75} />
        {valor ? formatarNomeDoMesReferenciaParaExibicao(valor) : 'Selecionar mês'}
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-borda-media bg-fundo-painel p-3 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAnoExibido((ano) => ano - 1)}
                className="rounded-md p-1.5 text-texto-secundario hover:bg-fundo-elevado hover:text-texto-primario"
                aria-label="Ano anterior"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <span className="font-display text-sm text-texto-primario">{anoExibido}</span>
              <button
                type="button"
                onClick={() => setAnoExibido((ano) => ano + 1)}
                disabled={!podeAvancarAno}
                className="rounded-md p-1.5 text-texto-secundario hover:bg-fundo-elevado hover:text-texto-primario disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Próximo ano"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {ABREVIACOES_DOS_MESES.map((abreviacao, indice) => {
                const mesReferenciaDoBotao = construirMesReferencia(anoExibido, indice);
                const estaDesabilitado = mesReferenciaDoBotao >= mesReferenciaLimite;
                const estaSelecionado = mesReferenciaDoBotao === valor;
                return (
                  <button
                    key={abreviacao}
                    type="button"
                    disabled={estaDesabilitado}
                    onClick={() => {
                      aoSelecionar(mesReferenciaDoBotao);
                      setAberto(false);
                    }}
                    className={`rounded-md px-2 py-1.5 text-sm transition-colors ${
                      estaSelecionado
                        ? 'bg-acento-principal font-semibold text-fundo-principal'
                        : estaDesabilitado
                          ? 'cursor-not-allowed text-texto-terciario opacity-40'
                          : 'text-texto-secundario hover:bg-fundo-elevado hover:text-texto-primario'
                    }`}
                  >
                    {abreviacao}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
