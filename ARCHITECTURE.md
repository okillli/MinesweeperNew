# LiMineZZsweeperIE - Technical Architecture

> **Read Time**: ~10 minutes | **Purpose**: Code patterns and structure

---

## 🏗️ System Overview

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

### Core Principles

1. **Separation of Concerns**: Logic ≠ Rendering (NEVER mix)
2. **Mobile-First**: Touch input is primary, mouse/keyboard are enhancements
3. **Single Source of Truth**: GameState holds all state
4. **Unidirectional Flow**: Input → Update → Render

---

## 📁 File Structure

```
src/
├── main.js              # Entry point, input handling
├── core/
│   ├── Game.js          # RAF loop orchestrator
│   ├── GameState.js     # Central state management
│   ├── StateMachine.js  # Screen transitions
│   └── EventBus.js      # Pub/sub communication
├── entities/
│   ├── Cell.js          # Individual cell state
│   └── Grid.js          # Minesweeper logic
├── systems/
│   ├── ShopSystem.js    # Shop & purchasing
│   ├── ItemSystem.js    # Item effects
│   └── SaveSystem.js    # localStorage wrapper
├── rendering/
│   ├── CanvasRenderer.js # Grid visualization
│   └── UIRenderer.js     # DOM updates
└── data/
    ├── items.js         # Item definitions
    ├── quests.js        # Quest definitions
    └── characters.js    # Character definitions
```

---

## 🔄 Game Loop

```javascript
class Game {
  loop(timestamp) {
    if (!this.running) return;

    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(deltaTime);  // Logic
    this.render();           // Visuals

    requestAnimationFrame((t) => this.loop(t));
  }
}
```

---

## 🗄️ State Management

```javascript
GameState {
  currentScreen: 'MENU' | 'PLAYING' | 'SHOP' | 'GAME_OVER',

  currentRun: {
    hp, maxHp, mana, maxMana, coins,
    items: { passive: [], active: [], consumables: [] },
    stats: { cellsRevealed, minesHit, coinsEarned }
  },

  grid: Grid,           // Current board
  hoverCell: {x, y},    // Mouse hover position
  cursor: {x, y},       // Keyboard cursor position

  persistent: {         // Saved to localStorage
    gems, unlockedItems, achievements, stats
  }
}
```

**State Flow**:
```
User Input → Game.update() → GameState.modify() → Renderer.render(state)
```

---

## 🎮 Grid System

```javascript
class Grid {
  constructor(width, height, mineCount) {
    this.cells = [];  // 2D array: cells[y][x] (row-major)
    this.revealed = 0;
    this.flagged = 0;
  }

  // Core methods
  revealCell(x, y)    // Reveals cell, auto-cascades zeros
  toggleFlag(x, y)    // Flags/unflags cell
  chord(x, y)         // Auto-reveals if flags match number
  isComplete()        // True when all safe cells revealed
  getCell(x, y)       // Returns cell or null if invalid
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isMine = false;
    this.isRevealed = false;
    this.isFlagged = false;
    this.number = 0;  // Adjacent mine count
  }
}
```

**Important**: Grid indexing is `cells[y][x]` (row-major). X = column, Y = row.

---

## 🎨 Rendering

```javascript
class CanvasRenderer {
  render(gameState) {
    this.clear();
    if (gameState.currentScreen === 'PLAYING' && gameState.grid) {
      this.renderGrid(gameState.grid);
      this.renderHoverHighlight(gameState.hoverCell);
      this.renderKeyboardCursor(gameState.cursor);
    }
  }

  renderCell(cell, x, y) {
    // Background based on state
    ctx.fillStyle = cell.isRevealed
      ? (cell.isMine ? '#e63946' : '#eee')
      : '#aaa';

    // Content: number, mine, or flag
    if (cell.isRevealed && cell.number > 0) {
      this.renderNumber(cell.number, x, y);
    }
  }
}
```

**Number Colors**: 1=blue, 2=green, 3=red, 4=dark blue, 5=brown, 6=teal, 7=black, 8=gray

---

## 🎯 Event System

```javascript
class EventBus {
  on(event, callback)    // Subscribe
  off(event, callback)   // Unsubscribe
  emit(event, data)      // Publish
}

// Usage
events.emit('cell_revealed', { x, y, isMine });
events.on('cell_revealed', (data) => updateStats(data));
```

---

## 💾 Save System

```javascript
// Only save persistent data, never currentRun
localStorage['minequest_save_v1'] = {
  version: '1.0.0',
  timestamp: Date.now(),
  persistent: {
    gems, unlockedItems, unlockedCharacters, achievements, stats
  }
}
```

---

## 📱 Mobile-First Input

```javascript
// Input priority (in order of importance):
// 1. Touch (primary - most users)
// 2. Mouse (desktop enhancement)
// 3. Keyboard (accessibility/power users)

const MIN_TOUCH_TARGET = 44;     // Minimum touch target (px)
const PREFERRED_TOUCH_TARGET = 60;
const LONG_PRESS_MS = 500;        // Flag action delay
```

**Touch Actions**:
- Tap → Reveal cell
- Long-press (500ms) → Flag cell
- Tap revealed number → Chord

---

## 🔧 Performance Guidelines

1. **Canvas**: Only redraw changed cells, use RAF
2. **State**: Batch updates, avoid unnecessary object creation
3. **Memory**: Clear intervals/timeouts, remove event listeners
4. **Mobile**: Target 60 FPS mid-range, 30+ FPS low-end

---

## 🔗 Related Docs

| Doc | Purpose |
|-----|---------|
| [GAME_DESIGN.md](GAME_DESIGN.md) | Game mechanics, items, balance |
| [DEPENDENCIES.md](DEPENDENCIES.md) | Component relationships |
| [CLAUDE.md](CLAUDE.md) | Quick architecture reference |

---

**Version**: 0.3.0 | **Last Updated**: 2025-12-30
