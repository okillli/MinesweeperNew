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
| Phase 4: Polish | In Progress | — |

**Version**: 0.6.0

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

### Visual Effects System
- Particle system with object pooling
- Floating text system (+coins, -HP, +mana)
- Mine explosion particles (red/orange/yellow burst)
- Damage feedback (screen shake + red vignette flash)
- Coin sparkle effects (gold particles)
- Flag placement effect (orange sparkle)
- Victory confetti (colorful falling particles)
- HUD stat animations (pulse on change)
- Respects `prefers-reduced-motion` accessibility setting

### Pan/Zoom Camera System (NEW)
- Virtual camera for large boards (15x15+)
- Mouse wheel zoom with focal-point tracking
- Pinch-to-zoom on mobile (zoom toward pinch center)
- Two-finger pan gesture on mobile
- Middle-mouse drag to pan on desktop
- Zoom controls (+/-/Fit buttons)
- Minimap for boards 25x25+ with click-to-navigate
- Frustum culling for performance
- Auto-pan keeps keyboard cursor visible

---

## Next Up: Phase 4 (Continued)

### Remaining Visual Effects
- Cell reveal cascade animation (staggered reveal)
- Button press ripple effect
- Defeat screen desaturation
- Shop purchase effects
- Mana/ability usage effects
- Board transition animation
- Number pop on reveal
- Ambient background effects

### Other Phase 4 Items
1. Tutorial/onboarding
2. Deploy to GitHub Pages

> See [DEVELOPMENT.md](DEVELOPMENT.md) for full roadmap

---

## Key Files

| File | Purpose |
|------|---------|
| `src/main.js` | Entry point, input handlers (~2600 lines) |
| `src/entities/Grid.js` | Minesweeper logic |
| `src/core/GameState.js` | Central state |
| `src/core/Game.js` | Game loop orchestration |
| `src/rendering/CanvasRenderer.js` | Grid rendering |
| `src/data/items.js` | Item definitions (20 items) |
| `src/data/boards.js` | Board configurations |
| `src/data/quests.js` | Quest definitions (5 quests) |
| `src/data/characters.js` | Character definitions (5 classes) |
| `src/systems/ItemSystem.js` | Item effect processing |
| `src/systems/ShopSystem.js` | Shop generation & purchases |
| `src/systems/SaveSystem.js` | localStorage persistence |
| `src/systems/ParticleSystem.js` | Particle effects (explosions, sparkles) |
| `src/systems/FloatingTextSystem.js` | Floating text (+coins, -HP) |
| `src/systems/EffectsManager.js` | Central effects coordinator |
| `src/core/Camera.js` | Virtual camera for pan/zoom |
| `src/rendering/MinimapRenderer.js` | Minimap for large boards |

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

**Last Updated**: 2025-12-31 (Pan/Zoom Camera System added)
