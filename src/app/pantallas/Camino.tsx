import { MarcaEcoUrban } from '../componentes/MarcaEcoUrban';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { TEXTOS_APP } from '../../contenido/textosApp';
import { UNIDADES } from '../../contenido/unidades';
import { AMBIENTES, ARTE_AMBIENTES } from '../../arte/ambientes';
import { ARTE_DECORACIONES, DECORACIONES } from '../../arte/decoraciones';
import { accesoriosPuestos } from '../../logica/accesorios';
import { estadosDelCamino, HOJITAS_COFRE, nodosDelCamino, siguienteNodo, unidadCompleta, type EstadoNodo, type Nodo } from '../../logica/camino';
import { datosDiplomaUnidad, type DatosDiplomaUnidad } from '../../logica/diplomaUnidad';
import { mascota, nombreDelGrupo } from '../../logica/grupos';
import { debeMostrarRecorrido } from '../../logica/recorridoGuiado';
import { sonido } from '../../servicios/sonido';
import { Arte, registrarArte } from '../componentes/Arte';
import { BotonGrande } from '../componentes/BotonGrande';
import { CofreAnimado, type FaseCofre } from '../componentes/CofreAnimado';
import { DiplomaUnidad } from '../componentes/DiplomaUnidad';
import { MascotaVestida } from '../componentes/MascotaVestida';
import { Vestidor } from '../componentes/Vestidor';
import { centroDe, estallido, hojitasAlContador, lluviaDeHojitas } from '../efectos/efectos';
import { MixtleGuia } from '../componentes/MixtleGuia';
import { Encabezado } from '../componentes/Encabezado';
import { Modal } from '../componentes/Modal';
import { PanelFacilitador } from '../componentes/PanelFacilitador';
import { ParqueGrupo } from '../componentes/ParqueGrupo';
import { RecorridoGuiado } from '../componentes/RecorridoGuiado';
import { precargarLeccion } from './cargadores';
import { prepararLeccion } from './precargaLeccion';
import { useApp } from '../estado/app';
import { useGrupoActual, useGrupos } from '../estado/grupos';
import { callar, callarAlSalir, decir } from '../estado/narrador';

// Los ambientes de las unidades solo se ven en el camino: se registran al cargar esta pantalla.
registrarArte([...ARTE_AMBIENTES, ...ARTE_DECORACIONES]);

/** Las burbujas zigzaguean: posición horizontal (en %) según su lugar en la unidad. */
const ZIGZAG = [50, 66, 76, 66, 50, 34, 24, 34];

function posicionesZigzag(nodos: readonly Nodo[]): number[] {
  let enUnidad = 0;
  return nodos.map((n, i) => {
    if (i > 0 && nodos[i - 1]!.unidad.id !== n.unidad.id) enUnidad = 0;
    return ZIGZAG[enUnidad++ % ZIGZAG.length]!;
  });
}

export function Camino() {
  const grupo = useGrupoActual();
  const abrirCofre = useGrupos((s) => s.abrirCofre);
  const { abrirLeccion, abrirAventura, abrirAlbum, irAGrupos, estampaNueva, olvidarEstampaNueva } = useApp();
  const [cofre, setCofre] = useState<string | null>(null);
  const [facilitador, setFacilitador] = useState(false);
  const [vestidor, setVestidor] = useState(false);
  // La primera vez que este grupo llega al camino, Mixtle enseña para qué sirve cada cosa (se puede saltar).
  const marcarRecorridoVisto = useGrupos((s) => s.marcarRecorridoVisto);
  const [recorrido, setRecorrido] = useState(() => debeMostrarRecorrido(location.search, grupo?.progreso ?? {}));
  const nodos = useMemo(() => nodosDelCamino(UNIDADES), []);
  const siguiente = useRef<HTMLDivElement>(null);

  const progreso = grupo?.progreso;
  const estados = progreso ? estadosDelCamino(nodos, progreso, grupo.desbloquearTodo) : [];
  const indiceSiguiente = progreso ? siguienteNodo(nodos, progreso) : null;

  const saludar = () => {
    if (grupo) decir(indiceSiguiente === null ? TEXTOS_APP.camino.terminaron : TEXTOS_APP.camino.hola(mascota(grupo.mascota).nombre), { expresion: 'senalando' });
  };

  // Sin grupo elegido (o si se acaba de borrar el actual): a elegir grupo.
  useEffect(() => {
    if (!grupo) irAGrupos();
  }, [grupo, irAGrupos]);

  useEffect(() => {
    if (!grupo) return;
    // Solo se desplaza si la siguiente lección no se ve (así el parque queda a la vista al empezar).
    siguiente.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    // Mientras se ve el camino se adelanta el código de la lección: tocar una no espera una descarga.
    precargarLeccion();
    // Con el recorrido, Mixtle saluda al terminarlo.
    if (!estampaNueva && !recorrido) saludar();
    return callarAlSalir();
    // Solo al entrar al camino.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el grupo cambia con el camino ya en pantalla (el facilitador crea el grupo de demostración), el
  // globo de Mixtle no se puede quedar con el saludo del grupo anterior: saluda al nuevo.
  const grupoSaludado = useRef(grupo?.id ?? null);
  useEffect(() => {
    if (!grupo || grupo.id === grupoSaludado.current) return;
    grupoSaludado.current = grupo.id;
    const mostrar = debeMostrarRecorrido(location.search, grupo.progreso);
    setRecorrido(mostrar);
    // Lo que se decía del grupo anterior ya no vale: se descarta (otro dueño de las frases).
    callar();
    if (!mostrar) saludar();
    // Solo cuando cambia el grupo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupo?.id]);

  if (!grupo || !progreso) return null;

  const terminarRecorrido = () => {
    marcarRecorridoVisto();
    setRecorrido(false);
    saludar();
  };

  const tocar = (n: Nodo, estado: EstadoNodo) => {
    sonido.desbloquear();
    if (estado === 'bloqueado') {
      decir(TEXTOS_APP.camino.bloqueada, { expresion: 'pensando', interrumpir: true });
      return;
    }
    if (n.tipo === 'leccion') {
      // Lo primero que dice Mixtle en la lección se adelanta, y la descarga en segundo plano espera.
      prepararLeccion(n.leccion);
      abrirLeccion(n.leccion.id);
    } else if (n.tipo === 'aventura') abrirAventura(n.unidad.id);
    else if (estado === 'disponible') {
      setCofre(n.unidad.id);
      decir(TEXTOS_APP.cofre.llegaron(HOJITAS_COFRE), { expresion: 'sorprendido', interrumpir: true });
    }
  };

  // Posición horizontal de cada parada: zigzag que reinicia en cada unidad.
  const posiciones = posicionesZigzag(nodos);
  return (
    <main data-pantalla="camino" data-entrada-lista="true" className="flex h-full w-full flex-col bg-gradient-to-b from-cielo to-verde-claro">
      <Encabezado grupo={grupo} alAlbum={abrirAlbum} alCambiarGrupo={irAGrupos} alVestidor={() => setVestidor(true)} alFacilitador={() => setFacilitador(true)} />
      {/* pb: lo último del camino sube por encima de la marca de Eco Urban (fija abajo a la izquierda). */}
      <div className="relative min-h-0 flex-1 overflow-y-auto pb-[clamp(1.5rem,4vmin,2.5rem)]">
        {/* El parque del grupo es el protagonista: su meta visible, con marco, título y su mascota. */}
        <div className="mx-auto flex max-w-[70rem] flex-col items-center px-4 pt-10 pb-10">
          <section className="parque-protagonista" aria-label={TEXTOS_APP.camino.suParque(nombreDelGrupo(grupo))} data-recorrido="parque">
            <h2 className="parque-protagonista-titulo">
              <MascotaVestida mascota={grupo.mascota} puestos={accesoriosPuestos(progreso)} pinMinimoPx={0} className="h-[1.9em]" />
              <span>{TEXTOS_APP.camino.suParque(nombreDelGrupo(grupo))}</span>
            </h2>
            <ParqueGrupo progreso={progreso} className="aspect-[16/6] w-full" />
          </section>
        </div>
        {/* Un tramo por unidad, con su ambiente: la postal arriba y su paleta de fondo (cambia al avanzar). */}
        {UNIDADES.map((u) => (
          <section key={u.id} className="tramo-unidad" data-ambiente={u.id} style={estiloAmbiente(u.id)}>
            <DecoracionesTramo unidadId={u.id} />
            <div className="relative z-[1] mx-auto flex max-w-[70rem] flex-col items-center gap-4 px-4 pb-16">
              <PostalUnidad unidadId={u.id} />
              {nodos.map((n, i) => {
                if (n.unidad.id !== u.id) return null;
                const x = posiciones[i]!;
                const esSiguiente = i === indiceSiguiente;
                // scroll-mt: al desplazarse a la siguiente parada queda espacio para el globo de Mixtle bajo el encabezado.
                return (
                  <div key={n.id} ref={esSiguiente ? siguiente : undefined} className={`relative h-[clamp(7.5rem,17vmin,11rem)] w-full scroll-mt-[clamp(10rem,24vmin,15rem)] scroll-mb-8 ${esSiguiente ? 'z-10' : ''}`}>
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%` }} data-recorrido={esSiguiente ? 'siguiente' : undefined}>
                      <BurbujaNodo nodo={n} estado={estados[i]!} siguiente={esSiguiente} alTocar={() => tocar(n, estados[i]!)} hecho={estados[i] === 'hecho'} />
                      {/* La mascota del grupo (vestida) va en el camino junto a la siguiente parada: "aquí vamos".
                          Del lado contrario a Mixtle (que se pone del lado libre del zigzag). */}
                      {esSiguiente && (
                        <div
                          // Junto a la burbuja, alineada arriba y más baja que ella: nunca llega a la etiqueta ni a los botones.
                          // Afuera del ancho de la etiqueta y lejos de las insignias (palomita, candado).
                          className={`ficha-grupo pointer-events-none absolute top-0 h-[clamp(3.5rem,8vmin,5.5rem)] ${x > 50 ? 'left-full ml-[clamp(1rem,2.5vmin,1.75rem)]' : 'right-full mr-[clamp(1rem,2.5vmin,1.75rem)]'}`}
                          aria-hidden="true"
                          data-ficha-grupo
                        >
                          <MascotaVestida mascota={grupo.mascota} puestos={accesoriosPuestos(progreso)} className="h-full" />
                        </div>
                      )}
                    </div>
                    {/* Con una ventana abierta (cofre, estampa, facilitador) habla el Mixtle de la ventana: uno solo. */}
                    {esSiguiente && !cofre && !estampaNueva && !facilitador && !vestidor && !recorrido && (
                      // Un solo Mixtle: el que señala la siguiente parada es el que habla, con su globo a un lado,
                      // del lado contrario de la parada (el camino zigzaguea: ahí siempre hay espacio libre).
                      <motion.div
                        // w-max: el globo conserva su ancho (si no, se encoge al espacio que queda en la columna).
                        className="absolute top-0 w-max"
                        style={x > 50 ? { right: `calc(${100 - x}% + clamp(4rem,9vmin,6rem))` } : { left: `calc(${x}% + clamp(4rem,9vmin,6rem))` }}
                        initial={{ opacity: 0, x: x > 50 ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <MixtleGuia
                          alto="clamp(7rem,17vmin,11rem)"
                          globo={x > 50 ? 'izquierda' : 'derecha'}
                          anchoGlobo="min(22rem,26vw)"
                          globoDesdeArriba
                          expresionFija="senalando"
                          espejo={x <= 50}
                          soloMientrasHabla
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {/* Camino terminado: no hay parada que señalar; Mixtle habla al final del camino. */}
        {indiceSiguiente === null && (
          <div ref={siguiente} className="flex w-full justify-center pt-4 pb-16">
            <MixtleGuia alto="clamp(7rem,17vmin,11rem)" globo="arriba" anchoGlobo="min(28rem,60vw)" expresionFija="celebrando" soloMientrasHabla />
          </div>
        )}
      </div>

      {cofre && (
        <ModalCofre
          alAbrir={(caja) => {
            // Las hojitas del cofre vuelan al contador del encabezado (que sube contando).
            if (caja) hojitasAlContador(centroDe(caja), document.querySelector('[data-contador-grupo]'), HOJITAS_COFRE);
            abrirCofre(cofre);
            sonido.celebrar();
            decir(TEXTOS_APP.cofre.abierto(HOJITAS_COFRE), { expresion: 'celebrando', interrumpir: true });
          }}
          alCerrar={() => setCofre(null)}
        />
      )}
      {estampaNueva && <ModalEstampa id={estampaNueva} alCerrar={olvidarEstampaNueva} />}
      {facilitador && (
        <PanelFacilitador
          grupo={grupo}
          alCerrar={() => setFacilitador(false)}
          alRecorrido={() => {
            setFacilitador(false);
            setRecorrido(true);
          }}
        />
      )}
      {/* Eco Urban, fija abajo a la izquierda: chica, semitransparente y sin toques (no estorba al desplazarse). */}
      <MarcaEcoUrban esquina="abajo-izquierda" />
      {vestidor && <Vestidor grupo={grupo} alCerrar={() => setVestidor(false)} />}
      {/* Si se acaba de ganar una estampa, primero se celebra y luego empieza el recorrido. */}
      {recorrido && !estampaNueva && <RecorridoGuiado alTerminar={terminarRecorrido} />}
    </main>
  );
}

/** Colores del tramo de una unidad (de su cielo a su suelo). */
function estiloAmbiente(unidadId: string): CSSProperties {
  const a = AMBIENTES[unidadId];
  return a ? ({ '--cielo-unidad': a.cielo, '--suelo-unidad': a.suelo } as CSSProperties) : {};
}

/**
 * A los lados del tramo, el ambiente de la unidad (árboles y bancas, tules, pinos, casas y bicis,
 * la escuela). Detrás del camino (nunca tapa nada), sin toques ni animación: no cuesta cuadros.
 */
function DecoracionesTramo({ unidadId }: { unidadId: string }) {
  const d = DECORACIONES[unidadId];
  if (!d) return null;
  const pieza = (lado: 'izq' | 'der') => (x: { arte: string; arriba: number; ancho?: number }, i: number) => (
    <Arte key={`${lado}${i}`} clave={x.arte} className={`deco deco-${lado}`} style={{ top: `${x.arriba}%`, ['--ancho' as string]: x.ancho ?? 1 }} />
  );
  return (
    <div className="decoraciones" aria-hidden="true" data-decoraciones={unidadId}>
      {d.izq.map(pieza('izq'))}
      {d.der.map(pieza('der'))}
    </div>
  );
}

/** La postal de la unidad: su lugar ilustrado (parque, humedal, bosque del Nevado, calles de Toluca, escuela). */
function PostalUnidad({ unidadId }: { unidadId: string }) {
  const a = AMBIENTES[unidadId];
  return (
    <div className="flex w-full max-w-[52rem] flex-col items-center">
      {a && (
        <div className="postal-unidad" role="img" aria-label={a.nombre}>
          <Arte clave={a.arte} className="h-full w-full object-cover object-bottom" />
        </div>
      )}
      <EncabezadoUnidad unidadId={unidadId} />
    </div>
  );
}

function EncabezadoUnidad({ unidadId }: { unidadId: string }) {
  const u = UNIDADES.find((x) => x.id === unidadId)!;
  return (
    <button
      type="button"
      onClick={() => decir([TEXTOS_APP.camino.encabezadoUnidad(u.numero, u.titulo), u.tema], { interrumpir: true })}
      className="relative -mt-8 flex w-full max-w-[52rem] cursor-pointer items-center gap-4 rounded-[1.75rem] border-[5px] border-white px-6 py-4 text-left text-white shadow-[0_0.45rem_0_rgba(18,61,43,0.25)]"
      style={{ backgroundColor: u.color }}
      data-unidad={u.id}
    >
      <span className="grid size-[clamp(3.5rem,8vmin,5rem)] shrink-0 place-items-center rounded-full bg-white/25 text-[clamp(1.8rem,4.5vmin,3rem)] font-black">{u.numero}</span>
      <span className="flex flex-col">
        <span className="text-[clamp(1.4rem,3.4vmin,2.4rem)] leading-tight font-black">{u.titulo}</span>
        <span className="text-[clamp(1rem,2.2vmin,1.4rem)] font-bold opacity-95">{u.tema}</span>
      </span>
    </button>
  );
}

function BurbujaNodo({ nodo, estado, siguiente, hecho, alTocar }: { nodo: Nodo; estado: EstadoNodo; siguiente: boolean; hecho: boolean; alTocar: () => void }) {
  const color = estado === 'bloqueado' ? '#8B969C' : nodo.unidad.color;
  const grande = nodo.tipo === 'aventura';
  const tamano = grande ? 'clamp(7rem,16vmin,10.5rem)' : 'clamp(5.5rem,12.5vmin,8.5rem)';
  const titulo = nodo.tipo === 'leccion' ? nodo.leccion.titulo : nodo.tipo === 'aventura' ? nodo.unidad.aventura.titulo : TEXTOS_APP.cofre.titulo;
  const arte = nodo.tipo === 'leccion' ? nodo.leccion.arte : nodo.tipo === 'aventura' ? nodo.unidad.aventura.arte : hecho ? 'cofre-abierto' : 'cofre';
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        type="button"
        aria-label={`${titulo}${estado === 'bloqueado' ? ' (bloqueada)' : estado === 'hecho' ? ' (terminada)' : ''}`}
        data-nodo={nodo.id}
        data-estado={estado}
        onClick={alTocar}
        animate={siguiente ? { scale: [1, 1.08, 1] } : {}}
        transition={siguiente ? { duration: 1.4, repeat: Infinity } : {}}
        whileTap={{ scale: 0.92 }}
        // scroll-mb: al desplazarse hacia la parada, queda por encima de Mixtle (fijo abajo a la izquierda).
        className={`relative grid scroll-mt-[9rem] scroll-mb-[clamp(10rem,26vmin,16rem)] cursor-pointer place-items-center border-[6px] shadow-[0_0.5rem_0_rgba(18,61,43,0.3)] ${nodo.tipo === 'cofre' ? 'rounded-[1.5rem] bg-transparent shadow-none' : 'rounded-full'} ${hecho ? 'border-[#FFD23F]' : 'border-white'}`}
        style={{ width: tamano, height: tamano, backgroundColor: nodo.tipo === 'cofre' ? undefined : color }}
      >
        {nodo.tipo === 'cofre' ? (
          <Arte clave={arte} className={`h-[95%] w-[95%] object-contain ${estado === 'bloqueado' ? 'opacity-40 grayscale' : ''}`} />
        ) : (
          // Disco blanco detrás del dibujo: contraste aunque el dibujo sea del mismo color que la unidad.
          <span className="grid h-[76%] w-[76%] place-items-center rounded-full bg-white/90">
            <Arte clave={arte} className={`h-[78%] w-[78%] object-contain ${estado === 'bloqueado' ? 'opacity-40 grayscale' : ''}`} />
          </span>
        )}
        {estado === 'bloqueado' && (
          <span className="absolute -right-2 -bottom-2 grid size-12 place-items-center rounded-full border-4 border-white bg-[#5B6770]">
            <Arte clave="candado" className="size-7" />
          </span>
        )}
        {hecho && nodo.tipo !== 'cofre' && (
          <span className="absolute -top-2 -right-2 grid size-12 place-items-center rounded-full border-4 border-white bg-verde">
            <Arte clave="palomita" className="size-7" />
          </span>
        )}
        {grande && <Arte clave="icono-estrella" className="absolute -top-6 size-14" />}
      </motion.button>
      <span className="max-w-[12rem] rounded-full bg-white/85 px-3 text-center text-[clamp(0.95rem,2vmin,1.3rem)] leading-tight font-extrabold text-tinta">{titulo}</span>
    </div>
  );
}

/** Cuánto se sacude el cofre antes de abrirse (ms). */
const SACUDIDA_MS = 750;

function ModalCofre({ alAbrir, alCerrar }: { alAbrir: (caja: HTMLElement | null) => void; alCerrar: () => void }) {
  const [fase, setFase] = useState<FaseCofre>('cerrado');
  const caja = useRef<HTMLDivElement>(null);
  const espera = useRef(0);
  useEffect(() => () => window.clearTimeout(espera.current), []);
  const abrir = () => {
    if (fase !== 'cerrado') return;
    setFase('sacude');
    sonido.tocar('sacude');
    espera.current = window.setTimeout(() => {
      setFase('abierto');
      sonido.tocar('estallido');
      alAbrir(caja.current);
    }, SACUDIDA_MS);
  };
  return (
    <Modal etiqueta={TEXTOS_APP.cofre.titulo}>
      <div ref={caja} data-fase-cofre={fase}>
        <button type="button" className="cursor-pointer disabled:cursor-default" onClick={abrir} disabled={fase !== 'cerrado'} aria-label={`${TEXTOS_APP.cofre.abrir}: ${TEXTOS_APP.cofre.trae} ${HOJITAS_COFRE} ${TEXTOS_APP.camino.hojitas}`}>
          <CofreAnimado fase={fase} hojitas={HOJITAS_COFRE} className="h-[clamp(11rem,34vmin,19rem)] w-[clamp(13rem,40vmin,23rem)]" />
        </button>
      </div>
      <MixtleGuia alto="clamp(5rem,13vmin,8rem)" />
      <BotonGrande latir={fase !== 'sacude'} className="h-20 text-[clamp(1.4rem,3.2vmin,2.2rem)]" onClick={() => (fase === 'abierto' ? alCerrar() : abrir())}>
        {fase === 'abierto' ? TEXTOS_APP.cofre.seguir : TEXTOS_APP.cofre.abrir}
      </BotonGrande>
    </Modal>
  );
}

/** Cuánto tarda la estampa en voltearse (ms): primero se ve su reverso, luego se revela. */
const REVELA_MS = 800;

function ModalEstampa({ id, alCerrar }: { id: string; alCerrar: () => void }) {
  const u = UNIDADES.find((x) => x.estampa.id === id);
  const grupo = useGrupoActual();
  const completa = !!u && !!grupo && unidadCompleta(u, grupo.progreso);
  const [revelada, setRevelada] = useState(false);
  const [diploma, setDiploma] = useState<DatosDiplomaUnidad | null>(null);
  const carta = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!u) return;
    sonido.celebrar();
    if (completa) lluviaDeHojitas(22);
    decir(completa ? [TEXTOS_APP.album.nueva(u.estampa.nombre), u.estampa.dato, TEXTOS_APP.unidad.terminada(u.numero)] : [TEXTOS_APP.album.nueva(u.estampa.nombre), u.estampa.dato], {
      expresion: 'celebrando',
    });
    const t = window.setTimeout(() => {
      setRevelada(true);
      sonido.tocar('revelar');
      estallido(carta.current);
    }, REVELA_MS);
    return () => window.clearTimeout(t);
    // Solo al ganarla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u]);
  if (!u) return null;
  return (
    <Modal etiqueta={TEXTOS_APP.album.titulo}>
      {completa && (
        <p className="titulo-unidad-terminada font-titulo text-[clamp(1.8rem,5vmin,3.2rem)] leading-none font-extrabold text-white" style={{ ['--color-unidad' as string]: u.color }}>
          {TEXTOS_APP.unidad.titulo(u.numero)}
        </p>
      )}
      <div ref={carta} className="estampa-carta size-[clamp(10rem,30vmin,16rem)]" data-revelada={revelada || undefined}>
        <div className="estampa-cara estampa-reverso" aria-hidden="true">
          <Arte clave="hojita" className="size-[45%]" />
        </div>
        <div className="estampa-cara estampa-frente">
          <Arte clave={u.estampa.arte} className="max-h-full max-w-full object-contain" />
        </div>
      </div>
      <p className="text-[clamp(1.6rem,4vmin,2.6rem)] font-black text-verde">{u.estampa.nombre}</p>
      <MixtleGuia alto="clamp(5rem,13vmin,8rem)" />
      <div className="flex flex-wrap justify-center gap-4">
        {completa && grupo && (
          <BotonGrande color="morado" className="h-20 text-[clamp(1.3rem,3vmin,2rem)]" onClick={() => setDiploma(datosDiplomaUnidad(grupo, u, new Date()))}>
            {TEXTOS_APP.unidad.verDiploma}
          </BotonGrande>
        )}
        <BotonGrande latir className="h-20 text-[clamp(1.4rem,3.2vmin,2.2rem)]" onClick={alCerrar}>
          {TEXTOS_APP.cofre.seguir}
        </BotonGrande>
      </div>
      {diploma && <DiplomaUnidad datos={diploma} alCerrar={() => setDiploma(null)} />}
    </Modal>
  );
}
