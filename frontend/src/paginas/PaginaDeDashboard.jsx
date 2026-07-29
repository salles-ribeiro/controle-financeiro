import { useCallback, useEffect, useState } from 'react';
import { Plus, TrendingDown, TrendingUp, Scale } from 'lucide-react';
import { usarAutenticacao } from '../contextos/ContextoDeAutenticacao';
import { clienteDeApi } from '../servicos/clienteDeApi';
import { Cartao } from '../componentes/Cartao';
import { Botao } from '../componentes/Botao';
import { FaixaDoCicloDaFatura } from '../componentes/FaixaDoCicloDaFatura';
import { TabelaDeProjecaoMensal } from '../componentes/TabelaDeProjecaoMensal';
import { ModalDeFormularioDeGasto } from '../componentes/ModalDeFormularioDeGasto';
import { ModalDeFormularioDeReceita } from '../componentes/ModalDeFormularioDeReceita';
import { formatarValorComoMoedaBrasileira } from '../servicos/utilitariosDeFormatacao';

const OPCOES_DE_QUANTIDADE_DE_MESES = [3, 6, 12];

function CartaoDeResumo({ icone: Icone, rotulo, valor, corDoIcone }) {
  return (
    <Cartao className="flex items-center gap-3.5 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fundo-elevado">
        <Icone className={`h-4.5 w-4.5 ${corDoIcone}`} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xs text-texto-secundario">{rotulo}</p>
        <p className="font-display text-lg text-texto-primario">{formatarValorComoMoedaBrasileira(valor)}</p>
      </div>
    </Cartao>
  );
}

export function PaginaDeDashboard() {
  const { usuarioAutenticado } = usarAutenticacao();

  const [quantidadeDeMesesAFrente, setQuantidadeDeMesesAFrente] = useState(3);
  const [projecao, setProjecao] = useState(null);
  const [listaDeCategorias, setListaDeCategorias] = useState([]);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [mensagemDeErro, setMensagemDeErro] = useState('');

  const [modalDeGastoAberto, setModalDeGastoAberto] = useState(false);
  const [gastoEmEdicao, setGastoEmEdicao] = useState(null);
  const [modalDeReceitaAberto, setModalDeReceitaAberto] = useState(false);
  const [receitaEmEdicao, setReceitaEmEdicao] = useState(null);

  const carregarDadosDoDashboard = useCallback(async () => {
    setMensagemDeErro('');
    try {
      const [projecaoRecebida, { categorias }] = await Promise.all([
        clienteDeApi.obterProjecao(quantidadeDeMesesAFrente),
        clienteDeApi.listarCategorias(),
      ]);
      setProjecao(projecaoRecebida);
      setListaDeCategorias(categorias);
    } catch (erroAoCarregar) {
      setMensagemDeErro(erroAoCarregar.message);
    } finally {
      setEstaCarregando(false);
    }
  }, [quantidadeDeMesesAFrente]);

  useEffect(() => {
    carregarDadosDoDashboard();
  }, [carregarDadosDoDashboard]);

  async function tratarExclusaoDeGasto(id) {
    if (!window.confirm('Tem certeza que deseja excluir este gasto?')) return;
    try {
      await clienteDeApi.excluirGasto(id);
      carregarDadosDoDashboard();
    } catch (erroAoExcluir) {
      setMensagemDeErro(erroAoExcluir.message);
    }
  }

  async function tratarExclusaoDeReceita(id) {
    if (!window.confirm('Tem certeza que deseja excluir esta receita?')) return;
    try {
      await clienteDeApi.excluirReceita(id);
      carregarDadosDoDashboard();
    } catch (erroAoExcluir) {
      setMensagemDeErro(erroAoExcluir.message);
    }
  }

  if (estaCarregando) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-texto-secundario">Carregando…</div>
    );
  }

  const resumoDoMesAtual = projecao?.resumoMensal?.[0];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Cartao className="p-4 sm:col-span-2 lg:col-span-1">
          <FaixaDoCicloDaFatura diaDeViradaDoCartao={usuarioAutenticado.diaDeViradaDoCartao} />
        </Cartao>

        {resumoDoMesAtual && (
          <>
            <CartaoDeResumo
              icone={TrendingDown}
              rotulo={`Gastos em ${resumoDoMesAtual.nomeDoMesFormatadoParaExibicao}`}
              valor={resumoDoMesAtual.totalDeGastosNoMes}
              corDoIcone="text-negativo"
            />
            {usuarioAutenticado.possuiRegistroDeRendaMensal ? (
              <CartaoDeResumo
                icone={Scale}
                rotulo={`Saldo previsto em ${resumoDoMesAtual.nomeDoMesFormatadoParaExibicao}`}
                valor={resumoDoMesAtual.saldoPrevistoNoMes}
                corDoIcone={resumoDoMesAtual.saldoPrevistoNoMes < 0 ? 'text-negativo' : 'text-positivo'}
              />
            ) : (
              <CartaoDeResumo icone={TrendingUp} rotulo="Receitas" valor={0} corDoIcone="text-texto-terciario" />
            )}
          </>
        )}
      </div>

      <Cartao className="p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-fundo-elevado p-1">
            {OPCOES_DE_QUANTIDADE_DE_MESES.map((quantidade) => (
              <button
                key={quantidade}
                onClick={() => setQuantidadeDeMesesAFrente(quantidade)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  quantidadeDeMesesAFrente === quantidade
                    ? 'bg-acento-principal font-semibold text-fundo-principal'
                    : 'text-texto-secundario hover:text-texto-primario'
                }`}
              >
                {quantidade} meses
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {usuarioAutenticado.possuiRegistroDeRendaMensal && (
              <Botao
                variante="secundario"
                onClick={() => {
                  setReceitaEmEdicao(null);
                  setModalDeReceitaAberto(true);
                }}
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                Nova receita
              </Botao>
            )}
            <Botao
              onClick={() => {
                setGastoEmEdicao(null);
                setModalDeGastoAberto(true);
              }}
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Novo gasto
            </Botao>
          </div>
        </div>

        {mensagemDeErro && <p className="mb-4 text-sm text-negativo">{mensagemDeErro}</p>}

        {projecao && (
          <TabelaDeProjecaoMensal
            listaDeMesesReferencia={projecao.listaDeMesesReferencia}
            resumoMensal={projecao.resumoMensal}
            detalhamentoPorGasto={projecao.detalhamentoPorGasto}
            detalhamentoPorReceita={projecao.detalhamentoPorReceita}
            possuiRegistroDeRendaMensal={usuarioAutenticado.possuiRegistroDeRendaMensal}
            aoEditarGasto={(gasto) => {
              setGastoEmEdicao(gasto);
              setModalDeGastoAberto(true);
            }}
            aoExcluirGasto={tratarExclusaoDeGasto}
            aoEditarReceita={(receita) => {
              setReceitaEmEdicao(receita);
              setModalDeReceitaAberto(true);
            }}
            aoExcluirReceita={tratarExclusaoDeReceita}
          />
        )}
      </Cartao>

      {modalDeGastoAberto && (
        <ModalDeFormularioDeGasto
          aoFechar={() => setModalDeGastoAberto(false)}
          aoSalvar={carregarDadosDoDashboard}
          listaDeCategorias={listaDeCategorias}
          gastoParaEditar={gastoEmEdicao}
        />
      )}

      {modalDeReceitaAberto && (
        <ModalDeFormularioDeReceita
          aoFechar={() => setModalDeReceitaAberto(false)}
          aoSalvar={carregarDadosDoDashboard}
          receitaParaEditar={receitaEmEdicao}
        />
      )}
    </main>
  );
}
