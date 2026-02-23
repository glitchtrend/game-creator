import Phaser from 'phaser';
import { PLAYER, GAME, COLORS } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';

export class Player {
  constructor(scene) {
    this.scene = scene;

    const key = 'basket_tex';
    const texW = Math.ceil(PLAYER.WIDTH + 8);
    const rimH = PLAYER.HEIGHT * 0.3;
    const texH = Math.ceil(PLAYER.HEIGHT + rimH + 4);

    // Only generate the texture once (survives scene restarts)
    if (!scene.textures.exists(key)) {
      const gfx = scene.add.graphics();

      // Offset all drawing so it starts from (0,0) in positive space
      const ox = texW / 2;
      const oy = rimH + 2;

      // Main basket body
      gfx.fillStyle(PLAYER.COLOR, 1);
      gfx.fillRoundedRect(
        ox - PLAYER.WIDTH / 2, oy,
        PLAYER.WIDTH, PLAYER.HEIGHT,
        4
      );

      // Darker rim at top edge
      gfx.fillStyle(COLORS.PLAYER_RIM, 1);
      gfx.fillRoundedRect(
        ox - PLAYER.WIDTH / 2 - 2, oy - rimH * 0.5,
        PLAYER.WIDTH + 4, rimH,
        3
      );

      gfx.generateTexture(key, texW, texH);
      gfx.destroy();
    }

    // Create physics-enabled sprite
    this.sprite = scene.physics.add.sprite(PLAYER.START_X, PLAYER.START_Y, key);
    this.sprite.body.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setCollideWorldBounds(true);
  }

  update(left, right) {
    const body = this.sprite.body;

    // Horizontal-only movement
    if (left) {
      body.setVelocityX(-PLAYER.SPEED);
    } else if (right) {
      body.setVelocityX(PLAYER.SPEED);
    } else {
      body.setVelocityX(0);
    }

    // No vertical movement at all
    body.setVelocityY(0);
  }

  reset() {
    this.sprite.setPosition(PLAYER.START_X, PLAYER.START_Y);
    this.sprite.body.setVelocity(0, 0);
  }

  destroy() {
    this.sprite.destroy();
  }
}
