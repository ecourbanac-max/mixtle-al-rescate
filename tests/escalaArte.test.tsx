import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EligeImagen } from '../src/app/ejercicios/EligeImagen';
import { Ordena } from '../src/app/ejercicios/Ordena';
import { tarjetasEnEscala } from '../src/app/ejercicios/comun';
import { ALTO_CUADRO_EN_ESCALA, ALTO_ETAPA, ETAPAS_CRECIMIENTO, LIENZO_ETAPAS, claveEtapa } from '../src/arte/arboles';
import { catalogoArte } from '../src/arte/catalogo';
import { FAMILIAS_DE_ESCALA, enEscala, esDibujoEnEscala } from '../src/arte/escala';
import type { Ejercicio, EscuchaToca, Ordena as DatosOrdena } from '../src/contenido/tipos';
import { UNIDADES } from '../src/contenido/unidades';
import { todosLosEjercicios } from '../src/voz/frases';

/*
 * Corrección pedida por Eco Urban (v3.1). En "Toca el árbol grande" cada dibujo llenaba su tarjeta y
 * el arbolito (tres copas con frutas) se veía más alto que el árbol grande. Aquí se cuida que:
 *  - las tres etapas tengan proporciones claras y se dibujen en un lienzo común;
 *  - el motor use esa versión cuando aparecen juntas;
 *  - el árbol con frutas no vuelva a colarse como "arbolito".
 * La medida en pantalla (px reales) está en e2e/arboles.spec.ts.
 */
const ARTE = new Map(catalogoArte().map((a) => [a.clave, a]));
const EJERCICIOS = new Map(UNIDADES.flatMap((u) => u.lecciones.flatMap((l) => todosLosEjercicios(l.ejercicios))).map((e) => [e.id, e]));

/** Los dibujos que un ejercicio muestra juntos, como tarjetas. */
function tarjetasDe(e: Ejercicio): string[] {
  if (e.tipo === 'elige-imagen' || e.tipo === 'escucha-toca') return e.opciones.map((o) => o.arte);
  if (e.tipo === 'ordena') return e.pasos.map((p) => p.arte);
  if (e.tipo === 'parejas') return e.pares.flatMap((p) => [p.izquierda.arte, p.derecha.arte]);
  return [];
}

describe('las tres etapas del árbol', () => {
  it('brote < arbolito < árbol grande, con margen claro', () => {
    const { brote, arbolito, arbol } = ALTO_ETAPA;
    // Cada etapa mide como mucho el 60 % de la siguiente.
    expect(brote / arbolito).toBeLessThan(0.6);
    expect(arbolito / arbol).toBeLessThan(0.6);
    // El arbolito, "aproximadamente la mitad de alto que el árbol grande".
    expect(arbolito / arbol).toBeGreaterThan(0.45);
    // El brote es pequeño, pero no tanto que se pierda en una tarjeta de celular.
    expect(brote / arbol).toBeGreaterThan(0.2);
  });

  it('en escala, las tres comparten lienzo, escala y línea de suelo', () => {
    for (const clave of ETAPAS_CRECIMIENTO) {
      const pieza = ARTE.get(claveEtapa(clave))!;
      expect(pieza, claveEtapa(clave)).toBeDefined();
      expect(pieza.svg).toContain(`viewBox="0 0 ${LIENZO_ETAPAS.ancho} ${LIENZO_ETAPAS.alto}"`);
      // Mismo suelo y escala 1 en las tres.
      expect(pieza.svg).toContain(`<g transform="translate(${LIENZO_ETAPAS.ancho / 2} ${LIENZO_ETAPAS.suelo}) scale(1)">`);
    }
    // El árbol grande casi llena el lienzo (y cabe en él).
    expect(ALTO_ETAPA.arbol).toBeLessThanOrEqual(LIENZO_ETAPAS.suelo);
    expect(ALTO_ETAPA.arbol / LIENZO_ETAPAS.alto).toBeGreaterThan(0.9);
  });

  it('cada etapa tiene también su dibujo solo, que llena su cuadro', () => {
    for (const clave of ETAPAS_CRECIMIENTO) expect(ARTE.get(clave), clave).toBeDefined();
    // En una escena, mostradas a estos altos quedan en la misma escala: los altos crecen igual que las etapas.
    expect(ALTO_CUADRO_EN_ESCALA.brote).toBeLessThan(ALTO_CUADRO_EN_ESCALA.arbolito);
    expect(ALTO_CUADRO_EN_ESCALA.arbolito).toBeLessThan(ALTO_CUADRO_EN_ESCALA.arbol);
  });

  it('el arbolito no tiene frutas; el árbol con frutas es "arbol-frutal"', () => {
    const NARANJA_FRUTA = '#F28C28';
    for (const clave of ['arbolito', 'etapa-arbolito', 'arbol', 'etapa-arbol', 'brote', 'etapa-brote', 'arbolito-bolsa']) expect(ARTE.get(clave)!.svg, clave).not.toContain(NARANJA_FRUTA);
    expect(ARTE.get('arbol-frutal')!.svg).toContain(NARANJA_FRUTA);
  });
});

describe('dibujos que se comparan por tamaño', () => {
  it('juntos, cambian a su versión en escala; solos, no', () => {
    expect(enEscala(['brote', 'arbolito', 'arbol'])).toEqual(['etapa-brote', 'etapa-arbolito', 'etapa-arbol']);
    expect(enEscala(['arbol', 'coche', 'arbolito'])).toEqual(['etapa-arbol', 'coche', 'etapa-arbolito']);
    expect(enEscala(['arbol', 'coche', 'bote-revuelto'])).toEqual(['arbol', 'coche', 'bote-revuelto']);
    expect(enEscala(['brote'])).toEqual(['brote']);
    expect(enEscala([])).toEqual([]);
    // El mismo dibujo dos veces no es una comparación.
    expect(enEscala(['arbol', 'arbol'])).toEqual(['arbol', 'arbol']);
    expect(esDibujoEnEscala('etapa-arbol')).toBe(true);
    expect(esDibujoEnEscala('arbol')).toBe(false);
  });

  it('todas las versiones en escala existen en el catálogo', () => {
    for (const familia of FAMILIAS_DE_ESCALA) for (const { sola, enEscala: clave } of familia) {
      expect(ARTE.has(sola), sola).toBe(true);
      expect(ARTE.has(clave), clave).toBe(true);
    }
  });

  it('las tarjetas conservan su id y su nombre; solo cambia el dibujo', () => {
    const e = EJERCICIOS.get('u3-l1-e6') as EscuchaToca;
    const tarjetas = tarjetasEnEscala(e.opciones);
    expect(tarjetas.map((t) => t.id)).toEqual(e.opciones.map((o) => o.id));
    expect(tarjetas.map((t) => t.nombre)).toEqual(e.opciones.map((o) => o.nombre));
    expect(tarjetas.map((t) => t.arte)).toEqual(['etapa-brote', 'etapa-arbolito', 'etapa-arbol']);
  });

  it('en todo el contenido, dos dibujos de la misma familia nunca se muestran juntos sin escala', () => {
    const miembros = new Set(FAMILIAS_DE_ESCALA.flat().map((m) => m.sola));
    let comparaciones = 0;
    for (const e of EJERCICIOS.values()) {
      const artes = tarjetasDe(e);
      const enFamilia = [...new Set(artes.filter((a) => miembros.has(a)))];
      if (enFamilia.length < 2) continue;
      comparaciones += 1;
      const resueltas = enEscala(artes);
      artes.forEach((a, i) => {
        if (miembros.has(a)) expect(esDibujoEnEscala(resueltas[i]!), `${e.id}: ${a}`).toBe(true);
      });
    }
    // Los dos ejercicios que comparan las etapas: "Toca el árbol grande" y "Ordena cómo crece un árbol".
    expect(comparaciones).toBeGreaterThanOrEqual(2);
  });
});

describe('los ejercicios pintan las etapas en escala', () => {
  const artesPintados = (contenedor: HTMLElement) => [...contenedor.querySelectorAll('img[data-arte]')].map((i) => i.getAttribute('data-arte'));

  it('Toca el árbol grande (u3-l1-e6): la correcta es el árbol grande y las tres van en escala', () => {
    const e = EJERCICIOS.get('u3-l1-e6') as EscuchaToca;
    expect(e.consigna).toBe('Toca el árbol grande.');
    expect(e.opciones.find((o) => o.id === e.correcta)!.arte).toBe('arbol');
    const { container } = render(<EligeImagen ejercicio={e} responder={() => undefined} bloqueado={false} />);
    expect(artesPintados(container)).toEqual(['etapa-brote', 'etapa-arbolito', 'etapa-arbol']);
  });

  it('Ordena cómo crece un árbol (u3-l4-e6): los pasos van del más chico al más grande, en escala', () => {
    const e = EJERCICIOS.get('u3-l4-e6') as DatosOrdena;
    expect(e.pasos.map((p) => p.arte)).toEqual(['brote', 'arbolito', 'arbol']);
    const { container } = render(<Ordena ejercicio={e} responder={() => undefined} bloqueado={false} />);
    expect(artesPintados(container).sort()).toEqual(['etapa-arbol', 'etapa-arbolito', 'etapa-brote']);
  });

  it('un ejercicio sin dibujos de la misma familia no cambia (el árbol solo llena su tarjeta)', () => {
    const e = EJERCICIOS.get('u3-l4-e3') as EscuchaToca;
    const { container } = render(<EligeImagen ejercicio={e} responder={() => undefined} bloqueado={false} />);
    expect(artesPintados(container)).toEqual(['arbol', 'coche', 'bote-revuelto']);
  });
});

describe('otras consignas que dependen de cómo se ve el dibujo (revisión de las 5 unidades)', () => {
  it('"una botella llena de jugo" se ilustra con la botella llena', () => {
    const e = EJERCICIOS.get('u1-l4-e6')!;
    expect(e.consigna).toContain('botella llena de jugo');
    expect(e.tipo === 'si-no' && e.arte).toBe('botella-llena');
    // La llena trae jugo (naranja); la vacía, no.
    expect(ARTE.get('botella-llena')!.svg).toContain('#F59A23');
    expect(ARTE.get('residuo-botella')!.svg).not.toContain('#F59A23');
  });

  it('"la botella verde" solo puede ser la que se rellena: la desechable ya no trae etiqueta verde', () => {
    const e = EJERCICIOS.get('u5-l1-e1') as EscuchaToca;
    expect(e.pista).toContain('verde');
    expect(e.opciones.find((o) => o.id === e.correcta)!.arte).toBe('botella-reutilizable');
    expect(ARTE.get('residuo-botella')!.svg).not.toMatch(/#4FB286|#3FA56B|#57A673/i);
  });

  it('"Toca el cielo gris": el cielo sucio es gris y ninguna otra opción lo es', () => {
    const e = EJERCICIOS.get('u4-l3-e4') as EscuchaToca;
    expect(e.consigna).toBe('Toca el cielo gris.');
    expect(e.opciones.find((o) => o.id === e.correcta)!.arte).toBe('aire-sucio');
    expect(e.opciones.map((o) => o.arte)).not.toContain('humo');
    // Fondo gris (antes beige #C9C1A8).
    expect(ARTE.get('aire-sucio')!.svg).toContain('fill="#B3B8BD"');
    expect(ARTE.get('aire-sucio')!.svg).not.toContain('#C9C1A8');
  });

  it('en los ejercicios de ordenar, la pista no invita a empezar por un paso que no es el primero', () => {
    const e = EJERCICIOS.get('u1-l3-e7') as DatosOrdena;
    expect(e.pasos[0]!.nombre).toBe('la botella');
    expect(e.pista).toBe('Primero va la botella y al final, la playera.');
  });
});
