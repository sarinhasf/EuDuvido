import test from 'node:test';
import assert from 'node:assert/strict';
import { reducer, estadoInicial, proximoVivo, VIDAS_INICIAIS, PONTOS_VITORIA } from '../lib/gameLogic.js';

const CARTA = { id: 'c.png', src: '/img/cartas/c.png', rotulo: 'Carta' };

function partidaCom(nomes) {
  const jogadores = nomes.map((nome, i) => ({ id: `j${i}`, nome, carta: CARTA }));
  let estado = reducer(estadoInicial, { type: 'INICIAR_PARTIDA', jogadores });
  estado = reducer(estado, { type: 'SORTEAR_INICIAL', indice: 0 });
  return reducer(estado, {
    type: 'DEFINIR_TEMA',
    tema: { tema: 'Top 10 teste', top10: ['A', 'B', 'C'] },
  });
}

const duvidar = (estado, duvidadorId, duvidadoId, acertou, posicao = null) =>
  reducer(estado, {
    type: 'RESOLVER_DUVIDO',
    duvidadorId,
    duvidadoId,
    resposta: 'X',
    resultado: { acertou, posicao, item: null },
  });

const vidas = (estado, id) => estado.jogadores.find((j) => j.id === id).vidas;
const pontos = (estado, id) => estado.jogadores.find((j) => j.id === id).pontos;

test('todo mundo comeca com as vidas iniciais', () => {
  const e = partidaCom(['Ana', 'Bia', 'Caio']);
  assert.equal(e.jogadores.length, 3);
  assert.ok(e.jogadores.every((j) => j.vidas === VIDAS_INICIAIS && j.vivo));
  assert.ok(e.jogadores.every((j) => j.pontos === 0), 'placar comeca zerado');
  assert.equal(e.fase, 'jogando');
});

test('duvidou CERTO: duvidado perde vida, duvidador ganha, carta nova', () => {
  let e = partidaCom(['Ana', 'Bia', 'Caio']);
  // resposta NAO esta no top 10 -> quem duvidou estava certo
  e = duvidar(e, 'j1', 'j0', false);

  assert.equal(vidas(e, 'j0'), VIDAS_INICIAIS - 1, 'duvidado perde 1 vida');
  assert.equal(pontos(e, 'j1'), 1, 'duvidador marca 1 ponto');
  assert.equal(vidas(e, 'j1'), VIDAS_INICIAIS, 'duvidador NAO ganha vida');
  assert.equal(pontos(e, 'j0'), 0, 'duvidado nao pontua');
  assert.equal(vidas(e, 'j2'), VIDAS_INICIAIS, 'quem nao entrou nao muda');
  assert.equal(e.precisaNovoTema, true, 'descarta a carta');
  assert.equal(e.vezIndex, 1, 'quem duvidou certo abre a rodada');
  assert.equal(e.ultimoDuvido.duvidadorAcertou, true);
});

test('duvidou ERRADO: so o duvidador perde vida e o tema continua', () => {
  let e = partidaCom(['Ana', 'Bia', 'Caio']);
  // resposta ESTA no top 10 -> quem duvidou estava errado
  e = duvidar(e, 'j1', 'j0', true, 2);

  assert.equal(vidas(e, 'j1'), VIDAS_INICIAIS - 1);
  assert.equal(pontos(e, 'j1'), 0, 'duvidar errado nao pontua');
  assert.equal(vidas(e, 'j0'), VIDAS_INICIAIS, 'duvidado nao e punido');
  assert.equal(e.precisaNovoTema, false, 'mesma carta na mesa');
  assert.equal(e.vezIndex, 1, 'vez passa pra quem esta depois do duvidado');
  assert.equal(e.ultimoDuvido.duvidadorAcertou, false);
});

test('respostas conferidas ficam registradas na rodada', () => {
  let e = partidaCom(['Ana', 'Bia']);
  e = duvidar(e, 'j1', 'j0', true, 3);
  assert.equal(e.conferidas.length, 1);
  assert.deepEqual(e.conferidas[0], { resposta: 'X', acertou: true, posicao: 3, item: null });
});

test('carta nova NAO fecha a tela de resultado', () => {
  let e = partidaCom(['Ana', 'Bia']);
  e = duvidar(e, 'j1', 'j0', false); // duvidou certo -> pede carta nova
  assert.ok(e.ultimoDuvido, 'o resultado aparece');

  // a carta nova chega da API enquanto a pessoa ainda le o resultado
  e = reducer(e, { type: 'DEFINIR_TEMA', tema: { tema: 'Top 10 outro', top10: ['Z'] } });
  assert.ok(e.ultimoDuvido, 'o resultado tem que continuar na tela');

  // so o botao Continuar fecha
  e = reducer(e, { type: 'LIMPAR_DUVIDO' });
  assert.equal(e.ultimoDuvido, null);
});

test('conferidas zeram quando entra tema novo', () => {
  let e = partidaCom(['Ana', 'Bia']);
  e = duvidar(e, 'j1', 'j0', true, 3);
  e = reducer(e, { type: 'DEFINIR_TEMA', tema: { tema: 'Top 10 outro', top10: ['Z'] } });
  assert.equal(e.conferidas.length, 0);
  assert.equal(e.rodada, 2);
});

test('zerar as vidas elimina o jogador', () => {
  let e = partidaCom(['Ana', 'Bia', 'Caio']);
  for (let i = 0; i < VIDAS_INICIAIS; i += 1) e = duvidar(e, 'j0', 'j1', true, 1);

  assert.equal(vidas(e, 'j0'), 0);
  assert.equal(e.jogadores.find((j) => j.id === 'j0').vivo, false);
  assert.equal(e.fase, 'jogando', 'ainda sobram dois');
});

test('vence o ultimo de pe', () => {
  let e = partidaCom(['Ana', 'Bia']);
  for (let i = 0; i < VIDAS_INICIAIS; i += 1) e = duvidar(e, 'j0', 'j1', true, 1);

  assert.equal(e.fase, 'fim');
  assert.equal(e.vencedorId, 'j1');
});

test('a vez nunca cai em jogador eliminado', () => {
  let e = partidaCom(['Ana', 'Bia', 'Caio']);
  for (let i = 0; i < VIDAS_INICIAIS; i += 1) e = duvidar(e, 'j1', 'j0', true, 1);

  assert.equal(e.jogadores[1].vivo, false);
  assert.ok(e.jogadores[e.vezIndex].vivo, 'vezIndex aponta pra alguem vivo');
});

test(`vence quem chega a ${PONTOS_VITORIA} pontos, mesmo com poucas vidas`, () => {
  let e = partidaCom(['Ana', 'Bia', 'Caio']);

  for (let i = 1; i <= PONTOS_VITORIA; i += 1) {
    // Ana duvida do Caio e acerta -> Ana pontua, Caio perde vida
    e = duvidar(e, 'j0', 'j2', false);
    if (i < PONTOS_VITORIA) {
      assert.equal(e.fase, 'jogando', `nao pode acabar com ${i} ponto(s)`);
    }
  }

  assert.equal(pontos(e, 'j0'), PONTOS_VITORIA);
  assert.equal(e.fase, 'fim');
  assert.equal(e.vencedorId, 'j0');
});

test('pontos valem mais que sobreviver: quem pontua leva mesmo se outro seria o ultimo vivo', () => {
  let e = partidaCom(['Ana', 'Bia']);
  // Ana duvida da Bia e acerta 4x: Bia zera as vidas na mesma jogada do 4o ponto
  for (let i = 0; i < PONTOS_VITORIA; i += 1) e = duvidar(e, 'j0', 'j1', false);

  assert.equal(e.fase, 'fim');
  assert.equal(e.vencedorId, 'j0', 'quem bateu a pontuacao vence');
});

test('vidas e pontos andam separados', () => {
  let e = partidaCom(['Ana', 'Bia', 'Caio']);
  e = duvidar(e, 'j0', 'j1', false); // Ana acerta: +1 ponto Ana, -1 vida Bia
  e = duvidar(e, 'j0', 'j1', true, 5); // Ana erra: -1 vida Ana, sem ponto

  assert.equal(pontos(e, 'j0'), 1, 'o ponto conquistado nao se perde ao errar');
  assert.equal(vidas(e, 'j0'), VIDAS_INICIAIS - 1);
  assert.equal(vidas(e, 'j1'), VIDAS_INICIAIS - 1);
  assert.equal(pontos(e, 'j1'), 0);
});

test('proximoVivo circula e ignora mortos', () => {
  const js = [
    { vivo: true },
    { vivo: false },
    { vivo: false },
    { vivo: true },
  ];
  assert.equal(proximoVivo(js, 0), 3);
  assert.equal(proximoVivo(js, 3), 0);
  assert.equal(proximoVivo([{ vivo: true }], 0), 0, 'jogador sozinho continua sendo a vez');
});

test('NOVA_PARTIDA restaura vidas e volta pro sorteio', () => {
  let e = partidaCom(['Ana', 'Bia']);
  e = duvidar(e, 'j0', 'j1', true, 1);
  e = reducer(e, { type: 'NOVA_PARTIDA' });

  assert.ok(e.jogadores.every((j) => j.vidas === VIDAS_INICIAIS && j.vivo));
  assert.ok(e.jogadores.every((j) => j.pontos === 0), 'placar tambem zera');
  assert.equal(e.fase, 'sorteio');
  assert.equal(e.rodada, 0);
  assert.equal(e.vencedorId, null);
});

test('ABRIR/FECHAR carta alterna o estado', () => {
  let e = partidaCom(['Ana', 'Bia']);
  assert.equal(e.cartaAberta, false);
  e = reducer(e, { type: 'ABRIR_CARTA' });
  assert.equal(e.cartaAberta, true);
  e = reducer(e, { type: 'FECHAR_CARTA' });
  assert.equal(e.cartaAberta, false);
});

test('temas usados sao acumulados para nao repetir', () => {
  let e = partidaCom(['Ana', 'Bia']);
  e = reducer(e, { type: 'DEFINIR_TEMA', tema: { tema: 'Top 10 dois', top10: [] } });
  assert.deepEqual(e.temasUsados, ['Top 10 teste', 'Top 10 dois']);
});
