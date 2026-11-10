import { useMemo, useState } from 'react';
import type { Parejas as Datos } from '../../contenido/tipos';
import { sonido } from '../../servicios/sonido';
import { Tarjeta, revolver, tarjetasEnEscala, type PropsEjercicio } from './comun';

type Lado = 'izquierda' | 'derecha';

/** 3. Parejas: tocar una tarjeta de un lado y luego su pareja del otro lado. */
export function Parejas({ ejercicio, responder, bloqueado }: PropsEjercicio<Datos>) {
  // Todas las tarjetas se ven a la vez: las que se comparan por tamaño van en la misma escala.
  const tarjetas = useMemo(() => {
    const todas = tarjetasEnEscala(ejercicio.pares.flatMap((p) => [p.izquierda, p.derecha]));
    return { izquierdas: todas.filter((_, i) => i % 2 === 0), derechas: revolver(todas.filter((_, i) => i % 2 === 1)) };
  }, [ejercicio]);
  const [elegida, setElegida] = useState<{ lado: Lado; id: string } | null>(null);
  const [unidas, setUnidas] = useState<string[]>([]);
  const [error, setError] = useState<{ ids: string[]; vez: number } | null>(null);

  const parDe = (lado: Lado, id: string) => ejercicio.pares.find((p) => p[lado].id === id)!;

  const tocar = (lado: Lado, id: string) => {
    if (bloqueado) return;
    const par = parDe(lado, id);
    if (unidas.includes(par.izquierda.id)) return;
    if (!elegida || elegida.lado === lado) {
      setElegida({ lado, id });
      sonido.tocar('toque');
      return;
    }
    const otro = parDe(elegida.lado, elegida.id);
    if (otro === par) {
      const nuevas = [...unidas, par.izquierda.id];
      setUnidas(nuevas);
      setElegida(null);
      if (nuevas.length === ejercicio.pares.length) responder({ correcto: true, terminado: true });
      else sonido.tocar('acierto');
    } else {
      setError((e) => ({ ids: [id, elegida.id], vez: (e?.vez ?? 0) + 1 }));
      setElegida(null);
      responder({ correcto: false, terminado: false });
    }
  };

  const estado = (lado: Lado, id: string) => {
    const par = parDe(lado, id);
    if (unidas.includes(par.izquierda.id)) return 'bien' as const;
    if (elegida?.lado === lado && elegida.id === id) return 'elegida' as const;
    if (error?.ids.includes(id)) return 'mal' as const;
    return 'normal' as const;
  };

  // La columna (2 a 4 tarjetas, más altas si llevan texto) tiene que caber con margen en el espacio
  // del ejercicio (≈60 % del alto de la pantalla, debajo de Mixtle): el tamaño sale de ahí.
  const filas = ejercicio.pares.length;
  const separacion = 'clamp(0.75rem,2vmin,1.5rem)';
  const tamano = `max(5rem, min(22vw, 14rem, calc((58vh - ${filas - 1} * ${separacion}) / ${filas})))`;
  // Con texto, las tarjetas van acostadas (dibujo y nombre lado a lado): mismo alto, más anchas.
  const ancho = ejercicio.conTexto ? 'min(32vw, 21rem)' : undefined;
  return (
    <div className="flex items-center justify-center gap-[clamp(2rem,10vmin,8rem)]" data-ejercicio="parejas">
      {(['izquierda', 'derecha'] as const).map((lado) => (
        <div key={lado} className="flex flex-col" style={{ gap: separacion }}>
          {(lado === 'izquierda' ? tarjetas.izquierdas : tarjetas.derechas).map((t) => (
            <Tarjeta
              key={t.id}
              tarjeta={t}
              tamano={tamano}
              ancho={ancho}
              conTexto={!!ejercicio.conTexto}
              estado={estado(lado, t.id)}
              sacudir={error?.ids.includes(t.id) ? error.vez : 0}
              onClick={() => tocar(lado, t.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
