const caminhoDoSistemaDeArquivos = require('node:path');
const sistemaDeArquivos = require('node:fs');
const { createClient } = require('@libsql/client');
const { listaDeComandosSqlDeCriacaoDasTabelas } = require('./esquemaDoBancoDeDados');

const caminhoDaPastaDeDados = caminhoDoSistemaDeArquivos.join(__dirname, '..', '..', 'dados');

if (!sistemaDeArquivos.existsSync(caminhoDaPastaDeDados)) {
  sistemaDeArquivos.mkdirSync(caminhoDaPastaDeDados, { recursive: true });
}

// Monta um caminho no formato "file:/caminho/com/barras" (funciona em
// Windows, Mac e Linux) para uso em desenvolvimento local.
const caminhoAbsolutoDoArquivoDeBanco = caminhoDoSistemaDeArquivos.join(
  caminhoDaPastaDeDados,
  'controle_financeiro.db'
);
const urlDoBancoDeDadosLocal = `file:${caminhoAbsolutoDoArquivoDeBanco.split(caminhoDoSistemaDeArquivos.sep).join('/')}`;

// Em produção (Render + Turso), defina as variáveis de ambiente
// TURSO_DATABASE_URL e TURSO_AUTH_TOKEN para conectar no banco na nuvem.
// Sem elas, roda localmente usando um arquivo SQLite comum — não precisa
// de conta em nada para desenvolver.
const conexaoComBancoDeDados = createClient({
  url: process.env.TURSO_DATABASE_URL || urlDoBancoDeDadosLocal,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirQueAsTabelasExistem() {
  await conexaoComBancoDeDados.batch(listaDeComandosSqlDeCriacaoDasTabelas, 'write');
}

module.exports = { conexaoComBancoDeDados, garantirQueAsTabelasExistem };
