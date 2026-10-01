// 02 — Produzione di massa: un nastro di oggetti identici (uno è diverso) e una frase che non fa sconti.
import { el, clamp, map, ease } from '../core.js';
import { audio } from '../audio.js';

const massaNastro = {
  crea(c) {
    const riga = (i, strano) => {
      const celle = Array.from({ length: 16 }, (_, k) => (strano && k === 9) ? '<div class="mi mi-strano" data-cursore="Trovato?"><i class="mi-s"></i><i class="mi-r"></i></div>' : '<div class="mi"><i class="mi-s"></i><i class="mi-r"></i></div>').join('');
      return `<div class="ms-riga"><div class="ms-pista">${celle}${celle}</div></div>`;
    };
    c.innerHTML = `
      <div class="ms">
        <p class="kick ms-k">Ideas</p>
        <h3 class="xl ms-t">Produ&shy;zione<br>di massa.</h3>
        <div class="ms-nastro">${riga(0)}${riga(1)}${riga(2, true)}${riga(3)}</div>
        <div class="ms-pie">
          <p class="ms-cont"><b id="ms-n">000.000.001</b><span>unità identiche</span></p>
          <p class="ms-gioco" id="ms-g">Una è diversa. Trovala.</p>
        </div>
      </div>`;
    const piste = [...c.querySelectorAll('.ms-pista')];
    const n = c.querySelector('#ms-n'), g = c.querySelector('#ms-g'), t = c.querySelector('.ms-t'), nastro = c.querySelector('.ms-nastro');
    let trovato = false;
    c.querySelector('.mi-strano').addEventListener('click', () => { trovato = true; audio.clic(); g.innerHTML = 'Trovata. <em>Era sempre stata RAW.</em>'; c.classList.add('trovato'); });
    return {
      update(loc, s, hold = 0) {
        const a = ease.out(clamp(loc * 2)); t.style.opacity = a; t.style.transform = `translateY(${(1 - a) * 5}cqw)`;
        nastro.style.opacity = clamp(loc * 3);
        piste.forEach((p, i) => {
          // metà della pista è un periodo: scorre col tempo e con lo scroll
          const dir = i % 2 ? 1 : -1;
          const v = ((s.t * (2.4 + i * .7) + (loc + hold) * (30 + i * 11)) % 50 + 50) % 50;
          p.style.transform = `translateX(${dir < 0 ? -v : v - 50}%)`;
        });
        const val = Math.floor(Math.pow(10, 1 + (loc * .6 + hold * .4) * 7.9 + (s.t % 1000) * 0));
        n.textContent = String(val).padStart(9, '0').replace(/(\d{3})(?=\d)/g, '$1.');
      },
    };
  },
};

const massaCitazione = {
  crea(c) {
    const parole = 'Se tutto è uguale, niente è tuo.'.split(' ');
    c.innerHTML = `
      <div class="mc">
        <p class="kick mc-k">Ideas</p>
        <blockquote class="mc-q xl">${parole.map(w => `<span class="mc-w"><i>${w}</i></span>`).join(' ')}</blockquote>
        <div class="mc-c"><p>La produzione di massa promette una cosa sola: che l’esemplare numero un milione sia identico al primo.</p><p>È la sua forza. E il suo limite.</p></div>
      </div>`;
    const w = [...c.querySelectorAll('.mc-w i')], cc = c.querySelector('.mc-c');
    return {
      update(loc) {
        w.forEach((e, i) => { const v = ease.out(clamp(loc * 3 - i * .3, 0, 1)); e.style.transform = `translateY(${(1 - v) * 110}%)`; });
        const d = ease.out(clamp(loc * 3 - 1.6)); cc.style.opacity = d; cc.style.transform = `translateY(${(1 - d) * 3}cqw)`;
      },
    };
  },
};

export const MASSA = { massaNastro, massaCitazione };
