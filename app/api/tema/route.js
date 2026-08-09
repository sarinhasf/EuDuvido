import { NextResponse } from 'next/server';
import { CATEGORIAS, EIXOS, TEMAS_RESERVA } from '../../../lib/categorias';
import { jaApareceu } from '../../../lib/similaridade';
import { extrairJson, validarLote } from '../../../lib/validarTema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const URL_GROQ = 'https://api.groq.com/openai/v1/chat/completions';
const MODELO_PADRAO = 'llama-3.3-70b-versatile';
const MAX_TENTATIVAS = 3;

/** Quantos temas pedir por chamada. Um lote inteiro de uma vez resolve dois
 *  problemas: obriga o modelo a variar dentro da propria resposta (ele ve os
 *  irmaos enquanto escreve) e rende varias rodadas sem nova chamada. */
const TEMAS_POR_LOTE = 6;

/* ------------------------------------------------------------------ *
 * PROMPT
 * ------------------------------------------------------------------ */

const SISTEMA = `Voce e o mestre de cerimonias de um jogo de festa brasileiro chamado "Eu Duvido!".
Sua funcao e sortear temas de ranking "Top 10" e devolver a lista dos 10 itens de cada um.

FORMATO (obrigatorio):
1. Responda SOMENTE com um objeto JSON valido. Nada de markdown, crases ou texto fora do JSON.
2. Formato exato: {"temas": [{"tema": "Top 10 ...", "top10": ["item 1", ..., "item 10"]}, ...]}
3. Cada "top10" deve ter EXATAMENTE 10 strings, do 1o ao 10o lugar.
4. Cada item e APENAS o nome, curto e reconhecivel, no maximo 4 palavras.
   PROIBIDO dentro dos itens: numeros de posicao, parenteses, anos, estatisticas, explicacoes, emojis.
5. Os 10 itens de uma lista devem ser distintos entre si.
6. Escreva TUDO em portugues do Brasil.

TEMA DO DIA A DIA (a regra mais importante):
7. O ranking tem que ser sobre a VIDA COTIDIANA do brasileiro: o que ele come, compra no
   supermercado, usa em casa, assiste na TV, tem no celular, faz no fim de semana.
   Pense em: marcas de prateleira, comida, produtos de limpeza, eletrodomesticos, lojas,
   apps, tarefas de casa, lanche, festa, pet, roupa.
8. FACIL DE RESPONDER: qualquer pessoa na mesa, sem ter estudado nada, tem que conseguir
   chutar pelo menos 5 dos 10 itens de cabeca. Se o tema exige pesquisa, ele esta errado.
9. PROIBIDO (nao gere nada disso, mesmo que a categoria sugira):
   - historia, guerras, reis, imperios, datas, "os primeiros da historia", inventores;
   - geografia de decoreba: capitais, rios, montanhas, desertos, paises por area/populacao;
   - ciencia tecnica: elementos quimicos, formulas, especies com nome cientifico;
   - estatistica de nicho, numeros de faturamento e dados de ano especifico.
10. O campo "tema" comeca com "Top 10", tem no maximo 12 palavras e descreve um ranking
    reconhecivel. PROIBIDO gosto pessoal ("mais gostosos", "mais bonitos", "melhores de
    todos os tempos"). Use recortes de consumo e habito: "mais vendidos", "mais usados",
    "mais pedidos", "que todo mundo tem em casa", "mais conhecidos".
11. Nao invente. Se voce nao tem certeza dos 10 nomes, troque de tema.

VARIEDADE:
12. Os temas do lote devem ser de assuntos COMPLETAMENTE diferentes entre si.
    Nada de dois temas de comida, nem dois de marca de supermercado, no mesmo lote.
13. Varie o TIPO de ranking: mais vendido, mais usado, mais comum na casa, mais pedido,
    mais caro, mais barato. Nao faca o lote inteiro de "os mais vendidos".
14. Prefira o tema que faz a mesa rir e falar junto ("o que sempre tem na geladeira")
    ao ranking seco de marca.
15. NUNCA repita nem crie variacao dos temas ja usados que o usuario listar.

Exemplo do formato e do NIVEL de dificuldade esperado (gere temas diferentes destes):
{"temas":[{"tema":"Top 10 produtos do cafe da manha do brasileiro","top10":["Pao frances","Cafe","Leite","Manteiga","Queijo","Presunto","Achocolatado","Bolacha","Suco de laranja","Ovo mexido"]},{"tema":"Top 10 marcas de produto de limpeza mais conhecidas do Brasil","top10":["Ype","Omo","Veja","Cif","Pinho Sol","Brilhante","Bombril","Vanish","Mr Musculo","Ajax"]}]}`;

/** Sorteia n itens distintos de uma lista. */
function sortear(lista, n) {
  const copia = [...lista];
  const escolhidos = [];
  while (escolhidos.length < n && copia.length) {
    escolhidos.push(copia.splice(Math.floor(Math.random() * copia.length), 1)[0]);
  }
  return escolhidos;
}

function montarPromptUsuario(pedidos, temasUsados) {
  const roteiro = pedidos
    .map((p, i) => `${i + 1}. Assunto: ${p.categoria} — Angulo: ${p.eixo}`)
    .join('\n');

  const usados = temasUsados.length
    ? `\nTEMAS JA USADOS (nao repita nenhum, nem versao parecida do mesmo assunto):\n${temasUsados
        .map((t) => `- ${t}`)
        .join('\n')}`
    : '';

  return `Gere ${pedidos.length} temas para as proximas rodadas.

Siga este roteiro, um tema por linha — o assunto e o angulo sao obrigatorios,
mas voce escolhe o recorte exato dentro deles:

${roteiro}
${usados}

Lembre: tudo tem que ser do dia a dia e facil de chutar de cabeca.
Nada de historia, data, capital, rio ou dado tecnico.

Responda apenas com o objeto JSON.`;
}

/* ------------------------------------------------------------------ *
 * HANDLER
 * ------------------------------------------------------------------ */

async function chamarGroq({ chave, modelo, pedidos, temasUsados }) {
  const resposta = await fetch(URL_GROQ, {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelo,
      messages: [
        { role: 'system', content: SISTEMA },
        { role: 'user', content: montarPromptUsuario(pedidos, temasUsados) },
      ],
      response_format: { type: 'json_object' },
      temperature: 1.15, // alto de proposito: o que queremos aqui e variedade
      top_p: 0.95,
      // penaliza repetir palavras ja escritas -> empurra os temas do lote
      // pra assuntos diferentes uns dos outros
      frequency_penalty: 0.5,
      presence_penalty: 0.6,
      max_tokens: 3000,
    }),
    signal: AbortSignal.timeout(30000),
  });

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new Error(dados?.error?.message ?? `HTTP ${resposta.status}`);
  return dados?.choices?.[0]?.message?.content ?? '';
}

function temasDeReserva(temasUsados) {
  const disponiveis = TEMAS_RESERVA.filter((t) => !jaApareceu(t.tema, temasUsados));
  if (disponiveis.length) {
    return sortear(disponiveis, Math.min(TEMAS_POR_LOTE, disponiveis.length));
  }

  // Acabaram os inéditos (so acontece jogando muito tempo sem chave da API).
  // Em vez de sortear a esmo, devolve os que sairam ha MAIS tempo - assim a
  // repeticao demora o maximo possivel a ser percebida na mesa.
  const ultimoUso = (tema) => {
    for (let i = temasUsados.length - 1; i >= 0; i -= 1) {
      if (jaApareceu(tema, [temasUsados[i]])) return i;
    }
    return -1;
  };

  return [...TEMAS_RESERVA]
    .sort((a, b) => ultimoUso(a.tema) - ultimoUso(b.tema))
    .slice(0, TEMAS_POR_LOTE);
}

export async function POST(request) {
  const corpo = await request.json().catch(() => ({}));
  const temasUsados = Array.isArray(corpo?.temasUsados)
    ? corpo.temasUsados.filter((t) => typeof t === 'string').slice(-80)
    : [];

  const chave = process.env.GROQ_API_KEY;
  const modelo = process.env.GROQ_MODEL || MODELO_PADRAO;

  if (!chave) {
    return NextResponse.json(
      {
        temas: temasDeReserva(temasUsados),
        origem: 'reserva',
        aviso:
          'GROQ_API_KEY nao configurada. Copie .env.local.example para .env.local e coloque sua chave para sortear temas novos.',
      },
      { status: 200 },
    );
  }

  const erros = [];

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa += 1) {
    // categorias distintas + angulos distintos: o roteiro ja nasce variado,
    // sem depender da boa vontade do modelo
    const categorias = sortear(CATEGORIAS, TEMAS_POR_LOTE);
    const eixos = sortear(EIXOS, TEMAS_POR_LOTE);
    const pedidos = categorias.map((categoria, i) => ({ categoria, eixo: eixos[i] }));

    try {
      const conteudo = await chamarGroq({ chave, modelo, pedidos, temasUsados });
      const { temas, erros: errosLote } = validarLote(extrairJson(conteudo), temasUsados);

      if (temas.length) {
        return NextResponse.json({ temas, origem: 'groq' }, { status: 200 });
      }
      erros.push(`tentativa ${tentativa}: nenhum tema valido (${errosLote.join('; ')})`);
    } catch (e) {
      erros.push(`tentativa ${tentativa}: ${e.message}`);
    }
  }

  return NextResponse.json(
    {
      temas: temasDeReserva(temasUsados),
      origem: 'reserva',
      aviso: `Nao consegui temas novos do Groq (${erros.join(' | ')}). Usando temas reserva.`,
    },
    { status: 200 },
  );
}
