import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletCards } from 'lucide-react';
import { usarAutenticacao } from '../contextos/ContextoDeAutenticacao';
import { Botao } from '../componentes/Botao';
import { CampoDeEntrada } from '../componentes/CamposDeFormulario';

export function PaginaDeCadastro() {
  const { cadastrar } = usarAutenticacao();
  const navegar = useNavigate();

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [enderecoDeEmail, setEnderecoDeEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoDaSenha, setConfirmacaoDaSenha] = useState('');
  const [diaDeViradaDoCartao, setDiaDeViradaDoCartao] = useState(1);
  const [possuiRegistroDeRendaMensal, setPossuiRegistroDeRendaMensal] = useState(false);
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [mensagemDeErro, setMensagemDeErro] = useState('');

  async function tratarEnvioDoFormulario(evento) {
    evento.preventDefault();
    setMensagemDeErro('');

    if (senha !== confirmacaoDaSenha) {
      setMensagemDeErro('As senhas não coincidem.');
      return;
    }

    setEstaEnviando(true);
    try {
      await cadastrar({
        nomeCompleto,
        enderecoDeEmail,
        senha,
        diaDeViradaDoCartao: Number(diaDeViradaDoCartao),
        possuiRegistroDeRendaMensal,
      });
      navegar('/dashboard');
    } catch (erroAoCadastrar) {
      setMensagemDeErro(erroAoCadastrar.message);
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fundo-principal px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <WalletCards className="h-8 w-8 text-acento-principal" strokeWidth={1.5} />
          <h1 className="font-display text-2xl text-texto-primario">Criar conta</h1>
          <p className="text-sm text-texto-secundario">Configure seu cartão para começar a projetar suas faturas.</p>
        </div>

        <form onSubmit={tratarEnvioDoFormulario} className="flex flex-col gap-4 rounded-2xl border border-borda-sutil bg-fundo-painel p-6">
          <CampoDeEntrada
            rotulo="Nome completo"
            value={nomeCompleto}
            onChange={(evento) => setNomeCompleto(evento.target.value)}
            required
          />
          <CampoDeEntrada
            rotulo="E-mail"
            type="email"
            autoComplete="email"
            value={enderecoDeEmail}
            onChange={(evento) => setEnderecoDeEmail(evento.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <CampoDeEntrada
              rotulo="Senha"
              type="password"
              autoComplete="new-password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              required
            />
            <CampoDeEntrada
              rotulo="Confirmar senha"
              type="password"
              autoComplete="new-password"
              value={confirmacaoDaSenha}
              onChange={(evento) => setConfirmacaoDaSenha(evento.target.value)}
              required
            />
          </div>

          <CampoDeEntrada
            rotulo="Dia de virada do cartão"
            mensagemDeAjuda="O dia seguinte a este é o melhor dia para comprar (maior prazo até o vencimento)."
            type="number"
            min="1"
            max="28"
            value={diaDeViradaDoCartao}
            onChange={(evento) => setDiaDeViradaDoCartao(evento.target.value)}
            required
          />

          <label className="flex items-start gap-3 rounded-lg border border-borda-sutil bg-fundo-elevado px-3.5 py-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-acento-principal"
              checked={possuiRegistroDeRendaMensal}
              onChange={(evento) => setPossuiRegistroDeRendaMensal(evento.target.checked)}
            />
            <span className="text-sm text-texto-secundario">
              Quero registrar minha renda mensal para ver o saldo previsto (receitas − gastos).
            </span>
          </label>

          {mensagemDeErro && <p className="text-sm text-negativo">{mensagemDeErro}</p>}

          <Botao tipo="submit" disabled={estaEnviando} className="mt-1 w-full">
            {estaEnviando ? 'Criando conta…' : 'Criar conta'}
          </Botao>
        </form>

        <p className="mt-6 text-center text-sm text-texto-secundario">
          Já tem conta?{' '}
          <Link to="/entrar" className="font-medium text-acento-principal hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
