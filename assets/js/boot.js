// L'accensione: un finto avvio da iPod, e il gesto che sblocca il suono.
import { $, S } from './core.js';
import { audio, ricordaScelta, sceltaRicordata } from './audio.js';

const RIGHE = [
  ['THINK RAW. OS 0.1', 0],
  ['', 0],
  ['carico carta ............', 'ok'],
  ['carico acciaio ..........', 'ok'],
  ['carico acrilico .........', 'ok'],
  ['carico stampa 3D ........', 'ok'],
  ['cerco la perfezione .....', 'non trovata'],
  ['', 0],
  ['avvio RAW', 0],
];

export function accensione() {
  return new Promise(risolvi => {
    const boot = $('#boot'), log = $('#boot-log'), fill = $('#boot-fill');
    const si = $('#boot-si'), no = $('#boot-no');
    const rapido = S.riduci || /[?&]rapido/.test(location.search);
    const ricordata = sceltaRicordata();
    if (ricordata === '0') { no.classList.add('btn-solid'); si.classList.remove('btn-solid'); }

    let i = 0, testo = '';
    const passo = () => {
      if (i >= RIGHE.length) { fill.style.transform = 'scaleX(1)'; si.disabled = no.disabled = false; (ricordata === '0' ? no : si).focus({ preventScroll: true }); return; }
      const [t, esito] = RIGHE[i++];
      testo += t + (esito ? ' ' + esito : '') + '\n';
      log.textContent = testo;
      fill.style.transform = `scaleX(${(i / RIGHE.length).toFixed(3)})`;
      setTimeout(passo, rapido ? 10 : (t ? 190 : 90));
    };
    setTimeout(passo, rapido ? 0 : 350);

    const entra = async suono => {
      si.disabled = no.disabled = true;
      ricordaScelta(suono);
      if (suono) { await audio.accendi(); audio.accensione(); document.dispatchEvent(new CustomEvent('tr:suono', { detail: true })); }
      boot.classList.add('esce');
      document.body.classList.remove('is-booting');
      setTimeout(() => { boot.classList.add('via'); risolvi(); }, 1250);
    };
    si.addEventListener('click', () => entra(true));
    no.addEventListener('click', () => entra(false));
  });
}
