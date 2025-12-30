/**
 * Game.js
 *
 * Main game loop orchestrator using RequestAnimationFrame pattern.
 * Coordinates the update-render cycle and manages the game lifecycle.
 *
 * DEPENDENCIES (what this imports):
 * - GameState (implicit - creates instance)
 * - CanvasRenderer (implicit - creates instance)
 *
 * DEPENDENTS (what imports this):
 * - main.js (creates Game instance, calls start/stop/render)
 *
 * CRITICAL PATHS:
 * 1. RAF loop → Game.loop() → Game.update() → GameState.update()
 * 2. RAF loop → Game.loop() → Game.render() → CanvasRenderer.render()
 * 3. User clicks "Start" → main.js → game.start() → RAF begins
 * 4. Game over → main.js → game.stop() → RAF halts
 *
 * CHANGE IMPACT: HIGH
 * - Central coordinator but well-isolated
 * - Interface changes affect main.js initialization
 * - Loop timing changes affect all gameplay
 *
 * SIDE EFFECTS:
 * - RAF scheduling (can affect browser performance)
 * - Continuous rendering (CPU usage)
 * - Error handling stops loop (prevents error spam)
 *
 * ASSUMPTIONS:
 * - Canvas element exists and is valid when constructed
 * - GameState and CanvasRenderer initialize successfully
 * - RAF is available in browser
 *
 * Responsibilities:
 * - RAF loop management with delta time calculation
 * - Coordinating state updates via GameState
 * - Coordinating visual rendering via CanvasRenderer
 * - Starting/stopping the game loop
 *
 * Pattern: Strict separation between update (logic) and render (visuals)
 */

/**
 * Core game loop orchestrator
 *
 * Manages the main game loop using requestAnimationFrame, coordinating
 * updates to game state and rendering to the canvas. Maintains frame-
 * independent timing using delta time calculations.
 */
class Game {
  /**
   * Creates a new Game instance
   *
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   */
  constructor(canvas) {
    /**
     * Game state manager - single source of truth for all game data
     * @type {GameState}
     */
    this.state = new GameState();

    /**
     * Canvas renderer - handles all visual output
     * @type {CanvasRenderer}
     */
    this.renderer = new CanvasRenderer(canvas);

    /**
     * Last timestamp from RAF, used for delta time calculation
     * @type {number}
     */
    this.lastTime = 0;

    /**
     * Whether the game loop is currently running
     * @type {boolean}
     */
    this.running = false;
  }

  /**
   * Main game loop using RequestAnimationFrame
   *
   * Calculates delta time, updates game state, renders current frame,
   * and schedules the next frame. Stops automatically when running is false.
   *
   * @param {number} timestamp - High-resolution timestamp from RAF
   */
  loop(timestamp) {
    if (!this.running) return;

    try {
      // Calculate delta time in seconds
      const deltaTime = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;

      // Update game state (logic)
      this.update(deltaTime);

      // Render current state (visuals)
      this.render();
    } catch (error) {
      // Log error for debugging
      console.error('Game loop error:', error);
      console.error('Stack trace:', error.stack);

      // Stop the game loop to prevent error spam
      this.running = false;

      // Optionally: Show error to user (can add later)
      // this.showErrorScreen?.(error);

      // Don't continue loop after error
      return;
    }

    // Continue loop (only if no error occurred)
    requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Updates game state based on elapsed time
   *
   * Delegates to GameState.update() which handles all game logic updates.
   * Delta time ensures frame-independent behavior.
   *
   * @param {number} deltaTime - Time elapsed since last frame (in seconds)
   */
  update(deltaTime) {
    // Update all game systems
    this.state.update(deltaTime);
  }

  /**
   * Renders the current game state to the canvas
   *
   * Delegates to CanvasRenderer.render() which reads from state but never
   * modifies it, maintaining strict separation of concerns.
   */
  render() {
    // Render grid to canvas
    this.renderer.render(this.state);
  }

  /**
   * Starts the game loop
   *
   * Sets running flag, initializes lastTime, and begins the RAF loop.
   * Safe to call multiple times - subsequent calls have no effect.
   */
  start() {
    if (this.running) return; // Already running, don't restart

    this.running = true;
    this.lastTime = 0; // Will be set on first frame
    requestAnimationFrame((t) => {
      this.lastTime = t; // Initialize with RAF timestamp
      this.loop(t);
    });
  }

  /**
   * Stops the game loop
   *
   * Sets running flag to false, which will halt the loop after the current
   * frame completes. Does not reset state - use this for pause functionality.
   */
  stop() {
    this.running = false;
  }
}

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
