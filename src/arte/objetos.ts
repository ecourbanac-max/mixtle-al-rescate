import { ALTO, ANCHO } from '../config';
import { etapaColocada } from './arboles';
import { DIBUJOS_LASTIMADOS } from './lastimados';
import { BOTELLA_LLENA } from './residuos';
import { arte, type ArteSvg } from './svg';

/*
 * Objetos de las lecciones de las unidades 1 a 5, con el estilo plano de la v1:
 * 200×200, sombra suave abajo, contornos gruesos y la paleta de Eco Urban.
 * Cada dibujo debe entenderse sin texto (lo usan niñas y niños que aún no leen).
 */
const TINTA = '#2A211C';
const sombra = (rx = 70, cy = 186) => `<ellipse cx="100" cy="${cy}" rx="${rx}" ry="8" fill="#000" opacity=".12"/>`;

const DIBUJOS: Record<string, string> = {
  // —— Unidad 1: separar y qué pasa después ——
  composta: `${sombra(80)}
    <path d="M30 120 L 170 120 L 160 182 L 40 182 Z" fill="#9C6B3F" stroke="#5E3E28" stroke-width="6" stroke-linejoin="round"/>
    <path d="M42 140 H158 M38 160 H162" stroke="#5E3E28" stroke-width="5"/>
    <path d="M36 122 C 50 80 80 70 100 72 C 124 70 150 84 164 122 Z" fill="#5B3A22"/>
    <circle cx="70" cy="104" r="5" fill="#8A6A2B"/><circle cx="128" cy="98" r="6" fill="#8A6A2B"/><circle cx="100" cy="88" r="4" fill="#8A6A2B"/>
    <path d="M78 84 q 10 -22 26 -18 q -6 18 -26 18 z" fill="#3FA56B"/>
    <path d="M120 112 q 14 -10 24 0 q -12 8 -24 0 z" fill="#FFD23F"/>
    <path d="M100 66 q 6 -26 30 -30 q -2 24 -30 30 z" fill="#57A673" stroke="#1F6B4A" stroke-width="4"/>
    <path d="M100 66 q -8 -22 -30 -22 q 4 20 30 22 z" fill="#57A673" stroke="#1F6B4A" stroke-width="4"/>`,
  playera: `${sombra(70)}
    <path d="M70 30 L 40 44 L 14 82 L 42 100 L 54 84 L 54 178 L 146 178 L 146 84 L 158 100 L 186 82 L 160 44 L 130 30 C 124 46 112 54 100 54 C 88 54 76 46 70 30 Z" fill="#4E95C2" stroke="#1E4E8C" stroke-width="6" stroke-linejoin="round"/>
    <g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M84 120 a 18 18 0 0 1 30 -10"/><path d="M118 130 a 18 18 0 0 1 -30 12"/></g>
    <path d="M112 100 l 6 12 l -12 2 z M88 152 l -6 -12 l 12 -2 z" fill="#fff"/>`,
  cuaderno: `${sombra(64)}
    <rect x="46" y="26" width="112" height="152" rx="10" fill="#B84A14" stroke="#7A2E0C" stroke-width="6"/>
    <rect x="58" y="26" width="100" height="152" rx="8" fill="#FBF6EA" stroke="#7A2E0C" stroke-width="6"/>
    <path d="M72 64 H144 M72 88 H144 M72 112 H144 M72 136 H144" stroke="#9CC3E0" stroke-width="5"/>
    <g fill="#5E3E28"><circle cx="52" cy="50" r="6"/><circle cx="52" cy="90" r="6"/><circle cx="52" cy="130" r="6"/><circle cx="52" cy="170" r="6"/></g>`,
  // La botella de plástico llena de jugo (la vacía es el residuo "botella", en residuos.ts).
  'botella-llena': BOTELLA_LLENA,
  'bote-revuelto': `${sombra(74, 190)}
    <path d="M44 70 L 156 70 L 144 186 L 56 186 Z" fill="#8A949B" stroke="#4E575D" stroke-width="6" stroke-linejoin="round"/>
    <path d="M70 90 V 170 M100 90 V 170 M130 90 V 170" stroke="#4E575D" stroke-width="5" opacity=".5"/>
    <path d="M52 72 C 60 30 90 50 96 40 C 110 20 130 40 150 72 Z" fill="#6B5A47"/>
    <path d="M58 54 C 46 36 60 22 74 34 C 72 44 66 52 58 54 Z" fill="#FFD23F" stroke="#B88A00" stroke-width="4"/>
    <rect x="86" y="18" width="22" height="40" rx="6" fill="#CBEAF7" stroke="#4E95C2" stroke-width="4" transform="rotate(14 97 38)"/>
    <rect x="118" y="34" width="26" height="34" rx="5" fill="#E6E9EC" stroke="#8A949B" stroke-width="4" transform="rotate(-18 131 51)"/>
    <path d="M60 64 l 30 -6 l 4 12 z" fill="#F4E3B5" stroke="#A8925A" stroke-width="3"/>
    <path d="M150 52 q 14 -8 22 4 M156 40 q 12 -6 18 4" stroke="#8A949B" stroke-width="4" fill="none" stroke-linecap="round"/>`,

  // —— Unidad 2: animales y lo que los lastima ——
  anillos: `${sombra(76)}
    <g fill="none" stroke="#CBD6DC" stroke-width="12" stroke-linejoin="round">
      <rect x="22" y="56" width="156" height="96" rx="24"/>
    </g>
    <g fill="none" stroke="#E6EEF2" stroke-width="9">
      <ellipse cx="54" cy="84" rx="22" ry="18"/><ellipse cx="100" cy="84" rx="22" ry="18"/><ellipse cx="146" cy="84" rx="22" ry="18"/>
      <ellipse cx="54" cy="124" rx="22" ry="18"/><ellipse cx="100" cy="124" rx="22" ry="18"/><ellipse cx="146" cy="124" rx="22" ry="18"/>
    </g>
    <g fill="none" stroke="#9FB0B9" stroke-width="3">
      <ellipse cx="54" cy="84" rx="27" ry="23"/><ellipse cx="100" cy="84" rx="27" ry="23"/><ellipse cx="146" cy="84" rx="27" ry="23"/>
      <ellipse cx="54" cy="124" rx="27" ry="23"/><ellipse cx="100" cy="124" rx="27" ry="23"/><ellipse cx="146" cy="124" rx="27" ry="23"/>
    </g>`,
  'bolsa-plastico': `${sombra(60)}
    <path d="M62 64 C 50 110 46 150 58 176 L 142 176 C 154 150 150 110 138 64 Z" fill="#F3F6F8" stroke="#9FB0B9" stroke-width="6" stroke-linejoin="round"/>
    <path d="M62 66 C 58 30 82 26 84 64 M138 66 C 142 30 118 26 116 64" fill="none" stroke="#9FB0B9" stroke-width="8" stroke-linecap="round"/>
    <path d="M80 100 C 84 130 82 150 76 168 M116 104 C 112 130 118 152 124 168" stroke="#D5DEE3" stroke-width="5" fill="none"/>`,
  bellota: `${sombra(46)}
    <path d="M60 92 C 60 150 80 180 100 182 C 120 180 140 150 140 92 Z" fill="#C98B4A" stroke="#7A5236" stroke-width="6"/>
    <path d="M52 94 C 52 60 148 60 148 94 C 120 104 80 104 52 94 Z" fill="#7A5236" stroke="#5E3E28" stroke-width="6"/>
    <path d="M70 80 l 10 8 M90 74 l 10 8 M110 74 l 10 8 M128 80 l 8 8" stroke="#5E3E28" stroke-width="4"/>
    <rect x="94" y="34" width="12" height="32" rx="5" fill="#5E3E28"/>
    <path d="M84 132 C 86 150 94 162 102 166" stroke="#E2B07A" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  pina: `${sombra(46)}
    <path d="M100 22 C 136 40 150 96 136 140 C 126 170 112 182 100 182 C 88 182 74 170 64 140 C 50 96 64 40 100 22 Z" fill="#9C6B3F" stroke="#5E3E28" stroke-width="6"/>
    <g fill="#7A5236" stroke="#5E3E28" stroke-width="3">
      <path d="M78 60 q 22 14 44 0 q -4 16 -22 18 q -18 -2 -22 -18z"/><path d="M70 92 q 30 16 60 0 q -6 18 -30 20 q -24 -2 -30 -20z"/>
      <path d="M70 124 q 30 16 60 0 q -6 18 -30 20 q -24 -2 -30 -20z"/><path d="M80 154 q 20 12 40 0 q -4 14 -20 16 q -16 -2 -20 -16z"/>
    </g>`,
  algodoncillo: `${sombra(70)}
    <path d="M100 186 V 70" stroke="#3E7E4E" stroke-width="9" stroke-linecap="round"/>
    <g fill="#57A673" stroke="#2F6E43" stroke-width="4">
      <path d="M100 150 C 70 150 46 136 40 118 C 64 116 86 126 100 140 Z"/><path d="M100 150 C 130 150 154 136 160 118 C 136 116 114 126 100 140 Z"/>
      <path d="M100 110 C 74 108 54 94 50 78 C 72 78 92 88 100 100 Z"/><path d="M100 110 C 126 108 146 94 150 78 C 128 78 108 88 100 100 Z"/>
    </g>
    <g fill="#E8562E" stroke="#A8371A" stroke-width="3">
      <circle cx="84" cy="44" r="12"/><circle cx="100" cy="34" r="12"/><circle cx="116" cy="44" r="12"/><circle cx="92" cy="58" r="12"/><circle cx="110" cy="58" r="12"/>
    </g>
    <g fill="#FFC23F"><circle cx="84" cy="44" r="5"/><circle cx="100" cy="34" r="5"/><circle cx="116" cy="44" r="5"/><circle cx="92" cy="58" r="5"/><circle cx="110" cy="58" r="5"/></g>`,
  oruga: `${sombra(80, 160)}
    <g stroke="${TINTA}" stroke-width="4">
      <circle cx="40" cy="118" r="22" fill="#FFD23F"/><circle cx="70" cy="122" r="22" fill="#FBFBF7"/><circle cx="100" cy="124" r="22" fill="#FFD23F"/>
      <circle cx="130" cy="122" r="22" fill="#FBFBF7"/><circle cx="160" cy="116" r="24" fill="#FFD23F"/>
    </g>
    <path d="M58 100 V 144 M88 102 V 146 M118 102 V 146 M146 98 V 140" stroke="${TINTA}" stroke-width="8"/>
    <path d="M152 92 C 150 72 140 64 132 62 M170 92 C 174 72 184 66 192 64" stroke="${TINTA}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="154" cy="112" r="5" fill="${TINTA}"/><circle cx="172" cy="112" r="5" fill="${TINTA}"/>
    <path d="M156 126 q 8 6 16 0" stroke="${TINTA}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  dulce: `${sombra(70, 150)}
    <path d="M58 100 L 18 72 L 24 100 L 18 128 Z" fill="#F0567A" stroke="#A82F4F" stroke-width="5" stroke-linejoin="round"/>
    <path d="M142 100 L 182 72 L 176 100 L 182 128 Z" fill="#F0567A" stroke="#A82F4F" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="100" cy="100" rx="48" ry="38" fill="#FF8FAB" stroke="#A82F4F" stroke-width="6"/>
    <path d="M70 86 C 90 110 110 80 130 104" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  nido: `${sombra(80, 176)}
    <path d="M24 118 C 30 164 70 178 100 178 C 130 178 170 164 176 118 Z" fill="#9C6B3F" stroke="#5E3E28" stroke-width="6"/>
    <g fill="#E8F2F8" stroke="#9FB0B9" stroke-width="3"><ellipse cx="78" cy="112" rx="20" ry="24"/><ellipse cx="122" cy="112" rx="20" ry="24"/><ellipse cx="100" cy="104" rx="20" ry="24"/></g>
    <path d="M20 120 C 60 104 140 104 180 120" stroke="#5E3E28" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M34 136 C 70 128 130 128 166 136 M44 154 C 80 148 120 148 156 154" stroke="#7A5236" stroke-width="5" fill="none"/>`,

  // —— Unidad 3: árboles y cómo se cuidan ——
  // El árbol grande, el arbolito y el brote están en src/arte/arboles.ts (las tres etapas, en escala).
  'arbol-sombra': `
    <ellipse cx="92" cy="180" rx="90" ry="18" fill="#2F6E43" opacity=".35"/>
    <circle cx="178" cy="24" r="19" fill="#FFD23F"/>
    ${etapaColocada('arbol', 92, 178, 0.54)}`,
  sol: `${sombra(50)}
    <g stroke="#F2A900" stroke-width="10" stroke-linecap="round">
      <path d="M100 14 V 36 M100 164 V 186 M14 100 H 36 M164 100 H 186 M40 40 L 56 56 M144 144 L 160 160 M160 40 L 144 56 M56 144 L 40 160"/>
    </g>
    <circle cx="100" cy="100" r="50" fill="#FFD23F" stroke="#F2A900" stroke-width="6"/>`,
  pala: `${sombra(50)}
    <rect x="92" y="14" width="16" height="104" rx="6" fill="#9C6B3F" stroke="#5E3E28" stroke-width="5"/>
    <rect x="74" y="10" width="52" height="16" rx="8" fill="#9C6B3F" stroke="#5E3E28" stroke-width="5"/>
    <path d="M64 114 H 136 V 140 C 136 166 120 182 100 186 C 80 182 64 166 64 140 Z" fill="#8A949B" stroke="#4E575D" stroke-width="6" stroke-linejoin="round"/>`,
  regadera: `${sombra(76)}
    <path d="M40 80 H 130 L 124 176 H 46 Z" fill="#2459A6" stroke="#163A70" stroke-width="6" stroke-linejoin="round"/>
    <path d="M130 100 L 178 58" stroke="#163A70" stroke-width="12" stroke-linecap="round"/>
    <path d="M168 46 l 22 22 l -12 6 l -16 -16 z" fill="#4E95C2" stroke="#163A70" stroke-width="4"/>
    <path d="M60 80 C 60 40 116 40 116 80" fill="none" stroke="#163A70" stroke-width="10"/>
    <g fill="#9CD7F2"><circle cx="186" cy="92" r="5"/><circle cx="196" cy="110" r="4"/><circle cx="178" cy="112" r="4"/></g>`,
  // El mismo arbolito de las lecciones (arboles.ts), todavía en su bolsa negra de vivero.
  'arbolito-bolsa': `${sombra(56)}
    <path d="M58 118 H 142 L 134 184 H 66 Z" fill="#2B2724" stroke="#000" stroke-width="4" stroke-linejoin="round"/>
    <path d="M70 140 H 130" stroke="#4A4440" stroke-width="4"/>
    <ellipse cx="100" cy="119" rx="39" ry="6" fill="#6E4A2E" stroke="#000" stroke-width="3"/>
    ${etapaColocada('arbolito', 100, 124, 0.72)}`,
  // La rama rota (y la que cuelga del árbol del parque) están en src/arte/lastimados.ts.
  'llave-goteando': `${sombra(56)}
    <rect x="20" y="52" width="100" height="34" rx="10" fill="#B7C3CA" stroke="#5B6770" stroke-width="6"/>
    <path d="M110 60 H 150 C 166 60 172 72 172 86 V 104 H 146 V 92 C 146 88 144 86 140 86 H 110 Z" fill="#B7C3CA" stroke="#5B6770" stroke-width="6" stroke-linejoin="round"/>
    <rect x="50" y="30" width="40" height="22" rx="6" fill="#E85D75" stroke="#A82F4F" stroke-width="5"/>
    <g fill="#4E95C2" stroke="#2459A6" stroke-width="3">
      <path d="M159 116 c 8 12 10 18 0 22 c -10 -4 -8 -10 0 -22 z"/><path d="M159 150 c 8 12 10 18 0 22 c -10 -4 -8 -10 0 -22 z"/>
    </g>`,

  // —— Unidad 4: aire limpio ——
  bici: `${sombra(84, 184)}
    <g fill="none" stroke="${TINTA}" stroke-width="8"><circle cx="50" cy="140" r="36"/><circle cx="150" cy="140" r="36"/></g>
    <g fill="none" stroke="#1F6B4A" stroke-width="9" stroke-linejoin="round" stroke-linecap="round">
      <path d="M50 140 L 82 88 L 136 88 L 150 140"/><path d="M82 88 L 100 140 L 136 88"/><path d="M50 140 H 100"/><path d="M74 70 L 82 88"/><path d="M136 88 L 130 62 L 150 58"/>
    </g>
    <rect x="60" y="62" width="30" height="12" rx="6" fill="${TINTA}"/>
    <circle cx="100" cy="140" r="9" fill="#FFD23F" stroke="${TINTA}" stroke-width="4"/>`,
  coche: `${sombra(84, 178)}
    <circle cx="16" cy="118" r="14" fill="#7D858B" opacity=".75"/><circle cx="2" cy="100" r="18" fill="#9AA2A8" opacity=".7"/>
    <path d="M24 130 V 108 C 24 100 30 94 38 94 L 64 92 L 86 60 H 140 L 166 94 H 176 C 184 94 190 100 190 108 V 130 Z" fill="#B84A14" stroke="#7A2E0C" stroke-width="6" stroke-linejoin="round"/>
    <path d="M94 70 H 116 V 92 H 78 Z M124 70 H 136 L 152 92 H 124 Z" fill="#CBEAF7" stroke="#7A2E0C" stroke-width="4" stroke-linejoin="round"/>
    <g fill="${TINTA}"><circle cx="62" cy="134" r="22"/><circle cx="156" cy="134" r="22"/></g>
    <g fill="#B7C3CA"><circle cx="62" cy="134" r="9"/><circle cx="156" cy="134" r="9"/></g>
    <rect x="18" y="118" width="12" height="8" rx="3" fill="#5B6770"/>`,
  tenis: `${sombra(80)}
    <path d="M30 150 V 112 C 30 100 40 92 52 92 L 84 92 C 96 108 120 120 150 126 C 172 130 182 140 182 154 V 160 H 30 Z" fill="#2459A6" stroke="#163A70" stroke-width="6" stroke-linejoin="round"/>
    <path d="M26 160 H 186 V 172 C 186 176 182 180 178 180 H 34 C 30 180 26 176 26 172 Z" fill="#FBFBF7" stroke="#163A70" stroke-width="6" stroke-linejoin="round"/>
    <path d="M78 104 l 16 -8 M88 114 l 16 -8 M98 124 l 16 -8" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
  humo: `${sombra(70)}
    <g fill="#8A949B" stroke="#5B6770" stroke-width="5">
      <circle cx="64" cy="124" r="36"/><circle cx="108" cy="104" r="44"/><circle cx="148" cy="130" r="32"/><circle cx="96" cy="150" r="30"/>
    </g>
    <circle cx="96" cy="92" r="18" fill="#B7C3CA" opacity=".7"/>`,
  'quemar-basura': `${sombra(80)}
    <g fill="#8A949B" opacity=".85"><circle cx="70" cy="44" r="22"/><circle cx="104" cy="28" r="26"/><circle cx="138" cy="48" r="20"/></g>
    <path d="M40 176 L 60 140 L 90 160 L 112 132 L 140 156 L 162 176 Z" fill="#6B5A47" stroke="#3B3633" stroke-width="5" stroke-linejoin="round"/>
    <path d="M72 150 C 64 120 84 104 82 82 C 100 96 110 112 104 128 C 112 120 116 108 114 98 C 132 116 134 140 122 156 Z" fill="#F28C28" stroke="#B84A14" stroke-width="5" stroke-linejoin="round"/>
    <path d="M92 152 C 88 136 98 128 98 116 C 108 128 112 140 106 154 Z" fill="#FFD23F"/>`,
  pelota: `${sombra(56)}
    <circle cx="100" cy="104" r="62" fill="#FBFBF7" stroke="${TINTA}" stroke-width="6"/>
    <path d="M100 76 L 124 94 L 115 122 L 85 122 L 76 94 Z" fill="${TINTA}"/>
    <path d="M100 76 V 44 M124 94 L 154 84 M115 122 L 134 148 M85 122 L 66 148 M76 94 L 46 84" stroke="${TINTA}" stroke-width="5"/>`,
  casa: `${sombra(80)}
    <path d="M36 94 L 100 36 L 164 94" fill="#B84A14" stroke="#7A2E0C" stroke-width="6" stroke-linejoin="round"/>
    <rect x="48" y="90" width="104" height="92" fill="#F4E3B5" stroke="#A8925A" stroke-width="6"/>
    <rect x="86" y="128" width="30" height="54" rx="4" fill="#7A5236"/>
    <rect x="58" y="106" width="22" height="22" rx="3" fill="#CBEAF7" stroke="#A8925A" stroke-width="4"/>
    <rect x="122" y="106" width="22" height="22" rx="3" fill="#CBEAF7" stroke="#A8925A" stroke-width="4"/>`,
  escuela: `${sombra(90)}
    <rect x="20" y="78" width="160" height="104" fill="#F4E3B5" stroke="#A8925A" stroke-width="6"/>
    <path d="M12 82 L 100 30 L 188 82 Z" fill="#2459A6" stroke="#163A70" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="100" cy="62" r="12" fill="#fff" stroke="#163A70" stroke-width="4"/><path d="M100 54 V 62 H 106" stroke="#163A70" stroke-width="3" fill="none"/>
    <rect x="84" y="128" width="32" height="54" rx="4" fill="#1F6B4A"/>
    <g fill="#CBEAF7" stroke="#A8925A" stroke-width="4"><rect x="34" y="98" width="30" height="24" rx="3"/><rect x="136" y="98" width="30" height="24" rx="3"/><rect x="34" y="140" width="30" height="24" rx="3"/><rect x="136" y="140" width="30" height="24" rx="3"/></g>
    <path d="M100 30 V 6 M100 8 l 20 6 l -20 6" stroke="#B84A14" stroke-width="4" fill="#B84A14"/>`,
  'aire-limpio': `
    <rect x="6" y="6" width="188" height="188" rx="26" fill="#BFE6F7"/>
    <circle cx="150" cy="54" r="24" fill="#FFD23F"/>
    <path d="M6 150 C 50 120 100 160 194 130 V 168 C 194 182 182 194 168 194 H 32 C 18 194 6 182 6 168 Z" fill="#8CC872"/>
    <path d="M40 120 L 70 70 L 100 120 Z" fill="#B7C3CA"/><path d="M60 86 L 70 70 L 80 86 Z" fill="#fff"/>
    <path d="M36 60 q 14 -12 28 0 q 12 -10 22 2" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  // El cielo sucio es GRIS (así lo nombran las consignas: "Toca el cielo gris"); antes era beige.
  'aire-sucio': `
    <rect x="6" y="6" width="188" height="188" rx="26" fill="#B3B8BD"/>
    <circle cx="150" cy="54" r="24" fill="#E4E2D6" opacity=".6"/>
    <g fill="#747B82"><rect x="24" y="96" width="34" height="98"/><rect x="66" y="70" width="30" height="124"/><rect x="104" y="110" width="36" height="84"/><rect x="146" y="86" width="30" height="108"/></g>
    <g fill="#959BA1" opacity=".85"><ellipse cx="60" cy="80" rx="60" ry="20"/><ellipse cx="140" cy="100" rx="64" ry="22"/><ellipse cx="90" cy="140" rx="90" ry="18"/></g>`,

  // —— Unidad 5: reduce y reutiliza ——
  'botella-reutilizable': `${sombra(44)}
    <rect x="76" y="14" width="48" height="28" rx="10" fill="#1F6B4A" stroke="#123D2B" stroke-width="5"/>
    <path d="M124 26 C 146 26 146 54 124 54" fill="none" stroke="#123D2B" stroke-width="6"/>
    <rect x="62" y="40" width="76" height="146" rx="26" fill="#3FA56B" stroke="#123D2B" stroke-width="6"/>
    <path d="M100 90 q 18 14 0 40 q -18 -26 0 -40 z" fill="#DDF0CC"/>
    <rect x="76" y="56" width="10" height="110" rx="5" fill="#fff" opacity=".35"/>`,
  lonchera: `${sombra(84)}
    <path d="M70 60 C 70 30 130 30 130 60" fill="none" stroke="#3B2E6E" stroke-width="12" stroke-linecap="round"/>
    <rect x="20" y="58" width="160" height="124" rx="22" fill="#6345A8" stroke="#3B2E6E" stroke-width="6"/>
    <rect x="20" y="58" width="160" height="40" rx="20" fill="#7C5FC4" stroke="#3B2E6E" stroke-width="6"/>
    <rect x="88" y="88" width="24" height="18" rx="5" fill="#FFD23F" stroke="#3B2E6E" stroke-width="4"/>
    <circle cx="60" cy="140" r="12" fill="#FFD23F"/><circle cx="140" cy="140" r="12" fill="#F0567A"/>`,
  recipiente: `${sombra(80)}
    <rect x="22" y="70" width="156" height="108" rx="20" fill="#E9F6FB" stroke="#4E95C2" stroke-width="6"/>
    <rect x="16" y="58" width="168" height="26" rx="12" fill="#4E95C2" stroke="#2459A6" stroke-width="5"/>
    <circle cx="70" cy="128" r="26" fill="#E5352B" stroke="#9E1F18" stroke-width="4"/><path d="M70 102 q 4 -10 12 -12" stroke="#5E3E28" stroke-width="4" fill="none"/>
    <path d="M106 106 h 54 l -8 48 h -38 z" fill="#FFD23F" stroke="#B88A00" stroke-width="4"/>
    <path d="M114 120 h 38 M116 136 h 34" stroke="#B88A00" stroke-width="3"/>`,
  'vaso-desechable': `${sombra(50)}
    <path d="M118 40 L 130 6" stroke="#E85D75" stroke-width="8" stroke-linecap="round"/>
    <path d="M52 44 H 148 L 132 182 H 68 Z" fill="#FBFBF7" stroke="#9FB0B9" stroke-width="6" stroke-linejoin="round"/>
    <rect x="46" y="34" width="108" height="18" rx="8" fill="#E6EEF2" stroke="#9FB0B9" stroke-width="5"/>
    <path d="M60 90 H 140 L 136 120 H 64 Z" fill="#E85D75" opacity=".8"/>`,
  taza: `${sombra(64)}
    <path d="M140 80 C 184 80 184 140 140 140" fill="none" stroke="#7A2E0C" stroke-width="12"/>
    <path d="M36 60 H 150 V 152 C 150 170 136 182 118 182 H 68 C 50 182 36 170 36 152 Z" fill="#B84A14" stroke="#7A2E0C" stroke-width="6"/>
    <ellipse cx="93" cy="62" rx="57" ry="10" fill="#7A5236"/>
    <path d="M76 104 C 76 92 94 92 94 104 C 94 92 112 92 112 104 C 112 120 94 130 94 130 C 94 130 76 120 76 104 Z" fill="#FFD23F"/>`,
  frasco: `${sombra(56)}
    <rect x="62" y="20" width="76" height="26" rx="6" fill="#C9A227" stroke="#8A6A00" stroke-width="5"/>
    <path d="M66 46 H 134 C 154 56 156 72 156 90 V 166 C 156 178 146 186 134 186 H 66 C 54 186 44 178 44 166 V 90 C 44 72 46 56 66 46 Z" fill="#E4F4F9" stroke="#7FB4C9" stroke-width="6"/>
    <rect x="58" y="80" width="12" height="80" rx="6" fill="#fff" opacity=".7"/>`,
  'frasco-lapices': `${sombra(56)}
    <g stroke-width="4">
      <rect x="62" y="20" width="16" height="90" fill="#FFD23F" stroke="#B88A00" transform="rotate(-10 70 65)"/>
      <rect x="92" y="10" width="16" height="96" fill="#4E95C2" stroke="#2459A6"/>
      <rect x="122" y="22" width="16" height="88" fill="#E85D75" stroke="#A82F4F" transform="rotate(10 130 66)"/>
    </g>
    <path d="M56 70 H 144 C 156 78 158 90 158 104 V 168 C 158 178 150 186 140 186 H 60 C 50 186 42 178 42 168 V 104 C 42 90 44 78 56 70 Z" fill="#E4F4F9" stroke="#7FB4C9" stroke-width="6" opacity=".92"/>`,
  'lata-maceta': `${sombra(56)}
    <g fill="#57A673" stroke="#2F6E43" stroke-width="4">
      <path d="M100 74 C 80 70 64 54 62 36 C 82 38 96 54 100 66 Z"/><path d="M100 70 C 120 66 136 50 138 32 C 118 34 104 50 100 62 Z"/>
    </g>
    <path d="M100 96 V 66" stroke="#2F6E43" stroke-width="6"/>
    <rect x="56" y="88" width="88" height="96" rx="10" fill="#B7C3CA" stroke="#5B6770" stroke-width="6"/>
    <path d="M58 106 H 142 M58 168 H 142" stroke="#5B6770" stroke-width="4"/>
    <rect x="56" y="118" width="88" height="40" fill="#2459A6" opacity=".85"/>
    <circle cx="100" cy="138" r="12" fill="#FFD23F"/>`,
  'servilleta-tela': `${sombra(76)}
    <path d="M26 60 L 174 60 L 164 178 L 36 178 Z" fill="#FBFBF7" stroke="#B84A14" stroke-width="6" stroke-linejoin="round"/>
    <g fill="#E8562E" opacity=".75">
      <rect x="40" y="70" width="26" height="22"/><rect x="92" y="70" width="26" height="22"/><rect x="144" y="70" width="22" height="22"/>
      <rect x="66" y="96" width="26" height="24"/><rect x="118" y="96" width="26" height="24"/>
      <rect x="40" y="124" width="26" height="24"/><rect x="92" y="124" width="26" height="24"/><rect x="144" y="124" width="18" height="24"/>
      <rect x="66" y="152" width="26" height="22"/><rect x="118" y="152" width="26" height="22"/>
    </g>`,
  cuchara: `${sombra(40)}
    <ellipse cx="100" cy="56" rx="30" ry="40" fill="#D5DEE3" stroke="#5B6770" stroke-width="6"/>
    <rect x="92" y="92" width="16" height="92" rx="8" fill="#D5DEE3" stroke="#5B6770" stroke-width="6"/>
    <ellipse cx="90" cy="46" rx="8" ry="16" fill="#fff" opacity=".7"/>`,
  'tenedor-plastico': `${sombra(40)}
    <path d="M70 20 V 70 C 70 90 84 98 92 100 V 184 H 108 V 100 C 116 98 130 90 130 70 V 20" fill="#FBFBF7" stroke="#9FB0B9" stroke-width="6" stroke-linejoin="round"/>
    <path d="M90 20 V 66 M110 20 V 66" stroke="#9FB0B9" stroke-width="6"/>`,
  fruta: `${sombra(56)}
    <path d="M100 60 C 70 40 30 60 36 110 C 42 160 78 182 100 170 C 122 182 158 160 164 110 C 170 60 130 40 100 60 Z" fill="#E5352B" stroke="#9E1F18" stroke-width="6"/>
    <path d="M100 60 C 100 44 104 32 112 24" stroke="#5E3E28" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M108 40 C 124 22 148 26 152 34 C 140 46 120 48 108 40 Z" fill="#3FA56B"/>
    <ellipse cx="66" cy="92" rx="10" ry="18" fill="#fff" opacity=".45"/>`,
};

/** Calle con ciclovía, casas y la escuela al fondo (encuentra-error de la unidad 4). */
const CALLE = `
  <rect width="${ANCHO}" height="${ALTO}" fill="#CFEAF7"/>
  <circle cx="1700" cy="160" r="90" fill="#FFF1B8"/>
  <path d="M0 520 C 400 470 800 540 1200 500 C 1500 470 1750 510 ${ANCHO} 490 V ${ALTO} H 0 Z" fill="#A9D98B"/>
  <g fill="#F4E3B5" stroke="#A8925A" stroke-width="8">
    <rect x="120" y="330" width="300" height="220"/><rect x="1380" y="300" width="420" height="250"/>
  </g>
  <path d="M100 340 L 270 230 L 440 340 Z" fill="#B84A14"/>
  <path d="M1360 310 L 1590 190 L 1820 310 Z" fill="#2459A6"/>
  <g fill="#CBEAF7" stroke="#A8925A" stroke-width="6"><rect x="160" y="380" width="70" height="60"/><rect x="310" y="380" width="70" height="60"/><rect x="1420" y="360" width="80" height="64"/><rect x="1700" y="360" width="80" height="64"/></g>
  <rect x="1560" y="440" width="70" height="110" fill="#1F6B4A"/>
  <rect x="0" y="640" width="${ANCHO}" height="300" fill="#6B747A"/>
  <rect x="0" y="600" width="${ANCHO}" height="60" fill="#D9D3C7"/>
  <rect x="0" y="940" width="${ANCHO}" height="140" fill="#D9D3C7"/>
  <rect x="0" y="840" width="${ANCHO}" height="100" fill="#2F7E55"/>
  <path d="M0 790 H ${ANCHO}" stroke="#FBFBF7" stroke-width="10" stroke-dasharray="70 50"/>
  <g fill="#fff" opacity=".8"><rect x="300" y="872" width="70" height="36" rx="6"/><rect x="1100" y="872" width="70" height="36" rx="6"/></g>
  <circle cx="640" cy="470" r="80" fill="#3E8E5E"/><rect x="628" y="520" width="24" height="90" fill="#7A5236"/>
  <circle cx="1050" cy="460" r="90" fill="#3E8E5E"/><rect x="1038" y="520" width="24" height="90" fill="#7A5236"/>`;

export const OBJETOS: ArteSvg[] = [
  ...Object.entries({ ...DIBUJOS, ...DIBUJOS_LASTIMADOS }).map(([clave, contenido]) => arte(clave, 200, 200, contenido, 1.2)),
  arte('calle', ANCHO, ALTO, CALLE),
];
