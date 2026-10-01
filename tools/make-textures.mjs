// Genera le texture del sito (legno, grana della carta, acciaio zincato) con i filtri SVG di Chromium.
// Si lancia una volta sola e i file finiscono in assets/img/ (già nel repo, non serve rifarle).
//
//   npm i --no-save playwright-core
//   node tools/make-textures.mjs
//
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'img');
const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const svg = (w, h, filtro, corpo) => `<!doctype html><html><body style="margin:0;background:#fff">
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${filtro}${corpo}</svg></body></html>`;

const texture = {
  // Legno chiaro (rovere): vene lunghe, pori fini e qualche striscia più chiara.
  'legno.jpg': [1400, 1400, `
    <filter id="f" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0016 0.07" numOctaves="5" seed="11" stitchTiles="stitch" result="vene"/>
      <feColorMatrix in="vene" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.9 0 0 0 -0.55" result="venaA"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.55" numOctaves="3" seed="3" stitchTiles="stitch" result="pori"/>
      <feColorMatrix in="pori" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.3 0 0 0 -0.52" result="poriA"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.012" numOctaves="3" seed="21" stitchTiles="stitch" result="nuvole"/>
      <feColorMatrix in="nuvole" type="matrix" values="0 0 0 0 0.95  0 0 0 0 0.80  0 0 0 0 0.60  1.1 0 0 0 -0.35" result="chiaro"/>
      <feFlood flood-color="#d1a674" result="base"/>
      <feComposite in="chiaro" in2="base" operator="over" result="b1"/>
      <feFlood flood-color="#8a5a2c" flood-opacity="0.55" result="scuro"/>
      <feComposite in="scuro" in2="venaA" operator="in" result="v1"/>
      <feFlood flood-color="#6b4220" flood-opacity="0.5" result="scuro2"/>
      <feComposite in="scuro2" in2="poriA" operator="in" result="v2"/>
      <feMerge><feMergeNode in="b1"/><feMergeNode in="v1"/><feMergeNode in="v2"/></feMerge>
    </filter>`, `<rect width="100%" height="100%" filter="url(#f)"/>`],

  // Grana neutra: si moltiplica su qualsiasi colore (carta bianca, kraft, nera…).
  'grana.jpg': [640, 640, `
    <filter id="f" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="5" stitchTiles="stitch" result="n"/>
      <feDiffuseLighting in="n" surfaceScale="1.7" diffuseConstant="1.32" lighting-color="#ffffff" result="luce">
        <feDistantLight azimuth="225" elevation="58"/>
      </feDiffuseLighting>
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="9" stitchTiles="stitch" result="m"/>
      <feColorMatrix in="m" type="matrix" values="0 0 0 0 0.93  0 0 0 0 0.93  0 0 0 0 0.93  0.55 0 0 0 0.45" result="macchie"/>
      <feBlend in="luce" in2="macchie" mode="multiply"/>
    </filter>`, `<rect width="100%" height="100%" filter="url(#f)"/>`],

  // Acciaio zincato: texture a cristalli ("spangle") con luce radente.
  'acciaio.jpg': [700, 1100, `
    <filter id="f" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="turbulence" baseFrequency="0.028" numOctaves="3" seed="4" stitchTiles="stitch" result="c"/>
      <feColorMatrix in="c" type="matrix" values="1.6 0 0 0 -0.1  1.6 0 0 0 -0.1  1.6 0 0 0 -0.1  0 0 0 0 1" result="cg"/>
      <feDiffuseLighting in="cg" surfaceScale="7" diffuseConstant="1.2" lighting-color="#ffffff" result="luce">
        <feDistantLight azimuth="235" elevation="48"/>
      </feDiffuseLighting>
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.04" numOctaves="2" seed="8" stitchTiles="stitch" result="spazz"/>
      <feColorMatrix in="spazz" type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.65  0 0 0 0 0.68  0.8 0 0 0 -0.2" result="graffi"/>
      <feColorMatrix in="luce" type="matrix" values="0.74 0 0 0 0.16  0.75 0 0 0 0.16  0.77 0 0 0 0.17  0 0 0 0 1" result="tinto"/>
      <feComposite in="graffi" in2="tinto" operator="over"/>
    </filter>`, `<rect width="100%" height="100%" filter="url(#f)"/>`],
};

const b = await chromium.launch({ executablePath: exe });
for (const [nome, [w, h, filtro, corpo]] of Object.entries(texture)) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(svg(w, h, filtro, corpo));
  await p.screenshot({ path: join(out, nome), type: 'jpeg', quality: 86 });
  await p.close();
  console.log('fatta', nome);
}
await b.close();
