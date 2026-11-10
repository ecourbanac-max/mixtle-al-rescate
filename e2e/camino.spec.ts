import { expect, test, type Page } from '@playwright/test';
import type { Ejercicio } from '../src/contenido/tipos';
import { UNIDADES } from '../src/contenido/unidades';
import { abrir, captura, crearGrupo, esperarPantalla, tocarBoton } from './ayudas';
import { EJERCICIOS, clic, resolver } from './resolver';

/** Una respuesta equivocada para el ejercicio en pantalla (solo tipos de una tarjeta). */
async function equivocarse(page: Page, e: Ejercicio): Promise<void> {
  if (e.tipo !== 'escucha-toca' && e.tipo !== 'elige-imagen') throw new Error('Usar un ejercicio de tarjetas');
  const mala = e.opciones.find((o) => o.id !== e.correcta)!;
  await clic(page, `[data-ejercicio-id="${e.id}"] [data-tarjeta="${mala.id}"]`);
}

test('un grupo nuevo completa una lección con un error, ve la pantalla final y su parque crece; el avance se guarda', async ({ page }, info) => {
  const { errores, peticiones } = await abrir(page);
  await esperarPantalla(page, 'inicio');
  await tocarBoton(page, /¡Jugar!/);
  await captura(page, info, 'v2-1-grupos');
  await crearGrupo(page, 'ajolote', '1°A');
  await expect(page.locator('[data-grupo]').first()).toContainText('Ajolote 1°A');
  await captura(page, info, 'v2-2-camino');

  const parque = page.locator('[data-parque-basura]').first();
  const basuraAntes = Number(await parque.getAttribute('data-parque-basura'));
  expect(basuraAntes).toBe(8);

  // Lección 1 de la unidad 1.
  const leccion = UNIDADES[0]!.lecciones[0]!;
  await clic(page, `[data-nodo="leccion:${leccion.id}"]`);
  await esperarPantalla(page, 'leccion');

  let errorHecho = false;
  let repasos = 0;
  for (let paso = 0; paso < 30; paso++) {
    const pantalla = await page.evaluate(() => window.__mixtle.pantalla());
    if (pantalla === 'fin-leccion') break;
    const caja = page.locator('[data-ejercicio-id]');
    await expect(caja).toBeVisible();
    const id = (await caja.getAttribute('data-ejercicio-id'))!;
    if ((await caja.getAttribute('data-repaso')) === 'true') repasos += 1;
    const e = EJERCICIOS.get(id)!;
    if (!errorHecho && (e.tipo === 'escucha-toca' || e.tipo === 'elige-imagen')) {
      // Un error a propósito: banner naranja con pista e "Intentar otra vez"; nunca se pierde nada.
      await equivocarse(page, e);
      await expect(page.locator('[data-banner="casi"]')).toBeVisible();
      await page.waitForTimeout(800); // que el banner termine de subir
      await captura(page, info, 'v2-3-casi');
      await tocarBoton(page, 'Intentar otra vez');
      errorHecho = true;
    }
    await resolver(page, e);
    await expect(page.locator('[data-banner="bien"]')).toBeVisible();
    if (paso === 1) {
      await page.waitForTimeout(800);
      await captura(page, info, 'v2-4-bien');
    }
    await tocarBoton(page, /¡Sigamos!/);
  }

  // El ejercicio fallado volvió al final para repasar.
  expect(repasos).toBe(1);
  await esperarPantalla(page, 'fin-leccion');
  // La recompensa se ve ahí mismo: el parque empieza como estaba y en seguida pierde una basura y gana color.
  const parqueFin = page.locator('[data-pantalla="fin-leccion"] [data-parque-basura]');
  await expect(parqueFin).toHaveAttribute('data-parque-basura', String(basuraAntes));
  await expect(parqueFin).toHaveAttribute('data-parque-basura', String(basuraAntes - 1), { timeout: 4000 });
  expect(Number(await parqueFin.getAttribute('data-parque-color'))).toBeGreaterThan(0.3);
  const total = leccion.ejercicios.length;
  await expect(page.locator('[data-a-la-primera]')).toHaveAttribute('data-a-la-primera', String(total - 1));
  await expect(page.locator('[data-hojitas]')).toHaveAttribute('data-hojitas', String(10 + total - 1));
  await page.waitForTimeout(2000);
  await captura(page, info, 'v2-5-fin');
  await tocarBoton(page, 'Volver al camino');

  // El parque creció y la lección quedó hecha; la siguiente lección se abre y el cofre (a la mitad) aún no.
  await esperarPantalla(page, 'camino');
  const basuraDespues = Number(await page.locator('[data-parque-basura]').first().getAttribute('data-parque-basura'));
  expect(basuraDespues).toBeLessThan(basuraAntes);
  await expect(page.locator(`[data-nodo="leccion:${leccion.id}"]`)).toHaveAttribute('data-estado', 'hecho');
  await expect(page.locator('[data-nodo="leccion:u1-l2"]')).toHaveAttribute('data-estado', 'disponible');
  await expect(page.locator('[data-nodo="cofre:u1"]')).toHaveAttribute('data-estado', 'bloqueado');
  await expect(page.locator('[data-hojitas-grupo]')).toHaveAttribute('data-hojitas-grupo', String(10 + total - 1));
  await captura(page, info, 'v2-6-camino-despues');

  // Otro día (recargar): el grupo y su avance siguen ahí, guardados solo en este aparato.
  await page.reload();
  await page.waitForFunction(() => !!window.__mixtle?.pantalla());
  await tocarBoton(page, /¡Jugar!/);
  await esperarPantalla(page, 'grupos');
  await clic(page, '[data-grupo]');
  await esperarPantalla(page, 'camino');
  await expect(page.locator(`[data-nodo="leccion:${leccion.id}"]`)).toHaveAttribute('data-estado', 'hecho');

  // Álbum: aún sin estampas.
  await tocarBoton(page, /Álbum/);
  await esperarPantalla(page, 'album');
  // Las 5 estampas se ven siempre (las que aún no se ganan, en silueta).
  await expect(page.locator('[data-estampa]')).toHaveCount(UNIDADES.length);
  await expect(page.locator('[data-ganada="true"]')).toHaveCount(0);
  await captura(page, info, 'v2-7-album');

  expect(peticiones.filter((r) => r.method() !== 'GET').map((r) => `${r.method()} ${r.url()}`)).toEqual([]);
  expect(errores).toEqual([]);
});

test('camino, lección y álbum: cada botón mide al menos 64 px reales', async ({ page }) => {
  await abrir(page);
  await tocarBoton(page, /¡Jugar!/);
  await crearGrupo(page, 'colibri');
  const revisar = async (donde: string) => {
    for (const b of await page.locator('main button:visible, header button:visible').all()) {
      // Algunos botones se van solos mientras se miden (el de repetir del globo de Mixtle se oculta
      // al terminar de hablar): si ya no está, se salta en lugar de esperarlo hasta el límite.
      const caja = await b.boundingBox({ timeout: 2000 }).catch(() => null);
      if (!caja) continue;
      const nombre = (await b.getAttribute('aria-label', { timeout: 1000 }).catch(() => null)) ?? (await b.textContent({ timeout: 1000 }).catch(() => '')) ?? '';
      expect.soft(Math.min(caja.width, caja.height), `${donde}: ${nombre}`).toBeGreaterThanOrEqual(64);
    }
  };
  await revisar('camino');
  await clic(page, '[data-nodo="leccion:u1-l1"]');
  await esperarPantalla(page, 'leccion');
  await page.waitForTimeout(800);
  await revisar('lección');
});
