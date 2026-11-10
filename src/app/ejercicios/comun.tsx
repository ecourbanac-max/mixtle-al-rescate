import { motion } from 'motion/react';
import { enEscala, esDibujoEnEscala } from '../../arte/escala';
import type { Tarjeta as DatosTarjeta } from '../../contenido/tipos';
import type { Locucion } from '../../voz/locucion';
import { sonido } from '../../servicios/sonido';
import { Arte } from '../componentes/Arte';
import { chispas } from '../efectos/efectos';

/** Lo que un ejercicio le avisa a la lección cada vez que el grupo intenta algo. */
export interface Respuesta {
  correcto: boolean;
  /** true cuando el ejercicio completo quedó resuelto. */
  terminado: boolean;
  /** Pista más precisa que la del ejercicio (por ejemplo, la del bote correcto). */
  pista?: Locucion;
  /** Frase al acertar (por ejemplo, el "por qué" en ¿Sí o no?). */
  exito?: Locucion;
}

export interface PropsEjercicio<E> {
  ejercicio: E;
  responder: (r: Respuesta) => void;
  /** true mientras se muestra el banner de respuesta (no se puede tocar nada). */
  bloqueado: boolean;
}

export type EstadoTarjeta = 'normal' | 'elegida' | 'bien' | 'mal' | 'apagada';

interface PropsTarjeta {
  tarjeta: DatosTarjeta;
  estado?: EstadoTarjeta;
  /** Mostrar el nombre debajo del dibujo (apoyo para quienes ya leen). */
  conTexto?: boolean;
  /** Cambia cada vez que hay que sacudirla (error). */
  sacudir?: number;
  tamano?: string;
  /**
   * Tarjeta acostada: dibujo a la izquierda y nombre a la derecha, con el ancho dado. Sirve cuando hay
   * que apilar varias con texto (parejas) y no cabrían de pie.
   */
  ancho?: string;
  onClick?: () => void;
}

const BORDES: Record<EstadoTarjeta, string> = {
  normal: 'border-white bg-white',
  elegida: 'border-azul bg-cielo ring-8 ring-azul/30',
  bien: 'border-verde bg-verde-claro ring-8 ring-verde/30',
  mal: 'border-naranja bg-white',
  apagada: 'border-white bg-white opacity-40',
};

/** Tamaño de las tarjetas: grande en el proyector, sin salirse en una tablet de 1024×768. */
export const TAMANO_TARJETA = 'clamp(9rem,min(30vmin,22vw),20rem)';

/** Tarjeta ilustrada grande para tocar (siempre ≥ 64 px; el nombre se lee también en voz). */
export function Tarjeta({ tarjeta, estado = 'normal', conTexto = false, sacudir = 0, tamano = TAMANO_TARJETA, ancho, onClick }: PropsTarjeta) {
  const acostada = conTexto && !!ancho;
  // Los dibujos en escala ya traen su margen en el lienzo común: ocupan casi toda la tarjeta, para que el más
  // grande de la familia casi la llene.
  const anchoDibujo = esDibujoEnEscala(tarjeta.arte) ? 'w-[96%]' : 'w-[82%]';
  return (
    <motion.button
      type="button"
      aria-label={tarjeta.nombre}
      aria-pressed={estado === 'elegida' || estado === 'bien'}
      data-tarjeta={tarjeta.id}
      disabled={estado === 'apagada' || estado === 'bien'}
      onPointerDown={() => sonido.desbloquear()}
      onClick={(e) => {
        // Cada toque responde: unas chispas pequeñas donde se tocó (el sonido lo pone el ejercicio).
        if (e.clientX || e.clientY) chispas(e.clientX, e.clientY, { cantidad: 6, alcance: 45 });
        onClick?.();
      }}
      key={sacudir}
      initial={false}
      animate={sacudir ? { x: [0, -14, 14, -10, 10, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      whileTap={{ scaleX: 1.05, scaleY: 0.92 }}
      className={`relative flex cursor-pointer ${acostada ? 'flex-row gap-3 px-4' : 'flex-col gap-1'} items-center justify-center rounded-[1.75rem] border-[6px] p-3 shadow-[0_0.45rem_0_rgba(18,61,43,0.25)] disabled:cursor-default ${BORDES[estado]}`}
      // Alto fijo (no mínimo): "la botella" y "el corazón de manzana" miden lo mismo.
      style={acostada ? { width: ancho, height: tamano } : { width: tamano, height: conTexto ? `calc(${tamano} * 1.3)` : tamano }}
    >
      <Arte clave={tarjeta.arte} data-arte={tarjeta.arte} className={acostada ? 'h-[82%] w-[40%] shrink-0 object-contain' : `min-h-0 ${anchoDibujo} flex-1 object-contain`} />
      {conTexto && (
        <span
          className={`flex items-center text-[clamp(1rem,2.4vmin,1.7rem)] leading-tight font-extrabold text-tinta ${acostada ? 'min-w-0 flex-1 text-left' : 'h-[2.5em] shrink-0 text-center'}`}
        >
          {tarjeta.nombre}
        </span>
      )}
      {estado === 'bien' && (
        <span className="absolute -top-4 -right-4 grid size-12 place-items-center rounded-full border-4 border-white bg-verde">
          <Arte clave="palomita" className="size-7" />
        </span>
      )}
    </motion.button>
  );
}

/**
 * Las tarjetas que se van a ver juntas, con los dibujos que se comparan por tamaño en su versión en
 * escala (mismo lienzo y mismo suelo): el brote, el arbolito y el árbol grande ya no llenan cada uno
 * su tarjeta, y el más alto en pantalla es de verdad el más grande. Ver src/arte/escala.ts.
 */
export function tarjetasEnEscala<T extends DatosTarjeta>(tarjetas: readonly T[]): T[] {
  const artes = enEscala(tarjetas.map((t) => t.arte));
  return tarjetas.map((t, i) => (artes[i] === t.arte ? t : { ...t, arte: artes[i]! }));
}

/** Revuelve sin dejar el orden original (para que "ordena" nunca empiece resuelto). */
export function revolver<T>(lista: readonly T[], azar: () => number = Math.random): T[] {
  const copia = [...lista];
  for (let intento = 0; intento < 10; intento++) {
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(azar() * (i + 1));
      [copia[i], copia[j]] = [copia[j]!, copia[i]!];
    }
    if (copia.length < 2 || copia.some((x, i) => x !== lista[i])) return copia;
  }
  return [...copia.slice(1), copia[0]!];
}
