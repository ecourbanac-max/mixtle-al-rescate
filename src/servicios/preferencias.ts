import { migrarPreferencias, PREFIJO } from './migracion';

/**
 * Preferencias del dispositivo. Solo se guarda si la voz (con los efectos) y la música están
 * encendidas. No se guarda nada de las niñas y los niños.
 */
export const CLAVES = {
  /** Voz de Mixtle y efectos de sonido. */
  sonido: 'mixtle-al-rescate:sonido',
  musica: 'mixtle-al-rescate:musica',
} as const;

export type Almacen = Pick<Storage, 'getItem' | 'setItem'>;

function almacenPorDefecto(): Almacen | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    // Acceder a localStorage puede lanzar (modo privado, permisos bloqueados).
    return null;
  }
}

/** Al cargar, antes de que nadie lea una preferencia: pasar las guardadas con el nombre anterior del juego. */
export function prepararPreferencias(almacen: Storage | null = almacenPorDefecto() as Storage | null): void {
  migrarPreferencias(almacen);
}
prepararPreferencias();

/**
 * Las preferencias que trae una mudanza de dirección (src/servicios/mudanzaDefinitiva.ts): se ponen sin
 * pisar las que ya hay en esta dirección. Nunca lanza.
 */
export function ponerPreferenciasQueLlegan(preferencias: Record<string, string>, almacen: Storage | null = almacenPorDefecto() as Storage | null): void {
  if (!almacen) return;
  try {
    for (const [clave, valor] of Object.entries(preferencias)) {
      if (almacen.getItem(`${PREFIJO}:${clave}`) === null) almacen.setItem(`${PREFIJO}:${clave}`, valor);
    }
  } catch {
    // Almacenamiento bloqueado: se usan las de por defecto.
  }
}

/** Lee un interruptor (encendido por defecto). Nunca lanza. */
export function leerInterruptor(clave: string, almacen: Almacen | null = almacenPorDefecto()): boolean {
  try {
    return almacen?.getItem(clave) !== 'no';
  } catch {
    return true;
  }
}

/** Lee un interruptor que viene apagado por defecto (solo es true si se guardó "si"). Nunca lanza. */
export function leerInterruptorApagado(clave: string, almacen: Almacen | null = almacenPorDefecto()): boolean {
  try {
    return almacen?.getItem(clave) === 'si';
  } catch {
    return false;
  }
}

/** Guarda un interruptor. Si no se puede, el juego sigue con la preferencia en memoria. */
export function guardarInterruptor(clave: string, activo: boolean, almacen: Almacen | null = almacenPorDefecto()): void {
  try {
    almacen?.setItem(clave, activo ? 'si' : 'no');
  } catch {
    // Ignorar: almacenamiento bloqueado o lleno.
  }
}

export function leerSonidoActivo(almacen?: Almacen | null): boolean {
  return leerInterruptor(CLAVES.sonido, almacen === undefined ? almacenPorDefecto() : almacen);
}

export function guardarSonidoActivo(activo: boolean, almacen?: Almacen | null): void {
  guardarInterruptor(CLAVES.sonido, activo, almacen === undefined ? almacenPorDefecto() : almacen);
}
