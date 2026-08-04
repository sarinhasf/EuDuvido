import test from 'node:test';
import assert from 'node:assert/strict';
import { semelhanca, saoParecidos, jaApareceu, palavrasChave } from '../lib/similaridade.js';

test('ignora as palavras que aparecem em todo tema', () => {
  const chaves = palavrasChave('Top 10 os maiores clubes de futebol do Brasil');
  assert.ok(!chaves.includes('top'), '"top" nao diferencia nada');
  assert.ok(!chaves.includes('maiores'));
  assert.deepEqual(chaves, ['clube', 'futeb', 'brasi'], 'sobra so o radical do que identifica');
});

test('tema identico tem semelhanca 1', () => {
  assert.equal(semelhanca('Top 10 maiores rios do mundo', 'Top 10 maiores rios do mundo'), 1);
});

test('pega a repeticao disfarcada (o caso que mais incomoda no jogo)', () => {
  const pares = [
    ['Top 10 maiores clubes de futebol do Brasil', 'Top 10 clubes de futebol brasileiros mais antigos'],
    ['Top 10 maiores rios do mundo', 'Top 10 rios mais extensos do mundo'],
    ['Top 10 paises mais populosos do mundo', 'Top 10 paises com maior populacao'],
  ];
  for (const [a, b] of pares) {
    assert.ok(saoParecidos(a, b), `deveria detectar como repetido:\n  ${a}\n  ${b}`);
  }
});

test('nao confunde temas de assuntos diferentes', () => {
  const pares = [
    ['Top 10 maiores rios do mundo', 'Top 10 dinossauros mais pesados'],
    ['Top 10 doces brasileiros mais vendidos', 'Top 10 jogadores com mais Bolas de Ouro'],
    ['Top 10 planetas e luas do Sistema Solar', 'Top 10 novelas mais assistidas da Globo'],
    ['Top 10 racas de cachorro mais comuns', 'Top 10 racas de gato mais raras'],
  ];
  for (const [a, b] of pares) {
    assert.ok(!saoParecidos(a, b), `nao deveria juntar:\n  ${a}\n  ${b}`);
  }
});

test('jaApareceu varre a lista inteira', () => {
  const usados = [
    'Top 10 maiores estados do Brasil em area',
    'Top 10 animais mais rapidos do planeta',
  ];
  assert.ok(jaApareceu('Top 10 estados brasileiros com maior area', usados));
  assert.ok(!jaApareceu('Top 10 sobremesas mais pedidas em restaurante', usados));
});

test('lista vazia nunca acusa repeticao', () => {
  assert.equal(jaApareceu('Top 10 qualquer coisa', []), false);
  assert.equal(semelhanca('', 'Top 10 algo'), 0);
});
