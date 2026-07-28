const identificadorUnicoUniversal = require('node:crypto');
const { conexaoComBancoDeDados } = require('../configuracao/conexaoComBancoDeDados');

function converterLinhaDoUsuarioParaObjeto(linhaDoBanco) {
  if (!linhaDoBanco) return null;
  return {
    id: linhaDoBanco.id,
    nomeCompleto: linhaDoBanco.nomeCompleto,
    enderecoDeEmail: linhaDoBanco.enderecoDeEmail,
    senhaCriptografada: linhaDoBanco.senhaCriptografada,
    diaDeViradaDoCartao: linhaDoBanco.diaDeViradaDoCartao,
    possuiRegistroDeRendaMensal: Boolean(linhaDoBanco.possuiRegistroDeRendaMensal),
    dataDeCriacaoDoCadastro: linhaDoBanco.dataDeCriacaoDoCadastro,
    dataDaUltimaAtualizacao: linhaDoBanco.dataDaUltimaAtualizacao,
  };
}

async function criarNovoUsuario({ nomeCompleto, enderecoDeEmail, senhaCriptografada, diaDeViradaDoCartao, possuiRegistroDeRendaMensal }) {
  const identificadorDoNovoUsuario = identificadorUnicoUniversal.randomUUID();
  const dataAtualEmFormatoIso = new Date().toISOString();

  await conexaoComBancoDeDados.execute({
    sql: `
      INSERT INTO usuarios (
        id, nomeCompleto, enderecoDeEmail, senhaCriptografada,
        diaDeViradaDoCartao, possuiRegistroDeRendaMensal,
        dataDeCriacaoDoCadastro, dataDaUltimaAtualizacao
      ) VALUES (
        :id, :nomeCompleto, :enderecoDeEmail, :senhaCriptografada,
        :diaDeViradaDoCartao, :possuiRegistroDeRendaMensal,
        :dataDeCriacaoDoCadastro, :dataDaUltimaAtualizacao
      )
    `,
    args: {
      id: identificadorDoNovoUsuario,
      nomeCompleto,
      enderecoDeEmail,
      senhaCriptografada,
      diaDeViradaDoCartao,
      possuiRegistroDeRendaMensal: possuiRegistroDeRendaMensal ? 1 : 0,
      dataDeCriacaoDoCadastro: dataAtualEmFormatoIso,
      dataDaUltimaAtualizacao: dataAtualEmFormatoIso,
    },
  });

  return buscarUsuarioPorId(identificadorDoNovoUsuario);
}

async function buscarUsuarioPorEmail(enderecoDeEmail) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: 'SELECT * FROM usuarios WHERE enderecoDeEmail = :enderecoDeEmail',
    args: { enderecoDeEmail },
  });
  return converterLinhaDoUsuarioParaObjeto(resultado.rows[0]);
}

async function buscarUsuarioPorId(id) {
  const resultado = await conexaoComBancoDeDados.execute({
    sql: 'SELECT * FROM usuarios WHERE id = :id',
    args: { id },
  });
  return converterLinhaDoUsuarioParaObjeto(resultado.rows[0]);
}

async function atualizarPerfilDoUsuario(id, { diaDeViradaDoCartao, possuiRegistroDeRendaMensal }) {
  const dataAtualEmFormatoIso = new Date().toISOString();

  await conexaoComBancoDeDados.execute({
    sql: `
      UPDATE usuarios
      SET diaDeViradaDoCartao = :diaDeViradaDoCartao,
          possuiRegistroDeRendaMensal = :possuiRegistroDeRendaMensal,
          dataDaUltimaAtualizacao = :dataDaUltimaAtualizacao
      WHERE id = :id
    `,
    args: {
      id,
      diaDeViradaDoCartao,
      possuiRegistroDeRendaMensal: possuiRegistroDeRendaMensal ? 1 : 0,
      dataDaUltimaAtualizacao: dataAtualEmFormatoIso,
    },
  });

  return buscarUsuarioPorId(id);
}

module.exports = {
  criarNovoUsuario,
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  atualizarPerfilDoUsuario,
};
