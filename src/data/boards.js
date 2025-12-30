/**
 * boards.js
 *
 * Board configurations for LiMineZZsweeperIE.
 * Defines the 6 boards in a run with scaling difficulty.
 *
 * DEPENDENCIES: None (pure data)
 * DEPENDENTS: GameState.js (generateNextBoard)
 *
 * Board Progression:
 * - Boards 1-5: Regular boards with increasing difficulty
 * - Board 6: Boss board (largest, most mines)
 */

const BOARDS = [
  {
    id: 1,
    name: 'Tutorial',
    width: 8,
    height: 8,
    mines: 10,
    coinMult: 1.0,
    description: 'A gentle start'
  },
  {
    id: 2,
    name: 'Easy',
    width: 10,
    height: 10,
    mines: 15,
    coinMult: 1.0,
    description: 'Getting warmer'
  },
  {
    id: 3,
    name: 'Normal',
    width: 12,
    height: 12,
    mines: 25,
    coinMult: 1.5,
    description: 'Standard challenge'
  },
  {
    id: 4,
    name: 'Hard',
    width: 14,
    height: 14,
    mines: 35,
    coinMult: 2.0,
    description: 'Things get serious'
  },
  {
    id: 5,
    name: 'Very Hard',
    width: 14,
    height: 14,
    mines: 40,
    coinMult: 2.5,
    description: 'Almost there...'
  },
  {
    id: 6,
    name: 'Boss',
    width: 16,
    height: 16,
    mines: 50,
    coinMult: 3.0,
    description: 'The final challenge'
  }
];

/**
 * Get board configuration by board number (1-indexed)
 * @param {number} boardNumber - Board number (1-6)
 * @returns {Object|null} Board configuration or null if invalid
 */
function getBoardConfig(boardNumber) {
  if (boardNumber < 1 || boardNumber > BOARDS.length) {
    return null;
  }
  return BOARDS[boardNumber - 1];
}

/**
 * Get total number of boards
 * @returns {number} Total board count
 */
function getTotalBoards() {
  return BOARDS.length;
}

/**
 * Check if a board is the boss board
 * @param {number} boardNumber - Board number to check
 * @returns {boolean} True if boss board
 */
function isBossBoard(boardNumber) {
  return boardNumber === BOARDS.length;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BOARDS, getBoardConfig, getTotalBoards, isBossBoard };
}
