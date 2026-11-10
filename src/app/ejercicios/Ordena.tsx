import { useMemo, useState } from 'react';
import type { Ordena as Datos } from '../../contenido/tipos';
import { sonido } from '../../servicios/sonido';
import { esDibujoEnEscala } from '../../arte/escala';
import { Arte } from '../componentes/Arte';
import { Tarjeta, revolver, tarjetasEnEscala, type PropsEjercicio } from './comun';

/**
 * 5. Ordena los pasos: se tocan las tarjetas en orden y van a su lugar (1, 2, 3…).
 * Si se toca una que no sigue, se sacude y regresa: así se ordena sin arrastrar.
 */
export function Ordena({ ejercicio, responder, bloqueado }: PropsEjercicio<Datos>) {
  // Si los pasos son etapas que se comparan por tamaño (cómo crece un árbol), van en la misma escala:
  // ya ordenados se ven de menor a mayor.
  const pasos = useMemo(() => tarjetasEnEscala(ejercicio.pasos), [ejercicio]);
  const revueltas = useMemo(() => revolver(pasos), [pasos]);
  const [puestas, setPuestas] = useState(0);
  const [error, setError] = useState<{ id: string; vez: number } | null>(null);
  const tamano = 'clamp(7rem,min(21vmin,16vw),14rem)';

  const tocar = (id: string) => {
    if (bloqueado) return;
    if (pasos[puestas]?.id === id) {
      const n = puestas + 1;
      setPuestas(n);
      if (n === pasos.length) responder({ correcto: true, terminado: true });
      else sonido.tocar('acierto');
    } else {
      setError((e) => ({ id, vez: (e?.vez ?? 0) + 1 }));
      responder({ correcto: false, terminado: false });
    }
  };

  return (
    <div className="flex flex-col items-center gap-[clamp(1.25rem,4vmin,3rem)]" data-ejercicio="ordena">
      <ol className="flex items-center gap-[clamp(0.5rem,2vmin,1.5rem)]">
        {pasos.map((paso, i) => (
          <li key={paso.id} className="flex items-center gap-[clamp(0.5rem,2vmin,1.5rem)]">
            <div
              className={`grid place-items-center rounded-[1.5rem] border-[5px] border-dashed ${i < puestas ? 'border-verde bg-verde-claro' : 'border-white/80 bg-white/40'}`}
              style={{ width: tamano, height: tamano }}
              aria-label={i < puestas ? `${i + 1}: ${paso.nombre}` : `Lugar ${i + 1}`}
            >
              {i < puestas ? (
                <Arte clave={paso.arte} data-arte={paso.arte} className={`object-contain ${esDibujoEnEscala(paso.arte) ? 'h-[92%] w-[92%]' : 'h-[80%] w-[80%]'}`} />
              ) : (
                <span className="text-[clamp(2rem,6vmin,4rem)] font-black text-white">{i + 1}</span>
              )}
            </div>
            {i < pasos.length - 1 && <Arte clave="icono-siguiente" className="size-10 opacity-80" />}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap justify-center gap-[clamp(0.75rem,2.5vmin,2rem)]">
        {revueltas.map((paso) => {
          const yaPuesta = pasos.findIndex((p) => p.id === paso.id) < puestas;
          return (
            <Tarjeta
              key={paso.id}
              tarjeta={paso}
              tamano={tamano}
              estado={yaPuesta ? 'apagada' : error?.id === paso.id ? 'mal' : 'normal'}
              sacudir={error?.id === paso.id ? error.vez : 0}
              onClick={() => tocar(paso.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
