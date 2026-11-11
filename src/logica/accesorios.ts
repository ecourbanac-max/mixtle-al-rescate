import type { ProgresoGrupo } from './camino';
import type { IdMascota } from './grupos';

/*
 * Accesorios para la mascota del grupo (v3, personalización). Se compran con hojitas a un precio
 * fijo que se ve desde antes; lo comprado nunca se pierde; nada es al azar y no hay dinero real.
 * Le dan uso a las hojitas y sentido de pertenencia ("nuestra ardilla con su gorra").
 */

export const ACCESORIOS = [
  { id: 'flor', nombre: 'Flor de cempasúchil', articulo: 'la', precio: 25, origen: { x: 0.5, y: 0.5 }, detras: false },
  { id: 'gorra', nombre: 'Gorra', articulo: 'la', precio: 30, origen: { x: 0.5, y: 0.85 }, detras: false },
  { id: 'lentes', nombre: 'Lentes', articulo: 'los', precio: 40, origen: { x: 0.5, y: 0.5 }, detras: false },
  { id: 'paliacate', nombre: 'Paliacate', articulo: 'el', precio: 50, origen: { x: 0.5, y: 0.25 }, detras: false },
  { id: 'mochila', nombre: 'Mochila', articulo: 'la', precio: 60, origen: { x: 0.5, y: 0.5 }, detras: false },
  { id: 'capa', nombre: 'Capa de guardián', articulo: 'la', precio: 80, origen: { x: 0.5, y: 0.12 }, detras: true },
] as const;

export type IdAccesorio = (typeof ACCESORIOS)[number]['id'];

/** El accesorio con su artículo, para decirlo en una frase: "la gorra", "los lentes". */
export function conArticulo(id: IdAccesorio): string {
  const a = ACCESORIOS.find((x) => x.id === id)!;
  return `${a.articulo} ${a.nombre.toLowerCase()}`;
}

/** `encima`: dibujarlo delante de la mascota aunque normalmente vaya detrás (la capa en la mariposa). */
export type Ancla = { x: number; y: number; w: number; r?: number; encima?: boolean };

/**
 * Dónde va cada accesorio en el dibujo de cada mascota (fracciones de su caja; `w` es el ancho del
 * accesorio). Medido sobre el arte del juego con una cuadrícula (ver docs/marca.md).
 */
export const ANCLAS_MASCOTA: Record<IdMascota, Record<IdAccesorio, Ancla>> = {
  colibri: {
    flor: { x: 0.47, y: 0.34, w: 0.1 },
    gorra: { x: 0.4, y: 0.37, w: 0.25, r: -8 },
    lentes: { x: 0.35, y: 0.47, w: 0.2 },
    paliacate: { x: 0.47, y: 0.6, w: 0.2, r: -10 },
    mochila: { x: 0.62, y: 0.47, w: 0.17, r: 8 },
    capa: { x: 0.6, y: 0.36, w: 0.44, r: 28 },
  },
  ardilla: {
    flor: { x: 0.53, y: 0.17, w: 0.15 },
    gorra: { x: 0.39, y: 0.22, w: 0.44 },
    lentes: { x: 0.39, y: 0.38, w: 0.42 },
    paliacate: { x: 0.39, y: 0.54, w: 0.42 },
    mochila: { x: 0.63, y: 0.66, w: 0.26 },
    capa: { x: 0.4, y: 0.45, w: 0.86 },
  },
  monarca: {
    flor: { x: 0.57, y: 0.26, w: 0.09 },
    gorra: { x: 0.5, y: 0.29, w: 0.2 },
    lentes: { x: 0.5, y: 0.33, w: 0.18 },
    // El cuerpo de la mariposa es delgado (18 px de 220): el paliacate va grande, como una bufanda sobre el
    // arranque de las alas, con el nudo bajo la barbilla; chico (w 0.15) casi no se veía (30 de octubre de 2026).
    paliacate: { x: 0.5, y: 0.435, w: 0.34 },
    mochila: { x: 0.5, y: 0.6, w: 0.13 },
    capa: { x: 0.5, y: 0.41, w: 0.17, encima: true },
  },
  ajolote: {
    flor: { x: 0.68, y: 0.23, w: 0.12 },
    gorra: { x: 0.5, y: 0.27, w: 0.38 },
    lentes: { x: 0.5, y: 0.48, w: 0.56 },
    paliacate: { x: 0.5, y: 0.73, w: 0.36 },
    mochila: { x: 0.8, y: 0.7, w: 0.17 },
    capa: { x: 0.52, y: 0.52, w: 0.6 },
  },
  tlacuache: {
    flor: { x: 0.37, y: 0.22, w: 0.1 },
    gorra: { x: 0.27, y: 0.3, w: 0.25, r: -10 },
    lentes: { x: 0.26, y: 0.42, w: 0.17 },
    paliacate: { x: 0.36, y: 0.56, w: 0.18, r: -10 },
    mochila: { x: 0.62, y: 0.42, w: 0.19 },
    capa: { x: 0.52, y: 0.4, w: 0.52, r: 22 },
  },
  // Medido sobre "mixtle-entero" (472×440: el cuerpo a la izquierda y la cola a la derecha).
  cacomixtle: {
    flor: { x: 0.5, y: 0.14, w: 0.09 },
    gorra: { x: 0.38, y: 0.22, w: 0.37 },
    lentes: { x: 0.38, y: 0.34, w: 0.38 },
    paliacate: { x: 0.38, y: 0.53, w: 0.32 },
    mochila: { x: 0.56, y: 0.64, w: 0.23 },
    capa: { x: 0.38, y: 0.48, w: 0.69 },
  },
};

/** Hojitas que se pueden gastar: las ganadas menos las gastadas en accesorios. */
export function hojitasDisponibles(p: ProgresoGrupo): number {
  return p.hojitas - (p.gastadas ?? 0);
}

export function tieneAccesorio(p: ProgresoGrupo, id: IdAccesorio): boolean {
  return (p.accesorios ?? []).includes(id);
}

/** Cuántas hojitas faltan para comprarlo (0 si ya alcanza o si ya es suyo). */
export function faltanPara(p: ProgresoGrupo, id: IdAccesorio): number {
  if (tieneAccesorio(p, id)) return 0;
  const precio = ACCESORIOS.find((a) => a.id === id)!.precio;
  return Math.max(0, precio - hojitasDisponibles(p));
}

/** Compra un accesorio y se lo pone. Si ya es suyo o no alcanza, no cambia nada. */
export function comprarAccesorio(p: ProgresoGrupo, id: IdAccesorio): ProgresoGrupo {
  const accesorio = ACCESORIOS.find((a) => a.id === id);
  if (!accesorio || tieneAccesorio(p, id) || hojitasDisponibles(p) < accesorio.precio) return p;
  return {
    ...p,
    accesorios: [...(p.accesorios ?? []), id],
    puestos: [...(p.puestos ?? []).filter((x) => x !== id), id],
    gastadas: (p.gastadas ?? 0) + accesorio.precio,
  };
}

/** Pone o quita un accesorio que ya es suyo (quitárselo no lo pierde). */
export function alternarPuesto(p: ProgresoGrupo, id: IdAccesorio): ProgresoGrupo {
  if (!tieneAccesorio(p, id)) return p;
  const puestos = p.puestos ?? [];
  return { ...p, puestos: puestos.includes(id) ? puestos.filter((x) => x !== id) : [...puestos, id] };
}

/** Los accesorios puestos, en el orden del catálogo (y solo los que de verdad son suyos). */
export function accesoriosPuestos(p: ProgresoGrupo): IdAccesorio[] {
  return ACCESORIOS.map((a) => a.id).filter((id) => (p.puestos ?? []).includes(id) && tieneAccesorio(p, id));
}
