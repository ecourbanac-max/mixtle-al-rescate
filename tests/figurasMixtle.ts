import { capasDeMixtle, type ExpresionMixtle } from '../src/arte/personajes';

/*
 * Lo que se dibuja ENCIMA del pecho de Mixtle en cada pose (la capa de adelante: brazos, manos y cabeza),
 * como figuras que se pueden probar punto por punto. Lo usan las pruebas del pin y de la banda de guardián.
 */
export type Figura = (x: number, y: number) => boolean;

function bezier(p: number[][], n = 40): number[][] {
  const out: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t ** 2, d = t ** 3;
    out.push([a * p[0]![0]! + b * p[1]![0]! + c * p[2]![0]! + d * p[3]![0]!, a * p[0]![1]! + b * p[1]![1]! + c * p[2]![1]! + d * p[3]![1]!]);
  }
  return out;
}
/** La cabeza (el mismo trazo que personajes.ts), girada si la pose la ladea. */
function cabeza(giro: number): Figura {
  const p = [
    ...bezier([[180, 70], [252, 70], [282, 120], [274, 166]]),
    ...bezier([[274, 166], [266, 206], [226, 236], [180, 240]]),
    ...bezier([[180, 240], [134, 236], [94, 206], [86, 166]]),
    ...bezier([[86, 166], [78, 120], [108, 70], [180, 70]]),
  ].map(([x, y]) => {
    const a = (giro * Math.PI) / 180;
    const dx = x! - 180, dy = y! - 236;
    return [180 + dx * Math.cos(a) - dy * Math.sin(a), 236 + dx * Math.sin(a) + dy * Math.cos(a)];
  });
  return (x, y) => {
    let dentro = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [xi, yi] = p[i]!, [xj, yj] = p[j]!;
      if (yi! > y !== yj! > y && x < ((xj! - xi!) * (y - yi!)) / (yj! - yi!) + xi!) dentro = !dentro;
    }
    return dentro;
  };
}
export function encima(pose: ExpresionMixtle): Figura[] {
  const { adelante } = capasDeMixtle(pose, '', 'no');
  const figuras: Figura[] = [];
  for (const m of adelante.matchAll(/<path d="M([\d.]+) ([\d.]+) L ([\d.]+) ([\d.]+)" stroke="#B09C8A" stroke-width="26"/g)) {
    const [x1, y1, x2, y2] = [m[1], m[2], m[3], m[4]].map(Number) as [number, number, number, number];
    figuras.push((x, y) => {
      const dx = x2 - x1, dy = y2 - y1;
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1)));
      return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)) <= 13;
    });
  }
  for (const m of adelante.matchAll(/<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"( fill="#8A7563")?\/>/g)) {
    const [cx, cy, rx, ry] = [m[1], m[2], m[3], m[4]].map(Number) as [number, number, number, number];
    figuras.push((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1);
  }
  figuras.push(cabeza(/rotate\(9 180 236\)/.test(adelante) ? 9 : 0));
  return figuras;
}
