import test from 'node:test';
import assert from 'node:assert/strict';
import { conferirResposta, comparar, normalizar, limparItem } from '../lib/matcher.js';

const TOP10 = [
  'Cristiano Ronaldo',
  'Lionel Messi',
  'Neymar Jr',
  'Kylian Mbappé',
  'Vinícius Júnior',
  'São Paulo',
  'Grêmio',
  'Atlético Mineiro',
  'Red Bull Bragantino',
  'Real Madrid',
];

test('normalizar tira acento, caixa e pontuacao', () => {
  assert.equal(normalizar('Grêmio'), 'gremio');
  assert.equal(normalizar('  SÃO   PAULO! '), 'sao paulo');
  assert.equal(normalizar("O'Brien"), 'obrien');
});

test('limparItem tira numeracao e parenteses', () => {
  assert.equal(limparItem('1. Flamengo'), 'Flamengo');
  assert.equal(limparItem('03 - Santos'), 'Santos');
  assert.equal(limparItem('Pelé (Brasil)'), 'Pelé');
});

test('acerta nome exato mesmo sem acento', () => {
  const r = conferirResposta('gremio', TOP10);
  assert.equal(r.acertou, true);
  assert.equal(r.posicao, 7);
});

test('acerta so pelo sobrenome', () => {
  const r = conferirResposta('Messi', TOP10);
  assert.equal(r.acertou, true);
  assert.equal(r.posicao, 2);
});

test('acerta com erro de digitacao', () => {
  assert.equal(conferirResposta('Cristiano Ronaldu', TOP10).acertou, true);
  assert.equal(conferirResposta('Mbape', TOP10).acertou, true);
  assert.equal(conferirResposta('vinicius junior', TOP10).acertou, true);
});

test('acerta ignorando sufixo de clube', () => {
  assert.equal(conferirResposta('Sao Paulo FC', TOP10).acertou, true);
  assert.equal(conferirResposta('Bragantino', TOP10).acertou, true);
});

test('recusa nome que nao esta na lista', () => {
  const r = conferirResposta('Ronaldinho Gaucho', TOP10);
  assert.equal(r.acertou, false);
  assert.equal(r.posicao, null);
});

test('recusa nomes proximos mas diferentes', () => {
  assert.equal(conferirResposta('Palmeiras', TOP10).acertou, false);
  assert.equal(conferirResposta('Atletico Madrid', ['Real Madrid', 'Barcelona']).acertou, false);
});

test('nao aceita resposta vazia', () => {
  assert.equal(conferirResposta('', TOP10).acertou, false);
  assert.equal(conferirResposta('   ', TOP10).acertou, false);
});

test('nao aceita token curto generico como match', () => {
  assert.equal(comparar('do', 'Red Bull Bragantino').bate, false);
});

test('lista vazia ou invalida nao quebra', () => {
  assert.equal(conferirResposta('Messi', []).acertou, false);
  assert.equal(conferirResposta('Messi', null).acertou, false);
});

test('devolve a posicao correta e o item da lista', () => {
  const r = conferirResposta('neymar', TOP10);
  assert.equal(r.acertou, true);
  assert.equal(r.posicao, 3);
  assert.equal(r.item, 'Neymar Jr');
});
