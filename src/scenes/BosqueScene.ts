import Phaser from 'phaser';
import { ALTO_CUADRO_EN_ESCALA, ETAPAS_CRECIMIENTO } from '../arte/arboles';
import { ANCHO } from '../config';
import { TEXTOS_AVENTURAS } from '../contenido/aventuras';
import { figurasRepetidas, type DatosDiploma } from '../logica/diploma';
import { sonido } from '../servicios/sonido';
import { Ardilla, Colibri, Mariposa } from '../ui/animales';
import { agregarBotonSonido } from '../ui/BotonSonido';
import { Mixtle } from '../ui/Mixtle';
import { botonSiguiente, chispas, confeti } from '../ui/efectos';
import { agregarParque } from '../ui/fondo';
import { MIXTLE_NIVEL, GLOBO_NIVEL } from '../ui/layoutParque';
import { Narrador } from '../ui/Narrador';
import { entrar, irA } from '../ui/transicion';

const T = TEXTOS_AVENTURAS.u3;
const ESPERA_PISTA_MS = 15000;
/** Riegos que necesita cada arbolito para crecer (brote → arbolito → árbol). */
const RIEGOS_POR_ARBOL = 2;
/** Las tres etapas en la misma escala: el arbolito mide la mitad del árbol grande y el brote, la mitad del arbolito. */
const ETAPAS = ETAPAS_CRECIMIENTO.map((clave) => ({ clave, alto: ALTO_CUADRO_EN_ESCALA[clave] }));

/** Lugares del bosquecito: en el pasto, a la derecha de Mixtle. */
const LUGARES = [
  { x: 720, y: 800 },
  { x: 980, y: 860 },
  { x: 1240, y: 790 },
  { x: 1500, y: 870 },
  { x: 1740, y: 800 },
  { x: 1110, y: 990 },
];

/** Zona para tocar y regar: más grande que el dibujo (el brote es pequeño para dedos de 6 años). */
function zonaDeRiego(planta: Phaser.GameObjects.Image): Phaser.Geom.Rectangle {
  const { width: w, height: h } = planta;
  return new Phaser.Geom.Rectangle(-w * 0.4, -h * 0.2, w * 1.8, h * 1.3);
}

interface Lugar {
  x: number;
  y: number;
  hoyo: Phaser.GameObjects.Image;
  planta: Phaser.GameObjects.Image | null;
  riegos: number;
}

/**
 * Aventura de la unidad 3: sembrar y regar un bosquecito. Amplía el nivel 3 de la v1:
 * además de plantar, cada arbolito necesita que lo rieguen para crecer. Al final llegan los animales.
 */
export class BosqueScene extends Phaser.Scene {
  private lugares: Lugar[] = [];
  private mixtle!: Mixtle;
  private narrador!: Narrador;
  private pista: Phaser.Time.TimerEvent | null = null;
  private sembrados = 0;
  private riegos = 0;
  private anuncioRiego = false;
  private dichoOtraVez = false;
  private terminado = false;

  constructor() {
    super('Bosque');
  }

  create(): void {
    entrar(this);
    this.lugares = [];
    this.sembrados = 0;
    this.riegos = 0;
    this.anuncioRiego = false;
    this.dichoOtraVez = false;
    this.terminado = false;
    this.marcar();
    agregarParque(this);
    this.mixtle = new Mixtle(this, MIXTLE_NIVEL.x, MIXTLE_NIVEL.y, MIXTLE_NIVEL.escala).setDepth(30);
    this.narrador = new Narrador(this, this.mixtle, GLOBO_NIVEL);
    this.crearLugares();
    agregarBotonSonido(this);
    this.time.delayedCall(450, () => this.narrador.decir(T.intro));
    this.reiniciarPista();
  }

  private marcar(): void {
    this.registry.set('marcador', { sembrados: this.sembrados, riegos: this.riegos });
  }

  private crearLugares(): void {
    this.lugares = LUGARES.map((pos, i) => {
      const hoyo = this.add.image(pos.x, pos.y, 'hoyo').setScale(1 / 1.2).setDepth(8 + pos.y / 1000);
      const lugar: Lugar = { ...pos, hoyo, planta: null, riegos: 0 };
      hoyo.setInteractive({
        hitArea: new Phaser.Geom.Circle(hoyo.width / 2, hoyo.height / 2, Math.max(hoyo.width, 150) * 0.6),
        hitAreaCallback: Phaser.Geom.Circle.Contains,
        useHandCursor: true,
      });
      hoyo.setName(`hoyo-${i}`);
      hoyo.once('pointerdown', () => this.sembrar(lugar, i));
      return lugar;
    });
  }

  private sembrar(lugar: Lugar, i: number): void {
    lugar.hoyo.disableInteractive();
    sonido.tocar('plantar');
    this.reiniciarPista();
    this.sembrados += 1;
    this.marcar();
    const planta = this.add.image(lugar.x, lugar.y + 10, ETAPAS[0]!.clave).setOrigin(0.5, 0.95).setDepth(9 + lugar.y / 1000);
    const escala = ETAPAS[0]!.alto / planta.height;
    planta.setScale(0);
    lugar.planta = planta;
    this.tweens.add({ targets: planta, scale: escala, duration: 420, ease: 'Back.easeOut' });
    chispas(this, lugar.x, lugar.y - 40, 8, 110);
    // El arbolito se toca para regarlo (área generosa, más grande que el brote).
    planta.setInteractive({ hitArea: zonaDeRiego(planta), hitAreaCallback: Phaser.Geom.Rectangle.Contains, useHandCursor: true });
    planta.setName(`arbolito-${i}`);
    planta.on('pointerdown', () => this.regar(lugar));
    if (this.sembrados === LUGARES.length && !this.anuncioRiego) {
      this.anuncioRiego = true;
      this.time.delayedCall(500, () => this.narrador.decir(T.regar));
    }
  }

  private regar(lugar: Lugar): void {
    const planta = lugar.planta;
    if (!planta || lugar.riegos >= RIEGOS_POR_ARBOL || planta.getData('regando')) return;
    planta.setData('regando', true);
    this.reiniciarPista();
    this.riegos += 1;
    lugar.riegos += 1;
    this.marcar();

    // La regadera aparece arriba del arbolito, se inclina y caen gotas.
    const regadera = this.add.image(lugar.x + 90, lugar.y - 260, 'regadera').setScale(0.7).setDepth(900).setAlpha(0);
    this.tweens.add({ targets: regadera, alpha: 1, angle: -28, duration: 260 });
    sonido.tocar('brote');
    for (let g = 0; g < 7; g++) {
      const gota = this.add.circle(lugar.x + 20 + Phaser.Math.Between(-30, 30), lugar.y - 220, 9, 0x4e95c2).setDepth(899).setAlpha(0);
      this.tweens.add({ targets: gota, alpha: 1, y: lugar.y - 40, delay: 200 + g * 70, duration: 420, ease: 'Quad.easeIn', onComplete: () => gota.destroy() });
    }
    this.time.delayedCall(900, () => {
      this.tweens.add({ targets: regadera, alpha: 0, duration: 200, onComplete: () => regadera.destroy() });
      const etapa = ETAPAS[lugar.riegos]!;
      planta.setTexture(etapa.clave);
      if (planta.input) planta.input.hitArea = zonaDeRiego(planta);
      planta.setScale(planta.scale * 0.8);
      this.tweens.add({ targets: planta, scale: etapa.alto / planta.height, duration: 520, ease: 'Back.easeOut' });
      chispas(this, lugar.x, lugar.y - etapa.alto * 0.6, 8, 120);
      planta.setData('regando', false);
      if (lugar.riegos >= RIEGOS_POR_ARBOL) {
        planta.disableInteractive();
        this.tweens.add({ targets: planta, angle: { from: -1.5, to: 1.5 }, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        sonido.tocar('feliz');
      } else if (!this.dichoOtraVez) {
        this.dichoOtraVez = true;
        this.narrador.decir(T.otraVez);
      }
      if (this.lugares.every((l) => l.riegos >= RIEGOS_POR_ARBOL)) this.llegaronLosAnimales();
    });
  }

  private llegaronLosAnimales(): void {
    if (this.terminado) return;
    this.terminado = true;
    this.pista?.remove();
    const [a, b, c] = this.lugares;
    const colibri = new Colibri(this, ANCHO + 120, 260, 0.55, true).setDepth(40);
    this.tweens.add({ targets: colibri, x: b!.x - 120, y: b!.y - 300, duration: 1600, ease: 'Sine.easeInOut' });
    sonido.tocar('pajaro');
    const ardilla = new Ardilla(this, ANCHO + 100, a!.y + 30, 0.55, true).setDepth(40);
    this.tweens.add({ targets: ardilla, x: a!.x - 130, duration: 1500, ease: 'Sine.easeOut' });
    [0, 1, 2].forEach((i) => {
      const m = new Mariposa(this, ANCHO + 80 + i * 60, 200 + i * 70, 0.38, true).setDepth(40);
      this.tweens.add({ targets: m, x: c!.x - 60 + i * 70, y: c!.y - 340 + i * 30, duration: 1700 + i * 200, ease: 'Sine.easeInOut' });
    });
    this.narrador.decir(T.llegan, () => this.terminar());
  }

  private terminar(): void {
    this.mixtle.celebrar();
    confeti(this);
    sonido.celebrar();
    this.narrador.decir(T.fin);
    const datos: DatosDiploma = {
      subtitulo: T.diploma.subtitulo,
      izquierda: { numero: this.sembrados, etiqueta: T.diploma.izquierda(this.sembrados), figuras: figurasRepetidas('arbol', this.sembrados) },
      derecha: { numero: this.riegos, etiqueta: T.diploma.derecha(this.riegos), iconos: ['regadera'] },
      narracion: T.diploma.narracion(this.sembrados, this.riegos),
    };
    botonSiguiente(this, () => irA(this, 'Final', datos), T.botonDiploma, { x: ANCHO - 300, y: 300 });
  }

  /** Si nadie toca nada por un rato, Mixtle señala qué sigue (sin prisa y sin castigo). */
  private reiniciarPista(): void {
    this.pista?.remove();
    this.pista = this.time.addEvent({
      delay: ESPERA_PISTA_MS,
      loop: true,
      callback: () => {
        const lugar = this.lugares.find((l) => !l.planta) ?? this.lugares.find((l) => l.riegos < RIEGOS_POR_ARBOL);
        if (!lugar) return;
        this.narrador.decir(T.pista);
        chispas(this, lugar.x, lugar.y - 40, 8, 100);
      },
    });
  }
}
