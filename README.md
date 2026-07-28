# Eu Duvido! 🎴

Jogo de festa em que a galera tenta acertar os itens de um **top 10** sorteado por IA — e duvida uns dos outros.

## Como jogar

1. O sistema sorteia um tema (ex.: *Top 10 maiores campeões do Brasileirão*) e mostra a carta no centro da mesa.
2. Um jogador é sorteado para começar. Na sua vez, ele **fala em voz alta** um nome que ele acha que está no top 10.
3. Se alguém achar que o nome não está na lista, aperta **DUVIDO!** e escolhe: quem duvidou, de quem duvidou e qual foi a resposta.
4. O sistema confere:
   - **Quem duvidou estava certo** (o nome não está no top 10) → o duvidado perde 1 vida, o duvidador **marca 1 ponto**, a carta é descartada e começa uma rodada nova.
   - **Quem duvidou estava errado** (o nome está no top 10) → só o duvidador perde 1 vida, sem ponto, e o jogo continua no mesmo tema.
5. São **duas contagens separadas**:
   - **Vidas** (corações, embaixo da carta): todo mundo começa com 4. Quem zera é eliminado.
   - **Pontos** (medalha no canto da carta): só se ganha duvidando e acertando.
6. **Vence quem chegar a 4 pontos primeiro** — ou quem sobrar de pé, se todos os outros forem eliminados antes.

Quem virar a carta vira o juiz da rodada e consegue ver a lista — os outros não deveriam olhar. 😉

## Rodando o projeto

```bash
npm install
cp .env.local.example .env.local   # e coloque sua chave do Groq
npm run dev
```

Abre em <http://localhost:3000>.

Outros comandos:

```bash
npm run build   # build de produção
npm start       # roda o build
npm test        # testes da lógica do jogo e do conferidor de respostas
npx eslint .    # lint
```

## A chave do Groq

A chave fica **só no servidor**, em `.env.local` (que está no `.gitignore`). O navegador nunca vê a chave: a página chama `/api/tema`, e é o servidor Next que fala com o Groq.

> ⚠️ A chave que estava no `teste.js` original foi exposta em texto puro. **Gere uma nova** em <https://console.groq.com/keys> e revogue a antiga.

Se a chave não estiver configurada, ou se o Groq falhar, o jogo **não trava**: ele cai numa lista de temas reserva em `lib/categorias.js` e avisa na tela.

## Adicionando jogadores

O número máximo de jogadores é **a quantidade de imagens em `public/img/cartas`**. Para caber mais gente, é só jogar mais PNGs nessa pasta — nada no código precisa mudar. O sistema lê a pasta no servidor e ordena naturalmente (`carta2` antes de `carta10`).

## Estrutura

```
app/
  page.jsx + TelaInicial.jsx      tela 1: logo, animação de fundo, "Começar"
  jogadores/                      tela 2: cadastro de jogadores e cartas
  mesa/page.jsx                   tela 3: a mesa, onde tudo acontece
  api/tema/route.js               chama o Groq, valida e devolve o top 10
  api/cartas/route.js             lista as cartas disponíveis
  globals.css                     mesa de feltro, animações, carta que vira
components/                       carta do tema, carta do jogador, diálogos, sorteio, fim de jogo
lib/
  gameLogic.js                    regras do jogo (reducer puro, testado)
  matcher.js                      confere a resposta contra o top 10 (testado)
  cartas.js                       lê public/img/cartas
  categorias.js                   sementes de tema + temas reserva
  theme.js                        paleta tirada da logo e das cartas
tests/                            testes das duas peças críticas
```

## Como a resposta é conferida

`lib/matcher.js` compara o que foi digitado com os 10 itens, aceitando:

- diferença de acento e maiúscula (`gremio` → *Grêmio*);
- só o sobrenome (`Messi` → *Lionel Messi*);
- sufixos de clube (`São Paulo FC` → *São Paulo*);
- erros pequenos de digitação (`Mbape` → *Mbappé*).

E **recusa** o que parece mas não é: `Atlético Madrid` não conta como *Real Madrid*, `Ronaldinho` não conta como *Cristiano Ronaldo*. As regras estão cobertas por testes em `tests/matcher.test.js`.

## Identidade visual

Paleta tirada direto da logo e das cartas: roxo profundo no fundo, roxo vibrante nas cartas, dourado nas bordas e nos corações (que são as vidas), rosa nos destaques. Fontes **Baloo 2** (títulos, arredondada como a logo) e **Nunito** (texto).

## Stack

Next.js 16 (App Router) · React 19 · Material UI 9 · Groq (`llama-3.3-70b-versatile`)
