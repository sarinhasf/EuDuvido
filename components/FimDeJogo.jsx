'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { useAudio } from '../lib/AudioProvider';

const CORES = ['#FFC93C', '#FF5FA2', '#5BC8FF', '#C89BFF', '#FFF6E0', '#3DD68C'];

// deterministico pra nao dar hydration mismatch
function aleatorioEstavel(semente) {
  const x = Math.sin(semente * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export default function FimDeJogo({ vencedor, jogadores, onJogarNovamente, onTrocarJogadores }) {
  const { tocar } = useAudio();

  // fanfarra ao abrir a tela de vitoria
  useEffect(() => {
    tocar('vitoria');
  }, [tocar]);

  const confetes = Array.from({ length: 60 }, (_, i) => ({
    key: i,
    esquerda: `${(aleatorioEstavel(i + 7) * 100).toFixed(1)}%`,
    cor: CORES[i % CORES.length],
    duracao: `${(2.6 + aleatorioEstavel(i + 41) * 3).toFixed(1)}s`,
    atraso: `${(aleatorioEstavel(i + 83) * 4).toFixed(1)}s`,
  }));

  // ordena por pontos; empate desempata por vidas restantes
  const ranking = [...jogadores].sort(
    (a, b) => (b.pontos ?? 0) - (a.pontos ?? 0) || b.vidas - a.vidas,
  );

  return (
    <Box
      className="mesa"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 5,
        minHeight: 'var(--altura-tela)',
      }}
    >
      {confetes.map((c) => (
        <Box
          key={c.key}
          className="confete"
          sx={{ left: c.esquerda, bgcolor: c.cor }}
          style={{ '--dur': c.duracao, '--atraso': c.atraso }}
          aria-hidden="true"
        />
      ))}

      <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center', zIndex: 3 }}>
        <EmojiEventsRoundedIcon sx={{ fontSize: 66, color: 'var(--dourado)' }} />

        <Typography variant="h3" sx={{ color: 'var(--dourado)', fontSize: { xs: '2rem', sm: '2.8rem' } }}>
          {vencedor ? `${vencedor.nome} venceu!` : 'Fim de jogo'}
        </Typography>

        {vencedor?.carta?.src && (
          <Box
            className="logo-pulsa"
            sx={{
              position: 'relative',
              width: { xs: 150, sm: 190 },
              aspectRatio: '330 / 454',
              borderRadius: 0.5,
              overflow: 'hidden',
              border: '4px solid var(--dourado)',
              boxShadow: '0 0 44px rgba(255,201,60,.55)',
            }}
          >
            <Image src={vencedor.carta.src} alt={vencedor.nome} fill sizes="200px" style={{ objectFit: 'cover' }} />
          </Box>
        )}

        <Stack spacing={0.5} sx={{ minWidth: { xs: 240, sm: 300 } }}>
          {ranking.map((j, i) => (
            <Stack
              key={j.id}
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center',
                px: 2,
                py: 0.9,
                borderRadius: 2,
                bgcolor: j.id === vencedor?.id ? 'rgba(255,201,60,.16)' : 'rgba(0,0,0,.25)',
              }}
            >
              <Typography sx={{ fontWeight: 700, color: j.vivo ? 'var(--creme)' : 'rgba(255,246,224,.5)' }}>
                {i + 1}º {j.nome}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 800, color: 'var(--dourado)' }}>
                  {j.pontos ?? 0} {(j.pontos ?? 0) === 1 ? 'ponto' : 'pontos'}
                </Typography>
                <Typography
                  sx={{ fontWeight: 700, fontSize: '.85rem', color: 'rgba(255,246,224,.6)', minWidth: 62, textAlign: 'right' }}
                >
                  {j.vidas > 0 ? `${j.vidas} ♥` : 'eliminado'}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReplayRoundedIcon />}
            onClick={() => {
              tocar('clique');
              onJogarNovamente();
            }}
          >
            Jogar de novo
          </Button>
          <Button
            variant="outlined"
            startIcon={<GroupsRoundedIcon />}
            onClick={() => {
              tocar('voltar');
              onTrocarJogadores();
            }}
          >
            Trocar jogadores
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
