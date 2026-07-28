require('dotenv').config();

const { garantirQueAsTabelasExistem } = require('./configuracao/conexaoComBancoDeDados');
const aplicacaoExpress = require('./app');

// O Render (e a maioria dos serviços de hospedagem) define automaticamente
// a variável PORT e espera que o servidor escute exatamente nela. Em
// desenvolvimento local, nenhuma das duas costuma estar definida, então
// cai no padrão 3001.
const PORTA_DO_SERVIDOR = process.env.PORT || process.env.PORTA_DO_SERVIDOR || 3001;

garantirQueAsTabelasExistem()
  .then(() => {
    aplicacaoExpress.listen(PORTA_DO_SERVIDOR, () => {
      console.log(`Servidor do Controle Financeiro rodando em http://localhost:${PORTA_DO_SERVIDOR}`);
    });
  })
  .catch((erroAoPrepararOBanco) => {
    console.error('Erro ao preparar o banco de dados:', erroAoPrepararOBanco);
    process.exit(1);
  });
