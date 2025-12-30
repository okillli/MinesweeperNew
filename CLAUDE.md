# CLAUDE.md

> **🤖 FOR CLAUDE CODE INSTANCES**
>
> **When to Read This**: FIRST thing when starting work on this project
> **Related Docs**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for quick facts, [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md) for workflow
> **Read Time**: ~8 minutes

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🗺️ Quick Navigation for Claude

### First Time Working on This Project
1. **Read this file** (CLAUDE.md) - Understand architecture & patterns (8 min)
2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Get quick facts (5 min)
3. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Understand vision (5 min)
4. **[DEVELOPMENT.md](DEVELOPMENT.md)** - See current tasks (3 min)

### Starting a Work Session
1. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Refresh context (2 min)
2. **[PROGRESS.md](PROGRESS.md)** - Check what's complete (1 min)
3. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Find next task (1 min)
4. **This file** - Review relevant architecture section

### Implementing a Feature
1. **[PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md)** - Quick check before coding (2 min)
2. **[GAME_DESIGN.md](GAME_DESIGN.md)** - Understand mechanics
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - See code patterns
4. **[DEPENDENCIES.md](DEPENDENCIES.md)** - Check component relationships
5. **This file** - Check critical patterns section
6. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Constants & values

### Multi-Session Coordination
1. **[PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)** - Read session protocols
2. **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** - Check file ownership
3. **This file** - Development workflow section

---

## Development Commands

### Running the Game
```bash
# Open index.html directly in browser - no build process required
# For development, use a simple HTTP server (optional but recommended):
python -m http.server 8000
# or
npx serve .
```

### Git Workflow
```bash
# Check status and commit changes
git status
git add .
git commit -m "Description of changes"

# Deploy to GitHub Pages (when ready)
git remote add origin <repo-url>
git push -u origin main
# Then enable GitHub Pages in repo settings
```

### No Build/Test Commands
This is vanilla JavaScript with no build process, bundler, or test framework currently configured.

## Architecture Overview

### Core Philosophy: Strict Separation of Concerns

The codebase follows a **Model-View-Controller-like pattern** with clear boundaries:

1. **Game Logic (Model)**: Pure data structures and business logic in `src/entities/` and `src/systems/`
   - NEVER contains rendering code
   - NEVER directly manipulates DOM or Canvas
   - Returns data that renderers consume

2. **Rendering (View)**: Visual output in `src/rendering/`
   - Canvas for game grid (CanvasRenderer)
   - DOM for UI elements (UIRenderer)
   - NEVER contains game logic
   - Only reads state, never modifies it

3. **Orchestration (Controller)**: Game loop and state in `src/core/`
   - Coordinates updates and rendering
   - Manages state transitions via StateMachine
   - Handles event communication via EventBus

### Critical Architecture Patterns

**State Management**
```javascript
// GameState is the single source of truth
GameState {
  currentScreen: 'MENU' | 'PLAYING' | 'SHOP' | 'GAME_OVER'
  currentRun: { quest, character, hp, mana, coins, items, stats }
  grid: Grid instance
  persistent: { gems, unlocks, achievements, stats }
}
```

State flows in ONE direction:
```
User Input → Game.update() → GameState.modify() → Renderer.render(state)
```

**Event Bus Pattern**
Used for decoupled communication between systems:
```javascript
events.emit('cell_revealed', { x, y, isMine });
events.on('cell_revealed', handleCellRevealed);
```

**State Machine**
Screen transitions are validated to prevent invalid states:
```
MENU → QUEST_SELECT → CHARACTER_SELECT → PLAYING ↔ SHOP → GAME_OVER → MENU
```

### Grid System Architecture

> See [ARCHITECTURE.md](ARCHITECTURE.md) for complete system details

The Grid class is the heart of minesweeper logic:

**Key Methods**:
- `revealCell(x, y)`: Reveals cell, auto-cascades zeros
- `toggleFlag(x, y)`: Flags/unflags cells
- `chord(x, y)`: Auto-reveals around numbered cell if flags match
- `isComplete()`: Checks win condition

**Important**: Grid uses a 2D array indexed as `cells[y][x]` (row-major order). X is column, Y is row.

### Resource System Design

Four interconnected resources create the roguelike economy:

1. **HP**: Health system (forgiving, not instant-death)
   - Start: 3 HP
   - Mine hit: -1 HP
   - 0 HP = run ends

2. **Coins**: In-run currency
   - Earned: +10 per safe cell revealed
   - Spent: Shop purchases between boards
   - Resets: Each run starts at 0

3. **Mana**: Active ability fuel
   - Earned: +5 per cell, +10 per correct flag
   - Spent: Active abilities (50-150 mana)
   - Persists: Throughout run, not between runs

4. **Gems**: Meta-progression currency
   - Earned: Quest completion, achievements
   - Spent: Unlock items, characters, quests
   - Persists: Forever (saved to localStorage)

## Game Design Constants

> See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for complete constants reference

### Board Progression Formula
```javascript
const BOARD_CONFIGS = [
  { size: 8,  mines: 10, density: 0.156, coinMult: 1.0 },  // Board 1
  { size: 10, mines: 15, density: 0.150, coinMult: 1.0 },  // Board 2
  { size: 12, mines: 25, density: 0.174, coinMult: 1.5 },  // Board 3
  { size: 14, mines: 35, density: 0.179, coinMult: 2.0 },  // Board 4
  { size: 14, mines: 40, density: 0.204, coinMult: 2.5 },  // Board 5
  { size: 16, mines: 50, density: 0.195, coinMult: 3.0 }   // Boss
];
```

### Item Balance Guidelines
- **Passive items**: Always-on effects, 20-200 coins
- **Active abilities**: Mana-costed, 40-200 coins
- **Consumables**: Single-use, 10-30 coins
- **Rarity distribution**: 60% common, 30% rare, 10% legendary

### Quest Objectives
Each quest defines different win conditions:
- Classic Clear: Complete all boards
- Treasure Hunter: Earn 500+ coins
- Speed Runner: Complete in <8 minutes
- Perfect Game: Take no damage
- Boss Slayer: Defeat boss board

## Critical Design Principles

### 1. Simplicity First
- Start with minimal features
- Add complexity only when needed
- Prefer simple solutions over clever ones

### 2. Mobile-First
- Touch targets minimum 44x44px
- Long-press (500ms) for flag
- Tap for reveal
- Test on mobile browsers early

### 3. No Power Creep
- First run must be winnable without unlocks
- Unlocks add **variety**, not just power
- Meta-progression expands options, doesn't gate content

### 4. Strict Separation
- Game logic NEVER calls rendering
- Renderers NEVER modify state
- Events for cross-system communication

### 5. Playtest Early
After implementing each phase, validate:
- Phase 1: Is core minesweeper fun?
- Phase 2: Do items add strategic depth?
- Phase 3: Do unlocks create "one more run" feeling?

## Save System Structure

```javascript
localStorage['minequest_save_v1'] = {
  version: '1.0.0',
  timestamp: Date.now(),
  persistent: {
    gems: number,
    unlockedItems: string[],
    unlockedCharacters: string[],
    achievements: string[],
    stats: { totalRuns, totalWins, totalCoins, ... }
  }
}
```

**Important**: Save only `persistent` state, never `currentRun` (runs are ephemeral).

## Development Workflow

> See [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md) for complete workflow protocols

### Phase-Based Development
Currently in **Phase 1: Core Proof of Fun**

**Next immediate steps**:
1. Implement `src/entities/Cell.js` - Individual cell state
2. Implement `src/entities/Grid.js` - Minesweeper grid logic
3. Implement `src/rendering/CanvasRenderer.js` - Grid visualization
4. Wire up click handlers in `src/main.js`
5. **Playtest** - Validate core loop is fun

### Before Writing Code
1. **⭐ [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md)** - Quick check (2 min, REQUIRED)
2. Check [DEVELOPMENT.md](DEVELOPMENT.md) for current phase
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) for patterns
4. Check [DEPENDENCIES.md](DEPENDENCIES.md) for component relationships
5. Read [GAME_DESIGN.md](GAME_DESIGN.md) for mechanics/balance
6. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for constants
7. Reference existing code examples in architecture docs

**For Complex/Critical Changes:**
- Use [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md) (15 min)
- Run `node analyze-dependencies.js` to verify impact

### Code Organization Rules
- **Data files** (`src/data/`): Pure data, no logic
- **Entities** (`src/entities/`): Data structures with methods
- **Systems** (`src/systems/`): Stateless game systems
- **Core** (`src/core/`): Game loop and orchestration
- **Rendering** (`src/rendering/`): Pure presentation

### Adding New Items
1. Define in `src/data/items.js`:
```javascript
{
  id: 'item_name',
  name: 'Display Name',
  type: 'passive' | 'active' | 'consumable',
  rarity: 'common' | 'rare' | 'legendary',
  cost: number,
  description: 'Effect description',
  effect: { /* effect parameters */ }
}
```

2. Implement effect in `src/systems/ItemSystem.js`
3. Add to initial unlock pool or achievement reward

### Adding New Quests
1. Define in `src/data/quests.js`:
```javascript
{
  id: 'quest_id',
  name: 'Quest Name',
  description: 'Quest description',
  objective: { type: 'clear' | 'coins' | 'time' | 'damage', value: number },
  rewards: { gems: number, bonus: number }
}
```

2. Implement tracking in `src/systems/QuestSystem.js`

## Anti-Patterns to Avoid

1. **Feature Creep**: Don't add features before core loop is validated as fun
2. **Mixing Concerns**: Game logic and rendering must stay separated
3. **Over-Engineering**: Avoid abstractions until you need them twice
4. **Ignoring Mobile**: Test touch controls from the start
5. **Power Creep**: Don't make unlocks required to win
6. **Premature Optimization**: Get it working, then make it fast

## Quick Reference

### File Responsibilities
- `src/core/Game.js` - RAF loop, orchestrates update/render
- `src/core/GameState.js` - Single source of truth for all state
- `src/core/StateMachine.js` - Screen transition validation
- `src/core/EventBus.js` - Decoupled event communication
- `src/entities/Grid.js` - Minesweeper logic (reveal, flag, chord)
- `src/entities/Cell.js` - Individual cell state
- `src/rendering/CanvasRenderer.js` - Draw grid to canvas
- `src/rendering/UIRenderer.js` - Update DOM UI elements
- `src/systems/ShopSystem.js` - Item purchasing logic
- `src/systems/ItemSystem.js` - Item effects and management
- `src/systems/SaveSystem.js` - localStorage wrapper

### Important Game Constants
- Starting HP: 3
- Coins per cell: +10
- Mana per cell: +5
- Total items (MVP): 20 (10 passive, 5 active, 5 consumable)
- Boards per run: 6 (5 normal + 1 boss)
- Character classes: 5 (Explorer, Scout, Merchant, Tank, Mage)

### Documentation Hierarchy
1. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Start here for context
2. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - High-level concept and rules
3. **[GAME_DESIGN.md](GAME_DESIGN.md)** - Complete mechanics and content
4. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical patterns and code structure
5. **[DEPENDENCIES.md](DEPENDENCIES.md)** - ⭐ Dependency mapping and impact analysis
6. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Roadmap and task tracking
7. **[PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)** - Multi-session coordination

### Change Management (NEW)
- **[PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md)** - ⭐ Use before EVERY change (2 min)
- **[IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)** - For complex changes (15 min)
- **[DEPENDENCY_IMPACT_SYSTEM.md](DEPENDENCY_IMPACT_SYSTEM.md)** - System overview

---

## 🔗 Quick Links

- **Main**: [README.md](README.md) - User-facing documentation
- **Quick Ref**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Fast facts
- **Overview**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Vision & principles
- **Design**: [GAME_DESIGN.md](GAME_DESIGN.md) - Game mechanics
- **Code**: [ARCHITECTURE.md](ARCHITECTURE.md) - Technical structure
- **Dependencies**: [DEPENDENCIES.md](DEPENDENCIES.md) - ⭐ Dependency mapping
- **Before Change**: [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) - ⭐ Required check
- **Tasks**: [DEVELOPMENT.md](DEVELOPMENT.md) - Roadmap
- **Workflow**: [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md) - Session protocols

**Last Updated**: 2025-12-30
