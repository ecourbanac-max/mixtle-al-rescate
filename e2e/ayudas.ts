import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, type ConsoleMessage, type Locator, type Page, type Request, type TestInfo } from '@playwright/test';
import { DIRECCION_DEFINITIVA } from '../src/sitio';

export interface Tocable {
  nombre: string;
  escena: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  toqueAncho: number;
  toqueAlto: number;
}

interface Gancho {
  escenas(): string[];
  pantalla(): string | null;
  tocables(): Tocable[];
  resumen(): { residuosSeparados: number; animalesAyudados: number; plantados: number };
  fps(): number;
  quieto(): boolean;
  voz(): { conAudio: number; conNavegador: number };
  musica(): string | null;
  marcador(): Record<string, number> | null;
  estampaNueva(id: string): void;
  /** Un grupo con esa mascota, todos los accesorios comprados y los indicados puestos, ya en el camino. */
  grupoVestido(mascota: string, puestos?: string[]): Promise<string>;
  /** Abre la lección que tiene ese ejercicio, empezando en él. */
  abrirEjercicio(id: string): Promise<void>;
  /** Deja puestos exactamente esos accesorios en el grupo actual. */
  ponerse(puestos: string[]): Promise<void>;
}

declare global {
  interface Window {
    __mixtle: Gancho;
  }
}


/**
 * El único error de consola que se tolera: en una dirección vieja, el juego revisa en segundo plano si la
 * dirección definitiva ya sirve el juego (src/servicios/mudanzaDefinitiva.ts). Mientras mixtle.org no exista,
 * esa revisión falla con ERR_NAME_NOT_RESOLVED y Chrome lo anota en la consola aunque el juego lo maneja.
 * Solo ese error y solo si viene de la dirección definitiva; cualquier otro error de red sigue contando.
 */
function esRevisionDeLaDefinitiva(m: ConsoleMessage): boolean {
  if (!m.text().includes('net::ERR_NAME_NOT_RESOLVED')) return false;
  try {
    return new URL(m.location().url).host === new URL(DIRECCION_DEFINITIVA).host;
  } catch {
    return false;
  }
}

/** Abre el juego y registra errores de consola y todas las peticiones de red. */
export async function abrir(page: Page, ruta = '/?e2e') {
  const errores: string[] = [];
  const peticiones: Request[] = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  page.on('console', (m) => {
    if (m.type() !== 'error' || esRevisionDeLaDefinitiva(m)) return;
    errores.push(m.text());
  });
  page.on('request', (r) => peticiones.push(r));
  await page.goto(ruta);
  await page.waitForFunction(() => !!window.__mixtle && !!window.__mixtle.pantalla());
  return { errores, peticiones };
}

export function escenas(page: Page): Promise<string[]> {
  return page.evaluate(() => window.__mixtle.escenas());
}

export async function esperarEscena(page: Page, clave: string, timeout = 30_000): Promise<void> {
  await expect.poll(() => escenas(page), { timeout }).toContain(clave);
}

/** Pantalla de React visible: "inicio" o "aventura". */
export async function esperarPantalla(page: Page, nombre: string, timeout = 30_000): Promise<void> {
  await expect.poll(() => page.evaluate(() => window.__mixtle.pantalla()), { timeout }).toBe(nombre);
  // v3: mientras el panel de la transición de marca cubre la pantalla no recibe toques (a propósito).
  await expect(page.locator('.transicion-marca')).toHaveCount(0, { timeout });
}

/** Toca un botón de React (DOM) por su nombre accesible, con el dedo si el dispositivo es táctil. */
export async function tocarBoton(page: Page, nombre: string | RegExp): Promise<void> {
  // Con texto se busca el nombre exacto; con expresión regular, lo que coincida.
  const boton = page.getByRole('button', { name: nombre, exact: typeof nombre === 'string' });
  await expect(boton).toBeVisible();
  await expect(boton).toBeEnabled();
  // Si quedó fuera de la vista (una ventana que se desplaza, como el modo facilitador en la tablet), se trae a la
  // vista con el DOM (scrollIntoViewIfNeeded de Playwright espera a que el botón esté quieto, y los que laten
  // nunca lo están). Se reintenta: un botón que React vuelve a pintar puede desaparecer un instante.
  await expect
    .poll(async () => {
      try {
        await boton.first().evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }), undefined, { timeout: 2000 });
        return true;
      } catch {
        return false;
      }
    })
    .toBe(true);
  // Algunos botones entran deslizándose (el banner de respuesta): se espera a que estén en pantalla.
  const alto = page.viewportSize()?.height ?? 0;
  await expect
    .poll(async () => {
      const caja = await boton.first().boundingBox();
      return !!caja && caja.y >= 0 && caja.y + caja.height <= alto + 1;
    })
    .toBe(true);
  // Algunos botones "laten" sin parar para invitar a tocarlos: Playwright nunca los vería quietos,
  // así que se tocan sin esperar a que dejen de moverse (ya se comprobó que están visibles).
  const tactil = await page.evaluate(() => navigator.maxTouchPoints > 0);
  if (tactil) await boton.tap({ force: true });
  else await boton.click({ force: true });
}

/** Crea un grupo con el animal dado (sin etiqueta) y entra a su camino. */
export async function crearGrupo(page: Page, mascota: string, etiqueta = ''): Promise<void> {
  await esperarPantalla(page, 'grupos');
  await tocarBoton(page, 'Nuevo grupo');
  await page.locator(`[data-mascota="${mascota}"]`).click({ force: true });
  if (etiqueta) await page.locator('input[name="etiqueta-grupo"]').fill(etiqueta);
  await tocarBoton(page, /¡Listo!/);
  await esperarPantalla(page, 'camino');
}

/** Abre el modo facilitador: mantener presionado el logo 3 segundos. Devuelve su ventana. */
export async function abrirFacilitador(page: Page): Promise<Locator> {
  const logo = page.locator('[data-logo]');
  const caja = (await logo.boundingBox())!;
  await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(3300);
  await page.mouse.up();
  const dialogo = page.getByRole('dialog', { name: 'Modo facilitador' });
  await expect(dialogo).toBeVisible();
  return dialogo;
}

/** Modo facilitador: mantener presionado el logo 3 segundos y abrir todas las lecciones. */
export async function desbloquearTodo(page: Page): Promise<void> {
  const dialogo = await abrirFacilitador(page);
  await dialogo.getByRole('checkbox').first().check({ force: true });
  await tocarBoton(page, 'Cerrar');
}

export function tocables(page: Page): Promise<Tocable[]> {
  return page.evaluate(() => window.__mixtle.tocables());
}

export async function esperarTocable(page: Page, prefijo: string, timeout = 60_000): Promise<Tocable> {
  let encontrado: Tocable | undefined;
  await expect
    .poll(
      async () => {
        encontrado = (await tocables(page)).find((t) => t.nombre.startsWith(prefijo));
        return !!encontrado;
      },
      { timeout, message: `esperando "${prefijo}"` },
    )
    .toBe(true);
  return encontrado!;
}

/** Convierte coordenadas del juego (1920×1080) a la ventana, sin importar el escalado. */
async function aPantalla(page: Page, x: number, y: number) {
  const caja = (await page.locator('canvas').boundingBox())!;
  return { x: caja.x + (x / 1920) * caja.width, y: caja.y + (y / 1080) * caja.height };
}

/** Toca un objeto: con el dedo si el dispositivo es táctil, con el mouse si no. */
export async function tocar(page: Page, prefijo: string, timeout?: number): Promise<Tocable> {
  const t = await esperarTocable(page, prefijo, timeout);
  const p = await aPantalla(page, t.x, t.y);
  const tactil = await page.evaluate(() => navigator.maxTouchPoints > 0);
  if (tactil) await page.touchscreen.tap(p.x, p.y);
  else await page.mouse.click(p.x, p.y);
  return t;
}

export async function arrastrar(page: Page, de: Tocable, a: Tocable): Promise<void> {
  const p1 = await aPantalla(page, de.x, de.y);
  const p2 = await aPantalla(page, a.x, a.y);
  await page.mouse.move(p1.x, p1.y);
  await page.mouse.down();
  await page.mouse.move(p2.x, p2.y, { steps: 15 });
  await page.mouse.up();
}

export function resumen(page: Page) {
  return page.evaluate(() => window.__mixtle.resumen());
}

/**
 * Adjunta una captura al reporte. Con la variable CAPTURAS=<carpeta> también la guarda ahí
 * (así se generan las imágenes de docs/capturas).
 */
export async function captura(page: Page, info: TestInfo, nombre: string): Promise<void> {
  // Nada de capturas a media animación de entrada (título cortado, pantalla oscura).
  await page.waitForFunction(() => window.__mixtle.quieto(), null, { timeout: 15_000 });
  const body = await page.screenshot();
  await info.attach(nombre, { body, contentType: 'image/png' });
  const carpeta = process.env.CAPTURAS;
  if (carpeta) {
    await mkdir(carpeta, { recursive: true });
    await writeFile(join(carpeta, `${info.project.name}-${nombre}.png`), body);
  }
}
