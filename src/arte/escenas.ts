import { CAJA_COLGADO, mixtleColgadoCompleto, mixtleCompleto } from './personajes';
import { arte, type ArteSvg } from './svg';

/*
 * Arte que solo usa React (no se rasteriza en Phaser, para no gastar memoria en las aventuras):
 * las capas del inicio en paralaje y a Mixtle colgado de la rama. Estilo de la dirección A, con
 * profundidad: degradados, luz desde arriba a la derecha (el sol), sombras suaves y perspectiva
 * aérea (lo lejano, más azul y más claro).
 */

const ANCHO = 1920;
const ALTO = 1080;

/** Nube con sombra en la base: círculos que se juntan. */
function nube(x: number, y: number, e: number): string {
  return `<g transform="translate(${x} ${y}) scale(${e})">
    <ellipse cx="0" cy="34" rx="150" ry="26" fill="#D6EAF5"/>
    <circle cx="-80" cy="14" r="46" fill="#fff"/><circle cx="-18" cy="-14" r="66" fill="#fff"/><circle cx="56" cy="2" r="54" fill="#fff"/><circle cx="110" cy="22" r="34" fill="#fff"/>
    <path d="M-120 40 Q 0 58 140 40" fill="none" stroke="#C4DDEC" stroke-width="10" stroke-linecap="round" opacity=".6"/>
  </g>`;
}

const CIELO = `<defs>
    <linearGradient id="ic-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86CBEF"/><stop offset=".55" stop-color="#C8E9F8"/><stop offset="1" stop-color="#F4FAEE"/></linearGradient>
    <radialGradient id="ic-halo"><stop offset="0" stop-color="#FFF6CF"/><stop offset=".45" stop-color="#FFF6CF" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6CF" stop-opacity="0"/></radialGradient>
    <radialGradient id="ic-sol" cx="40%" cy="38%"><stop offset="0" stop-color="#FFF2B0"/><stop offset="1" stop-color="#FFD64A"/></radialGradient>
  </defs>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#ic-cielo)"/>
  <g opacity=".18" fill="#FFF8DC">${Array.from({ length: 12 }, (_, i) => `<path d="M1610 200 L ${1610 + 520 * Math.cos((i * Math.PI) / 6)} ${200 + 520 * Math.sin((i * Math.PI) / 6)} L ${1610 + 520 * Math.cos((i * Math.PI) / 6 + 0.12)} ${200 + 520 * Math.sin((i * Math.PI) / 6 + 0.12)} Z"/>`).join('')}</g>
  <circle cx="1610" cy="200" r="300" fill="url(#ic-halo)"/>
  <circle cx="1610" cy="200" r="92" fill="url(#ic-sol)"/>
  <circle cx="1586" cy="176" r="30" fill="#fff" opacity=".35"/>`;

const NUBES = `${nube(360, 170, 1)}${nube(980, 120, 0.7)}${nube(1320, 300, 0.55)}${nube(1880, 110, 0.85)}${nube(-120, 330, 0.6)}`;

/** El Nevado de Toluca (Xinantécatl): ancho, con el Pico del Fraile a la izquierda y la cumbre nevada. */
const NEVADO = `<defs>
    <linearGradient id="ic-volcan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EA7C1"/><stop offset="1" stop-color="#BFD2DF"/></linearGradient>
    <linearGradient id="ic-nieve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#E2ECF5"/></linearGradient>
    <linearGradient id="ic-lejos" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B4CFD0"/><stop offset="1" stop-color="#CFE3D6"/></linearGradient>
  </defs>
  <path d="M0 690 C 220 640 420 650 640 668 C 860 690 1100 700 1400 690 C 1640 682 1800 670 1920 676 L 1920 800 L 0 800 Z" fill="url(#ic-lejos)" opacity=".8"/>
  <path d="M360 800 C 600 760 900 640 1120 500 L 1196 462 L 1232 440 L 1262 462 L 1300 452 L 1334 470 L 1376 448 L 1408 466 C 1500 520 1660 610 1920 690 L 1920 800 L 360 800 Z" fill="url(#ic-volcan)"/>
  <path d="M1232 440 L 1196 462 L 1120 500 C 900 640 600 760 360 800 L 1060 800 C 1110 680 1190 560 1232 440 Z" fill="#6F88A3" opacity=".22"/>
  <path d="M1150 486 L 1196 462 L 1232 440 L 1262 462 L 1300 452 L 1334 470 L 1376 448 L 1408 466 L 1446 490 L 1420 498 L 1398 486 L 1380 506 L 1356 490 L 1330 512 L 1306 492 L 1282 514 L 1258 494 L 1232 518 L 1210 496 L 1186 512 Z" fill="url(#ic-nieve)"/>
  <path d="M1232 440 L 1222 470 M1376 448 L 1384 478" stroke="#C9D8E6" stroke-width="5" stroke-linecap="round"/>
  <path d="M640 760 C 900 720 1200 730 1500 740 C 1700 746 1820 740 1920 730 L 1920 800 L 640 800 Z" fill="#CFE3D6" opacity=".7"/>`;

/** Lomas del medio con árboles lejanos. */
const LOMAS = `<defs>
    <linearGradient id="ic-loma1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ABDA8D"/><stop offset="1" stop-color="#93CB76"/></linearGradient>
    <linearGradient id="ic-loma2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AD27E"/><stop offset="1" stop-color="#84C26A"/></linearGradient>
  </defs>
  <path d="M0 760 C 300 700 620 720 900 760 C 1180 800 1500 720 1920 740 L 1920 1080 L 0 1080 Z" fill="url(#ic-loma1)"/>
  ${[1020, 1080, 1130, 1560, 1610, 1680, 1760].map((x, i) => `<g><circle cx="${x}" cy="${746 - (i % 3) * 6}" r="${30 + (i % 2) * 10}" fill="#5F9F63"/><circle cx="${x - 10}" cy="${736 - (i % 3) * 6}" r="${14 + (i % 2) * 5}" fill="#7DB97A"/></g>`).join('')}
  <path d="M0 830 C 420 780 760 800 1100 840 C 1400 874 1680 820 1920 820 L 1920 1080 L 0 1080 Z" fill="url(#ic-loma2)"/>`;

/** El árbol grande de la izquierda, con la rama casi horizontal de la que cuelga Mixtle (manos en y≈316). */
const ARBOL = `<defs>
    <linearGradient id="ic-tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6B4329"/><stop offset=".45" stop-color="#8E5E3C"/><stop offset="1" stop-color="#5E3A24"/></linearGradient>
    <radialGradient id="ic-copa" cx="62%" cy="30%" r="75%"><stop offset="0" stop-color="#6CC777"/><stop offset=".6" stop-color="#3E9A55"/><stop offset="1" stop-color="#2C7A45"/></radialGradient>
  </defs>
  <ellipse cx="250" cy="1010" rx="230" ry="34" fill="#2C5E2E" opacity=".25"/>
  <path d="M170 1060 C 200 900 196 640 214 420 L 300 420 C 312 640 320 880 360 1060 Z" fill="url(#ic-tronco)"/>
  <path d="M236 980 q 8 -120 0 -220 M300 1000 q 10 -150 2 -280" stroke="#4E2F1C" stroke-width="7" fill="none" stroke-linecap="round" opacity=".45"/>
  <path d="M290 470 C 380 380 470 330 620 318 L 850 307 L 852 335 L 620 346 C 480 358 400 410 300 520 Z" fill="url(#ic-tronco)"/>
  <path d="M300 482 C 390 400 480 340 620 326 L 842 315" stroke="#B88660" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
  <g fill="url(#ic-copa)">
    <circle cx="250" cy="250" r="200"/><circle cx="90" cy="320" r="130"/><circle cx="400" cy="320" r="140"/><circle cx="170" cy="120" r="130"/><circle cx="350" cy="140" r="120"/><circle cx="250" cy="430" r="110"/>
  </g>
  <g fill="#7FD089" opacity=".55"><circle cx="330" cy="110" r="44"/><circle cx="420" cy="260" r="40"/><circle cx="210" cy="70" r="34"/></g>
  <g fill="#2C7A45" opacity=".5"><circle cx="110" cy="410" r="50"/><circle cx="250" cy="500" r="46"/></g>
  <g fill="url(#ic-copa)"><circle cx="872" cy="300" r="40"/><circle cx="838" cy="282" r="28"/><circle cx="902" cy="284" r="26"/></g>
  <g fill="#7FD089" opacity=".55"><circle cx="880" cy="274" r="13"/></g>`;

/** Frente: pasto, el sendero, arbustos y flores (la capa que más se mueve). */
const FRENTE = `<defs>
    <linearGradient id="ic-pasto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DD67F"/><stop offset="1" stop-color="#76BB5C"/></linearGradient>
    <linearGradient id="ic-sendero" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0DFB4"/><stop offset="1" stop-color="#E3C98F"/></linearGradient>
    <radialGradient id="ic-arbusto" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#6CC777"/><stop offset="1" stop-color="#2F8A4A"/></radialGradient>
  </defs>
  <path d="M0 900 C 360 860 760 880 1120 910 C 1460 940 1700 900 1920 880 L 1920 1080 L 0 1080 Z" fill="url(#ic-pasto)"/>
  <path d="M900 1080 C 980 1010 1180 960 1460 930 C 1640 912 1800 906 1920 904 L 1920 940 C 1760 946 1580 960 1420 990 C 1260 1020 1140 1050 1110 1080 Z" fill="url(#ic-sendero)"/>
  <path d="M1110 1080 C 1140 1050 1260 1020 1420 990" fill="none" stroke="#CDB078" stroke-width="6" stroke-linecap="round" opacity=".6"/>
  <g fill="url(#ic-arbusto)"><circle cx="520" cy="1000" r="70"/><circle cx="600" cy="980" r="80"/><circle cx="690" cy="1010" r="60"/><circle cx="1790" cy="990" r="70"/><circle cx="1870" cy="1000" r="64"/></g>
  <g fill="#8ED990" opacity=".5"><circle cx="590" cy="940" r="24"/><circle cx="1780" cy="950" r="20"/></g>
  ${[
    [440, 1040, '#F28C28'], [760, 1050, '#E84A7F'], [820, 1030, '#FFD23F'], [1640, 1050, '#9B6BD6'], [1700, 1030, '#F28C28'], [380, 1060, '#FFD23F'],
  ]
    .map(([x, y, c]) => `<g><path d="M${x} ${Number(y) + 30} V ${y}" stroke="#3E8E4A" stroke-width="5"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${Number(x) + 11 * Math.cos((Number(a) * Math.PI) / 180)}" cy="${Number(y) + 11 * Math.sin((Number(a) * Math.PI) / 180)}" r="8" fill="${c}"/>`).join('')}<circle cx="${x}" cy="${y}" r="6" fill="#FFF3B0"/></g>`)
    .join('')}
  ${[120, 300, 980, 1260, 1520].map((x) => `<path d="M${x} 1060 l 8 -26 l 6 22 l 8 -30 l 6 34" fill="none" stroke="#5DA64E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}`;

/** Mixtle colgado de la rama (con la cola colgando): las manos en y≈34 de su caja de 360×600. */
export const MANOS_COLGADO = { x: 180 / CAJA_COLGADO.ancho, y: 34 / CAJA_COLGADO.alto } as const;
export { CAJA_COLGADO };

export const ARTE_ESCENAS: ArteSvg[] = [
  arte('inicio-cielo', ANCHO, ALTO, CIELO),
  arte('inicio-nubes', ANCHO, ALTO, NUBES),
  arte('inicio-nevado', ANCHO, ALTO, NEVADO),
  arte('inicio-lomas', ANCHO, ALTO, LOMAS),
  arte('inicio-arbol', ANCHO, ALTO, ARBOL),
  arte('inicio-frente', ANCHO, ALTO, FRENTE),
  arte('mixtle-colgado', CAJA_COLGADO.ancho, CAJA_COLGADO.alto, mixtleColgadoCompleto(), 1.3),
  // Mixtle entero sin el pin: MascotaVestida se lo pone encima, por arriba de los accesorios del cuello.
  arte('mixtle-entero-sin-pin', 472, 440, mixtleCompleto('normal', '', null), 1.3),
];
