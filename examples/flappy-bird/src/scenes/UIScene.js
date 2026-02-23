import Phaser from 'phaser';
import { GAME, COLORS, TRANSITION, UI } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    const cx = GAME.WIDTH / 2;

    // Big centered score (Flappy Bird style)
    this.scoreText = this.add.text(cx, GAME.HEIGHT * UI.SCORE_Y_RATIO, '0', {
      fontSize: `${Math.round(GAME.HEIGHT * UI.SCORE_FONT_RATIO)}px`,
      fontFamily: UI.FONT,
      color: COLORS.UI_TEXT,
      stroke: COLORS.SCORE_STROKE,
      strokeThickness: UI.STROKE,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100);

    this.onScoreChanged = ({ score }) => {
      this.scoreText.setText(`${score}`);
      this.tweens.add({
        targets: this.scoreText,
        scaleX: TRANSITION.SCORE_POP_SCALE,
        scaleY: TRANSITION.SCORE_POP_SCALE,
        duration: TRANSITION.SCORE_POP_DURATION,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    };

    eventBus.on(Events.SCORE_CHANGED, this.onScoreChanged);

    this.events.on('shutdown', () => {
      eventBus.off(Events.SCORE_CHANGED, this.onScoreChanged);
    });
  }
}
