import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locucion } from '../src/voz/locucion';

/*
 * El único narrador del juego (src/servicios/dialogo.ts), con una voz de mentira que la prueba controla:
 * cuándo empieza a oírse una frase y cuándo termina. v3.2.1, error 1: "Mixtle dice frases de otra
 * pantalla y se salta la consigna". La prueba en el navegador: e2e/dialogo.spec.ts.
 */

const voz = vi.hoisted(() => {
  const llamadas: { texto: string; terminar: () => void; alSonar?: () => void }[] = [];
  return {
    llamadas,
    callar: vi.fn(),
    /** Cada frase dura 1 s según la voz. */
    decir: vi.fn((l: unknown, terminar: () => void, op?: { alSonar?: () => void }) => {
      llamadas.push({ texto: Array.isArray(l) ? l.join(' ') : String(l), terminar, alSonar: op?.alSonar });
      return 1000;
    }),
  };
});
vi.mock('../src/servicios/voz', () => ({ voz }));

const { decir, callar, callarAlSalir, decirConsigna, repetir, useNarrador } = await import('../src/app/estado/narrador');
const dialogo = await import('../src/servicios/dialogo');
const { useApp } = await import('../src/app/estado/app');

const dichas = () => voz.llamadas.map((l) => l.texto);
/** La voz de la frase número `i` se oye y termina. */
function suenaYTermina(i: number) {
  voz.llamadas[i]!.alSonar?.();
  voz.llamadas[i]!.terminar();
}
const globo = () => useNarrador.getState().subtitulo;

beforeEach(() => {
  vi.useFakeTimers();
  dialogo.reiniciarDialogo();
  voz.llamadas.length = 0;
  voz.decir.mockClear();
  voz.callar.mockClear();
  useNarrador.setState({ subtitulo: '', hablando: false, expresion: 'normal' });
});
afterEach(() => vi.useRealTimers());

describe('una frase de la pantalla anterior nunca se cuela en la siguiente', () => {
  it('el caso que se vio: "¡Miren cómo crece su parque!" ya no reemplaza la consigna de la lección siguiente', () => {
    // Pantalla final de la lección: "¡Lo lograron!" y, al terminar, "¡Miren cómo crece su parque!".
    decir('¡Lo lograron!', { alTerminar: () => decir('¡Miren cómo crece su parque!') });
    // El adulto sale antes de que termine: se corta la voz (ya no avisará que terminó).
    callar();
    // La siguiente lección: su consigna.
    decirConsigna(['¡A buscar la basura!', 'Toca la basura tirada.'], 'Toca la basura tirada.');
    suenaYTermina(1);
    vi.advanceTimersByTime(60_000);
    expect(dichas()).not.toContain('¡Miren cómo crece su parque!');
    expect(globo()).toBe('¡A buscar la basura! Toca la basura tirada.');
  });

  it('el aviso tardío de un audio viejo no termina la frase nueva', () => {
    decir('Frase vieja');
    const avisoViejo = voz.llamadas[0]!.terminar;
    callar();
    decir('Frase nueva', { alTerminar: vi.fn() });
    avisoViejo();
    expect(dialogo.hablando()).toBe(true);
    expect(globo()).toBe('Frase nueva');
  });

  it('al cambiar de pantalla se corta lo que suena y se descarta lo pendiente', () => {
    decir('Uno');
    decir('Dos');
    useApp.setState({ pantalla: useApp.getState().pantalla === 'camino' ? 'grupos' : 'camino' });
    expect(voz.callar).toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(dichas()).toEqual(['Uno']);
  });

  it('la limpieza tardía de la pantalla anterior no corta la consigna de la nueva', () => {
    decir('¡Hola, grupo Ardilla!');
    const limpiarCamino = callarAlSalir(); // el camino se montó con este dueño
    useApp.setState({ pantalla: useApp.getState().pantalla === 'leccion' ? 'camino' : 'leccion' });
    decirConsigna('Toca la basura tirada.');
    limpiarCamino(); // el camino se desmonta después, al terminar la transición
    expect(voz.callar).toHaveBeenCalledTimes(1); // solo el corte del cambio de pantalla
    expect(dialogo.hablando()).toBe(true);
    expect(globo()).toBe('Toca la basura tirada.');
  });

  it('al cambiar de pantalla, el globo no se queda con el texto de la anterior', () => {
    decir('¡Hola, grupo Ardilla!');
    useApp.setState({ pantalla: useApp.getState().pantalla === 'leccion' ? 'camino' : 'leccion' });
    expect(globo()).toBe('');
  });

  it('una escena que ya no es la dueña no dice nada', () => {
    const escena = dialogo.nuevoDueno();
    callar(); // la pantalla cambió
    dialogo.decir('De la aventura', { dueno: escena });
    expect(dichas()).toEqual([]);
  });
});

describe('las frases van en orden, ninguna se salta', () => {
  it('una frase nueva espera a que termine la que suena', () => {
    decir('Primera');
    decir('Segunda');
    expect(globo()).toBe('Primera');
    expect(dichas()).toEqual(['Primera']);
    suenaYTermina(0);
    expect(globo()).toBe('Segunda');
    expect(dichas()).toEqual(['Primera', 'Segunda']);
  });

  it('lo que pidió una frase "al terminar" va en orden, si sigue en la misma pantalla', () => {
    decir('¡Lo lograron!', { alTerminar: () => decir('¡Miren cómo crece su parque!') });
    suenaYTermina(0);
    expect(dichas()).toEqual(['¡Lo lograron!', '¡Miren cómo crece su parque!']);
  });

  it('la misma frase pedida dos veces seguidas no se repite', () => {
    decir('¡Casi!');
    decir('¡Casi!');
    suenaYTermina(0);
    vi.advanceTimersByTime(60_000);
    expect(dichas()).toEqual(['¡Casi!']);
  });

  it('una respuesta a un toque se dice ya (corta lo que suena)', () => {
    decir('Algo largo');
    decir('¿Seguro que quieren salir?', { interrumpir: true });
    expect(globo()).toBe('¿Seguro que quieren salir?');
  });
});

describe('si el audio no suena, el globo se queda lo necesario para leerlo', () => {
  const lectura = (texto: Locucion) => dialogo.tiempoDeLectura(texto);

  it('3 s más 0.5 s por palabra', () => {
    expect(lectura('Toca la cáscara de plátano.')).toBe(3000 + 5 * 500);
  });

  it('la voz "terminó" sin oírse (apagada, bloqueada, sin archivo): la frase sigue hasta su tiempo de lectura', () => {
    const alTerminar = vi.fn();
    decir('Toca la cáscara de plátano.', { alTerminar });
    decir('Siguiente');
    voz.llamadas[0]!.terminar(); // sin alSonar: no se oyó
    vi.advanceTimersByTime(lectura('Toca la cáscara de plátano.') - 1);
    expect(alTerminar).not.toHaveBeenCalled();
    expect(globo()).toBe('Toca la cáscara de plátano.');
    vi.advanceTimersByTime(1);
    expect(alTerminar).toHaveBeenCalledTimes(1);
    expect(globo()).toBe('Siguiente');
  });

  it('si la voz nunca avisa (la cortó otro), la frase termina sola, sin adelantarse a su duración', () => {
    const alTerminar = vi.fn();
    decir('Una frase', { alTerminar });
    voz.llamadas[0]!.alSonar?.(); // se oye, pero nadie avisa el final
    vi.advanceTimersByTime(1000 + 2000);
    expect(alTerminar).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10_000);
    expect(alTerminar).toHaveBeenCalledTimes(1);
  });

  it('si se oyó completa, termina en cuanto la voz termina', () => {
    const alTerminar = vi.fn();
    decir('Una frase', { alTerminar });
    suenaYTermina(0);
    expect(alTerminar).toHaveBeenCalledTimes(1);
  });
});

describe('en un ejercicio, la consigna manda', () => {
  it('el festejo o la pista se dicen sin quitar la consigna del globo, y repetir dice la consigna', () => {
    decirConsigna(['¡Bienvenidos!', 'Toca la lata.'], 'Toca la lata.');
    decir('¡Casi! La lata va al azul.', { enGlobo: false });
    suenaYTermina(0);
    expect(dichas().at(-1)).toBe('¡Casi! La lata va al azul.');
    expect(globo()).toBe('¡Bienvenidos! Toca la lata.');
    suenaYTermina(1);
    repetir();
    expect(dichas().at(-1)).toBe('Toca la lata.');
    expect(globo()).toBe('Toca la lata.');
  });

  it('un ejercicio nuevo descarta el festejo pendiente del anterior', () => {
    decirConsigna('Consigna 1');
    decir('¡Muy bien!', { enGlobo: false });
    decirConsigna('Consigna 2');
    suenaYTermina(1);
    vi.advanceTimersByTime(60_000);
    expect(dichas()).toEqual(['Consigna 1', 'Consigna 2']);
  });
});

describe('"¡Al rescate!" se oye sobre la transición, sin cortar ni colarse', () => {
  it('la bienvenida de la pantalla nueva espera a que termine (como mucho 800 ms)', () => {
    decir('¡Al rescate!', { cruzaPantalla: true, alTerminar: () => decir('No debe decirse') });
    callar(); // cambió la pantalla
    decir('¿Quién va a jugar?');
    expect(globo()).toBe('¡Al rescate!');
    vi.advanceTimersByTime(dialogo.CRUCE_MS);
    expect(globo()).toBe('¿Quién va a jugar?');
    vi.advanceTimersByTime(60_000);
    expect(dichas()).not.toContain('No debe decirse');
  });

  it('si termina antes, la bienvenida sigue en seguida', () => {
    decir('¡Al rescate!', { cruzaPantalla: true });
    callar();
    decir('¿Quién va a jugar?');
    suenaYTermina(0);
    expect(globo()).toBe('¿Quién va a jugar?');
  });
});
