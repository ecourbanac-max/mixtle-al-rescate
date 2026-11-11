import { motion } from 'motion/react';
import { useId, useMemo } from 'react';
import { estiloPinEncima, type VersionPin } from '../../arte/pinEcoUrban';
import { capasDeMixtle } from '../../arte/personajes';
import { Arte } from './Arte';

/*
 * Mixtle en React, armado igual que en las aventuras: el cuerpo (360×440 en el dibujo)
 * y la cola aparte (260×440), unida a la cadera en el punto (240, 400) del cuerpo.
 * El cuerpo va en línea (SVG dentro de la página) para que en reposo parpadee y mueva las orejas
 * (clases mixtle-vivo, mx-parpadeo y mx-oreja en estilos.css); la cola se mece aparte.
 */
const CUERPO = { ancho: 360, alto: 440 };
const COLA = { ancho: 260, alto: 440, x: 212, origenX: 28 / 260, origenY: 400 / 440 };

export type ExpresionMixtle = 'normal' | 'feliz' | 'habla' | 'pensando' | 'sorprendido' | 'celebrando' | 'senalando' | 'saluda' | 'animo' | 'duerme';

/**
 * El SVG del cuerpo. `sufijo` distingue los id de los degradados de este Mixtle de los de cualquier
 * otro en la página: si compartieran id, el navegador tomaría el primero del documento y, cuando ese
 * está en un SVG oculto (el logo de la pantalla de carga), Mixtle saldría sin relleno.
 */
function svgCapas(expresion: ExpresionMixtle, sufijo: string, espejo: boolean): { atras: string; adelante: string } {
  // La banda de guardián lleva su texto con la clase banda-texto: se ve solo si Mixtle es grande (estilos.css).
  const { atras, adelante } = capasDeMixtle(expresion, sufijo, 'css', undefined, espejo);
  const svg = (contenido: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CUERPO.ancho} ${CUERPO.alto}" width="100%" height="100%" aria-hidden="true">${contenido}</svg>`;
  return { atras: svg(atras), adelante: svg(adelante) };
}

/** El pin va aparte, entre el cuerpo y los brazos, en su lugar del pecho y con un mínimo de 16 px en pantalla. */
const PIN = estiloPinEncima(CUERPO);

/** Desfase estable (de 0 a -4 s) a partir de un texto, para que cada Mixtle tenga su propio ritmo. */
function desfaseDe(texto: string): string {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) % 997;
  return `${-((h % 40) / 10).toFixed(1)}s`;
}

/** Cómo se mueve el cuerpo con cada expresión (la cola tiene su propio ritmo). */
function movimiento(expresion: ExpresionMixtle) {
  if (expresion === 'celebrando') return { animate: { y: ['0%', '-6%', '0%'] }, transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' as const } };
  if (expresion === 'saluda') return { animate: { rotate: [0, 3, -2, 0] }, transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const } };
  if (expresion === 'animo') return { animate: { y: ['0%', '-2.5%', '0%'] }, transition: { duration: 0.7, repeat: Infinity, ease: 'easeOut' as const } };
  if (expresion === 'duerme') return { animate: { scaleY: [1, 1.035, 1] }, transition: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' as const } };
  return { animate: { scaleY: [1, 1.025, 1] }, transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const } };
}

interface Props {
  /** Alto de Mixtle (cualquier medida CSS). */
  alto: string;
  expresion?: ExpresionMixtle;
  /** Mirar hacia la izquierda (por ejemplo, para señalar algo que está a su izquierda). */
  espejo?: boolean;
  /**
   * Versión del pin de Eco Urban que trae en el pecho (siempre lo trae): "chico" (por omisión) donde Mixtle
   * se ve chico, como en la lección o el globo; "grande" donde se ve grande (vitrina, festejos).
   */
  pin?: VersionPin;
  className?: string;
}

export function MixtleFigura({ alto, expresion = 'normal', espejo = false, pin = 'chico', className = '' }: Props) {
  const anchoTotal = COLA.x + COLA.ancho;
  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  // Las partes van en posición absoluta: el contenedor necesita estar posicionado (relative si no se indica otra).
  const posicion = /\b(absolute|fixed|relative|sticky)\b/.test(className) ? '' : 'relative';
  // Cada Mixtle parpadea a su ritmo (si hay dos en pantalla, no parpadean a la vez): el desfase sale de su id.
  const id = useId();
  const retraso = desfaseDe(id);
  const sufijo = `-${id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const capas = useMemo(() => svgCapas(expresion, sufijo, espejo), [expresion, sufijo, espejo]);
  const cuerpo = movimiento(expresion);
  const animado = expresion === 'celebrando';
  return (
    <div
      className={`mixtle-figura ${posicion} ${className}`}
      style={{ height: alto, aspectRatio: `${anchoTotal} / ${CUERPO.alto}`, transform: espejo ? 'scaleX(-1)' : undefined }}
      role="img"
      aria-label="Mixtle, el cacomixtle"
      data-expresion={expresion}
    >
      <motion.div
        className="absolute top-0"
        style={{
          left: pct(COLA.x, anchoTotal),
          width: pct(COLA.ancho, anchoTotal),
          height: '100%',
          transformOrigin: `${COLA.origenX * 100}% ${COLA.origenY * 100}%`,
        }}
        animate={{ rotate: animado ? [-12, 14, -12] : expresion === 'duerme' ? [-2, 2, -2] : [-6, 7, -6] }}
        transition={{ duration: animado ? 0.8 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Arte clave="mixtle-cola" className="h-full w-full" />
      </motion.div>
      <motion.div
        className="mixtle-vivo absolute top-0 left-0 h-full origin-bottom"
        style={{ width: pct(CUERPO.ancho, anchoTotal), ['--mx-retraso' as string]: retraso }}
        animate={cuerpo.animate}
        transition={cuerpo.transition}
      >
        <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: capas.atras }} />
        {/* El pin de Eco Urban: parte fija de Mixtle. En espejo se voltea de vuelta para que se lea derecho. */}
        <Arte
          clave={pin === 'grande' ? 'pin-eco-urban' : 'pin-eco-urban-chico'}
          className="pointer-events-none absolute max-w-none"
          style={{ left: PIN.left, top: PIN.top, width: PIN.width, transformOrigin: PIN.origen, translate: `-${PIN.origen.split(' ')[0]} -${PIN.origen.split(' ')[1]}`, transform: espejo ? 'scaleX(-1)' : undefined }}
          data-pin-mixtle={pin}
        />
        <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: capas.adelante }} />
      </motion.div>
    </div>
  );
}
