import { listarCartas } from '../../lib/cartas';
import CadastroJogadores from './CadastroJogadores';

// Lida do disco a cada acesso: a pasta de cartas pode mudar sem rebuild.
export const dynamic = 'force-dynamic';

export default function PaginaJogadores() {
  // A quantidade maxima de jogadores vem da pasta de cartas (lido no servidor).
  return <CadastroJogadores cartas={listarCartas()} />;
}
