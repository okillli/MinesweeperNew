/**
 * main.js - Entry point for MineQuest
 *
 * Responsibilities:
 * - Initialize the game when DOM is ready
 * - Wire up the Game instance with canvas element
 * - Set up menu button handlers and screen transitions
 * - Set up input handlers (click, right-click) for player interaction
 * - Convert canvas coordinates to grid coordinates
 * - Trigger grid actions and re-render
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

  // Start the game loop immediately
  // The loop runs continuously, but only renders when on PLAYING screen
  game.start();

  console.log('MineQuest initialized');

  // ============================================================================
  // SCREEN TRANSITION SYSTEM
  // ============================================================================

  /**
   * Shows a specific screen by hiding all others and revealing the target
   * @param {string} screenId - The ID of the screen to show (without '#')
   */
  function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add('active');
    }

    // Update game state screen
    // Map HTML screen IDs to game state screen constants
    const screenMap = {
      'menu-screen': 'MENU',
      'quest-screen': 'QUEST',
      'character-screen': 'CHARACTER',
      'game-screen': 'PLAYING',
      'shop-screen': 'SHOP',
      'gameover-screen': 'GAME_OVER',
      'collection-screen': 'COLLECTION',
      'settings-screen': 'SETTINGS'
    };

    game.state.currentScreen = screenMap[screenId] || 'MENU';

    // Show/hide HUD based on screen
    const hud = document.getElementById('hud');
    if (game.state.currentScreen === 'PLAYING') {
      hud.classList.remove('hidden');
      updateHUD();
    } else {
      hud.classList.add('hidden');
    }

    console.log(`Switched to screen: ${screenId} (state: ${game.state.currentScreen})`);
  }

  /**
   * Updates the HUD display with current game state
   */
  function updateHUD() {
    const run = game.state.currentRun;
    document.getElementById('hp-display').textContent = run.hp;
    document.getElementById('mana-display').textContent = `${run.mana}/${run.maxMana}`;
    document.getElementById('coins-display').textContent = run.coins;
    document.getElementById('board-display').textContent = `${run.boardNumber}/6`;
  }

  // ============================================================================
  // MENU BUTTON HANDLERS
  // ============================================================================

  /**
   * Handles "Start Run" button click
   * For MVP: Creates a test grid and goes directly to game screen
   * TODO: Later this will go to quest selection screen
   */
  document.getElementById('start-button').addEventListener('click', () => {
    console.log('Start Run clicked');

    // TODO: In full game, this would transition to quest-screen
    // For MVP, we skip quest/character selection and start a test game

    // Create a test grid (10x10 with 15 mines - same as Board 2 config)
    const testGrid = new Grid(10, 10, 15);

    // Set the grid in game state
    game.state.grid = testGrid;

    // Initialize run state for testing
    game.state.currentRun.boardNumber = 1;
    game.state.currentRun.hp = 3;
    game.state.currentRun.maxHp = 3;
    game.state.currentRun.mana = 0;
    game.state.currentRun.maxMana = 100;
    game.state.currentRun.coins = 0;

    // Transition to game screen
    showScreen('game-screen');

    console.log('Test grid created - 10x10 with 15 mines');
  });

  /**
   * Handles "Collection" button click
   */
  document.getElementById('collection-button').addEventListener('click', () => {
    console.log('Collection clicked');
    showScreen('collection-screen');
    // TODO: Populate collection screen with unlocked items/characters/achievements
  });

  /**
   * Handles "Settings" button click
   */
  document.getElementById('settings-button').addEventListener('click', () => {
    console.log('Settings clicked');
    showScreen('settings-screen');
  });

  // ============================================================================
  // BACK BUTTON HANDLERS
  // ============================================================================

  /**
   * Quest screen back button
   */
  document.getElementById('quest-back-button').addEventListener('click', () => {
    showScreen('menu-screen');
  });

  /**
   * Character screen back button
   */
  document.getElementById('character-back-button').addEventListener('click', () => {
    showScreen('quest-screen');
  });

  /**
   * Collection screen back button
   */
  document.getElementById('collection-back-button').addEventListener('click', () => {
    showScreen('menu-screen');
  });

  /**
   * Settings screen back button
   */
  document.getElementById('settings-back-button').addEventListener('click', () => {
    showScreen('menu-screen');
  });

  /**
   * Game Over screen "Return to Menu" button
   */
  document.getElementById('gameover-menu-button').addEventListener('click', () => {
    showScreen('menu-screen');
  });

  /**
   * Shop "Continue" button
   */
  document.getElementById('shop-continue-button').addEventListener('click', () => {
    console.log('Shop continue clicked');
    // TODO: Generate next board or transition to game over if run complete
    showScreen('game-screen');
  });

  // ============================================================================
  // SETTINGS HANDLERS
  // ============================================================================

  /**
   * Clear save data button
   */
  document.getElementById('clear-save-button').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all save data? This cannot be undone.')) {
      game.state.reset();
      console.log('Save data cleared');
      alert('Save data has been cleared!');
    }
  });

  // Initialize to menu screen
  showScreen('menu-screen');

  // ============================================================================
  // INPUT HANDLERS (CANVAS INTERACTION)
  // ============================================================================
  // Note: Game loop runs continuously, but CanvasRenderer only draws the grid
  // when game.state.currentScreen === 'PLAYING'. This allows the game to handle
  // input only when appropriate.

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
    // Only handle clicks when on playing screen
    if (game.state.currentScreen !== 'PLAYING') return;

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

    // Only handle clicks when on playing screen
    if (game.state.currentScreen !== 'PLAYING') return;

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
  // TODO - Future Enhancements
  // ============================================================================
  // - Implement quest selection screen with quest data
  // - Implement character selection screen with character data
  // - Add proper game over / victory handlers with transition to game over screen
  // - Add shop screen transition when board is complete
  // - Wire up HP/damage system (call game.state.takeDamage() when hitting mine)
  // - Wire up mana/coin earning system
  // - Add event bus listeners for game events
  // - Add mobile touch handlers (tap = reveal, long-press = flag)
  // - Add keyboard shortcuts (space = flag, etc.)
  // - Add save/load on page unload/load
  // - Populate collection screen with actual data
  // - Wire up settings toggles to actually control sound/music
});
