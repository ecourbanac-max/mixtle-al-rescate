import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TEXTOS_APP } from '../../contenido/textosApp';
import { UNIDADES } from '../../contenido/unidades';
import { unidadCompleta } from '../../logica/camino';
import { datosDiplomaUnidad, type DatosDiplomaUnidad } from '../../logica/diplomaUnidad';
import { Arte } from '../componentes/Arte';
import { BotonesSistema } from '../componentes/BotonesSistema';
import { BotonGrande } from '../componentes/BotonGrande';
import { DiplomaUnidad } from '../componentes/DiplomaUnidad';
import { MixtleGuia } from '../componentes/MixtleGuia';
import { useApp } from '../estado/app';
import { useGrupoActual } from '../estado/grupos';
import { callarAlSalir, decir } from '../estado/narrador';

/** Álbum de animales de Toluca: una estampa por unidad terminada, con su dato curioso narrado. */
export function Album() {
  const grupo = useGrupoActual();
  const alCamino = useApp((s) => s.alCamino);
  const [diploma, setDiploma] = useState<DatosDiplomaUnidad | null>(null);

  useEffect(() => {
    decir(TEXTOS_APP.album.bienvenida);
    return callarAlSalir();
  }, []);

  return (
    <main data-pantalla="album" data-entrada-lista="true" className="textura relative flex h-full w-full flex-col items-center gap-6 overflow-y-auto bg-gradient-to-b from-[#FFF1C7] to-crema px-4 pt-6 pb-36">
      <BotonesSistema />
      <div className="flex w-full max-w-[80rem] items-center gap-4">
        <BotonGrande color="verde" etiqueta={TEXTOS_APP.leccion.alCamino} className="size-[clamp(4rem,9vmin,5.5rem)]" icono={<Arte clave="icono-casa" className="size-[60%]" />} onClick={() => alCamino()} />
        <h1 className="text-[clamp(1.8rem,5vmin,3.6rem)] font-black text-morado">{TEXTOS_APP.album.titulo}</h1>
      </div>
      {/* Las 5 estampas siempre (las que faltan, en silueta), centradas en el espacio libre. */}
      <div className="flex w-full max-w-[80rem] flex-1 flex-wrap content-center items-start justify-center gap-[clamp(1rem,3vmin,2rem)]">
        {UNIDADES.map((u) => {
          const ganada = !!grupo?.progreso.estampas.includes(u.estampa.id);
          const conDiploma = !!grupo && unidadCompleta(u, grupo.progreso);
          return (
            <div key={u.id} className="flex flex-col items-center gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                data-estampa={u.estampa.id}
                data-ganada={ganada}
                aria-label={ganada ? u.estampa.nombre : TEXTOS_APP.album.bloqueada}
                onClick={() => decir(ganada ? [u.estampa.nombre, u.estampa.dato] : TEXTOS_APP.album.bloqueada, { expresion: ganada ? 'feliz' : 'pensando', interrumpir: true })}
                className={`flex w-[clamp(10rem,17vw,14rem)] cursor-pointer flex-col items-center gap-2 rounded-[1.75rem] border-[6px] p-4 shadow-[0_0.45rem_0_rgba(18,61,43,0.2)] ${ganada ? 'border-[#FFD23F] bg-white' : 'border-white bg-white/60'}`}
              >
                <div className="flex h-[clamp(7rem,20vmin,12rem)] w-full items-center justify-center overflow-hidden">
                  {/* Sin ganar: silueta oscura (se adivina el animal, pero aún no se ve). */}
                  <Arte clave={u.estampa.arte} className={`h-full w-full object-contain ${ganada ? '' : 'opacity-25 brightness-0'}`} />
                </div>
                <span className="text-center text-[clamp(1.1rem,2.6vmin,1.6rem)] font-black">{ganada ? u.estampa.nombre : '?'}</span>
                <span className="rounded-full px-3 text-sm font-bold text-white" style={{ backgroundColor: u.color }}>
                  {TEXTOS_APP.camino.unidad} {u.numero}
                </span>
              </motion.button>
              {conDiploma && grupo && (
                <BotonGrande color="verde" className="h-14 text-[clamp(1rem,2.2vmin,1.4rem)]" onClick={() => setDiploma(datosDiplomaUnidad(grupo, u, new Date()))}>
                  {TEXTOS_APP.album.diploma}
                </BotonGrande>
              )}
            </div>
          );
        })}
      </div>
      {diploma && <DiplomaUnidad datos={diploma} alCerrar={() => setDiploma(null)} />}
      <div className="fixed bottom-3 left-3">
        <MixtleGuia alto="clamp(5rem,12vmin,8rem)" soloMientrasHabla />
      </div>
    </main>
  );
}
