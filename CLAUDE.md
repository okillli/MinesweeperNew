# CLAUDE.md

> **🤖 FOR CLAUDE CODE INSTANCES**
> **Read Time**: ~5 minutes

This file provides essential guidance for Claude Code working on this minesweeper roguelike project.

## 🗺️ Quick Navigation

| Situation | Read These Docs |
|-----------|-----------------|
| **First time?** | This file → [QUICK_REFERENCE.md](QUICK_REFERENCE.md) → [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| **Starting session?** | [QUICK_REFERENCE.md](QUICK_REFERENCE.md) → [PROGRESS.md](PROGRESS.md) → [DEVELOPMENT.md](DEVELOPMENT.md) |
| **Implementing feature?** | [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) → [GAME_DESIGN.md](GAME_DESIGN.md) → [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Multi-session work?** | [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md) |

---

## 🏗️ Architecture (Essential Patterns)

### Separation of Concerns

```
Game Logic (src/entities/, src/systems/)  →  NEVER renders
Rendering (src/rendering/)                →  NEVER modifies state
Orchestration (src/core/)                 →  Coordinates both
```

### State Flow
```
User Input → Game.update() → GameState.modify() → Renderer.render(state)
```

### Key Files
- `src/core/GameState.js` - Single source of truth
- `src/entities/Grid.js` - Minesweeper logic (`cells[y][x]` indexing)
- `src/rendering/CanvasRenderer.js` - Grid visualization
- `src/main.js` - Entry point and input handling

### Grid API
```javascript
grid.revealCell(x, y)  // Reveals cell, auto-cascades zeros
grid.toggleFlag(x, y)  // Flags/unflags cells
grid.chord(x, y)       // Auto-reveals if flags match number
grid.isComplete()      // Win condition check
```

**Important**: Grid uses `cells[y][x]` (row-major). X = column, Y = row.

---

## 📱 Mobile-First Design (CRITICAL)

**Design for mobile FIRST. Desktop is an enhancement.**

- Touch targets: minimum 44x44px (prefer 60x60px)
- Test on mobile BEFORE desktop
- Never require hover for essential functionality
- Portrait orientation is default

> See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for complete design principles

---

## ⚠️ Anti-Patterns to Avoid

1. **Desktop-First Thinking** - Always design for mobile FIRST
2. **Mixing Concerns** - Game logic and rendering must stay separated
3. **Feature Creep** - Don't add features before core loop is fun
4. **Over-Engineering** - Avoid abstractions until you need them twice
5. **Hover-Dependent UI** - Mobile has no hover
6. **Power Creep** - First run must be winnable without unlocks

---

## 🔧 Before Writing Code

1. **[PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md)** - Quick check (2 min, REQUIRED)
2. Check [DEPENDENCIES.md](DEPENDENCIES.md) for impact analysis
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) for code patterns
4. Check [GAME_DESIGN.md](GAME_DESIGN.md) for mechanics/balance

**For Complex Changes**: Use [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)

---

## 📁 Code Organization

| Directory | Purpose |
|-----------|---------|
| `src/data/` | Pure data definitions (items, quests, characters) |
| `src/entities/` | Data structures with methods (Cell, Grid) |
| `src/systems/` | Stateless game systems (Shop, Items) |
| `src/core/` | Game loop, state, events |
| `src/rendering/` | Pure presentation (Canvas, DOM) |

---

## 🔗 Quick Links

| Doc | Purpose |
|-----|---------|
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Game constants, quick facts |
| [GAME_DESIGN.md](GAME_DESIGN.md) | Complete mechanics, items, quests |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Code patterns, detailed examples |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Roadmap, current tasks |
| [PROGRESS.md](PROGRESS.md) | What's complete |
| [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) | Before every change |
| [DEPENDENCIES.md](DEPENDENCIES.md) | Impact analysis |

---

## 🚀 Running the Game

```bash
# No build required - just open index.html
# Or use a local server:
python -m http.server 8000

# Run tests:
npm install && npx playwright test
```

---

**Version**: 0.3.0 | **Last Updated**: 2025-12-30
