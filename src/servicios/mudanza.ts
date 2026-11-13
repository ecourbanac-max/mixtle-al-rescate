import { cyrb53 } from '../voz/hash';
import { gruposValidos, type Grupo } from '../logica/grupos';

/*
 * El paquete de una mudanza de dirección. Lo guardado en un navegador (IndexedDB, localStorage) pertenece
 * a cada dirección: al cambiar de dirección se perdería. Por eso la dirección vieja empaca los grupos y las
 * preferencias y se los lleva a la nueva en el fragmento de la URL (#mudanza=…), que nunca se envía a
 * ningún servidor. No hay datos de niñas ni niños: solo el animal, el color y la etiqueta de cada grupo, y
 * su avance.
 *
 * Versión 1 (v3, caco-al-rescate → mixtle-al-rescate): de ida, sin confirmación. Se sigue leyendo.
 * Versión 2 (v3.2): lleva un id, el origen y una firma de los grupos; la dirección nueva guarda, comprueba
 * y regresa a confirmar a la vieja, que solo entonces quita sus grupos (src/servicios/mudanzaDefinitiva.ts).
 */
const MARCA = 'mudanza=';

export interface Mudanza {
  v: 1 | 2;
  grupos: Grupo[];
  /** Preferencias del aparato ("si" / "no"), por nombre corto: sonido, musica, proyector, suave. */
  preferencias: Record<string, string>;
  /** v2: id de esta mudanza (para la confirmación). */
  id?: string;
  /** v2: la dirección vieja, a donde se regresa a confirmar. */
  origen?: string;
  /** v2: firma de los grupos tal como salieron (si no coincide al llegar, el paquete se dañó). */
  firma?: string;
  /** v2: el juego estaba instalado como app en la dirección vieja (se enseña a instalarlo de nuevo). */
  instalada?: boolean;
}

/** Firma corta de una lista de grupos, para comprobar que llegaron completos e iguales. */
export function firmaDeGrupos(grupos: readonly Grupo[]): string {
  return cyrb53(JSON.stringify(grupos));
}

/** Texto → base64url (UTF-8). */
function aBase64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let binario = '';
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(b64: string): string {
  const binario = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(binario, (c) => c.charCodeAt(0)));
}

/** El fragmento de URL que lleva la mudanza ("#mudanza=…"). */
export function fragmentoDeMudanza(m: Mudanza): string {
  return `#${MARCA}${aBase64Url(JSON.stringify(m))}`;
}

function preferenciasValidas(datos: unknown): Record<string, string> {
  const preferencias: Record<string, string> = {};
  for (const [clave, valor] of Object.entries((datos as Record<string, unknown>) ?? {})) {
    if (/^[a-z]+$/.test(clave) && (valor === 'si' || valor === 'no')) preferencias[clave] = valor;
  }
  return preferencias;
}

/**
 * Lee la mudanza de un fragmento de URL. Si no hay, o está dañada, devuelve null (nunca lanza). En la v2,
 * si algún grupo venía dañado o la firma no coincide, se descarta el paquete entero (`danada: true`): la
 * dirección vieja conserva todo y puede reintentar.
 */
export function leerMudanza(fragmento: string): (Mudanza & { danada?: boolean }) | null {
  try {
    const i = fragmento.indexOf(MARCA);
    if (i < 0 || fragmento[i - 1] !== '#') return null;
    const datos = JSON.parse(deBase64Url(fragmento.slice(i + MARCA.length))) as Partial<Mudanza> & { grupos?: unknown };
    const preferencias = preferenciasValidas(datos?.preferencias);
    if (datos?.v === 1) return { v: 1, grupos: gruposValidos(datos.grupos), preferencias };
    if (datos?.v !== 2 || typeof datos.id !== 'string' || typeof datos.origen !== 'string') return null;
    const brutos = Array.isArray(datos.grupos) ? datos.grupos : [];
    const grupos = gruposValidos(brutos);
    const danada = grupos.length !== brutos.length || firmaDeGrupos(grupos) !== datos.firma;
    return { v: 2, id: datos.id, origen: datos.origen, firma: String(datos.firma ?? ''), instalada: !!datos.instalada, grupos, preferencias, danada };
  } catch {
    return null;
  }
}
