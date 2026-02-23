import Phaser from 'phaser';
import { SKULL, COLORS } from '../core/Constants.js';

export class Skull extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y, fallSpeed) {
    super(scene);

    this.scene = scene;
    scene.add.existing(this);

    const size = SKULL.SIZE;
    const half = size / 2;

    // Draw skull body (rounded rectangle)
    this.fillStyle(SKULL.COLOR, 1);
    this.fillRoundedRect(-half, -half, size, size, half * 0.3);

    // Draw eye sockets (dark circles)
    this.fillStyle(0x000000, 0.8);
    const eyeR = half * 0.2;
    this.fillCircle(-half * 0.35, -half * 0.15, eyeR);
    this.fillCircle(half * 0.35, -half * 0.15, eyeR);

    // Draw mouth (small dark rectangle)
    this.fillStyle(0x000000, 0.6);
    this.fillRect(-half * 0.3, half * 0.2, half * 0.6, half * 0.15);

    this.setPosition(x, y);

    // Enable physics
    scene.physics.add.existing(this);
    this.body.setSize(size, size);
    this.body.setOffset(-half, -half);
    this.body.setAllowGravity(false);
    this.body.setVelocityY(fallSpeed);
  }
}
