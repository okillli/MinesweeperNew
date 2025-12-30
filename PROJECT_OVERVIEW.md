# LiMineZZsweeperIE - Project Overview

_Made with love for Lizzie_ ✨

> **When to Read This**: First session, strategic planning, understanding the "why"
> **Read Time**: ~3 minutes

---

## 🎮 Game Concept

A web-based minesweeper roguelike combining classic minesweeper with roguelike progression, items, and quest objectives.

### What Makes It Unique
- **Quest-based objectives**: Different goals each run (rescue, treasure hunt, speed run)
- **Mobile-first**: Built for touch from day one, desktop is an enhancement
- **Quick sessions**: 5-10 minute runs
- **Simple but deep**: Easy to learn, hard to master

---

## 🎯 Core Design Principles

1. **Simplicity First** - Core is minesweeper + items, nothing more
2. **Mobile-First** - Design for touch FIRST, then desktop (never reverse)
3. **Web-Native** - Runs in any browser, no installation
4. **Fair Progression** - Unlocks add variety, not power
5. **Playtest Early** - Validate fun after each phase

---

## 📊 Target Metrics

| Metric | Target |
|--------|--------|
| Run duration | 5-10 minutes |
| Items (MVP) | 20 total |
| Boards per run | 5 + 1 boss |
| Grid sizes | 8×8 to 16×16 |

---

## 🎨 Visual Direction

- **Minimalist**: Clean lines, clear iconography
- **High contrast**: Accessible colors
- **Responsive**: Scales mobile → desktop

---

## 🎯 Success Criteria

### MVP Must Have
- Core minesweeper works flawlessly
- Items create strategic choices
- "One more run" feeling
- Runs smoothly on mobile
- Save/load works reliably

### Nice to Have (Post-MVP)
PWA • Multiple themes • Leaderboards • Daily challenges • Sound/music

---

## 📝 Design Decisions

| Decision | Rationale |
|----------|-----------|
| Vanilla JS | Simplicity, performance, no dependencies |
| Quest objectives | Unique angle for minesweeper |
| Mobile-first | Broader audience, untapped market |
| 3 HP system | Forgiving, reduces frustration |
| Dual currency | Separates in-run vs meta progression |

---

## 🚫 Anti-Patterns to Avoid

1. **Desktop-First Thinking** - Always mobile FIRST
2. **Feature Creep** - Don't add before core is fun
3. **Over-Engineering** - Start simple
4. **Power Creep** - First run must be winnable
5. **Tutorial Overload** - Teach through gameplay

---

## 🔗 Related Docs

| Doc | Purpose |
|-----|---------|
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick facts, constants |
| [GAME_DESIGN.md](GAME_DESIGN.md) | Complete mechanics |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Code structure |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Roadmap, tasks |

---

**Version**: 0.3.0 | **Last Updated**: 2025-12-30
