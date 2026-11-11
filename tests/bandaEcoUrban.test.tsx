import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MascotaVestida } from '../src/app/componentes/MascotaVestida';
import { MixtleFigura } from '../src/app/componentes/MixtleFigura';
import { ALTO_TEXTO_BANDA, BANDA, CUERPO_MINIMO_TEXTO_PX, TEXTO_BANDA, bandaEcoUrban, logotipoBanda } from '../src/arte/bandaEcoUrban';
import { ARTE_ESCENAS } from '../src/arte/escenas';
import { iconoSvg } from '../src/arte/marca';
import { capasDeMixtle, cuerpoDeMixtle, PERSONAJES, type ExpresionMixtle } from '../src/arte/personajes';
import { LUGAR_PIN } from '../src/arte/pinEcoUrban';
import { encima } from './figurasMixtle';

/*
 * La banda de guardián de Mixtle (v3.1.2): una banda cruzada del hombro a la cadera con "eco urban"
 * escrito y el pin prendido encima. El texto queda libre (sin brazo, cabeza ni pin encima) en 11 de las
 * 12 poses; en "celebrando" el brazo levantado la cruza y va sin texto. El texto solo se muestra cuando
 * Mixtle es grande (container query).
 */
const POSES: ExpresionMixtle[] = ['normal', 'habla', 'feliz', 'parpadeo', 'pensando', 'sorprendido', 'celebrando', 'senalando', 'saluda', 'animo', 'duerme', 'colgado'];
const RAIZ = join(__dirname, '..');

/** Puntos del rectángulo del logotipo sobre la banda (en la caja del cuerpo). */
function puntosTexto(): [number, number][] {
  const a = (TEXTO_BANDA.angulo * Math.PI) / 180;
  const u = [Math.cos(a), Math.sin(a)];
  const v = [-Math.sin(a), Math.cos(a)];
  const pts: [number, number][] = [];
  for (let i = -TEXTO_BANDA.largo / 2; i <= TEXTO_BANDA.largo / 2; i += 0.5)
    for (let j = -TEXTO_BANDA.alto / 2; j <= TEXTO_BANDA.alto / 2; j += 0.5) pts.push([TEXTO_BANDA.x + u[0]! * i + v[0]! * j, TEXTO_BANDA.y + u[1]! * i + v[1]! * j]);
  return pts;
}

/** Fracción del logotipo de la banda que se ve en esa pose (ni brazo, ni mano, ni cabeza, ni el pin encima). */
function textoVisible(pose: ExpresionMixtle): number {
  const figuras = encima(pose);
  const pts = puntosTexto();
  const libres = pts.filter(([x, y]) => !figuras.some((f) => f(x, y)) && Math.hypot(x - LUGAR_PIN.x, y - LUGAR_PIN.y) > LUGAR_PIN.r);
  return libres.length / pts.length;
}

describe('la banda de guardián', () => {
  it('en uso: la verde (v3.1.3)', () => {
    expect(BANDA).toBe('verde');
  });

  it.each(POSES.filter((p) => p !== 'celebrando'))('pose "%s": el texto de la banda se ve completo (ningún brazo, mano, cabeza ni el pin lo tapa)', (pose) => {
    expect(textoVisible(pose)).toBeGreaterThanOrEqual(0.99);
    expect(cuerpoDeMixtle(pose, '-t', 'chico', false, undefined, 'si')).toContain('class="banda-texto"');
  });

  it('en "celebrando" el brazo levantado cruza la banda: va sin texto', () => {
    expect(textoVisible('celebrando')).toBeLessThan(0.99);
    expect(cuerpoDeMixtle('celebrando', '-t', 'chico', false, undefined, 'si')).not.toContain('banda-texto');
    expect(cuerpoDeMixtle('celebrando', '-t', 'chico', false, undefined, 'si')).toContain('class="banda-eco-urban"');
  });

  it('la banda va entre el cuerpo y el pin, y debajo de los brazos', () => {
    for (const pose of POSES) {
      const { atras, adelante } = capasDeMixtle(pose, '', 'no');
      expect(atras, pose).toContain('class="banda-eco-urban"');
      expect(adelante, pose).not.toContain('banda-eco-urban');
      const svg = cuerpoDeMixtle(pose);
      expect(svg.indexOf('banda-eco-urban'), pose).toBeLessThan(svg.indexOf('pin-eco-urban'));
    }
  });

  it('el logotipo sigue la inclinación sin deformarse (misma escala a lo ancho y a lo alto)', () => {
    for (const espejo of [false, true]) {
      const m = logotipoBanda('blanca', espejo).match(/rotate\((-?[\d.]+)\) scale\((-?[\d.]+) ([\d.]+)\)/)!;
      expect(Number(m[1])).toBe(-42);
      expect(Math.abs(Number(m[2]))).toBe(Number(m[3]));
      expect(Number(m[2]) < 0).toBe(espejo); // en espejo se voltea de vuelta: se lee derecho
    }
    expect(ALTO_TEXTO_BANDA).toBe(10);
  });

  it('blanca: logotipo a todo color; verde: logotipo en blanco; ninguna: nada', () => {
    expect(logotipoBanda('blanca')).toContain('#009345');
    expect(logotipoBanda('blanca')).toContain('#1E4959');
    expect(logotipoBanda('verde')).not.toMatch(/#009345|#1E4959/);
    expect(logotipoBanda('verde').match(/fill="#FFFFFF"/g)).toHaveLength(3);
    expect(bandaEcoUrban('ninguna', 'si')).toBe('');
    expect(bandaEcoUrban('verde', 'no')).toContain('#009345');
  });

  it('cada Mixtle trae su propio recorte de la banda (ids con su sufijo)', () => {
    const a = cuerpoDeMixtle('normal', '-uno');
    const b = cuerpoDeMixtle('normal', '-dos');
    expect(a).toContain('<clipPath id="mx-banda-uno">');
    expect(a).toContain('clip-path="url(#mx-banda-uno)"');
    expect(b).toContain('<clipPath id="mx-banda-dos">');
    expect(a).not.toContain('mx-banda-dos');
  });

  it('la traen todos los dibujos de Mixtle (sin texto horneado: el texto lo pone React cuando se ve grande)', () => {
    const dibujos = [...PERSONAJES.filter((p) => p.clave.startsWith('mixtle') && p.clave !== 'mixtle-cola'), ...ARTE_ESCENAS.filter((a) => a.clave.startsWith('mixtle'))];
    expect(dibujos.length).toBeGreaterThanOrEqual(15);
    for (const d of dibujos) {
      expect(d.svg, d.clave).toContain('class="banda-eco-urban"');
      expect(d.svg, d.clave).not.toContain('banda-texto');
    }
  });

  it('el ícono de la app no cambia: va sin banda', () => {
    expect(iconoSvg()).not.toContain('banda-eco-urban');
  });
});

describe('el texto de la banda solo se ve cuando Mixtle es grande', () => {
  it('en línea (MixtleFigura) el texto va con la clase banda-texto, sin hornear', () => {
    const { container } = render(<MixtleFigura alto="20rem" expresion="normal" />);
    const g = container.querySelector('.banda-texto')!;
    expect(g).not.toBeNull();
    expect(g.hasAttribute('data-horneado')).toBe(false);
    expect(container.querySelector('.mixtle-figura')).not.toBeNull();
  });

  it('Mixtle en el vestidor y en las fichas: el texto va encima del dibujo; las otras mascotas no llevan banda', () => {
    const { container } = render(<MascotaVestida mascota="cacomixtle" puestos={['paliacate']} className="h-40" />);
    expect(container.querySelector('.mascota-con-banda [data-texto-banda] .banda-texto')).not.toBeNull();
    const otra = render(<MascotaVestida mascota="ardilla" className="h-40" />);
    expect(otra.container.querySelector('[data-texto-banda]')).toBeNull();
  });

  it('estilos.css lo muestra con 250 px de cuerpo o más (y 310 px de caja colgado en el inicio)', () => {
    const css = readFileSync(join(RAIZ, 'src/app/estilos.css'), 'utf8');
    expect(CUERPO_MINIMO_TEXTO_PX).toBe(250);
    expect(css).toMatch(/\.banda-texto:not\(\[data-horneado\]\) \{\s*display: none;/);
    expect(css).toContain(`@container cuerpo-mixtle (min-height: ${CUERPO_MINIMO_TEXTO_PX}px)`);
    expect(css).toContain('@container colgado-mixtle (min-height: 310px)');
    // A 250 px de cuerpo (440 unidades), el logotipo de 10 unidades mide 5.7 px.
    expect((CUERPO_MINIMO_TEXTO_PX * ALTO_TEXTO_BANDA) / 440).toBeCloseTo(5.68, 1);
  });
});
