'use client';

import { createTheme } from '@mui/material/styles';

/**
 * Paleta extraida da logo e das cartas:
 * roxo profundo de fundo, roxo vibrante das cartas, dourado das bordas/coracoes,
 * rosa dos detalhes e creme do texto "Eu".
 */
export const palette = {
  roxoEscuro: '#22093D',
  roxoMesa: '#3B1163',
  roxoCarta: '#4E1B86',
  roxoClaro: '#7A3BC4',
  dourado: '#FFC93C',
  douradoClaro: '#FFE08A',
  rosa: '#FF5FA2',
  ciano: '#5BC8FF',
  creme: '#FFF6E0',
  vermelho: '#FF4D6D',
  verde: '#3DD68C',
};

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: { main: palette.dourado, contrastText: palette.roxoEscuro },
    secondary: { main: palette.rosa, contrastText: '#FFFFFF' },
    error: { main: palette.vermelho },
    success: { main: palette.verde },
    info: { main: palette.ciano },
    background: { default: palette.roxoEscuro, paper: palette.roxoCarta },
    text: { primary: palette.creme, secondary: 'rgba(255, 246, 224, 0.72)' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'var(--font-corpo), system-ui, sans-serif',
    h1: { fontFamily: 'var(--font-titulo), sans-serif', fontWeight: 800 },
    h2: { fontFamily: 'var(--font-titulo), sans-serif', fontWeight: 800 },
    h3: { fontFamily: 'var(--font-titulo), sans-serif', fontWeight: 700 },
    h4: { fontFamily: 'var(--font-titulo), sans-serif', fontWeight: 700 },
    h5: { fontFamily: 'var(--font-titulo), sans-serif', fontWeight: 600 },
    h6: { fontFamily: 'var(--font-titulo), sans-serif', fontWeight: 600 },
    button: { fontFamily: 'var(--font-titulo), sans-serif', fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 28,
          paddingBlock: 12,
          fontSize: '1.05rem',
          letterSpacing: 0.3,
        },
        containedPrimary: {
          background: `linear-gradient(180deg, ${palette.douradoClaro} 0%, ${palette.dourado} 100%)`,
          color: palette.roxoEscuro,
          boxShadow: `0 5px 0 #C9922A, 0 12px 24px rgba(0,0,0,0.35)`,
          '&:hover': {
            background: `linear-gradient(180deg, #FFEBAE 0%, #FFD25C 100%)`,
            boxShadow: `0 5px 0 #C9922A, 0 14px 28px rgba(0,0,0,0.4)`,
          },
          '&:active': { transform: 'translateY(3px)', boxShadow: `0 2px 0 #C9922A` },
          '&.Mui-disabled': { background: '#5b4a6b', color: 'rgba(255,255,255,0.4)', boxShadow: 'none' },
        },
        containedSecondary: {
          background: `linear-gradient(180deg, #FF8ABF 0%, ${palette.rosa} 100%)`,
          boxShadow: `0 5px 0 #C93F79, 0 12px 24px rgba(0,0,0,0.35)`,
          '&:active': { transform: 'translateY(3px)', boxShadow: `0 2px 0 #C93F79` },
        },
        outlined: {
          borderWidth: 2,
          borderColor: 'rgba(255, 201, 60, 0.55)',
          color: palette.douradoClaro,
          '&:hover': { borderWidth: 2, borderColor: palette.dourado, background: 'rgba(255,201,60,0.1)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `2px solid rgba(255, 201, 60, 0.25)`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.roxoCarta,
          border: `3px solid ${palette.dourado}`,
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0,0,0,0.25)',
          '& fieldset': { borderColor: 'rgba(255, 201, 60, 0.35)', borderWidth: 2 },
          '&:hover fieldset': { borderColor: 'rgba(255, 201, 60, 0.6)' },
          '&.Mui-focused fieldset': { borderColor: palette.dourado },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, fontFamily: 'var(--font-titulo), sans-serif' },
      },
    },
  },
});

export default theme;
