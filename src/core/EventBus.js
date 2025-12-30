/**
 * EventBus - Decoupled event communication system
 *
 * Provides a publish-subscribe pattern for communication between
 * game systems without tight coupling. Events allow systems to react
 * to game state changes without direct references.
 *
 * @example
 * const events = new EventBus();
 *
 * // Register listener
 * events.on('cell_revealed', (data) => {
 *   console.log('Cell revealed:', data);
 * });
 *
 * // Emit event
 * events.emit('cell_revealed', { x: 5, y: 3, isMine: false });
 *
 * // Remove listener
 * events.off('cell_revealed', handlerFunction);
 *
 * NOTE: This class is implemented but not integrated in Phase 1.
 * Phase 2 will integrate EventBus for:
 * - Animation triggers (cell reveal, mine explosion)
 * - Sound effects (flag placed, mine hit, board complete)
 * - Achievement unlocks
 * - Statistics tracking
 */
class EventBus {
  /**
   * Initialize the event bus with empty listener registry
   */
  constructor() {
    /**
     * Maps event names to arrays of callback functions
     * @type {Object<string, Function[]>}
     */
    this.listeners = {};
  }

  /**
   * Register a listener callback for an event
   *
   * Multiple listeners can be registered for the same event.
   * They will be called in the order they were registered.
   *
   * @param {string} event - Event name to listen for
   * @param {Function} callback - Function to call when event is emitted.
   *                              Receives event data as parameter.
   *
   * @example
   * events.on('game_over', (data) => {
   *   console.log('Game ended with score:', data.score);
   * });
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove a listener callback from an event
   *
   * Removes the exact callback function. If the callback was registered
   * multiple times, only the first occurrence is removed.
   *
   * @param {string} event - Event name to stop listening for
   * @param {Function} callback - The exact callback function to remove
   *
   * @example
   * const handler = (data) => console.log(data);
   * events.on('cell_revealed', handler);
   * events.off('cell_revealed', handler); // Removes this specific handler
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emit an event to all registered listeners
   *
   * Calls all listener callbacks for the given event in order.
   * If a listener throws an error, it is caught and logged.
   * Other listeners will still be called.
   *
   * @param {string} event - Event name to emit
   * @param {*} data - Data to pass to all listeners
   *
   * @example
   * events.emit('cell_revealed', { x: 5, y: 3, isMine: false });
   */
  emit(event, data) {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Error in event handler for ${event}:`, e);
      }
    });
  }
}

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventBus;
}
