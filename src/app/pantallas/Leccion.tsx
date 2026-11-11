import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AMBIENTES } from '../../arte/ambientes';
import { TEXTOS_APP } from '../../contenido/textosApp';
import { leccionPorId } from '../../contenido/unidades';
import { hojitasDisponibles } from '../../logica/accesorios';
import { completarLeccion, hoyLocal, type ProgresoGrupo } from '../../logica/camino';
import {
  avance,
  cruzaLaMitad,
  ejercicioActual,
  hitoDeRacha,
  HOJITAS_POR_LECCION,
  iniciarLeccion,
  registrarAcierto,
  registrarError,
  resumenLeccion,
  terminada,
  type SesionLeccion,
} from '../../logica/leccion';
import { sonido } from '../../servicios/sonido';
import type { Locucion } from '../../voz/locucion';
import { Arte } from '../componentes/Arte';
import { BannerRespuesta, type DatosBanner } from '../componentes/BannerRespuesta';
import { BotonGrande } from '../componentes/BotonGrande';
import { BotonesSistema } from '../componentes/BotonesSistema';
import { MixtleGuia } from '../componentes/MixtleGuia';
import { Modal } from '../componentes/Modal';
import { ParqueGrupo } from '../componentes/ParqueGrupo';
import type { ExpresionMixtle } from '../componentes/MixtleFigura';
import { ContadorHojitas } from '../efectos/ContadorHojitas';
import { centroDe, chispas, hojitasAlContador, lluviaDeHojitas } from '../efectos/efectos';
import { Ejercicio } from '../ejercicios/Ejercicio';
import { soltarAlNarrar } from './precargaLeccion';
import type { Respuesta } from '../ejercicios/comun';
import { useApp } from '../estado/app';
import { useGrupoActual, useGrupos } from '../estado/grupos';
import { callar, decir, ponerExpresion } from '../estado/narrador';

/** Pista con "¡Casi!" al principio, si no lo trae ya. */
function conCasi(pista: Locucion): Locucion {
  const piezas = typeof pista === 'string' ? [pista] : [...pista];
  return typeof piezas[0] === 'string' && piezas[0].startsWith('¡Casi!') ? piezas : ['¡Casi!', ...piezas];
}

/** El fondo de las lecciones toma la paleta del ambiente de su unidad (de su cielo a su suelo). */
function fondoDeUnidad(unidadId: string) {
  const a = AMBIENTES[unidadId];
  return a ? { background: `linear-gradient(${a.cielo}, ${a.suelo})` } : undefined;
}

/** Mixtle no celebra siempre igual: va cambiando de pose con cada acierto. */
const CELEBRACIONES: readonly ExpresionMixtle[] = ['celebrando', 'feliz', 'animo', 'saluda'];

export function Leccion() {
  const leccionId = useApp((s) => s.leccionId);
  const alCamino = useApp((s) => s.alCamino);
  const datos = leccionId ? leccionPorId(leccionId) : undefined;
  const ejercicioInicial = useApp((s) => s.ejercicioInicial);
  const [sesion, setSesion] = useState<SesionLeccion | null>(() => {
    if (!datos) return null;
    const s = iniciarLeccion(datos.leccion);
    // Solo pruebas (?e2e): empezar en un ejercicio dado (las pruebas de escenas no juegan la lección entera).
    const i = ejercicioInicial ? s.cola.findIndex((e) => e.id === ejercicioInicial) : -1;
    return i > 0 ? { ...s, cola: s.cola.slice(i) } : s;
  });
  const [banner, setBanner] = useState<DatosBanner | null>(null);
  const [preguntaSalir, setPreguntaSalir] = useState(false);
  const animos = useRef(0);
  // Juice (v3): contador de hojitas del grupo, racha dentro de la lección y la mitad de la barra.
  const grupo = useGrupoActual();
  // Las mismas hojitas que el encabezado del camino: las que se pueden gastar.
  const [base] = useState(() => (grupo ? hojitasDisponibles(grupo.progreso) : 0));
  const [hojitasLeccion, setHojitasLeccion] = useState(0);
  const [racha, setRacha] = useState<{ n: number; clave: number } | null>(null);
  const contador = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLDivElement>(null);
  const ultimoToque = useRef({ x: 0, y: 0 });
  const anunciarMitad = useRef(false);
  const actual = sesion ? ejercicioActual(sesion) : null;
  // Cada vuelta del mismo ejercicio (repaso) se monta de nuevo, limpia.
  const claveEjercicio = sesion && actual ? `${actual.id}-${sesion.hechos}` : 'fin';
  const esRepaso = !!sesion && !!actual && sesion.hechos >= sesion.leccion.ejercicios.length;

  useEffect(() => {
    if (!datos) alCamino();
  }, [datos, alCamino]);

  // Mixtle dice la consigna de cada ejercicio (y la bienvenida en el primero).
  useEffect(() => {
    if (!sesion || !actual) return;
    ponerExpresion('normal');
    const piezas: string[] = [];
    if (anunciarMitad.current) {
      anunciarMitad.current = false;
      piezas.push(TEXTOS_APP.leccion.mitad);
    }
    if (sesion.hechos === 0 && sesion.erroresActual === 0) piezas.push(sesion.leccion.bienvenida);
    if (esRepaso) piezas.push(TEXTOS_APP.leccion.repaso);
    piezas.push(actual.consigna);
    decir(piezas);
    // Primer ejercicio en pantalla: en cuanto Mixtle se oye, la descarga en segundo plano sigue.
    if (sesion.hechos === 0 && sesion.erroresActual === 0) soltarAlNarrar();
    // Solo al cambiar de ejercicio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveEjercicio]);

  useEffect(() => () => callar(), []);

  if (!datos || !sesion) return null;
  if (terminada(sesion)) return <FinLeccion sesion={sesion} unidadColor={datos.unidad.color} />;

  const responder = (r: Respuesta) => {
    if (!actual) return;
    if (r.correcto && r.terminado) {
      const lista = TEXTOS_APP.leccion.animos;
      const vuelta = animos.current++;
      const animo = lista[vuelta % lista.length]!;
      const primeraVez = !sesion.fallados.has(actual.id);
      const hito = primeraVez ? hitoDeRacha(sesion.racha + 1) : null;
      const extra = hito ? [TEXTOS_APP.leccion.rachaDicha[hito]!] : [];
      const exito = r.exito ? (typeof r.exito === 'string' ? [r.exito] : r.exito) : [];
      const texto: Locucion = extra.length || exito.length ? [animo, ...extra, ...exito] : animo;
      sonido.tocar('acierto');
      decir(texto, { expresion: CELEBRACIONES[vuelta % CELEBRACIONES.length] });
      setBanner({ tipo: 'bien', texto });
      // Lluvia de hojitas y chispas donde tocaron; la hojita ganada (a la primera) vuela al contador.
      lluviaDeHojitas(12);
      chispas(ultimoToque.current.x, ultimoToque.current.y, { cantidad: 14 });
      if (primeraVez) {
        hojitasAlContador(ultimoToque.current, contador.current, 1, () => {
          setHojitasLeccion((h) => h + 1);
          sonido.tocar('hojita');
        });
      }
      if (hito) {
        setRacha({ n: hito, clave: vuelta });
        window.setTimeout(() => sonido.tocar('racha'), 350);
      }
    } else if (!r.correcto) {
      const texto = conCasi(r.pista ?? actual.pista);
      sonido.tocar('otraVez');
      // La racha se va sin decir nada: solo deja de verse.
      setRacha(null);
      setSesion((s) => (s ? registrarError(s) : s));
      decir(texto, { expresion: 'pensando' });
      setBanner({ tipo: 'casi', texto });
    }
  };

  const continuar = () => {
    if (banner?.tipo === 'bien') {
      const siguiente = registrarAcierto(sesion);
      // A la mitad de la lección: destello en la barra y Mixtle anima antes de la siguiente consigna.
      if (cruzaLaMitad(sesion, siguiente) && !terminada(siguiente)) {
        anunciarMitad.current = true;
        sonido.tocar('mitad');
        const r = barra.current?.getBoundingClientRect();
        if (r) chispas(r.left + r.width / 2, r.top + r.height / 2, { cantidad: 16, alcance: 90 });
      }
      setSesion(siguiente);
    } else ponerExpresion('normal');
    setBanner(null);
  };

  return (
    <main
      data-pantalla="leccion"
      data-entrada-lista="true"
      className="textura relative flex h-full w-full flex-col bg-gradient-to-b from-cielo to-verde-claro"
      style={fondoDeUnidad(datos.unidad.id)}
      onPointerDownCapture={(e) => (ultimoToque.current = { x: e.clientX, y: e.clientY })}
    >
      <header className="flex items-center gap-[clamp(0.75rem,2.5vmin,2rem)] px-[clamp(1rem,3vmin,2rem)] py-3">
        <BotonGrande color="gris" etiqueta={TEXTOS_APP.leccion.salir} className="size-[clamp(4rem,9vmin,6rem)]" icono={<span className="text-[clamp(2rem,5vmin,3.5rem)] leading-none">✕</span>} onClick={() => setPreguntaSalir(true)} />
        <div
          ref={barra}
          className="h-[clamp(1.5rem,3.5vmin,2.5rem)] flex-1 overflow-hidden rounded-full border-4 border-white bg-white/60"
          role="progressbar"
          aria-label="Avance de la lección"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(avance(sesion) * 100)}
        >
          <motion.div className="barra-avance h-full rounded-full" style={{ backgroundColor: datos.unidad.color }} animate={{ width: `${Math.max(4, avance(sesion) * 100)}%` }} />
        </div>
        {racha && (
          <span key={racha.clave} className="racha-chip shrink-0 text-[clamp(1.1rem,2.6vmin,1.8rem)]" data-racha={racha.n}>
            {TEXTOS_APP.leccion.racha(racha.n)}
          </span>
        )}
        <ContadorHojitas
          ref={contador}
          valor={base + hojitasLeccion}
          etiqueta={TEXTOS_APP.leccion.hojitas}
          className="shrink-0 rounded-full border-4 border-white bg-verde px-3 py-1 text-[clamp(1.2rem,3vmin,2rem)] text-white"
        />
        <BotonesSistema enLinea />
      </header>

      {/*
        Encuentra el error (una escena con cosas que se tocan): abajo se aparta el alto de la barra de
        respuesta, para que nunca tape nada, y en pantallas bajas Mixtle y su globo van a un lado de la
        escena (no arriba), para que la escena use todo el alto. Ver .leccion-cuerpo en estilos.css.
      */}
      <div className="leccion-cuerpo flex min-h-0 flex-1 flex-col px-4 pb-[clamp(3rem,8vmin,6rem)]" data-tipo={actual?.tipo}>
        {/* Mixtle y su globo siempre en el mismo lugar, sin importar el tamaño del ejercicio. */}
        <div className="leccion-guia flex h-[clamp(7rem,19vmin,12rem)] shrink-0 items-center pl-[2vw]">
          <MixtleGuia alto="clamp(6rem,17vmin,11rem)" anchoGlobo="var(--ancho-globo-leccion, min(38rem,60vw))" sinGlobo={!!banner} />
        </div>
        {/* El ejercicio ocupa y se centra en todo el espacio que queda. */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          {actual && (
            <div className={`flex w-full justify-center ${actual.tipo === 'encuentra-error' ? 'h-full' : ''}`} data-ejercicio-id={actual.id} data-repaso={esRepaso}>
              <Ejercicio key={claveEjercicio} ejercicio={actual} responder={responder} bloqueado={!!banner} />
            </div>
          )}
        </div>
      </div>

      {banner && <BannerRespuesta banner={banner} alContinuar={continuar} />}

      {preguntaSalir && (
        <PreguntaSalir
          alQuedarse={() => setPreguntaSalir(false)}
          alSalir={() => {
            callar();
            alCamino();
          }}
        />
      )}
    </main>
  );
}

function PreguntaSalir({ alQuedarse, alSalir }: { alQuedarse: () => void; alSalir: () => void }) {
  useEffect(() => {
    decir(TEXTOS_APP.leccion.salirPregunta, { expresion: 'sorprendido' });
  }, []);
  return (
    <Modal etiqueta={TEXTOS_APP.leccion.salir}>
      <MixtleGuia alto="clamp(6rem,16vmin,10rem)" />
      <div className="flex flex-wrap justify-center gap-4">
        <BotonGrande color="verde" latir className="h-20 text-[clamp(1.3rem,3vmin,2rem)]" onClick={alQuedarse}>
          {TEXTOS_APP.leccion.salirNo}
        </BotonGrande>
        <BotonGrande color="gris" className="h-20 text-[clamp(1.3rem,3vmin,2rem)]" onClick={alSalir}>
          {TEXTOS_APP.leccion.salirSi}
        </BotonGrande>
      </div>
    </Modal>
  );
}

/** Cuánto se ve el parque "como estaba" antes de que cambie en la pantalla final. */
const MOSTRAR_CAMBIO_MS = 1200;

/** Pantalla final: hojitas, cuántos salieron a la primera, el parque creciendo y el jingle. */
function FinLeccion({ sesion, unidadColor }: { sesion: SesionLeccion; unidadColor: string }) {
  const alCamino = useApp((s) => s.alCamino);
  const grupo = useGrupoActual();
  const terminarLeccion = useGrupos((s) => s.terminarLeccion);
  const resumen = useMemo(() => resumenLeccion(sesion), [sesion]);
  // El parque como estaba antes de esta lección (para mostrar cómo crece).
  const [antes] = useState<ProgresoGrupo | null>(() => grupo?.progreso ?? null);
  const [mostrarDespues, setMostrarDespues] = useState(false);
  const guardado = useRef(false);
  // Contador del grupo: ya trae las hojitas a la primera (volaron durante la lección); aquí llegan las de terminarla.
  const [inicioContador] = useState(() => (grupo ? hojitasDisponibles(grupo.progreso) : 0) + sesion.aLaPrimera);
  const [llegadas, setLlegadas] = useState(0);
  const insignia = useRef<HTMLDivElement>(null);
  const contadorFin = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      lluviaDeHojitas(20);
      if (!insignia.current) return;
      hojitasAlContador(centroDe(insignia.current), contadorFin.current, HOJITAS_POR_LECCION, () => {
        setLlegadas((n) => n + 1);
        sonido.tocar('hojita');
      });
    }, 700);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (guardado.current) return;
    guardado.current = true;
    terminarLeccion(sesion.leccion.id, resumen);
    sonido.celebrar();
    decir(TEXTOS_APP.leccion.terminada(resumen.hojitas, resumen.aLaPrimera, resumen.ejercicios), {
      expresion: 'celebrando',
      alTerminar: () => decir(TEXTOS_APP.leccion.parqueCrece, { expresion: 'feliz' }),
    });
  }, [sesion, resumen, terminarLeccion]);

  // La recompensa se ve en el momento: el parque aparece como estaba y, en cuanto termina de entrar
  // la pantalla, cambia al nuevo estado (se va la basura, recupera el color, brota la flor).
  useEffect(() => {
    const t = window.setTimeout(() => {
      setMostrarDespues(true);
      sonido.tocar('transformar');
    }, MOSTRAR_CAMBIO_MS);
    return () => window.clearTimeout(t);
  }, []);

  const despues = antes ? completarLeccion(antes, sesion.leccion.id, resumen, hoyLocal()) : null;
  const parque = mostrarDespues ? despues : antes;

  return (
    <main data-pantalla="fin-leccion" data-entrada-lista="true" className="textura relative flex h-full w-full flex-col items-center justify-center gap-[clamp(0.75rem,2.5vmin,1.75rem)] overflow-y-auto bg-gradient-to-b from-cielo to-verde-claro p-4">
      <ContadorHojitas
        ref={contadorFin}
        valor={inicioContador + llegadas}
        etiqueta={TEXTOS_APP.leccion.hojitas}
        className="absolute top-4 right-4 rounded-full border-4 border-white bg-verde px-4 py-1 text-[clamp(1.4rem,3.6vmin,2.4rem)] text-white"
      />
      <motion.h1 initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-[clamp(2.2rem,6vmin,4.5rem)] font-black text-white" style={{ WebkitTextStroke: `0.1em ${unidadColor}`, paintOrder: 'stroke fill' }}>
        {TEXTOS_APP.leccion.tituloFin}
      </motion.h1>
      <div className="flex flex-wrap items-center justify-center gap-[clamp(1rem,4vmin,3rem)]">
        <div ref={insignia} className="flex items-center gap-3 rounded-[1.5rem] border-[5px] border-white bg-verde px-6 py-3 text-white" data-hojitas={resumen.hojitas}>
          <Arte clave="hojita" className="size-[clamp(3rem,8vmin,5rem)]" />
          <span className="text-[clamp(2rem,6vmin,4rem)] font-black">+{resumen.hojitas}</span>
        </div>
        <div className="flex items-center gap-3 rounded-[1.5rem] border-[5px] border-white bg-azul px-6 py-3 text-white" data-a-la-primera={resumen.aLaPrimera}>
          <Arte clave="icono-estrella" className="size-[clamp(3rem,8vmin,5rem)]" />
          <span className="text-[clamp(1.5rem,4.5vmin,3rem)] font-black">
            {TEXTOS_APP.leccion.aLaPrimera(resumen.aLaPrimera, resumen.ejercicios)}
          </span>
        </div>
      </div>
      {parque && (
        // Antes y después: la etiqueta cambia, pasa un barrido de luz y suena la transformación.
        <div className="parque-transforma" data-cambio={mostrarDespues ? 'si' : 'no'}>
          <span key={String(mostrarDespues)} className="etiqueta-parque" data-ahora={mostrarDespues || undefined}>
            {mostrarDespues ? TEXTOS_APP.leccion.ahora : TEXTOS_APP.leccion.antes}
          </span>
          <ParqueGrupo progreso={parque} className="aspect-[16/6] w-[min(90vw,calc(40vh*16/6))]" />
        </div>
      )}
      <div className="flex items-center gap-4">
        <MixtleGuia alto="clamp(5rem,13vmin,8rem)" />
        <BotonGrande latir className="h-[clamp(4.5rem,11vmin,6.5rem)] text-[clamp(1.3rem,3vmin,2.2rem)]" icono={<Arte clave="icono-casa" className="size-[1.3em]" />} onClick={() => alCamino()}>
          {TEXTOS_APP.leccion.alCamino}
        </BotonGrande>
      </div>
    </main>
  );
}
