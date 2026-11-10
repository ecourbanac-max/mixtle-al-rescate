import { ETAPAS_CRECIMIENTO, claveEtapa } from './arboles';

/*
 * Dibujos que se comparan por su tamaño.
 *
 * Una tarjeta agranda su dibujo hasta llenarse; eso está bien para un dibujo solo, pero cuando la
 * consigna depende del tamaño ("Toca el árbol grande") cada dibujo llenaría su tarjeta y el tamaño en
 * pantalla ya no diría nada (así fue como el arbolito llegó a verse más alto que el árbol grande).
 *
 * Una "familia de escala" es un grupo de dibujos que tienen, además de su versión sola, una versión en
 * un lienzo común: mismo tamaño, misma escala y misma línea de suelo. Cuando dos o más dibujos de una
 * familia aparecen juntos en un ejercicio, el motor usa esa versión en los dos.
 *
 * Para agregar otra familia (por ejemplo, vasos de vacío a lleno): dibujar sus piezas en un lienzo
 * común, registrarlas en el catálogo y agregarlas aquí.
 */
const FAMILIAS: readonly ReadonlyMap<string, string>[] = [new Map(ETAPAS_CRECIMIENTO.map((clave) => [clave, claveEtapa(clave)]))];

/** Las familias, para la galería y las pruebas: cada una, de su dibujo más chico al más grande. */
export const FAMILIAS_DE_ESCALA: readonly (readonly { sola: string; enEscala: string }[])[] = FAMILIAS.map((f) => [...f].map(([sola, enEscala]) => ({ sola, enEscala })));

/** ¿Es la versión en escala de un dibujo? (Ya trae su propio margen: la tarjeta le da casi todo su espacio.) */
export function esDibujoEnEscala(clave: string): boolean {
  return FAMILIAS.some((f) => [...f.values()].includes(clave));
}

/**
 * Las claves de los dibujos que se van a mostrar juntos, cambiando a su versión en escala los que
 * comparten familia con algún otro de la lista. Las demás quedan igual.
 */
export function enEscala(claves: readonly string[]): string[] {
  return claves.map((clave) => {
    const familia = FAMILIAS.find((f) => f.has(clave));
    if (!familia) return clave;
    const acompanada = claves.some((otra) => otra !== clave && familia.has(otra));
    return acompanada ? familia.get(clave)! : clave;
  });
}
