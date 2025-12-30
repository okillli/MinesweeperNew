/**
 * Cell - Individual cell entity in the game grid
 *
 * Represents a single cell in the minesweeper grid with its state properties.
 * Pure data entity with no rendering or game logic.
 *
 * DEPENDENCIES (what this imports):
 * - None (pure data structure)
 *
 * DEPENDENTS (what imports this):
 * - Grid.js (creates and manages Cell instances)
 *
 * CHANGE IMPACT: CRITICAL
 * - Grid.js directly depends on Cell structure
 * - Property changes break Grid initialization
 * - Changes require updates to Grid generation logic
 *
 * @class Cell
 * @example
 * const cell = new Cell(3, 5);
 * cell.isMine = true;
 * cell.isRevealed = true;
 */
class Cell {
  /**
   * Creates a new Cell instance
   *
   * @param {number} x - Column position (0-indexed)
   * @param {number} y - Row position (0-indexed)
   */
  constructor(x, y) {
    /** @type {number} Column position in the grid */
    this.x = x;

    /** @type {number} Row position in the grid */
    this.y = y;

    /** @type {boolean} Whether this cell contains a mine */
    this.isMine = false;

    /** @type {boolean} Whether this cell has been revealed to the player */
    this.isRevealed = false;

    /** @type {boolean} Whether this cell has been flagged by the player */
    this.isFlagged = false;

    /** @type {number} Count of adjacent mines (0-8) */
    this.number = 0;
  }
}

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Cell;
}
