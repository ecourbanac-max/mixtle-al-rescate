import { expect, test } from '@playwright/test';
import { abrir, captura, crearGrupo, desbloquearTodo, esperarPantalla, tocarBoton } from './ayudas';
import { clic, jugarHasta, medirDibujos, resolver, type DibujoMedido } from './resolver';

/*
 * Corrección pedida por Eco Urban (v3.1): en "Toca el árbol grande" el arbolito se veía más alto que el
 * árbol grande, y el juego marcaba mal a quien tocaba el que se veía más grande.
 *
 * Estas pruebas miden lo que de verdad se pinta en pantalla (no el tamaño del archivo ni el de la
 * tarjeta) y exigen un margen claro: cada etapa mide, cuando mucho, dos tercios de la siguiente.
 */

/** Cada etapa debe medir como mucho esta fracción de la siguiente (margen claro, no "por un pixel"). */
const FRACCION_MAXIMA = 0.67;

const porArte = (medidas: DibujoMedido[], arte: string) => {
  const m = medidas.find((x) => x.arte === arte);
  if (!m) throw new Error(`No está en pantalla el dibujo "${arte}" (hay: ${medidas.map((x) => x.arte).join(', ')})`);
  return m;
};

/** brote < arbolito < árbol grande, con margen; mismo suelo; el grande casi llena su recuadro. */
function revisarEscala(medidas: DibujoMedido[]): void {
  const brote = porArte(medidas, 'etapa-brote');
  const arbolito = porArte(medidas, 'etapa-arbolito');
  const arbol = porArte(medidas, 'etapa-arbol');
  const detalle = `brote ${brote.alto} px, arbolito ${arbolito.alto} px, árbol ${arbol.alto} px`;
  expect(brote.alto, detalle).toBeGreaterThan(12); // el brote es pequeño, pero se ve
  expect(brote.alto / arbolito.alto, `el brote debe ser mucho más bajo que el arbolito (${detalle})`).toBeLessThan(FRACCION_MAXIMA);
  expect(arbolito.alto / arbol.alto, `el arbolito debe ser mucho más bajo que el árbol grande (${detalle})`).toBeLessThan(FRACCION_MAXIMA);
  // "Aproximadamente la mitad de alto que el árbol grande".
  expect(arbolito.alto / arbol.alto, detalle).toBeGreaterThan(0.4);
  // También el ancho crece: el árbol grande es el más ancho.
  expect(arbolito.ancho, 'el árbol grande es el más ancho').toBeLessThan(arbol.ancho * FRACCION_MAXIMA);
  // El árbol grande llena la mayor parte de su recuadro.
  expect(arbol.alto / arbol.altoRecuadro, 'el árbol grande casi llena su recuadro').toBeGreaterThan(0.6);
}

test('Toca el árbol grande: en pantalla el brote es el más bajo, el arbolito mide la mitad y el árbol grande es el más alto; se resuelve tocando el que se ve más grande', async ({ page }, info) => {
  const { errores } = await abrir(page);
  await esperarPantalla(page, 'inicio');
  await tocarBoton(page, /¡Jugar!/);
  await crearGrupo(page, 'colibri');
  await desbloquearTodo(page);
  const ejercicio = await jugarHasta(page, 'u3-l1', 'u3-l1-e6');
  expect(ejercicio.consigna).toBe('Toca el árbol grande.');

  const zona = '[data-ejercicio-id="u3-l1-e6"]';
  await expect(page.locator(`${zona} [data-tarjeta]`)).toHaveCount(3);
  await page.waitForTimeout(600); // que las tarjetas terminen de entrar
  const medidas = await medirDibujos(page, `${zona} [data-tarjeta] img[data-arte]`);
  await captura(page, info, 'correccion-arbol-grande');
  revisarEscala(medidas);

  // Las tres tarjetas comparten la línea de suelo (misma escala, mismo lienzo): unos pocos px de diferencia como mucho.
  const suelos = medidas.map((m) => m.suelo);
  expect(Math.max(...suelos) - Math.min(...suelos), `suelos en ${suelos.map((s) => s.toFixed(1)).join(', ')}`).toBeLessThanOrEqual(Math.max(3, medidas[0]!.altoRecuadro * 0.02));

  // La tarjeta correcta es la que se VE más grande: se toca la del dibujo más alto, sin mirar la respuesta.
  const masAlta = [...medidas].sort((a, b) => b.alto - a.alto)[0]!;
  expect(masAlta.tarjeta).toBe('arbol');
  await clic(page, `${zona} [data-tarjeta="${masAlta.tarjeta}"]`);
  await expect(page.locator('[data-banner="bien"]')).toBeVisible();
  await expect(page.locator('[data-banner="casi"]')).toHaveCount(0);
  expect(errores).toEqual([]);
});

test('Ordena cómo crece un árbol: las tarjetas se ven de menor a mayor y, ya ordenadas, el crecimiento es progresivo', async ({ page }, info) => {
  const { errores } = await abrir(page);
  await esperarPantalla(page, 'inicio');
  await tocarBoton(page, /¡Jugar!/);
  await crearGrupo(page, 'ardilla');
  await desbloquearTodo(page);
  const ejercicio = await jugarHasta(page, 'u3-l4', 'u3-l4-e6');
  expect(ejercicio.consigna).toBe('Ordena cómo crece un árbol.');

  const zona = '[data-ejercicio-id="u3-l4-e6"]';
  await page.waitForTimeout(600);
  await captura(page, info, 'correccion-ordena-antes-de-ordenar');
  // Las tarjetas para tocar (revueltas) ya van en escala.
  revisarEscala(await medirDibujos(page, `${zona} [data-tarjeta] img[data-arte]`));

  // Se ordena tocando del dibujo más bajo al más alto, como lo haría quien solo mira el tamaño.
  const tarjetas = await medirDibujos(page, `${zona} [data-tarjeta] img[data-arte]`);
  for (const t of [...tarjetas].sort((a, b) => a.alto - b.alto)) await clic(page, `${zona} [data-tarjeta="${t.tarjeta}"]`);
  await expect(page.locator('[data-banner="bien"]')).toBeVisible();
  await expect(page.locator('[data-banner="casi"]')).toHaveCount(0);

  // Ya en sus lugares (1 → 2 → 3): cada uno más alto que el anterior, con el mismo suelo.
  const lugares = await medirDibujos(page, `${zona} ol img[data-arte]`);
  expect(lugares.map((l) => l.arte)).toEqual(['etapa-brote', 'etapa-arbolito', 'etapa-arbol']);
  revisarEscala(lugares);
  for (let i = 1; i < lugares.length; i++) expect(lugares[i]!.alto, `lugar ${i + 1} más alto que el lugar ${i}`).toBeGreaterThan(lugares[i - 1]!.alto / FRACCION_MAXIMA);
  const suelos = lugares.map((l) => l.suelo);
  expect(Math.max(...suelos) - Math.min(...suelos)).toBeLessThanOrEqual(3);
  await page.waitForTimeout(700);
  await captura(page, info, 'correccion-ordena-ordenado');
  expect(errores).toEqual([]);
});

test('la pregunta de la "botella llena de jugo" muestra la botella con jugo, no la vacía', async ({ page }, info) => {
  await abrir(page);
  await esperarPantalla(page, 'inicio');
  await tocarBoton(page, /¡Jugar!/);
  await crearGrupo(page, 'ajolote');
  await desbloquearTodo(page);

  // u1-l4-e6: "¿Está bien tirar una botella llena de jugo…?" → el dibujo es la botella con jugo.
  const botella = await jugarHasta(page, 'u1-l4', 'u1-l4-e6');
  await expect(page.locator('[data-ejercicio-id="u1-l4-e6"] img[data-arte="botella-llena"]')).toBeVisible();
  await expect(page.locator('[data-ejercicio-id="u1-l4-e6"] img[data-arte="residuo-botella"]')).toHaveCount(0);
  await captura(page, info, 'correccion-botella-llena');
  await resolver(page, botella);
  await expect(page.locator('[data-banner="bien"]')).toBeVisible();
});
