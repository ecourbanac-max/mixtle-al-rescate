import { arte, type ArteSvg } from './svg';

/*
 * Dibujos de los residuos (200×200). La clave de textura es `residuo-<nombre>`;
 * en src/data/residuos.ts el campo `imagen` usa el <nombre>.
 */

const CUERPO_BOTELLA = 'M86 38 h28 v14 C 114 64 138 72 138 98 L 138 172 C 138 184 130 190 118 190 L 82 190 C 70 190 62 184 62 172 L 62 98 C 62 72 86 64 86 52 Z';

/**
 * La botella de plástico: vacía (el residuo) o llena de jugo (para la pregunta "¿está bien tirar una
 * botella llena de jugo…?": el dibujo tiene que verse lleno). La etiqueta es azul, no verde: "la botella
 * verde" es la que se rellena (botella-reutilizable) y así no se confunden.
 */
function botella(conJugo: boolean): string {
  const jugo = conJugo
    ? `<clipPath id="re-botella"><path d="${CUERPO_BOTELLA}"/></clipPath>
    <g clip-path="url(#re-botella)"><rect x="56" y="60" width="88" height="134" fill="#F59A23"/><rect x="56" y="60" width="88" height="7" fill="#FFC56B"/></g>`
    : '';
  return `
    <ellipse cx="100" cy="190" rx="50" ry="7" fill="#000" opacity=".12"/>
    <rect x="82" y="14" width="36" height="24" rx="5" fill="#2459A6"/>
    <path d="${CUERPO_BOTELLA}" fill="#CBEAF7"/>${jugo}
    <path d="${CUERPO_BOTELLA}" fill="none" stroke="#4E95C2" stroke-width="6" stroke-linejoin="round"/>
    <rect x="62" y="112" width="76" height="38" fill="#3B82C4"/>
    <path d="M72 120 h56 M72 132 h40" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    <path d="M76 98 v8 M76 158 v20" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>`;
}

/** La botella llena de jugo (no es un residuo del juego de separar: solo ilustra una pregunta). */
export const BOTELLA_LLENA = botella(true);

const DIBUJOS: Record<string, string> = {
  platano: `
    <ellipse cx="100" cy="182" rx="70" ry="8" fill="#000" opacity=".12"/>
    <path d="M100 58 C 70 70 40 112 34 164 C 52 154 72 124 94 98 Z" fill="#FFD23F" stroke="#B88A00" stroke-width="6" stroke-linejoin="round"/>
    <path d="M100 58 C 130 70 160 112 166 164 C 148 154 128 124 106 98 Z" fill="#FFD23F" stroke="#B88A00" stroke-width="6" stroke-linejoin="round"/>
    <path d="M100 60 C 80 70 66 84 60 100 C 76 92 90 84 100 78 C 110 84 124 92 140 100 C 134 84 120 70 100 60 Z" fill="#FFF3B0"/>
    <path d="M100 58 C 86 92 84 134 98 178 C 112 140 114 98 100 58 Z" fill="#FFE066" stroke="#B88A00" stroke-width="6" stroke-linejoin="round"/>
    <rect x="92" y="22" width="16" height="42" rx="6" fill="#8A6A2B"/>
    <circle cx="56" cy="134" r="5" fill="#8A6A2B"/><circle cx="146" cy="128" r="4" fill="#8A6A2B"/><circle cx="102" cy="150" r="4" fill="#8A6A2B"/>`,
  jugo: `
    <ellipse cx="110" cy="184" rx="66" ry="8" fill="#000" opacity=".12"/>
    <path d="M120 46 L 130 12 L 148 8" stroke="#E85D75" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M140 64 L 166 48 L 166 164 L 140 180 Z" fill="#CFE0F3" stroke="#1E4E8C" stroke-width="6" stroke-linejoin="round"/>
    <path d="M58 64 L 84 48 L 166 48 L 140 64 Z" fill="#EAF2FB" stroke="#1E4E8C" stroke-width="6" stroke-linejoin="round"/>
    <rect x="58" y="64" width="82" height="116" fill="#FDFDFD" stroke="#1E4E8C" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="99" cy="112" r="26" fill="#F28C28"/>
    <path d="M99 86 C 104 76 114 74 120 76 C 116 84 108 88 99 86 Z" fill="#3FA56B"/>
    <circle cx="91" cy="104" r="6" fill="#FFC27A"/>
    <rect x="58" y="150" width="82" height="18" fill="#2459A6"/>`,
  botella: botella(false),
  lata: `
    <ellipse cx="100" cy="182" rx="56" ry="8" fill="#000" opacity=".12"/>
    <path d="M58 44 L 58 160 C 58 180 142 180 142 160 L 142 44 Z" fill="#C7CED6" stroke="#6E7882" stroke-width="6" stroke-linejoin="round"/>
    <path d="M58 82 L 142 82 L 142 134 L 58 134 Z" fill="#E04848"/>
    <path d="M58 118 C 80 100 110 136 142 112" stroke="#fff" stroke-width="7" fill="none"/>
    <path d="M72 52 v104" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6"/>
    <ellipse cx="100" cy="44" rx="42" ry="13" fill="#DDE2E7" stroke="#6E7882" stroke-width="6"/>
    <path d="M96 40 C 96 32 116 32 116 40 C 116 46 96 46 96 40 Z" fill="none" stroke="#6E7882" stroke-width="5"/>`,
  periodico: `
    <ellipse cx="100" cy="180" rx="72" ry="8" fill="#000" opacity=".12"/>
    <g transform="rotate(-8 100 100)">
      <rect x="34" y="40" width="132" height="118" rx="6" fill="#F4F2EC" stroke="#7E7E7E" stroke-width="6"/>
      <rect x="48" y="54" width="104" height="18" rx="3" fill="#4A4A4A"/>
      <path d="M48 88 h44 M48 101 h44 M48 114 h44 M48 127 h44 M48 140 h44" stroke="#A0A0A0" stroke-width="6" stroke-linecap="round"/>
      <rect x="104" y="84" width="48" height="60" rx="3" fill="#BFD9EA"/>
      <circle cx="120" cy="102" r="8" fill="#FFE07A"/>
      <path d="M104 144 L 122 120 L 136 134 L 144 126 L 152 144 Z" fill="#7FBF7F"/>
    </g>`,
  servilleta: `
    <ellipse cx="100" cy="176" rx="70" ry="8" fill="#000" opacity=".12"/>
    <path d="M46 72 L 80 46 L 110 60 L 142 42 L 164 78 L 152 108 L 170 142 L 132 164 L 100 150 L 64 166 L 34 134 L 52 104 Z" fill="#FFFFFF" stroke="#A9A9A9" stroke-width="6" stroke-linejoin="round"/>
    <path d="M80 46 L 92 96 L 52 104 M110 60 L 112 100 L 152 108 M92 96 L 112 100 L 100 150 M112 100 L 132 164" stroke="#D2D2D2" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="128" cy="78" rx="16" ry="11" fill="#C98B5A" opacity=".7"/>
    <ellipse cx="78" cy="128" rx="14" ry="10" fill="#E07A5F" opacity=".6"/>
    <circle cx="140" cy="132" r="7" fill="#C98B5A" opacity=".6"/>`,
  frituras: `
    <ellipse cx="100" cy="182" rx="70" ry="8" fill="#000" opacity=".12"/>
    <path d="M48 44 L 152 38 L 162 156 L 40 166 Z" fill="#F7B32B" stroke="#9A3A0E" stroke-width="6" stroke-linejoin="round"/>
    <path d="M48 44 l 9 -12 l 9 12 l 9 -12 l 9 12 l 9 -12 l 9 12 l 9 -12 l 9 12 l 9 -12 l 9 12 l 9 -12 l 6 6" fill="none" stroke="#9A3A0E" stroke-width="5" stroke-linejoin="round"/>
    <path d="M40 166 l 9 12 l 9 -12 l 9 12 l 9 -12 l 9 12 l 9 -12 l 9 12 l 9 -12 l 9 12 l 9 -12 l 9 12 l 9 -12 l 6 8" fill="none" stroke="#9A3A0E" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="100" cy="104" r="34" fill="#E4572E"/>
    <path d="M80 104 C 84 88 116 86 120 100 C 122 116 92 124 80 104 Z" fill="#FFE07A" stroke="#C98A00" stroke-width="4"/>
    <path d="M60 60 L 70 150" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".55"/>`,
  huevo: `
    <ellipse cx="100" cy="184" rx="74" ry="8" fill="#000" opacity=".12"/>
    <path d="M26 122 C 26 160 52 182 80 182 C 108 182 132 160 132 126 L 120 116 L 108 130 L 96 114 L 82 130 L 68 112 L 54 128 L 40 114 Z" fill="#F6EBD9" stroke="#B89A6A" stroke-width="6" stroke-linejoin="round"/>
    <path d="M40 128 L 54 140 L 68 124 L 82 142 L 96 126 L 108 142 L 120 128 C 118 156 100 170 80 170 C 58 170 42 154 40 128 Z" fill="#FFF8EC"/>
    <g transform="rotate(24 140 70)">
      <path d="M100 76 C 104 40 132 22 150 22 C 168 22 186 42 188 76 L 176 66 L 164 80 L 152 64 L 140 80 L 128 64 L 114 80 Z" fill="#F6EBD9" stroke="#B89A6A" stroke-width="6" stroke-linejoin="round"/>
    </g>`,
  carton: `
    <ellipse cx="104" cy="182" rx="76" ry="8" fill="#000" opacity=".12"/>
    <path d="M42 80 L 22 48 L 106 48 L 132 80 Z" fill="#D6A56F" stroke="#7A4E2E" stroke-width="6" stroke-linejoin="round"/>
    <path d="M132 80 L 162 62 L 176 30 L 146 46 Z" fill="#D6A56F" stroke="#7A4E2E" stroke-width="6" stroke-linejoin="round"/>
    <path d="M132 80 L 162 62 L 162 152 L 132 172 Z" fill="#B07D4B" stroke="#7A4E2E" stroke-width="6" stroke-linejoin="round"/>
    <rect x="42" y="80" width="90" height="92" fill="#C8955F" stroke="#7A4E2E" stroke-width="6" stroke-linejoin="round"/>
    <rect x="76" y="80" width="22" height="40" fill="#E8C99A" opacity=".9"/>
    <path d="M60 140 l 10 -16 l 10 16 z M96 150 l 16 0" stroke="#7A4E2E" stroke-width="4" fill="none" stroke-linejoin="round" opacity=".7"/>`,
  popote: `
    <ellipse cx="100" cy="182" rx="60" ry="7" fill="#000" opacity=".12"/>
    <path d="M56 172 L 120 66 L 160 40" fill="none" stroke="#9E2C44" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M56 172 L 120 66 L 160 40" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M56 172 L 120 66 L 160 40" fill="none" stroke="#E85D75" stroke-width="18" stroke-dasharray="14 14"/>
    <path d="M114 74 l 12 -12 M108 84 l 14 -8" stroke="#9E2C44" stroke-width="3" stroke-linecap="round"/>`,
  hojas: `
    <ellipse cx="100" cy="182" rx="76" ry="8" fill="#000" opacity=".12"/>
    <path d="M30 164 C 36 96 92 58 164 46 C 156 114 112 162 30 164 Z" fill="#C8792E" stroke="#7E4219" stroke-width="6" stroke-linejoin="round"/>
    <path d="M30 164 C 76 126 118 92 164 46 M76 128 L 70 96 M104 102 L 98 72 M90 116 L 124 120 M118 88 L 146 92" stroke="#7E4219" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g transform="rotate(-70 120 130)">
      <path d="M70 160 C 76 118 106 92 150 86 C 146 128 116 158 70 160 Z" fill="#D9A441" stroke="#8A5A12" stroke-width="6" stroke-linejoin="round"/>
      <path d="M70 160 C 98 136 122 112 150 86" stroke="#8A5A12" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>`,
  manzana: `
    <ellipse cx="100" cy="190" rx="54" ry="7" fill="#000" opacity=".12"/>
    <path d="M100 28 L 104 8" stroke="#5E3E28" stroke-width="7" stroke-linecap="round"/>
    <path d="M104 18 C 116 6 132 8 140 14 C 130 24 116 26 104 18 Z" fill="#3FA56B"/>
    <ellipse cx="100" cy="44" rx="46" ry="22" fill="#D64545" stroke="#8E2626" stroke-width="5"/>
    <ellipse cx="100" cy="170" rx="46" ry="22" fill="#D64545" stroke="#8E2626" stroke-width="5"/>
    <path d="M64 50 C 82 62 84 74 84 84 L 84 132 C 84 146 76 152 64 164 C 84 172 116 172 136 164 C 124 152 116 146 116 132 L 116 84 C 116 74 118 62 136 50 C 118 58 82 58 64 50 Z" fill="#F7EBC9" stroke="#C9A97A" stroke-width="4" stroke-linejoin="round"/>
    <ellipse cx="94" cy="102" rx="5" ry="8" fill="#5E3E28"/><ellipse cx="106" cy="116" rx="5" ry="8" fill="#5E3E28"/>`,
};

export const NOMBRES_DIBUJOS_RESIDUOS = Object.keys(DIBUJOS);

export const ARTE_RESIDUOS: ArteSvg[] = Object.entries(DIBUJOS).map(([nombre, contenido]) =>
  arte(`residuo-${nombre}`, 200, 200, contenido, 1.3),
);

/** Clave de textura para el campo `imagen` de un residuo (dibujo incluido o archivo propio). */
export function claveImagenResiduo(imagen: string): string {
  return esArchivo(imagen) ? `archivo-${imagen}` : `residuo-${imagen}`;
}

export function esArchivo(imagen: string): boolean {
  return /\.(png|jpe?g|webp|svg)$/i.test(imagen);
}
