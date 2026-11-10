import { arte, type ArteSvg } from './svg';

/*
 * Las tres etapas de un árbol: brote → arbolito → árbol grande.
 *
 * Se dibujan UNA sola vez, en las mismas unidades y con el origen en el suelo (0, 0; hacia arriba es
 * negativo), para que su tamaño relativo sea verdad: el arbolito mide más o menos la mitad del árbol
 * grande y el brote, menos de la mitad del arbolito. De ese dibujo salen dos versiones de cada etapa:
 *
 *  - Sola ("brote", "arbolito", "arbol"): agrandada para llenar su propio cuadro. Es la que se usa
 *    cuando el dibujo aparece solo (una tarjeta, una escena, el camino).
 *  - En escala ("etapa-brote", "etapa-arbolito", "etapa-arbol"): las tres en el MISMO lienzo, con la
 *    misma escala y la misma línea de suelo. Es la que se usa cuando se comparan ("Toca el árbol
 *    grande", "Ordena cómo crece un árbol"): así la tarjeta no agranda cada dibujo hasta llenarse y
 *    el más alto en pantalla es de verdad el árbol grande. El motor de ejercicios la elige solo
 *    (ver src/arte/escala.ts).
 *
 * Corrección pedida por Eco Urban (v3.1): antes cada dibujo llenaba su tarjeta y el arbolito (de tres
 * copas y con frutas) se veía más alto que el árbol grande. Ese árbol con frutas sigue en el juego
 * como "arbol-frutal" (src/arte/escenario.ts).
 */

const COPA = '#3E8E5E';
const TRONCO = '#7A5236';
const TRONCO_OSCURO = '#5E3E28';

/** Degradados de las tres etapas (luz desde arriba a la izquierda, como el resto del parque). */
const LUZ = `<defs>
    <radialGradient id="ar-copa" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#6CC77E"/><stop offset=".6" stop-color="${COPA}"/><stop offset="1" stop-color="#2C7048"/></radialGradient>
    <linearGradient id="ar-tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${TRONCO_OSCURO}"/><stop offset=".45" stop-color="#8E6444"/><stop offset="1" stop-color="${TRONCO_OSCURO}"/></linearGradient>
    <linearGradient id="ar-tierra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A27248"/><stop offset="1" stop-color="#6E4A2E"/></linearGradient>
    <linearGradient id="ar-hoja" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7CCB8A"/><stop offset="1" stop-color="#3E8E5E"/></linearGradient>
  </defs>`;

const n = (v: number) => Number(v.toFixed(1));

/** Una bola de follaje con su brillo. */
function copa(cx: number, cy: number, r: number): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#ar-copa)"/><circle cx="${n(cx - r * 0.3)}" cy="${n(cy - r * 0.35)}" r="${n(r * 0.32)}" fill="#fff" opacity=".14"/>`;
}

const sombra = (rx: number, ry: number) => `<ellipse cx="0" cy="3" rx="${rx}" ry="${ry}" fill="#000" opacity=".13"/>`;

/** Montoncito de tierra recién removida (el brote y el arbolito acaban de sembrarse). */
const monton = (rx: number, alto: number) =>
  `<path d="M${-rx} 2 Q ${n(-rx * 0.62)} ${-alto} 0 ${-alto} Q ${n(rx * 0.62)} ${-alto} ${rx} 2 Z" fill="url(#ar-tierra)"/>
   <path d="M${n(-rx * 0.5)} ${n(-alto * 0.55)} q ${n(rx * 0.16)} ${n(-alto * 0.3)} ${n(rx * 0.34)} ${n(-alto * 0.12)}" fill="none" stroke="#C39A6F" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`;

interface Etapa {
  /** Alto del dibujo desde el suelo hasta la punta, en las unidades comunes. */
  alto: number;
  /** Sombra en el suelo (va aparte: el árbol que da sombra trae la suya, más grande). */
  sombra: string;
  dibujo: string;
}

/** Brote: un tallito con dos hojas, pegado al suelo. */
const BROTE: Etapa = {
  alto: 78,
  sombra: sombra(40, 5.5),
  dibujo: `${monton(34, 12)}
    <path d="M0 -9 C -1 -23 -1 -37 1 -52" fill="none" stroke="#2E8B57" stroke-width="8" stroke-linecap="round"/>
    <path d="M0 -44 C -17 -44 -31 -55 -32 -71 C -15 -71 -1 -61 0 -44 Z" fill="#57A673"/>
    <path d="M1 -49 C 17 -51 30 -62 31 -78 C 14 -78 2 -67 1 -49 Z" fill="url(#ar-hoja)"/>
    <path d="M-5 -48 Q -16 -57 -25 -65 M6 -54 Q 16 -63 24 -71" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" opacity=".35"/>`,
};

/** Arbolito: árbol joven, de tronco delgado y copa chica, sin frutas. */
const ARBOLITO: Etapa = {
  alto: 156,
  sombra: sombra(50, 7),
  dibujo: `${monton(28, 9)}
    <path d="M-6 -4 C -5 -32 -4.5 -58 -4 -84 L 4 -84 C 4.5 -58 5 -32 6 -4 Z" fill="url(#ar-tronco)"/>
    <path d="M0 -62 C -9 -70 -15 -74 -22 -77" fill="none" stroke="${TRONCO}" stroke-width="5" stroke-linecap="round"/>
    ${copa(-27, -95, 27)}${copa(27, -95, 27)}${copa(0, -116, 40)}${copa(0, -88, 25)}`,
};

/** Árbol grande: el más alto y ancho, de tronco grueso y copa frondosa. */
const ARBOL: Etapa = {
  alto: 296,
  sombra: sombra(118, 12),
  dibujo: `<path d="M-36 2 C -25 -24 -21 -66 -21 -118 L 21 -118 C 21 -66 25 -24 36 2 Z" fill="url(#ar-tronco)"/>
    <path d="M-10 -8 C -7 -44 -8 -74 -5 -106 M 9 -14 C 11 -40 10 -62 12 -88" fill="none" stroke="${TRONCO_OSCURO}" stroke-width="4" stroke-linecap="round" opacity=".45"/>
    <ellipse cx="2" cy="-58" rx="7" ry="10" fill="${TRONCO_OSCURO}" opacity=".8"/>
    <path d="M-12 -104 C -34 -122 -52 -128 -72 -132 M 12 -106 C 32 -124 50 -130 68 -136" fill="none" stroke="${TRONCO}" stroke-width="15" stroke-linecap="round"/>
    ${copa(-84, -150, 56)}${copa(84, -150, 56)}${copa(0, -228, 68)}${copa(-56, -210, 60)}${copa(56, -210, 60)}${copa(0, -176, 66)}${copa(-34, -136, 46)}${copa(38, -138, 48)}
    <g fill="#8CC872"><path d="M-58 4 q 5 -20 10 -3 q 4 -24 9 -2 q 6 -18 9 5 z"/><path d="M30 4 q 5 -18 10 -3 q 4 -22 9 -2 q 5 -16 8 5 z"/></g>`,
};

const ETAPAS = { brote: BROTE, arbolito: ARBOLITO, arbol: ARBOL } as const;
export type ClaveEtapa = keyof typeof ETAPAS;

/** Las etapas, de la más chica a la más grande. */
export const ETAPAS_CRECIMIENTO = ['brote', 'arbolito', 'arbol'] as const satisfies readonly ClaveEtapa[];

/** Alto de cada etapa en las unidades comunes (para las pruebas y para quien las coloque en una escena). */
export const ALTO_ETAPA: Record<ClaveEtapa, number> = { brote: BROTE.alto, arbolito: ARBOLITO.alto, arbol: ARBOL.alto };

/**
 * El lienzo que comparten las tres etapas "en escala": mismo tamaño, misma escala (1 unidad = 1 px
 * del lienzo) y el suelo en la misma línea. El árbol grande casi lo llena.
 */
export const LIENZO_ETAPAS = { ancho: 300, alto: 320, suelo: 304 } as const;

/** Una etapa colocada con su suelo en (x, suelo) y agrandada `k` veces. */
function colocar(etapa: Etapa, x: number, suelo: number, k = 1, conSombra = true): string {
  return `${LUZ}<g transform="translate(${x} ${suelo}) scale(${k})">${conSombra ? etapa.sombra : ''}${etapa.dibujo}</g>`;
}

/** El dibujo de una etapa, sin su sombra, para ponerlo dentro de otro (por ejemplo, el árbol que da sombra). */
export function etapaColocada(clave: ClaveEtapa, x: number, suelo: number, k = 1): string {
  return colocar(ETAPAS[clave], x, suelo, k, false);
}

/** Cuánto se agranda cada etapa en su dibujo "solo", y el lado de ese cuadro. */
const SOLA: Record<ClaveEtapa, { lado: number; k: number; x: number; suelo: number }> = {
  brote: { lado: 120, k: 1.3, x: 60, suelo: 112 },
  arbolito: { lado: 200, k: 1.12, x: 100, suelo: 188 },
  arbol: { lado: 200, k: 0.62, x: 100, suelo: 188 },
};

/**
 * Alto (en px del juego) al que una escena debe mostrar el cuadro de cada etapa "sola" para que las tres
 * queden en la misma escala (1 unidad del dibujo = 1 px): así el bosquecito crece con las proporciones reales.
 */
export const ALTO_CUADRO_EN_ESCALA: Record<ClaveEtapa, number> = {
  brote: Math.round(SOLA.brote.lado / SOLA.brote.k),
  arbolito: Math.round(SOLA.arbolito.lado / SOLA.arbolito.k),
  arbol: Math.round(SOLA.arbol.lado / SOLA.arbol.k),
};

/** Clave del mismo dibujo en el lienzo común. */
export const claveEtapa = (clave: ClaveEtapa) => `etapa-${clave}`;

export const ARBOLES: ArteSvg[] = [
  // Solas: cada una llena su cuadro (el suelo queda a ~94 % del alto, como espera quien las siembra en una escena).
  ...ETAPAS_CRECIMIENTO.map((clave) => {
    const c = SOLA[clave];
    return arte(clave, c.lado, c.lado, colocar(ETAPAS[clave], c.x, c.suelo, c.k), 1.2);
  }),
  // En escala: las tres en el mismo lienzo, para compararlas.
  ...ETAPAS_CRECIMIENTO.map((clave) => arte(claveEtapa(clave), LIENZO_ETAPAS.ancho, LIENZO_ETAPAS.alto, colocar(ETAPAS[clave], LIENZO_ETAPAS.ancho / 2, LIENZO_ETAPAS.suelo))),
];
