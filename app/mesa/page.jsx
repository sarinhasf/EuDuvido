'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

import { useGame } from '../../lib/GameProvider';
import { VIDAS_INICIAIS, PONTOS_VITORIA } from '../../lib/gameLogic';
import { conferirResposta } from '../../lib/matcher';
import { useAudio } from '../../lib/AudioProvider';
import CartaJogador from '../../components/CartaJogador';
import CartaTema from '../../components/CartaTema';
import DialogoDuvido from '../../components/DialogoDuvido';
import ResultadoDuvido from '../../components/ResultadoDuvido';
import SorteioInicial from '../../components/SorteioInicial';
import FimDeJogo from '../../components/FimDeJogo';

export default function Mesa() {
  const router = useRouter();
  const { estado, dispatch } = useGame();
  const { tocar } = useAudio();
  const [carregandoTema, setCarregandoTema] = useState(false);
  const [duvidoAberto, setDuvidoAberto] = useState(false);
  const [aviso, setAviso] = useState('');
  const buscando = useRef(false);

  const { fase, jogadores, tema, cartaAberta, precisaNovoTema, ultimoDuvido, conferidas } = estado;

  /* ---------------- busca de tema no Groq ---------------- */

  const buscarTema = useCallback(async () => {
    if (buscando.current) return;
    buscando.current = true;
    setCarregandoTema(true);
    try {
      const r = await fetch('/api/tema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temasUsados: estado.temasUsados }),
      });
      const dados = await r.json();
      if (dados?.aviso) setAviso(dados.aviso);
      dispatch({ type: 'DEFINIR_TEMA', tema: { tema: dados.tema, top10: dados.top10 } });
    } catch (e) {
      setAviso(`Não consegui buscar o tema: ${e.message}`);
    } finally {
      setCarregandoTema(false);
      buscando.current = false;
    }
  }, [dispatch, estado.temasUsados]);

  // Sem jogadores (ex.: entrou direto na URL) -> volta pro cadastro.
  useEffect(() => {
    if (fase === 'setup' && jogadores.length === 0) {
      const t = setTimeout(() => router.replace('/jogadores'), 400);
      return () => clearTimeout(t);
    }
  }, [fase, jogadores.length, router]);

  // Puxa carta nova quando a rodada precisar - mas so depois que a tela de
  // resultado for fechada, senao a carta chega e atropela a leitura.
  useEffect(() => {
    if (fase === 'jogando' && precisaNovoTema && !ultimoDuvido && !buscando.current) {
      buscarTema();
    }
  }, [fase, precisaNovoTema, ultimoDuvido, buscarTema]);

  /* ---------------- acoes ---------------- */

  function conferir({ duvidadorId, duvidadoId, resposta }) {
    const resultado = conferirResposta(resposta, tema?.top10 ?? []);
    // resultado.acertou = o nome ESTA no top 10, ou seja, quem duvidou errou
    tocar(resultado.acertou ? 'erro' : 'acerto');
    dispatch({ type: 'RESOLVER_DUVIDO', duvidadorId, duvidadoId, resposta, resultado });
    setDuvidoAberto(false);
  }

  function sair() {
    tocar('voltar');
    dispatch({ type: 'RESETAR' });
    router.push('/');
  }

  /* ---------------- telas ---------------- */

  if (fase === 'setup' || jogadores.length === 0) {
    return (
      <Box className="mesa" sx={{ display: 'grid', placeItems: 'center', minHeight: 'var(--altura-tela)' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress sx={{ color: 'var(--dourado)' }} />
          <Typography sx={{ color: 'rgba(255,246,224,.6)' }}>Nenhuma partida em andamento…</Typography>
        </Stack>
      </Box>
    );
  }

  if (fase === 'sorteio') {
    return (
      <SorteioInicial
        jogadores={jogadores}
        vidasIniciais={VIDAS_INICIAIS}
        onDefinido={(indice) => dispatch({ type: 'SORTEAR_INICIAL', indice })}
      />
    );
  }

  if (fase === 'fim') {
    return (
      <>
        <FimDeJogo
          vencedor={jogadores.find((j) => j.id === estado.vencedorId)}
          jogadores={jogadores}
          onJogarNovamente={() => dispatch({ type: 'NOVA_PARTIDA' })}
          onTrocarJogadores={() => {
            dispatch({ type: 'RESETAR' });
            router.push('/jogadores');
          }}
        />
        {/* mostra o resultado do último duvido antes da tela de vitória */}
        {ultimoDuvido && (
          <ResultadoDuvido duvido={ultimoDuvido} onContinuar={() => dispatch({ type: 'LIMPAR_DUVIDO' })} />
        )}
      </>
    );
  }

  return (
    <Box
      className="mesa"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // altura FIXA (nao minHeight): assim a coluna e limitada pela tela e o
        // rodape com as vidas nunca e empurrado pra fora do campo de visao.
        height: 'var(--altura-tela)',
        overflow: 'hidden',
        px: { xs: 1.5, sm: 3 },
        py: { xs: 2, sm: 3 },
        gap: 2,
      }}
    >
      {/* topo: rodada + sair */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip
            size="small"
            label={`Rodada ${estado.rodada}`}
            sx={{ bgcolor: 'rgba(0,0,0,.35)', color: 'var(--dourado)' }}
          />
          <Chip
            size="small"
            label={`Vence com ${PONTOS_VITORIA} pontos`}
            sx={{ bgcolor: 'rgba(0,0,0,.35)', color: 'rgba(255,246,224,.65)' }}
          />
        </Stack>
        <Tooltip title="Sair da partida">
          <IconButton onClick={sair} size="small" sx={{ color: 'rgba(255,246,224,.55)' }}>
            <CloseRoundedIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* centro: carta do tema */}
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {carregandoTema ? (
          <Stack spacing={2} sx={{ alignItems: 'center', alignSelf: 'center', textAlign: 'center', py: 6 }}>
            <CircularProgress sx={{ color: 'var(--dourado)' }} />
            <Typography sx={{ color: 'var(--dourado)', fontFamily: 'var(--font-titulo)', fontWeight: 700 }}>
              Sorteando o próximo top 10…
            </Typography>
          </Stack>
        ) : !tema ? (
          // so cai aqui se a chamada falhar (servidor fora do ar, por exemplo)
          <Stack spacing={2} sx={{ alignItems: 'center', alignSelf: 'center', textAlign: 'center', py: 6 }}>
            <Typography sx={{ color: 'rgba(255,246,224,.7)' }}>Não consegui sortear a carta.</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                tocar('clique');
                buscarTema();
              }}
            >
              Tentar de novo
            </Button>
          </Stack>
        ) : (
          <>
            <CartaTema
              key={estado.rodada}
              tema={tema}
              aberta={cartaAberta}
              conferidas={conferidas}
              onToggle={() => {
                tocar('carta');
                dispatch({ type: cartaAberta ? 'FECHAR_CARTA' : 'ABRIR_CARTA' });
              }}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: 'center', alignSelf: 'center', pt: 0.5 }}
            >
              <Button
                className="pulso-duvido"
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<GavelRoundedIcon />}
                onClick={() => {
                  tocar('duvido');
                  setDuvidoAberto(true);
                }}
                sx={{ px: 5, fontSize: '1.15rem' }}
              >
                Duvido!
              </Button>
              <Tooltip title="Descartar esta carta e sortear outra">
                <IconButton
                  onClick={() => {
                    tocar('carta');
                    buscarTema();
                  }}
                  sx={{ color: 'rgba(255,246,224,.5)' }}
                  aria-label="Trocar carta"
                >
                  <AutorenewRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </>
        )}
      </Stack>

      {/* rodape: cartas dos jogadores */}
      <Stack
        className="mesa-rodape"
        direction="row"
        spacing={{ xs: 1, sm: 2 }}
        sx={{
          justifyContent: { xs: 'center', md: 'flex-start' },
          overflowX: 'auto',
          flexShrink: 0,
          pt: 1.5,
          pb: 0.5,
          borderTop: '1px solid rgba(255,201,60,.16)',
          '&::-webkit-scrollbar': { height: 6 },
        }}
      >
        {jogadores.map((j) => (
          <CartaJogador
            key={j.id}
            jogador={j}
            vidasIniciais={VIDAS_INICIAIS}
            largura="var(--carta-jogador, 88px)"
          />
        ))}
      </Stack>

      <DialogoDuvido
        aberto={duvidoAberto}
        jogadores={jogadores}
        onFechar={() => setDuvidoAberto(false)}
        onConferir={conferir}
      />

      {ultimoDuvido && (
        <ResultadoDuvido duvido={ultimoDuvido} onContinuar={() => dispatch({ type: 'LIMPAR_DUVIDO' })} />
      )}

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={7000}
        onClose={() => setAviso('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setAviso('')} sx={{ maxWidth: 420 }}>
          {aviso}
        </Alert>
      </Snackbar>
    </Box>
  );
}
