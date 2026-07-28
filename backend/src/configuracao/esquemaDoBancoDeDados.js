// Definição das tabelas do banco de dados, como uma lista de comandos SQL
// independentes (em vez de uma única string com ";"), porque o driver do
// libSQL executa lotes de comandos como uma lista (client.batch(...)).
// Isso roda tanto contra um arquivo SQLite local quanto contra o Turso.

const listaDeComandosSqlDeCriacaoDasTabelas = [
  'PRAGMA foreign_keys = ON',

  `CREATE TABLE IF NOT EXISTS usuarios (
    id                              TEXT PRIMARY KEY,
    nomeCompleto                    TEXT NOT NULL,
    enderecoDeEmail                 TEXT NOT NULL UNIQUE,
    senhaCriptografada              TEXT NOT NULL,
    diaDeViradaDoCartao             INTEGER NOT NULL DEFAULT 1,
    possuiRegistroDeRendaMensal     INTEGER NOT NULL DEFAULT 0,
    dataDeCriacaoDoCadastro         TEXT NOT NULL,
    dataDaUltimaAtualizacao         TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS categorias_de_gasto (
    id                TEXT PRIMARY KEY,
    usuarioId         TEXT NOT NULL,
    nomeDaCategoria   TEXT NOT NULL,
    corDeExibicao     TEXT NOT NULL DEFAULT '#C9A25D',
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuarioId, nomeDaCategoria)
  )`,

  `CREATE TABLE IF NOT EXISTS gastos (
    id                                TEXT PRIMARY KEY,
    usuarioId                        TEXT NOT NULL,
    categoriaId                      TEXT,
    descricaoDoGasto                 TEXT NOT NULL,
    tipoDoGasto                      TEXT NOT NULL CHECK (tipoDoGasto IN ('FIXO','A_VISTA','PARCELADO')),
    valorTotalDoGasto                REAL,
    valorMensalDoGastoFixo           REAL,
    quantidadeDeParcelas             INTEGER,
    dataDaCompraOuContratacao        TEXT NOT NULL,
    dataDeTerminoDaRecorrenciaFixa   TEXT,
    gastoAtivo                       INTEGER NOT NULL DEFAULT 1,
    dataDeCriacaoDoRegistro          TEXT NOT NULL,
    dataDaUltimaAtualizacao          TEXT NOT NULL,
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoriaId) REFERENCES categorias_de_gasto(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS receitas (
    id                                TEXT PRIMARY KEY,
    usuarioId                        TEXT NOT NULL,
    descricaoDaReceita               TEXT NOT NULL,
    tipoDaReceita                    TEXT NOT NULL CHECK (tipoDaReceita IN ('FIXA','VARIAVEL')),
    valorMensalDaReceitaFixa          REAL,
    valorDaReceitaVariavel           REAL,
    dataDoRecebimentoOuInicio        TEXT NOT NULL,
    dataDeTerminoDaRecorrenciaFixa   TEXT,
    receitaAtiva                     INTEGER NOT NULL DEFAULT 1,
    dataDeCriacaoDoRegistro          TEXT NOT NULL,
    dataDaUltimaAtualizacao          TEXT NOT NULL,
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE
  )`,

  'CREATE INDEX IF NOT EXISTS indice_gastos_por_usuario ON gastos(usuarioId)',
  'CREATE INDEX IF NOT EXISTS indice_receitas_por_usuario ON receitas(usuarioId)',
  'CREATE INDEX IF NOT EXISTS indice_categorias_por_usuario ON categorias_de_gasto(usuarioId)',
];

module.exports = { listaDeComandosSqlDeCriacaoDasTabelas };
