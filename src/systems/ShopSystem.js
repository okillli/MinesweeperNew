/**
 * ShopSystem.js
 *
 * Shop generation and purchase handling.
 * Generates item offerings based on rarity weights and player unlocks.
 *
 * DEPENDENCIES:
 * - ITEMS, RARITY_WEIGHTS from src/data/items.js
 * - ItemSystem from src/systems/ItemSystem.js
 *
 * DEPENDENTS:
 * - main.js (shop UI, purchase handling)
 *
 * Design: Static utility class with stored offerings state.
 */

class ShopSystem {
  // Current shop offerings (regenerated each shop visit)
  static currentOfferings = [];

  /**
   * Generate shop offerings
   * @param {GameState} gameState - Current game state
   * @param {number} count - Number of items to offer (default 3)
   * @returns {Object[]} Array of item offerings
   */
  static generateOfferings(gameState, count = 3) {
    // Get unlocked item IDs
    const unlockedIds = gameState.persistent.unlockedItems;

    // Get all available items (exclude items player already has max of)
    const availableItems = [];
    for (const itemId of unlockedIds) {
      const item = ITEMS[itemId];
      if (!item) continue;

      // For active items, check if player already has 3
      if (item.type === 'active') {
        const currentActives = gameState.currentRun.items.active.length;
        if (currentActives >= 3) continue;
      }

      availableItems.push(item);
    }

    // Get rarity weights (modified by Lucky Charm)
    const weights = this._getRarityWeights(gameState);

    // Select items
    const selected = [];
    const usedIds = new Set();

    for (let i = 0; i < count && availableItems.length > 0; i++) {
      // Pick a rarity based on weights
      const rarity = this._pickRarity(weights);

      // Filter to available items of that rarity (not already selected)
      let candidates = availableItems.filter(
        item => item.rarity === rarity && !usedIds.has(item.id)
      );

      // If no candidates of chosen rarity, try any rarity
      if (candidates.length === 0) {
        candidates = availableItems.filter(item => !usedIds.has(item.id));
      }

      if (candidates.length === 0) break;

      // Pick random item from candidates
      const item = candidates[Math.floor(Math.random() * candidates.length)];
      selected.push({ ...item }); // Clone to avoid mutation
      usedIds.add(item.id);
    }

    this.currentOfferings = selected;
    return selected;
  }

  /**
   * Get current shop offerings
   * @returns {Object[]} Current offerings
   */
  static getOfferings() {
    return this.currentOfferings;
  }

  /**
   * Check if player can afford an item
   * @param {GameState} gameState - Current game state
   * @param {string} itemId - Item ID to check
   * @returns {boolean} True if can afford
   */
  static canAfford(gameState, itemId) {
    const item = ITEMS[itemId];
    if (!item) return false;
    return gameState.currentRun.coins >= item.cost;
  }

  /**
   * Check if player can purchase an item (afford + slot available)
   * @param {GameState} gameState - Current game state
   * @param {string} itemId - Item ID to check
   * @returns {Object} { canBuy, reason }
   */
  static canPurchase(gameState, itemId) {
    const item = ITEMS[itemId];
    if (!item) {
      return { canBuy: false, reason: 'Item not found' };
    }

    // Check coins
    if (gameState.currentRun.coins < item.cost) {
      return { canBuy: false, reason: 'Not enough coins' };
    }

    // Check active item slot limit
    if (item.type === 'active') {
      const currentActives = gameState.currentRun.items.active.length;
      if (currentActives >= 3) {
        return { canBuy: false, reason: 'Active slots full (max 3)' };
      }
    }

    return { canBuy: true, reason: '' };
  }

  /**
   * Purchase an item
   * @param {GameState} gameState - Current game state
   * @param {string} itemId - Item ID to purchase
   * @returns {Object} { success, message }
   */
  static purchaseItem(gameState, itemId) {
    const check = this.canPurchase(gameState, itemId);
    if (!check.canBuy) {
      return { success: false, message: check.reason };
    }

    const item = ITEMS[itemId];

    // Deduct coins
    gameState.spendCoins(item.cost);

    // Add item to appropriate category
    const itemCopy = { ...item };

    switch (item.type) {
      case 'passive':
        gameState.addItem(itemCopy, 'passive');
        // Apply stat modifiers immediately
        if (item.effect && item.effect.type === 'stat_modifier') {
          if (item.effect.stat === 'maxHp') {
            gameState.currentRun.maxHp += item.effect.value;
            gameState.heal(item.effect.value); // Heal the added HP
          } else if (item.effect.stat === 'maxMana') {
            gameState.currentRun.maxMana += item.effect.value;
          }
        }
        break;

      case 'active':
        gameState.addItem(itemCopy, 'active');
        break;

      case 'consumable':
        gameState.addItem(itemCopy, 'consumables');
        break;
    }

    // Remove from offerings
    this.currentOfferings = this.currentOfferings.filter(o => o.id !== itemId);

    return { success: true, message: `Purchased ${item.name}` };
  }

  /**
   * Reroll shop offerings (for Lucky Coin)
   * @param {GameState} gameState - Current game state
   * @returns {Object[]} New offerings
   */
  static rerollShop(gameState) {
    return this.generateOfferings(gameState);
  }

  /**
   * Get rarity weights (base + Lucky Charm bonus)
   */
  static _getRarityWeights(gameState) {
    const base = { ...RARITY_WEIGHTS };

    // Apply Lucky Charm bonus
    const bonus = ItemSystem.getShopRarityBonus(gameState);

    if (bonus.rareBonus > 0 || bonus.legendaryBonus > 0) {
      base.rare += bonus.rareBonus;
      base.legendary += bonus.legendaryBonus;
      // Reduce common to compensate
      base.common -= (bonus.rareBonus + bonus.legendaryBonus);
      // Ensure common doesn't go negative
      base.common = Math.max(0.1, base.common);
    }

    return base;
  }

  /**
   * Pick a rarity based on weights
   */
  static _pickRarity(weights) {
    const total = weights.common + weights.rare + weights.legendary;
    const roll = Math.random() * total;

    if (roll < weights.common) return 'common';
    if (roll < weights.common + weights.rare) return 'rare';
    return 'legendary';
  }

  /**
   * Get shop summary for UI
   * @param {GameState} gameState - Current game state
   * @returns {Object} { offerings, playerCoins }
   */
  static getShopSummary(gameState) {
    return {
      offerings: this.currentOfferings.map(item => ({
        ...item,
        canAfford: this.canAfford(gameState, item.id),
        canPurchase: this.canPurchase(gameState, item.id)
      })),
      playerCoins: gameState.currentRun.coins
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShopSystem;
}
