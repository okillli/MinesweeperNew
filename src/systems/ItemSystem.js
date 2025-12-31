/**
 * ItemSystem.js
 *
 * Static utility class for item effect processing.
 * Handles passive modifiers, active abilities, and consumables.
 *
 * DEPENDENCIES:
 * - ITEMS from src/data/items.js (item definitions)
 * - Grid from src/entities/Grid.js (for ability effects)
 *
 * DEPENDENTS:
 * - main.js (calls for coin/mana modifiers, ability execution)
 * - GameState.js (calls applyPassiveEffects on board start)
 * - ShopSystem.js (checks item types)
 *
 * Design: Static utility class - no instance state, all methods are static.
 */

class ItemSystem {
  /**
   * Get item definition by ID
   * @param {string} itemId - Item ID
   * @returns {Object|null} Item definition or null
   */
  static getItem(itemId) {
    return ITEMS[itemId] || null;
  }

  /**
   * Check if player has a specific passive item
   * @param {GameState} gameState - Current game state
   * @param {string} itemId - Item ID to check
   * @returns {boolean} True if player has the item
   */
  static hasPassiveItem(gameState, itemId) {
    return gameState.currentRun.items.passive.some(item => item.id === itemId);
  }

  /**
   * Count how many of a specific passive item the player has
   * @param {GameState} gameState - Current game state
   * @param {string} itemId - Item ID to count
   * @returns {number} Count of matching items
   */
  static countPassiveItem(gameState, itemId) {
    return gameState.currentRun.items.passive.filter(item => item.id === itemId).length;
  }

  /**
   * Apply passive stat modifiers (called at board start)
   * Modifies maxHp, maxMana based on owned passive items
   * @param {GameState} gameState - Current game state
   */
  static applyPassiveEffects(gameState) {
    const passives = gameState.currentRun.items.passive;

    // Reset visual modifier flags
    gameState.currentRun.hasTreasureSense = false;
    gameState.currentRun.hasGoldSense = false;
    gameState.currentRun.firstHitShieldUsed = false;

    for (const item of passives) {
      const def = this.getItem(item.id);
      if (!def || !def.effect) continue;

      const effect = def.effect;

      switch (effect.type) {
        case 'stat_modifier':
          if (effect.stat === 'maxHp') {
            gameState.currentRun.maxHp += effect.value;
            // Also heal the added HP
            gameState.currentRun.hp += effect.value;
          } else if (effect.stat === 'maxMana') {
            gameState.currentRun.maxMana += effect.value;
          }
          break;

        case 'visual_modifier':
          // Treasure Sense: highlight high-value cells
          if (effect.highlightType === 'high_value') {
            gameState.currentRun.hasTreasureSense = true;
          }
          // Gold Sense: cursed cells glow brighter
          if (effect.highlightType === 'cursed_cells') {
            gameState.currentRun.hasGoldSense = true;
          }
          break;

        case 'timer_bonus':
          // Speed Boots: add time to timer at board start
          if (gameState.currentRun.timerDuration > 0) {
            gameState.currentRun.timerRemaining += effect.value;
          }
          break;

        case 'first_hit_shield':
          // Thick Skin: flag is reset, first damage will be blocked
          break;
        // Other passive types are applied dynamically (multipliers, etc.)
      }
    }
  }

  /**
   * Get modified value after applying passive multipliers
   * @param {GameState} gameState - Current game state
   * @param {string} statType - Type of stat ('coinEarn', 'flagMana')
   * @param {number} baseValue - Base value before modifiers
   * @returns {number} Modified value
   */
  static getModifiedValue(gameState, statType, baseValue) {
    const passives = gameState.currentRun.items.passive;
    let multiplier = 1.0;
    let additive = 0;

    for (const item of passives) {
      const def = this.getItem(item.id);
      if (!def || !def.effect) continue;

      const effect = def.effect;

      switch (effect.type) {
        case 'multiplier':
          if (effect.stat === statType) {
            // Multiplicative stacking
            multiplier *= effect.value;
          }
          break;

        case 'stat_modifier':
          if (effect.stat === statType) {
            // Additive stacking for flat bonuses
            additive += effect.value;
          }
          break;
      }
    }

    return Math.floor(baseValue * multiplier) + additive;
  }

  /**
   * Check if player can use an active ability
   * @param {GameState} gameState - Current game state
   * @param {string} itemId - Active item ID
   * @returns {boolean} True if can use (enough mana)
   */
  static canUseAbility(gameState, itemId) {
    const def = this.getItem(itemId);
    if (!def || def.type !== 'active') return false;

    const manaCost = this.getAbilityManaCost(gameState, itemId);
    return gameState.currentRun.mana >= manaCost;
  }

  /**
   * Get the mana cost for an ability (may be modified by character passive)
   * @param {GameState} gameState - Current game state
   * @param {string} itemId - Active item ID
   * @returns {number} Mana cost
   */
  static getAbilityManaCost(gameState, itemId) {
    const def = this.getItem(itemId);
    if (!def || !def.manaCost) return 0;

    let cost = def.manaCost;

    // Apply character mana cost multiplier (e.g., Mage: 0.75 = -25% cost)
    const multiplier = gameState.currentRun.manaCostMultiplier || 1.0;
    cost = Math.floor(cost * multiplier);

    return cost;
  }

  /**
   * Execute an active ability
   * @param {GameState} gameState - Current game state
   * @param {string} itemId - Active item ID
   * @param {number} targetX - Target X coordinate (for area abilities)
   * @param {number} targetY - Target Y coordinate (for area abilities)
   * @returns {Object} Result of ability use { success, message, data }
   */
  static useActiveAbility(gameState, itemId, targetX = 0, targetY = 0) {
    const def = this.getItem(itemId);
    if (!def || def.type !== 'active') {
      return { success: false, message: 'Invalid ability' };
    }

    const effect = def.effect;

    // Check for unimplemented abilities BEFORE spending mana
    if (effect.type === 'rewind') {
      return { success: false, message: 'Rewind coming soon!', notImplemented: true };
    }

    // Check mana
    const manaCost = this.getAbilityManaCost(gameState, itemId);
    if (!gameState.spendMana(manaCost)) {
      return { success: false, message: 'Not enough mana' };
    }

    const grid = gameState.grid;
    if (!grid) {
      // Refund mana if no grid
      gameState.addMana(manaCost);
      return { success: false, message: 'No active grid' };
    }

    let result = { success: true, message: '', data: {} };

    switch (effect.type) {
      case 'reveal_area':
        result = this._executeScanArea(grid, targetX, targetY, effect.size, gameState);
        break;

      case 'reveal_column':
        result = this._executeSafeColumn(grid, targetX, gameState);
        break;

      case 'highlight_mines':
        result = this._executeHighlightMines(grid, effect.count, gameState);
        break;

      case 'auto_chord':
        result = this._executeAutoChord(grid, gameState);
        break;

      // --- NEW ABILITY EFFECTS (Phase E) ---

      case 'highlight_traps':
        result = this._executeHighlightTraps(grid, gameState);
        break;

      case 'cleanse_area':
        result = this._executeCleanse(grid, targetX, targetY, effect.size, gameState);
        break;

      case 'pause_timer':
        result = this._executePauseTimer(gameState, effect.duration);
        break;

      case 'reveal_row':
        result = this._executeSafeRow(grid, targetY, gameState);
        break;

      case 'reveal_corners':
        result = this._executeRevealCorners(grid, gameState);
        break;

      case 'auto_flag_area':
        result = this._executeAutoFlagArea(grid, targetX, targetY, effect.size, gameState);
        break;

      case 'invulnerable_reveals':
        result = this._executeInvulnerability(gameState, effect.count);
        break;

      case 'reveal_high_value':
        result = this._executeRevealHighValue(grid, effect.count, gameState);
        break;

      default:
        // Refund mana for unknown effects
        gameState.addMana(manaCost);
        result = { success: false, message: 'Unknown ability effect' };
    }

    return result;
  }

  /**
   * Use a consumable item
   * @param {GameState} gameState - Current game state
   * @param {number} index - Index of consumable in inventory
   * @returns {Object} Result of use { success, message }
   */
  static useConsumable(gameState, index) {
    const consumables = gameState.currentRun.items.consumables;

    if (index < 0 || index >= consumables.length) {
      return { success: false, message: 'Invalid consumable index' };
    }

    const item = consumables[index];
    const def = this.getItem(item.id);
    if (!def) {
      return { success: false, message: 'Unknown consumable' };
    }

    const effect = def.effect;
    let result = { success: true, message: '' };

    switch (effect.type) {
      case 'heal':
        gameState.heal(effect.value);
        result.message = `Healed ${effect.value} HP`;
        break;

      case 'restore_mana':
        gameState.addMana(effect.value);
        result.message = `Restored ${effect.value} mana`;
        break;

      case 'reveal_random_safe':
        const revealed = this._revealRandomSafeCells(gameState.grid, effect.count);
        result.message = `Revealed ${revealed} safe cells`;
        result.data = { cellsRevealed: revealed };
        break;

      case 'temporary_shield':
        gameState.currentRun.shieldActive = true;
        result.message = 'Shield activated';
        break;

      case 'reroll_shop':
        // This is handled by ShopSystem
        result.message = 'Shop rerolled';
        result.data = { triggerReroll: true };
        break;

      // --- NEW CONSUMABLE EFFECTS (Phase E) ---

      case 'reveal_all_traps':
        const trapsFound = this._revealAllTraps(gameState.grid, gameState);
        result.message = `Revealed ${trapsFound} traps`;
        result.data = { trapsFound };
        break;

      case 'add_time':
        if (gameState.currentRun.timerDuration > 0) {
          gameState.currentRun.timerRemaining += effect.value;
          result.message = `+${effect.value} seconds`;
        } else {
          result.message = 'No timer on this board';
        }
        break;

      case 'cleanse_area':
        // Use 5x5 area centered on last revealed cell or center
        const centerX = Math.floor(gameState.grid.width / 2);
        const centerY = Math.floor(gameState.grid.height / 2);
        const cursesRemoved = this._removeCursesInArea(gameState.grid, centerX, centerY, effect.size);
        result.message = `Removed ${cursesRemoved} curses`;
        result.data = { cursesRemoved };
        break;

      case 'reveal_area':
        // Consumable version (Reveal Bomb)
        const areaResult = this._executeScanArea(gameState.grid,
          Math.floor(gameState.grid.width / 2),
          Math.floor(gameState.grid.height / 2),
          effect.size, gameState);
        result.message = areaResult.message;
        result.data = areaResult.data;
        break;

      case 'multi_shield':
        gameState.currentRun.shieldCount = (gameState.currentRun.shieldCount || 0) + effect.count;
        gameState.currentRun.shieldActive = true;
        result.message = `Shield x${effect.count} activated`;
        break;

      case 'temp_coin_multiplier':
        gameState.currentRun.tempCoinMultiplier = effect.multiplier;
        gameState.currentRun.tempCoinRevealsLeft = effect.reveals;
        result.message = `${effect.multiplier}x coins for ${effect.reveals} reveals`;
        break;

      case 'skip_board':
        result.message = 'Board skipped';
        result.data = { skipBoard: true };
        break;

      case 'guaranteed_legendaries':
        gameState.currentRun.guaranteedLegendaries = effect.count;
        result.message = `Next shop: ${effect.count} legendaries`;
        break;

      default:
        return { success: false, message: 'Unknown consumable effect' };
    }

    // Remove consumable from inventory
    gameState.removeConsumable(index);

    return result;
  }

  // ============================================
  // Private helper methods for abilities
  // ============================================

  /**
   * Execute Scan Area ability - reveal 3x3 (or larger with Range Boost)
   */
  static _executeScanArea(grid, centerX, centerY, baseSize, gameState) {
    // Check for Range Boost
    let size = baseSize;
    if (this.hasPassiveItem(gameState, 'range_boost')) {
      size += 2; // +1 ring = +2 to diameter (becomes 5x5)
    }

    const radius = Math.floor(size / 2);
    let cellsRevealed = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (!grid.isValid(x, y)) continue;

        const cell = grid.getCell(x, y);
        if (cell && !cell.isRevealed && !cell.isMine) {
          grid.revealCell(x, y);
          cellsRevealed++;
        }
      }
    }

    return {
      success: true,
      message: `Revealed ${cellsRevealed} cells`,
      data: { cellsRevealed }
    };
  }

  /**
   * Execute Safe Column ability - reveal all safe cells in column
   */
  static _executeSafeColumn(grid, columnX, gameState) {
    let cellsRevealed = 0;

    for (let y = 0; y < grid.height; y++) {
      const cell = grid.getCell(columnX, y);
      if (cell && !cell.isRevealed && !cell.isMine) {
        grid.revealCell(columnX, y);
        cellsRevealed++;
      }
    }

    return {
      success: true,
      message: `Revealed ${cellsRevealed} cells in column`,
      data: { cellsRevealed }
    };
  }

  /**
   * Execute Mine Detector - highlight random unrevealed mines
   */
  static _executeHighlightMines(grid, count, gameState) {
    const unrevealedMines = [];

    // Find all unrevealed mines
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.getCell(x, y);
        if (cell && cell.isMine && !cell.isRevealed && !cell.isFlagged) {
          unrevealedMines.push({ x, y });
        }
      }
    }

    // Shuffle and pick up to 'count' mines
    const toHighlight = [];
    const shuffled = unrevealedMines.sort(() => Math.random() - 0.5);
    const highlightCount = Math.min(count, shuffled.length);

    for (let i = 0; i < highlightCount; i++) {
      toHighlight.push(shuffled[i]);
    }

    // Store highlighted mines in gameState for rendering
    gameState.currentRun.highlightedMines = toHighlight;

    return {
      success: true,
      message: `Detected ${highlightCount} mines`,
      data: { highlightedMines: toHighlight }
    };
  }

  /**
   * Execute Auto-Chord - automatically perform all safe chord operations
   */
  static _executeAutoChord(grid, gameState) {
    let totalRevealed = 0;
    let chordsPerformed = 0;
    let changed = true;

    // Keep chording until no more safe chords possible
    while (changed) {
      changed = false;

      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          const cell = grid.getCell(x, y);

          // Only chord revealed numbered cells
          if (!cell || !cell.isRevealed || cell.number === 0) continue;

          // Count adjacent flags
          const flagCount = grid.countAdjacentFlags(x, y);

          // If flags match number, chord is safe
          if (flagCount === cell.number) {
            const revealed = grid.chord(x, y);
            if (revealed.length > 0) {
              totalRevealed += revealed.length;
              chordsPerformed++;
              changed = true;
            }
          }
        }
      }
    }

    return {
      success: true,
      message: `Performed ${chordsPerformed} chords, revealed ${totalRevealed} cells`,
      data: { cellsRevealed: totalRevealed, chordsPerformed }
    };
  }

  /**
   * Execute Rewind - undo last N reveals (not implemented in this version)
   * Note: Full rewind requires tracking reveal history which is not currently stored
   */
  static _executeRewind(gameState, count) {
    // TODO: Implement reveal history tracking in Grid
    // For now, return a message indicating it's not available
    return {
      success: false,
      message: 'Rewind not yet implemented',
      data: {}
    };
  }

  /**
   * Reveal random safe cells (for Vision Scroll)
   */
  static _revealRandomSafeCells(grid, count) {
    const safeCells = [];

    // Find all unrevealed safe cells
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.getCell(x, y);
        if (cell && !cell.isRevealed && !cell.isMine) {
          safeCells.push({ x, y });
        }
      }
    }

    // Shuffle and reveal up to 'count'
    const shuffled = safeCells.sort(() => Math.random() - 0.5);
    const toReveal = Math.min(count, shuffled.length);

    for (let i = 0; i < toReveal; i++) {
      grid.revealCell(shuffled[i].x, shuffled[i].y);
    }

    return toReveal;
  }

  /**
   * Get chord bonus values (for Combo Master passive)
   * @param {GameState} gameState - Current game state
   * @returns {Object} { manaBonus, coinBonus }
   */
  static getChordBonus(gameState) {
    let manaBonus = 0;
    let coinBonus = 0;

    const passives = gameState.currentRun.items.passive;
    for (const item of passives) {
      const def = this.getItem(item.id);
      if (def && def.effect && def.effect.type === 'chord_bonus') {
        manaBonus += def.effect.manaBonus || 0;
        coinBonus += def.effect.coinBonus || 0;
      }
    }

    return { manaBonus, coinBonus };
  }

  /**
   * Check and apply Fortify Armor shield (after safe reveals)
   * @param {GameState} gameState - Current game state
   * @param {number} safeRevealsInSequence - Number of safe reveals since last mine hit
   */
  static checkFortifyArmor(gameState, safeRevealsInSequence) {
    if (!this.hasPassiveItem(gameState, 'fortify_armor')) return;

    const threshold = 5;
    if (safeRevealsInSequence >= threshold && !gameState.currentRun.shieldActive) {
      gameState.currentRun.shieldActive = true;
      return true; // Shield activated
    }
    return false;
  }

  /**
   * Get shop rarity modifiers from Lucky Charm
   * @param {GameState} gameState - Current game state
   * @returns {Object} { rareBonus, legendaryBonus }
   */
  static getShopRarityBonus(gameState) {
    let rareBonus = 0;
    let legendaryBonus = 0;

    const passives = gameState.currentRun.items.passive;
    for (const item of passives) {
      const def = this.getItem(item.id);
      if (def && def.effect && def.effect.type === 'shop_modifier') {
        rareBonus += def.effect.rareBonus || 0;
        legendaryBonus += def.effect.legendaryBonus || 0;
      }
    }

    return { rareBonus, legendaryBonus };
  }

  // ============================================
  // NEW ABILITY HELPER METHODS (Phase E)
  // ============================================

  /**
   * Highlight all traps on the grid (Trap Detector)
   */
  static _executeHighlightTraps(grid, gameState) {
    const traps = [];

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.getCell(x, y);
        if (cell && cell.isTrap && !cell.isRevealed) {
          traps.push({ x, y });
        }
      }
    }

    // Store highlighted traps for rendering
    gameState.currentRun.highlightedTraps = traps;

    return {
      success: true,
      message: `Detected ${traps.length} traps`,
      data: { traps }
    };
  }

  /**
   * Remove curses in area (Curse Cleanse / Purify Scroll)
   */
  static _executeCleanse(grid, centerX, centerY, size, gameState) {
    const cursesRemoved = this._removeCursesInArea(grid, centerX, centerY, size);

    return {
      success: true,
      message: `Removed ${cursesRemoved} curses`,
      data: { cursesRemoved }
    };
  }

  /**
   * Helper: Remove curses in an area
   */
  static _removeCursesInArea(grid, centerX, centerY, size) {
    const radius = Math.floor(size / 2);
    let removed = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (!grid.isValid(x, y)) continue;

        const cell = grid.getCell(x, y);
        if (cell && cell.isCursed && !cell.isRevealed) {
          cell.isCursed = false;
          removed++;
        }
      }
    }

    return removed;
  }

  /**
   * Pause timer for duration (Time Freeze)
   */
  static _executePauseTimer(gameState, duration) {
    if (gameState.currentRun.timerDuration <= 0) {
      return {
        success: false,
        message: 'No timer on this board'
      };
    }

    gameState.currentRun.timerRemaining += duration;

    return {
      success: true,
      message: `+${duration} seconds`,
      data: { addedTime: duration }
    };
  }

  /**
   * Reveal entire row safely (Safe Row)
   */
  static _executeSafeRow(grid, rowY, gameState) {
    let cellsRevealed = 0;

    for (let x = 0; x < grid.width; x++) {
      const cell = grid.getCell(x, rowY);
      if (cell && !cell.isRevealed && !cell.isMine) {
        grid.revealCell(x, rowY);
        cellsRevealed++;
      }
    }

    return {
      success: true,
      message: `Revealed ${cellsRevealed} cells in row`,
      data: { cellsRevealed }
    };
  }

  /**
   * Reveal all 4 corners (Reveal Corners)
   */
  static _executeRevealCorners(grid, gameState) {
    const corners = [
      { x: 0, y: 0 },
      { x: grid.width - 1, y: 0 },
      { x: 0, y: grid.height - 1 },
      { x: grid.width - 1, y: grid.height - 1 }
    ];

    let cellsRevealed = 0;

    for (const corner of corners) {
      const cell = grid.getCell(corner.x, corner.y);
      if (cell && !cell.isRevealed && !cell.isMine) {
        grid.revealCell(corner.x, corner.y);
        cellsRevealed++;
      }
    }

    return {
      success: true,
      message: `Revealed ${cellsRevealed} corners`,
      data: { cellsRevealed }
    };
  }

  /**
   * Auto-flag mines in area (Mass Flag)
   */
  static _executeAutoFlagArea(grid, centerX, centerY, size, gameState) {
    const radius = Math.floor(size / 2);
    let flagsPlaced = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (!grid.isValid(x, y)) continue;

        const cell = grid.getCell(x, y);
        if (cell && cell.isMine && !cell.isRevealed && !cell.isFlagged) {
          grid.toggleFlag(x, y);
          flagsPlaced++;
        }
      }
    }

    return {
      success: true,
      message: `Flagged ${flagsPlaced} mines`,
      data: { flagsPlaced }
    };
  }

  /**
   * Grant invulnerability for next N reveals (Invulnerability)
   */
  static _executeInvulnerability(gameState, count) {
    gameState.currentRun.invulnerableReveals = count;

    return {
      success: true,
      message: `Next ${count} reveals protected`,
      data: { count }
    };
  }

  /**
   * Reveal highest value cells (Treasure Hunt)
   */
  static _executeRevealHighValue(grid, count, gameState) {
    // Find all unrevealed safe cells and score them
    const candidates = [];

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.getCell(x, y);
        if (cell && !cell.isRevealed && !cell.isMine) {
          // Score based on adjacent mines (higher number = more valuable)
          candidates.push({ x, y, value: cell.number || 0 });
        }
      }
    }

    // Sort by value (high to low) and take top 'count'
    candidates.sort((a, b) => b.value - a.value);
    const toReveal = candidates.slice(0, count);

    let cellsRevealed = 0;
    for (const pos of toReveal) {
      grid.revealCell(pos.x, pos.y);
      cellsRevealed++;
    }

    return {
      success: true,
      message: `Revealed ${cellsRevealed} high-value cells`,
      data: { cellsRevealed }
    };
  }

  /**
   * Reveal all trap locations (Trap Map consumable)
   */
  static _revealAllTraps(grid, gameState) {
    const traps = [];

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.getCell(x, y);
        if (cell && cell.isTrap && !cell.isRevealed) {
          traps.push({ x, y });
        }
      }
    }

    // Store for permanent highlighting
    gameState.currentRun.revealedTraps = traps;

    return traps.length;
  }

  // ============================================
  // NEW PASSIVE EFFECT CHECKS (Phase E)
  // ============================================

  /**
   * Check if player has trap immunity (Trap Armor)
   */
  static hasTrapImmunity(gameState) {
    return this.hasPassiveItem(gameState, 'trap_armor');
  }

  /**
   * Get curse mana reduction (Curse Ward)
   */
  static getCurseReduction(gameState) {
    let reduction = 0;

    const passives = gameState.currentRun.items.passive;
    for (const item of passives) {
      const def = this.getItem(item.id);
      if (def && def.effect && def.effect.type === 'curse_reduction') {
        reduction += def.effect.value;
      }
    }

    return reduction;
  }

  /**
   * Check if curse should give mana instead (Curse Conversion)
   */
  static hasCurseConversion(gameState) {
    return this.hasPassiveItem(gameState, 'curse_conversion');
  }

  /**
   * Get curse to mana value (Curse Conversion)
   */
  static getCurseConversionValue(gameState) {
    const passives = gameState.currentRun.items.passive;
    for (const item of passives) {
      const def = this.getItem(item.id);
      if (def && def.effect && def.effect.type === 'curse_to_mana') {
        return def.effect.value;
      }
    }
    return 0;
  }

  /**
   * Check if first hit should be blocked (Thick Skin)
   */
  static shouldBlockFirstHit(gameState) {
    if (!this.hasPassiveItem(gameState, 'thick_skin')) return false;
    if (gameState.currentRun.firstHitShieldUsed) return false;

    // Mark as used and block the hit
    gameState.currentRun.firstHitShieldUsed = true;
    return true;
  }

  /**
   * Get reveal mana bonus (Mana Siphon)
   */
  static getRevealManaBonus(gameState) {
    let bonus = 0;

    const passives = gameState.currentRun.items.passive;
    for (const item of passives) {
      const def = this.getItem(item.id);
      if (def && def.effect && def.effect.type === 'reveal_mana_bonus') {
        bonus += def.effect.value;
      }
    }

    return bonus;
  }

  /**
   * Get trap coin refund value (Trap Refund)
   */
  static getTrapRefundValue(gameState) {
    let refund = 0;

    const passives = gameState.currentRun.items.passive;
    for (const item of passives) {
      const def = this.getItem(item.id);
      if (def && def.effect && def.effect.type === 'trap_coin_refund') {
        refund += def.effect.value;
      }
    }

    return refund;
  }

  /**
   * Check if overtime should be a bonus (Overtime Bonus)
   */
  static hasOvertimeBonus(gameState) {
    return this.hasPassiveItem(gameState, 'overtime_bonus');
  }

  /**
   * Check if chain reveal should trigger (Chain Reveal)
   */
  static hasChainReveal(gameState) {
    return this.hasPassiveItem(gameState, 'chain_reveal');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ItemSystem;
}
