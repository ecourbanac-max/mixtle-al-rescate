import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../src/app/estado/app';
import { useGrupos, usarAlmacen } from '../src/app/estado/grupos';
import { callar, useNarrador } from '../src/app/estado/narrador';
import { Camino } from '../src/app/pantallas/Camino';
import { TEXTOS_APP } from '../src/contenido/textosApp';
import { PROGRESO_VACIO } from '../src/logica/camino';
import { mascota, nuevoGrupo } from '../src/logica/grupos';
import { marcarRecorridoVisto } from '../src/logica/recorridoGuiado';
import { almacenEnMemoria } from '../src/servicios/almacen';

// Un grupo que ya vio el recorrido guiado: al llegar al camino, Mixtle lo saluda por su nombre.
const colibri = { ...nuevoGrupo({ mascota: 'colibri', color: '#1F6B4A', etiqueta: '2°B' }, 'g1', 0), progreso: marcarRecorridoVisto(PROGRESO_VACIO) };
const subtitulo = () => useNarrador.getState().subtitulo;

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  usarAlmacen(almacenEnMemoria());
  useGrupos.setState({ grupos: [colibri], actualId: colibri.id, cargado: true, guardadoOk: true });
  useApp.setState({ pantalla: 'camino', estampaNueva: undefined });
  // Como al llegar al camino desde otra pantalla: lo que Mixtle decía antes se descarta.
  callar();
  useNarrador.setState({ subtitulo: '', hablando: false });
});

describe('el saludo de Mixtle en el camino', () => {
  it('saluda al grupo elegido por el nombre de su mascota', () => {
    render(<Camino />);
    expect(subtitulo()).toBe(TEXTOS_APP.camino.hola(mascota('colibri').nombre));
  });

  it('si el facilitador crea el grupo de demostración con el camino en pantalla, saluda al grupo nuevo, no al anterior', () => {
    render(<Camino />);
    expect(subtitulo()).toBe(TEXTOS_APP.camino.hola(mascota('colibri').nombre));
    act(() => void useGrupos.getState().crearDemo());
    const demo = useGrupos.getState().grupos[1]!;
    expect(useGrupos.getState().actualId).toBe(demo.id);
    // El grupo Demo ya lo tiene todo hecho: Mixtle lo felicita en vez de señalar la siguiente lección; en
    // cualquier caso, ya no dice "¡Hola, grupo Colibrí!".
    expect(subtitulo()).not.toBe(TEXTOS_APP.camino.hola(mascota('colibri').nombre));
    expect(subtitulo()).toBe(TEXTOS_APP.camino.terminaron);
  });

  it('si en cambio se elige otro grupo a medias, lo saluda por su nombre', () => {
    const ardilla = { ...nuevoGrupo({ mascota: 'ardilla', color: '#1F6B4A', etiqueta: '3°A' }, 'g2', 0), progreso: marcarRecorridoVisto(PROGRESO_VACIO) };
    useGrupos.setState({ grupos: [colibri, ardilla] });
    render(<Camino />);
    expect(subtitulo()).toBe(TEXTOS_APP.camino.hola(mascota('colibri').nombre));
    act(() => useGrupos.getState().elegir(ardilla.id));
    expect(subtitulo()).toBe(TEXTOS_APP.camino.hola(mascota('ardilla').nombre));
  });
});
