/**
 * items.js
 *
 * Item definitions for LiMineZZsweeperIE.
 * Contains all 20 items: 10 passive, 5 active, 5 consumable.
 *
 * DEPENDENCIES: None (pure data)
 * DEPENDENTS: ItemSystem.js, ShopSystem.js, main.js
 *
 * Item Types:
 * - passive: Always active when owned, can stack
 * - active: Costs mana to use, max 3 slots
 * - consumable: Single use, removed after use
 *
 * Rarity Distribution (shop weights):
 * - common: 60%
 * - rare: 30%
 * - legendary: 10%
 */

const ITEMS = {
  // ============================================
  // PASSIVE ITEMS (10)
  // ============================================

  shield_generator: {
    id: 'shield_generator',
    name: 'Shield Generator',
    type: 'passive',
    rarity: 'common',
    cost: 30,
    description: '+1 Max HP',
    effect: {
      type: 'stat_modifier',
      stat: 'maxHp',
      value: 1
    }
  },

  coin_magnet: {
    id: 'coin_magnet',
    name: 'Coin Magnet',
    type: 'passive',
    rarity: 'common',
    cost: 40,
    description: '+50% coins from reveals',
    effect: {
      type: 'multiplier',
      stat: 'coinEarn',
      value: 1.5
    }
  },

  mana_crystal: {
    id: 'mana_crystal',
    name: 'Mana Crystal',
    type: 'passive',
    rarity: 'common',
    cost: 25,
    description: '+50 Max Mana',
    effect: {
      type: 'stat_modifier',
      stat: 'maxMana',
      value: 50
    }
  },

  flag_efficiency: {
    id: 'flag_efficiency',
    name: 'Flag Efficiency',
    type: 'passive',
    rarity: 'common',
    cost: 35,
    description: '+15 mana per correct flag',
    effect: {
      type: 'stat_modifier',
      stat: 'flagMana',
      value: 15
    }
  },

  lucky_charm: {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    type: 'passive',
    rarity: 'rare',
    cost: 60,
    description: '+15% better shop items',
    effect: {
      type: 'shop_modifier',
      rareBonus: 0.15,
      legendaryBonus: 0.05
    }
  },

  fortify_armor: {
    id: 'fortify_armor',
    name: 'Fortify Armor',
    type: 'passive',
    rarity: 'rare',
    cost: 80,
    description: 'Shield after 5 safe reveals',
    effect: {
      type: 'conditional_shield',
      revealThreshold: 5
    }
  },

  treasure_sense: {
    id: 'treasure_sense',
    name: 'Treasure Sense',
    type: 'passive',
    rarity: 'rare',
    cost: 70,
    description: 'High-value cells glow',
    effect: {
      type: 'visual_modifier',
      highlightType: 'high_value'
    }
  },

  second_wind: {
    id: 'second_wind',
    name: 'Second Wind',
    type: 'passive',
    rarity: 'rare',
    cost: 90,
    description: '+1 HP on perfect board',
    effect: {
      type: 'perfect_board_bonus',
      healAmount: 1
    }
  },

  range_boost: {
    id: 'range_boost',
    name: 'Range Boost',
    type: 'passive',
    rarity: 'legendary',
    cost: 180,
    description: 'Area abilities +1 ring',
    effect: {
      type: 'ability_modifier',
      rangeBonus: 1
    }
  },

  combo_master: {
    id: 'combo_master',
    name: 'Combo Master',
    type: 'passive',
    rarity: 'legendary',
    cost: 200,
    description: 'Chord: +5 mana, +10 coins',
    effect: {
      type: 'chord_bonus',
      manaBonus: 5,
      coinBonus: 10
    }
  },

  // ============================================
  // ACTIVE ABILITIES (5)
  // ============================================

  scan_area: {
    id: 'scan_area',
    name: 'Scan Area',
    type: 'active',
    rarity: 'common',
    cost: 40,
    manaCost: 50,
    description: 'Reveal 3x3 area safely',
    effect: {
      type: 'reveal_area',
      size: 3,
      safeOnly: true
    }
  },

  safe_column: {
    id: 'safe_column',
    name: 'Safe Column',
    type: 'active',
    rarity: 'rare',
    cost: 80,
    manaCost: 100,
    description: 'Reveal entire column safely',
    effect: {
      type: 'reveal_column',
      safeOnly: true
    }
  },

  mine_detector: {
    id: 'mine_detector',
    name: 'Mine Detector',
    type: 'active',
    rarity: 'rare',
    cost: 70,
    manaCost: 75,
    description: 'Highlight 3 random mines',
    effect: {
      type: 'highlight_mines',
      count: 3
    }
  },

  auto_chord: {
    id: 'auto_chord',
    name: 'Auto-Chord',
    type: 'active',
    rarity: 'legendary',
    cost: 150,
    manaCost: 125,
    description: 'Auto-perform all safe chords',
    effect: {
      type: 'auto_chord'
    }
  },

  rewind: {
    id: 'rewind',
    name: 'Rewind',
    type: 'active',
    rarity: 'legendary',
    cost: 200,
    manaCost: 150,
    description: 'Undo last 3 reveals',
    effect: {
      type: 'rewind',
      count: 3
    }
  },

  // ============================================
  // CONSUMABLES (5)
  // ============================================

  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    type: 'consumable',
    rarity: 'common',
    cost: 15,
    description: 'Heal 1 HP',
    effect: {
      type: 'heal',
      value: 1
    }
  },

  vision_scroll: {
    id: 'vision_scroll',
    name: 'Vision Scroll',
    type: 'consumable',
    rarity: 'common',
    cost: 20,
    description: 'Reveal 5 random safe cells',
    effect: {
      type: 'reveal_random_safe',
      count: 5
    }
  },

  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    type: 'consumable',
    rarity: 'common',
    cost: 10,
    description: 'Restore 50 mana',
    effect: {
      type: 'restore_mana',
      value: 50
    }
  },

  lucky_coin: {
    id: 'lucky_coin',
    name: 'Lucky Coin',
    type: 'consumable',
    rarity: 'common',
    cost: 30,
    description: 'Reroll shop offerings',
    effect: {
      type: 'reroll_shop'
    }
  },

  shield_token: {
    id: 'shield_token',
    name: 'Shield Token',
    type: 'consumable',
    rarity: 'rare',
    cost: 25,
    description: 'Next mine hit = no damage',
    effect: {
      type: 'temporary_shield'
    }
  }
};

/**
 * Rarity weights for shop generation
 */
const RARITY_WEIGHTS = {
  common: 0.60,
  rare: 0.30,
  legendary: 0.10
};

/**
 * Get all items of a specific type
 * @param {string} type - 'passive', 'active', or 'consumable'
 * @returns {Object[]} Array of item definitions
 */
function getItemsByType(type) {
  return Object.values(ITEMS).filter(item => item.type === type);
}

/**
 * Get all items of a specific rarity
 * @param {string} rarity - 'common', 'rare', or 'legendary'
 * @returns {Object[]} Array of item definitions
 */
function getItemsByRarity(rarity) {
  return Object.values(ITEMS).filter(item => item.rarity === rarity);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ITEMS, RARITY_WEIGHTS, getItemsByType, getItemsByRarity };
}
