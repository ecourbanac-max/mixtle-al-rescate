import 'fake-indexeddb/auto';
import { createStore, get, set } from 'idb-keyval';
import { describe, expect, it } from 'vitest';
import { COLORES_GRUPO, fusionarGrupos, nuevoGrupo, type Grupo } from '../src/logica/grupos';
import { completarLeccion } from '../src/logica/camino';
import { migrarGrupos, migrarPreferencias, PREFIJO, PREFIJO_ANTERIOR } from '../src/servicios/migracion';
import { fragmentoDeMudanza, leerMudanza } from '../src/servicios/mudanza';
import { ponerPreferenciasQueLlegan } from '../src/servicios/preferencias';

/** localStorage de mentira (con key y length, como el de verdad). */
function almacenFalso(inicial: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(inicial));
  return {
    get length() {
      return m.size;
    },
    key: (i: number) => [...m.keys()][i] ?? null,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
  };
}

const grupo = (id: string, etiqueta = '1°A'): Grupo => nuevoGrupo({ mascota: 'ajolote', color: COLORES_GRUPO[0], etiqueta }, id, 0);

describe('nombre anterior → Mixtle: preferencias (localStorage)', () => {
  it('pasa las claves "caco-al-rescate:*" a "mixtle-al-rescate:*" y borra las anteriores', () => {
    const a = almacenFalso({ [`${PREFIJO_ANTERIOR}:sonido`]: 'no', [`${PREFIJO_ANTERIOR}:proyector`]: 'si', otra: 'x' });
    expect(migrarPreferencias(a)).toBe(2);
    expect(a.getItem(`${PREFIJO}:sonido`)).toBe('no');
    expect(a.getItem(`${PREFIJO}:proyector`)).toBe('si');
    expect(a.getItem(`${PREFIJO_ANTERIOR}:sonido`)).toBeNull();
    expect(a.getItem('otra')).toBe('x');
  });

  it('si ya hay una preferencia con el nombre nuevo, gana la nueva; correr dos veces no cambia nada', () => {
    const a = almacenFalso({ [`${PREFIJO_ANTERIOR}:musica`]: 'no', [`${PREFIJO}:musica`]: 'si' });
    migrarPreferencias(a);
    migrarPreferencias(a);
    expect(a.getItem(`${PREFIJO}:musica`)).toBe('si');
    expect(a.length).toBe(1);
  });

  it('con el almacenamiento bloqueado no lanza', () => {
    const roto = { get length(): number { throw new Error('bloqueado'); } } as unknown as Storage;
    expect(migrarPreferencias(roto)).toBe(0);
    expect(migrarPreferencias(null)).toBe(0);
  });
});

describe('nombre anterior → Mixtle: grupos (IndexedDB)', () => {
  it('los grupos de la base "caco-al-rescate" pasan a "mixtle-al-rescate" sin perder avance', async () => {
    const anterior = createStore(PREFIJO_ANTERIOR, 'datos');
    const conAvance = { ...grupo('g1'), progreso: completarLeccion(grupo('g1').progreso, 'u1-l1', { hojitas: 15, aLaPrimera: 5 }, '2026-10-20') };
    await set('grupos', [conAvance, grupo('g2', '2°B')], anterior);

    expect(await migrarGrupos()).toBe(true);
    const nuevos = (await get('grupos', createStore(PREFIJO, 'datos'))) as Grupo[];
    expect(nuevos.map((g) => g.id)).toEqual(['g1', 'g2']);
    expect(nuevos[0]!.progreso.hojitas).toBe(15);
    expect(await get('grupos', anterior)).toBeUndefined();
    // Correrla otra vez no hace nada ni borra lo nuevo.
    expect(await migrarGrupos()).toBe(false);
    expect(((await get('grupos', createStore(PREFIJO, 'datos'))) as Grupo[]).length).toBe(2);
  });

  it('no pisa grupos que ya existan con el nombre nuevo', async () => {
    await set('grupos', [grupo('nuevo')], createStore(PREFIJO, 'datos'));
    await set('grupos', [grupo('viejo')], createStore(PREFIJO_ANTERIOR, 'datos'));
    await migrarGrupos();
    expect(((await get('grupos', createStore(PREFIJO, 'datos'))) as Grupo[]).map((g) => g.id)).toEqual(['nuevo']);
  });
});

// Las direcciones viejas y la mudanza con confirmación (v3.2): tests/mudanzaDefinitiva.test.ts.
describe('el paquete de una mudanza (v1, de la v3)', () => {
  it('los grupos y preferencias viajan completos en el fragmento (con acentos y "1°A")', () => {
    const g = { ...grupo('g1', '1°A'), progreso: completarLeccion(grupo('g1').progreso, 'u1-l1', { hojitas: 12, aLaPrimera: 2 }, '2026-10-20') };
    const fragmento = fragmentoDeMudanza({ v: 1, grupos: [g], preferencias: { sonido: 'no', proyector: 'si' } });
    expect(fragmento).toMatch(/^#mudanza=[A-Za-z0-9_-]+$/); // seguro para URL
    const m = leerMudanza(fragmento)!;
    expect(m.grupos).toEqual([g]);
    expect(m.preferencias).toEqual({ sonido: 'no', proyector: 'si' });
  });

  it('una mudanza dañada o ajena no rompe nada y no mete datos raros', () => {
    expect(leerMudanza('')).toBeNull();
    expect(leerMudanza('#mudanza=esto-no-es-json')).toBeNull();
    expect(leerMudanza('#otra=cosa')).toBeNull();
    const rara = leerMudanza(fragmentoDeMudanza({ v: 1, grupos: [{ basura: true } as unknown as Grupo], preferencias: { sonido: '<script>', 'x y': 'si' } }))!;
    expect(rara.grupos).toEqual([]);
    expect(rara.preferencias).toEqual({});
  });

  it('al llegar, las preferencias que traía se ponen sin pisar las que ya hay', () => {
    const a = almacenFalso({ [`${PREFIJO}:musica`]: 'si' });
    ponerPreferenciasQueLlegan(leerMudanza(fragmentoDeMudanza({ v: 1, grupos: [], preferencias: { musica: 'no', sonido: 'no' } }))!.preferencias, a);
    expect(a.getItem(`${PREFIJO}:musica`)).toBe('si');
    expect(a.getItem(`${PREFIJO}:sonido`)).toBe('no');
  });

  it('al juntar grupos nunca se pierde uno; si llega dos veces, se queda el de más avance', () => {
    const local = grupo('a');
    const lejosConAvance = { ...grupo('a'), progreso: completarLeccion(grupo('a').progreso, 'u1-l1', { hojitas: 15, aLaPrimera: 5 }, '2026-10-20') };
    const resultado = fusionarGrupos([local, grupo('b')], [lejosConAvance, grupo('c')]);
    expect(resultado.map((g) => g.id)).toEqual(['a', 'b', 'c']);
    expect(resultado[0]!.progreso.hojitas).toBe(15);
    expect(fusionarGrupos([lejosConAvance], [local])[0]!.progreso.hojitas).toBe(15);
  });
});
