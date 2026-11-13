import { gruposValidos, juntarGrupos, type Grupo } from '../logica/grupos';
import { APP_ID } from '../sitio';
import { firmaDeGrupos } from './mudanza';

/*
 * Respaldo de los grupos en un archivo (v3.2, plan B de la mudanza): "Exportar grupos" en un aparato o
 * dirección e "Importar grupos" en otro. Funciona sin internet: el archivo se arma y se lee en el navegador.
 * No hay datos de niñas ni niños: solo el animal, el color y la etiqueta de cada grupo, y su avance.
 */
export const FORMATO_RESPALDO = 'mixtle-grupos';
export const VERSION_RESPALDO = 1;
/** Un respaldo de verdad pesa unos KB; algo mucho más grande no es un respaldo. */
export const TAMANO_MAXIMO_RESPALDO = 5 * 1024 * 1024;

export interface Respaldo {
  app: typeof APP_ID;
  formato: typeof FORMATO_RESPALDO;
  version: typeof VERSION_RESPALDO;
  /** Fecha del respaldo (ISO). */
  exportado: string;
  /** Dirección de donde salió (solo informativo). */
  origen: string;
  grupos: Grupo[];
  /** Firma de los grupos: si no coincide al importar, el archivo se dañó. */
  firma: string;
}

/**
 * El respaldo de un aparato: sus grupos y, si los hay, los que ya se mudaron a otra dirección (se juntan por
 * id, con el de más avance), para que nada quede fuera.
 */
export function crearRespaldo(grupos: readonly Grupo[], yaMudados: readonly Grupo[] = [], ahora = new Date(), origen = typeof location !== 'undefined' ? location.host : ''): Respaldo {
  const todos = juntarGrupos([...yaMudados], [...grupos]).grupos;
  // Un grupo que también está en el respaldo de mudados se queda una sola vez (mismo id): juntarGrupos ya lo hizo.
  return { app: APP_ID, formato: FORMATO_RESPALDO, version: VERSION_RESPALDO, exportado: ahora.toISOString(), origen, grupos: todos, firma: firmaDeGrupos(todos) };
}

/** Nombre del archivo: "mixtle-grupos-AAAA-MM-DD.json". */
export function nombreDeRespaldo(ahora = new Date()): string {
  const d = (n: number) => String(n).padStart(2, '0');
  return `${FORMATO_RESPALDO}-${ahora.getFullYear()}-${d(ahora.getMonth() + 1)}-${d(ahora.getDate())}.json`;
}

/**
 * Lee un archivo de respaldo y lo valida por completo antes de tocar nada: que sea de este juego, de un
 * formato que entendemos, con todos los grupos válidos y la firma correcta. Si algo no cuadra, null.
 */
export function leerRespaldo(texto: string): Grupo[] | null {
  if (texto.length > TAMANO_MAXIMO_RESPALDO) return null;
  try {
    const r = JSON.parse(texto) as Partial<Respaldo> & { grupos?: unknown };
    if (r?.app !== APP_ID || r.formato !== FORMATO_RESPALDO || r.version !== VERSION_RESPALDO) return null;
    if (!Array.isArray(r.grupos)) return null;
    const grupos = gruposValidos(r.grupos);
    if (grupos.length !== r.grupos.length) return null;
    if (new Set(grupos.map((g) => g.id)).size !== grupos.length) return null;
    if (firmaDeGrupos(grupos) !== r.firma) return null;
    return grupos;
  } catch {
    return null;
  }
}

/** Descarga el respaldo como archivo (sin internet también). */
export function descargarRespaldo(r: Respaldo, nombre = nombreDeRespaldo()): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
