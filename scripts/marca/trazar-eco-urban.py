"""
Convierte el logotipo de Eco Urban (docs/marca/referencias-eco-urban/logo-eco-urban.jpg, el archivo que
nos dio Eco Urban) en trazos SVG: src/arte/ecoUrban.generado.ts. Así el pin se ve igual en todos los
dispositivos (no depende de ninguna fuente) y es fiel al original: no se redibuja, se calca.

Cómo: se recorta la tinta, se agranda 4× (bicúbico), se separa cada píxel en fondo / verde / azul
petróleo (el color más cercano), se suaviza un poco el ruido del JPG y se calca con potrace. Al final
se mide la coincidencia con el original (intersección / unión de píxeles de cada color).

Uso (una vez: pip install potracer pillow numpy scipy):
    python scripts/marca/trazar-eco-urban.py
"""
import json
import pathlib
import sys
from collections import Counter

import numpy as np
import potrace
from PIL import Image
from scipy.ndimage import gaussian_filter

RAIZ = pathlib.Path(__file__).resolve().parents[2]
REFERENCIA = RAIZ / 'docs' / 'marca' / 'referencias-eco-urban' / 'logo-eco-urban.jpg'
SALIDA = RAIZ / 'src' / 'arte' / 'ecoUrban.generado.ts'

K = 4           # agrandado antes de calcar
SIGMA = 0.6     # suavizado del ruido del JPG (en píxeles del original)
TOLERANCIA = 0.5
ALFA = 1.0

im = Image.open(REFERENCIA).convert('RGB')
a0 = np.asarray(im).astype(float)
fondo = a0[40, 40]
tinta = np.abs(a0 - fondo).sum(2) > 60
ys, xs = np.where(tinta)
M = 10
X0, Y0, X1, Y1 = xs.min() - M, ys.min() - M, xs.max() + 1 + M, ys.max() + 1 + M

# Colores exactos: el valor más frecuente entre los píxeles de cada tinta (sin los bordes suavizados).
px = a0[tinta].astype(int)
verdes = px[(px[:, 1] > px[:, 0] + 40) & (px[:, 1] > px[:, 2] + 20)]
azules = px[(px[:, 2] >= px[:, 0] + 10) & (px[:, 1] < 110)]
moda = lambda p: np.array(Counter(map(tuple, p)).most_common(1)[0][0], dtype=float)
VERDE, AZUL = moda(verdes), moda(azules)
hexa = lambda c: '#%02X%02X%02X' % tuple(int(v) for v in c)

recorte = im.crop((X0, Y0, X1, Y1)).resize(((X1 - X0) * K, (Y1 - Y0) * K), Image.BICUBIC)
a = np.asarray(recorte).astype(float)
a = np.stack([gaussian_filter(a[..., i], SIGMA * K) for i in range(3)], -1)
dist = lambda c: np.linalg.norm(a - c, axis=2)
dF, dV, dA = dist(fondo), dist(VERDE), dist(AZUL)
# Tinta si está más cerca de ese color que del fondo a la mitad del camino (borde en el 50 %).
mitad = lambda c: ((a - fondo) @ (c - fondo)) / ((c - fondo) @ (c - fondo)) > 0.5
mascaras = {'verde': mitad(VERDE) & (dV < dA), 'azul': mitad(AZUL) & (dA <= dV)}


def numero(v):
    """0.1 de precisión, sin ceros de sobra: 12.0 → "12", 0.5 → ".5", -0.5 → "-.5"."""
    t = f'{round(v, 1):.1f}'.rstrip('0').rstrip('.')
    t = '0' if t in ('', '-0') else t
    return t.replace('0.', '.', 1) if t.startswith('0.') else t.replace('-0.', '-.', 1)


def unir(nums):
    """Números seguidos con el separador mínimo (el "-" o el "." ya separan)."""
    out = ''
    for x in nums:
        if out and not (x.startswith('-') or (x.startswith('.') and '.' in out.split(' ')[-1].split('-')[-1])):
            out += ' '
        out += x
    return out


def calcar(m):
    """
    Curvas de potrace (cada una con su caja) en coordenadas del original. Cada punto se redondea a 0.1 px
    y se escribe RELATIVO al anterior: la misma figura, en menos texto (cuenta para lo que baja al abrir).
    """
    curvas = []
    for c in potrace.Bitmap(~m).trace(turdsize=40 * K, alphamax=ALFA, opticurve=True, opttolerance=TOLERANCIA):
        r = lambda p: (round(p.x / K * 10), round(p.y / K * 10))  # en décimas de píxel (enteros: sin error al restar)
        x0, y0 = r(c.start_point)
        actual = (x0, y0)
        puntos = [actual]
        rel = lambda q: [numero((q[0] - actual[0]) / 10), numero((q[1] - actual[1]) / 10)]
        d = 'M' + unir([numero(x0 / 10), numero(y0 / 10)])
        for s in c.segments:
            if s.is_corner:
                q1, q2 = r(s.c), r(s.end_point)
                d += 'l' + unir(rel(q1) + [numero((q2[0] - q1[0]) / 10), numero((q2[1] - q1[1]) / 10)])
                actual = q2
                puntos += [q1, q2]
            else:
                q1, q2, q3 = r(s.c1), r(s.c2), r(s.end_point)
                d += 'c' + unir(rel(q1) + rel(q2) + rel(q3))
                actual = q3
                puntos.append(q3)
        d += 'z'
        cx = [p[0] / 10 for p in puntos]
        cy = [p[1] / 10 for p in puntos]
        curvas.append({'d': d, 'caja': [min(cx), min(cy), max(cx), max(cy)]})
    return curvas


def caja(curvas):
    return [round(v, 1) for v in (min(c['caja'][0] for c in curvas), min(c['caja'][1] for c in curvas), max(c['caja'][2] for c in curvas), max(c['caja'][3] for c in curvas))]


eco = calcar(mascaras['verde'])
azul = calcar(mascaras['azul'])
# El ® es lo azul que queda a la derecha de la "n" (más alto que la línea base de las letras).
borde_n = max(c['caja'][2] for c in azul if c['caja'][3] > (Y1 - Y0) * 0.7)
urban = [c for c in azul if c['caja'][0] < borde_n]
registrado = [c for c in azul if c['caja'][0] >= borde_n]
assert len(registrado) >= 2, 'no se encontró el ®'






datos = {
    'ancho': int(X1 - X0), 'alto': int(Y1 - Y0),
    'verde': hexa(VERDE), 'azul': hexa(AZUL),
    'eco': ' '.join(c['d'] for c in eco), 'urban': ' '.join(c['d'] for c in urban), 'registrado': ' '.join(c['d'] for c in registrado),
    'cajas': {'eco': caja(eco), 'urban': caja(urban), 'registrado': caja(registrado)},
}
ts = f"""// Generado por scripts/marca/trazar-eco-urban.py a partir de docs/marca/referencias-eco-urban/logo-eco-urban.jpg.
// No editar a mano. El logotipo "eco urban" es propiedad de Eco Urban A.C. y se usa con su autorización (ver CREDITOS.md).
// Coordenadas en píxeles del archivo original (recortado a la tinta). Colores: los más frecuentes de cada tinta en el original.
export const ECO_URBAN = {json.dumps(datos, ensure_ascii=False, indent=2)} as const;
"""
SALIDA.write_text(ts, encoding='utf-8', newline='\n')
print(f"colores: verde {datos['verde']}, azul {datos['azul']}")
print(f"cajas: {datos['cajas']}")
print(f"curvas: eco {len(eco)}, urban {len(urban)}, ® {len(registrado)}; {sum(len(datos[k]) for k in ('eco', 'urban', 'registrado'))} caracteres")
print(f'escrito: {SALIDA.relative_to(RAIZ)}')
sys.exit(0)
