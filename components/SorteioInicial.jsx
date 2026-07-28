'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CartaJogador from './CartaJogador';
import { useAudio } from '../lib/AudioProvider';

/**
 * Roleta que decide quem abre a partida.
 * Passa por cada carta acelerando e desacelerando ate parar no sorteado.
 */
export default function SorteioInicial({ jogadores, vidasIniciais, onDefinido }) {
  const { tocar } = useAudio();
  const [destaque, setDestaque] = useState(0);
  const [sorteado, setSorteado] = useState(null);
  const timers = useRef([]);

  useEffect(() => {
    const agendados = timers.current; // copia local pro cleanup (regra do react-hooks)
    const vencedor = Math.floor(Math.random() * jogadores.length);
    // 2 a 3 voltas completas + a distancia ate o escolhido
    const voltas = 2 + Math.floor(Math.random() * 2);
    const passos = voltas * jogadores.length + vencedor;

    let acumulado = 0;
    for (let i = 1; i <= passos; i += 1) {
      // desacelera no final (ease-out)
      const intervalo = 70 + Math.pow(i / passos, 3) * 320;
      acumulado += intervalo;
      agendados.push(
        setTimeout(() => {
          setDestaque(i % jogadores.length);
          tocar('tique');
        }, acumulado),
      );
    }

    agendados.push(
      setTimeout(() => {
        setSorteado(vencedor);
        tocar('acerto');
        agendados.push(setTimeout(() => onDefinido(vencedor), 1400));
      }, acumulado + 260),
    );

    return () => agendados.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const indiceAtual = sorteado ?? destaque;

  return (
    <Box
      className="mesa"
      sx={{ display: 'grid', placeItems: 'center', px: 2, py: 5, minHeight: 'var(--altura-tela)' }}
    >
      <Stack spacing={4} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'var(--dourado)' }}>
          {sorteado === null ? 'Quem começa?' : 'Começa quem?'}
        </Typography>

        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 2.5 }}
          useFlexGap
          sx={{ justifyContent: 'center', flexWrap: 'wrap', maxWidth: 700 }}
        >
          {jogadores.map((j, i) => (
            <Box key={j.id} className={sorteado === null && i === indiceAtual ? 'girando-sorteio' : undefined}>
              <CartaJogador
                jogador={j}
                naVez={i === indiceAtual}
                vidasIniciais={vidasIniciais}
                compacto={jogadores.length > 4}
              />
            </Box>
          ))}
        </Stack>

        {sorteado !== null ? (
          <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h5" sx={{ color: 'var(--creme)' }}>
              <Box component="span" sx={{ color: 'var(--dourado)' }}>
                {jogadores[sorteado].nome}
              </Box>{' '}
              começa!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                tocar('clique');
                onDefinido(sorteado);
              }}
            >
              Bora
            </Button>
          </Stack>
        ) : (
          <Typography sx={{ color: 'rgba(255,246,224,.6)' }}>sorteando…</Typography>
        )}
      </Stack>
    </Box>
  );
}
