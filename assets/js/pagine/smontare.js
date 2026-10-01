// 03 — Smontare: la vista esplosa dell'oggetto e la legenda che la accende.
import { el, clamp, map, ease } from '../core.js';
import { audio } from '../audio.js';

const PEZZI = [
  ['Pagine', 'Il blocco: carta dopo carta, la parte che si sfoglia.'],
  ['Copertina', 'Carta speciale, grana a vista, un solo nero.'],
  ['Piastra', 'Acciaio e due bulloni: il dorso è già un oggetto.'],
  ['Rotella', 'L’inserto stampato in 3D. Si tocca, non si legge.'],
  ['Acrilico', 'Una finestra su uno schermo che non si accende.'],
];

// stato condiviso fra le due pagine dello spread
const stato = { sel: -1, manuale: false, ascolta: new Set() };
const scegli = (i, manuale = true) => { if (stato.sel === i) return; stato.sel = i; if (manuale) stato.manuale = true; stato.ascolta.forEach(f => f()); };

const smontaEsploso = {
  crea(c) {
    c.innerHTML = `
      <div class="se">
        <p class="kick se-k">Processes</p>
        <h3 class="xl se-t">Smon&shy;tare.</h3>
        <div class="se-scena">
          <div class="se-pila">
            <div class="se-l se-0"><span class="se-blocco"></span></div>
            <div class="se-l se-1"><b>THINK<br>RAW.</b></div>
            <div class="se-l se-2"><i></i><i></i></div>
            <div class="se-l se-3"><span></span></div>
            <div class="se-l se-4"><span></span></div>
            ${PEZZI.map((_, i) => `<em class="se-n se-n${i}">${i + 1}</em>`).join('')}
          </div>
        </div>
        <p class="se-nota">Sposta il mouse sulla legenda →</p>
      </div>`;
    const pila = c.querySelector('.se-pila'), layers = [...c.querySelectorAll('.se-l')], nums = [...c.querySelectorAll('.se-n')], t = c.querySelector('.se-t');
    let gap = 0;
    const evidenzia = () => { layers.forEach((l, i) => l.classList.toggle('hl', i === stato.sel)); nums.forEach((n, i) => n.classList.toggle('hl', i === stato.sel)); };
    stato.ascolta.add(evidenzia);
    return {
      update(loc, s, hold = 0) {
        const a = ease.out(clamp(loc * 2)); t.style.opacity = a; t.style.transform = `translateY(${(1 - a) * 5}cqw)`;
        gap = ease.inOut(clamp(hold * 1.15)) * ease.out(clamp(loc * 1.5));
        pila.style.transform = `rotateX(58deg) rotateZ(${-40 + (loc * .5 + hold * .5) * 14}deg)`;
        layers.forEach((l, i) => { const z = i * 8.5 * gap + (i === stato.sel ? 3 * gap : 0); l.style.transform = `translateZ(${z.toFixed(2)}cqw)`; });
        nums.forEach((n, i) => { const z = i * 8.5 * gap + 2; n.style.transform = `translateZ(${z.toFixed(2)}cqw) rotateZ(${40 - (loc * .5 + hold * .5) * 14}deg) rotateX(-58deg)`; n.style.opacity = clamp(gap * 3 - .5); });
        // finché nessuno ha toccato la legenda, si accendono da soli
        if (!stato.manuale) { const i = hold > .35 ? Math.min(4, Math.floor((hold - .35) / .65 * 5)) : -1; scegli(i, false); }
      },
    };
  },
};

const smontaLegenda = {
  crea(c) {
    c.innerHTML = `
      <div class="sl">
        <p class="kick sl-k">Processes</p>
        <p class="lead sl-l">Per capire un oggetto bisogna aprirlo. Cinque strati, nessuno nascosto.</p>
        <ol class="sl-lista">${PEZZI.map(([n, d], i) => `<li data-i="${i}" data-cursore="Guarda" tabindex="0"><b>${String(i + 1).padStart(2, '0')}</b><div><strong>${n}</strong><span>${d}</span></div></li>`).join('')}</ol>
      </div>`;
    const li = [...c.querySelectorAll('li')], l = c.querySelector('.sl-l');
    const evidenzia = () => li.forEach((e, i) => e.classList.toggle('hl', i === stato.sel));
    stato.ascolta.add(evidenzia);
    li.forEach((e, i) => {
      e.addEventListener('pointerenter', () => { scegli(i); audio.tick(.7); });
      e.addEventListener('focus', () => scegli(i));
      e.addEventListener('click', () => { scegli(i); audio.clic(); });
    });
    return {
      update(loc) {
        const a = ease.out(clamp(loc * 3)); l.style.opacity = a; l.style.transform = `translateY(${(1 - a) * 3}cqw)`;
        li.forEach((e, i) => { const v = ease.out(clamp(loc * 3.2 - .5 - i * .25, 0, 1)); e.style.opacity = v; e.style.transform = `translateX(${(1 - v) * 4}cqw)`; });
      },
    };
  },
};

export const SMONTARE = { smontaEsploso, smontaLegenda };
