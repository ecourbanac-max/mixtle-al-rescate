import 'fake-indexeddb/auto';
import { createStore, get, set } from 'idb-keyval';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { completarLeccion } from '../src/logica/camino';
import { COLORES_GRUPO, juntarGrupos, LARGO_ETIQUETA, nombreDelGrupo, nuevoGrupo, type Grupo } from '../src/logica/grupos';
import { useMudanza } from '../src/servicios/estadoMudanza';
import { PREFIJO } from '../src/servicios/migracion';
import { firmaDeGrupos, fragmentoDeMudanza, leerMudanza } from '../src/servicios/mudanza';
import {
  atenderFragmento,
  CLAVE_MUDADOS,
  CLAVE_PENDIENTE,
  esSaludValida,
  mudarAhora,
  sirveEsteJuego,
  usarNavegacion,
  vigilarMudanza,
} from '../src/servicios/mudanzaDefinitiva';
import { crearRespaldo, leerRespaldo } from '../src/servicios/respaldo';
import { APP_ID, DIRECCION_DEFINITIVA, DIRECCION_PUENTE, destinosDeMudanza, esOrigenViejo, PROTOCOLO_MUDANZA } from '../src/sitio';

/*
 * Mudanza a la dirección definitiva (v3.2): la configuración, el paquete con firma, el acuerdo de ida y
 * vuelta (la vieja solo quita sus grupos cuando la nueva confirmó), los nombres repetidos y el respaldo
 * en archivo. La prueba con dos direcciones de verdad en el navegador: e2e/mudanza.spec.ts.
 */
const tienda = () => createStore(PREFIJO, 'datos');
const grupo = (id: string, etiqueta = '1°A', mascota: Grupo['mascota'] = 'ardilla'): Grupo =>
  nuevoGrupo({ mascota, color: COLORES_GRUPO[0], etiqueta }, id, 0);
const conAvance = (g: Grupo, hojitas = 15): Grupo => ({
  ...g,
  progreso: { ...completarLeccion(g.progreso, 'u1-l1', { hojitas, aLaPrimera: 3 }, '2026-11-10'), accesorios: ['gorra'], puestos: ['gorra'], gastadas: 30, estampas: ['cacomixtle'], recorridoVisto: true },
});

describe('dónde vive el juego (src/sitio.ts)', () => {
  it('la dirección definitiva es mixtle.org', () => {
    expect(DIRECCION_DEFINITIVA).toBe('https://mixtle.org');
  });

  it('las direcciones viejas se mudan a la definitiva; caco, si aún no responde, a la de puente', () => {
    expect(destinosDeMudanza('mixtle-al-rescate.vercel.app')).toEqual([DIRECCION_DEFINITIVA]);
    expect(destinosDeMudanza('mixtle-al-rescate-abc123xyz-equipo.vercel.app')).toEqual([DIRECCION_DEFINITIVA]);
    expect(destinosDeMudanza('mixtle-al-rescate-git-main-equipo.vercel.app')).toEqual([DIRECCION_DEFINITIVA]);
    expect(destinosDeMudanza('caco-al-rescate.vercel.app')).toEqual([DIRECCION_DEFINITIVA, DIRECCION_PUENTE]);
  });

  it('en la definitiva, en localhost y en el proyecto de Eco Urban ("mixtle") nunca intenta mudarse', () => {
    for (const host of ['mixtle.org', 'www.mixtle.org', 'localhost', '127.0.0.1', 'mixtle.vercel.app', 'mixtle-abc123-ecourban.vercel.app', 'otro-mixtle-al-rescate.vercel.app']) {
      expect(destinosDeMudanza(host), host).toEqual([]);
    }
  });

  it('la confirmación solo regresa a una dirección vieja (nunca a cualquier sitio)', () => {
    expect(esOrigenViejo('https://mixtle-al-rescate.vercel.app')).toBe(true);
    expect(esOrigenViejo('https://caco-al-rescate.vercel.app')).toBe(true);
    expect(esOrigenViejo('https://mixtle.org')).toBe(false);
    expect(esOrigenViejo('https://malo.example.com')).toBe(false);
    expect(esOrigenViejo('https://mixtle-al-rescate.vercel.app/ruta')).toBe(false);
    expect(esOrigenViejo('no es una url')).toBe(false);
  });

  it('/salud.json: solo vale si es ESTE juego con un protocolo que entendemos', () => {
    expect(esSaludValida({ app: APP_ID, version: '3.2.0', mudanza: PROTOCOLO_MUDANZA })).toBe(true);
    expect(esSaludValida({ app: 'otro-juego', mudanza: PROTOCOLO_MUDANZA })).toBe(false);
    expect(esSaludValida({ app: APP_ID, mudanza: 1 })).toBe(false);
    expect(esSaludValida('<html>parking</html>')).toBe(false);
    expect(esSaludValida(null)).toBe(false);
  });

  it('si la definitiva no responde, responde otra cosa o tarda, "no sirve" (y nunca lanza)', async () => {
    const respuesta = (cuerpo: unknown, ok = true) => vi.fn(async () => ({ ok, json: async () => cuerpo }) as unknown as Response);
    expect(await sirveEsteJuego('https://x', respuesta({ app: APP_ID, mudanza: 2 }))).toBe(true);
    expect(await sirveEsteJuego('https://x', respuesta({ app: APP_ID, mudanza: 2 }, false))).toBe(false);
    expect(await sirveEsteJuego('https://x', respuesta({ otra: 'cosa' }))).toBe(false);
    expect(await sirveEsteJuego('https://x', vi.fn(async () => Promise.reject(new TypeError('sin red'))))).toBe(false);
    const lenta = vi.fn((_u: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_ok, mal) => init?.signal?.addEventListener('abort', () => mal(new Error('abort')))));
    expect(await sirveEsteJuego('https://x', lenta as unknown as typeof fetch, 50)).toBe(false);
    const pedida = respuesta({ app: APP_ID, mudanza: 2 });
    await sirveEsteJuego('https://mixtle.org', pedida);
    expect(pedida).toHaveBeenCalledWith('https://mixtle.org/salud.json', expect.objectContaining({ cache: 'no-store', mode: 'cors' }));
  });
});

describe('la revisión en segundo plano: una vez por sesión, sin reintentar en bucle', () => {
  const VIEJA = 'mixtle-al-rescate.vercel.app';
  const caida = () => vi.fn(async () => Promise.reject(new TypeError('net::ERR_NAME_NOT_RESOLVED')));
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    sessionStorage.clear();
    useMudanza.setState({ estado: { fase: 'dormida' }, mudadosA: null, pospuesta: false });
  });
  afterEach(() => vi.useRealTimers());

  it('si la definitiva no responde, pregunta una sola vez y no vuelve a preguntar al recargar', async () => {
    const pedir = caida();
    vigilarMudanza(VIEJA, pedir as unknown as typeof fetch);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(pedir).toHaveBeenCalledTimes(1);
    expect(pedir).toHaveBeenCalledWith('https://mixtle.org/salud.json', expect.anything());
    // Recarga (o versión nueva) en la misma pestaña: ya no pregunta.
    const otraVez = caida();
    vigilarMudanza(VIEJA, otraVez as unknown as typeof fetch);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(otraVez).not.toHaveBeenCalled();
    expect(useMudanza.getState().estado.fase).toBe('dormida');
  });

  it('al volver la conexión sí pregunta otra vez (y si ya sirve, ofrece la mudanza)', async () => {
    const pedir = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('sin red'))
      .mockResolvedValue({ ok: true, json: async () => ({ app: APP_ID, mudanza: PROTOCOLO_MUDANZA }) });
    vigilarMudanza(VIEJA, pedir as unknown as typeof fetch);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(pedir).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(100);
    await vi.waitFor(() => expect(useMudanza.getState().estado.fase).toBe('disponible'));
    expect(pedir).toHaveBeenCalledTimes(2);
  });

  it('si la definitiva responde, no se anota ningún fallo (una mudanza a medias se puede volver a ofrecer)', async () => {
    const pedir = vi.fn(async () => ({ ok: true, json: async () => ({ app: APP_ID, mudanza: PROTOCOLO_MUDANZA }) }));
    vigilarMudanza(VIEJA, pedir as unknown as typeof fetch);
    await vi.advanceTimersByTimeAsync(10_000);
    await vi.waitFor(() => expect(useMudanza.getState().estado.fase).toBe('disponible'));
    expect(sessionStorage.getItem('mixtle-al-rescate:definitiva-sin-respuesta')).toBeNull();
  });

  it('en la dirección definitiva no pregunta nunca', async () => {
    const pedir = caida();
    vigilarMudanza('mixtle.org', pedir as unknown as typeof fetch);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(pedir).not.toHaveBeenCalled();
  });
});

describe('juntar grupos sin sobrescribir ninguno', () => {
  it('el mismo grupo (mismo id) que llega otra vez: se queda el de más avance', () => {
    const r = juntarGrupos([grupo('a')], [conAvance(grupo('a'))]);
    expect(r.grupos).toHaveLength(1);
    expect(r.grupos[0]!.progreso.hojitas).toBe(15);
    expect(r.yaEstaban).toEqual(['a']);
    expect(juntarGrupos([conAvance(grupo('a'))], [grupo('a')]).grupos[0]!.progreso.hojitas).toBe(15);
  });

  it('otro grupo con el mismo nombre: se conservan los dos y el que llega lleva "(2)", "(3)"…', () => {
    const r = juntarGrupos([grupo('a', '1°A')], [conAvance(grupo('b', '1°A')), grupo('c', '1°A')]);
    expect(r.grupos.map(nombreDelGrupo)).toEqual(['Ardilla 1°A', 'Ardilla 1°A (2)', 'Ardilla 1°A (3)']);
    expect(r.grupos[1]!.progreso.hojitas).toBe(15);
    expect(r.renombrados).toEqual([
      { antes: 'Ardilla 1°A', despues: 'Ardilla 1°A (2)' },
      { antes: 'Ardilla 1°A', despues: 'Ardilla 1°A (3)' },
    ]);
  });

  it('sin etiqueta, o con una etiqueta larga, el número cabe en el largo de una etiqueta', () => {
    expect(nombreDelGrupo(juntarGrupos([grupo('a', '')], [grupo('b', '')]).grupos[1]!)).toBe('Ardilla (2)');
    const largo = juntarGrupos([grupo('a', 'Tarde 3B')], [grupo('b', 'Tarde 3B')]).grupos[1]!;
    expect(largo.etiqueta.length).toBeLessThanOrEqual(LARGO_ETIQUETA);
    expect(largo.etiqueta.endsWith('(2)')).toBe(true);
  });

  it('distinto animal con la misma etiqueta no choca', () => {
    expect(juntarGrupos([grupo('a', '1°A', 'ardilla')], [grupo('b', '1°A', 'colibri')]).renombrados).toEqual([]);
  });
});

describe('el paquete de la mudanza (v2)', () => {
  it('lleva id, origen y firma; si un grupo se daña en el camino, se marca dañado', () => {
    const grupos = [conAvance(grupo('a'))];
    const f = fragmentoDeMudanza({ v: 2, id: 'm1', origen: 'https://mixtle-al-rescate.vercel.app', firma: firmaDeGrupos(grupos), grupos, preferencias: { musica: 'no' } });
    const m = leerMudanza(f)!;
    expect(m).toMatchObject({ v: 2, id: 'm1', danada: false, preferencias: { musica: 'no' } });
    expect(m.grupos).toEqual(grupos);
    const mal = leerMudanza(fragmentoDeMudanza({ v: 2, id: 'm1', origen: 'x', firma: 'otra', grupos, preferencias: {} }))!;
    expect(mal.danada).toBe(true);
  });
});

describe('el acuerdo de ida y vuelta', () => {
  let idas: string[] = [];
  beforeEach(async () => {
    idas = [];
    usarNavegacion((u) => idas.push(u));
    useMudanza.setState({ estado: { fase: 'dormida' }, mudadosA: null, pospuesta: false });
    await set('grupos', undefined, tienda());
    await set(CLAVE_PENDIENTE, undefined, tienda());
    await set(CLAVE_MUDADOS, undefined, tienda());
  });
  afterEach(() => history.replaceState(null, '', '/'));

  /** La dirección vieja empaca; devuelve el fragmento con el que abriría la nueva. */
  async function salida(): Promise<string> {
    await mudarAhora('https://mixtle.org');
    expect(idas).toHaveLength(1);
    expect(idas[0]!.startsWith('https://mixtle.org/#mudanza=')).toBe(true);
    return idas[0]!.slice('https://mixtle.org/'.length);
  }

  it('sin grupos, la vieja abre la nueva directo (sin paquete)', async () => {
    await mudarAhora('https://mixtle.org');
    expect(idas).toEqual(['https://mixtle.org/']);
  });

  it('con grupos: deja una mudanza pendiente y NO borra nada al salir', async () => {
    const grupos = [conAvance(grupo('a')), grupo('b', '2°B')];
    await set('grupos', grupos, tienda());
    const f = await salida();
    expect(await get('grupos', tienda())).toEqual(grupos);
    const pendiente = (await get(CLAVE_PENDIENTE, tienda())) as { id: string; firma: string };
    const m = leerMudanza(f)!;
    expect(m.id).toBe(pendiente.id);
    expect(m.firma).toBe(pendiente.firma);
    expect(m.grupos).toEqual(grupos); // completos: hojitas, accesorios, estampas, recorrido visto…
  });

  it('la nueva guarda, comprueba y regresa a confirmar a la vieja', async () => {
    const grupos = [conAvance(grupo('a'))];
    await set('grupos', grupos, tienda());
    // El paquete que armaría mixtle-al-rescate.vercel.app (aquí la página corre en localhost, que no es vieja).
    const m = leerMudanza(await salida())!;
    const f = fragmentoDeMudanza({ ...m, origen: 'https://mixtle-al-rescate.vercel.app' });
    // Ahora "somos" la nueva: aquí hay otro grupo.
    await set('grupos', [grupo('z', '3°C')], tienda());
    idas = [];
    const seVa = await atenderFragmento(f);
    expect(seVa).toBe(true);
    expect((await get('grupos', tienda())) as Grupo[]).toHaveLength(2);
    expect(idas).toEqual([`https://mixtle-al-rescate.vercel.app/#paso=recibida&id=${m.id}&firma=${m.firma}`]);
  });

  it('con "recibida", la vieja quita los grupos que se mudaron (quedan en un respaldo) y abre la nueva', async () => {
    const grupos = [conAvance(grupo('a')), grupo('b', '2°B')];
    await set('grupos', grupos, tienda());
    const m = leerMudanza(await salida())!;
    idas = [];
    expect(await atenderFragmento(`#paso=recibida&id=${m.id}&firma=${m.firma}`)).toBe(true);
    expect(await get('grupos', tienda())).toEqual([]);
    expect(((await get(CLAVE_MUDADOS, tienda())) as { grupos: Grupo[] }).grupos).toEqual(grupos);
    expect(await get(CLAVE_PENDIENTE, tienda())).toBeUndefined();
    expect(idas).toEqual(['https://mixtle.org/#paso=lista&grupos=2']);
  });

  it('un grupo que siguió jugando aquí después de salir NO se quita: se muda la próxima vez', async () => {
    await set('grupos', [grupo('a'), grupo('b', '2°B')], tienda());
    const m = leerMudanza(await salida())!;
    await set('grupos', [grupo('a'), conAvance(grupo('b', '2°B'))], tienda()); // otra pestaña siguió jugando
    await atenderFragmento(`#paso=recibida&id=${m.id}&firma=${m.firma}`);
    expect(((await get('grupos', tienda())) as Grupo[]).map((g) => g.id)).toEqual(['b']);
  });

  it('una confirmación que no corresponde (otro id u otra firma) no borra nada', async () => {
    const grupos = [grupo('a')];
    await set('grupos', grupos, tienda());
    const m = leerMudanza(await salida())!;
    idas = [];
    expect(await atenderFragmento(`#paso=recibida&id=otra&firma=${m.firma}`)).toBe(false);
    expect(await atenderFragmento(`#paso=recibida&id=${m.id}&firma=ffff`)).toBe(false);
    expect(await get('grupos', tienda())).toEqual(grupos);
    expect(idas).toEqual([]);
  });

  it('con "fallida", la vieja no borra nada y ofrece reintentar', async () => {
    const grupos = [grupo('a')];
    await set('grupos', grupos, tienda());
    const m = leerMudanza(await salida())!;
    expect(await atenderFragmento(`#paso=fallida&id=${m.id}`)).toBe(false);
    expect(await get('grupos', tienda())).toEqual(grupos);
    expect(useMudanza.getState().estado).toEqual({ fase: 'fallo', destino: 'https://mixtle.org' });
  });

  it('un paquete dañado no se guarda y se regresa "fallida"', async () => {
    const grupos = [grupo('a')];
    const f = fragmentoDeMudanza({ v: 2, id: 'm9', origen: 'https://mixtle-al-rescate.vercel.app', firma: 'mala', grupos, preferencias: {} });
    await set('grupos', [], tienda());
    expect(await atenderFragmento(f)).toBe(true);
    expect(await get('grupos', tienda())).toEqual([]);
    expect(idas.at(-1)).toBe('https://mixtle-al-rescate.vercel.app/#paso=fallida&id=m9&firma=mala');
  });

  it('si la nueva no puede guardar, regresa "fallida" (y la vieja conserva todo)', async () => {
    const grupos = [grupo('a')];
    const f = fragmentoDeMudanza({ v: 2, id: 'm8', origen: 'https://caco-al-rescate.vercel.app', firma: firmaDeGrupos(grupos), grupos, preferencias: {} });
    const abrir = indexedDB.open.bind(indexedDB);
    const espia = vi.spyOn(indexedDB, 'open').mockImplementation(() => {
      throw new Error('sin almacenamiento');
    });
    vi.resetModules();
    const { atenderFragmento: atender, usarNavegacion: usar } = await import('../src/servicios/mudanzaDefinitiva');
    const vueltas: string[] = [];
    usar((u) => vueltas.push(u));
    expect(await atender(f)).toBe(true);
    expect(vueltas).toEqual([`https://caco-al-rescate.vercel.app/#paso=fallida&id=m8&firma=${firmaDeGrupos(grupos)}`]);
    espia.mockRestore();
    expect(typeof abrir).toBe('function');
  });

  it('un paquete que no viene de una dirección vieja se guarda, pero nunca se "regresa" a otro sitio', async () => {
    const grupos = [grupo('a')];
    const f = fragmentoDeMudanza({ v: 2, id: 'm7', origen: 'https://malo.example.com', firma: firmaDeGrupos(grupos), grupos, preferencias: {} });
    await set('grupos', [], tienda());
    expect(await atenderFragmento(f)).toBe(false);
    expect(idas).toEqual([]);
    expect(((await get('grupos', tienda())) as Grupo[]).map((g) => g.id)).toEqual(['a']);
  });

  it('con "lista", la nueva da la bienvenida (y enseña a instalar si venía de una app instalada)', async () => {
    sessionStorage.setItem(`${PREFIJO}:mudanza-llegada`, JSON.stringify({ cuantos: 2, renombrados: [{ antes: 'Ardilla 1°A', despues: 'Ardilla 1°A (2)' }] }));
    expect(await atenderFragmento('#paso=lista&grupos=2&instalada=1')).toBe(false);
    expect(useMudanza.getState().estado).toEqual({ fase: 'llegaron', cuantos: 2, renombrados: [{ antes: 'Ardilla 1°A', despues: 'Ardilla 1°A (2)' }], instalada: true });
  });

  it('el paquete viejo (v1, de caco en la v3) se sigue recibiendo', async () => {
    await set('grupos', [], tienda());
    expect(await atenderFragmento(fragmentoDeMudanza({ v: 1, grupos: [grupo('v1')], preferencias: {} }))).toBe(false);
    expect(((await get('grupos', tienda())) as Grupo[]).map((g) => g.id)).toEqual(['v1']);
  });
});

describe('respaldo en archivo (plan B)', () => {
  it('exporta los grupos (y los ya mudados) y se vuelve a leer igual', () => {
    const r = crearRespaldo([conAvance(grupo('a'))], [grupo('b', '2°B')], new Date('2026-11-13T10:00:00'), 'mixtle.org');
    expect(r).toMatchObject({ app: APP_ID, formato: 'mixtle-grupos', version: 1, origen: 'mixtle.org' });
    expect(leerRespaldo(JSON.stringify(r))?.map((g) => g.id).sort()).toEqual(['a', 'b']);
  });

  it('valida el archivo antes de importar: otro juego, otro formato, grupos dañados o firma mala → nada', () => {
    const r = crearRespaldo([grupo('a')]);
    expect(leerRespaldo('no es json')).toBeNull();
    expect(leerRespaldo(JSON.stringify({ ...r, app: 'otro' }))).toBeNull();
    expect(leerRespaldo(JSON.stringify({ ...r, version: 99 }))).toBeNull();
    expect(leerRespaldo(JSON.stringify({ ...r, grupos: [...r.grupos, { basura: true }] }))).toBeNull();
    expect(leerRespaldo(JSON.stringify({ ...r, firma: '0' }))).toBeNull();
    const conAvanceCambiado = { ...r, grupos: [{ ...r.grupos[0]!, progreso: { ...r.grupos[0]!.progreso, hojitas: 999 } }] };
    expect(leerRespaldo(JSON.stringify(conAvanceCambiado))).toBeNull();
    expect(leerRespaldo('x'.repeat(6 * 1024 * 1024))).toBeNull();
  });
});
