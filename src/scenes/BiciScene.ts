import Phaser from 'phaser';
import { ALTO, ANCHO, PALETA, hex } from '../config';
import { RECORRIDO_BICI as RECORRIDO, type Carril } from '../aventuras/datos';
import { TEXTOS_AVENTURAS } from '../contenido/aventuras';
import { figurasRepetidas, type DatosDiploma } from '../logica/diploma';
import { sonido } from '../servicios/sonido';
import { agregarBotonSonido } from '../ui/BotonSonido';
import { Mixtle } from '../ui/Mixtle';
import { botonSiguiente, chispas, confeti } from '../ui/efectos';
import { Narrador } from '../ui/Narrador';
import { estiloTexto } from '../ui/texto';
import { entrar, irA } from '../ui/transicion';

const T = TEXTOS_AVENTURAS.u4;

/** Centro de cada carril en la calle (y del juego): arriba, la calle; abajo, la ciclovía verde. */
const CARRIL: Record<Carril, number> = { arriba: 760, abajo: 925 };
const BICI_X = 430;
/** Velocidad del recorrido (px del juego por segundo): tranquila, para niñas y niños de 6 años. */
const VELOCIDAD = 380;
const DISTANCIA_CHOQUE = 75;
const MARCADOR = { x: 1205 };


interface Cosa {
  tipo: 'hojita' | 'humo';
  carril: Carril;
  imagen: Phaser.GameObjects.Image;
  resuelta: boolean;
}

/**
 * Aventura de la unidad 4: "En bici a la escuela". Mixtle pedalea solo; el grupo toca el carril
 * de arriba o el de abajo para esquivar las nubes de humo y juntar hojitas. El humo no castiga:
 * Mixtle tose y propone cambiar de carril.
 */
export class BiciScene extends Phaser.Scene {
  private fondos: Phaser.GameObjects.Image[] = [];
  private bici!: Phaser.GameObjects.Container;
  private mixtle!: Mixtle;
  private narrador!: Narrador;
  private carril: Carril = 'abajo';
  private cosas: Cosa[] = [];
  private pendientes: typeof RECORRIDO = [];
  private reloj = 0;
  private andando = false;
  private terminado = false;
  private hojitas = 0;
  private esquivadas = 0;
  private toses = 0;
  private ultimaTos = -99;
  private dichaMitad = false;
  private textoHojitas!: Phaser.GameObjects.Text;
  private textoHumo!: Phaser.GameObjects.Text;
  private resaltes: Record<Carril, Phaser.GameObjects.Rectangle> | null = null;

  constructor() {
    super('Bici');
  }

  create(): void {
    entrar(this);
    this.carril = 'abajo';
    this.cosas = [];
    this.pendientes = [...RECORRIDO];
    this.reloj = 0;
    this.andando = false;
    this.terminado = false;
    this.hojitas = 0;
    this.esquivadas = 0;
    this.toses = 0;
    this.ultimaTos = -99;
    this.dichaMitad = false;
    this.marcar();

    // La calle se repite: dos copias que se desplazan a la izquierda.
    this.fondos = [0, ANCHO].map((x) => this.add.image(x, 0, 'calle').setOrigin(0, 0).setDepth(0));
    this.crearCarriles();
    this.crearBici();
    this.crearMarcador();
    this.narrador = new Narrador(this, this.mixtle, { x: 60, y: 110, ancho: 1120, apuntaA: { x: BICI_X, y: 620 }, tamanoTexto: 44 });
    agregarBotonSonido(this);
    this.time.delayedCall(450, () => this.narrador.decir(T.intro, () => (this.andando = true)));
  }

  private marcar(): void {
    this.registry.set('marcador', { hojitas: this.hojitas, esquivadas: this.esquivadas, toses: this.toses, terminado: this.terminado ? 1 : 0 });
  }

  /** Cada carril es una franja grande que se toca para cambiarse a él. */
  private crearCarriles(): void {
    const franjas: Record<Carril, { y: number; alto: number }> = { arriba: { y: 600, alto: 245 }, abajo: { y: 845, alto: 235 } };
    const resaltes = {} as Record<Carril, Phaser.GameObjects.Rectangle>;
    (Object.keys(franjas) as Carril[]).forEach((c) => {
      const f = franjas[c];
      resaltes[c] = this.add.rectangle(ANCHO / 2, f.y + f.alto / 2, ANCHO, f.alto, 0xffffff, 0).setDepth(1);
      const zona = this.add.zone(ANCHO / 2, f.y + f.alto / 2, ANCHO, f.alto).setInteractive({ useHandCursor: true }).setName(`carril-${c}`);
      zona.on('pointerdown', () => this.cambiarA(c));
    });
    this.resaltes = resaltes;
    this.resaltarCarril();
  }

  private resaltarCarril(): void {
    if (!this.resaltes) return;
    this.resaltes.arriba.setFillStyle(0xffffff, this.carril === 'arriba' ? 0.12 : 0);
    this.resaltes.abajo.setFillStyle(0xffffff, this.carril === 'abajo' ? 0.12 : 0);
  }

  private crearBici(): void {
    const bici = this.add.image(0, 0, 'bici').setOrigin(0.5, 0.92);
    bici.setScale(250 / bici.height);
    this.mixtle = new Mixtle(this, 0, -140, 0.4); // sentado en el asiento
    this.bici = this.add.container(BICI_X, CARRIL.abajo, [bici, this.mixtle]).setDepth(50);
    // Pedaleo: un pequeño vaivén.
    this.tweens.add({ targets: this.mixtle, y: -146, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private crearMarcador(): void {
    const g = this.add.graphics().setDepth(600);
    // Entre el globo de Mixtle (termina en x≈1180) y los botones de sonido (empiezan en x≈1610).
    const x = MARCADOR.x;
    g.fillStyle(0xffffff, 0.92).fillRoundedRect(x, 30, 390, 116, 40);
    g.lineStyle(6, hex(PALETA.verde), 1).strokeRoundedRect(x, 30, 390, 116, 40);
    this.add.image(x + 60, 88, 'hojita').setDisplaySize(72, 72).setDepth(601);
    this.textoHojitas = this.add.text(x + 110, 88, '0', estiloTexto(56, PALETA.verde)).setOrigin(0, 0.5).setDepth(601);
    this.add.image(x + 245, 88, 'humo').setDisplaySize(76, 76).setDepth(601);
    this.textoHumo = this.add.text(x + 295, 88, '0', estiloTexto(56, PALETA.tinta)).setOrigin(0, 0.5).setDepth(601);
  }

  private cambiarA(carril: Carril): void {
    if (this.terminado || carril === this.carril) return;
    this.carril = carril;
    sonido.tocar('toque');
    this.tweens.killTweensOf(this.bici);
    this.tweens.add({ targets: this.bici, y: CARRIL[carril], duration: 260, ease: 'Quad.easeOut' });
    this.resaltarCarril();
  }

  override update(_tiempo: number, delta: number): void {
    if (!this.andando || this.terminado) return;
    const dt = Math.min(delta, 50) / 1000;
    this.reloj += dt;
    const dx = VELOCIDAD * dt;
    for (const f of this.fondos) {
      f.x -= dx;
      if (f.x <= -ANCHO) f.x += ANCHO * 2;
    }
    while (this.pendientes.length && this.pendientes[0]!.t <= this.reloj) this.aparecer(this.pendientes.shift()!);
    for (const cosa of this.cosas) {
      cosa.imagen.x -= dx;
      if (!cosa.resuelta) this.revisar(cosa);
    }
    this.cosas = this.cosas.filter((c) => {
      if (c.imagen.x > -200) return true;
      c.imagen.destroy();
      return false;
    });
    if (!this.dichaMitad && this.reloj > 17) {
      this.dichaMitad = true;
      this.narrador.decir(T.mitad);
    }
    if (!this.pendientes.length && !this.cosas.some((c) => !c.resuelta)) this.llegar();
  }

  private aparecer(p: (typeof RECORRIDO)[number]): void {
    const y = CARRIL[p.carril] - (p.tipo === 'humo' ? 90 : 110);
    const imagen = this.add.image(ANCHO + 150, y, p.tipo === 'humo' ? 'humo' : 'hojita').setDepth(40);
    imagen.setDisplaySize(p.tipo === 'humo' ? 190 : 96, p.tipo === 'humo' ? 190 : 96);
    if (p.tipo === 'hojita') this.tweens.add({ targets: imagen, angle: { from: -12, to: 12 }, duration: 600, yoyo: true, repeat: -1 });
    else this.tweens.add({ targets: imagen, scale: imagen.scale * 1.08, duration: 700, yoyo: true, repeat: -1 });
    imagen.setName(`${p.tipo}-${p.carril}`);
    this.cosas.push({ tipo: p.tipo, carril: p.carril, imagen, resuelta: false });
  }

  private revisar(cosa: Cosa): void {
    const x = cosa.imagen.x;
    const mismoCarril = cosa.carril === this.carril;
    if (Math.abs(x - BICI_X) < DISTANCIA_CHOQUE && mismoCarril) {
      cosa.resuelta = true;
      if (cosa.tipo === 'hojita') this.juntar(cosa);
      else this.toser(cosa);
    } else if (x < BICI_X - DISTANCIA_CHOQUE) {
      cosa.resuelta = true;
      if (cosa.tipo === 'humo') {
        this.esquivadas += 1;
        this.textoHumo.setText(String(this.esquivadas));
        this.marcar();
      }
    }
  }

  private juntar(cosa: Cosa): void {
    this.hojitas += 1;
    this.marcar();
    sonido.tocar('recoger');
    const img = cosa.imagen;
    this.tweens.killTweensOf(img);
    this.tweens.add({
      targets: img,
      x: MARCADOR.x + 60,
      y: 88,
      scale: img.scale * 0.6,
      duration: 520,
      ease: 'Quad.easeIn',
      onComplete: () => {
        img.setVisible(false);
        this.textoHojitas.setText(String(this.hojitas));
        this.tweens.add({ targets: this.textoHojitas, scale: 1.3, duration: 120, yoyo: true });
      },
    });
    chispas(this, BICI_X, CARRIL[this.carril] - 160, 8, 110);
  }

  private toser(cosa: Cosa): void {
    this.toses += 1;
    this.marcar();
    sonido.tocar('otraVez');
    this.tweens.add({ targets: cosa.imagen, alpha: 0.35, duration: 300 });
    this.tweens.add({ targets: this.bici, angle: { from: -3, to: 3 }, duration: 90, yoyo: true, repeat: 3, onComplete: () => this.bici.setAngle(0) });
    // Mixtle tose y lo dice, pero sin repetirlo a cada rato.
    if (this.reloj - this.ultimaTos > 6) {
      this.ultimaTos = this.reloj;
      this.narrador.decir(T.tos);
    }
  }

  private llegar(): void {
    if (this.terminado) return;
    this.terminado = true;
    this.marcar();
    const escuela = this.add.image(ANCHO + 300, 600, 'escuela').setOrigin(0.5, 1).setDepth(5);
    escuela.setScale(420 / escuela.height);
    this.tweens.add({
      targets: escuela,
      x: ANCHO - 420,
      duration: 1600,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.mixtle.celebrar();
        confeti(this);
        sonido.celebrar();
        this.narrador.decir(T.fin);
        const datos: DatosDiploma = {
          subtitulo: T.diploma.subtitulo,
          izquierda: { numero: this.hojitas, etiqueta: T.diploma.izquierda(this.hojitas), figuras: figurasRepetidas('hojita', this.hojitas) },
          derecha: { numero: this.esquivadas, etiqueta: T.diploma.derecha(this.esquivadas), iconos: ['humo', 'bici'] },
          narracion: T.diploma.narracion(this.hojitas, this.esquivadas),
        };
        botonSiguiente(this, () => irA(this, 'Final', datos), T.botonDiploma, { x: ANCHO - 300, y: ALTO - 640 });
      },
    });
  }
}
