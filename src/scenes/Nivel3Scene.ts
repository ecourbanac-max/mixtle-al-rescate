import Phaser from 'phaser';
import { ANCHO } from '../config';
import { ANIMALES } from '../data/animales';
import { TEXTOS } from '../data/textos';
import { escenaSiguiente } from '../logica/flujo';
import { progreso } from '../logica/progreso';
import { sonido } from '../servicios/sonido';
import { Mariposa } from '../ui/animales';
import { AnimalesParque } from '../ui/animalesParque';
import { agregarBotonSonido } from '../ui/BotonSonido';
import { Mixtle } from '../ui/Mixtle';
import { botonSiguiente, chispas, confeti } from '../ui/efectos';
import { agregarParque } from '../ui/fondo';
import { MIXTLE_NIVEL, GLOBO_NIVEL, ZONAS } from '../ui/layoutParque';
import { Narrador } from '../ui/Narrador';
import { entrar, irA } from '../ui/transicion';

const ESPERA_PISTA_MS = 15000;
const FLORES = ['flores-naranja', 'flores-morada', 'flores-amarilla'];

interface Lugar {
  x: number;
  y: number;
  que: 'arbol' | 'flores';
  hoyo: Phaser.GameObjects.Image;
  guia: Phaser.GameObjects.Image;
}

/** Nivel 3: sembrar árboles y flores donde había basura; llegan los animales. */
export class Nivel3Scene extends Phaser.Scene {
  private lugares: Lugar[] = [];
  private animales!: AnimalesParque;
  private mixtle!: Mixtle;
  private narrador!: Narrador;
  private pista: Phaser.Time.TimerEvent | null = null;
  private dichos = new Set<string>();
  private arboles = 0;
  private flores = 0;

  constructor() {
    super('Nivel3');
  }

  create(): void {
    entrar(this);
    this.dichos.clear();
    this.arboles = 0;
    this.flores = 0;
    agregarParque(this);

    // Si se entra directo (pruebas), se considera que todas las zonas ya están limpias.
    const p = progreso();
    if (!p.animalesFelices.size) ANIMALES.forEach((a) => p.ayudarAnimal(a.id));
    this.animales = new AnimalesParque(this, [...p.animalesFelices]);

    this.mixtle = new Mixtle(this, MIXTLE_NIVEL.x, MIXTLE_NIVEL.y, MIXTLE_NIVEL.escala).setDepth(30);
    this.narrador = new Narrador(this, this.mixtle, GLOBO_NIVEL);
    this.crearLugares();
    agregarBotonSonido(this);

    this.time.delayedCall(450, () => this.narrador.decir(TEXTOS.nivel3.instruccion));
    this.reiniciarPista();
  }

  private crearLugares(): void {
    const limpias = ZONAS.filter((z) => progreso().animalesFelices.has(z.animal));
    this.lugares = limpias.flatMap((z) =>
      z.plantar.map((pos, i) => {
        const hoyo = this.add.image(pos.x, pos.y, 'hoyo').setScale(1 / 1.2).setDepth(8 + pos.y / 1000);
        const guia = this.add.image(pos.x, pos.y - 40, 'brote').setScale(0.5).setAlpha(0.55).setDepth(9);
        this.tweens.add({ targets: guia, y: pos.y - 70, scale: 0.6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 150 });
        const lugar: Lugar = { ...pos, hoyo, guia };
        hoyo.setInteractive({
          hitArea: new Phaser.Geom.Circle(hoyo.width / 2, hoyo.height / 2, Math.max(hoyo.width, 150) * 0.6),
          hitAreaCallback: Phaser.Geom.Circle.Contains,
          useHandCursor: true,
        });
        hoyo.setName(`tierra-${z.animal}-${i}`);
        hoyo.once('pointerdown', () => this.sembrar(lugar));
        return lugar;
      }),
    );
  }

  private sembrar(lugar: Lugar): void {
    this.lugares = this.lugares.filter((l) => l !== lugar);
    lugar.hoyo.disableInteractive();
    this.tweens.killTweensOf(lugar.guia);
    lugar.guia.destroy();
    this.reiniciarPista();
    sonido.tocar('plantar');

    const brote = this.add.image(lugar.x, lugar.y - 10, 'brote').setOrigin(0.5, 0.95).setScale(0).setDepth(9 + lugar.y / 1000);
    this.tweens.add({
      targets: brote,
      scale: 0.7,
      duration: 380,
      ease: 'Back.easeOut',
      onComplete: () => {
        sonido.tocar('brote');
        const clave = lugar.que === 'arbol' ? 'arbol-frutal' : FLORES[this.flores % FLORES.length]!;
        const escala = lugar.que === 'arbol' ? 0.78 / 1.2 : 0.85 / 1.2;
        const planta = this.add.image(lugar.x, lugar.y + 10, clave).setOrigin(0.5, 0.96).setScale(0).setDepth(9 + lugar.y / 1000);
        planta.setName(`planta-${lugar.que}`);
        brote.destroy();
        chispas(this, lugar.x, lugar.y - 80, 8, 120);
        this.tweens.add({
          targets: planta,
          scale: escala,
          duration: 520,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({ targets: planta, angle: { from: -1.5, to: 1.5 }, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.llegaAnimal(lugar, planta);
          },
        });
      },
    });
  }

  private llegaAnimal(lugar: Lugar, planta: Phaser.GameObjects.Image): void {
    const terminado = !this.lugares.length;
    const despues = terminado ? () => this.terminar() : undefined;
    if (lugar.que === 'flores') {
      this.flores += 1;
      progreso().plantar(1);
      const destino = { x: lugar.x + 10, y: planta.y - planta.displayHeight * 0.8 };
      const m = new Mariposa(this, 2020, Phaser.Math.Between(200, 420), 0.4, true).setDepth(40);
      sonido.tocar('aleteo');
      this.tweens.add({
        targets: m,
        x: destino.x,
        y: destino.y,
        duration: 1600,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.tweens.add({ targets: m, x: destino.x + 30, y: destino.y - 30, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        },
      });
      this.decirUnaVez('mariposa', TEXTOS.nivel3.llegaMariposa, despues);
    } else {
      this.arboles += 1;
      progreso().plantar(0);
      const copa = { x: lugar.x, y: planta.y - planta.displayHeight * 0.75 };
      if (this.arboles === 1) {
        const c = this.animales.colibri;
        this.tweens.killTweensOf(c);
        sonido.tocar('pajaro');
        this.tweens.add({
          targets: c,
          x: copa.x - 110,
          y: copa.y,
          duration: 1400,
          ease: 'Sine.easeInOut',
          onComplete: () => this.tweens.add({ targets: c, y: copa.y - 20, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }),
        });
        this.decirUnaVez('colibri', TEXTOS.nivel3.llegaColibri, despues);
      } else {
        const a = this.animales.ardilla;
        this.tweens.killTweensOf(a);
        a.setAngle(0);
        const base = { x: lugar.x - 130, y: lugar.y + 20 };
        this.tweens.add({ targets: a, x: base.x, duration: 900, ease: 'Linear' });
        this.tweens.add({ targets: a, y: a.y - 120, duration: 450, yoyo: true, ease: 'Quad.easeOut', onComplete: () => a.setY(base.y) });
        sonido.tocar('feliz');
        this.decirUnaVez('ardilla', TEXTOS.nivel3.llegaArdilla, despues);
      }
    }
  }

  /** Mixtle comenta cada tipo de llegada solo la primera vez, para no saturar de voz. */
  private decirUnaVez(clave: string, texto: string, despues?: () => void): void {
    if (this.dichos.has(clave)) {
      if (despues) this.time.delayedCall(900, despues);
      return;
    }
    this.dichos.add(clave);
    this.narrador.decir(texto, despues);
  }

  private terminar(): void {
    this.pista?.remove();
    this.mixtle.celebrar();
    confeti(this);
    sonido.celebrar();
    this.narrador.decir(TEXTOS.nivel3.fin);
    // Arriba, en el cielo, para no tapar las flores recién sembradas.
    botonSiguiente(this, () => irA(this, escenaSiguiente('Nivel3')), TEXTOS.seguir, { x: ANCHO - 300, y: 300 });
  }

  private reiniciarPista(): void {
    this.pista?.remove();
    this.pista = this.time.addEvent({
      delay: ESPERA_PISTA_MS,
      loop: true,
      callback: () => {
        const lugar = this.lugares[0];
        if (!lugar) return;
        this.narrador.decir(TEXTOS.nivel3.pista);
        chispas(this, lugar.x, lugar.y - 30, 6, 90);
      },
    });
  }
}
