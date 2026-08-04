import test from 'node:test';
import assert from 'node:assert/strict';
import { validarTema, validarLote, extrairJson } from '../lib/validarTema.js';

const dez = (prefixo) => Array.from({ length: 10 }, (_, i) => `${prefixo}${i + 1}`);
const temaOk = (nome, prefixo = 'X') => ({ tema: nome, top10: dez(prefixo) });

test('aceita um tema bem formado', () => {
  const r = validarTema(temaOk('Top 10 dinossauros mais pesados'));
  assert.equal(r.ok, true);
  assert.equal(r.tema.top10.length, 10);
});

test('completa o "Top 10" se a IA esquecer', () => {
  const r = validarTema({ tema: 'Animais mais rapidos', top10: dez('A') });
  assert.equal(r.ok, true);
  assert.match(r.tema.tema, /^Top 10 /);
});

test('limpa numeracao e parenteses dos itens', () => {
  const r = validarTema({
    tema: 'Top 10 teste',
    top10: ['1. Pele (Brasil)', '2. Maradona (Argentina)', ...dez('B').slice(2)],
  });
  assert.equal(r.ok, true);
  assert.equal(r.tema.top10[0], 'Pele');
  assert.equal(r.tema.top10[1], 'Maradona');
});

test('recusa lista com tamanho errado', () => {
  assert.equal(validarTema({ tema: 'Top 10 x', top10: dez('A').slice(0, 7) }).ok, false);
  assert.equal(validarTema({ tema: 'Top 10 x', top10: [...dez('A'), 'extra'] }).ok, false);
});

test('recusa item repetido dentro da mesma lista', () => {
  const lista = dez('A');
  lista[5] = lista[0];
  assert.equal(validarTema({ tema: 'Top 10 x', top10: lista }).ok, false);
});

test('recusa item que virou frase', () => {
  const lista = dez('A');
  lista[3] = 'Um item explicando longamente por que ele esta nesta posicao aqui';
  assert.equal(validarTema({ tema: 'Top 10 x', top10: lista }).ok, false);
});

test('recusa tema ja usado, mesmo reescrito com outras palavras', () => {
  const usados = ['Top 10 maiores rios do mundo'];
  assert.equal(validarTema(temaOk('Top 10 rios mais extensos do mundo'), usados).ok, false);
  assert.equal(validarTema(temaOk('Top 10 sobremesas mais pedidas'), usados).ok, true);
});

test('o lote nao deixa passar dois temas parecidos entre si', () => {
  const bruto = {
    temas: [
      temaOk('Top 10 maiores clubes de futebol do Brasil', 'C'),
      temaOk('Top 10 clubes brasileiros com mais titulos', 'D'), // repete o anterior
      temaOk('Top 10 dinossauros mais pesados', 'E'),
    ],
  };
  const { temas } = validarLote(bruto, []);
  assert.equal(temas.length, 2, 'so um dos dois temas de clube pode passar');
  assert.ok(temas.some((t) => t.tema.includes('dinossauros')));
});

test('o lote filtra contra o historico da partida', () => {
  const bruto = { temas: [temaOk('Top 10 rios mais longos', 'A'), temaOk('Top 10 queijos famosos', 'B')] };
  const { temas } = validarLote(bruto, ['Top 10 maiores rios do mundo']);
  assert.equal(temas.length, 1);
  assert.match(temas[0].tema, /queijos/);
});

test('lote todo ruim devolve lista vazia em vez de quebrar', () => {
  const { temas } = validarLote({ temas: [{ tema: '', top10: [] }, null, 'lixo'] }, []);
  assert.deepEqual(temas, []);
});

test('extrairJson sobrevive a markdown e texto solto em volta', () => {
  const esperado = { temas: [] };
  assert.deepEqual(extrairJson('{"temas":[]}'), esperado);
  assert.deepEqual(extrairJson('```json\n{"temas":[]}\n```'), esperado);
  assert.deepEqual(extrairJson('Claro! Aqui esta:\n{"temas":[]}\nEspero ter ajudado.'), esperado);
  assert.equal(extrairJson('nada de json aqui'), null);
  assert.equal(extrairJson(''), null);
});
