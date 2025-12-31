/**
 * Grid class - Manages the minesweeper game grid
 *
 * The Grid is the core data structure for the minesweeper game. It handles:
 * - Cell creation and initialization
 * - Mine placement (random generation)
 * - Number calculation (counting adjacent mines)
 * - Cell revealing with auto-cascade for zeros
 * - Flagging mechanics
 * - Chording (auto-reveal when flags match numbers)
 * - Win condition checking
 *
 * DEPENDENCIES (what this imports):
 * - Cell.js (creates cell instances for grid)
 *
 * DEPENDENTS (what imports this):
 * - main.js (creates Grid instances, calls reveal/flag/chord methods)
 * - Game.js (accesses via GameState.grid)
 * - CanvasRenderer.js (reads grid state for rendering)
 * - GameState.js (stores as currentRun.grid)
 *
 * CRITICAL PATHS:
 * 1. Game loop → GameState.grid → CanvasRenderer reads → visual output
 * 2. User click → main.js handlers → Grid.revealCell() → cascade logic → state update
 * 3. Flag action → Grid.toggleFlag() → flag count tracking
 * 4. Chord action → Grid.chord() → batch reveal logic
 *
 * CHANGE IMPACT: CRITICAL
 * - Central to all gameplay mechanics
 * - Changes affect rendering, input handling, and game logic
 * - Methods called from multiple input paths (mouse, touch, keyboard)
 *
 * SIDE EFFECTS:
 * - Modifies Cell.isRevealed state (affects rendering)
 * - Modifies Cell.isFlagged state (affects rendering and chord logic)
 * - Increments Grid.revealed counter (affects win condition)
 * - Increments Grid.flagged counter (affects chord validation)
 * - Cascading reveals can affect many cells at once
 *
 * ASSUMPTIONS:
 * - Cell structure remains stable (x, y, isMine, isRevealed, isFlagged, number)
 * - Grid coordinates are always within bounds when called from main.js
 * - Grid is initialized before any operations are performed
 *
 * Grid uses a 2D array indexed as cells[y][x] (row-major order):
 * - x represents column (horizontal position)
 * - y represents row (vertical position)
 *
 * @class
 */
class Grid {
  /**
   * Creates a new Grid instance
   *
   * @param {number} width - Number of columns in the grid
   * @param {number} height - Number of rows in the grid
   * @param {number} mineCount - Number of mines to place
   */
  constructor(width, height, mineCount) {
    // Validate dimensions are positive integers
    if (!Number.isInteger(width) || width <= 0) {
      throw new Error(`Invalid grid width: ${width}. Must be a positive integer.`);
    }
    if (!Number.isInteger(height) || height <= 0) {
      throw new Error(`Invalid grid height: ${height}. Must be a positive integer.`);
    }

    // Validate mine count
    if (!Number.isInteger(mineCount) || mineCount < 0) {
      throw new Error(`Invalid mine count: ${mineCount}. Must be a non-negative integer.`);
    }

    const totalCells = width * height;
    if (mineCount >= totalCells) {
      throw new Error(
        `Too many mines (${mineCount}) for grid size ${width}×${height} (${totalCells} cells). ` +
        `Maximum mines: ${totalCells - 1}.`
      );
    }

    /**
     * Number of columns in the grid
     * @type {number}
     */
    this.width = width;

    /**
     * Number of rows in the grid
     * @type {number}
     */
    this.height = height;

    /**
     * Total number of mines in the grid
     * @type {number}
     */
    this.mineCount = mineCount;

    /**
     * 2D array of cells, indexed as cells[y][x]
     * @type {Cell[][]}
     */
    this.cells = [];

    /**
     * Number of cells currently revealed
     * @type {number}
     */
    this.revealed = 0;

    /**
     * Number of cells currently flagged
     * @type {number}
     */
    this.flagged = 0;

    // Generate the grid on construction
    this.generate();
  }

  /**
   * Generates the complete grid
   *
   * This is the main initialization method that:
   * 1. Creates all cells
   * 2. Places mines randomly
   * 3. Calculates numbers for all cells
   */
  generate() {
    // Create cells
    for (let y = 0; y < this.height; y++) {
      this.cells[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.cells[y][x] = new Cell(x, y);
      }
    }

    // Place mines (randomly)
    this.placeMines();

    // Calculate numbers
    this.calculateNumbers();
  }

  /**
   * Randomly places mines in the grid
   *
   * Uses a simple rejection sampling algorithm:
   * - Generate random coordinates
   * - If cell already has a mine, try again
   * - Otherwise, place mine and increment counter
   * - Repeat until all mines are placed
   */
  placeMines() {
    let placed = 0;
    while (placed < this.mineCount) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);

      if (!this.cells[y][x].isMine) {
        this.cells[y][x].isMine = true;
        placed++;
      }
    }
  }

  /**
   * Calculates the number value for all non-mine cells
   *
   * For each cell that isn't a mine, counts how many of its
   * 8 adjacent neighbors contain mines and sets the cell's number.
   */
  calculateNumbers() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.cells[y][x].isMine) {
          this.cells[y][x].number = this.countAdjacentMines(x, y);
        }
      }
    }
  }

  /**
   * Counts how many mines are adjacent to a given cell
   *
   * Checks all 8 neighboring cells (including diagonals) and
   * counts how many contain mines.
   *
   * @param {number} x - Column index
   * @param {number} y - Row index
   * @returns {number} Number of adjacent mines (0-8)
   */
  countAdjacentMines(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isValid(nx, ny) && this.cells[ny][nx].isMine) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Checks if coordinates are within grid bounds
   *
   * @param {number} x - Column index to check
   * @param {number} y - Row index to check
   * @returns {boolean} True if coordinates are valid
   */
  isValid(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Safely retrieves a cell at given coordinates
   *
   * @param {number} x - Column index
   * @param {number} y - Row index
   * @returns {Cell|null} The cell at (x, y), or null if out of bounds
   */
  getCell(x, y) {
    if (!this.isValid(x, y)) return null;
    return this.cells[y][x];
  }

  /**
   * Reveals a cell at the given coordinates
   *
   * This method:
   * - Returns null if cell is already revealed or flagged
   * - Marks the cell as revealed
   * - Increments the revealed counter
   * - Auto-cascades if the cell is a zero (no adjacent mines)
   *
   * @param {number} x - Column index
   * @param {number} y - Row index
   * @returns {Cell|null} The revealed cell, or null if reveal failed
   */
  revealCell(x, y) {
    const cell = this.getCell(x, y);
    if (!cell || cell.isRevealed || cell.isFlagged) return null;

    cell.isRevealed = true;
    cell.revealedAt = performance.now(); // Timestamp for animation
    this.revealed++;

    // Auto-reveal zeros
    if (cell.number === 0 && !cell.isMine) {
      this.revealAdjacent(x, y);
    }

    return cell;
  }

  /**
   * Reveals all adjacent cells (helper for cascading reveals)
   *
   * Used when revealing a zero cell to automatically reveal
   * all 8 neighboring cells. This creates the cascading effect
   * where large empty areas are revealed at once.
   *
   * @param {number} x - Column index of center cell
   * @param {number} y - Row index of center cell
   */
  revealAdjacent(x, y) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isValid(nx, ny)) {
          this.revealCell(nx, ny);
        }
      }
    }
  }

  /**
   * Toggles the flag state of a cell
   *
   * Players use flags to mark cells they believe contain mines.
   * Cannot flag a cell that is already revealed.
   *
   * @param {number} x - Column index
   * @param {number} y - Row index
   * @returns {boolean} True if flag was toggled, false if operation failed
   */
  toggleFlag(x, y) {
    const cell = this.getCell(x, y);
    if (!cell || cell.isRevealed) return false;

    cell.isFlagged = !cell.isFlagged;
    this.flagged += cell.isFlagged ? 1 : -1;
    return true;
  }

  /**
   * Chords a cell - auto-reveals adjacent cells when flags match number
   *
   * Chording is an advanced minesweeper technique:
   * - Click on a revealed numbered cell
   * - If the number of adjacent flags equals the cell's number
   * - Auto-reveal all unflagged adjacent cells
   * - This speeds up gameplay when you've correctly flagged all mines
   *
   * @param {number} x - Column index
   * @param {number} y - Row index
   * @returns {Cell[]} Array of cells that were revealed by chording
   */
  chord(x, y) {
    const cell = this.getCell(x, y);
    if (!cell || !cell.isRevealed || cell.number === 0) return [];

    // Count adjacent flags
    let flagCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const adjacent = this.getCell(x + dx, y + dy);
        if (adjacent?.isFlagged) flagCount++;
      }
    }

    // Only chord if flag count matches number
    if (flagCount !== cell.number) return [];

    const revealed = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        const adjacent = this.getCell(nx, ny);
        if (adjacent && !adjacent.isRevealed && !adjacent.isFlagged) {
          const result = this.revealCell(nx, ny);
          if (result) revealed.push(result);
        }
      }
    }

    return revealed;
  }

  /**
   * Checks if the grid is complete (win condition)
   *
   * The grid is complete when all non-mine cells have been revealed.
   * This is the primary win condition for minesweeper.
   *
   * @returns {boolean} True if all non-mine cells are revealed
   */
  isComplete() {
    // All non-mine cells revealed
    const totalCells = this.width * this.height;
    return this.revealed === totalCells - this.mineCount;
  }

  /**
   * Reveals all mines on the grid (called on game over)
   *
   * This method is used to show the player where all mines were located
   * when they hit a mine or when the game ends.
   */
  revealAllMines() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.cells[y][x].isMine) {
          this.cells[y][x].isRevealed = true;
        }
      }
    }
  }
}

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Grid;
}
