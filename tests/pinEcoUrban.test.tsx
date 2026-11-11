import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MascotaVestida } from '../src/app/componentes/MascotaVestida';
import { MixtleFigura } from '../src/app/componentes/MixtleFigura';
import { ECO_URBAN } from '../src/arte/ecoUrban.generado';
import { ARTE_ESCENAS } from '../src/arte/escenas';
import { iconoSvg, logoSvg } from '../src/arte/marca';
import { capasDeMixtle, cuerpoDeMixtle, mixtleCompleto, PERSONAJES, type ExpresionMixtle } from '../src/arte/personajes';
import {
  ALTO_CUERPO_MIXTLE,
  ARTE_PIN,
  CAJA_ARTE_PIN,
  LUGAR_PIN,
  TAMANO_PIN,
  VARIANTES_PIN,
  estiloPinEncima,
  logotipoEcoUrban,
  pinEcoUrban,
  type LugarPin,
} from '../src/arte/pinEcoUrban';
import { ACCESORIOS } from '../src/logica/accesorios';
import { encima } from './figurasMixtle';

/*
 * El pin de Eco Urban (v3.1.1): Mixtle lo trae siempre, en el pecho, arriba y al centro, de 14 a 18 % de
 * su alto; se ve al menos el 70 % en cualquier pose (completo colgado de la rama); en React nunca mide
 * menos de 16 px y va encima de los accesorios del cuello. El logotipo es el original, en trazos.
 */

const POSES: ExpresionMixtle[] = ['normal', 'habla', 'feliz', 'parpadeo', 'pensando', 'sorprendido', 'celebrando', 'senalando', 'saluda', 'animo', 'duerme', 'colgado'];
const PIN = /<g class="pin-eco-urban" data-pin="(grande|chico)"/g;
const pines = (svg: string) => [...svg.matchAll(PIN)].map((m) => m[1]);

describe('el logotipo de Eco Urban', () => {
  it('es el del archivo original, en trazos: sin texto ni fuentes', () => {
    const svg = logotipoEcoUrban();
    expect(svg).not.toMatch(/<text|font-family|font-size/);
    expect(svg.match(/<path /g)).toHaveLength(3); // "eco", "urban" y el ®
    for (const parte of [ECO_URBAN.eco, ECO_URBAN.urban, ECO_URBAN.registrado]) expect(parte).toMatch(/^M[\d.\- ]+[cl]/); // trazo relativo y compacto
  });

  it('con los colores tomados de la imagen de Eco Urban (verde #009345 y azul petróleo #1E4959), sin efectos', () => {
    expect(ECO_URBAN.verde).toBe('#009345');
    expect(ECO_URBAN.azul).toBe('#1E4959');
    const svg = logotipoEcoUrban();
    expect(svg).toContain(`fill="${ECO_URBAN.verde}"`);
    expect(svg).toContain(`fill="${ECO_URBAN.azul}"`);
    expect(svg).not.toMatch(/filter|opacity|url\(#|stroke=/);
    expect(svg.match(/fill-rule="evenodd"/g)).toHaveLength(3);
  });

  it('"eco" antes que "urban", el ® arriba a la derecha y la misma línea base, como en el original', () => {
    const { eco, urban, registrado } = ECO_URBAN.cajas;
    expect(eco[2]).toBeLessThan(urban[0]);
    expect(registrado[0]).toBeGreaterThanOrEqual(urban[2] - 1);
    expect(registrado[3]).toBeLessThan(eco[1] + 5);
    expect(Math.abs(eco[3] - urban[3])).toBeLessThanOrEqual(1);
  });
});

describe('el pin: tamaño y lugar', () => {
  it('mide 14, 16 o 18 % del alto del cuerpo de Mixtle (sin la cola); en uso, "destacado" (16 %)', () => {
    expect(TAMANO_PIN).toBe('destacado');
    expect(LUGAR_PIN).toEqual(VARIANTES_PIN.destacado);
    const fraccion = (l: LugarPin) => (2 * l.r) / ALTO_CUERPO_MIXTLE;
    expect(fraccion(VARIANTES_PIN.visible)).toBeCloseTo(0.14, 3);
    expect(fraccion(VARIANTES_PIN.destacado)).toBeCloseTo(0.16, 3);
    expect(fraccion(VARIANTES_PIN.grande)).toBeCloseTo(0.18, 3);
  });

  it('va en el pecho, arriba y al centro: debajo de la barbilla (y = 240) y empezando arriba de los brazos (y = 300)', () => {
    for (const l of Object.values(VARIANTES_PIN)) {
      expect(Math.abs(l.x - 180)).toBeLessThanOrEqual(4); // el centro del cuerpo es x = 180
      expect(l.y - l.r).toBeGreaterThanOrEqual(243); // no se mete bajo la barbilla
      expect(l.y).toBeLessThan(300); // su centro, arriba de donde salen los brazos
    }
  });

  it('el borde gris muy claro lo separa de la panza clara', () => {
    expect(ARTE_PIN[1]!.svg).toContain('<circle r="104" fill="#E3E8EC"/>');
  });
});

/*
 * Qué tanto se ve el pin en cada pose: lo que se dibuja DESPUÉS del pin (la capa de adelante: brazos,
 * manos y cabeza) se toma de la propia capa y se prueba punto por punto sobre el círculo del pin.
 */
function visible(lugar: LugarPin, pose: ExpresionMixtle): number {
  const figuras = encima(pose);
  let total = 0, libres = 0;
  for (let dx = -lugar.r; dx <= lugar.r; dx += 0.5)
    for (let dy = -lugar.r; dy <= lugar.r; dy += 0.5) {
      if (dx * dx + dy * dy > lugar.r * lugar.r) continue;
      total++;
      if (!figuras.some((f) => f(lugar.x + dx, lugar.y + dy))) libres++;
    }
  return libres / total;
}

describe('el pin en cada pose', () => {
  it.each(POSES)('pose "%s": se ve al menos el 70 % del pin, en los tres tamaños', (pose) => {
    for (const [t, lugar] of Object.entries(VARIANTES_PIN)) expect(visible(lugar, pose), `${t} en ${pose}`).toBeGreaterThanOrEqual(0.7);
  });

  it('colgado de la rama (el inicio) se ve completo; sentado sin mover los brazos, también', () => {
    for (const lugar of Object.values(VARIANTES_PIN)) {
      expect(visible(lugar, 'colgado')).toBe(1);
      expect(visible(lugar, 'normal')).toBeGreaterThan(0.995);
    }
  });

  it('va entre el cuerpo y los brazos: los brazos que cruzan el pecho le pasan por delante', () => {
    for (const pose of POSES) {
      const svg = cuerpoDeMixtle(pose);
      const { atras, adelante } = capasDeMixtle(pose, '', 'no');
      const i = svg.indexOf('class="pin-eco-urban"');
      expect(i, pose).toBeGreaterThanOrEqual(atras.length);
      expect(svg.endsWith(adelante), pose).toBe(true);
    }
  });
});

describe('el pin en todas las apariciones de Mixtle', () => {
  it('lo traen todas las poses, Mixtle entero, colgado y el logo, una sola vez y en su acomodo apilado', () => {
    const apariciones: [string, string][] = [
      ...PERSONAJES.filter((p) => p.clave.startsWith('mixtle') && p.clave !== 'mixtle-cola').map((p) => [p.clave, p.svg] as [string, string]),
      ['mixtle-colgado', ARTE_ESCENAS.find((a) => a.clave === 'mixtle-colgado')!.svg],
      ['logo', logoSvg()],
      ...POSES.map((p) => [`en línea ${p}`, cuerpoDeMixtle(p, '-x')] as [string, string]),
    ];
    expect(apariciones.length).toBeGreaterThanOrEqual(28);
    for (const [nombre, svg] of apariciones) expect(pines(svg), nombre).toEqual(['chico']);
  });

  it('el dibujo sin pin solo existe para ponérselo encima (MascotaVestida)', () => {
    expect(pines(ARTE_ESCENAS.find((a) => a.clave === 'mixtle-entero-sin-pin')!.svg)).toEqual([]);
  });

  it('el ícono de la app y el de la pestaña quedan como estaban (v3.1)', () => {
    expect(pines(iconoSvg())).toEqual(['chico']); // el pin prendido abajo a la derecha
    expect(pines(iconoSvg({ aSangre: true }))).toEqual(['chico']);
    expect(pines(iconoSvg({ conPin: false }))).toEqual([]);
  });

  it('en espejo, el pin se voltea de vuelta: el logotipo se lee derecho', () => {
    expect(pinEcoUrban('chico', LUGAR_PIN, '', true)).toMatch(/scale\(-[\d.]+ [\d.]+\)/);
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
});

describe('en React: nunca menos de 16 px y encima de los accesorios', () => {
  it('el pin encima mide al menos 16 px de diámetro (19.2 px su caja con la sombra) y queda en su lugar del pecho', () => {
    const e = estiloPinEncima({ ancho: 360, alto: 440 });
    expect(e.width).toMatch(/^max\(19\.2px, [\d.]+%\)$/);
    expect(e.left).toBe(`${((LUGAR_PIN.x * 100) / 360).toFixed(3)}%`);
    expect(e.top).toBe(`${((LUGAR_PIN.y * 100) / 440).toFixed(3)}%`);
    expect(CAJA_ARTE_PIN.r).toBe(100);
  });

  it('MixtleFigura: el pin va entre el cuerpo y los brazos', () => {
    const { container } = render(<MixtleFigura alto="5rem" expresion="pensando" />);
    const cuerpo = container.querySelector('.mixtle-vivo')!;
    const hijos = [...cuerpo.children];
    expect(hijos).toHaveLength(3);
    expect(hijos[0]!.innerHTML).toContain('<svg');
    expect(hijos[1]!.getAttribute('data-pin-mixtle')).toBe('chico');
    expect(hijos[2]!.innerHTML).toContain('stroke-width="26"'); // los brazos
    expect(container.innerHTML.match(/class="pin-eco-urban"/g)).toBeNull(); // un solo pin: el de encima
  });

  it.each(ACCESORIOS.map((a) => a.id))('MascotaVestida (Mixtle con %s): el pin va encima del accesorio', (id) => {
    const { container } = render(<MascotaVestida mascota="cacomixtle" puestos={[id]} className="h-40" />);
    const caja = container.querySelector('[data-mascota-vestida]')!;
    const hijos = [...caja.children];
    expect(hijos.at(-1)!.getAttribute('data-pin-mixtle')).toBe('chico');
    expect(caja.querySelector(`[data-accesorio-puesto="${id}"]`)).not.toBeNull();
    expect(container.querySelectorAll('[data-pin-mixtle]')).toHaveLength(1);
  });

  it('en los íconos del tamaño de una ficha el pin va a su escala (sin el mínimo de 16 px)', () => {
    const { container } = render(<MascotaVestida mascota="cacomixtle" pinMinimoPx={0} className="h-10" />);
    expect(container.querySelector('[data-pin-mixtle]')!.getAttribute('data-pin-minimo')).toBe('0');
    expect(estiloPinEncima({ ancho: 472, alto: 440 }, LUGAR_PIN, 0).width).toMatch(/^max\(0\.0px, [\d.]+%\)$/);
  });
});
