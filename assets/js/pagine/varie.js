// Pagine "di servizio": indice, frontespizio, colophon, quarta di copertina.
import { el, clamp, map, ease } from '../core.js';
import { audio } from '../audio.js';

const ELENCO = [
  ['Ideas', [[1, '01', 'Perfetto'], [2, '02', 'Produzione di massa']]],
  ['Processes', [[3, '03', 'Smontare'], [4, '04', 'Carte speciali'], [5, '05', 'Prestampa']]],
  ['Results', [[6, '06', 'Stampa 3D'], [7, '07', 'RAW.']]],
];

const indice = {
  tema: 'nera',
  crea(c, { ctx }) {
    c.innerHTML = `<div class="ind"><p class="kick">Indice</p>${ELENCO.map(([parte, voci]) => `
      <div class="ind-g"><h3>${parte}</h3><ul>${voci.map(([k, n, t]) => `
        <li data-k="${k}" data-cursore="Vai"><b>${n}</b><span>${t}</span><i></i><em>${String(2 * k + 1).padStart(2, '0')}</em></li>`).join('')}</ul></div>`).join('')}
      <p class="ind-nota">Ideas, Processes, Results: dall’oggetto perfetto a quello fatto a mano, passando per quello che c’è dentro.</p></div>`;
    const righe = [...c.querySelectorAll('li')], gruppi = [...c.querySelectorAll('.ind-g')];
    righe.forEach(li => li.addEventListener('click', () => { audio.clic(); ctx.vaiAlla(+li.dataset.k); }));
    righe.forEach(li => li.addEventListener('pointerenter', () => audio.tick(.6)));
    return {
      update(loc) {
        const t = loc * (righe.length + 3);
        gruppi.forEach((g, i) => { const v = clamp(t - i * 2.2, 0, 1); g.firstElementChild.style.opacity = v; });
        righe.forEach((li, i) => { const v = ease.out(clamp(t - i * .8 - .4, 0, 1)); li.style.opacity = v; li.style.transform = `translateX(${(1 - v) * -3}cqw)`; });
      },
    };
  },
};

const frontespizio = {
  crea(c, { ctx }) {
    c.innerHTML = `
      <div class="fr">
        <h3 class="xl fr-t"><span>THINK</span><span>RAW<i>.</i></span></h3>
        <p class="lead fr-s">Graphic Design for a Simpler Tomorrow</p>
        <svg class="fr-disegno" viewBox="0 0 200 270" fill="none" stroke="currentColor" stroke-width=".9">
          <g class="fr-l">
            <rect x="30" y="20" width="140" height="230" rx="13" pathLength="1"/>
            <rect x="46" y="38" width="108" height="72" rx="5" pathLength="1"/>
            <circle cx="100" cy="177" r="48" pathLength="1"/>
            <circle cx="100" cy="177" r="19" pathLength="1"/>
            <path d="M12 20h12M12 250h12M18 20v230M30 262h140M30 256v12M170 256v12" pathLength="1"/>
            <path d="M182 38h12M182 110h12M188 38v72" pathLength="1"/>
          </g>
          <g class="fr-q" font-family="JB Mono, monospace" font-size="6.5" fill="currentColor" stroke="none"><text x="22" y="140" transform="rotate(-90 22 140)" text-anchor="middle">h 230</text><text x="100" y="270" text-anchor="middle">w 140</text><text x="198" y="78" transform="rotate(90 198 78)" text-anchor="middle">72</text></g>
        </svg>
        <div class="fr-piede"><p><b>Samuele Nappo</b><br><span class="mono">Graphic Design 2</span></p><div class="fr-timbro">Anteprima<small>testi in arrivo</small></div></div>
      </div>`;
    const linee = [...c.querySelectorAll('.fr-l > *')], q = c.querySelector('.fr-q'), t = c.querySelectorAll('.fr-t span');
    return {
      update(loc) {
        t.forEach((s, i) => { const v = ease.out(clamp(loc * 3 - i * .35, 0, 1)); s.style.transform = `translateY(${(1 - v) * 40}%)`; s.style.opacity = v; });
        linee.forEach((p, i) => { const v = clamp((loc - .1 - i * .06) * 3, 0, 1); p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1 - ease.inOut(v); });
        q.style.opacity = clamp((loc - .7) * 4, 0, 1);
      },
    };
  },
};

const colophon = {
  tema: 'nera',
  crea(c) {
    c.innerHTML = `<div class="col">
      <p class="kick">Colophon</p>
      <p class="col-g">Ideas<br>Processes<br>Results</p>
      <div class="col-t mono">
        <p><b>THINK RAW.</b><br>Graphic Design for a Simpler Tomorrow</p>
        <p>Libro-oggetto di Samuele Nappo.<br>Graphic Design 2.</p>
        <p>Carta speciale · piastra in acciaio · finestra in acrilico · inserti in stampa 3D · prestampa a vista.</p>
        <p>Sito a cura di DaProd.</p>
      </div></div>`;
    return {};
  },
};

const quartaCopertina = {
  tema: 'nera', nuda: true,
  crea(c, { ctx }) {
    c.innerHTML = `<div class="qua"><i class="qua-dot"></i><p class="kick">Fine dell’anteprima</p><button class="btn qua-b" data-cursore="Su">↑ Torna in cima</button></div>`;
    c.querySelector('button').addEventListener('click', () => { audio.clic(); ctx.vaiAlla('cima'); });
    return {};
  },
};

export const VARIE = { indice, frontespizio, colophon, quartaCopertina };
