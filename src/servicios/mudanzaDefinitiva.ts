import { gruposValidos, juntarGrupos, nombreDelGrupo, type Grupo } from '../logica/grupos';
import { APP_ID, DIRECCION_DEFINITIVA, PROTOCOLO_MUDANZA, destinosDeMudanza, esOrigenViejo } from '../sitio';
import { cyrb53 } from '../voz/hash';
import { extrasIndexedDb, guardarGruposEstricto, leerGruposEstricto } from './almacen';
import { PREFIJO } from './migracion';
import { useMudanza } from './estadoMudanza';
import { firmaDeGrupos, fragmentoDeMudanza, leerMudanza } from './mudanza';
import { ponerPreferenciasQueLlegan } from './preferencias';

/*
 * Mudanza a la dirección definitiva (v3.2). Ver src/sitio.ts para las direcciones.
 *
 * 1. Dormida: en una dirección vieja, el juego revisa en segundo plano si la definitiva ya sirve ESTE juego
 *    (pide su /salud.json, que tiene el nombre de la app y la versión del protocolo). Si no responde, o
 *    responde otra cosa, o no hay internet, no pasa nada: el juego sigue normal aquí.
 * 2. Cuando la definitiva responde (y el grupo está en una pantalla segura, nunca a media lección):
 *    - sin grupos: se va directo a la dirección definitiva;
 *    - con grupos: avisa al maestro ("El juego se cambió a…"), guarda una "mudanza pendiente" y abre la
 *      definitiva con los grupos en el fragmento de la URL.
 * 3. La definitiva junta los grupos (sin sobrescribir ninguno: ver juntarGrupos), los guarda, los vuelve a
 *    leer para comprobar que quedaron y regresa a la vieja con "recibida" (o "fallida").
 * 4. La vieja, con "recibida" y la firma correcta, quita de su lista los grupos que llegaron (quedan en un
 *    respaldo) y abre la definitiva, que da la bienvenida. Si algo falla en cualquier paso, la vieja no
 *    borró nada y se puede reintentar; si un grupo llega dos veces, se junta con el mismo id (no se duplica).
 */

export const CLAVE_PENDIENTE = 'mudanza-pendiente';
/** Respaldo de los grupos que ya se mudaron (no se usan aquí; el modo facilitador los puede exportar). */
export const CLAVE_MUDADOS = 'grupos-mudados';
/** En la dirección nueva, entre la llegada y la bienvenida (la misma pestaña). */
const CLAVE_LLEGADA = `${PREFIJO}:mudanza-llegada`;
const ESPERA_REVISION_MS = 1500;
const LIMITE_SALUD_MS = 6000;

interface Pendiente {
  id: string;
  destino: string;
  firma: string;
  /** Firma de cada grupo como salió: solo se quitan los que no cambiaron desde entonces. */
  porGrupo: Record<string, string>;
  fecha: number;
}

interface Mudados {
  destino: string;
  fecha: number;
  grupos: Grupo[];
}

export { useMudanza, type EstadoMudanza } from './estadoMudanza';

/** ¿El juego está instalado como app (pantalla completa, sin barra del navegador)? */
export function estaInstalada(): boolean {
  try {
    return (
      ['standalone', 'fullscreen', 'minimal-ui'].some((m) => window.matchMedia?.(`(display-mode: ${m})`).matches) ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

/**
 * El aviso del navegador para instalar la app (Chrome lo da antes de mostrar su propio botón). Solo se
 * pide en la bienvenida de una mudanza desde una app instalada: así el botón "Instalar" funciona.
 */
let avisoInstalar: (Event & { prompt?: () => Promise<void> }) | null = null;
export function escucharInstalacion(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    avisoInstalar = e;
  });
}
export function puedeInstalar(): boolean {
  return !!avisoInstalar?.prompt;
}
export async function instalar(): Promise<void> {
  await avisoInstalar?.prompt?.();
  avisoInstalar = null;
}

/** ¿Lo que respondió /salud.json es ESTE juego, con un protocolo de mudanza que entendemos? */
export function esSaludValida(datos: unknown): boolean {
  const d = datos as { app?: unknown; mudanza?: unknown } | null;
  return !!d && d.app === APP_ID && typeof d.mudanza === 'number' && d.mudanza >= PROTOCOLO_MUDANZA;
}

/** Pide /salud.json de una dirección. Nunca lanza: si algo falla, "no sirve" (false). */
export async function sirveEsteJuego(destino: string, pedir: typeof fetch = fetch, limiteMs = LIMITE_SALUD_MS): Promise<boolean> {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), limiteMs);
  try {
    const r = await pedir(`${destino}/salud.json`, { cache: 'no-store', mode: 'cors', credentials: 'omit', signal: control.signal });
    if (!r.ok) return false;
    return esSaludValida(await r.json());
  } catch {
    return false;
  } finally {
    clearTimeout(reloj);
  }
}

/** Parámetros del fragmento "#paso=…&…". */
function pasoDelFragmento(fragmento: string): URLSearchParams | null {
  if (!fragmento.startsWith('#paso=')) return null;
  return new URLSearchParams(fragmento.slice(1));
}

function limpiarFragmento(): void {
  try {
    history.replaceState(null, '', location.pathname + location.search);
  } catch {
    // Nada que limpiar.
  }
}

let navegar = (url: string) => location.replace(url);
/** Solo pruebas: en lugar de ir a otra dirección, registrar a dónde se iría. */
export function usarNavegacion(fn: (url: string) => void): void {
  navegar = fn;
}
function irA(url: string): void {
  navegar(url);
}

/**
 * Al arrancar, ANTES de pintar el juego: atiende lo que traiga el fragmento de la URL (una mudanza que
 * llega, o la respuesta a una que salió). Devuelve true si la página se va a otra dirección (no pintar).
 */
export async function atenderFragmento(fragmento: string = location.hash): Promise<boolean> {
  if (fragmento.startsWith('#mudanza=')) return recibirMudanza(fragmento);
  const paso = pasoDelFragmento(fragmento);
  if (!paso) return false;
  limpiarFragmento();
  switch (paso.get('paso')) {
    case 'recibida':
      return confirmarMudanza(paso.get('id') ?? '', paso.get('firma') ?? '', paso.get('instalada') === '1');
    case 'fallida': {
      const pendiente = (await extrasIndexedDb.leer(CLAVE_PENDIENTE).catch(() => null)) as Pendiente | null;
      if (pendiente?.id === paso.get('id')) useMudanza.setState({ estado: { fase: 'fallo', destino: pendiente.destino } });
      return false;
    }
    case 'lista': {
      let llegada = { cuantos: Number(paso.get('grupos') ?? 0), renombrados: [] as { antes: string; despues: string }[] };
      try {
        llegada = { ...llegada, ...(JSON.parse(sessionStorage.getItem(CLAVE_LLEGADA) ?? '{}') as typeof llegada) };
        sessionStorage.removeItem(CLAVE_LLEGADA);
      } catch {
        // Sin sessionStorage: el aviso sale sin la lista de nombres cambiados.
      }
      const instalada = paso.get('instalada') === '1';
      if (instalada) escucharInstalacion();
      if (llegada.cuantos > 0 || instalada) useMudanza.setState({ estado: { fase: 'llegaron', ...llegada, instalada } });
      return false;
    }
    default:
      return false;
  }
}

/** En la dirección nueva: llega una mudanza. Se guarda, se comprueba y se regresa a confirmar. */
async function recibirMudanza(fragmento: string): Promise<boolean> {
  const m = leerMudanza(fragmento);
  limpiarFragmento();
  if (!m) return false;
  if (!m.danada) ponerPreferenciasQueLlegan(m.preferencias);
  const regreso = m.v === 2 && m.origen && esOrigenViejo(m.origen) ? m.origen.replace(/\/+$/, '') : null;
  const responder = (paso: string) => {
    if (!regreso) return false;
    irA(`${regreso}/#paso=${paso}&id=${encodeURIComponent(m.id ?? '')}&firma=${encodeURIComponent(m.firma ?? '')}${m.instalada ? '&instalada=1' : ''}`);
    return true;
  };
  if (m.danada) return responder('fallida');
  try {
    const actuales = gruposValidos(await leerGruposEstricto());
    const juntos = juntarGrupos(actuales, m.grupos);
    await guardarGruposEstricto(juntos.grupos);
    // Se vuelve a leer: solo se confirma si de verdad quedaron guardados todos.
    const guardados = new Set(gruposValidos(await leerGruposEstricto()).map((g) => g.id));
    if (!m.grupos.every((g) => guardados.has(g.id))) return responder('fallida');
    // Sin dirección a donde regresar (el paquete v1 de la v3, o un enlace que no viene de una dirección
    // vieja): los grupos ya quedaron aquí, sin aviso (como en la v3).
    if (!regreso) return false;
    try {
      sessionStorage.setItem(CLAVE_LLEGADA, JSON.stringify({ cuantos: m.grupos.length, renombrados: juntos.renombrados }));
    } catch {
      // Sin sessionStorage: solo se pierde el detalle del aviso.
    }
    return responder('recibida');
  } catch {
    return responder('fallida');
  }
}

/** En la dirección vieja: la nueva confirmó. Se quitan los grupos que se mudaron y se abre la nueva. */
async function confirmarMudanza(id: string, firma: string, instalada: boolean): Promise<boolean> {
  try {
    const pendiente = (await extrasIndexedDb.leer(CLAVE_PENDIENTE)) as Pendiente | undefined;
    if (!pendiente || pendiente.id !== id || pendiente.firma !== firma) return false;
    const actuales = gruposValidos(await leerGruposEstricto());
    const firmaDe = (g: Grupo) => cyrb53(JSON.stringify(g));
    const mudados = actuales.filter((g) => pendiente.porGrupo[g.id] === firmaDe(g));
    const quedan = actuales.filter((g) => !mudados.includes(g));
    const antes = (await extrasIndexedDb.leer(CLAVE_MUDADOS)) as Mudados | undefined;
    // Primero el respaldo, luego la lista: si algo falla entre los dos, nada se pierde.
    await extrasIndexedDb.guardar(CLAVE_MUDADOS, { destino: pendiente.destino, fecha: Date.now(), grupos: juntarGrupos(antes?.grupos ?? [], mudados).grupos } satisfies Mudados);
    await guardarGruposEstricto(quedan);
    await extrasIndexedDb.guardar(CLAVE_PENDIENTE, undefined);
    irA(`${pendiente.destino}/#paso=lista&grupos=${mudados.length}${instalada || estaInstalada() ? '&instalada=1' : ''}`);
    return true;
  } catch {
    // Si no se pudo quitar, los grupos siguen aquí (y ya están también allá: al reintentar se juntan).
    return false;
  }
}

/** Mudarse ahora a `destino` (el maestro tocó "Llevar los grupos", o pasó la cuenta regresiva). */
export async function mudarAhora(destino: string): Promise<void> {
  useMudanza.setState({ estado: { fase: 'mudando', destino } });
  const instalada = estaInstalada();
  let grupos: Grupo[];
  try {
    grupos = gruposValidos(await leerGruposEstricto());
  } catch {
    // Sin poder leer lo guardado, no se sabe si hay grupos: no se va (el plan B es exportarlos a mano).
    useMudanza.setState({ estado: { fase: 'fallo', destino } });
    return;
  }
  if (!grupos.length) {
    irA(`${destino}/${instalada ? '#paso=lista&grupos=0&instalada=1' : ''}`);
    return;
  }
  const preferencias: Record<string, string> = {};
  try {
    for (const clave of ['sonido', 'musica', 'proyector', 'suave']) {
      const valor = localStorage.getItem(`${PREFIJO}:${clave}`);
      if (valor === 'si' || valor === 'no') preferencias[clave] = valor;
    }
  } catch {
    // Sin preferencias: se usan las de por defecto allá.
  }
  const id = idMudanza();
  const firma = firmaDeGrupos(grupos);
  const pendiente: Pendiente = { id, destino, firma, porGrupo: Object.fromEntries(grupos.map((g) => [g.id, cyrb53(JSON.stringify(g))])), fecha: Date.now() };
  try {
    await extrasIndexedDb.guardar(CLAVE_PENDIENTE, pendiente);
  } catch {
    useMudanza.setState({ estado: { fase: 'fallo', destino } });
    return;
  }
  irA(`${destino}/${fragmentoDeMudanza({ v: 2, id, origen: location.origin, firma, instalada, grupos, preferencias })}`);
}

function idMudanza(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * En una dirección vieja: revisa en segundo plano si alguna dirección nueva ya sirve este juego (y otra
 * vez cuando vuelve la conexión). En cualquier otra dirección no hace nada.
 */
export function vigilarMudanza(host: string = location.hostname, pedir: typeof fetch = fetch.bind(globalThis)): void {
  const destinos = destinosDeMudanza(host);
  if (!destinos.length) return;
  void (async () => {
    try {
      const mudados = (await extrasIndexedDb.leer(CLAVE_MUDADOS)) as Mudados | undefined;
      if (mudados?.grupos.length) useMudanza.setState({ mudadosA: mudados.destino });
    } catch {
      // Sin almacenamiento: no hay aviso.
    }
  })();
  let revisando = false;
  /**
   * `alVolverLaConexion`: la revisión que pide el evento "online". Es la única que se hace aunque ya haya
   * fallado en esta sesión (el evento solo llega cuando la conexión cambia, así que no es un bucle).
   */
  const revisar = async (alVolverLaConexion: boolean) => {
    if (revisando || useMudanza.getState().estado.fase !== 'dormida') return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    if (!alVolverLaConexion && yaFalloEnEstaSesion()) return;
    revisando = true;
    try {
      for (const destino of destinos) {
        if (!(await sirveEsteJuego(destino, pedir))) continue;
        anotarFallo(false);
        let nombres: string[] = [];
        try {
          nombres = gruposValidos(await leerGruposEstricto()).map((g) => nombreDelGrupo(g));
        } catch {
          // Se vuelve a intentar leer al mudarse.
        }
        if (useMudanza.getState().estado.fase === 'dormida') useMudanza.setState({ estado: { fase: 'disponible', destino, grupos: nombres } });
        return;
      }
      // Ninguna dirección nueva sirve el juego todavía: no se vuelve a preguntar en esta sesión.
      anotarFallo(true);
    } finally {
      revisando = false;
    }
  };
  setTimeout(() => void revisar(false), ESPERA_REVISION_MS);
  window.addEventListener('online', () => void revisar(true));
}

/**
 * La revisión de la dirección definitiva se hace una vez por sesión (pestaña): si falla (hoy, mientras
 * mixtle.org no sirve el juego), no se repite al recargar ni al cambiar de versión; solo al volver la
 * conexión. Si no hay sessionStorage, se revisa una vez por carga.
 */
const CLAVE_SIN_RESPUESTA = `${PREFIJO}:definitiva-sin-respuesta`;
function yaFalloEnEstaSesion(): boolean {
  try {
    return sessionStorage.getItem(CLAVE_SIN_RESPUESTA) === '1';
  } catch {
    return false;
  }
}
function anotarFallo(fallo: boolean): void {
  try {
    if (fallo) sessionStorage.setItem(CLAVE_SIN_RESPUESTA, '1');
    else sessionStorage.removeItem(CLAVE_SIN_RESPUESTA);
  } catch {
    // Sin sessionStorage: se revisa una vez por carga.
  }
}

/** Para el texto de las pantallas: "mixtle.org" (sin https://). */
export function nombreDeDireccion(destino: string = DIRECCION_DEFINITIVA): string {
  try {
    return new URL(destino).host;
  } catch {
    return destino;
  }
}
