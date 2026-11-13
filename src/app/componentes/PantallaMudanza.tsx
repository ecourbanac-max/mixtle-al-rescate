import { useEffect, useState } from 'react';
import { TEXTOS_MUDANZA, TEXTOS_RESPALDO } from '../../contenido/textosMudanza';
import { esMomentoSeguro } from '../../servicios/actualizacion';
import { instalar, mudarAhora, nombreDeDireccion, puedeInstalar, useMudanza } from '../../servicios/mudanzaDefinitiva';
import { useApp } from '../estado/app';
import { BotonGrande } from './BotonGrande';
import { MixtleFigura } from './MixtleFigura';
import { Modal } from './Modal';

/** Segundos antes de empezar sola la mudanza (el maestro puede tocar "Llevar los grupos" antes). */
const CUENTA_MUDANZA_S = 8;

/**
 * Las pantallas de la mudanza a la dirección definitiva (v3.2; ver src/servicios/mudanzaDefinitiva.ts):
 * en la dirección vieja, el aviso para el maestro, "Llevando…" y el reintento si algo falló; en la nueva,
 * la bienvenida (y cómo instalar otra vez la app). En la vieja solo aparecen en una pantalla segura
 * (inicio, grupos, camino, álbum): nunca a media lección ni aventura.
 */
export function PantallaMudanza() {
  const { estado, pospuesta } = useMudanza();
  const pantalla = useApp((s) => s.pantalla);
  const seguro = esMomentoSeguro(pantalla);

  if (estado.fase === 'llegaron') return <Bienvenida cuantos={estado.cuantos} renombrados={estado.renombrados} instalada={estado.instalada} />;
  if (!seguro) return null;
  if (estado.fase === 'disponible') {
    if (!estado.grupos.length) return <SinGrupos destino={estado.destino} />;
    return <Aviso destino={estado.destino} grupos={estado.grupos} />;
  }
  if (estado.fase === 'mudando') return <Llevando />;
  if (estado.fase === 'fallo' && !pospuesta) return <Fallo destino={estado.destino} />;
  return null;
}

/** Sin grupos en este aparato: directo a la dirección nueva. */
function SinGrupos({ destino }: { destino: string }) {
  useEffect(() => {
    void mudarAhora(destino);
  }, [destino]);
  return <Llevando />;
}

function Aviso({ destino, grupos }: { destino: string; grupos: string[] }) {
  const t = TEXTOS_MUDANZA;
  const [quedan, setQuedan] = useState(CUENTA_MUDANZA_S);
  useEffect(() => {
    if (quedan <= 0) {
      void mudarAhora(destino);
      return;
    }
    const reloj = window.setTimeout(() => setQuedan((s) => s - 1), 1000);
    return () => window.clearTimeout(reloj);
  }, [quedan, destino]);
  return (
    <Modal etiqueta={t.titulo(nombreDeDireccion(destino))}>
      <div data-mudanza="aviso" className="flex flex-col items-center gap-4">
        <MixtleFigura alto="clamp(6rem,18vmin,10rem)" expresion="saluda" />
        <h2 className="text-[clamp(1.5rem,3.8vmin,2.4rem)] leading-tight font-black text-verde">{t.titulo(nombreDeDireccion(destino))}</h2>
        <p className="text-[clamp(1.05rem,2.4vmin,1.4rem)] font-bold">{t.explicacion}</p>
        <div className="w-full rounded-2xl bg-white px-4 py-2 text-left font-bold">
          <p>{t.grupos(grupos.length)}</p>
          <p className="text-verde">{grupos.join(' · ')}</p>
        </div>
        <BotonGrande color="verde" latir className="h-16 text-[clamp(1.2rem,2.8vmin,1.7rem)]" onClick={() => void mudarAhora(destino)}>
          {t.llevar}
        </BotonGrande>
        <p className="text-sm font-bold opacity-70" aria-live="polite">
          {t.cuenta(Math.max(0, quedan))}
        </p>
      </div>
    </Modal>
  );
}

function Llevando() {
  return (
    <Modal etiqueta={TEXTOS_MUDANZA.llevando}>
      <div data-mudanza="llevando" className="flex flex-col items-center gap-4">
        <MixtleFigura alto="clamp(6rem,18vmin,10rem)" expresion="celebrando" />
        <p className="text-[clamp(1.3rem,3vmin,2rem)] font-black text-verde">{TEXTOS_MUDANZA.llevando}</p>
      </div>
    </Modal>
  );
}

function Fallo({ destino }: { destino: string }) {
  const t = TEXTOS_MUDANZA;
  return (
    <Modal etiqueta={t.falloTitulo}>
      <div data-mudanza="fallo" className="flex flex-col items-center gap-4">
        <MixtleFigura alto="clamp(6rem,18vmin,10rem)" expresion="pensando" />
        <h2 className="text-[clamp(1.4rem,3.4vmin,2.2rem)] leading-tight font-black text-verde">{t.falloTitulo}</h2>
        <p className="font-bold">{t.falloTexto}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <BotonGrande color="verde" className="h-16 text-lg" onClick={() => void mudarAhora(destino)}>
            {t.reintentar}
          </BotonGrande>
          <BotonGrande color="gris" className="h-16 text-lg" onClick={() => useMudanza.setState({ pospuesta: true })}>
            {t.ahoraNo}
          </BotonGrande>
        </div>
        <p className="text-sm font-bold opacity-80">{t.falloPlanB}</p>
      </div>
    </Modal>
  );
}

function Bienvenida({ cuantos, renombrados, instalada }: { cuantos: number; renombrados: { antes: string; despues: string }[]; instalada: boolean }) {
  const t = TEXTOS_MUDANZA;
  const [instalable, setInstalable] = useState(puedeInstalar);
  useEffect(() => {
    // Chrome puede dar el aviso de instalar un momento después de abrir.
    const reloj = window.setInterval(() => setInstalable(puedeInstalar()), 1000);
    return () => window.clearInterval(reloj);
  }, []);
  const cerrar = () => useMudanza.setState({ estado: { fase: 'dormida' } });
  return (
    <Modal
      etiqueta={t.llegaronTitulo(cuantos)}
      pie={
        <BotonGrande color="verde" className="h-16 w-full text-lg" onClick={cerrar}>
          {t.entendido}
        </BotonGrande>
      }
    >
      <div data-mudanza="llegaron" data-cuantos={cuantos} className="flex flex-col items-center gap-4">
        <MixtleFigura alto="clamp(6rem,18vmin,10rem)" expresion="celebrando" />
        <h2 className="text-[clamp(1.5rem,3.8vmin,2.4rem)] leading-tight font-black text-verde">{t.llegaronTitulo(cuantos)}</h2>
        <p className="font-bold">{t.llegaronTexto(location.host)}</p>
        {renombrados.length > 0 && (
          <ul className="w-full rounded-2xl bg-white px-4 py-2 text-left font-bold" data-mudanza-renombrados>
            {renombrados.map((r) => (
              <li key={r.despues}>{TEXTOS_RESPALDO.renombrado(r.antes, r.despues)}</li>
            ))}
          </ul>
        )}
        {instalada && (
          <div className="w-full rounded-2xl bg-white px-4 py-3 text-left" data-mudanza-instalar>
            <p className="font-black text-verde">{t.instalarTitulo}</p>
            <ol className="list-decimal pl-6 font-bold">
              {t.instalarPasos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
            {instalable && (
              <BotonGrande color="azul" className="mt-2 h-14 text-lg" onClick={() => void instalar().then(() => setInstalable(false))}>
                {t.instalar}
              </BotonGrande>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
