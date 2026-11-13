import { createStore, get, set, type UseStore } from 'idb-keyval';
import { ALMACEN_IDB, CLAVE_GRUPOS, migrarGrupos, PREFIJO } from './migracion';

/**
 * Dónde se guarda el progreso de los grupos: IndexedDB del propio dispositivo (nada sale de él).
 * Todo va dentro de try/catch: si el almacenamiento está bloqueado (modo privado, permisos),
 * el juego sigue funcionando en memoria.
 */
export interface Almacen {
  leer(): Promise<unknown>;
  /** Devuelve false si no se pudo guardar. */
  guardar(valor: unknown): Promise<boolean>;
}

const CLAVE = CLAVE_GRUPOS;
let tienda: UseStore | null = null;

function tiendaIdb(): UseStore {
  tienda ??= createStore(PREFIJO, ALMACEN_IDB);
  return tienda;
}

/**
 * Antes de la primera lectura: pasar lo guardado con el nombre anterior del juego. Una sola vez. (La
 * mudanza de dirección se atiende al arrancar, antes que nada: src/servicios/mudanzaDefinitiva.ts.)
 */
let preparado: Promise<unknown> | null = null;
function preparar(): Promise<unknown> {
  preparado ??= migrarGrupos();
  return preparado;
}

/**
 * Otras cosas guardadas junto a los grupos (la mudanza pendiente, el respaldo de los grupos que ya se
 * mudaron). Lanzan si no hay almacenamiento: quien las usa decide qué hacer.
 */
export const extrasIndexedDb = {
  async leer(clave: string): Promise<unknown> {
    await preparar();
    return get(clave, tiendaIdb());
  },
  async guardar(clave: string, valor: unknown): Promise<void> {
    await set(clave, valor, tiendaIdb());
  },
};

/** Lee los grupos sin tragarse los errores (la mudanza necesita saber si de verdad se pudo leer). */
export async function leerGruposEstricto(): Promise<unknown> {
  await preparar();
  return get(CLAVE, tiendaIdb());
}

/** Guarda los grupos sin tragarse los errores. */
export async function guardarGruposEstricto(valor: unknown): Promise<void> {
  await set(CLAVE, valor, tiendaIdb());
}

export const almacenIndexedDb: Almacen = {
  async leer() {
    try {
      await preparar();
      return await get(CLAVE, tiendaIdb());
    } catch {
      return undefined;
    }
  },
  async guardar(valor) {
    try {
      await set(CLAVE, valor, tiendaIdb());
      return true;
    } catch {
      return false;
    }
  },
};

/** Almacén en memoria (pruebas, o cuando no hay IndexedDB). */
export function almacenEnMemoria(inicial?: unknown): Almacen & { contenido: unknown } {
  const a = {
    contenido: inicial,
    async leer() {
      return structuredClone(a.contenido);
    },
    async guardar(valor: unknown) {
      a.contenido = structuredClone(valor);
      return true;
    },
  };
  return a;
}
