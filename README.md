# 🎮 LiMineZZsweeperIE

> **When to Read This**: First-time users, public-facing documentation, or sharing the project
> **Read Time**: ~3 minutes

A modern, web-based minesweeper roguelike with quest-based objectives, power-ups, and progression.

_Made with love for Lizzie_ ✨

## 📚 Documentation Guide

### For Players
- **README.md** (this file) - How to play and game features

### For Developers
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - START HERE for new sessions, quick facts
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - High-level design and vision
- **[CLAUDE.md](CLAUDE.md)** - For AI assistants working on this project
- **[PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)** - Multi-session workflow protocol
- **[CHANGE_PROTOCOL.md](CHANGE_PROTOCOL.md)** - Change workflow & Definition of Done
- **[AUTOMATION_FRAMEWORK.md](AUTOMATION_FRAMEWORK.md)** - Testing & automation strategy

### Technical Details
- **[GAME_DESIGN.md](GAME_DESIGN.md)** - Complete mechanics and balancing
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Code structure and patterns
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Roadmap and task tracking

### Which Doc to Read When
| Situation | Read This |
|-----------|-----------|
| New to the project? | README.md → QUICK_REFERENCE.md |
| Starting work session? | QUICK_REFERENCE.md → PROGRESS.md |
| Making code changes? | CHANGE_PROTOCOL.md (Definition of Done) |
| Implementing features? | GAME_DESIGN.md + ARCHITECTURE.md |
| Need code patterns? | ARCHITECTURE.md |
| Planning next phase? | PROJECT_OVERVIEW.md + DEVELOPMENT.md |

---

## 🚀 Quick Start

1. Open `index.html` in your browser (or run `python -m http.server 8000`)
2. Click "Start Run" to begin
3. Reveal cells, avoid mines, and see how long you can survive!

**Currently Playable**: Core minesweeper with HP system, coins, mana, and configurable difficulty.

## 🎯 Features

### Currently Implemented ✅
- **HP Damage System**: Survive multiple mine hits (configurable 1-10 starting HP)
- **Resource Economy**: Earn coins (+10/cell) and mana (+5/cell, +10/flag)
- **Color-Coded HUD**: Real-time HP/Coins/Mana display with visual feedback
- **Multi-Input Support**: Mouse, keyboard (arrows/Space/F/C), and touch controls
- **Mobile-Friendly**: Tap to reveal, long-press to flag
- **Game Over Flow**: Stats display, new game, return to menu

### Coming Soon 🚧
- **Quest-Based Gameplay**: Different objectives each run
- **Roguelike Progression**: Collect items, build synergies
- **Character Classes**: 5 unique classes with different playstyles
- **Shop System**: Buy items between boards

## 🎲 How to Play

### Basic Controls

**Mouse:**
- Left-click to reveal cells
- Right-click to flag cells
- Click revealed numbers to chord (auto-reveal surrounding cells if flags match)

**Keyboard:**
- Arrow keys (↑ ↓ ← →) to navigate
- Space or Enter to reveal
- F to toggle flag
- C or Shift+Space to chord

**Touch (Mobile/Tablet):**
- Tap to reveal cells
- Long-press (500ms) to flag cells
- Tap revealed numbers to chord

All input methods work seamlessly together - switch between them anytime!

### Resources
- **HP**: Start with 3 HP. Hitting a mine costs 1 HP. 0 HP = game over
- **Coins**: Earned by revealing cells. Spend in shops between boards
- **Mana**: Powers active abilities. Recharges as you reveal cells

### Game Loop
1. Choose a quest objective
2. Select your character class
3. Clear 5 boards of increasing difficulty
4. Buy items in shops between boards
5. Defeat the boss board
6. Earn gems and unlock new content!

## 📦 Items

### Passive Items
Always active, provide continuous benefits (e.g., +1 HP, coin bonuses)

### Active Abilities
Cost mana to use, powerful tactical options (e.g., reveal area, detect mines)

### Consumables
Single-use items for emergencies (e.g., health potions, shield tokens)

## 👥 Character Classes

- **Explorer**: Balanced starter class
- **Scout**: Starts with vision abilities
- **Merchant**: Earns double coins
- **Tank**: Extra HP and regeneration
- **Mage**: Starts with mana and discounted abilities

## 🏆 Quests

- **Classic Clear**: Complete all boards
- **Treasure Hunter**: Earn 500+ coins
- **Speed Runner**: Finish in under 8 minutes
- **Perfect Game**: Take no damage
- **Boss Slayer**: Defeat the final boss

## 🛠️ Development

### Tech Stack
- Vanilla JavaScript (ES6+)
- HTML5 Canvas + DOM
- localStorage for saves
- No frameworks or build tools required

### Project Structure
```
src/
├── core/       - Game loop, state management
├── systems/    - Grid, shop, items, progression
├── rendering/  - Canvas & UI rendering
├── entities/   - Game objects (Cell, Grid, Item)
├── data/       - Item & quest definitions
└── utils/      - Helpers (RNG, storage, math)
```

### Documentation
See "Documentation Guide" section above for complete documentation map.

## 📝 License

MIT License - Feel free to use and modify!

## 🙏 Credits

Created with Claude Code

Inspired by:
- Classic Minesweeper
- DemonCrawl
- Slay the Spire
- Vampire Survivors

---

**Version**: 0.3.0
**Status**: Phase 2A Complete - Playable with HP/Coins/Mana
