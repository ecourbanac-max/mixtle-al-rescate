import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TEXTOS_APP } from '../src/contenido/textosApp';
import { UNIDADES } from '../src/contenido/unidades';
import { textoDeLocucion } from '../src/voz/locucion';
import { abrir, crearGrupo, esperarPantalla, tocarBoton } from './ayudas';
import { EJERCICIOS, resolver } from './resolver';

/*
 * v3.2.1, error 1: "Mixtle dice frases de otra pantalla y se salta la consigna".
 *
 * El caso: un grupo termina una lección, el adulto sale de la pantalla final ANTES de que Mixtle acabe
 * "¡Lo lograron…!" y entra rápido a la siguiente lección. Mixtle debe decir y dejar a la vista la consigna
 * del primer ejercicio; nunca "¡Miren cómo crece su parque!" (la frase que sigue a la del final) ni nada
 * de otra pantalla. Se prueba en cada condición en la que el audio no sigue su tiempo normal.
 *
 * No depende del tamaño de pantalla: corre solo en el proyecto del proyector.
 */

const U1 = UNIDADES[0]!;
const L1 = U1.lecciones[0]!;
const L2 = U1.lecciones[1]!;
const ULTIMO_L1 = L1.ejercicios.at(-1)!.id;
const PRIMERO_L2 = L2.ejercicios[0]!;
const PARQUE = textoDeLocucion(TEXTOS_APP.leccion.parqueCrece);
const CONSIGNA = textoDeLocucion(PRIMERO_L2.consigna);

interface Condicion {
  nombre: string;
  preparar?: (ctx: BrowserContext, page: Page) => Promise<void>;
  /** Lo que pasa en la pantalla final, antes de salir de ella. */
  enElFinal?: (page: Page) => Promise<void>;
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CONDICIONES: Condicion[] = [
  { nombre: 'normal' },
  {
    nombre: 'red lenta (cada audio tarda 2.5 s en bajar)',
    preparar: async (ctx) => {
      await ctx.route('**/voz/*.mp3', async (r) => {
        await esperar(2500);
        await r.continue().catch(() => {});
      });
    },
  },
  {
    nombre: 'computadora 4 veces más lenta',
    preparar: async (_ctx, page) => {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    },
  },
  {
    nombre: 'voz apagada',
    preparar: async (ctx) => {
      await ctx.addInitScript(() => localStorage.setItem('mixtle-al-rescate:sonido', 'no'));
    },
  },
  {
    nombre: 'audio bloqueado por el navegador (nunca se desbloquea)',
    preparar: async (ctx) => {
      await ctx.addInitScript(() => {
        const Original = window.AudioContext;
        if (Original) {
          // El contexto de audio se queda suspendido aunque se toque la pantalla.
          Original.prototype.resume = function () {
            return Promise.resolve();
          };
          const crear = Original;
          window.AudioContext = class extends crear {
            constructor(...a: ConstructorParameters<typeof AudioContext>) {
              super(...a);
              void this.suspend();
            }
          } as typeof AudioContext;
        }
        HTMLMediaElement.prototype.play = function () {
          return Promise.reject(new DOMException('bloqueado (prueba)', 'NotAllowedError'));
        };
      });
    },
  },
  {
    nombre: 'audios sin descargar (no cargan, como sin conexión a medias)',
    preparar: async (ctx) => {
      await ctx.route('**/voz/*.mp3', (r) => r.abort());
    },
  },
  {
    nombre: 'cambiar de pestaña y volver en la pantalla final',
    enElFinal: async (page) => {
      const ver = (oculta: boolean) =>
        page.evaluate((o) => {
          Object.defineProperty(document, 'visibilityState', { value: o ? 'hidden' : 'visible', configurable: true });
          Object.defineProperty(document, 'hidden', { value: o, configurable: true });
          document.dispatchEvent(new Event('visibilitychange'));
          window.dispatchEvent(new Event(o ? 'blur' : 'focus'));
        }, oculta);
      await ver(true);
      await page.waitForTimeout(800);
      await ver(false);
    },
  },
];

/** El texto del globo de Mixtle (vacío si no hay globo). */
const globo = (page: Page) => page.evaluate(() => document.querySelector('main [role="status"][aria-live="polite"] p')?.textContent ?? '');

for (const c of CONDICIONES) {
  test(`al entrar rápido a la siguiente lección, Mixtle dice y deja SU consigna (${c.nombre})`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'proyector-1920x1080', 'No depende del tamaño de pantalla.');
    test.setTimeout(3 * 60_000);
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    await c.preparar?.(ctx, page);
    await abrir(page);
    await esperarPantalla(page, 'inicio');
    await tocarBoton(page, /¡Jugar!/);
    await crearGrupo(page, 'ardilla');

    // Termina la lección 1 (desde su último ejercicio).
    await page.evaluate((id) => window.__mixtle.abrirEjercicio(id), ULTIMO_L1);
    // Se toca hasta que termina la transición (mientras, el panel de la marca no recibe toques).
    await esperarPantalla(page, 'leccion');
    await expect(page.locator(`[data-ejercicio-id="${ULTIMO_L1}"]`)).toBeVisible();
    await resolver(page, EJERCICIOS.get(ULTIMO_L1)!);
    await expect(page.locator('[data-banner="bien"]')).toBeVisible();
    await tocarBoton(page, /¡Sigamos!/);
    await expect(page.locator('[data-pantalla="fin-leccion"]')).toBeVisible();

    // El adulto no espera a que Mixtle termine: sale a los 1.5 s y entra a la lección 2.
    await page.waitForTimeout(1500);
    await c.enElFinal?.(page);
    await tocarBoton(page, TEXTOS_APP.leccion.alCamino);
    await esperarPantalla(page, 'camino');
    await page.locator(`[data-nodo="leccion:${L2.id}"]`).click({ force: true });
    await esperarPantalla(page, 'leccion');
    await expect(page.locator(`[data-ejercicio-id="${PRIMERO_L2.id}"]`)).toBeVisible();

    // Durante 9 s, el globo dice la consigna del ejercicio (con la bienvenida de la lección), nunca otra cosa.
    const vistos: string[] = [];
    for (let t = 0; t < 9000; t += 200) {
      const texto = await globo(page);
      if (texto && vistos.at(-1) !== texto) vistos.push(texto);
      await page.waitForTimeout(200);
    }
    const final = await globo(page);
    expect.soft(vistos.filter((v) => v.includes(PARQUE)), `nunca "${PARQUE}" (se vio: ${JSON.stringify(vistos)})`).toEqual([]);
    expect.soft(vistos.filter((v) => !v.includes(CONSIGNA)), `solo la consigna (se vio: ${JSON.stringify(vistos)})`).toEqual([]);
    expect(final, 'a los 9 s, la consigna sigue a la vista').toContain(CONSIGNA);

    // El botón de repetir dice la consigna.
    await page.getByRole('button', { name: TEXTOS_APP.leccion.escucharOtraVez }).first().click({ force: true });
    await page.waitForTimeout(600);
    expect(await globo(page), 'repetir dice la consigna').toContain(CONSIGNA);
    await ctx.close();
  });
}
