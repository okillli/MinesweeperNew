/**
 * FloatingTextSystem.js - Manages floating text effects for visual feedback
 *
 * DEPENDENCIES: None (standalone system)
 * DEPENDENTS: CanvasRenderer.js (calls render), main.js (triggers effects)
 *
 * Responsibilities:
 * - Create floating text that rises and fades ("+10 coins", "-1 HP")
 * - Animate scale and position
 * - Render text to canvas with shadows for readability
 */

class FloatingTextSystem {
  constructor() {
    /**
     * Active floating texts
     * @type {Array<FloatingText>}
     */
    this.texts = [];

    /**
     * Object pool for reusing text objects
     * @type {Array<FloatingText>}
     */
    this.pool = [];

    /**
     * Maximum texts allowed
     * @type {number}
     */
    this.maxTexts = 20;
  }

  /**
   * Gets a text object from pool or creates new one
   * @returns {FloatingText}
   */
  getText() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return {
      x: 0, y: 0,
      text: '',
      color: '#fff',
      size: 20,
      alpha: 1,
      life: 1,
      decay: 0.02,
      vy: -60, // Rise speed
      scale: 1,
      scaleVelocity: 0,
      shadow: true
    };
  }

  /**
   * Returns text to pool for reuse
   * @param {FloatingText} textObj
   */
  recycleText(textObj) {
    if (this.pool.length < 20) {
      this.pool.push(textObj);
    }
  }

  /**
   * Spawns floating text for coin gain
   *
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} amount - Coin amount
   */
  spawnCoinText(x, y, amount) {
    if (this.texts.length >= this.maxTexts) return;

    const textObj = this.getText();

    textObj.x = x;
    textObj.y = y;
    textObj.text = `🪙+${amount}`;
    textObj.color = '#ffd700';
    textObj.size = 16;
    textObj.alpha = 1;
    textObj.life = 1;
    textObj.decay = 0.018;
    textObj.vy = -50;
    textObj.scale = 0.5;
    textObj.scaleVelocity = 3; // Quick pop in
    textObj.shadow = true;

    this.texts.push(textObj);
  }

  /**
   * Spawns floating text for mana gain
   *
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} amount - Mana amount
   */
  spawnManaText(x, y, amount) {
    if (this.texts.length >= this.maxTexts) return;

    const textObj = this.getText();

    textObj.x = x;
    textObj.y = y - 15; // Offset from coin text
    textObj.text = `💎+${amount}`;
    textObj.color = '#4a90e2';
    textObj.size = 12;
    textObj.alpha = 1;
    textObj.life = 1;
    textObj.decay = 0.022;
    textObj.vy = -40;
    textObj.scale = 0.5;
    textObj.scaleVelocity = 3;
    textObj.shadow = true;

    this.texts.push(textObj);
  }

  /**
   * Spawns floating text for HP damage
   *
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} amount - Damage amount
   */
  spawnDamageText(x, y, amount) {
    if (this.texts.length >= this.maxTexts) return;

    const textObj = this.getText();

    textObj.x = x;
    textObj.y = y;
    textObj.text = `❤️-${amount}`;
    textObj.color = '#e63946';
    textObj.size = 20;
    textObj.alpha = 1;
    textObj.life = 1;
    textObj.decay = 0.015;
    textObj.vy = -30;
    textObj.scale = 0.3;
    textObj.scaleVelocity = 5; // Bigger pop for damage
    textObj.shadow = true;

    this.texts.push(textObj);
  }

  /**
   * Spawns floating text for healing
   *
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} amount - Heal amount
   */
  spawnHealText(x, y, amount) {
    if (this.texts.length >= this.maxTexts) return;

    const textObj = this.getText();

    textObj.x = x;
    textObj.y = y;
    textObj.text = `❤️+${amount}`;
    textObj.color = '#2ecc71';
    textObj.size = 18;
    textObj.alpha = 1;
    textObj.life = 1;
    textObj.decay = 0.018;
    textObj.vy = -40;
    textObj.scale = 0.5;
    textObj.scaleVelocity = 3;
    textObj.shadow = true;

    this.texts.push(textObj);
  }

  /**
   * Spawns custom floating text
   *
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} text - Text to display
   * @param {Object} config - Configuration options
   */
  spawn(x, y, text, config = {}) {
    if (this.texts.length >= this.maxTexts) return;

    const {
      color = '#fff',
      size = 18,
      decay = 0.02,
      vy = -50,
      shadow = true
    } = config;

    const textObj = this.getText();

    textObj.x = x;
    textObj.y = y;
    textObj.text = text;
    textObj.color = color;
    textObj.size = size;
    textObj.alpha = 1;
    textObj.life = 1;
    textObj.decay = decay;
    textObj.vy = vy;
    textObj.scale = 0.5;
    textObj.scaleVelocity = 3;
    textObj.shadow = shadow;

    this.texts.push(textObj);
  }

  /**
   * Updates all floating texts
   *
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];

      // Move upward
      t.y += t.vy * deltaTime;

      // Animate scale (pop in then settle)
      if (t.scale < 1) {
        t.scale += t.scaleVelocity * deltaTime;
        if (t.scale > 1.2) {
          t.scale = 1.2;
          t.scaleVelocity = -1; // Bounce back
        }
      } else if (t.scale > 1 && t.scaleVelocity < 0) {
        t.scale += t.scaleVelocity * deltaTime;
        if (t.scale < 1) {
          t.scale = 1;
          t.scaleVelocity = 0;
        }
      }

      // Decay life and alpha
      t.life -= t.decay;
      t.alpha = Math.max(0, t.life);

      // Remove dead texts
      if (t.life <= 0) {
        this.recycleText(t);
        this.texts.splice(i, 1);
      }
    }
  }

  /**
   * Renders all floating texts to canvas
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    ctx.save();

    for (const t of this.texts) {
      ctx.globalAlpha = t.alpha;

      // Apply scale transformation
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      // Draw text shadow for readability
      if (t.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
      }

      ctx.font = `bold ${t.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Clears all floating texts
   */
  clear() {
    for (const t of this.texts) {
      this.recycleText(t);
    }
    this.texts = [];
  }

  /**
   * Returns true if there are active texts
   * @returns {boolean}
   */
  hasActiveTexts() {
    return this.texts.length > 0;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingTextSystem;
}
