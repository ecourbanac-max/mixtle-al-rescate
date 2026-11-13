// Prueba en el navegador de la mudanza a la dirección definitiva (v3.2), con dos direcciones locales:
//   A = http://localhost:4311  hace de dirección vieja (como mixtle-al-rescate.vercel.app)
//   B = http://127.0.0.1:4312  hace de dirección definitiva (como mixtle.org)
// Construye el juego con esas dos direcciones (VITE_DIRECCION_DEFINITIVA / VITE_DIRECCIONES_VIEJAS, solo
// para esta prueba; el juego publicado usa las de src/sitio.ts) y los sirve con las cabeceras de
// vercel.json. Cada caso corre en un contexto nuevo (como un aparato limpio) de un solo Chrome sin ventana:
//   a) sin definitiva disponible (apagada, otra cosa, sin CORS, sin internet) no pasa nada;
//   b) los grupos con avance se mudan completos y abren en la nueva; la vieja queda sin grupos y manda directo;
//   c) si la mudanza falla a la mitad (la nueva no guarda, la nueva se cae, la vuelta no llega) no se pierde nada;
//   d) un grupo con el mismo nombre en la nueva: se conservan los dos ("(2)") y se avisa;
//   e) exportar e importar el archivo de respaldo, sin internet, y un archivo inválido no cambia nada.
// Uso: node scripts/probar-mudanza.mjs [--sin-construir]
// Si la memoria libre baja de 1.5 GB, se detiene (laptop de 8 GB).
import { chromium } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { freemem } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { runnerImport } from 'vite';
import { grupoConCofre, grupoUnidadCompleta, fragmento } from './demo/sembrar.mjs';

const { nuevoGrupo } = (await runnerImport('./src/logica/grupos.ts')).module;

const PUERTO_A = 4311;
const PUERTO_B = 4312;
const A = `http://localhost:${PUERTO_A}`;
const B = `http://127.0.0.1:${PUERTO_B}`;
const DIST = 'dist-mudanza';
const SALIDA = 'test-results/mudanza';
const MEMORIA_MINIMA = 1.5 * 1024 ** 3;

if (!process.argv.includes('--sin-construir') || !existsSync(join(DIST, 'index.html'))) {
  console.log(`Construyendo con la definitiva en ${B} y la vieja en localhost…`);
  const r = spawnSync('npx', ['vite', 'build', '--outDir', DIST, '--emptyOutDir'], {
    stdio: 'inherit',
    shell: true,
    // NODE_ENV: runnerImport (arriba) lo deja en "development", y un build así no registra el service worker.
    env: { ...process.env, NODE_ENV: 'production', VITE_DIRECCION_DEFINITIVA: B, VITE_DIRECCIONES_VIEJAS: 'localhost' },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
mkdirSync(SALIDA, { recursive: true });

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.woff': 'font/woff' };

/**
 * Servidor estático del build con las cabeceras de vercel.json. Su modo cambia en caliente:
 * juego (normal), apagado (corta la conexión), otro (otra página en todo), sinCors (/salud.json sin CORS).
 */
function servidor(puerto) {
  const s = { modo: 'juego', salud: 0 };
  const srv = http.createServer((req, res) => {
    if (req.url.startsWith('/salud.json')) s.salud++;
    if (s.modo === 'apagado') return req.socket.destroy();
    if (s.modo === 'otro') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<!doctype html><title>Dominio en venta</title><h1>Este dominio está en venta</h1>');
    }
    const ruta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[\\/]+/, '') || 'index.html';
    let archivo = join(DIST, ruta);
    if (!existsSync(archivo) || statSync(archivo).isDirectory()) archivo = join(DIST, 'index.html');
    const cabeceras = { 'Content-Type': TIPOS[extname(archivo)] ?? 'application/octet-stream', 'Content-Length': statSync(archivo).size };
    if (ruta.startsWith('assets/')) cabeceras['Cache-Control'] = 'public, max-age=31536000, immutable';
    if (/^(sw\.js|registerSW\.js|workbox-.*\.js|manifest\.webmanifest|sin-internet\.json)$/.test(ruta)) cabeceras['Cache-Control'] = 'public, max-age=0, must-revalidate';
    if (ruta === 'salud.json') {
      cabeceras['Cache-Control'] = 'no-store, max-age=0';
      if (s.modo !== 'sinCors') cabeceras['Access-Control-Allow-Origin'] = '*';
    }
    res.writeHead(200, cabeceras);
    createReadStream(archivo).pipe(res);
  });
  return { s, srv, listo: new Promise((ok) => srv.listen(puerto, '127.0.0.1', ok)) };
}

const sa = servidor(PUERTO_A);
const sb = servidor(PUERTO_B);
await Promise.all([sa.listo, sb.listo]);
// La salud del build: es la que sirve la definitiva.
const salud = JSON.parse(readFileSync(join(DIST, 'salud.json'), 'utf8'));

/** Un solo Chrome sin ventana a la vez (uno nuevo por caso). */
let navegador = null;
const resultados = [];
/** La última página abierta: si un caso falla, se guarda su captura. */
let ultimaPagina = null;
const errores = [];
let fallos = 0;

function comprobar(caso, cond, que) {
  resultados.push({ caso, ok: !!cond, que });
  if (!cond) fallos++;
  console.log(`${cond ? '  ✓' : '  ✗'} [${caso}] ${que}`);
}

function memoriaSuficiente() {
  const libre = freemem();
  if (libre < MEMORIA_MINIMA) {
    console.log(`Memoria libre: ${(libre / 1024 ** 3).toFixed(2)} GB (menos de 1.5 GB): me detengo.`);
    return false;
  }
  return true;
}

async function contexto(opciones = {}) {
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true, ...opciones });
  // Caso c1: la dirección nueva no puede guardar (IndexedDB rota) cuando llega una mudanza y hay la cookie.
  await ctx.addInitScript(() => {
    if (location.port === '4312' && location.hash.startsWith('#mudanza=') && document.cookie.includes('romper=1')) {
      Object.defineProperty(IDBFactory.prototype, 'open', {
        value() {
          throw new Error('sin almacenamiento (prueba)');
        },
      });
    }
  });
  const pagina = await ctx.newPage();
  ultimaPagina = pagina;
  pagina.setDefaultTimeout(30000);
  pagina.on('pageerror', (e) => errores.push(`${pagina.url().slice(0, 40)}: ${e.message}`));
  return { ctx, pagina };
}

/** Lee una clave del almacén del juego en la dirección de la página (ya cargada). */
const leer = (pagina, clave) =>
  pagina.evaluate(
    (k) =>
      new Promise((ok, mal) => {
        const r = indexedDB.open('mixtle-al-rescate');
        r.onsuccess = () => {
          const db = r.result;
          if (!db.objectStoreNames.contains('datos')) return ok(null);
          const q = db.transaction('datos', 'readonly').objectStore('datos').get(k);
          q.onsuccess = () => ok(q.result ?? null);
          q.onerror = () => mal(q.error);
        };
        r.onerror = () => mal(r.error);
      }),
    clave,
  );

const iguales = (a, b) => JSON.stringify([...(a ?? [])].sort((x, y) => x.id.localeCompare(y.id))) === JSON.stringify([...(b ?? [])].sort((x, y) => x.id.localeCompare(y.id)));

/** Espera a que el juego esté listo en la pantalla de inicio. */
async function enInicio(pagina) {
  await pagina.waitForSelector('[data-pantalla="inicio"][data-entrada-lista="true"]', { timeout: 30000 });
}

/** Siembra grupos en una dirección (con el paquete v1: se guardan sin aviso) y vuelve a abrirla limpia. */
async function sembrar(pagina, direccion, grupos) {
  await pagina.goto(`${direccion}/${fragmento(grupos)}`);
  await enInicio(pagina);
  await pagina.goto(`${direccion}/`);
  await enInicio(pagina);
}

/** Clave con la que el juego anota que la definitiva no respondió en esta sesión (pestaña). */
const CLAVE_SIN_RESPUESTA = 'mixtle-al-rescate:definitiva-sin-respuesta';
/** Olvida ese fallo en la dirección donde está la página (como abrir el juego otro día). */
const olvidarFallo = (pagina) => pagina.evaluate((k) => sessionStorage.removeItem(k), CLAVE_SIN_RESPUESTA);
/** Vuelve a abrir el juego como en una sesión nueva: la revisión en segundo plano se hace otra vez. */
async function otraSesion(pagina) {
  await olvidarFallo(pagina);
  await pagina.reload();
}

const ningunaMudanza = async (pagina) => (await pagina.locator('[data-mudanza]').count()) === 0;
const origen = (pagina) => {
  try {
    return new URL(pagina.url()).origin;
  } catch {
    return pagina.url();
  }
};

/** Toca con el ratón el centro del elemento (como un dedo), donde se ve en la pantalla. */
async function tocarEnPantalla(pagina, elemento) {
  const caja = await elemento.boundingBox();
  await pagina.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
}

async function aGrupos(pagina) {
  // Como scripts/demo/jugar.mjs: se toca cuando la pantalla terminó de entrar (antes no recibe toques).
  await enInicio(pagina);
  await pagina.waitForSelector('.transicion-marca', { state: 'detached' });
  await tocarEnPantalla(pagina, pagina.getByRole('button', { name: /¡Jugar!/ }).first());
  await pagina.waitForSelector('[data-pantalla="grupos"][data-entrada-lista="true"]');
  await pagina.waitForSelector('.transicion-marca', { state: 'detached' });
}

async function abrirRespaldo(pagina) {
  const titulo = pagina.locator('[data-titulo-grupos]');
  await titulo.scrollIntoViewIfNeeded();
  const caja = await titulo.boundingBox();
  await pagina.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  await pagina.mouse.down();
  await pagina.waitForTimeout(3300);
  await pagina.mouse.up();
  await pagina.waitForSelector('[data-respaldo]');
}

const G1 = grupoConCofre(); // Ardilla 2°B, con avance hasta el cofre
const G2 = grupoUnidadCompleta(); // Ajolote 1°A, unidad 1 completa, accesorios puestos
const GRUPOS = [G1, G2];

const casos = {
  async a() {
    sb.s.modo = 'apagado';
    const { ctx, pagina } = await contexto();
    await sembrar(pagina, A, GRUPOS);
    for (const modo of ['apagado', 'otro', 'sinCors']) {
      sb.s.modo = modo;
      const antes = sb.s.salud;
      await otraSesion(pagina);
      await enInicio(pagina);
      await pagina.waitForTimeout(5000);
      comprobar('a', (await ningunaMudanza(pagina)) && origen(pagina) === A && sb.s.salud === antes + 1, `definitiva ${modo}: preguntó una vez, no aparece ningún aviso y el juego sigue en la vieja`);
    }
    // Ya falló en esta sesión: al recargar (o al llegar una versión nueva) no vuelve a preguntar.
    sb.s.modo = 'juego';
    const antes = sb.s.salud;
    for (let i = 0; i < 2; i++) {
      await pagina.reload();
      await enInicio(pagina);
    }
    await pagina.waitForTimeout(5000);
    comprobar('a', sb.s.salud === antes && (await ningunaMudanza(pagina)), `después de fallar, dos recargas en la misma sesión no vuelven a preguntar (${sb.s.salud - antes} peticiones)`);
    comprobar('a', iguales(await leer(pagina, 'grupos'), GRUPOS), 'los grupos siguen intactos en la vieja');
    // Sin internet: no revisa; al volver la conexión, sí (y aparece el aviso).
    sb.s.modo = 'juego';
    // Como un aparato que ya usó el juego: el service worker ya guardó lo esencial y controla la página.
    await pagina.evaluate(() => navigator.serviceWorker.ready);
    sb.s.modo = 'apagado';
    await pagina.reload();
    await enInicio(pagina);
    await pagina.waitForFunction(() => !!navigator.serviceWorker.controller);
    sb.s.modo = 'juego';
    await ctx.setOffline(true);
    await pagina.reload();
    await enInicio(pagina);
    await pagina.waitForTimeout(4000);
    comprobar('a', await ningunaMudanza(pagina), 'sin internet: no pasa nada (aunque la definitiva ya sirva el juego)');
    await ctx.setOffline(false);
    await pagina.evaluate(() => window.dispatchEvent(new Event('online')));
    const aviso = await pagina.waitForSelector('[data-mudanza="aviso"]', { timeout: 15000 }).then(() => true, () => false);
    comprobar('a', aviso, 'al volver la conexión revisa otra vez y aparece el aviso');
    await ctx.close();
  },

  async b() {
    sb.s.modo = 'apagado';
    const { ctx, pagina } = await contexto();
    await sembrar(pagina, A, GRUPOS);
    sb.s.modo = 'juego';
    await otraSesion(pagina);
    await pagina.waitForSelector('[data-mudanza="aviso"]', { timeout: 20000 });
    const texto = await pagina.locator('[data-mudanza="aviso"]').innerText();
    comprobar('b', texto.includes(`El juego se cambió a ${new URL(B).host}`) && texto.includes('Ardilla 2°B') && texto.includes('Ajolote 1°A'), 'el aviso dice a dónde se cambió el juego y qué grupos se llevan');
    await pagina.screenshot({ path: `${SALIDA}/b-aviso.png` });
    await pagina.getByRole('button', { name: 'Llevar los grupos' }).click({ force: true });
    await pagina.waitForSelector('[data-mudanza="llegaron"]', { timeout: 30000 });
    comprobar('b', origen(pagina) === B, 'al terminar, el juego está abierto en la definitiva');
    comprobar('b', (await pagina.getAttribute('[data-mudanza="llegaron"]', 'data-cuantos')) === '2', 'la bienvenida dice que llegaron 2 grupos');
    await pagina.screenshot({ path: `${SALIDA}/b-bienvenida.png` });
    comprobar('b', iguales(await leer(pagina, 'grupos'), GRUPOS), 'los 2 grupos llegaron completos (avance, hojitas, estampas, accesorios)');
    comprobar('b', !new URL(pagina.url()).hash, 'la dirección quedó limpia (sin el paquete en la URL)');
    const aJugar = pagina.getByRole('dialog').getByRole('button', { name: '¡A jugar!', exact: true });
    await tocarEnPantalla(pagina, aJugar);
    await pagina.waitForSelector('[data-mudanza]', { state: 'detached', timeout: 10000 });
    comprobar('b', true, '"¡A jugar!" cierra la bienvenida');
    await aGrupos(pagina);
    comprobar('b', (await pagina.locator('[data-grupo]').count()) === 2, 'en "¿Quién va a jugar?" de la definitiva están los 2 grupos');
    // La vieja: sin grupos (quedaron en el respaldo), sin mudanza pendiente, con aviso de a dónde se fueron.
    sb.s.modo = 'apagado';
    await pagina.goto(`${A}/`);
    await enInicio(pagina);
    comprobar('b', ((await leer(pagina, 'grupos')) ?? []).length === 0, 'la vieja ya no tiene grupos en su lista');
    comprobar('b', iguales((await leer(pagina, 'grupos-mudados'))?.grupos, GRUPOS), 'la vieja guarda un respaldo de los grupos que se mudaron');
    comprobar('b', (await leer(pagina, 'mudanza-pendiente')) === null, 'la vieja no tiene mudanza pendiente');
    await aGrupos(pagina);
    const yaMudados = await pagina.waitForSelector('[data-ya-mudados]', { timeout: 10000 }).then(() => true, () => false);
    comprobar('b', yaMudados, 'la vieja avisa en "¿Quién va a jugar?" que los grupos se cambiaron (con botón para ir)');
    // Exportar en la vieja incluye los que se mudaron.
    await abrirRespaldo(pagina);
    const [descarga] = await Promise.all([pagina.waitForEvent('download'), pagina.getByRole('button', { name: 'Exportar grupos' }).click({ force: true })]);
    const archivo = JSON.parse(readFileSync(await descarga.path(), 'utf8'));
    comprobar('b', iguales(archivo.grupos, GRUPOS), 'exportar en la vieja después de mudarse incluye los grupos que se mudaron');
    // Con la definitiva disponible, la vieja sin grupos manda directo (sin aviso).
    sb.s.modo = 'juego';
    await olvidarFallo(pagina); // otro día
    await pagina.goto(`${A}/`);
    await pagina.waitForURL((u) => u.origin === B, { timeout: 20000 });
    await enInicio(pagina);
    comprobar('b', origen(pagina) === B, 'la vieja sin grupos abre directo la definitiva');
    await ctx.close();
  },

  async c1() {
    sb.s.modo = 'apagado';
    const { ctx, pagina } = await contexto();
    await sembrar(pagina, A, GRUPOS);
    await ctx.addCookies([{ name: 'romper', value: '1', url: B }]);
    sb.s.modo = 'juego';
    await otraSesion(pagina);
    await pagina.waitForSelector('[data-mudanza="aviso"]', { timeout: 20000 });
    await pagina.getByRole('button', { name: 'Llevar los grupos' }).click({ force: true });
    const fallo = await pagina.waitForSelector('[data-mudanza="fallo"]', { timeout: 30000 }).then(() => true, () => false);
    comprobar('c', fallo && origen(pagina) === A, 'la nueva no pudo guardar: regresa a la vieja con "No se pudieron llevar los grupos"');
    await pagina.screenshot({ path: `${SALIDA}/c-fallo.png` });
    comprobar('c', iguales(await leer(pagina, 'grupos'), GRUPOS), 'la vieja conserva todos sus grupos');
    await ctx.clearCookies();
    await pagina.getByRole('button', { name: 'Intentar otra vez' }).click({ force: true });
    await pagina.waitForSelector('[data-mudanza="llegaron"]', { timeout: 30000 });
    comprobar('c', origen(pagina) === B && iguales(await leer(pagina, 'grupos'), GRUPOS), 'al reintentar, los grupos se mudan completos');
    await ctx.close();
  },

  async c2() {
    sb.s.modo = 'apagado';
    const { ctx, pagina } = await contexto();
    await sembrar(pagina, A, GRUPOS);
    sb.s.modo = 'juego';
    await otraSesion(pagina);
    await pagina.waitForSelector('[data-mudanza="aviso"]', { timeout: 20000 });
    sb.s.modo = 'apagado'; // la nueva se cae justo antes de llevar los grupos
    await pagina.getByRole('button', { name: 'Llevar los grupos' }).click({ force: true });
    await pagina.waitForTimeout(3000);
    await pagina.goto(`${A}/`);
    await enInicio(pagina);
    comprobar('c', iguales(await leer(pagina, 'grupos'), GRUPOS), 'la nueva se cayó a la mitad: la vieja conserva todos sus grupos');
    await pagina.waitForTimeout(4000);
    comprobar('c', await ningunaMudanza(pagina), 'mientras la nueva sigue caída, el juego sigue normal en la vieja');
    sb.s.modo = 'juego';
    await otraSesion(pagina);
    await pagina.waitForSelector('[data-mudanza="aviso"]', { timeout: 20000 });
    // Esta vez nadie toca: la cuenta regresiva lo lleva sola.
    await pagina.waitForSelector('[data-mudanza="llegaron"]', { timeout: 40000 });
    comprobar('c', origen(pagina) === B && iguales(await leer(pagina, 'grupos'), GRUPOS), 'cuando la nueva vuelve, la mudanza se hace sola (cuenta regresiva) y llegan completos');
    await ctx.close();
  },

  async c3() {
    // Sin service worker: así la vieja "caída" de verdad no responde (con él, la abriría de su copia).
    sb.s.modo = 'apagado';
    const { ctx, pagina } = await contexto({ serviceWorkers: 'block' });
    await sembrar(pagina, A, GRUPOS);
    sb.s.modo = 'juego';
    await otraSesion(pagina);
    await pagina.waitForSelector('[data-mudanza="aviso"]', { timeout: 20000 });
    sa.s.modo = 'apagado'; // la vuelta a la vieja (la confirmación) no va a llegar
    await pagina.getByRole('button', { name: 'Llevar los grupos' }).click({ force: true });
    await pagina.waitForURL((u) => u.startsWith(`${A}/#paso=recibida`) || u.startsWith('chrome-error'), { timeout: 30000 }).catch(() => {});
    await pagina.waitForTimeout(2000);
    sa.s.modo = 'juego';
    await pagina.goto(`${B}/`);
    await enInicio(pagina);
    comprobar('c', iguales(await leer(pagina, 'grupos'), GRUPOS), 'la nueva guardó los grupos aunque la confirmación no llegó');
    sb.s.modo = 'apagado'; // para ver la vieja tal como quedó, sin que se mude otra vez todavía
    await pagina.goto(`${A}/`);
    await enInicio(pagina);
    comprobar('c', iguales(await leer(pagina, 'grupos'), GRUPOS), 'sin la confirmación, la vieja no borró nada');
    comprobar('c', (await leer(pagina, 'mudanza-pendiente')) !== null, 'la vieja recuerda la mudanza pendiente');
    sb.s.modo = 'juego';
    await otraSesion(pagina);
    await pagina.waitForSelector('[data-mudanza="aviso"]', { timeout: 20000 });
    await pagina.getByRole('button', { name: 'Llevar los grupos' }).click({ force: true });
    await pagina.waitForSelector('[data-mudanza="llegaron"]', { timeout: 30000 });
    const enB = await leer(pagina, 'grupos');
    comprobar('c', iguales(enB, GRUPOS), 'al reintentar, en la nueva quedan los mismos 2 grupos (sin duplicados)');
    comprobar('c', (await pagina.locator('[data-mudanza-renombrados]').count()) === 0, 'y sin nombres cambiados (es el mismo grupo, no otro)');
    await pagina.goto(`${A}/`).catch(() => {});
    await pagina.waitForURL((u) => u.origin === B, { timeout: 20000 });
    comprobar('c', true, 'después, la vieja ya no tiene grupos y manda directo a la nueva');
    await ctx.close();
  },

  async d() {
    const { ctx, pagina } = await contexto();
    const deB = nuevoGrupo({ mascota: 'ardilla', color: '#C0392B', etiqueta: '2°B' }, 'grupo-de-b', 0);
    await sembrar(pagina, B, [deB]); // la definitiva ya tenía un grupo "Ardilla 2°B" (otro grupo)
    sb.s.modo = 'apagado';
    await sembrar(pagina, A, GRUPOS);
    sb.s.modo = 'juego';
    await otraSesion(pagina);
    await pagina.waitForSelector('[data-mudanza="aviso"]', { timeout: 20000 });
    await pagina.getByRole('button', { name: 'Llevar los grupos' }).click({ force: true });
    await pagina.waitForSelector('[data-mudanza="llegaron"]', { timeout: 30000 });
    const renombrados = await pagina.locator('[data-mudanza-renombrados]').innerText().catch(() => '');
    comprobar('d', renombrados.includes('Ardilla 2°B (2)'), `la bienvenida avisa del nombre repetido: "${renombrados.trim()}"`);
    await pagina.screenshot({ path: `${SALIDA}/d-repetido.png` });
    const enB = (await leer(pagina, 'grupos')) ?? [];
    const original = enB.find((g) => g.id === 'grupo-de-b');
    const llegado = enB.find((g) => g.id === G1.id);
    comprobar('d', enB.length === 3 && iguales([original], [deB]), 'el grupo que ya estaba en la nueva sigue igual (no se sobrescribió)');
    comprobar('d', llegado?.etiqueta === '2°B (2)' && JSON.stringify(llegado.progreso) === JSON.stringify(G1.progreso), 'el que llegó se conserva con todo su avance y se llama "Ardilla 2°B (2)"');
    await ctx.close();
  },

  async e() {
    sb.s.modo = 'apagado';
    let { ctx, pagina } = await contexto();
    await sembrar(pagina, A, GRUPOS);
    await aGrupos(pagina);
    await ctx.setOffline(true);
    await abrirRespaldo(pagina);
    await pagina.screenshot({ path: `${SALIDA}/e-respaldo.png` });
    const [descarga] = await Promise.all([pagina.waitForEvent('download'), pagina.getByRole('button', { name: 'Exportar grupos' }).click({ force: true })]);
    const ruta = `${SALIDA}/${descarga.suggestedFilename()}`;
    await descarga.saveAs(ruta);
    const archivo = JSON.parse(readFileSync(ruta, 'utf8'));
    comprobar('e', /^mixtle-grupos-\d{4}-\d{2}-\d{2}\.json$/.test(descarga.suggestedFilename()) && archivo.app === 'mixtle-al-rescate' && iguales(archivo.grupos, GRUPOS), `sin internet, "Exportar grupos" descarga ${descarga.suggestedFilename()} con los 2 grupos completos`);
    await ctx.close();

    // Otro aparato, en la definitiva.
    sb.s.modo = 'juego';
    ({ ctx, pagina } = await contexto());
    await pagina.goto(`${B}/`);
    await enInicio(pagina);
    await aGrupos(pagina);
    await ctx.setOffline(true);
    await abrirRespaldo(pagina);
    const entrada = pagina.locator('[data-respaldo-archivo]');
    const mensaje = () => pagina.locator('[data-respaldo-mensaje]').innerText();
    await entrada.setInputFiles({ name: 'foto.json', mimeType: 'application/json', buffer: Buffer.from('{"hola": 1}') });
    await pagina.waitForSelector('[data-respaldo-mensaje]');
    comprobar('e', (await mensaje()).includes('no es un respaldo'), 'un archivo que no es respaldo se rechaza');
    const alterado = { ...archivo, grupos: archivo.grupos.map((g, i) => (i ? g : { ...g, progreso: { ...g.progreso, hojitas: 9999 } })) };
    await entrada.setInputFiles({ name: 'alterado.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(alterado)) });
    await pagina.waitForFunction(() => document.querySelector('[data-respaldo-mensaje]')?.textContent?.includes('no es un respaldo'));
    comprobar('e', (await pagina.locator('[data-respaldo-confirmar]').count()) === 0 && ((await leer(pagina, 'grupos')) ?? []).length === 0, 'un respaldo alterado (firma que no cuadra) se rechaza y no cambia nada');
    await entrada.setInputFiles(ruta);
    await pagina.waitForSelector('[data-respaldo-confirmar]');
    const vistaPrevia = await pagina.locator('[data-respaldo-confirmar]').innerText();
    comprobar('e', vistaPrevia.includes('Ardilla 2°B') && vistaPrevia.includes('Ajolote 1°A'), 'antes de importar, enseña qué grupos se van a agregar');
    await pagina.getByRole('button', { name: 'Agregarlos' }).click({ force: true });
    await pagina.waitForFunction(() => document.querySelector('[data-respaldo-mensaje]')?.textContent?.includes('Listo'));
    comprobar('e', iguales(await leer(pagina, 'grupos'), GRUPOS), 'sin internet, "Importar grupos" agrega los 2 grupos completos en otro aparato');
    await entrada.setInputFiles(ruta);
    await pagina.waitForSelector('[data-respaldo-confirmar]');
    await pagina.getByRole('button', { name: 'Agregarlos' }).click({ force: true });
    await pagina.waitForFunction(() => document.querySelector('[data-respaldo-mensaje]')?.textContent?.includes('avance más grande'));
    const segunda = await mensaje();
    comprobar('e', iguales(await leer(pagina, 'grupos'), GRUPOS) && segunda.includes('2 grupos ya estaban') && !segunda.includes('se agregaron'), `importar otra vez el mismo archivo no duplica grupos y lo dice: "${segunda.trim()}"`);
    await pagina.screenshot({ path: `${SALIDA}/e-importado.png` });
    await pagina.getByRole('button', { name: 'Cerrar' }).first().click({ force: true }).catch(() => {});
    comprobar('e', (await pagina.locator('[data-grupo]').count()) === 2, 'los grupos importados aparecen en "¿Quién va a jugar?"');
    await ctx.close();
  },
};

const pedidos = process.argv.filter((a) => /^--caso=/.test(a)).map((a) => a.slice(7));
for (const [nombre, caso] of Object.entries(casos)) {
  if (pedidos.length && !pedidos.includes(nombre)) continue;
  if (!memoriaSuficiente()) {
    fallos++;
    break;
  }
  console.log(`Caso ${nombre}`);
  sa.s.modo = 'juego';
  sb.s.modo = 'juego';
  // Un Chrome nuevo por caso: el mismo navegador va juntando memoria de un caso a otro (laptop de 8 GB).
  navegador = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    await caso();
  } catch (e) {
    comprobar(nombre, false, `error: ${e.message.split('\n')[0]}`);
    await ultimaPagina?.screenshot({ path: `${SALIDA}/${nombre}-error.png` }).catch(() => {});
    console.log(`    (en ${ultimaPagina?.url().slice(0, 60)}; captura en ${SALIDA}/${nombre}-error.png)`);
  } finally {
    await navegador.close();
  }
}

sa.srv.close();
sb.srv.close();
comprobar('salud', salud.app === 'mixtle-al-rescate' && salud.mudanza === 2, `/salud.json del build: ${JSON.stringify(salud)}`);
if (errores.length) console.log('Errores de página:', errores.slice(0, 10));
writeFileSync(`${SALIDA}/resultado.json`, JSON.stringify({ fecha: new Date().toISOString(), resultados, errores }, null, 2));
console.log(fallos ? `✗ ${fallos} comprobaciones fallaron` : `✓ ${resultados.length} comprobaciones pasaron`);
process.exit(fallos ? 1 : 0);
