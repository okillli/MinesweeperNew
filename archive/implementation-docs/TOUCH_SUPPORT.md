# Mobile and Tablet Touch Support

## Overview
Complete touch support has been implemented for mobile and tablet devices, allowing the game to be fully playable on touchscreen devices alongside traditional mouse and keyboard controls.

## Features

### Touch Interactions
1. **Tap to Reveal**
   - Quick tap (< 500ms) on an unrevealed cell reveals it
   - Tap on a revealed cell attempts to chord (auto-reveal adjacent cells if flags match mine count)
   - Same behavior as left-click on desktop

2. **Long-Press to Flag**
   - Hold finger on an unrevealed cell for 500ms to toggle flag
   - Visual haptic feedback (50ms vibration) when available
   - Prevents accidental flags from quick taps
   - Same behavior as right-click on desktop

3. **Touch Movement Tolerance**
   - 10-pixel movement threshold allows for natural finger tremor
   - Movements beyond threshold cancel the action (prevents accidental reveals/flags during scrolling)

### Touch Target Optimization
- **Minimum Touch Target Size**: 44x44 pixels (meets Apple and Android accessibility guidelines)
- Cell size increased from 40px to 44px in `CanvasRenderer.js`
- Adequate spacing maintained with 2px padding between cells

### Prevention of Double-Firing
- Touch events are properly isolated from mouse events
- On touch devices, both touch and mouse events fire - implementation prevents duplicate actions
- 300ms cooldown period after touch interactions prevents mouse event interference

### Context Menu Handling
- Long-press does not trigger browser context menu
- Context menu only appears for right-click on desktop
- Uses `preventDefault()` on touch events to avoid unwanted browser behaviors

## Implementation Details

### Files Modified
1. **`src/main.js`** (lines 444-744)
   - Added touch event handlers: `handleTouchStart`, `handleTouchMove`, `handleTouchEnd`, `handleTouchCancel`
   - Implemented touch state tracking with timers
   - Added touch-aware wrappers for mouse event handlers
   - Registered touch event listeners with `passive: false` to enable `preventDefault()`

2. **`src/rendering/CanvasRenderer.js`** (line 27)
   - Updated `cellSize` from 40px to 44px for proper touch target size

### Touch State Tracking
```javascript
let touchStartTime = 0;           // Timestamp when touch began
let touchStartPos = null;          // Starting coordinates {x, y}
let longPressTimer = null;         // setTimeout reference for long-press
let longPressTriggered = false;    // Flag indicating long-press occurred
let touchHandled = false;          // Prevents mouse event double-firing
```

### Constants
- `LONG_PRESS_DURATION = 500` ms (time to hold for flag)
- `TOUCH_MOVE_THRESHOLD = 10` px (max movement allowed)

### Event Flow

#### Tap to Reveal
1. `touchstart` - Record time and position, set long-press timer
2. `touchend` (< 500ms) - Cancel timer, execute reveal action
3. Mouse events ignored via `touchHandled` flag

#### Long-Press to Flag
1. `touchstart` - Record time and position, set 500ms timer
2. Timer fires after 500ms - Toggle flag, set `longPressTriggered`
3. `touchend` - Skip reveal action since `longPressTriggered` is true
4. Optional haptic feedback via `navigator.vibrate(50)`

#### Movement Cancellation
1. `touchmove` - Calculate distance from start position
2. If distance > 10px - Cancel long-press timer, clear touch state
3. Prevents accidental actions during scrolling

## Browser Compatibility
- Works on all modern mobile browsers (iOS Safari, Chrome Mobile, Firefox Mobile, Edge Mobile)
- Uses standard Touch Events API (widely supported)
- Haptic feedback (`navigator.vibrate`) available on Android, optional on iOS

## Testing Recommendations
1. Test on actual devices (not just emulators) for accurate touch behavior
2. Verify touch targets feel natural and responsive
3. Test with different hand sizes and finger positions
4. Verify no interference between touch and mouse on hybrid devices (e.g., Surface)
5. Test long-press timing feels natural (not too fast or slow)

## Mobile-First Design Compliance
This implementation follows the mobile-first principles outlined in `CLAUDE.md`:
- ✓ Touch targets minimum 44x44px
- ✓ Long-press (500ms) for flag
- ✓ Tap for reveal
- ✓ Prevents context menu on long-press
- ✓ Works alongside desktop mouse controls

## Future Enhancements
Potential improvements for mobile experience:
- Add visual feedback during long-press (progress ring around cell)
- Implement pinch-to-zoom for smaller grids on mobile
- Add swipe gestures for quick flag/reveal modes
- Responsive canvas sizing based on viewport
- Portrait vs landscape layout optimization
