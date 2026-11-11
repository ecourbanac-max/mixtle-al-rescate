import { describe, expect, it } from 'vitest';
import { logoSvg } from '../src/arte/marca';
import { cuerpoDeMixtle, mixtleColgadoCompleto, mixtleCompleto, PALETA_MIXTLE, PERSONAJES } from '../src/arte/personajes';

/*
 * Mixtle se ve igual en todas partes: misma paleta (pelaje, cara, orejas, cachetes, nariz) y la cola
 * con los mismos anillos, en las poses del juego, en el logo, en el inicio (colgado) y en el ícono.
 * Y cada Mixtle en línea trae sus propios degradados: si dos compartieran id, el navegador tomaría
 * el primero del documento y, oculto este, Mixtle saldría deslavado (la tarjeta del recorrido guiado).
 */

/** Colores literales (#rgb/#rrggbb) de un SVG, en minúsculas. */
function colores(svg: string): Set<string> {
  return new Set([...svg.matchAll(/#[0-9a-fA-F]{3,6}\b/g)].map((m) => m[0].toLowerCase()));
}

/** Los `url(#…)` que usa un SVG y los `id` que define. */
function referencias(svg: string): { usa: Set<string>; define: Set<string> } {
  return {
    usa: new Set([...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]!)),
    define: new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!)),
  };
}

const referencia = colores(mixtleCompleto('feliz'));
const poses = PERSONAJES.filter((p) => p.clave.startsWith('mixtle'));

describe('Mixtle tiene la misma paleta en todas sus apariciones', () => {
  it('la paleta declarada es la que usan las poses (ningún color declarado sin usar, ninguno de más en la referencia)', () => {
    const union = new Set(poses.flatMap((p) => [...colores(p.svg)]));
    for (const color of Object.values(PALETA_MIXTLE)) expect(union).toContain(color.toLowerCase());
    expect(referencia.size).toBeGreaterThan(8);
  });

  it('cada pose del catálogo usa solo colores de la referencia (más los suyos de pose: las zetas al dormir)', () => {
    const permitidosExtra = new Set(['#2459a6']); // las Z de "duerme"
    expect(poses.length).toBeGreaterThanOrEqual(12);
    for (const pose of poses) {
      const deMas = [...colores(pose.svg)].filter((c) => !referencia.has(c) && !permitidosExtra.has(c));
      expect(deMas, pose.clave).toEqual([]);
    }
  });

  it('el logo, el colgado del inicio y el cuerpo en línea comparten la paleta', () => {
    for (const [nombre, svg] of [
      ['logo', logoSvg()],
      ['colgado', mixtleColgadoCompleto()],
      ['en línea (señalando)', cuerpoDeMixtle('senalando')],
    ] as const) {
      const deMas = [...colores(svg)].filter((c) => !referencia.has(c) && !/^#(fff|ffffff|000|123d2b|1f6b4a|fff8e7|4caf50|d3eef9|ffd23f|2a6f3a)$/.test(c));
      // El logo trae además los colores de marca (verde, cielo, sol); Mixtle no debe traer otros.
      expect(nombre === 'logo' ? [] : deMas, nombre).toEqual([]);
    }
  });

  it('la cola lleva los mismos anillos en todas las poses enteras y en el colgado', () => {
    const anillos = ['#f7f2e9', '#2f2723'];
    for (const svg of [mixtleCompleto('normal'), mixtleCompleto('feliz'), mixtleCompleto('celebrando'), mixtleColgadoCompleto(), logoSvg()]) {
      for (const c of anillos) expect(svg.toLowerCase()).toContain(c);
      expect(svg).toContain('stroke-dasharray');
    }
  });

  it('las proporciones de cabeza y ojos son las mismas en todas las poses (el mismo dibujo base)', () => {
    const cabeza = 'M180 70 C 252 70 282 120 274 166';
    const ojoIzq = 'cx="137" cy="152" rx="35" ry="31"';
    for (const pose of poses.filter((p) => !p.clave.endsWith('-cola'))) {
      expect(pose.svg, pose.clave).toContain(cabeza);
      expect(pose.svg, pose.clave).toContain(ojoIzq);
    }
  });
});

describe('cada Mixtle en línea trae sus propios degradados', () => {
  it('todo lo que usa un dibujo lo define él mismo', () => {
    for (const svg of [...poses.map((p) => p.svg), logoSvg(), cuerpoDeMixtle('senalando', '-abc'), mixtleCompleto('feliz', '-logo')]) {
      const { usa, define } = referencias(svg);
      for (const u of usa) expect(define, `falta ${u}`).toContain(u);
    }
  });

  it('con sufijos distintos, dos Mixtle no comparten ningún id', () => {
    const a = referencias(cuerpoDeMixtle('senalando', '-a'));
    const b = referencias(cuerpoDeMixtle('feliz', '-b'));
    for (const id of a.define) expect(b.define).not.toContain(id);
    expect(a.define.size).toBe(6); // 3 del cuerpo y 3 del pin de Eco Urban
    expect([...a.usa].every((u) => u.endsWith('-a'))).toBe(true);
  });

  it('el logo de la app no comparte id con el de la pantalla de carga (index.html)', () => {
    const carga = referencias(logoSvg());
    const app = referencias(logoSvg({ sufijo: '-logo' }));
    for (const id of app.define) expect(carga.define).not.toContain(id);
  });
});
