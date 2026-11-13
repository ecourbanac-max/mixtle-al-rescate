import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TEXTOS_APP } from '../../contenido/textosApp';
import { ACCESORIOS, accesoriosPuestos, conArticulo, faltanPara, hojitasDisponibles, tieneAccesorio, type IdAccesorio } from '../../logica/accesorios';
import { mascota, type Grupo, type IdMascota } from '../../logica/grupos';
import { textoDeLocucion } from '../../voz/locucion';
import { sonido } from '../../servicios/sonido';
import { ContadorHojitas } from '../efectos/ContadorHojitas';
import { centroDe, chispas } from '../efectos/efectos';
import { useGrupos } from '../estado/grupos';
import { decir } from '../estado/narrador';
import { Arte } from './Arte';
import { BotonGrande } from './BotonGrande';
import { MARGEN_ACCESORIOS, MascotaVestida, proporcionMascota } from './MascotaVestida';
import { Modal } from './Modal';

/**
 * La vista previa es un recuadro de tamaño fijo (según la pantalla) y la mascota se escala para caber
 * en él a lo alto Y a lo ancho, con margen para los accesorios que sobresalen (capa, mochila). Antes
 * la mascota iba con `height: 100%` en una celda de grid: la fila crecía al tamaño natural del dibujo
 * (472×440 px) y la mascota se salía del recuadro y tapaba las tarjetas (29 de octubre de 2026).
 */
const FRACCION_MASCOTA = 1 - 2 * MARGEN_ACCESORIOS;
function altoDeLaMascota(mascota: IdMascota): string {
  const r = proporcionMascota(mascota);
  return `min(${(FRACCION_MASCOTA * 100).toFixed(0)}cqh, calc(${(FRACCION_MASCOTA * 100).toFixed(0)}cqw / ${r.toFixed(3)}))`;
}

/**
 * Vestidor: la mascota del grupo y los accesorios que se compran con hojitas. Los precios son fijos
 * y se ven en el botón; si no alcanza, se dice cuántas faltan (sin bloquear ni regañar). Antes de
 * gastar, se pregunta (un toque por accidente no se lleva las hojitas). Lo comprado nunca se pierde:
 * quitárselo solo lo guarda.
 */
export function Vestidor({ grupo, alCerrar }: { grupo: Grupo; alCerrar: () => void }) {
  const { comprarAccesorio, alternarPuesto } = useGrupos();
  const figura = useRef<HTMLDivElement>(null);
  const [porComprar, setPorComprar] = useState<IdAccesorio | null>(null);
  const p = grupo.progreso;
  const puestos = accesoriosPuestos(p);

  useEffect(() => {
    decir(TEXTOS_APP.vestidor.hola(mascota(grupo.mascota).nombre), { expresion: 'feliz' });
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preguntar = (id: IdAccesorio) => {
    if (faltanPara(p, id) > 0) {
      decir(TEXTOS_APP.vestidor.faltan, { expresion: 'animo', interrumpir: true });
      return;
    }
    setPorComprar(id);
    decir(confirmacion(id), { expresion: 'sorprendido', interrumpir: true });
  };

  const comprar = (id: IdAccesorio) => {
    setPorComprar(null);
    comprarAccesorio(id);
    sonido.tocar('comprar');
    if (figura.current) {
      const c = centroDe(figura.current);
      chispas(c.x, c.y, { cantidad: 16, alcance: 140 });
    }
    decir(TEXTOS_APP.vestidor.comprada, { expresion: 'celebrando', interrumpir: true });
  };

  return (
    <Modal etiqueta={TEXTOS_APP.vestidor.titulo} ancho="min(74rem,94vw)">
      <h2 className="font-titulo text-[clamp(1.8rem,4.5vmin,3rem)] leading-none font-extrabold text-verde">{TEXTOS_APP.vestidor.titulo}</h2>
      {/* En pantallas anchas: la vista previa a la izquierda y los accesorios a la derecha (cabe sin desplazarse). */}
      <div className="grid w-full items-start justify-items-center gap-5 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-3">
          <div
            ref={figura}
            // Grande, para que se lean el pin y la banda de Mixtle (v3.1.2: Mixtle mide 264 px o más en una laptop de
            // 1366×768); en pantallas anchas cabe junto a las dos filas de tarjetas.
            className="relative grid h-[clamp(9rem,57vmin,30rem)] w-[clamp(11rem,57vmin,30rem)] place-items-center rounded-[1.5rem] bg-white/50"
            style={{ containerType: 'size' }}
            data-vestidor-figura
          >
            <div style={{ height: altoDeLaMascota(grupo.mascota) }}>
              <MascotaVestida mascota={grupo.mascota} puestos={puestos} className="h-full" />
            </div>
          </div>
          <ContadorHojitas
            valor={hojitasDisponibles(p)}
            etiqueta={TEXTOS_APP.vestidor.disponibles}
            className="rounded-full border-4 border-white bg-verde px-4 py-1 text-[clamp(1.4rem,3.4vmin,2.2rem)] text-white"
          />
        </div>
        <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
        {ACCESORIOS.map((a) => {
          const suyo = tieneAccesorio(p, a.id);
          const puesto = puestos.includes(a.id);
          const faltan = faltanPara(p, a.id);
          return (
            <li
              key={a.id}
              className={`flex flex-col items-center gap-2 rounded-[1.5rem] border-[5px] bg-white p-3 ${puesto ? 'border-verde' : 'border-white'}`}
              data-accesorio={a.id}
              data-estado={puesto ? 'puesto' : suyo ? 'guardado' : faltan > 0 ? 'faltan' : 'disponible'}
            >
              <Arte clave={`accesorio-${a.id}`} className={`h-[clamp(3.5rem,9vmin,5.5rem)] w-full object-contain ${!suyo && faltan > 0 ? 'opacity-50' : ''}`} />
              <span className="text-[clamp(1rem,2.2vmin,1.35rem)] leading-tight font-extrabold">{a.nombre}</span>
              {/* El precio siempre a la vista (fijo, nada al azar). */}
              {!suyo && (
                <span className="flex items-center gap-1 text-[clamp(1.1rem,2.4vmin,1.5rem)] font-black text-verde" data-precio={a.precio}>
                  <Arte clave="hojita" className="size-[1.2em]" />
                  {a.precio}
                </span>
              )}
              {suyo ? (
                <BotonGrande color={puesto ? 'gris' : 'verde'} className="h-14 w-full text-[clamp(1rem,2.2vmin,1.35rem)]" onClick={() => alternarPuesto(a.id)}>
                  {puesto ? TEXTOS_APP.vestidor.quitarse : TEXTOS_APP.vestidor.ponerse}
                </BotonGrande>
              ) : faltan > 0 ? (
                // No alcanza: se ve cuántas faltan y, al tocar, Mixtle anima a seguir jugando.
                <button type="button" className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-[2rem] border-4 border-dashed border-verde/40 font-extrabold text-verde" onClick={() => preguntar(a.id)}>
                  <Arte clave="hojita" className="size-6" />
                  {TEXTOS_APP.vestidor.faltanCuantas(faltan)}
                </button>
              ) : (
                <BotonGrande className="h-14 w-full text-[clamp(1rem,2.2vmin,1.35rem)]" etiqueta={`${TEXTOS_APP.vestidor.comprar} ${a.nombre}: ${a.precio} hojitas`} onClick={() => preguntar(a.id)}>
                  {TEXTOS_APP.vestidor.comprar}
                </BotonGrande>
              )}
            </li>
          );
        })}
        </ul>
      </div>
      <BotonGrande color="verde" latir className="h-16 text-[clamp(1.2rem,2.8vmin,1.8rem)]" onClick={alCerrar}>
        {TEXTOS_APP.vestidor.cerrar}
      </BotonGrande>
      {porComprar && <PreguntaCompra id={porComprar} mascota={grupo.mascota} puestos={puestos} alComprar={() => comprar(porComprar)} alCancelar={() => setPorComprar(null)} />}
    </Modal>
  );
}

const confirmacion = (id: IdAccesorio) => TEXTOS_APP.vestidor.confirmar(conArticulo(id), ACCESORIOS.find((a) => a.id === id)!.precio);

interface PropsPregunta {
  id: IdAccesorio;
  mascota: IdMascota;
  puestos: readonly IdAccesorio[];
  alComprar: () => void;
  alCancelar: () => void;
}

/**
 * "¿Compran la gorra por 30 hojitas?": la mascota ya con el accesorio (así se ve sin saber leer), el
 * precio y dos botones del mismo tamaño; ninguno late, para no empujar a comprar. En un portal: la
 * ventana del vestidor tiene transform y atraparía a esta.
 */
function PreguntaCompra({ id, mascota: m, puestos, alComprar, alCancelar }: PropsPregunta) {
  const a = ACCESORIOS.find((x) => x.id === id)!;
  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => e.key === 'Escape' && alCancelar();
    window.addEventListener('keydown', alTecla);
    return () => window.removeEventListener('keydown', alTecla);
  }, [alCancelar]);
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center bg-verde-oscuro/70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-label={textoDeLocucion(confirmacion(id))}
      data-pregunta-compra={id}
    >
      <motion.div
        className="flex w-[min(42rem,92vw)] flex-col items-center gap-4 rounded-[2rem] border-[6px] border-white bg-crema p-[clamp(1.25rem,4vmin,2.25rem)] text-center shadow-[0_0.6rem_0_rgba(0,0,0,0.25)]"
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <MascotaVestida mascota={m} puestos={[...puestos.filter((x) => x !== id), id]} className="h-[clamp(8rem,24vmin,13rem)]" />
        <p className="text-[clamp(1.3rem,3.2vmin,2rem)] leading-tight font-extrabold">{a.nombre}</p>
        <span className="flex items-center gap-2 rounded-full border-4 border-white bg-verde px-4 py-1 text-[clamp(1.4rem,3.4vmin,2.2rem)] font-black text-white" data-precio={a.precio}>
          <Arte clave="hojita" className="size-[1.2em]" />
          {a.precio}
        </span>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <BotonGrande color="verde" className="h-20 w-full text-[clamp(1.2rem,2.8vmin,1.8rem)]" onClick={alComprar}>
            {TEXTOS_APP.vestidor.confirmarSi}
          </BotonGrande>
          <BotonGrande color="gris" className="h-20 w-full text-[clamp(1.2rem,2.8vmin,1.8rem)]" onClick={alCancelar}>
            {TEXTOS_APP.vestidor.confirmarNo}
          </BotonGrande>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
