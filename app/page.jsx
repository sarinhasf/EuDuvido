import { listarCartas } from '../lib/cartas';
import TelaInicial from './TelaInicial';

// A lista de cartas vem de uma leitura da pasta public/img/cartas.
// Sem isto, o Next prerenderiza a pagina no build e congela a lista:
// adicionar ou trocar uma carta so apareceria depois de um novo build.
export const dynamic = 'force-dynamic';

export default function Home() {
  return <TelaInicial cartas={listarCartas()} />;
}
