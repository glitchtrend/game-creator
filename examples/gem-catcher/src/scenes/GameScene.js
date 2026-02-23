import Phaser from 'phaser';
import { GAME, PLAYER, COLORS, PX, TRANSITION, SAFE_ZONE, GEM, SKULL, DIFFICULTY, LIVES, UI } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { Player } from '../entities/Player.js';
import { Gem } from '../entities/Gem.js';
import { Skull } from '../entities/Skull.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    gameState.reset();

    // Mobile detection
    this.isMobile = this.sys.game.device.os.android ||
      this.sys.game.device.os.iOS || this.sys.game.device.os.iPad;

    // --- Night sky gradient background ---
    this.drawGradient();

    // --- Player (basket) ---
    this.player = new Player(this);

    // --- Physics groups for falling objects ---
    this.gems = this.add.group();
    this.skulls = this.add.group();

    // --- Overlap detection ---
    // Player catches gem = +score
    this.physics.add.overlap(this.player.sprite, this.gems, this.catchGem, null, this);
    // Player catches skull = -life
    this.physics.add.overlap(this.player.sprite, this.skulls, this.catchSkull, null, this);

    // --- Score system ---
    this.scoreSystem = new ScoreSystem();

    // --- Difficulty tracking ---
    this.currentFallSpeed = GEM.FALL_SPEED;
    this.currentSkullFallSpeed = SKULL.FALL_SPEED;
    this.currentSpawnInterval = GEM.SPAWN_INTERVAL;
    this.lastDifficultyScore = 0;

    // --- Spawn timer ---
    this.spawnTimer = this.time.addEvent({
      delay: this.currentSpawnInterval,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true,
    });

    // --- Lives display ---
    this.livesTexts = [];
    this.createLivesDisplay();

    // --- Keyboard input ---
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      });
    }

    // --- Touch input state ---
    this.touchLeft = false;
    this.touchRight = false;

    // Tap-zone input: left half = move left, right half = move right
    this.input.on('pointerdown', (pointer) => {
      if (pointer.x < GAME.WIDTH / 2) {
        this.touchLeft = true;
        this.touchRight = false;
      } else {
        this.touchRight = true;
        this.touchLeft = false;
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown) return;
      if (pointer.x < GAME.WIDTH / 2) {
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

    gameState.started = true;

    // Fade in
    this.cameras.main.fadeIn(TRANSITION.FADE_DURATION, 0, 0, 0);
  }

  update() {
    if (gameState.gameOver) return;

    // Merge keyboard + touch into unified input state
    const left = (this.cursors && this.cursors.left.isDown) ||
                 (this.wasd && this.wasd.left.isDown) ||
                 this.touchLeft;
    const right = (this.cursors && this.cursors.right.isDown) ||
                  (this.wasd && this.wasd.right.isDown) ||
                  this.touchRight;

    this.player.update(left, right);

    // Clean up off-screen objects
    this.cleanOffScreen(this.gems);
    this.cleanOffScreen(this.skulls);

    // Check difficulty ramp
    this.checkDifficulty();
  }

  // --- Spawning ---

  spawnObject() {
    if (gameState.gameOver) return;

    // Random x position within playable area (with padding)
    const padding = GEM.SIZE;
    const x = Phaser.Math.Between(padding, GAME.WIDTH - padding);
    const y = -GEM.SIZE; // spawn just above the top edge

    // 15% chance to spawn a skull instead of a gem
    if (Math.random() < SKULL.SPAWN_CHANCE) {
      const skull = new Skull(this, x, y, this.currentSkullFallSpeed);
      this.skulls.add(skull);
    } else {
      const gem = new Gem(this, x, y, this.currentFallSpeed);
      this.gems.add(gem);
    }
  }

  // --- Collision handlers ---

  catchGem(playerSprite, gem) {
    gem.destroy();
    eventBus.emit(Events.GEM_CAUGHT);
  }

  catchSkull(playerSprite, skull) {
    skull.destroy();
    eventBus.emit(Events.SKULL_CAUGHT);

    const remaining = gameState.loseLife();
    eventBus.emit(Events.LIFE_LOST, { lives: remaining });
    this.updateLivesDisplay();

    // Flash screen red briefly
    this.cameras.main.flash(200, 255, 50, 50);

    if (remaining <= 0) {
      this.triggerGameOver();
    }
  }

  // --- Difficulty ramp ---

  checkDifficulty() {
    const threshold = this.lastDifficultyScore + DIFFICULTY.SCORE_THRESHOLD;
    if (gameState.score >= threshold && gameState.score > 0) {
      this.lastDifficultyScore = gameState.score - (gameState.score % DIFFICULTY.SCORE_THRESHOLD);
      gameState.difficulty += 1;

      // Increase fall speeds (capped)
      this.currentFallSpeed = Math.min(
        this.currentFallSpeed * DIFFICULTY.SPEED_MULTIPLIER,
        DIFFICULTY.MAX_FALL_SPEED
      );
      this.currentSkullFallSpeed = Math.min(
        this.currentSkullFallSpeed * DIFFICULTY.SPEED_MULTIPLIER,
        DIFFICULTY.MAX_FALL_SPEED
      );

      // Decrease spawn interval (capped)
      this.currentSpawnInterval = Math.max(
        this.currentSpawnInterval - DIFFICULTY.INTERVAL_REDUCTION,
        DIFFICULTY.MIN_SPAWN_INTERVAL
      );

      // Restart the timer with new interval
      this.spawnTimer.remove();
      this.spawnTimer = this.time.addEvent({
        delay: this.currentSpawnInterval,
        callback: this.spawnObject,
        callbackScope: this,
        loop: true,
      });

      eventBus.emit(Events.DIFFICULTY_UP, { difficulty: gameState.difficulty });
    }
  }

  // --- Off-screen cleanup ---

  cleanOffScreen(group) {
    const children = group.getChildren();
    for (let i = children.length - 1; i >= 0; i--) {
      const obj = children[i];
      if (obj && obj.y > GAME.HEIGHT + GEM.SIZE * 2) {
        obj.destroy();
      }
    }
  }

  // --- Lives display ---

  createLivesDisplay() {
    const fontSize = Math.round(GAME.HEIGHT * UI.BODY_RATIO);
    const heartSize = fontSize * 1.2;
    const startX = 10 * PX;
    const startY = GAME.HEIGHT - 30 * PX;

    // Clear existing
    this.livesTexts.forEach(t => t.destroy());
    this.livesTexts = [];

    for (let i = 0; i < gameState.lives; i++) {
      const heart = this.add.text(
        startX + i * (heartSize + 4 * PX),
        startY,
        '\u2764', // heart character
        {
          fontSize: heartSize + 'px',
          fontFamily: UI.FONT,
          color: COLORS.LIVES_RED,
        }
      ).setOrigin(0, 0.5).setDepth(100);
      this.livesTexts.push(heart);
    }
  }

  updateLivesDisplay() {
    // Hide hearts that are lost
    for (let i = 0; i < this.livesTexts.length; i++) {
      if (i >= gameState.lives) {
        this.livesTexts[i].setAlpha(0.2);
      }
    }
  }

  // --- Game over ---

  triggerGameOver() {
    if (gameState.gameOver) return;
    gameState.gameOver = true;

    // Stop spawning
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    // Stop player
    this.player.sprite.body.setVelocity(0, 0);

    eventBus.emit(Events.GAME_OVER, { score: gameState.score });

    // Brief delay before showing game over screen
    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene');
    });
  }

  // --- Background ---

  drawGradient() {
    const bg = this.add.graphics();
    const top = Phaser.Display.Color.IntegerToColor(COLORS.SKY_TOP);
    const bot = Phaser.Display.Color.IntegerToColor(COLORS.SKY_BOTTOM);
    const steps = 64;
    const bandH = Math.ceil(GAME.HEIGHT / steps);

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(top.red + (bot.red - top.red) * t);
      const g = Math.round(top.green + (bot.green - top.green) * t);
      const b = Math.round(top.blue + (bot.blue - top.blue) * t);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      bg.fillRect(0, i * bandH, GAME.WIDTH, bandH + 1);
    }

    bg.setDepth(-1);
  }
}
