import { expect, type Page } from '@playwright/test';
import { CATEGORIAS } from '../src/data/categorias';
import { RESIDUOS } from '../src/data/residuos';
import type { Ejercicio } from '../src/contenido/tipos';
import { UNIDADES } from '../src/contenido/unidades';
import { categoriaDe } from '../src/logica/clasificacion';
import { todosLosEjercicios } from '../src/voz/frases';
import { esperarPantalla, tocarBoton } from './ayudas';

/** Todos los ejercicios del juego, por id. */
export const EJERCICIOS = new Map(UNIDADES.flatMap((u) => u.lecciones.flatMap((l) => todosLosEjercicios(l.ejercicios))).map((e) => [e.id, e]));

/**
 * Toca un elemento cuando ya dejó de desplazarse (el camino se mueve suave hacia la siguiente parada).
 * Se compara el centro: la parada siguiente "late" (cambia de tamaño) pero su centro no se mueve.
 */
export async function clic(page: Page, selector: string): Promise<void> {
  const el = page.locator(selector).first();
  // Desplazamiento del DOM: scrollIntoViewIfNeeded esperaría a que la burbuja deje de latir.
  await el.evaluate((e) => e.scrollIntoView({ block: 'nearest' }));
  let anterior = '';
  await expect
    .poll(async () => {
      const c = await el.boundingBox();
      const actual = c ? `${Math.round((c.x + c.width / 2) / 3)},${Math.round((c.y + c.height / 2) / 3)}` : '';
      const quieto = actual !== '' && actual === anterior;
      anterior = actual;
      return quieto;
    }, { intervals: [150], timeout: 10_000 })
    .toBe(true);
  await el.click({ force: true });
}

/** Resuelve bien el ejercicio que está en pantalla (como lo haría el grupo). */
export async function resolver(page: Page, e: Ejercicio): Promise<void> {
  const zona = `[data-ejercicio-id="${e.id}"]`;
  switch (e.tipo) {
    case 'elige-imagen':
    case 'escucha-toca':
      return clic(page, `${zona} [data-tarjeta="${e.correcta}"]`);
    case 'si-no':
      return clic(page, `${zona} [data-respuesta="${e.respuesta ? 'si' : 'no'}"]`);
    case 'al-bote':
      for (const id of e.residuos) {
        const categoria = categoriaDe(RESIDUOS.find((r) => r.id === id)!, CATEGORIAS)!;
        await expect(page.locator(`${zona} [data-residuo="${id}"]`)).toBeVisible();
        await clic(page, `${zona} [data-bote="${categoria.id}"]`);
      }
      return;
    case 'parejas':
      for (const p of e.pares) {
        await clic(page, `${zona} [data-tarjeta="${p.izquierda.id}"]`);
        await clic(page, `${zona} [data-tarjeta="${p.derecha.id}"]`);
      }
      return;
    case 'ordena':
      for (const paso of e.pasos) await clic(page, `${zona} [data-tarjeta="${paso.id}"]`);
      return;
    case 'encuentra-error':
      for (const o of e.objetos.filter((x) => x.mal)) await clic(page, `${zona} [data-objeto="${o.id}"]`);
      return;
  }
}

/**
 * Desde el camino (con todas las lecciones abiertas), entra a la lección y la juega como un grupo,
 * resolviendo bien cada ejercicio hasta que el pedido queda en pantalla, sin tocar.
 */
export async function jugarHasta(page: Page, leccionId: string, ejercicioId: string): Promise<Ejercicio> {
  await clic(page, `[data-nodo="leccion:${leccionId}"]`);
  await esperarPantalla(page, 'leccion');
  const caja = page.locator('[data-ejercicio-id]');
  for (let paso = 0; paso < 12; paso++) {
    await expect(caja).toBeVisible();
    const id = (await caja.getAttribute('data-ejercicio-id'))!;
    if (id === ejercicioId) return EJERCICIOS.get(id)!;
    await resolver(page, EJERCICIOS.get(id)!);
    await expect(page.locator('[data-banner="bien"]')).toBeVisible();
    await tocarBoton(page, /¡Sigamos!/);
    await expect(caja).not.toHaveAttribute('data-ejercicio-id', id);
  }
  throw new Error(`No se llegó al ejercicio ${ejercicioId} de ${leccionId}`);
}

export interface DibujoMedido {
  /** Clave del dibujo (data-arte). */
  arte: string;
  /** Tarjeta que lo contiene (data-tarjeta), si está en una. */
  tarjeta: string | null;
  /** Alto de lo dibujado en pantalla, en px: de la punta al suelo (sin la sombra ni el espacio vacío). */
  alto: number;
  /** Ancho de lo dibujado, en px. */
  ancho: number;
  /** Dónde queda el suelo del dibujo en la pantalla (px desde arriba de la ventana). */
  suelo: number;
  /** Alto del recuadro que lo contiene (la tarjeta o el lugar donde quedó), en px. */
  altoRecuadro: number;
}

/**
 * Mide lo que de verdad se pinta de cada dibujo dentro de `selector`: copia la imagen a un lienzo al
 * tamaño exacto que tiene en pantalla (respetando object-fit: contain) y busca la primera y la última
 * fila con tinta. La sombra del suelo (casi transparente) no cuenta. Así la medida es la que ve el
 * grupo, no la del archivo.
 */
export function medirDibujos(page: Page, selector: string): Promise<DibujoMedido[]> {
  return page.evaluate(async (sel) => {
    const lista: DibujoMedido[] = [];
    for (const img of Array.from(document.querySelectorAll<HTMLImageElement>(sel))) {
      await img.decode();
      const r = img.getBoundingClientRect();
      const lienzo = document.createElement('canvas');
      lienzo.width = Math.round(r.width);
      lienzo.height = Math.round(r.height);
      const ctx = lienzo.getContext('2d', { willReadFrequently: true })!;
      const k = Math.min(lienzo.width / img.naturalWidth, lienzo.height / img.naturalHeight);
      const w = img.naturalWidth * k;
      const h = img.naturalHeight * k;
      ctx.drawImage(img, (lienzo.width - w) / 2, (lienzo.height - h) / 2, w, h);
      const { data } = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
      let arriba = -1;
      let abajo = -1;
      let izq = lienzo.width;
      let der = -1;
      for (let y = 0; y < lienzo.height; y++) {
        for (let x = 0; x < lienzo.width; x++) {
          // Opacidad > 50 %: tinta del dibujo. La sombra del suelo (13 %) queda fuera.
          if (data[(y * lienzo.width + x) * 4 + 3]! > 128) {
            if (arriba < 0) arriba = y;
            abajo = y;
            if (x < izq) izq = x;
            if (x > der) der = x;
          }
        }
      }
      const recuadro = (img.closest('[data-tarjeta]') ?? img.parentElement!).getBoundingClientRect();
      lista.push({
        arte: img.dataset.arte ?? '',
        tarjeta: img.closest<HTMLElement>('[data-tarjeta]')?.dataset.tarjeta ?? null,
        alto: abajo - arriba + 1,
        ancho: der - izq + 1,
        suelo: r.top + abajo + 1,
        altoRecuadro: recuadro.height,
      });
    }
    return lista;
  }, selector);
}
