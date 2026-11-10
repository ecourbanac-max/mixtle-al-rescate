import { motion } from 'motion/react';
import { useState } from 'react';
import { TEXTOS_APP } from '../../contenido/textosApp';
import type { SiNo as Datos } from '../../contenido/tipos';
import { sonido } from '../../servicios/sonido';
import { Arte } from '../componentes/Arte';
import type { PropsEjercicio } from './comun';

/** 4. ¿Sí o no?: una acción ilustrada y dos caritas (feliz = está bien, triste = no está bien). */
export function SiNo({ ejercicio, responder, bloqueado }: PropsEjercicio<Datos>) {
  const [resuelto, setResuelto] = useState(false);
  const [sacudir, setSacudir] = useState<{ cual: boolean; vez: number } | null>(null);

  const elegir = (si: boolean) => {
    if (bloqueado || resuelto) return;
    if (si === ejercicio.respuesta) {
      setResuelto(true);
      responder({ correcto: true, terminado: true, exito: ejercicio.porque });
    } else {
      setSacudir((s) => ({ cual: si, vez: (s?.vez ?? 0) + 1 }));
      responder({ correcto: false, terminado: false });
    }
  };

  const carita = (si: boolean) => (
    <motion.button
      type="button"
      key={sacudir?.cual === si ? sacudir.vez : 0}
      aria-label={si ? TEXTOS_APP.leccion.siEstaBien : TEXTOS_APP.leccion.noEstaBien}
      data-respuesta={si ? 'si' : 'no'}
      onPointerDown={() => sonido.desbloquear()}
      onClick={() => elegir(si)}
      initial={false}
      animate={sacudir?.cual === si ? { x: [0, -14, 14, -10, 10, 0] } : { x: 0 }}
      whileTap={{ scale: 0.92 }}
      disabled={resuelto && si !== ejercicio.respuesta}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-[2rem] p-2 disabled:opacity-30 ${resuelto && si === ejercicio.respuesta ? 'ring-8 ring-verde/40' : ''}`}
    >
      <Arte clave={si ? 'carita-feliz' : 'carita-triste'} className="size-[clamp(7.5rem,22vmin,14rem)]" />
      <span className="text-[clamp(1.1rem,2.4vmin,1.6rem)] font-extrabold text-tinta">{si ? TEXTOS_APP.leccion.siEstaBien : TEXTOS_APP.leccion.noEstaBien}</span>
    </motion.button>
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-[clamp(1.5rem,5vmin,4rem)]" data-ejercicio="si-no">
      {carita(true)}
      <div className="flex h-[clamp(10rem,33vmin,21rem)] items-center justify-center gap-2 rounded-[2rem] border-[6px] border-white bg-cielo p-4 shadow-[0_0.45rem_0_rgba(18,61,43,0.25)]">
        <Arte clave={ejercicio.arte} data-arte={ejercicio.arte} className="h-full max-w-[clamp(9rem,28vmin,18rem)] object-contain" />
        {ejercicio.junto && <Arte clave={ejercicio.junto} className="h-[62%] max-w-[clamp(6rem,18vmin,12rem)] self-end object-contain" />}
      </div>
      {carita(false)}
    </div>
  );
}
