/**
 * CanvasRenderer - Renders the minesweeper grid to an HTML5 canvas
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
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = 40; // Base cell size in pixels
    this.padding = 2;   // Padding between cells
  }

  /**
   * Main render method - called every frame
   * @param {GameState} gameState - The current game state
   */
  render(gameState) {
    // Clear canvas
    this.clear();

    // Render grid if playing
    if (gameState.currentScreen === 'PLAYING' && gameState.grid) {
      this.renderGrid(gameState.grid);
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
    const gridWidth = grid.width * (this.cellSize + this.padding);
    const gridHeight = grid.height * (this.cellSize + this.padding);
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
   * Resizes the canvas to new dimensions
   * @param {number} width - The new canvas width
   * @param {number} height - The new canvas height
   */
  resizeCanvas(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasRenderer;
}
