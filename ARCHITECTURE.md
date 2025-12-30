# MineQuest - Technical Architecture

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────┐
│           User Interface (DOM)              │
│  Menu, Shop, HUD, Dialogs, Settings        │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│         Game Loop (RAF)                     │
│  Update → Render → Repeat                   │
└────────┬───────────────────────┬────────────┘
         │                       │
┌────────▼────────┐    ┌────────▼────────────┐
│  Game State     │    │  Canvas Renderer    │
│  Logic & Data   │    │  Visual Output      │
└────────┬────────┘    └─────────────────────┘
         │
┌────────▼──────────────────────────────────┐
│  Systems (Grid, Shop, Items, Progression) │
└───────────────────────────────────────────┘
```

### Separation of Concerns

**Core Principle**: Strict separation between game logic and rendering

- **Game State**: Pure data and logic, no rendering
- **Renderer**: Pure presentation, no logic
- **Systems**: Encapsulated subsystems (grid, shop, items)
- **Utils**: Reusable helpers (RNG, storage, math)

### Mobile-First Design

**Core Principle**: Design for mobile FIRST, desktop is an enhancement

This project follows a mobile-first approach. All architecture decisions prioritize:
- Touch input as the primary interaction method
- Portrait orientation as the default layout
- Performance on mid-range mobile devices
- One-handed operation with thumb-reachable controls

Desktop support (mouse, keyboard) is added as an enhancement after mobile works well.

## 📁 File Structure

```
MinesweeperNew/
├── index.html              # Entry point
├── styles.css              # Global styles
├── README.md               # User-facing documentation
├── PROJECT_OVERVIEW.md     # High-level project summary
├── GAME_DESIGN.md          # Game mechanics & design
├── ARCHITECTURE.md         # This file - technical specs
├── DEVELOPMENT.md          # Development roadmap & tasks
│
├── docs/                   # Additional documentation
│   ├── research/           # Research documents
│   ├── decisions/          # Design decision logs
│   └── api/                # Code API documentation
│
├── src/                    # Source code
│   ├── main.js             # Entry point, game initialization
│   │
│   ├── core/               # Core game systems
│   │   ├── Game.js         # Main game loop orchestrator
│   │   ├── GameState.js    # State management
│   │   ├── StateMachine.js # Game state machine
│   │   └── EventBus.js     # Event system
│   │
│   ├── systems/            # Game subsystems
│   │   ├── GridSystem.js   # Minesweeper grid logic
│   │   ├── ShopSystem.js   # Shop & purchasing
│   │   ├── ItemSystem.js   # Item management & effects
│   │   ├── QuestSystem.js  # Quest tracking & completion
│   │   ├── ProgressionSystem.js  # Unlocks & achievements
│   │   └── SaveSystem.js   # Save/load functionality
│   │
│   ├── rendering/          # Visual output
│   │   ├── CanvasRenderer.js  # Grid rendering
│   │   ├── UIRenderer.js      # DOM UI rendering
│   │   └── effects.js         # Visual effects (juice)
│   │
│   ├── entities/           # Game entities
│   │   ├── Cell.js         # Individual cell
│   │   ├── Grid.js         # Grid container
│   │   ├── Item.js         # Item base class
│   │   └── Character.js    # Player character/class
│   │
│   ├── data/               # Game data definitions
│   │   ├── items.js        # Item definitions
│   │   ├── quests.js       # Quest definitions
│   │   ├── characters.js   # Character class definitions
│   │   └── constants.js    # Game constants
│   │
│   └── utils/              # Utility functions
│       ├── random.js       # Seeded RNG
│       ├── storage.js      # localStorage wrapper
│       ├── math.js         # Math helpers
│       └── helpers.js      # General utilities
│
├── assets/                 # Game assets
│   ├── sprites/            # Images (future)
│   ├── sounds/             # Audio files (future)
│   └── fonts/              # Custom fonts (future)
│
└── tests/                  # Tests (future)
    ├── unit/               # Unit tests
    └── integration/        # Integration tests
```

## 🔄 Game Loop Architecture

### Request Animation Frame Pattern

```javascript
class Game {
  constructor() {
    this.state = new GameState();
    this.renderer = new CanvasRenderer();
    this.lastTime = 0;
    this.running = false;
  }

  loop(timestamp) {
    if (!this.running) return;

    // Calculate delta time
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Update game state (logic)
    this.update(deltaTime);

    // Render current state (visuals)
    this.render();

    // Continue loop
    requestAnimationFrame((t) => this.loop(t));
  }

  update(deltaTime) {
    // Update all game systems
    this.state.update(deltaTime);
  }

  render() {
    // Render grid to canvas
    this.renderer.render(this.state);
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  stop() {
    this.running = false;
  }
}
```

## 🗄️ State Management

### Game State Structure

```javascript
class GameState {
  constructor() {
    // Meta state
    this.currentScreen = 'MENU'; // MENU, PLAYING, SHOP, GAME_OVER

    // Hover state (UX feedback)
    this.hoverCell = null; // { x: number, y: number } | null

    // Run state
    this.currentRun = {
      quest: null,           // Current quest object
      character: null,       // Selected character class
      boardNumber: 0,        // Current board (0-5)
      hp: 3,                 // Current HP
      maxHp: 3,              // Max HP
      mana: 0,               // Current mana
      maxMana: 100,          // Max mana
      coins: 0,              // Current coins

      items: {
        passive: [],         // Array of passive items
        active: [],          // Array of active abilities
        consumables: []      // Array of consumables
      },

      stats: {
        cellsRevealed: 0,
        minesHit: 0,
        coinsEarned: 0,
        manaUsed: 0,
        itemsPurchased: 0
      }
    };

    // Current board state
    this.grid = null;        // Current Grid instance

    // Persistent state (saved)
    this.persistent = {
      gems: 0,               // Total gems
      unlockedItems: [],     // Array of unlocked item IDs
      unlockedCharacters: [], // Array of unlocked character IDs
      unlockedQuests: [],    // Array of unlocked quest IDs
      achievements: [],      // Array of achievement IDs
      stats: {
        totalRuns: 0,
        totalWins: 0,
        totalCoins: 0,
        totalDamage: 0,
        totalMana: 0
      }
    };
  }

  update(deltaTime) {
    // Update systems based on current screen
    if (this.currentScreen === 'PLAYING') {
      // Game update logic
    }
  }

  // State transition methods
  startRun(quest, character) {
    this.currentRun.quest = quest;
    this.currentRun.character = character;
    this.currentRun.boardNumber = 0;
    this.currentRun.hp = character.startingHp;
    this.currentRun.mana = character.startingMana;
    this.currentScreen = 'PLAYING';
    this.generateNextBoard();
  }

  generateNextBoard() {
    this.currentRun.boardNumber++;
    // Generate new grid based on board number
  }

  endRun(victory) {
    // Calculate gems earned
    // Update persistent stats
    // Save to localStorage
    this.currentScreen = 'GAME_OVER';
  }
}
```

### StateMachine (Phase 2 Feature)

> **Note**: StateMachine is planned for Phase 2 when shop/board transitions require validation.
> Phase 1 uses simple screen mapping in main.js which is sufficient for current needs.

```javascript
class StateMachine {
  constructor() {
    this.states = {
      MENU: 'menu',
      QUEST_SELECT: 'quest_select',
      CHARACTER_SELECT: 'character_select',
      PLAYING: 'playing',
      SHOP: 'shop',
      GAME_OVER: 'game_over'
    };

    this.current = this.states.MENU;
    this.listeners = [];
  }

  transition(newState) {
    if (!this.isValidTransition(this.current, newState)) {
      console.warn(`Invalid transition: ${this.current} → ${newState}`);
      return false;
    }

    const oldState = this.current;
    this.current = newState;
    this.notifyListeners(oldState, newState);
    return true;
  }

  isValidTransition(from, to) {
    const validTransitions = {
      MENU: ['QUEST_SELECT'],
      QUEST_SELECT: ['CHARACTER_SELECT', 'MENU'],
      CHARACTER_SELECT: ['PLAYING', 'QUEST_SELECT'],
      PLAYING: ['SHOP', 'GAME_OVER'],
      SHOP: ['PLAYING', 'GAME_OVER'],
      GAME_OVER: ['MENU']
    };

    return validTransitions[from]?.includes(to) || false;
  }

  on(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(oldState, newState) {
    this.listeners.forEach(cb => cb(oldState, newState));
  }
}
```

## 🎮 Grid System Architecture

### Grid Class

```javascript
class Grid {
  constructor(width, height, mineCount) {
    this.width = width;
    this.height = height;
    this.mineCount = mineCount;
    this.cells = [];
    this.revealed = 0;
    this.flagged = 0;
    this.generate();
  }

  generate() {
    // Create cells
    for (let y = 0; y < this.height; y++) {
      this.cells[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.cells[y][x] = new Cell(x, y);
      }
    }

    // Place mines (randomly)
    this.placeMines();

    // Calculate numbers
    this.calculateNumbers();
  }

  placeMines() {
    let placed = 0;
    while (placed < this.mineCount) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);

      if (!this.cells[y][x].isMine) {
        this.cells[y][x].isMine = true;
        placed++;
      }
    }
  }

  calculateNumbers() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.cells[y][x].isMine) {
          this.cells[y][x].number = this.countAdjacentMines(x, y);
        }
      }
    }
  }

  countAdjacentMines(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isValid(nx, ny) && this.cells[ny][nx].isMine) {
          count++;
        }
      }
    }
    return count;
  }

  isValid(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getCell(x, y) {
    if (!this.isValid(x, y)) return null;
    return this.cells[y][x];
  }

  revealCell(x, y) {
    const cell = this.getCell(x, y);
    if (!cell || cell.isRevealed || cell.isFlagged) return null;

    cell.isRevealed = true;
    this.revealed++;

    // Auto-reveal zeros
    if (cell.number === 0 && !cell.isMine) {
      this.revealAdjacent(x, y);
    }

    return cell;
  }

  revealAdjacent(x, y) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isValid(nx, ny)) {
          this.revealCell(nx, ny);
        }
      }
    }
  }

  toggleFlag(x, y) {
    const cell = this.getCell(x, y);
    if (!cell || cell.isRevealed) return false;

    cell.isFlagged = !cell.isFlagged;
    this.flagged += cell.isFlagged ? 1 : -1;
    return true;
  }

  chord(x, y) {
    const cell = this.getCell(x, y);
    if (!cell || !cell.isRevealed || cell.number === 0) return [];

    // Count adjacent flags
    let flagCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const adjacent = this.getCell(x + dx, y + dy);
        if (adjacent?.isFlagged) flagCount++;
      }
    }

    // Only chord if flag count matches number
    if (flagCount !== cell.number) return [];

    const revealed = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        const adjacent = this.getCell(nx, ny);
        if (adjacent && !adjacent.isRevealed && !adjacent.isFlagged) {
          const result = this.revealCell(nx, ny);
          if (result) revealed.push(result);
        }
      }
    }

    return revealed;
  }

  isComplete() {
    // All non-mine cells revealed
    const totalCells = this.width * this.height;
    return this.revealed === totalCells - this.mineCount;
  }
}
```

### Cell Class

```javascript
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isMine = false;
    this.isRevealed = false;
    this.isFlagged = false;
    this.number = 0; // Adjacent mine count
  }
}
```

## 🎨 Rendering Architecture

### Canvas Renderer

```javascript
class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = 40; // Base cell size in pixels
    this.padding = 2;   // Padding between cells
  }

  render(gameState) {
    // Clear canvas
    this.clear();

    // Render grid if playing
    if (gameState.currentScreen === 'PLAYING' && gameState.grid) {
      this.renderGrid(gameState.grid);

      // Render hover highlight for visual feedback
      if (gameState.hoverCell) {
        this.renderHoverHighlight(gameState.grid, gameState.hoverCell);
      }
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderGrid(grid) {
    // Calculate grid position (centered)
    const gridWidth = grid.width * (this.cellSize + this.padding);
    const gridHeight = grid.height * (this.cellSize + this.padding);
    const offsetX = (this.canvas.width - gridWidth) / 2;
    const offsetY = (this.canvas.height - gridHeight) / 2;

    // Render each cell
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        const cellX = offsetX + x * (this.cellSize + this.padding);
        const cellY = offsetY + y * (this.cellSize + this.padding);
        this.renderCell(cell, cellX, cellY);
      }
    }
  }

  renderCell(cell, x, y) {
    const ctx = this.ctx;
    const size = this.cellSize;

    // Draw cell background
    if (cell.isRevealed) {
      ctx.fillStyle = cell.isMine ? '#e63946' : '#eee';
    } else {
      ctx.fillStyle = '#aaa';
    }
    ctx.fillRect(x, y, size, size);

    // Draw cell border
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);

    // Draw content
    if (cell.isRevealed) {
      if (cell.isMine) {
        this.renderMine(x, y, size);
      } else if (cell.number > 0) {
        this.renderNumber(cell.number, x, y, size);
      }
    } else if (cell.isFlagged) {
      this.renderFlag(x, y, size);
    }
  }

  renderNumber(num, x, y, size) {
    const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080',
                    '#800000', '#008080', '#000000', '#808080'];
    this.ctx.fillStyle = colors[num] || '#000';
    this.ctx.font = `bold ${size * 0.6}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(num, x + size/2, y + size/2);
  }

  renderMine(x, y, size) {
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(x + size/2, y + size/2, size * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderFlag(x, y, size) {
    this.ctx.fillStyle = '#f4a261';
    this.ctx.beginPath();
    this.ctx.moveTo(x + size * 0.3, y + size * 0.2);
    this.ctx.lineTo(x + size * 0.7, y + size * 0.4);
    this.ctx.lineTo(x + size * 0.3, y + size * 0.6);
    this.ctx.closePath();
    this.ctx.fill();
  }

  renderHoverHighlight(grid, hoverCell) {
    // Calculate cell position
    const { x, y } = hoverCell;
    const cell = grid.getCell(x, y);
    if (!cell) return;

    // Different highlights based on cell state:
    // - Unrevealed: Green border + white overlay (primary action)
    // - Revealed: Blue border (chording indication)
    // - Flagged: Orange border (unflag indication)
    if (cell.isRevealed) {
      this.ctx.strokeStyle = '#4a90e2';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    } else if (cell.isFlagged) {
      this.ctx.strokeStyle = '#f4a261';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    } else {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fillRect(cellX, cellY, size, size);
      this.ctx.strokeStyle = '#2ecc71';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(cellX + 1.5, cellY + 1.5, size - 3, size - 3);
    }

    // Flag pole
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x + size * 0.3, y + size * 0.2);
    this.ctx.lineTo(x + size * 0.3, y + size * 0.8);
    this.ctx.stroke();
  }

  resizeCanvas(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
```

## 💾 Save System

### localStorage Wrapper

```javascript
class SaveSystem {
  constructor() {
    this.SAVE_KEY = 'minequest_save_v1';
  }

  save(gameState) {
    try {
      const saveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        persistent: gameState.persistent
      };

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  load() {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) return null;

      const saveData = JSON.parse(saved);

      // Version check
      if (saveData.version !== '1.0.0') {
        console.warn('Save version mismatch, migrating...');
        return this.migrate(saveData);
      }

      return saveData.persistent;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }

  migrate(oldSave) {
    // Handle version migrations
    return oldSave.persistent;
  }

  clear() {
    localStorage.removeItem(this.SAVE_KEY);
  }

  exists() {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }
}
```

## 🎯 Event System

### Event Bus

```javascript
class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Error in event handler for ${event}:`, e);
      }
    });
  }
}

// Usage
const events = new EventBus();

events.on('cell_revealed', (data) => {
  console.log('Cell revealed:', data);
});

events.emit('cell_revealed', { x: 5, y: 3, isMine: false });
```

## 🔧 Performance Considerations

### Optimization Strategies

1. **Canvas Rendering**
   - Only redraw changed cells (dirty rectangles)
   - Use `requestAnimationFrame` for smooth 60 FPS
   - Cache static elements (grid background)

2. **State Updates**
   - Batch updates when possible
   - Use delta time for frame-independent logic
   - Avoid unnecessary object creation

3. **Memory Management**
   - Reuse objects (object pooling for particles)
   - Clear intervals/timeouts on cleanup
   - Remove event listeners when done

4. **Mobile-First Optimization** (PRIMARY)
   - Design for touch input first, mouse is secondary
   - Target 60 FPS on mid-range phones, 30+ on low-end
   - Scale canvas resolution based on device pixel ratio
   - Debounce touch events appropriately
   - Reduce particle effects on low-end devices
   - Keep bundle size <5MB for fast mobile loading
   - Test on mobile browsers BEFORE desktop

### Mobile-First Input Architecture

```javascript
// Priority order for input handling:
// 1. Touch (primary - most users)
// 2. Pointer events (unified touch/mouse)
// 3. Mouse (desktop enhancement)
// 4. Keyboard (desktop enhancement/accessibility)

// Touch targets must be minimum 44x44px (preferably 60x60px)
const MIN_TOUCH_TARGET = 44;
const PREFERRED_TOUCH_TARGET = 60;

// Long-press duration for flag action
const LONG_PRESS_MS = 500;
```

---

**Last Updated**: 2025-12-30
**Version**: 0.3.0 (Phase 2A Complete)
