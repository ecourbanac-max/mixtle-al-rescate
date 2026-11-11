import { CAJA_LOGOTIPO, logotipoEcoUrban } from '../../arte/pinEcoUrban';

/*
 * "Un proyecto de [eco urban]": una pastilla blanca con sombra suave (como los demás letreros del juego)
 * con el logotipo de Eco Urban a todo color y sin deformar (el mismo trazo del pin: no suma peso). No es
 * un enlace: el juego es para niñas y niños y nadie debe salir de él por accidente.
 */
const { x, y, ancho, alto } = CAJA_LOGOTIPO;
const LOGOTIPO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${ancho} ${alto}" width="100%" height="100%" aria-hidden="true" focusable="false">${logotipoEcoUrban()}</svg>`;

interface Props {
  /** "Un proyecto de", "Con el apoyo de"… */
  texto: string;
  /** El tamaño sale del tamaño de letra (font-size) que se le dé. */
  className?: string;
}

export function SelloEcoUrban({ texto, className = '' }: Props) {
  return (
    <span
      className={`sello-eco-urban pointer-events-none inline-flex shrink-0 items-center gap-[0.45em] rounded-full bg-white px-[0.9em] py-[0.35em] leading-none font-extrabold whitespace-nowrap text-tinta shadow-[0_0.2em_0.8em_rgba(18,61,43,0.2)] ${className}`}
      role="img"
      aria-label={`${texto} Eco Urban`}
      data-sello-eco-urban
    >
      <span aria-hidden="true">{texto}</span>
      <span aria-hidden="true" className="block h-[1.15em]" style={{ aspectRatio: `${ancho} / ${alto}` }} dangerouslySetInnerHTML={{ __html: LOGOTIPO }} />
    </span>
  );
}
