import { Baloo_2, Nunito } from 'next/font/google';
import ThemeRegistry from '../lib/ThemeRegistry';
import { GameProvider } from '../lib/GameProvider';
import { AudioProvider } from '../lib/AudioProvider';
import './globals.css';

const titulo = Baloo_2({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-titulo',
  display: 'swap',
});

const corpo = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-corpo',
  display: 'swap',
});

export const metadata = {
  title: 'Eu Duvido',
  description:
    'Jogo de festa: acerte os itens do top 10 sorteado e duvide dos seus amigos antes que eles duvidem de você.',
};

export const viewport = {
  themeColor: '#22093D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${corpo.variable}`}>
      <body>
        <ThemeRegistry>
          <AudioProvider>
            <GameProvider>{children}</GameProvider>
          </AudioProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
