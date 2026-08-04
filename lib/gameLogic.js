/**
 * Regras do "Eu Duvido!" em forma de reducer puro.
 * Sem React aqui de proposito: da pra rodar em teste (ver tests/gameLogic.test.js).
 *
 * O jogo tem DUAS contagens separadas:
 *
 *  VIDAS (coracoes) - quanto voce aguenta errar.
 *    Todo mundo comeca com VIDAS_INICIAIS. Quem zera e eliminado.
 *
 *  PONTOS (placar) - so se ganha duvidando e acertando.
 *
 * Resolucao de um "Duvido":
 *  - quem duvidou estava CERTO (o nome NAO esta no top 10):
 *      o duvidado perde 1 vida, o duvidador ganha 1 PONTO (e nao vida),
 *      a carta e descartada e comeca uma rodada nova;
 *  - quem duvidou estava ERRADO (o nome ESTA no top 10):
 *      so o duvidador perde 1 vida e o jogo continua no mesmo tema.
 *
 * A partida acaba de dois jeitos:
 *  1. alguem chega a PONTOS_VITORIA pontos;
 *  2. sobra so um jogador vivo.
 */

export const VIDAS_INICIAIS = 4;
export const PONTOS_VITORIA = 4;

export const estadoInicial = {
  fase: 'setup', // setup | sorteio | jogando | fim
  jogadores: [],
  vezIndex: 0,
  quemComecouId: null,
  tema: null, // { tema: string, top10: string[] }
  cartaAberta: false,
  precisaNovoTema: true,
  temasUsados: [],
  filaTemas: [], // lote baixado da API, consumido uma carta por rodada
  conferidas: [], // { resposta, acertou, posicao, item } da rodada atual
  ultimoDuvido: null,
  vencedorId: null,
  rodada: 0,
};

const vivos = (jogadores) => jogadores.filter((j) => j.vivo);

/** Proximo jogador vivo depois de um indice (circular). Devolve o proprio se for o unico. */
export function proximoVivo(jogadores, aPartirDe) {
  const total = jogadores.length;
  if (!total) return 0;
  for (let passo = 1; passo <= total; passo += 1) {
    const idx = (aPartirDe + passo) % total;
    if (jogadores[idx].vivo) return idx;
  }
  return aPartirDe;
}

/**
 * Decide se a partida acabou.
 * A checagem de pontos vem primeiro: na mesma jogada alguem pode bater a
 * pontuacao alvo e outro alguem ser eliminado - quem pontuou leva.
 */
function aplicarFimDeJogo(estado) {
  const campeao = estado.jogadores.find((j) => j.pontos >= PONTOS_VITORIA);
  if (campeao) {
    return { ...estado, fase: 'fim', vencedorId: campeao.id };
  }

  const restantes = vivos(estado.jogadores);
  if (restantes.length <= 1) {
    return { ...estado, fase: 'fim', vencedorId: restantes[0]?.id ?? null };
  }
  return estado;
}

export function reducer(estado, acao) {
  switch (acao.type) {
    case 'INICIAR_PARTIDA': {
      const jogadores = acao.jogadores.map((j) => ({
        id: j.id,
        nome: j.nome.trim(),
        carta: j.carta,
        vidas: VIDAS_INICIAIS,
        pontos: 0,
        vivo: true,
      }));
      return {
        ...estadoInicial,
        jogadores,
        fase: 'sorteio',
        precisaNovoTema: true,
      };
    }

    // Sorteio de quem abre a partida.
    case 'SORTEAR_INICIAL': {
      const idx = acao.indice ?? Math.floor(Math.random() * estado.jogadores.length);
      return {
        ...estado,
        vezIndex: idx,
        quemComecouId: estado.jogadores[idx]?.id ?? null,
        fase: 'jogando',
      };
    }

    case 'DEFINIR_TEMA': {
      const tema = acao.tema;
      return {
        ...estado,
        tema,
        cartaAberta: false,
        precisaNovoTema: false,
        conferidas: [],
        // ultimoDuvido NAO e limpo aqui de proposito: quem fecha a tela de
        // resultado e a pessoa, pelo botao Continuar (acao LIMPAR_DUVIDO).
        // Limpar aqui fazia a tela sumir sozinha assim que a carta nova
        // chegava da API - ninguem conseguia ler o resultado.
        rodada: estado.rodada + 1,
        temasUsados: [...estado.temasUsados, tema.tema].slice(-80),
      };
    }

    // Guarda o lote que veio da API. Os temas ficam disponiveis pras
    // proximas rodadas sem precisar de nova chamada.
    case 'ENFILEIRAR_TEMAS':
      return { ...estado, filaTemas: [...estado.filaTemas, ...(acao.temas ?? [])] };

    // Tira o primeiro da fila e coloca na mesa.
    case 'PUXAR_DA_FILA': {
      const [proximo, ...resto] = estado.filaTemas;
      if (!proximo) return estado;
      return reducer({ ...estado, filaTemas: resto }, { type: 'DEFINIR_TEMA', tema: proximo });
    }

    case 'ABRIR_CARTA':
      return { ...estado, cartaAberta: true };

    case 'FECHAR_CARTA':
      return { ...estado, cartaAberta: false };

    case 'LIMPAR_DUVIDO':
      return { ...estado, ultimoDuvido: null };

    /**
     * acao: { duvidadorId, duvidadoId, resposta, resultado }
     * resultado vem de conferirResposta(): { acertou, posicao, item }
     */
    case 'RESOLVER_DUVIDO': {
      const { duvidadorId, duvidadoId, resposta, resultado } = acao;
      const respostaNoTop10 = resultado.acertou;
      const duvidadorAcertouAoDuvidar = !respostaNoTop10;

      const jogadores = estado.jogadores.map((j) => {
        let vidas = j.vidas;
        let pontos = j.pontos ?? 0;

        if (duvidadorAcertouAoDuvidar) {
          // o duvidado pagou com uma vida; quem duvidou marca ponto
          if (j.id === duvidadoId) vidas -= 1;
          if (j.id === duvidadorId) pontos += 1;
        } else if (j.id === duvidadorId) {
          // duvidou a toa: perde vida e nao pontua
          vidas -= 1;
        }

        return { ...j, vidas, pontos, vivo: vidas > 0 };
      });

      const idxDuvidador = jogadores.findIndex((j) => j.id === duvidadorId);
      const idxDuvidado = jogadores.findIndex((j) => j.id === duvidadoId);

      // Certo -> nova carta e o duvidador abre a proxima rodada.
      // Errado -> segue no mesmo tema, a vez vai pra quem esta depois do duvidado.
      let vezIndex;
      if (duvidadorAcertouAoDuvidar) {
        vezIndex = jogadores[idxDuvidador]?.vivo
          ? idxDuvidador
          : proximoVivo(jogadores, idxDuvidador);
      } else {
        vezIndex = proximoVivo(jogadores, idxDuvidado);
      }

      const ultimoDuvido = {
        duvidadorId,
        duvidadoId,
        duvidadorNome: estado.jogadores[idxDuvidador]?.nome ?? '',
        duvidadoNome: estado.jogadores[idxDuvidado]?.nome ?? '',
        resposta,
        respostaNoTop10,
        duvidadorAcertou: duvidadorAcertouAoDuvidar,
        ganhouPonto: duvidadorAcertouAoDuvidar,
        pontosDuvidador: jogadores[idxDuvidador]?.pontos ?? 0,
        posicao: resultado.posicao,
        item: resultado.item,
        // Guarda a lista junto do resultado: quando o duvidador acerta, a
        // carta e descartada e essa e a unica chance da mesa ver o top 10.
        tema: estado.tema?.tema ?? '',
        top10: estado.tema?.top10 ?? [],
        // posicoes que a mesa ja tinha acertado nesta rodada, pra marcar
        // na lista o que saiu e o que ninguem lembrou
        posicoesReveladas: estado.conferidas
          .filter((c) => c.acertou && c.posicao)
          .map((c) => c.posicao),
      };

      const proximo = {
        ...estado,
        jogadores,
        vezIndex,
        cartaAberta: false,
        precisaNovoTema: duvidadorAcertouAoDuvidar,
        ultimoDuvido,
        conferidas: [
          ...estado.conferidas,
          { resposta, acertou: respostaNoTop10, posicao: resultado.posicao, item: resultado.item },
        ],
      };

      return aplicarFimDeJogo(proximo);
    }

    case 'NOVA_PARTIDA': {
      const jogadores = estado.jogadores.map((j) => ({
        ...j,
        vidas: VIDAS_INICIAIS,
        pontos: 0,
        vivo: true,
      }));
      // temasUsados e filaTemas sobrevivem: sem isso a partida seguinte
      // repetiria exatamente as mesmas perguntas da anterior.
      return {
        ...estadoInicial,
        jogadores,
        fase: 'sorteio',
        precisaNovoTema: true,
        temasUsados: estado.temasUsados,
        filaTemas: estado.filaTemas,
      };
    }

    case 'RESETAR':
      return {
        ...estadoInicial,
        temasUsados: estado.temasUsados,
        filaTemas: estado.filaTemas,
      };

    case 'HIDRATAR':
      return { ...estadoInicial, ...acao.estado };

    default:
      return estado;
  }
}
