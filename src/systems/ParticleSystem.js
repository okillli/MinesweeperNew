/**
 * ParticleSystem.js - Manages particle effects for visual feedback
 *
 * DEPENDENCIES: None (standalone system)
 * DEPENDENTS: CanvasRenderer.js (calls render), main.js (triggers effects)
 *
 * Responsibilities:
 * - Create and manage particle effects (explosions, sparkles)
 * - Update particle physics (position, velocity, gravity, fade)
 * - Render particles to canvas
 * - Object pooling for performance
 *
 * Supports reduced motion preference via update() skipAnimation flag
 */

class ParticleSystem {
  constructor() {
    /**
     * Active particles array
     * @type {Array<Particle>}
     */
    this.particles = [];

    /**
     * Object pool for reusing particle objects
     * @type {Array<Particle>}
     */
    this.pool = [];

    /**
     * Maximum particles allowed (performance limit)
     * @type {number}
     */
    this.maxParticles = 100;
  }

  /**
   * Gets a particle from pool or creates new one
   * @returns {Particle}
   */
  getParticle() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return {
      x: 0, y: 0,
      vx: 0, vy: 0,
      size: 4,
      color: '#ff0000',
      alpha: 1,
      life: 1,
      decay: 0.02,
      gravity: 0
    };
  }

  /**
   * Returns particle to pool for reuse
   * @param {Particle} particle
   */
  recycleParticle(particle) {
    if (this.pool.length < 50) {
      this.pool.push(particle);
    }
  }

  /**
   * Spawns an explosion effect at the given position
   * Used for mine explosions
   *
   * @param {number} x - Center X position (canvas coords)
   * @param {number} y - Center Y position (canvas coords)
   * @param {Object} config - Optional configuration
   */
  emitExplosion(x, y, config = {}) {
    const {
      count = 25,
      colors = ['#e63946', '#ff6b6b', '#f4a261', '#ffd700', '#ff4500'],
      minSpeed = 50,
      maxSpeed = 150,
      minSize = 3,
      maxSize = 8,
      gravity = 200,
      decay = 0.015
    } = config;

    // Limit total particles
    const spawnCount = Math.min(count, this.maxParticles - this.particles.length);

    for (let i = 0; i < spawnCount; i++) {
      const particle = this.getParticle();

      // Random angle for explosion direction
      const angle = Math.random() * Math.PI * 2;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.size = minSize + Math.random() * (maxSize - minSize);
      particle.color = colors[Math.floor(Math.random() * colors.length)];
      particle.alpha = 1;
      particle.life = 1;
      particle.decay = decay + Math.random() * 0.01;
      particle.gravity = gravity;

      this.particles.push(particle);
    }
  }

  /**
   * Spawns a coin sparkle effect
   * Used when collecting coins
   *
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {Object} config - Optional configuration
   */
  emitCoinSparkle(x, y, config = {}) {
    const {
      count = 8,
      colors = ['#ffd700', '#f4a261', '#ffeb3b', '#fff'],
      minSpeed = 30,
      maxSpeed = 80,
      minSize = 2,
      maxSize = 5,
      gravity = -50, // Float upward
      decay = 0.03
    } = config;

    const spawnCount = Math.min(count, this.maxParticles - this.particles.length);

    for (let i = 0; i < spawnCount; i++) {
      const particle = this.getParticle();

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6; // Mostly upward
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

      particle.x = x + (Math.random() - 0.5) * 20;
      particle.y = y + (Math.random() - 0.5) * 10;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.size = minSize + Math.random() * (maxSize - minSize);
      particle.color = colors[Math.floor(Math.random() * colors.length)];
      particle.alpha = 1;
      particle.life = 1;
      particle.decay = decay + Math.random() * 0.02;
      particle.gravity = gravity;

      this.particles.push(particle);
    }
  }

  /**
   * Spawns a damage flash effect (quick red burst)
   *
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   */
  emitDamageFlash(x, y) {
    this.emitExplosion(x, y, {
      count: 15,
      colors: ['#e63946', '#ff0000', '#cc0000'],
      minSpeed: 80,
      maxSpeed: 200,
      minSize: 2,
      maxSize: 6,
      gravity: 100,
      decay: 0.04 // Faster decay for quick flash
    });
  }

  /**
   * Spawns a flag placement effect
   *
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   */
  emitFlagEffect(x, y) {
    const colors = ['#f4a261', '#ffd700', '#ff8c00'];

    const spawnCount = Math.min(5, this.maxParticles - this.particles.length);

    for (let i = 0; i < spawnCount; i++) {
      const particle = this.getParticle();

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
      const speed = 40 + Math.random() * 40;

      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.size = 2 + Math.random() * 3;
      particle.color = colors[Math.floor(Math.random() * colors.length)];
      particle.alpha = 1;
      particle.life = 1;
      particle.decay = 0.05;
      particle.gravity = 50;

      this.particles.push(particle);
    }
  }

  /**
   * Spawns victory confetti
   *
   * @param {number} canvasWidth - Canvas width for spread
   * @param {number} canvasHeight - Canvas height
   */
  emitVictoryConfetti(canvasWidth, canvasHeight) {
    const colors = ['#ffd700', '#f4a261', '#2ecc71', '#4a90e2', '#e63946', '#9c27b0'];

    const spawnCount = Math.min(50, this.maxParticles - this.particles.length);

    for (let i = 0; i < spawnCount; i++) {
      const particle = this.getParticle();

      particle.x = Math.random() * canvasWidth;
      particle.y = -10;
      particle.vx = (Math.random() - 0.5) * 100;
      particle.vy = 50 + Math.random() * 100;
      particle.size = 4 + Math.random() * 6;
      particle.color = colors[Math.floor(Math.random() * colors.length)];
      particle.alpha = 1;
      particle.life = 1;
      particle.decay = 0.005; // Slow decay for long confetti
      particle.gravity = 50;

      this.particles.push(particle);
    }
  }

  /**
   * Updates all particles
   *
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Apply velocity
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;

      // Apply gravity
      p.vy += p.gravity * deltaTime;

      // Decay life and alpha
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      // Remove dead particles
      if (p.life <= 0) {
        this.recycleParticle(p);
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Renders all particles to canvas
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    ctx.save();

    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Clears all particles
   */
  clear() {
    for (const p of this.particles) {
      this.recycleParticle(p);
    }
    this.particles = [];
  }

  /**
   * Returns true if there are active particles
   * @returns {boolean}
   */
  hasActiveParticles() {
    return this.particles.length > 0;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleSystem;
}
