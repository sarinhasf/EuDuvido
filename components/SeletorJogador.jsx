'use client';

import Image from 'next/image';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Fileira de cartas pra escolher um jogador.
 * Usado no dialogo do "Duvido" (duas vezes) e no de "Passar" (uma vez).
 *
 * `desabilitado` recebe o id de quem NAO pode ser escolhido - no duvido, o
 * jogador ja marcado no outro seletor, pra ninguem duvidar de si mesmo.
 */
export default function SeletorJogador({
  titulo,
  jogadores,
  selecionado,
  desabilitado = null,
  onSelecionar,
}) {
  return (
    <Box>
      {titulo && (
        <Typography sx={{ mb: 1, fontFamily: 'var(--font-titulo)', fontWeight: 700, fontSize: '.95rem' }}>
          {titulo}
        </Typography>
      )}
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
        {jogadores.map((j) => {
          const ativo = selecionado === j.id;
          const bloqueado = desabilitado === j.id;
          return (
            <Stack
              key={j.id}
              spacing={0.4}
              role="button"
              tabIndex={bloqueado ? -1 : 0}
              onClick={() => !bloqueado && onSelecionar(j.id)}
              onKeyDown={(e) => e.key === 'Enter' && !bloqueado && onSelecionar(j.id)}
              sx={{
                alignItems: 'center',
                width: 60,
                flexShrink: 0,
                cursor: bloqueado ? 'not-allowed' : 'pointer',
                opacity: bloqueado ? 0.3 : 1,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '330 / 454',
                  borderRadius: 0.5,
                  overflow: 'hidden',
                  border: ativo ? '3px solid var(--dourado)' : '2px solid rgba(255,201,60,.22)',
                  transform: ativo ? 'translateY(-3px)' : 'none',
                  transition: 'transform .16s ease, border-color .16s ease',
                }}
              >
                {j.carta?.src && (
                  <Image src={j.carta.src} alt={j.nome} fill sizes="70px" style={{ objectFit: 'cover' }} />
                )}
              </Box>
              <Typography
                noWrap
                sx={{
                  maxWidth: '100%',
                  fontSize: '.66rem',
                  fontWeight: 700,
                  color: ativo ? 'var(--dourado)' : 'var(--creme)',
                }}
              >
                {j.nome}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
