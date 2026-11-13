import { expect, test, type Page } from '@playwright/test';
import { abrir, abrirFacilitador, crearGrupo, esperarPantalla, tocarBoton } from './ayudas';

/*
 * Modo facilitador: "Cerrar" se ve siempre, sin desplazar nada, en los tamaños de las laptops y tablets del
 * taller. En la tablet (1024×768) el panel creció con los botones del recorrido y del grupo de demostración y
 * "Cerrar" quedaba fuera de la vista (corrida contra producción del 29 de octubre de 2026; cierre del 30).
 * En el proyecto del proyector se prueban los cuatro tamaños pedidos (cambiando el tamaño de la ventana);
 * en el de la tablet, su propio tamaño con el dedo.
 */

const TAMANOS: [number, number][] = [
  [1920, 1080],
  [1366, 768],
  [1280, 650],
  [1024, 768],
];

/** La caja del botón está completa dentro de la ventana del navegador. */
async function dentroDeLaPantalla(page: Page, nombre: string): Promise<void> {
  const caja = (await page.getByRole('button', { name: nombre, exact: true }).boundingBox())!;
  const { width, height } = page.viewportSize()!;
  expect(caja, nombre).not.toBeNull();
  expect(caja.y, `${nombre}: arriba`).toBeGreaterThanOrEqual(0);
  expect(caja.y + caja.height, `${nombre}: abajo (${width}×${height})`).toBeLessThanOrEqual(height + 0.5);
  expect(caja.x, `${nombre}: izquierda`).toBeGreaterThanOrEqual(0);
  expect(caja.x + caja.width, `${nombre}: derecha`).toBeLessThanOrEqual(width + 0.5);
}

/** Cuánto se desplaza la zona del contenido (0 si todo cabe). */
function desplazamiento(page: Page): Promise<number> {
  return page.evaluate(() => {
    const cuerpo = document.querySelector('[data-modal-cuerpo]')!;
    return cuerpo.scrollHeight - cuerpo.clientHeight;
  });
}

async function revisarPanel(page: Page, info: { project: { name: string } }) {
  const dialogo = await abrirFacilitador(page);
  const { width, height } = page.viewportSize()!;
  const etiqueta = `${info.project.name} a ${width}×${height}`;
  // "Cerrar" y los demás botones, sin desplazar nada.
  await dentroDeLaPantalla(page, 'Cerrar');
  await dentroDeLaPantalla(page, 'Ver otra vez el recorrido por el juego');
  await dentroDeLaPantalla(page, 'Crear grupo de demostración');
  await dentroDeLaPantalla(page, 'Borrar este grupo');
  // En los tamaños del taller el contenido cabe sin desplazarse; en la ventana baja (650) puede desplazarse,
  // y aun así "Cerrar" sigue a la vista porque va en el pie fijo.
  const sobra = await desplazamiento(page);
  if (height >= 768) expect(sobra, `${etiqueta}: el contenido cabe sin desplazarse`).toBe(0);
  // Con la confirmación de borrar abierta (más alto), "Cerrar" sigue a la vista.
  await tocarBoton(page, 'Borrar este grupo');
  await expect(dialogo.locator('[data-confirmar="borrar"]')).toBeVisible();
  await dentroDeLaPantalla(page, 'Cerrar');
  await tocarBoton(page, 'Cancelar');
  // Y cierra con un toque, como en el salón.
  await tocarBoton(page, 'Cerrar');
  await expect(dialogo).toHaveCount(0);
}

test('el modo facilitador cabe en pantalla y "Cerrar" siempre se ve', async ({ page }, info) => {
  const { errores } = await abrir(page);
  await esperarPantalla(page, 'inicio');
  await tocarBoton(page, /¡Jugar!/);
  await crearGrupo(page, 'ardilla');
  const tamanos = info.project.name.startsWith('tablet') ? [[page.viewportSize()!.width, page.viewportSize()!.height] as [number, number]] : TAMANOS;
  for (const [width, height] of tamanos) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(300);
    await revisarPanel(page, info);
  }
  expect(errores).toEqual([]);
});

test('el respaldo de los grupos se abre desde el panel, en su propia ventana, y se vuelve al panel', async ({ page }) => {
  const { errores } = await abrir(page);
  await esperarPantalla(page, 'inicio');
  await tocarBoton(page, /¡Jugar!/);
  await crearGrupo(page, 'colibri');
  const panel = await abrirFacilitador(page);
  await panel.locator('[data-abrir-respaldo]').click();
  const respaldo = page.locator('[data-respaldo]');
  await expect(respaldo).toBeVisible();
  await expect(page.getByRole('button', { name: 'Exportar grupos' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Importar grupos' })).toBeVisible();
  // Se cierra la ventana del respaldo (el "Cerrar" de encima) y el panel sigue ahí.
  await page.getByRole('button', { name: 'Cerrar', exact: true }).last().click();
  await expect(respaldo).toHaveCount(0);
  await expect(panel).toBeVisible();
  expect(errores).toEqual([]);
});
