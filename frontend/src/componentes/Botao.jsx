const CLASSES_POR_VARIANTE = {
  primario:
    'bg-acento-principal text-fundo-principal hover:bg-acento-principal-escuro font-semibold shadow-sm shadow-black/20',
  secundario:
    'bg-fundo-elevado text-texto-primario hover:bg-fundo-elevado-hover border border-borda-sutil',
  fantasma: 'bg-transparent text-texto-secundario hover:text-texto-primario hover:bg-fundo-elevado',
  perigo: 'bg-transparent text-negativo hover:bg-negativo-suave border border-transparent',
};

export function Botao({ variante = 'primario', tipo = 'button', className = '', children, ...outrasPropriedades }) {
  const classesDaVariante = CLASSES_POR_VARIANTE[variante] || CLASSES_POR_VARIANTE.primario;

  return (
    <button
      type={tipo}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${classesDaVariante} ${className}`}
      {...outrasPropriedades}
    >
      {children}
    </button>
  );
}
