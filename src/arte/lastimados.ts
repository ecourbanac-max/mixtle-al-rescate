/*
 * Lo que lastima a un árbol (v3.1.1, "Toca lo que lastima al árbol"): dibujos pensados para que una
 * niña o un niño de 6 años los reconozca al primer vistazo.
 *
 * - La rama rota es del MISMO árbol del parque (mismos colores de tronco y de corteza): gruesa, quebrada
 *   cerca del tronco con la astilla clara en la rotura, colgando de una tira de corteza y con las hojas
 *   marchitas. "rama-colgando" va pegada al tronco del parque (su muñón está arriba a la izquierda de su
 *   caja); "rama-rota" trae un pedazo de tronco, para verse sola en una tarjeta.
 * - La lata es una lata de refresco tirada en el pasto: roja, de lado, abollada y con su anillo.
 * Todo en cajas de 200×200, como el resto de los objetos de las lecciones (src/arte/objetos.ts).
 */
const TRONCO = '#7A5236';
const TRONCO_OSCURO = '#5E3E28';
const MADERA = '#EBC892';
const MADERA_OSCURA = '#C99A5E';

const defsRama = (s: string) => `<defs>
    <linearGradient id="ra-corteza${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8E6444"/><stop offset="1" stop-color="${TRONCO_OSCURO}"/></linearGradient>
  </defs>`;

/** Hojas marchitas: verde apagado, amarillo y café; una ya se cayó. */
const hoja = (x: number, y: number, giro: number, color: string, k = 1) =>
  `<path transform="translate(${x} ${y}) rotate(${giro}) scale(${k})" d="M0 0 C 8 -12 26 -12 34 0 C 26 12 8 12 0 0 Z" fill="${color}" stroke="#6B5A2A" stroke-width="2.4" stroke-linejoin="round"/>
   <path transform="translate(${x} ${y}) rotate(${giro}) scale(${k})" d="M2 0 L 30 0" stroke="#6B5A2A" stroke-width="1.6" opacity=".6"/>`;
const HOJAS_MARCHITAS = `
    ${hoja(138, 156, 40, '#A9A548', 1.15)}${hoja(150, 170, 80, '#C9A43A', 1.15)}${hoja(156, 160, 10, '#9AA24C', 1.1)}
    ${hoja(128, 112, -40, '#B8B04A', 1)}${hoja(140, 104, 15, '#C9A43A', 0.95)}
    ${hoja(146, 186, 175, '#B07A3A', 0.9)}`;

/**
 * La rama quebrada que cuelga: el muñón gruesa sale del tronco (arriba a la izquierda) con la rotura
 * clara; la rama sigue colgada de una tira de corteza, con la otra punta de la rotura (astillada) y las
 * hojas marchitas abajo.
 */
function ramaQuebrada(s: string): string {
  return `${defsRama(s)}
    <path d="M0 14 L 42 10 L 52 22 L 46 34 L 56 46 L 48 60 L 0 66 Z" fill="url(#ra-corteza${s})" stroke="${TRONCO_OSCURO}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M42 10 L 52 22 L 46 34 L 56 46 L 48 60 L 40 56 L 44 46 L 36 34 L 42 22 Z" fill="${MADERA}" stroke="${TRONCO_OSCURO}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M44 22 L 49 23 M42 46 L 50 46" stroke="${MADERA_OSCURA}" stroke-width="2" stroke-linecap="round"/>
    <path d="M40 60 C 40 70 44 76 50 80" fill="none" stroke="${TRONCO_OSCURO}" stroke-width="9" stroke-linecap="round"/>
    <path d="M40 60 C 40 70 44 76 50 80" fill="none" stroke="#8E6444" stroke-width="5" stroke-linecap="round"/>
    <path d="M38 82 L 66 68 C 98 98 128 128 160 152 L 140 176 C 108 150 74 118 38 82 Z" fill="url(#ra-corteza${s})" stroke="${TRONCO_OSCURO}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M38 82 L 44 70 L 50 78 L 56 66 L 60 74 L 66 68 L 62 84 L 52 90 Z" fill="${MADERA}" stroke="${TRONCO_OSCURO}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M62 92 C 88 116 112 140 140 160" fill="none" stroke="#A47A55" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <path d="M104 126 C 110 112 120 106 132 106" fill="none" stroke="${TRONCO}" stroke-width="8" stroke-linecap="round"/>
    ${HOJAS_MARCHITAS}`;
}

const sombra = (cx: number, rx: number, cy = 190) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="7" fill="#000" opacity=".12"/>`;

export const DIBUJOS_LASTIMADOS: Record<string, string> = {
  // Pegada al tronco del parque: el muñón (0..46, 14..54) se encima al costado del tronco.
  'rama-colgando': ramaQuebrada('-c'),
  // Con su pedazo de tronco, para la tarjeta "romper ramas".
  'rama-rota': `${sombra(110, 84)}
    <defs><linearGradient id="ra-tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${TRONCO_OSCURO}"/><stop offset=".45" stop-color="#8E6444"/><stop offset="1" stop-color="${TRONCO_OSCURO}"/></linearGradient></defs>
    <path d="M14 192 C 18 140 18 70 22 6 L 58 6 C 60 70 60 140 66 192 Z" fill="url(#ra-tronco)"/>
    <path d="M30 170 C 32 130 30 90 34 50" fill="none" stroke="${TRONCO_OSCURO}" stroke-width="4" stroke-linecap="round" opacity=".5"/>
    <g transform="translate(58 26) scale(.7)">${ramaQuebrada('-t')}</g>`,
  'lata-tirada': `${sombra(102, 84, 160)}
    <defs>
      <linearGradient id="la-cuerpo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0483C"/><stop offset=".55" stop-color="#D42A20"/><stop offset="1" stop-color="#A81A12"/></linearGradient>
      <linearGradient id="la-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF1F4"/><stop offset="1" stop-color="#A9B3BB"/></linearGradient>
    </defs>
    <path d="M40 92 L 150 84 C 166 84 168 150 152 152 L 42 158 C 26 158 24 92 40 92 Z" fill="url(#la-cuerpo)" stroke="#7A1410" stroke-width="5" stroke-linejoin="round"/>
    <path d="M58 106 C 76 96 92 128 110 116 C 124 106 136 122 148 112" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
    <path d="M86 92 C 96 104 92 120 98 132 C 102 142 96 150 92 156" fill="none" stroke="#7A1410" stroke-width="4" stroke-linecap="round" opacity=".55"/>
    <path d="M88 96 C 98 108 94 122 100 132" fill="none" stroke="#FF8A80" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <path d="M52 100 L 140 94" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>
    <ellipse cx="41" cy="125" rx="15" ry="33" fill="url(#la-metal)" stroke="#5B6770" stroke-width="5"/>
    <ellipse cx="41" cy="125" rx="8" ry="22" fill="none" stroke="#7F8A93" stroke-width="3"/>
    <path d="M36 110 C 28 114 28 126 36 130" fill="none" stroke="#5B6770" stroke-width="4" stroke-linecap="round"/>
    <path d="M154 86 C 166 92 168 146 154 152" fill="none" stroke="#C7CED6" stroke-width="5" stroke-linecap="round"/>
    <g fill="#5DA64E"><path d="M20 162 l 6 -18 l 4 16 l 6 -20 l 4 22 z"/><path d="M150 162 l 6 -16 l 4 14 l 6 -18 l 4 20 z"/><path d="M96 166 l 5 -12 l 4 10 l 5 -13 l 3 15 z"/></g>`,
};
