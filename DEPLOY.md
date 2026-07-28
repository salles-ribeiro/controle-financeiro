# Guia de Deploy Gratuito (Vercel + Render + Turso)

Este guia assume que você já criou conta nos três serviços e já tem uma
conta no GitHub.

## Passo 1 — Colocar o código no GitHub

1. Acesse **github.com** → botão **+** no canto superior direito → **New
   repository**
2. Dê um nome (ex.: `controle-financeiro`), deixe como **Private** ou
   **Public** (tanto faz), **não marque** nenhuma caixa de "Add README" ou
   "Add .gitignore" (já temos esses arquivos)
3. Clique em **Create repository**
4. O GitHub vai mostrar uma tela com comandos prontos, na seção "…or push
   an existing repository from the command line". Abra o terminal **na
   pasta `controle-financeiro`** (a pasta raiz, que contém `backend` e
   `frontend`) e cole esses comandos, um de cada vez. Devem parecer com
   isto (substitua pela URL que o GitHub te mostrar):

```
git init
git add .
git commit -m "Primeira versao"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/controle-financeiro.git
git push -u origin main
```

Se o Git não estiver instalado, baixe em **git-scm.com/download/win**
primeiro. Na hora do `git push`, uma janela do navegador pode abrir pedindo
para você autorizar — é normal, só confirmar o login do GitHub.

## Passo 2 — Criar o banco no Turso

1. Acesse **turso.tech** → entre na sua conta → você vai cair no painel
   (dashboard)
2. Crie um banco novo (botão de criar/"Create Database"), dê um nome como
   `controle-financeiro`
3. Depois de criado, entre nos detalhes do banco e procure:
   - A **URL de conexão** (começa com `libsql://...`)
   - Um botão para **gerar um token** de acesso (authToken) — copie assim
     que aparecer, alguns serviços só mostram uma vez
4. Guarde essas duas informações num bloco de notas — vamos usar no
   próximo passo

## Passo 3 — Backend no Render

1. Acesse **render.com** → **New +** → **Web Service**
2. Conecte sua conta do GitHub (se ainda não conectou) e selecione o
   repositório `controle-financeiro`
3. Preencha:
   - **Name**: `controle-financeiro-backend` (ou o nome que preferir)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Antes de criar, adicione as **Environment Variables** (variáveis de
   ambiente) — procure a seção "Environment" e adicione uma por uma:

   | Nome | Valor |
   |---|---|
   | `CHAVE_SECRETA_DO_TOKEN` | uma chave aleatória (veja abaixo) |
   | `TURSO_DATABASE_URL` | a URL que você copiou do Turso |
   | `TURSO_AUTH_TOKEN` | o token que você copiou do Turso |

   Para gerar uma chave aleatória, você pode usar esta, gerada
   especialmente para este projeto:
   ```
   f3d2cd7182b5d8fb5816edc216c808e1427c96781ef978375904122b8171e0d143e1c91b5af00bd07f0fd65d6cea2f64
   ```
   (Se quiser gerar a sua própria: abra um terminal na pasta `backend` e
   rode `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)

5. Clique em **Create Web Service** / **Deploy Web Service**. Acompanhe os
   logs — leva uns 2-3 minutos. Quando aparecer "Live" no topo, deu certo.
6. Copie a URL que o Render te deu (algo como
   `https://controle-financeiro-backend.onrender.com`)
7. Teste: abra essa URL + `/api/verificacao-de-saude` no navegador (ex.:
   `https://controle-financeiro-backend.onrender.com/api/verificacao-de-saude`).
   Deve aparecer `{"statusDaAplicacao":"operando normalmente"}`

## Passo 4 — Frontend na Vercel

1. Acesse **vercel.com** → **Add New...** → **Project**
2. Selecione o mesmo repositório `controle-financeiro`
3. Antes de dar deploy, clique em **Edit** ao lado de "Root Directory" e
   selecione a pasta **frontend**
4. O Vercel deve detectar automaticamente que é um projeto Vite (build
   command `npm run build`, output `dist`) — não precisa mexer
5. Abra **Environment Variables** e adicione:

   | Nome | Valor |
   |---|---|
   | `VITE_URL_BASE_DA_API` | a URL do Render + `/api` (ex.: `https://controle-financeiro-backend.onrender.com/api`) |

6. Clique em **Deploy**. Leva menos de um minuto.
7. Copie a URL que a Vercel te deu (algo como
   `https://controle-financeiro.vercel.app`)

## Passo 5 — Conectar os dois (CORS)

1. Volte para o **Render** → seu backend → aba **Environment**
2. Adicione mais uma variável:

   | Nome | Valor |
   |---|---|
   | `URL_DO_FRONTEND_PERMITIDA` | a URL da Vercel (ex.: `https://controle-financeiro.vercel.app`, **sem** barra no final) |

3. Salve — o Render reinicia o serviço automaticamente com a nova
   configuração (leva ~1 minuto)

## Passo 6 — Testar

1. Abra a URL da Vercel no navegador
2. Clique em **Cadastre-se** e crie sua conta

**Na primeira visita**, se o backend estava "dormindo" (sem uso há mais de
15 min), a primeira requisição pode demorar uns 30-60 segundos — é normal
do plano gratuito do Render, não é erro. Nas visitas seguintes fica rápido.

---

## Se algo der errado

- **Tela branca ou erro de rede no cadastro** → normalmente é CORS: confira
  se `URL_DO_FRONTEND_PERMITIDA` no Render está **idêntica** à URL da
  Vercel (sem barra `/` no final).
- **Erro 500 ao cadastrar** → confira se `TURSO_DATABASE_URL` e
  `TURSO_AUTH_TOKEN` no Render estão corretos (copiados sem espaços extras).
- **Render não builda** → confira se **Root Directory** está mesmo como
  `backend` (esse é o erro mais comum).
- **Vercel não builda** → confira se **Root Directory** está como
  `frontend`.
