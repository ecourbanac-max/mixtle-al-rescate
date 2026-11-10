import { CATEGORIAS } from '../data/categorias';
import { ARBOLES } from './arboles';
import { arteBote, arteTapa } from './botes';
import { ESCENARIO } from './escenario';
import { FAUNA } from './fauna';
import { ICONOS } from './iconos';
import { OBJETOS } from './objetos';
import { PERSONAJES } from './personajes';
import { ARTE_RESIDUOS } from './residuos';
import type { ArteSvg } from './svg';

/** Todas las ilustraciones que BootScene rasteriza al iniciar. Los botes salen de categorias.ts. */
export function catalogoArte(): ArteSvg[] {
  return [
    ...ICONOS,
    ...PERSONAJES,
    ...FAUNA,
    ...OBJETOS,
    ...ARBOLES,
    ...ESCENARIO,
    ...ARTE_RESIDUOS,
    ...CATEGORIAS.flatMap((c) => [arteBote(c), arteTapa(c)]),
  ];
}
