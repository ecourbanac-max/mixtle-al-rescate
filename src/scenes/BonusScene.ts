import Phaser from 'phaser';
import { ANCHO } from '../config';
import { claveImagenResiduo } from '../arte/residuos';
import { BASURAS_BONUS } from '../aventuras/datos';
import { CATEGORIAS } from '../data/categorias';
import { RESIDUOS, type Residuo } from '../data/residuos';
import { TEXTOS } from '../data/textos';
import { categoriaDe, esCorrecto, textoAcierto, textoPista } from '../logica/clasificacion';
import { enFila } from '../logica/disposicion';
import { escenaSiguiente } from '../logica/flujo';
import { caeBasura, eligeBote, llegaAlSuelo, LLUVIA_INICIAL, vuelveACaer, type EstadoLluvia } from '../logica/lluvia';
import { progreso } from '../logica/progreso';
import { crearAleatorio } from '../logica/reparto';
import { sonido } from '../servicios/sonido';
import { Bote } from '../ui/Bote';
import { agregarBotonSonido } from '../ui/BotonSonido';
import { Mixtle } from '../ui/Mixtle';
import { botonSiguiente, chispas, confeti } from '../ui/efectos';
import { agregarParque } from '../ui/fondo';
import { MIXTLE_NIVEL } from '../ui/layoutParque';
import { Narrador } from '../ui/Narrador';
import { entrar, irA } from '../ui/transicion';

const BOTES = { desde: 560, hasta: 1880, yBase: 975, anchoMaximo: 290 };
/**
 * Dónde empieza y termina la caída. Empieza ya DENTRO de lo que se ve (antes salía de fuera, arriba, y en un
 * celular acostado solo se veía una orilla mientras Mixtle preguntaba a qué bote va): con 200 px y meciéndose
 * ±10°, su orilla de arriba queda a ~75 px del borde.
 */
const CAIDA = { x: 1220, desde: 190, hasta: 600 };
/** Tarda en caer: tranquilo, para que el grupo se ponga de acuerdo. */
const DURACION_CAIDA_MS = 9000;
const TAMANO = 200;

/**
 * Bonus "Lluvia de basura": cae una basura a la vez y el grupo toca el bote correcto antes
 * de que llegue al suelo. Si llega, no pasa nada: vuelve a subir y cae otra vez. Nunca hay castigo.
 */
export class BonusScene extends Phaser.Scene {
  private mixtle!: Mixtle;
  private narrador!: Narrador;
  private cola: Residuo[] = [];
  private actual: { residuo: Residuo; imagen: Phaser.GameObjects.Image; caida: Phaser.Tweens.Tween | null } | null = null;
  /** Qué responde y qué no (logica/lluvia.ts, con sus pruebas). */
  private estado: EstadoLluvia = LLUVIA_INICIAL;
  private aciertos = 0;

  constructor() {
    super('Bonus');
  }

  create(): void {
    entrar(this);
    this.actual = null;
    this.estado = LLUVIA_INICIAL;
    this.aciertos = 0;
    // Cinco basuras distintas, en otro orden cada vez.
    const azar = crearAleatorio(Date.now());
    this.cola = [...RESIDUOS.filter((r) => categoriaDe(r, CATEGORIAS))].sort(() => azar() - 0.5).slice(0, BASURAS_BONUS);

    agregarParque(this);
    this.add.rectangle(ANCHO / 2, 540, ANCHO, 1080, 0xffffff, 0.22).setDepth(-50);
    this.mixtle = new Mixtle(this, MIXTLE_NIVEL.x, MIXTLE_NIVEL.y, MIXTLE_NIVEL.escala).setDepth(30);
    this.narrador = new Narrador(this, this.mixtle, { x: 40, y: 280, ancho: 780, apuntaA: { x: 230, y: 900 }, tamanoTexto: 44 });
    this.crearBotes();
    agregarBotonSonido(this);
    this.time.delayedCall(450, () => this.narrador.decir(TEXTOS.bonus.bienvenida, () => this.siguiente()));
  }

  private crearBotes(): void {
    const fila = enFila(CATEGORIAS.length, BOTES.desde, BOTES.hasta, BOTES.anchoMaximo);
    CATEGORIAS.forEach((c, i) => {
      const bote = new Bote(this, fila.xs[i]!, BOTES.yBase, c, fila.ancho).setDepth(20);
      bote.on('pointerup', () => this.elegir(bote));
    });
  }

  private siguiente(): void {
    const residuo = this.cola.shift();
    if (!residuo) {
      this.terminar();
      return;
    }
    const imagen = this.add.image(CAIDA.x, CAIDA.desde, claveImagenResiduo(residuo.imagen)).setDepth(700);
    imagen.setScale(TAMANO / Math.max(imagen.width, imagen.height));
    // Tocar la basura repite la pregunta.
    imagen.setInteractive({ useHandCursor: true }).setName(`cae-${residuo.id}`);
    imagen.on('pointerdown', () => this.narrador.decir(TEXTOS.nivel2.pregunta(residuo.nombre)));
    this.actual = { residuo, imagen, caida: null };
    this.narrador.decir(TEXTOS.nivel2.pregunta(residuo.nombre));
    this.caer();
  }

  /** Cae despacio, meciéndose como una hoja. */
  private caer(): void {
    const actual = this.actual;
    if (!actual) return;
    const { imagen } = actual;
    this.estado = caeBasura(actual.residuo.id);
    imagen.setPosition(CAIDA.x, CAIDA.desde);
    // Aparece en su lugar (no de golpe): crece desde chiquito.
    const escala = TAMANO / Math.max(imagen.width, imagen.height);
    imagen.setScale(escala * 0.3);
    this.tweens.add({ targets: imagen, scale: escala, duration: 350, ease: 'Back.easeOut' });
    this.tweens.add({ targets: imagen, angle: { from: -10, to: 10 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    actual.caida = this.tweens.add({
      targets: imagen,
      y: CAIDA.hasta,
      duration: DURACION_CAIDA_MS,
      ease: 'Sine.easeIn',
      onComplete: () => this.llegoAlSuelo(),
    });
  }

  /**
   * Llegó al suelo sin que se eligiera bote: no pasa nada. Mientras Mixtle lo dice, los botes siguen
   * respondiendo (un toque en ese momento cuenta); si nadie elige, la basura vuelve a caer.
   */
  private llegoAlSuelo(): void {
    const actual = this.actual;
    const antes = this.estado;
    this.estado = llegaAlSuelo(antes);
    if (!actual || this.estado === antes) return;
    sonido.tocar('toque');
    this.tweens.killTweensOf(actual.imagen);
    this.narrador.decir(TEXTOS.bonus.seCayo, () => {
      if (this.actual === actual && vuelveACaer(this.estado, actual.residuo.id)) this.caer();
    });
  }

  private elegir(bote: Bote): void {
    const actual = this.actual;
    if (!actual) return;
    const { residuo, imagen } = actual;
    const r = eligeBote(this.estado, esCorrecto(residuo, bote.categoria.id, CATEGORIAS));
    this.estado = r.estado;
    if (r.efecto === 'nada') return;
    if (r.efecto === 'pista') {
      bote.sacudir();
      sonido.tocar('otraVez');
      // La pista no detiene la caída (ni la frase del suelo); si llega al suelo, vuelve a empezar.
      this.narrador.decir(textoPista(categoriaDe(residuo, CATEGORIAS)!));
      return;
    }
    this.actual = null;
    this.tweens.killTweensOf(imagen);
    imagen.disableInteractive();
    progreso().separarEnBonus(`lluvia-${residuo.id}`);
    this.registry.set('marcador', { bonus: progreso().separadosBonus.size });
    bote.abrir();
    const boca = bote.boca;
    this.tweens.add({
      targets: imagen,
      x: boca.x,
      y: boca.y - 60,
      angle: 0,
      scale: imagen.scale * 0.45,
      duration: 380,
      ease: 'Quad.easeIn',
      onComplete: () => {
        imagen.destroy();
        bote.celebrar();
        sonido.tocar('acierto');
        chispas(this, boca.x, boca.y - 80, 12, 160);
        this.mixtle.celebrar();
        const lista = TEXTOS.nivel2.celebraciones;
        this.narrador.decir(textoAcierto(residuo, lista[this.aciertos++ % lista.length]!), () => this.siguiente());
      },
    });
  }

  private terminar(): void {
    this.mixtle.celebrar();
    confeti(this);
    sonido.celebrar();
    this.narrador.decir(TEXTOS.bonus.fin);
    botonSiguiente(this, () => irA(this, escenaSiguiente('Bonus')), TEXTOS.bonus.botonDiploma, { x: ANCHO - 300, y: 300 }).setName('ir-al-diploma');
  }
}
