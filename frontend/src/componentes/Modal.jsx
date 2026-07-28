import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ titulo, aoFechar, children }) {
  useEffect(() => {
    function tratarTeclaEsc(evento) {
      if (evento.key === 'Escape') aoFechar();
    }
    document.addEventListener('keydown', tratarTeclaEsc);
    return () => document.removeEventListener('keydown', tratarTeclaEsc);
  }, [aoFechar]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={aoFechar}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-borda-media bg-fundo-painel p-6 shadow-xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-texto-primario">{titulo}</h2>
          <button
            onClick={aoFechar}
            className="rounded-md p-1 text-texto-terciario hover:bg-fundo-elevado hover:text-texto-primario"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
