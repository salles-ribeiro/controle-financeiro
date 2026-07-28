import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProvedorDeAutenticacao, usarAutenticacao } from './contextos/ContextoDeAutenticacao'
import { RotaProtegida } from './componentes/RotaProtegida'
import { CabecalhoDaAplicacao } from './componentes/CabecalhoDaAplicacao'
import { PaginaDeLogin } from './paginas/PaginaDeLogin'
import { PaginaDeCadastro } from './paginas/PaginaDeCadastro'
import { PaginaDeDashboard } from './paginas/PaginaDeDashboard'
import { PaginaDeConfiguracoes } from './paginas/PaginaDeConfiguracoes'

function LayoutComCabecalho({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-fundo-principal">
      <CabecalhoDaAplicacao />
      {children}
    </div>
  )
}

function RotaInicial() {
  const { usuarioAutenticado, carregandoAutenticacaoInicial } = usarAutenticacao()
  if (carregandoAutenticacaoInicial) return null
  return <Navigate to={usuarioAutenticado ? '/dashboard' : '/entrar'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <ProvedorDeAutenticacao>
        <Routes>
          <Route path="/" element={<RotaInicial />} />
          <Route path="/entrar" element={<PaginaDeLogin />} />
          <Route path="/cadastro" element={<PaginaDeCadastro />} />
          <Route
            path="/dashboard"
            element={
              <RotaProtegida>
                <LayoutComCabecalho>
                  <PaginaDeDashboard />
                </LayoutComCabecalho>
              </RotaProtegida>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <RotaProtegida>
                <LayoutComCabecalho>
                  <PaginaDeConfiguracoes />
                </LayoutComCabecalho>
              </RotaProtegida>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProvedorDeAutenticacao>
    </BrowserRouter>
  )
}

export default App
