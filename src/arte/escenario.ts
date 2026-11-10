import { ALTO, ANCHO } from '../config';
import { arte, type ArteSvg } from './svg';

/*
 * El parque: inspirado en los parques de Toluca, con el Nevado de Toluca
 * (Xinantécatl) al fondo, un sendero y un árbol grande donde vive Mixtle.
 */

const PASTO = '#A9D98B';
const PASTO_OSCURO = '#8CC872';
const COPA = '#3E8E5E';
const TRONCO = '#7A5236';
const TRONCO_OSCURO = '#5E3E28';

/** Degradados compartidos por el arte del parque (luz desde arriba a la izquierda). Van dentro de cada SVG. */
const LUZ = `<defs>
    <radialGradient id="esc-copa" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#6CC77E"/><stop offset=".6" stop-color="${COPA}"/><stop offset="1" stop-color="#2C7048"/></radialGradient>
    <linearGradient id="esc-tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${TRONCO_OSCURO}"/><stop offset=".45" stop-color="#8E6444"/><stop offset="1" stop-color="${TRONCO_OSCURO}"/></linearGradient>
  </defs>`;

function copa(cx: number, cy: number, r: number): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#esc-copa)"/>
    <circle cx="${cx - r * 0.3}" cy="${cy - r * 0.35}" r="${r * 0.32}" fill="#fff" opacity=".14"/>`;
}

function arbolLejano(x: number, y: number, r: number): string {
  return `<rect x="${x - r * 0.12}" y="${y}" width="${r * 0.24}" height="${r * 0.9}" fill="${TRONCO}" opacity=".7"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="#5FA36F"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.4}" fill="#7DBB86" opacity=".7"/>`;
}

function mata(x: number, y: number): string {
  return `<path d="M${x - 22} ${y} q 6 -30 12 -4 q 4 -34 10 -2 q 8 -28 12 6 z" fill="${PASTO_OSCURO}"/>`;
}

const PARQUE = `
  <defs>
    <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#B7E0F5"/><stop offset="1" stop-color="#EEF8FC"/>
    </linearGradient>
    <linearGradient id="pasto" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#B9E39C"/><stop offset="1" stop-color="${PASTO}"/>
    </linearGradient>
    <linearGradient id="lomas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9D48C"/><stop offset="1" stop-color="#8CC072"/></linearGradient>
    <linearGradient id="nevado" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DB6CC"/><stop offset="1" stop-color="#BFD1DF"/></linearGradient>
    <radialGradient id="halo"><stop offset="0" stop-color="#FFF6CF"/><stop offset=".5" stop-color="#FFF6CF" stop-opacity=".5"/><stop offset="1" stop-color="#FFF6CF" stop-opacity="0"/></radialGradient>
  </defs>
  ${LUZ}
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#cielo)"/>
  <circle cx="1680" cy="170" r="230" fill="url(#halo)"/>
  <circle cx="1680" cy="170" r="74" fill="#FFE07A"/>
  <circle cx="1660" cy="150" r="24" fill="#fff" opacity=".35"/>

  <!-- Nevado de Toluca -->
  <path d="M700 640 L 1000 410 Q 1022 394 1046 400 L 1104 420 Q 1136 392 1170 404 L 1250 430 L 1580 640 Z" fill="url(#nevado)"/>
  <path d="M1000 410 Q 1022 394 1046 400 L 1104 420 Q 1136 392 1170 404 L 1250 430 L 1214 456 L 1182 438 L 1150 462 L 1112 442 L 1076 466 L 1044 440 L 988 462 L 966 438 Z" fill="#fff"/>
  <path d="M1170 404 L 1250 430 L 1214 456 L 1182 438 Z" fill="#DCE7F1"/>
  <path d="M1250 430 L 1580 640 L 1440 640 L 1240 460 Z" fill="#94AEC4" opacity=".6"/>

  <!-- Lomas -->
  <path d="M0 650 C 220 560 460 570 700 630 C 900 676 1120 610 1360 600 C 1600 590 1790 630 1920 610 L 1920 760 L 0 760 Z" fill="url(#lomas)"/>
  ${arbolLejano(120, 600, 40)}${arbolLejano(210, 590, 32)}${arbolLejano(760, 630, 30)}
  ${arbolLejano(1420, 600, 34)}${arbolLejano(1500, 596, 42)}${arbolLejano(1860, 600, 36)}

  <!-- Pasto -->
  <path d="M0 690 C 380 652 780 712 1180 676 C 1500 650 1740 690 1920 670 L 1920 1080 L 0 1080 Z" fill="url(#pasto)"/>

  <!-- Sendero -->
  <path d="M700 1100 C 820 930 1100 880 1260 790 C 1350 738 1480 716 1940 712" fill="none" stroke="#D8C08F" stroke-width="128" stroke-linecap="round"/>
  <path d="M700 1100 C 820 930 1100 880 1260 790 C 1350 738 1480 716 1940 712" fill="none" stroke="#EBDBB4" stroke-width="108" stroke-linecap="round"/>

  <!-- Farol estilo Paseo Colón -->
  <rect x="1282" y="470" width="14" height="290" rx="6" fill="#2E4A3D"/>
  <rect x="1266" y="752" width="46" height="16" rx="6" fill="#2E4A3D"/>
  <path d="M1264 470 L 1314 470 L 1304 420 L 1274 420 Z" fill="#FFE9A8" stroke="#2E4A3D" stroke-width="7" stroke-linejoin="round"/>
  <path d="M1262 420 L 1316 420 L 1289 396 Z" fill="#2E4A3D"/>

  <!-- Árbol grande de Mixtle -->
  <ellipse cx="478" cy="784" rx="150" ry="18" fill="#2C5E2E" opacity=".18"/>
  <path d="M420 780 C 432 660 424 520 446 420 L 512 420 C 528 520 522 660 536 780 Z" fill="url(#esc-tronco)"/>
  <path d="M436 780 C 450 700 446 600 460 520" stroke="${TRONCO_OSCURO}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".5"/>
  <path d="M470 480 C 420 440 380 430 340 420" stroke="${TRONCO}" stroke-width="22" fill="none" stroke-linecap="round"/>
  <ellipse cx="478" cy="560" rx="16" ry="22" fill="${TRONCO_OSCURO}"/>
  ${copa(330, 360, 120)}${copa(620, 360, 120)}${copa(470, 250, 150)}${copa(340, 230, 100)}${copa(610, 220, 100)}${copa(470, 400, 110)}

  <!-- Matas de pasto -->
  ${mata(160, 1040)}${mata(860, 1060)}${mata(1210, 1000)}${mata(1660, 1050)}${mata(1880, 930)}${mata(700, 860)}${mata(1580, 860)}
`;

const NUBE = `<g fill="#fff">
  <ellipse cx="150" cy="80" rx="130" ry="36"/>
  <circle cx="100" cy="62" r="42"/><circle cx="170" cy="46" r="52"/><circle cx="224" cy="70" r="34"/>
</g>`;

const ARBUSTO = `${LUZ}
  <ellipse cx="150" cy="186" rx="140" ry="12" fill="#000" opacity=".12"/>
  <circle cx="70" cy="130" r="60" fill="url(#esc-copa)"/><circle cx="230" cy="130" r="60" fill="url(#esc-copa)"/>
  <circle cx="150" cy="100" r="78" fill="url(#esc-copa)"/><circle cx="120" cy="150" r="46" fill="url(#esc-copa)"/><circle cx="185" cy="150" r="46" fill="url(#esc-copa)"/>
  <circle cx="125" cy="70" r="26" fill="#fff" opacity=".16"/>`;

const BOLSA = `
  <ellipse cx="100" cy="212" rx="80" ry="8" fill="#000" opacity=".12"/>
  <defs><linearGradient id="esc-bolsa" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3FA56B"/><stop offset="1" stop-color="#257A4B"/></linearGradient></defs>
  <path d="M40 80 C 10 120 12 200 50 210 L 150 210 C 188 200 190 120 160 80 Z" fill="url(#esc-bolsa)" stroke="#1F6B4A" stroke-width="8" stroke-linejoin="round"/>
  <path d="M44 110 C 34 140 36 176 52 196" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".2"/>
  <path d="M40 80 Q 100 100 160 80 L 150 54 Q 100 70 50 54 Z" fill="#3FA56B" stroke="#1F6B4A" stroke-width="8" stroke-linejoin="round"/>
  <path d="M60 64 C 60 20 140 20 140 64" fill="none" stroke="#1F6B4A" stroke-width="10" stroke-linecap="round"/>
  <path d="M100 118 C 76 128 72 160 96 176 C 126 164 128 132 100 118 Z" fill="#DDF0CC"/>
  <path d="M98 128 Q 96 150 96 172" stroke="#1F6B4A" stroke-width="4" fill="none" stroke-linecap="round"/>`;

const HOYO = `
  <ellipse cx="90" cy="38" rx="86" ry="30" fill="#7A5236"/>
  <ellipse cx="90" cy="34" rx="70" ry="20" fill="#5E3E28"/>
  <path d="M30 30 q 10 -8 20 0 M120 26 q 10 -8 20 0" stroke="#9A6D4C" stroke-width="5" fill="none" stroke-linecap="round"/>`;

/*
 * Árbol frutal (naranjo): tres copas con frutas. Hasta la v3 se llamaba "arbolito"; en la v3.1 el arbolito
 * de las lecciones es un árbol joven sin frutas (src/arte/arboles.ts) y este queda como árbol del parque.
 * Se usa donde el árbol es parte del paisaje o el contenido habla de frutos.
 */
const ARBOL_FRUTAL = `${LUZ}
  <ellipse cx="130" cy="336" rx="96" ry="12" fill="#000" opacity=".14"/>
  <path d="M118 336 C 122 290 120 240 126 200 L 140 200 C 144 240 142 290 146 336 Z" fill="url(#esc-tronco)"/>
  <path d="M132 260 C 110 244 96 236 80 232" stroke="${TRONCO}" stroke-width="10" fill="none" stroke-linecap="round"/>
  ${copa(80, 170, 64)}${copa(186, 170, 64)}${copa(132, 104, 84)}${copa(132, 196, 60)}
  <circle cx="90" cy="120" r="8" fill="#F28C28"/><circle cx="180" cy="140" r="8" fill="#F28C28"/><circle cx="140" cy="70" r="8" fill="#F28C28"/>`;

function flores(petalo: string, centro: string): string {
  const flor = (x: number, y: number, r: number) => {
    let petalos = '';
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      petalos += `<circle cx="${(x + Math.cos(ang) * r).toFixed(1)}" cy="${(y + Math.sin(ang) * r).toFixed(1)}" r="${(r * 0.72).toFixed(1)}" fill="${petalo}"/>`;
    }
    return `${petalos}<circle cx="${x}" cy="${y}" r="${(r * 0.62).toFixed(1)}" fill="${centro}"/>`;
  };
  return `
    <ellipse cx="100" cy="190" rx="80" ry="9" fill="#000" opacity=".12"/>
    <path d="M100 190 C 100 150 70 110 60 80 M100 190 C 100 140 110 100 104 56 M100 190 C 104 150 134 120 148 92" stroke="#2E8B57" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M90 150 C 70 150 58 138 56 122 C 74 122 88 132 90 150 Z" fill="#57A673"/>
    <path d="M110 140 C 130 140 142 128 144 112 C 126 112 112 122 110 140 Z" fill="#3E8E5E"/>
    ${flor(60, 76, 16)}${flor(104, 50, 18)}${flor(148, 88, 16)}`;
}

const BRILLO = `<path d="M32 2 C 35 22 42 29 62 32 C 42 35 35 42 32 62 C 29 42 22 35 2 32 C 22 29 29 22 32 2 Z" fill="#FFE07A" stroke="#fff" stroke-width="3"/>`;

export const ESCENARIO: ArteSvg[] = [
  arte('parque', ANCHO, ALTO, PARQUE),
  arte('nube', 300, 130, NUBE),
  arte('arbusto', 300, 200, ARBUSTO, 1.2),
  arte('bolsa', 200, 222, BOLSA, 1.2),
  arte('hoyo', 180, 72, HOYO, 1.2),
  arte('arbol-frutal', 260, 350, ARBOL_FRUTAL, 1.2),
  arte('flores-naranja', 200, 200, flores('#F28C28', '#FFD23F'), 1.2),
  arte('flores-morada', 200, 200, flores('#9B7FD4', '#FFE07A'), 1.2),
  arte('flores-amarilla', 200, 200, flores('#FFD23F', '#B84A14'), 1.2),
  arte('brillo', 64, 64, BRILLO),
];
