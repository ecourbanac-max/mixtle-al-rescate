import { TEXTOS_APP } from '../contenido/textosApp';
import { TEXTO_LOGO } from './logoTexto.generado';
import { cuerpoDeMixtle, mixtleCompleto } from './personajes';
import { ECO_URBAN } from './ecoUrban.generado';
import { CAJA_LOGOTIPO, pinEcoUrban } from './pinEcoUrban';

/*
 * Marca de "Mixtle al rescate" (dirección visual A, "Parque de día"). El logo es SVG puro: las letras
 * ya vienen convertidas en trazos (npm run marca:generar), así que se ve igual antes de que cargue
 * cualquier fuente: en la pantalla de carga, en los íconos y en los archivos sueltos.
 * Guía completa: docs/marca.md.
 */

export const COLORES_MARCA = {
  verde: '#1F6B4A',
  verdeNoche: '#123D2B',
  sol: '#FFD23F',
  naranja: '#B84A14',
  cielo: '#D3EEF9',
  crema: '#FFF8E7',
  hoja: '#4CAF50',
} as const;

export const LOGO = { ancho: 670, alto: 330 } as const;

export const LEMA = 'Guardianes del parque';
export const FRASE_MIXTLE = TEXTOS_APP.inicio.alRescate;

/** Hojita verde que acompaña a la "M". */
const HOJA = `<path d="M86 112 q22 -34 52 -26 q-14 30 -52 26z" fill="${COLORES_MARCA.hoja}" stroke="${COLORES_MARCA.verde}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M92 110 q18 -10 36 -20" fill="none" stroke="${COLORES_MARCA.verde}" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;

/** Listón amarillo de "al rescate". */
const LISTON = `<path d="M150 238 H490 L516 268 L490 298 H150 L124 268 Z" fill="${COLORES_MARCA.sol}" stroke="${COLORES_MARCA.verde}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M150 244 H490" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/>`;

interface OpcionesLogo {
  /** Sin Mixtle (por ejemplo, cuando Mixtle ya está en la escena junto al logo). */
  sinMixtle?: boolean;
  /** Sufijo de los id de los degradados de Mixtle: distinto del logo de la pantalla de carga (ver personajes.ts). */
  sufijo?: string;
  /** Atributos extra para el <svg> (clase, aria). */
  atributos?: string;
  /**
   * Ponerle id a las piezas del logotipo de Eco Urban del pin de Mixtle (eu-eco, eu-urban, eu-registrado):
   * así el sello "Un proyecto de" de la pantalla de carga las reutiliza con <use> y no pesa el doble.
   * Solo en el logo de index.html (uno por página).
   */
  idsEcoUrban?: boolean;
}

/** Ids de las piezas del logotipo de Eco Urban en el logo de la pantalla de carga. */
export const IDS_ECO_URBAN = { eco: 'eu-eco', urban: 'eu-urban', registrado: 'eu-registrado' } as const;

/**
 * El logo completo: "Mixtle" en arco (blanco con borde verde y sombra), Mixtle asomándose al final de
 * la palabra, el listón "al rescate" y el lema. Las partes llevan clases (logo-palabra, logo-mixtle,
 * logo-liston, logo-lema) para animar su entrada.
 */
export function logoSvg({ sinMixtle = false, atributos = '', sufijo = '', idsEcoUrban = false }: OpcionesLogo = {}): string {
  const svg = logoSinIds({ sinMixtle, atributos, sufijo });
  if (!idsEcoUrban || sinMixtle) return svg;
  let conIds = svg;
  for (const [pieza, id] of Object.entries(IDS_ECO_URBAN)) conIds = conIds.replace(`<path d="${ECO_URBAN[pieza as keyof typeof IDS_ECO_URBAN]}"`, `<path id="${id}" d="${ECO_URBAN[pieza as keyof typeof IDS_ECO_URBAN]}"`);
  return conIds;
}

function logoSinIds({ sinMixtle = false, atributos = '', sufijo = '' }: OpcionesLogo): string {
  const mixtle = sinMixtle
    ? ''
    : `<g class="logo-mixtle"><svg x="456" y="0" width="194" height="181" viewBox="0 0 472 440">${mixtleCompleto('feliz', sufijo)}</svg></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO.ancho} ${LOGO.alto}" ${atributos}>
  ${mixtle}
  <g class="logo-palabra">
    <path d="${TEXTO_LOGO.mixtle}" transform="translate(0 7)" fill="${COLORES_MARCA.verdeNoche}" stroke="${COLORES_MARCA.verdeNoche}" stroke-width="22" stroke-linejoin="round" opacity=".3"/>
    <path d="${TEXTO_LOGO.mixtle}" fill="#fff" stroke="${COLORES_MARCA.verde}" stroke-width="22" stroke-linejoin="round" paint-order="stroke fill"/>
    ${HOJA}
  </g>
  <g class="logo-liston">${LISTON}<path d="${TEXTO_LOGO.alRescate}" fill="${COLORES_MARCA.verde}"/></g>
  <g class="logo-lema"><path d="${TEXTO_LOGO.lema}" fill="${COLORES_MARCA.verde}"/></g>
</svg>`;
}

/**
 * Ícono de la app: la cabeza de Mixtle sobre un círculo de cielo, con el pin de Eco Urban (versión
 * chica) prendido abajo a la derecha. `aSangre` llena todo el cuadro de verde y deja la cara y el pin
 * dentro de la zona segura (íconos "maskable" de Android). `conPin: false` para el favicon de la
 * pestaña (16 a 32 px): ahí el pin sería una mancha.
 */
export function iconoSvg({ aSangre = false, conPin = true }: { aSangre?: boolean; conPin?: boolean } = {}): string {
  const fondo = aSangre
    ? `<rect width="512" height="512" fill="${COLORES_MARCA.verde}"/><circle cx="256" cy="256" r="196" fill="${COLORES_MARCA.cielo}"/>`
    : `<rect width="512" height="512" rx="112" fill="${COLORES_MARCA.verde}"/><circle cx="256" cy="256" r="216" fill="${COLORES_MARCA.cielo}"/>`;
  const cara = aSangre ? { x: 100, y: 92, lado: 312 } : { x: 62, y: 56, lado: 388 };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${fondo}
  <svg x="${cara.x}" y="${cara.y}" width="${cara.lado}" height="${cara.lado}" viewBox="62 6 236 236">${cuerpoDeMixtle('feliz', '', null, false, undefined, 'no', 'ninguna')}</svg>
  ${conPin ? pinEcoUrban('chico', aSangre ? { x: 352, y: 356, r: 52 } : { x: 384, y: 390, r: 66 }, '-icono') : ''}
</svg>`;
}

/**
 * El logotipo de Eco Urban para la pantalla de carga de index.html: <use> a las piezas del pin del logo de
 * esa misma página (logoSvg con idsEcoUrban), así no pesa el doble. El texto "Un proyecto de" va en HTML,
 * con Nunito (la misma fuente de la primera pantalla). Caja: la del logotipo.
 */
export function selloCargaSvg(): string {
  const { x, y, ancho, alto } = CAJA_LOGOTIPO;
  const usos = Object.values(IDS_ECO_URBAN).map((id) => `<use href="#${id}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${ancho} ${alto}">${usos}</svg>`;
}
