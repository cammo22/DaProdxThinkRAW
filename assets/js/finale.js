// Il finale: il bordo strappato, le scritte che scorrono, la foto che si rivela.
import { $, S, clamp, map, ease, caso, sezione } from './core.js';

export function iniziaFinale() {
  const sec = $('#finale');
  const riga = $('#fin-riga');
  const foto = $('#fin-foto');
  const cornice = $('.fin-cornice', foto);
  const img = $('img', foto);
  const testo = $('.fin-testo', sec);

  // bordo strappato: un poligono con i punti sfalsati, sempre uguale
  const r = caso(5);
  const strappo = document.createElement('div'); strappo.className = 'fin-strappo';
  const pts = []; const N = 90;
  for (let i = 0; i <= N; i++) pts.push(`${(i / N * 100).toFixed(2)}% ${(8 + r() * 62 + (i % 3 ? 0 : r() * 20)).toFixed(1)}%`);
  strappo.style.clipPath = `polygon(0 100%, ${pts.join(', ')}, 100% 100%)`;
  sec.prepend(strappo);

  // due file di scritte: una piena e una solo contorno, in senso opposto
  const unita = (cls) => `<span class="${cls}">THINK RAW.</span><i></i>`;
  riga.innerHTML = `<div class="fin-r1">${unita('')}${unita('')}${unita('')}${unita('')}</div><div class="fin-r2">${unita('o')}${unita('o')}${unita('o')}${unita('o')}</div>`;
  const r1 = riga.children[0], r2 = riga.children[1];

  sezione(sec, p => {
    const off = (S.y - sec.offsetTop) ;
    r1.style.transform = `translateX(${(-off * .22 - 100).toFixed(1)}px)`;
    r2.style.transform = `translateX(${(off * .22 - 1400).toFixed(1)}px)`;
    const a = ease.out(map(p, .12, .5));
    cornice.style.clipPath = `inset(${((1 - a) * 100).toFixed(1)}% 0 0 0)`;
    img.style.transform = `scale(${(1.25 - .25 * a).toFixed(3)}) translateY(${((p - .4) * -40).toFixed(1)}px)`;
    foto.style.opacity = clamp(a * 3).toFixed(2);
    testo.style.opacity = clamp(map(p, .3, .6)).toFixed(2);
    testo.style.transform = `translateY(${((1 - clamp(map(p, .3, .6))) * 40).toFixed(1)}px)`;
  }, 'passa');
}
