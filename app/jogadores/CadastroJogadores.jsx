'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import { useGame } from '../../lib/GameProvider';
import { VIDAS_INICIAIS } from '../../lib/gameLogic';
import { useAudio } from '../../lib/AudioProvider';

const NOMES_SUGERIDOS = ['Jogador 1', 'Jogador 2', 'Jogador 3', 'Jogador 4', 'Jogador 5', 'Jogador 6'];
const MIN_JOGADORES = 2;

/** Cria um jogador ja com a primeira carta livre do baralho. */
function criarJogador(todasCartas, usadas, indice) {
  const livre = todasCartas.find((c) => !usadas.has(c.id)) ?? null;
  return {
    id: `j-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nome: '',
    placeholder: NOMES_SUGERIDOS[indice] ?? `Jogador ${indice + 1}`,
    carta: livre,
  };
}

export default function CadastroJogadores({ cartas }) {
  const router = useRouter();
  const { dispatch } = useGame();
  const { tocar } = useAudio();
  // Ja comeca com dois jogadores prontos pra digitar o nome (inicializacao
  // preguicosa: roda uma vez na montagem, sem precisar de useEffect).
  const [jogadores, setJogadores] = useState(() => {
    if (cartas.length < MIN_JOGADORES) return [];
    return [
      criarJogador(cartas, new Set(), 0),
      criarJogador(cartas, new Set([cartas[0].id]), 1),
    ];
  });
  const [seletorAberto, setSeletorAberto] = useState(null); // id do jogador escolhendo carta
  const [erro, setErro] = useState('');

  const maxJogadores = cartas.length;

  const cartasUsadas = useMemo(
    () => new Set(jogadores.map((j) => j.carta?.id).filter(Boolean)),
    [jogadores],
  );

  useEffect(() => {
    router.prefetch('/mesa');
  }, [router]);

  function adicionar() {
    if (jogadores.length >= maxJogadores) return;
    tocar('toque');
    setErro('');
    setJogadores((atual) => [...atual, criarJogador(cartas, cartasUsadas, atual.length)]);
  }

  function remover(id) {
    tocar('voltar');
    setErro('');
    setJogadores((atual) => atual.filter((j) => j.id !== id));
  }

  function renomear(id, nome) {
    setJogadores((atual) => atual.map((j) => (j.id === id ? { ...j, nome } : j)));
  }

  function escolherCarta(idJogador, carta) {
    tocar('toque');
    setJogadores((atual) => {
      const donoAtual = atual.find((j) => j.carta?.id === carta.id);
      const cartaAnterior = atual.find((j) => j.id === idJogador)?.carta ?? null;
      return atual.map((j) => {
        if (j.id === idJogador) return { ...j, carta };
        // Se a carta ja era de outro jogador, troca as duas de lugar.
        if (donoAtual && j.id === donoAtual.id) return { ...j, carta: cartaAnterior };
        return j;
      });
    });
    setSeletorAberto(null);
  }

  function embaralharCartas() {
    tocar('carta');
    const baralho = [...cartas].sort(() => Math.random() - 0.5);
    setJogadores((atual) => atual.map((j, i) => ({ ...j, carta: baralho[i] ?? null })));
  }

  function iniciar() {
    const prontos = jogadores.map((j, i) => ({
      ...j,
      nome: j.nome.trim() || j.placeholder || `Jogador ${i + 1}`,
    }));

    if (prontos.length < MIN_JOGADORES) {
      tocar('erro');
      setErro(`Precisa de pelo menos ${MIN_JOGADORES} jogadores.`);
      return;
    }
    if (prontos.some((j) => !j.carta)) {
      tocar('erro');
      setErro('Todo jogador precisa de uma carta.');
      return;
    }
    const nomes = prontos.map((j) => j.nome.toLowerCase());
    if (new Set(nomes).size !== nomes.length) {
      tocar('erro');
      setErro('Dois jogadores estão com o mesmo nome.');
      return;
    }

    tocar('clique');
    dispatch({
      type: 'INICIAR_PARTIDA',
      jogadores: prontos.map((j) => ({ id: j.id, nome: j.nome, carta: j.carta })),
    });
    router.push('/mesa');
  }

  if (maxJogadores < MIN_JOGADORES) {
    return (
      <Box className="palco" sx={{ display: 'grid', placeItems: 'center', p: 3 }}>
        <Alert severity="warning" sx={{ maxWidth: 520 }}>
          Encontrei {maxJogadores} carta(s) em <code>public/img/cartas</code>. Coloque pelo menos{' '}
          {MIN_JOGADORES} imagens nessa pasta para jogar.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="palco" sx={{ py: { xs: 3, sm: 5 }, px: 2 }}>
      <Stack spacing={3} sx={{ maxWidth: 880, mx: 'auto' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton
            onClick={() => {
              tocar('voltar');
              router.push('/');
            }}
            sx={{ color: 'var(--dourado)' }}
            aria-label="Voltar"
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ color: 'var(--dourado)', lineHeight: 1.1 }}>
              Quem vai jogar?
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,246,224,0.6)' }}>
              {jogadores.length} de {maxJogadores} jogadores · cada um começa com {VIDAS_INICIAIS} vidas
            </Typography>
          </Box>
        </Stack>

        {erro && (
          <Alert severity="error" onClose={() => setErro('')}>
            {erro}
          </Alert>
        )}

        <Stack spacing={2}>
          {jogadores.map((jogador, indice) => (
            <Paper
              key={jogador.id}
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                background: 'rgba(78, 27, 134, 0.55)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} sx={{ alignItems: 'center' }}>
                <Tooltip title="Trocar carta">
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => setSeletorAberto(jogador.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setSeletorAberto(jogador.id)}
                    sx={{
                      position: 'relative',
                      flexShrink: 0,
                      width: { xs: 62, sm: 78 },
                      aspectRatio: '330 / 454',
                      borderRadius: 0.5,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid var(--dourado)',
                      transition: 'transform .18s ease',
                      '&:hover': { transform: 'translateY(-3px) scale(1.03)' },
                    }}
                  >
                    {jogador.carta ? (
                      <Image
                        src={jogador.carta.src}
                        alt={jogador.carta.rotulo}
                        fill
                        sizes="80px"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ display: 'grid', placeItems: 'center', height: '100%', bgcolor: 'rgba(0,0,0,.4)' }}>
                        <SwapHorizRoundedIcon />
                      </Box>
                    )}
                  </Box>
                </Tooltip>

                <TextField
                  fullWidth
                  size="small"
                  label={`Jogador ${indice + 1}`}
                  placeholder={jogador.placeholder}
                  value={jogador.nome}
                  onChange={(e) => renomear(jogador.id, e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 18, autoComplete: 'off' } }}
                />

                <IconButton
                  onClick={() => remover(jogador.id)}
                  disabled={jogadores.length <= MIN_JOGADORES}
                  aria-label={`Remover ${jogador.nome || jogador.placeholder}`}
                  sx={{ color: 'var(--rosa)' }}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<PersonAddAlt1RoundedIcon />}
            onClick={adicionar}
            disabled={jogadores.length >= maxJogadores}
            fullWidth
          >
            {jogadores.length >= maxJogadores ? 'Todas as cartas em uso' : 'Adicionar jogador'}
          </Button>
          <Button variant="outlined" startIcon={<CasinoRoundedIcon />} onClick={embaralharCartas} fullWidth>
            Embaralhar cartas
          </Button>
        </Stack>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={iniciar}
          sx={{ alignSelf: 'center', px: 6, fontSize: '1.2rem' }}
        >
          Iniciar jogo
        </Button>
      </Stack>

      {/* Seletor de cartas */}
      <Dialog
        open={Boolean(seletorAberto)}
        onClose={() => setSeletorAberto(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{ color: 'var(--dourado)' }}>Escolha a carta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,246,224,0.6)' }}>
            Cartas já escolhidas aparecem marcadas — clicar em uma delas troca as cartas entre os jogadores.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
              gap: 1.5,
              pb: 1,
            }}
          >
            {cartas.map((carta) => {
              const usada = cartasUsadas.has(carta.id);
              const doJogadorAtual = jogadores.find((j) => j.id === seletorAberto)?.carta?.id === carta.id;
              return (
                <Box
                  key={carta.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => escolherCarta(seletorAberto, carta)}
                  onKeyDown={(e) => e.key === 'Enter' && escolherCarta(seletorAberto, carta)}
                  sx={{
                    position: 'relative',
                    aspectRatio: '330 / 454',
                    borderRadius: 0.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: doJogadorAtual ? '3px solid var(--dourado)' : '2px solid rgba(255,201,60,.25)',
                    opacity: usada && !doJogadorAtual ? 0.45 : 1,
                    transition: 'transform .16s ease, opacity .16s ease',
                    '&:hover': { transform: 'scale(1.05)', opacity: 1 },
                  }}
                >
                  <Image src={carta.src} alt={carta.rotulo} fill sizes="120px" style={{ objectFit: 'cover' }} />
                  {doJogadorAtual && (
                    <CheckCircleRoundedIcon
                      sx={{ position: 'absolute', top: 4, right: 4, color: 'var(--dourado)', fontSize: 22 }}
                    />
                  )}
                  {usada && !doJogadorAtual && (
                    <Chip
                      size="small"
                      label="em uso"
                      sx={{ position: 'absolute', bottom: 4, left: 4, height: 20, fontSize: 10 }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
