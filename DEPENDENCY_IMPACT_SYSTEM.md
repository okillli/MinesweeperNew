# Dependency & Impact Analysis System

> **Purpose**: Overview of the complete dependency tracking and impact analysis system
> **Last Updated**: 2025-12-30
> **For**: Claude Code instances and developers working on LiMineZZsweeperIE

---

## 🎯 Overview

This project now has a comprehensive system for tracking dependencies and analyzing the impact of changes. This system helps prevent bugs, reduce debugging time, and maintain code quality through systematic analysis.

**The Problem This Solves:**
- "What will break if I change this?"
- "Who depends on this component?"
- "How do I test this change properly?"
- "What's the blast radius of this modification?"

---

## 📚 System Components

### 1. Documentation

#### [DEPENDENCIES.md](DEPENDENCIES.md)
**Purpose**: Central repository of all dependency relationships

**Contains:**
- Upstream/downstream dependencies for each component
- Dependency hierarchy visualization
- Critical paths through the system
- Change risk scoring
- Testing impact by layer

**When to use:**
- Understanding system architecture
- Planning complex changes
- Onboarding new contributors
- Conducting impact analysis

**Quick Example:**
```
Grid.js
  DEPENDS ON: Cell.js
  USED BY: main.js, GameState.js, CanvasRenderer.js, Game.js
  RISK: CRITICAL (4+ dependents)
```

---

#### [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)
**Purpose**: Detailed framework for analyzing change impact before implementation

**Contains:**
- 10-phase comprehensive analysis process
- Failure mode and effects analysis (FMEA)
- Risk scoring matrix
- Blast radius calculation
- Testing strategy templates
- Decision tree for determining effort level

**When to use:**
- Before CRITICAL or COMPLEX changes
- When red flags appear in pre-change check
- Changing Grid.js, GameState.js, or Game.js
- Modifying public APIs or core game mechanics

**Time Investment**: 15 minutes (prevents hours of debugging)

**Quick Example:**
```
Phase 1: Change Description
  - What: Refactor Grid.revealCell to use iterative algorithm
  - Why: Improve performance on large grids
  - Files: src/entities/Grid.js

Phase 2: Dependency Mapping
  - Direct: main.js, Grid.revealAdjacent
  - Indirect: CanvasRenderer, GameState

Phase 3: Impact Scoring
  - Volatility: 1 (stable)
  - Complexity: 5 (complex cascade algorithm)
  - Completeness: 1 (well-defined)
  - Criticality: 5 (core mechanic)
  - TOTAL: 12/20 - HIGH RISK
```

---

#### [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md)
**Purpose**: Quick reference for every code change (2-minute sanity check)

**Contains:**
- 30-second quick check (5 questions)
- Component-specific checklists
- Change type risk assessment
- Quick dependency lookup table
- Red flag indicators

**When to use:**
- BEFORE making ANY code change
- As a habit/routine check
- Points to deeper analysis when needed

**Time Investment**: 2 minutes

**Quick Example:**
```
✅ Before You Code: The 30-Second Check

1. Have you read the file? □
2. Who depends on this? _________
3. What could break? _________
4. How will you test? _________
5. Is this CRITICAL? □ (If yes → use IMPACT_ANALYSIS_CHECKLIST.md)
```

---

### 2. Tools

#### analyze-dependencies.js
**Purpose**: Automated dependency analysis script (no external dependencies)

**Features:**
- Scans all JavaScript files
- Builds dependency graph
- Calculates risk scores
- Identifies circular dependencies
- Finds orphaned modules
- Generates text report

**Usage:**
```bash
node analyze-dependencies.js
```

**Output:**
- `dependency-report.txt` - Full analysis report
- Console summary with critical components highlighted

**Example Output:**
```
SUMMARY:
  Total Components: 7
  Critical Components: 2

⚠️  CRITICAL COMPONENTS (4+ dependents):
  - Grid (4 dependents)
  - GameState (3 dependents)

💡 Run "type dependency-report.txt" to view full report
```

---

#### package.json (Dependency Analysis Scripts)
**Purpose**: NPM scripts for enhanced dependency analysis

**Available Commands:**
```bash
# Install madge (visual dependency graphing)
npm install

# Generate visual dependency graph (PNG image)
npm run deps

# List all dependencies in text format
npm run deps:list

# Check for circular dependencies
npm run deps:circular

# Find orphaned modules (unused files)
npm run deps:orphans

# Run comprehensive analysis
npm run analyze

# Start local dev server
npm run serve
```

**Benefits:**
- Visual dependency graphs (madge)
- Quick health checks
- Pre-commit validation

---

### 3. Inline Documentation

All core files now include dependency comments at the top:

```javascript
/**
 * Grid.js
 *
 * DEPENDENCIES (what this imports):
 * - Cell.js (creates cell instances for grid)
 *
 * DEPENDENTS (what imports this):
 * - main.js (creates Grid instances, calls methods)
 * - GameState.js (stores as currentRun.grid)
 * - CanvasRenderer.js (reads grid state for rendering)
 * - Game.js (accesses via GameState.grid)
 *
 * CRITICAL PATHS:
 * 1. Game loop → GameState.grid → CanvasRenderer reads
 * 2. User click → main.js → Grid.revealCell() → cascade
 *
 * CHANGE IMPACT: CRITICAL
 * - Central to all gameplay mechanics
 * - Changes affect rendering, input, and game logic
 *
 * SIDE EFFECTS:
 * - Modifies Cell states
 * - Increments counters
 * - Cascading reveals
 *
 * ASSUMPTIONS:
 * - Cell structure remains stable
 * - Grid coordinates are always in bounds
 */
```

**Updated Files:**
- ✅ [src/entities/Cell.js](src/entities/Cell.js)
- ✅ [src/entities/Grid.js](src/entities/Grid.js)
- ✅ [src/core/EventBus.js](src/core/EventBus.js)
- ✅ [src/core/Game.js](src/core/Game.js)
- ✅ [src/core/GameState.js](src/core/GameState.js)
- ✅ [src/rendering/CanvasRenderer.js](src/rendering/CanvasRenderer.js)

---

## 🔄 Workflow Integration

### Daily Development Workflow

**Before making any change:**

1. **Quick Check** (2 min)
   - Open [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md)
   - Answer the 5 critical questions
   - Check component-specific checklist

2. **If Red Flags Appear** (15 min)
   - Open [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)
   - Complete relevant phases
   - Document findings

3. **Reference Dependencies** (ongoing)
   - Check [DEPENDENCIES.md](DEPENDENCIES.md) for system relationships
   - Review inline comments in files you're modifying
   - Verify downstream impact

4. **Validate with Tools** (optional)
   - Run `node analyze-dependencies.js` to check for issues
   - Run `npm run deps:circular` to ensure no circular deps

---

### Pre-Commit Checklist

Before committing code:

- [ ] Ran relevant tests
- [ ] No console errors
- [ ] Updated inline dependency comments (if API changed)
- [ ] Updated [DEPENDENCIES.md](DEPENDENCIES.md) (if structure changed)
- [ ] Verified with `node analyze-dependencies.js` (for major changes)
- [ ] Clear commit message explaining impact

---

### Code Review Guidelines

When reviewing code:

1. **Check dependency documentation** - Are inline comments updated?
2. **Verify impact analysis** - Was checklist followed for CRITICAL changes?
3. **Test coverage** - Are affected areas tested?
4. **Breaking changes** - Are all consumers updated?
5. **Risk assessment** - Does the change match its stated risk level?

---

## 📊 Risk Level Guide

**CRITICAL (Score 15-20)**
- Components: Grid.js, GameState.js
- Requirements: Full impact analysis, extensive testing
- Review: Required before merge
- Testing: Full test suite + manual playtest

**HIGH (Score 10-14)**
- Components: Game.js, public API changes
- Requirements: Thorough review, integration tests
- Review: Recommended
- Testing: Integration tests + smoke tests

**MEDIUM (Score 5-9)**
- Components: CanvasRenderer.js, internal refactoring
- Requirements: Standard testing, code review
- Review: Optional
- Testing: Unit tests + affected areas

**LOW (Score 1-4)**
- Components: New isolated features, documentation
- Requirements: Basic testing
- Review: Optional
- Testing: Unit tests

---

## 🎓 Best Practices

### DO ✅

1. **Always read files before modifying** - Never change code you haven't read
2. **Use PRE_CHANGE_CHECKLIST.md habitually** - Make it a 2-minute routine
3. **Document as you go** - Update comments while context is fresh
4. **Test incrementally** - Don't batch untested changes
5. **Run analysis tools** - Especially before major changes
6. **Keep DEPENDENCIES.md current** - Update when structure changes

### DON'T ❌

1. **Skip the checklist for "small" changes** - Small changes can have big impacts
2. **Change CRITICAL components without analysis** - Always use IMPACT_ANALYSIS_CHECKLIST.md
3. **Ignore red flags** - They're there for a reason
4. **Batch unrelated changes** - One logical change per commit
5. **Forget to update documentation** - Stale docs are worse than no docs
6. **Assume tests catch everything** - Manual testing is still important

---

## 🚀 Quick Reference by Task

### "I want to add a new feature"
1. ✅ [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) → Quick check
2. ✅ [DEPENDENCIES.md](DEPENDENCIES.md) → Understand where it fits
3. ✅ [ARCHITECTURE.md](ARCHITECTURE.md) → Follow existing patterns
4. ✅ Implement with inline dependency comments
5. ✅ Update [DEPENDENCIES.md](DEPENDENCIES.md) if needed

### "I need to refactor a core component"
1. ⚠️ [DEPENDENCIES.md](DEPENDENCIES.md) → Check impact (likely CRITICAL)
2. ⚠️ [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md) → Full analysis
3. ⚠️ Plan testing strategy (comprehensive)
4. ⚠️ Implement carefully with extensive testing
5. ⚠️ Update all documentation

### "I'm fixing a bug"
1. ✅ [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) → Quick check
2. ✅ Add regression test first
3. ✅ Implement fix
4. ✅ Verify no other areas affected
5. ✅ Document fix in commit message

### "I'm not sure about impact"
1. ❓ [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) → Quick assessment
2. ❓ Run `node analyze-dependencies.js` → See dependency report
3. ❓ Check [DEPENDENCIES.md](DEPENDENCIES.md) → Understand relationships
4. ❓ If still unsure → Use [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)

---

## 📈 Metrics & Maintenance

### Track These Metrics

**Code Health:**
- Number of circular dependencies (target: 0)
- Average dependents per component (current: ~2)
- Critical components (current: 2 - Grid.js, GameState.js)

**Process Health:**
- Percentage of changes with pre-change check (target: 100%)
- Percentage of CRITICAL changes with full analysis (target: 100%)
- Bugs caused by missed dependencies (target: 0)

### Regular Maintenance

**Weekly:**
- Run `node analyze-dependencies.js` to check health
- Review any new circular dependencies
- Update risk scores if components change

**Monthly:**
- Review [DEPENDENCIES.md](DEPENDENCIES.md) for accuracy
- Update checklists based on lessons learned
- Archive old dependency reports

**Per Phase:**
- Major update to [DEPENDENCIES.md](DEPENDENCIES.md) when adding systems
- Review and refine risk scoring matrix
- Update workflow based on team feedback

---

## 🔮 Future Enhancements

**Planned Additions:**

1. **Automated Validation**
   - Pre-commit git hook running dependency analysis
   - CI/CD integration for dependency checks
   - Automatic DEPENDENCIES.md generation

2. **Visual Tools**
   - Interactive dependency graph (D3.js)
   - Real-time impact highlighting
   - Dependency diff visualization

3. **Extended Analysis**
   - Performance impact prediction
   - Code coverage by dependency
   - Change frequency heatmaps

4. **Integration**
   - IDE plugins for inline dependency info
   - VS Code extension for checklist integration
   - Slack/Discord notifications for CRITICAL changes

---

## 🔗 Document Cross-Reference

**For Understanding:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and patterns
- [DEPENDENCIES.md](DEPENDENCIES.md) - Dependency relationships
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Fast facts and constants

**For Planning:**
- [DEVELOPMENT.md](DEVELOPMENT.md) - Roadmap and current phase
- [GAME_DESIGN.md](GAME_DESIGN.md) - Game mechanics and features
- [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md) - Multi-session workflow

**For Implementation:**
- [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) - Before every change
- [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md) - Before complex changes
- [CHANGE_PROTOCOL.md](CHANGE_PROTOCOL.md) - Change management process

**For Context:**
- [CLAUDE.md](CLAUDE.md) - Guide for Claude Code instances
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Project vision and principles

---

## 💡 Key Takeaways

**For Developers:**
1. **2 minutes of planning prevents 2 hours of debugging**
2. **All changes have dependencies - understand them first**
3. **The system is only as good as your adherence to it**
4. **When in doubt, over-analyze rather than under-analyze**
5. **Documentation is code - keep it current**

**For Project Success:**
1. **Dependency awareness prevents cascading failures**
2. **Systematic analysis reduces bug introduction**
3. **Clear documentation enables confident changes**
4. **Tooling amplifies human judgment, doesn't replace it**
5. **Continuous improvement based on real-world usage**

---

## 📞 Quick Help

**"I'm about to code, what do I do?"**
→ [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) (2 minutes)

**"This change looks complex..."**
→ [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md) (15 minutes)

**"What depends on this file?"**
→ [DEPENDENCIES.md](DEPENDENCIES.md) or `node analyze-dependencies.js`

**"How risky is this change?"**
→ Check risk scoring in [DEPENDENCIES.md](DEPENDENCIES.md) or [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)

**"I broke something, how do I find what?"**
→ Check [DEPENDENCIES.md](DEPENDENCIES.md) downstream dependencies, run tests by layer

---

**Remember**: This system exists to help you code confidently. Use it, refine it, improve it based on your experience. The best tool is the one you actually use.

---

**System Status**: ✅ **ACTIVE**

**Last Updated**: 2025-12-30
**Next Review**: After Phase 2 implementation (when new systems are added)
**Maintained By**: Project team / Claude Code instances
