// Il contenuto del libro. Per aggiungere o cambiare pagine si lavora qui e nella cartella pagine/.
// Ogni "spread" è una doppia pagina: sinistra (sx) e destra (dx), ciascuna è un tipo di pagina
// registrato in pagine/index.js.

import { el } from './core.js';
import { REG } from './pagine/index.js';

export const SPREAD = [
  { id: 'indice',    parte: '',          num: '',   titolo: 'Indice',              sx: 'indice',          dx: 'frontespizio' },
  { id: 'perfetto',  parte: 'Ideas',     num: '01', titolo: 'Perfetto',            sx: 'perfettoTesto',   dx: 'perfettoGriglia' },
  { id: 'massa',     parte: 'Ideas',     num: '02', titolo: 'Produzione di massa', sx: 'massaNastro',     dx: 'massaCitazione' },
  { id: 'smontare',  parte: 'Processes', num: '03', titolo: 'Smontare',            sx: 'smontaEsploso',   dx: 'smontaLegenda' },
  { id: 'carte',     parte: 'Processes', num: '04', titolo: 'Carte speciali',      sx: 'carteGioco',      dx: 'carteTesto' },
  { id: 'prestampa', parte: 'Processes', num: '05', titolo: 'Prestampa',           sx: 'prestampaFoglio', dx: 'prestampaTesto' },
  { id: 'stampa3d',  parte: 'Results',   num: '06', titolo: 'Stampa 3D',           sx: 'rotella3d',       dx: 'strati3d' },
  { id: 'raw',       parte: 'Results',   num: '07', titolo: 'RAW.',                sx: 'rawGrande',       dx: 'rawChiusura' },
  { id: 'colophon',  parte: '',          num: '',   titolo: 'Colophon',            sx: 'colophon',        dx: 'quartaCopertina' },
];

/** Costruisce una pagina: la sua "scatola" (carta, margini, numero) più il contenuto del tipo scelto. */
export function creaPagina(nome, sp, lato, ctx, k) {
  const def = REG[nome];
  if (!def) throw new Error('Pagina sconosciuta: ' + nome);
  const pg = el('div', `pg ${def.tema || 'carta'} ${lato}`);
  pg.dataset.pg = nome;
  const corpo = el('div', 'pg-corpo');
  pg.appendChild(corpo);
  const r = def.crea(corpo, { sp, lato, ctx, k, pg }) || {};
  if (!def.nuda) {
    const n = lato === 'sx' ? 2 * k + 1 : 2 * k + 2;
    const folio = String(n).padStart(2, '0');
    const testa = el('div', 'pg-testa', lato === 'sx' ? `<span>${sp.parte ? sp.parte + ' · ' + sp.num : 'THINK RAW.'}</span>` : `<span></span><span>${sp.titolo}</span>`);
    const piede = el('div', 'pg-piede', lato === 'sx' ? `<span>${folio}</span>` : `<span></span><span>${folio}</span>`);
    pg.append(testa, piede);
  }
  return { el: pg, update: r.update, nome };
}
