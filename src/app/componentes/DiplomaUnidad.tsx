import { MarcaEcoUrban } from './MarcaEcoUrban';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TEXTOS_APP } from '../../contenido/textosApp';
import type { DatosDiplomaUnidad } from '../../logica/diplomaUnidad';
import { Arte } from './Arte';
import { BotonGrande } from './BotonGrande';
import { Logo } from './Logo';
import { MascotaVestida } from './MascotaVestida';

interface Props {
  datos: DatosDiplomaUnidad;
  alCerrar: () => void;
}

/**
 * Diploma de fin de unidad para todo el grupo. Se ve en pantalla y se imprime en una hoja carta u
 * oficio horizontal (@media print en animaciones.css deja solo el diploma). Cuenta el esfuerzo del
 * grupo; no compara con nadie.
 */
export function DiplomaUnidad({ datos, alCerrar }: Props) {
  const t = TEXTOS_APP.diploma;
  // En la hoja impresa el título del documento es el nombre del archivo PDF sugerido.
  useEffect(() => {
    const antes = document.title;
    document.title = `Diploma ${datos.grupo} - Unidad ${datos.unidad.numero}`;
    return () => void (document.title = antes);
  }, [datos]);
  // En un portal: así no queda atrapado dentro de una ventana con transform (Modal) y se imprime solo.
  return createPortal(
    <div className="diploma-fondo fixed inset-0 z-[55] grid place-items-center overflow-auto bg-verde-oscuro/70 p-4" role="dialog" aria-modal="true" aria-label={`${t.titulo}: ${datos.grupo}`}>
      <div className="flex flex-col items-center gap-4">
        <article className="diploma-imprimible" style={{ ['--color-unidad' as string]: datos.unidad.color }} data-diploma-unidad={datos.unidad.numero}>
          <div className="diploma-borde">
            <Logo className="diploma-logo" />
            <h2 className="diploma-titulo">{t.titulo}</h2>
            <p className="diploma-para">{t.para}</p>
            <div className="diploma-grupo">
              <MascotaVestida mascota={datos.mascotaId} puestos={datos.puestos} className="diploma-mascota" />
              <span>{datos.grupo}</span>
            </div>
            <p className="diploma-porque">
              {t.porque} <b>{datos.unidad.numero}</b>: <b>{datos.unidad.titulo}</b>
            </p>
            <p className="diploma-tema">{datos.unidad.tema}</p>
            <div className="diploma-cifras">
              <div>
                <b>{datos.lecciones}</b>
                <span>{t.lecciones(datos.lecciones)}</span>
              </div>
              <div>
                <b>
                  <Arte clave="hojita" className="diploma-hojita" />
                  {datos.hojitas}
                </b>
                <span>{t.hojitas}</span>
              </div>
              <div>
                <b>{datos.aLaPrimera}</b>
                <span>{t.aLaPrimera}</span>
              </div>
              <div className="diploma-estampa">
                <Arte clave={datos.estampa.arte} />
                <span>{datos.estampa.nombre}</span>
              </div>
            </div>
            <div className="diploma-pie">
              <span>{datos.fecha}</span>
              <MarcaEcoUrban alto="2.2cqi" className="diploma-marca" />
              <span className="diploma-firma">
                <Arte clave="mixtle-entero-feliz" className="diploma-firma-mixtle" />
                {t.firma}
              </span>
            </div>
          </div>
        </article>
        <div className="diploma-botones flex gap-4">
          <BotonGrande color="verde" className="h-16 px-8 text-[clamp(1.2rem,2.6vmin,1.7rem)]" icono={<span aria-hidden="true">🖨</span>} onClick={() => window.print()}>
            {t.imprimir}
          </BotonGrande>
          <BotonGrande color="gris" className="h-16 px-8 text-[clamp(1.2rem,2.6vmin,1.7rem)]" onClick={alCerrar}>
            {t.cerrar}
          </BotonGrande>
        </div>
      </div>
    </div>,
    document.body,
  );
}
