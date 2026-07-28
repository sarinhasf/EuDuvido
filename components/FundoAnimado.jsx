'use client';

import Box from '@mui/material/Box';

/**
 * Fundo da tela inicial: as proprias cartas do jogo subindo devagar,
 * como se tivessem sido jogadas pra cima, mais brilhos piscando.
 *
 * Os valores sao gerados por uma funcao deterministica (nao Math.random)
 * pra que servidor e cliente rendam exatamente a mesma coisa e o React
 * nao reclame de hydration mismatch.
 *
 * No mobile o fundo fica mais limpo: as cartas que passam do limite de
 * `quantidadeCartasMobile` sao escondidas por CSS (media query), e nao por
 * JS. Isso mantem o HTML igual no servidor e no cliente - se a decisao
 * fosse tomada com useMediaQuery, a primeira renderizacao viria com o
 * numero errado e piscaria na tela.
 */

// PRNG simples e estavel: mesma entrada, mesma saida, no server e no client.
function aleatorioEstavel(semente) {
  const x = Math.sin(semente * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const CORES_BRILHO = ['#FFC93C', '#FF5FA2', '#5BC8FF', '#FFE08A', '#C89BFF'];

export default function FundoAnimado({
  cartas = [],
  quantidadeCartas = 14,
  quantidadeCartasMobile = 5,
  quantidadeBrilhos = 26,
  quantidadeBrilhosMobile = 12,
}) {
  const totalCartas = Math.max(quantidadeCartas, quantidadeCartasMobile);
  const totalBrilhos = Math.max(quantidadeBrilhos, quantidadeBrilhosMobile);

  const cartasFlutuantes =
    cartas.length > 0
      ? Array.from({ length: totalCartas }, (_, i) => {
          const r1 = aleatorioEstavel(i + 1);
          const r2 = aleatorioEstavel(i + 31);
          const r3 = aleatorioEstavel(i + 61);
          const r4 = aleatorioEstavel(i + 91);
          return {
            key: `c${i}`,
            src: cartas[i % cartas.length].src,
            soDesktop: i >= quantidadeCartasMobile,
            esquerda: `${Math.round(r1 * 92) + 2}%`,
            // cartas um pouco menores no celular, pra nao competir com a logo
            tamanho: `${Math.round(58 + r2 * 78)}px`,
            tamanhoMobile: `${Math.round(44 + r2 * 46)}px`,
            duracao: `${(16 + r3 * 16).toFixed(1)}s`,
            atraso: `${-(r4 * 26).toFixed(1)}s`,
            desvio: `${Math.round((r2 - 0.5) * 160)}px`,
            giroInicial: `${Math.round((r3 - 0.5) * 40)}deg`,
            giroFinal: `${Math.round((r4 - 0.5) * 90)}deg`,
          };
        })
      : [];

  const brilhos = Array.from({ length: totalBrilhos }, (_, i) => {
    const r1 = aleatorioEstavel(i + 201);
    const r2 = aleatorioEstavel(i + 233);
    const r3 = aleatorioEstavel(i + 277);
    const r4 = aleatorioEstavel(i + 311);
    return {
      key: `b${i}`,
      soDesktop: i >= quantidadeBrilhosMobile,
      esquerda: `${(r1 * 98).toFixed(1)}%`,
      topo: `${(r2 * 96).toFixed(1)}%`,
      tamanho: `${Math.round(8 + r3 * 20)}px`,
      duracao: `${(2.4 + r4 * 3.6).toFixed(1)}s`,
      atraso: `${(r3 * 5).toFixed(1)}s`,
      cor: CORES_BRILHO[i % CORES_BRILHO.length],
    };
  });

  return (
    <Box className="camada-cartas" aria-hidden="true">
      {cartasFlutuantes.map((c) => (
        <Box
          key={c.key}
          className={`carta-flutuante ${c.soDesktop ? 'so-desktop' : ''}`}
          sx={{
            left: c.esquerda,
            backgroundImage: `url(${c.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          style={{
            '--tam': c.tamanho,
            '--tam-mobile': c.tamanhoMobile,
            '--dur': c.duracao,
            '--atraso': c.atraso,
            '--desvio': c.desvio,
            '--giro-ini': c.giroInicial,
            '--giro-fim': c.giroFinal,
          }}
        />
      ))}

      {brilhos.map((b) => (
        <Box
          key={b.key}
          className={`brilho ${b.soDesktop ? 'so-desktop' : ''}`}
          sx={{ left: b.esquerda, top: b.topo }}
          style={{
            '--tam': b.tamanho,
            '--dur': b.duracao,
            '--atraso': b.atraso,
            '--cor': b.cor,
          }}
        />
      ))}
    </Box>
  );
}
