import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class Menu {
  constructor() {
    this.gameoverOverlay = document.getElementById('gameover-overlay');
    this.restartBtn = document.getElementById('restart-btn');
    this.finalScoreEl = document.getElementById('final-score');
    this.bestScoreEl = document.getElementById('best-score');

    this.restartBtn.addEventListener('click', () => {
      this.gameoverOverlay.classList.add('hidden');
      eventBus.emit(Events.GAME_RESTART);
    });

    // Also allow tap anywhere on the overlay to restart (mobile friendly)
    this.gameoverOverlay.addEventListener('click', (e) => {
      if (e.target === this.gameoverOverlay) {
        this.gameoverOverlay.classList.add('hidden');
        eventBus.emit(Events.GAME_RESTART);
      }
    });

    eventBus.on(Events.GAME_OVER, ({ score }) => this.showGameOver(score));
  }

  showGameOver(score) {
    this.finalScoreEl.textContent = `Score: ${Math.floor(score)}`;
    this.bestScoreEl.textContent = `Best: ${Math.floor(gameState.bestScore)}`;
    this.gameoverOverlay.classList.remove('hidden');
  }
}
