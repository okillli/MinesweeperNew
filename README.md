# 🎮 MineQuest

A modern, web-based minesweeper roguelike with quest-based objectives, power-ups, and progression.

## 🚀 Quick Start

1. Open `index.html` in your browser
2. Choose a quest and character
3. Clear boards, collect items, and complete objectives!

## 🎯 Features

- **Quest-Based Gameplay**: Different objectives each run (treasure hunts, speed runs, perfect clears)
- **Roguelike Progression**: Collect items, build synergies, unlock new content
- **Character Classes**: 5 unique classes with different playstyles
- **Mobile-Friendly**: Touch controls optimized for mobile browsers
- **No Installation**: Runs directly in your browser

## 🎲 How to Play

### Basic Controls
- **Desktop**: Left-click to reveal, right-click to flag
- **Mobile**: Tap to reveal, long-press to flag
- **Chord**: Click a revealed number to auto-reveal surrounding cells (if flags match)

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
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - High-level summary
- [GAME_DESIGN.md](GAME_DESIGN.md) - Detailed game mechanics
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development roadmap

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

**Version**: 0.1.0 (Pre-MVP)
**Status**: In Development
