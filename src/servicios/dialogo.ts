import { textoDeLocucion, type Locucion } from '../voz/locucion';
import { voz } from './voz';

/*
 * El único narrador del juego (v3.2.1): lo usan las pantallas de React (src/app/estado/narrador.ts) y las
 * aventuras de Phaser (src/ui/Narrador.ts). Nadie más le habla a la voz.
 *
 * - Cada pantalla, cada ejercicio y cada escena es DUEÑA de sus frases (`nuevoDueno`). Al cambiar de dueño
 *   se descarta lo pendiente, se corta lo que estaba sonando y los avisos tardíos de audios viejos se
 *   ignoran (cada frase lleva su número de turno). Lo que una frase pidió hacer "al terminar" solo se hace
 *   si su dueño sigue siendo el actual: una frase de la pantalla anterior nunca se cuela en la siguiente.
 * - Dentro del mismo dueño las frases van en orden: una frase nueva espera a que termine la que suena; no
 *   la corta. (Una frase igual a la que ya está en la cola no se repite.)
 * - Si el audio no suena por cualquier motivo (voz apagada, bloqueado por el navegador, archivo que no
 *   carga), la frase se queda al menos `tiempoDeLectura`: lo necesario para que un adulto la lea en voz alta.
 * - La consigna de un ejercicio es la frase PRINCIPAL del dueño: el botón de repetir la dice a ella.
 */

/** Lo mínimo que se queda una frase si su audio no sonó: 3 s más 0.5 s por palabra. */
export function tiempoDeLectura(locucion: Locucion): number {
  const palabras = textoDeLocucion(locucion).split(/\s+/).filter(Boolean).length;
  return 3000 + 500 * palabras;
}

/** Lo que muestra cada lado (React o Phaser) mientras se dice una frase. */
export interface Vista {
  /** Empieza a decirse (el texto va al globo, Mixtle mueve la boca). `ms`: cuánto se espera que dure. */
  alEmpezar?(ms: number): void;
  /** Terminó o se cortó. */
  alAcabar?(): void;
}

export interface OpcionesFrase {
  /** Se llama al terminar la frase, solo si su dueño sigue siendo el actual. */
  alTerminar?: () => void;
  /** Si el audio no está listo para entonces, no se dice tarde (queda el texto en el globo). */
  esperaMaximaMs?: number;
  /**
   * Puede seguir sonando un momento (CRUCE_MS) al cambiar de pantalla: así "¡Al rescate!" se oye completo
   * encima de la transición. Lo que pidió "al terminar" ya no se hace.
   */
  cruzaPantalla?: boolean;
  /**
   * La respuesta a un toque (salir, una lección cerrada, una estampa…): se dice YA, cortando lo que suena
   * y lo pendiente de este dueño. La frase principal (la consigna) se conserva para repetirla.
   */
  interrumpir?: boolean;
  /** De qué dueño es la frase (una escena de Phaser): si ya no es el actual, no se dice. */
  dueno?: number;
  vista?: Vista;
}

interface Frase {
  locucion: Locucion;
  op: OpcionesFrase;
  dueno: number;
}

interface Sonando {
  frase: Frase;
  turno: number;
  inicio: number;
  /** El audio de verdad empezó a oírse. */
  sono: boolean;
  reloj?: ReturnType<typeof setTimeout>;
}

/** Cuánto puede seguir una frase que cruza a la pantalla siguiente. */
export const CRUCE_MS = 800;
/** Lo más que la voz espera a que baje un audio antes de empezar (ver servicios/voz.ts). */
const ESPERA_CARGA_MS = 2000;
/** Seguridad: si la voz nunca avisa (la cortó otro), la frase termina igual tras su duración y esto. */
const MARGEN_SEGURIDAD_MS = 2500;
/** Frases pendientes como mucho por dueño (si se juntan más, se descartan las más viejas pendientes). */
const MAXIMO_PENDIENTES = 4;

let dueno = 0;
let turno = 0;
let cola: Frase[] = [];
let actual: Sonando | null = null;
let principal: { locucion: Locucion; dueno: number; op: OpcionesFrase } | null = null;
let ultima: Frase | null = null;
const reloj = {
  poner: (fn: () => void, ms: number) => setTimeout(fn, ms),
  quitar: (id: ReturnType<typeof setTimeout> | undefined) => {
    if (id !== undefined) clearTimeout(id);
  },
};

/** Empieza un dueño nuevo (pantalla, ejercicio o escena): descarta y corta todo lo anterior. */
export function nuevoDueno(): number {
  dueno += 1;
  cola = [];
  principal = null;
  if (actual) {
    if (actual.frase.op.cruzaPantalla) {
      const t = actual.turno;
      reloj.poner(() => {
        if (actual?.turno === t) cortar();
      }, CRUCE_MS);
    } else {
      cortar();
    }
  }
  return dueno;
}

/** El dueño de ahora (para que una escena solo calle si las frases siguen siendo suyas). */
export function duenoActual(): number {
  return dueno;
}

/** Mixtle dice una frase de este dueño: en cuanto termine lo que está sonando. */
export function decir(locucion: Locucion, op: OpcionesFrase = {}): void {
  if (op.dueno !== undefined && op.dueno !== dueno) return;
  if (op.interrumpir) {
    cola = [];
    if (actual) cortar();
  }
  const texto = textoDeLocucion(locucion);
  const igual = (f: Frase | undefined) => !!f && f.dueno === dueno && textoDeLocucion(f.locucion) === texto;
  if (igual(cola.at(-1)) || (!cola.length && actual && igual(actual.frase))) return;
  cola.push({ locucion, op, dueno });
  while (cola.length > MAXIMO_PENDIENTES) cola.shift();
  avanzar();
}

/** La frase principal de este dueño (la consigna de un ejercicio): es la que dice el botón de repetir. */
export function fijarPrincipal(locucion: Locucion, op: OpcionesFrase = {}): void {
  principal = { locucion, dueno, op };
}

/** El botón de repetir: corta lo pendiente y dice la principal (o, si no hay, la última frase). */
export function repetir(vista?: Vista): void {
  const p = principal && principal.dueno === dueno ? principal : null;
  const frase = p ? { locucion: p.locucion, op: p.op } : ultima && ultima.dueno === dueno ? ultima : null;
  if (!frase) return;
  cola = [];
  if (actual) cortar();
  cola.push({ locucion: frase.locucion, op: { vista: vista ?? frase.op.vista }, dueno });
  avanzar();
}

/** ¿Hay una frase sonando o esperando su turno? */
export function hablando(): boolean {
  return !!actual || cola.some((f) => f.dueno === dueno);
}

function avanzar(): void {
  if (actual) return;
  let f = cola.shift();
  while (f && f.dueno !== dueno) f = cola.shift();
  if (!f) return;
  const frase = f;
  const miTurno = ++turno;
  const sonando: Sonando = { frase, turno: miTurno, inicio: Date.now(), sono: false };
  actual = sonando;
  ultima = frase;
  const ms = voz.decir(frase.locucion, () => alCallarLaVoz(miTurno), {
    esperaMaximaMs: frase.op.esperaMaximaMs,
    alSonar: () => {
      if (actual?.turno === miTurno) sonando.sono = true;
    },
  });
  frase.op.vista?.alEmpezar?.(ms);
  sonando.reloj = reloj.poner(() => alCallarLaVoz(miTurno), (frase.op.esperaMaximaMs ?? ESPERA_CARGA_MS) + ms + MARGEN_SEGURIDAD_MS);
}

/** La voz terminó (o avisó la seguridad). Si el audio no sonó, se espera el tiempo de lectura. */
function alCallarLaVoz(t: number): void {
  if (actual?.turno !== t) return;
  const falta = actual.sono ? 0 : actual.inicio + tiempoDeLectura(actual.frase.locucion) - Date.now();
  if (falta > 0) {
    reloj.quitar(actual.reloj);
    actual.reloj = reloj.poner(() => acabar(t), falta);
    return;
  }
  acabar(t);
}

function acabar(t: number): void {
  if (actual?.turno !== t) return;
  const a = actual;
  actual = null;
  reloj.quitar(a.reloj);
  a.frase.op.vista?.alAcabar?.();
  if (a.frase.dueno === dueno) a.frase.op.alTerminar?.();
  avanzar();
}

/** Corta la frase que suena, sin hacer lo que pidió "al terminar", y sigue con la cola. */
function cortar(): void {
  if (!actual) return;
  const a = actual;
  actual = null;
  reloj.quitar(a.reloj);
  voz.callar();
  a.frase.op.vista?.alAcabar?.();
  avanzar();
}

/** Solo pruebas: vuelve a empezar. */
export function reiniciarDialogo(): void {
  if (actual) reloj.quitar(actual.reloj);
  dueno = 0;
  turno = 0;
  cola = [];
  actual = null;
  principal = null;
  ultima = null;
}
