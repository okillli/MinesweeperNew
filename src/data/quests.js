/**
 * quests.js
 *
 * Quest definitions for MineQuest roguelike.
 * Each quest has unique objectives and rewards.
 *
 * DEPENDENCIES:
 * - None (pure data definitions)
 *
 * DEPENDENTS:
 * - main.js (quest selection UI, objective tracking)
 * - GameState.js (quest reference in currentRun)
 *
 * Design: Pure data object with helper functions.
 */

const QUESTS = {
  // ============================================
  // STARTER QUESTS (unlockCost: 0)
  // ============================================

  classic_clear: {
    id: 'classic_clear',
    name: 'Classic Clear',
    description: 'Clear all 6 boards to prove your worth as an adventurer.',
    difficulty: 'easy',
    difficultyStars: 1,
    objective: {
      type: 'complete_boards',
      target: 6,
      description: 'Complete all 6 boards'
    },
    rewards: {
      gems: 20,
      bonus: 10 // Bonus for completing objective perfectly
    },
    unlockCost: 0
  },

  treasure_hunter: {
    id: 'treasure_hunter',
    name: 'Treasure Hunter',
    description: 'Collect 500 coins across all boards. Greed is good!',
    difficulty: 'medium',
    difficultyStars: 2,
    objective: {
      type: 'collect_coins',
      target: 500,
      description: 'Collect 500 coins'
    },
    rewards: {
      gems: 30,
      bonus: 15
    },
    unlockCost: 0
  },

  boss_slayer: {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    description: 'Reach and conquer the final boss board. Only the brave survive.',
    difficulty: 'hard',
    difficultyStars: 3,
    objective: {
      type: 'complete_board',
      target: 6,
      description: 'Defeat the Boss board'
    },
    rewards: {
      gems: 40,
      bonus: 20
    },
    unlockCost: 0
  },

  // ============================================
  // UNLOCKABLE QUESTS (require gems)
  // ============================================

  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 3 boards without taking any damage. Flawless victory!',
    difficulty: 'hard',
    difficultyStars: 4,
    objective: {
      type: 'perfect_boards',
      target: 3,
      description: 'Clear 3 boards without damage'
    },
    rewards: {
      gems: 50,
      bonus: 25
    },
    unlockCost: 50
  },

  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Clear all boards in under 10 minutes. Time waits for no one!',
    difficulty: 'expert',
    difficultyStars: 5,
    objective: {
      type: 'time_limit',
      target: 600000, // 10 minutes in milliseconds
      description: 'Complete in under 10 minutes'
    },
    rewards: {
      gems: 75,
      bonus: 40
    },
    unlockCost: 100
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a quest by ID
 * @param {string} questId - Quest ID
 * @returns {Object|null} Quest definition or null
 */
function getQuest(questId) {
  return QUESTS[questId] || null;
}

/**
 * Get all quests that are unlocked
 * @param {string[]} unlockedIds - Array of unlocked quest IDs
 * @returns {Object[]} Array of unlocked quest definitions
 */
function getUnlockedQuests(unlockedIds) {
  return Object.values(QUESTS).filter(quest => unlockedIds.includes(quest.id));
}

/**
 * Get all quests with unlock status
 * @param {string[]} unlockedIds - Array of unlocked quest IDs
 * @returns {Object[]} Array of quests with isUnlocked property
 */
function getQuestsWithStatus(unlockedIds) {
  return Object.values(QUESTS).map(quest => ({
    ...quest,
    isUnlocked: unlockedIds.includes(quest.id)
  }));
}

/**
 * Check if a quest objective is complete
 * @param {Object} quest - Quest definition
 * @param {Object} runStats - Current run statistics
 * @returns {boolean} True if objective is met
 */
function isQuestObjectiveComplete(quest, runStats) {
  if (!quest || !quest.objective) return false;

  const obj = quest.objective;

  switch (obj.type) {
    case 'complete_boards':
      return runStats.boardNumber >= obj.target;

    case 'complete_board':
      return runStats.boardNumber >= obj.target;

    case 'collect_coins':
      return runStats.coinsEarned >= obj.target;

    case 'perfect_boards':
      return runStats.perfectBoards >= obj.target;

    case 'time_limit':
      const elapsed = Date.now() - runStats.startTime;
      return elapsed <= obj.target;

    default:
      return false;
  }
}

/**
 * Get quest objective progress as percentage
 * @param {Object} quest - Quest definition
 * @param {Object} runStats - Current run statistics
 * @returns {number} Progress percentage (0-100)
 */
function getQuestProgress(quest, runStats) {
  if (!quest || !quest.objective) return 0;

  const obj = quest.objective;
  let current = 0;

  switch (obj.type) {
    case 'complete_boards':
    case 'complete_board':
      current = runStats.boardNumber;
      break;

    case 'collect_coins':
      current = runStats.coinsEarned;
      break;

    case 'perfect_boards':
      current = runStats.perfectBoards;
      break;

    case 'time_limit':
      // For time limit, progress is inverse (remaining time)
      const elapsed = Date.now() - runStats.startTime;
      const remaining = Math.max(0, obj.target - elapsed);
      return Math.round((remaining / obj.target) * 100);

    default:
      return 0;
  }

  return Math.min(100, Math.round((current / obj.target) * 100));
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QUESTS,
    getQuest,
    getUnlockedQuests,
    getQuestsWithStatus,
    isQuestObjectiveComplete,
    getQuestProgress
  };
}
