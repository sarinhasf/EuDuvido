'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import { useAudio } from '../lib/AudioProvider';
import SeletorJogador from './SeletorJogador';

/**
 * Fluxo do "Duvido": quem duvidou, de quem duvidou e qual foi a resposta.
 * A conferencia em si fica no componente pai (usa conferirResposta do matcher).
 *
 * O formulario e um componente separado, montado so quando o dialogo abre.
 * Assim o estado nasce zerado a cada abertura, sem precisar de useEffect.
 */
export default function DialogoDuvido({ aberto, jogadores, onFechar, onConferir }) {
  return (
    <Dialog
      open={aberto}
      onClose={onFechar}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: 4 } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--rosa)', pb: 1 }}>
        <GavelRoundedIcon /> Eu duvido!
      </DialogTitle>

      {aberto && (
        <Formulario jogadores={jogadores} onFechar={onFechar} onConferir={onConferir} />
      )}
    </Dialog>
  );
}

function Formulario({ jogadores, onFechar, onConferir }) {
  const { tocar } = useAudio();
  const vivos = jogadores.filter((j) => j.vivo);

  // Nao existe "vez" na partida, entao nada vem marcado: quem abriu o dialogo
  // escolhe os dois jogadores na hora.
  const [duvidadoId, setDuvidadoId] = useState(null);
  const [duvidadorId, setDuvidadorId] = useState(null);
  const [resposta, setResposta] = useState('');

  const podeConferir = Boolean(
    duvidadoId && duvidadorId && duvidadoId !== duvidadorId && resposta.trim(),
  );

  function confirmar() {
    if (!podeConferir) return;
    onConferir({ duvidadorId, duvidadoId, resposta: resposta.trim() });
  }

  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5}>
          <SeletorJogador
            titulo="1. Quem está duvidando?"
            jogadores={vivos}
            selecionado={duvidadorId}
            desabilitado={duvidadoId}
            onSelecionar={(id) => {
              tocar('toque');
              setDuvidadorId(id);
            }}
          />

          <SeletorJogador
            titulo="2. De quem?"
            jogadores={vivos}
            selecionado={duvidadoId}
            desabilitado={duvidadorId}
            onSelecionar={(id) => {
              tocar('toque');
              setDuvidadoId(id);
            }}
          />

          <Box>
            <Typography sx={{ mb: 1, fontFamily: 'var(--font-titulo)', fontWeight: 700, fontSize: '.95rem' }}>
              3. O que foi respondido?
            </Typography>
            <TextField
              fullWidth
              autoFocus
              placeholder="Ex: Cristiano Ronaldo"
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmar()}
              slotProps={{ htmlInput: { maxLength: 60, autoComplete: 'off', autoCapitalize: 'words' } }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255,246,224,.5)', mt: 0.75, display: 'block' }}>
              Pode escrever só o sobrenome ou com pequenos erros de digitação — o jogo entende.
            </Typography>
          </Box>
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
        <Button variant="contained" color="secondary" onClick={confirmar} disabled={!podeConferir}>
          Conferir
        </Button>
      </DialogActions>
    </>
  );
}
