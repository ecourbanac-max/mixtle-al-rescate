import { expect, test, type Page } from '@playwright/test';
import { ALTO, ANCHO } from '../src/config';

/*
 * v3.2.1, error 2: "en la aventura de los botes, en celular, la basura no se ve" (el envase de jugo salía
 * cortado arriba). Todo lo que el niño tiene que tocar o arrastrar queda COMPLETO dentro de lo que se ve,
 * lejos de las orillas y sin que lo tape un botón de la página, en cualquier proporción de pantalla. Y la
 * colita del globo de Mixtle apunta a Mixtle.
 *
 * Cada escena se abre en un celular acostado muy ancho y se observa unos segundos desde que aparece lo
 * principal (lo que cae o se mueve también cuenta); luego se revisa en los demás tamaños. Las aventuras
 * usan Phaser con escala FIT (1920×1080 sin recortar), así que las posiciones en el juego son las mismas
 * en todos; lo que cambia es la pantalla y lo que la página pone encima.
 */

/** Margen mínimo con la orilla del juego (en pixeles del juego, 1920×1080). */
const MARGEN = 24;

const TAMANOS = [
  { nombre: 'celular acostado 1346×644', width: 1346, height: 644 },
  { nombre: 'tablet 1024×768', width: 1024, height: 768 },
  { nombre: 'compu 1366×768', width: 1366, height: 768 },
  { nombre: 'proyector 1920×1080', width: 1920, height: 1080 },
  { nombre: 'laptop con zoom 125 % (1536×864)', width: 1536, height: 864 },
  { nombre: 'laptop con zoom 150 % (1280×720)', width: 1280, height: 720 },
];

/** Escena, unidad y lo principal que el niño toca o arrastra en ella. */
const ESCENAS: { escena: string; unidad: string; principal: RegExp }[] = [
  { escena: 'Nivel1', unidad: 'u1', principal: /^residuo-/ },
  { escena: 'Nivel2', unidad: 'u1', principal: /^residuo-/ },
  { escena: 'Nivel3', unidad: 'u1', principal: /^tierra-/ },
  { escena: 'Bonus', unidad: 'u1', principal: /^cae-/ },
  { escena: 'Rescate', unidad: 'u2', principal: /^basura-/ },
  { escena: 'Bosque', unidad: 'u3', principal: /^hoyo-/ },
  { escena: 'Bici', unidad: 'u4', principal: /^carril-/ },
  { escena: 'Lonchera', unidad: 'u5', principal: /^pieza-/ },
];

interface Medida {
  nombre: string;
  /** En el juego (1920×1080). */
  juego: { izq: number; der: number; arriba: number; abajo: number };
  /** En la pantalla (CSS px). */
  pantalla: { izq: number; der: number; arriba: number; abajo: number };
  /** Lo que hay en la pantalla en el centro del objeto (debe ser el lienzo del juego). */
  encima: string;
}

function medir(page: Page): Promise<{ objetos: Medida[]; globos: { escena: string; visible: boolean; apuntaA: { x: number; y: number }; mixtle: { x: number; y: number; ancho: number; alto: number } }[]; ancho: number; alto: number }> {
  return page.evaluate(
    ({ ANCHO, ALTO }) => {
      const lienzo = document.querySelector('canvas')!;
      const c = lienzo.getBoundingClientRect();
      const sx = c.width / ANCHO;
      const sy = c.height / ALTO;
      const objetos = window.__mixtle.tocables().map((t) => {
        const juego = { izq: t.x - t.ancho / 2, der: t.x + t.ancho / 2, arriba: t.y - t.alto / 2, abajo: t.y + t.alto / 2 };
        const cx = c.x + t.x * sx;
        const cy = c.y + t.y * sy;
        const el = document.elementFromPoint(cx, cy);
        return {
          nombre: t.nombre,
          juego,
          pantalla: { izq: c.x + juego.izq * sx, der: c.x + juego.der * sx, arriba: c.y + juego.arriba * sy, abajo: c.y + juego.abajo * sy },
          encima: el === lienzo ? 'lienzo' : el ? `${el.tagName.toLowerCase()}${el.getAttribute('aria-label') ? ` "${el.getAttribute('aria-label')}"` : ''}` : 'nada',
        };
      });
      return { objetos, globos: window.__mixtle.globos(), ancho: innerWidth, alto: innerHeight };
    },
    { ANCHO, ALTO },
  );
}

/** Lo que está mal en una medición (vacío si todo está bien). */
function problemas(m: Awaited<ReturnType<typeof medir>>, tamano: string): string[] {
  const p: string[] = [];
  for (const o of m.objetos) {
    const j = o.juego;
    // Una zona de más de medio juego de ancho (los carriles de la bici: toda la calle) va de orilla a
    // orilla a propósito: basta con que esté completa dentro del juego.
    const zona = j.der - j.izq > ANCHO / 2;
    const borde = zona ? 0 : MARGEN;
    if (j.izq < borde - 0.5 || j.arriba < borde - 0.5 || j.der > ANCHO - borde + 0.5 || j.abajo > ALTO - borde + 0.5)
      p.push(`${tamano}: ${o.nombre} pegado a la orilla o fuera del juego (x ${Math.round(j.izq)}..${Math.round(j.der)}, y ${Math.round(j.arriba)}..${Math.round(j.abajo)})`);
    const s = o.pantalla;
    if (s.izq < 0 || s.arriba < 0 || s.der > m.ancho + 0.5 || s.abajo > m.alto + 0.5) p.push(`${tamano}: ${o.nombre} se sale de la pantalla`);
    if (o.encima !== 'lienzo') p.push(`${tamano}: ${o.nombre} lo tapa ${o.encima}`);
  }
  for (const g of m.globos) {
    if (!g.visible) continue;
    const { x, y, ancho, alto } = g.mixtle;
    const holgura = 40;
    const dentro = g.apuntaA.x >= x - holgura && g.apuntaA.x <= x + ancho + holgura && g.apuntaA.y >= y - holgura && g.apuntaA.y <= y + alto + holgura;
    if (!dentro) p.push(`${tamano}: en ${g.escena}, la colita del globo apunta a (${g.apuntaA.x}, ${g.apuntaA.y}) y Mixtle está en x ${Math.round(x)}..${Math.round(x + ancho)}, y ${Math.round(y)}..${Math.round(y + alto)}`);
  }
  return p;
}

for (const { escena, unidad, principal } of ESCENAS) {
  test(`${escena}: lo que se toca o arrastra se ve completo, lejos de las orillas, en cualquier pantalla; la colita apunta a Mixtle`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'proyector-1920x1080', 'Los tamaños los da la prueba.');
    test.setTimeout(3 * 60_000);
    const [primero, ...demas] = TAMANOS;
    const ctx = await browser.newContext({ viewport: { width: primero!.width, height: primero!.height }, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(`/?e2e&escena=${escena}&unidad=${unidad}`);
    await page.waitForSelector('canvas');
    // Un toque fuera del juego (en la franja de la orilla) deja sonar el audio, como el toque que trajo aquí.
    await page.mouse.click(4, primero!.height / 2);
    await expect
      .poll(() => page.evaluate((re) => window.__mixtle.tocables().some((t) => new RegExp(re).test(t.nombre)), principal.source), { timeout: 90_000, intervals: [500] })
      .toBe(true);

    const vistos = new Set<string>();
    // En el celular: se observa unos segundos (lo que cae o se mueve también tiene que verse completo).
    for (let t = 0; t < 6000; t += 250) {
      for (const p of problemas(await medir(page), primero!.nombre)) vistos.add(p);
      await page.waitForTimeout(250);
    }
    await page.screenshot({ path: info.outputPath(`${escena}-celular.png`) });
    // Los demás tamaños.
    for (const tam of demas) {
      await page.setViewportSize({ width: tam.width, height: tam.height });
      await page.waitForTimeout(700);
      for (const p of problemas(await medir(page), tam.nombre)) vistos.add(p);
    }
    expect([...vistos]).toEqual([]);
    await ctx.close();
  });
}
