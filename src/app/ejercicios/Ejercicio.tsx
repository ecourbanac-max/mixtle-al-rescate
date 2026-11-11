import { ARTE_LASTIMADOS } from '../../arte/lastimados';
import type { Ejercicio as Datos } from '../../contenido/tipos';
import { registrarArte } from '../componentes/Arte';
import { AlBote } from './AlBote';
import type { PropsEjercicio } from './comun';
import { EligeImagen } from './EligeImagen';
import { EncuentraError } from './EncuentraError';
import { Ordena } from './Ordena';
import { Parejas } from './Parejas';
import { SiNo } from './SiNo';

// Dibujos que solo usan las lecciones (la rama rota, la lata tirada): llegan con ellas.
registrarArte(ARTE_LASTIMADOS);

/** Muestra el ejercicio que toque según su tipo. */
export function Ejercicio({ ejercicio, ...resto }: PropsEjercicio<Datos>) {
  switch (ejercicio.tipo) {
    case 'elige-imagen':
    case 'escucha-toca':
      return <EligeImagen ejercicio={ejercicio} {...resto} />;
    case 'al-bote':
      return <AlBote ejercicio={ejercicio} {...resto} />;
    case 'parejas':
      return <Parejas ejercicio={ejercicio} {...resto} />;
    case 'si-no':
      return <SiNo ejercicio={ejercicio} {...resto} />;
    case 'ordena':
      return <Ordena ejercicio={ejercicio} {...resto} />;
    case 'encuentra-error':
      return <EncuentraError ejercicio={ejercicio} {...resto} />;
  }
}
