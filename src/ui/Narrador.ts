import type Phaser from 'phaser';
import { PALETA } from '../config';
import * as dialogo from '../servicios/dialogo';
import { textoDeLocucion, type Locucion } from '../voz/locucion';
import { Boton } from './Boton';
import type { Mixtle } from './Mixtle';
import { Globo, type OpcionesGlobo } from './Globo';

/**
 * Une a Mixtle, su globo de texto y la voz en las aventuras. Lo que se dice y en qué orden lo decide el
 * único narrador del juego (servicios/dialogo.ts): cada escena es dueña de sus frases, así que nada de
 * una escena (ni de una pantalla de React) se cuela en otra. El botón de repetir (o tocar a Mixtle)
 * vuelve a decir la última frase de la escena.
 */
export class Narrador {
  readonly globo: Globo;
  private repetir: Boton;
  private activo = true;
  /** El dueño de las frases de esta escena. */
  private readonly dueno: number;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly mixtle: Mixtle,
    opGlobo: OpcionesGlobo,
  ) {
    this.globo = new Globo(scene, opGlobo);
    // 124 px del juego ≈ 66 px reales en una tablet de 1024 px (mínimo de toque: 64).
    this.globo.margenDerecho = 130;
    this.repetir = new Boton(scene, 0, 0, {
      icono: 'icono-repetir',
      ancho: 124,
      alto: 124,
      color: PALETA.verde,
      nombre: 'repetir',
      alPresionar: () => this.repetirFrase(),
    }).setDepth(501);
    this.repetir.setVisible(false);

    this.dueno = dialogo.nuevoDueno();
    mixtle.hacerTocable().on('pointerup', () => this.repetirFrase());
    scene.events.once('shutdown', () => {
      this.activo = false;
      // Solo se calla si las frases siguen siendo de esta escena (no las de la escena o pantalla que sigue).
      if (dialogo.duenoActual() === this.dueno) dialogo.nuevoDueno();
    });
  }

  /**
   * Mixtle dice la frase (voz + globo) en cuanto termine la que esté diciendo. `alTerminar` se llama una
   * sola vez, al acabar la voz (o, si el audio no suena, después del tiempo para leerla), y nunca si la
   * escena ya terminó.
   */
  decir(locucion: Locucion, alTerminar?: () => void): void {
    dialogo.decir(locucion, {
      alTerminar: () => {
        if (this.activo) alTerminar?.();
      },
      dueno: this.dueno,
      vista: this.vista(locucion),
    });
  }

  ocultar(): void {
    this.globo.ocultar();
    this.repetir.setVisible(false);
  }

  private vista(locucion: Locucion): dialogo.Vista {
    return {
      alEmpezar: (ms) => {
        if (!this.activo) return;
        // El globo es el subtítulo: muestra lo que dice Mixtle (con cifras en lugar de números en palabras).
        this.globo.mostrar(textoDeLocucion(locucion));
        this.repetir.setPosition(this.globo.x + this.globo.ancho - 84, this.globo.y + 80).setVisible(true);
        this.mixtle.hablar(ms);
      },
      alAcabar: () => {
        if (this.activo) this.mixtle.callar();
      },
    };
  }

  private repetirFrase(): void {
    if (!this.globo.visible || dialogo.duenoActual() !== this.dueno) return;
    dialogo.repetir();
    this.scene.tweens.add({ targets: this.globo, scale: 1.03, duration: 120, yoyo: true });
  }
}
