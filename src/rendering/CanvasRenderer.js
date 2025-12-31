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

    // Reduced motion preference for animations
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
    });

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
   * Supports camera transforms when camera is enabled
   *
   * @param {number} canvasX - X position on canvas (CSS pixels, after getBoundingClientRect adjustment)
   * @param {number} canvasY - Y position on canvas (CSS pixels, after getBoundingClientRect adjustment)
   * @param {Grid} grid - The grid to convert coordinates for
   * @param {Camera} [camera] - Optional camera for coordinate conversion
   * @returns {{x: number, y: number}|null} Grid coordinates or null if outside grid or in padding
   */
  canvasToGrid(canvasX, canvasY, grid, camera) {
    if (!grid) return null;

    const cellSize = this.cellSize;
    const padding = this.padding;
    const cellSpan = cellSize + padding;
    const gridCols = grid.width;
    const gridRows = grid.height;

    // Check if camera is enabled
    const cameraEnabled = camera && camera.isEnabled();

    let worldX, worldY;

    if (cameraEnabled) {
      // Get viewport dimensions
      const viewportW = this.canvas.width / this.dpr;
      const viewportH = this.canvas.height / this.dpr;

      // Convert screen coordinates to world coordinates using camera
      const worldCoords = camera.screenToWorld(canvasX, canvasY, viewportW, viewportH);
      worldX = worldCoords.x;
      worldY = worldCoords.y;
    } else {
      // No camera - use original centered layout
      const layout = this.calculateGridLayout(grid);
      if (!layout) return null;

      // Convert to world coordinates (relative to grid origin)
      worldX = canvasX - layout.offsetX;
      worldY = canvasY - layout.offsetY;
    }

    // Grid dimensions in pixels
    const gridPixelWidth = (gridCols * cellSize) + ((gridCols - 1) * padding);
    const gridPixelHeight = (gridRows * cellSize) + ((gridRows - 1) * padding);

    // Quick bounds check
    if (worldX < 0 || worldY < 0) return null;
    if (worldX >= gridPixelWidth || worldY >= gridPixelHeight) return null;

    // Calculate which cell span the click falls into
    const gridX = Math.floor(worldX / cellSpan);
    const gridY = Math.floor(worldY / cellSpan);

    // Check bounds
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

    // Use the smaller of width/height constraints to fill the available area
    let calculatedSize = Math.floor(Math.min(maxCellWidth, maxCellHeight));

    // For large boards (15x15+), prefer ideal size to keep cells manageable
    // Camera system handles zoom/pan for these boards
    const isLargeBoard = grid.width >= 15 || grid.height >= 15;
    if (isLargeBoard && calculatedSize > idealCellSize) {
      calculatedSize = idealCellSize;
    }

    // Clamp to minimum for usability
    calculatedSize = Math.max(minCellSize, calculatedSize);

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

    // Render grid if playing or game over (keep showing grid on game over)
    if ((gameState.currentScreen === 'PLAYING' || gameState.currentScreen === 'GAME_OVER') && gameState.grid) {
      // Get camera reference
      const camera = gameState.camera;

      this.renderGrid(gameState.grid, camera, gameState);

      // Render Treasure Sense highlighting (if player has the passive)
      if (gameState.currentRun?.hasTreasureSense) {
        this.renderTreasureSenseHighlights(gameState.grid, camera);
      }

      // Render Mine Detector highlighted mines
      const highlightedMines = gameState.currentRun?.highlightedMines;
      if (highlightedMines && highlightedMines.length > 0) {
        this.renderHighlightedMines(gameState.grid, highlightedMines, camera);
      }

      // Render Trap Detector highlighted traps
      const highlightedTraps = gameState.currentRun?.highlightedTraps;
      if (highlightedTraps && highlightedTraps.length > 0) {
        this.renderHighlightedTraps(gameState.grid, highlightedTraps, camera);
      }

      // Render revealed traps (from Trap Map consumable)
      const revealedTraps = gameState.currentRun?.revealedTraps;
      if (revealedTraps && revealedTraps.length > 0) {
        this.renderHighlightedTraps(gameState.grid, revealedTraps, camera);
      }

      // Render hover highlight if a cell is being hovered
      if (gameState.hoverCell) {
        this.renderHoverHighlight(gameState.grid, gameState.hoverCell, camera);
      }

      // Render keyboard cursor if visible
      if (gameState.cursor && gameState.cursor.visible) {
        this.renderCursor(gameState.grid, gameState.cursor, camera);
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
   * @param {Camera} [camera] - Optional camera for pan/zoom
   * @param {GameState} [gameState] - Optional game state for special effects
   */
  renderGrid(grid, camera, gameState) {
    const ctx = this.ctx;
    const cellSize = this.cellSize;
    const padding = this.padding;
    const cellSpan = cellSize + padding;

    // Calculate grid dimensions in world coordinates
    const gridPixelWidth = (grid.width * cellSize) + ((grid.width - 1) * padding);
    const gridPixelHeight = (grid.height * cellSize) + ((grid.height - 1) * padding);

    // Get viewport dimensions
    const viewportW = this.canvas.width / this.dpr;
    const viewportH = this.canvas.height / this.dpr;

    // Check if camera is enabled
    const cameraEnabled = camera && camera.isEnabled();

    if (cameraEnabled) {
      // Set world bounds on camera (needed for clamping)
      camera.setWorldBounds(gridPixelWidth, gridPixelHeight);

      // Apply camera transform
      ctx.save();

      // Move to center of viewport
      ctx.translate(viewportW / 2, viewportH / 2);

      // Apply zoom
      ctx.scale(camera.zoom, camera.zoom);

      // Translate to camera position (negative because camera moves opposite to world)
      ctx.translate(-camera.x, -camera.y);

      // Get visible cell range for frustum culling
      const visible = camera.getVisibleCells(
        grid.width, grid.height, cellSize, padding, viewportW, viewportH
      );

      // Render only visible cells
      for (let y = visible.startRow; y <= visible.endRow; y++) {
        for (let x = visible.startCol; x <= visible.endCol; x++) {
          const cell = grid.cells[y][x];
          const cellX = x * cellSpan;
          const cellY = y * cellSpan;
          this.renderCell(cell, cellX, cellY);
        }
      }

      ctx.restore();
    } else {
      // No camera - use original centered rendering
      const layout = this.calculateGridLayout(grid);
      if (!layout) return;

      const { offsetX, offsetY } = layout;

      // Render each cell
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          const cell = grid.cells[y][x];
          const cellX = offsetX + x * cellSpan;
          const cellY = offsetY + y * cellSpan;
          this.renderCell(cell, cellX, cellY);
        }
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

    // Animation constants
    const REVEAL_ANIM_DURATION = 300; // ms for reveal cascade
    const now = performance.now();
    const revealAge = cell.revealedAt ? now - cell.revealedAt : Infinity;
    const isAnimating = cell.isRevealed && revealAge < REVEAL_ANIM_DURATION;

    // Calculate animation scale (0.7 -> 1.0 with ease-out)
    let animScale = 1;
    if (isAnimating && !this.reducedMotion) {
      const progress = Math.min(1, revealAge / REVEAL_ANIM_DURATION);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      animScale = 0.7 + (0.3 * eased);
    }

    // Apply cell reveal animation transform
    if (isAnimating && animScale < 1 && !this.reducedMotion) {
      ctx.save();
      const centerX = x + size / 2;
      const centerY = y + size / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(animScale, animScale);
      ctx.translate(-centerX, -centerY);
    }

    // Draw cell background
    if (cell.isRevealed) {
      if (cell.isMine) {
        ctx.fillStyle = '#e63946'; // Red for mines
      } else if (cell.isTrap) {
        ctx.fillStyle = '#9b59b6'; // Purple for traps
      } else if (cell.isCursed) {
        ctx.fillStyle = '#8b7355'; // Gold/brown for cursed
      } else {
        ctx.fillStyle = '#eee'; // Light gray for safe cells
      }
    } else {
      ctx.fillStyle = '#aaa'; // Medium gray for unrevealed
    }
    ctx.fillRect(x, y, size, size);

    // Draw cursed shimmer effect on unrevealed cursed cells
    if (!cell.isRevealed && cell.isCursed && !cell.isFlagged) {
      this.renderCursedShimmer(x, y, size);
    }

    // Draw cell border with DPR-aware line width for crisp rendering
    ctx.strokeStyle = '#888';
    ctx.lineWidth = Math.max(1, 1 / this.dpr);
    ctx.strokeRect(x, y, size, size);

    // Draw content
    if (cell.isRevealed) {
      if (cell.isMine) {
        this.renderMine(x, y, size);
      } else if (cell.isTrap) {
        this.renderTrap(x, y, size);
      } else if (cell.number > 0) {
        this.renderNumber(cell.number, x, y, size, revealAge);
      }
    } else if (cell.isFlagged) {
      this.renderFlag(x, y, size);
    }

    // Restore transform if animation was applied
    if (isAnimating && animScale < 1 && !this.reducedMotion) {
      ctx.restore();
    }
  }

  /**
   * Renders a number (1-8) in a cell with appropriate color
   * @param {number} num - The number to render (1-8)
   * @param {number} x - The x position on the canvas
   * @param {number} y - The y position on the canvas
   * @param {number} size - The cell size
   * @param {number} [revealAge=Infinity] - Time since cell was revealed (for pop animation)
   */
  renderNumber(num, x, y, size, revealAge = Infinity) {
    const ctx = this.ctx;
    const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080',
                    '#800000', '#008080', '#000000', '#808080'];

    // Number pop animation: scale up briefly then settle
    const POP_DURATION = 250; // ms
    let popScale = 1;
    if (revealAge < POP_DURATION && !this.reducedMotion) {
      const progress = revealAge / POP_DURATION;
      // Overshoot easing: goes to 1.3 then settles to 1.0
      if (progress < 0.4) {
        // Scale up phase (0 -> 1.3)
        popScale = 1 + (0.3 * (progress / 0.4));
      } else {
        // Settle phase (1.3 -> 1.0)
        const settleProgress = (progress - 0.4) / 0.6;
        popScale = 1.3 - (0.3 * settleProgress);
      }
    }

    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const baseFontSize = size * 0.6;

    ctx.fillStyle = colors[num] || '#000';
    ctx.font = `bold ${baseFontSize * popScale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num, centerX, centerY);
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
   * Renders a trap as a spike/triangle pointing up
   * @param {number} x - The x position on the canvas
   * @param {number} y - The y position on the canvas
   * @param {number} size - The cell size
   */
  renderTrap(x, y, size) {
    const ctx = this.ctx;
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const spikeSize = size * 0.35;

    // Draw spike (triangle pointing up)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - spikeSize);
    ctx.lineTo(centerX - spikeSize * 0.7, centerY + spikeSize * 0.5);
    ctx.lineTo(centerX + spikeSize * 0.7, centerY + spikeSize * 0.5);
    ctx.closePath();
    ctx.fill();

    // Spike outline for visibility
    ctx.strokeStyle = '#4a0080';
    ctx.lineWidth = Math.max(1, 1.5 / this.dpr);
    ctx.stroke();
  }

  /**
   * Renders a subtle gold shimmer effect on unrevealed cursed cells
   * Helps players identify cursed cells before revealing
   * @param {number} x - The x position on the canvas
   * @param {number} y - The y position on the canvas
   * @param {number} size - The cell size
   */
  renderCursedShimmer(x, y, size) {
    const ctx = this.ctx;

    // Draw a subtle gold border/highlight
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = Math.max(2, 2.5 / this.dpr);

    // Draw inner border
    const inset = size * 0.1;
    ctx.strokeRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
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
   * @param {Camera} [camera] - Optional camera for pan/zoom
   */
  renderHoverHighlight(grid, hoverCell, camera) {
    const { x, y } = hoverCell;
    const cell = grid.getCell(x, y);
    if (!cell) return;

    const ctx = this.ctx;
    const cellSize = this.cellSize;
    const padding = this.padding;
    const cellSpan = cellSize + padding;
    const cameraEnabled = camera && camera.isEnabled();

    // Get viewport dimensions for camera
    const viewportW = this.canvas.width / this.dpr;
    const viewportH = this.canvas.height / this.dpr;

    let cellX, cellY;

    if (cameraEnabled) {
      // Apply camera transform for highlight
      ctx.save();
      ctx.translate(viewportW / 2, viewportH / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.x, -camera.y);

      // Cell position in world coordinates
      cellX = x * cellSpan;
      cellY = y * cellSpan;
    } else {
      // Use centralized layout calculation
      const layout = this.calculateGridLayout(grid);
      if (!layout) return;

      cellX = layout.offsetX + x * cellSpan;
      cellY = layout.offsetY + y * cellSpan;
    }

    const size = cellSize;

    // DPR-aware line width for crisp hover borders
    const hoverLineWidth = Math.max(2, 3 / this.dpr);

    // Different highlight styles based on cell state
    if (cell.isRevealed) {
      // Revealed cell hover (for chording) - subtle blue border
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = hoverLineWidth;
      ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    } else if (cell.isFlagged) {
      // Flagged cell hover (can be unflagged) - yellow border matching flag color
      ctx.strokeStyle = '#f4a261';
      ctx.lineWidth = hoverLineWidth;
      ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    } else {
      // Unrevealed cell hover (primary action) - white overlay + green border
      // Semi-transparent white overlay for emphasis
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(cellX, cellY, size, size);

      // Green border to indicate clickable/revealable
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = hoverLineWidth;
      ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    }

    if (cameraEnabled) {
      ctx.restore();
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
   * @param {Camera} [camera] - Optional camera for pan/zoom
   */
  renderCursor(grid, cursor, camera) {
    const { x, y } = cursor;
    const cell = grid.getCell(x, y);
    if (!cell) return;

    const ctx = this.ctx;
    const cellSize = this.cellSize;
    const padding = this.padding;
    const cellSpan = cellSize + padding;
    const cameraEnabled = camera && camera.isEnabled();

    // Get viewport dimensions for camera
    const viewportW = this.canvas.width / this.dpr;
    const viewportH = this.canvas.height / this.dpr;

    ctx.save();

    let cellX, cellY;

    if (cameraEnabled) {
      // Apply camera transform
      ctx.translate(viewportW / 2, viewportH / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.x, -camera.y);

      // Cell position in world coordinates
      cellX = Math.floor(x * cellSpan);
      cellY = Math.floor(y * cellSpan);
    } else {
      // Use centralized layout calculation
      const layout = this.calculateGridLayout(grid);
      if (!layout) {
        ctx.restore();
        return;
      }

      cellX = Math.floor(layout.offsetX + x * cellSpan);
      cellY = Math.floor(layout.offsetY + y * cellSpan);
    }

    const size = cellSize;

    // Draw keyboard cursor (gold border) with DPR-aware line width
    ctx.strokeStyle = '#FFD700'; // Gold - high contrast against all cell states
    ctx.lineWidth = Math.max(2, 4 / this.dpr);
    ctx.strokeRect(cellX + 2, cellY + 2, size - 4, size - 4);
    ctx.restore();
  }

  /**
   * Renders Mine Detector highlighted mines with a pulsing warning indicator
   * @param {Grid} grid - The grid being rendered
   * @param {Array<{x: number, y: number}>} highlightedMines - Array of mine coordinates
   * @param {Camera} [camera] - Optional camera for pan/zoom
   */
  renderHighlightedMines(grid, highlightedMines, camera) {
    const ctx = this.ctx;
    const cellSize = this.cellSize;
    const padding = this.padding;
    const cellSpan = cellSize + padding;
    const cameraEnabled = camera && camera.isEnabled();

    // Get viewport dimensions for camera
    const viewportW = this.canvas.width / this.dpr;
    const viewportH = this.canvas.height / this.dpr;

    // Pulsing animation (subtle)
    const pulsePhase = (performance.now() % 1000) / 1000;
    const pulseAlpha = this.reducedMotion ? 0.6 : 0.4 + 0.2 * Math.sin(pulsePhase * Math.PI * 2);

    ctx.save();

    if (cameraEnabled) {
      // Apply camera transform
      ctx.translate(viewportW / 2, viewportH / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.x, -camera.y);
    }

    for (const mine of highlightedMines) {
      const { x, y } = mine;
      const cell = grid.getCell(x, y);

      // Only highlight if cell is still unrevealed and unflagged
      if (!cell || cell.isRevealed || cell.isFlagged) continue;

      let cellX, cellY;

      if (cameraEnabled) {
        cellX = x * cellSpan;
        cellY = y * cellSpan;
      } else {
        const layout = this.calculateGridLayout(grid);
        if (!layout) continue;
        cellX = layout.offsetX + x * cellSpan;
        cellY = layout.offsetY + y * cellSpan;
      }

      // Draw warning overlay (red tint)
      ctx.fillStyle = `rgba(255, 0, 0, ${pulseAlpha * 0.3})`;
      ctx.fillRect(cellX, cellY, cellSize, cellSize);

      // Draw danger border (bright red)
      ctx.strokeStyle = `rgba(255, 50, 50, ${pulseAlpha + 0.2})`;
      ctx.lineWidth = Math.max(3, 4 / this.dpr);
      ctx.strokeRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);

      // Draw small mine icon hint in corner
      ctx.fillStyle = `rgba(0, 0, 0, ${pulseAlpha + 0.2})`;
      ctx.beginPath();
      ctx.arc(cellX + cellSize - 8, cellY + 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Renders Trap Detector highlighted traps with a pulsing purple indicator
   * @param {Grid} grid - The grid being rendered
   * @param {Array<{x: number, y: number}>} highlightedTraps - Array of trap coordinates
   * @param {Camera} [camera] - Optional camera for pan/zoom
   */
  renderHighlightedTraps(grid, highlightedTraps, camera) {
    const ctx = this.ctx;
    const cellSize = this.cellSize;
    const padding = this.padding;
    const cellSpan = cellSize + padding;
    const cameraEnabled = camera && camera.isEnabled();

    // Pulsing animation (subtle)
    const pulsePhase = (performance.now() % 1000) / 1000;
    const pulseAlpha = this.reducedMotion ? 0.6 : 0.4 + 0.2 * Math.sin(pulsePhase * Math.PI * 2);

    ctx.save();

    if (cameraEnabled) {
      ctx.translate(camera.offsetX, camera.offsetY);
      ctx.scale(camera.scale, camera.scale);
    }

    for (const trap of highlightedTraps) {
      const { x, y } = trap;
      const cell = grid.getCell(x, y);

      // Only highlight if cell is still unrevealed
      if (!cell || cell.isRevealed) continue;

      let cellX, cellY;

      if (cameraEnabled) {
        cellX = x * cellSpan;
        cellY = y * cellSpan;
      } else {
        const layout = this.calculateGridLayout(grid);
        if (!layout) continue;
        cellX = layout.offsetX + x * cellSpan;
        cellY = layout.offsetY + y * cellSpan;
      }

      // Draw warning overlay (purple tint)
      ctx.fillStyle = `rgba(155, 89, 182, ${pulseAlpha * 0.4})`;
      ctx.fillRect(cellX, cellY, cellSize, cellSize);

      // Draw danger border (bright purple)
      ctx.strokeStyle = `rgba(155, 89, 182, ${pulseAlpha + 0.3})`;
      ctx.lineWidth = Math.max(3, 4 / this.dpr);
      ctx.strokeRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);

      // Draw small spike icon hint in corner
      const iconSize = 6;
      const iconX = cellX + cellSize - 10;
      const iconY = cellY + 6;
      ctx.fillStyle = `rgba(155, 89, 182, ${pulseAlpha + 0.4})`;
      ctx.beginPath();
      ctx.moveTo(iconX, iconY + iconSize);
      ctx.lineTo(iconX + iconSize / 2, iconY);
      ctx.lineTo(iconX + iconSize, iconY + iconSize);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Renders Treasure Sense highlighting for high-value cells
   * High-value = unrevealed cells adjacent to 3+ mines (will show high numbers)
   * @param {Grid} grid - The grid being rendered
   * @param {Camera} [camera] - Optional camera for pan/zoom
   */
  renderTreasureSenseHighlights(grid, camera) {
    const ctx = this.ctx;
    const cellSize = this.cellSize;
    const padding = this.padding;
    const cellSpan = cellSize + padding;
    const cameraEnabled = camera && camera.isEnabled();

    // Get viewport dimensions for camera
    const viewportW = this.canvas.width / this.dpr;
    const viewportH = this.canvas.height / this.dpr;

    // Subtle golden glow animation
    const glowPhase = (performance.now() % 2000) / 2000;
    const glowAlpha = this.reducedMotion ? 0.3 : 0.2 + 0.15 * Math.sin(glowPhase * Math.PI * 2);

    ctx.save();

    if (cameraEnabled) {
      ctx.translate(viewportW / 2, viewportH / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.x, -camera.y);
    }

    // Find high-value cells (adjacent to 3+ mines = number 3-8 when revealed)
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.getCell(x, y);

        // Only highlight unrevealed, unflagged cells with high adjacent mine count
        if (!cell || cell.isRevealed || cell.isFlagged || cell.isMine) continue;
        if (cell.number < 3) continue; // Only highlight cells that will show 3+

        let cellX, cellY;

        if (cameraEnabled) {
          cellX = x * cellSpan;
          cellY = y * cellSpan;
        } else {
          const layout = this.calculateGridLayout(grid);
          if (!layout) continue;
          cellX = layout.offsetX + x * cellSpan;
          cellY = layout.offsetY + y * cellSpan;
        }

        // Draw golden glow overlay
        ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha})`;
        ctx.fillRect(cellX, cellY, cellSize, cellSize);

        // Draw subtle gold border
        ctx.strokeStyle = `rgba(255, 200, 50, ${glowAlpha + 0.1})`;
        ctx.lineWidth = Math.max(2, 2 / this.dpr);
        ctx.strokeRect(cellX + 1, cellY + 1, cellSize - 2, cellSize - 2);
      }
    }

    ctx.restore();
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
