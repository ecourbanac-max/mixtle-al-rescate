import Phaser from 'phaser';
import { PALETA, hex } from '../config';
import { estiloTexto } from './texto';

export interface OpcionesGlobo {
  /** Esquina superior izquierda del globo. */
  x: number;
  y: number;
  ancho: number;
  /** Punto al que apunta la colita del globo (la boca de quien habla). */
  apuntaA: { x: number; y: number };
  tamanoTexto?: number;
}

const RELLENO = 34;

/** Globo de diálogo que se ajusta al texto y apunta hacia quien habla. */
export class Globo extends Phaser.GameObjects.Container {
  private fondo: Phaser.GameObjects.Graphics;
  private texto: Phaser.GameObjects.Text;
  private readonly op: OpcionesGlobo;
  /** Espacio reservado a la derecha (por ejemplo, para el botón de repetir). */
  margenDerecho = 0;

  constructor(scene: Phaser.Scene, op: OpcionesGlobo) {
    super(scene, op.x, op.y);
    this.op = op;
    this.fondo = scene.add.graphics();
    this.texto = scene.add
      .text(RELLENO, RELLENO, '', estiloTexto(op.tamanoTexto ?? 50, PALETA.tinta, {
        align: 'left',
        wordWrap: { width: op.ancho - RELLENO * 2, useAdvancedWrap: true },
        lineSpacing: 8,
      }))
      .setName('texto-globo');
    this.add([this.fondo, this.texto]);
    this.setDepth(500).setVisible(false);
    scene.add.existing(this);
  }

  get ancho(): number {
    return this.op.ancho;
  }

  get alto(): number {
    return Math.max(this.texto.height + RELLENO * 2, 120);
  }

  get contenido(): string {
    return this.texto.text;
  }

  /** El punto al que apunta la colita (la boca de quien habla). */
  get apuntaA(): { x: number; y: number } {
    return this.op.apuntaA;
  }

  mostrar(texto: string): void {
    this.texto.setWordWrapWidth(this.op.ancho - RELLENO * 2 - this.margenDerecho, true);
    this.texto.setText(texto);
    this.dibujar();
    this.setVisible(true);
    this.scene.tweens.killTweensOf(this);
    this.setScale(0.9).setAlpha(0);
    this.scene.tweens.add({ targets: this, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' });
  }

  ocultar(): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({ targets: this, alpha: 0, duration: 160, onComplete: () => this.setVisible(false) });
  }

  private dibujar(): void {
    const { ancho, apuntaA } = this.op;
    const alto = this.alto;
    const g = this.fondo.clear();
    // La colita sale del borde más cercano a quien habla.
    const local = { x: apuntaA.x - this.x, y: apuntaA.y - this.y };
    let cola: Phaser.Geom.Triangle;
    let tapa: Phaser.Geom.Triangle;
    const LARGO = 170;
    if (local.y > alto) {
      const bx = Phaser.Math.Clamp(local.x, 80, ancho - 140);
      const dir = new Phaser.Math.Vector2(local.x - bx, local.y - alto).normalize();
      const punta = { x: bx + dir.x * LARGO, y: alto + Math.max(dir.y * LARGO, 60) };
      cola = new Phaser.Geom.Triangle(bx - 34, alto - 4, bx + 34, alto - 4, punta.x, punta.y);
      tapa = new Phaser.Geom.Triangle(bx - 26, alto - 10, bx + 26, alto - 10, punta.x - dir.x * 20, punta.y - dir.y * 20);
    } else {
      const by = Phaser.Math.Clamp(local.y, 50, alto - 50);
      const dir = new Phaser.Math.Vector2(local.x, local.y - by).normalize();
      const punta = { x: Math.min(dir.x * LARGO, -60), y: by + dir.y * LARGO };
      cola = new Phaser.Geom.Triangle(4, by - 30, 4, by + 30, punta.x, punta.y);
      tapa = new Phaser.Geom.Triangle(10, by - 22, 10, by + 22, punta.x - dir.x * 20, punta.y - dir.y * 20);
    }
    g.fillStyle(hex(PALETA.verde), 0.25).fillRoundedRect(0, 10, ancho, alto, 40);
    g.lineStyle(8, hex(PALETA.verde), 1);
    g.fillStyle(0xffffff, 1);
    g.fillTriangleShape(cola);
    g.strokeTriangleShape(cola);
    g.fillRoundedRect(0, 0, ancho, alto, 40);
    g.strokeRoundedRect(0, 0, ancho, alto, 40);
    // Tapa la línea entre el globo y la colita para que se vean unidos.
    g.fillTriangleShape(tapa);
  }
}
