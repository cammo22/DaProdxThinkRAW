// Navigazione: indicatore in alto, barra di avanzamento, menu stile iPod, rotella che porta in giro,
// scorrimento automatico e la funzione che porta a un punto del sito con una bella corsa.

import { $, $$, S, clamp, map, ease, el, ogniFrame, misuraTutto, posizioneSezione } from './core.js';
import { audio, ricordaScelta } from './audio.js';
import { SPREAD } from './content.js';

export function iniziaNav({ hero, manifesto, libro, finale }) {
  const heroS = hero, manS = manifesto, libS = libro.sezione;
  const finEl = $('#finale');
  const parteEl = $('#dove-parte'), titoloEl = $('#dove-titolo');
  const fill = $('#hud-fill');
  const batt = $$('.batt i');
  const menuEl = $('#menu'), lista = $('#menu-lista');
  const rotella = $('#rotella'), anello = $('#rot-anello');

  /* ───────── dove si può andare ───────── */
  const tappe = () => {
    const t = [
      { nome: 'Copertina', y: 0 },
      { nome: 'Manifesto', y: posizioneSezione(manS, .55) },
      { nome: 'Il libro', y: libro.yDelloSpread(-1) },
    ];
    SPREAD.forEach((sp, k) => t.push({ nome: sp.titolo, parte: sp.parte, num: sp.num, k, y: libro.yDelloSpread(k) }));
    t.push({ nome: 'Finale', y: finEl.offsetTop - 0 });
    return t;
  };

  /* ───────── corsa fino a un punto ───────── */
  let corsa = null;
  function vaiA(y) {
    cancelAnimationFrame(corsa);
    const da = scrollY, a = clamp(y, 0, document.documentElement.scrollHeight - innerHeight);
    const dist = Math.abs(a - da);
    if (dist < 4) return;
    const dur = S.riduci ? 1 : clamp(500 + dist * .35, 700, 2600);
    const t0 = performance.now();
    const passo = now => {
      const t = clamp((now - t0) / dur);
      scrollTo(0, da + (a - da) * ease.inOut(t));
      if (t < 1) corsa = requestAnimationFrame(passo);
    };
    corsa = requestAnimationFrame(passo);
  }
  ['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, e => { if (ev === 'keydown' && ['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return; cancelAnimationFrame(corsa); fermaAuto(); }, { passive: true }));

  function vaiAlla(dove) {
    if (dove === 'cima') return vaiA(0);
    if (dove === 'finale') return vaiA(finEl.offsetTop);
    if (typeof dove === 'number') return vaiA(libro.yDelloSpread(dove));
    if (dove === 'libro') return vaiA(libro.yDelloSpread(-1));
  }

  /* ───────── HUD: dove siamo ───────── */
  let ultimo = '';
  document.addEventListener('tr:spread', () => { ultimo = ''; });
  function dove() {
    const y = S.y + 40;
    let parte = 'Copertina', titolo = '', tono = 'chiaro';
    if (y >= finEl.offsetTop) { parte = 'Finale'; tono = 'chiaro'; }
    else if (y >= libS.top - 10) {
      tono = 'scuro';
      const k = libro.spread();
      const sp = SPREAD[k];
      if (!sp || k < 0) { parte = 'Il libro'; titolo = ''; }
      else if (sp.parte) { parte = `${sp.parte} · ${sp.num}`; titolo = sp.titolo; }
      else { parte = sp.titolo; }
    } else if (y >= manS.top) { parte = 'Dentro lo schermo'; tono = 'lcd'; if (y > manS.top + manS.h - S.vh * 1.15) tono = 'scuro'; }
    else if (y >= heroS.top + heroS.h - S.vh * 1.6) { parte = 'Dentro lo schermo'; tono = 'lcd'; }
    const k = parte + '|' + titolo + '|' + tono;
    if (k === ultimo) return; ultimo = k;
    parteEl.textContent = parte; titoloEl.textContent = titolo;
    document.body.dataset.tono = tono;
  }

  ogniFrame(() => {
    const max = document.documentElement.scrollHeight - S.vh;
    const p = max > 0 ? clamp(S.y / max) : 0;
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
    const b = `scaleX(${(1 - p).toFixed(3)})`;
    batt.forEach(e => { e.style.transform = b; });
    anello.style.transform = `rotate(${(S.y * .06 + rotAcc).toFixed(1)}deg)`;
    dove();
  });

  /* ───────── menu come lo schermo di un iPod ───────── */
  let voci = [], sel = 0;
  function costruisciMenu() {
    const t = tappe();
    const righe = [];
    righe.push({ titolo: true, nome: 'THINK RAW.' });
    righe.push({ nome: 'Copertina', y: t[0].y }, { nome: 'Manifesto', y: t[1].y }, { nome: 'Il libro', y: t[2].y });
    let parte = null;
    SPREAD.forEach((sp, k) => {
      if (sp.parte && sp.parte !== parte) { parte = sp.parte; righe.push({ titolo: true, nome: sp.parte }); }
      if (!sp.parte && k === SPREAD.length - 1) righe.push({ titolo: true, nome: 'Fine' });
      righe.push({ nome: sp.titolo, num: sp.num ? sp.num : '', k, y: t[3 + k].y });
    });
    righe.push({ nome: 'Finale', y: t[t.length - 1].y });
    lista.innerHTML = '';
    voci = [];
    righe.forEach(r => {
      const li = el('li', r.titolo ? 'titolo' : '', r.titolo ? r.nome : `<span>${r.nome}</span><em>${r.num || ''}</em>`);
      if (!r.titolo) {
        li.dataset.cursore = 'Vai';
        li.addEventListener('click', () => { audio.clic(); chiudiMenu(); setTimeout(() => vaiA(r.y), 250); });
        li.addEventListener('pointerenter', () => { scegli(voci.indexOf(li)); });
        voci.push(li);
      }
      lista.appendChild(li);
    });
  }
  function scegli(i, suono = true) {
    i = (i + voci.length) % voci.length;
    voci.forEach((v, j) => v.classList.toggle('sel', j === i));
    if (i !== sel && suono) audio.tick(); sel = i;
    voci[i].scrollIntoView({ block: 'nearest' });
  }
  function apriMenu() {
    costruisciMenu();
    // evidenzia dove siamo
    const t = tappe(); let vicino = 0, d = 1e9;
    voci.forEach((v, i) => {
      const y = [...lista.children].indexOf(v);
    });
    const ys = []; let n = 0;
    const righe = [...lista.children];
    const all = tappe();
    // trova la tappa più vicina al punto attuale
    all.forEach((tp, i) => { const dd = Math.abs(tp.y - S.ty); if (dd < d) { d = dd; vicino = i; } });
    const nomeVicino = all[vicino].nome;
    const idx = voci.findIndex(v => v.firstElementChild.textContent === nomeVicino);
    menuEl.classList.add('aperto'); menuEl.setAttribute('aria-hidden', 'false');
    audio.clic();
    sel = -1; scegli(idx < 0 ? 0 : idx, false);
  }
  function chiudiMenu() { menuEl.classList.remove('aperto'); menuEl.setAttribute('aria-hidden', 'true'); }
  menuEl.addEventListener('click', e => { if (e.target === menuEl) chiudiMenu(); });
  $('#btn-menu').addEventListener('click', () => (menuEl.classList.contains('aperto') ? chiudiMenu() : apriMenu()));

  addEventListener('keydown', e => {
    if (menuEl.classList.contains('aperto')) {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') { chiudiMenu(); e.preventDefault(); }
      else if (e.key === 'ArrowDown') { scegli(sel + 1); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { scegli(sel - 1); e.preventDefault(); }
      else if (e.key === 'Enter') { voci[sel].click(); e.preventDefault(); }
      return;
    }
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'm' || e.key === 'M') apriMenu();
    else if (e.key === 'ArrowRight') { vaiOltre(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { vaiOltre(-1); e.preventDefault(); }
    else if (e.key === 'Home') { vaiA(0); e.preventDefault(); }
    else if (e.key === 'End') { vaiA(finEl.offsetTop); e.preventDefault(); }
  });

  function vaiOltre(dir) {
    const t = tappe().map(x => x.y), y = S.ty;
    let dest;
    if (dir > 0) dest = t.find(v => v > y + 30); else { dest = [...t].reverse().find(v => v < y - 30); }
    if (dest == null) dest = dir > 0 ? t[t.length - 1] : 0;
    vaiA(dest);
  }

  /* ───────── suono ───────── */
  const bs = $('#btn-suono');
  const mostra = () => bs.setAttribute('aria-pressed', audio.acceso ? 'true' : 'false');
  mostra();
  document.addEventListener('tr:suono', mostra);
  bs.addEventListener('click', async () => {
    if (audio.acceso) { audio.spegni(); ricordaScelta(false); } else { await audio.accendi(); ricordaScelta(true); audio.clic(); }
    mostra();
  });

  /* ───────── la rotella ───────── */
  let rotAcc = 0, giro = 0, attivo = false, ang0 = 0, resto = 0;
  const centro = () => { const r = rotella.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width / 2]; };
  rotella.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    const [cx, cy, R] = centro();
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < R * .36) return;
    attivo = true; rotella.setPointerCapture(e.pointerId);
    ang0 = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    cancelAnimationFrame(corsa); fermaAuto();
    rotella.classList.add('presa');
  });
  rotella.addEventListener('pointermove', e => {
    if (!attivo) return;
    const [cx, cy] = centro();
    const a = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    let d = a - ang0; if (d > 180) d -= 360; if (d < -180) d += 360; ang0 = a;
    rotAcc += d; resto += d;
    scrollBy(0, d * 9);
    while (Math.abs(resto) > 11) { resto -= Math.sign(resto) * 11; audio.tick(.8); }
  });
  const rilascia = () => { attivo = false; rotella.classList.remove('presa'); };
  rotella.addEventListener('pointerup', rilascia); rotella.addEventListener('pointercancel', rilascia);

  // scorrimento automatico
  let auto = false, autoRaf = 0;
  const giu = $('.rot-giu');
  function avviaAuto() {
    auto = true; giu.classList.add('attivo');
    let t0 = performance.now();
    const passo = now => {
      if (!auto) return;
      const dt = (now - t0) / 1000; t0 = now;
      const prima = scrollY; scrollBy(0, 230 * dt);
      if (Math.abs(scrollY - prima) < .1 && dt > 0) { fermaAuto(); return; }
      autoRaf = requestAnimationFrame(passo);
    };
    autoRaf = requestAnimationFrame(passo);
  }
  function fermaAuto() { auto = false; giu.classList.remove('attivo'); cancelAnimationFrame(autoRaf); }
  rotella.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    audio.clic();
    const az = b.dataset.az;
    if (az === 'menu') apriMenu();
    else if (az === 'avanti') { fermaAuto(); vaiOltre(1); }
    else if (az === 'indietro') { fermaAuto(); vaiOltre(-1); }
    else if (az === 'gira') { auto ? fermaAuto() : avviaAuto(); }
  });

  // collegamenti con data-vai
  $$('[data-vai]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); const v = a.dataset.vai; audio.clic();
    vaiAlla(v === '0' ? 'cima' : v);
  }));

  addEventListener('resize', () => { if (menuEl.classList.contains('aperto')) costruisciMenu(); });
  return { vaiAlla, vaiA, tappe };
}
