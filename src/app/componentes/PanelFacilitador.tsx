import { useState } from 'react';
import { TEXTOS_APP } from '../../contenido/textosApp';
import { nombreDelGrupo, type Grupo } from '../../logica/grupos';
import { useApp } from '../estado/app';
import { porcentaje, useDescargaSinInternet } from '../../servicios/sinInternet';
import { useGrupos } from '../estado/grupos';
import { BotonGrande } from './BotonGrande';
import { Modal } from './Modal';
import { RespaldoGrupos } from './RespaldoGrupos';

/**
 * Modo facilitador (para la persona de Eco Urban o el maestro): reiniciar el grupo, abrir todas las
 * lecciones para saltar a una, y el modo proyector. Se abre manteniendo presionado el logo 3 segundos.
 *
 * Cabe en la tablet (1024×768) sin desplazarse: filas compactas y los dos botones de "enseñar el juego"
 * lado a lado. Si aun así no cabe (una ventana baja, la confirmación abierta), el contenido se desplaza
 * y "Cerrar" se queda siempre a la vista en el pie de la ventana (revisión del 30 de octubre de 2026).
 */
export function PanelFacilitador({ grupo, alCerrar, alRecorrido }: { grupo: Grupo; alCerrar: () => void; alRecorrido: () => void }) {
  const { reiniciar, desbloquearTodo, crearDemo, borrar } = useGrupos();
  const { proyector, alternarProyector, suave, alternarSuave } = useApp();
  /** Qué acción está pidiendo confirmación (reiniciar o borrar el grupo). */
  const [confirmar, setConfirmar] = useState<'reiniciar' | 'borrar' | null>(null);
  const t = TEXTOS_APP.facilitador;
  const texto = 'text-[clamp(1.05rem,2.2vmin,1.4rem)]';
  const fila = `flex w-full items-center justify-between gap-4 rounded-2xl bg-white px-5 py-2.5 text-left ${texto} font-extrabold`;
  const boton = `h-16 ${texto} leading-tight`;

  return (
    <Modal
      etiqueta={t.titulo}
      pie={
        <BotonGrande color="verde" className={`w-full ${boton}`} onClick={alCerrar}>
          {t.cerrar}
        </BotonGrande>
      }
    >
      <div className="flex flex-col items-center">
        <h2 className="text-[clamp(1.5rem,3.6vmin,2.2rem)] leading-tight font-black text-verde">{t.titulo}</h2>
        <p className="font-bold">{nombreDelGrupo(grupo)}</p>
      </div>
      <div className="flex w-full flex-col gap-2.5">
        <label className={fila}>
          {t.desbloquear}
          <input type="checkbox" className="size-9 shrink-0 accent-verde" checked={grupo.desbloquearTodo} onChange={(e) => desbloquearTodo(grupo.id, e.target.checked)} />
        </label>
        <label className={fila}>
          {t.proyector}
          <input type="checkbox" className="size-9 shrink-0 accent-verde" checked={proyector} onChange={alternarProyector} />
        </label>
        <label className={fila}>
          {t.suave}
          <input type="checkbox" className="size-9 shrink-0 accent-verde" checked={suave} onChange={alternarSuave} />
        </label>
        <EstadoSinInternet />
      </div>
      {/* Plan B de la mudanza (v3.2): pasar todos los grupos a otro aparato o dirección con un archivo. */}
      <RespaldoGrupos />
      {/* Para enseñar el juego: el recorrido guiado otra vez, y un grupo de demostración (queda elegido). */}
      <div className="flex w-full flex-col gap-2">
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <BotonGrande color="azul" className={boton} onClick={alRecorrido}>
            {t.recorrido}
          </BotonGrande>
          <BotonGrande
            color="morado"
            className={boton}
            onClick={() => {
              crearDemo();
              alCerrar();
            }}
          >
            {t.demo}
          </BotonGrande>
        </div>
        <p className="text-[clamp(0.9rem,1.8vmin,1.1rem)] leading-snug font-bold opacity-80">{t.demoAyuda}</p>
      </div>
      {confirmar ? (
        <div className="flex w-full flex-col items-center gap-3 rounded-2xl border-4 border-naranja bg-white p-4" data-confirmar={confirmar}>
          <p className="font-bold">{confirmar === 'borrar' ? t.borrarConfirmar : t.reiniciarConfirmar}</p>
          <div className="flex gap-3">
            <BotonGrande
              color="naranja"
              className="h-16 text-lg"
              onClick={() => {
                if (confirmar === 'borrar') {
                  borrar(grupo.id);
                  alCerrar();
                } else reiniciar(grupo.id);
                setConfirmar(null);
              }}
            >
              {confirmar === 'borrar' ? t.borrar : t.reiniciar}
            </BotonGrande>
            <BotonGrande color="gris" className="h-16 text-lg" onClick={() => setConfirmar(null)}>
              {TEXTOS_APP.grupos.cancelar}
            </BotonGrande>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          <BotonGrande color="naranja" className={boton} onClick={() => setConfirmar('reiniciar')}>
            {t.reiniciar}
          </BotonGrande>
          {/* Borrar vale para cualquier grupo (también el de demostración). */}
          <BotonGrande color="gris" className={boton} onClick={() => setConfirmar('borrar')}>
            {t.borrar}
          </BotonGrande>
        </div>
      )}
    </Modal>
  );
}

/** ¿Ya se puede usar sin internet? Y si no, cuánto va de la descarga (voces, música y efectos). */
function EstadoSinInternet() {
  const descarga = useDescargaSinInternet();
  const t = TEXTOS_APP.facilitador.sinInternet;
  const n = porcentaje(descarga);
  const texto =
    descarga.fase === 'listo' ? t.listo : descarga.fase === 'descargando' ? t.descargando(n) : descarga.fase === 'sin-conexion' ? t.sinConexion(n) : descarga.fase === 'no-disponible' ? t.noDisponible : t.esperando;
  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl bg-white px-5 py-2.5 text-left" role="status" data-sin-internet={descarga.fase}>
      <p className="text-[clamp(1rem,2.1vmin,1.3rem)] leading-snug font-extrabold">{texto}</p>
      {descarga.fase !== 'listo' && descarga.bytesTotales > 0 && (
        <div className="h-3 overflow-hidden rounded-full bg-verde/15" aria-hidden="true">
          <div className="h-full rounded-full bg-verde" style={{ width: `${n}%` }} />
        </div>
      )}
    </div>
  );
}
