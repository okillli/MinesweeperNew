# Phase 1 Playtest Checklist

**Date**: 2025-12-30
**Goal**: Validate that core minesweeper mechanics are fun and working correctly

## 🎮 How to Access

**URL**: http://localhost:8000
**Server Running**: Yes (Python HTTP server on port 8000)

## ✅ Core Mechanics Test

### Basic Interactions
- [ ] **Left-click reveal**: Click on an unrevealed cell
  - Expected: Cell reveals, shows number or is blank
  - Issue?: _____________________

- [ ] **Right-click flag**: Right-click on an unrevealed cell
  - Expected: Orange flag appears, right-click again to remove
  - Issue?: _____________________

- [ ] **Cannot reveal flagged cell**: Try left-clicking a flagged cell
  - Expected: Nothing happens
  - Issue?: _____________________

### Advanced Mechanics
- [ ] **Zero cascade**: Click a cell with no adjacent mines (blank cell)
  - Expected: Automatically reveals surrounding cells in a cascade
  - Issue?: _____________________

- [ ] **Chording**: Flag all mines around a number, then left-click the number
  - Expected: All unflagged adjacent cells reveal automatically
  - Issue?: _____________________

- [ ] **Partial chord fails**: Flag only SOME mines around a number, click number
  - Expected: Nothing happens (flag count must match number)
  - Issue?: _____________________

### Win/Lose Conditions
- [ ] **Hit a mine**: Click on a mine
  - Expected: Mine reveals (black circle on red background), console shows "💥 Mine hit!"
  - Issue?: _____________________

- [ ] **Win condition**: Reveal all non-mine cells
  - Expected: Console shows "🎉 You won!"
  - Issue?: _____________________

- [ ] **Can continue after mine**: After hitting mine, can you keep playing?
  - Expected: Yes (HP system not implemented yet)
  - Issue?: _____________________

## 🎨 Visual Rendering Test

### Grid Display
- [ ] **Grid centered**: Is the 10x10 grid centered on canvas?
  - Expected: Yes, centered with equal margins
  - Issue?: _____________________

- [ ] **Cell borders visible**: Can you see clear borders between cells?
  - Expected: Yes, light gray borders
  - Issue?: _____________________

- [ ] **Cell states distinct**: Can you easily tell revealed vs unrevealed?
  - Expected: Unrevealed = gray (#aaa), Revealed = light (#eee)
  - Issue?: _____________________

### Numbers
- [ ] **Numbers color-coded**: Are numbers 1-8 different colors?
  - Expected: 1=blue, 2=green, 3=red, 4=dark blue, etc.
  - Issue?: _____________________

- [ ] **Numbers readable**: Are numbers clear and centered in cells?
  - Expected: Yes, bold text centered in cell
  - Issue?: _____________________

### Mines & Flags
- [ ] **Mine rendering**: When you hit a mine, does it show a black circle?
  - Expected: Yes, black circle on red background
  - Issue?: _____________________

- [ ] **Flag rendering**: Do flags show as orange triangles?
  - Expected: Yes, orange triangle with black pole
  - Issue?: _____________________

## 🖱️ Input Handling Test

### Mouse Controls
- [ ] **Left-click responsive**: Does left-click immediately reveal?
  - Expected: Instant response
  - Issue?: _____________________

- [ ] **Right-click works**: Does right-click toggle flag?
  - Expected: Yes, no browser context menu appears
  - Issue?: _____________________

- [ ] **Click outside grid**: Click outside the grid area
  - Expected: Nothing happens, no errors
  - Issue?: _____________________

### Edge Cases
- [ ] **Rapid clicking**: Click rapidly on multiple cells
  - Expected: All clicks register, no lag or errors
  - Issue?: _____________________

- [ ] **Click revealed cell**: Left-click an already revealed cell
  - Expected: Attempts chording if it's a number, otherwise nothing
  - Issue?: _____________________

## 🧪 Browser Console Check

**Open DevTools** (F12 or Right-click → Inspect)

### Console Messages
- [ ] **Initialization message**: See "🎮 MineQuest initialized"?
  - Expected: Yes, on page load
  - Issue?: _____________________

- [ ] **Test grid message**: See "Starting test game with 10x10 grid"?
  - Expected: Yes, on page load
  - Issue?: _____________________

- [ ] **Action logging**: See messages when clicking cells?
  - Expected: "Revealed cell (x, y)", "Flagged cell (x, y)", etc.
  - Issue?: _____________________

### Errors
- [ ] **Any errors in console?**
  - Expected: No errors
  - Errors found: _____________________

## 📊 Performance Test

### Frame Rate
- [ ] **Smooth rendering**: Does the game feel smooth and responsive?
  - Expected: 60 FPS, no stuttering
  - Issue?: _____________________

- [ ] **Fast cascade**: When clicking zero cell, does cascade happen instantly?
  - Expected: Yes, near-instant reveal of connected zeros
  - Issue?: _____________________

## 😊 Fun Factor Assessment

### Core Gameplay Feel
- [ ] **Is revealing cells satisfying?**
  - Rating (1-10): _____
  - Notes: _____________________

- [ ] **Is the cascade effect fun?**
  - Rating (1-10): _____
  - Notes: _____________________

- [ ] **Is chording intuitive?**
  - Rating (1-10): _____
  - Notes: _____________________

### What's Missing?
- [ ] **What would make this MORE fun right now?**
  - Ideas: _____________________

### Issues Found
- [ ] **Any frustrations or annoyances?**
  - Frustrations: _____________________

## 🎯 Critical Questions

### Before Proceeding to Phase 2:
1. **Is the core minesweeper loop fun enough to build on?**
   - Answer: _____________________

2. **Do the controls feel good?**
   - Answer: _____________________

3. **Are there any blocking bugs?**
   - Answer: _____________________

4. **Should we add any polish before Phase 2?**
   - Answer: _____________________

## 📝 Notes & Observations

**General Impressions**:
_____________________
_____________________
_____________________

**Bugs to Fix**:
_____________________
_____________________
_____________________

**Ideas for Improvement**:
_____________________
_____________________
_____________________

---

## ✅ Playtest Complete

**Date Completed**: _____________________
**Overall Assessment**: _____________________
**Proceed to Phase 2?**: Yes / No / After fixes

**Next Steps**:
_____________________
_____________________
_____________________
