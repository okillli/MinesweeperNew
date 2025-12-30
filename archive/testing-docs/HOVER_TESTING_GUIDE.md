# Hover Feedback Testing Guide

## Test Setup

1. Open `index.html` in a web browser (or use local server: `python -m http.server 8000`)
2. Click "Start Run" to begin a game
3. The game will create a 10x10 grid with 15 mines

## Test Cases

### ✅ Test 1: Basic Hover on Unrevealed Cells
**Action**: Move mouse over unrevealed (gray) cells
**Expected Result**:
- Green border (3px thick) appears around the hovered cell
- Semi-transparent white overlay appears on the cell
- Cursor changes to pointer
- Highlight disappears when moving to another cell

### ✅ Test 2: Hover on Revealed Cells
**Action**:
1. Click to reveal some cells
2. Move mouse over revealed cells (with numbers or empty)

**Expected Result**:
- Blue border (3px thick) appears around the hovered cell
- No white overlay (cell content remains clearly visible)
- Indicates chording is possible on numbered cells

### ✅ Test 3: Hover on Flagged Cells
**Action**:
1. Right-click to flag a cell
2. Move mouse over the flagged cell

**Expected Result**:
- Yellow/orange border (3px thick, matching flag color #f4a261)
- No white overlay
- Indicates the flag can be toggled off

### ✅ Test 4: Mouse Leave Canvas
**Action**: Move mouse outside the canvas area
**Expected Result**:
- Hover highlight disappears immediately
- Cursor returns to default

### ✅ Test 5: Hover During Game Over
**Action**:
1. Click on a mine to trigger game over
2. Try to hover over cells

**Expected Result**:
- No hover highlight appears
- All mines are revealed (red background)

### ✅ Test 6: Hover on Other Screens
**Action**:
1. Return to menu or navigate to other screens
2. Move mouse around

**Expected Result**:
- No hover highlight on non-playing screens
- Cursor is default (not pointer)

### ✅ Test 7: Performance Test
**Action**: Rapidly move mouse across the entire grid
**Expected Result**:
- Smooth highlighting with no lag
- No flickering or visual artifacts
- Highlight updates instantly as you move between cells

### ✅ Test 8: Edge Cases
**Action**:
1. Hover over the padding/gaps between cells
2. Hover near the edge of the canvas

**Expected Result**:
- No highlight when hovering over gaps
- Proper highlight when hovering on edge cells
- No errors in console

## Visual Design Verification

### Color Palette
- **Unrevealed cells**: Green border `#2ecc71` + white overlay `rgba(255, 255, 255, 0.3)`
- **Revealed cells**: Blue border `#4a90e2`
- **Flagged cells**: Orange border `#f4a261` (matches flag color)

### Border Specifications
- **Width**: 3px
- **Offset**: 1.5px inset from cell edge
- **Style**: Solid stroke

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

## Known Limitations

1. **Touch devices**: Hover doesn't apply to touch input (tap/long-press still work as before)
2. **Mobile browsers**: Pointer cursor may not show on touch-only devices
3. **Performance**: On very large grids (>20x20), there may be minor input lag on older devices

## Success Criteria

All tests pass if:
- ✅ Hover highlighting appears instantly when moving mouse
- ✅ Different cell states show different highlight styles
- ✅ No performance degradation (smooth 60 FPS)
- ✅ No console errors
- ✅ Hover state clears properly when leaving canvas or changing screens
- ✅ User can clearly see which cell will be affected before clicking
