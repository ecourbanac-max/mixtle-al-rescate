import { motion } from 'motion/react';
import { useState } from 'react';
import type { EncuentraError as Datos } from '../../contenido/tipos';
import { sonido } from '../../servicios/sonido';
import { Arte } from '../componentes/Arte';
import type { PropsEjercicio } from './comun';

/**
 * 6. Encuentra el error: una escena con cosas que están mal; hay que tocarlas todas.
 *
 * La escena ocupa todo el espacio que le deja la lección (alto y ancho, en 16:9) y cabe completa en
 * cualquier pantalla: compu, laptop con zoom, celular y proyector. La lección le aparta abajo el alto de
 * la barra de respuesta (.leccion-cuerpo en estilos.css), así que la barra nunca tapa un objeto. El
 * marcador de lo encontrado va encima del cielo, para no restarle alto a la escena. Cada objeto se toca
 * en un área de al menos 48 px (o su tamaño, si es mayor); el contenido cuida que no se encimen
 * (e2e/encuentra.spec.ts lo mide en compu y en celular).
 */
export function EncuentraError({ ejercicio, responder, bloqueado }: PropsEjercicio<Datos>) {
  const errores = ejercicio.objetos.filter((o) => o.mal);
  const [encontrados, setEncontrados] = useState<string[]>([]);
  const [sacudir, setSacudir] = useState<{ id: string; vez: number } | null>(null);

  const tocar = (id: string, mal: boolean) => {
    if (bloqueado || encontrados.includes(id)) return;
    if (mal) {
      const nuevos = [...encontrados, id];
      setEncontrados(nuevos);
      if (nuevos.length === errores.length) responder({ correcto: true, terminado: true });
      else sonido.tocar('acierto');
    } else {
      setSacudir((s) => ({ id, vez: (s?.vez ?? 0) + 1 }));
      responder({ correcto: false, terminado: false });
    }
  };

  return (
    <div className="grid h-full w-full place-items-center" style={{ containerType: 'size' }} data-ejercicio="encuentra-error">
      <div
        className="relative aspect-video overflow-hidden rounded-[1.75rem] border-[6px] border-white shadow-[0_0.5rem_0_rgba(18,61,43,0.25)]"
        style={{ width: 'min(100cqw, calc(100cqh * 16 / 9))' }}
        data-escena={ejercicio.escena}
      >
        <Arte clave={ejercicio.escena} className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute top-[3%] left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/70 px-2 py-1"
          aria-label={`Encontradas: ${encontrados.length} de ${errores.length}`}
          data-marcador-encontradas
        >
          {errores.map((e, i) => (
            <span key={e.id} className={`grid size-[clamp(1.5rem,4.5cqh,2.5rem)] place-items-center rounded-full border-[3px] border-white ${i < encontrados.length ? 'bg-verde' : 'bg-verde/20'}`}>
              {i < encontrados.length && <Arte clave="palomita" className="size-[65%]" />}
            </span>
          ))}
        </div>
        {ejercicio.objetos.map((o) => {
          const hallado = encontrados.includes(o.id);
          return (
            <motion.button
              key={`${o.id}-${sacudir?.id === o.id ? sacudir.vez : 0}`}
              type="button"
              aria-label={o.nombre}
              data-objeto={o.id}
              onClick={() => tocar(o.id, o.mal)}
              initial={false}
              animate={sacudir?.id === o.id ? { x: [0, -10, 10, -6, 6, 0] } : hallado ? { scale: [1, 1.2, 1] } : {}}
              className={`absolute grid min-h-12 min-w-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full ${hallado ? 'ring-[6px] ring-verde' : ''}`}
              style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.ancho}%`, aspectRatio: '1' }}
            >
              <Arte clave={o.arte} className="h-full w-full object-contain" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
