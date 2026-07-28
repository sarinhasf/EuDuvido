import { NextResponse } from 'next/server';
import { CATEGORIAS, TEMAS_RESERVA } from '../../../lib/categorias';
import { limparItem, normalizar } from '../../../lib/matcher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const URL_GROQ = 'https://api.groq.com/openai/v1/chat/completions';
const MODELO_PADRAO = 'llama-3.3-70b-versatile';
const MAX_TENTATIVAS = 3;

/* ------------------------------------------------------------------ *
 * PROMPT
 * ------------------------------------------------------------------ */

const SISTEMA = `Voce e o mestre de cerimonias de um jogo de festa brasileiro chamado "Eu Duvido!".
Sua unica funcao e sortear UM tema de ranking "Top 10" e devolver a lista dos 10 itens correspondentes.

REGRAS OBRIGATORIAS:
1. Responda SOMENTE com um objeto JSON valido. Nada de markdown, crases, comentarios ou texto fora do JSON.
2. Use exatamente este formato: {"tema": "Top 10 ...", "top10": ["item 1", "item 2", ..., "item 10"]}
3. O array "top10" deve ter EXATAMENTE 10 strings, ordenadas do 1o ao 10o lugar (indice 0 = 1o lugar).
4. Cada item deve ser APENAS o nome, curto e reconhecivel, com no maximo 4 palavras.
   PROIBIDO dentro dos itens: numeros de posicao, parenteses, anos, estatisticas, explicacoes, emojis, pontuacao decorativa.
5. Os 10 itens devem ser distintos entre si. Nunca repita o mesmo nome nem duas variacoes do mesmo nome.
6. O campo "tema" deve comecar com "Top 10", ter no maximo 12 palavras e descrever um ranking OBJETIVO e VERIFICAVEL.
   PROIBIDO temas de gosto pessoal ("mais gostosos", "mais bonitos", "melhores de todos os tempos na sua opiniao").
7. O tema precisa ser de cultura geral acessivel: um grupo de amigos brasileiros tem que conseguir chutar nomes.
   Evite temas de nicho, tecnicos ou que dependam de dados muito recentes.
8. Escreva TUDO em portugues do Brasil.
9. Nao invente dados. Se voce nao tem certeza dos 10 nomes de um ranking, escolha OUTRO tema que voce domine.
10. Nunca repita um tema que aparecer na lista de temas ja usados enviada pelo usuario.

Exemplo de resposta valida (apenas o formato, gere um tema diferente):
{"tema":"Top 10 maiores campeoes do Brasileirao","top10":["Palmeiras","Flamengo","Santos","Corinthians","Sao Paulo","Fluminense","Cruzeiro","Vasco da Gama","Internacional","Gremio"]}`;

function montarPromptUsuario(categoria, temasUsados, semente) {
  const usados = temasUsados.length
    ? `Temas JA USADOS nesta sessao (nao repita nenhum deles nem versoes parecidas):\n${temasUsados
        .map((t) => `- ${t}`)
        .join('\n')}`
    : 'Nenhum tema foi usado ainda nesta sessao.';

  return `Sorteie um novo tema para a rodada.

Categoria sugerida desta rodada: ${categoria}
Semente de aleatoriedade (use para variar, nao coloque na resposta): ${semente}

${usados}

Responda apenas com o objeto JSON.`;
}

/* ------------------------------------------------------------------ *
 * VALIDACAO
 * ------------------------------------------------------------------ */

function extrairJson(texto) {
  if (!texto) return null;
  const limpo = String(texto)
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/, '')
    .trim();
  try {
    return JSON.parse(limpo);
  } catch {
    // ultimo recurso: pegar o primeiro objeto entre chaves
    const inicio = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');
    if (inicio === -1 || fim <= inicio) return null;
    try {
      return JSON.parse(limpo.slice(inicio, fim + 1));
    } catch {
      return null;
    }
  }
}

/** Devolve { ok, tema, erro }. Rejeita tudo que quebraria a conferencia da resposta. */
export function validarTema(bruto, temasUsados = []) {
  if (!bruto || typeof bruto !== 'object') return { ok: false, erro: 'resposta nao e objeto' };

  let tema = typeof bruto.tema === 'string' ? bruto.tema.trim() : '';
  const lista = bruto.top10 ?? bruto.top_10 ?? bruto.itens;

  if (!tema) return { ok: false, erro: 'tema vazio' };
  if (!Array.isArray(lista)) return { ok: false, erro: 'top10 nao e array' };

  if (!/^top\s*10/i.test(tema)) tema = `Top 10 ${tema.replace(/^top\s*\d+\s*/i, '')}`.trim();

  const itens = lista
    .map((item) => {
      if (typeof item === 'string') return limparItem(item);
      if (item && typeof item === 'object') {
        return limparItem(item.nome ?? item.item ?? item.titulo ?? '');
      }
      return '';
    })
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (itens.length !== 10) return { ok: false, erro: `esperava 10 itens, veio ${itens.length}` };
  if (itens.some((i) => i.length > 60 || i.split(' ').length > 6)) {
    return { ok: false, erro: 'item longo demais' };
  }

  const vistos = new Set();
  for (const item of itens) {
    const chave = normalizar(item);
    if (!chave) return { ok: false, erro: 'item vazio apos limpeza' };
    if (vistos.has(chave)) return { ok: false, erro: `item repetido: ${item}` };
    vistos.add(chave);
  }

  const jaUsado = temasUsados.some((t) => normalizar(t) === normalizar(tema));
  if (jaUsado) return { ok: false, erro: 'tema repetido' };

  return { ok: true, tema: { tema, top10: itens } };
}

/* ------------------------------------------------------------------ *
 * HANDLER
 * ------------------------------------------------------------------ */

async function chamarGroq({ chave, modelo, categoria, temasUsados, semente }) {
  const resposta = await fetch(URL_GROQ, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${chave}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelo,
      messages: [
        { role: 'system', content: SISTEMA },
        { role: 'user', content: montarPromptUsuario(categoria, temasUsados, semente) },
      ],
      response_format: { type: 'json_object' },
      temperature: 1,
      top_p: 0.95,
      max_tokens: 700,
    }),
    // nao deixa uma chamada lenta travar a rodada
    signal: AbortSignal.timeout(20000),
  });

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const msg = dados?.error?.message ?? `HTTP ${resposta.status}`;
    throw new Error(msg);
  }

  return dados?.choices?.[0]?.message?.content ?? '';
}

function temaDeReserva(temasUsados) {
  const disponiveis = TEMAS_RESERVA.filter(
    (t) => !temasUsados.some((u) => normalizar(u) === normalizar(t.tema)),
  );
  const pool = disponiveis.length ? disponiveis : TEMAS_RESERVA;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function POST(request) {
  const corpo = await request.json().catch(() => ({}));
  const temasUsados = Array.isArray(corpo?.temasUsados)
    ? corpo.temasUsados.filter((t) => typeof t === 'string').slice(-25)
    : [];

  const chave = process.env.GROQ_API_KEY;
  const modelo = process.env.GROQ_MODEL || MODELO_PADRAO;

  if (!chave) {
    return NextResponse.json(
      {
        ...temaDeReserva(temasUsados),
        origem: 'reserva',
        aviso:
          'GROQ_API_KEY nao configurada. Copie .env.local.example para .env.local e coloque sua chave para sortear temas novos.',
      },
      { status: 200 },
    );
  }

  const erros = [];

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa += 1) {
    const categoria = CATEGORIAS[Math.floor(Math.random() * CATEGORIAS.length)];
    const semente = Math.random().toString(36).slice(2, 10);

    try {
      const conteudo = await chamarGroq({ chave, modelo, categoria, temasUsados, semente });
      const bruto = extrairJson(conteudo);
      const validado = validarTema(bruto, temasUsados);

      if (validado.ok) {
        return NextResponse.json({ ...validado.tema, origem: 'groq' }, { status: 200 });
      }
      erros.push(`tentativa ${tentativa}: ${validado.erro}`);
    } catch (e) {
      erros.push(`tentativa ${tentativa}: ${e.message}`);
    }
  }

  // A API respondeu mal 3 vezes: entrega um tema de reserva para o jogo nao parar.
  return NextResponse.json(
    {
      ...temaDeReserva(temasUsados),
      origem: 'reserva',
      aviso: `Nao consegui um tema valido do Groq (${erros.join(' | ')}). Usando um tema reserva.`,
    },
    { status: 200 },
  );
}
