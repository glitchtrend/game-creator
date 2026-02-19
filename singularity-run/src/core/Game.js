import * as THREE from 'three';
import { GAME, CAMERA, COLORS, RUNNER, COLLECTIBLE } from './Constants.js';
import { eventBus, Events } from './EventBus.js';
import { gameState } from './GameState.js';
import { InputSystem } from '../systems/InputSystem.js';
import { Player } from '../gameplay/Player.js';
import { ObstacleManager } from '../gameplay/ObstacleManager.js';
import { LevelBuilder } from '../level/LevelBuilder.js';
import { Menu } from '../ui/Menu.js';

export class Game {
  constructor() {
    this.clock = new THREE.Clock();

    // Renderer (DPR capped for mobile GPU performance)
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, GAME.MAX_DPR));
    this.renderer.setClearColor(COLORS.SKY);
    document.body.prepend(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      GAME.FOV,
      window.innerWidth / window.innerHeight,
      GAME.NEAR,
      GAME.FAR
    );

    // Systems
    this.input = new InputSystem();
    this.level = new LevelBuilder(this.scene);
    this.menu = new Menu();
    this.obstacles = new ObstacleManager(this.scene);
    this.player = null;

    // Score accumulator for fractional distance
    this._scoreAccumulator = 0;

    // Events
    eventBus.on(Events.GAME_RESTART, () => this.restart());

    // Resize
    window.addEventListener('resize', () => this.onResize());

    // Auto-start game (no title screen -- Play.fun handles the chrome)
    this.startGame();

    // Start render loop (official Three.js pattern -- pauses when tab hidden)
    this.renderer.setAnimationLoop(() => this.animate());
  }

  startGame() {
    gameState.reset();
    gameState.started = true;
    gameState.currentSpeed = RUNNER.START_SPEED;

    this.player = new Player(this.scene);
    this._scoreAccumulator = 0;
    this.input.setGameActive(true);

    // Position camera behind player
    this._updateCamera(true);

    eventBus.emit(Events.GAME_START);
    eventBus.emit(Events.SPEED_CHANGED, { speed: gameState.currentSpeed });
  }

  restart() {
    // Clean up existing objects
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    this.obstacles.clear();
    this.level.reset();

    this.startGame();
  }

  animate() {
    const delta = Math.min(this.clock.getDelta(), GAME.MAX_DELTA);

    this.input.update();

    if (gameState.started && !gameState.gameOver && this.player) {
      // Increase speed over time
      if (gameState.currentSpeed < RUNNER.MAX_SPEED) {
        gameState.currentSpeed += RUNNER.ACCELERATION * delta;
        if (gameState.currentSpeed > RUNNER.MAX_SPEED) {
          gameState.currentSpeed = RUNNER.MAX_SPEED;
        }
      }

      // Move player forward
      const distance = gameState.currentSpeed * delta;
      this.player.moveForward(distance);

      // Update player (lane switching, jumping, sliding)
      this.player.update(delta, this.input);

      // Update distance traveled and score (1 point per unit)
      gameState.distanceTraveled += distance;
      this._scoreAccumulator += distance;
      if (this._scoreAccumulator >= 1) {
        const points = Math.floor(this._scoreAccumulator);
        this._scoreAccumulator -= points;
        gameState.addScore(points);
        eventBus.emit(Events.SCORE_CHANGED, { score: gameState.score, delta: points });
      }

      // Update obstacles
      this.obstacles.update(delta, this.player.runZ, gameState.currentSpeed);

      // Check collisions with obstacles
      const playerBox = this.player.getCollisionBox();
      const obstacleBoxes = this.obstacles.getObstacleBoxes();
      for (const box of obstacleBoxes) {
        if (playerBox.intersectsBox(box)) {
          this._onPlayerDied();
          break;
        }
      }

      // Check collectible collisions
      if (!gameState.gameOver) {
        const collected = this.obstacles.checkCollectibleCollision(playerBox);
        if (collected) {
          gameState.addScore(COLLECTIBLE.POINTS);
          eventBus.emit(Events.COLLECTIBLE_PICKED, { points: COLLECTIBLE.POINTS });
          eventBus.emit(Events.SCORE_CHANGED, { score: gameState.score, delta: COLLECTIBLE.POINTS });
        }
      }

      // Update tunnel/level to follow player
      this.level.update(this.player.runZ);

      // Update camera
      this._updateCamera(false);
    }

    this.renderer.render(this.scene, this.camera);
  }

  _updateCamera(instant) {
    if (!this.player) return;

    const p = this.player.mesh.position;
    const targetX = p.x;
    const targetY = p.y + CAMERA.OFFSET_Y;
    const targetZ = p.z + CAMERA.OFFSET_Z;

    if (instant) {
      this.camera.position.set(targetX, targetY, targetZ);
    } else {
      // Smooth camera follow
      this.camera.position.x += (targetX - this.camera.position.x) * 0.1;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.1;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.15;
    }

    this.camera.lookAt(p.x, p.y + 1, p.z + CAMERA.LOOK_AHEAD);
  }

  _onPlayerDied() {
    gameState.gameOver = true;
    this.input.setGameActive(false);

    eventBus.emit(Events.PLAYER_DIED);
    eventBus.emit(Events.MUSIC_STOP);
    eventBus.emit(Events.GAME_OVER, { score: gameState.score });
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
