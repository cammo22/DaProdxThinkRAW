// Il libro sul tavolo: costruisce la scena (legno, penna, tazza, libri, pianta) e la telecamera
// che scende, si raddrizza e infine entra dentro lo schermo d'acrilico.

import { $, $$, S, el, clamp, lerp, kf, map, ease, caso, sezione } from './core.js';
import { clonaCopertina } from './copertina.js';

const P = 2700; // prospettiva (deve stare uguale in hero.css)

export function iniziaHero() {
  const sec = $('#hero');
  const stage = $('.stage', sec);
  const camera = $('.camera', sec);
  const desk = $('#desk');
  const book = $('#book');
  const front = $('#book-front');
  const foglie = $('#foglie');
  const sole = $('.luce-sole', sec);
  const lcdIn = $('#lcd-ingresso');
  const scorri = $('#scorri');
  const didascalia = $('.hero-didascalia', sec);
  const linee = $('#call-linee');
  const calls = $$('.call', sec);

  front.appendChild(clonaCopertina());
  const cover = $('.cover', front);
  const finestra = $('.c-window', front);

  costruisciPianta(foglie);
  const oggetti = costruisciOggetti(desk);

  // linee delle didascalie
  const NS = 'http://www.w3.org/2000/svg';
  const tracce = calls.map(() => {
    const path = document.createElementNS(NS, 'path'); path.setAttribute('pathLength', '1');
    const pt = document.createElementNS(NS, 'circle'); pt.setAttribute('r', '3.5');
    linee.append(path, pt); return { path, pt };
  });

  let m = { bw: 500, bh: 667, lx: 0, ly: 0, lw: 160, s2: 1, s3: 8 };

  function misura() {
    const vw = S.vw, vh = S.vh;
    const bw = S.singola ? Math.min(vw * .7, vh * .52) : Math.min(vw * .46, vh * .72);
    const bh = bw * 4 / 3;
    book.style.setProperty('--bw', bw + 'px');
    desk.style.setProperty('--bw', bw + 'px');
    oggetti.disponi(bw);
    // il centro dello schermo d'acrilico, rispetto al centro del libro
    const lx = finestra.offsetLeft + finestra.offsetWidth / 2 - bw / 2;
    const ly = finestra.offsetTop + finestra.offsetHeight / 2 - bh / 2;
    const lw = finestra.offsetWidth, lh = finestra.offsetHeight;
    const bt = bw * .07;
    // scala per cui lo schermo copre tutta la finestra (con la prospettiva che ingrandisce un po' lo strato più alto)
    const voglio = Math.max(vw / lw, vh / lh) * 1.12;
    let s3 = voglio;
    for (let i = 0; i < 8; i++) s3 = voglio / (P / Math.max(200, P - s3 * (bt + 1)));
    const s2 = clamp((vh * (S.singola ? .8 : .9)) / bh, .5, 3);
    m = { bw, bh, lx, ly, lw, lh, s2, s3 };
  }

  let pronto = false;
  function aggiorna(p) {
    if (!pronto) { misura(); pronto = true; }
    const { bw, s2, s3, lx, ly } = m;

    // fasi: 0–.30 tavolo inclinato · .30–.55 si raddrizza · .55–.86 entra nello schermo
    const rx = kf(p, [[0, 54], [.26, 44], [.34, 30], [.56, 0]]);
    const rz = kf(p, [[0, -23], [.26, -14], [.34, -6], [.56, 0]]);
    const escala = kf(p, [[0, S.singola ? 1.0 : 1.02], [.26, 1.14], [.56, s2]]);
    const entra = ease.inOut(map(p, .56, .86));
    const s = entra > 0 ? s2 * Math.pow(s3 / s2, entra) : escala;

    // un po' di mouse, che sfuma quando si entra nello schermo
    const tilt = 1 - map(p, .3, .6);
    const mx = (S.sx - .5), my = (S.sy - .5);
    const rxm = rx - my * 7 * tilt, rzm = rz + mx * 9 * tilt;

    const tx = -s * lx * entra + mx * -16 * tilt;
    const ty = -s * ly * entra + (S.singola ? -S.vh * .03 : S.vh * .015) * (1 - entra) + my * -10 * tilt;
    camera.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
    desk.style.transform = `rotateX(${rxm.toFixed(3)}deg) rotateZ(${rzm.toFixed(3)}deg)`;

    stage.classList.toggle('dentro', entra > .02);
    // da vicino il legno non si vede più: si risparmia
    const lontano = s < 2.4;
    if (oggetti.visibili !== lontano) { oggetti.mostra(lontano); }

    // riflesso dell'acrilico che segue il mouse
    cover.style.setProperty('--gx', ((S.sx - .5) * 46).toFixed(1) + '%');

    // luce e pianta si dissolvono mentre ci si avvicina
    const luce = 1 - map(p, .22, .5);
    foglie.style.opacity = luce.toFixed(3);
    foglie.style.translate = `${(-mx * 18 - (1 - luce) * 120).toFixed(1)}px ${(-my * 12 - (1 - luce) * 80).toFixed(1)}px`;
    sole.style.opacity = (.55 * (1 - map(p, .3, .6))).toFixed(3);

    scorri.style.opacity = (1 - map(p, 0, .05)).toFixed(3);
    didascalia.style.opacity = (1 - map(p, .04, .16)).toFixed(3);

    lcdIn.style.opacity = map(p, .8, .9).toFixed(3);
    lcdIn.querySelector('.c-dot').style.opacity = (1 - map(p, .9, .98)).toFixed(3);

    callouts(p);
  }

  function callouts(p) {
    const br = book.getBoundingClientRect();
    calls.forEach((c, i) => {
      const t0 = .035 + i * .05;
      const on = map(p, t0, t0 + .09) * (1 - map(p, .36, .44));
      const tr = tracce[i];
      if (on <= 0.001 || S.singola) { c.style.opacity = 0; tr.path.style.opacity = 0; tr.pt.style.opacity = 0; return; }
      const ancora = $(c.dataset.ancora, front);
      const r = ancora.getBoundingClientRect();
      const [fx, fy] = (c.dataset.pt || '.5,.5').split(',').map(Number);
      const ax = r.left + r.width * fx, ay = r.top + r.height * fy;
      const lato = i < 2 ? -1 : 1;
      const cw = c.offsetWidth, ch = c.offsetHeight;
      const margine = 38;
      let gx = lato < 0 ? Math.min(br.left - margine, ax - 90) : Math.max(br.right + margine, ax + 90);
      gx = lato < 0 ? Math.max(gx, cw + 26) : Math.min(gx, S.vw - cw - 26);
      const gy = ay + (i === 0 ? -S.vh * .06 : i === 1 ? S.vh * .06 : i === 2 ? -S.vh * .09 : S.vh * .05);
      const x = lato < 0 ? gx - cw : gx;
      c.classList.toggle('sx', lato < 0);
      c.style.opacity = on.toFixed(3);
      c.style.transform = `translate(${x.toFixed(1)}px, ${(gy - ch / 2).toFixed(1)}px)`;
      const mxp = lato < 0 ? gx + 10 : gx - 10;
      tr.path.setAttribute('d', `M${ax.toFixed(1)},${ay.toFixed(1)} L${(ax + (mxp - ax) * .35).toFixed(1)},${gy.toFixed(1)} L${mxp.toFixed(1)},${gy.toFixed(1)}`);
      tr.path.style.strokeDasharray = '1'; tr.path.style.strokeDashoffset = (1 - on).toFixed(3); tr.path.style.opacity = 1;
      tr.pt.setAttribute('cx', ax.toFixed(1)); tr.pt.setAttribute('cy', ay.toFixed(1)); tr.pt.style.opacity = on.toFixed(3);
    });
  }

  addEventListener('resize', () => { pronto = false; });
  document.fonts && document.fonts.ready.then(() => { pronto = false; });
  const sez = sezione(sec, aggiorna);
  return { sezione: sez, misura: () => { pronto = false; } };
}

/* ───────── pianta in alto a sinistra (pothos) ───────── */
function costruisciPianta(svg) {
  const NS = 'http://www.w3.org/2000/svg';
  const r = caso(7);
  const foglia = 'M0 0C-10-6-34-22-30-56C-26-88-6-104 0-122C6-104 26-88 30-56C34-22 10-6 0 0Z';
  svg.innerHTML = `
    <defs>
      <clipPath id="clip-foglia"><path d="${foglia}"/></clipPath>
      <linearGradient id="verde" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2c5a24"/><stop offset=".55" stop-color="#4d8a37"/><stop offset="1" stop-color="#6aa347"/></linearGradient>
      <radialGradient id="vaso" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f1ece0"/><stop offset=".7" stop-color="#d7cfbd"/><stop offset="1" stop-color="#b9b09b"/></radialGradient>
      <filter id="sfoca" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
      <filter id="sfoca2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
    </defs>
    <g class="ombra" id="pi-ombra" filter="url(#sfoca)"></g>
    <g id="pi-corpo"></g>`;
  const corpo = svg.querySelector('#pi-corpo'), ombra = svg.querySelector('#pi-ombra');
  const add = (parent, tag, attrs, html) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (html) e.innerHTML = html; parent.appendChild(e); return e; };

  const cx = -6, cy = -18;
  // vaso
  add(ombra, 'circle', { cx: cx + 60, cy: cy + 80, r: 132, fill: '#000', opacity: .75 });
  add(corpo, 'circle', { cx, cy, r: 128, fill: 'url(#vaso)' });
  for (let i = 0; i < 260; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 126; add(corpo, 'circle', { cx: cx + Math.cos(a) * d, cy: cy + Math.sin(a) * d, r: .6 + r() * 1.4, fill: r() > .5 ? '#8f8573' : '#fff', opacity: .55 }); }
  add(corpo, 'circle', { cx, cy, r: 96, fill: '#241b12' });
  add(corpo, 'circle', { cx, cy, r: 96, fill: 'none', stroke: 'rgba(0,0,0,.35)', 'stroke-width': 6 });
  for (let i = 0; i < 90; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 90; add(corpo, 'circle', { cx: cx + Math.cos(a) * d, cy: cy + Math.sin(a) * d, r: 1 + r() * 2.4, fill: r() > .5 ? '#3a2c1c' : '#16100a', opacity: .8 }); }

  // foglie che escono dal vaso verso il basso e verso destra
  const n = 15;
  for (let i = 0; i < n; i++) {
    const ang = 8 + (i / (n - 1)) * 118 + (r() - .5) * 14;      // 0° = verso il basso (+y), cresce verso destra… poi ruotiamo
    const lung = .72 + r() * .7;
    const dist = 30 + r() * 105;
    const rad = (ang - 90) * Math.PI / 180;
    const bx = cx + Math.cos(rad) * 18, by = cy + Math.sin(rad) * 18;
    const ex = cx + Math.cos(rad) * dist + (r() - .5) * 12, ey = cy + Math.sin(rad) * dist + (r() - .5) * 12;
    const gruppo = (parent, ombrato) => {
      const g = add(parent, 'g', {});
      if (!ombrato) add(g, 'path', { d: `M${bx.toFixed(1)} ${by.toFixed(1)} Q${((bx + ex) / 2 + 10).toFixed(1)} ${((by + ey) / 2 - 6).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, fill: 'none', stroke: '#3d6e2c', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
      const f = add(g, 'g', { transform: `translate(${ex.toFixed(1)} ${ey.toFixed(1)}) rotate(${(ang + (r() - .5) * 20 + 90).toFixed(1)}) scale(${lung.toFixed(2)})` });
      if (ombrato) { add(f, 'path', { d: foglia, fill: '#000' }); return; }
      add(f, 'path', { d: foglia, fill: 'url(#verde)' });
      const clip = add(f, 'g', { 'clip-path': 'url(#clip-foglia)' });
      for (let k = 0; k < 5; k++) add(clip, 'ellipse', { cx: (r() - .5) * 40, cy: -20 - r() * 90, rx: 4 + r() * 14, ry: 3 + r() * 9, fill: r() > .45 ? '#efe9c0' : '#d3d985', opacity: .55 + r() * .4, transform: `rotate(${(r() * 80 - 40).toFixed(0)})` });
      add(f, 'path', { d: 'M0 0L0-112M0-30L-14-50M0-30L14-50M0-58L-16-78M0-58L16-78', fill: 'none', stroke: 'rgba(240,245,210,.55)', 'stroke-width': 1.2, 'stroke-linecap': 'round' });
      add(f, 'path', { d: foglia, fill: 'none', stroke: 'rgba(10,30,5,.35)', 'stroke-width': 1 });
    };
    gruppo(ombra, true);
    // ombra spostata: tutta la pianta scivola giù a destra
    gruppo(corpo, false);
  }
  ombra.setAttribute('transform', 'translate(54 76)');
}

/* ───────── oggetti sul tavolo: penna, tazza, libri impilati ───────── */
function costruisciOggetti(desk) {
  const penna = $('#penna'), tazza = $('#tazza'), pila = $('#stack-libri');
  const NS_DISC = (d, z, bg, extra = '') => { const e = el('div'); e.style.cssText = `position:absolute;left:${-d / 2}px;top:${-d / 2}px;width:${d}px;height:${d}px;border-radius:50%;transform:translateZ(${z}px);${bg ? 'background:' + bg + ';' : ''}${extra}`; return e; };

  // generico parallelepipedo: faccia in alto + 4 lati; larghezza w (x), profondità d (y), altezza h (z)
  function scatola(w, d, h, { top, sides, front, frontHTML }) {
    const b = el('div'); b.style.cssText = `position:absolute;left:${-w / 2}px;top:${-d / 2}px;width:${w}px;height:${d}px;transform-style:preserve-3d;`;
    const f = (css, inner = '') => { const x = el('div', '', inner); x.style.cssText = 'position:absolute;backface-visibility:hidden;' + css; b.appendChild(x); return x; };
    f(`inset:0;transform:translateZ(${h}px);background:${top};`);
    f(`left:0;top:${d - h}px;width:${w}px;height:${h}px;transform-origin:50% 100%;transform:rotateX(-90deg);background:${front || sides};overflow:hidden;`, frontHTML || '');
    f(`left:0;top:0;width:${w}px;height:${h}px;transform-origin:50% 0;transform:rotateX(90deg);background:${sides};`);
    f(`left:${w - h}px;top:0;width:${h}px;height:${d}px;transform-origin:100% 50%;transform:rotateY(90deg);background:${sides};`);
    f(`left:0;top:0;width:${h}px;height:${d}px;transform-origin:0 50%;transform:rotateY(-90deg);background:${sides};`);
    return b;
  }
  const pagine = 'repeating-linear-gradient(180deg,#f0ebdf 0 1.4px,#cfc8b7 1.4px 2.8px)';

  let costruito = -1;
  const api = {
    visibili: true,
    mostra(v) { api.visibili = v; desk.querySelector('.desk-top').style.display = v ? '' : 'none'; [penna, tazza, pila].forEach(e => e.style.display = v ? '' : 'none'); },
    disponi(bw) {
      if (Math.abs(costruito - bw) < 1) return; costruito = bw;
      const bh = bw * 4 / 3;
      /* penna a sinistra del libro */
      const pl = bw * .66, pa = bw * .072;
      penna.style.cssText = `--bw:${bw}px;width:${pl}px;height:${pa}px;left:${-bw * .98 - pl / 2}px;top:${bw * .08 - pa / 2}px;transform:rotate(-83deg) translateZ(${pa * .5}px);`;

      /* tazza in alto a destra */
      tazza.innerHTML = '';
      const d = bw * .46, H = bw * .2;
      tazza.style.cssText = `left:${bw * .78}px;top:${-bh * .5 + d * .1}px;`;
      tazza.appendChild(NS_DISC(d * 1.28, .5, 'radial-gradient(circle at 40% 35%, #c08a52, #a3703f 60%, #8d5d32)', 'box-shadow:0 0 0 2px rgba(0,0,0,.12), ' + bw * .035 + 'px ' + bw * .05 + 'px ' + bw * .05 + 'px rgba(40,20,0,.5);'));
      for (let i = 1; i <= 22; i++) {
        const t = i / 22;
        const shade = 214 - Math.round((1 - t) * 26);
        tazza.appendChild(NS_DISC(d * (.94 + t * .06), 1 + t * H, `rgb(${shade + 8},${shade + 2},${shade - 12})`));
      }
      const bordo = NS_DISC(d, H + 1, 'radial-gradient(circle at 38% 30%, #f6f2ea, #e2dacb 70%, #cfc6b4)');
      for (let i = 0; i < 26; i++) { const a = Math.random() * 6.28, rr = Math.random() * d * .5; const s = el('i'); s.style.cssText = `position:absolute;left:${d / 2 + Math.cos(a) * rr}px;top:${d / 2 + Math.sin(a) * rr}px;width:${bw * .006}px;height:${bw * .006}px;border-radius:50%;background:#7b6e5b;opacity:.5`; bordo.appendChild(s); }
      tazza.appendChild(bordo);
      tazza.appendChild(NS_DISC(d * .8, H + 3, 'radial-gradient(circle at 42% 34%, #7d4f2c 0, #4a2a14 38%, #24120a 74%)', 'box-shadow:inset 0 0 ' + bw * .02 + 'px rgba(0,0,0,.7)'));
      tazza.appendChild(NS_DISC(d * .5, H + 4, 'radial-gradient(circle at 36% 30%, rgba(255,220,170,.5), rgba(255,220,170,0) 60%)'));

      /* libri impilati in alto */
      pila.innerHTML = '';
      pila.style.cssText = `left:${bw * .45}px;top:${-bh * .5 - bw * .66}px;`;
      const titoli = [['THE SIMPLER BOOK', '#f4f0e6', '#111', '#e8e3d6'], ['ANATOMIA DI UN OGGETTO', '#16160f', '#e7e2d6', '#232319'], ['NOISE & SIGNAL', '#ece8dc', '#111', '#dcd6c6']];
      let z = 0;
      titoli.forEach(([t, bg, fg, top], i) => {
        const h = bw * (.075 + i * .004), w = bw * (1.08 - i * .06), dd = bw * .74;
        const sp = `<span style="position:absolute;left:5%;right:5%;top:50%;transform:translateY(-50%);font:700 ${Math.round(h * .3)}px/1 var(--ui);font-stretch:112%;letter-spacing:.02em;color:${fg};white-space:nowrap">${t}</span>`;
        const b = scatola(w, dd, h, { top, sides: pagine, front: bg, frontHTML: sp });
        b.style.transform = `translateZ(${z}px) translateX(${(i - 1) * bw * .05}px) rotateZ(${(i - 1) * 1.8}deg)`;
        pila.appendChild(b); z += h;
      });
      // ombra sotto
      const ombra = el('div'); ombra.style.cssText = `position:absolute;left:${-bw * .56}px;top:${-bw * .34}px;width:${bw * 1.15}px;height:${bw * .78}px;background:rgba(48,24,4,.55);filter:blur(${bw * .03}px);transform:translate3d(${bw * .03}px,${bw * .045}px,-1px)`;
      pila.insertBefore(ombra, pila.firstChild);
    },
  };
  return api;
}
