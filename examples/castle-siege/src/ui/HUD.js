// =============================================================================
// HUD.js — Wave banner and castle health bar
// Listens to events and updates DOM elements. No in-game score display
// (Play.fun widget handles that).
// =============================================================================

import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class HUD {
  constructor() {
    this.waveBanner = document.getElementById('wave-banner');
    this.healthBarFill = document.getElementById('health-bar-fill');
    this.healthBarContainer = document.getElementById('health-bar-container');
    this.healthBarLabel = document.getElementById('health-bar-label');
    this.waveBannerTimeout = null;

    // Wave start — show banner
    eventBus.on(Events.WAVE_START, ({ wave, count }) => {
      this.showWaveBanner(`Wave ${wave} — ${count} enemies!`);
    });

    // Wave complete — show banner
    eventBus.on(Events.WAVE_COMPLETE, ({ wave }) => {
      this.showWaveBanner(`Wave ${wave} Complete!`);
    });

    // Castle hit — update health bar
    eventBus.on(Events.CASTLE_HIT, ({ health }) => {
      this.updateHealthBar(health);
    });

    // Game over — hide HUD
    eventBus.on(Events.GAME_OVER, () => {
      this.hideHUD();
    });

    // Game start — show HUD
    eventBus.on(Events.GAME_START, () => {
      this.showHUD();
      this.updateHealthBar(gameState.castleHealth);
    });
  }

  showWaveBanner(text) {
    if (!this.waveBanner) return;
    this.waveBanner.textContent = text;
    this.waveBanner.classList.add('visible');

    if (this.waveBannerTimeout) clearTimeout(this.waveBannerTimeout);
    this.waveBannerTimeout = setTimeout(() => {
      this.waveBanner.classList.remove('visible');
    }, 2500);
  }

  updateHealthBar(health) {
    if (!this.healthBarFill) return;
    const pct = Math.max(0, (health / gameState.maxCastleHealth) * 100);
    this.healthBarFill.style.width = pct + '%';

    // Color shifts as health drops
    if (pct > 50) {
      this.healthBarFill.style.background = 'linear-gradient(to right, #44cc44, #88ff88)';
    } else if (pct > 25) {
      this.healthBarFill.style.background = 'linear-gradient(to right, #ccaa00, #ffcc44)';
    } else {
      this.healthBarFill.style.background = 'linear-gradient(to right, #cc2222, #ff4444)';
    }
  }

  hideHUD() {
    if (this.healthBarContainer) this.healthBarContainer.style.display = 'none';
    if (this.healthBarLabel) this.healthBarLabel.style.display = 'none';
    if (this.waveBanner) this.waveBanner.classList.remove('visible');
  }

  showHUD() {
    if (this.healthBarContainer) this.healthBarContainer.style.display = '';
    if (this.healthBarLabel) this.healthBarLabel.style.display = '';
  }
}
