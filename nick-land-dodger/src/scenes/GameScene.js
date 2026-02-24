import Phaser from 'phaser';
import { GAME, PLAYER, COLORS, PX, TRANSITION, SAFE_ZONE, NEAR_MISS, BIT } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { Player } from '../entities/Player.js';
import { BitSpawner } from '../systems/BitSpawner.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    gameState.reset();
    this.cameras.main.setBackgroundColor(COLORS.BG_DARK);

    // Mobile detection
    this.isMobile = this.sys.game.device.os.android ||
      this.sys.game.device.os.iOS || this.sys.game.device.os.iPad;

    // --- Background grid (subtle cyberpunk grid) ---
    this.drawGrid();

    // --- Player (Nick Land) ---
    this.player = new Player(this);

    // --- Bit Spawner ---
    this.bitSpawner = new BitSpawner(this);

    // --- Score System ---
    this.scoreSystem = new ScoreSystem();

    // --- Collision: player vs bits ---
    this.physics.add.overlap(
      this.player.sprite,
      this.bitSpawner.group,
      this.onPlayerHit,
      null,
      this
    );

    // --- Keyboard input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // --- Touch input state ---
    this.touchLeft = false;
    this.touchRight = false;

    // Tap-zone input: left half = move left, right half = move right
    this.input.on('pointerdown', (pointer) => {
      if (gameState.gameOver) return;
      const gameX = pointer.x;
      if (gameX < GAME.WIDTH / 2) {
        this.touchLeft = true;
        this.touchRight = false;
      } else {
        this.touchRight = true;
        this.touchLeft = false;
      }
      eventBus.emit(Events.SPECTACLE_ACTION, { input: 'touch' });
    });

    this.input.on('pointermove', (pointer) => {
      if (gameState.gameOver || !pointer.isDown) return;
      const gameX = pointer.x;
      if (gameX < GAME.WIDTH / 2) {
        this.touchLeft = true;
        this.touchRight = false;
      } else {
        this.touchRight = true;
        this.touchLeft = false;
      }
    });

    this.input.on('pointerup', () => {
      this.touchLeft = false;
      this.touchRight = false;
    });

    // --- Track bits that pass the player line for dodge/near-miss detection ---
    this.dodgeCheckY = PLAYER.START_Y + PLAYER.HEIGHT / 2;

    gameState.started = true;

    // Emit entrance spectacle
    eventBus.emit(Events.SPECTACLE_ENTRANCE, { character: 'nick-land' });

    // Fade in
    this.cameras.main.fadeIn(TRANSITION.FADE_DURATION, 0, 0, 0);
  }

  update(time, delta) {
    if (gameState.gameOver) return;

    // Merge keyboard + touch into unified input state
    const left = this.cursors.left.isDown || this.wasd.left.isDown || this.touchLeft;
    const right = this.cursors.right.isDown || this.wasd.right.isDown || this.touchRight;

    this.player.update(left, right);

    // Update systems
    this.bitSpawner.update(delta);
    this.scoreSystem.update(delta);

    // Check for dodged bits (bits that passed below player without hitting)
    this.checkDodgedBits();
  }

  /**
   * Check for bits that have fallen past the player — count as dodged.
   * Near-miss detection: bit x was within 20% of player width from player center.
   */
  checkDodgedBits() {
    const playerX = this.player.sprite.x;
    const playerW = PLAYER.WIDTH;
    const nearMissRange = playerW * NEAR_MISS.THRESHOLD;

    const activeBits = this.bitSpawner.getActiveBits();
    for (const bit of activeBits) {
      if (!bit.active) continue;

      // Check if bit has passed below the dodge check line
      if (bit.container.y > this.dodgeCheckY && !bit._dodgeCounted) {
        bit._dodgeCounted = true;

        const dx = Math.abs(bit.container.x - playerX);

        if (dx < nearMissRange + playerW * 0.5) {
          // Near-miss — bit was very close
          eventBus.emit(Events.SPECTACLE_NEAR_MISS, {
            x: bit.container.x,
            y: bit.container.y,
            distance: dx,
          });
        }

        // Count as dodged
        gameState.addCombo();
        eventBus.emit(Events.BIT_DODGED, { combo: gameState.combo });

        // Emit combo spectacle every 5 dodges
        if (gameState.combo > 0 && gameState.combo % 5 === 0) {
          eventBus.emit(Events.SPECTACLE_COMBO, { combo: gameState.combo });
        }
      }
    }
  }

  /**
   * Called when player overlaps with a bit.
   */
  onPlayerHit(playerContainer, bitContainer) {
    if (gameState.gameOver) return;

    // Find the bit object for this container
    const bit = this.bitSpawner.pool.find(b => b.container === bitContainer);
    if (bit && !bit.active) return; // Skip inactive bits

    this.triggerGameOver();
  }

  triggerGameOver() {
    if (gameState.gameOver) return;
    gameState.gameOver = true;

    // Flash player red
    this.player.setExpression('hit');

    eventBus.emit(Events.PLAYER_HIT, {
      score: gameState.score,
      combo: gameState.combo,
      survivalTime: gameState.survivalTime,
      speed: gameState.currentSpeed,
    });
    eventBus.emit(Events.GAME_OVER, { score: gameState.score });

    // Brief pause before transitioning
    this.time.delayedCall(400, () => {
      this.scene.start('GameOverScene');
    });
  }

  /**
   * Draw a subtle grid pattern on the background.
   */
  drawGrid() {
    const gfx = this.add.graphics();
    gfx.lineStyle(1, COLORS.GRID_LINE, COLORS.GRID_ALPHA);

    const gridSpacing = 40 * PX;

    // Vertical lines
    for (let x = 0; x <= GAME.WIDTH; x += gridSpacing) {
      gfx.moveTo(x, 0);
      gfx.lineTo(x, GAME.HEIGHT);
    }

    // Horizontal lines
    for (let y = 0; y <= GAME.HEIGHT; y += gridSpacing) {
      gfx.moveTo(0, y);
      gfx.lineTo(GAME.WIDTH, y);
    }

    gfx.strokePath();
    gfx.setDepth(-1);
  }
}
