import { create } from 'zustand';
import { esEscena } from '../../logica/flujo';
import { guardarInterruptor, leerInterruptorApagado } from '../../servicios/preferencias';

export type Pantalla = 'inicio' | 'grupos' | 'camino' | 'leccion' | 'aventura' | 'album' | 'revision';

const CLAVE_PROYECTOR = 'mixtle-al-rescate:proyector';
const CLAVE_SUAVE = 'mixtle-al-rescate:suave';

interface EstadoApp {
  pantalla: Pantalla;
  leccionId?: string;
  /** Solo pruebas (?e2e): la lección empieza en este ejercicio (src/servicios/pruebas.ts). */
  ejercicioInicial?: string;
  unidadId?: string;
  /** Escena donde empieza la aventura (la intro si no se indica). */
  escenaInicial?: string;
  /** Modo proyector: todo más grande (se recuerda en el dispositivo). */
  proyector: boolean;
  /** "Animaciones suaves" (modo facilitador): menos movimiento, para quien se marea o se distrae. */
  suave: boolean;
  /** Estampa recién ganada para mostrar al volver al camino. */
  estampaNueva?: string;
  jugar: () => void;
  volverAlInicio: () => void;
  alCamino: (estampaNueva?: string) => void;
  abrirLeccion: (leccionId: string, ejercicioInicial?: string) => void;
  abrirAventura: (unidadId: string) => void;
  abrirAlbum: () => void;
  irAGrupos: () => void;
  alternarProyector: () => void;
  alternarSuave: () => void;
  /** El equipo no puede con las animaciones: se calman en esta sesión (sin guardarlo). */
  suavizarPorRendimiento: () => void;
  olvidarEstampaNueva: () => void;
}

/**
 * Pantalla inicial. Atajos para revisar (solo en desarrollo o con ?e2e):
 * `?escena=Nivel2` entra directo a esa escena de la aventura 1 (con `&unidad=u2`, a la de esa unidad);
 * `?galeria` muestra todo el arte; `?mixtle`, todas las apariciones de Mixtle (y los accesorios) lado a lado.
 */
export function pantallaInicial(busqueda: string, desarrollo: boolean): Pick<EstadoApp, 'pantalla' | 'escenaInicial' | 'unidadId'> {
  const params = new URLSearchParams(busqueda);
  if (params.has('galeria')) return { pantalla: 'aventura', escenaInicial: 'Galeria' };
  if (params.has('mixtle')) return { pantalla: 'revision' };
  const escena = params.get('escena');
  if (!(desarrollo || params.has('e2e')) || !escena) return { pantalla: 'inicio' };
  const unidadId = params.get('unidad') ?? 'u1';
  // En la aventura 1 solo se aceptan sus escenas; en las demás, la aventura misma revisa la clave.
  if (unidadId === 'u1' ? esEscena(escena) : /^[A-Z][A-Za-z0-9]+$/.test(escena)) return { pantalla: 'aventura', escenaInicial: escena, unidadId };
  return { pantalla: 'inicio' };
}

/** Lo que hay guardado en una preferencia (null si nunca se eligió). Nunca lanza. */
function leerPreferenciaGuardada(clave: string): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function aplicarAtributo(nombre: string, si: boolean): void {
  if (typeof document !== 'undefined') document.documentElement.toggleAttribute(nombre, si);
}

export const useApp = create<EstadoApp>((set, get) => {
  const proyector = leerInterruptorApagado(CLAVE_PROYECTOR);
  const suave = leerInterruptorApagado(CLAVE_SUAVE);
  aplicarAtributo('data-proyector', proyector);
  aplicarAtributo('data-suave', suave);
  return {
    ...pantallaInicial(typeof window === 'undefined' ? '' : window.location.search, import.meta.env.DEV),
    proyector,
    suave,
    jugar: () => set({ pantalla: 'grupos', escenaInicial: undefined }),
    volverAlInicio: () => set({ pantalla: 'inicio', escenaInicial: undefined, leccionId: undefined, unidadId: undefined }),
    alCamino: (estampaNueva) => set({ pantalla: 'camino', escenaInicial: undefined, leccionId: undefined, estampaNueva }),
    abrirLeccion: (leccionId, ejercicioInicial) => set({ pantalla: 'leccion', leccionId, ejercicioInicial }),
    abrirAventura: (unidadId) => set({ pantalla: 'aventura', unidadId, escenaInicial: undefined }),
    abrirAlbum: () => set({ pantalla: 'album' }),
    irAGrupos: () => set({ pantalla: 'grupos' }),
    alternarProyector: () => {
      const si = !get().proyector;
      guardarInterruptor(CLAVE_PROYECTOR, si);
      aplicarAtributo('data-proyector', si);
      set({ proyector: si });
    },
    suavizarPorRendimiento: () => {
      // Si el facilitador las apagó a propósito en este aparato, se respeta su decisión.
      if (get().suave || leerPreferenciaGuardada(CLAVE_SUAVE) === 'no') return;
      aplicarAtributo('data-suave', true);
      set({ suave: true });
    },
    alternarSuave: () => {
      const si = !get().suave;
      guardarInterruptor(CLAVE_SUAVE, si);
      aplicarAtributo('data-suave', si);
      set({ suave: si });
    },
    olvidarEstampaNueva: () => set({ estampaNueva: undefined }),
  };
});
