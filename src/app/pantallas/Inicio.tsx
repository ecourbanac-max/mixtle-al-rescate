import { TextoBanda } from '../componentes/TextoBanda';
import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { CAJA_COLGADO, MANOS_COLGADO } from '../../arte/escenas';
import { FRASE_MIXTLE } from '../../arte/marca';
import { TEXTOS } from '../../data/textos';
import { TEXTOS_APP } from '../../contenido/textosApp';
import { actualizarAhora, useActualizacion } from '../../servicios/actualizacion';
import { primeraPantallaLista } from '../../servicios/arranque';
import { precargarPrimerasPantallas } from './cargadores';
import { reiniciarProgreso } from '../../logica/progreso';
import { audioListo, musica } from '../../servicios/audio/motor';
import { estadoMusica } from '../../servicios/estadoSonido';
import { sonido } from '../../servicios/sonido';
import { voz } from '../../servicios/voz';
import { Arte } from '../componentes/Arte';
import { BotonesSistema } from '../componentes/BotonesSistema';
import { MarcaEcoUrban } from '../componentes/MarcaEcoUrban';
import { BotonGrande } from '../componentes/BotonGrande';
import { Logo } from '../componentes/Logo';
import { useApp } from '../estado/app';
import { decir } from '../estado/narrador';

const Vitrina = lazy(() => import('./Vitrina').then((m) => ({ default: m.Vitrina })));

/** Capas del parque, de la más lejana a la más cercana. `prof`: cuánto se mueve con el paralaje. */
const CAPAS = [
  { clave: 'inicio-cielo', prof: 0.2 },
  { clave: 'inicio-nubes', prof: 0.5, clase: 'inicio-nubes' },
  { clave: 'inicio-nevado', prof: 0.9 },
  { clave: 'inicio-lomas', prof: 1.5 },
  { clave: 'inicio-arbol', prof: 2.4, mixtle: true },
  { clave: 'inicio-frente', prof: 3.2 },
] as const;

const MARIPOSAS = [
  { left: '58%', top: '62%', retraso: 0 },
  { left: '84%', top: '48%', retraso: 0.6 },
  { left: '93%', top: '70%', retraso: 1.2 },
];

/** Cuando aterriza el logo (en ms desde que entra la pantalla): ahí suena su remate musical. */
const LOGO_ATERRIZA_MS = 1450;
/** Cuando termina la entrada: el botón ya está listo para tocarse. */
const ENTRADA_MS = 2300;
/** Lo más que se espera a que esté listo el audio de "¡Al rescate!" (la pantalla no lo espera). */
const ESPERA_VOZ_MS = 800;
/** Sin tocar la pantalla este tiempo, en modo proyector empieza el modo vitrina. */
export const VITRINA_TRAS_MS = 60_000;

/** Dónde está la mano de Mixtle sobre la rama del árbol (en % del escenario de 1920×1080). */
const RAMA = { x: 700 / 1920, y: 320 / 1080 };
/** Alto de la caja de Mixtle colgado (con su cola), en fracción del escenario. */
const ALTO_COLGADO = 0.41;

function sinMovimiento(): boolean {
  if (typeof window === 'undefined') return true;
  return document.documentElement.hasAttribute('data-suave') || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Pantalla de inicio: el parque en capas con paralaje y el Nevado de Toluca al fondo, Mixtle que
 * llega columpiándose de una rama, el logo que aterriza con su remate musical y un solo botón.
 * En modo proyector, si nadie toca la pantalla en 60 s, empieza el modo vitrina (una demo en bucle).
 */
/** Los efectos que suenan primero: el toque de los botones, el remate del logo y el barrido de la transición. */
export const EFECTOS_DEL_ARRANQUE = ['toque', 'remate', 'barrido'] as const;

/** La Nunito 900 (font-black) se estrena en el título de Grupos: se pide antes, no a media transición. */
export function calentarLetraGruesa(): Promise<unknown> {
  try {
    return document.fonts?.load('900 1em Nunito').catch(() => undefined) ?? Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

/** ¿El navegador aún no deja sonar? (el contexto parado, o la música activada sin oírse de verdad) */
function audioSigueBloqueado(): boolean {
  return !audioListo() || (estadoMusica.estaActivo && !musica.seOye);
}

export function Inicio() {
  const jugar = useApp((s) => s.jugar);
  const proyector = useApp((s) => s.proyector);
  const escena = useRef<HTMLElement>(null);
  const [entradaLista, setEntradaLista] = useState(sinMovimiento);
  const [saliendo, setSaliendo] = useState(false);
  const [vitrina, setVitrina] = useState(() => typeof location !== 'undefined' && new URLSearchParams(location.search).has('vitrina'));
  const remateSonado = useRef(false);
  // Mientras el navegador no deje sonar nada (hasta el primer toque), un indicio sutil lo dice.
  const [audioBloqueado, setAudioBloqueado] = useState(() => audioSigueBloqueado());
  const hayVersionNueva = useActualizacion((s) => s.hayNueva || s.esperando);

  useEffect(() => musica.poner('tranquila'), []);
  // Si el navegador ya deja sonar (visita de regreso), la música arranca sola en un momento: el indicio
  // se va solo cuando de verdad se oye (el tiempo de reproducción avanza), no cuando play() resolvió.
  useEffect(() => {
    if (!audioBloqueado) return;
    const t = window.setInterval(() => {
      if (!audioSigueBloqueado()) setAudioBloqueado(false);
    }, 300);
    return () => window.clearInterval(t);
  }, [audioBloqueado]);

  // Mientras se ve el inicio, se adelanta lo que hace falta para que "¡Jugar!" no espere a la red ni
  // trabaje durante la transición: el código de Grupos y Camino, la voz de "¡Al rescate!" y de la
  // bienvenida, los primeros efectos (incluido el barrido de la transición, que si no se bajaba y
  // decodificaba justo al tocar "¡Jugar!") y la letra más gruesa, que estrena el título de Grupos.
  useEffect(() => {
    precargarPrimerasPantallas();
    void voz.precargar([FRASE_MIXTLE, TEXTOS_APP.grupos.bienvenida]);
    sonido.precargar(EFECTOS_DEL_ARRANQUE);
    void calentarLetraGruesa();
    // Si se sale del inicio antes de que termine de entrar, también cuenta como lista.
    return () => primeraPantallaLista();
  }, []);
  // Ya se ve el inicio: ahora sí, lo pesado (service worker y descarga para jugar sin internet).
  useEffect(() => {
    if (entradaLista) primeraPantallaLista();
  }, [entradaLista]);

  // Entrada: el remate suena cuando aterriza el logo (si el audio ya está desbloqueado; si no, al primer toque).
  useEffect(() => {
    const t1 = window.setTimeout(() => {
      if (audioListo()) {
        remateSonado.current = true;
        sonido.tocar('remate');
      }
    }, LOGO_ATERRIZA_MS);
    const t2 = window.setTimeout(() => setEntradaLista(true), ENTRADA_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // Paralaje: las capas siguen al puntero (ratón en el proyector, dedo en la tablet), cada una a su profundidad.
  useEffect(() => {
    const el = escena.current;
    if (!el || sinMovimiento()) return;
    let cuadro = 0;
    const mover = (e: PointerEvent) => {
      if (cuadro) return;
      cuadro = requestAnimationFrame(() => {
        cuadro = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        el.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
    };
    el.addEventListener('pointermove', mover);
    return () => {
      el.removeEventListener('pointermove', mover);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  // Modo vitrina: solo en el proyector y solo si nadie toca la pantalla en 60 s.
  useEffect(() => {
    if (!proyector || vitrina) return;
    let t = window.setTimeout(() => setVitrina(true), VITRINA_TRAS_MS);
    const reiniciar = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setVitrina(true), VITRINA_TRAS_MS);
    };
    window.addEventListener('pointerdown', reiniciar);
    window.addEventListener('keydown', reiniciar);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('pointerdown', reiniciar);
      window.removeEventListener('keydown', reiniciar);
    };
  }, [proyector, vitrina]);

  /**
   * Cualquier toque en el inicio (no solo "¡Jugar!") arranca la música y desbloquea la voz. El primero:
   * si el remate no pudo sonar (audio bloqueado), el logo rebota con él, y se quita el indicio.
   */
  const primerToque = () => {
    sonido.desbloquear();
    voz.desbloquear();
    setAudioBloqueado(false);
    if (remateSonado.current) return;
    remateSonado.current = true;
    escena.current?.classList.add('inicio-logo-rebota');
    window.setTimeout(() => sonido.tocar('remate'), 60);
  };

  const alJugar = () => {
    if (saliendo) return;
    sonido.desbloquear();
    voz.desbloquear();
    reiniciarProgreso();
    setSaliendo(true);
    // La transición empieza ya, sin esperar a la voz: Mixtle dice "¡Al rescate!" encima. Si su audio
    // no está listo en 800 ms (red muy lenta), no se dice tarde.
    decir(FRASE_MIXTLE, { expresion: 'celebrando', esperaMaximaMs: ESPERA_VOZ_MS, cruzaPantalla: true });
    jugar();
  };

  const colgado: CSSProperties = {
    left: `${(RAMA.x - (ALTO_COLGADO * (1080 / 1920) * (CAJA_COLGADO.ancho / CAJA_COLGADO.alto)) / 2) * 100}%`,
    top: `${(RAMA.y - ALTO_COLGADO * MANOS_COLGADO.y) * 100}%`,
    height: `${ALTO_COLGADO * 100}%`,
    transformOrigin: `${MANOS_COLGADO.x * 100}% ${MANOS_COLGADO.y * 100}%`,
  };

  return (
    <main
      ref={escena}
      data-pantalla="inicio"
      data-entrada-lista={entradaLista}
      data-saliendo={saliendo || undefined}
      className="inicio relative h-full w-full overflow-hidden"
      onPointerDown={primerToque}
    >
      <div className="inicio-escenario">
        {CAPAS.map((c) => (
          <div key={c.clave} className="inicio-capa" style={{ '--prof': c.prof } as CSSProperties}>
            <div className={`inicio-capa-deriva ${'clase' in c ? c.clase : ''}`}>
              <div className="inicio-capa-paralaje">
                <Arte clave={c.clave} className="absolute inset-0 h-full w-full" />
                {'mixtle' in c && (
                  <div className="inicio-columpio" style={colgado} role="img" aria-label="Mixtle, el cacomixtle">
                    <div className="inicio-columpio-vaiven colgado-con-banda relative h-full" style={{ aspectRatio: `${CAJA_COLGADO.ancho} / ${CAJA_COLGADO.alto}` }}>
                      <Arte clave="mixtle-colgado" className="h-full" />
                      <TextoBanda caja={CAJA_COLGADO} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Logo comoTitulo sinMixtle className="inicio-logo absolute top-[3%] left-[47%] w-[46%]" />

      <div className="inicio-animales" aria-hidden="true">
        <div className="absolute right-[2%] bottom-[4%] h-[20%] animate-[brinco_2.1s_ease-out_infinite]">
          <Arte clave="ardilla-feliz" className="h-full" />
        </div>
        <div className="absolute top-[52%] right-[4%] h-[11%] animate-[flotar_1.8s_ease-in-out_infinite]">
          <Arte clave="colibri-feliz" className="h-full" />
        </div>
        {MARIPOSAS.map((m, i) => (
          <div key={i} className="inicio-mariposa absolute h-[8%]" style={{ left: m.left, top: m.top, animationDelay: `${m.retraso}s` }}>
            <Arte clave="mariposa-feliz" className="h-full" />
          </div>
        ))}
      </div>

      <div className="inicio-boton absolute bottom-[9%] left-[66%] -translate-x-1/2">
        <BotonGrande
          latir={!saliendo}
          className="h-[clamp(5rem,16vmin,11rem)] px-[clamp(2rem,5vmin,4rem)] font-titulo text-[clamp(2.5rem,8vmin,5.5rem)]"
          icono={<Arte clave="icono-jugar" className="h-[0.8em]" />}
          onClick={alJugar}
        >
          {TEXTOS.inicio.jugar}
        </BotonGrande>
      </div>

      {/*
        Eco Urban: arriba a la izquierda, sobre la copa del árbol. Abajo a la derecha está la ardilla (en un
        celular se encimaban) y abajo a la izquierda, el aviso "Toca la pantalla para escuchar".
      */}
      <MarcaEcoUrban esquina="arriba-izquierda" className="inicio-sello" />

      <BotonesSistema />

      {/* Versión nueva sin recarga automática (no debería pasar): un toque la actualiza; los grupos no se tocan. */}
      {hayVersionNueva && (
        <button
          type="button"
          className="absolute top-[2%] left-1/2 z-30 -translate-x-1/2 cursor-pointer rounded-full border-4 border-white bg-naranja px-5 py-2 text-[clamp(1rem,2.4vmin,1.5rem)] font-black text-white shadow-[0_0.4rem_0_#8a370f]"
          onClick={() => void actualizarAhora()}
          data-version-nueva
        >
          {TEXTOS_APP.inicio.versionNueva}
        </button>
      )}
      {audioBloqueado && (
        <p
          className="pointer-events-none absolute bottom-[3%] left-[2%] rounded-full bg-verde-oscuro/55 px-4 py-1.5 text-[clamp(0.95rem,2.2vmin,1.4rem)] font-extrabold text-white animate-[flotar_2.4s_ease-in-out_infinite]"
          data-toca-para-empezar
        >
          {TEXTOS_APP.inicio.tocaParaEmpezar}
        </p>
      )}

      {vitrina && (
        <Suspense fallback={null}>
          <Vitrina alSalir={() => setVitrina(false)} />
        </Suspense>
      )}
    </main>
  );
}
