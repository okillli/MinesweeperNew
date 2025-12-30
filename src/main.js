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

  // Create the main Game instance
  // Game handles the update-render loop and owns GameState and CanvasRenderer
  const game = new Game(canvas);

  // Create the Effects Manager for visual feedback
  // Handles particles, floating text, screen shake, and damage flash
  const effects = new EffectsManager(document.getElementById('game-screen'));
  game.setEffectsManager(effects);

  /**
   * Updates canvas size to fit available space responsively
   * Called on init and window resize
   */
  function updateCanvasSize() {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) return;

    // Get the available space (account for HUD and abilities bar)
    const hud = document.getElementById('hud');
    const abilitiesBar = document.querySelector('.abilities-bar');

    let availableHeight = gameScreen.clientHeight;
    if (hud && !hud.classList.contains('hidden')) {
      availableHeight -= hud.offsetHeight;
    }
    if (abilitiesBar && !abilitiesBar.classList.contains('hidden')) {
      availableHeight -= abilitiesBar.offsetHeight;
    }

    const availableWidth = gameScreen.clientWidth;

    // Use the smaller dimension to ensure the canvas fits
    const size = Math.min(availableWidth, availableHeight);

    // Update canvas size with DPR support
    game.renderer.updateCanvasSize(size, size, game.state.grid);
  }

  // Initial canvas size setup
  updateCanvasSize();

  // Handle window resize
  window.addEventListener('resize', () => {
    updateCanvasSize();
  }, { signal });

  // Handle orientation change on mobile
  window.addEventListener('orientationchange', () => {
    // Small delay to let the browser finish orientation change
    setTimeout(updateCanvasSize, 100);
  }, { signal });

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
      // Show input mode toggle and update its state
      updateInputModeToggleVisibility();
      updateInputModeToggle();
      // Update canvas size for responsive layout
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        updateCanvasSize();
      });
    } else {
      hud.classList.add('hidden');
      // Remove playing class from canvas
      canvas.classList.remove('playing');
      // Hide input mode toggle
      updateInputModeToggleVisibility();
      // Remove canvas mode tints
      canvas.classList.remove('reveal-mode-active', 'flag-mode-active');
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

    // Update abilities bar
    updateAbilitiesBar();
  }

  /**
   * Helper to get grid layout for effects positioning
   * @returns {Object|null} Grid layout from renderer
   */
  function getGridLayout() {
    const grid = game.state.grid;
    if (!grid) return null;
    return game.renderer.calculateGridLayout(grid);
  }

  /**
   * Triggers HUD stat animation
   * @param {string} elementId - ID of the stat element
   * @param {string} animClass - CSS animation class to add
   */
  function animateStatChange(elementId, animClass) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove(animClass);
      void element.offsetWidth; // Force reflow
      element.classList.add(animClass);
      setTimeout(() => element.classList.remove(animClass), 300);
    }
  }

  // ============================================================================
  // INPUT MODE TOGGLE (Mobile FAB)
  // ============================================================================

  const inputModeToggle = document.getElementById('input-mode-toggle');
  const modeIcon = inputModeToggle.querySelector('.mode-icon');
  const modeLabel = inputModeToggle.querySelector('.mode-label');

  /**
   * Updates the input mode toggle button visual state
   */
  function updateInputModeToggle() {
    const isRevealMode = game.state.inputMode === 'reveal';

    // Update button classes
    inputModeToggle.classList.toggle('flag-mode', !isRevealMode);

    // Update icon and label
    modeIcon.textContent = isRevealMode ? '⛏️' : '🚩';
    modeLabel.textContent = isRevealMode ? 'REVEAL' : 'FLAG';

    // Update aria attributes
    inputModeToggle.setAttribute('aria-checked', !isRevealMode);
    inputModeToggle.setAttribute('aria-label',
      `Tap mode: Currently in ${isRevealMode ? 'reveal' : 'flag'} mode. Tap to switch to ${isRevealMode ? 'flag' : 'reveal'} mode.`
    );

    // Update canvas tint
    canvas.classList.toggle('reveal-mode-active', isRevealMode);
    canvas.classList.toggle('flag-mode-active', !isRevealMode);

    console.log(`Input mode: ${game.state.inputMode}`);
  }

  /**
   * Toggles between reveal and flag input modes
   */
  function toggleInputMode() {
    game.state.inputMode = game.state.inputMode === 'reveal' ? 'flag' : 'reveal';
    updateInputModeToggle();

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }

  /**
   * Updates the position of the mode toggle button based on settings
   */
  function updateModeButtonPosition() {
    const position = game.state.persistent.settings.modeButtonPosition || 'right';
    inputModeToggle.classList.toggle('position-left', position === 'left');
  }

  /**
   * Shows or hides the input mode toggle based on game state
   */
  function updateInputModeToggleVisibility() {
    const shouldShow = game.state.currentScreen === 'PLAYING' && !game.state.isGameOver;
    inputModeToggle.classList.toggle('visible', shouldShow);
  }

  // Input mode toggle click handler
  inputModeToggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleInputMode();
  }, { signal });

  // Prevent touch events from bubbling to canvas
  inputModeToggle.addEventListener('touchstart', (event) => {
    event.stopPropagation();
  }, { passive: true, signal });

  inputModeToggle.addEventListener('touchend', (event) => {
    event.stopPropagation();
  }, { passive: true, signal });

  // ============================================================================
  // QUEST SELECTION UI
  // ============================================================================

  /**
   * Populates the quest selection screen with available quests
   */
  function populateQuestUI() {
    const container = document.getElementById('quest-list');
    container.innerHTML = '';

    const unlockedIds = game.state.persistent.unlockedQuests;

    Object.values(QUESTS).forEach(quest => {
      const isUnlocked = unlockedIds.includes(quest.id);
      const element = createQuestCardElement(quest, isUnlocked);
      container.appendChild(element);
    });
  }

  /**
   * Creates a quest card element
   * @param {Object} quest - Quest definition
   * @param {boolean} isUnlocked - Whether quest is unlocked
   * @returns {HTMLElement} Quest card element
   */
  function createQuestCardElement(quest, isUnlocked) {
    const card = document.createElement('div');
    card.className = `quest-card quest-${quest.difficulty}`;

    if (!isUnlocked) {
      card.classList.add('locked');
    }

    // Create difficulty stars
    const stars = '★'.repeat(quest.difficultyStars) + '☆'.repeat(5 - quest.difficultyStars);

    card.innerHTML = `
      <div class="quest-header">
        <span class="quest-name">${quest.name}</span>
        <span class="quest-difficulty">${stars}</span>
      </div>
      <div class="quest-description">${quest.description}</div>
      <div class="quest-objective">${quest.objective.description}</div>
      <div class="quest-footer">
        <span class="quest-reward">+${quest.rewards.gems} gems</span>
        ${!isUnlocked ? `<span class="quest-cost">${quest.unlockCost} gems to unlock</span>` : ''}
      </div>
    `;

    // Add click handler
    if (isUnlocked) {
      card.addEventListener('click', () => selectQuest(quest.id));
    } else {
      card.addEventListener('click', () => attemptUnlockQuest(quest));
    }

    return card;
  }

  /**
   * Attempts to unlock a quest with gems
   * @param {Object} quest - Quest to unlock
   */
  function attemptUnlockQuest(quest) {
    const gems = game.state.persistent.gems;

    if (gems < quest.unlockCost) {
      console.log(`Not enough gems to unlock ${quest.name}. Need ${quest.unlockCost}, have ${gems}`);
      return;
    }

    if (confirm(`Unlock "${quest.name}" for ${quest.unlockCost} gems?`)) {
      game.state.persistent.gems -= quest.unlockCost;
      game.state.persistent.unlockedQuests.push(quest.id);
      SaveSystem.save(game.state);
      populateQuestUI();
      updateMenuStats();
      console.log(`Unlocked quest: ${quest.name}`);
    }
  }

  /**
   * Selects a quest and proceeds to character selection
   * @param {string} questId - Quest ID to select
   */
  function selectQuest(questId) {
    const quest = QUESTS[questId];
    if (!quest) return;

    game.state.currentRun.quest = quest;
    console.log(`Selected quest: ${quest.name}`);

    populateCharacterUI();
    showScreen('character-screen');
  }

  // ============================================================================
  // CHARACTER SELECTION UI
  // ============================================================================

  /**
   * Populates the character selection screen with available characters
   */
  function populateCharacterUI() {
    const container = document.getElementById('character-list');
    container.innerHTML = '';

    const unlockedIds = game.state.persistent.unlockedCharacters;

    Object.values(CHARACTERS).forEach(char => {
      const isUnlocked = unlockedIds.includes(char.id);
      const element = createCharacterCardElement(char, isUnlocked);
      container.appendChild(element);
    });
  }

  /**
   * Creates a character card element
   * @param {Object} char - Character definition
   * @param {boolean} isUnlocked - Whether character is unlocked
   * @returns {HTMLElement} Character card element
   */
  function createCharacterCardElement(char, isUnlocked) {
    const card = document.createElement('div');
    card.className = `character-card`;

    if (!isUnlocked) {
      card.classList.add('locked');
    }

    // Get type color
    const typeColor = getCharacterTypeColor(char.type);

    card.innerHTML = `
      <div class="character-header">
        <span class="character-name">${char.name}</span>
        <span class="character-type" style="color: ${typeColor}">${char.type}</span>
      </div>
      <div class="character-description">${char.description}</div>
      <div class="character-stats">
        <span class="char-stat">HP: ${char.startingHp}/${char.maxHp}</span>
        <span class="char-stat">Mana: ${char.startingMana}/${char.maxMana}</span>
      </div>
      <div class="character-passive">
        <span class="passive-name">${char.passive.name}:</span>
        <span class="passive-desc">${char.passive.description}</span>
      </div>
      <div class="character-footer">
        ${!isUnlocked ? `<span class="character-cost">${char.unlockCost} gems to unlock</span>` : ''}
      </div>
    `;

    // Add click handler
    if (isUnlocked) {
      card.addEventListener('click', () => selectCharacter(char.id));
    } else {
      card.addEventListener('click', () => attemptUnlockCharacter(char));
    }

    return card;
  }

  /**
   * Attempts to unlock a character with gems
   * @param {Object} char - Character to unlock
   */
  function attemptUnlockCharacter(char) {
    const gems = game.state.persistent.gems;

    if (gems < char.unlockCost) {
      console.log(`Not enough gems to unlock ${char.name}. Need ${char.unlockCost}, have ${gems}`);
      return;
    }

    if (confirm(`Unlock "${char.name}" for ${char.unlockCost} gems?`)) {
      game.state.persistent.gems -= char.unlockCost;
      game.state.persistent.unlockedCharacters.push(char.id);
      SaveSystem.save(game.state);
      populateCharacterUI();
      updateMenuStats();
      console.log(`Unlocked character: ${char.name}`);
    }
  }

  /**
   * Selects a character and starts the run
   * Uses board difficulty settings from persistent.settings
   * @param {string} charId - Character ID to select
   */
  function selectCharacter(charId) {
    const char = CHARACTERS[charId];
    if (!char) return;

    game.state.currentRun.character = char;
    console.log(`Selected character: ${char.name}`);

    // Apply character stats
    game.state.currentRun.hp = char.startingHp;
    game.state.currentRun.maxHp = char.maxHp;
    game.state.currentRun.mana = char.startingMana;
    game.state.currentRun.maxMana = char.maxMana;

    // Get starting board from settings (default to 1)
    const startingBoard = game.state.persistent.settings.startingBoard || 1;

    // Reset other run state - set board number to (startingBoard - 1)
    // so generateNextBoard() increments to the correct starting board
    game.state.currentRun.coins = 0;
    game.state.currentRun.boardNumber = startingBoard - 1;
    game.state.currentRun.coinMultiplier = 1.0;
    game.state.currentRun.perfectBoardTracker = true;
    game.state.currentRun.shieldActive = false;
    game.state.currentRun.highlightedMines = [];
    game.state.currentRun.safeRevealStreak = 0;
    game.state.currentRun.manaCostMultiplier = 1.0;
    game.state.currentRun.characterCoinMult = 1.0;

    // Clear items
    game.state.currentRun.items = {
      passive: [],
      active: [],
      consumables: []
    };

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

    // Apply character passive
    applyCharacterPassive(char, game.state);

    // Generate first board using difficulty settings
    const boardConfig = game.state.generateNextBoard();

    // Reset input mode to default for new run
    game.state.inputMode = 'reveal';

    // Focus canvas for keyboard navigation
    canvas.tabIndex = 0;
    canvas.focus();

    // Transition to game screen
    showScreen('game-screen');

    console.log(`Starting run with ${char.name} on Board ${startingBoard}: ${boardConfig.name} (${boardConfig.width}x${boardConfig.height}, ${boardConfig.mines} mines)`);
  }

  /**
   * Updates the main menu stats display
   */
  function updateMenuStats() {
    document.getElementById('menu-gems').textContent = game.state.persistent.gems;
    document.getElementById('menu-runs').textContent = game.state.persistent.stats.totalRuns;
    document.getElementById('menu-wins').textContent = game.state.persistent.stats.totalWins;
  }

  // ============================================================================
  // SHOP UI
  // ============================================================================

  /**
   * Populates the shop screen with current offerings
   */
  function populateShopUI() {
    const shopItemsContainer = document.getElementById('shop-items');
    shopItemsContainer.innerHTML = '';

    // Generate shop offerings if not already generated
    if (ShopSystem.getOfferings().length === 0) {
      ShopSystem.generateOfferings(game.state);
    }

    const offerings = ShopSystem.getOfferings();

    offerings.forEach((item) => {
      const itemElement = createShopItemElement(item);
      shopItemsContainer.appendChild(itemElement);
    });

    // Update coins display
    document.getElementById('shop-coins-display').textContent = game.state.currentRun.coins;
  }

  /**
   * Creates a shop item card element
   * @param {Object} item - Item definition
   * @returns {HTMLElement} Shop item element
   */
  function createShopItemElement(item) {
    const card = document.createElement('div');
    card.className = `shop-item shop-item-${item.rarity}`;

    const check = ShopSystem.canPurchase(game.state, item.id);
    if (!check.canBuy) {
      card.classList.add('disabled');
    }

    card.innerHTML = `
      <div class="shop-item-header">
        <span class="shop-item-name">${item.name}</span>
        <span class="shop-item-rarity rarity-${item.rarity}">${item.rarity}</span>
      </div>
      <div class="shop-item-type">${item.type}</div>
      <div class="shop-item-description">${item.description}</div>
      ${item.manaCost ? `<div class="shop-item-mana">Mana cost: ${item.manaCost}</div>` : ''}
      <div class="shop-item-footer">
        <span class="shop-item-cost">${item.cost} coins</span>
        <button class="btn btn-primary shop-buy-btn" ${!check.canBuy ? 'disabled' : ''}>
          ${check.canBuy ? 'Buy' : check.reason}
        </button>
      </div>
    `;

    // Add buy handler
    const buyBtn = card.querySelector('.shop-buy-btn');
    if (check.canBuy) {
      buyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const result = ShopSystem.purchaseItem(game.state, item.id);
        if (result.success) {
          console.log(result.message);
          // Refresh shop UI
          populateShopUI();
        }
      });
    }

    return card;
  }

  // ============================================================================
  // ABILITIES BAR
  // ============================================================================

  /**
   * Updates the abilities bar with current active items
   */
  function updateAbilitiesBar() {
    const abilitiesBar = document.getElementById('abilities-bar');
    const slotsContainer = document.getElementById('ability-slots');

    const activeItems = game.state.currentRun.items.active;
    const consumables = game.state.currentRun.items.consumables;

    // Hide if no items
    if (activeItems.length === 0 && consumables.length === 0) {
      abilitiesBar.classList.add('hidden');
      return;
    }

    abilitiesBar.classList.remove('hidden');
    slotsContainer.innerHTML = '';

    // Add active abilities
    activeItems.forEach((item, index) => {
      const button = createAbilityButton(item, 'active', index);
      slotsContainer.appendChild(button);
    });

    // Add consumables
    consumables.forEach((item, index) => {
      const button = createAbilityButton(item, 'consumable', index);
      slotsContainer.appendChild(button);
    });
  }

  /**
   * Creates an ability button element
   * @param {Object} item - Item object
   * @param {string} type - 'active' or 'consumable'
   * @param {number} index - Index in inventory
   * @returns {HTMLElement} Button element
   */
  function createAbilityButton(item, type, index) {
    const button = document.createElement('button');
    button.className = `ability-button ability-${type}`;

    if (type === 'active') {
      const canUse = ItemSystem.canUseAbility(game.state, item.id);
      if (!canUse) {
        button.classList.add('disabled');
      }

      button.innerHTML = `
        <span class="ability-name">${item.name}</span>
        <span class="ability-cost">${item.manaCost}</span>
      `;

      button.addEventListener('click', () => {
        if (!ItemSystem.canUseAbility(game.state, item.id)) return;

        // For abilities that need targeting, enter targeting mode
        const def = ItemSystem.getItem(item.id);
        if (def && (def.effect.type === 'reveal_area' || def.effect.type === 'reveal_column')) {
          enterAbilityTargetingMode(item.id);
        } else {
          // Execute immediately (auto-chord, etc.)
          const result = ItemSystem.useActiveAbility(game.state, item.id);
          if (result.success) {
            console.log(`Used ${item.name}: ${result.message}`);
            updateHUD();
            // Check if any cells were revealed for win condition
            if (result.data.cellsRevealed && game.state.grid.isComplete()) {
              handleBoardComplete();
            }
          }
        }
      });
    } else {
      // Consumable
      button.innerHTML = `
        <span class="ability-name">${item.name}</span>
        <span class="ability-type">USE</span>
      `;

      button.addEventListener('click', () => {
        const result = ItemSystem.useConsumable(game.state, index);
        if (result.success) {
          console.log(`Used ${item.name}: ${result.message}`);

          // Handle reroll shop
          if (result.data && result.data.triggerReroll) {
            ShopSystem.rerollShop(game.state);
            if (game.state.currentScreen === 'SHOP') {
              populateShopUI();
            }
          }

          updateHUD();
        }
      });
    }

    return button;
  }

  // ============================================================================
  // ABILITY TARGETING MODE
  // ============================================================================

  let abilityTargetingMode = null; // { itemId: string } or null

  /**
   * Enter ability targeting mode
   * @param {string} itemId - The ability to use
   */
  function enterAbilityTargetingMode(itemId) {
    abilityTargetingMode = { itemId };
    canvas.classList.add('targeting');
    console.log(`Targeting mode: select a cell for ${ItemSystem.getItem(itemId).name}`);
  }

  /**
   * Exit ability targeting mode
   */
  function exitAbilityTargetingMode() {
    abilityTargetingMode = null;
    canvas.classList.remove('targeting');
  }

  // ============================================================================
  // BOARD COMPLETION & VICTORY
  // ============================================================================

  /**
   * Handles board completion - transitions to shop or victory
   */
  function handleBoardComplete() {
    const run = game.state.currentRun;

    // Award perfect board bonus if no damage taken
    if (run.perfectBoardTracker) {
      run.stats.perfectBoards++;
      game.state.addCoins(50); // Perfect board bonus
      console.log('Perfect board! +50 coins bonus');

      // Second Wind: +1 HP on perfect board
      if (ItemSystem.hasPassiveItem(game.state, 'second_wind')) {
        game.state.heal(1);
        console.log('Second Wind: +1 HP for perfect board');
      }
    }

    // Check if run is complete
    if (run.boardNumber >= 6) {
      handleVictory();
      return;
    }

    // Generate shop offerings
    ShopSystem.generateOfferings(game.state);
    populateShopUI();

    // Transition to shop
    showScreen('shop-screen');
    console.log(`Board ${run.boardNumber} complete! Entering shop...`);
  }

  /**
   * Handles victory (all 6 boards cleared)
   */
  function handleVictory() {
    game.state.isGameOver = true;

    // End run with victory
    const summary = game.state.endRun(true);

    // Update game over screen for victory
    updateGameOverScreen(summary);

    // Show overlay
    const overlay = document.getElementById('gameover-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.scrollTop = 0;
    }

    console.log('Victory! All 6 boards cleared!');
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

    // Hide input mode toggle
    updateInputModeToggleVisibility();

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
   * Goes to quest selection screen to begin the run flow
   */
  document.getElementById('start-button').addEventListener('click', () => {
    console.log('Start Run clicked');

    // Reset game over flag
    game.state.isGameOver = false;

    // Populate quest UI and show quest selection
    populateQuestUI();
    showScreen('quest-screen');
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
   * Goes to quest selection to start a fresh run
   */
  document.getElementById('gameover-newgame-button').addEventListener('click', () => {
    // Hide the game over overlay
    const overlay = document.getElementById('gameover-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }

    // Clear board state and reset flags
    game.state.clearBoard();

    // Unfreeze renderer
    game.renderer.unfreeze();

    // Restart game loop
    game.start();

    // Reset game over flag
    game.state.isGameOver = false;

    // Update menu stats (gems may have changed)
    updateMenuStats();

    // Go to quest selection for new run
    populateQuestUI();
    showScreen('quest-screen');

    console.log('New game - going to quest selection');
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

    // Generate next board
    const boardConfig = game.state.generateNextBoard();

    if (!boardConfig) {
      // Run complete - shouldn't happen here but handle it
      handleVictory();
      return;
    }

    // Focus canvas
    canvas.tabIndex = 0;
    canvas.focus();

    // Transition to game screen
    showScreen('game-screen');

    console.log(`Starting Board ${game.state.currentRun.boardNumber}: ${boardConfig.name} (${boardConfig.width}x${boardConfig.height}, ${boardConfig.mines} mines)`);
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

    // Load difficulty settings
    document.getElementById('difficulty').value = settings.difficulty || 'normal';
    document.getElementById('board-size-scale').value = settings.boardSizeScale || 100;
    document.getElementById('mine-density-scale').value = settings.mineDensityScale || 100;
    document.getElementById('starting-board').value = settings.startingBoard || 1;

    // Load custom dimension settings
    document.getElementById('use-custom-dimensions').checked = settings.useCustomDimensions || false;
    document.getElementById('custom-width').value = settings.customWidth || 10;
    document.getElementById('custom-height').value = settings.customHeight || 10;
    document.getElementById('custom-mines').value = settings.customMines || 15;

    // Load mode button position
    document.getElementById('mode-button-position').value = settings.modeButtonPosition || 'right';
    updateModeButtonPosition();

    // Update slider value displays
    document.getElementById('board-size-value').textContent = `${settings.boardSizeScale || 100}%`;
    document.getElementById('mine-density-value').textContent = `${settings.mineDensityScale || 100}%`;

    // Show/hide custom options based on difficulty
    updateCustomOptionsVisibility();

    // Update custom dimensions mode visibility
    updateCustomDimensionsVisibility();

    // Update mines max hint
    updateMinesHint();

    // Update difficulty preview
    updateDifficultyPreview();

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

    // Save difficulty settings
    settings.difficulty = document.getElementById('difficulty').value;
    settings.boardSizeScale = parseInt(document.getElementById('board-size-scale').value, 10);
    settings.mineDensityScale = parseInt(document.getElementById('mine-density-scale').value, 10);
    settings.startingBoard = parseInt(document.getElementById('starting-board').value, 10);

    // Save custom dimension settings
    settings.useCustomDimensions = document.getElementById('use-custom-dimensions').checked;
    settings.customWidth = parseInt(document.getElementById('custom-width').value, 10) || 10;
    settings.customHeight = parseInt(document.getElementById('custom-height').value, 10) || 10;
    settings.customMines = parseInt(document.getElementById('custom-mines').value, 10) || 15;

    // Save mode button position
    settings.modeButtonPosition = document.getElementById('mode-button-position').value;

    // Save to localStorage
    if (typeof SaveSystem !== 'undefined') {
      SaveSystem.save(game.state);
    }

    console.log('Settings saved:', settings);
  }

  /**
   * Show/hide custom difficulty options based on difficulty selection
   */
  function updateCustomOptionsVisibility() {
    const difficulty = document.getElementById('difficulty').value;
    const customOptions = document.getElementById('custom-difficulty-options');

    if (difficulty === 'custom') {
      customOptions.classList.remove('hidden');
    } else {
      customOptions.classList.add('hidden');
    }
  }

  /**
   * Show/hide scaling vs custom dimensions based on toggle
   */
  function updateCustomDimensionsVisibility() {
    const useCustomDimensions = document.getElementById('use-custom-dimensions').checked;
    const scalingOptions = document.getElementById('scaling-mode-options');
    const customDimensionsOptions = document.getElementById('custom-dimensions-options');

    if (useCustomDimensions) {
      scalingOptions.classList.add('hidden');
      customDimensionsOptions.classList.remove('hidden');
    } else {
      scalingOptions.classList.remove('hidden');
      customDimensionsOptions.classList.add('hidden');
    }
  }

  /**
   * Update the mines hint to show max mines for current grid size
   */
  function updateMinesHint() {
    const width = parseInt(document.getElementById('custom-width').value, 10) || 10;
    const height = parseInt(document.getElementById('custom-height').value, 10) || 10;
    const totalCells = width * height;
    const maxMines = totalCells - 9;

    const minesInput = document.getElementById('custom-mines');
    minesInput.max = maxMines;

    // Clamp current value if needed
    const currentMines = parseInt(minesInput.value, 10) || 15;
    if (currentMines > maxMines) {
      minesInput.value = maxMines;
    }

    const hintElement = document.getElementById('mines-hint');
    hintElement.textContent = `Max mines: ${maxMines} (for ${width}×${height} grid)`;
  }

  /**
   * Update the difficulty preview to show current board 1 settings
   */
  function updateDifficultyPreview() {
    const startingBoard = parseInt(document.getElementById('starting-board').value, 10);
    const useCustomDimensions = document.getElementById('use-custom-dimensions').checked;

    const settings = {
      difficulty: document.getElementById('difficulty').value,
      boardSizeScale: parseInt(document.getElementById('board-size-scale').value, 10),
      mineDensityScale: parseInt(document.getElementById('mine-density-scale').value, 10),
      useCustomDimensions: useCustomDimensions,
      customWidth: parseInt(document.getElementById('custom-width').value, 10) || 10,
      customHeight: parseInt(document.getElementById('custom-height').value, 10) || 10,
      customMines: parseInt(document.getElementById('custom-mines').value, 10) || 15
    };

    // Get scaled config for the starting board
    const config = getScaledBoardConfig(startingBoard, settings);

    if (config) {
      const previewTitle = document.querySelector('.preview-title');
      const previewStats = document.getElementById('preview-stats');

      if (settings.difficulty === 'custom' && useCustomDimensions) {
        previewTitle.textContent = `Custom Board Preview:`;
      } else {
        previewTitle.textContent = `${config.name} (Board ${startingBoard}) Preview:`;
      }
      previewStats.textContent = `${config.width}×${config.height} grid, ${config.mines} mines`;
    }
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
   * Difficulty dropdown change handler
   */
  document.getElementById('difficulty').addEventListener('change', () => {
    updateCustomOptionsVisibility();
    updateDifficultyPreview();
    saveSettings();
    console.log(`Difficulty changed to: ${game.state.persistent.settings.difficulty}`);
  });

  /**
   * Board size scale slider change handler
   */
  document.getElementById('board-size-scale').addEventListener('input', () => {
    const value = document.getElementById('board-size-scale').value;
    document.getElementById('board-size-value').textContent = `${value}%`;
    updateDifficultyPreview();
    saveSettings();
  });

  /**
   * Mine density scale slider change handler
   */
  document.getElementById('mine-density-scale').addEventListener('input', () => {
    const value = document.getElementById('mine-density-scale').value;
    document.getElementById('mine-density-value').textContent = `${value}%`;
    updateDifficultyPreview();
    saveSettings();
  });

  /**
   * Starting board dropdown change handler
   */
  document.getElementById('starting-board').addEventListener('change', () => {
    updateDifficultyPreview();
    saveSettings();
    console.log(`Starting board changed to: ${game.state.persistent.settings.startingBoard}`);
  });

  /**
   * Mode button position dropdown change handler
   */
  document.getElementById('mode-button-position').addEventListener('change', () => {
    saveSettings(); // Save first so settings object is updated
    updateModeButtonPosition(); // Then apply the new position
    console.log(`Mode button position changed to: ${game.state.persistent.settings.modeButtonPosition}`);
  });

  /**
   * Use custom dimensions toggle handler
   */
  document.getElementById('use-custom-dimensions').addEventListener('change', () => {
    updateCustomDimensionsVisibility();
    updateDifficultyPreview();
    saveSettings();
    console.log(`Use custom dimensions: ${game.state.persistent.settings.useCustomDimensions}`);
  });

  /**
   * Custom width input handler
   */
  document.getElementById('custom-width').addEventListener('input', () => {
    updateMinesHint();
    updateDifficultyPreview();
    saveSettings();
  });

  /**
   * Custom height input handler
   */
  document.getElementById('custom-height').addEventListener('input', () => {
    updateMinesHint();
    updateDifficultyPreview();
    saveSettings();
  });

  /**
   * Custom mines input handler
   */
  document.getElementById('custom-mines').addEventListener('input', () => {
    updateDifficultyPreview();
    saveSettings();
  });

  /**
   * Clear save data button
   */
  document.getElementById('clear-save-button').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all save data? This cannot be undone.')) {
      SaveSystem.clear();
      game.state.reset();
      loadSettings(); // Reload UI with default settings
      updateMenuStats();
      console.log('Save data cleared');
      alert('Save data has been cleared!');
    }
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  // Load saved data on startup
  const savedData = SaveSystem.load();
  if (savedData) {
    SaveSystem.applyToGameState(game.state, savedData);
    console.log('Loaded saved game data');
  }

  // Initialize settings UI
  loadSettings();

  // Update menu stats display
  updateMenuStats();

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
   * Delegates to CanvasRenderer.canvasToGrid() for centralized coordinate conversion
   *
   * @param {number} canvasX - X position on canvas (CSS pixels from click event)
   * @param {number} canvasY - Y position on canvas (CSS pixels from click event)
   * @returns {{x: number, y: number}|null} Grid coordinates or null if outside grid
   */
  function canvasToGrid(canvasX, canvasY) {
    const grid = game.state.grid;
    if (!grid) return null;

    // Use renderer's centralized coordinate conversion
    return game.renderer.canvasToGrid(canvasX, canvasY, grid);
  }

  /**
   * Handles left-click on canvas
   * - Reveals cell if unrevealed
   * - Chords if cell is already revealed (auto-reveal adjacent cells if flags match)
   * - Executes ability if in targeting mode
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

    // Check if in ability targeting mode
    if (abilityTargetingMode) {
      const result = ItemSystem.useActiveAbility(game.state, abilityTargetingMode.itemId, x, y);
      exitAbilityTargetingMode();

      if (result.success) {
        console.log(`Ability used: ${result.message}`);

        // Award resources for revealed cells
        if (result.data.cellsRevealed && result.data.cellsRevealed > 0) {
          const baseCoins = result.data.cellsRevealed * 10;
          const charCoinMult = game.state.currentRun.characterCoinMult || 1.0;
          const coins = Math.floor(ItemSystem.getModifiedValue(game.state, 'coinEarn', baseCoins) * game.state.currentRun.coinMultiplier * charCoinMult);
          const mana = result.data.cellsRevealed * 5;
          game.state.addCoins(coins);
          game.state.addMana(mana);
          game.state.currentRun.stats.cellsRevealed += result.data.cellsRevealed;
        }

        updateHUD();

        // Check win condition
        if (grid.isComplete()) {
          handleBoardComplete();
        }
      }
      return;
    }
    const cell = grid.getCell(x, y);
    if (!cell) return;

    // Check input mode for click action
    // In flag mode, click toggles flag on unrevealed cells
    if (game.state.inputMode === 'flag' && !cell.isRevealed) {
      const success = grid.toggleFlag(x, y);

      if (success) {
        const updatedCell = grid.getCell(x, y);
        console.log(`${updatedCell.isFlagged ? 'Flagged' : 'Unflagged'} cell at (${x}, ${y}) via click (flag mode)`);
        console.log(`Total flags: ${grid.flagged}/${grid.mineCount}`);

        // Award mana for placing flag (+10)
        if (updatedCell.isFlagged) {
          game.state.addMana(10);
          updateHUD();
          console.log('Flag placed! +10 mana');
        }
      }
      return;
    }

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
          handleBoardComplete();
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
          // Mark board as imperfect
          game.state.currentRun.perfectBoardTracker = false;
          game.state.currentRun.safeRevealStreak = 0;

          // Check for shield protection
          if (game.state.currentRun.shieldActive) {
            game.state.currentRun.shieldActive = false;
            console.log('Shield blocked the damage!');
            updateHUD();
            return;
          }

          // Visual effects: Mine explosion + damage feedback
          const layout = getGridLayout();
          effects.mineExplosion(x, y, layout);
          effects.damage(1, x, y, layout);
          animateStatChange('hp-display', 'hp-change');

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

        // Update safe reveal streak for Fortify Armor
        game.state.currentRun.safeRevealStreak += cellsRevealed;
        ItemSystem.checkFortifyArmor(game.state, game.state.currentRun.safeRevealStreak);

        // Award coins with multipliers (+10 per cell base)
        const baseCoins = cellsRevealed * 10;
        const modifiedCoins = ItemSystem.getModifiedValue(game.state, 'coinEarn', baseCoins);
        const charCoinMult = game.state.currentRun.characterCoinMult || 1.0;
        const coinsEarned = Math.floor(modifiedCoins * game.state.currentRun.coinMultiplier * charCoinMult);
        game.state.addCoins(coinsEarned);

        // Award mana (+5 per cell)
        const manaEarned = cellsRevealed * 5;
        game.state.addMana(manaEarned);

        // Visual effects: Coin and mana gain
        const layout = getGridLayout();
        effects.coinGain(coinsEarned, x, y, layout);
        effects.manaGain(manaEarned, x, y, layout);
        animateStatChange('coins-display', 'coin-change');
        animateStatChange('mana-display', 'mana-change');

        // Update HUD
        updateHUD();

        console.log(`Revealed ${cellsRevealed} cells | +${coinsEarned} coins | +${manaEarned} mana`);

        // Check win condition (all non-mine cells revealed)
        if (grid.isComplete()) {
          handleBoardComplete();
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

      // Award mana for placing flag (base +10, can be modified by items)
      if (cell.isFlagged) {
        const baseMana = 10;
        const manaEarned = ItemSystem.getModifiedValue(game.state, 'flagMana', baseMana);
        game.state.addMana(manaEarned);
        updateHUD();
        console.log(`Flag placed! +${manaEarned} mana`);
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

    // Prevent multi-touch interactions - cancel if more than 1 touch
    if (event.touches.length > 1) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      touchStartPos = null;
      longPressTriggered = false;
      return;
    }

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
      // Re-validate that touch is still active at same location
      if (!touchStartPos) return;

      // Re-calculate coordinates to handle any canvas size changes during hold
      const currentCoords = canvasToGrid(touchStartPos.x, touchStartPos.y);
      if (!currentCoords) {
        touchStartPos = null;
        return;
      }

      const { x, y } = currentCoords;
      const currentGrid = game.state.grid;
      if (!currentGrid) return;

      const cell = currentGrid.getCell(x, y);

      // Only allow flagging on unrevealed cells
      if (cell && !cell.isRevealed) {
        const success = currentGrid.toggleFlag(x, y);

        if (success) {
          const updatedCell = currentGrid.getCell(x, y);
          console.log(`${updatedCell.isFlagged ? 'Flagged' : 'Unflagged'} cell at (${x}, ${y}) via long-press`);
          console.log(`Total flags: ${currentGrid.flagged}/${currentGrid.mineCount}`);

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
   * - Cancels if multi-touch detected
   *
   * @param {TouchEvent} event - The touch move event
   */
  function handleTouchMove(event) {
    // Cancel if more than 1 touch detected (multi-touch)
    if (event.touches.length !== 1) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      touchStartPos = null;
      return;
    }

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

    // Check input mode for tap action
    // In flag mode, tap toggles flag on unrevealed cells
    if (game.state.inputMode === 'flag' && !cell.isRevealed) {
      const success = grid.toggleFlag(x, y);

      if (success) {
        const updatedCell = grid.getCell(x, y);
        console.log(`${updatedCell.isFlagged ? 'Flagged' : 'Unflagged'} cell at (${x}, ${y}) via tap (flag mode)`);
        console.log(`Total flags: ${grid.flagged}/${grid.mineCount}`);

        // Award mana for placing flag (+10)
        if (updatedCell.isFlagged) {
          game.state.addMana(10);
          updateHUD();
          console.log('Flag placed! +10 mana');
        }

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }

      // Mark as handled and clean up
      touchHandled = true;
      setTimeout(() => { touchHandled = false; }, 300);
      touchStartPos = null;
      event.preventDefault();
      return;
    }

    // Execute tap action (reveal mode or revealed cell)
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
          handleBoardComplete();
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
          // Mark board as imperfect
          game.state.currentRun.perfectBoardTracker = false;
          game.state.currentRun.safeRevealStreak = 0;

          // Check for shield protection
          if (game.state.currentRun.shieldActive) {
            game.state.currentRun.shieldActive = false;
            console.log('Shield blocked the damage!');
            updateHUD();
            return;
          }

          // Visual effects: Mine explosion + damage feedback
          const layout = getGridLayout();
          effects.mineExplosion(x, y, layout);
          effects.damage(1, x, y, layout);
          animateStatChange('hp-display', 'hp-change');

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

        // Update safe reveal streak for Fortify Armor
        game.state.currentRun.safeRevealStreak += cellsRevealed;
        ItemSystem.checkFortifyArmor(game.state, game.state.currentRun.safeRevealStreak);

        // Award coins with multipliers (+10 per cell base)
        const baseCoins = cellsRevealed * 10;
        const modifiedCoins = ItemSystem.getModifiedValue(game.state, 'coinEarn', baseCoins);
        const charCoinMult = game.state.currentRun.characterCoinMult || 1.0;
        const coinsEarned = Math.floor(modifiedCoins * game.state.currentRun.coinMultiplier * charCoinMult);
        game.state.addCoins(coinsEarned);

        // Award mana (+5 per cell)
        const manaEarned = cellsRevealed * 5;
        game.state.addMana(manaEarned);

        // Visual effects: Coin and mana gain
        const layout = getGridLayout();
        effects.coinGain(coinsEarned, x, y, layout);
        effects.manaGain(manaEarned, x, y, layout);
        animateStatChange('coins-display', 'coin-change');
        animateStatChange('mana-display', 'mana-change');

        // Update HUD
        updateHUD();

        console.log(`Revealed ${cellsRevealed} cells | +${coinsEarned} coins | +${manaEarned} mana`);

        // Check win condition (all non-mine cells revealed)
        if (grid.isComplete()) {
          handleBoardComplete();
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

    // Reset ALL touch state
    touchStartPos = null;
    longPressTriggered = false;
    touchHandled = false; // Critical: prevent blocking subsequent mouse events
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
    } else if (key === 'd' || key === 'D') {
      // D = Toggle debug overlay
      toggleDebugOverlay();
      handled = true;
    }

    // Prevent default browser behavior for handled keys
    if (handled) {
      event.preventDefault();
    }
  }

  // ============================================================================
  // DEBUG OVERLAY
  // ============================================================================

  /**
   * Toggle the debug overlay visibility
   */
  function toggleDebugOverlay() {
    const overlay = document.getElementById('debug-overlay');
    if (!overlay) return;

    if (overlay.classList.contains('hidden')) {
      overlay.classList.remove('hidden');
      updateDebugOverlay();
    } else {
      overlay.classList.add('hidden');
    }
  }

  /**
   * Update the debug overlay with current grid statistics
   */
  function updateDebugOverlay() {
    const grid = game.state.grid;
    if (!grid) return;

    // Count actual mines and verify numbers
    let actualMines = 0;
    let numberErrors = 0;

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];

        if (cell.isMine) {
          actualMines++;
        } else {
          // Verify number calculation
          let expectedNumber = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < grid.width && ny >= 0 && ny < grid.height) {
                if (grid.cells[ny][nx].isMine) {
                  expectedNumber++;
                }
              }
            }
          }
          if (cell.number !== expectedNumber) {
            numberErrors++;
            console.error(`Number error at (${x},${y}): stored=${cell.number}, expected=${expectedNumber}`);
          }
        }
      }
    }

    // Update display elements
    const setDebugValue = (id, value, isError = false) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        el.className = isError ? 'debug-error' : (value === 'OK' ? 'debug-success' : '');
      }
    };

    setDebugValue('debug-grid-size', `${grid.width}x${grid.height}`);
    setDebugValue('debug-total-cells', grid.width * grid.height);
    setDebugValue('debug-config-mines', grid.mineCount);
    setDebugValue('debug-actual-mines', actualMines, actualMines !== grid.mineCount);
    setDebugValue('debug-revealed', grid.revealed);
    setDebugValue('debug-flagged', grid.flagged);
    setDebugValue('debug-numbers-valid', numberErrors === 0 ? 'OK' : `${numberErrors} errors`, numberErrors > 0);
    setDebugValue('debug-cell-array', `${grid.cells.length}x${grid.cells[0]?.length || 0}`);

    // Log to console for detailed analysis
    console.log('=== Debug Grid Analysis ===');
    console.log(`Grid dimensions: ${grid.width}x${grid.height}`);
    console.log(`Cell array: ${grid.cells.length} rows x ${grid.cells[0]?.length || 0} cols`);
    console.log(`Configured mines: ${grid.mineCount}`);
    console.log(`Actual mines: ${actualMines}`);
    console.log(`Mine count match: ${actualMines === grid.mineCount ? 'YES' : 'NO - MISMATCH!'}`);
    console.log(`Number calculation errors: ${numberErrors}`);
    console.log('===========================');
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
      // Visual effects: Mine explosion + damage feedback
      const layout = getGridLayout();
      effects.mineExplosion(x, y, layout);
      effects.damage(1, x, y, layout);
      animateStatChange('hp-display', 'hp-change');

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

      // Visual effects: Coin and mana gain
      const layout = getGridLayout();
      effects.coinGain(coinsEarned, x, y, layout);
      effects.manaGain(manaEarned, x, y, layout);
      animateStatChange('coins-display', 'coin-change');
      animateStatChange('mana-display', 'mana-change');

      // Update HUD
      updateHUD();

      console.log(`Revealed ${cellsRevealed} cells | +${coinsEarned} coins | +${manaEarned} mana`);
      events.emit('cell_revealed', { x, y, coinsEarned });
    }

    // Check win condition
    if (game.state.grid.isComplete()) {
      handleBoardComplete();
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
        // Visual effects: Flag placement
        const layout = getGridLayout();
        effects.flagPlaced(x, y, layout);

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
      handleBoardComplete();
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
  // - Add save/load on page unload/load
  // - Populate collection screen with actual data
  // - Wire up settings toggles to actually control sound/music
});
