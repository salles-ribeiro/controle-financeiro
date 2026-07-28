import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clienteDeApi } from '../servicos/clienteDeApi';

const ContextoDeAutenticacao = createContext(null);

export function ProvedorDeAutenticacao({ children }) {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [carregandoAutenticacaoInicial, setCarregandoAutenticacaoInicial] = useState(true);

  const carregarPerfilDoUsuarioLogado = useCallback(async () => {
    const tokenExistente = clienteDeApi.obterTokenDeAcessoArmazenado();
    if (!tokenExistente) {
      setCarregandoAutenticacaoInicial(false);
      return;
    }
    try {
      const { usuario } = await clienteDeApi.obterPerfil();
      setUsuarioAutenticado(usuario);
    } catch (erroAoCarregarPerfil) {
      clienteDeApi.removerTokenDeAcessoArmazenado();
    } finally {
      setCarregandoAutenticacaoInicial(false);
    }
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
