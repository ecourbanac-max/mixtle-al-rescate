import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { catalogoArte } from '../src/arte/catalogo';

/*
 * El parque del grupo (v3.1.2): el árbol grande cabe completo en su marco. El marco es más ancho que
 * 16:9 (16:6 en el camino y al terminar una lección, 16:7 en la vitrina) y el dibujo se ajusta con
 * object-cover pegado abajo; con el parque de 16:9 se recortaba la copa. Ahora se usa "parque-ancho"
 * (1920×720): mientras el marco no sea más ancho que el dibujo, no se recorta nada arriba.
 */
const RAIZ = join(__dirname, '..');
const ancho = catalogoArte().find((a) => a.clave === 'parque-ancho')!;

describe('el parque del grupo', () => {
  it('usa el parque a lo ancho', () => {
    const codigo = readFileSync(join(RAIZ, 'src/app/componentes/ParqueGrupo.tsx'), 'utf8');
    expect(codigo).toContain('clave="parque-ancho"');
    expect(codigo).not.toMatch(/clave="parque"\s/);
  });

  it('ningún marco del parque del grupo es más ancho que el dibujo (no se recorta arriba)', () => {
    expect(ancho.svg).toContain('viewBox="0 0 1920 720"');
    const proporcionDibujo = 1920 / 720;
    const usos = ['src/app/pantallas/Camino.tsx', 'src/app/pantallas/Leccion.tsx', 'src/app/pantallas/Vitrina.tsx'].flatMap((f) =>
      [...readFileSync(join(RAIZ, f), 'utf8').matchAll(/<ParqueGrupo[^>]*aspect-\[(\d+)\/(\d+)\]/g)].map((m) => Number(m[1]) / Number(m[2])),
    );
    expect(usos.length).toBe(3);
    for (const p of usos) expect(p).toBeLessThanOrEqual(proporcionDibujo + 1e-9);
  });

  it('la copa del árbol grande queda dentro del dibujo, con aire arriba', () => {
    // El árbol se escala desde su base (478, 784 del parque entero) y la base sube con la franja: 784 − 360.
    const m = ancho.svg.match(/translate\(478 ([\d.]+)\) scale\(([\d.]+)\) translate\(-478 -784\)/)!;
    expect(m).not.toBeNull();
    const base = Number(m[1]);
    const escala = Number(m[2]);
    const copaArriba = 100; // la copa más alta del árbol en el parque entero: y = 250 − 150
    const arriba = base - escala * (784 - copaArriba);
    expect(arriba).toBeGreaterThanOrEqual(20);
    expect(base).toBeLessThanOrEqual(720);
  });
});
