const bibliotecaDeCriptografiaDeSenha = require('bcryptjs');
const bibliotecaDeTokenJwt = require('jsonwebtoken');

const QUANTIDADE_DE_RODADAS_DO_HASH_DE_SENHA = 10;
const TEMPO_DE_EXPIRACAO_DO_TOKEN = '7d';
const VALOR_DE_EXEMPLO_DO_ENV_EXAMPLE = 'altere-esta-chave-em-producao';

const CHAVE_SECRETA_DO_TOKEN = process.env.CHAVE_SECRETA_DO_TOKEN;

// Sem uma chave real definida, qualquer pessoa que conheça (ou adivinhe) o
// valor padrão poderia forjar um token válido para QUALQUER usuário. Por
// isso o servidor se recusa a subir sem essa variável de ambiente definida
// corretamente — é melhor falhar alto e cedo do que rodar inseguro.
if (!CHAVE_SECRETA_DO_TOKEN) {
  throw new Error(
    'A variável de ambiente CHAVE_SECRETA_DO_TOKEN precisa ser definida (veja o .env.example).'
  );
}

if (CHAVE_SECRETA_DO_TOKEN === VALOR_DE_EXEMPLO_DO_ENV_EXAMPLE) {
  console.warn(
    '\n⚠️  ATENÇÃO: CHAVE_SECRETA_DO_TOKEN ainda está com o valor de exemplo do .env.example.\n' +
      '   Isso é aceitável apenas em desenvolvimento local. Gere uma chave aleatória\n' +
      '   antes de colocar este servidor no ar (veja o guia de deploy).\n'
  );
}

function gerarHashDaSenha(senhaEmTextoPuro) {
  return bibliotecaDeCriptografiaDeSenha.hashSync(senhaEmTextoPuro, QUANTIDADE_DE_RODADAS_DO_HASH_DE_SENHA);
}

function senhaCorrespondeAoHash(senhaEmTextoPuro, senhaCriptografadaArmazenada) {
  return bibliotecaDeCriptografiaDeSenha.compareSync(senhaEmTextoPuro, senhaCriptografadaArmazenada);
}

function gerarTokenDeAcessoParaUsuario(identificadorDoUsuario) {
  return bibliotecaDeTokenJwt.sign(
    { identificadorDoUsuario },
    CHAVE_SECRETA_DO_TOKEN,
    { expiresIn: TEMPO_DE_EXPIRACAO_DO_TOKEN }
  );
}

function verificarTokenDeAcessoEObterConteudo(tokenRecebido) {
  return bibliotecaDeTokenJwt.verify(tokenRecebido, CHAVE_SECRETA_DO_TOKEN);
}

module.exports = {
  gerarHashDaSenha,
  senhaCorrespondeAoHash,
  gerarTokenDeAcessoParaUsuario,
  verificarTokenDeAcessoEObterConteudo,
};
