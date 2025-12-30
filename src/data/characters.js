/**
 * characters.js
 *
 * Character class definitions for MineQuest roguelike.
 * Each character has unique starting stats and passive abilities.
 *
 * DEPENDENCIES:
 * - None (pure data definitions)
 *
 * DEPENDENTS:
 * - main.js (character selection UI)
 * - GameState.js (character reference, stat application)
 * - ItemSystem.js (mana cost multiplier from Mage)
 *
 * Design: Pure data object with helper functions.
 */

const CHARACTERS = {
  // ============================================
  // STARTER CHARACTER (unlockCost: 0)
  // ============================================

  explorer: {
    id: 'explorer',
    name: 'Explorer',
    type: 'Balanced',
    description: 'A balanced adventurer ready for any challenge. No special abilities, but no weaknesses either.',
    startingHp: 3,
    maxHp: 3,
    startingMana: 0,
    maxMana: 100,
    passive: {
      name: 'Steady',
      description: 'No special abilities',
      effect: null
    },
    unlockCost: 0
  },

  // ============================================
  // UNLOCKABLE CHARACTERS (require gems)
  // ============================================

  mage: {
    id: 'mage',
    name: 'Mage',
    type: 'Caster',
    description: 'Master of mana with reduced ability costs. Fragile but powerful with active abilities.',
    startingHp: 2,
    maxHp: 2,
    startingMana: 50,
    maxMana: 150,
    passive: {
      name: 'Arcane Efficiency',
      description: '-25% ability mana cost',
      effect: {
        type: 'mana_cost_mult',
        value: 0.75
      }
    },
    unlockCost: 50
  },

  tank: {
    id: 'tank',
    name: 'Tank',
    type: 'Defensive',
    description: 'Heavy armor specialist who can take more hits. Less mana capacity but incredible survivability.',
    startingHp: 5,
    maxHp: 5,
    startingMana: 0,
    maxMana: 75,
    passive: {
      name: 'Thick Skin',
      description: '+2 Max HP',
      effect: {
        type: 'stat_bonus',
        stat: 'maxHp',
        value: 2
      }
    },
    unlockCost: 75
  },

  scout: {
    id: 'scout',
    name: 'Scout',
    type: 'Utility',
    description: 'Keen-eyed tracker who starts with Mine Detector ability. Perfect for careful planning.',
    startingHp: 2,
    maxHp: 2,
    startingMana: 75,
    maxMana: 100,
    passive: {
      name: 'Keen Eye',
      description: 'Start with Mine Detector',
      effect: {
        type: 'starting_item',
        itemId: 'mine_detector'
      }
    },
    unlockCost: 60
  },

  gambler: {
    id: 'gambler',
    name: 'Gambler',
    type: 'Risk/Reward',
    description: 'Lives on the edge with only 1 HP but earns double coins. High risk, high reward!',
    startingHp: 1,
    maxHp: 1,
    startingMana: 0,
    maxMana: 100,
    passive: {
      name: 'Lucky',
      description: '+100% coin rewards',
      effect: {
        type: 'coin_mult',
        value: 2.0
      }
    },
    unlockCost: 100
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a character by ID
 * @param {string} charId - Character ID
 * @returns {Object|null} Character definition or null
 */
function getCharacter(charId) {
  return CHARACTERS[charId] || null;
}

/**
 * Get all characters that are unlocked
 * @param {string[]} unlockedIds - Array of unlocked character IDs
 * @returns {Object[]} Array of unlocked character definitions
 */
function getUnlockedCharacters(unlockedIds) {
  return Object.values(CHARACTERS).filter(char => unlockedIds.includes(char.id));
}

/**
 * Get all characters with unlock status
 * @param {string[]} unlockedIds - Array of unlocked character IDs
 * @returns {Object[]} Array of characters with isUnlocked property
 */
function getCharactersWithStatus(unlockedIds) {
  return Object.values(CHARACTERS).map(char => ({
    ...char,
    isUnlocked: unlockedIds.includes(char.id)
  }));
}

/**
 * Get character type color for UI
 * @param {string} type - Character type
 * @returns {string} CSS color value
 */
function getCharacterTypeColor(type) {
  const colors = {
    'Balanced': '#4caf50',    // Green
    'Caster': '#9c27b0',      // Purple
    'Defensive': '#2196f3',   // Blue
    'Utility': '#ff9800',     // Orange
    'Risk/Reward': '#f44336'  // Red
  };
  return colors[type] || '#aaaaaa';
}

/**
 * Apply character passive effect to game state
 * This is called when a character is selected
 * @param {Object} character - Character definition
 * @param {Object} gameState - Current game state
 */
function applyCharacterPassive(character, gameState) {
  if (!character.passive?.effect) return;

  const effect = character.passive.effect;

  switch (effect.type) {
    case 'starting_item':
      // Add item to active abilities (handled by ItemSystem)
      if (typeof ITEMS !== 'undefined' && ITEMS[effect.itemId]) {
        gameState.currentRun.items.active.push({ ...ITEMS[effect.itemId] });
      }
      break;

    case 'mana_cost_mult':
      // Store multiplier for ItemSystem to use
      gameState.currentRun.manaCostMultiplier = effect.value;
      break;

    case 'coin_mult':
      // Store multiplier for coin calculations
      gameState.currentRun.characterCoinMult = effect.value;
      break;

    case 'stat_bonus':
      // Apply stat bonus (Tank's +2 HP is already reflected in maxHp)
      // This case is for documentation - actual stats come from character definition
      break;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CHARACTERS,
    getCharacter,
    getUnlockedCharacters,
    getCharactersWithStatus,
    getCharacterTypeColor,
    applyCharacterPassive
  };
}
