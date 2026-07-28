const expressFramework = require('express');
const bibliotecaDeCors = require('cors');
const bibliotecaDeHelmet = require('helmet');

const rotasDeAutenticacao = require('./rotas/rotasDeAutenticacao');
const rotasDeUsuario = require('./rotas/rotasDeUsuario');
const rotasDeCategoria = require('./rotas/rotasDeCategoria');
const rotasDeGasto = require('./rotas/rotasDeGasto');
const rotasDeReceita = require('./rotas/rotasDeReceita');
const rotasDeProjecao = require('./rotas/rotasDeProjecao');

const aplicacaoExpress = expressFramework();

// Cabeçalhos de segurança padrão (X-Content-Type-Options, evita clickjacking, etc.)
aplicacaoExpress.use(bibliotecaDeHelmet());

// Em produção, defina URL_DO_FRONTEND_PERMITIDA com o endereço exato do seu
// frontend (ex.: https://seu-app.vercel.app) para que só ele possa chamar
// esta API. Sem essa variável, libera qualquer origem — prático para
// desenvolvimento local, mas não recomendado para produção.
const urlDoFrontendPermitida = process.env.URL_DO_FRONTEND_PERMITIDA;
if (!urlDoFrontendPermitida) {
  console.warn(
    '\n⚠️  ATENÇÃO: URL_DO_FRONTEND_PERMITIDA não foi definida — o CORS está liberado\n' +
      '   para qualquer origem. Configure essa variável em produção.\n'
  );
}
aplicacaoExpress.use(bibliotecaDeCors(urlDoFrontendPermitida ? { origin: urlDoFrontendPermitida } : undefined));

aplicacaoExpress.use(expressFramework.json());

aplicacaoExpress.get('/api/verificacao-de-saude', (requisicao, resposta) => {
  resposta.status(200).json({ statusDaAplicacao: 'operando normalmente' });
});

aplicacaoExpress.use('/api/autenticacao', rotasDeAutenticacao);
aplicacaoExpress.use('/api/usuarios', rotasDeUsuario);
aplicacaoExpress.use('/api/categorias', rotasDeCategoria);
aplicacaoExpress.use('/api/gastos', rotasDeGasto);
aplicacaoExpress.use('/api/receitas', rotasDeReceita);
aplicacaoExpress.use('/api/projecao', rotasDeProjecao);

aplicacaoExpress.use((requisicao, resposta) => {
  resposta.status(404).json({ mensagemDeErro: 'Rota não encontrada.' });
});

// Tratador de erros genérico: evita que uma exceção não prevista derrube o servidor
// e sempre devolve uma resposta em JSON no mesmo formato usado no resto da API.
aplicacaoExpress.use((erro, requisicao, resposta, proximoMiddleware) => {
  console.error('Erro não tratado na aplicação:', erro);
  resposta.status(500).json({ mensagemDeErro: 'Erro interno no servidor.' });
});

module.exports = aplicacaoExpress;
