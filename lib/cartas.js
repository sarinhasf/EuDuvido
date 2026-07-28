import fs from 'node:fs';
import path from 'node:path';

/**
 * O numero maximo de jogadores e definido pela quantidade de arquivos
 * em public/img/cartas. Para permitir mais jogadores, basta jogar
 * mais imagens nessa pasta - nada no codigo precisa mudar.
 *
 * Roda so no servidor (Server Component / Route Handler).
 */
const PASTA_CARTAS = path.join(process.cwd(), 'public', 'img', 'cartas');
const EXTENSOES = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);

/** Ordena carta2 antes de carta10 (ordenacao alfabetica pura erraria isso). */
function ordemNatural(a, b) {
  return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' });
}

export function listarCartas() {
  let arquivos = [];
  try {
    arquivos = fs.readdirSync(PASTA_CARTAS);
  } catch {
    return [];
  }

  return arquivos
    .filter((nome) => EXTENSOES.has(path.extname(nome).toLowerCase()))
    .sort(ordemNatural)
    .map((nome, indice) => {
      // Data de modificacao do arquivo, usada como chave de remontagem no React.
      // ATENCAO: nao da pra colocar isso na URL como "?v=123". O otimizador de
      // imagens do Next recusa query string em imagem local (erro 400,
      // "not configured in images.localPatterns") e a validacao exige que o
      // search bata exato - ou seja, nao ha como liberar um valor que muda.
      let versao = '0';
      try {
        versao = String(Math.floor(fs.statSync(path.join(PASTA_CARTAS, nome)).mtimeMs));
      } catch {
        /* sem stat, segue sem versao */
      }

      return {
        id: nome,
        src: `/img/cartas/${nome}`,
        versao,
        rotulo: `Carta ${indice + 1}`,
      };
    });
}
