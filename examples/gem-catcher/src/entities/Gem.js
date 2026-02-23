import Phaser from 'phaser';
import { GEM } from '../core/Constants.js';

export class Gem extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y, fallSpeed) {
    super(scene);

    this.scene = scene;
    scene.add.existing(this);

    // Pick a random gem color
    const color = Phaser.Utils.Array.GetRandom(GEM.COLORS);

    // Draw a diamond shape
    const half = GEM.SIZE / 2;
    this.fillStyle(color, 1);
    this.beginPath();
    this.moveTo(0, -half);        // top
    this.lineTo(half, 0);         // right
    this.lineTo(0, half);         // bottom
    this.lineTo(-half, 0);        // left
    this.closePath();
    this.fillPath();

    // Small white highlight for shine effect
    this.fillStyle(0xffffff, 0.4);
    this.fillCircle(-half * 0.25, -half * 0.25, half * 0.2);

    this.setPosition(x, y);

    // Enable physics
    scene.physics.add.existing(this);
    this.body.setSize(GEM.SIZE, GEM.SIZE);
    this.body.setOffset(-half, -half);
    this.body.setAllowGravity(false);
    this.body.setVelocityY(fallSpeed);
  }
}
