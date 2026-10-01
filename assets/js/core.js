// Il motore: scorrimento "ammorbidito", progressi delle sezioni, mouse, piccoli attrezzi.

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const map = (v, a, b, c = 0, d = 1) => c + (d - c) * clamp((v - a) / (b - a));
export const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
export const ease = {
  smooth: t => t * t * (3 - 2 * t),
  inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  quartOut: t => 1 - Math.pow(1 - t, 4),
  back: t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};

/** Interpolazione fra tappe [[p, valore], …], con curva dolce in ogni tratto. */
export function kf(p, tappe, curva = ease.smooth) {
  if (p <= tappe[0][0]) return tappe[0][1];
  for (let i = 1; i < tappe.length; i++) {
    if (p <= tappe[i][0]) {
      const [p0, v0] = tappe[i - 1], [p1, v1] = tappe[i];
      return v0 + (v1 - v0) * curva((p - p0) / (p1 - p0));
    }
  }
  return tappe[tappe.length - 1][1];
}

/** Numeri a caso ripetibili: il disordine deve essere sempre lo stesso. */
export function caso(seme = 1) {
  let s = seme >>> 0;
  return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

const q = new URLSearchParams(location.search);
export const S = {
  y: scrollY, ty: scrollY, vel: 0,
  vw: innerWidth, vh: innerHeight,
  mx: .5, my: .5, sx: .5, sy: .5, // mouse grezzo e ammorbidito (0..1)
  singola: innerWidth < 820 || innerWidth / innerHeight < 0.9,   // una pagina sola (telefono)
  riduci: matchMedia('(prefers-reduced-motion: reduce)').matches,
  fermo: q.has('fermo'),           // niente ammorbidimento (per le prove)
  t: 0, dt: 0.016,
  tocco: matchMedia('(hover: none)').matches,
};

const sezioni = [];
const frame_fn = [];
export function ogniFrame(fn) { frame_fn.push(fn); }

/** modo 'sticky': progresso 0→1 mentre il palco resta fermo; 'passa': 0→1 mentre la sezione attraversa lo schermo. */
export function sezione(elem, fn, modo = 'sticky') {
  const s = { elem, fn, modo, top: 0, h: 0, p: -1, vis: false };
  sezioni.push(s);
  misura(s);
  return s;
}
function misura(s) {
  const r = s.elem.getBoundingClientRect();
  s.top = r.top + scrollY; s.h = r.height;
}
export function misuraTutto() {
  S.vw = innerWidth; S.vh = innerHeight;
  S.singola = innerWidth < 820 || innerWidth / innerHeight < 0.9;
  sezioni.forEach(misura);
}
export function posizioneSezione(s, p) {
  // scroll Y a cui la sezione ha progresso p
  const campo = s.modo === 'sticky' ? s.h - S.vh : s.h + S.vh;
  const base = s.modo === 'sticky' ? s.top : s.top - S.vh;
  return base + campo * p;
}

addEventListener('pointermove', e => { S.mx = e.clientX / S.vw; S.my = e.clientY / S.vh; }, { passive: true });
addEventListener('resize', () => { misuraTutto(); });
addEventListener('load', () => misuraTutto());
if (document.fonts && document.fonts.ready) document.fonts.ready.then(misuraTutto);

let ultimo = performance.now();
let acceso = false;
function giro(now) {
  const dt = Math.min(.05, (now - ultimo) / 1000); ultimo = now;
  S.dt = dt; S.t += dt;
  S.ty = scrollY;
  const prima = S.y;
  S.y = (S.fermo || S.riduci) ? S.ty : damp(S.y, S.ty, 10, dt);
  if (Math.abs(S.y - S.ty) < .05) S.y = S.ty;
  S.vel = (S.y - prima) / Math.max(dt, .001);
  S.sx = damp(S.sx, S.mx, 5, dt); S.sy = damp(S.sy, S.my, 5, dt);

  for (const s of sezioni) {
    const campo = s.modo === 'sticky' ? Math.max(1, s.h - S.vh) : s.h + S.vh;
    const base = s.modo === 'sticky' ? s.top : s.top - S.vh;
    const p = clamp((S.y - base) / campo);
    const vis = S.y + S.vh * 1.2 > s.top && S.y - S.vh * .2 < s.top + s.h;
    if (vis || s.vis) { // una volta in più all'uscita, così lo stato finale è giusto
      if (p !== s.p || vis) s.fn(p, s);
      s.p = p;
    }
    s.vis = vis;
  }
  for (const f of frame_fn) f(dt);
  requestAnimationFrame(giro);
}
export function avvia() {
  if (acceso) return; acceso = true;
  misuraTutto(); S.y = scrollY;
  requestAnimationFrame(giro);
}
