import { useMemo, useState } from 'react';
import { CATEGORIAS } from '../../data/categorias';
import { Arte } from '../componentes/Arte';
import type { EligeImagen as Datos, EscuchaToca } from '../../contenido/tipos';
import { Tarjeta, tarjetasEnEscala, type PropsEjercicio } from './comun';

/**
 * 1. Elige la imagen y 7. Escucha y toca (la misma mecánica; en "escucha y toca" no hay texto:
 * solo la voz de Mixtle y los dibujos, para quienes todavía no leen).
 */
export function EligeImagen({ ejercicio, responder, bloqueado }: PropsEjercicio<Datos | EscuchaToca>) {
  const [acertada, setAcertada] = useState<string | null>(null);
  const [error, setError] = useState<{ id: string; vez: number } | null>(null);
  // Si las opciones se comparan por tamaño (brote, arbolito, árbol grande), van en la misma escala.
  const opciones = useMemo(() => tarjetasEnEscala(ejercicio.opciones), [ejercicio]);
  const conTexto = ejercicio.tipo === 'elige-imagen' && !!ejercicio.conTexto;
  // Si la pregunta es sobre un bote, el bote se ve a la izquierda con su nombre: no hace falta adivinar cuál es.
  const bote = ejercicio.tipo === 'elige-imagen' && ejercicio.bote ? CATEGORIAS.find((c) => c.id === ejercicio.bote) : undefined;

  return (
    <div className="flex flex-wrap items-center justify-center gap-[clamp(1rem,3vmin,2.5rem)]" data-ejercicio={ejercicio.tipo}>
      {bote && (
        <div className="flex flex-col items-center gap-2 pr-[clamp(0.5rem,2vmin,2rem)]" data-bote-pregunta={bote.id}>
          <Arte clave={`bote-${bote.id}`} className="h-[clamp(7rem,24vmin,15rem)]" />
          <span className="rounded-full border-4 bg-white px-4 py-1 text-[clamp(1.1rem,2.6vmin,1.8rem)] font-black" style={{ borderColor: bote.color, color: bote.color }}>
            {bote.nombre}
          </span>
        </div>
      )}
      {opciones.map((op) => (
        <Tarjeta
          key={op.id}
          tarjeta={op}
          conTexto={conTexto}
          estado={acertada === op.id ? 'bien' : acertada ? 'apagada' : error?.id === op.id ? 'mal' : 'normal'}
          sacudir={error?.id === op.id ? error.vez : 0}
          onClick={() => {
            if (bloqueado || acertada) return;
            if (op.id === ejercicio.correcta) {
              setAcertada(op.id);
              responder({ correcto: true, terminado: true });
            } else {
              setError((e) => ({ id: op.id, vez: (e?.vez ?? 0) + 1 }));
              responder({ correcto: false, terminado: false });
            }
          }}
        />
      ))}
    </div>
  );
}
