// THINK RAW. — il sito. Qui si accende tutto, nell'ordine giusto.
import { $, S, avvia, misuraTutto } from './core.js';
import { audio, sceltaRicordata } from './audio.js';
import { iniziaCursore } from './cursore.js';
import { accensione } from './boot.js';
import { iniziaHero } from './hero.js';
import { iniziaManifesto } from './manifesto.js';
import { iniziaLibro } from './libro.js';
import { iniziaFinale } from './finale.js';
import { iniziaNav } from './nav.js';

history.scrollRestoration = 'manual';
const subito = /[?&](subito|fermo)/.test(location.search);

let nav = null;
const vaiAlla = d => nav && nav.vaiAlla(d);

const hero = iniziaHero();
const libro = iniziaLibro({ vaiAlla });
const manifesto = iniziaManifesto({ vaiAlla });
iniziaFinale();
nav = iniziaNav({ hero: hero.sezione, manifesto: manifesto.sezione, libro });
iniziaCursore();

misuraTutto();
avvia();
scrollTo(0, 0);

// debug per le prove
window.__tr = { S, libro, nav, audio };

if (subito) {
  document.body.classList.remove('is-booting');
  $('#boot').classList.add('via');
} else {
  accensione().then(() => { document.body.classList.add('acceso'); });
}
