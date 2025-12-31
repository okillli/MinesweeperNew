/**
 * boards.js
 *
 * Board configurations for LiMineZZsweeperIE.
 * Defines the 10 boards in a run with scaling difficulty.
 *
 * DEPENDENCIES: None (pure data)
 * DEPENDENTS: GameState.js (generateNextBoard)
 *
 * Board Progression:
 * - Boards 1-3: Pure minesweeper (familiar gameplay)
 * - Board 4-5: Traps introduced
 * - Board 6: Cursed cells introduced
 * - Board 7+: Timer introduced
 * - Board 10: Final Boss (all mechanics)
 *
 * Hazard Types:
 * - traps: Deal 1 damage when revealed (cell still reveals)
 * - cursed: Drain 20 mana when revealed (no HP damage)
 * - timer: Countdown timer (overtime = -50% coins)
 */

const BOARDS = [
  {
    id: 1,
    name: 'Tutorial',
    width: 8,
    height: 8,
    mines: 8,
    coinMult: 1.0,
    description: 'A gentle start',
    traps: 0,
    cursed: 0,
    timer: 0
  },
  {
    id: 2,
    name: 'Plains',
    width: 9,
    height: 9,
    mines: 12,
    coinMult: 1.0,
    description: 'Open fields ahead',
    traps: 0,
    cursed: 0,
    timer: 0
  },
  {
    id: 3,
    name: 'Forest',
    width: 10,
    height: 10,
    mines: 18,
    coinMult: 1.2,
    description: 'Watch your step',
    traps: 0,
    cursed: 0,
    timer: 0
  },
  {
    id: 4,
    name: 'Cavern',
    width: 11,
    height: 11,
    mines: 22,
    coinMult: 1.4,
    description: 'Danger lurks below',
    traps: 2,
    cursed: 0,
    timer: 0
  },
  {
    id: 5,
    name: 'Ruins',
    width: 12,
    height: 12,
    mines: 28,
    coinMult: 1.6,
    description: 'Ancient traps remain',
    traps: 3,
    cursed: 0,
    timer: 0
  },
  {
    id: 6,
    name: 'Fortress',
    width: 13,
    height: 13,
    mines: 34,
    coinMult: 1.8,
    description: 'Cursed halls await',
    traps: 3,
    cursed: 4,
    timer: 0
  },
  {
    id: 7,
    name: 'Volcano',
    width: 14,
    height: 14,
    mines: 42,
    coinMult: 2.0,
    description: 'Race against time',
    traps: 3,
    cursed: 4,
    timer: 90
  },
  {
    id: 8,
    name: 'Abyss',
    width: 15,
    height: 15,
    mines: 50,
    coinMult: 2.5,
    description: 'The depths call',
    traps: 4,
    cursed: 5,
    timer: 120
  },
  {
    id: 9,
    name: 'Citadel',
    width: 16,
    height: 16,
    mines: 58,
    coinMult: 3.0,
    description: 'Almost there...',
    traps: 5,
    cursed: 6,
    timer: 150
  },
  {
    id: 10,
    name: 'Final Boss',
    width: 18,
    height: 18,
    mines: 70,
    coinMult: 4.0,
    description: 'The ultimate challenge',
    traps: 6,
    cursed: 8,
    timer: 180,
    isBoss: true
  }
];

/**
 * Get board configuration by board number (1-indexed)
 * @param {number} boardNumber - Board number (1-10)
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

/**
 * Difficulty presets for board scaling
 * Each preset defines multipliers for board size and mine density
 */
const DIFFICULTY_PRESETS = {
  easy: {
    sizeScale: 0.8,     // 80% board size (smaller = easier)
    mineScale: 0.8,     // 80% mines (fewer = easier)
    name: 'Easy'
  },
  normal: {
    sizeScale: 1.0,     // 100% (default)
    mineScale: 1.0,
    name: 'Normal'
  },
  hard: {
    sizeScale: 1.15,    // 115% board size (larger = harder)
    mineScale: 1.2,     // 120% mines (more = harder)
    name: 'Hard'
  }
};

/**
 * Get a scaled board configuration based on difficulty settings
 * Supports both scaling mode and custom dimensions mode
 *
 * @param {number} boardNumber - Board number (1-10)
 * @param {Object} settings - Settings object with difficulty options
 * @param {string} settings.difficulty - 'easy', 'normal', 'hard', or 'custom'
 * @param {number} settings.boardSizeScale - Size scale 50-150% (used when difficulty='custom' and !useCustomDimensions)
 * @param {number} settings.mineDensityScale - Mine scale 50-150% (used when difficulty='custom' and !useCustomDimensions)
 * @param {boolean} settings.useCustomDimensions - If true, use exact custom dimensions instead of scaling
 * @param {number} settings.customWidth - Custom grid width 6-30 (used when useCustomDimensions=true)
 * @param {number} settings.customHeight - Custom grid height 6-30 (used when useCustomDimensions=true)
 * @param {number} settings.customMines - Custom mine count (used when useCustomDimensions=true)
 * @returns {Object|null} Board configuration or null if invalid
 */
function getScaledBoardConfig(boardNumber, settings = {}) {
  const baseConfig = getBoardConfig(boardNumber);
  if (!baseConfig) return null;

  const difficulty = settings.difficulty || 'normal';

  // Custom mode with exact dimensions
  if (difficulty === 'custom' && settings.useCustomDimensions) {
    const customWidth = Math.max(6, Math.min(30, settings.customWidth || 10));
    const customHeight = Math.max(6, Math.min(30, settings.customHeight || 10));
    const totalCells = customWidth * customHeight;
    const customMines = Math.max(5, Math.min(totalCells - 9, settings.customMines || 15));

    return {
      ...baseConfig,
      width: customWidth,
      height: customHeight,
      mines: customMines,
      // Mark as custom dimensions
      isCustomDimensions: true,
      // Include original values for reference
      originalWidth: baseConfig.width,
      originalHeight: baseConfig.height,
      originalMines: baseConfig.mines
    };
  }

  // Determine scale factors based on difficulty setting
  let sizeScale, mineScale;

  if (difficulty === 'custom') {
    // Use custom scales (convert from percentage to multiplier)
    sizeScale = (settings.boardSizeScale || 100) / 100;
    mineScale = (settings.mineDensityScale || 100) / 100;
  } else {
    // Use preset values
    const preset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;
    sizeScale = preset.sizeScale;
    mineScale = preset.mineScale;
  }

  // Calculate scaled dimensions (minimum 6x6, maximum 30x30)
  const scaledWidth = Math.max(6, Math.min(30, Math.round(baseConfig.width * sizeScale)));
  const scaledHeight = Math.max(6, Math.min(30, Math.round(baseConfig.height * sizeScale)));

  // Calculate scaled mine count (minimum 5, maximum is totalCells - 9 to ensure playability)
  const totalCells = scaledWidth * scaledHeight;
  const baseDensity = baseConfig.mines / (baseConfig.width * baseConfig.height);
  const scaledMines = Math.max(5, Math.min(
    totalCells - 9, // Leave at least 9 safe cells for first click area
    Math.round(totalCells * baseDensity * mineScale)
  ));

  return {
    ...baseConfig,
    width: scaledWidth,
    height: scaledHeight,
    mines: scaledMines,
    // Mark as scaled (not custom dimensions)
    isCustomDimensions: false,
    // Include original values for reference
    originalWidth: baseConfig.width,
    originalHeight: baseConfig.height,
    originalMines: baseConfig.mines,
    // Include applied scales
    appliedSizeScale: sizeScale,
    appliedMineScale: mineScale
  };
}

/**
 * Validate custom board settings and calculate constraints
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {number} mines - Number of mines
 * @returns {Object} Validation result with constraints
 */
function validateCustomBoard(width, height, mines) {
  const totalCells = width * height;
  const minMines = 5;
  const maxMines = totalCells - 9;
  const density = mines / totalCells;

  return {
    isValid: width >= 6 && width <= 30 && height >= 6 && height <= 30 && mines >= minMines && mines <= maxMines,
    constraints: {
      minWidth: 6,
      maxWidth: 30,
      minHeight: 6,
      maxHeight: 30,
      minMines: minMines,
      maxMines: maxMines,
      density: Math.round(density * 100)
    }
  };
}

/**
 * Get difficulty preset information
 * @param {string} difficulty - Difficulty name
 * @returns {Object|null} Preset information or null if invalid
 */
function getDifficultyPreset(difficulty) {
  return DIFFICULTY_PRESETS[difficulty] || null;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BOARDS, getBoardConfig, getTotalBoards, isBossBoard, getScaledBoardConfig, getDifficultyPreset, validateCustomBoard, DIFFICULTY_PRESETS };
}
