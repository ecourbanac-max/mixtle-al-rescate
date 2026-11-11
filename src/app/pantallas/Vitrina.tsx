import { useEffect, useRef, useState, type ComponentType } from 'react';
import { UNIDADES } from '../../contenido/unidades';
import { completarAventura, completarLeccion, PROGRESO_VACIO, type ProgresoGrupo } from '../../logica/camino';
import { Arte } from '../componentes/Arte';
import { CofreAnimado, type FaseCofre } from '../componentes/CofreAnimado';
import { Logo } from '../componentes/Logo';
import { MixtleFigura, type ExpresionMixtle } from '../componentes/MixtleFigura';
import { ParqueGrupo } from '../componentes/ParqueGrupo';
import { ContadorHojitas } from '../efectos/ContadorHojitas';
import { centroDe, chispas, hojitasAlContador } from '../efectos/efectos';

/*
 * Modo vitrina: una demo corta del juego, en bucle, para ferias y reuniones. Empieza sola en el
 * proyector cuando nadie toca el inicio en 60 s. Usa los componentes reales del juego (Mixtle, el
 * parque del grupo, el cofre, las estampas). No narra (para no cansar a quien está al lado) y
 * cualquier toque o tecla regresa al inicio.
 */

/** Programa pasos dentro de una escena (se limpian solos al cambiar de escena). */
function usePasos(pasos: [number, () => void][]): void {
  const lista = useRef(pasos);
  useEffect(() => {
    const ts = lista.current.map(([ms, f]) => window.setTimeout(f, ms));
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, []);
}

function EscenaHola() {
  return (
    <div className="flex h-full items-center justify-center gap-[4vmin] px-[6vmin]">
      <MixtleFigura alto="58vmin" expresion="saluda" pin="grande" />
      <Logo sinMixtle className="vitrina-entra w-[min(60vw,110vmin)]" />
    </div>
  );
}

function EscenaLeccion() {
  const [elegida, setElegida] = useState(false);
  const [hojitas, setHojitas] = useState(15);
  const [racha, setRacha] = useState(false);
  const [cara, setCara] = useState<ExpresionMixtle>('senalando');
  const tarjeta = useRef<HTMLDivElement>(null);
  const contador = useRef<HTMLDivElement>(null);
  usePasos([
    [2600, () => {
      setElegida(true);
      setCara('celebrando');
      if (tarjeta.current) {
        const c = centroDe(tarjeta.current);
        chispas(c.x, c.y, { cantidad: 12 });
        hojitasAlContador(c, contador.current, 3, () => setHojitas((h) => h + 1));
      }
    }],
    [3900, () => setRacha(true)],
  ]);
  const residuos = [
    { arte: 'residuo-manzana', nombre: 'el corazón de manzana', bien: true },
    { arte: 'residuo-botella', nombre: 'la botella', bien: false },
    { arte: 'residuo-frituras', nombre: 'las frituras', bien: false },
  ];
  return (
    <div className="flex h-full flex-col gap-[2vmin] p-[3vmin]">
      <div className="flex items-center gap-[2vmin]">
        <div className="relative h-[4vmin] flex-1 overflow-hidden rounded-full border-[0.6vmin] border-white bg-white/60">
          <div className="barra-avance h-full rounded-full bg-verde transition-[width] duration-700" style={{ width: elegida ? '66%' : '50%' }} />
        </div>
        <ContadorHojitas ref={contador} valor={hojitas} etiqueta="Hojitas" className="rounded-full bg-white px-[2vmin] py-[0.8vmin] text-[4.5vmin] text-verde-oscuro" />
      </div>
      <div className="flex items-center gap-[2vmin]">
        <MixtleFigura alto="22vmin" expresion={cara} />
        <p className="rounded-[2vmin] bg-white px-[3vmin] py-[1.6vmin] text-[4vmin] font-extrabold">
          ¿Cuál va en el <span className="text-verde">bote verde de orgánico</span>?
        </p>
        {racha && <span className="racha-chip ml-auto text-[4vmin]">¡3 seguidas!</span>}
      </div>
      <div className="flex flex-1 items-end justify-center gap-[3vmin] pb-[4vmin]">
        <Arte clave="bote-organico" className="h-[30vmin]" />
        {residuos.map((r) => (
          <div
            key={r.arte}
            ref={r.bien ? tarjeta : undefined}
            className={`vitrina-tarjeta ${elegida ? (r.bien ? 'vitrina-tarjeta-bien' : 'opacity-45') : ''}`}
          >
            <Arte clave={r.arte} className="h-[60%]" />
            <span>{r.nombre}</span>
          </div>
        ))}
      </div>
      {!elegida && <i className="vitrina-dedo" aria-hidden="true" />}
    </div>
  );
}

function EscenaParque() {
  const u1 = UNIDADES[0]!;
  const etapas: ProgresoGrupo[] = [
    PROGRESO_VACIO,
    u1.lecciones.slice(0, 2).reduce((p, l) => completarLeccion(p, l.id, { hojitas: 12, aLaPrimera: 5 }, '2026-10-28'), PROGRESO_VACIO),
    completarAventura(u1.lecciones.reduce((p, l) => completarLeccion(p, l.id, { hojitas: 12, aLaPrimera: 5 }, '2026-10-28'), PROGRESO_VACIO), u1, '2026-10-28'),
  ];
  const [etapa, setEtapa] = useState(0);
  usePasos([
    [1500, () => setEtapa(1)],
    [3900, () => setEtapa(2)],
  ]);
  return (
    <div className="flex h-full items-center justify-center p-[4vmin]">
      <ParqueGrupo progreso={etapas[etapa]!} className="aspect-[16/7] w-[min(92vw,190vmin)]" />
    </div>
  );
}

function EscenaCofre() {
  const [fase, setFase] = useState<FaseCofre>('cerrado');
  usePasos([
    [1500, () => setFase('sacude')],
    [2600, () => setFase('abierto')],
  ]);
  return (
    <div className="flex h-full items-center justify-center gap-[6vmin]">
      <CofreAnimado fase={fase} hojitas={15} className="h-[52vmin] w-[60vmin]" />
      <MixtleFigura alto="40vmin" expresion={fase === 'abierto' ? 'celebrando' : 'sorprendido'} pin="grande" />
    </div>
  );
}

function EscenaAlbum() {
  return (
    <div className="flex h-full flex-wrap content-center items-center justify-center gap-[3vmin] p-[4vmin]">
      {UNIDADES.map((u, i) => (
        <div key={u.id} className="vitrina-estampa" style={{ animationDelay: `${0.3 + i * 0.5}s` }}>
          <Arte clave={u.estampa.arte} className="h-[70%] w-full object-contain" />
          <span>{u.estampa.nombre}</span>
        </div>
      ))}
    </div>
  );
}

function EscenaInvitacion() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[3vmin]">
      <Logo className="vitrina-entra w-[min(70vw,120vmin)]" />
    </div>
  );
}

interface Escena {
  id: string;
  ms: number;
  texto: string;
  Componente: ComponentType;
}

export const ESCENAS_VITRINA: readonly Escena[] = [
  { id: 'hola', ms: 4500, texto: 'Un juego para cuidar el parque', Componente: EscenaHola },
  { id: 'leccion', ms: 7000, texto: 'Aprenden a separar la basura', Componente: EscenaLeccion },
  { id: 'parque', ms: 7000, texto: 'Cada lección limpia su parque', Componente: EscenaParque },
  { id: 'cofre', ms: 5500, texto: 'Premios por su esfuerzo', Componente: EscenaCofre },
  { id: 'album', ms: 5500, texto: 'Animales de Toluca para su álbum', Componente: EscenaAlbum },
  { id: 'invitacion', ms: 4500, texto: '¡Toquen la pantalla para jugar!', Componente: EscenaInvitacion },
];

/** Escena con la que empieza: ?vitrina=parque empieza en esa (para revisar y para el tráiler). */
function escenaInicial(): number {
  if (typeof location === 'undefined') return 0;
  const id = new URLSearchParams(location.search).get('vitrina');
  return Math.max(0, ESCENAS_VITRINA.findIndex((e) => e.id === id));
}

export function Vitrina({ alSalir }: { alSalir: () => void }) {
  const [i, setI] = useState(escenaInicial);
  const escena = ESCENAS_VITRINA[i]!;

  useEffect(() => {
    const t = window.setTimeout(() => setI((x) => (x + 1) % ESCENAS_VITRINA.length), escena.ms);
    return () => window.clearTimeout(t);
  }, [escena]);

  // Cualquier tecla también regresa al inicio.
  useEffect(() => {
    const salir = () => alSalir();
    window.addEventListener('keydown', salir);
    return () => window.removeEventListener('keydown', salir);
  }, [alSalir]);

  const { Componente } = escena;
  return (
    // Sale con el clic (no al apoyar el dedo): así ese toque no cae en el botón "¡Jugar!" de abajo.
    <div className="vitrina fixed inset-0 z-40 cursor-pointer" data-vitrina={escena.id} onClick={alSalir} role="dialog" aria-label="Modo vitrina. Toquen la pantalla para jugar.">
      <div key={i} className="vitrina-escena">
        <Componente />
      </div>
      <p key={`t${i}`} className="vitrina-texto">
        {escena.texto}
      </p>
      <div className="vitrina-puntos" aria-hidden="true">
        {ESCENAS_VITRINA.map((e, j) => (
          <i key={e.id} data-activo={j === i || undefined} />
        ))}
      </div>
    </div>
  );
}
