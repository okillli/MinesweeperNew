/**
 * CanvasRenderer - Renders the minesweeper grid to an HTML5 canvas
 *
 * DEPENDENCIES (what this imports):
 * - None (reads from GameState passed as parameter)
 *
 * DEPENDENTS (what imports this):
 * - Game.js (creates instance, calls render())
 * - main.js (accesses renderer properties for input conversion)
 *
 * CRITICAL PATHS:
 * 1. Game loop → Game.render() → CanvasRenderer.render(GameState) → canvas draw
 * 2. User click → main.js → canvasToGrid() → uses renderer.cellSize/padding
 * 3. Hover → main.js → GameState.hoverCell set → CanvasRenderer.renderHoverHighlight()
 *
 * CHANGE IMPACT: MEDIUM
 * - Visual-only changes have low risk
 * - cellSize / padding changes break input coordinate conversion
 * - Rendering algorithm changes could affect performance
 *
 * PUBLIC PROPERTIES ACCESSED:
 * - renderer.cellSize (accessed by main.js for coordinate conversion)
 * - renderer.padding (accessed by main.js for coordinate conversion)
 *
 * SIDE EFFECTS:
 * - Canvas drawing operations (GPU usage)
 * - Clears and redraws entire canvas every frame
 *
 * ASSUMPTIONS:
 * - GameState structure is stable (currentScreen, grid, hoverCell, cursor)
 * - Grid.cells array is valid when rendering
 * - Canvas context is available and functional
 *
 * Responsibilities:
 * - Pure rendering logic (no game state modification)
 * - Draws grid, cells, numbers, mines, and flags
 * - Centers grid on canvas
 * - Handles canvas resizing
 *
 * Color Scheme:
 * - Revealed cell: #eee
 * - Mine cell: #e63946
 * - Unrevealed cell: #aaa
 * - Cell border: #888
 * - Numbers: ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080']
 * - Flag: #f4a261
 * - Mine (circle): #000
 */
class CanvasRenderer {
  /**
   * Creates a new CanvasRenderer instance
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   */
  constructor(canvas) {
    // Validate canvas element
    if (!canvas) {
      throw new Error('CanvasRenderer: canvas parameter is required');
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(
        `CanvasRenderer: expected HTMLCanvasElement, got ${canvas.constructor.name}`
      );
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    if (!this.ctx) {
      throw new Error('CanvasRenderer: failed to get 2D context from canvas');
    }

    this.cellSize = 44; // Base cell size in pixels (minimum 44x44px for touch targets)
    this.padding = 2;   // Padding between cells
    this.frozen = false; // Track whether rendering is frozen
  }

  /**
   * Main render method - called every frame
   * @param {GameState} gameState - The current game state
   */
  render(gameState) {
    // Don't render if frozen (preserves final frame)
    if (this.frozen) return;

    // Clear canvas
    this.clear();

    // Render grid if playing
    if (gameState.currentScreen === 'PLAYING' && gameState.grid) {
      this.renderGrid(gameState.grid);

      // Render hover highlight if a cell is being hovered
      if (gameState.hoverCell) {
        this.renderHoverHighlight(gameState.grid, gameState.hoverCell);
      }

      // Render keyboard cursor if visible
      if (gameState.cursor && gameState.cursor.visible) {
        this.renderCursor(gameState.grid, gameState.cursor);
      }
    }
  }

  /**
   * Clears the entire canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Renders the entire grid centered on the canvas
   * @param {Grid} grid - The grid to render
   */
  renderGrid(grid) {
    // Calculate grid position (centered)
    // Grid dimensions = (cells * cellSize) + (gaps between cells * padding)
    // There are (n-1) gaps between n cells
    const gridWidth = (grid.width * this.cellSize) + ((grid.width - 1) * this.padding);
    const gridHeight = (grid.height * this.cellSize) + ((grid.height - 1) * this.padding);
    const offsetX = (this.canvas.width - gridWidth) / 2;
    const offsetY = (this.canvas.height - gridHeight) / 2;

    // Render each cell
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        const cellX = offsetX + x * (this.cellSize + this.padding);
        const cellY = offsetY + y * (this.cellSize + this.padding);
        this.renderCell(cell, cellX, cellY);
      }
    }
  }

  /**
   * Renders an individual cell based on its state
   * @param {Cell} cell - The cell to render
   * @param {number} x - The x position on the canvas
   * @param {number} y - The y position on the canvas
   */
  renderCell(cell, x, y) {
    const ctx = this.ctx;
    const size = this.cellSize;

    // Draw cell background
    if (cell.isRevealed) {
      ctx.fillStyle = cell.isMine ? '#e63946' : '#eee';
    } else {
      ctx.fillStyle = '#aaa';
    }
    ctx.fillRect(x, y, size, size);

    // Draw cell border
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);

    // Draw content
    if (cell.isRevealed) {
      if (cell.isMine) {
        this.renderMine(x, y, size);
      } else if (cell.number > 0) {
        this.renderNumber(cell.number, x, y, size);
      }
    } else if (cell.isFlagged) {
      this.renderFlag(x, y, size);
    }
  }

  /**
   * Renders a number (1-8) in a cell with appropriate color
   * @param {number} num - The number to render (1-8)
   * @param {number} x - The x position on the canvas
   * @param {number} y - The y position on the canvas
   * @param {number} size - The cell size
   */
  renderNumber(num, x, y, size) {
    const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080',
                    '#800000', '#008080', '#000000', '#808080'];
    this.ctx.fillStyle = colors[num] || '#000';
    this.ctx.font = `bold ${size * 0.6}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(num, x + size/2, y + size/2);
  }

  /**
   * Renders a mine as a black circle
   * @param {number} x - The x position on the canvas
   * @param {number} y - The y position on the canvas
   * @param {number} size - The cell size
   */
  renderMine(x, y, size) {
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(x + size/2, y + size/2, size * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Renders a flag (yellow/orange triangle with pole)
   * @param {number} x - The x position on the canvas
   * @param {number} y - The y position on the canvas
   * @param {number} size - The cell size
   */
  renderFlag(x, y, size) {
    this.ctx.fillStyle = '#f4a261';
    this.ctx.beginPath();
    this.ctx.moveTo(x + size * 0.3, y + size * 0.2);
    this.ctx.lineTo(x + size * 0.7, y + size * 0.4);
    this.ctx.lineTo(x + size * 0.3, y + size * 0.6);
    this.ctx.closePath();
    this.ctx.fill();

    // Flag pole
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x + size * 0.3, y + size * 0.2);
    this.ctx.lineTo(x + size * 0.3, y + size * 0.8);
    this.ctx.stroke();
  }

  /**
   * Renders a hover highlight over the currently hovered cell
   * Provides visual feedback showing which cell will be affected by a click
   *
   * Different highlight styles based on cell state:
   * - Unrevealed cells: Green border + white overlay (primary action - reveal)
   * - Revealed cells: Blue border (indicates chording is possible)
   * - Flagged cells: Yellow border (indicates unflag action)
   *
   * @param {Grid} grid - The grid being rendered
   * @param {{x: number, y: number}} hoverCell - The hovered cell coordinates
   */
  renderHoverHighlight(grid, hoverCell) {
    const { x, y } = hoverCell;
    const cell = grid.getCell(x, y);
    if (!cell) return;

    // Calculate grid position (same as renderGrid)
    const gridWidth = (grid.width * this.cellSize) + ((grid.width - 1) * this.padding);
    const gridHeight = (grid.height * this.cellSize) + ((grid.height - 1) * this.padding);
    const offsetX = (this.canvas.width - gridWidth) / 2;
    const offsetY = (this.canvas.height - gridHeight) / 2;

    // Calculate cell position
    const cellX = offsetX + x * (this.cellSize + this.padding);
    const cellY = offsetY + y * (this.cellSize + this.padding);
    const size = this.cellSize;

    // Different highlight styles based on cell state
    if (cell.isRevealed) {
      // Revealed cell hover (for chording) - subtle blue border
      this.ctx.strokeStyle = '#4a90e2';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    } else if (cell.isFlagged) {
      // Flagged cell hover (can be unflagged) - yellow border matching flag color
      this.ctx.strokeStyle = '#f4a261';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    } else {
      // Unrevealed cell hover (primary action) - white overlay + green border
      // Semi-transparent white overlay for emphasis
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fillRect(cellX, cellY, size, size);

      // Green border to indicate clickable/revealable
      this.ctx.strokeStyle = '#2ecc71';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    }
  }

  /**
   * Renders the keyboard navigation cursor
   * Provides visual feedback for keyboard users showing which cell has focus
   *
   * Design:
   * - Gold (#FFD700) border for high visibility and distinction from hover
   * - 4px thick border meets WCAG 2.1 Level AA contrast requirements (3:1 ratio)
   * - Static (no animation) to avoid accessibility issues with motion sensitivity
   * - Integer coordinates for crisp rendering
   *
   * @param {Grid} grid - The grid being rendered
   * @param {{x: number, y: number, visible: boolean}} cursor - The cursor state
   */
  renderCursor(grid, cursor) {
    const { x, y } = cursor;
    const cell = grid.getCell(x, y);
    if (!cell) return;

    // Calculate grid position (same as renderGrid and renderHoverHighlight)
    const gridWidth = (grid.width * this.cellSize) + ((grid.width - 1) * this.padding);
    const gridHeight = (grid.height * this.cellSize) + ((grid.height - 1) * this.padding);
    const offsetX = (this.canvas.width - gridWidth) / 2;
    const offsetY = (this.canvas.height - gridHeight) / 2;

    // Calculate cell position with integer coordinates for crisp rendering
    const cellX = Math.floor(offsetX + x * (this.cellSize + this.padding));
    const cellY = Math.floor(offsetY + y * (this.cellSize + this.padding));
    const size = this.cellSize;

    // Draw keyboard cursor (gold border)
    this.ctx.save();
    this.ctx.strokeStyle = '#FFD700'; // Gold - high contrast against all cell states
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(cellX + 2, cellY + 2, size - 4, size - 4);
    this.ctx.restore();
  }

  /**
   * Resizes the canvas to new dimensions
   * @param {number} width - The new canvas width
   * @param {number} height - The new canvas height
   */
  resizeCanvas(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Freezes the canvas rendering
   * Call this when game is over to preserve the final frame
   * The last rendered frame will remain visible on screen
   */
  freeze() {
    this.frozen = true;
  }

  /**
   * Unfreezes the canvas rendering
   * Call this when starting a new game
   */
  unfreeze() {
    this.frozen = false;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasRenderer;
}
