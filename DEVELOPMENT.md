# LiMineZZsweeperIE - Development Roadmap

> **Task tracking and roadmap** | **Read Time**: ~5 minutes

---

## 📍 Phase Overview

| Phase | Goal | Status |
|-------|------|--------|
| 1: Core | Playable minesweeper | ✅ Complete |
| 2A: Resources | HP, coins, mana | ✅ Complete |
| 2B: Items | 20 items, shop, multi-board | 🚧 Next |
| 3: Progression | Quests, characters, unlocks | ⏳ Planned |
| 4: Polish | Animations, deploy | ⏳ Planned |

---

## ✅ Completed

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

---

## 🚧 Phase 2B: Items & Shop

**Goal**: Add items, shops, multi-board progression

### Tasks
- [ ] Item system
  - [ ] Item class & ItemSystem
  - [ ] 20 item definitions in `src/data/items.js`
  - [ ] Passive effects, active abilities, consumables

- [ ] Shop system
  - [ ] ShopSystem class
  - [ ] Shop UI (DOM)
  - [ ] Item selection & purchase
  - [ ] Rarity-based generation

- [ ] Multi-board runs
  - [ ] 5 boards + boss
  - [ ] Difficulty scaling
  - [ ] Shop between boards
  - [ ] Persistent run state

- [ ] Win condition
  - [ ] Complete 5 boards = win
  - [ ] Victory summary screen

---

## ⏳ Phase 3: Progression

**Goal**: Meta-progression, quests, character classes

- [ ] Quest system (5 quests)
- [ ] Character classes (5 classes)
- [ ] Gem currency & unlocks
- [ ] Achievement tracking
- [ ] Save/load (localStorage)
- [ ] Boss board mechanics

---

## ⏳ Phase 4: Polish & Launch

**Goal**: Juice, optimization, deploy

- [ ] Animations (reveal, damage, effects)
- [ ] Tutorial/onboarding
- [ ] Responsive layout optimization
- [ ] Audio (optional)
- [ ] Cross-browser testing
- [ ] Deploy to GitHub Pages

---

## 💡 Future (Post-MVP)

- PWA support
- Daily challenges
- Leaderboards
- More content (50+ items, 10+ quests)
- Endless mode
- Multiple themes

---

## 📊 Targets

| Metric | Target |
|--------|--------|
| Total lines | 3,000-5,000 |
| Files | 20-25 |
| Bundle size | <100KB |
| Frame rate | 60 FPS desktop, 30+ mobile |
| Input latency | <100ms |

---

## ✓ Definition of Done

### Per Feature
- [ ] Code tested, no console errors
- [ ] Works on mobile
- [ ] Documented in code
- [ ] Committed with descriptive message

### MVP Launch
- [ ] All phases complete
- [ ] No critical bugs
- [ ] Works desktop & mobile
- [ ] Deployed to GitHub Pages
- [ ] README complete

---

**Version**: 0.3.0 | **Last Updated**: 2025-12-30
