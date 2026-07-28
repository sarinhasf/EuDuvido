'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import FundoAnimado from '../components/FundoAnimado';
import { useGame } from '../lib/GameProvider';
import { useAudio } from '../lib/AudioProvider';

export default function TelaInicial({ cartas }) {
  const router = useRouter();
  const { dispatch } = useGame();
  const { mudo, alternarMudo, tocar, ligarMusica, desligarMusica } = useAudio();

  // Deixa a proxima tela pronta antes do clique.
  useEffect(() => {
    router.prefetch('/jogadores');
  }, [router]);

  // A trilha e so desta tela: liga ao entrar, desliga ao sair.
  // Se o navegador ainda nao liberou o audio, o provider religa no
  // primeiro clique/toque da pessoa.
  useEffect(() => {
    ligarMusica();
    return () => desligarMusica();
  }, [ligarMusica, desligarMusica]);

  function comecar() {
    tocar('clique');
    desligarMusica();
    dispatch({ type: 'RESETAR' });
    router.push('/jogadores');
  }

  return (
    <Box
      className="palco"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 6 }}
    >
      <FundoAnimado cartas={cartas} />

      <Tooltip title={mudo ? 'Ligar o som' : 'Desligar o som'}>
        <IconButton
          onClick={alternarMudo}
          aria-label={mudo ? 'Ligar o som' : 'Desligar o som'}
          sx={{
            position: 'absolute',
            top: { xs: 12, sm: 20 },
            right: { xs: 12, sm: 20 },
            zIndex: 3,
            color: mudo ? 'rgba(255,246,224,.45)' : 'var(--dourado)',
            bgcolor: 'rgba(0,0,0,.28)',
            '&:hover': { bgcolor: 'rgba(0,0,0,.45)' },
          }}
        >
          {mudo ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
        </IconButton>
      </Tooltip>

      <Stack spacing={{ xs: 3, sm: 4 }} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 720 }}>
        <Box
          className="logo-pulsa"
          sx={{
            position: 'relative',
            width: { xs: 'min(88vw, 340px)', sm: 'min(70vw, 520px)' },
            aspectRatio: '1536 / 1024',
          }}
        >
          <Image
            src="/img/logo/logo.png"
            alt="Eu Duvido!"
            fill
            priority
            sizes="(max-width: 600px) 88vw, 520px"
            style={{ objectFit: 'contain' }}
          />
        </Box>

        <Typography
          variant="h6"
          sx={{
            color: 'var(--dourado-claro)',
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.2rem' },
            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            maxWidth: 460,
          }}
        >
          Acerte o top 10. Duvide dos seus amigos. Sobreviva.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={comecar}
          startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 30 }} />}
          sx={{ fontSize: { xs: '1.15rem', sm: '1.4rem' }, px: { xs: 5, sm: 7 }, py: { xs: 1.4, sm: 1.8 } }}
        >
          Começar
        </Button>
      </Stack>
    </Box>
  );
}
