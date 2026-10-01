// 06 — Stampa 3D: a sinistra la rotella (si gira davvero), a destra l'inserto che si costruisce strato per strato.
// La rotella decide a che strato siamo; se nessuno la tocca, va avanti da sola.
import { el, clamp, map, ease, caso, S } from '../core.js';
import { audio } from '../audio.js';

const STRATI = 72;
const stato = { toccato: false, manuale: 0, l: 0, ascolta: new Set() };
const avvisa = () => stato.ascolta.forEach(f => f());

const rotella3d = {
  crea(c) {
    c.innerHTML = `
      <div class="rw">
        <p class="kick rw-k">Results</p>
        <h3 class="xl rw-t">Stampa<br>3D.</h3>
        <div class="rw-lcd"><span>strato</span><b id="rw-n">000</b><i>/ ${STRATI}</i></div>
        <div class="rw-ruota" data-cursore="Gira">
          <div class="rw-anello" id="rw-an"></div>
          <span class="rw-lab rw-menu">MENU</span>
          <svg class="rw-lab rw-prev" viewBox="0 0 24 14"><path d="M2 1v12M13 1 4 7l9 6zM22 1l-9 6 9 6z" fill="currentColor"/></svg>
          <svg class="rw-lab rw-next" viewBox="0 0 24 14"><path d="M22 1v12M11 1l9 6-9 6zM2 1l9 6-9 6z" fill="currentColor"/></svg>
          <svg class="rw-lab rw-play" viewBox="0 0 24 14"><path d="M1 1l10 6-10 6zM15 1h3v12h-3zM20 1h3v12h-3z" fill="currentColor"/></svg>
          <button class="rw-centro" aria-label="Ricomincia"></button>
        </div>
        <p class="rw-aiuto">Gira la rotella con il mouse. <em>Sei tu la stampante.</em></p>
      </div>`;
    const ruota = c.querySelector('.rw-ruota'), an = c.querySelector('#rw-an'), n = c.querySelector('#rw-n'), t = c.querySelector('.rw-t');
    let rot = 0, ang0 = 0, preso = false, resto = 0, loc = 0;
    const centro = () => { const r = ruota.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    const angolo = e => { const [cx, cy] = centro(); return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI; };
    ruota.addEventListener('pointerdown', e => {
      if (e.target.closest('.rw-centro')) return;
      preso = true; ruota.setPointerCapture(e.pointerId); ang0 = angolo(e);
      if (!stato.toccato) { stato.toccato = true; stato.manuale = stato.l; }
    });
    ruota.addEventListener('pointermove', e => {
      if (!preso) return;
      const a = angolo(e); let d = a - ang0; if (d > 180) d -= 360; if (d < -180) d += 360; ang0 = a;
      rot += d; resto += d;
      stato.manuale = clamp(stato.manuale + d / 900, 0, 1);
      while (Math.abs(resto) > 9) { resto -= Math.sign(resto) * 9; audio.tick(.9); }
      avvisa(); disegna();
    });
    const fine = () => { preso = false; };
    ruota.addEventListener('pointerup', fine); ruota.addEventListener('pointercancel', fine);
    c.querySelector('.rw-centro').addEventListener('click', () => { audio.clic(); stato.toccato = false; avvisa(); });
    function disegna() {
      an.style.transform = `rotate(${rot.toFixed(1)}deg)`;
      n.textContent = String(Math.round(stato.l * STRATI)).padStart(3, '0');
    }
    return {
      update(l, s, hold = 0) {
        loc = l;
        const a = ease.out(clamp(l * 2.4)); t.style.opacity = a; t.style.transform = `translateY(${(1 - a) * 5}cqw)`;
        if (!stato.toccato) {
          const nuovo = ease.inOut(clamp(hold * 1.1));
          if (Math.abs(nuovo - stato.l) > .001) { stato.l = nuovo; rot = nuovo * 900; avvisa(); }
        } else stato.l = stato.manuale;
        disegna();
      },
    };
  },
};

const strati3d = {
  crea(c) {
    const r = caso(11);
    // profilo dell'inserto, dal basso in alto: [larghezza, foro centrale]
    const prof = i => {
      const t = i / (STRATI - 1);
      if (t < .1) return [60, 0];
      if (t < .55) return [60 - (t - .1) * 9, 0];
      if (t < .66) return [56, 24];
      return [56 - (t - .66) * 14, 28 - (t - .66) * 8];
    };
    const alt = .86, y0 = 104;
    let rects = '';
    for (let i = 0; i < STRATI; i++) {
      const [w, foro] = prof(i), y = y0 - (i + 1) * alt, j = (r() - .5) * .9;
      const x = 50 - w / 2 + j;
      if (foro) {
        const fw = (w - foro) / 2;
        rects += `<g class="st-l" data-i="${i}"><rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${fw.toFixed(2)}" height="${alt - .06}"/><rect x="${(x + fw + foro).toFixed(2)}" y="${y.toFixed(2)}" width="${fw.toFixed(2)}" height="${alt - .06}"/></g>`;
      } else rects += `<g class="st-l" data-i="${i}"><rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${alt - .06}"/></g>`;
    }
    c.innerHTML = `
      <div class="s3">
        <p class="kick s3-k">Results</p>
        <svg class="s3-svg" viewBox="0 24 100 90">
          <path class="s3-piano" d="M12 104.6H88" stroke="#111" stroke-width=".4"/>
          <g class="s3-ticks" stroke="#111" stroke-width=".2">${Array.from({ length: 17 }, (_, i) => `<path d="M${12 + i * 4.75} 104.6v1.6"/>`).join('')}</g>
          <g class="s3-strati">${rects}</g>
          <g class="s3-ugello"><path d="M-2.6 0h5.2L1 5H-1Z" fill="#111"/><rect x="-3.6" y="-5" width="7.2" height="5" fill="#111"/><path d="M0 5v2.5" stroke="var(--accento)" stroke-width=".7"/></g>
        </svg>
        <div class="s3-dati mono"><p><span>strato</span><b id="s3-n">000</b></p><p><span>altezza</span><b id="s3-h">0.0 mm</b></p><p><span>stato</span><b id="s3-s">fermo</b></p></div>
        <p class="s3-c">Ogni strato è un’imperfezione che sta in piedi. Messi uno sopra l’altro, fanno una rotella.</p>
      </div>`;
    const ls = [...c.querySelectorAll('.st-l')], ug = c.querySelector('.s3-ugello'), n = c.querySelector('#s3-n'), h = c.querySelector('#s3-h'), s = c.querySelector('#s3-s'), cc = c.querySelector('.s3-c'), k = c.querySelector('.s3-k');
    let ultimo = -1, locA = 0;
    const lista = ls.map((g, i) => ({ g, i, rs: [...g.querySelectorAll('rect')], w: parseFloat(g.firstElementChild.getAttribute('width')) }));
    const disegna = () => {
      const q = stato.l * STRATI;
      const quanti = Math.floor(q);
      if (quanti !== ultimo) {
        ultimo = quanti;
        lista.forEach(({ g, rs }, i) => { g.style.opacity = i < quanti ? 1 : 0; if (i !== quanti) rs.forEach(r => { r.style.transform = ''; }); });
        n.textContent = String(quanti).padStart(3, '0'); h.textContent = (quanti * .2).toFixed(1) + ' mm';
        s.textContent = quanti >= STRATI ? 'finito' : quanti > 0 ? 'stampa' : 'fermo';
      }
      // l'ugello corre sullo strato in costruzione
      const i = Math.min(STRATI - 1, quanti), L = lista[i];
      const y = 104 - (i + 1) * .86;
      const t = S.t * 2.4;
      const cx = 50 + Math.sin(t) * ((L ? L.w : 40) / 2 - 2);
      ug.setAttribute('transform', `translate(${cx.toFixed(2)} ${(y - 7.5).toFixed(2)})`);
      ug.style.opacity = quanti >= STRATI ? 0 : 1;
      // il pezzo in costruzione cresce da un lato
      if (L && quanti < STRATI) { const f = q - quanti; L.g.style.opacity = 1; L.rs.forEach(r => { r.style.transformBox = 'fill-box'; r.style.transformOrigin = 'center'; r.style.transform = `scaleX(${f.toFixed(2)})`; }); }
    };
    stato.ascolta.add(disegna);
    return {
      update(loc) {
        locA = loc;
        const a = ease.out(clamp(loc * 3)); cc.style.opacity = a; k.style.opacity = a;
        disegna();
      },
    };
  },
};

export const STAMPA3D = { rotella3d, strati3d };
