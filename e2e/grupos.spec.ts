import { expect, test, type Page } from '@playwright/test';
import { abrir, esperarPantalla, tocarBoton } from './ayudas';

/*
 * "¿Quién va a jugar?" (v3.1.3): ni Mixtle guía, ni su globo de texto mientras habla, ni la marca de Eco
 * Urban tapan una tarjeta de grupo ni "Nuevo grupo", con pocos y muchos grupos, arriba de la lista y
 * desplazada hasta abajo. En la v3.1.2 la prueba solo medía a Mixtle y no vio que en el celular acostado el
 * globo tapaba la mitad de "Nuevo grupo". Celular y tablet parados: el juego pide girar el aparato.
 */
const PANTALLAS = [
  { nombre: 'compu 1366×768', width: 1366, height: 768, tactil: false },
  { nombre: 'laptop con zoom 125 %', width: 1093, height: 614, tactil: false },
  { nombre: 'laptop con zoom 150 %', width: 911, height: 512, tactil: false },
  { nombre: 'celular acostado 844×390', width: 844, height: 390, tactil: true },
  { nombre: 'tablet 1024×768', width: 1024, height: 768, tactil: true },
  { nombre: 'tablet parada 1024×1366', width: 1024, height: 1366, tactil: true },
];
const PARADOS = [
  { nombre: 'celular parado 390×844', width: 390, height: 844 },
  { nombre: 'tablet parada 768×1024', width: 768, height: 1024 },
];

type Caja = { left: number; top: number; right: number; bottom: number };

/** Crea `n` grupos de golpe (con el gancho de pruebas) y vuelve a "¿Quién va a jugar?". */
async function conGrupos(page: Page, n: number): Promise<void> {
  const mascotas = ['ardilla', 'colibri', 'monarca', 'ajolote', 'tlacuache', 'cacomixtle'];
  for (let i = 0; i < n; i++) {
    await page.evaluate((m) => window.__mixtle.grupoVestido(m), mascotas[i % mascotas.length]!);
    await esperarPantalla(page, 'camino');
  }
  await tocarBoton(page, 'Cambiar de grupo');
  await esperarPantalla(page, 'grupos');
}

/** Con Mixtle hablando (su globo a la vista): qué tarjetas tapan Mixtle, su globo o la marca. */
async function tapadas(page: Page) {
  await page.getByRole('button', { name: 'Mixtle: escuchar otra vez' }).first().click({ force: true });
  await expect(page.locator('[data-mixtle-grupos] [role="status"]')).toBeVisible();
  await page.waitForTimeout(700); // que el globo termine de aparecer
  return page.evaluate(() => {
    const r = (e: Element): Caja => e.getBoundingClientRect();
    const choca = (a: Caja, b: Caja) => !(a.right <= b.left + 0.5 || a.left >= b.right - 0.5 || a.bottom <= b.top + 0.5 || a.top >= b.bottom - 0.5);
    const lista = r(document.querySelector('[data-lista-grupos]')!);
    // Solo la parte de cada tarjeta que se ve dentro de la lista (la que se desplaza).
    const tarjetas = [...document.querySelectorAll<HTMLElement>('[data-lista-grupos] button')]
      .filter((b) => b.dataset.grupo || /Nuevo grupo/.test(b.textContent ?? ''))
      .map((b) => {
        const c = r(b);
        return { nombre: b.dataset.grupo ? 'grupo' : 'Nuevo grupo', c: { left: c.left, right: c.right, top: Math.max(c.top, lista.top), bottom: Math.min(c.bottom, lista.bottom) } };
      })
      .filter((t) => t.c.bottom > t.c.top);
    const encima = {
      Mixtle: r(document.querySelector('[data-mixtle-grupos] [data-expresion]')!),
      'el globo de Mixtle': r(document.querySelector('[data-mixtle-grupos] [role="status"]')!),
      'la marca de Eco Urban': r(document.querySelector('[data-marca-eco-urban]')!),
    };
    const fuera = Object.entries(encima).filter(([, c]) => c.left < -0.5 || c.top < -0.5 || c.right > innerWidth + 0.5 || c.bottom > innerHeight + 0.5).map(([n]) => n);
    const choques = tarjetas.flatMap((t) => Object.entries(encima).filter(([, c]) => choca(c, t.c)).map(([n]) => `${n} tapa ${t.nombre}`));
    return { choques, fuera, tarjetas: tarjetas.length };
  });
}

for (const p of PANTALLAS) {
  test(`¿Quién va a jugar? en ${p.nombre}: ni Mixtle, ni su globo, ni la marca tapan las tarjetas (2, 4 y 7 grupos)`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'proyector-1920x1080', 'Los tamaños los da la prueba.');
    for (const n of [2, 4, 7]) {
      const contexto = await browser.newContext({ viewport: { width: p.width, height: p.height }, hasTouch: p.tactil });
      const page = await contexto.newPage();
      const { errores } = await abrir(page);
      await esperarPantalla(page, 'inicio');
      await conGrupos(page, n);
      const caso = `${p.nombre}, ${n} grupos`;
      const arriba = await tapadas(page);
      expect(arriba.tarjetas, caso).toBeGreaterThan(0);
      expect(arriba.choques, `${caso}, arriba`).toEqual([]);
      expect(arriba.fuera, `${caso}: queda fuera de la pantalla`).toEqual([]);
      await page.evaluate(() => {
        const l = document.querySelector('[data-lista-grupos]')!;
        l.scrollTop = l.scrollHeight;
      });
      await page.waitForTimeout(300);
      const abajo = await tapadas(page);
      expect(abajo.choques, `${caso}, desplazada hasta abajo`).toEqual([]);
      expect(errores).toEqual([]);
      await contexto.close();
    }
  });
}

for (const p of PARADOS) {
  test(`${p.nombre}: el juego pide girar el aparato`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'proyector-1920x1080', 'Los tamaños los da la prueba.');
    const contexto = await browser.newContext({ viewport: { width: p.width, height: p.height }, hasTouch: true });
    const page = await contexto.newPage();
    await page.goto('/?e2e');
    await expect(page.locator('#girar')).toBeVisible();
    await contexto.close();
  });
}
