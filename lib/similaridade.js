/**
 * Detecta temas "parecidos demais".
 *
 * Comparar so por igualdade exata nao resolve o problema de repeticao: o
 * modelo devolve "Top 10 maiores clubes do Brasil" e, duas rodadas depois,
 * "Top 10 clubes brasileiros com mais titulos". Sao strings diferentes e a
 * mesma pergunta na pratica.
 *
 * Modulo puro - testado em tests/similaridade.test.js.
 */

import { normalizar } from './matcher.js';

/** Palavras que aparecem em quase todo tema e nao ajudam a diferenciar. */
const VAZIAS = new Set([
  'top', '10', 'os', 'as', 'o', 'a', 'de', 'do', 'da', 'dos', 'das', 'e', 'em',
  'no', 'na', 'nos', 'nas', 'um', 'uma', 'com', 'por', 'para', 'que', 'mais',
  'menos', 'maior', 'menor', 'maiores', 'menores', 'melhor', 'melhores',
  'pior', 'piores', 'todos', 'todas', 'mundo', 'mundial', 'mundiais',
  'historia', 'tempos', 'sobre',
]);

/**
 * Radical simples: corta a palavra nas 5 primeiras letras.
 *
 * Sem isto o detector deixa passar as repeticoes mais comuns, porque o modelo
 * troca a forma da palavra: "populosos" x "populacao", "brasil" x
 * "brasileiros", "clube" x "clubes". Como token sao diferentes; como radical,
 * iguais. E grosseiro, mas nesse tamanho de texto funciona bem e nao arrasta
 * dependencia de stemmer.
 */
function radical(palavra) {
  return palavra.length > 5 ? palavra.slice(0, 5) : palavra;
}

/** Tokens que realmente identificam o assunto do tema, ja como radical. */
export function palavrasChave(tema) {
  return normalizar(tema)
    .split(' ')
    .filter((t) => t.length >= 3 && !VAZIAS.has(t))
    .map(radical);
}

/**
 * Indice de Jaccard entre os conjuntos de palavras-chave: 0 = nada em comum,
 * 1 = exatamente as mesmas palavras.
 */
export function semelhanca(temaA, temaB) {
  const a = new Set(palavrasChave(temaA));
  const b = new Set(palavrasChave(temaB));
  if (!a.size || !b.size) return 0;

  let comuns = 0;
  for (const p of a) if (b.has(p)) comuns += 1;

  const uniao = a.size + b.size - comuns;
  return uniao ? comuns / uniao : 0;
}

/** Acima de 0.5 de palavras em comum, tratamos como o mesmo tema. */
export const LIMITE_SEMELHANCA = 0.5;

export function saoParecidos(temaA, temaB, limite = LIMITE_SEMELHANCA) {
  return semelhanca(temaA, temaB) >= limite;
}

/** O tema ja apareceu (igual ou parecido) na lista? */
export function jaApareceu(tema, usados = [], limite = LIMITE_SEMELHANCA) {
  return usados.some((u) => saoParecidos(tema, u, limite));
}
