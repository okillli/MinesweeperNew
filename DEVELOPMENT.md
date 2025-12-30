# LiMineZZsweeperIE - Development Roadmap

> **Task tracking and roadmap** | **Read Time**: ~5 minutes

---

## Phase Overview

| Phase | Goal | Status |
|-------|------|--------|
| 1: Core | Playable minesweeper | Complete |
| 2A: Resources | HP, coins, mana | Complete |
| 2B: Items | 20 items, shop, multi-board | Complete |
| 3: Progression | Quests, characters, unlocks | Next |
| 4: Polish | Animations, deploy | Planned |

---

## Completed

### Phase 1: Core Minesweeper
- Project setup & documentation
- Cell, Grid classes with full mechanics
- Canvas rendering with hover/cursor
- Touch, mouse, keyboard input
- Menu navigation & game over flow

### Phase 2A: Resource Systems
- HP damage system (configurable 1-10)
- Coin generation (+10/cell)
- Mana system (+5/cell, +10/flag)
- Color-coded HUD
- Settings screen

### Phase 2B: Items & Shop
- [x] Item system
  - [x] ItemSystem static utility class
  - [x] 20 item definitions in `src/data/items.js`
  - [x] Passive effects (stat modifiers, multipliers)
  - [x] Active abilities (Scan Area, Mine Detector, Safe Column, Auto-Chord)
  - [x] Consumables (Health Potion, Vision Scroll, Shield Token, etc.)

- [x] Shop system
  - [x] ShopSystem static utility class
  - [x] Shop UI (DOM-based)
  - [x] Item selection & purchase flow
  - [x] Rarity-based generation (common 60%, rare 30%, legendary 10%)
  - [x] Lucky Charm rarity bonus

- [x] Multi-board runs
  - [x] 6 boards (Tutorial, Easy, Normal, Hard, Very Hard, Boss)
  - [x] Difficulty scaling (8x8 to 16x16, 10 to 50 mines)
  - [x] Coin multipliers (1.0x to 3.0x)
  - [x] Shop between boards
  - [x] Persistent run state

- [x] Win/Lose conditions
  - [x] Complete 6 boards = victory
  - [x] Victory summary screen
  - [x] Perfect board tracking (+50 coins bonus)
  - [x] Shield protection system

---

## Next: Phase 3: Progression

**Goal**: Meta-progression, quests, character classes

- [ ] Quest system (5 quests)
  - [ ] Classic Clear: Complete all 6 boards
  - [ ] Treasure Hunter: Collect 500 coins
  - [ ] Boss Slayer: Defeat the boss board
  - [ ] Quest selection UI
  - [ ] Quest reward system

- [ ] Character classes (5 classes)
  - [ ] Explorer (default)
  - [ ] Mage (-25% ability cost)
  - [ ] Tank (+2 max HP)
  - [ ] Scout (start with Mine Detector)
  - [ ] Character selection UI

- [ ] Gem currency & unlocks
  - [ ] Gem earning from quest completion
  - [ ] Item unlock shop
  - [ ] Character unlock system

- [ ] Save/load (localStorage)
  - [ ] Persistent stats tracking
  - [ ] Settings persistence
  - [ ] Unlock state persistence

- [ ] Boss board mechanics
  - [ ] Special boss abilities/hazards

---

## Planned: Phase 4: Polish & Launch

**Goal**: Juice, optimization, deploy

- [ ] Animations (reveal, damage, effects)
- [ ] Tutorial/onboarding
- [ ] Responsive layout optimization
- [ ] Audio (optional)
- [ ] Cross-browser testing
- [ ] Deploy to GitHub Pages

---

## Future (Post-MVP)

- PWA support
- Daily challenges
- Leaderboards
- More content (50+ items, 10+ quests)
- Endless mode
- Multiple themes

---

## Targets

| Metric | Target | Current |
|--------|--------|---------|
| Total lines | 3,000-5,000 | ~3,500 |
| Files | 20-25 | 15 |
| Bundle size | <100KB | ~50KB |
| Frame rate | 60 FPS desktop, 30+ mobile | Achieved |
| Input latency | <100ms | <50ms |

---

## Definition of Done

### Per Feature
- [x] Code tested, no console errors
- [x] Works on mobile
- [x] Documented in code
- [x] Committed with descriptive message

### MVP Launch
- [ ] All phases complete
- [ ] No critical bugs
- [ ] Works desktop & mobile
- [ ] Deployed to GitHub Pages
- [ ] README complete

---

**Version**: 0.4.0 | **Last Updated**: 2025-12-30
