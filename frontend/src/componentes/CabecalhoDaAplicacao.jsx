import { NavLink } from 'react-router-dom';
import { LayoutGrid, Settings, LogOut, WalletCards } from 'lucide-react';
import { usarAutenticacao } from '../contextos/ContextoDeAutenticacao';

export function CabecalhoDaAplicacao() {
  const { usuarioAutenticado, sair } = usarAutenticacao();

  const classesDoLink = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive ? 'bg-acento-principal-suave text-acento-principal' : 'text-texto-secundario hover:text-texto-primario'
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-borda-sutil bg-fundo-principal/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <WalletCards className="h-5 w-5 text-acento-principal" strokeWidth={1.75} />
          <span className="font-display text-lg tracking-tight">Controle Financeiro</span>
        </div>

        <nav className="flex items-center gap-1">
          <NavLink to="/dashboard" className={classesDoLink}>
            <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>
          <NavLink to="/configuracoes" className={classesDoLink}>
            <Settings className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Configurações</span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-texto-secundario md:inline">{usuarioAutenticado?.nomeCompleto}</span>
          <button
            onClick={sair}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-texto-secundario transition-colors hover:text-negativo"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
