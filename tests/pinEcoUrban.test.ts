import { describe, expect, it } from 'vitest';
import { ARTE_ACCESORIOS } from '../src/arte/accesorios';
import { ECO_URBAN } from '../src/arte/ecoUrban.generado';
import { ARTE_ESCENAS } from '../src/arte/escenas';
import { iconoSvg, logoSvg } from '../src/arte/marca';
import { cuerpoDeMixtle, mixtleCompleto, PERSONAJES, type ExpresionMixtle } from '../src/arte/personajes';
import { ARTE_PIN, LUGAR_PIN, TAMANO_PIN, VARIANTES_PIN, logotipoEcoUrban, pinEcoUrban, type LugarPin } from '../src/arte/pinEcoUrban';
import { ACCESORIOS, ANCLAS_MASCOTA, vaDetras } from '../src/logica/accesorios';

/*
 * El pin de Eco Urban (v3.1): Mixtle lo trae siempre, en el pecho, del lado izquierdo de él; el logotipo
 * es el original en trazos, con sus colores y sin efectos; ningún brazo ni accesorio lo tapa.
 */

const POSES: ExpresionMixtle[] = ['normal', 'habla', 'feliz', 'parpadeo', 'pensando', 'sorprendido', 'celebrando', 'senalando', 'saluda', 'animo', 'duerme', 'colgado'];
const PIN = /<g class="pin-eco-urban" data-pin="(grande|chico)"/g;

describe('el logotipo de Eco Urban', () => {
  it('es el del archivo original, en trazos: sin texto ni fuentes', () => {
    const svg = logotipoEcoUrban();
    expect(svg).not.toMatch(/<text|font-family|font-size/);
    expect(svg.match(/<path /g)).toHaveLength(3); // "eco", "urban" y el ®
    for (const parte of [ECO_URBAN.eco, ECO_URBAN.urban, ECO_URBAN.registrado]) expect(parte).toMatch(/^M[\d.\- ]+[cl]/); // trazo relativo y compacto (scripts/marca/trazar-eco-urban.py)
  });

  it('con los colores tomados de la imagen de Eco Urban (verde #009345 y azul petróleo #1E4959), sin efectos', () => {
    expect(ECO_URBAN.verde).toBe('#009345');
    expect(ECO_URBAN.azul).toBe('#1E4959');
    const svg = logotipoEcoUrban();
    expect(svg).toContain(`fill="${ECO_URBAN.verde}"`);
    expect(svg).toContain(`fill="${ECO_URBAN.azul}"`);
    // Sin sombras, filtros, opacidad ni degradados sobre el logotipo.
    expect(svg).not.toMatch(/filter|opacity|url\(#|stroke=/);
    // Las letras con hueco (e, o, b, a, ®) se rellenan bien.
    expect(svg.match(/fill-rule="evenodd"/g)).toHaveLength(3);
  });

  it('"eco" va antes que "urban" y el ® arriba a la derecha, en la misma línea, como en el original', () => {
    const { eco, urban, registrado } = ECO_URBAN.cajas;
    expect(eco[2]).toBeLessThan(urban[0]);
    expect(registrado[0]).toBeGreaterThanOrEqual(urban[2] - 1);
    expect(registrado[3]).toBeLessThan(eco[1] + 5); // el ® queda a la altura de las mayúsculas
    // Misma línea base (las dos palabras terminan abajo a la misma altura, ±1 px).
    expect(Math.abs(eco[3] - urban[3])).toBeLessThanOrEqual(1);
  });
});

describe('el pin en Mixtle', () => {
  it('lo traen todas las poses y apariciones de Mixtle, una sola vez', () => {
    const apariciones: [string, string][] = [
      ...PERSONAJES.filter((p) => p.clave.startsWith('mixtle') && p.clave !== 'mixtle-cola').map((p) => [p.clave, p.svg] as [string, string]),
      ['mixtle-colgado', ARTE_ESCENAS.find((a) => a.clave === 'mixtle-colgado')!.svg],
      ['logo', logoSvg()],
      ...POSES.map((p) => [`en línea ${p}`, cuerpoDeMixtle(p, '-x')] as [string, string]),
    ];
    expect(apariciones.length).toBeGreaterThanOrEqual(28); // 14 dibujos del catálogo + colgado + logo + 12 poses en línea
    for (const [nombre, svg] of apariciones) expect([...svg.matchAll(PIN)], nombre).toHaveLength(1);
  });

  it('chico donde Mixtle se ve chico (lección, globo, aventuras) y grande donde se ve grande (vestidor, diploma, inicio, festejos)', () => {
    const version = (svg: string) => [...svg.matchAll(PIN)][0]![1];
    for (const p of PERSONAJES.filter((x) => /^mixtle(-[a-z]+)?$/.test(x.clave) && x.clave !== 'mixtle-cola' && !x.clave.startsWith('mixtle-entero'))) expect(version(p.svg), p.clave).toBe('chico');
    for (const clave of ['mixtle-entero', 'mixtle-entero-feliz', 'mixtle-entero-celebrando']) expect(version(PERSONAJES.find((p) => p.clave === clave)!.svg), clave).toBe('grande');
    expect(version(ARTE_ESCENAS.find((a) => a.clave === 'mixtle-colgado')!.svg)).toBe('grande');
    expect(version(logoSvg())).toBe('grande');
    expect(version(cuerpoDeMixtle('normal'))).toBe('chico');
    expect(version(cuerpoDeMixtle('celebrando', '', 'grande'))).toBe('grande');
  });

  it('el ícono de la app lo lleva a la vista; el favicon de la pestaña (16 a 32 px) no, porque ahí sería una mancha', () => {
    // El ícono recorta la cara de Mixtle: el pin de su pecho queda fuera del cuadro, y el pin se muestra
    // prendido abajo a la derecha (versión chica). El favicon solo trae el del pecho (fuera del cuadro).
    for (const svg of [iconoSvg(), iconoSvg({ aSangre: true })]) {
      const pines = [...svg.matchAll(PIN)];
      expect(pines).toHaveLength(2);
      expect(svg).toContain('id="pin-cara-icono"');
    }
    expect([...iconoSvg({ conPin: false }).matchAll(PIN)]).toHaveLength(1);
    expect(iconoSvg({ conPin: false })).not.toContain('pin-cara-icono');
  });

  it('va en el pecho, del lado izquierdo de Mixtle (a la derecha de quien lo ve), sobre el pelaje y debajo de los brazos', () => {
    expect(LUGAR_PIN).toEqual(VARIANTES_PIN[TAMANO_PIN]);
    for (const lugar of Object.values(VARIANTES_PIN)) {
      expect(lugar.x).toBeGreaterThan(180); // el centro del cuerpo es x = 180
      expect(lugar.y).toBeGreaterThan(242); // debajo del cuello
      expect(lugar.y + lugar.r).toBeLessThan(400); // arriba de las patas
    }
    for (const pose of POSES) {
      const svg = cuerpoDeMixtle(pose);
      const pin = svg.indexOf('class="pin-eco-urban"');
      // Después del cuerpo (el vientre crema) y antes de los brazos y la cabeza: los brazos pasan por delante.
      expect(pin, pose).toBeGreaterThan(svg.indexOf('<ellipse cx="180" cy="332"'));
      if (pose !== 'colgado') expect(pin, pose).toBeLessThan(svg.indexOf('stroke-width="26"', svg.indexOf('<ellipse cx="180" cy="332"')));
    }
  });

  /** Los brazos de una pose: segmentos de 26 de grueso que no son los que suben a la rama (colgado). */
  function brazos(svg: string): [number, number, number, number][] {
    return [...svg.matchAll(/<path d="M([\d.]+) ([\d.]+) L ([\d.]+) ([\d.]+)" stroke="#B09C8A" stroke-width="26"/g)].map((m) => [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])]);
  }
  /** Manos y patas (elipses del color oscuro del pelaje), aproximadas como círculos. */
  function manos(svg: string): [number, number, number][] {
    return [...svg.matchAll(/<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)" fill="#8A7563"\/>/g)].map((m) => [Number(m[1]), Number(m[2]), Math.max(Number(m[3]), Number(m[4]))]);
  }
  const distanciaASegmento = (px: number, py: number, [x1, y1, x2, y2]: [number, number, number, number]) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };
  const libre = (lugar: LugarPin, pose: ExpresionMixtle) => {
    const svg = cuerpoDeMixtle(pose);
    const brazo = Math.min(...brazos(svg).map((b) => distanciaASegmento(lugar.x, lugar.y, b) - 13 - lugar.r));
    const mano = Math.min(...manos(svg).filter(([, cy]) => cy < 380).map(([cx, cy, r]) => Math.hypot(lugar.x - cx, lugar.y - cy) - r - lugar.r));
    return Math.min(brazo, mano);
  };

  it.each(POSES)('en la pose "%s", ningún brazo ni mano toca el pin (tamaños discreto y medio)', (pose) => {
    expect(brazos(cuerpoDeMixtle(pose)).length + (pose === 'colgado' ? 2 : 0)).toBeGreaterThanOrEqual(2);
    for (const t of ['discreto', 'medio'] as const) expect(libre(VARIANTES_PIN[t], pose), `${t} en ${pose}`).toBeGreaterThanOrEqual(1);
  });

  it('el protagonista solo se mete un poco bajo el brazo en reposo, nunca bajo los brazos levantados', () => {
    for (const pose of ['celebrando', 'senalando', 'saluda', 'animo', 'pensando', 'colgado'] as const) expect(libre(VARIANTES_PIN.protagonista, pose), pose).toBeGreaterThanOrEqual(0);
    // En reposo, el brazo le tapa a lo más el canto: el logotipo (81 % del radio en la versión grande) queda libre.
    const p = VARIANTES_PIN.protagonista;
    expect(libre(p, 'normal')).toBeGreaterThan(-p.r * 0.15);
    for (const pose of ['normal', 'habla', 'feliz', 'duerme'] as const) expect(libre({ ...p, r: p.r * 0.81 }, pose), pose).toBeGreaterThanOrEqual(0);
  });

  it('ningún accesorio que va delante de Mixtle tapa el pin (la mochila va a la espalda)', () => {
    const anclas = ANCLAS_MASCOTA.cacomixtle;
    // En "mixtle-entero" (472×440) el cuerpo está en el mismo lugar que en el dibujo del cuerpo solo.
    const pin = { x0: LUGAR_PIN.x - LUGAR_PIN.r, x1: LUGAR_PIN.x + LUGAR_PIN.r, y0: LUGAR_PIN.y - LUGAR_PIN.r, y1: LUGAR_PIN.y + LUGAR_PIN.r };
    for (const a of ACCESORIOS) {
      const ancla = anclas[a.id];
      if (vaDetras(a, ancla)) continue;
      const dibujo = ARTE_ACCESORIOS.find((x) => x.clave === `accesorio-${a.id}`)!;
      const w = ancla.w * 472;
      const h = (w * dibujo.alto) / dibujo.ancho;
      const x0 = ancla.x * 472 - a.origen.x * w;
      const y0 = ancla.y * 440 - a.origen.y * h;
      const seEnciman = x0 < pin.x1 && x0 + w > pin.x0 && y0 < pin.y1 && y0 + h > pin.y0;
      expect(seEnciman, a.id).toBe(false);
    }
    expect(vaDetras(ACCESORIOS.find((a) => a.id === 'mochila')!, anclas.mochila)).toBe(true);
  });

  it('en espejo (Mixtle mirando al otro lado) el pin se voltea de vuelta: el logotipo se lee derecho', () => {
    expect(pinEcoUrban('chico', LUGAR_PIN, '', true)).toMatch(/scale\(-[\d.]+ [\d.]+\)/);
    expect(pinEcoUrban('chico', LUGAR_PIN, '', false)).toMatch(/scale\([\d.]+ [\d.]+\)/);
    expect(cuerpoDeMixtle('senalando', '-e', 'chico', true)).toMatch(/class="pin-eco-urban" data-pin="chico" transform="translate\([\d.]+ [\d.]+\) scale\(-/);
  });

  it('cada Mixtle en línea trae sus propios degradados del pin (ids con su sufijo, todos definidos)', () => {
    const a = cuerpoDeMixtle('normal', '-uno');
    const b = cuerpoDeMixtle('normal', '-dos');
    for (const id of ['pin-cara', 'pin-bisel', 'pin-brillo']) {
      expect(a).toContain(`id="${id}-uno"`);
      expect(b).toContain(`id="${id}-dos"`);
      expect(a).not.toContain(`id="${id}-dos"`);
    }
    for (const svg of [a, b, mixtleCompleto('feliz', '-tres')]) {
      const usa = new Set([...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]));
      const define = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
      for (const id of usa) expect(define, id).toContain(id);
    }
  });

  it('el pin solo (galería) existe en sus dos versiones', () => {
    expect(ARTE_PIN.map((a) => a.clave)).toEqual(['pin-eco-urban', 'pin-eco-urban-chico', 'logotipo-eco-urban']);
    expect([...ARTE_PIN[0]!.svg.matchAll(PIN)][0]![1]).toBe('grande');
    expect([...ARTE_PIN[1]!.svg.matchAll(PIN)][0]![1]).toBe('chico');
  });
});
