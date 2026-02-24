import Phaser from 'phaser';
import { PLAYER, GAME, PX } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';

/**
 * Nick Land player entity.
 * Drawn as a dark cloaked philosopher silhouette with pale face and glowing eyes.
 * Moves horizontally at the bottom of the screen.
 */
export class Player {
  constructor(scene) {
    this.scene = scene;

    const w = PLAYER.WIDTH;
    const h = PLAYER.HEIGHT;

    // Build the character from layered shapes inside a container
    const gfx = scene.add.graphics();
    this.gfx = gfx;

    this._drawNormal(gfx, w, h);

    this.sprite = scene.physics.add.existing(
      scene.add.container(PLAYER.START_X, PLAYER.START_Y, [gfx])
    );

    // Physics body sized to the cloak
    this.sprite.body.setSize(w * 0.8, h * 0.9);
    this.sprite.body.setOffset(-w * 0.4, -h * 0.5);
    this.sprite.body.setCollideWorldBounds(true);
    // No gravity on player — stays at bottom
    this.sprite.body.setAllowGravity(false);

    this.expression = 'normal';
  }

  _drawNormal(gfx, w, h) {
    gfx.clear();

    // --- Cloak body (dark trapezoidal shape) ---
    gfx.fillStyle(PLAYER.COLOR, 1);
    // Main cloak — wider at bottom, narrower at shoulders
    gfx.fillTriangle(
      -w * 0.5, h * 0.5,    // bottom-left (wide)
      w * 0.5, h * 0.5,     // bottom-right (wide)
      0, -h * 0.15           // top center (narrow at shoulders)
    );

    // Cloak accent — subtle purple inner layer
    gfx.fillStyle(PLAYER.CLOAK_ACCENT, 0.6);
    gfx.fillTriangle(
      -w * 0.3, h * 0.5,
      w * 0.3, h * 0.5,
      0, -h * 0.05
    );

    // --- Head (pale oval) ---
    const headW = w * 0.35;
    const headH = h * 0.25;
    const headY = -h * 0.3;
    gfx.fillStyle(PLAYER.FACE_COLOR, 1);
    gfx.fillEllipse(0, headY, headW, headH);

    // --- Dark hair/shadow on top of head ---
    gfx.fillStyle(0x111111, 1);
    gfx.fillEllipse(0, headY - headH * 0.3, headW * 1.1, headH * 0.5);

    // --- Eyes (glowing green) ---
    const eyeSize = w * 0.06;
    const eyeY = headY + headH * 0.05;
    const eyeSpacing = headW * 0.3;

    // Eye glow (larger, dimmer)
    gfx.fillStyle(PLAYER.EYE_COLOR, 0.3);
    gfx.fillCircle(-eyeSpacing, eyeY, eyeSize * 2);
    gfx.fillCircle(eyeSpacing, eyeY, eyeSize * 2);

    // Eye core (bright)
    gfx.fillStyle(PLAYER.EYE_COLOR, 1);
    gfx.fillCircle(-eyeSpacing, eyeY, eyeSize);
    gfx.fillCircle(eyeSpacing, eyeY, eyeSize);

    // --- Collar / cloak neckline ---
    gfx.lineStyle(2 * PX, PLAYER.CLOAK_ACCENT, 0.8);
    gfx.beginPath();
    gfx.arc(0, -h * 0.12, w * 0.2, Math.PI * 0.15, Math.PI * 0.85, false);
    gfx.strokePath();
  }

  _drawHit(gfx, w, h) {
    gfx.clear();

    // Cloak body — flash red
    gfx.fillStyle(0x440000, 1);
    gfx.fillTriangle(
      -w * 0.5, h * 0.5,
      w * 0.5, h * 0.5,
      0, -h * 0.15
    );

    // Head
    const headW = w * 0.35;
    const headH = h * 0.25;
    const headY = -h * 0.3;
    gfx.fillStyle(PLAYER.FACE_COLOR, 1);
    gfx.fillEllipse(0, headY, headW, headH);

    // Hair
    gfx.fillStyle(0x111111, 1);
    gfx.fillEllipse(0, headY - headH * 0.3, headW * 1.1, headH * 0.5);

    // Angry eyes — red
    const eyeSize = w * 0.07;
    const eyeY = headY + headH * 0.05;
    const eyeSpacing = headW * 0.3;
    gfx.fillStyle(0xff0000, 0.4);
    gfx.fillCircle(-eyeSpacing, eyeY, eyeSize * 2);
    gfx.fillCircle(eyeSpacing, eyeY, eyeSize * 2);
    gfx.fillStyle(0xff0000, 1);
    gfx.fillCircle(-eyeSpacing, eyeY, eyeSize);
    gfx.fillCircle(eyeSpacing, eyeY, eyeSize);
  }

  setExpression(expr) {
    if (this.expression === expr) return;
    this.expression = expr;
    const w = PLAYER.WIDTH;
    const h = PLAYER.HEIGHT;
    if (expr === 'hit') {
      this._drawHit(this.gfx, w, h);
    } else {
      this._drawNormal(this.gfx, w, h);
    }
  }

  update(left, right) {
    const body = this.sprite.body;

    // Horizontal movement only
    if (left) {
      body.setVelocityX(-PLAYER.SPEED);
      eventBus.emit(Events.SPECTACLE_ACTION, { direction: 'left' });
    } else if (right) {
      body.setVelocityX(PLAYER.SPEED);
      eventBus.emit(Events.SPECTACLE_ACTION, { direction: 'right' });
    } else {
      body.setVelocityX(0);
    }

    // No vertical movement — player stays at bottom
    body.setVelocityY(0);
  }

  reset() {
    this.sprite.setPosition(PLAYER.START_X, PLAYER.START_Y);
    this.sprite.body.setVelocity(0, 0);
    this.setExpression('normal');
  }

  destroy() {
    this.sprite.destroy();
  }
}
