// Il libro che si sfoglia scrollando.
// Ogni foglio ha due facce (davanti = pagina destra, dietro = pagina sinistra dopo il giro) e ruota
// attorno al dorso. Sul telefono ogni pagina è un foglio a sé (si vede una pagina alla volta).
//
// Il tempo del libro è "b", misurato in fogli: il foglio j gira fra b = j+.3 e j+.7,
// e fra un giro e l'altro la pagina resta ferma e leggibile.

import { $, S, el, clamp, lerp, map, ease, sezione, posizioneSezione, misuraTutto } from './core.js';
import { audio } from './audio.js';
import { clonaCopertina } from './copertina.js';
import { SPREAD, creaPagina } from './content.js';

const ARRIVO = .6;   // l'arrivo del libro dura mezzo foglio e poco più
const CODA = .8;     // pausa dopo l'ultimo giro

export function iniziaLibro({ vaiAlla }) {
  const sec = $('#libro');
  const stage = $('.stage', sec);
  const bk = $('#bk');
  const persp = $('#bk-persp');
  const nota = $('#bk-pag');
  const invito = $('#bk-invito');
  const luce = $('.libro-luce', sec);

  let singola = null;
  let fogli = [];
  let pagine = [];
  let pw = 400, ph = 533;
  let giri = 0;
  let spSx, spDx, base;
  let ultimoGiro = -1;
  let spreadAttuale = -2;
  const cacheW = new Map();

  const giro = (b, j) => ease.inOut(clamp((b - j - .3) / .4));

  /* ───────── costruzione ───────── */
  function costruisci() {
    singola = S.singola;
    document.body.classList.toggle('is-singola', singola);
    bk.innerHTML = ''; fogli = []; pagine = []; cacheW.clear(); spreadAttuale = -2; ultimoGiro = -1;

    // elenco piatto: copertina, poi per ogni spread (sinistra, destra)
    const lista = [{ copertina: true }];
    SPREAD.forEach((sp, k) => { lista.push({ k, lato: 'sx', def: sp.sx }); lista.push({ k, lato: 'dx', def: sp.dx }); });
    const ultima = lista.pop();        // la quarta di copertina: fissa, sta sotto
    const ctx = { vaiAlla, S };
    const crea = v => {
      if (v.copertina) { const w = el('div', 'pg-cop'); w.appendChild(clonaCopertina()); return { el: w, copertina: true }; }
      return creaPagina(v.def, SPREAD[v.k], v.lato, ctx, v.k);
    };

    base = el('div', 'bk-base'); const baseIn = el('div', 'bk-base-in'); base.appendChild(baseIn);
    spSx = el('div', 'bk-spessore bk-sp-sx'); spDx = el('div', 'bk-spessore bk-sp-dx');
    bk.append(el('div', 'bk-ombra'), base, spSx, spDx);

    if (!singola) {
      for (let j = 0; j < lista.length / 2; j++) {
        const f = creaFoglio(j, false);
        const a = crea(lista[2 * j]), b = crea(lista[2 * j + 1]);
        f.fronte.prepend(a.el); f.retro.prepend(b.el);
        pagine.push(a, b); bk.appendChild(f.el); fogli.push(f);
      }
      const q = creaPagina(ultima.def, SPREAD[ultima.k], 'dx', ctx, ultima.k);
      baseIn.appendChild(q.el); pagine.push(q);
      giri = fogli.length;
    } else {
      lista.forEach((v, j) => {
        const f = creaFoglio(j, true);
        const a = crea(v); f.fronte.prepend(a.el); pagine.push(a);
        bk.appendChild(f.el); fogli.push(f);
      });
      giri = fogli.length - 1;         // l'ultima pagina resta dov'è
    }
    misura();
  }

  function creaFoglio(j, solo) {
    const e = el('div', 'foglio');
    const fronte = el('div', 'faccia fronte');
    const retro = el('div', 'faccia retro');
    const vf = el('i', 'vel'), vr = el('i', 'vel');
    fronte.appendChild(vf); e.appendChild(fronte);
    if (!solo) { retro.appendChild(vr); e.appendChild(retro); }
    return { el: e, fronte, retro, vf, vr, j, solo, f: -1 };
  }

  const totale = () => ARRIVO + giri + CODA + .35;
  const bDa = p => -ARRIVO + p * totale();

  function misura() {
    const vw = S.vw, vh = S.vh;
    pw = singola ? Math.min(vw * .88, (vh - 150) * .75) : Math.min(vw * .43, (vh - 128) * .75, 660);
    ph = pw * 4 / 3;
    persp.style.setProperty('--pw', pw + 'px');
    persp.style.setProperty('--ph', ph + 'px');
    bk.style.width = (singola ? pw : pw * 2) + 'px';
    bk.style.height = ph + 'px';
    bk.style.marginLeft = -(singola ? pw / 2 : pw) + 'px';
    bk.style.marginTop = -(ph / 2 + 10) + 'px';
    const per = singola ? 64 : 96;
    sec.style.height = `calc(${(totale() * per).toFixed(0)}vh + 100vh)`;
    fogli.forEach(f => { f.f = -1; });
  }

  /* ───────── a ogni fotogramma ───────── */
  function aggiorna(p) {
    if (!fogli.length) return;
    const b = bDa(p);
    const n = fogli.length;

    // arrivo del libro dal buio
    const arr = ease.out(clamp((b + ARRIVO) / ARRIVO));
    const mx = S.sx - .5, my = S.sy - .5;
    const apertura = singola ? 0 : giro(b, 0);
    const tx = singola ? 0 : lerp(-pw / 2, 0, apertura);
    const fine = ease.inOut(clamp((b - (giri + .75)) / (CODA)));   // un respiro alla fine
    const sc = lerp(.8, 1, arr) * (1 - .06 * fine);
    bk.style.transform = `translate3d(${tx.toFixed(1)}px, ${((1 - arr) * 90).toFixed(1)}px, ${(-(1 - arr) * 260).toFixed(0)}px) rotateX(${(my * -3.2 + (1 - arr) * 26).toFixed(2)}deg) rotateY(${(mx * 5.5).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
    bk.style.opacity = clamp(arr * 1.5).toFixed(3);
    luce.style.opacity = (.25 + .75 * arr).toFixed(3);
    invito.style.opacity = ((1 - map(b, .05, .4)) * arr).toFixed(3);

    // fogli
    let voltati = 0, inGiro = -1;
    for (const f of fogli) {
      const fisso = singola && f.j === n - 1;
      const g = fisso ? 0 : giro(b, f.j);
      if (g > .5) voltati++;
      if (g > .02 && g < .98) inGiro = f.j;
      if (Math.abs(g - f.f) < .0004) continue;
      f.f = g;
      const z = g < .5 ? (n - f.j) * 1.2 : f.j * 1.2;
      const lift = Math.sin(Math.PI * g) * pw * .04;
      f.el.style.transform = `translateZ(${(z + lift).toFixed(2)}px) rotateY(${(-180 * g).toFixed(2)}deg)`;
      f.el.style.pointerEvents = (g > .02 && g < .98) ? 'none' : '';
      f.vf.style.opacity = (g < .5 ? g * .75 : 0).toFixed(3);
      if (f.vr) f.vr.style.opacity = (g > .5 ? (1 - g) * .75 : 0).toFixed(3);
    }
    // ombra che il foglio in volo getta sulle pagine sotto
    for (let i = 0; i < n; i++) {
      const f = fogli[i], su = fogli[i - 1], dopo = fogli[i + 1];
      f.fronte.style.setProperty('--ombra', (su ? Math.sin(Math.PI * Math.max(0, su.f)) * .42 : 0).toFixed(3));
      if (!f.solo) f.retro.style.setProperty('--ombra', (f.f > .5 && dopo ? Math.sin(Math.PI * Math.max(0, dopo.f)) * .42 : 0).toFixed(3));
    }
    if (inGiro !== -1 && inGiro !== ultimoGiro) audio.carta(clamp(Math.abs(S.vel) / 1400, 0, 1));
    ultimoGiro = inGiro;

    // spessori ai lati: quello che resta a destra, quello già voltato a sinistra
    if (!singola) { larghezza(spDx, (n - voltati) * 2.4); larghezza(spSx, voltati * 2.4); }

    // le pagine che servono si animano
    if (singola) {
      pagine.forEach((pg, m) => {
        const da = m - 1 + .35;
        if (b < da - .7 || b > da + 2.2) return;
        pg.update && pg.update(clamp((b - da) / .42), S, clamp((b - da - .4) / .5));
      });
    } else {
      for (let k = 0; k < SPREAD.length; k++) {
        const da = k + .35;
        if (b < da - .7 || b > da + 2.2) continue;
        const loc = clamp((b - da) / .42);          // 0→1 mentre la pagina si apre
        const hold = clamp((b - da - .4) / .5);     // 0→1 mentre la si legge, prima del giro dopo
        const L = pagine[2 * k + 1], R = pagine[2 * k + 2];
        L && L.update && L.update(loc, S, hold); R && R.update && R.update(loc, S, hold);
      }
    }
    indicatori(b);
  }

  function larghezza(e, w) {
    w = Math.round(w * 10) / 10;
    if (cacheW.get(e) === w) return; cacheW.set(e, w);
    e.style.width = w + 'px';
  }

  function indicatori(b) {
    let k;
    if (!singola) k = clamp(Math.floor(b - .3), -1, SPREAD.length - 1);
    else k = clamp(Math.floor((Math.floor(b + .5) - 1) / 2), -1, SPREAD.length - 1);
    if (k === spreadAttuale) return;
    spreadAttuale = k;
    document.dispatchEvent(new CustomEvent('tr:spread', { detail: { k, sp: SPREAD[k] || null } }));
    nota.textContent = k < 0 ? 'Copertina' : `pp. ${String(2 * k + 1).padStart(2, '0')}–${String(2 * k + 2).padStart(2, '0')}`;
  }

  /** a che punto dello scroll lo spread k sta fermo e leggibile */
  function yDelloSpread(k) {
    const b = singola ? (k < 0 ? 0 : 2 * k + 1) : k + 1.0;
    return posizioneSezione(s, clamp((b + ARRIVO) / totale(), 0, 1));
  }

  costruisci();
  const s = sezione(sec, aggiorna);
  addEventListener('resize', () => {
    if (S.singola !== singola) { costruisci(); } else misura();
    misuraTutto();
  });
  return { yDelloSpread, sezione: s, spread: () => spreadAttuale, misura };
}
