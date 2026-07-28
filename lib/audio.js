/**
 * Som do jogo gerado na hora com a Web Audio API - nenhum arquivo de audio.
 *
 * Por que sintetizar em vez de usar mp3:
 *  - zero peso no bundle e nada pra carregar antes de tocar;
 *  - nenhuma questao de licenca;
 *  - funciona offline.
 *
 * Regra de ouro dos navegadores: audio so comeca depois de um gesto do
 * usuario (clique/toque). Por isso o AudioContext e criado preguicosamente,
 * dentro de garantirContexto(), e nunca no carregamento do modulo.
 */

const SEMITONS = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

/** 'A4' -> 440. Nota em notacao cientifica para frequencia. */
export function frequencia(nota) {
  const m = /^([A-G]#?)(-?\d)$/.exec(nota ?? '');
  if (!m) return 0;
  const midi = SEMITONS[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * 2 ** ((midi - 69) / 12);
}

/* ------------------------------------------------------------------ *
 * Contexto e barramentos
 * ------------------------------------------------------------------ */

let ctx = null;
let barraMestre = null;
let barraMusica = null;
let barraEfeitos = null;
let mudo = false;

const CHAVE_MUDO = 'eu-duvido:mudo';

export function estaMudo() {
  return mudo;
}

/** Le a preferencia salva. Chamar uma vez, no cliente. */
export function carregarPreferencia() {
  if (typeof window === 'undefined') return false;
  try {
    mudo = window.localStorage.getItem(CHAVE_MUDO) === '1';
  } catch {
    mudo = false;
  }
  return mudo;
}

export function definirMudo(valor) {
  mudo = Boolean(valor);
  try {
    window.localStorage.setItem(CHAVE_MUDO, mudo ? '1' : '0');
  } catch {
    /* modo privado: segue sem persistir */
  }
  if (barraMestre && ctx) {
    // rampa curta pra nao dar "clique" no alto-falante
    barraMestre.gain.cancelScheduledValues(ctx.currentTime);
    barraMestre.gain.setTargetAtTime(mudo ? 0 : 1, ctx.currentTime, 0.02);
  }
  return mudo;
}

function garantirContexto() {
  if (typeof window === 'undefined') return null;

  if (!ctx) {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return null;
    try {
      ctx = new Contexto();
    } catch {
      // alguns navegadores recusam criar o contexto (limite, modo privado...)
      ctx = null;
      return null;
    }

    barraMestre = ctx.createGain();
    barraMestre.gain.value = mudo ? 0 : 1;
    barraMestre.connect(ctx.destination);

    barraMusica = ctx.createGain();
    barraMusica.gain.value = 0.28;
    barraMusica.connect(barraMestre);

    barraEfeitos = ctx.createGain();
    barraEfeitos.gain.value = 0.85;
    barraEfeitos.connect(barraMestre);
  }

  // o navegador suspende o contexto ate o primeiro gesto
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** O audio ja esta liberado pelo navegador? */
export function audioLiberado() {
  return Boolean(ctx && ctx.state === 'running');
}

/* ------------------------------------------------------------------ *
 * Tijolos basicos
 * ------------------------------------------------------------------ */

function nota({ freq, tipo = 'square', inicio, duracao, volume = 0.2, destino, glide = null, ataque = 0.01 }) {
  if (!freq || freq <= 0) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, inicio);
  if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(glide, 1), inicio + duracao);

  // envelope exponencial: nunca chega a zero (exponentialRamp nao aceita 0)
  env.gain.setValueAtTime(0.0001, inicio);
  env.gain.exponentialRampToValueAtTime(volume, inicio + ataque);
  env.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

  osc.connect(env);
  env.connect(destino);
  osc.start(inicio);
  osc.stop(inicio + duracao + 0.03);
}

function ruido({ inicio, duracao, volume = 0.2, destino, de = 6000, ate = 800, q = 0.8 }) {
  const quadros = Math.max(1, Math.floor(ctx.sampleRate * duracao));
  const buffer = ctx.createBuffer(1, quadros, ctx.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < quadros; i += 1) dados[i] = Math.random() * 2 - 1;

  const fonte = ctx.createBufferSource();
  fonte.buffer = buffer;

  const filtro = ctx.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.Q.value = q;
  filtro.frequency.setValueAtTime(de, inicio);
  filtro.frequency.exponentialRampToValueAtTime(Math.max(ate, 1), inicio + duracao);

  const env = ctx.createGain();
  env.gain.setValueAtTime(volume, inicio);
  env.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

  fonte.connect(filtro);
  filtro.connect(env);
  env.connect(destino);
  fonte.start(inicio);
  fonte.stop(inicio + duracao);
}

/* ------------------------------------------------------------------ *
 * Efeitos
 * ------------------------------------------------------------------ */

const EFEITOS = {
  // clique geral dos botoes: blip curtinho subindo
  clique: (t, saida) => {
    nota({ freq: frequencia('E5'), glide: frequencia('B5'), tipo: 'square', inicio: t, duracao: 0.07, volume: 0.16, destino: saida });
  },

  // selecionar carta/jogador: mais agudo e mais seco
  toque: (t, saida) => {
    nota({ freq: frequencia('A5'), tipo: 'triangle', inicio: t, duracao: 0.05, volume: 0.14, destino: saida });
  },

  // voltar / cancelar: blip descendo
  voltar: (t, saida) => {
    nota({ freq: frequencia('B4'), glide: frequencia('E4'), tipo: 'square', inicio: t, duracao: 0.09, volume: 0.14, destino: saida });
  },

  // carta virando: swoosh de ruido
  carta: (t, saida) => {
    ruido({ inicio: t, duracao: 0.26, volume: 0.16, destino: saida, de: 1200, ate: 5200, q: 0.6 });
  },

  // DUVIDO!: batida de martelo com peso
  duvido: (t, saida) => {
    nota({ freq: frequencia('A3'), glide: frequencia('D3'), tipo: 'sawtooth', inicio: t, duracao: 0.22, volume: 0.22, destino: saida });
    ruido({ inicio: t, duracao: 0.18, volume: 0.2, destino: saida, de: 2600, ate: 260, q: 1.1 });
  },

  // duvidou e acertou: arpejo maior subindo
  acerto: (t, saida) => {
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => {
      nota({ freq: frequencia(n), tipo: 'triangle', inicio: t + i * 0.075, duracao: 0.2, volume: 0.2, destino: saida });
    });
  },

  // duvidou e errou: dois tons descendo, meio azedo
  erro: (t, saida) => {
    nota({ freq: frequencia('E4'), tipo: 'sawtooth', inicio: t, duracao: 0.16, volume: 0.17, destino: saida });
    nota({ freq: frequencia('D#4'), tipo: 'sawtooth', inicio: t + 0.13, duracao: 0.3, volume: 0.17, destino: saida });
  },

  // jogador eliminado: descida grave
  eliminado: (t, saida) => {
    nota({ freq: frequencia('A3'), glide: frequencia('A2'), tipo: 'triangle', inicio: t, duracao: 0.55, volume: 0.2, destino: saida });
  },

  // roleta do sorteio: tique seco por jogador
  tique: (t, saida) => {
    ruido({ inicio: t, duracao: 0.035, volume: 0.12, destino: saida, de: 5000, ate: 2200, q: 2 });
  },

  // vitoria: fanfarra
  vitoria: (t, saida) => {
    const linha = [
      ['C5', 0], ['E5', 0.11], ['G5', 0.22], ['C6', 0.33],
      ['G5', 0.47], ['C6', 0.58],
    ];
    linha.forEach(([n, atraso]) => {
      nota({ freq: frequencia(n), tipo: 'square', inicio: t + atraso, duracao: 0.3, volume: 0.19, destino: saida });
      nota({ freq: frequencia(n) / 2, tipo: 'triangle', inicio: t + atraso, duracao: 0.3, volume: 0.12, destino: saida });
    });
  },
};

/** Dispara um efeito. Seguro chamar em qualquer lugar - vira no-op sem contexto. */
export function tocar(nomeEfeito) {
  const efeito = EFEITOS[nomeEfeito];
  if (!efeito) return;
  try {
    const c = garantirContexto();
    if (!c || mudo) return;
    efeito(c.currentTime + 0.005, barraEfeitos);
  } catch {
    /* audio nunca deve derrubar a interface */
  }
}

/* ------------------------------------------------------------------ *
 * Trilha da tela inicial
 * ------------------------------------------------------------------ */

const BPM = 112;
const DUR_PASSO = 60 / BPM / 2; // colcheia
export const TOTAL_PASSOS = 32; // 4 compassos

// Progressao Am - F - C - G, bem "jogo de festa".
export const BAIXO = ['A2', 'F2', 'C3', 'G2'];
export const MELODIA = [
  'A4', 'C5', 'E5', 'C5', 'A4', null, 'E5', null,
  'F4', 'A4', 'C5', 'A4', 'F4', null, 'C5', null,
  'C5', 'E5', 'G5', 'E5', 'C5', null, 'G4', null,
  'B4', 'D5', 'G5', 'D5', 'B4', null, 'D5', 'F5',
];

const OLHAR_ADIANTE = 0.15; // s de fila
const INTERVALO_RELOGIO = 40; // ms

let relogio = null;
let proximoPasso = 0;
let proximoTempo = 0;

function agendarPasso(passo, t) {
  const compasso = Math.floor(passo / 8);

  // baixo: fundamental no inicio e no meio do compasso
  if (passo % 8 === 0 || passo % 8 === 4) {
    nota({ freq: frequencia(BAIXO[compasso]), tipo: 'triangle', inicio: t, duracao: DUR_PASSO * 1.7, volume: 0.3, destino: barraMusica });
  }

  // melodia
  const n = MELODIA[passo];
  if (n) {
    nota({ freq: frequencia(n), tipo: 'square', inicio: t, duracao: DUR_PASSO * 0.85, volume: 0.13, destino: barraMusica });
  }

  // bumbo nas semininas, chimbal nos contratempos
  if (passo % 4 === 0) {
    nota({ freq: 130, glide: 45, tipo: 'sine', inicio: t, duracao: 0.16, volume: 0.32, destino: barraMusica, ataque: 0.004 });
  }
  if (passo % 2 === 1) {
    ruido({ inicio: t, duracao: 0.045, volume: 0.05, destino: barraMusica, de: 8000, ate: 5000, q: 1.5 });
  }
}

/**
 * Liga a trilha. Se o navegador ainda nao liberou o audio, devolve false -
 * quem chamou deve tentar de novo depois do primeiro clique.
 */
export function iniciarMusica() {
  let c = null;
  try {
    c = garantirContexto();
  } catch {
    return false;
  }
  if (!c) return false;
  if (relogio) return true;
  if (c.state !== 'running') return false;

  proximoPasso = 0;
  proximoTempo = c.currentTime + 0.1;

  relogio = setInterval(() => {
    if (!ctx) return;
    // agenda tudo que cai na janela de lookahead (relogio do JS e impreciso,
    // o do Web Audio nao - por isso as notas usam o tempo do contexto)
    while (proximoTempo < ctx.currentTime + OLHAR_ADIANTE) {
      try {
        agendarPasso(proximoPasso, proximoTempo);
      } catch {
        /* ignora falha pontual de agendamento */
      }
      proximoTempo += DUR_PASSO;
      proximoPasso = (proximoPasso + 1) % TOTAL_PASSOS;
    }
  }, INTERVALO_RELOGIO);

  return true;
}

export function pararMusica() {
  if (relogio) {
    clearInterval(relogio);
    relogio = null;
  }
}

export function musicaTocando() {
  return Boolean(relogio);
}
