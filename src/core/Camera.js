/**
 * Camera.js
 *
 * Virtual camera system for pan/zoom functionality on large minesweeper boards.
 * Manages camera position and zoom level, provides coordinate transformations.
 *
 * DEPENDENCIES (what this imports):
 * - None (pure camera logic)
 *
 * DEPENDENTS (what imports this):
 * - GameState.js (holds camera instance)
 * - CanvasRenderer.js (uses camera for transforms)
 * - main.js (handles zoom/pan input)
 *
 * COORDINATE SYSTEM:
 * - World coordinates: Grid position in pixels (0,0 = top-left of grid)
 * - Screen coordinates: Canvas position in CSS pixels (0,0 = top-left of canvas)
 * - Camera (x, y) is the world coordinate at the center of the viewport
 *
 * CHANGE IMPACT: MEDIUM
 * - Changes to coordinate transformation break rendering and input
 * - Zoom/pan changes are generally safe
 */
class Camera {
  /**
   * Creates a new Camera instance
   */
  constructor() {
    // Camera position (world coordinates at center of viewport)
    this.x = 0;
    this.y = 0;

    // Zoom level (1.0 = 100%)
    this.zoom = 1.0;

    // Zoom constraints
    this.minZoom = 0.5;
    this.maxZoom = 3.0;

    // Grid bounds (set when fitting to grid)
    this.worldWidth = 0;
    this.worldHeight = 0;

    // Whether camera is enabled (disabled for small boards)
    this.enabled = false;
  }

  /**
   * Enables or disables the camera
   * When disabled, no transforms are applied (for small boards)
   * @param {boolean} enabled - Whether camera is enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Checks if camera controls should be active
   * @returns {boolean} - Whether camera is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Resets camera to default state
   */
  reset() {
    this.x = 0;
    this.y = 0;
    this.zoom = 1.0;
    this.worldWidth = 0;
    this.worldHeight = 0;
    this.enabled = false;
  }

  /**
   * Sets the world bounds (grid size in pixels)
   * @param {number} width - Grid width in pixels
   * @param {number} height - Grid height in pixels
   */
  setWorldBounds(width, height) {
    this.worldWidth = width;
    this.worldHeight = height;
  }

  /**
   * Converts screen coordinates to world coordinates
   * @param {number} screenX - X position in screen/canvas pixels
   * @param {number} screenY - Y position in screen/canvas pixels
   * @param {number} viewportW - Viewport width in pixels
   * @param {number} viewportH - Viewport height in pixels
   * @returns {{x: number, y: number}} World coordinates
   */
  screenToWorld(screenX, screenY, viewportW, viewportH) {
    if (!this.enabled) {
      return { x: screenX, y: screenY };
    }

    // Screen center in viewport
    const centerX = viewportW / 2;
    const centerY = viewportH / 2;

    // Offset from screen center
    const offsetX = screenX - centerX;
    const offsetY = screenY - centerY;

    // Scale by zoom and add camera position
    const worldX = this.x + (offsetX / this.zoom);
    const worldY = this.y + (offsetY / this.zoom);

    return { x: worldX, y: worldY };
  }

  /**
   * Converts world coordinates to screen coordinates
   * @param {number} worldX - X position in world pixels
   * @param {number} worldY - Y position in world pixels
   * @param {number} viewportW - Viewport width in pixels
   * @param {number} viewportH - Viewport height in pixels
   * @returns {{x: number, y: number}} Screen coordinates
   */
  worldToScreen(worldX, worldY, viewportW, viewportH) {
    if (!this.enabled) {
      return { x: worldX, y: worldY };
    }

    // Screen center in viewport
    const centerX = viewportW / 2;
    const centerY = viewportH / 2;

    // Offset from camera position, scaled by zoom
    const screenX = centerX + (worldX - this.x) * this.zoom;
    const screenY = centerY + (worldY - this.y) * this.zoom;

    return { x: screenX, y: screenY };
  }

  /**
   * Pans the camera by a delta amount
   * @param {number} deltaX - Horizontal pan in screen pixels
   * @param {number} deltaY - Vertical pan in screen pixels
   */
  pan(deltaX, deltaY) {
    if (!this.enabled) return;

    // Convert screen delta to world delta (inverse of zoom)
    this.x -= deltaX / this.zoom;
    this.y -= deltaY / this.zoom;
  }

  /**
   * Zooms toward/away from a focal point (mouse cursor or pinch center)
   * The focal point remains stationary on screen during zoom
   * @param {number} newZoom - New zoom level
   * @param {number} focalX - Focal point X in screen pixels
   * @param {number} focalY - Focal point Y in screen pixels
   * @param {number} viewportW - Viewport width in pixels
   * @param {number} viewportH - Viewport height in pixels
   */
  zoomTo(newZoom, focalX, focalY, viewportW, viewportH) {
    if (!this.enabled) return;

    // Clamp zoom to valid range
    const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));

    // Get world position of focal point before zoom
    const worldFocal = this.screenToWorld(focalX, focalY, viewportW, viewportH);

    // Apply new zoom
    this.zoom = clampedZoom;

    // Calculate new camera position to keep focal point stationary
    // After zoom, focal point should still be at (focalX, focalY) on screen
    const centerX = viewportW / 2;
    const centerY = viewportH / 2;

    // Reverse the screenToWorld calculation:
    // focalX = centerX + (worldFocal.x - this.x) * this.zoom
    // Solving for this.x: this.x = worldFocal.x - (focalX - centerX) / this.zoom
    this.x = worldFocal.x - (focalX - centerX) / this.zoom;
    this.y = worldFocal.y - (focalY - centerY) / this.zoom;
  }

  /**
   * Zooms by a delta amount toward a focal point
   * @param {number} delta - Zoom delta (positive = zoom in, negative = zoom out)
   * @param {number} focalX - Focal point X in screen pixels
   * @param {number} focalY - Focal point Y in screen pixels
   * @param {number} viewportW - Viewport width in pixels
   * @param {number} viewportH - Viewport height in pixels
   */
  zoomBy(delta, focalX, focalY, viewportW, viewportH) {
    const newZoom = this.zoom * (1 + delta);
    this.zoomTo(newZoom, focalX, focalY, viewportW, viewportH);
  }

  /**
   * Clamps camera position to keep grid visible in viewport
   * Prevents panning too far outside the grid bounds
   * @param {number} viewportW - Viewport width in pixels
   * @param {number} viewportH - Viewport height in pixels
   */
  clampToBounds(viewportW, viewportH) {
    if (!this.enabled || this.worldWidth === 0 || this.worldHeight === 0) return;

    // Calculate visible area size in world coordinates
    const visibleW = viewportW / this.zoom;
    const visibleH = viewportH / this.zoom;

    // Grid center
    const gridCenterX = this.worldWidth / 2;
    const gridCenterY = this.worldHeight / 2;

    // If visible area is larger than grid, center the camera
    if (visibleW >= this.worldWidth) {
      this.x = gridCenterX;
    } else {
      // Clamp so grid stays in view
      const minX = visibleW / 2;
      const maxX = this.worldWidth - visibleW / 2;
      this.x = Math.max(minX, Math.min(maxX, this.x));
    }

    if (visibleH >= this.worldHeight) {
      this.y = gridCenterY;
    } else {
      const minY = visibleH / 2;
      const maxY = this.worldHeight - visibleH / 2;
      this.y = Math.max(minY, Math.min(maxY, this.y));
    }
  }

  /**
   * Fits the camera to show the entire grid
   * @param {number} gridPixelWidth - Grid width in pixels
   * @param {number} gridPixelHeight - Grid height in pixels
   * @param {number} viewportW - Viewport width in pixels
   * @param {number} viewportH - Viewport height in pixels
   * @param {number} [padding=20] - Padding around grid in pixels
   */
  fitToGrid(gridPixelWidth, gridPixelHeight, viewportW, viewportH, padding = 20) {
    // Set world bounds
    this.setWorldBounds(gridPixelWidth, gridPixelHeight);

    // Center camera on grid
    this.x = gridPixelWidth / 2;
    this.y = gridPixelHeight / 2;

    // Calculate zoom to fit grid with padding
    const availableW = viewportW - padding * 2;
    const availableH = viewportH - padding * 2;

    const zoomX = availableW / gridPixelWidth;
    const zoomY = availableH / gridPixelHeight;

    // Use smaller zoom to fit both dimensions
    const fitZoom = Math.min(zoomX, zoomY);

    // Clamp to valid range (don't zoom in beyond 1.0 when fitting)
    this.zoom = Math.max(this.minZoom, Math.min(1.0, fitZoom));
  }

  /**
   * Gets the range of visible cells for frustum culling
   * @param {number} gridCols - Number of grid columns
   * @param {number} gridRows - Number of grid rows
   * @param {number} cellSize - Cell size in pixels
   * @param {number} cellPadding - Padding between cells
   * @param {number} viewportW - Viewport width in pixels
   * @param {number} viewportH - Viewport height in pixels
   * @returns {{startCol: number, endCol: number, startRow: number, endRow: number}}
   */
  getVisibleCells(gridCols, gridRows, cellSize, cellPadding, viewportW, viewportH) {
    if (!this.enabled) {
      // Return all cells when camera is disabled
      return {
        startCol: 0,
        endCol: gridCols - 1,
        startRow: 0,
        endRow: gridRows - 1
      };
    }

    const cellSpan = cellSize + cellPadding;

    // Get world coordinates of viewport corners
    const topLeft = this.screenToWorld(0, 0, viewportW, viewportH);
    const bottomRight = this.screenToWorld(viewportW, viewportH, viewportW, viewportH);

    // Convert to cell indices (with 1-cell buffer for partial visibility)
    const startCol = Math.max(0, Math.floor(topLeft.x / cellSpan) - 1);
    const endCol = Math.min(gridCols - 1, Math.ceil(bottomRight.x / cellSpan) + 1);
    const startRow = Math.max(0, Math.floor(topLeft.y / cellSpan) - 1);
    const endRow = Math.min(gridRows - 1, Math.ceil(bottomRight.y / cellSpan) + 1);

    return { startCol, endCol, startRow, endRow };
  }

  /**
   * Pans camera to keep a specific cell visible (for keyboard navigation)
   * @param {number} cellX - Cell column index
   * @param {number} cellY - Cell row index
   * @param {number} cellSize - Cell size in pixels
   * @param {number} cellPadding - Padding between cells
   * @param {number} viewportW - Viewport width in pixels
   * @param {number} viewportH - Viewport height in pixels
   * @param {number} [margin=50] - Margin from viewport edge in pixels
   */
  panToCell(cellX, cellY, cellSize, cellPadding, viewportW, viewportH, margin = 50) {
    if (!this.enabled) return;

    const cellSpan = cellSize + cellPadding;

    // Calculate cell center in world coordinates
    const cellCenterX = cellX * cellSpan + cellSize / 2;
    const cellCenterY = cellY * cellSpan + cellSize / 2;

    // Convert to screen coordinates
    const screen = this.worldToScreen(cellCenterX, cellCenterY, viewportW, viewportH);

    // Check if cell is outside the margin
    let needsPan = false;
    let targetX = this.x;
    let targetY = this.y;

    if (screen.x < margin) {
      // Cell is too far left
      targetX = cellCenterX - (margin - viewportW / 2) / this.zoom;
      needsPan = true;
    } else if (screen.x > viewportW - margin) {
      // Cell is too far right
      targetX = cellCenterX + (margin - viewportW / 2) / this.zoom;
      needsPan = true;
    }

    if (screen.y < margin) {
      // Cell is too far up
      targetY = cellCenterY - (margin - viewportH / 2) / this.zoom;
      needsPan = true;
    } else if (screen.y > viewportH - margin) {
      // Cell is too far down
      targetY = cellCenterY + (margin - viewportH / 2) / this.zoom;
      needsPan = true;
    }

    if (needsPan) {
      this.x = targetX;
      this.y = targetY;
      this.clampToBounds(viewportW, viewportH);
    }
  }

  /**
   * Gets the current zoom percentage
   * @returns {number} Zoom percentage (e.g., 100 for 100%)
   */
  getZoomPercent() {
    return Math.round(this.zoom * 100);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Camera;
}
