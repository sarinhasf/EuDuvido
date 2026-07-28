'use client';

import { createContext, useContext, useEffect, useReducer, useRef, useMemo } from 'react';
import { reducer, estadoInicial } from './gameLogic';

const CHAVE = 'eu-duvido:estado';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial);
  const hidratou = useRef(false);

  // Recupera a partida se a pessoa recarregar a pagina no meio do jogo.
  useEffect(() => {
    try {
      const salvo = sessionStorage.getItem(CHAVE);
      if (salvo) dispatch({ type: 'HIDRATAR', estado: JSON.parse(salvo) });
    } catch {
      /* storage indisponivel, segue sem persistencia */
    }
    hidratou.current = true;
  }, []);

  useEffect(() => {
    if (!hidratou.current) return;
    try {
      sessionStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      /* ignora quota/privacidade */
    }
  }, [estado]);

  const valor = useMemo(() => ({ estado, dispatch }), [estado]);
  return <GameContext.Provider value={valor}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame precisa estar dentro de <GameProvider>');
  return ctx;
}
