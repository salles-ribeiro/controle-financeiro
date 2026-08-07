import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clienteDeApi } from '../servicos/clienteDeApi';

const ContextoDeAutenticacao = createContext(null);

const QUANTIDADE_DE_TENTATIVAS_AO_CARREGAR_PERFIL = 3;
const INTERVALO_ENTRE_TENTATIVAS_EM_MILISSEGUNDOS = 3000;

function aguardar(duracaoEmMilissegundos) {
  return new Promise((resolver) => setTimeout(resolver, duracaoEmMilissegundos));
}

export function ProvedorDeAutenticacao({ children }) {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [carregandoAutenticacaoInicial, setCarregandoAutenticacaoInicial] = useState(true);

  const carregarPerfilDoUsuarioLogado = useCallback(async () => {
    const tokenExistente = clienteDeApi.obterTokenDeAcessoArmazenado();
    if (!tokenExistente) {
      setCarregandoAutenticacaoInicial(false);
      return;
    }
    for (let numeroDaTentativa = 1; numeroDaTentativa <= QUANTIDADE_DE_TENTATIVAS_AO_CARREGAR_PERFIL; numeroDaTentativa += 1) {
      try {
        const { usuario } = await clienteDeApi.obterPerfil();
        setUsuarioAutenticado(usuario);
        break;
      } catch (erroAoCarregarPerfil) {
        // Só remove o token quando o servidor confirma que ele é inválido/expirado.
        // Falhas de rede ou o backend demorando a responder (ex.: "acordando" após
        // ficar inativo) não devem forçar um novo login — tentamos de novo antes de desistir.
        if (erroAoCarregarPerfil.statusHttp === 401) {
          clienteDeApi.removerTokenDeAcessoArmazenado();
          break;
        }
        const eraAUltimaTentativa = numeroDaTentativa === QUANTIDADE_DE_TENTATIVAS_AO_CARREGAR_PERFIL;
        if (!eraAUltimaTentativa) {
          await aguardar(INTERVALO_ENTRE_TENTATIVAS_EM_MILISSEGUNDOS);
        }
      }
    }
    setCarregandoAutenticacaoInicial(false);
  }, []);

  useEffect(() => {
    carregarPerfilDoUsuarioLogado();
  }, [carregarPerfilDoUsuarioLogado]);

  async function entrar(enderecoDeEmail, senha) {
    const { tokenDeAcesso, usuario } = await clienteDeApi.entrarComEmailESenha({ enderecoDeEmail, senha });
    clienteDeApi.armazenarTokenDeAcesso(tokenDeAcesso);
    setUsuarioAutenticado(usuario);
  }

  async function cadastrar(dadosDeCadastro) {
    const { tokenDeAcesso, usuario } = await clienteDeApi.cadastrarUsuario(dadosDeCadastro);
    clienteDeApi.armazenarTokenDeAcesso(tokenDeAcesso);
    setUsuarioAutenticado(usuario);
  }

  function sair() {
    clienteDeApi.removerTokenDeAcessoArmazenado();
    setUsuarioAutenticado(null);
  }

  function atualizarUsuarioNoContexto(usuarioAtualizado) {
    setUsuarioAutenticado(usuarioAtualizado);
  }

  const valorDoContexto = {
    usuarioAutenticado,
    carregandoAutenticacaoInicial,
    entrar,
    cadastrar,
    sair,
    atualizarUsuarioNoContexto,
  };

  return <ContextoDeAutenticacao.Provider value={valorDoContexto}>{children}</ContextoDeAutenticacao.Provider>;
}

export function usarAutenticacao() {
  const contexto = useContext(ContextoDeAutenticacao);
  if (!contexto) {
    throw new Error('usarAutenticacao precisa ser usado dentro de um ProvedorDeAutenticacao.');
  }
  return contexto;
}
