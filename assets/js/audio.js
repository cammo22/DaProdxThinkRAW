// Suoni sintetizzati al volo (nessun file): il clic della rotella, la carta che gira, un colpo sordo.
// Parte spento; si accende solo con un gesto dell'utente (regola dei browser) e si ricorda la scelta.

let ctx = null, master = null, rumore = null;
let acceso = false;
let ultimoTick = 0, ultimaCarta = 0;

function prepara() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = .55;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp); comp.connect(ctx.destination);
  // un secondo di rumore bianco da riusare
  rumore = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = rumore.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

function soffio(durata, { da = 1500, a = 1500, q = 1, vol = .3, att = .004, tipo = 'bandpass', ritardo = 0 } = {}) {
  const t = ctx.currentTime + ritardo;
  const s = ctx.createBufferSource(); s.buffer = rumore; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = tipo; f.Q.value = q;
  f.frequency.setValueAtTime(da, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, a), t + durata);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(.0001, t + durata);
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t, Math.random() * .5); s.stop(t + durata + .05);
}
function nota(freq, durata, { tipo = 'sine', vol = .2, ritardo = 0, fine = null } = {}) {
  const t = ctx.currentTime + ritardo;
  const o = ctx.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(freq, t);
  if (fine) o.frequency.exponentialRampToValueAtTime(fine, t + durata);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .003); g.gain.exponentialRampToValueAtTime(.0001, t + durata);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + durata + .05);
}

export const audio = {
  get acceso() { return acceso; },
  async accendi() {
    prepara(); if (!ctx) return false;
    try { await ctx.resume(); } catch { /* il browser può rifiutare */ }
    acceso = true; return true;
  },
  spegni() { acceso = false; },
  /** il "tic" della rotella dell'iPod */
  tick(forza = 1) {
    if (!acceso || !ctx) return;
    const ora = performance.now(); if (ora - ultimoTick < 28) return; ultimoTick = ora;
    soffio(.016, { da: 5200, a: 2400, q: .8, vol: .38 * forza, att: .0008, tipo: 'highpass' });
    nota(1900, .02, { vol: .07 * forza, tipo: 'square', fine: 1200 });
  },
  /** un clic più pieno (pulsanti) */
  clic() {
    if (!acceso || !ctx) return;
    soffio(.022, { da: 4200, a: 1800, q: .7, vol: .5, att: .0006, tipo: 'highpass' });
    nota(220, .07, { vol: .12, fine: 110 });
  },
  /** la carta che gira: più veloce = più forte e acuta */
  carta(velocita = 1) {
    if (!acceso || !ctx) return;
    const ora = performance.now(); if (ora - ultimaCarta < 140) return; ultimaCarta = ora;
    const v = Math.min(1.6, .5 + velocita);
    soffio(.34, { da: 700 * v, a: 4200, q: .45, vol: .24 * v, att: .05 });
    soffio(.2, { da: 3000, a: 900, q: .6, vol: .1 * v, att: .02, ritardo: .14 });
    nota(70, .09, { vol: .06, ritardo: .26, fine: 45 });
  },
  /** colpo sordo: la copertina che si chiude, lo schermo che si spegne */
  colpo() {
    if (!acceso || !ctx) return;
    nota(120, .28, { vol: .3, fine: 38 });
    soffio(.08, { da: 900, a: 200, q: .6, vol: .25, tipo: 'lowpass' });
  },
  /** il jingle dell'accensione */
  accensione() {
    if (!ctx) return;
    nota(659.25, .5, { vol: .09, tipo: 'triangle' });
    nota(987.77, .6, { vol: .08, tipo: 'triangle', ritardo: .09 });
    nota(1318.5, .9, { vol: .07, tipo: 'triangle', ritardo: .19 });
    soffio(.05, { da: 3000, a: 1200, vol: .2, tipo: 'highpass' });
  },
  /** stampante 3D: un ronzio che sale e scende */
  ronzio(durata = .3) {
    if (!acceso || !ctx) return;
    nota(190, durata, { tipo: 'sawtooth', vol: .025, fine: 240 });
  },
};

export function ricordaScelta(v) { try { localStorage.setItem('thinkraw-suono', v ? '1' : '0'); } catch { /* niente */ } }
export function sceltaRicordata() { try { return localStorage.getItem('thinkraw-suono'); } catch { return null; } }
