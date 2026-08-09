'use client';

import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import { useAudio } from '../lib/AudioProvider';
import SeletorJogador from './SeletorJogador';

/**
 * "Passar": quem nao consegue responder escolhe a si mesmo e paga 1 vida.
 * A carta continua na mesa - a penalidade e so pra quem passou.
 *
 * Igual ao DialogoDuvido, o formulario e um componente separado montado so
 * quando o dialogo abre, pra o estado nascer zerado sem useEffect.
 */
export default function DialogoPassar({ aberto, jogadores, onFechar, onConfirmar }) {
  return (
    <Dialog
      open={aberto}
      onClose={onFechar}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: 4 } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--dourado)', pb: 1 }}>
        <SkipNextRoundedIcon /> Passar a vez
      </DialogTitle>

      {aberto && <Formulario jogadores={jogadores} onFechar={onFechar} onConfirmar={onConfirmar} />}
    </Dialog>
  );
}

function Formulario({ jogadores, onFechar, onConfirmar }) {
  const { tocar } = useAudio();
  const vivos = jogadores.filter((j) => j.vivo);

  const [jogadorId, setJogadorId] = useState(null);
  const escolhido = vivos.find((j) => j.id === jogadorId) ?? null;

  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          <SeletorJogador
            titulo="Quem está passando?"
            jogadores={vivos}
            selecionado={jogadorId}
            onSelecionar={(id) => {
              tocar('toque');
              setJogadorId(id);
            }}
          />

          <Typography variant="caption" sx={{ color: 'rgba(255,246,224,.55)', display: 'block' }}>
            {escolhido
              ? escolhido.vidas === 1
                ? `${escolhido.nome} está com a última vida — se passar, está eliminado.`
                : `${escolhido.nome} perde 1 vida e fica com ${escolhido.vidas - 1}. A carta continua na mesa.`
              : 'Quem passa perde 1 vida. A carta continua na mesa e a vez vai pro próximo.'}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={() => {
            tocar('voltar');
            onFechar();
          }}
          sx={{ color: 'rgba(255,246,224,.6)' }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!jogadorId}
          onClick={() => jogadorId && onConfirmar(jogadorId)}
        >
          Passar
        </Button>
      </DialogActions>
    </>
  );
}
