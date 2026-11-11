import { ECO_URBAN } from './ecoUrban.generado';
import { arte, type ArteSvg } from './svg';

/*
 * El pin de Eco Urban que Mixtle trae en el pecho (v3.1, pedido por Eco Urban). Es parte fija de
 * Mixtle: no es un accesorio del vestidor y no se puede quitar.
 *
 * - El logotipo "eco urban" es el de Eco Urban A.C., calcado en trazos de su archivo original
 *   (src/arte/ecoUrban.generado.ts): sin fuentes del sistema, sin deformarlo, sin cambiarle colores y
 *   sin efectos encima del logotipo. Se usa con su autorización (CREDITOS.md, docs/marca.md).
 * - El botón: blanco, con borde fino, un brillo suave de botón metálico y una sombrita que lo deja
 *   "prendido" al pelaje, con la misma luz que el resto del arte (desde arriba a la izquierda).
 * - Dos versiones según el tamaño en pantalla:
 *     "grande": el logotipo completo en una línea, como lo usa Eco Urban (inicio, diploma, vestidor,
 *               pantalla de carga, festejos);
 *     "chico":  "eco" sobre "urban", apilados: las letras quedan 1.6 veces más grandes en el mismo
 *               botón y se siguen leyendo cuando Mixtle es chico (lección, globo, camino, aventuras).
 */

export type VersionPin = 'grande' | 'chico';

/** Tamaño y lugar del pin en el pecho de Mixtle (caja de 360×440 del cuerpo; x y y son el centro, r el radio). */
export interface LugarPin {
  x: number;
  y: number;
  r: number;
}

/**
 * Las tres opciones de tamaño que se le mostraron a Eco Urban (docs/marca/pin-variantes.png). Todas
 * van del lado izquierdo de Mixtle (a la derecha de quien lo ve), debajo del paliacate del vestidor.
 * Discreto y medio: ningún brazo los toca en ninguna pose (medido contra los brazos de cada pose en
 * tests/pinEcoUrban.test.ts). Protagonista: el brazo en reposo le pasa por delante de la orilla.
 */
export const VARIANTES_PIN = {
  discreto: { x: 241, y: 327, r: 12 },
  // El más grande que cabe sin que nada lo tape: entre el brazo en reposo y la orilla del cuerpo hay 37 de ancho.
  medio: { x: 240.5, y: 330, r: 18 },
  // Entre el brazo en reposo y la orilla del cuerpo caben 37 de ancho (radio 18.5): el protagonista se
  // mete un poco bajo ese brazo, que le tapa solo el canto, nunca el logotipo.
  protagonista: { x: 240.5, y: 345, r: 21 },
} as const satisfies Record<string, LugarPin>;

export type TamanoPin = keyof typeof VARIANTES_PIN;

/**
 * EL tamaño en uso. Para cambiarlo basta con este valor: 'discreto', 'medio' o 'protagonista'
 * (todo Mixtle, en todas sus poses y apariciones, lo toma de aquí). Luego: npm run marca:generar
 * (logo de la pantalla de carga, íconos y hoja de personaje) y npm run build.
 */
export const TAMANO_PIN: TamanoPin = 'medio';

export const LUGAR_PIN: LugarPin = VARIANTES_PIN[TAMANO_PIN];

const { verde: VERDE, azul: AZUL, cajas } = ECO_URBAN;

/** Las piezas del logotipo, con su color y su regla de relleno (los huecos de las letras). */
const PIEZA = {
  eco: `<path d="${ECO_URBAN.eco}" fill="${VERDE}" fill-rule="evenodd"/>`,
  urban: `<path d="${ECO_URBAN.urban}" fill="${AZUL}" fill-rule="evenodd"/>`,
  registrado: `<path d="${ECO_URBAN.registrado}" fill="${AZUL}" fill-rule="evenodd"/>`,
};

const n = (v: number) => Number(v.toFixed(3));

/** El logotipo completo en una línea, como en el original. Caja: `CAJA_LOGOTIPO`. */
export const CAJA_LOGOTIPO = {
  x: cajas.eco[0],
  y: cajas.urban[1],
  ancho: cajas.registrado[2] - cajas.eco[0],
  alto: Math.max(cajas.eco[3], cajas.urban[3]) - cajas.urban[1],
} as const;

export function logotipoEcoUrban(): string {
  return `${PIEZA.eco}${PIEZA.urban}${PIEZA.registrado}`;
}

/**
 * "eco" sobre "urban" (con su ®), centrados. Se mueven las palabras completas, sin tocar sus letras ni su
 * proporción. Devuelve el dibujo y su caja (en las unidades del logotipo).
 */
function apilado(): { svg: string; ancho: number; alto: number } {
  const [ex0, ey0, ex1, ey1] = cajas.eco;
  const [ux0, , , uy1] = cajas.urban;
  const finUrban = cajas.registrado[2];
  const xAlto = ey1 - ey0; // alto de la "x" (la "e", la "c", la "o")
  const anchoEco = ex1 - ex0;
  const anchoUrban = finUrban - ux0;
  const ancho = Math.max(anchoEco, anchoUrban);
  // Entre la línea base de "eco" y la parte alta de las minúsculas de "urban": lo que sube la "b" más un respiro.
  const separacion = uy1 - xAlto - cajas.urban[1] + xAlto * 0.16;
  const dyUrban = ey1 + separacion + xAlto - uy1; // la línea base de "urban" queda a separación + x-alto debajo de la de "eco"
  const svg = `<g transform="translate(${n((ancho - anchoEco) / 2 - ex0)} ${n(-ey0)})">${PIEZA.eco}</g>
    <g transform="translate(${n((ancho - anchoUrban) / 2 - ux0)} ${n(dyUrban - ey0)})">${PIEZA.urban}${PIEZA.registrado}</g>`;
  return { svg, ancho, alto: ey1 - ey0 + separacion + xAlto };
}

const APILADO = apilado();

/** Degradados del botón; `s` los hace únicos por cada Mixtle en la página (ver defsMixtle en personajes.ts). */
function defsPin(s: string): string {
  return `<defs>
    <radialGradient id="pin-cara${s}" cx="40%" cy="34%" r="72%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FAFBFC"/><stop offset=".86" stop-color="#E9EEF1"/><stop offset="1" stop-color="#CBD4DA"/></radialGradient>
    <linearGradient id="pin-bisel${s}" x1=".15" y1=".1" x2=".85" y2=".9"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#9EABB3" stop-opacity=".75"/></linearGradient>
    <linearGradient id="pin-brillo${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="1"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
  </defs>`;
}

/**
 * El pin dibujado en un círculo de radio 100 con centro en (0, 0): un botón blanco abombado (más claro
 * arriba a la izquierda, un poco gris en la orilla de abajo), con contorno fino, un brillo en la orilla
 * y su sombra sobre el pelaje. El logotipo va en la cara, sin nada encima.
 */
function pinUnitario(version: VersionPin, s: string): string {
  let logo: string;
  if (version === 'grande') {
    // En una línea, centrado, ocupando el ancho que cabe dentro de la orilla.
    const k = 162 / CAJA_LOGOTIPO.ancho;
    logo = `<g transform="translate(${n(-81 - CAJA_LOGOTIPO.x * k)} ${n(-(CAJA_LOGOTIPO.y + CAJA_LOGOTIPO.alto / 2) * k)}) scale(${n(k)})">${logotipoEcoUrban()}</g>`;
  } else {
    // Apilado: el rectángulo de las dos palabras cabe en la cara (su diagonal, menos un margen).
    const k = 152 / Math.hypot(APILADO.ancho, APILADO.alto);
    logo = `<g transform="translate(${n((-APILADO.ancho * k) / 2)} ${n((-APILADO.alto * k) / 2)}) scale(${n(k)})">${APILADO.svg}</g>`;
  }
  return `${defsPin(s)}
    <circle cx="6" cy="11" r="102" fill="#3A2A1F" opacity=".1"/>
    <circle cx="3" cy="6" r="100" fill="#3A2A1F" opacity=".2"/>
    <circle r="100" fill="url(#pin-cara${s})"/>
    <circle r="94" fill="none" stroke="url(#pin-bisel${s})" stroke-width="9"/>
    <circle r="99" fill="none" stroke="#AEB9C0" stroke-width="2"/>
    <path d="M-92 -24 A 95 95 0 0 1 24 -92 A 86 86 0 0 0 -83 -21 Z" fill="url(#pin-brillo${s})" opacity=".9"/>
    ${logo}`;
}

/**
 * El pin con centro en (x, y) y radio r, en las unidades del dibujo que lo contiene. `espejo`: el dibujo
 * que lo contiene se va a mostrar volteado (Mixtle mirando al otro lado): el pin se voltea de vuelta para
 * que el logotipo siempre se lea derecho (sigue en el mismo lado del pecho de Mixtle).
 */
export function pinEcoUrban(version: VersionPin, lugar: LugarPin, s = '', espejo = false): string {
  const k = n(lugar.r / 100);
  return `<g class="pin-eco-urban" data-pin="${version}" transform="translate(${lugar.x} ${lugar.y}) scale(${espejo ? -k : k} ${k})">${pinUnitario(version, s)}</g>`;
}

/** El pin solo (galería ?mixtle, docs). Caja de 240×240 con el pin al centro. */
export const ARTE_PIN: ArteSvg[] = [
  arte('pin-eco-urban', 240, 240, pinEcoUrban('grande', { x: 116, y: 114, r: 100 }), 2),
  arte('pin-eco-urban-chico', 240, 240, pinEcoUrban('chico', { x: 116, y: 114, r: 100 }), 2),
  arte('logotipo-eco-urban', Math.ceil(CAJA_LOGOTIPO.ancho), Math.ceil(CAJA_LOGOTIPO.alto), `<g transform="translate(${n(-CAJA_LOGOTIPO.x)} ${n(-CAJA_LOGOTIPO.y)})">${logotipoEcoUrban()}</g>`, 1),
];
