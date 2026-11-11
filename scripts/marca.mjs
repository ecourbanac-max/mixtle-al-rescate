// Genera la marca de "Mixtle al rescate" (dirección visual A):
//   1. src/arte/logoTexto.generado.ts: las letras del logo convertidas en trazos (Baloo 2 y Nunito).
//   2. public/marca/logo.svg y public/favicon.svg (el favicon, sin el pin de Eco Urban: a 16 px sería una mancha).
//   3. Los íconos de la app instalable: public/iconos/ (192, 512, maskable 512 y Apple 180).
//   4. docs/marca/hoja-de-personaje.svg: las 8 poses de Mixtle con su nombre (y su pin de Eco Urban).
// Uso: npm run marca:generar   (usa el Chrome instalado para los PNG; no descarga nada)
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { runnerImport } from 'vite';
import { cargarFuente, trazoSobreArco, trazoTexto } from './marca/trazos.mjs';

const RAIZ = process.cwd();
const baloo = cargarFuente('@fontsource/baloo-2', 'baloo-2-latin-800-normal.woff');
const nunito = cargarFuente('@fontsource/nunito', 'nunito-latin-900-normal.woff');

// 1. Letras del logo.
const texto = {
  mixtle: trazoSobreArco(baloo, 'Mixtle', { p0: [40, 222], control: [320, 112], p2: [600, 222], tamano: 150, centro: 0.47, espaciado: 2 }),
  alRescate: trazoTexto(baloo, 'al rescate', { x: 320, y: 284, tamano: 46 }),
  lema: trazoTexto(nunito, 'GUARDIANES DEL PARQUE', { x: 320, y: 326, tamano: 22, espaciado: 5 }),
};
writeFileSync(
  join(RAIZ, 'src', 'arte', 'logoTexto.generado.ts'),
  `// Generado por npm run marca:generar (scripts/marca.mjs). No editar a mano.
// Letras del logo convertidas en trazos: "Mixtle" (Baloo 2 ExtraBold, en arco), "al rescate" (Baloo 2
// ExtraBold) y el lema (Nunito Black). Fuentes con licencia OFL 1.1.
export const TEXTO_LOGO = ${JSON.stringify(texto, null, 2)} as const;
`,
);

// 2. Logo e ícono como archivos.
const { logoSvg, iconoSvg } = (await runnerImport('./src/arte/marca.ts')).module;
const { mixtleCompleto } = (await runnerImport('./src/arte/personajes.ts')).module;
mkdirSync(join(RAIZ, 'public', 'marca'), { recursive: true });
writeFileSync(join(RAIZ, 'public', 'marca', 'logo.svg'), `${logoSvg()}\n`);
writeFileSync(join(RAIZ, 'public', 'favicon.svg'), `${iconoSvg({ conPin: false })}\n`);

// 3. Íconos PNG.
const iconos = [
  { archivo: 'icono-192.png', lado: 192, svg: iconoSvg() },
  { archivo: 'icono-512.png', lado: 512, svg: iconoSvg() },
  { archivo: 'icono-maskable-512.png', lado: 512, svg: iconoSvg({ aSangre: true }) },
  { archivo: 'apple-touch-icon.png', lado: 180, svg: iconoSvg({ aSangre: true }) },
];
mkdirSync(join(RAIZ, 'public', 'iconos'), { recursive: true });
const navegador = await chromium.launch({ channel: 'chrome' });
for (const { archivo, lado, svg } of iconos) {
  const pagina = await navegador.newPage({ viewport: { width: lado, height: lado } });
  await pagina.setContent(`<!doctype html><body style="margin:0">${svg.replace('<svg ', `<svg width="${lado}" height="${lado}" `)}</body>`);
  await pagina.screenshot({ path: join(RAIZ, 'public', 'iconos', archivo), omitBackground: true });
  await pagina.close();
}
await navegador.close();

// 4. Hoja de personaje: las 8 poses con su nombre (también en trazos, para verse igual en GitHub).
const POSES = [
  ['saluda', 'Saluda'],
  ['feliz', 'Feliz'],
  ['celebrando', 'Celebra brincando'],
  ['pensando', 'Piensa'],
  ['sorprendido', 'Sorprendido'],
  ['animo', 'Da ánimo'],
  ['senalando', 'Señala'],
  ['duerme', 'Duerme'],
];
const CELDA = { ancho: 300, alto: 360 };
const celdas = POSES.map(([pose, nombre], i) => {
  const x = (i % 4) * CELDA.ancho;
  const y = 70 + Math.floor(i / 4) * CELDA.alto;
  return `<g transform="translate(${x} ${y})">
    <rect x="12" y="8" width="${CELDA.ancho - 24}" height="${CELDA.alto - 20}" rx="28" fill="#fff" stroke="#E6E1D3" stroke-width="3"/>
    <svg x="22" y="34" width="256" height="238" viewBox="0 0 472 440">${mixtleCompleto(pose)}</svg>
    <path d="${trazoTexto(nunito, nombre, { x: CELDA.ancho / 2, y: 326, tamano: 26 })}" fill="#1F6B4A"/>
  </g>`;
}).join('\n');
const hoja = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <rect width="1200" height="800" fill="#FFF8E7"/>
  <path d="${trazoTexto(baloo, 'Mixtle: hoja de personaje', { x: 600, y: 52, tamano: 44 })}" fill="#1F6B4A"/>
  ${celdas}
</svg>
`;
mkdirSync(join(RAIZ, 'docs', 'marca'), { recursive: true });
writeFileSync(join(RAIZ, 'docs', 'marca', 'hoja-de-personaje.svg'), hoja);
writeFileSync(join(RAIZ, 'docs', 'marca', 'logo.svg'), `${logoSvg()}\n`);
console.log('Marca lista: src/arte/logoTexto.generado.ts, public/marca/logo.svg, public/favicon.svg, public/iconos/, docs/marca/.');
