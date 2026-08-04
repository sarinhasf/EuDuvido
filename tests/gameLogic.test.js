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
    tema: { tema: 'Top 10 teste', top10: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] },
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

test('o resultado leva o top 10 junto (a carta vai ser descartada)', () => {
  let e = partidaCom(['Ana', 'Bia']);
  e = duvidar(e, 'j1', 'j0', false); // duvidou certo -> carta descartada

  assert.equal(e.ultimoDuvido.tema, 'Top 10 teste');
  assert.equal(e.ultimoDuvido.top10.length, 10, 'a lista viaja com o resultado');
  assert.equal(e.ultimoDuvido.top10[0], 'A');

  // a carta nova chega e nao pode apagar a lista que esta sendo lida
  e = reducer(e, { type: 'DEFINIR_TEMA', tema: { tema: 'Top 10 outro', top10: ['Z'] } });
  assert.equal(e.ultimoDuvido.top10.length, 10);
  assert.equal(e.ultimoDuvido.tema, 'Top 10 teste', 'e o tema antigo, nao o novo');
});

test('marca na lista o que a mesa ja tinha acertado na rodada', () => {
  let e = partidaCom(['Ana', 'Bia', 'Caio']);
  e = duvidar(e, 'j1', 'j0', true, 3); // duvidou errado: 'X' estava em 3o
  e = reducer(e, { type: 'LIMPAR_DUVIDO' });
  e = duvidar(e, 'j2', 'j0', true, 7); // errou de novo: outro acerto, 7o
  e = reducer(e, { type: 'LIMPAR_DUVIDO' });
  e = duvidar(e, 'j1', 'j0', false); // agora acertou ao duvidar

  assert.deepEqual(e.ultimoDuvido.posicoesReveladas, [3, 7]);
});

test('duvidou ERRADO tambem carrega a lista, mas a tela nao mostra', () => {
  // a carta continua na mesa, entao revelar estragaria a rodada.
  // quem decide e o componente (duvidadorAcertou === false), nao o reducer.
  let e = partidaCom(['Ana', 'Bia']);
  e = duvidar(e, 'j1', 'j0', true, 2);
  assert.equal(e.ultimoDuvido.duvidadorAcertou, false);
  assert.equal(e.precisaNovoTema, false, 'carta segue na mesa');
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

test('a fila entrega uma carta por rodada sem nova chamada', () => {
  let e = partidaCom(['Ana', 'Bia']);
  e = reducer(e, {
    type: 'ENFILEIRAR_TEMAS',
    temas: [
      { tema: 'Top 10 A', top10: ['a'] },
      { tema: 'Top 10 B', top10: ['b'] },
    ],
  });
  assert.equal(e.filaTemas.length, 2);

  e = reducer(e, { type: 'PUXAR_DA_FILA' });
  assert.equal(e.tema.tema, 'Top 10 A');
  assert.equal(e.filaTemas.length, 1, 'consumiu um da fila');

  e = reducer(e, { type: 'PUXAR_DA_FILA' });
  assert.equal(e.tema.tema, 'Top 10 B');
  assert.equal(e.filaTemas.length, 0);

  // fila vazia nao pode quebrar nem trocar a carta da mesa
  const antes = e;
  e = reducer(e, { type: 'PUXAR_DA_FILA' });
  assert.equal(e, antes, 'sem fila, o estado fica igual');
});

test('puxar da fila conta como rodada nova (registra no historico)', () => {
  let e = partidaCom(['Ana', 'Bia']);
  const rodadaAntes = e.rodada;
  e = reducer(e, { type: 'ENFILEIRAR_TEMAS', temas: [{ tema: 'Top 10 Novo', top10: ['a'] }] });
  e = reducer(e, { type: 'PUXAR_DA_FILA' });

  assert.equal(e.rodada, rodadaAntes + 1);
  assert.ok(e.temasUsados.includes('Top 10 Novo'), 'entra no historico');
  assert.equal(e.precisaNovoTema, false);
});

test('partida nova NAO repete as perguntas da anterior', () => {
  let e = partidaCom(['Ana', 'Bia']);
  e = reducer(e, { type: 'ENFILEIRAR_TEMAS', temas: [{ tema: 'Top 10 guardado', top10: ['a'] }] });
  const usadosAntes = [...e.temasUsados];

  e = reducer(e, { type: 'NOVA_PARTIDA' });
  assert.deepEqual(e.temasUsados, usadosAntes, 'o historico sobrevive a nova partida');
  assert.equal(e.filaTemas.length, 1, 'a fila tambem sobrevive');

  e = reducer(e, { type: 'RESETAR' });
  assert.deepEqual(e.temasUsados, usadosAntes, 'o historico sobrevive ate ao reset');
});

test('temas usados sao acumulados para nao repetir', () => {
  let e = partidaCom(['Ana', 'Bia']);
  e = reducer(e, { type: 'DEFINIR_TEMA', tema: { tema: 'Top 10 dois', top10: [] } });
  assert.deepEqual(e.temasUsados, ['Top 10 teste', 'Top 10 dois']);
});
