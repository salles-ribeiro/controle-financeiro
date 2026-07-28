export function CampoDeEntrada({ rotulo, mensagemDeAjuda, mensagemDeErro, className = '', ...outrasPropriedades }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {rotulo && <span className="text-sm font-medium text-texto-secundario">{rotulo}</span>}
      <input
        className="w-full rounded-lg border border-borda-sutil bg-fundo-elevado px-3.5 py-2.5 text-texto-primario placeholder:text-texto-terciario focus:border-acento-principal focus:outline-none"
        {...outrasPropriedades}
      />
      {mensagemDeAjuda && !mensagemDeErro && <span className="text-xs text-texto-terciario">{mensagemDeAjuda}</span>}
      {mensagemDeErro && <span className="text-xs text-negativo">{mensagemDeErro}</span>}
    </label>
  );
}

export function CampoDeSelecao({ rotulo, mensagemDeAjuda, className = '', children, ...outrasPropriedades }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {rotulo && <span className="text-sm font-medium text-texto-secundario">{rotulo}</span>}
      <select
        className="w-full rounded-lg border border-borda-sutil bg-fundo-elevado px-3.5 py-2.5 text-texto-primario focus:border-acento-principal focus:outline-none"
        {...outrasPropriedades}
      >
        {children}
      </select>
      {mensagemDeAjuda && <span className="text-xs text-texto-terciario">{mensagemDeAjuda}</span>}
    </label>
  );
}
