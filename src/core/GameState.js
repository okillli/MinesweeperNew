/**
 * GameState.js
 *
 * Centralized state management for MineQuest.
 * This is the single source of truth for all game state.
 *
 * State Management Philosophy:
 * - Pure data structure with minimal logic
 * - Never directly manipulates DOM or Canvas
 * - Returns data that renderers consume
 * - State flows in one direction: Input → Update → State → Render
 */

class GameState {
  /**
   * Initialize game state with default values
   */
  constructor() {
    // Meta state - current screen being displayed
    this.currentScreen = 'MENU'; // 'MENU' | 'PLAYING' | 'SHOP' | 'GAME_OVER'

    // Run state - data for the current run (resets each run)
    this.currentRun = {
      quest: null,           // Current quest object from quests.js
      character: null,       // Selected character class from characters.js
      boardNumber: 0,        // Current board (0-5, incremented before each board)
      hp: 3,                 // Current HP
      maxHp: 3,              // Maximum HP (can be modified by items)
      mana: 0,               // Current mana
      maxMana: 100,          // Maximum mana (can be modified by items)
      coins: 0,              // Current coins (in-run currency)

      items: {
        passive: [],         // Array of passive item objects
        active: [],          // Array of active ability objects
        consumables: []      // Array of consumable item objects
      },

      stats: {
        cellsRevealed: 0,    // Total cells revealed this run
        minesHit: 0,         // Total mines hit this run
        coinsEarned: 0,      // Total coins earned this run
        manaUsed: 0,         // Total mana spent this run
        itemsPurchased: 0,   // Total items purchased this run
        startTime: 0,        // Run start timestamp (for speed tracking)
        perfectBoards: 0     // Number of boards cleared without damage
      }
    };

    // Current board state
    this.grid = null;        // Current Grid instance (null when not playing)

    // Persistent state - saved to localStorage
    this.persistent = {
      gems: 0,               // Total gems (meta-currency)
      unlockedItems: [
        // MVP Starter Pool (10 items total)
        // Common Passives (5)
        'shield_generator',      // +1 Max HP
        'coin_magnet',           // +50% coins from cells
        'mana_crystal',          // +50 Max Mana
        'flag_efficiency',       // +15 mana per flagged mine
        'lucky_charm',           // +15% chance for better shop items
        // Common Actives (2)
        'scan_area',             // Reveal 3x3 area safely (50 mana)
        'mine_detector',         // Highlight 3 random mines (75 mana)
        // Consumables (3)
        'health_potion',         // Heal 1 HP
        'vision_scroll',         // Reveal 5 random safe cells
        'shield_token'           // Next mine hit does no damage
      ],
      unlockedCharacters: ['explorer'], // Array of unlocked character IDs (Explorer starts unlocked)
      unlockedQuests: [
        // MVP Starter Quests (3)
        'classic_clear',         // Objective: Clear all 5 boards
        'treasure_hunter',       // Objective: Collect 500 coins
        'boss_slayer'            // Objective: Defeat the boss board
      ],
      achievements: [],      // Array of achievement IDs (strings)

      stats: {
        totalRuns: 0,        // Total runs started
        totalWins: 0,        // Total successful quest completions
        totalCoins: 0,       // Total coins earned across all runs
        totalDamage: 0,      // Total damage taken across all runs
        totalMana: 0,        // Total mana spent across all runs
        totalCellsRevealed: 0, // Total cells revealed across all runs
        totalItemsPurchased: 0, // Total items purchased across all runs
        fastestRun: Infinity // Fastest run completion time (milliseconds)
      }
    };
  }

  /**
   * Update game state based on delta time
   * @param {number} deltaTime - Time elapsed since last frame (seconds)
   */
  update(deltaTime) {
    // Update systems based on current screen
    if (this.currentScreen === 'PLAYING') {
      // Game update logic would go here
      // For now, this is minimal - actual game logic happens in Grid and other systems
    }

    // Other screen-specific updates can be added here
    // (e.g., shop animations, menu transitions, etc.)
  }

  /**
   * Initialize a new run with selected quest and character
   * @param {Object} quest - Quest definition from quests.js
   * @param {Object} character - Character definition from characters.js
   */
  startRun(quest, character) {
    // Set quest and character
    this.currentRun.quest = quest;
    this.currentRun.character = character;

    // Reset run state
    this.currentRun.boardNumber = 0;
    this.currentRun.hp = character.startingHp || 3;
    this.currentRun.maxHp = character.maxHp || 3;
    this.currentRun.mana = character.startingMana || 0;
    this.currentRun.maxMana = 100;
    this.currentRun.coins = 0;

    // Clear items
    this.currentRun.items = {
      passive: [],
      active: [],
      consumables: []
    };

    // Reset run stats
    this.currentRun.stats = {
      cellsRevealed: 0,
      minesHit: 0,
      coinsEarned: 0,
      manaUsed: 0,
      itemsPurchased: 0,
      startTime: Date.now(),
      perfectBoards: 0
    };

    // Update persistent stats
    this.persistent.stats.totalRuns++;

    // Transition to playing screen
    this.currentScreen = 'PLAYING';

    // Generate first board
    this.generateNextBoard();
  }

  /**
   * Generate the next board in the run
   * Increments board number and creates a new grid
   * NOTE: Grid generation logic not implemented yet - just increments boardNumber and sets grid to null
   */
  generateNextBoard() {
    // Increment board number (1-6)
    this.currentRun.boardNumber++;

    // TODO: Implement proper board configuration based on boardNumber
    // For now, just set grid to null
    // Later this will create a new Grid instance with proper size/mines based on board config
    this.grid = null;

    // Board configurations will be:
    // Board 1: 8x8, 10 mines
    // Board 2: 10x10, 15 mines
    // Board 3: 12x12, 25 mines
    // Board 4: 14x14, 35 mines
    // Board 5: 14x14, 40 mines
    // Board 6: 16x16, 50 mines (BOSS)
  }

  /**
   * End the current run
   * Calculate rewards, update persistent stats, and transition to game over screen
   * @param {boolean} victory - Whether the run was successful
   */
  endRun(victory) {
    // Calculate run duration
    const runDuration = Date.now() - this.currentRun.stats.startTime;

    // Update fastest run if victorious
    if (victory && runDuration < this.persistent.stats.fastestRun) {
      this.persistent.stats.fastestRun = runDuration;
    }

    // Calculate gems earned
    let gemsEarned = 0;

    if (victory) {
      // Base quest completion reward
      gemsEarned += this.currentRun.quest.rewards?.gems || 20;

      // Quest objective bonus (quest-specific logic would go here)
      // For now, just add quest bonus if it exists
      if (this.currentRun.quest.rewards?.bonus) {
        gemsEarned += this.currentRun.quest.rewards.bonus;
      }

      // Perfect board bonuses (+5 gems per perfect board)
      gemsEarned += this.currentRun.stats.perfectBoards * 5;

      // Update total wins
      this.persistent.stats.totalWins++;
    }

    // Award gems
    this.persistent.gems += gemsEarned;

    // Update persistent stats
    this.persistent.stats.totalCoins += this.currentRun.stats.coinsEarned;
    this.persistent.stats.totalDamage += this.currentRun.stats.minesHit;
    this.persistent.stats.totalMana += this.currentRun.stats.manaUsed;
    this.persistent.stats.totalCellsRevealed += this.currentRun.stats.cellsRevealed;
    this.persistent.stats.totalItemsPurchased += this.currentRun.stats.itemsPurchased;

    // Clear grid
    this.grid = null;

    // Transition to game over screen
    this.currentScreen = 'GAME_OVER';

    // Save to localStorage would happen here
    // TODO: Call SaveSystem.save(this) when SaveSystem is implemented

    // Return summary data for game over screen
    return {
      victory,
      gemsEarned,
      runDuration,
      stats: { ...this.currentRun.stats }
    };
  }

  /**
   * Add mana to the current run
   * @param {number} amount - Amount of mana to add
   */
  addMana(amount) {
    this.currentRun.mana = Math.min(
      this.currentRun.mana + amount,
      this.currentRun.maxMana
    );
  }

  /**
   * Spend mana from the current run
   * @param {number} amount - Amount of mana to spend
   * @returns {boolean} - Whether the mana was successfully spent
   */
  spendMana(amount) {
    if (this.currentRun.mana >= amount) {
      this.currentRun.mana -= amount;
      this.currentRun.stats.manaUsed += amount;
      return true;
    }
    return false;
  }

  /**
   * Add coins to the current run
   * @param {number} amount - Amount of coins to add
   */
  addCoins(amount) {
    this.currentRun.coins += amount;
    this.currentRun.stats.coinsEarned += amount;
  }

  /**
   * Spend coins from the current run
   * @param {number} amount - Amount of coins to spend
   * @returns {boolean} - Whether the coins were successfully spent
   */
  spendCoins(amount) {
    if (this.currentRun.coins >= amount) {
      this.currentRun.coins -= amount;
      return true;
    }
    return false;
  }

  /**
   * Take damage (hit a mine)
   * @param {number} amount - Amount of damage to take (default 1)
   * @returns {boolean} - Whether the player is still alive
   */
  takeDamage(amount = 1) {
    this.currentRun.hp = Math.max(0, this.currentRun.hp - amount);
    this.currentRun.stats.minesHit += amount;
    return this.currentRun.hp > 0;
  }

  /**
   * Heal HP
   * @param {number} amount - Amount of HP to heal
   */
  heal(amount) {
    this.currentRun.hp = Math.min(
      this.currentRun.hp + amount,
      this.currentRun.maxHp
    );
  }

  /**
   * Add an item to the current run
   * @param {Object} item - Item object to add
   * @param {string} category - Item category ('passive', 'active', or 'consumables')
   */
  addItem(item, category) {
    if (this.currentRun.items[category]) {
      this.currentRun.items[category].push(item);
      this.currentRun.stats.itemsPurchased++;
    }
  }

  /**
   * Remove a consumable item (after use)
   * @param {number} index - Index of consumable to remove
   */
  removeConsumable(index) {
    if (index >= 0 && index < this.currentRun.items.consumables.length) {
      this.currentRun.items.consumables.splice(index, 1);
    }
  }

  /**
   * Check if the current board is the boss board
   * @returns {boolean} - Whether current board is the boss (board 6)
   */
  isBossBoard() {
    return this.currentRun.boardNumber === 6;
  }

  /**
   * Check if the run is complete (all boards cleared)
   * @returns {boolean} - Whether all boards have been cleared
   */
  isRunComplete() {
    return this.currentRun.boardNumber >= 6;
  }

  /**
   * Reset all game state (for new game / clear save)
   */
  reset() {
    // Reset to default state
    this.currentScreen = 'MENU';

    // Reset run state
    this.currentRun = {
      quest: null,
      character: null,
      boardNumber: 0,
      hp: 3,
      maxHp: 3,
      mana: 0,
      maxMana: 100,
      coins: 0,
      items: { passive: [], active: [], consumables: [] },
      stats: {
        cellsRevealed: 0,
        minesHit: 0,
        coinsEarned: 0,
        manaUsed: 0,
        itemsPurchased: 0,
        startTime: 0,
        perfectBoards: 0
      }
    };

    // Clear grid
    this.grid = null;

    // Reset persistent state
    this.persistent = {
      gems: 0,
      unlockedItems: [
        // MVP Starter Pool (10 items total)
        // Common Passives (5)
        'shield_generator',      // +1 Max HP
        'coin_magnet',           // +50% coins from cells
        'mana_crystal',          // +50 Max Mana
        'flag_efficiency',       // +15 mana per flagged mine
        'lucky_charm',           // +15% chance for better shop items
        // Common Actives (2)
        'scan_area',             // Reveal 3x3 area safely (50 mana)
        'mine_detector',         // Highlight 3 random mines (75 mana)
        // Consumables (3)
        'health_potion',         // Heal 1 HP
        'vision_scroll',         // Reveal 5 random safe cells
        'shield_token'           // Next mine hit does no damage
      ],
      unlockedCharacters: ['explorer'],
      unlockedQuests: [
        // MVP Starter Quests (3)
        'classic_clear',         // Objective: Clear all 5 boards
        'treasure_hunter',       // Objective: Collect 500 coins
        'boss_slayer'            // Objective: Defeat the boss board
      ],
      achievements: [],
      stats: {
        totalRuns: 0,
        totalWins: 0,
        totalCoins: 0,
        totalDamage: 0,
        totalMana: 0,
        totalCellsRevealed: 0,
        totalItemsPurchased: 0,
        fastestRun: Infinity
      }
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameState;
}
