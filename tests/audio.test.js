import test from 'node:test';
import assert from 'node:assert/strict';
import { frequencia, BAIXO, MELODIA, TOTAL_PASSOS } from '../lib/audio.js';

test('converte nota cientifica em frequencia', () => {
  assert.equal(frequencia('A4'), 440);
  assert.ok(Math.abs(frequencia('C4') - 261.63) < 0.01);
  assert.ok(Math.abs(frequencia('A5') - 880) < 0.001, 'uma oitava acima dobra');
  assert.ok(Math.abs(frequencia('A3') - 220) < 0.001, 'uma oitava abaixo divide por 2');
});

test('entende sustenido', () => {
  assert.ok(Math.abs(frequencia('A#4') - 466.16) < 0.01);
  assert.ok(frequencia('D#4') > frequencia('D4'));
});

test('nota invalida vira 0 em vez de NaN', () => {
  for (const ruim of ['', null, undefined, 'H4', 'Ab4', 'A', '4A', 'A44x']) {
    assert.equal(frequencia(ruim), 0, `esperava 0 para ${JSON.stringify(ruim)}`);
  }
});

test('toda nota do baixo e valida', () => {
  assert.equal(BAIXO.length, 4, 'uma fundamental por compasso');
  for (const n of BAIXO) {
    assert.ok(frequencia(n) > 0, `nota do baixo invalida: ${n}`);
  }
});

test('toda nota da melodia e valida (typo viraria silencio)', () => {
  assert.equal(MELODIA.length, TOTAL_PASSOS, 'a melodia cobre o loop inteiro');
  for (const n of MELODIA) {
    if (n === null) continue; // pausa
    assert.ok(frequencia(n) > 0, `nota da melodia invalida: ${n}`);
  }
});

test('a melodia fica numa oitava audivel e razoavel', () => {
  const tocadas = MELODIA.filter(Boolean).map(frequencia);
  assert.ok(Math.min(...tocadas) > 200, 'nada grave demais atropelando o baixo');
  assert.ok(Math.max(...tocadas) < 1600, 'nada agudo demais a ponto de irritar');
  assert.ok(Math.max(...BAIXO.map(frequencia)) < Math.min(...tocadas), 'baixo sempre abaixo da melodia');
});

test('nao explode quando importado fora do navegador', async () => {
  const mod = await import('../lib/audio.js');
  assert.equal(typeof mod.tocar, 'function');
  assert.doesNotThrow(() => mod.tocar('clique'), 'sem window vira no-op');
  assert.equal(mod.iniciarMusica(), false, 'sem window nao ha musica');
  assert.equal(mod.carregarPreferencia(), false);
});
