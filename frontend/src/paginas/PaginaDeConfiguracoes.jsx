import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { usarAutenticacao } from '../contextos/ContextoDeAutenticacao';
import { clienteDeApi } from '../servicos/clienteDeApi';
import { Cartao } from '../componentes/Cartao';
import { Botao } from '../componentes/Botao';
import { CampoDeEntrada } from '../componentes/CamposDeFormulario';

const CORES_DISPONIVEIS_PARA_CATEGORIA = ['#C9A25D', '#4FBF8B', '#5B9BD5', '#E0665A', '#A78BDA', '#8B96A3'];

export function PaginaDeConfiguracoes() {
  const { usuarioAutenticado, atualizarUsuarioNoContexto } = usarAutenticacao();

  const [diaDeViradaDoCartao, setDiaDeViradaDoCartao] = useState(usuarioAutenticado.diaDeViradaDoCartao);
  const [possuiRegistroDeRendaMensal, setPossuiRegistroDeRendaMensal] = useState(
    usuarioAutenticado.possuiRegistroDeRendaMensal
  );
  const [valorDaRendaMensal, setValorDaRendaMensal] = useState('');
  const [receitaPrincipal, setReceitaPrincipal] = useState(null);
  const [estaSalvandoPerfil, setEstaSalvandoPerfil] = useState(false);
  const [mensagemDePerfilSalvo, setMensagemDePerfilSalvo] = useState('');
  const [mensagemDeErroDoPerfil, setMensagemDeErroDoPerfil] = useState('');

  const [listaDeCategorias, setListaDeCategorias] = useState([]);
  const [nomeDaNovaCategoria, setNomeDaNovaCategoria] = useState('');
  const [mensagemDeErroDaCategoria, setMensagemDeErroDaCategoria] = useState('');

  useEffect(() => {
    clienteDeApi.listarCategorias().then(({ categorias }) => setListaDeCategorias(categorias));
  }, []);

  useEffect(() => {
    if (!usuarioAutenticado.possuiRegistroDeRendaMensal) return;
    clienteDeApi.listarReceitas().then(({ receitas }) => {
      const receitaEncontrada = receitas.find((receita) => receita.tipoDaReceita === 'FIXA');
      if (receitaEncontrada) {
        setReceitaPrincipal(receitaEncontrada);
        setValorDaRendaMensal(String(receitaEncontrada.valorMensalDaReceitaFixa));
      }
    });
  }, [usuarioAutenticado.possuiRegistroDeRendaMensal]);

  async function tratarEnvioDoPerfil(evento) {
    evento.preventDefault();
    setMensagemDeErroDoPerfil('');
    setMensagemDePerfilSalvo('');
    setEstaSalvandoPerfil(true);
    try {
      const { usuario } = await clienteDeApi.atualizarPerfil({
        diaDeViradaDoCartao: Number(diaDeViradaDoCartao),
        possuiRegistroDeRendaMensal,
      });

      if (possuiRegistroDeRendaMensal && valorDaRendaMensal) {
        if (receitaPrincipal) {
          const { receita } = await clienteDeApi.atualizarReceita(receitaPrincipal.id, {
            descricaoDaReceita: receitaPrincipal.descricaoDaReceita,
            tipoDaReceita: 'FIXA',
            valorMensalDaReceitaFixa: Number(valorDaRendaMensal),
            dataDoRecebimentoOuInicio: receitaPrincipal.dataDoRecebimentoOuInicio.slice(0, 10),
            dataDeTerminoDaRecorrenciaFixa: receitaPrincipal.dataDeTerminoDaRecorrenciaFixa
              ? receitaPrincipal.dataDeTerminoDaRecorrenciaFixa.slice(0, 10)
              : null,
          });
          setReceitaPrincipal(receita);
        } else {
          const { receita } = await clienteDeApi.criarReceita({
            descricaoDaReceita: 'Renda mensal',
            tipoDaReceita: 'FIXA',
            valorMensalDaReceitaFixa: Number(valorDaRendaMensal),
            dataDoRecebimentoOuInicio: new Date().toISOString().slice(0, 10),
            dataDeTerminoDaRecorrenciaFixa: null,
          });
          setReceitaPrincipal(receita);
        }
      }

      atualizarUsuarioNoContexto(usuario);
      setMensagemDePerfilSalvo('Preferências salvas com sucesso.');
    } catch (erroAoSalvarPerfil) {
      setMensagemDeErroDoPerfil(erroAoSalvarPerfil.message);
    } finally {
      setEstaSalvandoPerfil(false);
    }
  }

  async function tratarCriacaoDeCategoria(evento) {
    evento.preventDefault();
    setMensagemDeErroDaCategoria('');
    if (!nomeDaNovaCategoria.trim()) return;

    const corEscolhida =
      CORES_DISPONIVEIS_PARA_CATEGORIA[listaDeCategorias.length % CORES_DISPONIVEIS_PARA_CATEGORIA.length];

    try {
      const { categoria } = await clienteDeApi.criarCategoria({
        nomeDaCategoria: nomeDaNovaCategoria.trim(),
        corDeExibicao: corEscolhida,
      });
      setListaDeCategorias((categoriasAtuais) => [...categoriasAtuais, categoria]);
      setNomeDaNovaCategoria('');
    } catch (erroAoCriarCategoria) {
      setMensagemDeErroDaCategoria(erroAoCriarCategoria.message);
    }
  }

  async function tratarExclusaoDeCategoria(id) {
    if (!window.confirm('Excluir esta categoria? Gastos que a usam ficarão sem categoria.')) return;
    await clienteDeApi.excluirCategoria(id);
    setListaDeCategorias((categoriasAtuais) => categoriasAtuais.filter((categoria) => categoria.id !== id));
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
      <h1 className="font-display text-2xl text-texto-primario">Configurações</h1>

      <Cartao className="p-5 sm:p-6">
        <h2 className="mb-1 font-display text-lg text-texto-primario">Cartão e renda</h2>
        <p className="mb-5 text-sm text-texto-secundario">
          Isso define como suas compras são agrupadas nas faturas futuras.
        </p>

        <form onSubmit={tratarEnvioDoPerfil} className="flex flex-col gap-4">
          <CampoDeEntrada
            rotulo="Dia de virada do cartão"
            mensagemDeAjuda="O dia seguinte a este é o melhor dia para comprar."
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

          {possuiRegistroDeRendaMensal && (
            <CampoDeEntrada
              rotulo="Valor da renda mensal (R$)"
              mensagemDeAjuda="Outras receitas (fixas ou variáveis) podem ser adicionadas no Dashboard."
              type="number"
              step="0.01"
              min="0.01"
              value={valorDaRendaMensal}
              onChange={(evento) => setValorDaRendaMensal(evento.target.value)}
              required
            />
          )}

          {mensagemDeErroDoPerfil && <p className="text-sm text-negativo">{mensagemDeErroDoPerfil}</p>}
          {mensagemDePerfilSalvo && <p className="text-sm text-positivo">{mensagemDePerfilSalvo}</p>}

          <Botao tipo="submit" disabled={estaSalvandoPerfil} className="w-fit">
            {estaSalvandoPerfil ? 'Salvando…' : 'Salvar preferências'}
          </Botao>
        </form>
      </Cartao>

      <Cartao className="p-5 sm:p-6">
        <h2 className="mb-1 font-display text-lg text-texto-primario">Categorias de gasto</h2>
        <p className="mb-5 text-sm text-texto-secundario">Organize seus gastos por categoria (opcional).</p>

        <ul className="mb-4 flex flex-col gap-2">
          {listaDeCategorias.map((categoria) => (
            <li
              key={categoria.id}
              className="flex items-center justify-between rounded-lg border border-borda-sutil bg-fundo-elevado px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoria.corDeExibicao }} />
                <span className="text-sm text-texto-primario">{categoria.nomeDaCategoria}</span>
              </div>
              <button
                onClick={() => tratarExclusaoDeCategoria(categoria.id)}
                className="rounded-md p-1.5 text-texto-terciario hover:bg-negativo-suave hover:text-negativo"
                aria-label={`Excluir categoria ${categoria.nomeDaCategoria}`}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={tratarCriacaoDeCategoria} className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-borda-sutil bg-fundo-elevado px-3.5 py-2.5 text-sm text-texto-primario placeholder:text-texto-terciario focus:border-acento-principal focus:outline-none"
            placeholder="Nova categoria"
            value={nomeDaNovaCategoria}
            onChange={(evento) => setNomeDaNovaCategoria(evento.target.value)}
          />
          <Botao tipo="submit" variante="secundario">
            <Plus className="h-4 w-4" strokeWidth={2} />
          </Botao>
        </form>
        {mensagemDeErroDaCategoria && <p className="mt-2 text-sm text-negativo">{mensagemDeErroDaCategoria}</p>}
      </Cartao>
    </main>
  );
}
