/**
 * main.js - Entry point for MineQuest
 *
 * Responsibilities:
 * - Initialize the game when DOM is ready
 * - Wire up the Game instance with canvas element
 * - Set up input handlers (click, right-click) for player interaction
 * - Convert canvas coordinates to grid coordinates
 * - Trigger grid actions and re-render
 *
 * For MVP: This creates a simple test grid to validate core minesweeper mechanics
 * before implementing the full game flow with quests, shops, etc.
 */

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Get canvas element from the DOM
  const canvas = document.getElementById('game-canvas');

  if (!canvas) {
    console.error('Canvas element #game-canvas not found in DOM');
    return;
  }

  // Set canvas size (for MVP, use a fixed size)
  // Later this will be responsive and adapt to grid size
  canvas.width = 600;
  canvas.height = 600;

  // Create the main Game instance
  // Game handles the update-render loop and owns GameState and CanvasRenderer
  const game = new Game(canvas);

  // ============================================================================
  // MVP TEST SETUP
  // ============================================================================
  // For MVP testing, we bypass the menu/quest/character flow and jump straight
  // to a playable grid. This lets us validate core minesweeper mechanics:
  // - Cell revealing with auto-cascade for zeros
  // - Flagging
  // - Chording (click revealed number with correct flags to auto-reveal adjacent)
  //
  // TODO: Replace this with proper game flow once menu/quest systems are ready

  // Create a test grid (10x10 with 15 mines - same as Board 2 config)
  const testGrid = new Grid(10, 10, 15);

  // Set the grid in game state
  game.state.grid = testGrid;

  // Set the screen to PLAYING so the renderer knows to draw the grid
  game.state.currentScreen = 'PLAYING';

  // Start the game loop
  // This begins the RAF loop which will continuously render the grid
  game.start();

  console.log('MineQuest MVP initialized - 10x10 grid with 15 mines');
  console.log('Left-click: Reveal cell');
  console.log('Right-click: Toggle flag');
  console.log('Left-click revealed number: Chord (auto-reveal if flags match)');

  // ============================================================================
  // INPUT HANDLERS
  // ============================================================================

  /**
   * Converts canvas pixel coordinates to grid cell coordinates
   *
   * Takes into account:
   * - Grid centering on canvas
   * - Cell size and padding from CanvasRenderer
   *
   * @param {number} canvasX - X position on canvas (from click event)
   * @param {number} canvasY - Y position on canvas (from click event)
   * @returns {{x: number, y: number}|null} Grid coordinates or null if outside grid
   */
  function canvasToGrid(canvasX, canvasY) {
    const grid = game.state.grid;
    if (!grid) return null;

    const renderer = game.renderer;
    const cellSize = renderer.cellSize;
    const padding = renderer.padding;

    // Calculate grid dimensions and centering offset (same as CanvasRenderer)
    const gridWidth = grid.width * (cellSize + padding);
    const gridHeight = grid.height * (cellSize + padding);
    const offsetX = (canvas.width - gridWidth) / 2;
    const offsetY = (canvas.height - gridHeight) / 2;

    // Convert canvas coords to grid coords
    const relativeX = canvasX - offsetX;
    const relativeY = canvasY - offsetY;

    // Calculate grid cell indices
    const gridX = Math.floor(relativeX / (cellSize + padding));
    const gridY = Math.floor(relativeY / (cellSize + padding));

    // Validate coordinates are within grid bounds
    if (gridX < 0 || gridX >= grid.width || gridY < 0 || gridY >= grid.height) {
      return null;
    }

    return { x: gridX, y: gridY };
  }

  /**
   * Handles left-click on canvas
   * - Reveals cell if unrevealed
   * - Chords if cell is already revealed (auto-reveal adjacent cells if flags match)
   *
   * @param {MouseEvent} event - The click event
   */
  function handleLeftClick(event) {
    const grid = game.state.grid;
    if (!grid) return;

    // Get canvas coordinates from click event
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Convert to grid coordinates
    const coords = canvasToGrid(canvasX, canvasY);
    if (!coords) return; // Click was outside grid

    const { x, y } = coords;
    const cell = grid.getCell(x, y);
    if (!cell) return;

    // If cell is already revealed, try to chord
    if (cell.isRevealed) {
      const chordedCells = grid.chord(x, y);

      if (chordedCells.length > 0) {
        console.log(`Chorded ${chordedCells.length} cells at (${x}, ${y})`);

        // Check if any chorded cells were mines (game over condition)
        const hitMine = chordedCells.some(c => c.isMine);
        if (hitMine) {
          console.log('Hit a mine while chording! Game Over.');
          // TODO: Implement proper game over flow
          // For now, just log it
        }

        // Check win condition
        if (grid.isComplete()) {
          console.log('Congratulations! You won!');
          // TODO: Implement proper victory flow
        }
      }
    }
    // Otherwise, reveal the cell
    else {
      const revealedCell = grid.revealCell(x, y);

      if (revealedCell) {
        console.log(`Revealed cell at (${x}, ${y}) - Mine: ${revealedCell.isMine}, Number: ${revealedCell.number}`);

        // Check if we hit a mine (game over condition)
        if (revealedCell.isMine) {
          console.log('Hit a mine! Game Over.');
          // TODO: In full game, this would:
          // - Trigger damage/HP system
          // - Play explosion animation
          // - Potentially end the run if HP reaches 0
          // For MVP, we just log it
        }

        // Check win condition (all non-mine cells revealed)
        if (grid.isComplete()) {
          console.log('Congratulations! You won!');
          // TODO: In full game, this would:
          // - Award coins/mana based on cells revealed
          // - Transition to shop or next board
          // - Update quest progress
          // For MVP, we just log it
        }
      }
    }

    // Re-render is automatic - the game loop continuously renders
    // No need to manually call render() here
  }

  /**
   * Handles right-click on canvas
   * - Toggles flag on unrevealed cells
   * - Prevents default context menu
   *
   * @param {MouseEvent} event - The context menu event
   */
  function handleRightClick(event) {
    // Prevent the browser's default context menu from appearing
    event.preventDefault();

    const grid = game.state.grid;
    if (!grid) return;

    // Get canvas coordinates from click event
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Convert to grid coordinates
    const coords = canvasToGrid(canvasX, canvasY);
    if (!coords) return; // Click was outside grid

    const { x, y } = coords;

    // Toggle flag on the cell
    const success = grid.toggleFlag(x, y);

    if (success) {
      const cell = grid.getCell(x, y);
      console.log(`${cell.isFlagged ? 'Flagged' : 'Unflagged'} cell at (${x}, ${y})`);
      console.log(`Total flags: ${grid.flagged}/${grid.mineCount}`);
    }

    // Re-render is automatic - the game loop continuously renders
    // No need to manually call render() here
  }

  // Register event listeners
  canvas.addEventListener('click', handleLeftClick);
  canvas.addEventListener('contextmenu', handleRightClick);

  // ============================================================================
  // FUTURE ENHANCEMENTS
  // ============================================================================
  // When moving beyond MVP, this file will need to:
  //
  // 1. Remove the test grid setup
  // 2. Add menu button handlers (start, collection, settings)
  // 3. Add screen transition logic (menu -> quest -> character -> playing)
  // 4. Add proper game over / victory handlers
  // 5. Add shop screen transition when board is complete
  // 6. Add HP/mana/coins UI updates
  // 7. Add event bus listeners for game events
  // 8. Add mobile touch handlers (tap = reveal, long-press = flag)
  // 9. Add keyboard shortcuts (space = flag, etc.)
  // 10. Add save/load on page unload/load
  //
  // For now, we focus on validating that core minesweeper mechanics work correctly.
});
