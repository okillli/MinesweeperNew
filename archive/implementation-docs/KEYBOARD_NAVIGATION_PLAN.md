# Keyboard Navigation Implementation Plan

> **Status**: Ready for Implementation
> **Created**: 2025-12-30
> **Related Files**: [src/main.js](src/main.js), [src/rendering/CanvasRenderer.js](src/rendering/CanvasRenderer.js), [src/core/GameState.js](src/core/GameState.js)

## Executive Summary

This plan details the implementation of comprehensive keyboard navigation and enhanced touch controls for MineQuest, making the game fully accessible on desktop (keyboard + mouse) and mobile/tablet (touch-only) devices.

**Key Goals:**
1. Full keyboard navigation with arrow keys and action keys
2. WCAG 2.1 Level AA accessibility compliance
3. Seamless switching between input modes (mouse/keyboard/touch)
4. Enhanced touch gestures for mobile devices
5. Zero breaking changes to existing functionality

---

## Research Findings Summary

### Best Practices Identified

**Keyboard Controls (Industry Standard):**
- Arrow keys for grid navigation (universal standard)
- Space/Enter for primary action (reveal)
- F or R for secondary action (flag)
- Shift+Space for chord action
- Escape for pause/menu
- F2/R for restart

**Accessibility Requirements (WCAG 2.1):**
- All functionality must be keyboard accessible (2.1.1)
- No keyboard traps (2.1.2)
- Minimum 3:1 contrast ratio for focus indicators (1.4.11)
- Focus indicator must be visible (2.4.7)
- Use `:focus-visible` to show focus only for keyboard users

**Touch Best Practices:**
- 500ms threshold for long-press (already implemented ✓)
- 10px movement tolerance (already implemented ✓)
- 44x44px minimum touch targets (already implemented ✓)
- Haptic feedback on flag (50ms vibration)
- Prevent context menu on long-press (already implemented ✓)

**Visual Feedback:**
- Keyboard cursor should be visually distinct from mouse hover
- Recommended: 3-4px outline with high contrast color (#0066cc, #FFD700)
- Smooth transitions (150ms) for cursor movement
- Optional: Subtle pulse animation for better visibility

---

## Current Architecture Analysis

### Existing Input System

**Mouse Input** ([src/main.js](src/main.js) lines 310-494):
- Left click: Reveal or chord
- Right click: Toggle flag
- Coordinate conversion via `canvasToGrid()` function

**Touch Input** ([src/main.js](src/main.js) lines 496-816):
- Tap (< 500ms): Reveal or chord
- Long-press (≥ 500ms): Toggle flag
- Movement threshold: 10px
- Double-fire prevention: 300ms cooldown

**Grid System** ([src/entities/Grid.js](src/entities/Grid.js)):
- `revealCell(x, y)` - Reveals cell, auto-cascades zeros
- `toggleFlag(x, y)` - Toggles flag on cell
- `chord(x, y)` - Auto-reveals neighbors if flags match mine count
- `isValid(x, y)` - Bounds checking

**Rendering** ([src/rendering/CanvasRenderer.js](src/rendering/CanvasRenderer.js)):
- Grid centered on canvas
- Cell size: 44x44px
- Padding: 2px between cells
- Offset calculated for centering

**Current Gap:**
- ❌ No keyboard navigation
- ❌ No visual cursor for keyboard users
- ❌ No input mode detection/switching

---

## Implementation Plan

### Phase 1: Core Keyboard Navigation (Priority: HIGH)

**Estimated Time:** 2-3 hours
**Files Modified:** [src/main.js](src/main.js), [src/rendering/CanvasRenderer.js](src/rendering/CanvasRenderer.js), [src/core/GameState.js](src/core/GameState.js)

#### 1.1 Add Cursor State to GameState

**File:** [src/core/GameState.js](src/core/GameState.js)

```javascript
// Add to state structure
this.cursor = {
  x: 0,           // Current grid column
  y: 0,           // Current grid row
  visible: false  // Show cursor highlight (true when using keyboard)
};
```

**Methods to add:**
```javascript
moveCursor(dx, dy) {
  if (!this.grid) return;

  this.cursor.x = Math.max(0, Math.min(this.grid.width - 1, this.cursor.x + dx));
  this.cursor.y = Math.max(0, Math.min(this.grid.height - 1, this.cursor.y + dy));
  this.cursor.visible = true;
}

centerCursor() {
  if (!this.grid) return;

  this.cursor.x = Math.floor(this.grid.width / 2);
  this.cursor.y = Math.floor(this.grid.height / 2);
  this.cursor.visible = false; // Hidden until keyboard input
}

hideCursor() {
  this.cursor.visible = false;
}

getCursorCell() {
  if (!this.grid) return null;
  return this.grid.getCell(this.cursor.x, this.cursor.y);
}
```

**Integration Points:**
- Call `centerCursor()` when creating new grid (in `createGrid()` method)
- Call `hideCursor()` on mouse/touch input

---

#### 1.2 Add Keyboard Event Handler

**File:** [src/main.js](src/main.js)

**Location:** After line 816 (after touch handlers)

```javascript
/**
 * Keyboard Navigation
 * Handles arrow keys, action keys, and shortcuts
 */

function handleKeyDown(event) {
  // Only handle keyboard input when playing and not game over
  if (state.currentScreen !== 'PLAYING' || state.isGameOver) return;

  const { key, shiftKey, ctrlKey, metaKey } = event;

  // Ignore if modifier keys are held (except Shift for chord)
  if (ctrlKey || metaKey) return;

  let handled = false;

  // Arrow key navigation
  if (key === 'ArrowUp' || key === 'w' || key === 'k') {
    state.moveCursor(0, -1);
    handled = true;
  } else if (key === 'ArrowDown' || key === 's' || key === 'j') {
    state.moveCursor(0, 1);
    handled = true;
  } else if (key === 'ArrowLeft' || key === 'a' || key === 'h') {
    state.moveCursor(-1, 0);
    handled = true;
  } else if (key === 'ArrowRight' || key === 'd' || key === 'l') {
    state.moveCursor(1, 0);
    handled = true;
  }

  // Action keys
  else if (key === ' ' || key === 'Enter') {
    if (shiftKey) {
      // Shift+Space = Chord
      performChordAtCursor();
    } else {
      // Space/Enter = Reveal
      performRevealAtCursor();
    }
    handled = true;
  } else if (key === 'f' || key === 'r' || key === '1') {
    // F/R/1 = Toggle flag
    performFlagAtCursor();
    handled = true;
  } else if (key === 'c') {
    // C = Chord
    performChordAtCursor();
    handled = true;
  }

  // Prevent default browser behavior for handled keys
  if (handled) {
    event.preventDefault();
    state.cursor.visible = true; // Show cursor on keyboard input
  }
}

// Action functions
function performRevealAtCursor() {
  const { x, y } = state.cursor;
  const cell = state.grid.getCell(x, y);

  if (!cell || cell.isRevealed || cell.isFlagged) return;

  const revealed = state.grid.revealCell(x, y);
  if (!revealed) return;

  // Same logic as handleLeftClick
  if (revealed.isMine) {
    state.currentRun.hp = Math.max(0, state.currentRun.hp - 1);
    state.currentRun.stats.minesHit++;
    events.emit('mine_hit', { x, y, hp: state.currentRun.hp });

    if (state.currentRun.hp === 0) {
      state.isGameOver = true;
      events.emit('game_over', { reason: 'death' });
    }
  } else {
    const coinsEarned = Math.floor(10 * state.currentRun.coinMultiplier);
    state.currentRun.coins += coinsEarned;
    state.currentRun.mana = Math.min(
      state.currentRun.maxMana,
      state.currentRun.mana + 5
    );
    state.currentRun.stats.cellsRevealed++;
    events.emit('cell_revealed', { x, y, coinsEarned });
  }

  // Check win condition
  if (state.grid.isComplete()) {
    state.isGameOver = true;
    events.emit('board_complete', { boardIndex: state.currentRun.currentBoard });
  }
}

function performFlagAtCursor() {
  const { x, y } = state.cursor;
  const cell = state.grid.getCell(x, y);

  if (!cell || cell.isRevealed) return;

  const success = state.grid.toggleFlag(x, y);
  if (success) {
    // Haptic feedback (if available)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Mana bonus for correct flag
    if (cell.isFlagged && cell.isMine) {
      state.currentRun.mana = Math.min(
        state.currentRun.maxMana,
        state.currentRun.mana + 10
      );
      events.emit('correct_flag', { x, y });
    }
  }
}

function performChordAtCursor() {
  const { x, y } = state.cursor;
  const cell = state.grid.getCell(x, y);

  if (!cell || !cell.isRevealed || cell.number === 0) return;

  const revealedCells = state.grid.chord(x, y);

  // Same logic as handleLeftClick chord behavior
  for (const revealed of revealedCells) {
    if (revealed.isMine) {
      state.currentRun.hp = Math.max(0, state.currentRun.hp - 1);
      state.currentRun.stats.minesHit++;
      events.emit('mine_hit', {
        x: revealed.x,
        y: revealed.y,
        hp: state.currentRun.hp
      });

      if (state.currentRun.hp === 0) {
        state.isGameOver = true;
        events.emit('game_over', { reason: 'death' });
        break;
      }
    } else {
      const coinsEarned = Math.floor(10 * state.currentRun.coinMultiplier);
      state.currentRun.coins += coinsEarned;
      state.currentRun.mana = Math.min(
        state.currentRun.maxMana,
        state.currentRun.mana + 5
      );
      state.currentRun.stats.cellsRevealed++;
      events.emit('cell_revealed', {
        x: revealed.x,
        y: revealed.y,
        coinsEarned
      });
    }
  }

  // Check win condition
  if (state.grid.isComplete()) {
    state.isGameOver = true;
    events.emit('board_complete', { boardIndex: state.currentRun.currentBoard });
  }
}

// Register keyboard listener
document.addEventListener('keydown', handleKeyDown, { signal: eventController.signal });
```

**Integration with Existing Input:**
- Add `state.hideCursor()` at the start of `handleLeftClick()` (line ~370)
- Add `state.hideCursor()` at the start of `handleTouchStart()` (line ~522)

---

#### 1.3 Render Keyboard Cursor

**File:** [src/rendering/CanvasRenderer.js](src/rendering/CanvasRenderer.js)

**Add new method:**
```javascript
/**
 * Renders keyboard cursor highlight
 * @param {Object} cursor - Cursor state {x, y, visible}
 */
renderCursorHighlight(cursor) {
  if (!cursor.visible || !this.grid) return;

  const { x, y } = cursor;

  // Validate cursor position
  if (x < 0 || x >= this.grid.width || y < 0 || y >= this.grid.height) return;

  const cellSize = 44;
  const padding = 2;

  // Calculate grid centering offset
  const gridWidth = (this.grid.width * cellSize) + ((this.grid.width - 1) * padding);
  const gridHeight = (this.grid.height * cellSize) + ((this.grid.height - 1) * padding);
  const offsetX = (this.canvas.width - gridWidth) / 2;
  const offsetY = (this.canvas.height - gridHeight) / 2;

  // Calculate cell position
  const cellX = offsetX + x * (cellSize + padding);
  const cellY = offsetY + y * (cellSize + padding);

  const ctx = this.ctx;

  // Draw keyboard cursor highlight (gold outline)
  ctx.save();

  // Outer glow (soft shadow)
  ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
  ctx.shadowBlur = 8;

  // Main outline
  ctx.strokeStyle = '#FFD700'; // Gold
  ctx.lineWidth = 3;
  ctx.strokeRect(cellX - 2, cellY - 2, cellSize + 4, cellSize + 4);

  // Inner highlight (subtle)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(cellX, cellY, cellSize, cellSize);

  ctx.restore();
}
```

**Modify `renderGrid()` method:**
```javascript
// Add after line 89 (after rendering all cells)
// Inside renderGrid() method

// Render keyboard cursor if visible
this.renderCursorHighlight(state.cursor);
```

**Update `render()` method call signature:**
```javascript
// Change render method to accept full state
render(state) {
  if (!this.grid) return;

  this.clear();
  this.renderGrid(state); // Pass full state instead of just grid
}
```

**Update all `render()` calls in main.js:**
```javascript
// Change from:
renderer.render();

// To:
renderer.render(state);
```

---

#### 1.4 Initialize Cursor on Game Start

**File:** [src/main.js](src/main.js)

**Location:** In `showScreen()` function when transitioning to game screen

```javascript
// Add after line ~180 (when creating new grid)
if (screen === 'game-screen') {
  // ... existing grid creation code ...

  // Center keyboard cursor on new grid
  state.centerCursor();
}
```

---

### Phase 2: Enhanced Controls & Polish (Priority: MEDIUM)

**Estimated Time:** 1-2 hours
**Files Modified:** [src/main.js](src/main.js), [index.html](index.html)

#### 2.1 Additional Keyboard Shortcuts

Add to `handleKeyDown()` in [src/main.js](src/main.js):

```javascript
// Game control shortcuts
else if (key === 'Escape') {
  // Pause game / return to menu
  if (state.currentScreen === 'PLAYING') {
    // TODO: Implement pause screen
    // For now, hide cursor
    state.hideCursor();
    handled = true;
  }
} else if (key === 'F2' || (key === 'r' && ctrlKey)) {
  // Restart current board
  if (state.currentScreen === 'PLAYING') {
    // TODO: Add restart confirmation
    // Reset grid with same config
    handled = true;
  }
} else if (key === '?' || (key === '/' && shiftKey)) {
  // Show keyboard shortcuts help
  showKeyboardHelp();
  handled = true;
}
```

#### 2.2 Keyboard Shortcuts Help Screen

**File:** [index.html](index.html)

Add modal overlay after game container:

```html
<!-- Keyboard Help Modal -->
<div id="keyboard-help-modal" class="modal hidden">
  <div class="modal-content">
    <button class="modal-close" aria-label="Close">&times;</button>
    <h2>Keyboard Shortcuts</h2>

    <div class="shortcuts-grid">
      <div class="shortcut-section">
        <h3>Navigation</h3>
        <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> <span>Move cursor</span>
        <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> <span>Move cursor (alt)</span>
        <kbd>H</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd> <span>Move cursor (vim)</span>
      </div>

      <div class="shortcut-section">
        <h3>Actions</h3>
        <kbd>Space</kbd> or <kbd>Enter</kbd> <span>Reveal cell</span>
        <kbd>F</kbd> or <kbd>R</kbd> <span>Toggle flag</span>
        <kbd>Shift</kbd>+<kbd>Space</kbd> <span>Chord (auto-reveal)</span>
        <kbd>C</kbd> <span>Chord (auto-reveal)</span>
      </div>

      <div class="shortcut-section">
        <h3>Game Controls</h3>
        <kbd>Esc</kbd> <span>Pause / Menu</span>
        <kbd>F2</kbd> <span>Restart board</span>
        <kbd>?</kbd> <span>Show this help</span>
      </div>
    </div>

    <p class="help-note">
      Tip: You can switch between mouse, keyboard, and touch at any time!
    </p>
  </div>
</div>
```

**CSS for modal (add to styles.css):**

```css
/* Keyboard Help Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal.hidden {
  display: none;
}

.modal-content {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #ccc;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  line-height: 1;
}

.modal-close:hover {
  color: #fff;
}

.shortcuts-grid {
  display: grid;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.shortcut-section h3 {
  margin: 0 0 0.75rem 0;
  color: #FFD700;
  font-size: 1.1rem;
}

.shortcut-section > div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

kbd {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #3a3a3a;
  border: 1px solid #555;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.help-note {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 215, 0, 0.1);
  border-left: 3px solid #FFD700;
  font-size: 0.9rem;
  color: #ccc;
}

@media (max-width: 600px) {
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}
```

**JavaScript functions (add to main.js):**

```javascript
function showKeyboardHelp() {
  const modal = document.getElementById('keyboard-help-modal');
  if (!modal) return;

  modal.classList.remove('hidden');

  // Close on click outside or close button
  const closeBtn = modal.querySelector('.modal-close');
  const closeModal = () => modal.classList.add('hidden');

  closeBtn.addEventListener('click', closeModal, { once: true });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  }, { once: true });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  }, { once: true, signal: eventController.signal });
}
```

---

#### 2.3 Cursor Movement Animation

**File:** [src/rendering/CanvasRenderer.js](src/rendering/CanvasRenderer.js)

Enhance `renderCursorHighlight()` with smooth pulse animation:

```javascript
renderCursorHighlight(cursor) {
  if (!cursor.visible || !this.grid) return;

  // ... existing position calculation ...

  const ctx = this.ctx;

  // Animated pulse effect
  const time = Date.now() / 1000;
  const pulse = Math.sin(time * 3) * 0.3 + 0.7; // Range: 0.4 to 1.0

  ctx.save();

  // Outer glow (pulsing)
  ctx.shadowColor = `rgba(255, 215, 0, ${0.6 * pulse})`;
  ctx.shadowBlur = 8;

  // Main outline (pulsing width)
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2 + pulse;
  ctx.strokeRect(cellX - 2, cellY - 2, cellSize + 4, cellSize + 4);

  // Inner highlight
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * pulse})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(cellX, cellY, cellSize, cellSize);

  ctx.restore();
}
```

---

### Phase 3: Accessibility & Screen Readers (Priority: LOW)

**Estimated Time:** 2-4 hours
**Files Modified:** [index.html](index.html), [src/main.js](src/main.js), [src/rendering/CanvasRenderer.js](src/rendering/CanvasRenderer.js)

#### 3.1 ARIA Labels & Live Regions

**File:** [index.html](index.html)

```html
<!-- Update canvas element -->
<canvas
  id="game-canvas"
  tabindex="0"
  role="application"
  aria-label="Minesweeper game grid"
  aria-describedby="game-instructions"
></canvas>

<!-- Hidden instructions for screen readers -->
<div id="game-instructions" class="sr-only">
  Use arrow keys to navigate the grid.
  Press Space or Enter to reveal a cell.
  Press F to flag a cell.
  Press Shift+Space to chord (auto-reveal neighbors).
</div>

<!-- Live region for game events -->
<div id="game-announcements" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
```

**CSS for screen reader only text:**

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

#### 3.2 Screen Reader Announcements

**File:** [src/main.js](src/main.js)

```javascript
/**
 * Announces game events to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
  const announcer = document.getElementById('game-announcements');
  if (!announcer) return;

  announcer.textContent = message;

  // Clear after 1 second to allow re-announcing same message
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}
```

**Add announcements to key events:**

```javascript
// In performRevealAtCursor()
if (revealed.isMine) {
  announceToScreenReader(`Mine hit! ${state.currentRun.hp} HP remaining.`);
} else {
  const cellDesc = revealed.number > 0
    ? `${revealed.number} adjacent mine${revealed.number > 1 ? 's' : ''}`
    : 'Safe cell';
  announceToScreenReader(`Revealed: ${cellDesc}. ${state.currentRun.coins} coins.`);
}

// In performFlagAtCursor()
const flagStatus = cell.isFlagged ? 'Flagged' : 'Unflagged';
announceToScreenReader(`${flagStatus} cell at row ${y + 1}, column ${x + 1}.`);

// In performChordAtCursor()
announceToScreenReader(`Chorded ${revealedCells.length} cells.`);

// On cursor movement
state.moveCursor = function(dx, dy) {
  // ... existing code ...

  const cell = this.getCursorCell();
  if (cell && cell.isRevealed) {
    const cellDesc = cell.number > 0
      ? `${cell.number} adjacent mine${cell.number > 1 ? 's' : ''}`
      : 'Safe cell';
    announceToScreenReader(`${cellDesc} at row ${this.cursor.y + 1}, column ${this.cursor.x + 1}.`);
  } else if (cell) {
    const status = cell.isFlagged ? 'Flagged' : 'Unrevealed';
    announceToScreenReader(`${status} cell at row ${this.cursor.y + 1}, column ${this.cursor.x + 1}.`);
  }
};
```

---

#### 3.3 Focus Management

**File:** [src/main.js](src/main.js)

```javascript
// Auto-focus canvas when game starts
function showScreen(screen) {
  // ... existing code ...

  if (screen === 'game-screen') {
    // Focus canvas for keyboard input
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      // Delay to allow DOM update
      setTimeout(() => canvas.focus(), 100);
    }
  }
}

// Maintain focus during gameplay
canvas.addEventListener('blur', () => {
  if (state.currentScreen === 'PLAYING') {
    // Re-focus if user clicks outside canvas
    setTimeout(() => {
      if (state.currentScreen === 'PLAYING') {
        canvas.focus();
      }
    }, 50);
  }
});
```

---

### Phase 4: Enhanced Touch Controls (Priority: MEDIUM)

**Estimated Time:** 1-2 hours
**Files Modified:** [src/main.js](src/main.js)

#### 4.1 Touch Gesture Enhancements

**Already Implemented (Verify):**
- ✓ Tap to reveal (< 500ms)
- ✓ Long-press to flag (≥ 500ms)
- ✓ Movement threshold (10px)
- ✓ Haptic feedback on flag

**Add: Double-tap to Chord (Optional Enhancement):**

```javascript
// Add state tracking
let lastTapTime = 0;
let lastTapPos = null;

function handleTouchEnd(event) {
  // ... existing code ...

  const now = Date.now();
  const timeSinceLastTap = now - lastTapTime;
  const samePosition = lastTapPos &&
    Math.abs(x - lastTapPos.x) < 5 &&
    Math.abs(y - lastTapPos.y) < 5;

  // Double-tap detection (within 300ms)
  if (timeSinceLastTap < 300 && samePosition) {
    // Perform chord instead of reveal
    const revealedCells = state.grid.chord(x, y);
    // ... handle chord results ...

    // Reset double-tap tracking
    lastTapTime = 0;
    lastTapPos = null;
    return;
  }

  // Single tap - reveal
  // ... existing reveal logic ...

  // Update double-tap tracking
  lastTapTime = now;
  lastTapPos = { x, y };
}
```

**Add: Visual Feedback for Long-Press Progress:**

```javascript
let longPressProgressInterval = null;

function handleTouchStart(event) {
  // ... existing code ...

  // Visual progress indicator
  longPressProgressInterval = setInterval(() => {
    const elapsed = Date.now() - touchStartTime;
    const progress = Math.min(1, elapsed / 500);

    // Draw progress ring around cell
    renderLongPressProgress(gridPos.x, gridPos.y, progress);
  }, 16); // ~60fps

  longPressTimer = setTimeout(() => {
    // ... existing flag logic ...

    // Clear progress indicator
    clearInterval(longPressProgressInterval);
  }, 500);
}

function handleTouchEnd(event) {
  // ... existing code ...

  // Clear progress indicator
  if (longPressProgressInterval) {
    clearInterval(longPressProgressInterval);
    longPressProgressInterval = null;
  }
}
```

**Rendering function:**

```javascript
// Add to CanvasRenderer.js
renderLongPressProgress(x, y, progress) {
  // ... calculate cell position ...

  const ctx = this.ctx;
  const centerX = cellX + cellSize / 2;
  const centerY = cellY + cellSize / 2;
  const radius = cellSize / 2 - 4;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    radius,
    -Math.PI / 2,
    -Math.PI / 2 + (Math.PI * 2 * progress)
  );
  ctx.stroke();
  ctx.restore();
}
```

---

### Phase 5: Settings & Customization (Priority: LOW)

**Estimated Time:** 2-3 hours
**Files Modified:** [src/main.js](src/main.js), [index.html](index.html), [src/systems/SaveSystem.js](src/systems/SaveSystem.js)

#### 5.1 Customizable Keybindings

**Add settings structure:**

```javascript
// In SaveSystem.js or GameState.js
const defaultSettings = {
  keybindings: {
    moveUp: ['ArrowUp', 'w', 'k'],
    moveDown: ['ArrowDown', 's', 'j'],
    moveLeft: ['ArrowLeft', 'a', 'h'],
    moveRight: ['ArrowRight', 'd', 'l'],
    reveal: [' ', 'Enter'],
    flag: ['f', 'r'],
    chord: ['c', 'Shift+ ']
  },
  accessibility: {
    screenReaderAnnouncements: true,
    cursorPulseAnimation: true,
    hapticFeedback: true
  },
  touch: {
    longPressDuration: 500,
    doubleTapChord: true,
    showLongPressProgress: true
  }
};
```

**Settings UI:**

```html
<!-- Settings Modal -->
<div id="settings-modal" class="modal hidden">
  <div class="modal-content">
    <h2>Settings</h2>

    <section>
      <h3>Keyboard Controls</h3>
      <!-- Keybinding customization UI -->
    </section>

    <section>
      <h3>Accessibility</h3>
      <label>
        <input type="checkbox" id="setting-screen-reader" checked>
        Screen reader announcements
      </label>
      <label>
        <input type="checkbox" id="setting-cursor-pulse" checked>
        Cursor pulse animation
      </label>
    </section>

    <section>
      <h3>Touch Controls</h3>
      <label>
        <input type="checkbox" id="setting-double-tap-chord" checked>
        Double-tap to chord
      </label>
      <label>
        <input type="checkbox" id="setting-long-press-visual" checked>
        Show long-press progress
      </label>
      <label>
        Long-press duration:
        <input type="range" id="setting-long-press-time" min="300" max="800" step="50" value="500">
        <span id="long-press-value">500ms</span>
      </label>
    </section>

    <button id="save-settings">Save Settings</button>
  </div>
</div>
```

---

## Testing Plan

### Manual Testing Checklist

**Keyboard Navigation:**
- [ ] Arrow keys move cursor in all 4 directions
- [ ] Cursor stops at grid boundaries
- [ ] Space/Enter reveals cell at cursor
- [ ] F/R toggles flag at cursor
- [ ] Shift+Space performs chord at cursor
- [ ] Cursor is visible when using keyboard
- [ ] Cursor hides when using mouse/touch
- [ ] Cursor centered when game starts
- [ ] WASD keys work for movement
- [ ] HJKL (vim) keys work for movement

**Visual Feedback:**
- [ ] Keyboard cursor is clearly visible (gold outline)
- [ ] Cursor has 3:1 contrast ratio against all backgrounds
- [ ] Cursor pulse animation is smooth (if enabled)
- [ ] No visual glitches when switching input modes
- [ ] Cursor doesn't overlap important cell information

**Accessibility:**
- [ ] Canvas receives focus on game start
- [ ] Tab key navigates UI elements (not grid cells)
- [ ] Screen reader announces cursor position
- [ ] Screen reader announces cell reveals
- [ ] Screen reader announces mine hits
- [ ] ARIA labels are present and correct
- [ ] Keyboard shortcuts help accessible via ?

**Touch Controls:**
- [ ] Tap reveals cell (< 500ms)
- [ ] Long-press flags cell (≥ 500ms)
- [ ] Haptic feedback on flag (mobile devices)
- [ ] Movement tolerance prevents accidental actions
- [ ] Double-tap chord works (if enabled)
- [ ] Long-press progress visual shows (if enabled)
- [ ] Context menu doesn't appear on long-press

**Cross-Input Compatibility:**
- [ ] Can switch from mouse to keyboard seamlessly
- [ ] Can switch from keyboard to touch seamlessly
- [ ] No double-firing of actions
- [ ] No conflicts between input methods
- [ ] Game state remains consistent across input changes

**Edge Cases:**
- [ ] Cursor on edge cells handles movement correctly
- [ ] Revealing mine with keyboard works correctly
- [ ] Chord with keyboard matches mouse behavior
- [ ] Game over state disables keyboard input
- [ ] Menu screens ignore gameplay keyboard shortcuts
- [ ] Keyboard shortcuts don't trigger browser defaults

### Device Testing

**Desktop:**
- [ ] Chrome (Windows/Mac/Linux)
- [ ] Firefox (Windows/Mac/Linux)
- [ ] Safari (Mac)
- [ ] Edge (Windows)

**Mobile:**
- [ ] iOS Safari (iPhone/iPad)
- [ ] Android Chrome
- [ ] Android Firefox

**Screen Readers:**
- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (Mac/iOS)
- [ ] TalkBack (Android)

---

## Performance Considerations

### Optimization Strategies

1. **Cursor Rendering:**
   - Only re-render cursor when position changes (not every frame)
   - Consider using separate canvas layer for cursor (advanced)
   - Limit pulse animation calculations

2. **Event Handling:**
   - Debounce rapid key presses (prevent cursor movement spam)
   - Use passive event listeners where applicable
   - Clean up event listeners properly with AbortController

3. **Screen Reader Announcements:**
   - Debounce announcements to prevent spam
   - Use `aria-live="polite"` (not "assertive") to avoid interruptions
   - Clear announcement region after delay

4. **Touch Gesture Detection:**
   - Minimize calculations in touchmove handler
   - Use requestAnimationFrame for visual feedback
   - Cancel timers/intervals properly on touchend/touchcancel

---

## Implementation Priority

### Phase 1 (MUST HAVE - Core Functionality)
- ✅ Cursor state in GameState
- ✅ Arrow key navigation
- ✅ Space/Enter to reveal
- ✅ F/R to flag
- ✅ Visual cursor highlight
- ✅ Hide cursor on mouse/touch input
- ✅ Show cursor on keyboard input

### Phase 2 (SHOULD HAVE - Enhanced UX)
- ✅ Shift+Space for chord
- ✅ WASD and HJKL alternative keys
- ✅ Keyboard shortcuts help modal
- ✅ Cursor pulse animation
- ✅ Escape to menu/pause
- ✅ F2 to restart

### Phase 3 (NICE TO HAVE - Accessibility)
- ⚠️ ARIA labels and roles
- ⚠️ Screen reader announcements
- ⚠️ Focus management
- ⚠️ :focus-visible CSS

### Phase 4 (NICE TO HAVE - Touch Enhancements)
- ⚠️ Double-tap to chord
- ⚠️ Long-press progress visual
- ⚠️ Improved haptic feedback

### Phase 5 (OPTIONAL - Customization)
- ❌ Customizable keybindings
- ❌ Settings UI
- ❌ Save preferences to localStorage

---

## Breaking Changes & Compatibility

**No Breaking Changes Expected:**
- All changes are additive (new features)
- Existing mouse/touch input remains unchanged
- State structure extensions are backward compatible

**Compatibility Notes:**
- Minimum browser support: ES6+ (already required)
- Touch events: All modern mobile browsers
- Haptic feedback: Only supported on some mobile devices (graceful degradation)
- Screen readers: WCAG 2.1 Level AA compliance

---

## Documentation Updates Needed

**Files to Update:**
1. **README.md** - Add keyboard controls section
2. **GAME_DESIGN.md** - Document input methods
3. **ARCHITECTURE.md** - Document cursor state and input flow
4. **QUICK_REFERENCE.md** - Add keyboard shortcuts reference
5. **SESSION_SUMMARY.md** - Update file ownership

**New Documentation:**
1. **ACCESSIBILITY.md** (optional) - Comprehensive accessibility guide
2. **CONTROLS.md** (optional) - Detailed control schemes for all platforms

---

## Success Criteria

### Functional Requirements
- ✅ All grid cells accessible via keyboard
- ✅ All game actions performable via keyboard
- ✅ Visual feedback for keyboard cursor
- ✅ Seamless input mode switching
- ✅ No keyboard traps

### Accessibility Requirements
- ✅ WCAG 2.1 Level AA compliance
- ✅ 3:1 contrast ratio for cursor
- ✅ Screen reader compatibility (Phase 3)
- ✅ Full keyboard accessibility

### UX Requirements
- ✅ Intuitive keyboard controls
- ✅ Discoverable shortcuts (help screen)
- ✅ Smooth cursor animation
- ✅ No lag or performance issues

---

## Next Steps

1. **Review & Approve Plan** - User feedback on proposed implementation
2. **Phase 1 Implementation** - Core keyboard navigation (2-3 hours)
3. **Testing** - Manual testing on desktop browsers
4. **Phase 2 Implementation** - Enhanced controls & polish (1-2 hours)
5. **Cross-Device Testing** - Mobile, tablet, screen readers
6. **Documentation** - Update all relevant docs
7. **Optional Phases** - Implement Phases 3-5 based on user feedback

---

## Open Questions for User

1. **Cursor Visual Style:**
   - Prefer gold (#FFD700) outline or different color?
   - Should cursor pulse/animate or remain static?

2. **Alternative Keys:**
   - Enable WASD and HJKL (vim) keys by default, or keyboard shortcuts only?

3. **Screen Reader Priority:**
   - Implement Phase 3 (accessibility) immediately or defer?

4. **Touch Enhancements:**
   - Want double-tap to chord feature?
   - Want visual long-press progress indicator?

5. **Settings Customization:**
   - Need customizable keybindings, or are defaults sufficient?

---

**Document Status:** Ready for Implementation
**Last Updated:** 2025-12-30
