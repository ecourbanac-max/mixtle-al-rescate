import { describe, expect, it } from 'vitest';
import { ALTO, ANCHO } from '../src/config';
import { repartir } from '../src/logica/reparto';
import { RESIDUOS } from '../src/data/residuos';
import { ZONAS } from '../src/ui/layoutParque';

/*
 * v3.2.1, error 2: en el parque de la aventura 1, la basura se reparte al azar en zonas. Ninguna pieza
 * puede quedar cortada ni pegada a la orilla, salga como salga el azar. La prueba en el navegador, en
 * varias pantallas: e2e/aventurasPantalla.spec.ts.
 */

/** Margen mínimo con la orilla del juego (px del juego). */
const MARGEN = 24;
/** La basura mide 124 px y se gira hasta ±26° (±20° al repartir y 6° más al mecerse). */
const TAMANO = 124;
const GIRO = (26 * Math.PI) / 180;
const MEDIO = (TAMANO * (Math.cos(GIRO) + Math.sin(GIRO))) / 2;
/** El hoyo para plantar (nivel 3) mide 180×72. */
const HOYO = { ancho: 180, alto: 72 };

describe('el parque de la aventura 1: nada se corta ni queda pegado a la orilla', () => {
  it('cada zona de reparto deja el centro de la basura a la distancia segura de los bordes', () => {
    for (const z of ZONAS) {
      const { x, y, ancho, alto } = z.reparto.rect;
      expect(x - MEDIO, `${z.animal}: izquierda`).toBeGreaterThanOrEqual(MARGEN);
      expect(y - MEDIO, `${z.animal}: arriba`).toBeGreaterThanOrEqual(MARGEN);
      expect(x + ancho + MEDIO, `${z.animal}: derecha`).toBeLessThanOrEqual(ANCHO - MARGEN);
      expect(y + alto + MEDIO, `${z.animal}: abajo`).toBeLessThanOrEqual(ALTO - MARGEN);
    }
  });

  it('con cualquier azar, cada pieza queda completa dentro del área segura', () => {
    for (let semilla = 1; semilla <= 200; semilla++) {
      let s = semilla;
      const azar = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
      for (const c of repartir(RESIDUOS, ZONAS.map((z) => z.reparto), azar)) {
        expect(c.x - MEDIO).toBeGreaterThanOrEqual(MARGEN);
        expect(c.y - MEDIO).toBeGreaterThanOrEqual(MARGEN);
        expect(c.x + MEDIO).toBeLessThanOrEqual(ANCHO - MARGEN);
        expect(c.y + MEDIO).toBeLessThanOrEqual(ALTO - MARGEN);
      }
    }
  });

  it('los hoyos para plantar (nivel 3) quedan completos y lejos de la orilla', () => {
    for (const z of ZONAS)
      for (const p of z.plantar) {
        expect(p.x - HOYO.ancho / 2, `${z.animal} ${p.x},${p.y}`).toBeGreaterThanOrEqual(MARGEN);
        expect(p.x + HOYO.ancho / 2, `${z.animal} ${p.x},${p.y}`).toBeLessThanOrEqual(ANCHO - MARGEN);
        expect(p.y + HOYO.alto / 2, `${z.animal} ${p.x},${p.y}`).toBeLessThanOrEqual(ALTO - MARGEN);
      }
  });
});
