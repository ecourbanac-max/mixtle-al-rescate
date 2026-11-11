import { describe, expect, it } from 'vitest';
import { catalogoArte } from '../src/arte/catalogo';
import { ARTE_LASTIMADOS } from '../src/arte/lastimados';
import { aDataUri } from '../src/arte/svg';

describe('arte SVG', () => {
  const piezas = [...catalogoArte(), ...ARTE_LASTIMADOS];

  it('no repite claves de textura', () => {
    const claves = piezas.map((p) => p.clave);
    expect(new Set(claves).size).toBe(claves.length);
  });

  it.each(piezas.map((p) => [p.clave, p] as const))('%s es un SVG bien formado', (_clave, pieza) => {
    const doc = new DOMParser().parseFromString(pieza.svg, 'image/svg+xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    const raiz = doc.documentElement;
    expect(raiz.tagName.toLowerCase()).toBe('svg');
    expect(raiz.getAttribute('viewBox')).toMatch(/^0 0 \d+ \d+$/);
    expect(pieza.ancho).toBeGreaterThan(0);
    expect(pieza.alto).toBeGreaterThan(0);
    // Nada de recursos externos: todo el arte vive en el propio juego.
    expect(pieza.svg).not.toMatch(/(href|src)\s*=\s*["']https?:/i);
  });

  it('el data URI es base64 válido y conserva acentos', () => {
    const uri = aDataUri('<svg><!-- Nevado de Toluca, cacomixtle, niño --></svg>');
    expect(uri.startsWith('data:image/svg+xml;base64,')).toBe(true);
    const bytes = Uint8Array.from(atob(uri.split(',')[1] ?? ''), (c) => c.charCodeAt(0));
    expect(new TextDecoder().decode(bytes)).toContain('niño');
  });
});
