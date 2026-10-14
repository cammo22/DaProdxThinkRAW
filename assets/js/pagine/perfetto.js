// 01 — Perfetto: a sinistra il testo, a destra una griglia di oggetti identici che si sgretola.
import { el, clamp, map, ease, caso } from '../core.js';
import { audio } from '../audio.js';

const perfettoTesto = {
  crea(c) {
    c.innerHTML = `
      <div class="pf">
        <span class="pf-num" aria-hidden="true">01</span>
        <p class="kick pf-k">Ideas</p>
        <h3 class="xl pf-t">Per&shy;fetto.</h3>
        <p class="lead pf-l">Lucido. Liscio. Identico a sé stesso.</p>
        <div class="pf-c">
          <p>Il perfetto è l’oggetto che non lascia tracce: nessuna grana, nessun segno, nessuna mano. Per piacere a tutti deve essere uguale per tutti.</p>
        </div>
        <p class="pf-q"><b>?</b> Cosa resta quando togli l’errore?</p>
      </div>`;
    const num = c.querySelector('.pf-num'), t = c.querySelector('.pf-t'), l = c.querySelector('.pf-l'), cc = c.querySelector('.pf-c'), q = c.querySelector('.pf-q');
    return {
      update(loc) {
        num.style.transform = `translateY(${(1 - ease.out(clamp(loc * 2))) * 8}cqw)`; num.style.opacity = clamp(loc * 3) * .9;
        const a = ease.out(clamp(loc * 2.4)); t.style.opacity = a; t.style.transform = `translateY(${(1 - a) * 6}cqw)`;
        const b = ease.out(clamp(loc * 2.4 - .3)); l.style.opacity = b; l.style.transform = `translateY(${(1 - b) * 3}cqw)`;
        const d = ease.out(clamp(loc * 2.4 - .6)); cc.style.opacity = d; cc.style.transform = `translateY(${(1 - d) * 3}cqw)`;
        const e = ease.out(clamp(loc * 2.4 - 1)); q.style.opacity = e; q.style.transform = `translateY(${(1 - e) * 3}cqw)`;
      },
    };
  },
};

const COL = 8, RIG = 5;
const perfettoGriglia = {
  crea(c) {
    const r = caso(42);
    c.innerHTML = `
      <div class="pg-g">
        <p class="kick pg-g-k">Quaranta oggetti</p>
        <div class="pg-g-grid">${Array.from({ length: COL * RIG }, () => '<div class="mi"><i class="mi-s"></i><i class="mi-r"></i></div>').join('')}</div>
        <div class="pg-g-pie"><p class="pg-g-n"><b id="idn">40</b><span>identici</span></p><p class="pg-g-d">Passa il mouse sopra uno: <em>si rompe</em>.</p></div>
      </div>`;
    const celle = [...c.querySelectorAll('.mi')];
    const dati = celle.map(() => ({ a: (r() - .5) * 20, x: (r() - .5) * 2, y: (r() - .5) * 2, s: .92 + r() * .16, t: r() * .7, hot: 0 }));
    const n = c.querySelector('#idn'), k = c.querySelector('.pg-g-k');
    let auto = 0, ultimo = -1;
    const disegna = () => {
      let identici = 0;
      celle.forEach((e, i) => {
        const d = dati[i];
        const ra = clamp((auto - d.t) / .3);
        const raw = Math.max(ra, d.hot);
        if (raw < .05) identici++;
        e.style.transform = raw > 0 ? `translate(${(d.x * raw).toFixed(2)}cqw, ${(d.y * raw).toFixed(2)}cqw) rotate(${(d.a * raw).toFixed(1)}deg) scale(${(1 + (d.s - 1) * raw).toFixed(3)})` : '';
        e.style.setProperty('--raw', raw.toFixed(2));
      });
      if (identici !== ultimo) { ultimo = identici; n.textContent = identici; }
    };
    celle.forEach((e, i) => {
      e.addEventListener('pointerenter', () => { if (dati[i].hot < 1) { dati[i].hot = 1; audio.tick(.8); disegna(); } });
    });
    return {
      update(loc, s, hold = 0) {
        const nuovo = ease.inOut(clamp(hold * 1.05));
        const ing = clamp(loc * 4);
        k.style.opacity = ing;
        celle.forEach((e, i) => { const v = clamp(ing * 2.2 - (i / celle.length) * 1.2, 0, 1); e.style.opacity = v; });
        if (Math.abs(nuovo - auto) > .002) { auto = nuovo; disegna(); } else if (ultimo === -1) disegna();
      },
    };
  },
};

export const PERFETTO = { perfettoTesto, perfettoGriglia };
