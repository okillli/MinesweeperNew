# Touch Event Flow Diagram

## Tap to Reveal Flow

```
User taps screen
       |
       v
handleTouchStart
  - Record time & position
  - Start 500ms timer for long-press
  - Validate cell coordinates
       |
       v
User lifts finger quickly (< 500ms)
       |
       v
handleTouchEnd
  - Cancel long-press timer
  - Check duration < 500ms? YES
  - Check movement < 10px? YES
  - Execute reveal action
  - Set touchHandled = true
  - Clear touchHandled after 300ms
       |
       v
Cell revealed ✓
```

## Long-Press to Flag Flow

```
User touches screen
       |
       v
handleTouchStart
  - Record time & position
  - Start 500ms timer
  - Validate cell coordinates
       |
       v
User holds finger (500ms+)
       |
       v
Long-press timer fires
  - Toggle flag on cell
  - Set longPressTriggered = true
  - Set touchHandled = true
  - Trigger haptic feedback (vibrate 50ms)
       |
       v
User lifts finger
       |
       v
handleTouchEnd
  - Cancel timer (already fired)
  - Check longPressTriggered? YES
  - Skip reveal action
  - Clear state
       |
       v
Flag toggled ✓
```

## Movement Cancellation Flow

```
User touches screen
       |
       v
handleTouchStart
  - Record time & position at (100, 100)
  - Start 500ms timer
       |
       v
User moves finger (swipe/scroll)
       |
       v
handleTouchMove
  - Get current position (120, 140)
  - Calculate distance: sqrt(20² + 40²) = 44.7px
  - Check distance > 10px? YES
  - Cancel long-press timer
  - Clear touchStartPos
       |
       v
User lifts finger
       |
       v
handleTouchEnd
  - touchStartPos is null
  - No action taken
       |
       v
Action cancelled (prevents accidental tap during scroll) ✓
```

## Double-Fire Prevention Flow

```
User taps on touch device
       |
       v
handleTouchStart → handleTouchEnd
  - Execute reveal action
  - Set touchHandled = true
       |
       v
Browser fires mouse events (300ms later)
       |
       v
handleLeftClickWithTouchCheck
  - Check touchHandled? YES
  - Return early (do nothing)
       |
       v
No duplicate action ✓
       |
       v
After 300ms: touchHandled = false
```

## Chord (Tap on Revealed Cell) Flow

```
User taps revealed cell with number "3"
       |
       v
handleTouchStart → handleTouchEnd
  - Quick tap detected
  - Cell is already revealed
       |
       v
grid.chord(x, y)
  - Count adjacent flags
  - Check if flags == cell number (3)
  - If match: reveal all unflagged neighbors
       |
       v
Multiple cells revealed ✓
```

## Touch Cancel Flow

```
User touches screen
       |
       v
handleTouchStart
  - Start long-press timer
       |
       v
External interruption occurs
(e.g., phone call, notification, app switch)
       |
       v
handleTouchCancel
  - Cancel long-press timer
  - Clear touchStartPos
  - Set longPressTriggered = false
       |
       v
State cleaned up ✓
```

## State Tracking Variables

```
touchStartTime: number
  - Timestamp when touch began (Date.now())
  - Used to calculate tap vs long-press duration
  - Reset on touchend/touchcancel

touchStartPos: {x: number, y: number} | null
  - Canvas coordinates where touch began
  - Used to detect movement (swipe vs tap)
  - null = no active touch

longPressTimer: number | null
  - setTimeout ID for 500ms timer
  - Cleared on touchmove (if movement > threshold)
  - Cleared on touchend (if early lift)
  - null = no active timer

longPressTriggered: boolean
  - true = long-press completed, flag was toggled
  - Prevents reveal action on touchend
  - Reset on touchstart

touchHandled: boolean
  - true = touch action was executed
  - Prevents mouse events from double-firing
  - Auto-clears after 300ms
```

## Coordinate Conversion

```
Touch Event
    |
    v
touch.clientX, touch.clientY
    |
    v
canvas.getBoundingClientRect()
    |
    v
canvasX = clientX - rect.left
canvasY = clientY - rect.top
    |
    v
canvasToGrid(canvasX, canvasY)
    |
    v
gridX = floor((canvasX - offsetX) / (cellSize + padding))
gridY = floor((canvasY - offsetY) / (cellSize + padding))
    |
    v
Validate bounds: 0 <= gridX < width, 0 <= gridY < height
    |
    v
Return {x: gridX, y: gridY} or null
```

## Event Listener Setup

```
canvas element
    |
    +-- touchstart (passive: false)
    |       → handleTouchStart
    |
    +-- touchmove (passive: false)
    |       → handleTouchMove
    |
    +-- touchend (passive: false)
    |       → handleTouchEnd
    |
    +-- touchcancel (passive: false)
    |       → handleTouchCancel
    |
    +-- click
    |       → handleLeftClickWithTouchCheck
    |           → if (!touchHandled) → handleLeftClick
    |
    +-- contextmenu
            → handleRightClickWithTouchCheck
                → if (longPressTriggered) → preventDefault
                → else → handleRightClick
```

## Timing Diagram

```
Time: 0ms          500ms         800ms
      |              |             |
Tap:  [touchstart]   |    [touchend]
      START          |    REVEAL
      timer          |    cancel timer
                     |
Long: [touchstart]   [timer fires] [touchend]
      START          FLAG         CLEANUP
      timer          vibrate      skip reveal
                     set flag
```

## Decision Tree

```
                    touchstart
                        |
                        v
              Record time & position
              Start 500ms timer
                        |
                        v
              Wait for user action
                        |
           +------------+------------+
           |            |            |
           v            v            v
       touchmove    timer fires   touchend
           |            |            |
      Distance > 10?   |        Duration < 500?
           |            |            |
       YES | NO     Toggle flag     YES | NO
           |            |            |
       Cancel     Set triggered    Reveal | Skip
       timer      Vibrate           |       |
                                  Action  Cleanup
```
