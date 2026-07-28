# Como rodar o projeto no Windows (passo a passo para iniciantes)

Este projeto tem duas partes que rodam ao mesmo tempo, cada uma na sua
própria janela do terminal:

- **backend** → o "motor" do sistema (guarda os dados, faz os cálculos)
- **frontend** → a tela que você vê e usa no navegador

Você vai precisar deixar **duas janelas do terminal abertas** enquanto usa o
sistema. Parece mais complicado do que é — vamos por partes.

---

## Passo 1 — Instalar o Node.js (só na primeira vez)

O Node.js é o programa que executa o backend e o frontend.

1. Acesse **https://nodejs.org**
2. Baixe a versão **LTS** (é a recomendada, tem um botão bem visível na
   página inicial)
3. Abra o instalador baixado e clique em "Next" em tudo (pode deixar tudo no
   padrão)
4. Depois de instalar, **reinicie o computador** (isso evita problemas de o
   Windows não reconhecer o comando `node` depois)

Para confirmar que deu certo, abra o **Prompt de Comando** (aperte a tecla
Windows, digite `cmd` e dê Enter) e digite:

```
node --version
```

Se aparecer algo como `v22.x.x` ou `v24.x.x` (um número **22 ou maior**), está
tudo certo. Se aparecer erro, tente reiniciar o computador de novo.

---

## Passo 2 — Extrair o arquivo .zip

1. Localize o arquivo `controle-financeiro.zip` que você baixou (geralmente
   na pasta **Downloads**)
2. Clique com o botão direito nele → **Extrair Tudo...** → **Extrair**
3. Isso vai criar uma pasta `controle-financeiro` com duas pastas dentro:
   `backend` e `frontend`

---

## Passo 3 — Rodar o backend

1. Abra a pasta `controle-financeiro` → entre na pasta **backend**
2. Clique uma vez na barra de endereço do Windows Explorer (lá em cima, onde
   mostra o caminho da pasta), apague o que está escrito, digite `cmd` e
   aperte Enter — isso abre um terminal **já dentro dessa pasta**
3. No terminal que abriu, digite (um comando por vez, apertando Enter depois
   de cada um):

```
npm install
```

Espere terminar (pode demorar um minutinho na primeira vez). Depois:

```
copy .env.example .env
```

E por fim:

```
npm run dev
```

Se aparecer a mensagem `Servidor do Controle Financeiro rodando em
http://localhost:3001`, deu certo! **Deixe essa janela aberta** — se você
fechar, o sistema para de funcionar.

---

## Passo 4 — Rodar o frontend (a tela do sistema)

Agora abra **uma segunda janela do terminal** — sem fechar a primeira:

1. Volte para a pasta `controle-financeiro` → entre na pasta **frontend**
2. Repita o mesmo truque: clique na barra de endereço, digite `cmd`, Enter
3. Digite os comandos:

```
npm install
```

```
copy .env.example .env
```

```
npm run dev
```

Vai aparecer algo como `Local: http://localhost:5173/`. Deixe essa janela
aberta também.

---

## Passo 5 — Usar o sistema

Abra o navegador (Chrome, Edge, o que preferir) e acesse:

```
http://localhost:5173
```

Clique em **Cadastre-se**, crie sua conta informando o dia de virada do seu
cartão, e pronto — pode começar a cadastrar seus gastos.

---

## Nas próximas vezes que quiser usar

Você **não precisa repetir tudo**. Só o `npm install` e o `copy` são
"instalação" (feitos uma vez só). Da próxima vez, é só:

1. Abrir terminal na pasta `backend` → digitar `npm run dev`
2. Abrir terminal na pasta `frontend` → digitar `npm run dev`
3. Acessar `http://localhost:5173` no navegador

---

## Se algo der errado

- **`'node' não é reconhecido...`** → o Node.js não foi instalado
  corretamente, ou o computador não foi reiniciado depois de instalar.
- **`'npm' não é reconhecido...`** → mesmo motivo do item acima.
- **A página não abre no navegador** → confira se as duas janelas do
  terminal ainda estão abertas e sem mensagens de erro em vermelho.
- **Erro ao rodar `npm install`** → verifique sua conexão com a internet.
