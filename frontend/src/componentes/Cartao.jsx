export function Cartao({ className = '', children, ...outrasPropriedades }) {
  return (
    <div
      className={`rounded-2xl border border-borda-sutil bg-fundo-painel ${className}`}
      {...outrasPropriedades}
    >
      {children}
    </div>
  );
}
