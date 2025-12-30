/**
 * EffectsManager.js - Central coordinator for all visual effects
 *
 * DEPENDENCIES:
 * - ParticleSystem.js
 * - FloatingTextSystem.js
 *
 * DEPENDENTS:
 * - main.js (triggers effects)
 * - CanvasRenderer.js (renders effects)
 * - Game.js (updates effects)
 *
 * Responsibilities:
 * - Coordinate particle and text effects
 * - Handle screen shake and damage flash
 * - Respect reduced motion preferences
 * - Provide simple API for triggering effects
 */

class EffectsManager {
  /**
   * @param {HTMLElement} gameContainer - Container element for screen effects
   */
  constructor(gameContainer) {
    /**
     * Particle system for explosions and sparkles
     * @type {ParticleSystem}
     */
    this.particles = new ParticleSystem();

    /**
     * Floating text system for +coins, -HP, etc.
     * @type {FloatingTextSystem}
     */
    this.floatingText = new FloatingTextSystem();

    /**
     * Reference to game container for screen effects
     * @type {HTMLElement}
     */
    this.container = gameContainer;

    /**
     * Canvas element reference (set by setCanvas)
     * @type {HTMLCanvasElement|null}
     */
    this.canvas = null;

    /**
     * Screen shake state
     */
    this.screenShake = {
      active: false,
      intensity: 0,
      duration: 0,
      elapsed: 0
    };

    /**
     * Whether reduced motion is preferred
     * @type {boolean}
     */
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Listen for reduced motion preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
    });
  }

  /**
   * Sets the canvas reference for effects positioning
   * @param {HTMLCanvasElement} canvas
   */
  setCanvas(canvas) {
    this.canvas = canvas;
  }

  /**
   * Triggers a mine explosion effect
   *
   * @param {number} cellX - Grid cell X coordinate
   * @param {number} cellY - Grid cell Y coordinate
   * @param {Object} layout - Grid layout from renderer.calculateGridLayout()
   */
  mineExplosion(cellX, cellY, layout) {
    if (this.reducedMotion) return;
    if (!layout) return;

    // Calculate canvas position from grid coordinates
    const canvasX = layout.offsetX + cellX * (layout.cellSize + layout.padding) + layout.cellSize / 2;
    const canvasY = layout.offsetY + cellY * (layout.cellSize + layout.padding) + layout.cellSize / 2;

    this.particles.emitExplosion(canvasX, canvasY);
  }

  /**
   * Triggers damage feedback effects
   *
   * @param {number} amount - Damage amount
   * @param {number} cellX - Grid cell X (optional, for positioned effects)
   * @param {number} cellY - Grid cell Y (optional)
   * @param {Object} layout - Grid layout (optional)
   */
  damage(amount, cellX = null, cellY = null, layout = null) {
    // Screen shake
    this.triggerScreenShake(5, 150);

    // Damage flash overlay
    this.triggerDamageFlash();

    // Floating damage text at cell position
    if (cellX !== null && cellY !== null && layout) {
      const canvasX = layout.offsetX + cellX * (layout.cellSize + layout.padding) + layout.cellSize / 2;
      const canvasY = layout.offsetY + cellY * (layout.cellSize + layout.padding) + layout.cellSize / 2;

      if (!this.reducedMotion) {
        this.particles.emitDamageFlash(canvasX, canvasY);
      }
      this.floatingText.spawnDamageText(canvasX, canvasY - 10, amount);
    }
  }

  /**
   * Triggers coin gain effect
   *
   * @param {number} amount - Coins earned
   * @param {number} cellX - Grid cell X
   * @param {number} cellY - Grid cell Y
   * @param {Object} layout - Grid layout
   */
  coinGain(amount, cellX, cellY, layout) {
    if (!layout) return;

    const canvasX = layout.offsetX + cellX * (layout.cellSize + layout.padding) + layout.cellSize / 2;
    const canvasY = layout.offsetY + cellY * (layout.cellSize + layout.padding) + layout.cellSize / 2;

    this.floatingText.spawnCoinText(canvasX, canvasY, amount);

    if (!this.reducedMotion) {
      this.particles.emitCoinSparkle(canvasX, canvasY);
    }
  }

  /**
   * Triggers mana gain effect
   *
   * @param {number} amount - Mana earned
   * @param {number} cellX - Grid cell X
   * @param {number} cellY - Grid cell Y
   * @param {Object} layout - Grid layout
   */
  manaGain(amount, cellX, cellY, layout) {
    if (!layout) return;

    const canvasX = layout.offsetX + cellX * (layout.cellSize + layout.padding) + layout.cellSize / 2;
    const canvasY = layout.offsetY + cellY * (layout.cellSize + layout.padding) + layout.cellSize / 2;

    // Mana text slightly offset from coins
    this.floatingText.spawnManaText(canvasX + 15, canvasY + 5, amount);
  }

  /**
   * Triggers flag placement effect
   *
   * @param {number} cellX - Grid cell X
   * @param {number} cellY - Grid cell Y
   * @param {Object} layout - Grid layout
   */
  flagPlaced(cellX, cellY, layout) {
    if (this.reducedMotion) return;
    if (!layout) return;

    const canvasX = layout.offsetX + cellX * (layout.cellSize + layout.padding) + layout.cellSize / 2;
    const canvasY = layout.offsetY + cellY * (layout.cellSize + layout.padding) + layout.cellSize / 2;

    this.particles.emitFlagEffect(canvasX, canvasY);
  }

  /**
   * Triggers healing effect
   *
   * @param {number} amount - Heal amount
   */
  heal(amount) {
    // Show heal text at HUD position
    const hpDisplay = document.getElementById('hp-display');
    if (hpDisplay) {
      const rect = hpDisplay.getBoundingClientRect();
      const canvasRect = this.canvas ? this.canvas.getBoundingClientRect() : { left: 0, top: 0 };

      // Convert to canvas-relative coordinates
      const x = rect.left + rect.width / 2 - canvasRect.left;
      const y = rect.top + rect.height / 2 - canvasRect.top;

      this.floatingText.spawnHealText(x, y, amount);
    }
  }

  /**
   * Triggers victory celebration
   */
  victory() {
    if (this.reducedMotion) return;

    if (this.canvas) {
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      this.particles.emitVictoryConfetti(width, height);
    }
  }

  /**
   * Triggers screen shake effect
   *
   * @param {number} intensity - Shake intensity in pixels
   * @param {number} duration - Duration in milliseconds
   */
  triggerScreenShake(intensity = 5, duration = 150) {
    if (this.reducedMotion) return;

    this.screenShake.active = true;
    this.screenShake.intensity = intensity;
    this.screenShake.duration = duration / 1000; // Convert to seconds
    this.screenShake.elapsed = 0;

    // Add shake class for CSS animation fallback
    if (this.canvas) {
      this.canvas.classList.add('screen-shake');
      setTimeout(() => {
        this.canvas.classList.remove('screen-shake');
      }, duration);
    }
  }

  /**
   * Triggers damage flash overlay effect
   */
  triggerDamageFlash() {
    if (this.reducedMotion) return;

    // Create or reuse damage flash overlay
    let overlay = document.getElementById('damage-flash-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'damage-flash-overlay';
      overlay.className = 'damage-flash-overlay';
      document.body.appendChild(overlay);
    }

    // Trigger animation
    overlay.classList.remove('active');
    // Force reflow to restart animation
    void overlay.offsetWidth;
    overlay.classList.add('active');

    // Remove active class after animation
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 200);
  }

  /**
   * Updates all effect systems
   *
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Update particles
    this.particles.update(deltaTime);

    // Update floating text
    this.floatingText.update(deltaTime);

    // Update screen shake
    if (this.screenShake.active) {
      this.screenShake.elapsed += deltaTime;

      if (this.screenShake.elapsed >= this.screenShake.duration) {
        this.screenShake.active = false;
        // Reset canvas transform
        if (this.canvas) {
          this.canvas.style.transform = '';
        }
      } else {
        // Apply shake offset
        const progress = this.screenShake.elapsed / this.screenShake.duration;
        const decay = 1 - progress; // Decay over time
        const offsetX = (Math.random() - 0.5) * 2 * this.screenShake.intensity * decay;
        const offsetY = (Math.random() - 0.5) * 2 * this.screenShake.intensity * decay;

        if (this.canvas) {
          this.canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
      }
    }
  }

  /**
   * Renders all canvas-based effects
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    // Render particles
    this.particles.render(ctx);

    // Render floating text
    this.floatingText.render(ctx);
  }

  /**
   * Clears all effects
   */
  clear() {
    this.particles.clear();
    this.floatingText.clear();
    this.screenShake.active = false;
    if (this.canvas) {
      this.canvas.style.transform = '';
      this.canvas.classList.remove('screen-shake');
    }
  }

  /**
   * Returns true if there are active effects
   * @returns {boolean}
   */
  hasActiveEffects() {
    return this.particles.hasActiveParticles() ||
           this.floatingText.hasActiveTexts() ||
           this.screenShake.active;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EffectsManager;
}
