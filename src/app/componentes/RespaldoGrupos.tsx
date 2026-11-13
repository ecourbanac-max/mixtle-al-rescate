import { useRef, useState } from 'react';
import { TEXTOS_RESPALDO as T } from '../../contenido/textosMudanza';
import { gruposValidos, nombreDelGrupo, type Grupo } from '../../logica/grupos';
import { extrasIndexedDb } from '../../servicios/almacen';
import { CLAVE_MUDADOS } from '../../servicios/mudanzaDefinitiva';
import { crearRespaldo, descargarRespaldo, leerRespaldo, TAMANO_MAXIMO_RESPALDO } from '../../servicios/respaldo';
import { useGrupos } from '../estado/grupos';
import { BotonGrande } from './BotonGrande';

/**
 * Plan B de la mudanza (v3.2): "Exportar grupos" guarda todos los grupos de este aparato en un archivo;
 * "Importar grupos" los agrega en otro aparato o dirección. El archivo se valida por completo antes de
 * tocar nada y se pide confirmación; los grupos que llegan nunca sobrescriben a los que hay (ver
 * juntarGrupos). Funciona sin internet.
 */
export function RespaldoGrupos() {
  const { grupos, importar } = useGrupos();
  const entrada = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<string[]>([]);
  const [porImportar, setPorImportar] = useState<Grupo[] | null>(null);

  const exportar = async () => {
    let yaMudados: Grupo[] = [];
    try {
      yaMudados = gruposValidos(((await extrasIndexedDb.leer(CLAVE_MUDADOS)) as { grupos?: unknown } | undefined)?.grupos);
    } catch {
      // Sin almacenamiento: solo los grupos que están en memoria.
    }
    const r = crearRespaldo(grupos, yaMudados);
    if (!r.grupos.length) {
      setMensaje([T.sinGrupos]);
      return;
    }
    descargarRespaldo(r);
    setMensaje([T.exportados(r.grupos.length)]);
  };

  const elegirArchivo = async (archivo: File | undefined) => {
    setPorImportar(null);
    if (!archivo) return;
    setMensaje([T.revisando]);
    const llegan = archivo.size <= TAMANO_MAXIMO_RESPALDO ? leerRespaldo(await archivo.text()) : null;
    if (!llegan?.length) {
      setMensaje([T.invalido]);
      return;
    }
    setMensaje([]);
    setPorImportar(llegan);
  };

  const confirmar = () => {
    if (!porImportar) return;
    const r = importar(porImportar);
    setPorImportar(null);
    // Nuevos y repetidos por separado: importar dos veces el mismo archivo no "agrega" nada.
    setMensaje([...(r.agregados.length ? [T.importados(r.agregados.length)] : []), ...(r.yaEstaban.length ? [T.yaEstaban(r.yaEstaban.length)] : []), ...r.renombrados.map((x) => T.renombrado(x.antes, x.despues))]);
  };

  return (
    <section className="flex w-full flex-col gap-2 rounded-2xl bg-white p-4 text-left" data-respaldo>
      <h3 className="text-[clamp(1.1rem,2.4vmin,1.5rem)] font-black text-verde">{T.titulo}</h3>
      <p className="font-bold">{T.ayuda}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <BotonGrande color="azul" className="h-14 text-lg" onClick={() => void exportar()}>
          {T.exportar}
        </BotonGrande>
        <BotonGrande color="verde" className="h-14 text-lg" onClick={() => entrada.current?.click()}>
          {T.importar}
        </BotonGrande>
        <input
          ref={entrada}
          type="file"
          accept=".json,application/json"
          className="hidden"
          data-respaldo-archivo
          onChange={(e) => {
            void elegirArchivo(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {porImportar && (
        <div className="flex flex-col gap-2 rounded-xl bg-verde-claro p-3" data-respaldo-confirmar>
          <p className="font-black">{T.confirmar(porImportar.length)}</p>
          <p className="font-bold text-verde">{porImportar.map((g) => nombreDelGrupo(g)).join(' · ')}</p>
          <div className="flex flex-wrap gap-3">
            <BotonGrande color="verde" className="h-14 text-lg" onClick={confirmar}>
              {T.confirmarSi}
            </BotonGrande>
            <BotonGrande color="gris" className="h-14 text-lg" onClick={() => setPorImportar(null)}>
              {T.confirmarNo}
            </BotonGrande>
          </div>
        </div>
      )}
      {mensaje.length > 0 && (
        <div className="font-bold" role="status" data-respaldo-mensaje>
          {mensaje.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      )}
    </section>
  );
}
