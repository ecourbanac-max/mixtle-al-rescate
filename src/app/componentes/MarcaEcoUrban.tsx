import { CAJA_LOGOTIPO, logotipoEcoUrban } from '../../arte/pinEcoUrban';

/*
 * La marca de Eco Urban en las pantallas (v3.1.2): solo el logotipo "eco urban", a todo color y sin
 * deformar, sobre una pastilla blanca semitransparente, como una marca de agua discreta en una esquina.
 * Mide de 14 px de alto (celular) a 22 px (compu grande); en una laptop de 1366×768, 20 px. No se puede
 * tocar ni es un enlace: el juego es para niñas y niños y nadie debe salir de él por accidente. Es el
 * mismo trazo del pin de Mixtle: no suma peso. No va dentro de las lecciones (ahí no debe distraer).
 *
 * `esquina`: dónde se pega (fija a la pantalla, con un margen pequeño). Sin esquina, va en su lugar
 * (el diploma, que la lleva en su pie para que salga al imprimir).
 */
const { x, y, ancho, alto } = CAJA_LOGOTIPO;
const LOGOTIPO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${ancho} ${alto}" width="100%" height="100%" aria-hidden="true" focusable="false">${logotipoEcoUrban()}</svg>`;

const ESQUINAS = {
  'abajo-derecha': 'fixed right-[clamp(0.4rem,1.2vmin,0.9rem)] bottom-[clamp(0.4rem,1.2vmin,0.9rem)]',
  'abajo-izquierda': 'fixed left-[clamp(0.4rem,1.2vmin,0.9rem)] bottom-[clamp(0.4rem,1.2vmin,0.9rem)]',
  'arriba-izquierda': 'fixed left-[clamp(0.4rem,1.2vmin,0.9rem)] top-[clamp(0.4rem,1.2vmin,0.9rem)]',
} as const;

export type EsquinaMarca = keyof typeof ESQUINAS;

/** Alto del logotipo: 14 px en un celular, ~20 px en una laptop de 1366×768, 22 px como mucho. */
export const ALTO_MARCA = 'clamp(14px, 2.6vmin, 22px)';

interface Props {
  esquina?: EsquinaMarca;
  /** Otro alto (el diploma la mide contra su propio ancho para que salga igual en papel). */
  alto?: string;
  className?: string;
}

export function MarcaEcoUrban({ esquina, alto: altoLogo = ALTO_MARCA, className = '' }: Props) {
  return (
    <span
      className={`marca-eco-urban pointer-events-none z-20 inline-flex select-none items-center rounded-full bg-white/60 px-[0.55em] py-[0.3em] shadow-[0_1px_4px_rgba(18,61,43,0.12)] ${esquina ? ESQUINAS[esquina] : ''} ${className}`}
      style={{ fontSize: altoLogo }}
      role="img"
      aria-label="Eco Urban"
      data-marca-eco-urban={esquina ?? 'en-su-lugar'}
    >
      <span aria-hidden="true" className="block h-[1em]" style={{ aspectRatio: `${ancho} / ${alto}` }} dangerouslySetInnerHTML={{ __html: LOGOTIPO }} />
    </span>
  );
}
