/**
 * MinimapRenderer.js
 *
 * Renders a small overview minimap for large minesweeper boards (25x25+).
 * Shows revealed/unrevealed/flagged cells and viewport indicator.
 * Supports click-to-navigate.
 *
 * DEPENDENCIES (what this imports):
 * - None (reads from GameState and Camera passed as parameters)
 *
 * DEPENDENTS (what imports this):
 * - main.js (creates instance, calls render())
 *
 * CHANGE IMPACT: LOW
 * - Visual-only, doesn't affect game logic
 */
class MinimapRenderer {
  /**
   * Creates a new MinimapRenderer instance
   * @param {HTMLCanvasElement} canvas - The minimap canvas element
   */
  constructor(canvas) {
    if (!canvas) {
      console.warn('MinimapRenderer: canvas element not provided');
      return;
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    // Minimap size in CSS pixels (matches CSS)
    this.size = 120;
    this.mobileSize = 100;

    // Initialize canvas size
    this.updateSize();
  }

  /**
   * Updates canvas size based on current viewport
   */
  updateSize() {
    if (!this.canvas) return;

    // Check if mobile
    const isMobile = window.innerWidth <= 480;
    const size = isMobile ? this.mobileSize : this.size;

    // Set physical size for crisp rendering
    this.canvas.width = size * this.dpr;
    this.canvas.height = size * this.dpr;

    // Set CSS size
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';

    // Scale context for DPR
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /**
   * Renders the minimap
   * @param {Grid} grid - The game grid
   * @param {Camera} camera - The camera (for viewport indicator)
   * @param {number} viewportW - Viewport width
   * @param {number} viewportH - Viewport height
   */
  render(grid, camera, viewportW, viewportH) {
    if (!this.canvas || !this.ctx || !grid) return;

    const ctx = this.ctx;
    const isMobile = window.innerWidth <= 480;
    const minimapSize = isMobile ? this.mobileSize : this.size;

    // Calculate cell size in minimap
    const padding = 4;
    const availableSize = minimapSize - padding * 2;
    const cellW = availableSize / grid.width;
    const cellH = availableSize / grid.height;
    const cellSize = Math.min(cellW, cellH, 4); // Max 4px per cell

    // Calculate actual minimap grid size
    const gridW = grid.width * cellSize;
    const gridH = grid.height * cellSize;
    const offsetX = (minimapSize - gridW) / 2;
    const offsetY = (minimapSize - gridH) / 2;

    // Clear canvas
    ctx.clearRect(0, 0, minimapSize, minimapSize);

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, minimapSize, minimapSize);

    // Draw cells
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        const cellX = offsetX + x * cellSize;
        const cellY = offsetY + y * cellSize;

        if (cell.isRevealed) {
          if (cell.isMine) {
            ctx.fillStyle = '#e63946'; // Red for revealed mine
          } else {
            ctx.fillStyle = '#ddd'; // Light for revealed
          }
        } else if (cell.isFlagged) {
          ctx.fillStyle = '#f4a261'; // Orange for flagged
        } else {
          ctx.fillStyle = '#666'; // Dark gray for unrevealed
        }

        ctx.fillRect(cellX, cellY, cellSize - 0.5, cellSize - 0.5);
      }
    }

    // Draw viewport indicator if camera is enabled
    if (camera && camera.isEnabled()) {
      const cellSpan = 46; // cellSize + padding (44 + 2)
      const gridPixelW = grid.width * cellSpan;
      const gridPixelH = grid.height * cellSpan;

      // Calculate viewport rectangle in world coordinates
      const visibleW = viewportW / camera.zoom;
      const visibleH = viewportH / camera.zoom;

      // Calculate viewport bounds
      const viewLeft = camera.x - visibleW / 2;
      const viewTop = camera.y - visibleH / 2;
      const viewRight = camera.x + visibleW / 2;
      const viewBottom = camera.y + visibleH / 2;

      // Convert to minimap coordinates
      const minimapViewLeft = offsetX + (viewLeft / gridPixelW) * gridW;
      const minimapViewTop = offsetY + (viewTop / gridPixelH) * gridH;
      const minimapViewW = (visibleW / gridPixelW) * gridW;
      const minimapViewH = (visibleH / gridPixelH) * gridH;

      // Draw viewport rectangle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        Math.max(offsetX, minimapViewLeft),
        Math.max(offsetY, minimapViewTop),
        Math.min(gridW, minimapViewW),
        Math.min(gridH, minimapViewH)
      );
    }

    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, gridW, gridH);
  }

  /**
   * Converts minimap click to world position
   * @param {number} clickX - Click X in minimap coordinates
   * @param {number} clickY - Click Y in minimap coordinates
   * @param {Grid} grid - The game grid
   * @returns {{x: number, y: number}|null} World position or null
   */
  clickToWorld(clickX, clickY, grid) {
    if (!grid) return null;

    const isMobile = window.innerWidth <= 480;
    const minimapSize = isMobile ? this.mobileSize : this.size;

    // Calculate cell size in minimap
    const padding = 4;
    const availableSize = minimapSize - padding * 2;
    const cellW = availableSize / grid.width;
    const cellH = availableSize / grid.height;
    const cellSize = Math.min(cellW, cellH, 4);

    const gridW = grid.width * cellSize;
    const gridH = grid.height * cellSize;
    const offsetX = (minimapSize - gridW) / 2;
    const offsetY = (minimapSize - gridH) / 2;

    // Check if click is within grid area
    if (clickX < offsetX || clickX > offsetX + gridW) return null;
    if (clickY < offsetY || clickY > offsetY + gridH) return null;

    // Convert to world position
    const cellSpan = 46; // cellSize + padding (44 + 2)
    const worldX = ((clickX - offsetX) / gridW) * grid.width * cellSpan;
    const worldY = ((clickY - offsetY) / gridH) * grid.height * cellSpan;

    return { x: worldX, y: worldY };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MinimapRenderer;
}
