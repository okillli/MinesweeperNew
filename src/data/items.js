/**
 * items.js
 *
 * Item definitions for LiMineZZsweeperIE.
 * Contains all 50 items: 22 passive, 13 active, 15 consumable.
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

  // --- NEW PASSIVE ITEMS (Phase E) ---

  trap_armor: {
    id: 'trap_armor',
    name: 'Trap Armor',
    type: 'passive',
    rarity: 'common',
    cost: 35,
    description: 'Traps deal 0 damage',
    effect: {
      type: 'trap_immunity'
    }
  },

  curse_ward: {
    id: 'curse_ward',
    name: 'Curse Ward',
    type: 'passive',
    rarity: 'common',
    cost: 30,
    description: 'Cursed cells drain 10 less mana',
    effect: {
      type: 'curse_reduction',
      value: 10
    }
  },

  speed_boots: {
    id: 'speed_boots',
    name: 'Speed Boots',
    type: 'passive',
    rarity: 'common',
    cost: 45,
    description: '+20 seconds to timers',
    effect: {
      type: 'timer_bonus',
      value: 20
    }
  },

  thick_skin: {
    id: 'thick_skin',
    name: 'Thick Skin',
    type: 'passive',
    rarity: 'rare',
    cost: 75,
    description: 'First damage each board blocked',
    effect: {
      type: 'first_hit_shield'
    }
  },

  mana_siphon: {
    id: 'mana_siphon',
    name: 'Mana Siphon',
    type: 'passive',
    rarity: 'rare',
    cost: 85,
    description: '+3 mana per numbered cell',
    effect: {
      type: 'reveal_mana_bonus',
      value: 3
    }
  },

  gold_sense: {
    id: 'gold_sense',
    name: 'Gold Sense',
    type: 'passive',
    rarity: 'rare',
    cost: 70,
    description: 'Cursed cells glow brighter',
    effect: {
      type: 'visual_modifier',
      highlightType: 'cursed_cells'
    }
  },

  trap_refund: {
    id: 'trap_refund',
    name: 'Trap Refund',
    type: 'passive',
    rarity: 'rare',
    cost: 65,
    description: 'Trap hit refunds 40 coins',
    effect: {
      type: 'trap_coin_refund',
      value: 40
    }
  },

  chain_reveal: {
    id: 'chain_reveal',
    name: 'Chain Reveal',
    type: 'passive',
    rarity: 'rare',
    cost: 80,
    description: 'Numbers reveal 1 random adjacent',
    effect: {
      type: 'chain_reveal'
    }
  },

  overtime_bonus: {
    id: 'overtime_bonus',
    name: 'Overtime Bonus',
    type: 'passive',
    rarity: 'legendary',
    cost: 160,
    description: 'Overtime = +50% coins instead',
    effect: {
      type: 'overtime_invert'
    }
  },

  curse_conversion: {
    id: 'curse_conversion',
    name: 'Curse Conversion',
    type: 'passive',
    rarity: 'legendary',
    cost: 180,
    description: 'Cursed cells give +25 mana',
    effect: {
      type: 'curse_to_mana',
      value: 25
    }
  },

  diamond_skin: {
    id: 'diamond_skin',
    name: 'Diamond Skin',
    type: 'passive',
    rarity: 'legendary',
    cost: 200,
    description: 'Max HP +3',
    effect: {
      type: 'stat_modifier',
      stat: 'maxHp',
      value: 3
    }
  },

  golden_touch: {
    id: 'golden_touch',
    name: 'Golden Touch',
    type: 'passive',
    rarity: 'legendary',
    cost: 190,
    description: '+100% coin earn',
    effect: {
      type: 'multiplier',
      stat: 'coinEarn',
      value: 2.0
    }
  },

  // ============================================
  // ACTIVE ABILITIES (13)
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

  // --- NEW ACTIVE ABILITIES (Phase E) ---

  trap_detector: {
    id: 'trap_detector',
    name: 'Trap Detector',
    type: 'active',
    rarity: 'common',
    cost: 45,
    manaCost: 40,
    description: 'Highlight all traps',
    effect: {
      type: 'highlight_traps'
    }
  },

  curse_cleanse: {
    id: 'curse_cleanse',
    name: 'Curse Cleanse',
    type: 'active',
    rarity: 'common',
    cost: 40,
    manaCost: 35,
    description: 'Remove curses in 3x3',
    effect: {
      type: 'cleanse_area',
      size: 3
    }
  },

  time_freeze: {
    id: 'time_freeze',
    name: 'Time Freeze',
    type: 'active',
    rarity: 'rare',
    cost: 90,
    manaCost: 80,
    description: 'Pause timer 20 seconds',
    effect: {
      type: 'pause_timer',
      duration: 20
    }
  },

  safe_row: {
    id: 'safe_row',
    name: 'Safe Row',
    type: 'active',
    rarity: 'rare',
    cost: 100,
    manaCost: 110,
    description: 'Reveal entire row safely',
    effect: {
      type: 'reveal_row',
      safeOnly: true
    }
  },

  reveal_corners: {
    id: 'reveal_corners',
    name: 'Reveal Corners',
    type: 'active',
    rarity: 'rare',
    cost: 65,
    manaCost: 60,
    description: 'Reveal all 4 corners',
    effect: {
      type: 'reveal_corners'
    }
  },

  mass_flag: {
    id: 'mass_flag',
    name: 'Mass Flag',
    type: 'active',
    rarity: 'legendary',
    cost: 160,
    manaCost: 150,
    description: 'Auto-flag mines in 5x5',
    effect: {
      type: 'auto_flag_area',
      size: 5
    }
  },

  invulnerability: {
    id: 'invulnerability',
    name: 'Invulnerability',
    type: 'active',
    rarity: 'legendary',
    cost: 200,
    manaCost: 200,
    description: 'Next 5 reveals can\'t hurt',
    effect: {
      type: 'invulnerable_reveals',
      count: 5
    }
  },

  treasure_hunt: {
    id: 'treasure_hunt',
    name: 'Treasure Hunt',
    type: 'active',
    rarity: 'legendary',
    cost: 180,
    manaCost: 175,
    description: 'Reveal 10 highest-value cells',
    effect: {
      type: 'reveal_high_value',
      count: 10
    }
  },

  // ============================================
  // CONSUMABLES (15)
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
  },

  // --- NEW CONSUMABLES (Phase E) ---

  trap_map: {
    id: 'trap_map',
    name: 'Trap Map',
    type: 'consumable',
    rarity: 'common',
    cost: 20,
    description: 'Reveal all trap locations',
    effect: {
      type: 'reveal_all_traps'
    }
  },

  time_crystal: {
    id: 'time_crystal',
    name: 'Time Crystal',
    type: 'consumable',
    rarity: 'common',
    cost: 25,
    description: '+30 seconds to timer',
    effect: {
      type: 'add_time',
      value: 30
    }
  },

  purify_scroll: {
    id: 'purify_scroll',
    name: 'Purify Scroll',
    type: 'consumable',
    rarity: 'common',
    cost: 18,
    description: 'Cleanse curses in 5x5',
    effect: {
      type: 'cleanse_area',
      size: 5
    }
  },

  mana_surge: {
    id: 'mana_surge',
    name: 'Mana Surge',
    type: 'consumable',
    rarity: 'common',
    cost: 12,
    description: 'Restore 75 mana',
    effect: {
      type: 'restore_mana',
      value: 75
    }
  },

  armor_shard: {
    id: 'armor_shard',
    name: 'Armor Shard',
    type: 'consumable',
    rarity: 'common',
    cost: 22,
    description: 'Block next 1 damage',
    effect: {
      type: 'temporary_shield'
    }
  },

  reveal_bomb: {
    id: 'reveal_bomb',
    name: 'Reveal Bomb',
    type: 'consumable',
    rarity: 'rare',
    cost: 45,
    description: 'Safely reveal 5x5 area',
    effect: {
      type: 'reveal_area',
      size: 5,
      safeOnly: true
    }
  },

  shield_potion: {
    id: 'shield_potion',
    name: 'Shield Potion',
    type: 'consumable',
    rarity: 'rare',
    cost: 40,
    description: 'Block next 2 damage',
    effect: {
      type: 'multi_shield',
      count: 2
    }
  },

  double_coins: {
    id: 'double_coins',
    name: 'Double Coins',
    type: 'consumable',
    rarity: 'rare',
    cost: 55,
    description: '2x coins for 20 reveals',
    effect: {
      type: 'temp_coin_multiplier',
      multiplier: 2,
      reveals: 20
    }
  },

  escape_rope: {
    id: 'escape_rope',
    name: 'Escape Rope',
    type: 'consumable',
    rarity: 'rare',
    cost: 50,
    description: 'Skip current board (keep coins)',
    effect: {
      type: 'skip_board'
    }
  },

  lucky_clover: {
    id: 'lucky_clover',
    name: 'Lucky Clover',
    type: 'consumable',
    rarity: 'legendary',
    cost: 60,
    description: 'Next shop has 2 legendaries',
    effect: {
      type: 'guaranteed_legendaries',
      count: 2
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
