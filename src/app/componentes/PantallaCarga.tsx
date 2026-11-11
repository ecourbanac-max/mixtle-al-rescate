import { Logo } from './Logo';
import { MarcaEcoUrban } from './MarcaEcoUrban';

/**
 * Pantalla de carga con la marca: el logo con el lema y tres hojitas que brincan. Es la misma que
 * pinta index.html antes de que llegue el código; aquí la usa React mientras baja una pantalla.
 */
export function PantallaCarga() {
  return (
    <div className="pantalla-carga" role="status" aria-live="polite">
      <Logo className="pantalla-carga-logo" />
      <MarcaEcoUrban esquina="abajo-derecha" />
      <div className="pantalla-carga-hojas" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
