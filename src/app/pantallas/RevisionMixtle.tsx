import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { logoSvg } from '../../arte/marca';
import { BANDA, type Banda } from '../../arte/bandaEcoUrban';
import { PERSONAJES, mixtleColgadoCompleto, mixtleCompleto } from '../../arte/personajes';
import { TAMANO_PIN, VARIANTES_PIN, type TamanoPin } from '../../arte/pinEcoUrban';
import { ACCESORIOS, type IdAccesorio } from '../../logica/accesorios';
import { MASCOTAS } from '../../logica/grupos';
import { Arte } from '../componentes/Arte';
import { Logo } from '../componentes/Logo';
import { MascotaVestida } from '../componentes/MascotaVestida';
import { MixtleFigura, type ExpresionMixtle } from '../componentes/MixtleFigura';
import { MixtleGuia } from '../componentes/MixtleGuia';
import { useNarrador } from '../estado/narrador';

/*
 * Página de revisión (`?mixtle`): todas las apariciones de Mixtle lado a lado, tal como las pinta el
 * juego (el mismo componente o el mismo dibujo en cada caso), para comparar paleta, trazo y
 * proporciones de un vistazo; el pin de Eco Urban que trae en el pecho (v3.1); y los accesorios puestos
 * en las seis mascotas. No es parte del juego:
 * sirve para revisar el arte (y para las capturas de antes y después).
 */

/** Las poses del cuerpo, en el orden de la hoja de personaje. */
const POSES: ExpresionMixtle[] = ['normal', 'habla', 'feliz', 'pensando', 'sorprendido', 'celebrando', 'senalando', 'saluda', 'animo', 'duerme'];
// El mismo SVG que index.html pone en la pantalla de carga (los id sin sufijo), a tamaño de muestra.
const LOGO_CARGA = logoSvg({ atributos: 'width="100%" height="100%" aria-hidden="true"' });

/** Mixtle entero (con la cola) con el pin en otro tamaño: para comparar las tres opciones lado a lado. */
const SVG_VARIANTE = (t: TamanoPin) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 472 440" width="100%" height="100%" aria-hidden="true">${mixtleCompleto('normal', `-variante-${t}`, 'chico', VARIANTES_PIN[t])}</svg>`;

/** La banda en cada variante, con el texto (como se ve en grande): colgado y sentado. */
const SVG_BANDA_COLGADO = (b: Banda) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="100%" height="100%" aria-hidden="true">${mixtleColgadoCompleto(`-banda-c-${b}`, 'chico', undefined, 'si', b)}</svg>`;
const SVG_BANDA_SENTADO = (b: Banda) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 472 440" width="100%" height="100%" aria-hidden="true">${mixtleCompleto('normal', `-banda-s-${b}`, 'chico', undefined, 'si', b)}</svg>`;

function Seccion({ titulo, children, id }: { titulo: string; children: ReactNode; id: string }) {
  return (
    <section className="flex flex-col gap-3" data-revision={id}>
      <h2 className="text-2xl font-black text-verde">{titulo}</h2>
      <div className="flex flex-wrap items-end gap-6">{children}</div>
    </section>
  );
}

function Caso({ nombre, children, fondo = 'bg-white', ancho = '' }: { nombre: string; children: ReactNode; fondo?: string; ancho?: string }) {
  return (
    <figure className={`flex flex-col items-center gap-2 ${ancho}`} data-caso={nombre}>
      <div className={`flex items-end justify-center rounded-2xl border-2 border-verde/20 p-3 ${fondo}`}>{children}</div>
      <figcaption className="text-sm font-bold text-verde-oscuro">{nombre}</figcaption>
    </figure>
  );
}

/** La tarjeta del recorrido guiado, tal cual (fuera del árbol de la app, como la real), con el fondo oscurecido. */
function TarjetaTutorial() {
  return createPortal(
    <div className="relative my-2 h-56 w-[min(44rem,92vw)] overflow-hidden rounded-2xl bg-verde-claro" data-caso="tutorial">
      <div className="absolute inset-0 bg-verde-oscuro/70" />
      <div className="absolute top-1/2 left-1/2 flex w-[min(40rem,88vw)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-[2rem] border-[6px] border-white bg-crema p-4 shadow-[0_0.6rem_0_rgba(0,0,0,0.25)]">
        <MixtleGuia alto="clamp(5.5rem,13vmin,8.5rem)" globo="derecha" anchoGlobo="min(32rem,62vw)" expresionFija="senalando" />
      </div>
    </div>,
    document.getElementById('revision-portal') ?? document.body,
  );
}

export function RevisionMixtle() {
  useEffect(() => {
    useNarrador.setState({ subtitulo: '¡Hola! Así me veo en cada lugar del juego.', hablando: false, expresion: 'senalando' });
    return () => useNarrador.setState({ subtitulo: '' });
  }, []);
  const paliacate: IdAccesorio[] = ['paliacate'];
  return (
    <main data-pantalla="revision" data-entrada-lista="true" className="flex h-full w-full flex-col gap-8 overflow-y-auto bg-white p-6 text-verde-oscuro">
      <h1 className="text-3xl font-black text-verde">Revisión de Mixtle y de los accesorios</h1>

      <Seccion id="pin" titulo="Pin Eco Urban">
        <Caso nombre="El pin (logotipo en una línea)">
          <Arte clave="pin-eco-urban" className="size-64" data-pin-solo="grande" />
        </Caso>
        <Caso nombre="Los dos acomodos: en una línea y apilado (el del juego)">
          <span className="flex items-end gap-4">
            <Arte clave="pin-eco-urban" className="size-28" />
            <Arte clave="pin-eco-urban-chico" className="size-28" data-pin-solo="chico" />
            <Arte clave="pin-eco-urban" className="size-10" />
            <Arte clave="pin-eco-urban-chico" className="size-10" />
            <Arte clave="pin-eco-urban-chico" className="size-6" />
          </span>
        </Caso>
        <Caso nombre="El logotipo de Eco Urban (en trazos)">
          <Arte clave="logotipo-eco-urban" className="h-16" />
        </Caso>
      </Seccion>

      <Seccion id="pin-poses" titulo="Mixtle con su pin en cada pose (en espejo se sigue leyendo derecho)">
        {POSES.map((p) => (
          <Caso key={p} nombre={p}>
            <MixtleFigura alto="13rem" expresion={p} />
          </Caso>
        ))}
        <Caso nombre="señalando, en espejo">
          <MixtleFigura alto="13rem" expresion="senalando" espejo />
        </Caso>
        <Caso nombre="en una línea (vitrina), entero y colgado">
          <MixtleFigura alto="13rem" expresion="celebrando" pin="grande" />
          <Arte clave="mixtle-entero-feliz" className="h-[13rem]" />
          <Arte clave="mixtle-colgado" className="h-[16rem]" />
        </Caso>
      </Seccion>

      <Seccion id="pin-tamanos" titulo={`Tres tamaños posibles (en uso: ${TAMANO_PIN})`}>
        {(Object.keys(VARIANTES_PIN) as TamanoPin[]).map((t) => (
          <Caso key={t} nombre={`${t}${t === TAMANO_PIN ? ' (en uso)' : ''}`}>
            <div className="h-60 w-[16rem]" dangerouslySetInnerHTML={{ __html: SVG_VARIANTE(t) }} />
          </Caso>
        ))}
      </Seccion>

      <Seccion id="banda" titulo={`Banda de guardián (en uso: ${BANDA}): sin banda, blanca y verde`}>
        {(['ninguna', 'blanca', 'verde'] as Banda[]).map((b) => (
          <Caso key={b} nombre={`${b}${b === BANDA ? ' (en uso)' : ''}`}>
            <div className="h-72 w-[10.8rem]" dangerouslySetInnerHTML={{ __html: SVG_BANDA_COLGADO(b) }} />
            <div className="h-60 w-[16rem]" dangerouslySetInnerHTML={{ __html: SVG_BANDA_SENTADO(b) }} />
          </Caso>
        ))}
        <Caso nombre="En línea, grande (texto visible) y chico (sin texto)">
          <MixtleFigura alto="18rem" expresion="saluda" />
          <MixtleFigura alto="8rem" expresion="normal" />
        </Caso>
        <Caso nombre="Con todos los accesorios">
          <MascotaVestida mascota="cacomixtle" puestos={['flor', 'gorra', 'lentes', 'paliacate', 'mochila', 'capa']} className="h-72" />
        </Caso>
      </Seccion>

      <Seccion id="referencia" titulo="Referencia: el logo y el inicio">
        <Caso nombre="Logo (en línea)" fondo="bg-cielo">
          <Logo className="h-40 w-[20rem]" />
        </Caso>
        <Caso nombre="Pantalla de carga (index.html)" fondo="bg-cielo">
          <div className="h-40 w-[20rem]" dangerouslySetInnerHTML={{ __html: LOGO_CARGA }} />
        </Caso>
        <Caso nombre="Inicio: colgado de la rama" fondo="bg-cielo">
          <Arte clave="mixtle-colgado" className="h-56" />
        </Caso>
      </Seccion>

      <Seccion id="poses" titulo="Las poses: en línea (React) y como imagen (Phaser)">
        {POSES.map((p) => (
          <Caso key={p} nombre={p}>
            <MixtleFigura alto="9rem" expresion={p} />
            <Arte clave={p === 'normal' ? 'mixtle' : `mixtle-${p}`} className="h-[9rem]" />
          </Caso>
        ))}
        <Caso nombre="parpadeo (solo imagen)">
          <Arte clave="mixtle-parpadeo" className="h-[9rem]" />
        </Caso>
        <Caso nombre="entero (estampa, parque, mascota)">
          <Arte clave="mixtle-entero" className="h-[9rem]" />
          <Arte clave="mixtle-entero-feliz" className="h-[9rem]" />
          <Arte clave="mixtle-entero-celebrando" className="h-[9rem]" />
        </Caso>
      </Seccion>

      <Seccion id="lugares" titulo="Dónde aparece">
        <Caso nombre="Globo (camino, lección)" fondo="bg-verde-claro">
          <MixtleGuia alto="8rem" globo="derecha" anchoGlobo="18rem" expresionFija="senalando" />
        </Caso>
        <Caso nombre="Lección (grande)" fondo="bg-cielo">
          <MixtleGuia alto="11rem" globo="derecha" anchoGlobo="18rem" expresionFija="habla" />
        </Caso>
        <Caso nombre="Encabezado del camino" fondo="bg-verde">
          <div className="grid size-16 place-items-center overflow-hidden rounded-full border-4 border-white bg-cielo">
            <Arte clave="mixtle" className="mt-[30%] w-[130%] max-w-none" />
          </div>
        </Caso>
        <Caso nombre="Diploma (firma)" fondo="bg-crema">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Arte clave="mixtle-entero-feliz" className="h-12" /> Mixtle, el cacomixtle
          </span>
        </Caso>
        <Caso nombre="Transición (panel)" fondo="bg-verde">
          <Arte clave="mixtle-entero-celebrando" className="h-24" />
        </Caso>
      </Seccion>

      <Seccion id="tutorial" titulo="La tarjeta del recorrido guiado (fuera del árbol de la app, como la real)">
        <div id="revision-portal" className="contents" />
        <TarjetaTutorial />
      </Seccion>

      <Seccion id="paliacate" titulo="El paliacate en las seis mascotas y en la tienda">
        <Caso nombre="Ícono de la tienda">
          <Arte clave="accesorio-paliacate" className="h-20" />
        </Caso>
        {MASCOTAS.map((m) => (
          <Caso key={m.id} nombre={m.nombre}>
            <MascotaVestida mascota={m.id} puestos={paliacate} className="h-32" />
          </Caso>
        ))}
        <Caso nombre="En el diploma (chico, sobre crema)" fondo="bg-crema">
          {MASCOTAS.map((m) => (
            <MascotaVestida key={m.id} mascota={m.id} puestos={paliacate} className="h-14" />
          ))}
        </Caso>
      </Seccion>

      <Seccion id="accesorios" titulo="Todos los accesorios en la tienda">
        {ACCESORIOS.map((a) => (
          <Caso key={a.id} nombre={a.nombre}>
            <Arte clave={`accesorio-${a.id}`} className="h-16" />
          </Caso>
        ))}
      </Seccion>

      <p className="text-sm opacity-70">{PERSONAJES.filter((p) => p.clave.startsWith('mixtle')).length} dibujos de Mixtle en el catálogo.</p>
    </main>
  );
}
