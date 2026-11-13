import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/*
 * Lo que hace que "¡Jugar!" no espere a la red (medido en docs/mediciones/carga-*.json con scripts/medir-carga.mjs):
 * los efectos se piden de uno en uno cuando se necesitan, y la voz no detiene nada si llega tarde.
 */

// Howler falso: cada Howl queda "cargando" hasta que la prueba diga lo contrario.
const howls: { src: string; estado: string; tocado: number; oyentes: Record<string, (() => void)[]> }[] = [];
vi.mock('howler', () => {
  class Howl {
    datos: (typeof howls)[number];
    constructor(o: { src: string[] }) {
      this.datos = { src: o.src[0]!, estado: 'loading', tocado: 0, oyentes: {} };
      howls.push(this.datos);
    }
    state() {
      return this.datos.estado;
    }
    play() {
      this.datos.tocado++;
      return 1;
    }
    once(ev: string, fn: () => void) {
      (this.datos.oyentes[ev] ??= []).push(fn);
      return this;
    }
    stop() {
      return this;
    }
    unload() {}
    playing() {
      return false;
    }
  }
  return { Howl, Howler: { ctx: undefined, volume: () => 1 } };
});

beforeEach(() => {
  howls.length = 0;
  vi.resetModules();
});
afterEach(() => vi.useRealTimers());

describe('efectos de sonido', () => {
  it('el primer toque ya no pide los 22 efectos: cada uno se pide la primera vez que suena', async () => {
    const { sonido } = await import('../src/servicios/sonido');
    sonido.desbloquear();
    expect(sonido.pedidos).toBe(0);
    sonido.tocar('toque');
    sonido.tocar('toque');
    expect(sonido.pedidos).toBe(1);
    expect(howls.map((h) => h.src)).toEqual([expect.stringContaining('sonidos/toque.mp3')]);
    sonido.precargar(['toque', 'remate']);
    expect(sonido.pedidos).toBe(2);
  });
});

describe('la voz no detiene el juego si llega tarde', () => {
  let ARCHIVO = '';
  async function vozConFrase() {
    const { voz } = await import('../src/servicios/voz');
    const { archivoDeFrase } = await import('../src/voz/hash');
    ARCHIVO = archivoDeFrase('¡Al rescate!');
    voz.usarManifiesto({ version: 1, frases: { [ARCHIVO]: { texto: '¡Al rescate!', ms: 900, config: 'x' } } } as never);
    return voz;
  }

  it('con espera máxima, si el audio no bajó a tiempo, la frase termina sin decirse tarde', async () => {
    vi.useFakeTimers();
    const voz = await vozConFrase();
    const alTerminar = vi.fn();
    voz.decir('¡Al rescate!', alTerminar, { esperaMaximaMs: 800 });
    vi.advanceTimersByTime(799);
    expect(alTerminar).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(alTerminar).toHaveBeenCalledTimes(1);
    // Aunque el audio baje después, ya no suena.
    const h = howls.find((x) => x.src.endsWith(ARCHIVO))!;
    h.estado = 'loaded';
    for (const f of h.oyentes.load ?? []) f();
    expect(h.tocado).toBe(0);
  });

  it('si el audio está listo a tiempo, suena', async () => {
    vi.useFakeTimers();
    const voz = await vozConFrase();
    voz.decir('¡Al rescate!', undefined, { esperaMaximaMs: 800 });
    const h = howls.find((x) => x.src.endsWith(ARCHIVO))!;
    h.estado = 'loaded';
    for (const f of h.oyentes.load ?? []) f();
    expect(h.tocado).toBe(1);
  });

  it('precargar adelanta la descarga del audio de una frase (lo pide sin tocarlo)', async () => {
    const voz = await vozConFrase();
    await voz.precargar(['¡Al rescate!']);
    expect(howls.map((h) => h.src)).toEqual([expect.stringContaining(`voz/${ARCHIVO}`)]);
    expect(howls[0]!.tocado).toBe(0);
  });
});

describe('Mixtle no se corta a sí mismo al cambiar de pantalla', () => {
  it('la bienvenida espera a que termine "¡Al rescate!" (como mucho 800 ms) y lo de la pantalla anterior no se dice', async () => {
    vi.useFakeTimers();
    const { decir, callar, useNarrador } = await import('../src/app/estado/narrador');
    decir('¡Al rescate!', { cruzaPantalla: true });
    expect(useNarrador.getState().hablando).toBe(true);
    callar(); // cambió la pantalla
    decir('¿Quién va a jugar?');
    expect(useNarrador.getState().subtitulo).toBe('¡Al rescate!');
    vi.advanceTimersByTime(800);
    expect(useNarrador.getState().subtitulo).toBe('¿Quién va a jugar?');

    decir('Una frase larga que todavía se está diciendo cuando se cambia de pantalla.');
    decir('Esta ya no');
    callar();
    vi.advanceTimersByTime(20_000);
    expect(useNarrador.getState().subtitulo).not.toBe('Esta ya no');
  });
});

describe('nada pesado durante la transición de "¡Jugar!"', () => {
  it('el inicio adelanta el barrido de la transición (si no, se bajaba y decodificaba justo al tocar)', async () => {
    const { sonido } = await import('../src/servicios/sonido');
    const { EFECTOS_DEL_ARRANQUE } = await import('../src/app/pantallas/Inicio');
    expect(EFECTOS_DEL_ARRANQUE).toContain('barrido');
    sonido.precargar(EFECTOS_DEL_ARRANQUE);
    expect(howls.map((h) => h.src)).toEqual(expect.arrayContaining([expect.stringContaining('sonidos/barrido.mp3')]));
  });

  it('y pide la letra gruesa (Nunito 900) antes, no cuando la estrena el título de Grupos', async () => {
    const { calentarLetraGruesa } = await import('../src/app/pantallas/Inicio');
    const load = vi.fn(() => Promise.resolve([]));
    const doc = globalThis.document as unknown as { fonts?: unknown } | undefined;
    const habia = doc?.fonts;
    if (doc) Object.defineProperty(doc, 'fonts', { value: { load }, configurable: true });
    else (globalThis as unknown as { document: unknown }).document = { fonts: { load } };
    try {
      await calentarLetraGruesa();
      expect(load).toHaveBeenCalledWith('900 1em Nunito');
    } finally {
      if (doc) Object.defineProperty(doc, 'fonts', { value: habia, configurable: true });
      else delete (globalThis as unknown as { document?: unknown }).document;
    }
  });

  it('sin document.fonts no falla', async () => {
    const { calentarLetraGruesa } = await import('../src/app/pantallas/Inicio');
    const doc = globalThis.document as unknown as { fonts?: unknown } | undefined;
    const habia = doc?.fonts;
    if (doc) Object.defineProperty(doc, 'fonts', { value: undefined, configurable: true });
    try {
      await expect(calentarLetraGruesa()).resolves.toBeUndefined();
    } finally {
      if (doc) Object.defineProperty(doc, 'fonts', { value: habia, configurable: true });
    }
  });
});
