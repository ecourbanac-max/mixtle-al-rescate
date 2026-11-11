import { ECO_URBAN } from './ecoUrban.generado';
import { CAJA_LOGOTIPO, LUGAR_PIN } from './pinEcoUrban';

/*
 * La banda de guardián de Mixtle (v3.1.2): una banda de tela cruzada en el torso, del hombro izquierdo
 * de Mixtle a su cadera derecha, como la de un guardaparques ("Guardianes del parque"), con el logotipo
 * de Eco Urban escrito a lo largo. El pin va prendido encima, en el pecho.
 *
 * - La banda pasa por el centro del pin y baja a 42°. El largo y el ancho salen de lo que cabe sin que
 *   la tape un brazo ni la cabeza: el logotipo mide 10 unidades de alto (en la caja del cuerpo, de 440)
 *   y queda libre en 11 de las 12 poses (tests/bandaEcoUrban.test.ts). En "celebrando" el brazo
 *   levantado le pasa por encima: ahí la banda va sin texto, para que no se vea una palabra cortada.
 * - El logotipo sigue la inclinación de la banda sin estirarse ni deformarse.
 * - Se recorta con la silueta del torso (la banda "da la vuelta" por el costado).
 * - El texto solo se ve donde Mixtle es grande (inicio, vestidor, vitrina, proyector): en pantalla lo
 *   decide un container query (estilos.css, .banda-texto); en los dibujos que van como imagen se hornea
 *   o no (ver personajes.ts y MascotaVestida).
 */

export type Banda = 'ninguna' | 'blanca' | 'verde';

/**
 * LA banda en uso. Para cambiarla basta con este valor: 'ninguna', 'blanca' o 'verde' (todo Mixtle, en
 * todas sus poses y apariciones, la toma de aquí). Luego: npm run marca:generar y npm run build.
 */
export const BANDA: Banda = 'verde';

/** Colores de cada banda: tela, sombra del pliegue, orilla y el logotipo (a todo color o en blanco). */
const COLORES: Record<Exclude<Banda, 'ninguna'>, { tela: string; sombra: string; orilla: string; brillo: string; logo: 'color' | 'blanco' }> = {
  blanca: { tela: '#F4EFE3', sombra: '#DCD2BE', orilla: '#BFB49D', brillo: '#FFFFFF', logo: 'color' },
  verde: { tela: '#009345', sombra: '#00753A', orilla: '#005C2E', brillo: '#3DB46F', logo: 'blanco' },
};

const n = (v: number) => Number(v.toFixed(2));

/** Geometría (caja del cuerpo, 360×440). */
const ANGULO = 42;
const RAD = (ANGULO * Math.PI) / 180;
/** Hacia abajo y a la izquierda (de quien lo ve), a lo largo de la banda. */
const D = { x: -Math.cos(RAD), y: Math.sin(RAD) };
/** Perpendicular, hacia abajo a la derecha. */
const NRM = { x: D.y, y: -D.x };
/** La línea de la banda pasa por el pin, apenas corrida hacia arriba (hacia el hombro). */
const CORRIMIENTO = -6;
const C0 = { x: LUGAR_PIN.x + NRM.x * CORRIMIENTO, y: LUGAR_PIN.y + NRM.y * CORRIMIENTO };
export const ANCHO_BANDA = 27;
/** El logotipo: alto, y dónde empieza (desde el centro del pin, a lo largo de la banda). */
export const ALTO_TEXTO_BANDA = 10;
const INICIO_TEXTO = 34;

const punto = (t: number, desv = 0) => ({ x: C0.x + D.x * t + NRM.x * desv, y: C0.y + D.y * t + NRM.y * desv });

/** El torso de Mixtle (el mismo trazo que personajes.ts): la banda se recorta con él. */
const TORSO = 'M108 252 C 92 330 98 400 128 420 L 232 420 C 262 400 268 330 252 252 C 236 214 124 214 108 252 Z';

/** Centro y ángulo del logotipo sobre la banda (para dibujarlo, o para ponerlo encima desde React). */
export const TEXTO_BANDA = (() => {
  const largo = (ALTO_TEXTO_BANDA * CAJA_LOGOTIPO.ancho) / CAJA_LOGOTIPO.alto;
  const centro = punto(INICIO_TEXTO + largo / 2);
  return { x: n(centro.x), y: n(centro.y), angulo: -ANGULO, alto: ALTO_TEXTO_BANDA, largo: n(largo) };
})();

/**
 * Alto mínimo del cuerpo de Mixtle en pantalla (px) para mostrar el texto de la banda: ahí el logotipo
 * mide 5.7 px de alto. Más chico sería una mancha y se quita (lección, globo, camino, selección de grupo).
 */
export const CUERPO_MINIMO_TEXTO_PX = 250;

/**
 * El logotipo a lo largo de la banda (sube de la cadera al hombro), a todo color o en blanco. `espejo`: el
 * dibujo se mostrará volteado; el logotipo se voltea de vuelta en su propio marco, así se lee derecho y
 * sigue la banda (que en espejo baja hacia la derecha).
 */
export function logotipoBanda(banda: Exclude<Banda, 'ninguna'>, espejo = false): string {
  const k = ALTO_TEXTO_BANDA / CAJA_LOGOTIPO.alto;
  const cx = CAJA_LOGOTIPO.x + CAJA_LOGOTIPO.ancho / 2;
  const cy = CAJA_LOGOTIPO.y + CAJA_LOGOTIPO.alto / 2;
  const blanco = COLORES[banda].logo === 'blanco';
  const pieza = (d: string, color: string) => `<path d="${d}" fill="${blanco ? '#FFFFFF' : color}" fill-rule="evenodd"/>`;
  return `<g transform="translate(${TEXTO_BANDA.x} ${TEXTO_BANDA.y}) rotate(${TEXTO_BANDA.angulo}) scale(${espejo ? -n(k * 1000) / 1000 : n(k * 1000) / 1000} ${n(k * 1000) / 1000}) translate(${n(-cx)} ${n(-cy)})">${pieza(ECO_URBAN.eco, ECO_URBAN.verde)}${pieza(ECO_URBAN.urban, ECO_URBAN.azul)}${pieza(ECO_URBAN.registrado, ECO_URBAN.azul)}</g>`;
}

/**
 * La banda sobre el torso. `texto`: 'si' (horneado), 'no', o 'css' (con la clase banda-texto, para que
 * un container query lo muestre solo cuando Mixtle es grande). `s`: sufijo de ids, único por Mixtle.
 */
export function bandaEcoUrban(banda: Banda, texto: 'si' | 'no' | 'css', s = '', espejo = false): string {
  if (banda === 'ninguna') return '';
  const c = COLORES[banda];
  const a = punto(-120);
  const b = punto(140);
  const w = ANCHO_BANDA / 2;
  const tira = (desde: number, hasta: number) => {
    const p = [punto(-120, desde), punto(140, desde), punto(140, hasta), punto(-120, hasta)];
    return `M${p.map((q) => `${n(q.x)} ${n(q.y)}`).join(' L ')} Z`;
  };
  // Un pliegue suave: una sombra angosta que cruza la tela cerca del hombro y otra cerca de la cadera.
  const pliegue = (t: number) => {
    const p1 = punto(t, -w), p2 = punto(t + 6, w), p3 = punto(t + 11, w), p4 = punto(t + 4, -w);
    return `M${n(p1.x)} ${n(p1.y)} L ${n(p2.x)} ${n(p2.y)} L ${n(p3.x)} ${n(p3.y)} L ${n(p4.x)} ${n(p4.y)} Z`;
  };
  const textoSvg = texto === 'no' ? '' : `<g class="banda-texto"${texto === 'css' ? '' : ' data-horneado=""'}>${logotipoBanda(banda, espejo)}</g>`;
  return `<g class="banda-eco-urban" data-banda="${banda}">
    <clipPath id="mx-banda${s}"><path d="${TORSO}"/></clipPath>
    <g clip-path="url(#mx-banda${s})">
      <path d="${tira(-w - 2.5, w + 2.5)}" fill="#3A2A1F" opacity=".12" transform="translate(2 3)"/>
      <path d="${tira(-w, w)}" fill="${c.tela}"/>
      <path d="${tira(w - 6, w)}" fill="${c.sombra}"/>
      <path d="${pliegue(-62)} ${pliegue(96)}" fill="${c.sombra}" opacity=".8"/>
      <path d="M${n(punto(-120, -w + 2.5).x)} ${n(punto(-120, -w + 2.5).y)} L ${n(punto(140, -w + 2.5).x)} ${n(punto(140, -w + 2.5).y)}" stroke="${c.brillo}" stroke-width="2.4" opacity=".7"/>
      <path d="M${n(a.x + NRM.x * -w)} ${n(a.y + NRM.y * -w)} L ${n(b.x + NRM.x * -w)} ${n(b.y + NRM.y * -w)} M${n(a.x + NRM.x * w)} ${n(a.y + NRM.y * w)} L ${n(b.x + NRM.x * w)} ${n(b.y + NRM.y * w)}" stroke="${c.orilla}" stroke-width="1.6" fill="none"/>
      ${textoSvg}
    </g>
  </g>`;
}
