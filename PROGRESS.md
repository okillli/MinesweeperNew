# LiMineZZsweeperIE - Progress

_Made with love for Lizzie_

> **Quick status check** | **Read Time**: ~2 minutes

---

## Current Status

| Phase | Status | Completed |
|-------|--------|-----------|
| Phase 1: Core Minesweeper | Complete | 2025-12-30 |
| Phase 2A: Resources | Complete | 2025-12-30 |
| Phase 2B: Items & Shop | Complete | 2025-12-30 |
| Phase 3: Progression | Complete | 2025-12-30 |
| Phase 4: Polish | Next | — |

**Version**: 0.5.0

---

## What's Working

### Core Gameplay
- Complete minesweeper (reveal, flag, chord, cascade)
- HP damage system (configurable 1-10 starting HP)
- Coins (+10 per safe cell, modified by items)
- Mana (+5 per cell, +10 per flag, modified by items)
- Color-coded HUD

### Item System (NEW)
- 20 items: 10 passives, 5 actives, 5 consumables
- Passive effects (stat modifiers, multipliers)
- Active abilities (Scan Area, Mine Detector, etc.)
- Consumables (Health Potion, Shield Token, etc.)

### Shop System (NEW)
- Weighted random item generation
- Rarity system (common, rare, legendary)
- Purchase flow with validation
- Lucky Charm rarity bonus

### Board Progression (NEW)
- 6-board progression (Tutorial → Boss)
- Scaling difficulty and coin multipliers
- Shop between boards
- Victory screen after Board 6

### Input Systems
- Mouse (click, right-click, hover)
- Touch (tap, long-press, haptic)
- Keyboard (arrows, Space, F, C)
- Seamless mode switching
- **NEW**: Input mode toggle (FAB button to switch tap action between reveal/flag)
- Configurable button position (left/right for handedness)

### Progression System (NEW)
- 5 quests with objectives and gem rewards
- 5 character classes with unique passives
- Quest selection screen
- Character selection screen
- Gem currency for unlocking content
- Save/load system (localStorage)

### UI/UX
- Menu navigation
- Settings screen
- Shop screen
- Quest selection screen
- Character selection screen
- Game over overlay
- Victory screen
- Real-time HUD updates

---

## Next Up: Phase 4

1. Animations (reveal, damage, effects)
2. Tutorial/onboarding
3. Deploy to GitHub Pages

> See [DEVELOPMENT.md](DEVELOPMENT.md) for full roadmap

---

## Key Files

| File | Purpose |
|------|---------|
| `src/main.js` | Entry point, input handlers (~2000 lines) |
| `src/entities/Grid.js` | Minesweeper logic |
| `src/core/GameState.js` | Central state |
| `src/rendering/CanvasRenderer.js` | Grid rendering |
| `src/data/items.js` | Item definitions (20 items) |
| `src/data/boards.js` | Board configurations |
| `src/data/quests.js` | Quest definitions (5 quests) |
| `src/data/characters.js` | Character definitions (5 classes) |
| `src/systems/ItemSystem.js` | Item effect processing |
| `src/systems/ShopSystem.js` | Shop generation & purchases |
| `src/systems/SaveSystem.js` | localStorage persistence |

---

## Known Issues

None currently.

---

## Technical Debt

- Global scripts (may migrate to ES6 modules later)
- Console logging (implement proper logging system)
- Some items not fully implemented (Rewind ability)

---

## Related Docs

| Doc | Purpose |
|-----|---------|
| [DEVELOPMENT.md](DEVELOPMENT.md) | Full roadmap & tasks |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick facts |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Code patterns |

---

**Last Updated**: 2025-12-30
