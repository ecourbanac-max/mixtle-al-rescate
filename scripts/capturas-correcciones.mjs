// Capturas de antes y después de las correcciones que pidió Eco Urban (v3.1 y v3.1.1), en computadora
// (1366×768) y en celular acostado (844×390), jugando como lo haría un grupo:
//   1  Mixtle en el inicio              2  Mixtle en una lección
//   3  "Toca el árbol grande"           4  …al tocar el árbol que se ve más alto
//   5  "Ordena cómo crece un árbol"     6  …ya ordenado
//   7  vestidor (Mixtle sin accesorios) 7b vestidor con el paliacate puesto
//   8  unidad terminada                 9  diploma (Mixtle con paliacate)
//   10 "Toca lo que lastima al árbol" (escena completa, y 10-resuelto: todo encontrado)
//   11 pantalla de carga                12 "¿Quién va a jugar?" (selección de grupo)
//
// Uso: node scripts/capturas-correcciones.mjs <urlBase> <antes|despues> [carpeta]
//   SOLO=1,10,11  solo esas capturas (por omisión, todas).
// Un solo navegador sin ventana (laptop de 8 GB). No usa atajos que no existan en producción.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';
import { runnerImport } from 'vite';
import { ejercicioEnPantalla, esperarPantalla, resolver, seguir, tocarBoton, tocarSelector } from './demo/jugar.mjs';
import { fragmento, grupoEnParada, grupoUnidadCompleta, UNIDADES } from './demo/sembrar.mjs';

const [base = '', etiqueta = 'despues', carpeta = join('docs', 'capturas', 'correcciones')] = process.argv.slice(2);
if (!/^https?:\/\//.test(base) || !['antes', 'despues'].includes(etiqueta)) {
  console.error('Uso: node scripts/capturas-correcciones.mjs <urlBase> <antes|despues> [carpeta]');
  process.exit(1);
}
const URL_BASE = base.replace(/\/$/, '');
const SOLO = new Set((process.env.SOLO ?? '').split(',').filter(Boolean));
const quiero = (...ids) => !SOLO.size || ids.some((id) => SOLO.has(id));
mkdirSync(carpeta, { recursive: true });
const libre = () => `${(os.freemem() / 1e9).toFixed(2)} GB`;

const TAMANOS = [
  { nombre: 'compu', contexto: { viewport: { width: 1366, height: 768 } } },
  { nombre: 'celular', contexto: { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } },
];

const { nodosDelCamino } = (await runnerImport('./src/logica/camino.ts')).module;
/** Un grupo con todo hecho hasta antes de la lección 4 de la unidad 3 (las lecciones 1 a 3 se pueden repetir). */
const paradaU3L4 = nodosDelCamino(UNIDADES).findIndex((n) => n.tipo === 'leccion' && n.leccion.id === 'u3-l4');
const grupoArboles = () => grupoEnParada(paradaU3L4, 'ardilla');
/** Un grupo cuya mascota es Mixtle, con la unidad 1 completa y su paliacate puesto: para el vestidor y el diploma. */
const grupoMixtle = () => {
  const g = grupoUnidadCompleta(['paliacate']);
  return { ...g, id: 'demo-mixtle', mascota: 'cacomixtle', etiqueta: '2°A', progreso: { ...g.progreso, hojitas: g.progreso.hojitas + 300 } };
};

/** Juega la lección hasta dejar en pantalla el ejercicio pedido (sin tocarlo). */
async function jugarHasta(p, leccionId, ejercicioId) {
  if ((await p.locator('[data-pantalla="leccion"]').count()) === 0) {
    await tocarSelector(p, `[data-nodo="leccion:${leccionId}"]`);
    await esperarPantalla(p, 'leccion');
  }
  for (let i = 0; i < 12; i++) {
    const e = await ejercicioEnPantalla(p);
    if (e.id === ejercicioId) return e;
    await resolver(p, e);
    await continuar(p);
    await p.waitForFunction((antes) => document.querySelector('[data-ejercicio-id]')?.dataset.ejercicioId !== antes, e.id, { timeout: 20000 });
  }
  throw new Error(`No se llegó a ${ejercicioId}`);
}

/** Espera el banner de acierto (entra deslizándose) y toca "¡Sigamos!". */
async function continuar(p) {
  await p.locator('[data-banner="bien"]').waitFor({ timeout: 20000 });
  await p.waitForTimeout(800);
  await seguir(p);
  await p.waitForTimeout(600);
}

/** Resuelve los repasos que queden, pasa la pantalla final y vuelve al camino. */
async function terminarLeccion(p) {
  for (let i = 0; i < 8; i++) {
    await p.waitForSelector('[data-ejercicio-id], [data-pantalla="fin-leccion"]', { timeout: 20000 });
    if ((await p.locator('[data-ejercicio-id]').count()) === 0) break;
    await resolver(p, await ejercicioEnPantalla(p));
    await continuar(p);
  }
  await p.waitForTimeout(800);
  await tocarBoton(p, /Volver al camino/);
  await esperarPantalla(p, 'camino');
}

async function salirDeLaLeccion(p) {
  await tocarBoton(p, 'Salir');
  await tocarBoton(p, 'Sí, salir');
  await esperarPantalla(p, 'camino');
}

console.log(`Capturas "${etiqueta}" de ${URL_BASE} → ${carpeta}${SOLO.size ? ` (solo ${[...SOLO].join(', ')})` : ''}. Memoria libre: ${libre()}`);
const navegador = await chromium.launch({ channel: 'chrome' });
const errores = [];
try {
  for (const t of TAMANOS) {
    const contexto = await navegador.newContext(t.contexto);
    // Con todas las animaciones (como en un equipo con tarjeta de video).
    await contexto.addInitScript(() => localStorage.setItem('mixtle-al-rescate:suave', 'no'));
    const p = await contexto.newPage();
    p.on('pageerror', (e) => errores.push(`${t.nombre}: ${e.message}`));
    const foto = async (nombre) => {
      await p.screenshot({ path: join(carpeta, `${etiqueta}-${t.nombre}-${nombre}.png`) });
      console.log(`  ${etiqueta}-${t.nombre}-${nombre}.png`);
    };

    // 11. La pantalla de carga: el código se pide con calma para que se vea (como con una red lenta).
    if (quiero('11')) {
      const lenta = await contexto.newPage();
      await lenta.route('**/assets/*.js', async (r) => {
        await new Promise((ok) => setTimeout(ok, 4000));
        await r.continue();
      });
      await lenta.goto(`${URL_BASE}/?e2e`, { waitUntil: 'commit' });
      await lenta.waitForSelector('#cargando svg', { timeout: 30000 });
      await lenta.waitForTimeout(1500);
      await lenta.screenshot({ path: join(carpeta, `${etiqueta}-${t.nombre}-11-carga.png`) });
      console.log(`  ${etiqueta}-${t.nombre}-11-carga.png`);
      await lenta.close();
    }

    // 1. Inicio: Mixtle colgado de la rama.
    if (quiero('1')) {
      await p.goto(`${URL_BASE}/?e2e`);
      await esperarPantalla(p, 'inicio');
      await p.waitForTimeout(2500);
      await foto('1-mixtle-inicio');
    }

    if (quiero('2', '3', '4', '5', '6', '7', '7b', '8', '9', '10', '12')) {
      await p.goto(`${URL_BASE}/?e2e&demo=correcciones${fragmento([grupoArboles(), grupoMixtle()])}`);
      await esperarPantalla(p, 'inicio');
      await tocarBoton(p, /¡Jugar!/);
      await esperarPantalla(p, 'grupos');
      if (quiero('12')) {
        await p.waitForTimeout(1500);
        await foto('12-seleccion-grupo');
      }
    }

    if (quiero('2', '3', '4', '5', '6', '10')) {
      await tocarSelector(p, `button:has-text("Ardilla P${paradaU3L4}")`);
      await esperarPantalla(p, 'camino');
      if (quiero('2')) {
        await tocarSelector(p, '[data-nodo="leccion:u3-l1"]');
        await esperarPantalla(p, 'leccion');
        await p.waitForTimeout(1800);
        await foto('2-mixtle-leccion');
        await salirDeLaLeccion(p);
      }
      if (quiero('10', '3', '4')) {
        // 10. "Toca lo que lastima al árbol" (u3-l1-e5): la escena completa y, después, todo encontrado.
        const encuentra = await jugarHasta(p, 'u3-l1', 'u3-l1-e5');
        if (quiero('10')) {
          await p.waitForTimeout(1500);
          await foto('10-arbol-encuentra');
        }
        await resolver(p, encuentra);
        await p.locator('[data-banner="bien"]').waitFor({ timeout: 20000 });
        await p.waitForTimeout(1200);
        if (quiero('10')) await foto('10-arbol-encuentra-resuelto');
        await seguir(p);
        await p.waitForTimeout(600);
        // 3 y 4. "Toca el árbol grande" (u3-l1-e6, el siguiente).
        const arbolGrande = await jugarHasta(p, 'u3-l1', 'u3-l1-e6');
        await p.waitForTimeout(1500);
        if (quiero('3')) await foto('3-arbol-grande');
        // Se toca el dibujo que se VE más alto en pantalla (no el que el juego sabe que es correcto).
        const masAlto = await p.evaluate(async () => {
          const alturas = [];
          for (const tarjeta of document.querySelectorAll('[data-ejercicio-id] [data-tarjeta]')) {
            const img = tarjeta.querySelector('img');
            await img.decode();
            const r = img.getBoundingClientRect();
            const c = document.createElement('canvas');
            c.width = Math.round(r.width);
            c.height = Math.round(r.height);
            const ctx = c.getContext('2d');
            const k = Math.min(c.width / img.naturalWidth, c.height / img.naturalHeight);
            ctx.drawImage(img, (c.width - img.naturalWidth * k) / 2, (c.height - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
            const d = ctx.getImageData(0, 0, c.width, c.height).data;
            let arriba = -1;
            let abajo = -1;
            for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 128) { if (arriba < 0) arriba = y; abajo = y; }
            alturas.push({ id: tarjeta.dataset.tarjeta, alto: abajo - arriba + 1 });
          }
          return alturas.sort((a, b) => b.alto - a.alto);
        });
        console.log(`  alturas en pantalla (${t.nombre}): ${masAlto.map((m) => `${m.id} ${m.alto} px`).join(', ')}; correcta: ${arbolGrande.correcta}`);
        await tocarSelector(p, `[data-ejercicio-id] [data-tarjeta="${masAlto[0].id}"]`);
        await p.locator('[data-banner]').waitFor({ timeout: 20000 });
        await p.waitForTimeout(1200);
        if (quiero('4')) await foto('4-arbol-grande-al-tocar-el-mas-alto');
        if ((await p.locator('[data-banner="casi"]').count()) > 0) {
          await tocarBoton(p, 'Intentar otra vez');
          await p.waitForTimeout(500);
          await resolver(p, arbolGrande);
        }
        await continuar(p);
        await terminarLeccion(p);
      }
      if (quiero('5', '6')) {
        const ordenar = await jugarHasta(p, 'u3-l4', 'u3-l4-e6');
        await p.waitForTimeout(1500);
        if (quiero('5')) await foto('5-ordenar-arbol');
        await resolver(p, ordenar);
        await p.locator('[data-banner="bien"]').waitFor({ timeout: 20000 });
        await p.waitForTimeout(1200);
        if (quiero('6')) await foto('6-ordenar-arbol-ordenado');
        await continuar(p);
        await terminarLeccion(p);
      }
      if (quiero('7', '7b', '8', '9')) {
        await tocarBoton(p, 'Cambiar de grupo');
        await esperarPantalla(p, 'grupos');
      }
    }

    // 7 a 9. Vestidor, unidad terminada y diploma con el grupo cuya mascota es Mixtle (con paliacate).
    if (quiero('7', '7b', '8', '9')) {
      await tocarSelector(p, 'button:has-text("Cacomixtle 2°A")');
      await esperarPantalla(p, 'camino');
      if (quiero('7', '7b')) {
        await tocarBoton(p, 'Vestidor');
        await p.getByRole('dialog', { name: 'Vestidor' }).waitFor();
        await p.waitForTimeout(1200);
        if (quiero('7b')) await foto('7b-mixtle-vestidor-paliacate');
        if (quiero('7')) {
          await tocarBoton(p, 'Quitársela');
          await p.waitForTimeout(900);
          await foto('7-mixtle-vestidor');
          await tocarBoton(p, 'Ponérsela');
          await p.waitForTimeout(600);
        }
        await tocarBoton(p, /¡Listo!/);
      }
      if (quiero('8', '9')) {
        await p.evaluate((id) => window.__mixtle.estampaNueva(id), UNIDADES[0].estampa.id);
        await p.waitForTimeout(2200);
        if (quiero('8')) await foto('8-mixtle-unidad-terminada');
        if (quiero('9')) {
          await tocarBoton(p, /Ver su diploma/);
          await p.waitForTimeout(1000);
          await foto('9-mixtle-diploma');
        }
      }
    }
    await contexto.close();
    console.log(`${t.nombre}: listo. Memoria libre: ${libre()}`);
  }
} finally {
  await navegador.close();
}
console.log(errores.length ? `Errores en la página: ${errores.join(' | ')}` : 'Sin errores en la página.');
