/**
 * SaveSystem.js
 *
 * Handles localStorage persistence for MineQuest.
 * Saves and loads persistent game data (unlocks, gems, stats, settings).
 *
 * DEPENDENCIES:
 * - None (pure utility class)
 *
 * DEPENDENTS:
 * - main.js (load on startup, save on key events)
 * - GameState.js (save hooks after state changes)
 *
 * Design: Static utility class with localStorage operations.
 */

class SaveSystem {
  static STORAGE_KEY = 'minequest_save';
  static CURRENT_VERSION = '0.5.0';

  /**
   * Save game state to localStorage
   * @param {GameState} gameState - The game state to save
   * @returns {boolean} True if save was successful
   */
  static save(gameState) {
    try {
      const data = {
        version: this.CURRENT_VERSION,
        timestamp: Date.now(),
        persistent: {
          gems: gameState.persistent.gems,
          settings: { ...gameState.persistent.settings },
          unlockedItems: [...gameState.persistent.unlockedItems],
          unlockedCharacters: [...gameState.persistent.unlockedCharacters],
          unlockedQuests: [...gameState.persistent.unlockedQuests],
          achievements: [...gameState.persistent.achievements],
          stats: { ...gameState.persistent.stats }
        }
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('Game saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game state from localStorage
   * @returns {Object|null} Saved data or null if no save exists
   */
  static load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        console.log('No save data found');
        return null;
      }

      const data = JSON.parse(raw);

      // Version migration if needed
      if (data.version !== this.CURRENT_VERSION) {
        console.log(`Migrating save from ${data.version} to ${this.CURRENT_VERSION}`);
        return this._migrate(data);
      }

      console.log('Game loaded successfully');
      return data;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Apply loaded data to game state
   * @param {GameState} gameState - The game state to update
   * @param {Object} savedData - The loaded save data
   */
  static applyToGameState(gameState, savedData) {
    if (!savedData || !savedData.persistent) return;

    const p = savedData.persistent;

    // Apply saved values
    gameState.persistent.gems = p.gems ?? 0;

    // Settings
    if (p.settings) {
      gameState.persistent.settings = { ...gameState.persistent.settings, ...p.settings };
    }

    // Unlocks - merge with defaults to ensure new items are available
    if (p.unlockedItems) {
      gameState.persistent.unlockedItems = [...new Set([
        ...gameState.persistent.unlockedItems,
        ...p.unlockedItems
      ])];
    }

    if (p.unlockedCharacters) {
      gameState.persistent.unlockedCharacters = [...new Set([
        ...gameState.persistent.unlockedCharacters,
        ...p.unlockedCharacters
      ])];
    }

    if (p.unlockedQuests) {
      gameState.persistent.unlockedQuests = [...new Set([
        ...gameState.persistent.unlockedQuests,
        ...p.unlockedQuests
      ])];
    }

    if (p.achievements) {
      gameState.persistent.achievements = [...new Set([
        ...gameState.persistent.achievements,
        ...p.achievements
      ])];
    }

    // Stats - keep higher values
    if (p.stats) {
      const stats = gameState.persistent.stats;
      stats.totalRuns = Math.max(stats.totalRuns, p.stats.totalRuns ?? 0);
      stats.totalWins = Math.max(stats.totalWins, p.stats.totalWins ?? 0);
      stats.totalCoins = Math.max(stats.totalCoins, p.stats.totalCoins ?? 0);
      stats.totalDamage = Math.max(stats.totalDamage, p.stats.totalDamage ?? 0);
      stats.totalMana = Math.max(stats.totalMana, p.stats.totalMana ?? 0);
      stats.totalCellsRevealed = Math.max(stats.totalCellsRevealed, p.stats.totalCellsRevealed ?? 0);
      stats.totalItemsPurchased = Math.max(stats.totalItemsPurchased, p.stats.totalItemsPurchased ?? 0);
      stats.fastestRun = Math.min(stats.fastestRun, p.stats.fastestRun ?? Infinity);
    }

    console.log('Save data applied to game state');
  }

  /**
   * Clear all saved data
   * @returns {boolean} True if clear was successful
   */
  static clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Save data cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear save data:', error);
      return false;
    }
  }

  /**
   * Check if a save exists
   * @returns {boolean} True if save exists
   */
  static hasSave() {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  /**
   * Get save timestamp
   * @returns {number|null} Timestamp or null if no save
   */
  static getSaveTimestamp() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data.timestamp || null;
    } catch {
      return null;
    }
  }

  /**
   * Get formatted save date string
   * @returns {string} Formatted date or 'No save'
   */
  static getSaveDateString() {
    const timestamp = this.getSaveTimestamp();
    if (!timestamp) return 'No save';

    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  /**
   * Migrate save data from older versions
   * @private
   * @param {Object} data - Old save data
   * @returns {Object} Migrated save data
   */
  static _migrate(data) {
    // Handle version migrations here
    // For now, just update the version and return
    // Future migrations would transform data structure as needed

    // v0.4.0 -> v0.5.0: Add any new fields with defaults
    const migrated = {
      ...data,
      version: this.CURRENT_VERSION,
      persistent: {
        ...data.persistent,
        // Ensure new fields exist
        achievements: data.persistent?.achievements || [],
        stats: {
          totalRuns: 0,
          totalWins: 0,
          totalCoins: 0,
          totalDamage: 0,
          totalMana: 0,
          totalCellsRevealed: 0,
          totalItemsPurchased: 0,
          fastestRun: Infinity,
          ...data.persistent?.stats
        }
      }
    };

    console.log('Migration complete');
    return migrated;
  }

  /**
   * Export save data as JSON string (for backup)
   * @returns {string|null} JSON string or null
   */
  static exportSave() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw || null;
  }

  /**
   * Import save data from JSON string
   * @param {string} jsonString - JSON save data
   * @returns {boolean} True if import was successful
   */
  static importSave(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // Validate basic structure
      if (!data.persistent) {
        throw new Error('Invalid save format');
      }

      localStorage.setItem(this.STORAGE_KEY, jsonString);
      console.log('Save imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SaveSystem;
}
