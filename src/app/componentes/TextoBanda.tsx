import { BANDA, logotipoBanda } from '../../arte/bandaEcoUrban';

/*
 * El texto "eco urban" de la banda de guardián, encima de un dibujo de Mixtle que va como imagen (Mixtle
 * entero en el vestidor y en las fichas de grupo; Mixtle colgado en el inicio). La banda (la tela) ya viene
 * en el dibujo; el texto va aparte para que se vea solo cuando Mixtle es grande (container query en
 * estilos.css: el contenedor lleva la clase mascota-con-banda o colgado-con-banda).
 *
 * `caja`: el tamaño del dibujo (472×440 Mixtle entero, 360×600 colgado); el cuerpo está en (0, 0).
 */
export function TextoBanda({ caja }: { caja: { ancho: number; alto: number } }) {
  if (BANDA === 'ninguna') return null;
  return (
    <svg
      viewBox={`0 0 ${caja.ancho} ${caja.alto}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
      data-texto-banda
      dangerouslySetInnerHTML={{ __html: `<g class="banda-texto">${logotipoBanda(BANDA)}</g>` }}
    />
  );
}
