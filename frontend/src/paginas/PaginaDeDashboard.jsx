import { useCallback, useEffect, useState } from 'react';
import { Plus, TrendingDown, TrendingUp, Scale } from 'lucide-react';
import { usarAutenticacao } from '../contextos/ContextoDeAutenticacao';
import { clienteDeApi } from '../servicos/clienteDeApi';
import { Cartao } from '../componentes/Cartao';
import { Botao } from '../componentes/Botao';
import { FaixaDoCicloDaFatura } from '../componentes/FaixaDoCicloDaFatura';
import { TabelaDeProjecaoMensal } from '../componentes/TabelaDeProjecaoMensal';
import { PainelDeHistoricoMensal } from '../componentes/PainelDeHistoricoMensal';
import { ModalDeFormularioDeGasto } from '../componentes/ModalDeFormularioDeGasto';
import { ModalDeFormularioDeReceita } from '../componentes/ModalDeFormularioDeReceita';
import { formatarValorComoMoedaBrasileira, adicionarMesesAoMesReferencia } from '../servicos/utilitariosDeFormatacao';

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

  const [painelDeHistoricoAberto, setPainelDeHistoricoAberto] = useState(false);
  const [mesSelecionadoNoHistorico, setMesSelecionadoNoHistorico] = useState(null);
  const [historico, setHistorico] = useState(null);
  const [estaCarregandoHistorico, setEstaCarregandoHistorico] = useState(false);
  const [mensagemDeErroDoHistorico, setMensagemDeErroDoHistorico] = useState('');

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

  const carregarHistorico = useCallback(async (mesReferencia) => {
    setEstaCarregandoHistorico(true);
    setMensagemDeErroDoHistorico('');
    try {
      const historicoRecebido = await clienteDeApi.obterProjecaoDeUmMesEspecifico(mesReferencia);
      setHistorico(historicoRecebido);
    } catch (erroAoCarregar) {
      setMensagemDeErroDoHistorico(erroAoCarregar.message);
    } finally {
      setEstaCarregandoHistorico(false);
    }
  }, []);

  useEffect(() => {
    carregarDadosDoDashboard();
  }, [carregarDadosDoDashboard]);

  function alternarPainelDeHistorico() {
    const proximoEstado = !painelDeHistoricoAberto;
    setPainelDeHistoricoAberto(proximoEstado);
    if (proximoEstado && !mesSelecionadoNoHistorico) {
      const mesAnterior = adicionarMesesAoMesReferencia(projecao.listaDeMesesReferencia[0], -1);
      setMesSelecionadoNoHistorico(mesAnterior);
      carregarHistorico(mesAnterior);
    }
  }

  function trocarMesDoHistorico(mesReferencia) {
    setMesSelecionadoNoHistorico(mesReferencia);
    carregarHistorico(mesReferencia);
  }

  async function tratarExclusaoDeGasto(id) {
    if (!window.confirm('Tem certeza que deseja excluir este gasto?')) return;
    try {
      await clienteDeApi.excluirGasto(id);
      carregarDadosDoDashboard();
      if (painelDeHistoricoAberto) carregarHistorico(mesSelecionadoNoHistorico);
    } catch (erroAoExcluir) {
      setMensagemDeErro(erroAoExcluir.message);
    }
  }

  async function tratarExclusaoDeReceita(id) {
    if (!window.confirm('Tem certeza que deseja excluir esta receita?')) return;
    try {
      await clienteDeApi.excluirReceita(id);
      carregarDadosDoDashboard();
      if (painelDeHistoricoAberto) carregarHistorico(mesSelecionadoNoHistorico);
    } catch (erroAoExcluir) {
      setMensagemDeErro(erroAoExcluir.message);
    }
  }

  function tratarSalvamentoDoFormulario() {
    carregarDadosDoDashboard();
    if (painelDeHistoricoAberto) carregarHistorico(mesSelecionadoNoHistorico);
  }

  if (estaCarregando) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-texto-secundario">Carregando…</div>
    );
  }

  const resumoDoMesAtual = projecao?.resumoMensal?.[0];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            {usuarioAutenticado.possuiRegistroDeRendaMensal && (
              <>
                <CartaoDeResumo
                  icone={TrendingUp}
                  rotulo={`Receitas em ${resumoDoMesAtual.nomeDoMesFormatadoParaExibicao}`}
                  valor={resumoDoMesAtual.totalDeReceitasNoMes}
                  corDoIcone="text-positivo"
                />
                <CartaoDeResumo
                  icone={Scale}
                  rotulo={`Saldo previsto em ${resumoDoMesAtual.nomeDoMesFormatadoParaExibicao}`}
                  valor={resumoDoMesAtual.saldoPrevistoNoMes}
                  corDoIcone={resumoDoMesAtual.saldoPrevistoNoMes < 0 ? 'text-negativo' : 'text-positivo'}
                />
              </>
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

      {projecao && (
        <PainelDeHistoricoMensal
          aberto={painelDeHistoricoAberto}
          aoAlternar={alternarPainelDeHistorico}
          mesReferenciaAtual={projecao.listaDeMesesReferencia[0]}
          mesSelecionado={mesSelecionadoNoHistorico}
          aoTrocarMes={trocarMesDoHistorico}
          historico={historico}
          estaCarregando={estaCarregandoHistorico}
          mensagemDeErro={mensagemDeErroDoHistorico}
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

      {modalDeGastoAberto && (
        <ModalDeFormularioDeGasto
          aoFechar={() => setModalDeGastoAberto(false)}
          aoSalvar={tratarSalvamentoDoFormulario}
          listaDeCategorias={listaDeCategorias}
          gastoParaEditar={gastoEmEdicao}
        />
      )}

      {modalDeReceitaAberto && (
        <ModalDeFormularioDeReceita
          aoFechar={() => setModalDeReceitaAberto(false)}
          aoSalvar={tratarSalvamentoDoFormulario}
          receitaParaEditar={receitaEmEdicao}
        />
      )}
    </main>
  );
}
