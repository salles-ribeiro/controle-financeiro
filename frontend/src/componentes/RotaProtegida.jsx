import { Navigate } from 'react-router-dom';
import { usarAutenticacao } from '../contextos/ContextoDeAutenticacao';

export function RotaProtegida({ children }) {
  const { usuarioAutenticado, carregandoAutenticacaoInicial } = usarAutenticacao();

  if (carregandoAutenticacaoInicial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fundo-principal">
        <span className="text-sm text-texto-secundario">Carregando…</span>
      </div>
    );
  }

  if (!usuarioAutenticado) {
    return <Navigate to="/entrar" replace />;
  }

  return children;
}
