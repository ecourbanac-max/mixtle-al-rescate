// @vitest-environment happy-dom
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { catalogoArte } from '../src/arte/catalogo';
import { TEXTO_LOGO } from '../src/arte/logoTexto.generado';
import { COLORES_MARCA, iconoSvg, LEMA, logoSvg } from '../src/arte/marca';
import { cuerpoDeMixtle } from '../src/arte/personajes';
// @ts-expect-error: módulos .mjs de los scripts (sin tipos)
import { cargarFuente, trazoSobreArco, trazoTexto } from '../scripts/marca/trazos.mjs';
// @ts-expect-error: módulos .mjs de los scripts (sin tipos)
import { LIMITE_KB, medirPrimeraPantalla } from '../scripts/presupuesto.mjs';

const RAIZ = join(__dirname, '..');
const bienFormado = (svg: string) => {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  return doc.getElementsByTagName('parsererror').length === 0 && doc.documentElement.tagName.toLowerCase() === 'svg';
};

describe('marca: logo e íconos', () => {
  it('el logo es un SVG bien formado, sin recursos externos ni texto que dependa de una fuente', () => {
    for (const svg of [logoSvg(), logoSvg({ sinMixtle: true }), iconoSvg(), iconoSvg({ aSangre: true })]) {
      expect(bienFormado(svg)).toBe(true);
      expect(svg).not.toMatch(/(href|src)\s*=\s*["']https?:/i);
      expect(svg).not.toContain('<text');
    }
  });

  it('el logo trae sus partes animables y a Mixtle solo cuando se pide', () => {
    for (const parte of ['logo-palabra', 'logo-liston', 'logo-lema']) expect(logoSvg()).toContain(`class="${parte}"`);
    expect(logoSvg()).toContain('class="logo-mixtle"');
    expect(logoSvg({ sinMixtle: true })).not.toContain('logo-mixtle');
  });

  it('las letras del logo están al día con las fuentes (npm run marca:generar)', () => {
    const baloo = cargarFuente('@fontsource/baloo-2', 'baloo-2-latin-800-normal.woff');
    const nunito = cargarFuente('@fontsource/nunito', 'nunito-latin-900-normal.woff');
    expect(trazoSobreArco(baloo, 'Mixtle', { p0: [40, 222], control: [320, 112], p2: [600, 222], tamano: 150, centro: 0.47, espaciado: 2 })).toBe(TEXTO_LOGO.mixtle);
    expect(trazoTexto(baloo, 'al rescate', { x: 320, y: 284, tamano: 46 })).toBe(TEXTO_LOGO.alRescate);
    expect(trazoTexto(nunito, 'GUARDIANES DEL PARQUE', { x: 320, y: 326, tamano: 22, espaciado: 5 })).toBe(TEXTO_LOGO.lema);
  });

  it('los archivos de marca publicados son los mismos que genera el código', () => {
    expect(readFileSync(join(RAIZ, 'public', 'marca', 'logo.svg'), 'utf8').trim()).toBe(logoSvg().trim());
    expect(readFileSync(join(RAIZ, 'public', 'favicon.svg'), 'utf8').trim()).toBe(iconoSvg({ conPin: false }).trim());
    for (const icono of ['icono-192.png', 'icono-512.png', 'icono-maskable-512.png', 'apple-touch-icon.png']) {
      expect(existsSync(join(RAIZ, 'public', 'iconos', icono))).toBe(true);
    }
  });

  it('el lema y los colores de marca son los de la dirección A', () => {
    expect(LEMA).toBe('Guardianes del parque');
    expect(COLORES_MARCA.verde).toBe('#1F6B4A');
    expect(COLORES_MARCA.naranja).toBe('#B84A14');
  });
});

describe('marca: Mixtle', () => {
  const POSES = ['saluda', 'feliz', 'celebrando', 'pensando', 'sorprendido', 'animo', 'senalando', 'duerme'] as const;

  it('las 8 poses de la hoja de personaje existen en el catálogo del juego', () => {
    const claves = new Set(catalogoArte().map((a) => a.clave));
    for (const pose of POSES) expect(claves.has(`mixtle-${pose}`)).toBe(true);
  });

  it('cada pose es un SVG bien formado, con las orejas por separado para moverse en reposo', () => {
    for (const pose of POSES) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 440">${cuerpoDeMixtle(pose)}</svg>`;
      expect(bienFormado(svg)).toBe(true);
      expect(svg.match(/class="mx-oreja /g)).toHaveLength(2);
    }
  });

  it('parpadea solo con los ojos abiertos (no al dormir, ni con los ojos felices)', () => {
    expect(cuerpoDeMixtle('normal')).toContain('mx-parpadeo');
    expect(cuerpoDeMixtle('pensando')).toContain('mx-parpadeo');
    expect(cuerpoDeMixtle('duerme')).not.toContain('mx-parpadeo');
    expect(cuerpoDeMixtle('feliz')).not.toContain('mx-parpadeo');
  });
});

describe('presupuesto de la primera pantalla', () => {
  it(`lo que baja antes del inicio no pasa de ${LIMITE_KB} KB comprimidos (si ya hay build)`, () => {
    const dist = join(RAIZ, 'dist');
    if (!existsSync(join(dist, 'index.html'))) return;
    const { total, filas } = medirPrimeraPantalla(dist);
    expect(filas.some((f: { archivo: string }) => f.archivo.endsWith('.woff2'))).toBe(true);
    expect(total / 1024).toBeLessThanOrEqual(LIMITE_KB);
  });
});

describe('Mixtle siempre con su cola anillada (sin ella parece conejo)', () => {
  const COLA = /stroke-dasharray="(34 30|31 27)"/g;
  it('los dibujos fijos de Mixtle y la pose colgada traen la cola', async () => {
    const { ARTE_ESCENAS } = await import('../src/arte/escenas');
    const arte = new Map([...catalogoArte(), ...ARTE_ESCENAS].map((a) => [a.clave, a.svg]));
    for (const clave of ['mixtle-entero', 'mixtle-entero-feliz', 'mixtle-entero-celebrando', 'mixtle-colgado']) {
      expect(arte.get(clave)?.match(COLA)?.length, clave).toBe(1);
    }
  });

  it('la hoja de personaje tiene la cola en sus 8 poses', () => {
    const hoja = readFileSync(join(RAIZ, 'docs', 'marca', 'hoja-de-personaje.svg'), 'utf8');
    expect(hoja.match(COLA)).toHaveLength(8);
  });

  it('la estampa, la mascota y el parque del grupo usan a Mixtle entero', async () => {
    const { UNIDADES } = await import('../src/contenido/unidades');
    const { mascota } = await import('../src/logica/grupos');
    expect(UNIDADES[0]!.estampa.arte).toBe('mixtle-entero');
    expect(mascota('cacomixtle').arte).toBe('mixtle-entero');
    const parque = readFileSync(join(RAIZ, 'src', 'app', 'componentes', 'ParqueGrupo.tsx'), 'utf8');
    expect(parque).toContain("arte: 'mixtle-entero'");
  });
});
