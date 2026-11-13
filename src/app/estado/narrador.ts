import { create } from 'zustand';
import * as dialogo from '../../servicios/dialogo';
import { textoDeLocucion, type Locucion } from '../../voz/locucion';
import type { ExpresionMixtle } from '../componentes/MixtleFigura';
import { useApp } from './app';

/*
 * Mixtle en las pantallas de React: lo que se ve (globo, boca, cara). Lo que se dice y en qué orden lo
 * decide el único narrador del juego, servicios/dialogo.ts (también lo usan las aventuras de Phaser).
 */

interface EstadoNarrador {
  /** El texto del globo: lo que Mixtle está diciendo, o la consigna del ejercicio. */
  subtitulo: string;
  hablando: boolean;
  /** Cara de Mixtle cuando no está hablando. */
  expresion: ExpresionMixtle;
}

export const useNarrador = create<EstadoNarrador>(() => ({ subtitulo: '', hablando: false, expresion: 'normal' }));

interface OpcionesDecir {
  expresion?: ExpresionMixtle;
  /** Al terminar la frase (solo si sigue en la misma pantalla o ejercicio). */
  alTerminar?: () => void;
  /** Si el audio no está listo para entonces, no se dice tarde (queda el subtítulo). */
  esperaMaximaMs?: number;
  /** Puede seguir sonando un momento al cambiar de pantalla ("¡Al rescate!" sobre la transición). */
  cruzaPantalla?: boolean;
  /** Respuesta a un toque: se dice ya, cortando lo que suena (la consigna se conserva para repetirla). */
  interrumpir?: boolean;
  /**
   * false: se dice sin cambiar el globo. En un ejercicio, el festejo o la pista se dicen (y se ven en el
   * aviso de abajo) sin quitar la consigna del globo.
   */
  enGlobo?: boolean;
}

function vista(locucion: Locucion, op: OpcionesDecir): dialogo.Vista {
  return {
    alEmpezar: () =>
      useNarrador.setState({
        hablando: true,
        ...(op.enGlobo === false ? {} : { subtitulo: textoDeLocucion(locucion) }),
        ...(op.expresion ? { expresion: op.expresion } : {}),
      }),
    alAcabar: () => useNarrador.setState({ hablando: false }),
  };
}

/** Mixtle dice algo (voz + globo), en cuanto termine lo que esté diciendo en esta misma pantalla. */
export function decir(locucion: Locucion, op: OpcionesDecir = {}): void {
  dialogo.decir(locucion, {
    alTerminar: op.alTerminar,
    esperaMaximaMs: op.esperaMaximaMs,
    cruzaPantalla: op.cruzaPantalla,
    interrumpir: op.interrumpir,
    vista: vista(locucion, op),
  });
}

/**
 * Un ejercicio nuevo: se descarta todo lo anterior, se dice `locucion` (la consigna, con lo que la
 * acompañe al empezar) y la consigna queda como frase principal: el botón de repetir la dice a ella.
 */
export function decirConsigna(locucion: Locucion, consigna: Locucion = locucion): void {
  dialogo.nuevoDueno();
  dialogo.fijarPrincipal(consigna, { vista: vista(consigna, {}) });
  decir(locucion);
}

/** El botón de repetir (o tocar a Mixtle): la consigna del ejercicio o, si no hay, la última frase. */
export function repetir(): void {
  dialogo.repetir();
}

/** Mixtle se calla y se olvida lo pendiente (al salir de una pantalla). */
export function callar(): void {
  dialogo.nuevoDueno();
  useNarrador.setState({ hablando: false });
}

/**
 * Para la limpieza de una pantalla o componente al desmontarse: calla a Mixtle solo si lo que dice sigue
 * siendo suyo. (Si la pantalla ya cambió, la pantalla nueva es la dueña: no se le corta su consigna.)
 */
export function callarAlSalir(): () => void {
  const dueno = dialogo.duenoActual();
  return () => {
    if (dialogo.duenoActual() === dueno) callar();
  };
}

export function ponerExpresion(expresion: ExpresionMixtle): void {
  useNarrador.setState({ expresion });
}

// Cada pantalla es dueña de sus frases: al cambiar de pantalla se corta y se descarta lo de la anterior.
// El globo tampoco se queda con el texto de la pantalla anterior (salvo una frase que la cruza sonando).
useApp.subscribe((s, antes) => {
  if (s.pantalla === antes.pantalla) return;
  callar();
  if (!dialogo.hablando()) useNarrador.setState({ subtitulo: '' });
});
