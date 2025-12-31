# LiMineZZsweeperIE - Quick Reference

_Made with love for Lizzie_ ✨

> **⭐ START HERE for new sessions** | **Read Time**: ~5 minutes

---

## 📋 Which Doc When?

| Situation | Read |
|-----------|------|
| Starting session | This file → [PROGRESS.md](PROGRESS.md) → [DEVELOPMENT.md](DEVELOPMENT.md) |
| Implementing feature | [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) → [GAME_DESIGN.md](GAME_DESIGN.md) → [ARCHITECTURE.md](ARCHITECTURE.md) |
| Strategic planning | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) → [DEVELOPMENT.md](DEVELOPMENT.md) |
| Claude Code | [CLAUDE.md](CLAUDE.md) (read first!) |

---

## 🎮 Core Game Rules

> **Authoritative source**: [GAME_DESIGN.md](GAME_DESIGN.md)

### Resources
| Resource | Icon | Earn | Spend | Note |
|----------|------|------|-------|------|
| **HP** | ❤️ | Start 3 | -1 per mine | 0 = game over |
| **Coins** | 🪙 | +10/cell | Shop items | Resets each run |
| **Mana** | 💎 | +5/cell, +10/flag | Active abilities | Cap: 100 |
| **Gems** | 💠 | Quest completion | Permanent unlocks | Persists forever |

### Run Flow
```
Quest → Character → 5 Boards (shops between) → Boss → Gems
```

### Board Progression
| Board | Size | Mines |
|-------|------|-------|
| 1 | 8×8 | 10 |
| 2 | 10×10 | 15 |
| 3 | 12×12 | 25 |
| 4 | 14×14 | 35 |
| 5 | 14×14 | 40 |
| Boss | 16×16 | 50 |

---

## 🏗️ Tech Stack

```
Vanilla JavaScript (ES6+) | Canvas + DOM | localStorage | No build step
```

### Key Files
| File | Purpose |
|------|---------|
| `src/core/GameState.js` | Single source of truth |
| `src/entities/Grid.js` | Minesweeper logic |
| `src/rendering/CanvasRenderer.js` | Grid visualization |
| `src/main.js` | Entry point, input handlers |

> **Complete file map**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 📱 Mobile-First (CRITICAL)

**Design for mobile FIRST. Desktop is an enhancement.**

- Touch: Tap reveal, long-press (500ms) flag
- **Mode Toggle**: FAB button to switch tap action (reveal ↔ flag)
- Targets: Minimum 44×44px (prefer 60×60px)
- Button position configurable (right/left for handedness)
- Test on mobile BEFORE desktop
- Never require hover

---

## 🎲 Game Content Summary

> **Complete details**: [GAME_DESIGN.md](GAME_DESIGN.md)

### Items (20 total)
- **Passive (10)**: Shield Generator, Coin Magnet, Mana Crystal, Lucky Charm, Fortify Armor, Treasure Sense, Flag Efficiency, Second Wind, Range Boost, Combo Master
- **Active (5)**: Scan Area, Safe Column, Mine Detector, Auto-Chord, Rewind
- **Consumable (5)**: Health Potion, Vision Scroll, Shield Token, Mana Potion, Lucky Coin

### Characters (5)
| Class | HP | Special |
|-------|-----|---------|
| Explorer | 3 | None (starter) |
| Scout | 3 | First reveal = 3×3 |
| Merchant | 3 | 2× coins |
| Tank | 5 | Regen HP |
| Mage | 2 | -25% ability cost |

### Quests (5)
Classic Clear • Treasure Hunter • Speed Runner • Perfect Game • Boss Slayer

---

## ✅ Current Status

> **Detailed progress**: [PROGRESS.md](PROGRESS.md) | **Roadmap**: [DEVELOPMENT.md](DEVELOPMENT.md)

- ✅ Phase 1: Core Minesweeper
- ✅ Phase 2A: HP, Coins, Mana
- ✅ Phase 2B: Items & Shop
- ✅ Phase 3: Quests, Characters, Progression
- ✅ Phase 4: Polish & Deploy

**Version**: 1.0.0 🎉

---

## 🔑 Design Principles

1. **Simplicity First** - Don't over-engineer
2. **Separation of Concerns** - Logic ≠ Rendering
3. **Mobile-First** - Design for touch, enhance for desktop
4. **No Feature Creep** - MVP first
5. **Playtest Early** - Validate fun after each phase

---

## 🚫 Anti-Patterns

- ❌ Desktop-first thinking
- ❌ Mixing game logic with rendering
- ❌ Hover-dependent UI
- ❌ Features before core is fun
- ❌ Unlocks required to win

---

## 🔗 Quick Links

| Doc | Purpose |
|-----|---------|
| [CLAUDE.md](CLAUDE.md) | Claude Code guidance |
| [GAME_DESIGN.md](GAME_DESIGN.md) | Complete mechanics |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Code patterns |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Roadmap & tasks |
| [PROGRESS.md](PROGRESS.md) | What's complete |
| [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) | Before coding |

---

**Version**: 1.0.0 | **Last Updated**: 2025-12-31
