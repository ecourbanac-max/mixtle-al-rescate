import { create } from 'zustand';
import type { Unidad } from '../../contenido/tipos';
import {
  abrirCofre,
  completarAventura,
  completarLeccion,
  hoyLocal,
  PROGRESO_VACIO,
  type ProgresoGrupo,
} from '../../logica/camino';
import { alternarPuesto, comprarAccesorio, type IdAccesorio } from '../../logica/accesorios';
import { grupoDemo } from '../../logica/demo';
import { gruposValidos, juntarGrupos, nuevoGrupo, type Grupo, type Juntados } from '../../logica/grupos';
import { marcarRecorridoVisto } from '../../logica/recorridoGuiado';
import { almacenIndexedDb, type Almacen } from '../../servicios/almacen';

interface EstadoGrupos {
  grupos: Grupo[];
  actualId: string | null;
  cargado: boolean;
  /** false si el último guardado falló (el juego sigue en memoria). */
  guardadoOk: boolean;
  cargar: () => Promise<void>;
  crear: (datos: Pick<Grupo, 'mascota' | 'color' | 'etiqueta'>) => Grupo;
  /** Modo facilitador: un grupo "Demo" con las 5 unidades terminadas (queda elegido). */
  crearDemo: () => Grupo;
  /** Quita un grupo con todo su avance (si era el elegido, ya no hay grupo elegido). */
  borrar: (id: string) => void;
  /**
   * Plan B de la mudanza (v3.2): agrega los grupos de un respaldo sin sobrescribir ninguno (ver juntarGrupos).
   * Devuelve qué pasó con cada uno, para decírselo al maestro.
   */
  importar: (grupos: readonly Grupo[]) => Juntados;
  /** El grupo actual ya vio (o saltó) el recorrido guiado. */
  marcarRecorridoVisto: () => void;
  elegir: (id: string | null) => void;
  /** Modo facilitador. */
  reiniciar: (id: string) => void;
  desbloquearTodo: (id: string, si: boolean) => void;
  /** Progreso del grupo elegido. */
  terminarLeccion: (leccionId: string, r: { hojitas: number; aLaPrimera: number }) => void;
  abrirCofre: (unidadId: string) => void;
  terminarAventura: (unidad: Unidad) => void;
  /** Accesorios de la mascota (v3): comprar con hojitas y poner o quitar. */
  comprarAccesorio: (id: IdAccesorio) => void;
  alternarPuesto: (id: IdAccesorio) => void;
}

let almacen: Almacen = almacenIndexedDb;
/** Para pruebas: cambiar dónde se guarda. */
export function usarAlmacen(a: Almacen): void {
  almacen = a;
}

function idNuevo(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export const useGrupos = create<EstadoGrupos>((set, get) => {
  const guardar = () => {
    void almacen.guardar(get().grupos).then((ok) => set({ guardadoOk: ok }));
  };
  const cambiarProgreso = (cambio: (p: ProgresoGrupo) => ProgresoGrupo) => {
    const { actualId, grupos } = get();
    if (!actualId) return;
    set({ grupos: grupos.map((g) => (g.id === actualId ? { ...g, progreso: cambio(g.progreso) } : g)) });
    guardar();
  };
  const cambiarGrupo = (id: string, cambio: (g: Grupo) => Grupo) => {
    set({ grupos: get().grupos.map((g) => (g.id === id ? cambio(g) : g)) });
    guardar();
  };

  return {
    grupos: [],
    actualId: null,
    cargado: false,
    guardadoOk: true,
    async cargar() {
      const datos = await almacen.leer();
      // Si el usuario ya creó grupos antes de que terminara la carga, no se pierden.
      const leidos = gruposValidos(datos).filter((g) => !get().grupos.some((x) => x.id === g.id));
      set({ grupos: [...leidos, ...get().grupos], cargado: true });
    },
    crear(datos) {
      const grupo = nuevoGrupo(datos, idNuevo(), Date.now());
      set({ grupos: [...get().grupos, grupo], actualId: grupo.id });
      guardar();
      return grupo;
    },
    crearDemo() {
      const grupo = grupoDemo(idNuevo(), Date.now(), hoyLocal());
      set({ grupos: [...get().grupos, grupo], actualId: grupo.id });
      guardar();
      return grupo;
    },
    borrar(id) {
      const { grupos, actualId } = get();
      set({ grupos: grupos.filter((g) => g.id !== id), actualId: actualId === id ? null : actualId });
      guardar();
    },
    importar(llegan) {
      const juntos = juntarGrupos(get().grupos, llegan);
      set({ grupos: juntos.grupos });
      guardar();
      return juntos;
    },
    marcarRecorridoVisto() {
      cambiarProgreso(marcarRecorridoVisto);
    },
    elegir(id) {
      set({ actualId: id });
    },
    reiniciar(id) {
      cambiarGrupo(id, (g) => ({ ...g, desbloquearTodo: false, progreso: structuredClone(PROGRESO_VACIO) }));
    },
    desbloquearTodo(id, si) {
      cambiarGrupo(id, (g) => ({ ...g, desbloquearTodo: si }));
    },
    terminarLeccion(leccionId, r) {
      cambiarProgreso((p) => completarLeccion(p, leccionId, r, hoyLocal()));
    },
    abrirCofre(unidadId) {
      cambiarProgreso((p) => abrirCofre(p, unidadId, hoyLocal()));
    },
    terminarAventura(unidad) {
      cambiarProgreso((p) => completarAventura(p, unidad, hoyLocal()));
    },
    comprarAccesorio(id) {
      cambiarProgreso((p) => comprarAccesorio(p, id));
    },
    alternarPuesto(id) {
      cambiarProgreso((p) => alternarPuesto(p, id));
    },
  };
});

export function useGrupoActual(): Grupo | null {
  return useGrupos((s) => s.grupos.find((g) => g.id === s.actualId) ?? null);
}
