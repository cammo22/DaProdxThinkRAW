// 04 — Carte speciali: quattro fogli da trascinare e sovrapporre; accanto, il tatto messo in numeri.
import { el, clamp, map, ease, S } from '../core.js';
import { audio } from '../audio.js';

const FOGLI = [
  { cls: 'f-carta', x: 8, y: 25, r: -4, t: 'Carta', s: 'grana a vista' },
  { cls: 'f-velina', x: 34, y: 34, r: 3, t: 'Velina', s: 'si vede attraverso' },
  { cls: 'f-kraft', x: 10, y: 58, r: 2.5, t: 'Kraft', s: 'ruvida, calda' },
  { cls: 'f-nera', x: 38, y: 60, r: -5, t: 'Nera', s: 'solo in negativo' },
];

const carteGioco = {
  crea(c) {
    c.innerHTML = `
      <div class="cg">
        <p class="kick cg-k">Processes</p>
        <div class="cg-banco">${FOGLI.map((f, i) => `<div class="cg-f ${f.cls}" data-i="${i}" data-cursore="Trascina"><span class="cg-g">${f.t.charAt(0)}</span><p><b>${f.t}</b><small>${f.s}</small></p></div>`).join('')}</div>
        <p class="cg-aiuto">Trascina i fogli. Sovrapponili. <em>Senti</em> la differenza.</p>
      </div>`;
    const fogli = [...c.querySelectorAll('.cg-f')];
    const st = FOGLI.map(f => ({ x: f.x, y: f.y, r: f.r, dentro: 0 }));
    let alto = 10, loc = 0;
    const applica = () => fogli.forEach((e, i) => {
      const s = st[i], v = s.dentro;
      e.style.transform = `translate(${s.x}cqw, ${(s.y + (1 - v) * 70).toFixed(2)}cqw) rotate(${(s.r + (1 - v) * 14 * (i % 2 ? 1 : -1)).toFixed(2)}deg)`;
      e.style.opacity = v.toFixed(2);
    });
    fogli.forEach((e, i) => {
      let sx, sy, ox, oy, k = 1, att = false;
      e.addEventListener('pointerdown', ev => {
        att = true; e.setPointerCapture(ev.pointerId); sx = ev.clientX; sy = ev.clientY; ox = st[i].x; oy = st[i].y;
        const pg = c.closest('.pg'); k = pg.getBoundingClientRect().width / pg.offsetWidth || 1;
        e.style.zIndex = ++alto; e.classList.add('presa'); audio.clic();
      });
      e.addEventListener('pointermove', ev => {
        if (!att) return;
        const pg = c.closest('.pg'), unit = pg.offsetWidth / 100;
        st[i].x = clamp(ox + (ev.clientX - sx) / k / unit, -6, 70);
        st[i].y = clamp(oy + (ev.clientY - sy) / k / unit, 12, 98);
        applica();
      });
      const fine = () => { if (att) { att = false; e.classList.remove('presa'); audio.tick(.8); } };
      e.addEventListener('pointerup', fine); e.addEventListener('pointercancel', fine);
    });
    return {
      update(l) {
        loc = l;
        st.forEach((s, i) => { s.dentro = ease.out(clamp(l * 3 - i * .4, 0, 1)); });
        applica();
      },
    };
  },
};

const MISURE = [['Grana', .82, 'alta'], ['Peso', .64, 'media'], ['Trasparenza', .3, 'a tratti'], ['Imperfezione', .96, 'voluta']];
const carteTesto = {
  crea(c) {
    c.innerHTML = `
      <div class="ct">
        <p class="kick ct-k">Processes</p>
        <h3 class="xl ct-t">Il tatto<br>prima<br>dell’occhio.</h3>
        <p class="ct-c">Prima di leggere una pagina la si tocca. Carte diverse per peso, grana e trasparenza fanno del libro un oggetto da tenere in mano, non da scorrere con il pollice.</p>
        <ul class="ct-m">${MISURE.map(([n, v, t]) => `<li><span>${n}</span><i><b style="--v:${v}"></b></i><em>${t}</em></li>`).join('')}</ul>
      </div>`;
    const t = c.querySelector('.ct-t'), cc = c.querySelector('.ct-c'), barre = [...c.querySelectorAll('.ct-m b')], voci = [...c.querySelectorAll('.ct-m li')];
    return {
      update(loc) {
        const a = ease.out(clamp(loc * 2.4)); t.style.opacity = a; t.style.transform = `translateY(${(1 - a) * 5}cqw)`;
        const b = ease.out(clamp(loc * 2.4 - .5)); cc.style.opacity = b; cc.style.transform = `translateY(${(1 - b) * 3}cqw)`;
        barre.forEach((e, i) => { const v = ease.out(clamp(loc * 2.2 - .9 - i * .15, 0, 1)); e.style.transform = `scaleX(${(v * parseFloat(e.style.getPropertyValue('--v'))).toFixed(3)})`; voci[i].style.opacity = clamp(v * 3); });
      },
    };
  },
};

export const CARTE = { carteGioco, carteTesto };
