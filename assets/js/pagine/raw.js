// 07 — RAW.: la parola con i bordi che si sporcano seguendo il mouse, e la chiusura.
import { el, clamp, map, ease, S, damp } from '../core.js';
import { audio } from '../audio.js';

const rawGrande = {
  crea(c) {
    c.innerHTML = `
      <div class="rg">
        <p class="kick rg-k">Results</p>
        <p class="rg-su">Il perfetto si compra.</p>
        <svg class="rg-svg" viewBox="0 0 100 100" aria-label="RAW.">
          <defs>
            <filter id="rg-f" x="-10%" y="-20%" width="120%" height="140%" color-interpolation-filters="sRGB">
              <feTurbulence id="rg-t" type="fractalNoise" baseFrequency="0.045 0.06" numOctaves="2" seed="4" result="n"/>
              <feDisplacementMap id="rg-d" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" result="d"/>
              <feGaussianBlur in="d" stdDeviation=".42" result="b"/>
              <feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 1 1 1 1"/></feComponentTransfer>
            </filter>
          </defs>
          <g filter="url(#rg-f)"><text id="rg-x" x="50" y="58" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="900" style="font-stretch:125%;letter-spacing:-.045em" font-size="27.5">RAW.</text></g>
        </svg>
        <p class="rg-giu">Il grezzo si fa.</p>
        <p class="rg-aiuto">Passaci sopra.</p>
      </div>`;
    const t = c.querySelector('#rg-t'), d = c.querySelector('#rg-d'), su = c.querySelector('.rg-su'), giu = c.querySelector('.rg-giu'), ai = c.querySelector('.rg-aiuto');
    const svg = c.querySelector('.rg-svg');
    let forza = 0, seme = 4, ultimoSeme = 0, loc = 0, ultimoScale = -1;
    return {
      update(l, s, hold = 0) {
        loc = l;
        const r = svg.getBoundingClientRect();
        let vicino = 0;
        if (r.width) {
          const dx = (S.mx * S.vw - (r.left + r.width / 2)) / r.width, dy = (S.my * S.vh - (r.top + r.height / 2)) / r.height;
          vicino = clamp(1 - Math.hypot(dx, dy * 1.3) * 1.6);
        }
        const target = Math.min(1, ease.inOut(clamp(hold * 1.2)) * .4 + vicino * .75);
        forza = damp(forza, target, 6, S.dt);
        const scale = Math.round(forza * 80) / 10;
        if (scale !== ultimoScale) { ultimoScale = scale; d.setAttribute('scale', scale.toFixed(1)); }
        // la grana "bolle": cambia seme a intervalli
        if (S.t - ultimoSeme > .14 && forza > .05) { ultimoSeme = S.t; seme = (seme % 97) + 1; t.setAttribute('seed', seme); }
        const a = ease.out(clamp(loc * 3)); su.style.opacity = a; su.style.transform = `translateY(${(1 - a) * 3}cqw)`;
        const b = ease.out(clamp(loc * 3 - 1.2)); giu.style.opacity = b; giu.style.transform = `translateY(${(1 - b) * 3}cqw)`;
        ai.style.opacity = clamp(loc * 3 - 2) * (1 - vicino);
      },
    };
  },
};

const rawChiusura = {
  crea(c, { ctx }) {
    c.innerHTML = `
      <div class="rc">
        <p class="kick rc-k">Results</p>
        <h3 class="xl rc-t"><span>Pensa</span><span>grezzo<i>.</i></span></h3>
        <p class="lead rc-l">Il libro finisce qui. Il processo no.</p>
        <p class="rc-c">Ideas, Processes, Results: tre modi di dire la stessa cosa. Un oggetto è bello quando si vede come è stato fatto, e anche quando qualcosa non è andato come previsto.</p>
        <div class="rc-az"><button class="btn btn-solid" data-k="0" data-cursore="Su">↑ Ricomincia</button><button class="btn" data-k="1" data-cursore="Vai">Indice</button></div>
      </div>`;
    const t = [...c.querySelectorAll('.rc-t span')], l = c.querySelector('.rc-l'), cc = c.querySelector('.rc-c'), az = c.querySelector('.rc-az');
    c.querySelector('[data-k="0"]').addEventListener('click', () => { audio.clic(); ctx.vaiAlla('cima'); });
    c.querySelector('[data-k="1"]').addEventListener('click', () => { audio.clic(); ctx.vaiAlla(0); });
    return {
      update(loc) {
        t.forEach((s, i) => { const v = ease.out(clamp(loc * 2.8 - i * .4, 0, 1)); s.style.opacity = v; s.style.transform = `translateY(${(1 - v) * 6}cqw)`; });
        const a = ease.out(clamp(loc * 2.6 - .9)); l.style.opacity = a; l.style.transform = `translateY(${(1 - a) * 3}cqw)`;
        const b = ease.out(clamp(loc * 2.6 - 1.3)); cc.style.opacity = b; cc.style.transform = `translateY(${(1 - b) * 3}cqw)`;
        const d = ease.out(clamp(loc * 2.6 - 1.7)); az.style.opacity = d; az.style.transform = `translateY(${(1 - d) * 3}cqw)`;
      },
    };
  },
};

export const RAW = { rawGrande, rawChiusura };
