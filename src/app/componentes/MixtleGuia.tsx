import type { VersionPin } from '../../arte/pinEcoUrban';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TEXTOS_APP } from '../../contenido/textosApp';
import { repetir, useNarrador } from '../estado/narrador';
import { Arte } from './Arte';
import { BotonGrande } from './BotonGrande';
import { MixtleFigura, type ExpresionMixtle } from './MixtleFigura';

/** Mientras habla, la boca se abre y se cierra. */
function useBoca(hablando: boolean, expresion: ExpresionMixtle): ExpresionMixtle {
  const [abierta, setAbierta] = useState(false);
  useEffect(() => {
    if (!hablando) return;
    const id = window.setInterval(() => setAbierta((a) => !a), 160);
    return () => {
      window.clearInterval(id);
      setAbierta(false);
    };
  }, [hablando]);
  if (!hablando || ['celebrando', 'feliz', 'sorprendido'].includes(expresion)) return expresion;
  return abierta ? 'habla' : expresion;
}

/** Con `soloMientrasHabla`, el globo se queda 2 s más después de que Mixtle termina y luego se va. */
function useVisibleTrasHablar(hablando: boolean, soloMientrasHabla: boolean): boolean {
  const [oculto, setOculto] = useState(false);
  useEffect(() => {
    if (!soloMientrasHabla || hablando) return;
    const id = window.setTimeout(() => setOculto(true), 2000);
    return () => {
      window.clearTimeout(id);
      setOculto(false);
    };
  }, [hablando, soloMientrasHabla]);
  return !soloMientrasHabla || hablando || !oculto;
}

interface Props {
  /** Alto de Mixtle. */
  alto: string;
  /** Dónde va el globo respecto a Mixtle. */
  globo?: 'derecha' | 'izquierda' | 'arriba';
  /**
   * El subtítulo solo se ve mientras Mixtle habla (y un momento después), para no tapar la pantalla.
   * En las lecciones se deja fijo: la consigna sigue a la vista.
   */
  soloMientrasHabla?: boolean;
  /** Ocultar el globo (por ejemplo, cuando el banner ya muestra la misma frase). */
  sinGlobo?: boolean;
  /** Con el globo arriba: de qué lado se alinea con Mixtle ('inicio' = izquierda, 'fin' = derecha). */
  alinear?: 'inicio' | 'fin';
  /** Ancho máximo del globo (CSS). */
  anchoGlobo?: string;
  /** Con el globo a un lado: que empiece a la altura de la cabeza de Mixtle y crezca hacia abajo. */
  globoDesdeArriba?: boolean;
  /** Mixtle mirando al otro lado. */
  espejo?: boolean;
  /** Versión del pin de Eco Urban (ver MixtleFigura). */
  pin?: VersionPin;
  /** Expresión fija (por ejemplo, señalando en el camino); la boca se sigue moviendo al hablar. */
  expresionFija?: ExpresionMixtle;
  className?: string;
}

/**
 * Mixtle con su globo de subtítulo y el botón para repetir lo que dijo.
 * El texto acompaña a la voz; nunca es la única forma de entender.
 */
export function MixtleGuia({
  alto,
  globo = 'derecha',
  soloMientrasHabla = false,
  sinGlobo = false,
  alinear = 'inicio',
  anchoGlobo = 'min(38rem,60vw)',
  globoDesdeArriba = false,
  espejo = false,
  pin = 'chico',
  expresionFija,
  className = '',
}: Props) {
  const { subtitulo, hablando, expresion } = useNarrador();
  const cara = useBoca(hablando, expresionFija ?? expresion);
  const visible = useVisibleTrasHablar(hablando, soloMientrasHabla);
  return (
    // Solo Mixtle y el botón de repetir reciben toques; el resto deja pasar los toques a lo de abajo.
    <div
      className={`pointer-events-none flex ${
        globo === 'arriba' ? `flex-col-reverse ${alinear === 'fin' ? 'items-end' : 'items-start'}` : `${globo === 'izquierda' ? 'flex-row-reverse' : ''} ${globoDesdeArriba ? 'items-start' : 'items-end'}`
      } gap-3 ${className}`}
    >
      <button type="button" aria-label="Mixtle: escuchar otra vez" className="pointer-events-auto shrink-0 cursor-pointer" onClick={repetir}>
        <MixtleFigura alto={alto} expresion={cara} espejo={espejo} pin={pin} />
      </button>
      <AnimatePresence mode="wait">
        {subtitulo && visible && !sinGlobo && (
          <motion.div
            key={subtitulo}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative mb-[4%] flex items-center gap-3 rounded-[1.75rem] border-4 border-verde bg-white px-5 py-3 shadow-[0_0.4rem_0_rgba(31,107,74,0.25)]"
            style={{ maxWidth: anchoGlobo }}
            role="status"
            aria-live="polite"
          >
            <p className="text-[clamp(1.25rem,2.6vmin,2.1rem)] leading-snug font-extrabold text-tinta">{subtitulo}</p>
            <BotonGrande
              color="verde"
              etiqueta={TEXTOS_APP.leccion.escucharOtraVez}
              className="pointer-events-auto size-16 shrink-0"
              icono={<Arte clave="icono-repetir" className="size-10" />}
              onClick={repetir}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
