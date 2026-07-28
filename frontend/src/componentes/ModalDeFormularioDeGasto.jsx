import { useState } from 'react';
import { Modal } from './Modal';
import { Botao } from './Botao';
import { CampoDeEntrada, CampoDeSelecao } from './CamposDeFormulario';
import { clienteDeApi } from '../servicos/clienteDeApi';
import { converterDataParaFormatoDeCampoDeInput } from '../servicos/utilitariosDeFormatacao';

const HOJE_EM_FORMATO_DE_CAMPO = new Date().toISOString().slice(0, 10);

const OPCOES_DE_TIPO_DE_GASTO = [
  { valor: 'A_VISTA', rotulo: 'À vista' },
  { valor: 'FIXO', rotulo: 'Fixo' },
  { valor: 'PARCELADO', rotulo: 'Parcelado' },
];

export function ModalDeFormularioDeGasto({ aoFechar, aoSalvar, listaDeCategorias, gastoParaEditar }) {
  const estaEditando = Boolean(gastoParaEditar);

  const [descricaoDoGasto, setDescricaoDoGasto] = useState(gastoParaEditar?.descricaoDoGasto ?? '');
  const [categoriaId, setCategoriaId] = useState(gastoParaEditar?.categoriaId ?? '');
  const [tipoDoGasto, setTipoDoGasto] = useState(gastoParaEditar?.tipoDoGasto ?? 'A_VISTA');
  const [valorTotalDoGasto, setValorTotalDoGasto] = useState(gastoParaEditar?.valorTotalDoGasto ?? '');
  const [valorMensalDoGastoFixo, setValorMensalDoGastoFixo] = useState(gastoParaEditar?.valorMensalDoGastoFixo ?? '');
  const [quantidadeDeParcelas, setQuantidadeDeParcelas] = useState(gastoParaEditar?.quantidadeDeParcelas ?? 2);
  const [dataDaCompraOuContratacao, setDataDaCompraOuContratacao] = useState(
    converterDataParaFormatoDeCampoDeInput(gastoParaEditar?.dataDaCompraOuContratacao) || HOJE_EM_FORMATO_DE_CAMPO
  );
  const [dataDeTerminoDaRecorrenciaFixa, setDataDeTerminoDaRecorrenciaFixa] = useState(
    converterDataParaFormatoDeCampoDeInput(gastoParaEditar?.dataDeTerminoDaRecorrenciaFixa)
  );
  const [estaSalvando, setEstaSalvando] = useState(false);
  const [mensagemDeErro, setMensagemDeErro] = useState('');

  async function tratarEnvioDoFormulario(evento) {
    evento.preventDefault();
    setMensagemDeErro('');
    setEstaSalvando(true);

    const dadosDoGasto = {
      descricaoDoGasto,
      categoriaId: categoriaId || null,
      tipoDoGasto,
      dataDaCompraOuContratacao,
      valorTotalDoGasto: tipoDoGasto !== 'FIXO' ? Number(valorTotalDoGasto) : null,
      valorMensalDoGastoFixo: tipoDoGasto === 'FIXO' ? Number(valorMensalDoGastoFixo) : null,
      quantidadeDeParcelas: tipoDoGasto === 'PARCELADO' ? Number(quantidadeDeParcelas) : null,
      dataDeTerminoDaRecorrenciaFixa: tipoDoGasto === 'FIXO' ? dataDeTerminoDaRecorrenciaFixa || null : null,
    };

    try {
      if (estaEditando) {
        await clienteDeApi.atualizarGasto(gastoParaEditar.id, dadosDoGasto);
      } else {
        await clienteDeApi.criarGasto(dadosDoGasto);
      }
      aoSalvar();
      aoFechar();
    } catch (erroAoSalvarGasto) {
      setMensagemDeErro(erroAoSalvarGasto.message);
    } finally {
      setEstaSalvando(false);
    }
  }

  return (
    <Modal titulo={estaEditando ? 'Editar gasto' : 'Novo gasto'} aoFechar={aoFechar}>
      <form onSubmit={tratarEnvioDoFormulario} className="flex flex-col gap-4">
        <CampoDeEntrada
          rotulo="Descrição"
          placeholder="Ex.: Supermercado, Notebook, Aluguel…"
          value={descricaoDoGasto}
          onChange={(evento) => setDescricaoDoGasto(evento.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-texto-secundario">Tipo de gasto</span>
          <div className="grid grid-cols-3 gap-2">
            {OPCOES_DE_TIPO_DE_GASTO.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => setTipoDoGasto(opcao.valor)}
                className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                  tipoDoGasto === opcao.valor
                    ? 'border-acento-principal bg-acento-principal-suave text-acento-principal'
                    : 'border-borda-sutil bg-fundo-elevado text-texto-secundario hover:text-texto-primario'
                }`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>

        <CampoDeSelecao
          rotulo="Categoria"
          value={categoriaId || ''}
          onChange={(evento) => setCategoriaId(evento.target.value)}
        >
          <option value="">Sem categoria</option>
          {listaDeCategorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nomeDaCategoria}
            </option>
          ))}
        </CampoDeSelecao>

        {tipoDoGasto === 'A_VISTA' && (
          <>
            <CampoDeEntrada
              rotulo="Valor total (R$)"
              type="number"
              step="0.01"
              min="0.01"
              value={valorTotalDoGasto}
              onChange={(evento) => setValorTotalDoGasto(evento.target.value)}
              required
            />
            <CampoDeEntrada
              rotulo="Data da compra"
              type="date"
              value={dataDaCompraOuContratacao}
              onChange={(evento) => setDataDaCompraOuContratacao(evento.target.value)}
              required
            />
          </>
        )}

        {tipoDoGasto === 'PARCELADO' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <CampoDeEntrada
                rotulo="Valor total (R$)"
                type="number"
                step="0.01"
                min="0.01"
                value={valorTotalDoGasto}
                onChange={(evento) => setValorTotalDoGasto(evento.target.value)}
                required
              />
              <CampoDeEntrada
                rotulo="Quantidade de parcelas"
                type="number"
                min="2"
                max="60"
                value={quantidadeDeParcelas}
                onChange={(evento) => setQuantidadeDeParcelas(evento.target.value)}
                required
              />
            </div>
            <CampoDeEntrada
              rotulo="Data da compra"
              mensagemDeAjuda="A 1ª parcela cai na fatura seguinte se a compra for depois do dia de virada."
              type="date"
              value={dataDaCompraOuContratacao}
              onChange={(evento) => setDataDaCompraOuContratacao(evento.target.value)}
              required
            />
          </>
        )}

        {tipoDoGasto === 'FIXO' && (
          <>
            <CampoDeEntrada
              rotulo="Valor mensal (R$)"
              type="number"
              step="0.01"
              min="0.01"
              value={valorMensalDoGastoFixo}
              onChange={(evento) => setValorMensalDoGastoFixo(evento.target.value)}
              required
            />
            <CampoDeEntrada
              rotulo="Início da cobrança"
              type="date"
              value={dataDaCompraOuContratacao}
              onChange={(evento) => setDataDaCompraOuContratacao(evento.target.value)}
              required
            />
            <CampoDeEntrada
              rotulo="Término (opcional)"
              mensagemDeAjuda="Deixe em branco se o gasto se repete indefinidamente."
              type="date"
              value={dataDeTerminoDaRecorrenciaFixa}
              onChange={(evento) => setDataDeTerminoDaRecorrenciaFixa(evento.target.value)}
            />
          </>
        )}

        {mensagemDeErro && <p className="text-sm text-negativo">{mensagemDeErro}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Botao variante="secundario" tipo="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao tipo="submit" disabled={estaSalvando}>
            {estaSalvando ? 'Salvando…' : 'Salvar gasto'}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
