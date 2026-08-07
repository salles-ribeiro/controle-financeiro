import { Pencil, Trash2 } from 'lucide-react';
import { formatarValorComoMoedaBrasileira, RESUMO_DOS_TIPOS_DE_GASTO, RESUMO_DOS_TIPOS_DE_RECEITA } from '../servicos/utilitariosDeFormatacao';

function celulaDeValor(valor, corQuandoPositivo = 'text-texto-primario') {
  const valorArredondado = Math.round((valor + Number.EPSILON) * 100) / 100;
  if (!valorArredondado) {
    return <span className="text-texto-terciario">—</span>;
  }
  return <span className={corQuandoPositivo}>{formatarValorComoMoedaBrasileira(valorArredondado)}</span>;
}

function LinhaDeGasto({ gasto, listaDeMesesReferencia, aoEditar, aoExcluir }) {
  const infoDoTipo = RESUMO_DOS_TIPOS_DE_GASTO[gasto.tipoDoGasto];
  const subtitulo =
    gasto.tipoDoGasto === 'PARCELADO' ? `${gasto.quantidadeDeParcelas}x · ${infoDoTipo.descricaoCurta}` : infoDoTipo.descricaoCurta;

  return (
    <tr className="group border-t border-borda-sutil transition-colors hover:bg-fundo-elevado/40">
      <td className="sticky left-0 z-10 min-w-[220px] bg-fundo-painel px-4 py-3 group-hover:bg-fundo-elevado/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: gasto.corDeExibicaoDaCategoria || '#5c6773' }}
            />
            <div>
              <p className="leading-tight text-texto-primario">{gasto.descricaoDoGasto}</p>
              <p className="text-xs leading-tight text-texto-terciario">{subtitulo}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => aoEditar(gasto)}
              className="rounded-md p-1.5 text-texto-terciario hover:bg-fundo-elevado-hover hover:text-texto-primario"
              aria-label={`Editar ${gasto.descricaoDoGasto}`}
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => aoExcluir(gasto.id)}
              className="rounded-md p-1.5 text-texto-terciario hover:bg-negativo-suave hover:text-negativo"
              aria-label={`Excluir ${gasto.descricaoDoGasto}`}
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </td>
      {listaDeMesesReferencia.map((mesReferencia) => (
        <td key={mesReferencia} className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
          {celulaDeValor(gasto.valoresPorMesReferencia[mesReferencia])}
        </td>
      ))}
    </tr>
  );
}

function LinhaDeReceita({ receita, listaDeMesesReferencia, aoEditar, aoExcluir }) {
  const infoDoTipo = RESUMO_DOS_TIPOS_DE_RECEITA[receita.tipoDaReceita];

  return (
    <tr className="group border-t border-borda-sutil transition-colors hover:bg-fundo-elevado/40">
      <td className="sticky left-0 z-10 min-w-[220px] bg-fundo-painel px-4 py-3 group-hover:bg-fundo-elevado/40">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="leading-tight text-texto-primario">{receita.descricaoDaReceita}</p>
            <p className="text-xs leading-tight text-texto-terciario">{infoDoTipo.descricaoCurta}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => aoEditar(receita)}
              className="rounded-md p-1.5 text-texto-terciario hover:bg-fundo-elevado-hover hover:text-texto-primario"
              aria-label={`Editar ${receita.descricaoDaReceita}`}
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => aoExcluir(receita.id)}
              className="rounded-md p-1.5 text-texto-terciario hover:bg-negativo-suave hover:text-negativo"
              aria-label={`Excluir ${receita.descricaoDaReceita}`}
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </td>
      {listaDeMesesReferencia.map((mesReferencia) => (
        <td key={mesReferencia} className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
          {celulaDeValor(receita.valoresPorMesReferencia[mesReferencia], 'text-positivo')}
        </td>
      ))}
    </tr>
  );
}

function LinhaDeSecao({ titulo, quantidadeDeColunas }) {
  return (
    <tr>
      <td
        colSpan={quantidadeDeColunas}
        className="sticky left-0 bg-fundo-painel px-4 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-texto-terciario"
      >
        {titulo}
      </td>
    </tr>
  );
}

export function TabelaDeProjecaoMensal({
  titulo = 'Próximos meses',
  listaDeMesesReferencia,
  resumoMensal,
  detalhamentoPorGasto,
  detalhamentoPorReceita,
  possuiRegistroDeRendaMensal,
  aoEditarGasto,
  aoExcluirGasto,
  aoEditarReceita,
  aoExcluirReceita,
}) {
  const quantidadeDeColunas = listaDeMesesReferencia.length + 1;

  return (
    <div className="overflow-x-auto rolagem-discreta">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-[220px] bg-fundo-painel px-4 pb-3 text-left align-bottom font-display text-base font-normal text-texto-primario">
              {titulo}
            </th>
            {resumoMensal.map((mes) => (
              <th
                key={mes.mesReferencia}
                className="whitespace-nowrap px-4 pb-3 text-right align-bottom font-display text-base font-normal text-texto-primario"
              >
                {mes.nomeDoMesFormatadoParaExibicao}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <LinhaDeSecao titulo="Gastos" quantidadeDeColunas={quantidadeDeColunas} />
          {detalhamentoPorGasto.length === 0 && (
            <tr>
              <td colSpan={quantidadeDeColunas} className="px-4 py-6 text-sm text-texto-terciario">
                Nenhum gasto cadastrado ainda.
              </td>
            </tr>
          )}
          {detalhamentoPorGasto.map((gasto) => (
            <LinhaDeGasto
              key={gasto.id}
              gasto={gasto}
              listaDeMesesReferencia={listaDeMesesReferencia}
              aoEditar={aoEditarGasto}
              aoExcluir={aoExcluirGasto}
            />
          ))}
          <tr className="border-t-2 border-acento-principal-suave font-semibold">
            <td className="sticky left-0 z-10 bg-fundo-painel px-4 py-3 text-texto-primario">Total de gastos</td>
            {resumoMensal.map((mes) => (
              <td key={mes.mesReferencia} className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-negativo">
                {formatarValorComoMoedaBrasileira(mes.totalDeGastosNoMes)}
              </td>
            ))}
          </tr>

          {possuiRegistroDeRendaMensal && (
            <>
              <LinhaDeSecao titulo="Receitas" quantidadeDeColunas={quantidadeDeColunas} />
              {detalhamentoPorReceita.length === 0 && (
                <tr>
                  <td colSpan={quantidadeDeColunas} className="px-4 py-6 text-sm text-texto-terciario">
                    Nenhuma receita cadastrada ainda.
                  </td>
                </tr>
              )}
              {detalhamentoPorReceita.map((receita) => (
                <LinhaDeReceita
                  key={receita.id}
                  receita={receita}
                  listaDeMesesReferencia={listaDeMesesReferencia}
                  aoEditar={aoEditarReceita}
                  aoExcluir={aoExcluirReceita}
                />
              ))}
              <tr className="border-t-2 border-acento-principal-suave font-semibold">
                <td className="sticky left-0 z-10 bg-fundo-painel px-4 py-3 text-texto-primario">Total de receitas</td>
                {resumoMensal.map((mes) => (
                  <td key={mes.mesReferencia} className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-positivo">
                    {formatarValorComoMoedaBrasileira(mes.totalDeReceitasNoMes)}
                  </td>
                ))}
              </tr>

              <tr className="border-t border-borda-media bg-fundo-elevado/40 font-semibold">
                <td className="sticky left-0 z-10 bg-fundo-elevado/95 px-4 py-3 text-texto-primario">Saldo previsto</td>
                {resumoMensal.map((mes) => (
                  <td
                    key={mes.mesReferencia}
                    className={`whitespace-nowrap px-4 py-3 text-right tabular-nums ${
                      mes.saldoPrevistoNoMes < 0 ? 'text-negativo' : 'text-positivo'
                    }`}
                  >
                    {formatarValorComoMoedaBrasileira(mes.saldoPrevistoNoMes)}
                  </td>
                ))}
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
