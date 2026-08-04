'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SentimentVeryDissatisfiedRoundedIcon from '@mui/icons-material/SentimentVeryDissatisfiedRounded';
import { useAudio } from '../lib/AudioProvider';

/** Placar do "Duvido" que acabou de ser conferido. */
export default function ResultadoDuvido({ duvido, onContinuar }) {
  const { tocar } = useAudio();

  if (!duvido) return null;

  const {
    duvidadorNome,
    duvidadoNome,
    resposta,
    respostaNoTop10,
    duvidadorAcertou,
    pontosDuvidador,
    posicao,
    item,
    tema,
    top10 = [],
    posicoesReveladas = [],
  } = duvido;

  const cor = duvidadorAcertou ? 'var(--verde)' : 'var(--vermelho)';

  return (
    <Dialog
      open
      onClose={onContinuar}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: 4, borderColor: cor } } }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          {duvidadorAcertou ? (
            <EmojiEventsRoundedIcon sx={{ fontSize: 60, color: cor }} />
          ) : (
            <SentimentVeryDissatisfiedRoundedIcon sx={{ fontSize: 60, color: cor }} />
          )}

          <Typography
            variant="h5"
            sx={{ color: cor, fontFamily: 'var(--font-titulo)', fontWeight: 800, lineHeight: 1.15 }}
          >
            {duvidadorAcertou ? 'Duvidou e acertou!' : 'Duvidou e se deu mal!'}
          </Typography>

          <Box
            sx={{
              width: '100%',
              p: 2,
              borderRadius: 3,
              bgcolor: 'rgba(0,0,0,.28)',
              border: '1px solid rgba(255,201,60,.2)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,246,224,.55)' }}>
              Resposta conferida
            </Typography>
            <Typography sx={{ fontFamily: 'var(--font-titulo)', fontWeight: 800, fontSize: '1.25rem', my: 0.5 }}>
              “{resposta}”
            </Typography>

            {respostaNoTop10 ? (
              <Chip
                icon={<FavoriteRoundedIcon />}
                label={`Está no top 10 — ${posicao}º lugar${item ? `: ${item}` : ''}`}
                sx={{ bgcolor: 'rgba(61,214,140,.2)', color: 'var(--verde)', maxWidth: '100%' }}
              />
            ) : (
              <Chip
                icon={<HeartBrokenRoundedIcon />}
                label="Não está no top 10"
                sx={{ bgcolor: 'rgba(255,77,109,.2)', color: 'var(--vermelho)' }}
              />
            )}
          </Box>

          <Stack spacing={0.75} sx={{ width: '100%' }}>
            {duvidadorAcertou ? (
              <>
                <LinhaPlacar nome={duvidadoNome} delta={-1} texto="perdeu 1 vida" />
                <LinhaPlacar
                  nome={duvidadorNome}
                  delta={+1}
                  ponto
                  texto={`marcou 1 ponto${pontosDuvidador ? ` (total: ${pontosDuvidador})` : ''}`}
                />
                <Typography variant="caption" sx={{ color: 'rgba(255,246,224,.6)', pt: 0.5 }}>
                  Carta descartada — vem tema novo e {duvidadorNome} começa.
                </Typography>
              </>
            ) : (
              <>
                <LinhaPlacar nome={duvidadorNome} delta={-1} texto="perdeu 1 vida" />
                <Typography variant="caption" sx={{ color: 'rgba(255,246,224,.6)', pt: 0.5 }}>
                  A carta continua na mesa — o jogo segue no mesmo top 10.
                </Typography>
              </>
            )}
          </Stack>

          {/* A carta vai ser descartada: mostra o top 10 antes de sumir.
              Quando o duvidador ERRA a carta continua na mesa, entao revelar
              a lista aqui estragaria o resto da rodada. */}
          {duvidadorAcertou && top10.length > 0 && (
            <ListaRevelada tema={tema} top10={top10} reveladas={posicoesReveladas} />
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              tocar('clique');
              onContinuar();
            }}
            sx={{ mt: 1, px: 5 }}
          >
            Continuar
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function LinhaPlacar({ nome, delta, texto, ponto = false }) {
  const positivo = delta > 0;
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', justifyContent: 'center',
        py: 0.75,
        px: 1.5,
        borderRadius: 2,
        bgcolor: ponto
          ? 'rgba(255,201,60,.14)'
          : positivo
            ? 'rgba(61,214,140,.12)'
            : 'rgba(255,77,109,.12)',
      }}
    >
      {ponto ? (
        <MilitaryTechRoundedIcon sx={{ fontSize: 20, color: 'var(--dourado)' }} />
      ) : positivo ? (
        <FavoriteRoundedIcon sx={{ fontSize: 18, color: 'var(--verde)' }} />
      ) : (
        <HeartBrokenRoundedIcon sx={{ fontSize: 18, color: 'var(--vermelho)' }} />
      )}
      <Typography sx={{ fontWeight: 700, fontSize: '.92rem' }}>
        <Box
          component="span"
          sx={{ color: ponto ? 'var(--dourado)' : positivo ? 'var(--verde)' : 'var(--vermelho)' }}
        >
          {nome}
        </Box>{' '}
        {texto}
      </Typography>
    </Stack>
  );
}

/** O top 10 da carta que acabou de ser descartada. */
function ListaRevelada({ tema, top10, reveladas = [] }) {
  const jaSaiu = new Set(reveladas);

  return (
    <Box
      sx={{
        width: '100%',
        p: 1.5,
        borderRadius: 3,
        bgcolor: 'rgba(0,0,0,.3)',
        border: '1px solid rgba(255,201,60,.22)',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'var(--font-titulo)',
          fontWeight: 800,
          fontSize: '.8rem',
          color: 'var(--dourado)',
          mb: 1,
        }}
      >
        {tema || 'A resposta era'}
      </Typography>

      <Stack spacing={0.3} sx={{ maxHeight: 210, overflowY: 'auto', pr: 0.5 }}>
        {top10.map((nome, i) => {
          const acertado = jaSaiu.has(i + 1);
          return (
            <Stack
              key={`${nome}-${i}`}
              direction="row"
              spacing={0.75}
              sx={{
                alignItems: 'center',
                px: 0.75,
                py: 0.3,
                borderRadius: 1,
                bgcolor: acertado ? 'rgba(61,214,140,.16)' : 'rgba(255,255,255,.04)',
              }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  width: 19,
                  height: 19,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'var(--dourado)',
                  color: 'var(--roxo-escuro)',
                  fontFamily: 'var(--font-titulo)',
                  fontWeight: 800,
                  fontSize: '.66rem',
                }}
              >
                {i + 1}
              </Box>
              <Typography
                noWrap
                sx={{
                  flex: 1,
                  textAlign: 'left',
                  fontSize: '.8rem',
                  fontWeight: 700,
                  color: 'var(--creme)',
                  opacity: acertado ? 0.7 : 1,
                }}
              >
                {nome}
              </Typography>
              {acertado && <CheckRoundedIcon sx={{ fontSize: 15, color: 'var(--verde)' }} />}
            </Stack>
          );
        })}
      </Stack>

      {reveladas.length > 0 && (
        <Typography variant="caption" sx={{ color: 'rgba(255,246,224,.5)', mt: 1, display: 'block' }}>
          Marcados em verde: o que a mesa acertou nesta rodada.
        </Typography>
      )}
    </Box>
  );
}
