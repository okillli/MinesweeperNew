# Feature: Configurable Starting HP

## Overview
Implemented a settings-based HP configuration system that allows players to choose their starting HP difficulty level (1-5 HP). Default is set to 1 HP (Hard mode).

---

## Changes Made

### 1. **Settings UI** ([index.html:175-183](index.html#L175-L183))
Added a dropdown menu in the Settings screen with 4 difficulty options:
- **1 HP (Hard)** - Default, one-hit death (original test mode)
- **2 HP (Medium)** - Two mistakes allowed
- **3 HP (Normal)** - Standard difficulty from design docs
- **5 HP (Easy)** - Forgiving mode for learning

```html
<div class="setting-item">
  <label for="starting-hp">Starting HP</label>
  <select id="starting-hp">
    <option value="1" selected>1 HP (Hard)</option>
    <option value="2">2 HP (Medium)</option>
    <option value="3">3 HP (Normal)</option>
    <option value="5">5 HP (Easy)</option>
  </select>
</div>
```

---

### 2. **GameState Persistent Storage** ([GameState.js:104-108](src/core/GameState.js#L104-L108))
Added `settings` object to persistent state:

```javascript
this.persistent = {
  gems: 0,
  settings: {
    startingHp: 1,       // Starting HP for new runs (default 1)
    soundEnabled: true,  // Sound effects toggle
    musicEnabled: true   // Music toggle
  },
  // ... rest of persistent state
}
```

**Benefits**:
- Settings persist across sessions (when SaveSystem is implemented)
- Organized structure for future settings
- Audio settings ready for Phase 2+

---

### 3. **Game Initialization** ([main.js:47-50](src/main.js#L47-L50), [main.js:257-260](src/main.js#L257-L260))

**Removed**: `TEST_MODE` constant (was hardcoded)

**Added**: Helper function to read HP from settings:
```javascript
function getStartingHP() {
  return game.state.persistent.settings.startingHp;
}
```

**Updated**: Both game start locations now use settings:
```javascript
// Start Run button
const startingHp = getStartingHP();
game.state.currentRun.hp = startingHp;
game.state.currentRun.maxHp = startingHp;

// New Game button (from game over)
const startingHp = getStartingHP();
game.state.currentRun.hp = startingHp;
game.state.currentRun.maxHp = startingHp;
```

---

### 4. **Settings Handlers** ([main.js:425-489](src/main.js#L425-L489))

**Added**:
- `loadSettings()` - Loads settings from GameState into UI
- `saveSettings()` - Saves settings from UI to GameState
- Event handlers for all setting controls
- Auto-save on change (no "Save" button needed)

**Flow**:
1. User changes dropdown → `change` event fires
2. `saveSettings()` writes to `game.state.persistent.settings`
3. Next game starts with new HP value
4. Settings persist until cleared

---

## User Experience

### Changing HP Setting
1. Click **Settings** from main menu
2. Select desired HP from **"Starting HP"** dropdown
3. Setting saves automatically (see console log)
4. Return to menu and click **Start Run**
5. New game starts with selected HP

### Default Behavior
- **First time**: Game starts with 1 HP (Hard mode)
- **After change**: Game remembers your preference
- **After clear save**: Resets to 1 HP default

---

## Testing Checklist

- [x] UI displays default value (1 HP) on load
- [x] Changing dropdown updates GameState immediately
- [x] Starting a new game uses selected HP value
- [x] "New Game" from game over uses selected HP value
- [x] HUD displays correct HP (e.g., "1/1", "3/3", "5/5")
- [x] Settings screen reloads current values when opened
- [x] Clear Save Data resets HP to 1 (default)
- [x] Console logs confirm save/load operations

---

## Code Quality

### Architecture Alignment
✅ **Separation of Concerns**: Settings in persistent state, UI in HTML, logic in handlers
✅ **Single Source of Truth**: HP value stored once in `GameState.persistent.settings`
✅ **DRY Principle**: `getStartingHP()` function used in both start locations
✅ **Future-Proof**: Settings structure supports audio and future options

### No Breaking Changes
- Existing game logic unchanged
- HP mechanics remain the same (1 damage per mine)
- Game over conditions unchanged
- Character system will still support HP modifiers when implemented

---

## Future Enhancements (Phase 2+)

When implementing SaveSystem:
1. Call `loadSettings()` after loading save data
2. Merge loaded settings with defaults for new fields
3. Save settings on page unload

When implementing audio:
1. `settings.soundEnabled` already in place
2. `settings.musicEnabled` already in place
3. Just wire up to audio system

When implementing Characters:
- Character `startingHp` will ADD to base setting HP
- Example: Setting=3 HP + Explorer bonus=0 → 3 HP total
- Example: Setting=3 HP + Tank bonus=2 → 5 HP total

---

## Files Modified

1. **[index.html](index.html)** - Added HP dropdown to settings screen
2. **[src/core/GameState.js](src/core/GameState.js)** - Added settings to persistent state
3. **[src/main.js](src/main.js)** - Removed TEST_MODE, added settings handlers

---

## Technical Notes

### Why Default is 1 HP
Per user request: "default to be 1, not 3"
- Creates high-skill ceiling gameplay
- Encourages careful flag usage
- Makes mistakes meaningful
- Players can opt into easier modes

### Implementation Strategy
- **Immediate save**: No "Apply" button needed - changes save on selection
- **UI sync**: Settings screen reloads values on open to stay in sync
- **Type safety**: `parseInt()` ensures HP is always a number
- **Validation**: Dropdown constraints ensure valid HP values (1, 2, 3, or 5)

---

**Status**: ✅ Complete and tested
**Default HP**: 1 (Hard mode)
**User Control**: Full - can change anytime from settings
