import { expect, test, type Page } from '@playwright/test';
import type { EncuentraError } from '../src/contenido/tipos';
import { UNIDADES } from '../src/contenido/unidades';
import { abrir, captura } from './ayudas';

/*
 * "Encuentra el error" (v3.1.1): en cada escena de las 5 unidades, en compu, en laptop con zoom de
 * Windows al 125 y al 150 %, en celular acostado y en proyector:
 *  - la escena y todos los objetos quedan completos dentro de la pantalla;
 *  - cada objeto se toca en un área de al menos 48 px y ninguno se encima con otro;
 *  - cuando sale la barra de respuesta ("¡Así se hace!"), no tapa ningún objeto.
 * Se abre la lección directo en el ejercicio (gancho de pruebas __mixtle.abrirEjercicio).
 */

const ESCENAS = UNIDADES.flatMap((u) => u.lecciones.flatMap((l) => l.ejercicios)).filter((e): e is EncuentraError => e.tipo === 'encuentra-error');

const PANTALLAS = [
  { nombre: 'compu 1366×768', width: 1366, height: 768, tactil: false },
  { nombre: 'laptop con zoom 125 %', width: 1093, height: 614, tactil: false },
  { nombre: 'laptop con zoom 150 %', width: 911, height: 512, tactil: false },
  { nombre: 'celular 844×390', width: 844, height: 390, tactil: true },
  { nombre: 'proyector 1920×1080', width: 1920, height: 1080, tactil: false },
];

type Caja = { x0: number; y0: number; x1: number; y1: number };
const caja = (r: { x: number; y: number; width: number; height: number }): Caja => ({ x0: r.x, y0: r.y, x1: r.x + r.width, y1: r.y + r.height });

/** Espera a que una caja deje de moverse (la escena entra con una animación; la barra sube con un resorte). */
async function quieta(page: Page, selector: string): Promise<Caja> {
  let antes = '';
  let ultima: Caja | null = null;
  await expect
    .poll(async () => {
      const r = await page.locator(selector).first().boundingBox();
      if (!r) return false;
      ultima = caja(r);
      const ahora = `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`;
      const ok = ahora === antes;
      antes = ahora;
      return ok;
    }, { intervals: [250], timeout: 15_000 })
    .toBe(true);
  return ultima!;
}

for (const p of PANTALLAS) {
  test.describe(p.nombre, () => {
    test.use({ viewport: { width: p.width, height: p.height }, hasTouch: p.tactil });

    test(`${p.nombre}: cada escena de "encuentra el error" cabe completa, con objetos de 48 px sin encimarse, y la barra de respuesta no tapa ninguno`, async ({ page }, info) => {
      // El tamaño de pantalla lo da este describe: basta correrlo en un proyecto.
      test.skip(info.project.name !== 'proyector-1920x1080', 'Los tamaños los da el describe.');
      const { errores } = await abrir(page);
      for (const e of ESCENAS) {
        await page.goto('/?e2e');
        await page.waitForFunction(() => !!window.__mixtle?.pantalla?.());
        await page.evaluate((id) => window.__mixtle.abrirEjercicio(id), e.id);
        const zona = `[data-ejercicio-id="${e.id}"]`;
        await expect(page.locator(`${zona} [data-escena]`)).toBeVisible({ timeout: 30_000 });
        const escena = await quieta(page, `${zona} [data-escena]`);
        const donde = `${e.id} en ${p.nombre}`;

        // La escena completa, dentro de la pantalla.
        expect(escena.x0, `${donde}: escena`).toBeGreaterThanOrEqual(0);
        expect(escena.y0, `${donde}: escena`).toBeGreaterThanOrEqual(0);
        expect(escena.x1, `${donde}: escena`).toBeLessThanOrEqual(p.width + 0.5);
        expect(escena.y1, `${donde}: escena`).toBeLessThanOrEqual(p.height + 0.5);

        // Cada objeto: dentro de la escena y de la pantalla, de 48 px o más, sin encimarse con otro.
        const objetos: { id: string; c: Caja }[] = [];
        for (const o of e.objetos) {
          const c = caja((await page.locator(`${zona} [data-objeto="${o.id}"]`).boundingBox())!);
          objetos.push({ id: o.id, c });
          expect(c.x1 - c.x0, `${donde}: ${o.id} mide al menos 48 px`).toBeGreaterThanOrEqual(47.5);
          expect(c.y1 - c.y0, `${donde}: ${o.id} mide al menos 48 px`).toBeGreaterThanOrEqual(47.5);
          expect(c.x0 >= escena.x0 - 0.5 && c.y0 >= escena.y0 - 0.5 && c.x1 <= escena.x1 + 0.5 && c.y1 <= escena.y1 + 0.5, `${donde}: ${o.id} dentro de la escena`).toBe(true);
        }
        for (let i = 0; i < objetos.length; i++)
          for (let j = i + 1; j < objetos.length; j++) {
            const a = objetos[i]!.c, b = objetos[j]!.c;
            const encima = a.x0 < b.x1 - 0.5 && b.x0 < a.x1 - 0.5 && a.y0 < b.y1 - 0.5 && b.y0 < a.y1 - 0.5;
            expect(encima, `${donde}: ${objetos[i]!.id} y ${objetos[j]!.id} no se enciman`).toBe(false);
          }

        // Se encuentra todo; sale la barra y no tapa ningún objeto (ni la escena).
        for (const o of e.objetos.filter((x) => x.mal)) await page.locator(`${zona} [data-objeto="${o.id}"]`).click({ force: true });
        await expect(page.locator('[data-banner="bien"]')).toBeVisible();
        const barra = await quieta(page, '[data-banner="bien"]');
        for (const { id, c } of objetos) expect(c.y1, `${donde}: la barra no tapa ${id}`).toBeLessThanOrEqual(barra.y0 + 0.5);
        expect(escena.y1, `${donde}: la barra no tapa la escena`).toBeLessThanOrEqual(barra.y0 + 0.5);
        if (e.id === 'u3-l1-e5') await captura(page, info, `encuentra-${p.width}x${p.height}-resuelto`);
      }
      expect(errores).toEqual([]);
    });
  });
}
