import { Howl, Howler } from 'howler';
import { piezasDeTexto, type Locucion } from '../voz/locucion';
import { PAUSA_ENTRE_PIEZAS_MS, planDeLocucion, type Manifiesto } from '../voz/plan';
import { hayAudio, musica, rutaAudio } from './audio/motor';
import { elegirVoz, estimarDuracion } from './eleccionVoz';
import { estadoSonido } from './estadoSonido';

const VELOCIDAD_NAVEGADOR = 0.9;
const TONO_NAVEGADOR = 1.1;
/** Cuántos audios de frases se guardan decodificados en memoria (laptop de 8 GB, tablets). */
const MAXIMO_EN_MEMORIA = 40;

/**
 * La voz de Mixtle.
 * 1. Audios pregenerados (public/voz/<hash>.mp3, ver npm run voz:generar) o grabaciones humanas
 *    con los mismos nombres. Las frases con números se arman encadenando piezas.
 * 2. Si a una frase le falta su audio, se usa la voz del navegador (Web Speech API) y en
 *    desarrollo se avisa en la consola.
 * Mientras Mixtle habla, la música baja. Nada de esto rompe el juego si no hay audio.
 */
class Voz {
  private manifiesto: Manifiesto | null = null;
  private vozNavegador: SpeechSynthesisVoice | null = null;
  private ultimo: Locucion = '';
  private turno = 0;
  private agachada = false;
  private sonando: Howl | null = null;
  private cache = new Map<string, Howl>();
  /** Cuántas frases se dijeron con audio grabado y cuántas con la voz del navegador (para las pruebas). */
  readonly cuenta = { conAudio: 0, conNavegador: 0 };

  constructor() {
    const s = this.sintesis();
    if (s) {
      this.cargarVocesNavegador();
      s.addEventListener?.('voiceschanged', () => this.cargarVocesNavegador());
    }
    estadoSonido.escuchar((activo) => {
      if (!activo) this.callar();
    });
  }

  private manifiestoListo: Promise<void> | null = null;

  /** Carga public/voz/manifiesto.json. Sin manifiesto, todo se dice con la voz del navegador. */
  cargarManifiesto(): Promise<void> {
    this.manifiestoListo = (async () => {
      try {
        // Siempre la lista más nueva (sin la caché HTTP); sin internet, el service worker da la guardada.
        const r = await fetch(rutaAudio('voz/manifiesto.json'), { cache: 'no-cache' });
        if (r.ok) this.manifiesto = (await r.json()) as Manifiesto;
      } catch {
        this.manifiesto = null;
      }
    })();
    return this.manifiestoListo;
  }

  /**
   * Adelanta la descarga de lo que Mixtle va a decir pronto (por ejemplo, "¡Al rescate!" mientras se
   * ve el inicio), para que suene a tiempo aunque la red sea lenta.
   */
  async precargar(locuciones: readonly Locucion[]): Promise<void> {
    await this.manifiestoListo;
    if (!hayAudio()) return;
    for (const l of locuciones) for (const a of planDeLocucion(l, this.manifiesto).archivos ?? []) this.howl(a);
  }

  /** Para pruebas: usar un manifiesto dado. */
  usarManifiesto(m: Manifiesto | null): void {
    this.manifiesto = m;
  }

  /** ¿Se está oyendo un audio de Mixtle ahora mismo? (no cuenta la espera a que baje) */
  get sonandoAhora(): boolean {
    try {
      return !!this.sonando?.playing();
    } catch {
      return false;
    }
  }

  /** Algunos navegadores (Safari en iPad) solo permiten hablar si la primera vez ocurre dentro de un toque. */
  desbloquear(): void {
    const s = this.sintesis();
    if (!s) return;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      s.speak(u);
    } catch {
      // Sin voz no se rompe nada.
    }
  }

  /**
   * Mixtle dice algo. Devuelve la duración (real si hay audio, estimada si no), útil para animar a Mixtle.
   * `alTerminar` se llama al acabar; si otra frase interrumpe a esta, ya no se llama.
   * Con `esperaMaximaMs`, si el audio no está listo para entonces, la frase no se dice tarde: se
   * termina (queda el subtítulo). Sin ella, a los 2 s empieza con lo que haya bajado.
   * `alSonar` se llama cuando el audio de verdad empieza a oírse (no si está apagado, bloqueado o no carga).
   * Lo usa servicios/dialogo.ts, el único que le habla a la voz.
   */
  decir(locucion: Locucion, alTerminar?: () => void, op: { esperaMaximaMs?: number; alSonar?: () => void } = {}): number {
    this.ultimo = locucion;
    const plan = planDeLocucion(locucion, this.manifiesto);
    const hablado = piezasDeTexto(locucion).join(' ');
    const conAudio = !!plan.archivos && hayAudio();
    const ms = conAudio ? plan.ms : estimarDuracion(hablado, VELOCIDAD_NAVEGADOR);

    this.callar();
    const miTurno = ++this.turno;
    let terminado = false;
    const terminar = () => {
      if (terminado || miTurno !== this.turno) return;
      terminado = true;
      this.soltarMusica();
      alTerminar?.();
    };
    // Respaldo: nunca dejamos el juego esperando a una voz que no llega. Se cuenta desde que la frase
    // EMPIEZA a sonar (no desde que se pidió): si el audio tardó en bajar, no se corta antes de acabar.
    const respaldo = () => window.setTimeout(terminar, ms + 1500);

    if (!estadoSonido.estaActivo) {
      window.setTimeout(terminar, ms);
      return ms;
    }
    musica.agachar();
    this.agachada = true;

    if (conAudio) {
      this.cuenta.conAudio += 1;
      this.reproducirCadena(plan.archivos!, miTurno, terminar, op.esperaMaximaMs, respaldo, op.alSonar);
    } else {
      this.cuenta.conNavegador += 1;
      if (import.meta.env.DEV && plan.faltantes.length) {
        console.warn('[voz] Sin audio, se usa la voz del navegador para:', plan.faltantes, '→ npm run voz:generar');
      }
      respaldo();
      this.hablarConNavegador(hablado, terminar, () => {
        if (miTurno === this.turno) op.alSonar?.();
      });
    }
    return ms;
  }

  repetir(alTerminar?: () => void): number {
    return this.ultimo ? this.decir(this.ultimo, alTerminar) : 0;
  }

  callar(): void {
    this.turno += 1;
    try {
      this.sonando?.stop();
      this.sintesis()?.cancel();
    } catch {
      // Ignorar.
    }
    this.sonando = null;
    this.soltarMusica();
  }

  private soltarMusica(): void {
    if (!this.agachada) return;
    this.agachada = false;
    musica.levantar();
  }

  private howl(archivo: string): Howl {
    let h = this.cache.get(archivo);
    if (h) {
      // Lo más reciente va al final (para descartar primero lo menos usado).
      this.cache.delete(archivo);
      this.cache.set(archivo, h);
      return h;
    }
    h = new Howl({ src: [rutaAudio(`voz/${archivo}`)], preload: true });
    this.cache.set(archivo, h);
    if (this.cache.size > MAXIMO_EN_MEMORIA) {
      const [masViejo, howl] = this.cache.entries().next().value as [string, Howl];
      if (howl !== this.sonando) howl.unload();
      this.cache.delete(masViejo);
    }
    return h;
  }

  private reproducirCadena(archivos: string[], turno: number, terminar: () => void, esperaMaximaMs: number | undefined, respaldo: () => void, alSonar?: () => void): void {
    // Todas las piezas se cargan ANTES de empezar a hablar: así no hay tropiezos entre una y otra
    // esperando a que baje el siguiente audio (con un tope de 2 s para no quedarse callado).
    const howls = archivos.map((a) => this.howl(a));
    let listo = false;
    const empezar = () => {
      if (listo || turno !== this.turno) return;
      listo = true;
      respaldo();
      siguiente(0);
    };
    const revisar = () => {
      if (howls.every((h) => h.state() !== 'loading')) empezar();
    };
    for (const h of howls) {
      if (h.state() === 'loading') {
        h.once('load', revisar);
        h.once('loaderror', revisar);
      }
    }
    if (esperaMaximaMs === undefined) window.setTimeout(empezar, 2000);
    else
      window.setTimeout(() => {
        // No llegó a tiempo: mejor no decirla tarde (la pantalla ya siguió); queda el subtítulo.
        if (listo || turno !== this.turno) return;
        listo = true;
        this.sonando = null;
        terminar();
      }, esperaMaximaMs);

    const siguiente = (i: number) => {
      if (turno !== this.turno) return;
      if (i >= archivos.length) {
        this.sonando = null;
        terminar();
        return;
      }
      const h = this.howl(archivos[i]!);
      this.sonando = h;
      // Solo cuenta como "se oyó" si el audio del navegador está corriendo (no suspendido o bloqueado).
      if (i === 0 && alSonar)
        h.once('play', () => {
          if (turno === this.turno && audioCorriendo()) alSonar();
        });
      h.once('end', () => window.setTimeout(() => siguiente(i + 1), PAUSA_ENTRE_PIEZAS_MS));
      // Si un audio no carga, se sigue con lo demás en vez de quedarse callado para siempre.
      h.once('loaderror', () => siguiente(i + 1));
      h.once('playerror', () => siguiente(i + 1));
      h.play();
    };
    revisar();
  }

  private hablarConNavegador(texto: string, terminar: () => void, alSonar: () => void): void {
    const s = this.sintesis();
    if (!s) return;
    try {
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = this.vozNavegador?.lang ?? 'es-MX';
      if (this.vozNavegador) u.voice = this.vozNavegador;
      u.rate = VELOCIDAD_NAVEGADOR;
      u.pitch = TONO_NAVEGADOR;
      u.onstart = alSonar;
      u.onend = terminar;
      u.onerror = terminar;
      s.speak(u);
      // Chrome a veces deja la síntesis en pausa.
      if (s.paused) s.resume();
    } catch {
      // El temporizador de respaldo terminará la frase.
    }
  }

  private cargarVocesNavegador(): void {
    try {
      this.vozNavegador = elegirVoz(this.sintesis()?.getVoices() ?? []);
    } catch {
      this.vozNavegador = null;
    }
  }

  private sintesis(): SpeechSynthesis | null {
    try {
      return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    } catch {
      return null;
    }
  }
}

/** ¿El audio de Howler se oye? (Si su contexto sigue suspendido, el navegador lo tiene bloqueado.) */
function audioCorriendo(): boolean {
  try {
    const ctx = Howler.ctx as AudioContext | undefined;
    return !ctx || ctx.state === 'running';
  } catch {
    return true;
  }
}

export const voz = new Voz();
