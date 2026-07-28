/**
 * Comparacao "fuzzy" entre a resposta falada por um jogador e os itens do top 10.
 * Modulo puro, sem dependencia de React - da pra testar isolado (ver tests/matcher.test.js).
 */

/**
 * Palavras genericas que nao identificam o item.
 * Cuidado ao mexer aqui: so entram palavras que NUNCA diferenciam dois itens.
 * "atletico", por exemplo, fica de fora de proposito - e o que separa
 * "Atletico Madrid" de "Real Madrid".
 */
const RUIDO = new Set([
  'o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na',
  'nos', 'nas', 'um', 'uma', 'the', 'of', 'fc', 'sc', 'ec', 'cf', 'cr', 'ac',
  'clube', 'club', 'time', 'futebol', 'regatas', 'esporte', 'esportivo',
  'esportiva', 'associacao', 'sociedade',
]);

/** Tira acentos, pontuacao, caixa alta e espacos sobrando. */
export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/["'`´‘’“”]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Remove numeracao ("1. ", "01 -") e anotacoes entre parenteses/colchetes. */
export function limparItem(texto) {
  return String(texto ?? '')
    .replace(/^\s*\d+\s*[.)\-–]\s*/, '')
    .replace(/[([{][^)\]}]*[)\]}]/g, ' ')
    .trim();
}

/** Todos os pedacos do texto, inclusive "jr", "de" etc. */
function tokens(textoNormalizado) {
  return textoNormalizado.split(' ').filter(Boolean);
}

/** Tokens que realmente identificam o item. Se sobrar nada, devolve todos. */
function tokensFortes(todos) {
  const uteis = todos.filter((t) => !RUIDO.has(t) && t.length >= 3);
  return uteis.length ? uteis : todos;
}

/** Distancia de Levenshtein com early exit por limite. */
export function levenshtein(a, b, limite = Infinity) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > limite) return limite + 1;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let anterior = Array.from({ length: b.length + 1 }, (_, i) => i);
  const atual = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    atual[0] = i;
    let melhorDaLinha = atual[0];
    for (let j = 1; j <= b.length; j += 1) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      atual[j] = Math.min(atual[j - 1] + 1, anterior[j] + 1, anterior[j - 1] + custo);
      if (atual[j] < melhorDaLinha) melhorDaLinha = atual[j];
    }
    if (melhorDaLinha > limite) return limite + 1;
    anterior = atual.slice();
  }
  return anterior[b.length];
}

/** Tolerancia de digitacao para a frase inteira. */
function tolerancia(tamanho) {
  if (tamanho <= 4) return 0;
  if (tamanho <= 7) return 1;
  if (tamanho <= 12) return 2;
  return 3;
}

/**
 * Tolerancia por palavra - bem mais apertada que a da frase.
 * Se fosse folgada, "brasil" viraria "brasilia" e o jogo daria ponto errado.
 */
function toleranciaToken(tamanho) {
  if (tamanho <= 5) return 0;
  if (tamanho <= 9) return 1;
  return 2;
}

/** Duas palavras sao "a mesma" (iguais ou com um errinho de digitacao)? */
function palavrasIguais(a, b) {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5) return false; // palavra curta so bate exata
  const limite = toleranciaToken(Math.max(a.length, b.length));
  return limite > 0 && levenshtein(a, b, limite) <= limite;
}

/** A palavra aparece (exata ou com errinho) em alguma da lista? */
function apareceEm(palavra, lista) {
  return lista.some((outra) => palavrasIguais(palavra, outra));
}

/**
 * Compara uma resposta com UM item do top 10.
 * Retorna { bate: boolean, confianca: number, motivo: string }.
 */
export function comparar(resposta, item) {
  const r = normalizar(resposta);
  const i = normalizar(limparItem(item));
  if (!r || !i) return { bate: false, confianca: 0, motivo: 'vazio' };

  // 1) Igual depois de normalizar.
  if (r === i) return { bate: true, confianca: 1, motivo: 'exato' };

  const todosR = tokens(r);
  const todosI = tokens(i);
  const fortesR = tokensFortes(todosR);
  const fortesI = tokensFortes(todosI);

  const temPeso = (lista) => lista.some((t) => t.length >= 4);

  // 2) A resposta e um pedaco valido do item: TODA palavra forte que a pessoa
  //    falou aparece no item. Ex.: "ronaldo" -> "cristiano ronaldo".
  //    A exigencia de "toda palavra" e o que impede
  //    "atletico madrid" de casar com "real madrid".
  if (temPeso(fortesR) && fortesR.every((t) => apareceEm(t, todosI))) {
    return { bate: true, confianca: 0.9, motivo: 'parcial' };
  }

  // 3) Caminho inverso: a pessoa falou o nome completo e a lista traz a versao
  //    curta. Ex.: "neymar junior" -> "neymar jr".
  if (temPeso(fortesI) && fortesI.every((t) => apareceEm(t, todosR))) {
    return { bate: true, confianca: 0.85, motivo: 'contem' };
  }

  // 4) Erro de digitacao considerando a frase inteira. Ex.: "sao paolo".
  const rj = fortesR.join(' ');
  const ij = fortesI.join(' ');
  const limite = tolerancia(Math.max(rj.length, ij.length));
  if (limite > 0 && levenshtein(rj, ij, limite) <= limite) {
    return { bate: true, confianca: 0.75, motivo: 'digitacao' };
  }

  return { bate: false, confianca: 0, motivo: 'sem-match' };
}

/**
 * Procura a resposta no top 10 inteiro e devolve a melhor correspondencia.
 * @param {string} resposta texto digitado no dialogo do "Duvido"
 * @param {string[]} top10 lista ordenada (indice 0 = 1o lugar)
 * @returns {{ acertou: boolean, posicao: number|null, item: string|null, motivo: string }}
 */
export function conferirResposta(resposta, top10) {
  const lista = Array.isArray(top10) ? top10 : [];
  let melhor = null;

  for (let idx = 0; idx < lista.length; idx += 1) {
    const res = comparar(resposta, lista[idx]);
    if (res.bate && (!melhor || res.confianca > melhor.confianca)) {
      melhor = { ...res, posicao: idx + 1, item: limparItem(lista[idx]) };
      if (res.confianca === 1) break;
    }
  }

  if (!melhor) return { acertou: false, posicao: null, item: null, motivo: 'sem-match' };
  return { acertou: true, posicao: melhor.posicao, item: melhor.item, motivo: melhor.motivo };
}
