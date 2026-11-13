import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { archivosEsenciales, listaSinInternet } from './scripts/lista-sin-internet.mjs';
import { APP_ID, DIRECCION_DEFINITIVA, PROTOCOLO_MUDANZA } from './src/sitio';
import { defineConfig, type Plugin } from 'vitest/config';

/**
 * Pone el logo (SVG con letras en trazos) en la pantalla de carga de index.html: se ve antes que el código.
 * Usa public/marca/logo.svg, que genera npm run marca:generar (una prueba revisa que esté al día).
 */
function logoDeCarga(): Plugin {
  return {
    name: 'mixtle-logo-de-carga',
    transformIndexHtml: (html) => {
      const logo = readFileSync(new URL('./public/marca/logo.svg', import.meta.url), 'utf8').trim();
      // La marca de Eco Urban (solo el logotipo, en la esquina): reutiliza con <use> las piezas del logotipo del pin del logo.
      const marca = readFileSync(new URL('./public/marca/marca-carga.svg', import.meta.url), 'utf8').trim();
      return html
        .replace('<!--logo-carga-->', logo.replace('<svg ', '<svg class="pantalla-carga-logo" aria-hidden="true" '))
        .replace('<!--marca-carga-->', `<div class="pantalla-carga-marca" role="img" aria-label="Eco Urban">${marca.replace('<svg ', '<svg aria-hidden="true" ')}</div>`);
    },
  };
}

const VERSION = (JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }).version;

/** /salud.json: así una dirección vieja sabe que la dirección definitiva ya sirve ESTE juego (src/sitio.ts). */
const SALUD = JSON.stringify({ app: APP_ID, version: VERSION, mudanza: PROTOCOLO_MUDANZA });

/**
 * La dirección del juego en un solo lugar (src/sitio.ts): la url canónica y los metadatos para compartir en
 * index.html, y /salud.json (al construir, y en el servidor de desarrollo).
 */
function sitio(): Plugin {
  return {
    name: 'mixtle-sitio',
    transformIndexHtml: (html) =>
      html.replace(
        '<!--sitio-->',
        [
          `<link rel="canonical" href="${DIRECCION_DEFINITIVA}/" />`,
          `<meta property="og:type" content="website" />`,
          `<meta property="og:url" content="${DIRECCION_DEFINITIVA}/" />`,
          `<meta property="og:title" content="Mixtle al rescate" />`,
          `<meta property="og:locale" content="es_MX" />`,
        ].join('\n    '),
      ),
    configureServer(servidor) {
      servidor.middlewares.use('/salud.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(SALUD);
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'salud.json', source: SALUD });
    },
  };
}

/** Lo esencial que guarda el service worker al instalarse (lo llena el plugin de abajo al construir). */
const esenciales = new Set<string>();

/**
 * Al construir: decide qué es esencial (va en el precache del service worker, que así se activa en
 * segundos) y arma dist/sin-internet.json con todo lo demás, que se baja después en segundo plano
 * (ver scripts/lista-sin-internet.mjs y src/servicios/sinInternet.ts).
 */
function listaParaSinInternet(): Plugin {
  return {
    name: 'mixtle-lista-sin-internet',
    apply: 'build',
    generateBundle(_, paquete) {
      esenciales.clear();
      for (const e of archivosEsenciales(paquete)) esenciales.add(e);
      const codigo = Object.values(paquete)
        .filter((p) => !esenciales.has(p.fileName) && /\.(js|css|svg|png|woff2)$/.test(p.fileName))
        .map((p) => ({ ruta: p.fileName, contenido: p.type === 'chunk' ? p.code : p.source }));
      const lista = listaSinInternet(fileURLToPath(new URL('./public', import.meta.url)), codigo);
      this.emitFile({ type: 'asset', fileName: 'sin-internet.json', source: JSON.stringify(lista) });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    logoDeCarga(),
    sitio(),
    listaParaSinInternet(),
    VitePWA({
      // El juego se guarda en el dispositivo tras la primera visita y funciona sin internet. El service
      // worker se registra cuando la primera pantalla ya está lista (src/servicios/arranque.ts), no al cargar.
      registerType: 'autoUpdate',
      injectRegister: false,
      // Los íconos y la marca no van en el precache (cada archivo ahí es una ida y vuelta más antes de
      // activarse): los baja la descarga para jugar sin internet.
      includeAssets: [],
      includeManifestIcons: false,
      manifest: {
        name: 'Mixtle al rescate',
        short_name: 'Mixtle',
        description: 'Guardianes del parque: aprende a cuidar el parque, a sus animales y a separar la basura con Mixtle el cacomixtle.',
        lang: 'es-MX',
        start_url: './',
        scope: './',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#D3EEF9',
        theme_color: '#1F6B4A',
        icons: [
          { src: 'iconos/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'iconos/icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'iconos/icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Una versión nueva toma el control sola: se activa sin esperar a que se cierren todas las
        // pestañas (skipWaiting) y controla las pestañas abiertas (clientsClaim); entonces el juego se
        // recarga al volver al inicio (src/servicios/actualizacion.ts). El plugin solo pone estas dos
        // banderas con injectRegister "auto", que aquí no se usa: sin ellas, la versión nueva se quedaba
        // "esperando" y la laptop seguía con la vieja hasta cerrar todas las pestañas.
        skipWaiting: true,
        clientsClaim: true,
        // Al instalarse, el service worker guarda solo lo esencial para arrancar: index.html, el código
        // del inicio, Grupos y Camino, el CSS y las fuentes (ver archivosEsenciales). Workbox guarda un
        // archivo a la vez y cada uno cuesta una ida y vuelta; antes eran 862 (con todo el audio) y con
        // Slow 4G tardaba ~18 min en bajarlos. Lo demás (el resto del código, las imágenes y el audio)
        // lo baja src/servicios/sinInternet.ts en segundo plano a la caché "mixtle-sin-internet".
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        manifestTransforms: [
          (entradas) => ({ manifest: esenciales.size ? entradas.filter((e) => esenciales.has(e.url)) : entradas, warnings: [] }),
        ],
        runtimeCaching: [
          // La lista de audios va aparte: primero la de internet (siempre la más nueva) y, sin conexión,
          // la última guardada. Así una versión vieja en caché nunca deja a Mixtle con la lista vieja.
          {
            urlPattern: /\/voz\/manifiesto\.json$/,
            handler: 'NetworkFirst',
            options: { cacheName: 'mixtle-voz-manifiesto', networkTimeoutSeconds: 4 },
          },
          {
            // Lo bajado para jugar sin internet se sirve de ahí; si aún no está, de la red.
            // rangeRequests: la música suena en streaming y el navegador la pide por partes.
            // [^/?]+$: la descarga pide con ?rev=… y así pasa directo a la red (nunca toma una copia vieja).
            urlPattern: /\/(assets|iconos|marca|voz|musica|sonidos)\/[^/?]+$/,
            handler: 'CacheFirst',
            options: { cacheName: 'mixtle-sin-internet', rangeRequests: true, cacheableResponse: { statuses: [200] } },
          },
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) return 'phaser';
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/preparar.ts'],
  },
});
