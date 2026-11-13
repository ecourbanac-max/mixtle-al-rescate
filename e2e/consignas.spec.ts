import { expect, test } from '@playwright/test';
import { TEXTOS_APP } from '../src/contenido/textosApp';
import { UNIDADES } from '../src/contenido/unidades';
import { textoDeLocucion } from '../src/voz/locucion';
import { abrir, crearGrupo, desbloquearTodo, esperarPantalla, tocarBoton } from './ayudas';
import { clic, EJERCICIOS, resolver } from './resolver';

/*
 * v3.2.1, error 1: una unidad entera, lección por lección y ejercicio por ejercicio, revisando que el globo
 * de Mixtle muestre la consigna DE ESE ejercicio antes de contestar. Una unidad con la voz encendida y
 * otra con la voz apagada. Sin esperar a que Mixtle termine: se contesta en cuanto la consigna se ve.
 */

const globo = (page: import('@playwright/test').Page) => page.evaluate(() => document.querySelector('main [role="status"][aria-live="polite"] p')?.textContent ?? '');

for (const { unidad, voz } of [
  { unidad: UNIDADES[0]!, voz: true },
  { unidad: UNIDADES[1]!, voz: false },
]) {
  test(`unidad ${unidad.numero} completa con la voz ${voz ? 'encendida' : 'apagada'}: cada ejercicio muestra SU consigna`, async ({ page }, info) => {
    test.skip(info.project.name !== 'proyector-1920x1080', 'No depende del tamaño de pantalla.');
    test.setTimeout(12 * 60_000);
    if (!voz) await page.addInitScript(() => localStorage.setItem('mixtle-al-rescate:sonido', 'no'));
    await abrir(page);
    await esperarPantalla(page, 'inicio');
    await tocarBoton(page, /¡Jugar!/);
    await crearGrupo(page, voz ? 'ardilla' : 'colibri');
    await desbloquearTodo(page);

    const revisados: string[] = [];
    for (const leccion of unidad.lecciones) {
      await esperarPantalla(page, 'camino');
      await clic(page, `[data-nodo="leccion:${leccion.id}"]`);
      await esperarPantalla(page, 'leccion');
      const caja = page.locator('[data-ejercicio-id]');
      for (let paso = 0; paso < 20; paso++) {
        if (await page.locator('[data-pantalla="fin-leccion"]').isVisible()) break;
        await expect(caja).toBeVisible();
        const id = (await caja.getAttribute('data-ejercicio-id'))!;
        const ejercicio = EJERCICIOS.get(id)!;
        const consigna = textoDeLocucion(ejercicio.consigna);
        await expect.poll(() => globo(page), { message: `${id}: el globo muestra su consigna`, timeout: 15_000 }).toContain(consigna);
        revisados.push(id);
        await resolver(page, ejercicio);
        await expect(page.locator('[data-banner="bien"]')).toBeVisible();
        await tocarBoton(page, /¡Sigamos!/);
        await expect(page.locator(`[data-ejercicio-id="${id}"]`)).toHaveCount(0);
      }
      await expect(page.locator('[data-pantalla="fin-leccion"]')).toBeVisible();
      await tocarBoton(page, TEXTOS_APP.leccion.alCamino);
    }
    const todos = unidad.lecciones.flatMap((l) => l.ejercicios.map((e) => e.id));
    expect(revisados, 'se revisaron todos los ejercicios de la unidad').toEqual(expect.arrayContaining(todos));
    if (voz) expect((await page.evaluate(() => window.__mixtle.voz())).conAudio, 'con la voz encendida, Mixtle habló con audio').toBeGreaterThan(0);
  });
}
