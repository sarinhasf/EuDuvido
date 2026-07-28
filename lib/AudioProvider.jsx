'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  carregarPreferencia,
  definirMudo,
  iniciarMusica,
  pararMusica,
  tocar as tocarEfeito,
} from './audio';

const AudioContexto = createContext(null);

export function AudioProvider({ children }) {
  const [mudo, setMudoEstado] = useState(false);
  const querMusica = useRef(false);

  // A preferencia so pode ser lida no cliente (localStorage).
  useEffect(() => {
    setMudoEstado(carregarPreferencia());
  }, []);

  /**
   * Navegador so libera audio depois de um gesto. Quando alguma tela pede
   * musica antes disso, guardamos a intencao e ligamos no primeiro
   * clique/toque/tecla que acontecer na pagina.
   */
  useEffect(() => {
    function destravar() {
      if (querMusica.current) iniciarMusica();
    }
    const eventos = ['pointerdown', 'keydown', 'touchstart'];
    eventos.forEach((e) => window.addEventListener(e, destravar, { passive: true }));
    return () => eventos.forEach((e) => window.removeEventListener(e, destravar));
  }, []);

  const tocar = useCallback((nome) => tocarEfeito(nome), []);

  const ligarMusica = useCallback(() => {
    querMusica.current = true;
    iniciarMusica(); // se ainda estiver bloqueado, o destravar() cuida
  }, []);

  const desligarMusica = useCallback(() => {
    querMusica.current = false;
    pararMusica();
  }, []);

  const alternarMudo = useCallback(() => {
    const novo = definirMudo(!mudo);
    if (!novo && querMusica.current) iniciarMusica();
    setMudoEstado(novo);
  }, [mudo]);

  const valor = useMemo(
    () => ({ mudo, alternarMudo, tocar, ligarMusica, desligarMusica }),
    [mudo, alternarMudo, tocar, ligarMusica, desligarMusica],
  );

  return <AudioContexto.Provider value={valor}>{children}</AudioContexto.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContexto);
  // Sem provider o jogo continua funcionando, so fica mudo.
  return ctx ?? { mudo: true, alternarMudo: () => {}, tocar: () => {}, ligarMusica: () => {}, desligarMusica: () => {} };
}
