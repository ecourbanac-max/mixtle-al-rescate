import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import '@fontsource/baloo-2/latin-800.css';
import './estilos.css';
import './animaciones.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { esMomentoSeguro, vigilarActualizaciones } from '../servicios/actualizacion';
import { destinosDeMudanza } from '../sitio';
import { vigilarAudio } from '../servicios/audio/motor';
import { activarDepuracionDeAudio, registrarAudio } from '../servicios/audio/registro';
import { pausarDescarga } from '../servicios/sinInternet';
import { vigilarRendimiento } from '../servicios/rendimiento';
import { exponerParaPruebas } from '../servicios/pruebas';
import { sonido } from '../servicios/sonido';
import { voz } from '../servicios/voz';
import { App } from './App';
import { useApp } from './estado/app';

// Mudanza de dirección (v3.2, ver src/servicios/mudanzaDefinitiva.ts): antes de pintar nada se atiende lo
// que traiga el fragmento de la URL (una mudanza que llega, o la confirmación de una que salió). Si la
// página se va a otra dirección, no se pinta el juego.
// Casi siempre no hay fragmento y el juego arranca en seguida (sin esperar nada: un "await" aquí partiría el
// código de la primera pantalla en muchos pedazos y pesaría más).
if (location.hash.startsWith('#mudanza=') || location.hash.startsWith('#paso=')) {
  void import('../servicios/mudanzaDefinitiva')
    .then((m) => m.atenderFragmento())
    .then((seVa) => {
    if (seVa) document.getElementById('app')!.textContent = 'Llevando sus grupos a la nueva dirección del juego…';
    else arrancar();
  });
} else {
  arrancar();
}

function arrancar(): void {
  exponerParaPruebas();
  // ?depurar-audio: registro de lo que pasa con la música y la voz (consola y recuadro en pantalla).
  if (new URLSearchParams(location.search).has('depurar-audio')) activarDepuracionDeAudio();
  // Si este equipo no sostiene las animaciones, se calman solas (ver servicios/rendimiento.ts).
  vigilarRendimiento(() => useApp.getState().suavizarPorRendimiento());
  void voz.cargarManifiesto();
  // El audio (y la música) empiezan en cuanto el navegador deja: al entrar si ya lo permite (visita de
  // regreso) o con el primer toque o tecla, sea donde sea. Cada toque o tecla también lo reanuda si el
  // navegador lo pausó (al salir de la app o bloquear la tablet).
  vigilarAudio();
  document.addEventListener('pointerdown', () => sonido.desbloquear(), { capture: true });
  // Al cambiar de pantalla, la descarga para jugar sin internet espera un momento: lo que pide la
  // pantalla nueva (su código, su voz) va primero.
  useApp.subscribe((s, antes) => {
    if (s.pantalla !== antes.pantalla) pausarDescarga();
  });
  document.addEventListener('keydown', () => sonido.desbloquear(), { capture: true });

  // Versión nueva publicada: la lista de audios se recarga ya (para que Mixtle use las voces nuevas) y la
  // página se recarga en cuanto está en una pantalla segura (inicio, grupos, camino, álbum), nunca a
  // media lección ni aventura. El avance está en IndexedDB. Ver servicios/actualizacion.ts.
  vigilarActualizaciones(() => {
    void voz.cargarManifiesto();
    registrarAudio('versión nueva: tomó el control (se recargará en una pantalla segura)');
    const recargar = () => {
      registrarAudio('recarga por versión nueva');
      window.location.reload();
    };
    if (esMomentoSeguro(useApp.getState().pantalla)) return recargar();
    const dejar = useApp.subscribe((s) => {
      if (!esMomentoSeguro(s.pantalla)) return;
      dejar();
      recargar();
    });
  });

  // La pantalla de carga de index.html ya cumplió: se quita del documento (oculta seguiría ahí, y su
  // logo define los mismos degradados que Mixtle; ver personajes.ts).
  window.requestAnimationFrame(() => document.getElementById('cargando')?.remove());
  createRoot(document.getElementById('app')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  // En una dirección vieja: revisa en segundo plano si la dirección definitiva ya sirve este juego (la lógica
  // de la mudanza solo se descarga ahí; en la dirección definitiva no pesa nada).
  if (destinosDeMudanza(location.hostname).length) void import('../servicios/mudanzaDefinitiva').then((m) => m.vigilarMudanza());
}
