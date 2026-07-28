'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

/**
 * Carta central da rodada.
 * Frente: "Top 10 ...". Clicou, vira e mostra a lista numerada de 1 a 10.
 * Quem vira a carta e o juiz da rodada - os outros nao deveriam olhar.
 */
export default function CartaTema({ tema, aberta, onToggle, conferidas = [] }) {
  const acertadas = new Set(
    conferidas.filter((c) => c.acertou && c.posicao).map((c) => c.posicao),
  );

  return (
    <Box className="cena-carta" sx={{ width: '100%', display: 'grid', placeItems: 'center' }}>
      <Box
        className={`carta-tema carta-entra ${aberta ? 'virada' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={aberta ? 'Esconder o top 10' : 'Ver o top 10'}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        sx={{
          // Tres limites ao mesmo tempo: largura da tela, teto fixo e ALTURA
          // disponivel. O termo em vh e o que importa aqui - a carta e mais
          // alta que larga (proporcao 330/454), entao 30vh de largura vira
          // ~41vh de altura, deixando o resto da tela pro botao Duvido e pro
          // rodape. Sem ele, em janela baixa a carta empurrava o botao pra fora.
          width: 'min(74vw, 320px, 30vh)',
          aspectRatio: '330 / 454',
        }}
      >
        {/* FRENTE — o tema */}
        <Box
          className="face-carta"
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            textAlign: 'center',
            background: 'linear-gradient(160deg, #6B2FB5 0%, #4E1B86 55%, #35105E 100%)',
            border: '4px solid var(--dourado)',
            boxShadow: '0 22px 50px rgba(0,0,0,0.55)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 10,
              borderRadius: '14px',
              border: '2px solid rgba(255,201,60,0.55)',
              pointerEvents: 'none',
            }}
          />
          <Typography
            sx={{
              fontFamily: 'var(--font-titulo)',
              fontWeight: 800,
              letterSpacing: 3,
              fontSize: '.72rem',
              color: 'var(--rosa)',
            }}
          >
            CARTA
          </Typography>

          <Typography
            sx={{
              fontFamily: 'var(--font-titulo)',
              fontWeight: 800,
              lineHeight: 1.16,
              fontSize: { xs: '1.25rem', sm: '1.45rem' },
              color: 'var(--creme)',
              textShadow: '0 3px 10px rgba(0,0,0,.55)',
              px: 1,
            }}
          >
            {tema?.tema ?? 'Top 10'}
          </Typography>

          <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', mt: 1, opacity: 0.85 }}>
            <VisibilityRoundedIcon sx={{ fontSize: 17, color: 'var(--dourado)' }} />
            <Typography sx={{ fontSize: '.72rem', color: 'var(--dourado)' }}>
              toque para ver a lista
            </Typography>
          </Stack>
        </Box>

        {/* VERSO — o top 10 */}
        <Box
          className="face-carta face-verso"
          sx={{
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(160deg, #2E0C52 0%, #4E1B86 100%)',
            border: '4px solid var(--dourado)',
            boxShadow: '0 22px 50px rgba(0,0,0,0.55)',
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
              fontFamily: 'var(--font-titulo)',
              fontWeight: 800,
              fontSize: '.68rem',
              letterSpacing: 1,
              color: 'var(--rosa)',
              mb: 0.5,
            }}
          >
            SÓ O JUIZ DEVE OLHAR
          </Typography>

          <Stack spacing={0.25} sx={{ flex: 1, overflowY: 'auto' }}>
            {(tema?.top10 ?? []).map((item, i) => {
              const jaSaiu = acertadas.has(i + 1);
              return (
                <Stack
                  key={`${item}-${i}`}
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: 'center',
                    px: 0.75,
                    py: 0.3,
                    borderRadius: 1,
                    bgcolor: jaSaiu ? 'rgba(61,214,140,0.16)' : 'rgba(0,0,0,0.22)',
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
                      fontSize: { xs: '.76rem', sm: '.84rem' },
                      fontWeight: 700,
                      color: 'var(--creme)',
                      textDecoration: jaSaiu ? 'line-through' : 'none',
                      opacity: jaSaiu ? 0.65 : 1,
                    }}
                  >
                    {item}
                  </Typography>
                  {jaSaiu && <CheckRoundedIcon sx={{ fontSize: 15, color: 'var(--verde)' }} />}
                </Stack>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', justifyContent: 'center', mt: 0.75 }}>
            <VisibilityOffRoundedIcon sx={{ fontSize: 15, color: 'rgba(255,246,224,.6)' }} />
            <Typography sx={{ fontSize: '.68rem', color: 'rgba(255,246,224,.6)' }}>
              toque para esconder
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
