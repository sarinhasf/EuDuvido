'use client';

import Image from 'next/image';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';

/**
 * Carta de um jogador no rodape da mesa.
 *
 * Duas contagens, propositalmente com formas diferentes pra ninguem confundir:
 *  - VIDAS: fileira de coracoes dourados embaixo do nome;
 *  - PONTOS: medalha redonda no canto da carta.
 */
export default function CartaJogador({
  jogador,
  naVez = false,
  vidasIniciais = 4,
  compacto = false,
  // true enquanto a carta roda a animacao de saida antes de ser removida
  // da mesa (ver .carta-saindo no globals.css)
  saindo = false,
  // avisa quando a animacao de saida terminou, pra mesa desmontar a carta
  onFimDaSaida,
  // A mesa passa uma CSS var aqui pra poder encolher a carta por media query
  // de ALTURA (ver .mesa-rodape no globals.css). A tela de sorteio nao passa
  // nada e usa os tamanhos padrao abaixo.
  largura: larguraExterna,
  onClick,
}) {
  const { nome, carta, vidas, vivo } = jogador;
  const pontos = jogador.pontos ?? 0;
  const largura =
    larguraExterna ?? (compacto ? { xs: 58, sm: 70 } : { xs: 68, sm: 88, md: 96 });

  return (
    <Stack
      spacing={0.6}
      onClick={onClick}
      className={saindo ? 'carta-saindo' : undefined}
      // as animacoes internas (coracoes, medalha) tambem borbulham ate aqui:
      // so a queda da carta pode disparar a remocao
      onAnimationEnd={(e) => {
        if (saindo && e.target === e.currentTarget) onFimDaSaida?.();
      }}
      sx={{ alignItems: 'center',
        width: largura,
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        opacity: vivo ? 1 : 0.45,
        transition: 'transform .2s ease, opacity .2s ease',
        transform: naVez ? 'translateY(-8px)' : 'none',
      }}
    >
      <Box
        className={naVez && vivo ? 'na-vez' : undefined}
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '330 / 454',
          borderRadius: 0.5,
          border: '2px solid',
          borderColor: naVez && vivo ? 'var(--dourado)' : 'rgba(255,201,60,0.3)',
          filter: vivo ? 'none' : 'grayscale(1)',
          boxShadow: '0 10px 22px rgba(0,0,0,0.45)',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, borderRadius: 0.5, overflow: 'hidden' }}>
          {carta?.src && (
            <Image src={carta.src} alt={nome} fill sizes="120px" style={{ objectFit: 'cover' }} />
          )}

          {!vivo && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(20,4,36,0.66)',
              }}
            >
              <HeartBrokenRoundedIcon sx={{ color: 'var(--rosa)', fontSize: 28 }} />
            </Box>
          )}
        </Box>

        {/* PONTOS — medalha no canto, fora do overflow pra poder "sair" da carta */}
        <Box
          aria-label={`${pontos} ponto${pontos === 1 ? '' : 's'}`}
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            minWidth: { xs: 22, sm: 26 },
            height: { xs: 22, sm: 26 },
            px: 0.5,
            borderRadius: '999px',
            display: 'grid',
            placeItems: 'center',
            border: '2px solid var(--roxo-escuro)',
            background: pontos > 0
              ? 'linear-gradient(180deg, #FFE08A 0%, #FFC93C 100%)'
              : 'rgba(34,9,61,0.9)',
            color: pontos > 0 ? 'var(--roxo-escuro)' : 'rgba(255,246,224,0.5)',
            fontFamily: 'var(--font-titulo)',
            fontWeight: 800,
            fontSize: { xs: '.72rem', sm: '.82rem' },
            lineHeight: 1,
            boxShadow: pontos > 0 ? '0 0 12px rgba(255,201,60,.6)' : 'none',
            transition: 'background .3s ease, color .3s ease',
          }}
        >
          {pontos}
        </Box>
      </Box>

      <Typography
        noWrap
        sx={{
          maxWidth: '100%',
          fontFamily: 'var(--font-titulo)',
          fontWeight: 700,
          fontSize: { xs: '.76rem', sm: '.9rem' },
          color: naVez && vivo ? 'var(--dourado)' : 'var(--creme)',
        }}
      >
        {nome}
      </Typography>

      {/* VIDAS — coracoes apagando conforme perde */}
      <Stack
        direction="row"
        spacing={0.15}
        aria-label={`${vidas} vida${vidas === 1 ? '' : 's'}`}
        sx={{ alignItems: 'center', minHeight: 18 }}
      >
        {vidas > vidasIniciais ? (
          <>
            <FavoriteRoundedIcon sx={{ fontSize: 15, color: 'var(--dourado)' }} />
            <Typography sx={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--dourado)' }}>
              ×{vidas}
            </Typography>
          </>
        ) : (
          Array.from({ length: vidasIniciais }, (_, i) => (
            <FavoriteRoundedIcon
              key={i}
              sx={{
                fontSize: 15,
                color: i < vidas ? 'var(--dourado)' : 'rgba(255,246,224,0.16)',
                transition: 'color .3s ease',
              }}
            />
          ))
        )}
      </Stack>
    </Stack>
  );
}
