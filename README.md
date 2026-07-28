# Controle Financeiro

Sistema web para controle de gastos pessoais baseado no ciclo da fatura do
cartão de crédito: você cadastra gastos **fixos**, **à vista** ou
**parcelados**, define o **dia de virada** do seu cartão (o dia em que a
fatura fecha) e o sistema projeta automaticamente quanto você vai gastar em
cada um dos próximos meses.

```
controle-financeiro/
├── backend/     API em Node.js + Express + libSQL (SQLite local ou Turso na nuvem)
└── frontend/    Interface em React + Vite + Tailwind CSS
```

---

## Como funciona a regra do "dia da virada"

Se o dia de virada do seu cartão é, por exemplo, o dia **10**:

- Uma compra feita **até o dia 10** entra na fatura **deste mês**.
- Uma compra feita **depois do dia 10** só entra na fatura do **mês
  seguinte**.

Por isso, o dia 11 (o dia seguinte à virada) costuma ser o **melhor dia para
comprar**: é o dia que te dá o maior prazo possível até o vencimento. O
dashboard mostra uma faixa visual com esse ciclo e destaca esse dia.

Essa regra vale para os três tipos de gasto:

| Tipo         | Como é lançado nas faturas futuras                                          |
|--------------|------------------------------------------------------------------------------|
| **Fixo**     | O mesmo valor todo mês, a partir do mês da compra até uma data de término (opcional) ou indefinidamente |
| **À vista**  | O valor total inteiro, em um único mês                                       |
| **Parcelado**| O valor total dividido pela quantidade de parcelas, uma por mês, a partir do mês da compra |

Toda essa lógica está isolada em `backend/src/utilitarios/utilitarioDeCalculoDeFatura.js`
e `backend/src/servicos/servicoDeProjecaoFinanceira.js` — são os dois
arquivos a olhar se quiser ajustar o comportamento.

---

## Funcionalidades

- Cadastro e login de usuários (senha criptografada, autenticação via JWT)
- Cada usuário define seu próprio dia de virada
- Ativar/desativar o registro de renda mensal (opcional, como você pediu)
- Gastos fixos, à vista e parcelados, com categorias personalizáveis
- Receitas fixas (salário) ou variáveis (freelance, bônus etc.), quando a renda está ativada
- Dashboard com a projeção dos próximos 3, 6 ou 12 meses, com total de gastos,
  total de receitas e saldo previsto por mês
- Edição e exclusão de qualquer lançamento

---

## Rodando localmente

Pré-requisito: **Node.js 18 ou superior** em ambos os projetos. O backend usa
o driver `@libsql/client` (compatível com SQLite): em desenvolvimento local
ele grava tudo em um arquivo comum, sem precisar de conta em lugar nenhum.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # ajuste a CHAVE_SECRETA_DO_TOKEN antes de ir para produção
npm run dev             # http://localhost:3001
```

O banco `backend/dados/controle_financeiro.db` é criado automaticamente na
primeira execução.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

Em desenvolvimento, o Vite já encaminha `/api` para `http://localhost:3001`
(veja `frontend/vite.config.js`), então não precisa mudar nada — é só abrir
`http://localhost:5173` e criar sua conta.

---

## Colocando em produção (de graça)

Este projeto está pronto para rodar de graça, sem cartão de crédito, usando
três serviços:

| Parte | Serviço | Free tier |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Sempre grátis, nunca "dorme" |
| Backend | [Render](https://render.com) | Sempre grátis, "dorme" após 15 min sem uso (~1 min pra acordar) |
| Banco de dados | [Turso](https://turso.tech) | Sempre grátis, não expira nem pausa |

O banco precisa ficar num serviço à parte (Turso) porque o Render apaga os
arquivos locais do backend sempre que ele reinicia — um arquivo `.db` comum
não sobreviveria a isso. Veja o guia completo de deploy (passo a passo, com
criação de conta em cada serviço) no próximo passo desta conversa, ou:

1. **Turso**: crie um banco gratuito e gere um token de acesso
2. **Backend no Render**: conecte o repositório do GitHub, defina
   `CHAVE_SECRETA_DO_TOKEN`, `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` nas
   variáveis de ambiente
3. **Frontend na Vercel**: conecte o mesmo repositório, apontando a raiz do
   projeto para `frontend/`, e defina `VITE_URL_BASE_DA_API` com a URL
   pública do backend no Render (ex.: `https://seu-backend.onrender.com/api`)

Se um dia o projeto crescer e precisar de mais poder de banco de dados, a
camada de acesso a dados fica isolada em `backend/src/repositorios/` —
trocar de banco significa reescrever só esses arquivos, sem tocar em
controladores, rotas ou nas regras de negócio.

---

## Estrutura do backend

```
backend/src/
├── configuracao/     conexão com o banco e criação das tabelas
├── middlewares/       autenticacaoMiddleware (valida o token JWT)
├── utilitarios/        hash de senha, JWT, cálculo do dia de virada
├── repositorios/      todo o SQL fica isolado aqui (um arquivo por tabela)
├── servicos/          servicoDeProjecaoFinanceira (o "motor de cálculo")
├── controladores/     validação de entrada + orquestração das requisições
├── rotas/             mapeamento de URLs para os controladores
├── app.js             configuração do Express
└── servidor.js        ponto de entrada
```

Nomes de variáveis e funções são propositalmente descritivos (ex.:
`calcularMesDeReferenciaDaFatura`, `valorMensalDoGastoFixo`,
`possuiRegistroDeRendaMensal`) para facilitar entender e alterar o código no
futuro sem precisar decifrar abreviações.

## Estrutura do frontend

```
frontend/src/
├── contextos/ContextoDeAutenticacao.jsx    estado global de login
├── servicos/clienteDeApi.js                todas as chamadas HTTP à API
├── servicos/utilitariosDeFormatacao.js     formatação de moeda/data
├── componentes/                            peças reutilizáveis (tabela, modais, botões...)
└── paginas/                                Login, Cadastro, Dashboard, Configurações
```

---

## Segurança

Antes de colocar no ar, revisei e apliquei as seguintes proteções:

- **Senhas**: nunca armazenadas em texto puro — sempre com hash `bcrypt`.
- **Autenticação**: tokens JWT assinados com uma chave que **precisa** ser
  configurada (o servidor recusa iniciar sem `CHAVE_SECRETA_DO_TOKEN`
  definida — sem isso, qualquer pessoa poderia forjar um token válido).
- **SQL Injection**: todas as consultas usam parâmetros (`:nome`), nunca
  concatenação de texto vindo do usuário.
- **Isolamento entre usuários**: toda consulta/edição/exclusão sempre
  verifica que o registro pertence ao usuário autenticado (nunca confia em
  um ID enviado pelo cliente sozinho).
- **Rate limiting**: no máximo 20 tentativas de login/cadastro por IP a
  cada 15 minutos, para dificultar ataques de força bruta.
- **Cabeçalhos HTTP de segurança**: via `helmet` (protege contra
  sniffing de tipo de conteúdo, clickjacking, etc.).
- **CORS restrito**: configurável via `URL_DO_FRONTEND_PERMITIDA` — em
  produção, só o seu próprio frontend pode chamar a API.

### Antes de colocar em produção, você precisa:

1. Gerar uma `CHAVE_SECRETA_DO_TOKEN` aleatória de verdade (comando pronto
   no `.env.example`) — **nunca** use o valor de exemplo em produção.
2. Definir `URL_DO_FRONTEND_PERMITIDA` com a URL do seu frontend na Vercel.

### Trade-offs conscientes (aceitáveis para um projeto pessoal)

- O token fica salvo no `localStorage` do navegador, não em um cookie
  `httpOnly`. É o padrão mais simples de implementar e é seguro **desde
  que não haja XSS na aplicação** (o React escapa tudo por padrão, e o
  projeto não usa `dangerouslySetInnerHTML` em nenhum lugar). Um cookie
  `httpOnly` seria mais robusto, mas exige mais infraestrutura (CSRF
  token, etc.) — trade-off razoável para uso pessoal.
- O cadastro informa se um e-mail já existe (`409`), o que tecnicamente
  permite descobrir quais e-mails têm conta. É um padrão comum e aceito na
  maioria dos apps porque a alternativa (mensagens de erro ambíguas)
  piora bastante a experiência de quem está criando conta.
- Não há fluxo de "esqueci minha senha" — não é uma falha de segurança,
  é só uma funcionalidade que ainda falta.

---

Algumas ideias para evoluir o sistema, caso queira:

- Marcar parcelas/meses individuais como "pago"
- Múltiplos cartões, cada um com sua própria data de virada
- Gráficos de evolução de gastos por categoria
- Exportar a projeção para PDF ou planilha
- Notificações quando um gasto fixo está prestes a vencer
