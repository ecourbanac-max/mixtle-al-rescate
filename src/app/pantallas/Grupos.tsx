import { SelloEcoUrban } from '../componentes/SelloEcoUrban';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TEXTOS_APP } from '../../contenido/textosApp';
import { accesoriosPuestos } from '../../logica/accesorios';
import { COLORES_GRUPO, LARGO_ETIQUETA, limpiarEtiqueta, MASCOTAS, nombreDelGrupo, type IdMascota } from '../../logica/grupos';
import { Arte } from '../componentes/Arte';
import { MascotaVestida } from '../componentes/MascotaVestida';
import { BotonesSistema } from '../componentes/BotonesSistema';
import { BotonGrande } from '../componentes/BotonGrande';
import { MixtleGuia } from '../componentes/MixtleGuia';
import { Modal } from '../componentes/Modal';
import { useApp } from '../estado/app';
import { useGrupos } from '../estado/grupos';
import { callar, decir } from '../estado/narrador';

/** Elegir o crear el grupo que va a jugar. El progreso es por grupo, nunca por niño. */
export function Grupos() {
  const { grupos, cargado, guardadoOk, cargar, elegir } = useGrupos();
  const alCamino = useApp((s) => s.alCamino);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    if (!cargado) void cargar();
  }, [cargado, cargar]);
  // La bienvenida, una vez: si Mixtle aún dice "¡Al rescate!" (la transición no lo espera), primero
  // lo termina (800 ms como mucho).
  useEffect(() => {
    decir(TEXTOS_APP.grupos.bienvenida, { trasLaActualMs: 800 });
    return () => callar();
  }, []);

  return (
    <main data-pantalla="grupos" data-entrada-lista="true" className="textura relative flex h-full w-full flex-col items-center gap-[clamp(1rem,3vmin,2rem)] overflow-y-auto bg-gradient-to-b from-cielo to-verde-claro px-4 pt-6 pb-8">
      <BotonesSistema />
      <h1 className="text-[clamp(2.2rem,6vmin,4.5rem)] font-black text-white" style={{ WebkitTextStroke: '0.1em var(--color-verde)', paintOrder: 'stroke fill' }}>
        {TEXTOS_APP.grupos.titulo}
      </h1>
      <div className="flex max-w-[70rem] flex-wrap justify-center gap-[clamp(1rem,3vmin,2rem)]">
        {grupos.map((g) => {
          return (
            <motion.button
              key={g.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.04 }}
              data-grupo={g.id}
              onClick={() => {
                elegir(g.id);
                alCamino();
              }}
              className="flex w-[clamp(10rem,24vmin,15rem)] cursor-pointer flex-col items-center gap-2 rounded-[2rem] border-[6px] border-white p-4 text-white shadow-[0_0.5rem_0_rgba(18,61,43,0.3)]"
              style={{ backgroundColor: g.color }}
            >
              {/* Cada grupo con su mascota vestida. Sin sus hojitas a la vista: los grupos no se comparan. */}
              <MascotaVestida mascota={g.mascota} puestos={accesoriosPuestos(g.progreso)} className="h-[clamp(5rem,13vmin,8rem)]" />
              <span className="text-[clamp(1.2rem,2.8vmin,1.8rem)] font-black">{nombreDelGrupo(g)}</span>
            </motion.button>
          );
        })}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.04 }}
          onClick={() => {
            setCreando(true);
            decir([TEXTOS_APP.grupos.crear, TEXTOS_APP.grupos.aviso]);
          }}
          className="flex w-[clamp(10rem,24vmin,15rem)] cursor-pointer flex-col items-center justify-center gap-2 rounded-[2rem] border-[6px] border-dashed border-verde bg-white/70 p-4 text-verde"
        >
          <span aria-hidden className="text-[clamp(4rem,10vmin,6rem)] leading-none font-black">+</span>
          <span className="text-[clamp(1.2rem,2.8vmin,1.8rem)] font-black">{TEXTOS_APP.grupos.nuevo}</span>
        </motion.button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <p className="max-w-[44rem] rounded-2xl bg-white/80 px-4 py-2 text-center font-bold">{guardadoOk ? TEXTOS_APP.grupos.soloAqui : TEXTOS_APP.grupos.sinGuardar}</p>
        <SelloEcoUrban texto={TEXTOS_APP.ecoUrban.unProyectoDe} className="text-[clamp(0.95rem,2.2vmin,1.25rem)]" />
      </div>
      <div className="fixed bottom-3 left-3">
        <MixtleGuia alto="clamp(5rem,12vmin,8rem)" soloMientrasHabla />
      </div>
      {creando && <CrearGrupo alCerrar={() => setCreando(false)} />}
    </main>
  );
}

function CrearGrupo({ alCerrar }: { alCerrar: () => void }) {
  const crear = useGrupos((s) => s.crear);
  const alCamino = useApp((s) => s.alCamino);
  const [mascota, setMascota] = useState<IdMascota>(MASCOTAS[0].id);
  const [color, setColor] = useState<string>(COLORES_GRUPO[0]);
  const [etiqueta, setEtiqueta] = useState('');

  return (
    <Modal etiqueta={TEXTOS_APP.grupos.nuevo}>
      <h2 className="text-[clamp(1.6rem,4vmin,2.4rem)] font-black text-verde">{TEXTOS_APP.grupos.nuevo}</h2>
      {/* Cuadrícula pareja: 3 y 3. */}
      <div className="grid grid-cols-3 justify-items-center gap-3" role="radiogroup" aria-label="Animal del grupo">
        {MASCOTAS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mascota === m.id}
            aria-label={m.nombre}
            data-mascota={m.id}
            onClick={() => setMascota(m.id)}
            className={`flex w-[clamp(6.5rem,15vmin,9rem)] cursor-pointer flex-col items-center gap-1 rounded-2xl border-[5px] bg-white p-2 font-extrabold ${mascota === m.id ? 'border-verde ring-8 ring-verde/30' : 'border-white'}`}
          >
            <Arte clave={m.arte} className="h-[clamp(3.5rem,8vmin,5rem)] object-contain" />
            {m.nombre}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3" role="radiogroup" aria-label="Color del grupo">
        {COLORES_GRUPO.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={color === c}
            aria-label={`Color ${c}`}
            data-color={c}
            onClick={() => setColor(c)}
            className="grid size-16 cursor-pointer place-items-center rounded-full border-[5px] border-white shadow-md"
            style={{ backgroundColor: c }}
          >
            {/* El elegido lleva palomita: no se distingue solo por el color. */}
            {color === c && <Arte clave="palomita" className="size-9" />}
          </button>
        ))}
      </div>
      <label className="flex w-full flex-col gap-1 text-left font-extrabold">
        {TEXTOS_APP.grupos.etiqueta}
        <input
          value={etiqueta}
          maxLength={LARGO_ETIQUETA}
          onChange={(e) => setEtiqueta(limpiarEtiqueta(e.target.value))}
          className="h-16 rounded-2xl border-4 border-verde bg-white px-4 text-2xl font-black uppercase"
          autoComplete="off"
          spellCheck={false}
          name="etiqueta-grupo"
        />
      </label>
      <p className="w-full rounded-2xl border-4 border-naranja bg-white px-4 py-2 font-black text-naranja" role="note">
        ⚠ {TEXTOS_APP.grupos.aviso}
      </p>
      <div className="flex gap-4">
        <BotonGrande
          latir
          className="h-20 text-[clamp(1.4rem,3vmin,2rem)]"
          icono={<Arte clave="palomita" className="size-10" />}
          onClick={() => {
            crear({ mascota, color, etiqueta });
            alCamino();
          }}
        >
          {TEXTOS_APP.grupos.listo}
        </BotonGrande>
        <BotonGrande color="gris" className="h-20 text-[clamp(1.2rem,2.6vmin,1.7rem)]" onClick={alCerrar}>
          {TEXTOS_APP.grupos.cancelar}
        </BotonGrande>
      </div>
    </Modal>
  );
}
