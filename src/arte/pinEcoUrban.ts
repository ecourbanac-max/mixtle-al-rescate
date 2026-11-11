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
 * - Dos acomodos del logotipo:
 *     "chico":  "eco" sobre "urban", apilados. Las letras quedan 1.6 veces más grandes en el mismo
 *               botón: es el que se lee en el tamaño real del juego (el pin mide de 16 a ~60 px en
 *               pantalla), así que es el que usa Mixtle en todas partes: inicio, carga, lección, globo,
 *               camino, vestidor, diploma, festejos y aventuras.
 *     "grande": el logotipo en una línea, como lo usa Eco Urban. En una línea las letras miden 0.6 veces
 *               lo del apilado: solo se lee cuando el pin mide ~60 px o más (vitrina, galería, docs).
 * - En React, el pin del cuerpo va aparte del dibujo (MixtleFigura, MascotaVestida) para que nunca mida
 *   menos de 16 px en pantalla y para ir siempre encima de los accesorios del cuello.
 */

export type VersionPin = 'grande' | 'chico';

/** Tamaño y lugar del pin en el pecho de Mixtle (caja de 360×440 del cuerpo; x y y son el centro, r el radio). */
export interface LugarPin {
  x: number;
  y: number;
  r: number;
}

/** Alto del cuerpo de Mixtle dibujado (de la punta de las orejas a las patas, sin la cola), en la caja de 360×440. */
export const ALTO_CUERPO_MIXTLE = 411.5;

/**
 * Las tres opciones de tamaño (docs/marca/pin-variantes.png), en la posición que pidió Eco Urban
 * (v3.1.1): en el pecho, arriba y al centro, sobre la parte clara, justo debajo de la barbilla. El
 * diámetro es el 14, 16 o 18 % del alto del cuerpo. Los brazos se dibujan encima: en las poses donde uno
 * cruza el pecho le tapan una orilla (lo más, "pensando", con la mano en la barbilla), y siempre se ve
 * al menos el 70 % (medido en tests/pinEcoUrban.test.ts); colgado de la rama se ve completo.
 */
const radio = (fraccion: number) => Number(((ALTO_CUERPO_MIXTLE * fraccion) / 2).toFixed(2));
export const VARIANTES_PIN = {
  visible: { x: 178, y: 278, r: radio(0.14) },
  destacado: { x: 178, y: 280, r: radio(0.16) },
  grande: { x: 178, y: 283, r: radio(0.18) },
} as const satisfies Record<string, LugarPin>;

export type TamanoPin = keyof typeof VARIANTES_PIN;

/**
 * EL tamaño en uso. Para cambiarlo basta con este valor: 'visible', 'destacado' o 'grande' (todo
 * Mixtle, en todas sus poses y apariciones, lo toma de aquí). Luego: npm run marca:generar (logo de la
 * pantalla de carga y hoja de personaje) y npm run build.
 */
export const TAMANO_PIN: TamanoPin = 'destacado';

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
    <circle cx="6" cy="12" r="105" fill="#3A2A1F" opacity=".1"/>
    <circle cx="3" cy="7" r="103" fill="#3A2A1F" opacity=".18"/>
    <circle r="104" fill="#E3E8EC"/>
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

/**
 * Dónde queda el pin dentro de su dibujo solo (ARTE_PIN): caja de 240×240, centro en (116, 114) y radio
 * 100. Sirve para encimarlo sobre Mixtle en React en el mismo lugar que tendría dentro de su dibujo.
 */
export const CAJA_ARTE_PIN = { lado: 240, x: 116, y: 114, r: 100 } as const;

/**
 * El pin encima de un dibujo de Mixtle, en % de la caja del dibujo (ancho × alto en las unidades del
 * dibujo; el cuerpo está en (0, 0)). `minimoPx`: el pin nunca mide menos que eso de diámetro en pantalla.
 */
export function estiloPinEncima(caja: { ancho: number; alto: number }, lugar: LugarPin = LUGAR_PIN, minimoPx = 16) {
  const escala = lugar.r / CAJA_ARTE_PIN.r;
  const ancho = (CAJA_ARTE_PIN.lado * escala * 100) / caja.ancho;
  const minimo = (minimoPx * CAJA_ARTE_PIN.lado) / (2 * CAJA_ARTE_PIN.r);
  return {
    left: `${((lugar.x * 100) / caja.ancho).toFixed(3)}%`,
    top: `${((lugar.y * 100) / caja.alto).toFixed(3)}%`,
    width: `max(${minimo.toFixed(1)}px, ${ancho.toFixed(3)}%)`,
    origen: `${((CAJA_ARTE_PIN.x * 100) / CAJA_ARTE_PIN.lado).toFixed(3)}% ${((CAJA_ARTE_PIN.y * 100) / CAJA_ARTE_PIN.lado).toFixed(3)}%`,
  };
}

/** El pin solo (galería ?mixtle, docs, y encima de Mixtle en React). Caja de 240×240 con el pin al centro. */
export const ARTE_PIN: ArteSvg[] = [
  arte('pin-eco-urban', CAJA_ARTE_PIN.lado, CAJA_ARTE_PIN.lado, pinEcoUrban('grande', CAJA_ARTE_PIN), 2),
  arte('pin-eco-urban-chico', CAJA_ARTE_PIN.lado, CAJA_ARTE_PIN.lado, pinEcoUrban('chico', CAJA_ARTE_PIN), 2),
  arte('logotipo-eco-urban', Math.ceil(CAJA_LOGOTIPO.ancho), Math.ceil(CAJA_LOGOTIPO.alto), `<g transform="translate(${n(-CAJA_LOGOTIPO.x)} ${n(-CAJA_LOGOTIPO.y)})">${logotipoEcoUrban()}</g>`, 1),
];
