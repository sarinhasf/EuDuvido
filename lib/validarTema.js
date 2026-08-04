/**
 * Validacao e limpeza do que a IA devolve.
 *
 * Fica separado da rota HTTP de proposito: assim da pra testar a filtragem
 * com respostas simuladas, sem subir servidor nem gastar chamada de API
 * (ver tests/validarTema.test.js).
 */

import { limparItem, normalizar } from './matcher.js';
import { jaApareceu } from './similaridade.js';

export function extrairJson(texto) {
  if (!texto) return null;
  const limpo = String(texto)
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/, '')
    .trim();
  try {
    return JSON.parse(limpo);
  } catch {
    const inicio = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');
    if (inicio === -1 || fim <= inicio) return null;
    try {
      return JSON.parse(limpo.slice(inicio, fim + 1));
    } catch {
      return null;
    }
  }
}

/** Valida UM tema. Devolve { ok, tema, erro }. */
export function validarTema(bruto, temasUsados = []) {
  if (!bruto || typeof bruto !== 'object') return { ok: false, erro: 'nao e objeto' };

  let tema = typeof bruto.tema === 'string' ? bruto.tema.trim() : '';
  const lista = bruto.top10 ?? bruto.top_10 ?? bruto.itens;

  if (!tema) return { ok: false, erro: 'tema vazio' };
  if (!Array.isArray(lista)) return { ok: false, erro: 'top10 nao e array' };

  if (!/^top\s*10/i.test(tema)) tema = `Top 10 ${tema.replace(/^top\s*\d+\s*/i, '')}`.trim();

  const itens = lista
    .map((item) => {
      if (typeof item === 'string') return limparItem(item);
      if (item && typeof item === 'object') {
        return limparItem(item.nome ?? item.item ?? item.titulo ?? '');
      }
      return '';
    })
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (itens.length !== 10) return { ok: false, erro: `esperava 10 itens, veio ${itens.length}` };
  if (itens.some((i) => i.length > 60 || i.split(' ').length > 6)) {
    return { ok: false, erro: 'item longo demais' };
  }

  const vistos = new Set();
  for (const item of itens) {
    const chave = normalizar(item);
    if (!chave) return { ok: false, erro: 'item vazio apos limpeza' };
    if (vistos.has(chave)) return { ok: false, erro: `item repetido: ${item}` };
    vistos.add(chave);
  }

  // rejeita tanto o tema identico quanto o "parecido demais"
  if (jaApareceu(tema, temasUsados)) return { ok: false, erro: 'tema repetido ou parecido' };

  return { ok: true, tema: { tema, top10: itens } };
}

/** Valida o lote e devolve so os temas bons, ja sem repetidos entre si. */
export function validarLote(bruto, temasUsados = []) {
  const lista = Array.isArray(bruto?.temas) ? bruto.temas : Array.isArray(bruto) ? bruto : [bruto];
  const aprovados = [];
  const erros = [];

  for (const candidato of lista) {
    // compara com os usados E com os que ja entraram neste mesmo lote
    const referencia = [...temasUsados, ...aprovados.map((t) => t.tema)];
    const r = validarTema(candidato, referencia);
    if (r.ok) aprovados.push(r.tema);
    else erros.push(r.erro);
  }

  return { temas: aprovados, erros };
}
