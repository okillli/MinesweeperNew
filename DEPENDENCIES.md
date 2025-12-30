# System Dependencies

> **Purpose**: Centralized documentation of all codebase dependencies and their relationships
> **Last Updated**: 2025-12-30
> **Related**: [ARCHITECTURE.md](ARCHITECTURE.md), [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)

---

## Overview

This document maps upstream and downstream dependencies across the LiMineZZsweeperIE codebase to enable effective impact analysis when making changes.

**Key Concepts:**
- **Upstream Dependencies**: Components this module depends on (imports)
- **Downstream Dependencies**: Components that depend on this module (importers)
- **Change Risk**: Impact severity if this component changes

---

## Dependency Hierarchy

```
┌─────────────────────────────────────┐
│       Entry Point Layer             │
│         main.js                     │
├─────────────────────────────────────┤
│     Orchestration Layer             │
│  Game.js, EventBus.js              │
├─────────────────────────────────────┤
│      Business Logic Layer           │
│  Grid.js, GameState.js              │
├─────────────────────────────────────┤
│       Foundation Layer              │
│    Cell.js, (Data files)           │
└─────────────────────────────────────┘

Dependency Flow: Foundation → Business Logic → Orchestration → Entry Point
```

---

## Core Dependencies (Foundation Layer)

### Cell.js
**Location**: `src/entities/Cell.js`

**PURPOSE**: Represents a single minesweeper cell with its state

**UPSTREAM DEPENDENCIES (what this imports):**
- None (pure data structure)

**DOWNSTREAM DEPENDENCIES (what imports this):**
- `Grid.js` - Creates and manages Cell instances

**CHANGE RISK**: **CRITICAL**
- Grid.js directly depends on Cell structure
- Any property changes break Grid initialization
- Changes require updates to Grid generation logic

**SIDE EFFECTS**: None (pure data holder)

**TESTING IMPACT**:
- Direct: Cell unit tests
- Indirect: All Grid tests, full game integration tests

---

### EventBus.js
**Location**: `src/core/EventBus.js`

**PURPOSE**: Decoupled event communication between systems

**UPSTREAM DEPENDENCIES (what this imports):**
- None (standalone utility)

**DOWNSTREAM DEPENDENCIES (what imports this):**
- `main.js` - Uses for game event handling
- Currently underutilized (future expansion expected)

**CHANGE RISK**: **MEDIUM**
- Limited current usage
- Future systems will depend heavily on this
- Event signature changes could break consumers

**SIDE EFFECTS**:
- Triggers callbacks registered by other systems
- Event emission order matters for some flows

**TESTING IMPACT**:
- Direct: EventBus tests
- Indirect: Integration tests that rely on events

---

## Business Logic Dependencies

### Grid.js
**Location**: `src/entities/Grid.js`

**PURPOSE**: Core minesweeper game logic - grid management and cell operations

**UPSTREAM DEPENDENCIES (what this imports):**
- `Cell.js` - Creates cell instances for grid

**DOWNSTREAM DEPENDENCIES (what imports this):**
- `main.js` - Creates Grid instances, calls reveal/flag/chord methods
- `Game.js` - Accesses via GameState.grid
- `CanvasRenderer.js` - Reads grid state for rendering
- `GameState.js` - Stores as currentRun.grid

**CRITICAL PATHS**:
1. Game loop → GameState.grid → CanvasRenderer reads → visual output
2. User click → main.js handlers → Grid.revealCell() → cascade logic → state update
3. Flag action → Grid.toggleFlag() → flag count tracking
4. Chord action → Grid.chord() → batch reveal logic

**CHANGE RISK**: **CRITICAL**
- Central to all gameplay mechanics
- Changes affect rendering, input handling, and game logic
- Methods called from multiple input paths (mouse, touch, keyboard)

**KEY METHODS & THEIR CONSUMERS**:
- `revealCell(x, y)` - Called by: main.js click handlers, Grid.revealAdjacent (cascade)
- `toggleFlag(x, y)` - Called by: main.js right-click handlers
- `chord(x, y)` - Called by: main.js click-on-revealed handlers
- `isComplete()` - Called by: main.js win condition checks
- `revealAllMines()` - Called by: main.js handleGameOver()
- `getCell(x, y)` - Called by: main.js, CanvasRenderer, Grid internal methods

**SIDE EFFECTS**:
- Modifies Cell.isRevealed state (affects rendering)
- Modifies Cell.isFlagged state (affects rendering and chord logic)
- Increments Grid.revealed counter (affects win condition)
- Increments Grid.flagged counter (affects chord validation)
- Cascading reveals can affect many cells at once

**ASSUMPTIONS**:
- Cell structure remains stable (x, y, isMine, isRevealed, isFlagged, number)
- Grid coordinates are always within bounds when called from main.js
- Grid is initialized before any operations are performed

**TESTING IMPACT**:
- Direct: Grid unit tests (reveal, flag, chord, cascade, win condition)
- Indirect: Full game integration tests, input handling tests
- Blast Radius: **3** (affects main.js, CanvasRenderer, GameState, Game.js)

---

### GameState.js
**Location**: `src/core/GameState.js`

**PURPOSE**: Single source of truth for all game state (runs, resources, progression)

**UPSTREAM DEPENDENCIES (what this imports):**
- None (pure state container)
- Conceptually depends on Grid, but doesn't import it (stores reference)

**DOWNSTREAM DEPENDENCIES (what imports this):**
- `Game.js` - Creates GameState instance, calls update()
- `main.js` - Reads/modifies state for UI updates, resource tracking
- `CanvasRenderer.js` - Reads state for rendering decisions

**CRITICAL PATHS**:
1. Game loop → Game.update() → GameState.update() → system updates
2. User action → main.js → GameState resource methods → HUD update
3. Game over → GameState.endRun() → stat tracking → persistent save
4. Keyboard navigation → GameState cursor methods → CanvasRenderer display

**CHANGE RISK**: **CRITICAL**
- Everything depends on GameState structure
- Property renames break all consumers
- Adding properties is generally safe, removing is dangerous

**KEY PROPERTIES & THEIR CONSUMERS**:
- `currentScreen` - Read by: main.js (screen logic), CanvasRenderer (render gates)
- `isGameOver` - Read by: main.js (input gates), Game.js (loop control)
- `grid` - Read by: main.js (input coord conversion), CanvasRenderer (rendering), GameState (cursor bounds)
- `currentRun.*` - Read by: main.js (HUD display), GameState methods (resource management)
- `hoverCell` - Read by: CanvasRenderer (hover highlight), main.js (hover tracking)
- `cursor` - Read by: CanvasRenderer (cursor rendering), GameState (cursor movement)

**KEY METHODS & THEIR CONSUMERS**:
- `update(deltaTime)` - Called by: Game.update() every frame
- `startRun(quest, character)` - Called by: main.js (future - quest/character selection)
- `endRun(victory)` - Called by: main.js handleGameOver()
- `addCoins(amount)` - Called by: main.js (cell reveal rewards)
- `addMana(amount)` - Called by: main.js (cell reveal, flag rewards)
- `takeDamage(amount)` - Called by: main.js (mine hit logic)
- `moveCursor(dx, dy)` - Called by: main.js keyboard handlers
- `clearBoard()` - Called by: main.js (new game from game over)

**SIDE EFFECTS**:
- Modifies persistent stats (saved to localStorage eventually)
- Awards gems on run completion
- Tracks run statistics for achievements

**ASSUMPTIONS**:
- Grid is initialized when cursor methods are called
- Resource methods are only called during active gameplay
- endRun() is called exactly once per run

**TESTING IMPACT**:
- Direct: GameState unit tests (state management, resources, cursor)
- Indirect: All game flow tests, progression tests
- Blast Radius: **4+** (affects everything - main.js, Game.js, CanvasRenderer, future systems)

---

## Orchestration Dependencies

### Game.js
**Location**: `src/core/Game.js`

**PURPOSE**: Main game loop orchestrator using RAF pattern

**UPSTREAM DEPENDENCIES (what this imports):**
- `GameState` (implicit - creates instance)
- `CanvasRenderer` (implicit - creates instance)

**DOWNSTREAM DEPENDENCIES (what imports this):**
- `main.js` - Creates Game instance, calls start/stop/render

**CRITICAL PATHS**:
1. RAF loop → Game.loop() → Game.update() → GameState.update()
2. RAF loop → Game.loop() → Game.render() → CanvasRenderer.render()
3. User clicks "Start" → main.js → game.start() → RAF begins
4. Game over → main.js → game.stop() → RAF halts

**CHANGE RISK**: **HIGH**
- Central coordinator but well-isolated
- Interface changes affect main.js initialization
- Loop timing changes affect all gameplay

**KEY METHODS & THEIR CONSUMERS**:
- `start()` - Called by: main.js (game start, new game from game over)
- `stop()` - Called by: main.js (game over handler)
- `loop(timestamp)` - Internal RAF callback
- `update(deltaTime)` - Internal, delegates to GameState
- `render()` - Internal, delegates to CanvasRenderer

**PUBLIC PROPERTIES ACCESSED**:
- `game.state` - Accessed by: main.js (extensive - all game logic reads/writes)
- `game.renderer` - Accessed by: main.js (freeze/unfreeze, cellSize for input conversion)

**SIDE EFFECTS**:
- RAF scheduling (can affect browser performance)
- Continuous rendering (CPU usage)
- Error handling stops loop (prevents error spam)

**ASSUMPTIONS**:
- Canvas element exists and is valid when constructed
- GameState and CanvasRenderer initialize successfully
- RAF is available in browser

**TESTING IMPACT**:
- Direct: Game loop tests (timing, start/stop, error handling)
- Indirect: All integration tests that rely on game loop
- Blast Radius: **2** (main.js, and indirectly affects GameState/CanvasRenderer behavior)

---

## Rendering Dependencies

### CanvasRenderer.js
**Location**: `src/rendering/CanvasRenderer.js`

**PURPOSE**: Pure rendering - draws grid state to canvas

**UPSTREAM DEPENDENCIES (what this imports):**
- None (reads from GameState passed as parameter)

**DOWNSTREAM DEPENDENCIES (what imports this):**
- `Game.js` - Creates instance, calls render()
- `main.js` - Accesses renderer properties for input conversion

**CRITICAL PATHS**:
1. Game loop → Game.render() → CanvasRenderer.render(GameState) → canvas draw
2. User click → main.js → canvasToGrid() → uses renderer.cellSize/padding
3. Hover → main.js → GameState.hoverCell set → CanvasRenderer.renderHoverHighlight()

**CHANGE RISK**: **MEDIUM**
- Visual-only changes have low risk
- `cellSize` / `padding` changes break input coordinate conversion
- Rendering algorithm changes could affect performance

**KEY METHODS & THEIR CONSUMERS**:
- `render(gameState)` - Called by: Game.render() every frame
- `renderGrid(grid)` - Internal
- `renderCell(cell, x, y)` - Internal
- `renderHoverHighlight(grid, hoverCell)` - Internal (called from render())
- `renderCursor(grid, cursor)` - Internal (called from render())
- `freeze()` - Called by: main.js (game over - preserve final frame)
- `unfreeze()` - Called by: main.js (new game - resume rendering)

**PUBLIC PROPERTIES ACCESSED**:
- `renderer.cellSize` - Accessed by: main.js canvasToGrid() for coordinate conversion
- `renderer.padding` - Accessed by: main.js canvasToGrid() for coordinate conversion

**SIDE EFFECTS**:
- Canvas drawing operations (GPU usage)
- Clears and redraws entire canvas every frame

**ASSUMPTIONS**:
- GameState structure is stable (currentScreen, grid, hoverCell, cursor)
- Grid.cells array is valid when rendering
- Canvas context is available and functional

**TESTING IMPACT**:
- Direct: Renderer tests (visual output, coordinate math)
- Indirect: Visual regression tests, input coordinate tests
- Blast Radius: **1** (only main.js directly accesses, visual changes only)

---

## Entry Point Dependencies

### main.js
**Location**: `src/main.js`

**PURPOSE**: Application entry point - DOM wiring, event handling, screen transitions

**UPSTREAM DEPENDENCIES (what this imports):**
- `Game` (implicit global - creates instance)
- `Grid` (implicit global - creates test grids)
- `GameState` (indirect via game.state)
- `CanvasRenderer` (indirect via game.renderer)
- `EventBus` (implicit global - currently minimal usage)

**DOWNSTREAM DEPENDENCIES (what imports this):**
- None (entry point - loaded by index.html)

**CRITICAL PATHS**:
1. DOM load → DOMContentLoaded → main.js initialization → game creation
2. User input → event handlers → Grid methods → GameState updates → HUD refresh
3. Screen transitions → showScreen() → DOM manipulation → GameState.currentScreen update

**CHANGE RISK**: **MEDIUM-HIGH**
- Large file with many responsibilities
- Changes here don't cascade to other modules
- But breaks can affect entire user experience

**KEY FUNCTIONS & THEIR TRIGGERS**:
- `showScreen(screenId)` - Called by: menu buttons, game over, shop continue
- `updateHUD()` - Called by: resource changes, game start, damage/healing
- `handleGameOver()` - Called by: mine hit with HP <= 0, chord kills player
- `handleLeftClick(event)` - Triggered by: canvas click
- `handleRightClick(event)` - Triggered by: canvas contextmenu
- `handleTouchStart/Move/End()` - Triggered by: canvas touch events
- `handleMouseMove()` - Triggered by: canvas mousemove
- `handleKeyDown()` - Triggered by: document keydown (when playing)
- `canvasToGrid(x, y)` - Called by: all input handlers for coordinate conversion

**DEPENDENCIES ON OTHER MODULES**:
- Calls `Grid.revealCell()`, `Grid.toggleFlag()`, `Grid.chord()`, `Grid.isComplete()`, `Grid.getCell()`, `Grid.revealAllMines()`
- Reads `Grid.revealed`, `Grid.flagged`, `Grid.mineCount`, `Grid.width`, `Grid.height`
- Calls `GameState` resource methods, cursor methods, `endRun()`, `clearBoard()`
- Reads `GameState.currentScreen`, `GameState.isGameOver`, `GameState.grid`, `GameState.hoverCell`, `GameState.cursor`, `GameState.currentRun.*`
- Calls `Game.start()`, `Game.stop()`
- Calls `CanvasRenderer.freeze()`, `CanvasRenderer.unfreeze()`
- Reads `CanvasRenderer.cellSize`, `CanvasRenderer.padding`

**SIDE EFFECTS**:
- DOM manipulation (screen visibility, HUD updates, canvas movement)
- Event listener registration (cleanup on page unload)
- LocalStorage operations (future - save/load)
- Console logging (debug output)

**ASSUMPTIONS**:
- DOM elements exist (#game-canvas, #hud, all screen IDs, all button IDs)
- Game instance initializes successfully
- Grid is created before input handling begins
- Canvas element dimensions are set correctly

**TESTING IMPACT**:
- Direct: Integration tests (full game flow, input handling, screen transitions)
- Indirect: None (entry point doesn't export)
- Blast Radius: **0 external** (changes contained to main.js, but affects UX)

---

## Circular Dependencies

**Current Status**: ✅ **None**

The architecture maintains strict unidirectional dependencies:
- Foundation → Business Logic → Orchestration → Entry Point
- No module imports a module that depends on it

**Watch for**:
- EventBus could create implicit circular dependencies if not carefully managed
- Future systems (ShopSystem, ItemSystem) should follow dependency hierarchy

---

## External Dependencies

**Current Status**: ✅ **No external libraries**

This is a vanilla JavaScript project with no npm dependencies.

**Browser APIs Used**:
- Canvas 2D Context (CanvasRenderer)
- RequestAnimationFrame (Game loop)
- DOM API (main.js screen management)
- Touch Events (main.js mobile support)
- Keyboard Events (main.js keyboard navigation)
- LocalStorage (future - SaveSystem)
- Navigator.vibrate (optional touch feedback)

**Compatibility Assumptions**:
- Modern browser (ES6 support)
- Canvas support (all modern browsers)
- Touch Events support (mobile browsers)
- No polyfills currently needed

---

## Change Impact Scoring

Use this matrix when planning changes:

| Component | Dependency Count | Change Frequency | Criticality | **Total Risk Score** |
|-----------|------------------|------------------|-------------|---------------------|
| Cell.js | 1 (Grid) | Low | High | **2** |
| EventBus.js | 1 (main) | Low | Medium | **1** |
| Grid.js | 4 (main, Game, Renderer, State) | Medium | Critical | **15** |
| GameState.js | 3 (main, Game, Renderer) | Medium | Critical | **12** |
| Game.js | 1 (main) | Low | High | **3** |
| CanvasRenderer.js | 2 (Game, main props) | Medium | Medium | **4** |
| main.js | 0 (entry point) | High | High | **0 external** |

**Risk Score Legend**:
- 10+: Changes require extensive testing across all systems
- 5-9: Changes need integration tests and careful review
- 1-4: Changes can be made with focused testing
- 0: Changes are isolated (but still test thoroughly!)

---

## Quick Reference: Who Imports What?

```
Cell.js
  ← Grid.js

EventBus.js
  ← main.js (minimal usage)

Grid.js
  ← main.js (creates, calls methods)
  ← GameState.js (stores reference)
  ← CanvasRenderer.js (reads state)
  ← Game.js (indirect via GameState)

GameState.js
  ← Game.js (creates instance)
  ← main.js (extensive usage)
  ← CanvasRenderer.js (reads for render decisions)

Game.js
  ← main.js (creates instance)

CanvasRenderer.js
  ← Game.js (creates instance)
  ← main.js (accesses properties)

main.js
  ← index.html (entry point)
```

---

## Testing Strategy by Dependency Level

**Foundation Layer** (Cell, EventBus):
- Unit tests only
- No integration tests needed (simple structures)
- Changes here: Run all Grid tests

**Business Logic Layer** (Grid, GameState):
- Extensive unit tests for all methods
- Integration tests for interactions
- Changes here: Run full test suite + manual playtest

**Orchestration Layer** (Game):
- Integration tests for loop timing
- End-to-end tests for game flow
- Changes here: Visual testing + performance testing

**Rendering Layer** (CanvasRenderer):
- Visual regression tests
- Coordinate math unit tests
- Changes here: Manual visual inspection + input tests

**Entry Point** (main.js):
- End-to-end tests only
- Full game flow testing
- Changes here: Complete playtest (all features)

---

## Future Dependency Planning

When adding new systems (Phase 2+), follow these principles:

1. **Data flows downward**: New systems should depend on existing foundation, not vice versa
2. **Use EventBus for cross-system communication**: Avoid tight coupling between business logic systems
3. **Keep GameState as the hub**: All persistent state goes through GameState
4. **Renderers remain pure**: New renderers (UIRenderer, etc.) should never modify state

**Planned Future Dependencies**:
- `ShopSystem.js` → depends on: GameState, EventBus
- `ItemSystem.js` → depends on: GameState, EventBus
- `QuestSystem.js` → depends on: GameState, EventBus
- `SaveSystem.js` → depends on: GameState
- `UIRenderer.js` → depends on: GameState (read-only)

---

## Related Documents

- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture and design patterns
- [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md) - Pre-change analysis checklist
- [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) - Quick reference before making changes
- [CHANGE_PROTOCOL.md](CHANGE_PROTOCOL.md) - Change management workflow

---

**Last Updated**: 2025-12-30
**Next Review**: When adding new systems (Phase 2)
