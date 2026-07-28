import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

/** Pega o corpo de uma regra CSS pelo seletor. */
function regra(seletor) {
  const escapado = seletor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`${escapado}\\s*\\{([^}]*)\\}`).exec(css);
  return m ? m[1] : null;
}

test('a carta do tema tem contexto 3D pra conseguir virar', () => {
  const cena = regra('.cena-carta');
  const carta = regra('.carta-tema');
  assert.ok(cena?.includes('perspective'), '.cena-carta precisa de perspective');
  assert.ok(carta?.includes('preserve-3d'), '.carta-tema precisa de transform-style: preserve-3d');
  assert.ok(regra('.face-carta')?.includes('backface-visibility'), 'as faces precisam esconder o verso');
  assert.ok(regra('.carta-tema.virada')?.includes('rotateY(180deg)'), 'falta a regra que gira a carta');
});

/**
 * Regressao real: a animacao de entrada e a regra do giro ficam no MESMO
 * elemento. Com fill-mode "both" ou "forwards", o transform final da
 * animacao gruda no elemento e vence a declaracao normal na cascata -
 * a carta simplesmente para de virar, sem erro nenhum no build ou no lint.
 */
test('a animacao de entrada nao pode congelar o transform da carta', () => {
  const entrada = regra('.carta-entra');
  assert.ok(entrada, 'regra .carta-entra sumiu');
  assert.ok(
    !/\b(both|forwards)\b/.test(entrada),
    `.carta-entra nao pode usar fill-mode both/forwards (trava o giro). Valor atual: ${entrada.trim()}`,
  );
});

test('quem esconde as cartas no mobile continua existindo', () => {
  assert.ok(/@media \(max-width: 599\.95px\)/.test(css), 'media query do mobile sumiu');
  assert.ok(regra('.so-desktop')?.includes('display'), '.so-desktop precisa esconder o elemento');
});
