# Implementation Plan: Phase 2 - Resource Systems

**Date**: 2025-12-30
**Author**: Claude Code
**Status**: Ready for Implementation
**Related**: [ANALYSIS_phase2-resources.md](ANALYSIS_phase2-resources.md)

---

## 1. Overview

### Objective
Implement the core resource systems (HP, Coins, Mana) to enable the roguelike gameplay loop with:
- HP tracking (3 HP, -1 per mine, game over at 0)
- Coin generation (+10 per safe cell revealed)
- Mana system (+5 per cell revealed, +10 per flag placed)
- Reactive HUD updates showing real-time resource values

### Success Criteria
- [ ] HP starts at 3, decreases on mine hit, game over at 0
- [ ] Coins start at 0, +10 per safe cell revealed
- [ ] Mana starts at 0, +5 per cell revealed, +10 per flag placed
- [ ] HUD updates immediately on resource changes
- [ ] Game continues after mine hit (until HP reaches 0)
- [ ] Manual testing confirms all behaviors work correctly

### Estimated Time
- Implementation: 1-2 hours
- Testing: 30 minutes
- Total: 1.5-2.5 hours

---

## 2. Technical Approach

### Pattern
**Direct Event-Based Updates**: Update resources immediately when game events occur (cell reveal, mine hit, flag placement), then call `updateHUD()` to reflect changes.

**Why This Approach?**
- Simple and predictable
- Easy to debug (clear cause-effect relationship)
- Minimal code changes required
- Follows existing codebase patterns

**Alternative Considered**: Observer pattern with EventBus
- Rejected: Too complex for current needs, EventBus not fully integrated yet
- Decision: Defer to Phase 4 when more systems need event coordination

---

## 3. File-by-File Changes

### File 1: `src/main.js`

**Purpose**: Add resource tracking logic to existing event handlers

#### Change 1.1: Update `handleLeftClick()` for cell reveals
**Location**: Lines 503-531 (revealCell logic for unrevealed cells)

**Current Code**:
```javascript
const revealedCell = grid.revealCell(x, y);

if (revealedCell) {
  console.log(`Revealed cell at (${x}, ${y}) - Mine: ${revealedCell.isMine}, Number: ${revealedCell.number}`);

  // Update cells revealed stat (revealCell may cascade, so count all revealed)
  const cellsRevealedBefore = grid.revealed;
  game.state.currentRun.stats.cellsRevealed = cellsRevealedBefore;

  // Check if we hit a mine (game over condition)
  if (revealedCell.isMine) {
    console.log('Hit a mine! Game Over.');
    game.state.currentRun.stats.minesHit++;
    handleGameOver();
    return;
  }

  // Check win condition (all non-mine cells revealed)
  if (grid.isComplete()) {
    console.log('Congratulations! You won!');
    // TODO: In full game, this would:
    // - Award coins/mana based on cells revealed
    // - Transition to shop or next board
    // - Update quest progress
    // For MVP, we just log it
  }
}
```

**New Code**:
```javascript
// Track revealed cells BEFORE revealing (for coin calculation)
const revealedBefore = grid.revealed;
const revealedCell = grid.revealCell(x, y);

if (revealedCell) {
  // Calculate how many cells were revealed (including cascade)
  const revealedAfter = grid.revealed;
  const cellsRevealed = revealedAfter - revealedBefore;

  console.log(`Revealed ${cellsRevealed} cell(s) at (${x}, ${y}) - Mine: ${revealedCell.isMine}, Number: ${revealedCell.number}`);

  // Update cells revealed stat
  game.state.currentRun.stats.cellsRevealed = revealedAfter;

  // Check if we hit a mine (HP damage, not instant game over)
  if (revealedCell.isMine) {
    console.log('Hit a mine! Taking 1 HP damage.');

    // Take damage and check if still alive
    const isAlive = game.state.takeDamage(1);

    // Update HUD to show new HP
    updateHUD();

    if (!isAlive) {
      // HP reached 0, trigger game over
      console.log('HP reached 0. Game Over.');
      handleGameOver();
      return;
    } else {
      // Still alive, continue playing
      console.log(`HP remaining: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);
      return; // Don't award resources for hitting a mine
    }
  }

  // Safe cell(s) revealed - award coins and mana
  // +10 coins per cell (including cascade)
  const coinsEarned = cellsRevealed * 10;
  game.state.addCoins(coinsEarned);
  console.log(`+${coinsEarned} coins (${cellsRevealed} cells revealed)`);

  // +5 mana per cell (including cascade)
  const manaEarned = cellsRevealed * 5;
  game.state.addMana(manaEarned);
  console.log(`+${manaEarned} mana`);

  // Update HUD to show new values
  updateHUD();

  // Check win condition (all non-mine cells revealed)
  if (grid.isComplete()) {
    console.log('Congratulations! Board complete!');
    // TODO: In full game, this would transition to shop or next board
    // For now, just log it
  }
}
```

**Why**:
- Adds HP damage system (not instant death)
- Awards coins and mana for safe reveals
- Counts cascade reveals correctly
- Updates HUD immediately after resource changes

---

#### Change 1.2: Update `handleLeftClick()` for chording
**Location**: Lines 477-500 (chord logic for revealed cells)

**Current Code**:
```javascript
if (cell.isRevealed) {
  const chordedCells = grid.chord(x, y);

  if (chordedCells.length > 0) {
    console.log(`Chorded ${chordedCells.length} cells at (${x}, ${y})`);

    // Update cells revealed stat
    game.state.currentRun.stats.cellsRevealed += chordedCells.length;

    // Check if any chorded cells were mines (game over condition)
    const hitMine = chordedCells.some(c => c.isMine);
    if (hitMine) {
      console.log('Hit a mine while chording! Game Over.');
      game.state.currentRun.stats.minesHit++;
      handleGameOver();
      return;
    }

    // Check win condition
    if (grid.isComplete()) {
      console.log('Congratulations! You won!');
      // TODO: Implement proper victory flow
    }
  }
}
```

**New Code**:
```javascript
if (cell.isRevealed) {
  const chordedCells = grid.chord(x, y);

  if (chordedCells.length > 0) {
    console.log(`Chorded ${chordedCells.length} cells at (${x}, ${y})`);

    // Update cells revealed stat
    game.state.currentRun.stats.cellsRevealed += chordedCells.length;

    // Count how many mines were hit while chording
    const minesHit = chordedCells.filter(c => c.isMine).length;

    if (minesHit > 0) {
      console.log(`Hit ${minesHit} mine(s) while chording! Taking ${minesHit} HP damage.`);

      // Take damage for each mine hit
      const isAlive = game.state.takeDamage(minesHit);

      // Update HUD to show new HP
      updateHUD();

      if (!isAlive) {
        // HP reached 0, trigger game over
        console.log('HP reached 0. Game Over.');
        handleGameOver();
        return;
      } else {
        // Still alive, continue playing
        console.log(`HP remaining: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);
        return; // Don't award resources for hitting mines
      }
    }

    // All chorded cells were safe - award coins and mana
    const safeCells = chordedCells.length;

    // +10 coins per cell
    const coinsEarned = safeCells * 10;
    game.state.addCoins(coinsEarned);
    console.log(`+${coinsEarned} coins (${safeCells} cells chorded)`);

    // +5 mana per cell
    const manaEarned = safeCells * 5;
    game.state.addMana(manaEarned);
    console.log(`+${manaEarned} mana`);

    // Update HUD to show new values
    updateHUD();

    // Check win condition
    if (grid.isComplete()) {
      console.log('Congratulations! Board complete!');
      // TODO: Implement proper victory flow
    }
  }
}
```

**Why**:
- Handles multiple mines hit during chording (take damage for each)
- Awards coins/mana only for safe cells
- Updates HUD after resource changes

---

#### Change 1.3: Update `handleRightClick()` for flag placement
**Location**: Lines 569-575 (flag toggle logic)

**Current Code**:
```javascript
// Toggle flag on the cell
const success = grid.toggleFlag(x, y);

if (success) {
  const cell = grid.getCell(x, y);
  console.log(`${cell.isFlagged ? 'Flagged' : 'Unflagged'} cell at (${x}, ${y})`);
  console.log(`Total flags: ${grid.flagged}/${grid.mineCount}`);
}
```

**New Code**:
```javascript
// Get cell state before toggling
const cell = grid.getCell(x, y);
const wasFlagged = cell.isFlagged;

// Toggle flag on the cell
const success = grid.toggleFlag(x, y);

if (success) {
  const isFlagged = cell.isFlagged;
  console.log(`${isFlagged ? 'Flagged' : 'Unflagged'} cell at (${x}, ${y})`);
  console.log(`Total flags: ${grid.flagged}/${grid.mineCount}`);

  // Award mana only when PLACING a flag (not removing)
  if (isFlagged && !wasFlagged) {
    game.state.addMana(10);
    console.log('+10 mana (flag placed)');

    // Update HUD to show new mana
    updateHUD();
  }
}
```

**Why**:
- Awards +10 mana only when placing a flag (not removing)
- No check for correct flag (we don't know until cell is revealed)
- Updates HUD after mana change

---

#### Change 1.4: Update `handleTouchEnd()` for touch reveal (lines 813-836)

**Apply the same changes as handleLeftClick() for unrevealed cells**:
- Track revealed cells before/after
- Take HP damage on mine hit (not instant game over)
- Award coins/mana for safe reveals
- Update HUD

**Current Code Snippet**:
```javascript
const revealedCell = grid.revealCell(x, y);

if (revealedCell) {
  console.log(`Revealed cell at (${x}, ${y}) via tap - Mine: ${revealedCell.isMine}, Number: ${revealedCell.number}`);

  // Update cells revealed stat
  game.state.currentRun.stats.cellsRevealed = grid.revealed;

  // Check if we hit a mine (game over condition)
  if (revealedCell.isMine) {
    console.log('Hit a mine! Game Over.');
    game.state.currentRun.stats.minesHit++;
    handleGameOver();
    touchStartPos = null;
    return;
  }
```

**New Code Snippet**:
```javascript
// Track revealed cells BEFORE revealing (for coin calculation)
const revealedBefore = grid.revealed;
const revealedCell = grid.revealCell(x, y);

if (revealedCell) {
  // Calculate how many cells were revealed (including cascade)
  const revealedAfter = grid.revealed;
  const cellsRevealed = revealedAfter - revealedBefore;

  console.log(`Revealed ${cellsRevealed} cell(s) at (${x}, ${y}) via tap - Mine: ${revealedCell.isMine}, Number: ${revealedCell.number}`);

  // Update cells revealed stat
  game.state.currentRun.stats.cellsRevealed = revealedAfter;

  // Check if we hit a mine (HP damage, not instant game over)
  if (revealedCell.isMine) {
    console.log('Hit a mine! Taking 1 HP damage.');

    // Take damage and check if still alive
    const isAlive = game.state.takeDamage(1);

    // Update HUD to show new HP
    updateHUD();

    if (!isAlive) {
      // HP reached 0, trigger game over
      console.log('HP reached 0. Game Over.');
      handleGameOver();
      touchStartPos = null;
      return;
    } else {
      // Still alive, continue playing
      console.log(`HP remaining: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);
      touchStartPos = null;
      return; // Don't award resources for hitting a mine
    }
  }

  // Safe cell(s) revealed - award coins and mana
  const coinsEarned = cellsRevealed * 10;
  game.state.addCoins(coinsEarned);
  console.log(`+${coinsEarned} coins (${cellsRevealed} cells revealed)`);

  const manaEarned = cellsRevealed * 5;
  game.state.addMana(manaEarned);
  console.log(`+${manaEarned} mana`);

  // Update HUD to show new values
  updateHUD();
```

**Why**: Touch input should behave identically to mouse input for resource tracking.

---

#### Change 1.5: Update `handleTouchEnd()` for touch chording (lines 786-810)

**Apply the same changes as handleLeftClick() for chording**:
- Handle multiple mines hit during chord
- Award coins/mana only for safe cells
- Update HUD

**Current Code Snippet**:
```javascript
if (cell.isRevealed) {
  const chordedCells = grid.chord(x, y);

  if (chordedCells.length > 0) {
    console.log(`Chorded ${chordedCells.length} cells at (${x}, ${y}) via tap`);

    // Update cells revealed stat
    game.state.currentRun.stats.cellsRevealed += chordedCells.length;

    // Check if any chorded cells were mines (game over condition)
    const hitMine = chordedCells.some(c => c.isMine);
    if (hitMine) {
      console.log('Hit a mine while chording! Game Over.');
      game.state.currentRun.stats.minesHit++;
      handleGameOver();
      touchStartPos = null;
      return;
    }
```

**New Code Snippet**:
```javascript
if (cell.isRevealed) {
  const chordedCells = grid.chord(x, y);

  if (chordedCells.length > 0) {
    console.log(`Chorded ${chordedCells.length} cells at (${x}, ${y}) via tap`);

    // Update cells revealed stat
    game.state.currentRun.stats.cellsRevealed += chordedCells.length;

    // Count how many mines were hit while chording
    const minesHit = chordedCells.filter(c => c.isMine).length;

    if (minesHit > 0) {
      console.log(`Hit ${minesHit} mine(s) while chording! Taking ${minesHit} HP damage.`);

      // Take damage for each mine hit
      const isAlive = game.state.takeDamage(minesHit);

      // Update HUD to show new HP
      updateHUD();

      if (!isAlive) {
        // HP reached 0, trigger game over
        console.log('HP reached 0. Game Over.');
        handleGameOver();
        touchStartPos = null;
        return;
      } else {
        // Still alive, continue playing
        console.log(`HP remaining: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);
        touchStartPos = null;
        return; // Don't award resources for hitting mines
      }
    }

    // All chorded cells were safe - award coins and mana
    const safeCells = chordedCells.length;

    const coinsEarned = safeCells * 10;
    game.state.addCoins(coinsEarned);
    console.log(`+${coinsEarned} coins (${safeCells} cells chorded)`);

    const manaEarned = safeCells * 5;
    game.state.addMana(manaEarned);
    console.log(`+${manaEarned} mana`);

    // Update HUD to show new values
    updateHUD();
```

**Why**: Touch chording should behave identically to mouse chording for resource tracking.

---

#### Change 1.6: Update `handleTouchStart()` for flag placement (lines 643-667)

**Apply the same changes as handleRightClick() for flag mana bonus**:

**Current Code Snippet**:
```javascript
longPressTimer = setTimeout(() => {
  // Long-press detected - toggle flag
  const { x, y } = coords;
  const cell = grid.getCell(x, y);

  // Only allow flagging on unrevealed cells
  if (cell && !cell.isRevealed) {
    const success = grid.toggleFlag(x, y);

    if (success) {
      const updatedCell = grid.getCell(x, y);
      console.log(`${updatedCell.isFlagged ? 'Flagged' : 'Unflagged'} cell at (${x}, ${y}) via long-press`);
      console.log(`Total flags: ${grid.flagged}/${grid.mineCount}`);
    }
```

**New Code Snippet**:
```javascript
longPressTimer = setTimeout(() => {
  // Long-press detected - toggle flag
  const { x, y } = coords;
  const cell = grid.getCell(x, y);

  // Only allow flagging on unrevealed cells
  if (cell && !cell.isRevealed) {
    const wasFlagged = cell.isFlagged;
    const success = grid.toggleFlag(x, y);

    if (success) {
      const isFlagged = cell.isFlagged;
      console.log(`${isFlagged ? 'Flagged' : 'Unflagged'} cell at (${x}, ${y}) via long-press`);
      console.log(`Total flags: ${grid.flagged}/${grid.mineCount}`);

      // Award mana only when PLACING a flag (not removing)
      if (isFlagged && !wasFlagged) {
        game.state.addMana(10);
        console.log('+10 mana (flag placed)');

        // Update HUD to show new mana
        updateHUD();
      }
    }
```

**Why**: Touch flag placement should award mana like right-click does.

---

#### Change 1.7: Update keyboard handlers for resource tracking

**Location**: Lines 1038-1138 (keyboard action functions)

**Three functions need updating**: `performRevealAtCursor()`, `performFlagAtCursor()`, `performChordAtCursor()`

**Note**: These functions ALREADY have resource tracking implemented! Lines 1054-1063, 1085-1091, and 1117-1131 already include coin/mana rewards and HUD updates. However, they need HP damage logic updates to match our new system.

**Current Code in `performRevealAtCursor()` (lines 1047-1063)**:
```javascript
// Handle mine hit
if (revealed.isMine) {
  console.log('Hit a mine! Game Over.');
  game.state.currentRun.stats.minesHit++;
  handleGameOver();
  return;
} else {
  // Reward coins and mana for safe reveal
  const coinsEarned = Math.floor(10 * (game.state.currentRun.coinMultiplier || 1.0));
  game.state.currentRun.coins += coinsEarned;
  game.state.currentRun.mana = Math.min(
    game.state.currentRun.maxMana,
    game.state.currentRun.mana + 5
  );
  game.state.currentRun.stats.cellsRevealed++;
  events.emit('cell_revealed', { x, y, coinsEarned });
}
```

**New Code**:
```javascript
// Handle mine hit
if (revealed.isMine) {
  console.log('Hit a mine! Taking 1 HP damage.');

  // Take damage and check if still alive
  const isAlive = game.state.takeDamage(1);

  // Update HUD to show new HP
  updateHUD();

  if (!isAlive) {
    console.log('HP reached 0. Game Over.');
    handleGameOver();
    return;
  } else {
    console.log(`HP remaining: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);
    return; // Don't award resources for hitting a mine
  }
} else {
  // Reward coins and mana for safe reveal
  // Use GameState methods instead of direct manipulation
  game.state.addCoins(10);
  game.state.addMana(5);
  game.state.currentRun.stats.cellsRevealed++;

  // Update HUD to show new values
  updateHUD();
}
```

**Current Code in `performChordAtCursor()` (lines 1106-1131)**:
```javascript
// Check if any chorded cells were mines (game over condition)
const hitMine = revealedCells.some(c => c.isMine);
if (hitMine) {
  console.log('Hit a mine while chording! Game Over.');
  game.state.currentRun.stats.minesHit++;
  handleGameOver();
  return;
}

// Process each revealed cell (all safe at this point)
for (const revealed of revealedCells) {
  if (!revealed.isMine) {
    const coinsEarned = Math.floor(10 * (game.state.currentRun.coinMultiplier || 1.0));
    game.state.currentRun.coins += coinsEarned;
    game.state.currentRun.mana = Math.min(
      game.state.currentRun.maxMana,
      game.state.currentRun.mana + 5
    );
    game.state.currentRun.stats.cellsRevealed++;
    events.emit('cell_revealed', {
      x: revealed.x,
      y: revealed.y,
      coinsEarned
    });
  }
}
```

**New Code**:
```javascript
// Count how many mines were hit while chording
const minesHit = revealedCells.filter(c => c.isMine).length;

if (minesHit > 0) {
  console.log(`Hit ${minesHit} mine(s) while chording! Taking ${minesHit} HP damage.`);

  // Take damage for each mine hit
  const isAlive = game.state.takeDamage(minesHit);

  // Update HUD to show new HP
  updateHUD();

  if (!isAlive) {
    console.log('HP reached 0. Game Over.');
    handleGameOver();
    return;
  } else {
    console.log(`HP remaining: ${game.state.currentRun.hp}/${game.state.currentRun.maxHp}`);
    return; // Don't award resources for hitting mines
  }
}

// Process each revealed cell (all safe at this point)
const safeCells = revealedCells.length;

// Award coins and mana for all safe cells at once
game.state.addCoins(safeCells * 10);
game.state.addMana(safeCells * 5);
game.state.currentRun.stats.cellsRevealed += safeCells;

// Update HUD to show new values
updateHUD();
```

**Note**: `performFlagAtCursor()` already uses `game.state.currentRun.mana` directly (lines 1085-1090). It should also be updated to use `game.state.addMana(10)` and call `updateHUD()` for consistency.

**Current Code in `performFlagAtCursor()` (lines 1076-1091)**:
```javascript
const success = game.state.grid.toggleFlag(x, y);

// Mana bonus for correct flag placement
if (success && cell.isFlagged && cell.isMine) {
  game.state.currentRun.mana = Math.min(
    game.state.currentRun.maxMana,
    game.state.currentRun.mana + 10
  );
  events.emit('correct_flag', { x, y });
}
```

**New Code**:
```javascript
const wasFlagged = cell.isFlagged;
const success = game.state.grid.toggleFlag(x, y);

// Award mana only when PLACING a flag (not removing)
// Note: We award mana for ALL flags, not just correct ones (we don't know until revealed)
if (success && cell.isFlagged && !wasFlagged) {
  game.state.addMana(10);
  console.log('+10 mana (flag placed)');

  // Update HUD to show new mana
  updateHUD();
}
```

**Why**:
- Keyboard controls should behave identically to mouse/touch for resource tracking
- HP damage system instead of instant game over
- Use GameState methods for consistency
- Award mana for ALL flag placements (not just correct ones)

---

### File 2: `src/core/GameState.js`

**Purpose**: Verify resource methods work correctly (no changes needed)

#### Verification Checklist:
- [x] `takeDamage(amount)` exists (line 314) - decrements HP, increments minesHit stat, returns boolean
- [x] `addCoins(amount)` exists (line 291) - increments coins and coinsEarned stat
- [x] `addMana(amount)` exists (line 266) - increments mana, capped at maxMana
- [x] HP starts at 3 (line 45, 143)
- [x] Coins start at 0 (line 49, 146)
- [x] Mana starts at 0 (line 47, 144)
- [x] MaxMana is 100 (line 48, 145)

**Analysis**: All required methods already exist and work correctly. No changes needed.

---

### File 3: `index.html`

**Purpose**: Verify HUD structure supports dynamic updates (no changes needed)

#### Verification Checklist:
- [x] HP display element exists: `#hp-display` (line 21)
- [x] Mana display element exists: `#mana-display` (line 25)
- [x] Coins display element exists: `#coins-display` (line 29)
- [x] Board display element exists: `#board-display` (line 35)
- [x] HUD has `.hidden` class for show/hide (line 17)

**Analysis**: HUD structure is correct. No changes needed.

---

## 4. Testing Strategy

### Manual Test Cases

#### Test Case 1: HP Damage System
**Objective**: Verify HP decreases on mine hit, game over at 0 HP

**Steps**:
1. Start new game
2. Verify HUD shows "HP: 3"
3. Reveal a mine (intentionally click/tap a mine)
4. Verify:
   - Console logs "Hit a mine! Taking 1 HP damage."
   - HUD updates to "HP: 2"
   - Game continues (not game over)
   - Grid is still interactive
5. Hit another mine
6. Verify HUD shows "HP: 1"
7. Hit a third mine
8. Verify:
   - Console logs "HP reached 0. Game Over."
   - Game over screen appears
   - Grid is frozen

**Expected Result**: Game over only when HP reaches 0, not on first mine hit

**Pass Criteria**: All verification points pass

---

#### Test Case 2: Coin Generation (Single Cell)
**Objective**: Verify +10 coins per safe cell revealed

**Steps**:
1. Start new game
2. Verify HUD shows "Coins: 0"
3. Reveal a safe cell (number 1-8)
4. Verify:
   - Console logs "+10 coins (1 cells revealed)"
   - HUD updates to "Coins: 10"
5. Reveal another safe cell
6. Verify HUD shows "Coins: 20"

**Expected Result**: +10 coins per safe cell

**Pass Criteria**: Coin count matches expected value

---

#### Test Case 3: Coin Generation (Cascade)
**Objective**: Verify +10 coins per cell when cascade reveals multiple cells

**Steps**:
1. Start new game
2. Verify HUD shows "Coins: 0"
3. Reveal a zero cell (triggers cascade)
4. Count how many cells were revealed (e.g., 12 cells)
5. Verify:
   - Console logs "+120 coins (12 cells revealed)" (or actual count)
   - HUD shows "Coins: 120" (or actual count)

**Expected Result**: +10 coins for EACH cell in cascade

**Pass Criteria**: Coin count = number of cells revealed × 10

---

#### Test Case 4: Mana Generation (Cell Reveals)
**Objective**: Verify +5 mana per safe cell revealed

**Steps**:
1. Start new game
2. Verify HUD shows "Mana: 0/100"
3. Reveal a safe cell
4. Verify:
   - Console logs "+5 mana"
   - HUD updates to "Mana: 5/100"
5. Reveal a zero cell that cascades 10 cells
6. Verify:
   - Console logs "+50 mana"
   - HUD shows "Mana: 55/100"

**Expected Result**: +5 mana per cell revealed (including cascade)

**Pass Criteria**: Mana count matches expected value

---

#### Test Case 5: Mana Generation (Flag Placement)
**Objective**: Verify +10 mana when placing a flag

**Steps**:
1. Start new game
2. Verify HUD shows "Mana: 0/100"
3. Right-click (or long-press on mobile) to place a flag
4. Verify:
   - Console logs "+10 mana (flag placed)"
   - HUD updates to "Mana: 10/100"
5. Place 5 more flags
6. Verify HUD shows "Mana: 60/100"
7. Remove a flag (right-click again)
8. Verify:
   - No mana change (no console log)
   - HUD still shows "Mana: 60/100"

**Expected Result**: +10 mana only when placing flag, not removing

**Pass Criteria**: Mana increases only on flag placement

---

#### Test Case 6: Mana Cap
**Objective**: Verify mana caps at 100 (maxMana)

**Steps**:
1. Start new game
2. Place 9 flags (90 mana)
3. Reveal 2 safe cells (90 + 10 = 100 mana)
4. Verify HUD shows "Mana: 100/100"
5. Reveal another safe cell
6. Verify:
   - HUD still shows "Mana: 100/100" (capped)
   - No overflow

**Expected Result**: Mana cannot exceed maxMana (100)

**Pass Criteria**: Mana stays at 100

---

#### Test Case 7: Chording with Mines
**Objective**: Verify HP damage when chording reveals multiple mines

**Steps**:
1. Start new game with HP = 3
2. Place flags around a "2" cell, but flag only 1 of the 2 mines
3. Click the "2" cell to chord
4. Verify:
   - Console logs "Hit 1 mine(s) while chording! Taking 1 HP damage."
   - HUD shows "HP: 2"
   - Game continues
5. Repeat with a cell that would reveal 2 mines via chord
6. Verify:
   - Console logs "Taking 2 HP damage"
   - HP reaches 0
   - Game over

**Expected Result**: -1 HP per mine revealed during chord

**Pass Criteria**: HP decreases by number of mines hit

---

#### Test Case 8: No Rewards for Mine Hits
**Objective**: Verify no coins/mana awarded when hitting a mine

**Steps**:
1. Start new game
2. Note starting coins and mana (0, 0)
3. Hit a mine (still alive)
4. Verify:
   - HP decreased
   - Coins still 0
   - Mana still 0
   - Console shows no coin/mana logs

**Expected Result**: No resources awarded for mine hits

**Pass Criteria**: Coins and mana unchanged after mine hit

---

#### Test Case 9: HUD Updates Immediately
**Objective**: Verify HUD updates in real-time as resources change

**Steps**:
1. Start new game
2. Open browser DevTools (F12)
3. Watch HUD while revealing cells rapidly
4. Verify HUD updates immediately after each action (no delay)

**Expected Result**: HUD reflects current state instantly

**Pass Criteria**: No visible delay in HUD updates

---

#### Test Case 10: Mobile Touch Input
**Objective**: Verify resource tracking works with touch controls

**Steps**:
1. Open game on mobile device or use Chrome DevTools mobile emulation
2. Tap to reveal a safe cell
3. Verify coins and mana increase
4. Long-press to place a flag
5. Verify mana increases by 10
6. Tap to reveal a mine
7. Verify HP decreases

**Expected Result**: Touch controls behave identically to mouse

**Pass Criteria**: All resource changes work on mobile

---

#### Test Case 11: Keyboard Controls
**Objective**: Verify resource tracking works with keyboard input

**Steps**:
1. Start new game
2. Use arrow keys to move cursor
3. Press Space to reveal a safe cell
4. Verify coins and mana increase
5. Press F to place a flag
6. Verify mana increases by 10
7. Press Space on a mine
8. Verify HP decreases

**Expected Result**: Keyboard controls behave identically to mouse

**Pass Criteria**: All resource changes work with keyboard

---

### Edge Case Testing

#### Edge Case 1: Reveal Mine on Last HP
**Scenario**: Player has 1 HP left and hits a mine

**Expected**:
- HP goes to 0
- Game over triggered
- No coins/mana awarded

**Test**: Hit mines until 1 HP, then hit one more mine

---

#### Edge Case 2: Large Cascade
**Scenario**: Reveal a zero cell that cascades 30+ cells

**Expected**:
- Coins increase by 300+
- Mana increases by 150 (capped at 100 if already have mana)
- HUD updates correctly

**Test**: Find a large open area and click a zero

---

#### Edge Case 3: Flag Toggle Rapidly
**Scenario**: Place and remove same flag 5 times

**Expected**:
- Mana increases only on placements (5 × 10 = 50 mana)
- Removals don't change mana

**Test**: Right-click same cell 10 times

---

#### Edge Case 4: Chord Multiple Mines
**Scenario**: Chord a cell that reveals 3 mines (no flags)

**Expected**:
- HP decreases by 3
- If HP >= 3, player survives with HP = 0 → game over
- If HP < 3, game over

**Test**: Set up scenario with unflagged mines around a "3" cell

---

### Performance Testing

#### Test: Rapid Clicking
**Scenario**: Click rapidly on multiple cells in quick succession

**Expected**:
- All resource updates happen correctly
- No race conditions
- No duplicate updates
- HUD remains responsive

**Test**: Reveal 20+ cells in 2 seconds

---

## 5. Rollback Plan

### If Implementation Fails

**Scenario**: Resource tracking has critical bugs or breaks gameplay

**Rollback Steps**:
1. Revert all changes to `src/main.js`
2. Verify game returns to previous working state
3. Document what went wrong
4. Plan fixes before re-attempting

**Git Command**:
```bash
git checkout HEAD -- src/main.js
```

### If Testing Reveals Issues

**Decision Tree**:
- **Minor bug** (e.g., HUD updates delayed): Fix immediately
- **Logic error** (e.g., wrong coin calculation): Fix and re-test specific case
- **Critical bug** (e.g., game crashes): Rollback and analyze
- **Design issue** (e.g., mana cap too low): Document for Phase 3, continue with current values

### Partial Rollback

If only one feature fails (e.g., flag mana bonus), can disable that feature:
1. Comment out the mana reward in flag handlers
2. Test remaining features
3. Fix flag feature separately

---

## 6. Implementation Steps (In Order)

### Step 1: Update Mouse Input Handlers (30 min)
1. [ ] Update `handleLeftClick()` for cell reveals (Change 1.1)
2. [ ] Update `handleLeftClick()` for chording (Change 1.2)
3. [ ] Update `handleRightClick()` for flag mana (Change 1.3)
4. [ ] Test mouse input with Test Cases 1-6

**Checkpoint**: Mouse input works, resources tracked correctly

---

### Step 2: Update Touch Input Handlers (30 min)
1. [ ] Update `handleTouchEnd()` for reveals (Change 1.4)
2. [ ] Update `handleTouchEnd()` for chording (Change 1.5)
3. [ ] Update `handleTouchStart()` for flag mana (Change 1.6)
4. [ ] Test touch input with Test Case 10

**Checkpoint**: Touch input works identically to mouse

---

### Step 3: Update Keyboard Input Handlers (20 min)
1. [ ] Update `performRevealAtCursor()` (Change 1.7a)
2. [ ] Update `performFlagAtCursor()` (Change 1.7b)
3. [ ] Update `performChordAtCursor()` (Change 1.7c)
4. [ ] Test keyboard input with Test Case 11

**Checkpoint**: Keyboard input works identically to mouse

---

### Step 4: Comprehensive Testing (30 min)
1. [ ] Run all manual test cases (Test Cases 1-11)
2. [ ] Run all edge case tests
3. [ ] Verify no regressions in existing functionality
4. [ ] Test rapid clicking performance

**Checkpoint**: All tests pass

---

### Step 5: Polish & Cleanup (10 min)
1. [ ] Remove debug console.logs (optional, can keep for now)
2. [ ] Verify code formatting is consistent
3. [ ] Update PROGRESS.md with completed work
4. [ ] Prepare for commit

**Checkpoint**: Code is clean and ready to commit

---

## 7. Success Metrics

### Functional Requirements
- [ ] HP system works (3 HP, -1 per mine, game over at 0)
- [ ] Coin system works (+10 per safe cell, including cascade)
- [ ] Mana system works (+5 per cell, +10 per flag)
- [ ] HUD updates immediately on all resource changes
- [ ] All input methods work (mouse, touch, keyboard)

### Quality Requirements
- [ ] No console errors during normal gameplay
- [ ] No visual glitches in HUD
- [ ] No performance issues with rapid input
- [ ] Code follows existing patterns in main.js
- [ ] All manual test cases pass

### User Experience
- [ ] HP damage feels fair (not instant death)
- [ ] Coin rewards feel satisfying (visible progress)
- [ ] Mana generation feels balanced
- [ ] HUD is clear and readable
- [ ] No confusion about resource changes

---

## 8. Post-Implementation Notes

### Document After Completion
- [ ] Update PROGRESS.md with Phase 2 completion
- [ ] Add resource systems to "What Works" section
- [ ] Note any deviations from plan
- [ ] Record actual time spent vs. estimated

### Known Limitations (To Address Later)
- No visual effects for resource changes (floating +10 text, etc.) - Phase 4
- No sound effects for coin/mana gain - Phase 4
- Mana cap is hardcoded (100) - Can be increased by items in Phase 3
- Coin multiplier not yet implemented - Phase 3 (board difficulty)
- HP healing not yet implemented - Phase 3 (items/shops)

---

## 9. Dependencies & Risks

### Dependencies
- **Grid.revealCell()**: Must return cell info and update `grid.revealed` count
  - Status: ✅ Already implemented correctly
- **Grid.chord()**: Must return array of revealed cells
  - Status: ✅ Already implemented correctly
- **Grid.toggleFlag()**: Must return success boolean
  - Status: ✅ Already implemented correctly
- **GameState methods**: takeDamage, addCoins, addMana
  - Status: ✅ All exist and work correctly

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cascade coin calculation incorrect | Low | High | Test thoroughly with large cascades |
| HUD updates cause performance lag | Very Low | Medium | Only update when values change (already doing this) |
| Touch/mouse double-fire issues | Low | Medium | Already handled with `touchHandled` flag |
| Mana overflow bugs | Very Low | Low | GameState.addMana() already caps at maxMana |
| HP reaching negative values | Very Low | Low | GameState.takeDamage() uses Math.max(0, ...) |

**Overall Risk Level**: Low

---

## 10. Commit Message

After successful implementation and testing:

```
feat: Implement Phase 2 resource systems (HP, Coins, Mana)

Added core resource tracking to enable roguelike gameplay loop:

- HP System: Players start with 3 HP, take -1 HP per mine hit, game over at 0 HP (replaces instant death)
- Coin Generation: +10 coins per safe cell revealed (including cascade reveals)
- Mana System: +5 mana per cell revealed, +10 mana per flag placed (capped at 100)
- HUD Updates: Real-time display updates for all resource changes

Resource tracking works across all input methods:
- Mouse: Left-click reveal, right-click flag
- Touch: Tap reveal, long-press flag
- Keyboard: Space reveal, F flag, C chord

Changes:
- src/main.js: Added resource tracking to all event handlers (mouse, touch, keyboard)
- src/main.js: Updated game over logic to trigger only at 0 HP
- src/main.js: Integrated updateHUD() calls for reactive display

Testing:
- Manual testing confirmed all 11 test cases pass
- Edge cases verified (large cascades, multiple mines, rapid input)
- No performance issues or regressions

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 11. Next Steps (After Phase 2)

### Phase 3: Shop System
- Implement item shop between boards
- Add item purchases using coins
- Integrate passive item effects
- Add active ability system

### Phase 4: Visual Effects
- Add floating text for coin/mana gains
- Add screen shake for mine hits
- Add particle effects for mana
- Add HP heart animations

### Phase 5: Quest System
- Implement quest objectives
- Add quest progress tracking
- Add quest completion rewards
- Add quest selection screen

---

**Last Updated**: 2025-12-30
**Status**: Ready for Implementation
**Estimated Time**: 1.5-2.5 hours
**Complexity**: Low-Medium
**Risk**: Low
