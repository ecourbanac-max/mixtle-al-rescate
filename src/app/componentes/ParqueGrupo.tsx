import { AnimatePresence, motion } from 'motion/react';
import { claveImagenResiduo } from '../../arte/residuos';
import { RESIDUOS } from '../../data/residuos';
import { UNIDADES } from '../../contenido/unidades';
import { etapaParque, type ProgresoGrupo } from '../../logica/camino';
import { Arte } from './Arte';

/** Lugares fijos (en % del parque) para que cada cosa aparezca siempre en el mismo sitio. */
const BASURA = [
  [12, 84], [24, 92], [37, 82], [48, 93], [60, 85], [71, 94], [83, 84], [93, 92],
] as const;
const ARBOLES = [[8, 80], [30, 74], [52, 72], [68, 76], [86, 74], [97, 82]] as const;
const FLORES = [
  [18, 96], [34, 98], [44, 90], [58, 98], [66, 90], [78, 98], [90, 96], [4, 98],
  [26, 88], [52, 95], [73, 89], [96, 88], [11, 90], [84, 99],
] as const;

/** Dónde aparece cada animal del álbum cuando el grupo gana su estampa. */
const ANIMALES: Record<string, { arte: string; x: number; y: number; alto: number }> = {
  cacomixtle: { arte: 'mixtle-entero', x: 22, y: 92, alto: 34 },
  tlacuache: { arte: 'tlacuache', x: 40, y: 96, alto: 20 },
  colibri: { arte: 'colibri-feliz', x: 62, y: 46, alto: 13 },
  monarca: { arte: 'mariposa-feliz', x: 78, y: 52, alto: 13 },
  ajolote: { arte: 'ajolote', x: 90, y: 97, alto: 15 },
};

interface Props {
  progreso: ProgresoGrupo;
  className?: string;
}

/**
 * El parque del grupo: la meta visible ("estamos salvando nuestro parque").
 * Empieza gris y con basura; con las hojitas se limpia y crecen árboles y flores;
 * con cada estampa del álbum llega un animal.
 */
export function ParqueGrupo({ progreso, className = '' }: Props) {
  const etapa = etapaParque(progreso, UNIDADES);
  // De gris a verde: el color sigue el avance del grupo (cada lección se nota).
  const gris = 1 - etapa.avance;
  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border-[6px] border-white shadow-[0_0.5rem_0_rgba(18,61,43,0.25)] ${className}`}
      role="img"
      aria-label={`El parque del grupo: ${etapa.basura} basuras, ${etapa.arboles} árboles y ${etapa.flores} flores`}
      data-parque-basura={etapa.basura}
      data-parque-arboles={etapa.arboles}
      data-parque-flores={etapa.flores}
      data-parque-color={etapa.avance.toFixed(2)}
    >
      <Arte
        clave="parque"
        className="absolute inset-0 h-full w-full object-cover object-bottom transition-[filter] delay-300 duration-[2000ms] ease-out"
        style={{ filter: `grayscale(${gris}) saturate(${1 + etapa.avance * 0.25}) brightness(${1 - gris * 0.15})` }}
      />
      <AnimatePresence>
        {ARBOLES.slice(0, etapa.arboles).map(([x, y], i) => (
          <motion.div key={`a${i}`} className="absolute h-[38%] -translate-x-1/2 -translate-y-full" style={{ left: `${x}%`, top: `${y}%` }} initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }} transition={{ delay: 1 + i * 0.08, duration: 0.7 }}>
            <Arte clave="arbol" className="h-full origin-bottom" />
          </motion.div>
        ))}
        {FLORES.slice(0, etapa.flores).map(([x, y], i) => (
          <motion.div key={`f${i}`} className="absolute h-[18%] -translate-x-1/2 -translate-y-full" style={{ left: `${x}%`, top: `${y}%` }} initial={{ scale: 0, y: 10 }} animate={{ scale: [0, 1.3, 1], y: 0 }} transition={{ delay: 1.2 + i * 0.06, duration: 0.7 }}>
            <Arte clave={['flores-naranja', 'flores-morada', 'flores-amarilla'][i % 3]!} className="h-full" />
          </motion.div>
        ))}
        {BASURA.slice(0, etapa.basura).map(([x, y], i) => (
          <motion.div key={`b${i}`} className="absolute h-[13%] -translate-x-1/2 -translate-y-full" style={{ left: `${x}%`, top: `${y}%` }} exit={{ scale: 0.2, opacity: 0, y: -60, rotate: 160 }} transition={{ duration: 0.7, ease: 'easeIn' }}>
            <Arte clave={claveImagenResiduo(RESIDUOS[i % RESIDUOS.length]!.imagen)} className="h-full" />
          </motion.div>
        ))}
        {progreso.estampas.map((id, i) => {
          const a = ANIMALES[id];
          if (!a) return null;
          return (
            <motion.div key={id} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${a.x}%`, top: `${a.y}%`, height: `${a.alto}%` }} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.15 }}>
              <Arte clave={a.arte} className="h-full" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
