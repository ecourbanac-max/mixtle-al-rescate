import { LUGAR_PIN, pinEcoUrban, type LugarPin, type VersionPin } from './pinEcoUrban';
import { arte, type ArteSvg } from './svg';

/*
 * Personajes originales del juego, dibujados a mano en SVG con estilo plano.
 * Mixtle es un cacomixtle (Bassariscus astutus): cuerpo esbelto gris-pardo,
 * orejas grandes, anillos claros alrededor de los ojos y cola larga con
 * anillos blancos y negros.
 */

const TINTA = '#2A211C';

// ─── Mixtle ────────────────────────────────────────────────────────────────
const C = {
  piel: '#B09C8A',
  pielOscura: '#8A7563',
  boca: '#7A2E2E',
  lengua: '#E87B7B',
};

export type ExpresionMixtle =
  | 'normal'
  | 'habla'
  | 'feliz'
  | 'parpadeo'
  | 'pensando'
  | 'sorprendido'
  | 'celebrando'
  | 'senalando'
  | 'saluda'
  | 'animo'
  | 'duerme'
  | 'colgado';

const CONTENTO: readonly ExpresionMixtle[] = ['feliz', 'habla', 'celebrando', 'saluda', 'animo', 'colgado'];
/** Expresiones con los ojos abiertos y redondos: son las que parpadean en reposo. */
const PARPADEAN: readonly ExpresionMixtle[] = ['normal', 'habla', 'pensando', 'senalando', 'sorprendido'];

/*
 * Luz y sombra (arte más rico, v3): la piel y la crema llevan un degradado con la luz arriba a la
 * izquierda, la cabeza un brillo suave y una sombra sobre el cuerpo. Los id son iguales en todas las
 * poses; los id llevan un sufijo por instancia (ver defsMixtle).
 */
/*
 * Los degradados se buscan por id en TODO el documento (`url(#mx-piel)`) y el navegador toma el
 * primero que encuentra. Si ese primero está en un SVG que no se pinta (el logo de la pantalla de
 * carga de index.html, oculto con display:none), Mixtle sale sin relleno: la cara blanca, el cuerpo
 * pálido y los brazos (de color plano) café. Pasaba en la tarjeta del recorrido guiado, que va fuera
 * del árbol de la app (29 de octubre de 2026). Por eso cada Mixtle en línea lleva su propio `sufijo`
 * en los id; los dibujos que van como imagen (data URI) son documentos aparte y no lo necesitan.
 */
function defsMixtle(s: string): string {
  return `<defs>
    <radialGradient id="mx-piel${s}" cx="38%" cy="28%" r="80%"><stop offset="0" stop-color="#C9B6A4"/><stop offset=".55" stop-color="${C.piel}"/><stop offset="1" stop-color="#937D6A"/></radialGradient>
    <radialGradient id="mx-crema${s}" cx="42%" cy="30%" r="75%"><stop offset="0" stop-color="#FFFBF3"/><stop offset="1" stop-color="#E9DDCB"/></radialGradient>
    <linearGradient id="mx-oreja${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3BCAE"/><stop offset="1" stop-color="#D98E7F"/></linearGradient>
  </defs>`;
}

function ojosMixtle(expresion: ExpresionMixtle): string {
  const feliz = (x: number) => `<path d="M${x - 19} 158 Q ${x} 134 ${x + 19} 158" fill="none" stroke="${TINTA}" stroke-width="7" stroke-linecap="round"/>`;
  if (expresion === 'feliz' || expresion === 'celebrando' || expresion === 'saluda' || expresion === 'colgado') return feliz(137) + feliz(223);
  if (expresion === 'parpadeo') {
    return `<path d="M118 152 Q 137 164 156 152 M204 152 Q 223 164 242 152" fill="none" stroke="${TINTA}" stroke-width="6" stroke-linecap="round"/>`;
  }
  if (expresion === 'duerme') {
    return `<path d="M120 156 Q 137 168 154 156 M206 156 Q 223 168 240 156" fill="none" stroke="${TINTA}" stroke-width="6" stroke-linecap="round"/>
      <path d="M122 160 l-6 6 M152 160 l6 6 M208 160 l-6 6 M238 160 l6 6" stroke="${TINTA}" stroke-width="3" stroke-linecap="round" opacity=".5"/>`;
  }
  if (expresion === 'sorprendido') {
    const grande = (x: number) =>
      `<circle cx="${x}" cy="150" r="24" fill="${TINTA}"/><circle cx="${x - 8}" cy="141" r="9" fill="#fff"/><circle cx="${x + 8}" cy="160" r="4" fill="#fff"/>`;
    return `${grande(137) + grande(223)}<path d="M112 108 Q 137 94 162 106 M198 106 Q 223 94 248 108" fill="none" stroke="${TINTA}" stroke-width="6" stroke-linecap="round"/>`;
  }
  // Pensando mira hacia arriba; señalando mira hacia donde apunta.
  const dx = expresion === 'pensando' || expresion === 'senalando' ? 8 : 0;
  const dy = expresion === 'pensando' ? -8 : 0;
  const ojo = (x0: number) => {
    const x = x0 + dx;
    const y = 152 + dy;
    return `<circle cx="${x}" cy="${y}" r="20" fill="${TINTA}"/>
     <circle cx="${x - 7}" cy="${y - 8}" r="7.5" fill="#fff"/>
     <circle cx="${x + 7}" cy="${y + 8}" r="3.5" fill="#fff"/>`;
  };
  // Da ánimo: guiña un ojo, con las cejas de "¡tú puedes!".
  if (expresion === 'animo') {
    return `${ojo(137)}${feliz(223)}<path d="M116 118 Q 137 108 158 116 M202 120 Q 223 112 244 118" fill="none" stroke="${TINTA}" stroke-width="6" stroke-linecap="round"/>`;
  }
  return ojo(137) + ojo(223);
}

function bocaMixtle(expresion: ExpresionMixtle): string {
  const linea = `<path d="M180 196 V 206" stroke="${TINTA}" stroke-width="4" stroke-linecap="round"/>`;
  if (expresion === 'sorprendido') {
    return `${linea}<ellipse cx="180" cy="218" rx="10" ry="13" fill="${C.boca}" stroke="${TINTA}" stroke-width="3"/>`;
  }
  if (expresion === 'pensando') {
    return `${linea}<path d="M168 212 Q 182 206 194 213" fill="none" stroke="${TINTA}" stroke-width="4" stroke-linecap="round"/>`;
  }
  if (expresion === 'duerme') {
    return `${linea}<ellipse cx="180" cy="214" rx="6" ry="5" fill="${C.boca}" stroke="${TINTA}" stroke-width="2.5"/>`;
  }
  if (expresion === 'habla' || CONTENTO.includes(expresion)) {
    const alto = expresion === 'habla' ? 228 : 236;
    return `${linea}
      <path d="M163 205 Q 180 ${alto} 197 205 Z" fill="${C.boca}" stroke="${TINTA}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M171 ${alto - 13} Q 180 ${alto - 5} 189 ${alto - 13} Q 180 ${alto - 18} 171 ${alto - 13} Z" fill="${C.lengua}"/>`;
  }
  return `${linea}<path d="M164 206 Q 172 215 180 206 Q 188 215 196 206" fill="none" stroke="${TINTA}" stroke-width="4" stroke-linecap="round"/>`;
}

/** Ojos cerrados encima de los abiertos; en reposo se muestran un instante (parpadeo, clase mx-parpadeo). */
function parpadeoMixtle(expresion: ExpresionMixtle, s = ''): string {
  if (!PARPADEAN.includes(expresion)) return '';
  const y = expresion === 'pensando' ? 144 : 152;
  return `<g class="mx-parpadeo" opacity="0">
      <ellipse cx="137" cy="${y}" rx="34" ry="30" fill="url(#mx-crema${s})"/><ellipse cx="223" cy="${y}" rx="34" ry="30" fill="url(#mx-crema${s})"/>
      <path d="M118 ${y} Q 137 ${y + 12} 156 ${y} M204 ${y} Q 223 ${y + 12} 242 ${y}" fill="none" stroke="${TINTA}" stroke-width="6" stroke-linecap="round"/>
    </g>`;
}

/** Zetas de "dormido" dibujadas con trazos (sin texto: no dependen de ninguna fuente). */
const ZETAS = `<g fill="none" stroke="#2459A6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M42 70 h24 l-24 26 h24" stroke-width="7"/><path d="M20 36 h16 l-16 17 h16" stroke-width="5"/><path d="M6 10 h11 l-11 12 h11" stroke-width="4"/>
  </g>`;

/**
 * El cuerpo de Mixtle. `pin`: el acomodo del pin de Eco Urban que trae en el pecho (ver pinEcoUrban.ts).
 * `null` solo cuando el pin se pone aparte, encima (React: MixtleFigura y MascotaVestida); Mixtle siempre lo trae.
 */
/** Las dos capas del cuerpo: lo de atrás del pin (cuerpo, vientre, patas) y lo de adelante (brazos y cabeza). */
function capasMixtle(expresion: ExpresionMixtle, s = ''): { atras: string; adelante: string } {
  // Cada oreja va en su propio grupo (clase mx-oreja) para que en reposo se mueva sola.
  const oreja = (x: number, giro: number, lado: string) =>
    `<g class="mx-oreja mx-oreja-${lado}"><g transform="rotate(${giro} ${x} 78)">
       <ellipse cx="${x}" cy="78" rx="38" ry="60" fill="${C.pielOscura}"/>
       <ellipse cx="${x}" cy="86" rx="23" ry="42" fill="url(#mx-oreja${s})"/>
       <ellipse cx="${x - 8}" cy="66" rx="7" ry="16" fill="#fff" opacity=".18"/>
     </g></g>`;
  const mejillas = CONTENTO.includes(expresion)
    ? `<ellipse cx="112" cy="196" rx="15" ry="9" fill="#F0907E" opacity=".55"/><ellipse cx="248" cy="196" rx="15" ry="9" fill="#F0907E" opacity=".55"/>`
    : '';
  // Dormido, la cabeza (con las orejas) se ladea un poco.
  const ladeo = expresion === 'duerme' ? ' transform="rotate(9 180 236)"' : '';
  const colgado = expresion === 'colgado';
  // Colgado de una rama: los brazos suben por los lados de la cabeza (delante de las orejas) hasta las manos.
  const brazosArriba = colgado
    ? `<path d="M150 300 L 28 44 M210 300 L 332 44" stroke="${C.piel}" stroke-width="26" stroke-linecap="round"/>
       <ellipse cx="26" cy="34" rx="20" ry="17" fill="${C.pielOscura}"/><ellipse cx="334" cy="34" rx="20" ry="17" fill="${C.pielOscura}"/>`
    : '';
  const pies = colgado
    ? `<ellipse cx="136" cy="414" rx="20" ry="24" fill="${C.pielOscura}"/><ellipse cx="224" cy="414" rx="20" ry="24" fill="${C.pielOscura}"/>`
    : `<ellipse cx="116" cy="414" rx="46" ry="18" fill="${C.pielOscura}"/>
    <ellipse cx="244" cy="414" rx="46" ry="18" fill="${C.pielOscura}"/>`;
  const svg = `${defsMixtle(s)}
    ${colgado ? '' : '<ellipse cx="180" cy="428" rx="125" ry="12" fill="#000" opacity=".12"/>'}
    <g${ladeo}>${oreja(104, -22, 'izq')}${oreja(256, 22, 'der')}</g>
    ${brazosArriba}
    <path d="M108 252 C 92 330 98 400 128 420 L 232 420 C 262 400 268 330 252 252 C 236 214 124 214 108 252 Z" fill="url(#mx-piel${s})"/>
    <ellipse cx="180" cy="332" rx="52" ry="80" fill="url(#mx-crema${s})"/>
    ${pies}
    <path d="M112 318 C 90 352 94 396 122 408 M248 318 C 270 352 266 396 238 408" fill="none" stroke="${C.pielOscura}" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    <ellipse cx="180" cy="242" rx="54" ry="9" fill="#6E5A4A" opacity=".16"/>
    \u0000${patasDelanteras(expresion)}
    <g${ladeo}>
    <path d="M180 70 C 252 70 282 120 274 166 C 266 206 226 236 180 240 C 134 236 94 206 86 166 C 78 120 108 70 180 70 Z" fill="url(#mx-piel${s})"/>
    <path d="M88 172 l-14 8 l16 4 l-10 10 l18 -2 M272 172 l14 8 l-16 4 l10 10 l-18 -2" fill="${C.piel}" stroke="${C.piel}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M98 176 C 118 216 150 234 180 234 C 210 234 242 216 262 176 C 240 192 214 198 180 198 C 146 198 120 192 98 176 Z" fill="url(#mx-crema${s})"/>
    <path d="M180 74 C 166 100 166 128 180 146 C 194 128 194 100 180 74 Z" fill="${C.pielOscura}" opacity=".55"/>
    <path d="M124 98 Q 150 80 186 80" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".22"/>
    <ellipse cx="137" cy="152" rx="35" ry="31" fill="url(#mx-crema${s})"/>
    <ellipse cx="223" cy="152" rx="35" ry="31" fill="url(#mx-crema${s})"/>
    ${ojosMixtle(expresion)}
    ${parpadeoMixtle(expresion, s)}
    <ellipse cx="180" cy="194" rx="37" ry="26" fill="url(#mx-crema${s})"/>
    ${mejillas}
    <path d="M165 180 Q 180 171 195 180 Q 193 192 180 197 Q 167 192 165 180 Z" fill="${TINTA}"/>
    <ellipse cx="175" cy="179" rx="5" ry="2.5" fill="#fff" opacity=".6"/>
    ${bocaMixtle(expresion)}
    <g stroke="${TINTA}" stroke-width="2.5" stroke-linecap="round" opacity=".5">
      <path d="M148 196 L 100 186 M148 204 L 102 212 M212 196 L 260 186 M212 204 L 258 212"/>
    </g>
    ${expresion === 'pensando' ? `<ellipse cx="200" cy="238" rx="22" ry="15" fill="${C.pielOscura}"/><path d="M190 232 v8 M200 232 v9 M210 232 v8" stroke="${C.piel}" stroke-width="3" stroke-linecap="round"/>` : ''}
    </g>
    ${expresion === 'duerme' ? ZETAS : ''}`;
  const [atras, adelante] = svg.split('\u0000');
  return { atras: atras!, adelante: adelante! };
}

/** El cuerpo de Mixtle con el pin entre el cuerpo y los brazos (los brazos que cruzan el pecho le pasan por delante). */
function cuerpoMixtle(expresion: ExpresionMixtle, s = '', pin: VersionPin | null = 'chico', espejo = false, lugar: LugarPin = LUGAR_PIN): string {
  const { atras, adelante } = capasMixtle(expresion, s);
  return `${atras}${pin ? pinEcoUrban(pin, lugar, s, espejo) : ''}${adelante}`;
}

/**
 * Las capas del cuerpo por separado, para poner el pin en medio desde fuera (React: MixtleFigura le
 * da un tamaño mínimo en pantalla). Caja de 360×440, como el cuerpo.
 */
export function capasDeMixtle(expresion: ExpresionMixtle, sufijo = ''): { atras: string; adelante: string } {
  return capasMixtle(expresion, sufijo);
}

/**
 * Patas delanteras: abajo (sentado), arriba (celebrando), una apuntando, una en la barbilla
 * (pensando), una saludando o con el pulgar arriba (da ánimo).
 */
function patasDelanteras(expresion: ExpresionMixtle): string {
  const brazo = (x1: number, y1: number, x2: number, y2: number) =>
    `<path d="M${x1} ${y1} L ${x2} ${y2}" stroke="${C.piel}" stroke-width="26" stroke-linecap="round"/>`;
  const mano = (x: number, y: number) => `<ellipse cx="${x}" cy="${y}" rx="21" ry="15" fill="${C.pielOscura}"/>`;
  const abajo = (x1: number, x2: number) => {
    const pata = x2 - 2 * Math.sign(180 - x2); // un poco hacia afuera, como en el dibujo original
    return `${brazo(x1, 326, x2, 396)}<ellipse cx="${pata}" cy="402" rx="21" ry="12" fill="${C.pielOscura}"/>
     <path d="M${pata - 7} 398 v8 M${pata + 1} 398 v8" stroke="${C.piel}" stroke-width="3" stroke-linecap="round"/>`;
  };
  if (expresion === 'colgado') return '';
  if (expresion === 'celebrando') return `${brazo(146, 300, 76, 214)}${mano(72, 208)}${brazo(214, 300, 284, 214)}${mano(288, 208)}`;
  if (expresion === 'senalando') return `${abajo(152, 150)}${brazo(212, 300, 318, 282)}${mano(332, 280)}`;
  if (expresion === 'pensando') return `${abajo(152, 150)}${brazo(208, 320, 202, 262)}`;
  if (expresion === 'saluda') {
    // Mano abierta en alto, con los dedos separados.
    return `${abajo(152, 150)}${brazo(214, 300, 292, 214)}
      <g fill="${C.pielOscura}"><ellipse cx="298" cy="204" rx="22" ry="18"/><ellipse cx="282" cy="184" rx="7" ry="11"/><ellipse cx="297" cy="180" rx="7" ry="12"/><ellipse cx="312" cy="184" rx="7" ry="11"/><ellipse cx="320" cy="200" rx="7" ry="10"/></g>`;
  }
  if (expresion === 'animo') {
    // "¡Vamos!": brazo doblado y el puño en alto, con los nudillos marcados (sin dedos sueltos).
    return `${abajo(152, 150)}${brazo(212, 304, 290, 272)}${brazo(290, 272, 286, 218)}
      <ellipse cx="286" cy="206" rx="24" ry="21" fill="${C.pielOscura}"/>
      <path d="M270 198 q5 -6 10 0 M282 196 q5 -6 10 0 M294 198 q5 -6 10 0" fill="none" stroke="${C.piel}" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  return `${abajo(152, 150)}${abajo(208, 210)}`;
}

const ESCALA_MIXTLE = 1.3;

const COLA_MIXTLE = `
  <path d="M28 400 C 160 412 232 332 206 232 C 186 152 120 122 150 40" fill="none" stroke="${TINTA}" stroke-width="68" stroke-linecap="round"/>
  <path d="M28 400 C 160 412 232 332 206 232 C 186 152 120 122 150 40" fill="none" stroke="#F7F2E9" stroke-width="58" stroke-linecap="round"/>
  <path d="M28 400 C 160 412 232 332 206 232 C 186 152 120 122 150 40" fill="none" stroke="#2F2723" stroke-width="58" stroke-dasharray="34 30" stroke-dashoffset="10"/>
  <circle cx="150" cy="40" r="29" fill="#2F2723"/>
  <path d="M60 380 C 150 380 200 320 182 240" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".25"/>`;

// ─── Ardilla gris mexicana (Sciurus aureogaster): lomo gris y panza rojiza ───
const A = { gris: '#8F8A86', grisOscuro: '#6E6966', borde: '#BDB8B4', rojizo: '#D9773B', crema: '#F4E6D4' };

function ardilla(feliz: boolean): string {
  const ojos = feliz
    ? `<circle cx="86" cy="100" r="11" fill="${TINTA}"/><circle cx="124" cy="100" r="11" fill="${TINTA}"/>
       <circle cx="82" cy="95" r="4.5" fill="#fff"/><circle cx="120" cy="95" r="4.5" fill="#fff"/>
       <circle cx="90" cy="104" r="2" fill="#fff"/><circle cx="128" cy="104" r="2" fill="#fff"/>`
    : `<circle cx="86" cy="104" r="8" fill="${TINTA}"/><circle cx="124" cy="104" r="8" fill="${TINTA}"/>
       <path d="M74 94 L 96 86 M136 94 L 114 86" stroke="${TINTA}" stroke-width="4.5" stroke-linecap="round"/>
       <path d="M78 116 q -5 10 0 14 q 5 -4 0 -14 z" fill="#7EC8E3"/>`;
  const boca = feliz
    ? `<path d="M94 128 Q 105 142 116 128" fill="#7A2E2E" stroke="${TINTA}" stroke-width="3"/>
       <ellipse cx="72" cy="122" rx="10" ry="6" fill="#F0907E" opacity=".55"/><ellipse cx="138" cy="122" rx="10" ry="6" fill="#F0907E" opacity=".55"/>`
    : `<path d="M95 138 Q 105 128 115 138" fill="none" stroke="${TINTA}" stroke-width="4" stroke-linecap="round"/>`;
  const cola = feliz
    ? 'M150 252 C 252 252 262 150 222 92 C 192 48 232 14 254 30 C 204 -6 148 40 170 100 C 186 150 162 202 132 232 Z'
    : 'M150 252 C 240 262 268 200 248 150 C 232 112 256 92 262 100 C 236 70 196 100 204 150 C 210 190 170 214 132 232 Z';
  return `<defs><radialGradient id="pe-ardilla" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#A9A4A0"/><stop offset=".55" stop-color="${A.gris}"/><stop offset="1" stop-color="#76716E"/></radialGradient><radialGradient id="pe-ardilla-panza" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#EE965C"/><stop offset=".55" stop-color="${A.rojizo}"/><stop offset="1" stop-color="#BC5E26"/></radialGradient></defs>
    <ellipse cx="120" cy="268" rx="100" ry="10" fill="#000" opacity=".12"/>
    <path d="${cola}" fill="${A.gris}" stroke="${A.borde}" stroke-width="10" stroke-linejoin="round"/>
    <ellipse cx="110" cy="196" rx="62" ry="72" fill="url(#pe-ardilla)"/>
    <ellipse cx="106" cy="208" rx="38" ry="52" fill="url(#pe-ardilla-panza)"/>
    <g transform="rotate(-14 76 60)"><ellipse cx="76" cy="60" rx="15" ry="25" fill="${A.gris}"/><ellipse cx="76" cy="64" rx="8" ry="15" fill="${A.rojizo}"/></g>
    <g transform="rotate(14 134 60)"><ellipse cx="134" cy="60" rx="15" ry="25" fill="${A.gris}"/><ellipse cx="134" cy="64" rx="8" ry="15" fill="${A.rojizo}"/></g>
    <circle cx="105" cy="106" r="54" fill="url(#pe-ardilla)"/>
    <ellipse cx="88" cy="74" rx="22" ry="10" fill="#fff" opacity=".18"/>
    <ellipse cx="105" cy="126" rx="30" ry="21" fill="${A.crema}"/>
    ${ojos}
    <ellipse cx="105" cy="118" rx="8" ry="5.5" fill="${TINTA}"/>
    ${boca}
    <ellipse cx="88" cy="182" rx="15" ry="12" fill="${A.grisOscuro}"/>
    <ellipse cx="124" cy="182" rx="15" ry="12" fill="${A.grisOscuro}"/>
    <ellipse cx="78" cy="262" rx="28" ry="12" fill="${A.grisOscuro}"/>
    <ellipse cx="140" cy="262" rx="28" ry="12" fill="${A.grisOscuro}"/>`;
}

// ─── Colibrí ─────────────────────────────────────────────────────────────
const H = { verde: '#2FA36B', verdeOscuro: '#1E7A4E', panza: '#D6F2DF', garganta: '#D7263D', ala: '#8FDDB4' };

function colibri(feliz: boolean): string {
  const ojo = feliz
    ? `<circle cx="82" cy="70" r="8" fill="${TINTA}"/><circle cx="79" cy="67" r="3" fill="#fff"/>
       <ellipse cx="98" cy="88" rx="7" ry="4" fill="#F0907E" opacity=".6"/>`
    : `<circle cx="82" cy="74" r="7" fill="${TINTA}"/><path d="M73 75 A 9 9 0 0 1 91 75 Z" fill="${H.verdeOscuro}"/>
       <path d="M74 66 Q 82 60 92 64" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const pico = feliz ? 'M60 76 L 2 80 L 60 86 Z' : 'M60 82 L 14 112 L 64 90 Z';
  const alaPlegada = feliz
    ? ''
    : `<path d="M110 82 C 140 70 180 80 205 110 C 170 110 135 105 110 98 Z" fill="${H.verdeOscuro}" opacity=".9"/>`;
  return `<defs><radialGradient id="pe-colibri" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#52CC8C"/><stop offset=".55" stop-color="${H.verde}"/><stop offset="1" stop-color="${H.verdeOscuro}"/></radialGradient></defs>
    <path d="M180 100 L 238 118 L 226 142 Z" fill="${H.verdeOscuro}"/>
    <path d="M70 86 C 90 52 150 46 186 72 C 206 86 214 104 222 122 C 196 122 170 122 150 120 C 110 122 76 112 70 86 Z" fill="url(#pe-colibri)"/>
    <path d="M96 104 C 120 124 160 124 196 116 C 172 132 128 136 100 120 Z" fill="${H.panza}"/>
    <circle cx="86" cy="78" r="30" fill="url(#pe-colibri)"/>
    <path d="M110 66 Q 150 56 186 74" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".25"/>
    <ellipse cx="96" cy="100" rx="22" ry="13" fill="${H.garganta}"/>
    <path d="${pico}" fill="${TINTA}"/>
    ${ojo}${alaPlegada}`;
}

const ALA_COLIBRI = `<path d="M10 70 C 30 22 90 2 136 8 C 112 32 70 60 10 70 Z" fill="${H.ala}" stroke="${H.verde}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M30 60 C 60 40 90 26 118 16" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/>`;

// ─── Mariposa monarca ────────────────────────────────────────────────────
function mariposa(feliz: boolean): string {
  const naranja = feliz ? 'url(#pe-monarca)' : '#C9A27A';
  const borde = '#1D1D1D';
  const alas = `
    <path d="M108 88 C 80 28 30 8 12 30 C 0 60 30 96 104 98 Z" fill="${naranja}" stroke="${borde}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M106 102 C 60 106 28 136 48 162 C 68 180 100 152 108 114 Z" fill="${naranja}" stroke="${borde}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M104 92 L 40 34 M104 94 L 22 56 M104 96 L 34 82 M106 106 L 50 150 M106 110 L 76 160" stroke="${borde}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <g fill="#fff"><circle cx="20" cy="36" r="3.5"/><circle cx="12" cy="52" r="3"/><circle cx="34" cy="20" r="3"/><circle cx="46" cy="158" r="3"/><circle cx="58" cy="168" r="3"/></g>`;
  const antenas = feliz
    ? 'M104 52 Q 92 22 80 16 M116 52 Q 128 22 140 16'
    : 'M104 52 Q 90 40 80 50 M116 52 Q 130 40 140 50';
  const puntas = feliz ? [80, 16, 140, 16] : [80, 50, 140, 50];
  const cara = feliz
    ? `<path d="M104 66 Q 110 72 116 66" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
    : `<path d="M104 70 Q 110 64 116 70" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const degradado = feliz ? `<defs><radialGradient id="pe-monarca" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#FFB75E"/><stop offset=".55" stop-color="#F28C28"/><stop offset="1" stop-color="#D2661A"/></radialGradient></defs>` : '';
  return `${degradado}
    ${alas}
    <g transform="translate(220 0) scale(-1 1)">${alas}</g>
    <ellipse cx="110" cy="108" rx="9" ry="40" fill="${borde}"/>
    <path d="${antenas}" stroke="${borde}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="${puntas[0]}" cy="${puntas[1]}" r="5" fill="${borde}"/><circle cx="${puntas[2]}" cy="${puntas[3]}" r="5" fill="${borde}"/>
    <circle cx="110" cy="60" r="15" fill="${borde}"/>
    <circle cx="104" cy="57" r="4" fill="#fff"/><circle cx="116" cy="57" r="4" fill="#fff"/>
    <circle cx="104.5" cy="58" r="2" fill="${borde}"/><circle cx="116.5" cy="58" r="2" fill="${borde}"/>
    ${cara}`;
}

/**
 * Cuerpo de Mixtle (sin cola) para dibujarlo en línea, por ejemplo en React (caja de 360×440).
 * `sufijo`: distinto para cada Mixtle que vaya en línea en la misma página (ver defsMixtle).
 * `pin`: versión del pin de Eco Urban; `espejo`: el cuerpo se mostrará volteado (el pin se lee derecho igual).
 */
export function cuerpoDeMixtle(expresion: ExpresionMixtle, sufijo = '', pin: VersionPin | null = 'chico', espejo = false, lugar: LugarPin = LUGAR_PIN): string {
  return cuerpoMixtle(expresion, sufijo, pin, espejo, lugar);
}

/** Mixtle completo, con la cola, para una caja de 472×440 (el logo y la hoja de personaje). */
export function mixtleCompleto(expresion: ExpresionMixtle, sufijo = '', pin: VersionPin | null = 'chico', lugar: LugarPin = LUGAR_PIN): string {
  if (expresion === 'colgado') return mixtleColgadoCompleto(sufijo, pin, lugar);
  return `<g transform="translate(212 0)">${COLA_MIXTLE}</g>${cuerpoMixtle(expresion, sufijo, pin, false, lugar)}`;
}

/** La paleta de Mixtle (para la prueba que revisa que todas sus apariciones usen la misma). */
export const PALETA_MIXTLE = { ...C, tinta: TINTA } as const;

/** Caja de Mixtle colgado de una rama: más alta, porque la cola le cuelga por debajo. */
export const CAJA_COLGADO = { ancho: 360, alto: 600 } as const;

/** La cola anillada colgando (Mixtle agarrado de la rama): baja desde la cadera y se enrosca. */
const COLA_COLGANDO = (() => {
  const d = 'M232 392 C 270 434 304 476 292 528 C 282 568 234 580 220 548';
  return `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="62" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="#F7F2E9" stroke-width="52" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="#2F2723" stroke-width="52" stroke-dasharray="31 27" stroke-dashoffset="8"/>
  <circle cx="220" cy="548" r="26" fill="#2F2723"/>
  <path d="M246 420 C 278 452 296 488 288 520" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".25"/>`;
})();

/** Mixtle colgado con su cola, para una caja de 360×600. */
export function mixtleColgadoCompleto(sufijo = '', pin: VersionPin | null = 'chico', lugar: LugarPin = LUGAR_PIN): string {
  return `${COLA_COLGANDO}${cuerpoMixtle('colgado', sufijo, pin, false, lugar)}`;
}

export const PERSONAJES: ArteSvg[] = [
  arte('mixtle', 360, 440, cuerpoMixtle('normal'), ESCALA_MIXTLE),
  arte('mixtle-habla', 360, 440, cuerpoMixtle('habla'), ESCALA_MIXTLE),
  arte('mixtle-feliz', 360, 440, cuerpoMixtle('feliz'), ESCALA_MIXTLE),
  arte('mixtle-parpadeo', 360, 440, cuerpoMixtle('parpadeo'), ESCALA_MIXTLE),
  arte('mixtle-pensando', 360, 440, cuerpoMixtle('pensando'), ESCALA_MIXTLE),
  arte('mixtle-sorprendido', 360, 440, cuerpoMixtle('sorprendido'), ESCALA_MIXTLE),
  arte('mixtle-celebrando', 360, 440, cuerpoMixtle('celebrando'), ESCALA_MIXTLE),
  arte('mixtle-senalando', 360, 440, cuerpoMixtle('senalando'), ESCALA_MIXTLE),
  arte('mixtle-saluda', 360, 440, cuerpoMixtle('saluda'), ESCALA_MIXTLE),
  arte('mixtle-animo', 360, 440, cuerpoMixtle('animo'), ESCALA_MIXTLE),
  arte('mixtle-duerme', 360, 440, cuerpoMixtle('duerme'), ESCALA_MIXTLE),
  arte('mixtle-cola', 260, 440, COLA_MIXTLE, ESCALA_MIXTLE),
  // Mixtle entero (con su cola anillada) para todo lo que no se anima por partes: estampa, mascota,
  // parque del grupo, tarjetas, diploma y transición. Sin la cola parecería conejo.
  arte('mixtle-entero', 472, 440, mixtleCompleto('normal'), ESCALA_MIXTLE),
  arte('mixtle-entero-feliz', 472, 440, mixtleCompleto('feliz'), ESCALA_MIXTLE),
  arte('mixtle-entero-celebrando', 472, 440, mixtleCompleto('celebrando'), ESCALA_MIXTLE),
  arte('ardilla-triste', 270, 280, ardilla(false), 1.2),
  arte('ardilla-feliz', 270, 280, ardilla(true), 1.2),
  arte('colibri-triste', 240, 150, colibri(false), 1.2),
  arte('colibri-feliz', 240, 150, colibri(true), 1.2),
  arte('colibri-ala', 140, 80, ALA_COLIBRI, 1.2),
  arte('mariposa-triste', 220, 180, mariposa(false), 1.2),
  arte('mariposa-feliz', 220, 180, mariposa(true), 1.2),
];
