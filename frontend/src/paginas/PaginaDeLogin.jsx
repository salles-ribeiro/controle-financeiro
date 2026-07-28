import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletCards } from 'lucide-react';
import { usarAutenticacao } from '../contextos/ContextoDeAutenticacao';
import { Botao } from '../componentes/Botao';
import { CampoDeEntrada } from '../componentes/CamposDeFormulario';

export function PaginaDeLogin() {
  const { entrar } = usarAutenticacao();
  const navegar = useNavigate();

  const [enderecoDeEmail, setEnderecoDeEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [mensagemDeErro, setMensagemDeErro] = useState('');

  async function tratarEnvioDoFormulario(evento) {
    evento.preventDefault();
    setMensagemDeErro('');
    setEstaEnviando(true);
    try {
      await entrar(enderecoDeEmail, senha);
      navegar('/dashboard');
    } catch (erroAoEntrar) {
      setMensagemDeErro(erroAoEntrar.message);
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fundo-principal px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <WalletCards className="h-8 w-8 text-acento-principal" strokeWidth={1.5} />
          <h1 className="font-display text-2xl text-texto-primario">Controle Financeiro</h1>
          <p className="text-sm text-texto-secundario">Entre para ver a projeção das suas próximas faturas.</p>
        </div>

        <form onSubmit={tratarEnvioDoFormulario} className="flex flex-col gap-4 rounded-2xl border border-borda-sutil bg-fundo-painel p-6">
          <CampoDeEntrada
            rotulo="E-mail"
            type="email"
            autoComplete="email"
            value={enderecoDeEmail}
            onChange={(evento) => setEnderecoDeEmail(evento.target.value)}
            required
          />
          <CampoDeEntrada
            rotulo="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />
          {mensagemDeErro && <p className="text-sm text-negativo">{mensagemDeErro}</p>}
          <Botao tipo="submit" disabled={estaEnviando} className="mt-1 w-full">
            {estaEnviando ? 'Entrando…' : 'Entrar'}
          </Botao>
        </form>

        <p className="mt-6 text-center text-sm text-texto-secundario">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-acento-principal hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
