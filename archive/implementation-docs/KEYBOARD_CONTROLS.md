# Keyboard Controls

MineQuest now supports full keyboard navigation, making the game accessible on desktop and laptop computers without a mouse.

## Grid Navigation

Move the cursor (gold highlight) around the grid using:

- **Arrow Keys** (↑ ↓ ← →) - Move cursor one cell in any direction
- Cursor automatically stops at grid boundaries
- Cursor becomes visible when you press arrow keys
- Cursor hides when you use mouse or touch

## Game Actions

### Reveal Cell
- **Space** - Reveal the cell at cursor position
- **Enter** - Reveal the cell at cursor position

Both Space and Enter work the same way for revealing cells.

### Flag Cell
- **F** - Toggle flag on/off at cursor position

Flagged cells are marked to indicate potential mines.

### Chord (Auto-Reveal)
- **C** - Chord at cursor position (reveals all neighbors if flags match mine count)
- **Shift + Space** - Alternative chord shortcut

Chording only works on already-revealed cells with a number. If you've placed the correct number of flags around a numbered cell, chording will automatically reveal all remaining neighbors.

## How It Works

1. **Start Game** - Canvas automatically receives focus when game begins
2. **Press Arrow Keys** - Gold cursor appears and you can navigate
3. **Use Actions** - Space/Enter to reveal, F to flag, C to chord
4. **Switch to Mouse** - Cursor disappears automatically when you move the mouse
5. **Switch Back** - Press any arrow key and cursor reappears

## Tips

- The gold keyboard cursor is visible only when using keyboard navigation
- Mouse hover (green border) and keyboard cursor (gold border) can both be active
- All keyboard shortcuts work only during gameplay (not in menus)
- Keyboard is disabled during game over screen

## Accessibility

MineQuest's keyboard controls follow **WCAG 2.1 Level AA** accessibility standards:

- ✅ All functionality accessible via keyboard
- ✅ Visible focus indicator (gold border with 3:1 contrast ratio)
- ✅ No keyboard traps
- ✅ Standard navigation pattern (arrow keys for grid, Space/Enter for actions)

## Supported Browsers

Keyboard navigation works in all modern browsers:
- Chrome/Edge (Windows, Mac, Linux)
- Firefox (Windows, Mac, Linux)
- Safari (Mac)

## Quick Reference

| Action | Keys |
|--------|------|
| Move Up | ↑ |
| Move Down | ↓ |
| Move Left | ← |
| Move Right | → |
| Reveal Cell | Space or Enter |
| Toggle Flag | F |
| Chord | C or Shift+Space |

---

**Note**: Touch controls remain unchanged. On mobile/tablet devices, tap to reveal and long-press (500ms) to flag.
