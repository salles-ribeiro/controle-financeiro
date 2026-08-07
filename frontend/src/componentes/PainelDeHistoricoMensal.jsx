import { ChevronDown, History } from 'lucide-react';
import { Cartao } from './Cartao';
import { TabelaDeProjecaoMensal } from './TabelaDeProjecaoMensal';

const OPCOES_DE_QUANTIDADE_DE_MESES_DE_HISTORICO = [3, 6, 12];

export function PainelDeHistoricoMensal({
  aberto,
  aoAlternar,
  quantidadeDeMesesParaTras,
  aoTrocarQuantidade,
  historico,
  estaCarregando,
  mensagemDeErro,
  possuiRegistroDeRendaMensal,
  aoEditarGasto,
  aoExcluirGasto,
  aoEditarReceita,
  aoExcluirReceita,
}) {
  return (
    <Cartao className="p-4 sm:p-6">
      <button onClick={aoAlternar} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="flex items-center gap-2 font-display text-base text-texto-primario">
          <History className="h-4.5 w-4.5 text-texto-secundario" strokeWidth={1.75} />
          Histórico de meses anteriores
        </span>
        <ChevronDown
          className={`h-4 w-4 text-texto-secundario transition-transform ${aberto ? 'rotate-180' : ''}`}
          strokeWidth={1.75}
        />
      </button>

      {aberto && (
        <div className="mt-5">
          <div className="mb-5 flex w-fit items-center gap-2 rounded-lg bg-fundo-elevado p-1">
            {OPCOES_DE_QUANTIDADE_DE_MESES_DE_HISTORICO.map((quantidade) => (
              <button
                key={quantidade}
                onClick={() => aoTrocarQuantidade(quantidade)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  quantidadeDeMesesParaTras === quantidade
                    ? 'bg-acento-principal font-semibold text-fundo-principal'
                    : 'text-texto-secundario hover:text-texto-primario'
                }`}
              >
                {quantidade} meses
              </button>
            ))}
          </div>

          {mensagemDeErro && <p className="mb-4 text-sm text-negativo">{mensagemDeErro}</p>}

          {estaCarregando && <p className="text-sm text-texto-secundario">Carregando histórico…</p>}

          {!estaCarregando && historico && historico.listaDeMesesReferencia.length === 0 && (
            <p className="text-sm text-texto-terciario">Nenhum dado encontrado nesse período.</p>
          )}

          {!estaCarregando && historico && historico.listaDeMesesReferencia.length > 0 && (
            <TabelaDeProjecaoMensal
              titulo="Meses anteriores"
              listaDeMesesReferencia={historico.listaDeMesesReferencia}
              resumoMensal={historico.resumoMensal}
              detalhamentoPorGasto={historico.detalhamentoPorGasto}
              detalhamentoPorReceita={historico.detalhamentoPorReceita}
              possuiRegistroDeRendaMensal={possuiRegistroDeRendaMensal}
              aoEditarGasto={aoEditarGasto}
              aoExcluirGasto={aoExcluirGasto}
              aoEditarReceita={aoEditarReceita}
              aoExcluirReceita={aoExcluirReceita}
            />
          )}
        </div>
      )}
    </Cartao>
  );
}
