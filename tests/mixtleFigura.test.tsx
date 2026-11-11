import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MixtleFigura } from '../src/app/componentes/MixtleFigura';

describe('MixtleFigura (Mixtle en línea)', () => {
  it('dos Mixtle en la misma página definen degradados con id distintos y cada uno usa los suyos', () => {
    const { container } = render(
      <>
        <MixtleFigura alto="5rem" expresion="senalando" />
        <MixtleFigura alto="5rem" expresion="feliz" />
      </>,
    );
    const ids = [...container.querySelectorAll('radialGradient, linearGradient')].map((g) => g.id);
    // 3 degradados del cuerpo por cada Mixtle (el pin de Eco Urban va aparte, como imagen: ver MixtleFigura).
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
    const figuras = container.querySelectorAll('[data-expresion]');
    figuras.forEach((f) => {
      const propios = new Set([...f.querySelectorAll('radialGradient, linearGradient')].map((g) => g.id));
      const usados = [...(f.innerHTML.matchAll(/url\(#([^)]+)\)/g) ?? [])].map((m) => m[1]!);
      expect(usados.length).toBeGreaterThan(0);
      for (const u of usados) expect(propios).toContain(u);
    });
  });
});
