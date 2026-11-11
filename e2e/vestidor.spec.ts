import { expect, test, type Page } from '@playwright/test';
import { ACCESORIOS } from '../src/logica/accesorios';
import { MASCOTAS } from '../src/logica/grupos';
import { abrir, esperarPantalla, tocarBoton } from './ayudas';

/*
 * Vestidor: la mascota cabe SIEMPRE dentro de su recuadro de vista previa (con la cola y con
 * cualquier accesorio puesto) y nunca se encima con las tarjetas de los accesorios. Se revisa con las
 * seis mascotas, sin accesorio, con cada uno y con todos, en los tamaños de pantalla de las laptops y
 * tablets del taller, una ventana no maximizada y el zoom del navegador al 125 % (1280×650 al 125 %
 * son 1024×520 px de CSS). Se vio fallar con el cacomixtle y la ardilla (29 de octubre de 2026).
 */

const TAMANOS: [number, number, string][] = [
  [1920, 1080, '1920×1080'],
  [1366, 768, '1366×768'],
  [1280, 720, '1280×720'],
  [1024, 768, '1024×768'],
  [1280, 650, 'ventana 1280×650'],
  [1024, 520, '1280×650 al 125 %'],
];
const CONJUNTOS: string[][] = [[], ...ACCESORIOS.map((a) => [a.id]), ACCESORIOS.map((a) => a.id)];

type Caja = [number, number, number, number];
interface Medida {
  recuadro: Caja;
  dibujos: Caja[];
  tarjetas: Caja[];
  /** Algún dibujo de la mascota (o de un accesorio) se encima con alguna tarjeta. */
  cruza: boolean;
  /** Todos los dibujos caben dentro del recuadro. */
  dentro: boolean;
  /** El recuadro mismo no toca ninguna tarjeta. */
  recuadroLibre: boolean;
}

function medir(page: Page): Promise<Medida> {
  return page.evaluate(() => {
    const caja = (e: Element): [number, number, number, number] => {
      const r = e.getBoundingClientRect();
      return [r.left, r.top, r.right, r.bottom];
    };
    const seCruzan = (a: number[], b: number[]) => a[0]! < b[2]! - 1 && a[2]! > b[0]! + 1 && a[1]! < b[3]! - 1 && a[3]! > b[1]! + 1;
    const dialogo = document.querySelector('[role="dialog"][aria-label="Vestidor"]')!;
    const recuadroEl = dialogo.querySelector('[data-vestidor-figura]')!;
    const recuadro = caja(recuadroEl);
    const dibujos = [...recuadroEl.querySelectorAll('img')].map(caja);
    const tarjetas = [...dialogo.querySelectorAll('li[data-accesorio]')].map(caja);
    const tolerancia = 1;
    return {
      recuadro,
      dibujos,
      tarjetas,
      cruza: dibujos.some((d) => tarjetas.some((t) => seCruzan(d, t))),
      dentro: dibujos.every((d) => d[0] >= recuadro[0] - tolerancia && d[2] <= recuadro[2] + tolerancia && d[1] >= recuadro[1] - tolerancia && d[3] <= recuadro[3] + tolerancia),
      recuadroLibre: !tarjetas.some((t) => seCruzan(recuadro, t)),
    };
  });
}

for (const mascota of MASCOTAS) {
  test(`vestidor: ${mascota.nombre} cabe en su recuadro y no tapa las tarjetas, con cualquier accesorio y en todos los tamaños`, async ({ page }) => {
    await abrir(page);
    await esperarPantalla(page, 'inicio');
    await page.evaluate((m) => window.__mixtle.grupoVestido(m), mascota.id);
    await esperarPantalla(page, 'camino');
    await tocarBoton(page, 'Vestidor');
    await expect(page.getByRole('dialog', { name: 'Vestidor' })).toBeVisible();
    for (const [ancho, alto, nombre] of TAMANOS) {
      await page.setViewportSize({ width: ancho, height: alto });
      for (const puestos of CONJUNTOS) {
        await page.evaluate((p) => window.__mixtle.ponerse(p), puestos);
        await page.waitForTimeout(120);
        const m = await medir(page);
        const caso = `${mascota.nombre}, ${nombre}, puestos: ${puestos.join('+') || 'ninguno'}`;
        // La mascota y un dibujo por accesorio; Mixtle además trae su pin de Eco Urban encima (v3.1.1).
        expect(m.dibujos.length, caso).toBe(1 + puestos.length + (mascota.id === 'cacomixtle' ? 1 : 0));
        expect.soft(m.dentro, `${caso}: la mascota se sale del recuadro (${JSON.stringify(m.dibujos)} vs ${JSON.stringify(m.recuadro)})`).toBe(true);
        expect.soft(m.recuadroLibre, `${caso}: el recuadro toca una tarjeta`).toBe(true);
        expect.soft(m.cruza, `${caso}: la mascota tapa una tarjeta`).toBe(false);
      }
    }
  });
}
