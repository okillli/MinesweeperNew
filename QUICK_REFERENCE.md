# LiMineZZsweeperIE - Quick Reference Guide

_Made with love for Lizzie_ ✨

> **⭐ START HERE for new sessions**
>
> **When to Read This**: Beginning of every work session, when you need quick facts
> **Related Docs**: All other docs link here for quick reference
> **Read Time**: ~5 minutes (skim), ~10 minutes (full read)

This is your one-stop reference for essential information needed during development.

## 📋 Which Doc to Read When

### Starting a Work Session
1. **QUICK_REFERENCE.md** (this file) - Refresh context (2 min)
2. **[PROGRESS.md](PROGRESS.md)** - See what's complete (1 min)
3. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Find next task (1 min)

### Implementing Features
1. **[GAME_DESIGN.md](GAME_DESIGN.md)** - Mechanics & balancing
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Code patterns & structure
3. **This file** - Quick reference for constants/rules

### Strategic Planning
1. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Vision & principles
2. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Roadmap & phases
3. **[PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)** - Multi-session workflow

### For AI Assistants
1. **[CLAUDE.md](CLAUDE.md)** - Claude-specific guidance (read first!)
2. **This file** - Quick facts during work
3. **[PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)** - Session protocols

## 📋 Essential Documents Table

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | This file - quick facts, constants | Every session start |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | High-level concept, design principles | Strategic decisions, first session |
| [GAME_DESIGN.md](GAME_DESIGN.md) | Complete game mechanics, balancing | Implementing features |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Code structure, patterns, systems | Writing code |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Roadmap, tasks, progress tracking | Planning work |
| [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md) | Multi-session workflow, coordination | Before starting any work |
| [CLAUDE.md](CLAUDE.md) | AI assistant guidance | For Claude Code instances |
| [README.md](README.md) | User-facing documentation | Public/player questions |

---

## 🎮 Core Game Rules (Never Forget)

> See [GAME_DESIGN.md](GAME_DESIGN.md) for complete mechanics details

### Resource System
- **HP**: Start with 3, hitting mine costs 1, 0 HP = game over
- **Coins**: +10 per cell revealed, spend in shops
- **Mana**: +5 per cell revealed, powers active abilities
- **Gems**: Earned after runs, unlock new content

### Run Structure
1. Choose quest & character → 2. Play 5 boards → 3. Shop between boards → 4. Boss board → 5. Earn gems

### Board Progression
| Board | Size | Mines | Density |
|-------|------|-------|---------|
| 1 | 8x8 | 10 | 15.6% |
| 2 | 10x10 | 15 | 15% |
| 3 | 12x12 | 25 | 17.4% |
| 4 | 14x14 | 35 | 17.9% |
| 5 | 14x14 | 40 | 20.4% |
| 6 (Boss) | 16x16 | 50 | 19.5% |

## 🏗️ Technical Stack

> See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical architecture

```
Language: Vanilla JavaScript (ES6+)
Rendering: Canvas (grid) + DOM (UI)
Storage: localStorage
Hosting: GitHub Pages
Build: None (vanilla JS)
```

## 📁 Key Files & Responsibilities

> See [ARCHITECTURE.md](ARCHITECTURE.md) for complete file structure and patterns

### Data Files (Define Content)
- `src/data/constants.js` - Game constants (grid sizes, costs, etc.)
- `src/data/items.js` - All 20 items (passive, active, consumable)
- `src/data/quests.js` - 5 quest definitions
- `src/data/characters.js` - 5 character class definitions

### Core Systems (Game Logic)
- `src/core/Game.js` - Main game loop (RAF)
- `src/core/GameState.js` - Centralized state management
- `src/core/StateMachine.js` - Screen/state transitions
- `src/core/EventBus.js` - Event communication

### Game Systems (Features)
- `src/systems/GridSystem.js` - Minesweeper logic
- `src/systems/ShopSystem.js` - Shop & purchasing
- `src/systems/ItemSystem.js` - Item effects & management
- `src/systems/QuestSystem.js` - Quest tracking
- `src/systems/ProgressionSystem.js` - Unlocks & achievements
- `src/systems/SaveSystem.js` - localStorage save/load

### Entities (Game Objects)
- `src/entities/Cell.js` - Individual grid cell
- `src/entities/Grid.js` - Minesweeper grid container
- `src/entities/Item.js` - Item base class
- `src/entities/Character.js` - Character class

### Rendering (Visual)
- `src/rendering/CanvasRenderer.js` - Grid drawing
- `src/rendering/UIRenderer.js` - DOM UI updates
- `src/rendering/effects.js` - Visual effects (juice)

## 🎯 MVP Checklist

> See [DEVELOPMENT.md](DEVELOPMENT.md) for complete roadmap and task details

### Phase 1: Core Proof of Fun ✅ Started
- [x] Project setup & documentation
- [x] File structure created
- [x] Git initialized
- [x] HTML/CSS templates
- [ ] Basic minesweeper (Cell, Grid classes)
- [ ] Canvas rendering
- [ ] Click handling
- [ ] Simple game loop

### Phase 2: Roguelike Elements (Next)
- [ ] HP/Coins/Mana systems
- [ ] 20 items implemented
- [ ] Shop system
- [ ] Multi-board runs
- [ ] Item effects working

### Phase 3: Progression
- [ ] Quest system
- [ ] Character classes
- [ ] Gems & unlocks
- [ ] Save/load
- [ ] Boss board

### Phase 4: Polish
- [ ] Animations & juice
- [ ] Mobile controls
- [ ] Tutorial
- [ ] Deploy to GitHub Pages

## 🔑 Key Design Principles

> See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for complete design philosophy

1. **Simplicity First**: Don't over-engineer, start simple
2. **Separation of Concerns**: Logic ≠ Rendering
3. **Mobile-First**: Touch controls, responsive design
4. **No Feature Creep**: MVP first, expand later
5. **Playtesting**: Test fun factor after each phase

## 🎲 Item Categories (20 Total)

> See [GAME_DESIGN.md](GAME_DESIGN.md) for complete item details and effects

### Passive (10)
Shield Generator, Coin Magnet, Mana Crystal, Lucky Charm, Fortify Armor, Treasure Sense, Flag Efficiency, Second Wind, Range Boost, Combo Master

### Active (5)
Scan Area, Safe Column, Mine Detector, Auto-Chord, Rewind

### Consumable (5)
Health Potion, Vision Scroll, Shield Token, Mana Potion, Lucky Coin

## 👥 Character Classes (5)

| Class | HP | Mana | Special |
|-------|-----|------|---------|
| Explorer | 3 | 0 | None (starter) |
| Scout | 3 | 50 | First reveal = 3x3 area |
| Merchant | 3 | 0 | 2x coins |
| Tank | 5 | 0 | Regen 1 HP/3 boards |
| Mage | 2 | 150 | Abilities cost -25% |

## 🎯 Quests (5)

1. **Classic Clear**: Complete all boards
2. **Treasure Hunter**: Earn 500+ coins
3. **Speed Runner**: Finish in <8 minutes
4. **Perfect Game**: Take no damage
5. **Boss Slayer**: Defeat final boss

## 🚫 Anti-Patterns to Avoid

- ❌ Adding features before core loop is fun
- ❌ Mixing game logic with rendering
- ❌ Over-engineering simple systems
- ❌ Ignoring mobile from the start
- ❌ Making unlocks required to win

## 💾 Save Data Structure

```javascript
{
  version: '1.0.0',
  persistent: {
    gems: 0,
    unlockedItems: [],
    unlockedCharacters: [],
    unlockedQuests: [],
    achievements: [],
    stats: { totalRuns, totalWins, totalCoins, etc. }
  }
}
```

## 🎨 Color Palette

- Background: `#1a1a2e` (dark blue)
- Accent: `#f4a261` (orange)
- Secondary: `#e76f51` (red-orange)
- Text: `#eee` (light gray)
- Mines: `#e63946` (red)
- Flags: `#f4a261` (yellow)

## 📱 Mobile Considerations

- **Touch Controls**: Tap reveal, long-press flag
- **Min Touch Target**: 44x44px
- **Viewport**: `width=device-width, initial-scale=1, user-scalable=no`
- **Performance**: Target 30+ FPS on mid-range phones

## 🔄 Development Workflow

1. **Read relevant docs** before starting work
2. **Update DEVELOPMENT.md** with progress
3. **Test frequently** - playtest after each feature
4. **Commit often** with descriptive messages
5. **Document decisions** in this file or design docs

## 📞 Quick Commands

```bash
# Start development (just open index.html in browser)
# No build process needed!

# Initialize git (already done)
git init

# Commit changes
git add .
git commit -m "Description of changes"

# Deploy to GitHub Pages (when ready)
# Create repo on GitHub, then:
git remote add origin <repo-url>
git push -u origin main
# Enable GitHub Pages in repo settings
```

## 🎯 Next Immediate Steps

1. Implement `Cell.js` and `Grid.js` (minesweeper logic)
2. Implement `CanvasRenderer.js` (draw grid)
3. Wire up click handlers
4. Test basic minesweeper gameplay
5. **PLAYTEST** - Is it fun?

---

**Pro Tips:**
- Read [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) if losing context
- Check [ARCHITECTURE.md](ARCHITECTURE.md) before writing code
- Update [DEVELOPMENT.md](DEVELOPMENT.md) when completing tasks
- Follow [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md) for multi-session work
- Playtest early and often!
- Keep it simple - complexity kills momentum

---

## 🔗 Quick Navigation

- **Up**: [README.md](README.md) - Main project page
- **Strategic**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Vision & principles
- **Implementation**: [GAME_DESIGN.md](GAME_DESIGN.md) + [ARCHITECTURE.md](ARCHITECTURE.md)
- **Planning**: [DEVELOPMENT.md](DEVELOPMENT.md) - Tasks & roadmap
- **Workflow**: [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md) - Session protocols

**Last Updated**: 2025-12-30
