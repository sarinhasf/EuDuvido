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

/**
 * A remocao da carta do eliminado e disparada pelo onAnimationEnd da propria
 * animacao de queda (ver useCartasNaMesa em app/mesa/page.jsx). Duas coisas
 * nao podem faltar:
 *  - a regra tem que existir e ter duracao (sem animacao, nenhum evento
 *    dispara e a carta ficaria travada na mesa pra sempre);
 *  - o fill-mode precisa segurar o ultimo frame, senao a carta pisca de volta
 *    ao normal entre o fim da animacao e o desmonte.
 */
test('a carta do eliminado tem animacao de saida com fill-mode forwards', () => {
  const saida = regra('.carta-saindo');
  assert.ok(saida, 'regra .carta-saindo sumiu - a carta nunca seria removida da mesa');
  assert.ok(/animation:/.test(saida), '.carta-saindo precisa de animation');
  assert.ok(/\bforwards\b/.test(saida), '.carta-saindo precisa de fill-mode forwards');
  assert.ok(/[\d.]+s/.test(saida), '.carta-saindo precisa de uma duracao');
  assert.ok(/@keyframes sair-carta/.test(css), 'keyframes sair-carta sumiu');
});

test('a alternativa sem movimento tambem anima (senao a carta nunca sai)', () => {
  assert.ok(
    /@media \(prefers-reduced-motion: reduce\)/.test(css),
    'falta o bloco de prefers-reduced-motion',
  );
  assert.ok(
    /@keyframes apagar-carta/.test(css),
    'sem animacao alternativa o onAnimationEnd nunca dispara pra quem pediu menos movimento',
  );
});
