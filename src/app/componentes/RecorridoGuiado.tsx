import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TEXTOS_APP } from '../../contenido/textosApp';
import { pasosDisponibles, type PasoRecorrido } from '../../logica/recorridoGuiado';
import { useApp } from '../estado/app';
import { callar, decir } from '../estado/narrador';
import { BotonGrande } from './BotonGrande';
import { MixtleGuia } from './MixtleGuia';

/** Aire alrededor de lo señalado (px). */
const MARGEN = 10;
/** Al desplazar el camino, lo señalado queda a esta distancia del borde de arriba (px). */
const AIRE_ARRIBA = 24;

type Caja = { x: number; y: number; w: number; h: number };

const buscar = (objetivo: string) => document.querySelector<HTMLElement>(`[data-recorrido="${objetivo}"]`);

function textoDe(p: PasoRecorrido): string {
  const t = TEXTOS_APP.recorrido;
  if (p.id === 'sistema' && !document.fullscreenEnabled) return t.sistemaSinPantalla;
  return t.dice[p.id];
}

/**
 * El hueco que se deja sin oscurecer: el elemento con lo que sobresale de él (el título del parque
 * va medio afuera de su marco), con aire alrededor y sin salirse de la pantalla.
 */
function cajaSenalada(el: HTMLElement): Caja {
  let { left, top, right, bottom } = el.getBoundingClientRect();
  for (const hijo of el.children) {
    const r = hijo.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    left = Math.min(left, r.left);
    top = Math.min(top, r.top);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  const x = Math.max(2, left - MARGEN);
  const y = Math.max(2, top - MARGEN);
  return { x, y, w: Math.min(window.innerWidth - 2, right + MARGEN) - x, h: Math.min(window.innerHeight - 2, bottom + MARGEN) - y };
}

/** Si lo señalado está dentro del camino (que se desplaza), lo sube hasta arriba para que quepa la tarjeta abajo. */
function llevarALaVista(el: HTMLElement, suave: boolean): void {
  const contenedor = el.closest<HTMLElement>('.overflow-y-auto');
  if (!contenedor) return;
  const arriba = el.getBoundingClientRect().top - contenedor.getBoundingClientRect().top;
  contenedor.scrollTo({ top: contenedor.scrollTop + arriba - AIRE_ARRIBA, behavior: suave ? 'auto' : 'smooth' });
}

/**
 * Recorrido guiado por el camino: señala una cosa a la vez (lo demás se oscurece) y Mixtle dice para
 * qué sirve. "Saltar" siempre a la vista (y Escape); las flechas del teclado avanzan y regresan. Mientras
 * dura, no se puede tocar lo de abajo: solo se explica.
 */
export function RecorridoGuiado({ alTerminar }: { alTerminar: () => void }) {
  const suave = useApp((s) => s.suave);
  // Los pasos se eligen ya montado el camino: solo los que tienen su elemento en pantalla.
  const [pasos, setPasos] = useState<PasoRecorrido[] | null>(null);
  const [i, setI] = useState(0);
  /** La caja de lo señalado y de qué paso es (la de un paso anterior no se dibuja). */
  const [senalada, setSenalada] = useState<{ de: string; caja: Caja } | null>(null);
  /** La fila de abajo: su último botón ("Siguiente" o "¡A jugar!") recibe el foco en cada paso. */
  const botones = useRef<HTMLDivElement>(null);

  // En el cuadro siguiente al montar, el camino ya está en pantalla y se sabe qué se puede señalar.
  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setPasos(pasosDisponibles((o) => !!buscar(o))));
    return () => cancelAnimationFrame(cuadro);
  }, []);
  const paso = pasos?.[i];
  const ultimo = !!pasos && i === pasos.length - 1;
  const caja = paso && senalada?.de === paso.id ? senalada.caja : null;

  // Cada paso: llevarlo a la vista, decirlo y seguir su caja (el camino puede seguir desplazándose).
  useEffect(() => {
    if (!paso) return;
    const el = paso.objetivo ? buscar(paso.objetivo) : null;
    if (el) llevarALaVista(el, suave);
    decir(textoDe(paso), { expresion: paso.id === 'fin' ? 'celebrando' : paso.objetivo ? 'senalando' : 'feliz', interrumpir: true });
    botones.current?.querySelector<HTMLButtonElement>(':scope > button:last-child')?.focus({ preventScroll: true });
    if (!el) return;
    let antes: Caja | null = null;
    const seguir = () => {
      const ahora = cajaSenalada(el);
      if (!antes || Math.abs(ahora.x - antes.x) + Math.abs(ahora.y - antes.y) + Math.abs(ahora.w - antes.w) + Math.abs(ahora.h - antes.h) > 1) {
        antes = ahora;
        setSenalada({ de: paso.id, caja: ahora });
      }
      cuadro = requestAnimationFrame(seguir);
    };
    let cuadro = requestAnimationFrame(seguir);
    return () => cancelAnimationFrame(cuadro);
  }, [paso, suave]);

  const terminar = () => {
    callar();
    alTerminar();
  };
  const avanzar = () => (ultimo ? terminar() : setI((n) => n + 1));
  const regresar = () => setI((n) => Math.max(0, n - 1));

  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') terminar();
      else if (e.key === 'ArrowRight') avanzar();
      else if (e.key === 'ArrowLeft') regresar();
    };
    window.addEventListener('keydown', alTecla);
    return () => window.removeEventListener('keydown', alTecla);
  });

  if (!pasos || !paso) return null;

  // La tarjeta va del lado con más espacio: abajo si lo señalado está arriba, y al revés.
  const alto = typeof window === 'undefined' ? 0 : window.innerHeight;
  const tarjetaArriba = !!caja && caja.y > alto - (caja.y + caja.h);

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={TEXTOS_APP.recorrido.etiqueta} data-recorrido-guiado={paso.id}>
      {/* Lo de abajo no se toca durante el recorrido: solo se explica. */}
      <div className={`absolute inset-0 ${caja ? '' : 'bg-verde-oscuro/70'}`} />
      {caja && (
        // El hueco señalado: lo demás se oscurece con una sombra enorme; el borde dorado lo marca.
        <motion.div
          className="pointer-events-none absolute rounded-[1.75rem] border-[5px] border-sol"
          style={{ left: caja.x, top: caja.y, width: caja.w, height: caja.h, boxShadow: '0 0 0 200vmax rgb(18 61 43 / 0.72)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-senalado={paso.objetivo}
        />
      )}
      <motion.div
        key={paso.id}
        className={`absolute left-1/2 flex w-[min(46rem,94vw)] -translate-x-1/2 flex-col gap-3 rounded-[2rem] border-[6px] border-white bg-crema p-[clamp(1rem,3vmin,1.75rem)] shadow-[0_0.6rem_0_rgba(0,0,0,0.25)] ${
          !caja ? 'top-1/2 -translate-y-1/2' : tarjetaArriba ? 'top-[clamp(1rem,3vmin,2rem)]' : 'bottom-[clamp(1rem,3vmin,2rem)]'
        }`}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        <MixtleGuia alto="clamp(5.5rem,13vmin,8.5rem)" globo="derecha" anchoGlobo="min(32rem,62vw)" />
        {/* Una sola fila abajo (la tarjeta cabe junto a lo señalado): la cuenta y "Saltar" a la izquierda. */}
        <div ref={botones} className="flex flex-wrap items-center justify-end gap-3">
          <div className="mr-auto flex items-center gap-3">
            <span className="rounded-full bg-verde px-4 py-1 text-[clamp(1rem,2.2vmin,1.35rem)] font-black text-white" data-paso-recorrido>
              {TEXTOS_APP.recorrido.paso(i + 1, pasos.length)}
            </span>
            {!ultimo && (
              <BotonGrande color="gris" className="h-16 text-[clamp(1.1rem,2.5vmin,1.6rem)]" onClick={terminar}>
                {TEXTOS_APP.recorrido.saltar}
              </BotonGrande>
            )}
          </div>
          {i > 0 && (
            <BotonGrande color="gris" className="h-16 text-[clamp(1.1rem,2.5vmin,1.6rem)]" onClick={regresar}>
              {TEXTOS_APP.recorrido.atras}
            </BotonGrande>
          )}
          <BotonGrande color="verde" latir className="h-16 text-[clamp(1.1rem,2.5vmin,1.6rem)]" onClick={avanzar}>
            {ultimo ? TEXTOS_APP.recorrido.listo : TEXTOS_APP.recorrido.siguiente}
          </BotonGrande>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
