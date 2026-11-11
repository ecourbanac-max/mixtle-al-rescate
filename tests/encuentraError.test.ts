import { describe, expect, it } from 'vitest';
import type { EncuentraError } from '../src/contenido/tipos';
import { UNIDADES } from '../src/contenido/unidades';

/*
 * Las escenas de "encuentra el error" (v3.1.1), en papel: con la escena al tamaño que tiene en un
 * celular acostado (la más chica: 313×176 px) y en una compu (780×439), cada objeto se toca en un cuadro
 * de al menos 48 px; ninguno se sale de la escena ni se encima con otro. La prueba en el navegador
 * (e2e/encuentra.spec.ts) lo mide en pantallas de verdad, con la barra de respuesta.
 */
const ESCENAS = UNIDADES.flatMap((u) => u.lecciones.flatMap((l) => l.ejercicios)).filter((e): e is EncuentraError => e.tipo === 'encuentra-error');
const TAMANOS = [
  [313, 176],
  [780, 439],
] as const;

describe('escenas de "encuentra el error"', () => {
  it('son nueve, en las cinco unidades', () => {
    expect(ESCENAS.length).toBe(9);
  });

  it.each(ESCENAS.map((e) => [e.id, e] as const))('%s: objetos de 48 px, dentro de la escena y sin encimarse (celular y compu)', (_id, e) => {
    for (const [W, H] of TAMANOS) {
      const cuadros = e.objetos.map((o) => {
        const lado = Math.max(48, (o.ancho / 100) * W);
        const cx = (o.x / 100) * W;
        const cy = (o.y / 100) * H;
        return { id: o.id, x0: cx - lado / 2, y0: cy - lado / 2, x1: cx + lado / 2, y1: cy + lado / 2 };
      });
      for (const c of cuadros) {
        expect(c.x0 >= 0 && c.y0 >= 0 && c.x1 <= W && c.y1 <= H, `${e.id} ${W}×${H}: ${c.id} dentro`).toBe(true);
      }
      for (let i = 0; i < cuadros.length; i++)
        for (let j = i + 1; j < cuadros.length; j++) {
          const a = cuadros[i]!, b = cuadros[j]!;
          const encima = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
          expect(encima, `${e.id} ${W}×${H}: ${a.id} y ${b.id}`).toBe(false);
        }
    }
  });

  it('"lo que lastima al árbol": la rama cuelga del árbol, la lata está tirada al pie; el nido y la ardilla, en el árbol', () => {
    const e = ESCENAS.find((x) => x.id === 'u3-l1-e5')!;
    const de = (id: string) => e.objetos.find((o) => o.id === id)!;
    expect(de('rama').arte).toBe('rama-colgando');
    expect(de('lata').arte).toBe('lata-tirada');
    // El árbol del parque: tronco en x 22–28 %, copa arriba de y 47 %, suelo en y 72 %.
    expect(de('nido').y).toBeLessThan(47);
    expect(de('ardilla').y).toBeLessThan(47);
    expect(de('ardilla').x).toBeLessThan(40);
    expect(de('lata').y).toBeGreaterThan(70);
    expect(Math.abs(de('lata').x - 25)).toBeLessThan(12);
  });
});
