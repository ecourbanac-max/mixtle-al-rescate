import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALTO_MARCA, MarcaEcoUrban } from '../src/app/componentes/MarcaEcoUrban';

/*
 * La marca de Eco Urban (v3.1.2): solo el logotipo, pequeña, en una esquina, que no se puede tocar ni es
 * un enlace, igual en todas las pantallas y nunca dentro de las lecciones.
 */
const RAIZ = join(__dirname, '..');
const fuente = (f: string) => readFileSync(join(RAIZ, f), 'utf8');

describe('la marca de Eco Urban', () => {
  it('es solo el logotipo: sin texto, sin enlace y sin toques', () => {
    const { container } = render(<MarcaEcoUrban esquina="abajo-derecha" />);
    const marca = container.querySelector('[data-marca-eco-urban]') as HTMLElement;
    expect(marca.textContent).toBe('');
    expect(container.querySelector('a')).toBeNull();
    expect(marca.className).toContain('pointer-events-none');
    expect(marca.getAttribute('aria-label')).toBe('Eco Urban');
    expect(marca.querySelectorAll('path')).toHaveLength(3); // "eco", "urban" y el ®
    expect(marca.className).toContain('bg-white/60'); // pastilla semitransparente
  });

  it('mide de 14 px (celular) a 22 px de alto', () => {
    expect(ALTO_MARCA).toBe('clamp(14px, 2.6vmin, 22px)');
  });

  it('va en la carga, el inicio, "¿Quién va a jugar?", el camino y el diploma; nunca en las lecciones', () => {
    expect(fuente('src/app/componentes/PantallaCarga.tsx')).toContain('<MarcaEcoUrban esquina="abajo-derecha" />');
    expect(fuente('src/app/pantallas/Inicio.tsx')).toContain('<MarcaEcoUrban esquina="arriba-izquierda"');
    expect(fuente('src/app/pantallas/Grupos.tsx')).toContain('<MarcaEcoUrban esquina="abajo-derecha" />');
    expect(fuente('src/app/pantallas/Camino.tsx')).toContain('<MarcaEcoUrban esquina="abajo-izquierda" />');
    expect(fuente('src/app/componentes/DiplomaUnidad.tsx')).toContain('<MarcaEcoUrban');
    expect(fuente('index.html')).toContain('<!--marca-carga-->');
    for (const f of ['src/app/pantallas/Leccion.tsx', 'src/app/ejercicios/Ejercicio.tsx']) expect(fuente(f)).not.toContain('MarcaEcoUrban');
  });

  it('ya no dice "Un proyecto de" ni "Con el apoyo de" en ninguna pantalla', () => {
    for (const f of ['src/contenido/textosApp.ts', 'index.html', 'vite.config.ts', 'src/app/pantallas/Inicio.tsx', 'src/app/pantallas/Grupos.tsx', 'src/app/componentes/DiplomaUnidad.tsx']) {
      expect(fuente(f), f).not.toMatch(/Un proyecto de|Con el apoyo de/);
    }
  });
});
