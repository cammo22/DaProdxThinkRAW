// 05 — Prestampa: la pagina è un foglio di stampa con segni di taglio, registro e barre colore;
// quattro lastre (C M Y K) che il mouse porta fuori registro.
import { el, clamp, map, ease, lerp, S, damp } from '../core.js';

const prestampaFoglio = {
  crea(c) {
    const barre = [['#00aeef', 'C'], ['#ec008c', 'M'], ['#fff200', 'Y'], ['#111', 'K'], ['#ed1c24', ''], ['#00a651', ''], ['#2e3192', ''], ['#888', ''], ['#bbb', ''], ['#ddd', '']];
    c.innerHTML = `
      <div class="ps">
        <svg class="ps-segni" viewBox="0 0 100 133" fill="none" stroke="#111" stroke-width=".28">
          <g class="ps-crop">
            ${[[17, 27], [83, 27], [17, 109], [83, 109]].map(([x, y]) => `<path d="M${x < 50 ? x - 9 : x + 9} ${y}H${x < 50 ? x - 2.5 : x + 2.5}M${x} ${y < 60 ? y - 9 : y + 9}V${y < 60 ? y - 2.5 : y + 2.5}"/>`).join('')}
          </g>
          <g class="ps-reg">
            ${[[50, 15], [50, 121], [7, 68], [93, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/><path d="M${x - 4} ${y}H${x + 4}M${x} ${y - 4}V${y + 4}"/>`).join('')}
          </g>
          <path class="ps-fust" d="M19.5 29.5H80.5V106.5H19.5Z" stroke-dasharray="1.2 1" />
          <g class="ps-barre" stroke="none">${barre.map(([col], i) => `<rect x="${17 + i * 6.6}" y="115" width="6.6" height="4" fill="${col}"/>`).join('')}</g>
          <g stroke="none" fill="#111" font-family="JB Mono, monospace" font-size="1.9"><text x="17" y="11.8">THINK RAW. · C M Y K · 1:1</text><text x="83" y="11.8" text-anchor="end">prestampa a vista</text></g>
        </svg>
        <div class="ps-lastre" aria-hidden="true">
          <b class="pl pl-c">R</b><b class="pl pl-m">R</b><b class="pl pl-y">R</b><b class="pl pl-k">R</b>
        </div>
        <p class="ps-lettura mono">registro <b id="ps-d">Δ 0.00 mm</b></p>
        <p class="ps-aiuto" data-cursore="Sposta">Muovi il mouse: le lastre escono di registro.</p>
      </div>`;
    const pl = { c: c.querySelector('.pl-c'), m: c.querySelector('.pl-m'), y: c.querySelector('.pl-y') };
    const d = c.querySelector('#ps-d'), segni = c.querySelector('.ps-segni'), crop = c.querySelector('.ps-crop'), reg = c.querySelector('.ps-reg'), fust = c.querySelector('.ps-fust'), bar = c.querySelector('.ps-barre');
    const pg = c.closest('.pg') || c.parentElement;
    let ox = 0, oy = 0;
    return {
      update(loc, s) {
        const ing = ease.inOut(clamp(loc * 1.6));
        // segni che si disegnano
        [crop, reg, fust].forEach((g, i) => { g.style.opacity = clamp(loc * 4 - i * .5); });
        bar.style.opacity = clamp(loc * 4 - 1);
        // dove sta il mouse rispetto alla pagina
        const r = (c.parentElement || c).getBoundingClientRect();
        let px = 0, py = 0;
        if (r.width) { px = clamp((S.mx * S.vw - (r.left + r.width / 2)) / (r.width / 2), -1.2, 1.2); py = clamp((S.my * S.vh - (r.top + r.height / 2)) / (r.height / 2), -1.2, 1.2); }
        const tx = (1 - ing) * 6, ty = (1 - ing) * -3;       // entrano fuori registro e si allineano
        ox = damp(ox, px, 5, S.dt); oy = damp(oy, py, 5, S.dt);
        const k = 3.4;
        const P = (a, b) => `translate(${(a).toFixed(2)}cqw, ${(b).toFixed(2)}cqw)`;
        pl.c.style.transform = P(tx + ox * k * 1.0, ty + oy * k * .35);
        pl.m.style.transform = P(-tx - ox * k * .9, -ty * 2 + oy * k * .9);
        pl.y.style.transform = P(tx * .3 + ox * k * .3, -ty - oy * k * 1.1);
        const delta = Math.hypot(ox * k * 1.0 + tx, oy * k * .6 + ty) * 0.42;
        d.textContent = `Δ ${delta.toFixed(2)} mm`;
      },
    };
  },
};

const ICONE = {
  crop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 8h6M8 3v6M21 16h-6M16 21v-6"/></svg>',
  reg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="5"/><path d="M12 2v20M2 12h20"/></svg>',
  barre: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="9" width="4" height="6"/><rect x="7" y="9" width="4" height="6" opacity=".7"/><rect x="12" y="9" width="4" height="6" opacity=".45"/><rect x="17" y="9" width="4" height="6" opacity=".25"/></svg>',
  fust: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.4 2"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/></svg>',
};
const prestampaTesto = {
  crea(c) {
    c.innerHTML = `
      <div class="pt">
        <p class="kick pt-k">Processes</p>
        <h3 class="xl pt-t">Pre&shy;stampa.</h3>
        <p class="lead pt-l">Il dietro le quinte, messo in copertina.</p>
        <ul class="pt-lista">
          <li>${ICONE.crop}<div><strong>Segni di taglio</strong><span>dove si taglia</span></div></li>
          <li>${ICONE.reg}<div><strong>Registro</strong><span>dove le lastre si allineano</span></div></li>
          <li>${ICONE.barre}<div><strong>Barre colore</strong><span>quanto è fedele il colore</span></div></li>
          <li>${ICONE.fust}<div><strong>Fustella</strong><span>dove si apre la finestra</span></div></li>
        </ul>
      </div>`;
    const t = c.querySelector('.pt-t'), l = c.querySelector('.pt-l'), li = [...c.querySelectorAll('li')];
    return {
      update(loc) {
        const a = ease.out(clamp(loc * 2.4)); t.style.opacity = a; t.style.transform = `translateY(${(1 - a) * 5}cqw)`;
        const b = ease.out(clamp(loc * 2.4 - .4)); l.style.opacity = b; l.style.transform = `translateY(${(1 - b) * 3}cqw)`;
        li.forEach((e, i) => { const v = ease.out(clamp(loc * 2.6 - .9 - i * .25, 0, 1)); e.style.opacity = v; e.style.transform = `translateX(${(1 - v) * 4}cqw)`; });
      },
    };
  },
};

export const PRESTAMPA = { prestampaFoglio, prestampaTesto };
