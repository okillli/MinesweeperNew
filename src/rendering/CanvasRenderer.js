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
    this.dpr = window.devicePixelRatio || 1; // Device pixel ratio for crisp rendering

    // Cache grid layout info for coordinate conversion
    this.gridLayout = null;
  }

  /**
   * Calculates grid layout information (position, dimensions, cell size)
   * This is the SINGLE SOURCE OF TRUTH for grid positioning.
   * Used by both rendering and coordinate conversion.
   *
   * @param {Grid} grid - The grid to calculate layout for
   * @returns {{offsetX: number, offsetY: number, gridWidth: number, gridHeight: number, cellSize: number, padding: number}}
   */
  calculateGridLayout(grid) {
    if (!grid) return null;

    const cellSize = this.cellSize;
    const padding = this.padding;

    // Grid dimensions = (cells * cellSize) + (gaps between cells * padding)
    // There are (n-1) gaps between n cells
    const gridWidth = (grid.width * cellSize) + ((grid.width - 1) * padding);
    const gridHeight = (grid.height * cellSize) + ((grid.height - 1) * padding);

    // Center grid on canvas (use logical dimensions, not physical)
    const logicalWidth = this.canvas.width / this.dpr;
    const logicalHeight = this.canvas.height / this.dpr;
    const offsetX = (logicalWidth - gridWidth) / 2;
    const offsetY = (logicalHeight - gridHeight) / 2;

    return {
      offsetX,
      offsetY,
      gridWidth,
      gridHeight,
      cellSize,
      padding,
      gridCols: grid.width,
      gridRows: grid.height
    };
  }

  /**
   * Converts canvas pixel coordinates to grid cell coordinates
   * Properly handles the padding between cells (not after the last cell)
   *
   * @param {number} canvasX - X position on canvas (CSS pixels, after getBoundingClientRect adjustment)
   * @param {number} canvasY - Y position on canvas (CSS pixels, after getBoundingClientRect adjustment)
   * @param {Grid} grid - The grid to convert coordinates for
   * @returns {{x: number, y: number}|null} Grid coordinates or null if outside grid or in padding
   */
  canvasToGrid(canvasX, canvasY, grid) {
    if (!grid) return null;

    const layout = this.calculateGridLayout(grid);
    if (!layout) return null;

    const { offsetX, offsetY, cellSize, padding, gridCols, gridRows } = layout;

    // Convert to coordinates relative to grid origin
    const relativeX = canvasX - offsetX;
    const relativeY = canvasY - offsetY;

    // Quick bounds check
    if (relativeX < 0 || relativeY < 0) return null;
    if (relativeX >= layout.gridWidth || relativeY >= layout.gridHeight) return null;

    // Calculate cell span (cell + padding after it, except for last cell)
    const cellSpan = cellSize + padding;

    // Calculate which cell span the click falls into
    const gridX = Math.floor(relativeX / cellSpan);
    const gridY = Math.floor(relativeY / cellSpan);

    // Check bounds
    if (gridX >= gridCols || gridY >= gridRows) return null;

    // Calculate position within the cell span
    const posInSpanX = relativeX - (gridX * cellSpan);
    const posInSpanY = relativeY - (gridY * cellSpan);

    // Check if click is in padding area (between cells), not the cell itself
    // For the last column/row, there's no padding after, so allow full cellSize
    const maxXInSpan = (gridX === gridCols - 1) ? cellSize : cellSize;
    const maxYInSpan = (gridY === gridRows - 1) ? cellSize : cellSize;

    // If click is past the cell (in padding area), it's still the same cell
    // because visually users are clicking "on" that cell
    // The padding is minimal (2px) so we should still register the click

    // Validate final coordinates
    if (gridX < 0 || gridX >= gridCols || gridY < 0 || gridY >= gridRows) {
      return null;
    }

    return { x: gridX, y: gridY };
  }

  /**
   * Updates canvas size to fit container while maintaining proper DPR scaling
   * Call this on window resize and initial setup
   *
   * @param {number} containerWidth - Available width in CSS pixels
   * @param {number} containerHeight - Available height in CSS pixels
   * @param {Grid} [grid] - Optional grid to calculate optimal cell size
   */
  updateCanvasSize(containerWidth, containerHeight, grid) {
    this.dpr = window.devicePixelRatio || 1;

    // Set canvas size in physical pixels for crisp rendering
    this.canvas.width = Math.floor(containerWidth * this.dpr);
    this.canvas.height = Math.floor(containerHeight * this.dpr);

    // Set CSS size in logical pixels
    this.canvas.style.width = containerWidth + 'px';
    this.canvas.style.height = containerHeight + 'px';

    // Scale context to account for DPR
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // If grid is provided, calculate optimal cell size
    if (grid) {
      this.calculateOptimalCellSize(containerWidth, containerHeight, grid);
    }
  }

  /**
   * Calculates the optimal cell size to fit the grid within the container
   * while maintaining minimum touch target size (44px) when possible
   *
   * @param {number} containerWidth - Available width in CSS pixels
   * @param {number} containerHeight - Available height in CSS pixels
   * @param {Grid} grid - The grid to fit
   */
  calculateOptimalCellSize(containerWidth, containerHeight, grid) {
    if (!grid) return;

    const minCellSize = 28; // Absolute minimum for usability
    const idealCellSize = 44; // WCAG recommended touch target
    const maxCellSize = 60; // Maximum to avoid overly large cells
    const padding = this.padding;

    // Add some margin around the grid
    const marginX = 20;
    const marginY = 20;
    const availableWidth = containerWidth - (marginX * 2);
    const availableHeight = containerHeight - (marginY * 2);

    // Calculate max cell size that fits
    // Grid width = (cells * cellSize) + ((cells - 1) * padding)
    // So: availableWidth = (gridCols * cellSize) + ((gridCols - 1) * padding)
    // Solving: cellSize = (availableWidth - (gridCols - 1) * padding) / gridCols
    const maxCellWidth = (availableWidth - (grid.width - 1) * padding) / grid.width;
    const maxCellHeight = (availableHeight - (grid.height - 1) * padding) / grid.height;

    // Use the smaller of width/height constraints
    let calculatedSize = Math.floor(Math.min(maxCellWidth, maxCellHeight));

    // Clamp to reasonable bounds
    calculatedSize = Math.max(minCellSize, Math.min(maxCellSize, calculatedSize));

    // Prefer ideal size if it fits
    if (idealCellSize <= Math.min(maxCellWidth, maxCellHeight)) {
      calculatedSize = Math.min(idealCellSize, calculatedSize);
    }

    this.cellSize = calculatedSize;
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
   * Accounts for DPR scaling by clearing the logical canvas size
   */
  clear() {
    // Clear using logical dimensions (the transform handles the physical size)
    const logicalWidth = this.canvas.width / this.dpr;
    const logicalHeight = this.canvas.height / this.dpr;
    this.ctx.clearRect(0, 0, logicalWidth, logicalHeight);
  }

  /**
   * Renders the entire grid centered on the canvas
   * @param {Grid} grid - The grid to render
   */
  renderGrid(grid) {
    // Use centralized layout calculation
    const layout = this.calculateGridLayout(grid);
    if (!layout) return;

    const { offsetX, offsetY, cellSize, padding } = layout;

    // Render each cell
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        const cellX = offsetX + x * (cellSize + padding);
        const cellY = offsetY + y * (cellSize + padding);
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

    // Draw cell border with DPR-aware line width for crisp rendering
    ctx.strokeStyle = '#888';
    ctx.lineWidth = Math.max(1, 1 / this.dpr);
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

    // Flag pole with DPR-aware line width for crisp rendering
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = Math.max(1.5, 2 / this.dpr);
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

    // Use centralized layout calculation
    const layout = this.calculateGridLayout(grid);
    if (!layout) return;

    const { offsetX, offsetY, cellSize, padding } = layout;

    // Calculate cell position
    const cellX = offsetX + x * (cellSize + padding);
    const cellY = offsetY + y * (cellSize + padding);
    const size = cellSize;

    // DPR-aware line width for crisp hover borders
    const hoverLineWidth = Math.max(2, 3 / this.dpr);

    // Different highlight styles based on cell state
    if (cell.isRevealed) {
      // Revealed cell hover (for chording) - subtle blue border
      this.ctx.strokeStyle = '#4a90e2';
      this.ctx.lineWidth = hoverLineWidth;
      this.ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    } else if (cell.isFlagged) {
      // Flagged cell hover (can be unflagged) - yellow border matching flag color
      this.ctx.strokeStyle = '#f4a261';
      this.ctx.lineWidth = hoverLineWidth;
      this.ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    } else {
      // Unrevealed cell hover (primary action) - white overlay + green border
      // Semi-transparent white overlay for emphasis
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fillRect(cellX, cellY, size, size);

      // Green border to indicate clickable/revealable
      this.ctx.strokeStyle = '#2ecc71';
      this.ctx.lineWidth = hoverLineWidth;
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

    // Use centralized layout calculation
    const layout = this.calculateGridLayout(grid);
    if (!layout) return;

    const { offsetX, offsetY, cellSize, padding } = layout;

    // Calculate cell position with integer coordinates for crisp rendering
    const cellX = Math.floor(offsetX + x * (cellSize + padding));
    const cellY = Math.floor(offsetY + y * (cellSize + padding));
    const size = cellSize;

    // Draw keyboard cursor (gold border) with DPR-aware line width
    this.ctx.save();
    this.ctx.strokeStyle = '#FFD700'; // Gold - high contrast against all cell states
    this.ctx.lineWidth = Math.max(2, 4 / this.dpr);
    this.ctx.strokeRect(cellX + 2, cellY + 2, size - 4, size - 4);
    this.ctx.restore();
  }

  /**
   * Resizes the canvas to new dimensions (legacy method)
   * Prefer using updateCanvasSize() for DPR-aware resizing
   * @param {number} width - The new canvas width in CSS pixels
   * @param {number} height - The new canvas height in CSS pixels
   */
  resizeCanvas(width, height) {
    this.updateCanvasSize(width, height);
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
