import { useState } from 'react';
import { Modal } from './Modal';
import { Botao } from './Botao';
import { CampoDeEntrada } from './CamposDeFormulario';
import { clienteDeApi } from '../servicos/clienteDeApi';
import { converterDataParaFormatoDeCampoDeInput } from '../servicos/utilitariosDeFormatacao';

const HOJE_EM_FORMATO_DE_CAMPO = new Date().toISOString().slice(0, 10);

const OPCOES_DE_TIPO_DE_RECEITA = [
  { valor: 'FIXA', rotulo: 'Fixa (todo mês)' },
  { valor: 'VARIAVEL', rotulo: 'Variável (única)' },
];

export function ModalDeFormularioDeReceita({ aoFechar, aoSalvar, receitaParaEditar }) {
  const estaEditando = Boolean(receitaParaEditar);

  const [descricaoDaReceita, setDescricaoDaReceita] = useState(receitaParaEditar?.descricaoDaReceita ?? '');
  const [tipoDaReceita, setTipoDaReceita] = useState(receitaParaEditar?.tipoDaReceita ?? 'FIXA');
  const [valorMensalDaReceitaFixa, setValorMensalDaReceitaFixa] = useState(
    receitaParaEditar?.valorMensalDaReceitaFixa ?? ''
  );
  const [valorDaReceitaVariavel, setValorDaReceitaVariavel] = useState(receitaParaEditar?.valorDaReceitaVariavel ?? '');
  const [dataDoRecebimentoOuInicio, setDataDoRecebimentoOuInicio] = useState(
    converterDataParaFormatoDeCampoDeInput(receitaParaEditar?.dataDoRecebimentoOuInicio) || HOJE_EM_FORMATO_DE_CAMPO
  );
  const [dataDeTerminoDaRecorrenciaFixa, setDataDeTerminoDaRecorrenciaFixa] = useState(
    converterDataParaFormatoDeCampoDeInput(receitaParaEditar?.dataDeTerminoDaRecorrenciaFixa)
  );
  const [estaSalvando, setEstaSalvando] = useState(false);
  const [mensagemDeErro, setMensagemDeErro] = useState('');

  async function tratarEnvioDoFormulario(evento) {
    evento.preventDefault();
    setMensagemDeErro('');
    setEstaSalvando(true);

    const dadosDaReceita = {
      descricaoDaReceita,
      tipoDaReceita,
      dataDoRecebimentoOuInicio,
      valorMensalDaReceitaFixa: tipoDaReceita === 'FIXA' ? Number(valorMensalDaReceitaFixa) : null,
      valorDaReceitaVariavel: tipoDaReceita === 'VARIAVEL' ? Number(valorDaReceitaVariavel) : null,
      dataDeTerminoDaRecorrenciaFixa: tipoDaReceita === 'FIXA' ? dataDeTerminoDaRecorrenciaFixa || null : null,
    };

    try {
      if (estaEditando) {
        await clienteDeApi.atualizarReceita(receitaParaEditar.id, dadosDaReceita);
      } else {
        await clienteDeApi.criarReceita(dadosDaReceita);
      }
      aoSalvar();
      aoFechar();
    } catch (erroAoSalvarReceita) {
      setMensagemDeErro(erroAoSalvarReceita.message);
    } finally {
      setEstaSalvando(false);
    }
  }

  return (
    <Modal titulo={estaEditando ? 'Editar receita' : 'Nova receita'} aoFechar={aoFechar}>
      <form onSubmit={tratarEnvioDoFormulario} className="flex flex-col gap-4">
        <CampoDeEntrada
          rotulo="Descrição"
          placeholder="Ex.: Salário, Freelance, Décimo terceiro…"
          value={descricaoDaReceita}
          onChange={(evento) => setDescricaoDaReceita(evento.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-texto-secundario">Tipo de receita</span>
          <div className="grid grid-cols-2 gap-2">
            {OPCOES_DE_TIPO_DE_RECEITA.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => setTipoDaReceita(opcao.valor)}
                className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                  tipoDaReceita === opcao.valor
                    ? 'border-positivo bg-positivo-suave text-positivo'
                    : 'border-borda-sutil bg-fundo-elevado text-texto-secundario hover:text-texto-primario'
                }`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>

        {tipoDaReceita === 'FIXA' && (
          <>
            <CampoDeEntrada
              rotulo="Valor mensal (R$)"
              type="number"
              step="0.01"
              min="0.01"
              value={valorMensalDaReceitaFixa}
              onChange={(evento) => setValorMensalDaReceitaFixa(evento.target.value)}
              required
            />
            <CampoDeEntrada
              rotulo="Início do recebimento"
              type="date"
              value={dataDoRecebimentoOuInicio}
              onChange={(evento) => setDataDoRecebimentoOuInicio(evento.target.value)}
              required
            />
            <CampoDeEntrada
              rotulo="Término (opcional)"
              mensagemDeAjuda="Deixe em branco se a receita se repete indefinidamente."
              type="date"
              value={dataDeTerminoDaRecorrenciaFixa}
              onChange={(evento) => setDataDeTerminoDaRecorrenciaFixa(evento.target.value)}
            />
          </>
        )}

        {tipoDaReceita === 'VARIAVEL' && (
          <>
            <CampoDeEntrada
              rotulo="Valor (R$)"
              type="number"
              step="0.01"
              min="0.01"
              value={valorDaReceitaVariavel}
              onChange={(evento) => setValorDaReceitaVariavel(evento.target.value)}
              required
            />
            <CampoDeEntrada
              rotulo="Data do recebimento"
              type="date"
              value={dataDoRecebimentoOuInicio}
              onChange={(evento) => setDataDoRecebimentoOuInicio(evento.target.value)}
              required
            />
          </>
        )}

        {mensagemDeErro && <p className="text-sm text-negativo">{mensagemDeErro}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Botao variante="secundario" tipo="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao tipo="submit" disabled={estaSalvando}>
            {estaSalvando ? 'Salvando…' : 'Salvar receita'}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
