import { useCallback, useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { cargarAventura } from '../../aventuras';
import { TEXTOS_APP } from '../../contenido/textosApp';
import { unidadPorId } from '../../contenido/unidades';
import { musica } from '../../servicios/audio/motor';
import { BotonGrande } from '../componentes/BotonGrande';
import { MixtleGuia } from '../componentes/MixtleGuia';
import { Modal } from '../componentes/Modal';
import { useApp } from '../estado/app';
import { useGrupos } from '../estado/grupos';
import { callar, decir } from '../estado/narrador';

/** Phaser dibuja texto en un lienzo: hay que esperar a que la fuente Nunito esté lista. */
async function prepararFuentes(): Promise<void> {
  try {
    const fuentes = document.fonts;
    if (!fuentes) return;
    await Promise.race([
      Promise.all(['700 48px Nunito', '800 48px Nunito', '900 48px Nunito'].map((f) => fuentes.load(f))),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch {
    // Sin la fuente se usa la del sistema; el juego sigue igual.
  }
}

/**
 * Monta la aventura (minijuego de Phaser) de una unidad dentro de React. Phaser se descarga aquí
 * (no al abrir la app) y se destruye al salir. Al terminarla, el grupo gana la estampa de la unidad.
 */
export function Aventura() {
  const contenedor = useRef<HTMLDivElement>(null);
  const { escenaInicial, unidadId, volverAlInicio, alCamino } = useApp();
  const [preguntaSalir, setPreguntaSalir] = useState(false);

  const terminar = useCallback(() => {
    const unidad = unidadId ? unidadPorId(unidadId) : undefined;
    const { grupos, actualId, terminarAventura } = useGrupos.getState();
    const grupo = grupos.find((g) => g.id === actualId);
    if (!unidad || !grupo) return volverAlInicio();
    const estampaNueva = !grupo.progreso.estampas.includes(unidad.estampa.id);
    terminarAventura(unidad);
    alCamino(estampaNueva ? unidad.estampa.id : undefined);
  }, [unidadId, volverAlInicio, alCamino]);

  useEffect(() => musica.poner('lecciones'), []);

  useEffect(() => {
    let juego: Phaser.Game | null = null;
    let cancelado = false;
    void (async () => {
      await prepararFuentes();
      const crear = await cargarAventura(escenaInicial === 'Galeria' ? 'u1' : (unidadId ?? 'u1'));
      if (cancelado || !contenedor.current || !crear) return;
      juego = crear(contenedor.current, { escenaInicial, alTerminar: terminar });
    })();
    return () => {
      cancelado = true;
      juego?.destroy(true);
    };
  }, [escenaInicial, unidadId, terminar]);

  const hayGrupo = useGrupos((s) => !!s.actualId);
  return (
    <div className="relative h-full w-full">
      <div data-pantalla="aventura" ref={contenedor} className="h-full w-full bg-verde-oscuro" />
      {hayGrupo && (
        <div className="absolute top-3 left-3 z-10">
          <BotonGrande
            color="gris"
            etiqueta={TEXTOS_APP.leccion.salir}
            className="size-[clamp(3.5rem,8vmin,5rem)] opacity-90"
            icono={<span className="text-[clamp(1.8rem,4vmin,3rem)] leading-none">✕</span>}
            onClick={() => {
              setPreguntaSalir(true);
              decir(TEXTOS_APP.leccion.salirPregunta, { expresion: 'sorprendido', interrumpir: true });
            }}
          />
        </div>
      )}
      {preguntaSalir && (
        <Modal etiqueta={TEXTOS_APP.leccion.salir}>
          <MixtleGuia alto="clamp(6rem,16vmin,10rem)" />
          <div className="flex flex-wrap justify-center gap-4">
            <BotonGrande color="verde" latir className="h-20 text-[clamp(1.3rem,3vmin,2rem)]" onClick={() => setPreguntaSalir(false)}>
              {TEXTOS_APP.leccion.salirNo}
            </BotonGrande>
            <BotonGrande
              color="gris"
              className="h-20 text-[clamp(1.3rem,3vmin,2rem)]"
              onClick={() => {
                callar();
                alCamino();
              }}
            >
              {TEXTOS_APP.leccion.salirSi}
            </BotonGrande>
          </div>
        </Modal>
      )}
    </div>
  );
}
