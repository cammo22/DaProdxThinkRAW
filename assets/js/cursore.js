// Il cursore a mirino (solo con il mouse): un anello con la croce di registro che segue con un po' di ritardo.
import { $, S, damp, ogniFrame } from './core.js';

export function iniziaCursore() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cur = $('.cur'), anello = $('.cur-ring'), pallino = $('.cur-dot'), lab = $('.cur-lab');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, visibile = false;
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY;
    if (!visibile) { visibile = true; rx = x; ry = y; document.body.classList.add('ha-cursore'); }
    const t = e.target.closest ? e.target.closest('[data-cursore], a, button, .toccabile') : null;
    if (t) { lab.textContent = t.dataset.cursore || ''; cur.classList.add('is-over'); }
    else cur.classList.remove('is-over');
  }, { passive: true });
  addEventListener('pointerdown', () => cur.classList.add('is-giu'));
  addEventListener('pointerup', () => cur.classList.remove('is-giu'));
  document.addEventListener('pointerleave', () => { cur.style.opacity = 0; });
  document.addEventListener('pointerenter', () => { cur.style.opacity = 1; });
  ogniFrame(dt => {
    rx = damp(rx, x, 16, dt); ry = damp(ry, y, 16, dt);
    pallino.style.transform = `translate(${x}px, ${y}px)`;
    anello.style.transform = `translate(${rx}px, ${ry}px) ${cur.classList.contains('is-over') ? 'scale(1.9)' : cur.classList.contains('is-giu') ? 'scale(.7)' : ''}`;
    lab.style.transform = `translate(${rx}px, ${ry}px)`;
  });
}
