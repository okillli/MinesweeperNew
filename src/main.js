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
  // Create AbortController for event listener cleanup
  const eventController = new AbortController();
  const signal = eventController.signal;

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

  console.log('LiMineZZsweeperIE initialized - Made for Lizzie ✨');

  // Create EventBus instance for game events
  // Note: EventBus is currently used for keyboard navigation events
  // Future phases will expand usage for animations, sounds, achievements
  const events = new EventBus();

  // Helper function to get starting HP from settings
  function getStartingHP() {
    return game.state.persistent.settings.startingHp;
  }

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
      // Add playing class to canvas for cursor feedback
      canvas.classList.add('playing');
    } else {
      hud.classList.add('hidden');
      // Remove playing class from canvas
      canvas.classList.remove('playing');
    }

    console.log(`Switched to screen: ${screenId} (state: ${game.state.currentScreen})`);
  }

  /**
   * Updates the HUD display with current game state
   * Includes color-coded HP display for better visual feedback
   */
  function updateHUD() {
    const run = game.state.currentRun;

    // Update HP display with color coding
    const hpDisplay = document.getElementById('hp-display');
    hpDisplay.textContent = `${run.hp}/${run.maxHp}`;

    // Calculate HP percentage for color coding
    const hpPercent = run.hp / run.maxHp;

    // Remove all HP classes first
    hpDisplay.classList.remove('hp-critical', 'hp-low', 'hp-full');

    // Apply appropriate class based on HP percentage
    if (hpPercent <= 0.33) {
      hpDisplay.classList.add('hp-critical'); // Red + pulsing (≤33%)
    } else if (hpPercent <= 0.66) {
      hpDisplay.classList.add('hp-low'); // Orange (34-66%)
    } else {
      hpDisplay.classList.add('hp-full'); // Green (67-100%)
    }

    // Update other HUD elements
    document.getElementById('mana-display').textContent = `${run.mana}/${run.maxMana}`;
    document.getElementById('coins-display').textContent = run.coins;
    document.getElementById('board-display').textContent = `${run.boardNumber}/6`;
  }

  // ============================================================================
  // GAME OVER HANDLING
  // ============================================================================

  /**
   * Updates the game over overlay with contextual information
   * @param {Object} summary - Summary data from GameState.endRun()
   */
  function updateGameOverScreen(summary) {
    const { victory, gemsEarned, boardNumber, stats } = summary;

    // Update title with victory/defeat styling
    const title = document.getElementById('gameover-title');
    title.textContent = victory ? 'Victory!' : 'Game Over';
    title.className = victory ? 'victory' : 'defeat';

    // Update message box styling
    const messageBox = document.querySelector('.gameover-message-box');
    if (messageBox) {
      messageBox.className = victory ? 'gameover-message-box victory' : 'gameover-message-box';
    }

    // Update message with context
    const message = document.getElementById('gameover-message');
    if (victory) {
      message.innerHTML = 'You completed the quest! Excellent work!';
    } else {
      message.innerHTML = `You were defeated on <strong>Board ${boardNumber}</strong>`;
    }

    // Update stats
    document.getElementById('stat-boards').textContent = boardNumber;
    document.getElementById('stat-cells').textContent = stats.cellsRevealed;
    document.getElementById('stat-coins').textContent = stats.coinsEarned;
    document.getElementById('stat-damage').textContent = stats.minesHit;
    document.getElementById('gems-earned').textContent = gemsEarned;
  }

  /**
   * Handles game over when HP is depleted
   *
   * Flow (following UX best practices):
   * 1. Mine explosion is already shown (mine revealed before this is called)
   * 2. Wait 1 second - let player see what happened (cause-and-effect)
   * 3. Reveal all remaining mines - show where mines were located (learning opportunity)
   * 4. Wait another 1 second - processing time
   * 5. Fade in semi-transparent overlay on top of game screen
   * 6. Game screen stays visible beneath, overlay is scrollable to show stats
   */
  function handleGameOver() {
    // Set game over flag to prevent further clicks
    game.state.isGameOver = true;

    const grid = game.state.grid;

    // Step 1: Mine explosion already shown (mine was revealed before calling this)
    // Step 2: Wait 1 second to let player process what happened
    setTimeout(() => {
      // Step 3: Reveal all remaining mines on the grid
      if (grid) {
        grid.revealAllMines();
      }

      // Step 4: Wait another second to show all mines
      setTimeout(() => {
        // Stop the game loop and freeze canvas rendering
        // This preserves the final state visible beneath the overlay
        game.stop();
        game.renderer.freeze();

        // Transition state and get summary
        const summary = game.state.endRun(false); // false = defeat

        // Update overlay UI with summary
        updateGameOverScreen(summary);

        // Step 5: Show semi-transparent overlay on top of game screen
        // Game screen stays active - we just add overlay on top
        const overlay = document.getElementById('gameover-overlay');
        if (overlay) {
          overlay.classList.remove('hidden');
          // Scroll overlay to top to show message box
          overlay.scrollTop = 0;
        }

        console.log('Game Over - overlay shown, game screen visible beneath');
      }, 1000);
    }, 1000);
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

    // Reset game over flag
    game.state.isGameOver = false;

    // Create a test grid (10x10 with 15 mines - same as Board 2 config)
    const testGrid = new Grid(10, 10, 15);

    // Set the grid in game state
    game.state.grid = testGrid;

    // Center keyboard cursor on new grid
    game.state.centerCursor();

    // Focus canvas for keyboard navigation
    canvas.tabIndex = 0; // Make canvas focusable
    canvas.focus();

    // Initialize run state for testing
    const startingHp = getStartingHP();
    game.state.currentRun.boardNumber = 1;
    game.state.currentRun.hp = startingHp;
    game.state.currentRun.maxHp = startingHp;
    game.state.currentRun.mana = 0;
    game.state.currentRun.maxMana = 100;
    game.state.currentRun.coins = 0;

    // Reset run stats
    game.state.currentRun.stats = {
      cellsRevealed: 0,
      minesHit: 0,
      coinsEarned: 0,
      manaUsed: 0,
      itemsPurchased: 0,
      startTime: Date.now(),
      perfectBoards: 0
    };

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
    loadSettings(); // Ensure UI reflects current settings
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
   * Game Over overlay "New Game" button
   */
  document.getElementById('gameover-newgame-button').addEventListener('click', () => {
    // Hide the game over overlay (game screen is already visible beneath)
    const overlay = document.getElementById('gameover-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }

    // Clear board state and reset flags
    game.state.clearBoard();

    // Create a new test grid (must happen BEFORE centerCursor)
    const testGrid = new Grid(10, 10, 15);
    game.state.grid = testGrid;

    // Center keyboard cursor on new grid (grid must exist first!)
    game.state.centerCursor();

    // Unfreeze renderer
    game.renderer.unfreeze();

    // Restart game loop
    game.start();

    // Focus canvas for keyboard navigation
    canvas.tabIndex = 0;
    canvas.focus();

    // Initialize run state
    const startingHp = getStartingHP();
    game.state.currentRun.boardNumber = 1;
    game.state.currentRun.hp = startingHp;
    game.state.currentRun.maxHp = startingHp;
    game.state.currentRun.mana = 0;
    game.state.currentRun.maxMana = 100;
    game.state.currentRun.coins = 0;

    // Reset run stats
    game.state.currentRun.stats = {
      cellsRevealed: 0,
      minesHit: 0,
      coinsEarned: 0,
      manaUsed: 0,
      itemsPurchased: 0,
      startTime: Date.now(),
      perfectBoards: 0
    };

    // Update HUD with reset values
    updateHUD();

    // Show game screen (critical - without this, user stays on whatever screen was active)
    showScreen('game-screen');

    console.log('New game started from game over overlay');
  });

  /**
   * Game Over overlay "Return to Menu" button
   */
  document.getElementById('gameover-menu-button').addEventListener('click', () => {
    // Hide the game over overlay
    const overlay = document.getElementById('gameover-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }

    // Clear board state
    game.state.clearBoard();

    // Unfreeze renderer
    game.renderer.unfreeze();

    // Restart game loop (needed for menu animations if any)
    game.start();

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
   * Load settings from GameState and update UI
   */
  function loadSettings() {
    const settings = game.state.persistent.settings;

    // Load HP setting
    document.getElementById('starting-hp').value = settings.startingHp;

    // Load audio settings
    document.getElementById('sound-toggle').checked = settings.soundEnabled;
    document.getElementById('music-toggle').checked = settings.musicEnabled;

    console.log('Settings loaded:', settings);
  }

  /**
   * Save settings from UI to GameState
   */
  function saveSettings() {
    const settings = game.state.persistent.settings;

    // Save HP setting
    settings.startingHp = parseInt(document.getElementById('starting-hp').value, 10);

    // Save audio settings
    settings.soundEnabled = document.getElementById('sound-toggle').checked;
    settings.musicEnabled = document.getElementById('music-toggle').checked;

    console.log('Settings saved:', settings);
  }

  /**
   * Starting HP dropdown change handler
   */
  document.getElementById('starting-hp').addEventListener('change', () => {
    saveSettings();
    console.log(`Starting HP changed to: ${game.state.persistent.settings.startingHp}`);
  });

  /**
   * Sound toggle change handler
   */
  document.getElementById('sound-toggle').addEventListener('change', () => {
    saveSettings();
  });

  /**
   * Music toggle change handler
   */
  document.getElementById('music-toggle').addEventListener('change', () => {
    saveSettings();
  });

  /**
   * Clear save data button
   */
  document.getElementById('clear-save-button').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all save data? This cannot be undone.')) {
      game.state.reset();
      loadSettings(); // Reload UI with default settings
      console.log('Save data cleared');
      alert('Save data has been cleared!');
    }
  });

  // Initialize settings UI
  loadSettings();

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
    // Grid dimensions = (cells * cellSize) + (gaps between cells * padding)
    // There are (n-1) gaps between n cells
    const gridWidth = (grid.width * cellSize) + ((grid.width - 1) * padding);
    const gridHeight = (grid.height * cellSize) + ((grid.height - 1) * padding);
    const offsetX = (canvas.width - gridWidth) / 2;
    const offsetY = (canvas.height - gridHeight) / 2;

    // Convert canvas coords to grid coords
    const relativeX = canvasX - offsetX;
    const relativeY = canvasY - offsetY;

    // Calculate grid cell indices
    // Each cell occupies (cellSize + padding) space, but we need to account for
    // the fact that padding only exists between cells, not after the last one
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

    // Prevent clicks if game is over
    if (game.state.isGameOver) return;

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

        // Count safe cells and mines
        const minesHit = chordedCells.filter(c => c.isMine).length;
        const safeCells = chordedCells.length - minesHit;

        // Update cells revealed stat
        game.state.currentRun.stats.cellsRevealed += chordedCells.length;

        // Award coins and mana for safe cells
        if (safeCells > 0) {
          const coinsEarned = safeCells * 10;
          const manaEarned = safeCells * 5;
          game.state.addCoins(coinsEarned);
          game.state.addMana(manaEarned);
          updateHUD();
          console.log(`Chord revealed ${safeCells} safe cells | +${coinsEarned} coins | +${manaEarned} mana`);
        }

        // Apply damage for mines hit
        if (minesHit > 0) {
          game.state.takeDamage(minesHit);
          updateHUD();

          console.log(`Chord hit ${minesHit} mine(s)! HP: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);

          // Only game over if HP depleted
          if (game.state.currentRun.hp <= 0) {
            console.log('HP depleted! Game Over.');
            handleGameOver();
          } else {
            console.log(`Still alive! ${game.state.currentRun.hp} HP remaining`);
          }
          return;
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
      // Track cells revealed for coin calculation
      const revealedBefore = grid.revealed;

      const revealedCell = grid.revealCell(x, y);

      if (revealedCell) {
        console.log(`Revealed cell at (${x}, ${y}) - Mine: ${revealedCell.isMine}, Number: ${revealedCell.number}`);

        // Check if we hit a mine (damage system)
        if (revealedCell.isMine) {
          // Damage system - lose 1 HP per mine
          game.state.takeDamage(1);
          updateHUD();

          console.log(`Hit mine! HP: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);

          // Only game over if HP depleted
          if (game.state.currentRun.hp <= 0) {
            console.log('HP depleted! Game Over.');
            handleGameOver();
          } else {
            console.log(`Still alive! ${game.state.currentRun.hp} HP remaining`);
          }
          return;
        }

        // Calculate how many cells were revealed (including cascade)
        const cellsRevealed = grid.revealed - revealedBefore;

        // Update cells revealed stat
        game.state.currentRun.stats.cellsRevealed += cellsRevealed;

        // Award coins (+10 per cell)
        const coinsEarned = cellsRevealed * 10;
        game.state.addCoins(coinsEarned);

        // Award mana (+5 per cell)
        const manaEarned = cellsRevealed * 5;
        game.state.addMana(manaEarned);

        // Update HUD
        updateHUD();

        console.log(`Revealed ${cellsRevealed} cells | +${coinsEarned} coins | +${manaEarned} mana`);

        // Check win condition (all non-mine cells revealed)
        if (grid.isComplete()) {
          console.log('Congratulations! You won!');
          // TODO: In full game, this would:
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

    // Prevent clicks if game is over
    if (game.state.isGameOver) return;

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

      // Award mana for placing flag (+10)
      if (cell.isFlagged) {
        game.state.addMana(10);
        updateHUD();
        console.log('Flag placed! +10 mana');
      }
    }

    // Re-render is automatic - the game loop continuously renders
    // No need to manually call render() here
  }

  // ============================================================================
  // TOUCH INPUT HANDLERS (MOBILE/TABLET SUPPORT)
  // ============================================================================
  // Touch interaction model:
  // - Tap (touchstart + touchend within 500ms) = reveal cell
  // - Long-press (touchstart held for 500ms+) = toggle flag
  // - Prevent context menu on long-press
  // - Prevent mouse events from double-firing on touch devices

  // Touch state tracking
  let touchStartTime = 0;
  let touchStartPos = null;
  let longPressTimer = null;
  let longPressTriggered = false;
  let touchHandled = false; // Prevents mouse events from double-firing

  const LONG_PRESS_DURATION = 500; // milliseconds
  const TOUCH_MOVE_THRESHOLD = 10; // pixels - max movement allowed for tap/long-press

  /**
   * Handles touch start event
   * - Records touch start time and position
   * - Sets up long-press timer
   *
   * @param {TouchEvent} event - The touch start event
   */
  function handleTouchStart(event) {
    // Hide keyboard cursor when using touch
    game.state.hideCursor();

    // Only handle touches when on playing screen
    if (game.state.currentScreen !== 'PLAYING') return;

    // Prevent touches if game is over
    if (game.state.isGameOver) return;

    const grid = game.state.grid;
    if (!grid) return;

    // Get the first touch point
    const touch = event.touches[0];
    if (!touch) return;

    // Record touch start time and position
    touchStartTime = Date.now();
    const rect = canvas.getBoundingClientRect();
    touchStartPos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };

    // Reset flags
    longPressTriggered = false;
    touchHandled = false;

    // Convert to grid coordinates to check if touch is on a valid cell
    const coords = canvasToGrid(touchStartPos.x, touchStartPos.y);
    if (!coords) {
      touchStartPos = null;
      return;
    }

    // Set up long-press timer
    longPressTimer = setTimeout(() => {
      // Long-press detected - toggle flag
      const { x, y } = coords;
      const cell = grid.getCell(x, y);

      // Only allow flagging on unrevealed cells
      if (cell && !cell.isRevealed) {
        const success = grid.toggleFlag(x, y);

        if (success) {
          const updatedCell = grid.getCell(x, y);
          console.log(`${updatedCell.isFlagged ? 'Flagged' : 'Unflagged'} cell at (${x}, ${y}) via long-press`);
          console.log(`Total flags: ${grid.flagged}/${grid.mineCount}`);

          // Award mana for placing flag (+10)
          if (updatedCell.isFlagged) {
            game.state.addMana(10);
            updateHUD();
            console.log('Flag placed! +10 mana');
          }
        }

        longPressTriggered = true;
        touchHandled = true;

        // Provide haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50); // 50ms vibration
        }
      }
    }, LONG_PRESS_DURATION);

    // Prevent default to avoid text selection and context menu
    event.preventDefault();
  }

  /**
   * Handles touch move event
   * - Cancels long-press if finger moves too far
   *
   * @param {TouchEvent} event - The touch move event
   */
  function handleTouchMove(event) {
    if (!touchStartPos) return;

    const touch = event.touches[0];
    if (!touch) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    // Calculate movement distance
    const dx = currentX - touchStartPos.x;
    const dy = currentY - touchStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If moved too far, cancel long-press
    if (distance > TOUCH_MOVE_THRESHOLD) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      touchStartPos = null;
    }

    event.preventDefault();
  }

  /**
   * Handles touch end event
   * - Executes tap action (reveal) if not a long-press
   * - Cleans up timers and state
   *
   * @param {TouchEvent} event - The touch end event
   */
  function handleTouchEnd(event) {
    // Clean up long-press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    // Only handle touches when on playing screen
    if (game.state.currentScreen !== 'PLAYING') return;

    // Prevent touches if game is over
    if (game.state.isGameOver) {
      touchStartPos = null;
      return;
    }

    const grid = game.state.grid;
    if (!grid) {
      touchStartPos = null;
      return;
    }

    // If long-press was triggered, don't execute tap action
    if (longPressTriggered) {
      touchStartPos = null;
      event.preventDefault();
      return;
    }

    // Check if this was a valid tap (quick touch within time threshold)
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration >= LONG_PRESS_DURATION || !touchStartPos) {
      touchStartPos = null;
      return;
    }

    // Get touch end position
    const touch = event.changedTouches[0];
    if (!touch) {
      touchStartPos = null;
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const endX = touch.clientX - rect.left;
    const endY = touch.clientY - rect.top;

    // Check if touch ended near where it started (not a swipe)
    const dx = endX - touchStartPos.x;
    const dy = endY - touchStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > TOUCH_MOVE_THRESHOLD) {
      touchStartPos = null;
      return;
    }

    // Convert to grid coordinates
    const coords = canvasToGrid(touchStartPos.x, touchStartPos.y);
    if (!coords) {
      touchStartPos = null;
      return;
    }

    const { x, y } = coords;
    const cell = grid.getCell(x, y);
    if (!cell) {
      touchStartPos = null;
      return;
    }

    // Execute tap action (same as left-click)
    // If cell is already revealed, try to chord
    if (cell.isRevealed) {
      const chordedCells = grid.chord(x, y);

      if (chordedCells.length > 0) {
        console.log(`Chorded ${chordedCells.length} cells at (${x}, ${y}) via tap`);

        // Count safe cells and mines
        const minesHit = chordedCells.filter(c => c.isMine).length;
        const safeCells = chordedCells.length - minesHit;

        // Update cells revealed stat
        game.state.currentRun.stats.cellsRevealed += chordedCells.length;

        // Award coins and mana for safe cells
        if (safeCells > 0) {
          const coinsEarned = safeCells * 10;
          const manaEarned = safeCells * 5;
          game.state.addCoins(coinsEarned);
          game.state.addMana(manaEarned);
          updateHUD();
          console.log(`Chord revealed ${safeCells} safe cells | +${coinsEarned} coins | +${manaEarned} mana`);
        }

        // Apply damage for mines hit
        if (minesHit > 0) {
          game.state.takeDamage(minesHit);
          updateHUD();

          console.log(`Chord hit ${minesHit} mine(s)! HP: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);

          // Only game over if HP depleted
          if (game.state.currentRun.hp <= 0) {
            console.log('HP depleted! Game Over.');
            handleGameOver();
          } else {
            console.log(`Still alive! ${game.state.currentRun.hp} HP remaining`);
          }
          touchStartPos = null;
          return;
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
      // Track cells revealed for coin calculation
      const revealedBefore = grid.revealed;

      const revealedCell = grid.revealCell(x, y);

      if (revealedCell) {
        console.log(`Revealed cell at (${x}, ${y}) via tap - Mine: ${revealedCell.isMine}, Number: ${revealedCell.number}`);

        // Check if we hit a mine (damage system)
        if (revealedCell.isMine) {
          // Damage system - lose 1 HP per mine
          game.state.takeDamage(1);
          updateHUD();

          console.log(`Hit mine! HP: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);

          // Only game over if HP depleted
          if (game.state.currentRun.hp <= 0) {
            console.log('HP depleted! Game Over.');
            handleGameOver();
          } else {
            console.log(`Still alive! ${game.state.currentRun.hp} HP remaining`);
          }
          touchStartPos = null;
          return;
        }

        // Calculate how many cells were revealed (including cascade)
        const cellsRevealed = grid.revealed - revealedBefore;

        // Update cells revealed stat
        game.state.currentRun.stats.cellsRevealed += cellsRevealed;

        // Award coins (+10 per cell)
        const coinsEarned = cellsRevealed * 10;
        game.state.addCoins(coinsEarned);

        // Award mana (+5 per cell)
        const manaEarned = cellsRevealed * 5;
        game.state.addMana(manaEarned);

        // Update HUD
        updateHUD();

        console.log(`Revealed ${cellsRevealed} cells | +${coinsEarned} coins | +${manaEarned} mana`);

        // Check win condition (all non-mine cells revealed)
        if (grid.isComplete()) {
          console.log('Congratulations! You won!');
          // TODO: Implement proper victory flow
        }
      }
    }

    // Mark as handled to prevent mouse events from double-firing
    touchHandled = true;

    // Reset touchHandled flag after a short delay
    // This prevents the corresponding mouse events from firing
    setTimeout(() => {
      touchHandled = false;
    }, 300);

    touchStartPos = null;
    event.preventDefault();
  }

  /**
   * Handles touch cancel event
   * - Cleans up timers and state when touch is interrupted
   *
   * @param {TouchEvent} event - The touch cancel event
   */
  function handleTouchCancel(event) {
    // Clean up long-press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    touchStartPos = null;
    longPressTriggered = false;
    event.preventDefault();
  }

  /**
   * Modified left-click handler that prevents double-firing with touch events
   */
  function handleLeftClickWithTouchCheck(event) {
    // Ignore if this click was already handled by touch events
    if (touchHandled) {
      return;
    }
    // Otherwise, execute normal left-click logic
    handleLeftClick(event);
  }

  /**
   * Modified right-click handler that prevents context menu on long-press
   */
  function handleRightClickWithTouchCheck(event) {
    // Prevent context menu during touch interactions
    if (longPressTriggered || touchStartPos !== null) {
      event.preventDefault();
      return;
    }
    // Otherwise, execute normal right-click logic
    handleRightClick(event);
  }

  // ============================================================================
  // HOVER FEEDBACK HANDLERS (DESKTOP MOUSE SUPPORT)
  // ============================================================================
  // Tracks mouse position over canvas to provide visual feedback showing
  // which cell will be affected by a click before the user commits to the action.

  /**
   * Handles mouse movement over canvas
   * - Tracks which cell is currently hovered
   * - Updates hover state for visual feedback
   *
   * @param {MouseEvent} event - The mousemove event
   */
  function handleMouseMove(event) {
    // Hide keyboard cursor when using mouse
    game.state.hideCursor();

    // Only track hover when on playing screen
    if (game.state.currentScreen !== 'PLAYING') {
      game.state.hoverCell = null;
      return;
    }

    // Don't show hover if game is over
    if (game.state.isGameOver) {
      game.state.hoverCell = null;
      return;
    }

    const grid = game.state.grid;
    if (!grid) {
      game.state.hoverCell = null;
      return;
    }

    // Get canvas coordinates
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Convert to grid coordinates
    const coords = canvasToGrid(canvasX, canvasY);

    // Update hover state only if it changed (performance optimization)
    const currentHover = game.state.hoverCell;
    if (coords) {
      if (!currentHover || currentHover.x !== coords.x || currentHover.y !== coords.y) {
        game.state.hoverCell = coords;
      }
    } else {
      game.state.hoverCell = null;
    }
  }

  /**
   * Handles mouse leaving canvas
   * - Clears hover state when mouse exits canvas area
   *
   * @param {MouseEvent} event - The mouseleave event
   */
  function handleMouseLeave(event) {
    game.state.hoverCell = null;
  }

  // Register mouse event listeners with touch-aware wrappers
  canvas.addEventListener('click', handleLeftClickWithTouchCheck, { signal });
  canvas.addEventListener('contextmenu', handleRightClickWithTouchCheck, { signal });
  canvas.addEventListener('mousemove', handleMouseMove, { signal });
  canvas.addEventListener('mouseleave', handleMouseLeave, { signal });

  // Register touch event listeners
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false, signal });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false, signal });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false, signal });
  canvas.addEventListener('touchcancel', handleTouchCancel, { passive: false, signal });

  console.log('Touch support enabled - tap to reveal, long-press (500ms) to flag');

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  /**
   * Keyboard event handler for grid navigation and actions
   * Follows WCAG 2.1 standards: arrow keys for navigation, Space/Enter for actions
   */
  function handleKeyDown(event) {
    const { key, shiftKey, ctrlKey, metaKey } = event;

    // Only handle keyboard input when playing and not game over
    if (game.state.currentScreen !== 'PLAYING' || game.state.isGameOver) return;
    if (!game.state.grid) return;

    // Ignore if modifier keys are held (except Shift for specific actions)
    if (ctrlKey || metaKey) return;

    let handled = false;

    // Arrow key navigation
    if (key === 'ArrowUp') {
      game.state.moveCursor(0, -1);
      handled = true;
    } else if (key === 'ArrowDown') {
      game.state.moveCursor(0, 1);
      handled = true;
    } else if (key === 'ArrowLeft') {
      game.state.moveCursor(-1, 0);
      handled = true;
    } else if (key === 'ArrowRight') {
      game.state.moveCursor(1, 0);
      handled = true;
    }

    // Action keys
    else if (key === ' ' || key === 'Enter') {
      if (shiftKey) {
        // Shift+Space = Chord
        performChordAtCursor();
      } else {
        // Space/Enter = Reveal
        performRevealAtCursor();
      }
      handled = true;
    } else if (key === 'f' || key === 'F') {
      // F = Toggle flag
      performFlagAtCursor();
      handled = true;
    } else if (key === 'c' || key === 'C') {
      // C = Chord
      performChordAtCursor();
      handled = true;
    }

    // Prevent default browser behavior for handled keys
    if (handled) {
      event.preventDefault();
    }
  }

  /**
   * Perform reveal action at keyboard cursor position
   * Same logic as handleLeftClick for unrevealed cells
   */
  function performRevealAtCursor() {
    const { x, y } = game.state.cursor;
    const cell = game.state.grid.getCell(x, y);

    if (!cell || cell.isRevealed || cell.isFlagged) return;

    // Track cells revealed for coin calculation
    const revealedBefore = game.state.grid.revealed;

    const revealed = game.state.grid.revealCell(x, y);
    if (!revealed) return;

    // Handle mine hit (damage system)
    if (revealed.isMine) {
      // Damage system - lose 1 HP per mine
      game.state.takeDamage(1);
      updateHUD();

      console.log(`Hit mine! HP: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);

      // Only game over if HP depleted
      if (game.state.currentRun.hp <= 0) {
        console.log('HP depleted! Game Over.');
        // Small delay to show the revealed mine before game over sequence
        setTimeout(() => {
          handleGameOver();
        }, 200);
      } else {
        console.log(`Still alive! ${game.state.currentRun.hp} HP remaining`);
      }
      return;
    } else {
      // Calculate how many cells were revealed (including cascade)
      const cellsRevealed = game.state.grid.revealed - revealedBefore;

      // Update cells revealed stat
      game.state.currentRun.stats.cellsRevealed += cellsRevealed;

      // Award coins (+10 per cell)
      const coinsEarned = cellsRevealed * 10;
      game.state.addCoins(coinsEarned);

      // Award mana (+5 per cell)
      const manaEarned = cellsRevealed * 5;
      game.state.addMana(manaEarned);

      // Update HUD
      updateHUD();

      console.log(`Revealed ${cellsRevealed} cells | +${coinsEarned} coins | +${manaEarned} mana`);
      events.emit('cell_revealed', { x, y, coinsEarned });
    }

    // Check win condition
    if (game.state.grid.isComplete()) {
      game.state.isGameOver = true;
      events.emit('board_complete', { boardIndex: game.state.currentRun.boardNumber });
    }
  }

  /**
   * Perform flag toggle at keyboard cursor position
   * Same logic as handleRightClick
   */
  function performFlagAtCursor() {
    const { x, y } = game.state.cursor;
    const cell = game.state.grid.getCell(x, y);

    if (!cell || cell.isRevealed) return;

    const success = game.state.grid.toggleFlag(x, y);

    // Award mana for placing flag (+10)
    if (success) {
      const updatedCell = game.state.grid.getCell(x, y);
      if (updatedCell && updatedCell.isFlagged) {
        game.state.addMana(10);
        updateHUD();
        console.log('Flag placed! +10 mana');
        events.emit('flag_placed', { x, y });
      }
    }
  }

  /**
   * Perform chord action at keyboard cursor position
   * Same logic as handleLeftClick for revealed cells
   */
  function performChordAtCursor() {
    const { x, y } = game.state.cursor;
    const cell = game.state.grid.getCell(x, y);

    if (!cell || !cell.isRevealed || cell.number === 0) return;

    const revealedCells = game.state.grid.chord(x, y);

    // Check if any chorded cells were mines (damage system)
    const minesHit = revealedCells.filter(c => c.isMine).length;
    if (minesHit > 0) {
      // Apply damage for each mine hit
      game.state.takeDamage(minesHit);
      updateHUD();

      console.log(`💥 Chord hit ${minesHit} mine(s)! HP: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);

      // Only game over if HP depleted
      if (game.state.currentRun.hp <= 0) {
        console.log('☠️  HP depleted! Game Over.');
        // Small delay to show the revealed mine before game over sequence
        setTimeout(() => {
          handleGameOver();
        }, 200);
      } else {
        console.log(`❤️  Still alive! ${game.state.currentRun.hp} HP remaining`);
      }
      return;
    }

    // Count safe cells and award resources
    const safeCells = revealedCells.filter(c => !c.isMine).length;

    if (safeCells > 0) {
      // Award coins and mana for safe cells
      const coinsEarned = safeCells * 10;
      const manaEarned = safeCells * 5;
      game.state.addCoins(coinsEarned);
      game.state.addMana(manaEarned);

      // Update stats
      game.state.currentRun.stats.cellsRevealed += safeCells;

      // Update HUD
      updateHUD();

      console.log(`Chord revealed ${safeCells} safe cells | +${coinsEarned} coins | +${manaEarned} mana`);

      // Emit events for each revealed cell
      for (const revealed of revealedCells) {
        if (!revealed.isMine) {
          events.emit('cell_revealed', {
            x: revealed.x,
            y: revealed.y,
            coinsEarned: 10
          });
        }
      }
    }

    // Check win condition
    if (game.state.grid.isComplete()) {
      game.state.isGameOver = true;
      events.emit('board_complete', { boardIndex: game.state.currentRun.boardNumber });
    }
  }

  // Register keyboard listener
  document.addEventListener('keydown', handleKeyDown, { signal });

  console.log('Keyboard navigation enabled - use arrow keys to move, Space/Enter to reveal, F to flag');

  // ============================================================================
  // EVENT LISTENER CLEANUP
  // ============================================================================

  // Cleanup event listeners on page unload
  window.addEventListener('beforeunload', () => {
    eventController.abort();
  });

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
  // - Add keyboard shortcuts (space = flag, etc.)
  // - Add save/load on page unload/load
  // - Populate collection screen with actual data
  // - Wire up settings toggles to actually control sound/music
});
