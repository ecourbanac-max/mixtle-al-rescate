import { ARTE_ACCESORIOS } from '../../arte/accesorios';
import { catalogoArte } from '../../arte/catalogo';
import { estiloPinEncima } from '../../arte/pinEcoUrban';
import { ANCLAS_MASCOTA, ACCESORIOS, type Ancla, type IdAccesorio } from '../../logica/accesorios';
import { mascota as datosMascota, type IdMascota } from '../../logica/grupos';
import { Arte, registrarArte } from './Arte';

registrarArte(ARTE_ACCESORIOS);

/** Proporción de cada dibujo de mascota (ancho / alto), para que los accesorios caigan en su lugar. */
const PROPORCION = new Map(catalogoArte().map((a) => [a.clave, a.ancho / a.alto]));

/** Ancho / alto del dibujo de una mascota (para darle un alto que también quepa a lo ancho). */
export function proporcionMascota(mascota: IdMascota): number {
  return PROPORCION.get(datosMascota(mascota).arte) ?? 1;
}

/**
 * Cuánto sobresale un accesorio del dibujo de la mascota, como fracción del alto del dibujo (la capa
 * de la ardilla baja por debajo de los pies, la mochila asoma por un lado). El recuadro de la vista
 * previa deja este margen alrededor para que nada se salga de él.
 */
export const MARGEN_ACCESORIOS = 0.16;

interface Props {
  mascota: IdMascota;
  /** Accesorios puestos (se dibujan encima; la capa, detrás). */
  puestos?: readonly IdAccesorio[];
  /**
   * Diámetro mínimo en pantalla del pin de Eco Urban de Mixtle (16 px). 0 en los íconos del tamaño de
   * una ficha (encabezado, nombre del grupo en el camino): ahí sería un botón gigante, como en el ícono de la app.
   */
  pinMinimoPx?: number;
  className?: string;
}

/**
 * La mascota del grupo con sus accesorios. Cada accesorio se coloca en su ancla (cabeza, ojos,
 * cuello, espalda…) medida sobre el dibujo de esa mascota, en % de su caja.
 */
export function MascotaVestida({ mascota, puestos = [], pinMinimoPx = 16, className = '' }: Props) {
  const arte = datosMascota(mascota).arte;
  const anclas = ANCLAS_MASCOTA[mascota];
  // Mixtle trae su pin de Eco Urban prendido al pecho: va encima de todo, también del paliacate (como
  // prendido a la tela), y nunca mide menos de 16 px. Por eso aquí se usa su dibujo sin pin y el pin aparte.
  const esMixtle = mascota === 'cacomixtle';
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${PROPORCION.get(arte) ?? 1}` }} data-mascota-vestida={mascota} data-puestos={puestos.join(' ')}>
      {ACCESORIOS.filter((a) => a.detras && !anclas[a.id].encima && puestos.includes(a.id)).map((a) => (
        <Accesorio key={a.id} id={a.id} ancla={anclas[a.id]} />
      ))}
      <Arte clave={esMixtle ? 'mixtle-entero-sin-pin' : arte} className="relative h-full w-full object-contain" />
      {ACCESORIOS.filter((a) => (!a.detras || anclas[a.id].encima) && puestos.includes(a.id)).map((a) => (
        <Accesorio key={a.id} id={a.id} ancla={anclas[a.id]} />
      ))}
      {esMixtle && (
        <Arte
          clave="pin-eco-urban-chico"
          className="pointer-events-none absolute max-w-none"
          style={{ left: PIN_MIXTLE.left, top: PIN_MIXTLE.top, width: pinMinimoPx === 16 ? PIN_MIXTLE.width : estiloPinEncima(CAJA_ENTERO, undefined, pinMinimoPx).width, translate: `-${PIN_MIXTLE.origen.split(' ')[0]} -${PIN_MIXTLE.origen.split(' ')[1]}` }}
          data-pin-mixtle="chico"
          data-pin-minimo={pinMinimoPx}
        />
      )}
    </div>
  );
}

/** El pin en el dibujo de Mixtle entero (472×440: el cuerpo en el mismo lugar que en su dibujo solo). */
const CAJA_ENTERO = { ancho: 472, alto: 440 };
const PIN_MIXTLE = estiloPinEncima(CAJA_ENTERO);

function Accesorio({ id, ancla }: { id: IdAccesorio; ancla: Ancla }) {
  const datos = ACCESORIOS.find((a) => a.id === id)!;
  return (
    <Arte
      clave={`accesorio-${id}`}
      className="pointer-events-none absolute max-w-none"
      style={{
        left: `${ancla.x * 100}%`,
        top: `${ancla.y * 100}%`,
        width: `${ancla.w * 100}%`,
        transform: `translate(${-datos.origen.x * 100}%, ${-datos.origen.y * 100}%) rotate(${ancla.r ?? 0}deg)`,
        transformOrigin: `${datos.origen.x * 100}% ${datos.origen.y * 100}%`,
      }}
      data-accesorio-puesto={id}
    />
  );
}
