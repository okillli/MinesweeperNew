# MineQuest - Project Overview

> **When to Read This**: First session, strategic planning, or when you need to understand the "why" behind decisions
> **Related Docs**: [GAME_DESIGN.md](GAME_DESIGN.md) for mechanics, [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
> **Read Time**: ~5 minutes

## 🎮 Game Concept

**MineQuest** is a web-based minesweeper roguelike that combines classic minesweeper mechanics with roguelike progression, power-ups, and quest-based objectives.

### Unique Selling Points
- **Quest-based objectives**: Different goals each run (rescue missions, treasure hunts, speed runs)
- **Mobile-first design**: Touch-optimized, vertical orientation, one-handed play
- **Minimalist aesthetic**: Clean, modern design with multiple themes
- **Quick sessions**: 5-10 minute runs perfect for casual play
- **Simple but deep**: Easy to learn, hard to master

## 🎯 Core Design Principles

1. **Simplicity First**: Core is just minesweeper + items
2. **Web-Native**: Runs in any browser, no installation
3. **Mobile-Friendly**: Touch controls, responsive design
4. **Not Overcomplicated**: Start with 20 items, add more later
5. **Fair Progression**: Unlocks add variety, not just power

## 🔑 Key Game Rules

> See [GAME_DESIGN.md](GAME_DESIGN.md) for complete mechanics and balancing details

### Minesweeper Mechanics
- Classic minesweeper grid (numbers show adjacent mine count)
- Left-click/tap to reveal cells
- Right-click/long-press to flag mines
- Chording: Click revealed number to auto-reveal if flags match

### Core Gameplay Loop (Single Run)
1. Choose quest objective & character class
2. Play through 5 boards (increasing difficulty)
3. Earn coins by revealing safe cells (+10 per cell)
4. Shop appears between boards (buy items with coins)
5. Build synergies with items collected
6. Face boss board (special challenge)
7. Complete quest → earn gems → unlock new content

### Resource System
- **HP (Health Points)**: Start with 3 HP, hitting mine costs 1 HP, 0 HP = run ends
- **Coins**: In-run currency, earned by revealing cells, spent in shops
- **Mana**: Rechargeable resource for active abilities, +5 per cell revealed
- **Gems**: Meta-currency, earned after runs, spent on permanent unlocks

### Progression
- **In-Run**: Collect items, build synergies, get stronger within single run
- **Meta**: Unlock new items, character classes, quests with gems
- **No Power Creep**: Unlocks add variety/options, not just stat increases

## 📊 Target Metrics

- **Run Duration**: 5-10 minutes
- **Item Count (MVP)**: 20 total (10 passive, 5 active, 5 consumable)
- **Boards Per Run**: 5 normal + 1 boss
- **Starting Grid Size**: 10x10
- **Max Grid Size**: 16x16 (boss board)

## 🎨 Theme & Aesthetic

### Visual Style
- **Minimalist**: Clean lines, clear iconography
- **High Contrast**: Accessible color schemes
- **Responsive**: Scales from mobile to desktop

### Theme Options (Choose One for MVP)
1. **Space Station**: Sci-fi, exploring derelict station
2. **Underwater Lab**: Ocean research facility
3. **Archaeological Dig**: Ancient ruins excavation

## 🏗️ Technical Architecture

> See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed code structure and patterns

### Tech Stack
- **Language**: Vanilla JavaScript (ES6+)
- **Rendering**: HTML5 Canvas (game grid) + DOM (UI)
- **Storage**: localStorage for saves
- **Hosting**: GitHub Pages (free, simple)
- **Build**: No build tools needed (vanilla JS)

### File Structure
```
/src
  /core     - Game loop, state management
  /systems  - Grid logic, shop, power-ups
  /rendering - Canvas & UI rendering
  /data     - Item & quest definitions
  /utils    - Save/load, RNG, helpers
```

## 📈 Development Phases

> See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed roadmap and task breakdowns

### Phase 1: Core Proof of Fun (1-2 weeks)
Basic minesweeper + simple scoring

### Phase 2: Roguelike Elements (1-2 weeks)
Items, shop, HP/mana systems

### Phase 3: Progression (1 week)
Unlocks, quests, character classes

### Phase 4: Polish & Launch (1 week)
Animations, sounds, juice, deployment

## 🎯 Success Criteria

### MVP Must Have
- Core minesweeper works flawlessly
- Items create meaningful strategic choices
- "One more run" compulsion (playtesters want to replay)
- Runs on mobile browsers smoothly
- Save/load works reliably

### Nice to Have (Post-MVP)
- PWA support (installable)
- Multiple themes
- Leaderboards
- Daily challenges
- Sound effects & music

## 📝 Design Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-30 | Vanilla JS over frameworks | Simplicity, performance, no dependencies |
| 2025-12-30 | Quest-based objectives | Unique angle, not done in existing games |
| 2025-12-30 | Mobile-first design | Broader audience, untapped market |
| 2025-12-30 | 3 HP system | Forgiving, reduces frustration |
| 2025-12-30 | Dual currency (coins/gems) | Separates in-run and meta progression |

## 🚫 Anti-Patterns to Avoid

1. **Feature Creep**: Don't add features before core loop is fun
2. **Over-Engineering**: Keep it simple, add complexity only when needed
3. **Power Creep**: Don't make unlocks required to win
4. **Tutorial Overload**: Teach through gameplay, not text
5. **Ignoring Mobile**: Design for touch from day one

## 📚 Related Documentation

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick facts and constants for development
- **[GAME_DESIGN.md](GAME_DESIGN.md)** - Complete game mechanics and balancing
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical implementation details
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Roadmap and task tracking
- **[PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)** - Multi-session workflow

---

## 🔗 Quick Navigation

- **Up**: [README.md](README.md) - Main project page
- **Quick Reference**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Fast facts
- **Mechanics**: [GAME_DESIGN.md](GAME_DESIGN.md) - Detailed game design
- **Technical**: [ARCHITECTURE.md](ARCHITECTURE.md) - Code structure
- **Planning**: [DEVELOPMENT.md](DEVELOPMENT.md) - Roadmap

---

**Last Updated**: 2025-12-30
**Version**: 0.1.0 (Pre-MVP)
