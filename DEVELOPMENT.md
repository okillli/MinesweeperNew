# MineQuest - Development Roadmap

## 🗺️ Development Phases

### Phase 1: Core Proof of Fun (Week 1-2) ✅ **COMPLETE**

**Goal**: Validate that basic minesweeper + simple progression is fun

#### Tasks
- [x] Project setup ✅ **COMPLETE**
  - [x] Create documentation structure
  - [x] Initialize git repository
  - [x] Set up file structure
  - [x] Create index.html skeleton

- [x] Basic minesweeper implementation ✅ **COMPLETE**
  - [x] Cell class
  - [x] Grid class with mine generation
  - [x] Reveal/flag/chord mechanics
  - [x] Number calculation
  - [x] Win/lose detection

- [x] Canvas rendering ✅ **COMPLETE**
  - [x] CanvasRenderer class
  - [x] Render grid
  - [x] Render cells (unrevealed, revealed, flagged)
  - [x] Render numbers and mines
  - [x] Cell click handling
  - [x] **Hover highlights** (visual feedback before clicking)

- [x] Simple game loop ✅ **COMPLETE**
  - [x] Game class with RAF loop
  - [x] GameState class
  - [x] Basic state management

- [x] Minimal UI ✅ **COMPLETE**
  - [x] Start button
  - [x] Board display
  - [x] Simple win/lose screen
  - [x] Menu navigation
  - [x] Game over flow

- [x] Testing & Validation ✅ **COMPLETE**
  - [x] Minesweeper logic works correctly
  - [x] No bugs in core mechanics
  - [x] Playtest: Is it fun? ✅ **YES!**

- [x] **UX Enhancements** ✅ **COMPLETE**
  - [x] Touch support (tap/long-press)
  - [x] Hover feedback system
  - [x] Cursor feedback
  - [x] Event cleanup (AbortController)

**Deliverable**: Playable minesweeper game with one board ✅ **DELIVERED**

---

### Phase 2A: Resource Systems ✅ **COMPLETE**

**Goal**: Add HP, coins, and mana systems

#### Tasks
- [x] Resource systems ✅ **COMPLETE**
  - [x] HP system (configurable 1-10 starting HP)
  - [x] Coin generation on cell reveal (+10 per cell)
  - [x] Mana system (+5 per cell, +10 per flag)
  - [x] HUD display with color-coded HP
  - [x] Configurable starting HP in settings

- [x] Game over flow ✅ **COMPLETE**
  - [x] HP depletion = game over
  - [x] Reveal all mines on death
  - [x] Stats overlay with summary
  - [x] New game / return to menu options

**Deliverable**: Working resource economy ✅ **DELIVERED**

---

### Phase 2B: Items & Shop (Next)

**Goal**: Add items, shops, and multi-board progression

#### Tasks
- [ ] Implement StateMachine for screen transition validation
- [ ] Integrate EventBus for animations and sound effects
- [ ] Implement seeded RNG for reproducible grids (daily challenges prep)

- [ ] Item system foundation
  - [ ] Item class
  - [ ] ItemSystem class
  - [ ] Item data definitions (20 items)
  - [ ] Passive item effects
  - [ ] Active ability system
  - [ ] Consumable usage

- [ ] Shop system
  - [ ] ShopSystem class
  - [ ] Shop UI (DOM)
  - [ ] Item selection & purchase
  - [ ] Random item generation with rarity

- [ ] Multi-board runs
  - [ ] Board progression (5 boards)
  - [ ] Difficulty scaling
  - [ ] Shop between boards
  - [ ] Persistent run state

- [ ] Win conditions
  - [ ] Complete 5 boards = win
  - [ ] Victory summary screen

- [ ] Testing & Validation
  - [ ] All items work correctly
  - [ ] Shop economy feels balanced
  - [ ] Playtest: Do items add strategic depth?

**Deliverable**: Full roguelike run (5 boards + shops + items)

---

### Phase 3: Progression & Content (Week 5)

**Goal**: Add meta-progression, quests, and character classes

#### Tasks
- [ ] Quest system
  - [ ] QuestSystem class
  - [ ] Quest definitions (5 quests)
  - [ ] Quest objective tracking
  - [ ] Quest completion detection
  - [ ] Quest selection UI

- [ ] Character classes
  - [ ] Character class
  - [ ] Character definitions (5 classes)
  - [ ] Starting bonuses
  - [ ] Character selection UI

- [ ] Progression system
  - [ ] ProgressionSystem class
  - [ ] Gem currency
  - [ ] Unlock system
  - [ ] Achievement tracking
  - [ ] Collection/codex UI

- [ ] Save system
  - [ ] SaveSystem class
  - [ ] localStorage save/load
  - [ ] Auto-save functionality
  - [ ] Save migration system

- [ ] Boss board
  - [ ] Larger grid size
  - [ ] Special mechanics
  - [ ] Boss victory screen

- [ ] Testing & Validation
  - [ ] All quests completable
  - [ ] Unlocks work correctly
  - [ ] Save/load preserves state
  - [ ] Playtest: Do unlocks create "one more run" feeling?

**Deliverable**: Complete core game loop with progression

---

### Phase 4: Polish & Launch (Week 6)

**Goal**: Add juice, mobile optimization, and deploy

#### Tasks
- [ ] Visual polish
  - [ ] Animations (cell reveal, damage, etc.)
  - [ ] Particle effects (coins, mana)
  - [ ] Screen shake on damage
  - [ ] Smooth transitions
  - [ ] Color scheme refinement

- [ ] UI/UX improvements
  - [x] **Hover feedback system** ✅ **COMPLETE** (context-aware highlights)
  - [x] **Cursor feedback** ✅ **COMPLETE** (pointer on interactive elements)
  - [ ] Tutorial/onboarding
  - [ ] Tooltips for items
  - [ ] Better menu design
  - [ ] Achievement notifications
  - [ ] Settings screen

- [ ] Mobile optimization
  - [x] Touch controls (tap, long-press) ✅ **COMPLETE**
  - [ ] Responsive layout
  - [ ] Performance optimization
  - [x] Touch target sizing (44x44px minimum) ✅ **COMPLETE**
  - [x] Haptic feedback (vibration on flag) ✅ **COMPLETE**

- [ ] Audio (optional)
  - [ ] Sound effects
  - [ ] Background music
  - [ ] Mute toggle

- [ ] Testing & Bug fixes
  - [ ] Cross-browser testing
  - [ ] Mobile device testing
  - [ ] Bug fixing
  - [ ] Balance tweaking

- [ ] Deployment
  - [ ] Set up GitHub Pages
  - [ ] Create README
  - [ ] Add metadata (favicon, etc.)
  - [ ] Deploy & test live

**Deliverable**: Polished, deployed game on GitHub Pages

---

## 📋 Current Sprint Tasks

### Sprint 1: Project Foundation ✅ **COMPLETE**

**Status**: ✅ **Complete** (2025-12-30)

### Sprint 2: Resource Systems ✅ **COMPLETE**

**Status**: ✅ **Complete** (2025-12-30)

#### Completed
- [x] HP damage system with configurable starting HP
- [x] Coin generation (+10 per safe cell)
- [x] Mana system (+5 per cell, +10 per flag)
- [x] Color-coded HUD display
- [x] Keyboard navigation (arrows, Space, F, C)
- [x] Game over overlay with stats
- [x] Settings screen with HP configuration

#### Next Sprint
**Sprint 3: Phase 2B - Items & Shop**
- Define 20 items in data/items.js
- Implement ItemSystem
- Build ShopSystem
- Multi-board progression

---

## 🐛 Known Issues

None yet

---

## 💡 Future Features (Post-MVP)

### Phase 5+: Enhancements
- [ ] PWA support (installable)
- [ ] Daily challenges
- [ ] Leaderboards
- [ ] More quests (10+ total)
- [ ] More items (50+ total)
- [ ] More character classes (10+ total)
- [ ] Endless mode
- [ ] Hard mode
- [ ] Multiple themes (space, underwater, archaeology)
- [ ] Achievements expansion
- [ ] Sound effects & music
- [ ] Animations & juice improvements
- [ ] Localization (multiple languages)

---

## 📊 Development Metrics

### Time Estimates
- **Phase 1**: 10-15 hours (1-2 weeks part-time)
- **Phase 2**: 15-20 hours (1-2 weeks part-time)
- **Phase 3**: 10-15 hours (1 week part-time)
- **Phase 4**: 10-15 hours (1 week part-time)
- **Total MVP**: 45-65 hours (4-6 weeks part-time)

### Code Metrics (Target)
- **Total Lines**: ~3,000-5,000 (including comments)
- **Files**: ~20-25
- **Bundle Size**: <100KB (minified)
- **Load Time**: <1 second

### Quality Metrics (Target)
- **Frame Rate**: 60 FPS on desktop, 30+ FPS on mobile
- **Input Latency**: <100ms
- **Save/Load**: <200ms
- **Bug Count**: <5 critical bugs at launch

---

## 🔄 Development Workflow

### Version Control
- **Main branch**: Stable, deployable code
- **Dev branch**: Active development
- **Feature branches**: Individual features
- **Commit style**: Conventional commits

### Testing Strategy
- **Manual playtesting**: After each major feature
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Mobile testing**: iOS Safari, Android Chrome
- **Performance testing**: Low-end devices

### Code Review
- Self-review before committing
- Document all major decisions
- Keep code simple and readable
- Comment complex logic

---

## 📝 Development Notes

### Design Decisions

**2025-12-30: Technology Stack**
- Chose vanilla JS over frameworks for simplicity
- Chose Canvas for grid, DOM for UI (hybrid approach)
- Chose localStorage over server for MVP simplicity

**2025-12-30: Game Design**
- Chose quest system as unique differentiator
- Chose 3 HP system for forgiveness
- Chose dual currency to separate in-run and meta progression

### Lessons Learned

(To be filled during development)

---

## 🎯 Definition of Done

### Feature Complete Checklist
- [ ] Code written and tested
- [ ] No console errors
- [ ] Documented in code comments
- [ ] Playtested and balanced
- [ ] Works on mobile
- [ ] Git committed with descriptive message

### MVP Launch Checklist
- [ ] All Phase 1-4 tasks completed
- [ ] No critical bugs
- [ ] Playable on desktop & mobile
- [ ] Documentation complete
- [ ] Deployed to GitHub Pages
- [ ] README with instructions
- [ ] At least 3 playtesters approved

---

**Last Updated**: 2025-12-30
**Version**: 0.3.0 (Phase 2A Complete - Resource Systems)
**Recent Additions**: HP/Coins/Mana systems, keyboard navigation, game over flow
