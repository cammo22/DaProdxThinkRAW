// Dentro lo schermo: il menu a tre voci, il manifesto che si accende parola per parola,
// e infine lo schermo che si spegne come un vecchio televisore.

import { $, $$, S, clamp, map, ease, sezione } from './core.js';
import { audio } from './audio.js';

export function iniziaManifesto({ vaiAlla }) {
  const sec = $('#manifesto');
  const schermo = $('#lcd-schermo');
  const menu = $('#lcd-menu');
  const voci = $$('li', menu);
  const testo = $('#lcd-testo');
  const fill = $('#scrub-fill'), ta = $('#scrub-a'), tb = $('#scrub-b');
  const titolo = $('#lcd-titolo');
  const linea = $('#lcd-linea-spenta');
  const hint = $('.lcd-hint', menu);

  // il testo diventa una fila di parole, ognuna con la sua luce
  const nodi = [...testo.childNodes];
  testo.textContent = '';
  const parole = [];
  for (const n of nodi) {
    if (n.nodeType === 3) {
      n.textContent.split(/(\s+)/).forEach(t => {
        if (!t) return;
        if (/\S/.test(t)) { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; testo.appendChild(s); parole.push(s); }
        else testo.appendChild(document.createTextNode(t));
      });
    } else {
      n.classList.add('w');
      if (n.classList.contains('sw')) n.innerHTML = '<b>grezzo.</b><b aria-hidden="true">RAW.</b>';
      testo.appendChild(n); parole.push(n);
    }
  }
  const x = $('.x', testo), sw = $('.sw', testo);
  let luci = parole.map(() => -1);
  let selPrima = -1;

  voci.forEach((v, i) => v.addEventListener('click', () => { audio.clic(); vaiAlla(+v.dataset.sp); }));

  const durata = 194; // secondi finti, come un brano

  function aggiorna(p) {
    // — menu —
    const sel = Math.min(2, Math.floor(map(p, .07, .29) * 3.0));
    if (sel !== selPrima) { voci.forEach((v, i) => v.classList.toggle('sel', i === sel)); if (selPrima !== -1 || p > .08) audio.tick(); selPrima = sel; }
    const m_in = map(p, .01, .07);
    const m_out = map(p, .3, .37);
    menu.style.opacity = (m_in * (1 - m_out)).toFixed(3);
    menu.style.transform = `translate(-50%, calc(-50% + ${((1 - m_in) * 30 - m_out * 40).toFixed(1)}px))`;
    menu.style.pointerEvents = m_out > .5 ? 'none' : '';
    hint.style.opacity = (1 - map(p, .2, .3)).toFixed(2);

    // — testo —
    const t_in = map(p, .33, .4);
    testo.style.opacity = t_in.toFixed(3);
    testo.style.transform = `translate(-50%, calc(-50% + ${((1 - t_in) * 40).toFixed(1)}px))`;
    const tp = map(p, .38, .8);
    const N = parole.length;
    const pos = tp * (N + 1);
    parole.forEach((w, i) => {
      const l = Math.round(clamp(pos - i, 0, 1) * 20) / 20;
      if (l !== luci[i]) { luci[i] = l; w.style.opacity = (.13 + .87 * l).toFixed(3); }
    });
    x.classList.toggle('sbarra', pos > parole.indexOf(x) + 9);
    sw.classList.toggle('raw', tp > .985);

    // — barra del tempo —
    const q = clamp(map(p, .33, .86));
    const sec_ = Math.round(q * durata);
    fill.style.transform = `scaleX(${q.toFixed(4)})`;
    ta.textContent = `${Math.floor(sec_ / 60)}:${String(sec_ % 60).padStart(2, '0')}`;
    const rest = durata - sec_;
    tb.textContent = `-${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}`;
    titolo.textContent = p > .33 ? '▶ In riproduzione' : 'THINK RAW.';

    // — si spegne —
    const a = ease.in(map(p, .905, .955));
    const b = ease.in(map(p, .955, .985));
    const sy = 1 - .993 * a, sx = 1 - b;
    schermo.style.transform = a > 0 ? `scale(${Math.max(0, sx).toFixed(4)}, ${sy.toFixed(4)})` : '';
    schermo.style.filter = a > 0 ? `brightness(${(1 + .6 * a).toFixed(2)})` : '';
    linea.style.opacity = (a > 0 ? Math.min(1, a * 1.5) * (1 - ease.in(map(p, .975, .99))) : 0).toFixed(3);
    linea.style.transform = `scaleX(${Math.max(.0001, 1 - b * .98).toFixed(4)})`;
    if (p > .955 && !aggiorna.spento) { aggiorna.spento = true; audio.colpo(); }
    if (p < .94) aggiorna.spento = false;
  }
  const sez = sezione(sec, aggiorna);
  return { sezione: sez };
}
