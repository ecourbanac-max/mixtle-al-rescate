import { useApp } from '../app/estado/app';
import type { IdAccesorio } from '../logica/accesorios';
import type { IdMascota } from '../logica/grupos';
import type Phaser from 'phaser';

/** Lo de grupos y accesorios se carga solo si una prueba lo pide: no va en lo que baja antes de la primera pantalla. */
async function modulosDeGrupos() {
  const [{ useGrupos }, { ACCESORIOS, alternarPuesto, comprarAccesorio }, { PROGRESO_VACIO }, { COLORES_GRUPO, nuevoGrupo }, { marcarRecorridoVisto }] = await Promise.all([
    import('../app/estado/grupos'),
    import('../logica/accesorios'),
    import('../logica/camino'),
    import('../logica/grupos'),
    import('../logica/recorridoGuiado'),
  ]);
  return { useGrupos, ACCESORIOS, alternarPuesto, comprarAccesorio, PROGRESO_VACIO, COLORES_GRUPO, nuevoGrupo, marcarRecorridoVisto };
}
import { ANIMALES } from '../data/animales';
import { progreso, resumenDiploma } from '../logica/progreso';
import { entradaTerminada } from '../ui/transicion';
import { juegoActual } from '../aventuras/juegoActual';
import { musica } from './audio/motor';
import { voz } from './voz';

export interface ObjetoTocable {
  nombre: string;
  escena: string;
  /** Centro visual, en coordenadas del juego. */
  x: number;
  y: number;
  ancho: number;
  alto: number;
  /** Tamaño real del área de toque, en coordenadas del juego. */
  toqueAncho: number;
  toqueAlto: number;
}

// Ojo: aquí no se importa Phaser como valor, para no cargarlo antes de entrar a una aventura.
type ConTransformacion = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.GetBounds & { getWorldTransformMatrix(): Phaser.GameObjects.Components.TransformMatrix };

/** Tamaño del área de toque (no del dibujo), con la escala de todos sus contenedores. */
function zonaDeToque(o: ConTransformacion): { ancho: number; alto: number } {
  const m = o.getWorldTransformMatrix();
  const sx = Math.hypot(m.a, m.b);
  const sy = Math.hypot(m.c, m.d);
  const h = o.input?.hitArea as { radius?: number; width?: number; height?: number } | undefined;
  if (h && typeof h.radius === 'number') return { ancho: h.radius * 2 * sx, alto: h.radius * 2 * sy };
  if (h && typeof h.width === 'number' && typeof h.height === 'number') return { ancho: h.width * sx, alto: h.height * sy };
  const b = o.getBounds();
  return { ancho: b.width, alto: b.height };
}

/**
 * Ganchos para las pruebas automáticas de recorrido (Playwright). Solo se activan en
 * desarrollo o con `?e2e` en la dirección; no exponen ni guardan datos de nadie.
 */
export function exponerParaPruebas(): void {
  const params = new URLSearchParams(window.location.search);
  if (!import.meta.env.DEV && !params.has('e2e')) return;

  /** Escenas de Phaser activas (ninguna si se están viendo pantallas de React). */
  const escenasActivas = () => juegoActual()?.scene.getScenes(true) ?? [];

  const tocables = (): ObjetoTocable[] => {
    const lista: ObjetoTocable[] = [];
    for (const escena of escenasActivas()) {
      const visitar = (objetos: Phaser.GameObjects.GameObject[]) => {
        for (const o of objetos) {
          const visible = (o as unknown as { visible?: boolean }).visible !== false;
          if (!visible) continue;
          if (o.input?.enabled && o.name && 'getBounds' in o && 'getWorldTransformMatrix' in o) {
            const t = o as ConTransformacion;
            const b = t.getBounds();
            const z = zonaDeToque(t);
            lista.push({
              nombre: o.name,
              escena: escena.scene.key,
              x: b.centerX,
              y: b.centerY,
              ancho: b.width,
              alto: b.height,
              toqueAncho: z.ancho,
              toqueAlto: z.alto,
            });
          }
          const hijos = (o as unknown as { list?: unknown }).list;
          if (o.type === 'Container' && Array.isArray(hijos)) visitar(hijos as Phaser.GameObjects.GameObject[]);
        }
      };
      visitar(escena.children.list);
    }
    return lista;
  };

  (window as unknown as Record<string, unknown>).__mixtle = {
    escenas: () => escenasActivas().map((s) => s.scene.key),
    /** Pantalla de React visible (por ejemplo "inicio" o "aventura"). */
    pantalla: () => document.querySelector<HTMLElement>('[data-pantalla]')?.dataset.pantalla ?? null,
    tocables,
    /** Globos de Mixtle en las escenas activas: a dónde apunta la colita y dónde está Mixtle. */
    globos: () =>
      escenasActivas().flatMap((s) => {
        const n = (s as unknown as { narrador?: { paraPruebas?: () => unknown } }).narrador;
        return n && typeof n.paraPruebas === 'function' ? [{ escena: s.scene.key, ...(n.paraPruebas() as object) }] : [];
      }),
    resumen: () => resumenDiploma(progreso(), ANIMALES),
    /** Marcador de la aventura de las unidades 2 a 5 (lo que llevan rescatado, sembrado, etc.). */
    marcador: () => (juegoActual()?.registry.get('marcador') as Record<string, number> | undefined) ?? null,
    /** Frases dichas con audio grabado y con la voz del navegador. */
    voz: () => ({ ...voz.cuenta }),
    /** Pista de música de fondo que está sonando (o null). */
    musica: () => musica.pistaActual,
    /** true mientras se oye un audio de Mixtle (no la espera a que baje): para medir cuándo empieza a narrar. */
    narrando: () => voz.sonandoAhora,
    fps: () => Math.round(juegoActual()?.loop.actualFps ?? 0),
    /** Vuelve al camino como si se acabara de ganar esa estampa (revisar la recompensa y grabar el tráiler). */
    estampaNueva: (id: string) => useApp.getState().alCamino(id),
    /**
     * Un grupo con esa mascota, con todos los accesorios comprados y los indicados puestos (y el recorrido
     * guiado ya visto), elegido y en el camino: para revisar el vestidor con cada mascota y accesorio.
     */
    grupoVestido: async (mascota: IdMascota, puestos: IdAccesorio[] = []) => {
      const { useGrupos, ACCESORIOS, alternarPuesto, comprarAccesorio, PROGRESO_VACIO, COLORES_GRUPO, nuevoGrupo, marcarRecorridoVisto } = await modulosDeGrupos();
      let progreso = marcarRecorridoVisto({ ...PROGRESO_VACIO, hojitas: 999 });
      for (const a of ACCESORIOS) progreso = comprarAccesorio(progreso, a.id);
      for (const id of puestos) progreso = alternarPuesto(progreso, id);
      const grupo = { ...nuevoGrupo({ mascota, color: COLORES_GRUPO[0], etiqueta: 'Prueba' }, `prueba-${mascota}-${Date.now()}`, Date.now()), progreso };
      useGrupos.setState((s) => ({ grupos: [...s.grupos, grupo], actualId: grupo.id }));
      useApp.getState().alCamino();
      return grupo.id;
    },
    /** Abre la lección que tiene ese ejercicio, empezando en él (para revisar escenas sin jugar la lección). */
    abrirEjercicio: async (id: string) => {
      const { UNIDADES } = await import('../contenido/unidades');
      const leccion = UNIDADES.flatMap((u) => u.lecciones).find((l) => l.ejercicios.some((e) => e.id === id));
      if (!leccion) throw new Error(`No existe el ejercicio ${id}`);
      useApp.getState().abrirLeccion(leccion.id, id);
    },
    /** Deja puestos exactamente esos accesorios en el grupo actual (los demás, guardados). */
    ponerse: async (puestos: IdAccesorio[]) => {
      const { useGrupos } = await modulosDeGrupos();
      const { grupos, actualId } = useGrupos.getState();
      useGrupos.setState({ grupos: grupos.map((g) => (g.id === actualId ? { ...g, progreso: { ...g.progreso, puestos: [...puestos] } } : g)) });
    },
    /** true cuando ninguna pantalla visible está a media animación de entrada (para capturas). */
    quieto: () => {
      const activas = escenasActivas().filter((s) => s.scene.key !== 'Boot');
      if (activas.length) return activas.every(entradaTerminada);
      if (juegoActual()) return false; // la aventura aún está cargando
      return !!document.querySelector('[data-pantalla][data-entrada-lista="true"]');
    },
  };
}
