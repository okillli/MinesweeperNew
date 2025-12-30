# Keyboard Navigation Best Practices for Web-Based Grid Games

## Research Summary

This document compiles industry best practices, accessibility standards, and practical implementation patterns for keyboard navigation in web-based grid games like minesweeper. Research conducted December 30, 2025.

---

## 1. Standard Keyboard Controls for Grid-Based Games

### Arrow Key Navigation (Primary Standard)

**Industry Standard**: Arrow keys are the universal standard for spatial navigation in grid-based games and applications.

- **Arrow keys (← ↑ → ↓)**: Move focus/cursor between cells
  - Right arrow: Move to next cell (horizontally)
  - Left arrow: Move to previous cell
  - Down arrow: Move to cell below
  - Up arrow: Move to cell above
  - Grid uses row-major order: cells[y][x]

**Why Arrow Keys?**
- Intuitive spatial mapping
- Universally understood across all platforms
- Better for grid layouts than Tab key (which is for moving between UI components)
- Allows users to avoid excessive tabbing through hundreds of elements

### Alternative Navigation Schemes

**Vim-Style Keys (hjkl)**: Popular among power users
- `h` - Left
- `j` - Down
- `k` - Up
- `l` - Right

**WASD Keys**: Common in gaming
- `w` - Up
- `a` - Left
- `s` - Down
- `d` - Right

**NumPad**: Historical minesweeper support (Windows XP and earlier)
- NumPad 8,4,6,2 for directional movement
- Requires MouseKeys accessibility feature in older Windows versions

**Implementation Recommendation**: Support arrow keys as primary, with optional vim keys for power users.

### Action Keys

Based on standard minesweeper implementations:

**Primary Actions**:
- **Space** or **Enter**: Reveal cell at cursor position
- **F** or **1**: Toggle flag at cursor position
- **Shift + Space** or **Shift + Enter**: Chord (auto-reveal adjacent cells)

**Game Control**:
- **F2** or **R**: Restart game
- **Escape**: Pause or return to menu
- **H** or **?**: Show help/controls

**Advanced Controls** (optional):
- **U**: Undo last move (if undo system exists)
- **Ctrl + Z**: Alternative undo
- **M**: Toggle sound/music
- **Tab**: Cycle between game area and UI controls (standard web navigation)

---

## 2. Accessibility Standards (WCAG Guidelines)

### WCAG 2.1 Keyboard Accessibility Requirements

**2.1.1 Keyboard (Level A)**:
> All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.

**Key Requirements**:
- Every interactive element must be reachable via keyboard
- No "keyboard traps" - users can navigate away from any element
- No time-dependent key sequences required

**2.1.2 No Keyboard Trap (Level A)**:
> If keyboard focus can be moved to a component, focus can be moved away from that component using only a keyboard interface.

**Implementation for Grid Games**:
- Users must be able to Tab out of the game grid
- Escape key should allow exiting full-screen or focused states
- Provide clear exit paths from all interactive modes

**Exception for Games**:
WCAG provides an exception for "path-dependent" games (e.g., steady-hand games requiring precise mouse movement along a path). However, traditional minesweeper does NOT qualify for this exception and must support full keyboard control.

### Focus Management Best Practices

**Visible Focus Indicator (WCAG 2.4.7 - Level AA)**:
- Every focusable element must have a visible focus indicator
- **Minimum contrast ratio: 3:1** against background
- Focus indicator must be clearly visible and unambiguous

**Focus Order (WCAG 2.4.3 - Level A)**:
- Focus order should follow a logical, predictable sequence
- For grids: left-to-right, top-to-bottom is standard
- Tab key moves between major UI components, not individual cells

**Focus on Page Load**:
- Consider auto-focusing the game grid on game start
- Provide skip links to jump directly to game content
- Document where initial focus will land

### Tab Index Management

**Grid Navigation Pattern**:
- **Parent grid container**: `tabindex="0"` (in tab order)
- **Individual cells**: `tabindex="-1"` (not in tab order, navigable via arrow keys)
- This prevents Tab from cycling through hundreds of cells

**Why This Matters**:
- Reduces tab stops from potentially 256+ (16x16 grid) to 1
- Users navigate within grid using arrow keys
- Tab moves to next major UI component (HUD, menu buttons, etc.)

---

## 3. Common Keybindings for Minesweeper-Like Games

### Classic Windows Minesweeper

**Movement**:
- Arrow keys: Navigate grid (Vista and later)
- NumPad: Navigate grid (XP and earlier, with MouseKeys enabled)

**Actions**:
- Space or Enter: Uncover cell
- Shift + Space or Shift + Enter: Chord
- 1 or F: Flag cell
- F2: New game

### Modern Web Implementations

**Example 1: minesweeper.online**
- Arrow keys: Move cursor
- Space: Reveal
- F: Flag
- Customizable in settings

**Example 2: Keyboard Minesweeper (kb-minesweeper.com)**
- Arrow keys or vim keys (hjkl): Navigate
- D: Reveal (simulates left click)
- F: Flag (simulates right click)
- F on revealed cell: Chord

**Example 3: minesVIiper (vim-style minesweeper)**
- hjkl: Navigate (vim-style)
- Space: Reveal
- f: Flag
- Custom vim-inspired commands

**Common Patterns Across Implementations**:
- Arrow keys are universal
- Space/Enter for primary action (reveal)
- F/1 for secondary action (flag)
- F2/R for restart
- Customizable controls are increasingly common

---

## 4. Visual Feedback for Keyboard Focus

### CSS Pseudo-Classes for Focus

**:focus** - Traditional focus state
```css
.cell:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}
```

**:focus-visible** - Modern keyboard-only focus (Recommended)
```css
.cell:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.3);
}
```

**Why :focus-visible?**
- Only shows focus indicator for keyboard navigation
- Hides focus ring for mouse clicks (better UX)
- Browser automatically determines when focus should be visible
- Progressive enhancement: falls back to :focus in older browsers

### Visual Feedback Patterns

**Minimum Requirements (WCAG 2.1 SC 1.4.11)**:
- 3:1 contrast ratio for focus indicator
- Clear visual distinction from unfocused state

**Recommended Patterns for Grid Games**:

1. **Outline/Border**:
   ```css
   .cell.keyboard-focus {
     outline: 3px solid #0066cc;
     outline-offset: -3px; /* Inside the cell */
   }
   ```

2. **Box Shadow** (softer, modern look):
   ```css
   .cell.keyboard-focus {
     box-shadow: 0 0 0 3px #0066cc,
                 0 0 8px rgba(0, 102, 204, 0.5);
   }
   ```

3. **Background Highlight**:
   ```css
   .cell.keyboard-focus {
     background-color: rgba(0, 102, 204, 0.15);
     border: 3px solid #0066cc;
   }
   ```

4. **Animated Cursor** (for grid games):
   ```css
   .cell.keyboard-focus {
     outline: 3px solid #0066cc;
     animation: pulse 1.5s ease-in-out infinite;
   }

   @keyframes pulse {
     0%, 100% { outline-color: #0066cc; }
     50% { outline-color: #0088ff; }
   }
   ```

### Transitions and Animations

**Smooth Focus Transitions**:
```css
.cell {
  transition: outline 0.15s ease,
              box-shadow 0.15s ease,
              background-color 0.15s ease;
}
```

**Benefits**:
- Makes focus changes less jarring
- Helps users track focus movement
- Feels more polished and responsive

### Additional Visual Cues

**Cursor Position Indicator**: For canvas-based grids (like MineQuest)
- Draw a distinct border/highlight around the focused cell
- Use a different color from hover state
- Consider adding a subtle glow or shadow

**Status Text**:
- Show current cell coordinates (e.g., "Cell A1")
- Display cell state in screen reader announcements
- Update HUD to show cursor position

---

## 5. Keyboard Shortcuts for Game Actions

### Essential Actions

**Primary Actions** (Must implement):
- **Reveal**: Space, Enter, or D
- **Flag**: F, 1, or Shift+Space
- **Navigate**: Arrow keys (← ↑ → ↓)
- **Restart**: F2 or R

**Secondary Actions** (Should implement):
- **Chord**: Shift+Space, Shift+Enter, or C
- **Undo**: Ctrl+Z or U (if undo exists)
- **Pause**: Escape or P
- **Help**: H or ?

**Advanced Actions** (Nice to have):
- **Quick restart**: Ctrl+R
- **Zoom in/out**: + / - or Ctrl+Plus/Minus
- **Toggle sound**: M
- **Show/hide flags**: Ctrl+F

### Chording Implementation

**What is Chording?**
In minesweeper, "chording" means clicking both mouse buttons simultaneously on a revealed numbered cell. If the correct number of flags are placed around it, all unmarked adjacent cells are revealed automatically.

**Keyboard Equivalents**:
- **Shift + Space**: Most common
- **Shift + Enter**: Alternative
- **C key**: Dedicated chord key
- **F on revealed cell**: Vim-style (simulates right-click on number)

**Implementation Pattern**:
```javascript
// Pseudo-code
if (key === 'Space' && shift) {
  if (cell.isRevealed && cell.number > 0) {
    grid.chord(x, y);
  } else {
    grid.revealCell(x, y);
  }
}
```

### Preventing Default Browser Behavior

**Critical**: Prevent browser shortcuts from interfering

```javascript
canvas.addEventListener('keydown', (e) => {
  // Prevent space from scrolling page
  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
  }

  // Prevent F1 (help) in some browsers
  if (e.key === 'F1') {
    e.preventDefault();
  }

  // Prevent Ctrl+R (reload) if used for restart
  if (e.ctrlKey && e.key === 'r') {
    e.preventDefault();
  }
});
```

### Keyboard Shortcut Documentation

**In-Game Help Screen**:
- Provide a keyboard shortcuts reference (press H or ?)
- Group shortcuts by category (Navigation, Actions, Game Control)
- Include both primary and alternative keys
- Show platform-specific variants (Ctrl vs Cmd on Mac)

**Accessibility Statement**:
- Document all keyboard controls
- Explain custom keybindings
- Note any exceptions to standard patterns

---

## 6. Mobile/Tablet Touch Alternatives

### Gesture Patterns for Touchscreens

**Standard Touch Gestures for Minesweeper**:

1. **Tap**: Reveal cell (equivalent to left-click/Space)
   - Duration: < 500ms
   - Movement tolerance: < 10px

2. **Long-press**: Toggle flag (equivalent to right-click/F)
   - Duration: 500ms hold
   - Haptic feedback: 50ms vibration when available

3. **Tap on revealed cell**: Chord (equivalent to Shift+Space)
   - Same as tap, but on revealed numbered cell

**Movement Threshold**:
- 10-pixel tolerance for finger tremor
- Movements beyond threshold cancel the action
- Prevents accidental reveals during scrolling

### Touch Target Sizing

**Minimum Requirements**:
- **Apple iOS HIG**: 44x44 points minimum
- **Android Material Design**: 48x48 dp minimum
- **WCAG (general)**: 44x44 CSS pixels minimum

**MineQuest Implementation**:
- Cell size: 44x44 pixels (meets all guidelines)
- Padding: 2px between cells
- Touch-friendly spacing without excessive screen real estate

### Touch-Specific Considerations

**No Hover State on Touch**:
- Touchscreens don't support hover
- Don't rely on hover for critical feedback
- Provide alternative feedback methods (tap to preview, etc.)

**Context Menu Prevention**:
- Long-press typically triggers browser context menu
- Use `preventDefault()` on touch events
- Implement custom long-press for flag action

**Double-Tap Zoom**:
- Mobile browsers zoom on double-tap by default
- Consider disabling if it interferes with gameplay
- Alternative: implement pinch-to-zoom for intentional zooming

### Haptic Feedback

**When to Use**:
- Flag placed/removed: 50ms vibration
- Mine hit: 100ms strong vibration
- Board completed: 200ms success pattern

**Implementation**:
```javascript
// Check support
if (navigator.vibrate) {
  navigator.vibrate(50); // 50ms vibration
}
```

**Platform Support**:
- Android: Full support
- iOS: Limited/no support for Vibration API
- Fallback gracefully on unsupported devices

### Gesture Research Findings

**Tile-Matching Games** (relevant pattern):
- Characteristic patterns: tapping grid locations + sliding between adjacent grids
- Users naturally understand tap-for-action on grids

**Touch Duration**:
- 500ms is the standard threshold for long-press across platforms
- Shorter (< 300ms): Feels too sensitive, accidental flags
- Longer (> 700ms): Feels unresponsive, frustrating

**Multi-Touch**:
- Most minesweeper games don't use multi-touch
- Consider for advanced features (two-finger tap for chord, pinch-to-zoom)

---

## 7. Best Practices for Combining Input Methods

### Seamless Input Switching

**The Challenge**:
Many devices support multiple input methods simultaneously:
- Desktop: Mouse + Keyboard
- Laptop: Touchpad + Keyboard
- Hybrid devices (Surface): Touch + Mouse + Keyboard
- Touch devices with Bluetooth keyboard

**Goal**: Support all input methods simultaneously without conflicts.

### Preventing Double-Firing

**The Problem**:
On touch devices, both touch AND mouse events fire for the same interaction:
1. User taps screen
2. `touchstart` → `touchend` fires
3. Browser also fires `mousedown` → `click`
4. Result: Action executes twice

**Solution Pattern**:
```javascript
let touchHandled = false;

function handleTouchEnd(event) {
  // Execute touch action
  performAction();

  // Set flag to prevent mouse handler
  touchHandled = true;

  // Reset after 300ms (after mouse events would fire)
  setTimeout(() => {
    touchHandled = false;
  }, 300);

  event.preventDefault();
}

function handleClick(event) {
  // Ignore if already handled by touch
  if (touchHandled) return;

  // Execute mouse action
  performAction();
}
```

### Input Mode Detection

**Automatic Input Detection**:
```javascript
let currentInputMode = 'unknown'; // 'mouse', 'keyboard', 'touch'

// Detect mouse usage
canvas.addEventListener('mousemove', () => {
  currentInputMode = 'mouse';
});

// Detect keyboard usage
canvas.addEventListener('keydown', () => {
  currentInputMode = 'keyboard';
});

// Detect touch usage
canvas.addEventListener('touchstart', () => {
  currentInputMode = 'touch';
});
```

**Use Cases**:
- Show hover effects only for mouse users
- Show focus indicators only for keyboard users (via :focus-visible)
- Adjust UI hints based on input method

### Platform-Independent Input Handling

**Phaser Framework Example**:
- Use `activePointer` instead of `mousePointer` for cross-platform support
- Buttons accept any input type (touch or click)
- Built-in prevention of double-firing

**Rewired Package (Unity)**:
- Universal input abstraction
- Supports mouse, keyboard, touch, and gamepad simultaneously
- Seamless switching between input methods

**Key Principle**: Use input-agnostic APIs when available

### Canvas-Based Games (like MineQuest)

**Challenge**: Canvas doesn't have built-in focus management

**Solution**: Implement virtual focus system
```javascript
// Track cursor position for keyboard navigation
let keyboardCursor = { x: 0, y: 0 };

// Track hover position for mouse
let mouseHover = null;

// Track touch position
let touchPosition = null;

// Render with appropriate visual feedback for each input type
function render() {
  // Show keyboard cursor (distinct indicator)
  if (keyboardCursor) {
    drawKeyboardCursor(keyboardCursor.x, keyboardCursor.y);
  }

  // Show mouse hover (subtle highlight)
  if (mouseHover) {
    drawHoverHighlight(mouseHover.x, mouseHover.y);
  }
}
```

### Keyboard + Mouse Hybrid Usage

**Common Pattern**: Users switch between input methods mid-game
- Start with mouse
- Switch to keyboard for precise navigation
- Return to mouse for quick actions

**Implementation**:
- Both input methods should work simultaneously
- Mouse hover should not interfere with keyboard cursor
- Keyboard cursor should update on arrow key, mouse hover on movement
- Last input method takes precedence for visual feedback

### Accessibility Considerations

**Redundant Input Methods**:
- Every action should be possible via keyboard OR mouse OR touch
- Don't require specific input methods for specific actions
- Provide alternatives for complex gestures (pinch-zoom → button controls)

**Input Method Preferences**:
- Some users can only use keyboard (motor disabilities)
- Some users can only use mouse (lack of keyboard skills)
- Some users prefer touch exclusively
- Support all methods equally

---

## 8. Practical Implementation Patterns

### Arrow Key Grid Navigation (JavaScript)

**Basic Implementation**:
```javascript
// Current keyboard cursor position
let cursorX = 0;
let cursorY = 0;

canvas.addEventListener('keydown', (event) => {
  const grid = game.state.grid;
  if (!grid) return;

  switch(event.key) {
    case 'ArrowUp':
    case 'k': // Vim-style
      cursorY = Math.max(0, cursorY - 1);
      event.preventDefault();
      break;

    case 'ArrowDown':
    case 'j': // Vim-style
      cursorY = Math.min(grid.height - 1, cursorY + 1);
      event.preventDefault();
      break;

    case 'ArrowLeft':
    case 'h': // Vim-style
      cursorX = Math.max(0, cursorX - 1);
      event.preventDefault();
      break;

    case 'ArrowRight':
    case 'l': // Vim-style
      cursorX = Math.min(grid.width - 1, cursorX + 1);
      event.preventDefault();
      break;

    case ' ': // Space - Reveal
    case 'Enter':
      grid.revealCell(cursorX, cursorY);
      event.preventDefault();
      break;

    case 'f': // Flag
    case '1':
      grid.toggleFlag(cursorX, cursorY);
      event.preventDefault();
      break;
  }

  // Update game state with new cursor position
  game.state.keyboardCursor = { x: cursorX, y: cursorY };
});
```

### Focus Management for Canvas

**Making Canvas Focusable**:
```html
<canvas id="game-canvas" tabindex="0" role="application" aria-label="Minesweeper grid"></canvas>
```

**Focus on Game Start**:
```javascript
function startGame() {
  // Initialize game...

  // Focus canvas for immediate keyboard control
  canvas.focus();

  // Set initial cursor position
  game.state.keyboardCursor = { x: 0, y: 0 };
}
```

### Visual Feedback in Canvas Renderer

**Rendering Keyboard Cursor**:
```javascript
renderCell(cell, x, y) {
  // ... existing cell rendering code ...

  // Draw keyboard cursor if this cell is selected
  if (game.state.keyboardCursor &&
      game.state.keyboardCursor.x === cell.x &&
      game.state.keyboardCursor.y === cell.y) {
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 2, y - 2, size + 4, size + 4);
  }

  // Draw mouse hover if different from keyboard cursor
  if (game.state.hoverCell &&
      game.state.hoverCell.x === cell.x &&
      game.state.hoverCell.y === cell.y &&
      (!game.state.keyboardCursor ||
       game.state.keyboardCursor.x !== cell.x ||
       game.state.keyboardCursor.y !== cell.y)) {
    ctx.strokeStyle = 'rgba(0, 102, 204, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);
  }
}
```

### Using Open Source Libraries

**1. gridnav** (GitHub: codepo8/gridnav)
- Plain vanilla JavaScript, 50 lines, no dependencies
- Lightweight grid navigation
- Uses data attributes for configuration

**2. @arrow-navigation/core** (NPM)
- ~16kb, zero dependencies, TypeScript
- Supports horizontal, vertical, grid modes
- Group and element registration

**Implementation with @arrow-navigation/core**:
```javascript
import { ArrowNavigation } from '@arrow-navigation/core';

const nav = new ArrowNavigation({
  mode: 'grid',
  columns: grid.width,
  rows: grid.height
});

// Register cells
grid.cells.forEach((row, y) => {
  row.forEach((cell, x) => {
    nav.registerElement(`cell-${x}-${y}`);
  });
});

// Listen for navigation events
nav.on('move', ({ fromId, toId, direction }) => {
  // Update keyboard cursor position
  updateCursorFromId(toId);
});
```

### Screen Reader Support

**ARIA Attributes for Canvas**:
```html
<canvas
  id="game-canvas"
  role="application"
  aria-label="Minesweeper grid, 10 by 10 cells"
  aria-describedby="game-instructions"
  tabindex="0">
</canvas>

<div id="game-instructions" class="sr-only">
  Use arrow keys to navigate the grid.
  Press Space to reveal a cell.
  Press F to flag a cell.
</div>
```

**Live Region for Game Events**:
```html
<div id="game-announcements"
     role="status"
     aria-live="polite"
     class="sr-only"></div>
```

```javascript
function announceToScreenReader(message) {
  const announcer = document.getElementById('game-announcements');
  announcer.textContent = message;
}

// Usage
grid.revealCell(x, y);
announceToScreenReader(`Revealed cell at row ${y+1}, column ${x+1}. ${cell.number} adjacent mines.`);
```

---

## 9. Implementation Recommendations for MineQuest

### Phase 1: Core Keyboard Support (High Priority)

**Implement**:
1. Arrow key navigation (← ↑ → ↓)
2. Space/Enter to reveal
3. F to flag
4. Visual keyboard cursor indicator in CanvasRenderer
5. Focus canvas on game start
6. Prevent default browser behavior for game keys

**Files to Modify**:
- `src/main.js`: Add keyboard event handlers
- `src/rendering/CanvasRenderer.js`: Add keyboard cursor rendering
- `src/core/GameState.js`: Add `keyboardCursor` property

**Estimated Effort**: 2-3 hours

### Phase 2: Enhanced Keyboard Controls (Medium Priority)

**Implement**:
1. Shift+Space for chording
2. F2/R for restart
3. Escape to pause/menu
4. Vim-style keys (hjkl) as alternatives
5. Help screen with keyboard shortcuts (H or ?)

**Files to Modify**:
- `src/main.js`: Extend keyboard handlers
- Create new help overlay screen (optional)

**Estimated Effort**: 1-2 hours

### Phase 3: Polish and Accessibility (Low Priority)

**Implement**:
1. ARIA labels and live regions
2. Screen reader announcements
3. :focus-visible CSS for focus indicators
4. Keyboard shortcut customization in settings
5. Visual feedback animations (pulse effect on cursor)

**Files to Modify**:
- `index.html`: Add ARIA attributes
- `styles.css`: Add focus indicator styles
- `src/main.js`: Add screen reader support
- Settings screen: Add keybinding customization

**Estimated Effort**: 2-4 hours

### Integration with Existing Touch Support

**Current State**: Touch support is fully implemented
- Tap to reveal
- Long-press to flag
- Double-fire prevention

**Keyboard Integration**:
- Use same action handlers for consistency
- Keyboard actions call same `grid.revealCell()`, `grid.toggleFlag()` methods
- Both keyboard cursor and mouse hover can coexist
- Visual feedback distinguishes between input modes

**No Conflicts Expected**: Keyboard and touch/mouse are independent input channels

### Testing Checklist

**Keyboard Navigation**:
- [ ] Arrow keys navigate entire grid
- [ ] Grid navigation wraps or stops at edges appropriately
- [ ] Space/Enter reveals cells
- [ ] F toggles flags
- [ ] Shift+Space chords on revealed cells
- [ ] F2/R restarts game
- [ ] Escape returns to menu
- [ ] Focus indicator is clearly visible (3:1 contrast)

**Input Method Coexistence**:
- [ ] Mouse hover and keyboard cursor can coexist
- [ ] Switching from mouse to keyboard feels natural
- [ ] Switching from keyboard to mouse works seamlessly
- [ ] Touch events don't interfere with keyboard
- [ ] No double-firing between input methods

**Accessibility**:
- [ ] Canvas is focusable (tabindex="0")
- [ ] Screen reader announces game events
- [ ] All game actions possible via keyboard alone
- [ ] No keyboard traps
- [ ] Help/documentation includes keyboard controls

**Browser Compatibility**:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers (if Bluetooth keyboard connected)

---

## 10. Key Takeaways and Quick Reference

### Must-Have Features
1. ✅ Arrow key navigation (← ↑ → ↓)
2. ✅ Space/Enter to reveal
3. ✅ F to flag
4. ✅ Visible keyboard cursor (3:1 contrast minimum)
5. ✅ Focus canvas on game start
6. ✅ No keyboard traps

### Should-Have Features
1. ⚠️ Shift+Space for chording
2. ⚠️ F2/R for restart
3. ⚠️ Escape to pause/menu
4. ⚠️ Help screen with shortcuts
5. ⚠️ :focus-visible CSS

### Nice-to-Have Features
1. ➕ Vim-style keys (hjkl)
2. ➕ Screen reader support
3. ➕ Customizable keybindings
4. ➕ Visual feedback animations
5. ➕ ARIA live regions

### Anti-Patterns to Avoid
1. ❌ Requiring Tab to navigate between cells
2. ❌ No visible focus indicator
3. ❌ Keyboard shortcuts conflict with browser defaults
4. ❌ Canvas not focusable
5. ❌ Mouse-only or touch-only functionality
6. ❌ Inconsistent behavior between input methods

### Code Snippets Quick Reference

**Make Canvas Focusable**:
```html
<canvas id="game-canvas" tabindex="0" role="application"></canvas>
```

**Arrow Key Handler**:
```javascript
canvas.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') { cursorY--; }
  if (e.key === 'ArrowDown') { cursorY++; }
  if (e.key === 'ArrowLeft') { cursorX--; }
  if (e.key === 'ArrowRight') { cursorX++; }
  e.preventDefault(); // Prevent scrolling
});
```

**Focus Indicator CSS**:
```css
canvas:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}
```

**Keyboard Cursor Rendering** (Canvas):
```javascript
// In CanvasRenderer.renderCell()
if (keyboardCursor.x === cell.x && keyboardCursor.y === cell.y) {
  ctx.strokeStyle = '#0066cc';
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 2, y - 2, size + 4, size + 4);
}
```

---

## Sources

### Web Navigation and Grid Accessibility
- [Usability, Accessibility, & ARIA Compliance with Grid Keyboard Navigation](https://www.infragistics.com/blogs/grid-keyboard-navigation-accessibility/)
- [Keyboard grid navigation - codepo8](https://codepo8.github.io/gridnav/)
- [Keyboard Navigation and Its Importance - Page One Formula](https://pageoneformula.com/keyboard-navigation-and-its-importance/)
- [JavaScript Grid: Keyboard Interaction - AG Grid](https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/)

### WCAG Standards and Focus Management
- [Developing a Keyboard Interface - W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [Keyboard Navigation Patterns for Complex Widgets - UXPin](https://www.uxpin.com/studio/blog/keyboard-navigation-patterns-complex-widgets/)
- [Understanding Success Criterion 2.1.1: Keyboard - W3C](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [WCAG Keyboard Accessible Explained - Stark](https://www.getstark.co/wcag-explained/operable/keyboard-accessible/)
- [Focus & Keyboard Operability - Yale Usability](https://usability.yale.edu/web-accessibility/articles/focus-keyboard-operability)
- [Keyboard accessible - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Keyboard)

### Minesweeper Keyboard Controls
- [Minesweeper keyboard controls - DefKey](https://defkey.com/minesweeper-shortcuts)
- [Minesweeper Online Settings](https://minesweeper.online/settings)
- [Keyboard-only Minesweeper](https://maynards.site/items/minesweeper/full/)
- [List of Minesweeper game Keyboard Shortcuts - ShortcutBuzz](https://shortcutbuzz.com/list-of-minesweeper-game-keyboard-shortcuts/)
- [Keyboard Minesweeper](https://www.kb-minesweeper.com/)
- [How to Play Minesweeper on Keyboard - Minesweeper.game](https://minesweeper.game/guides/how-to-play-minesweeper-on-keyboard/)

### CSS Focus Feedback
- [:focus-visible - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible)
- [Keyboard focus - web.dev](https://web.dev/learn/accessibility/focus)
- [Keyboard-Only Focus Styles - CSS-Tricks](https://css-tricks.com/keyboard-only-focus-styles/)
- [The Top CSS Focus Pseudo-classes Explained - OpenReplay](https://blog.openreplay.com/a-guide-to-focus--focus-within-and-focus-visible/)
- [Accessibility Visual Focus - W3Schools](https://www.w3schools.com/accessibility/accessibility_visual_focus.php)
- [A Guide To Keyboard Accessibility: HTML And CSS - Smashing Magazine](https://www.smashingmagazine.com/2022/11/guide-keyboard-accessibility-html-css-part1/)

### Touch Gestures and Mobile
- [React Grid: Touch - AG Grid](https://www.ag-grid.com/react-data-grid/touch/)
- [Mobile Game Recommendation using Touch Gestures](https://homepage.iis.sinica.edu.tw/~swc/pub/mobile_game_recommendation_using_gestures.html)
- [Gestures of Touch Screen - D'Source](https://www.dsource.in/course/touch-screen-gestures/gestures-touch-screen)
- [Main gestures on mobile devices - QATestLab](https://en.training.qatestlab.com/blog/technical-articles/basic-touch-gestures/)
- [Using Gestures in Mobile Game Design - Game Developer](https://www.gamedeveloper.com/design/using-gestures-in-mobile-game-design)

### Hybrid Input Methods
- [How BetaJester Added Seamless Controller Support To Wildfrost](https://www.betajester.co.uk/blog/how-betajester-added-seamless-controller-support-to-wildfrost)
- [Desktop mouse and keyboard controls - MDN Game Development](https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Desktop_with_mouse_and_keyboard)

### Minesweeper Chording
- [Chording - Minesweeper Wiki](https://minesweeper.fandom.com/wiki/Chording)
- [Mouse chording - Wikipedia](https://en.wikipedia.org/wiki/Mouse_chording)

### Arrow Key Navigation Libraries
- [GitHub - codepo8/gridnav](https://github.com/codepo8/gridnav)
- [@arrow-navigation/core - NPM](https://www.npmjs.com/package/@arrow-navigation/core)
- [Keyboard-navigable JavaScript widgets - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets)

---

**Document Version**: 1.0
**Last Updated**: December 30, 2025
**Research Conducted By**: Claude Code (claude.ai/code)
**For Project**: MineQuest - Roguelike Minesweeper
