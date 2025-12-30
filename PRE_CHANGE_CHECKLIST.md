# Pre-Change Checklist

> **Purpose**: Quick reference checklist to use BEFORE making any code change
> **Time**: 2 minutes (prevents hours of debugging)
> **Related**: [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md), [DEPENDENCIES.md](DEPENDENCIES.md)

---

## 🚦 Before You Code: The 30-Second Check

**Stop! Answer these questions FIRST:**

### 1. Have you read the relevant files?
- [ ] Read the file you're about to modify
- [ ] Read [DEPENDENCIES.md](DEPENDENCIES.md) entry for this component
- [ ] Understand existing patterns and conventions

**❌ Never modify code you haven't read!**

### 2. What's the scope?
- [ ] Single file change
- [ ] Multi-file change (use [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md))
- [ ] Architecture change (use [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md))

### 3. Who depends on this?
- [ ] Check [DEPENDENCIES.md](DEPENDENCIES.md) → "DOWNSTREAM DEPENDENCIES" section
- [ ] List all consumers: _________________

### 4. What could break?
- [ ] Method signatures changing? → Update all call sites
- [ ] Properties renamed? → Update all references
- [ ] Behavior changed? → Update tests

### 5. How will you test it?
- [ ] Unit tests exist: _________________
- [ ] Manual test plan: _________________
- [ ] Integration tests needed: _________________

---

## ✅ Component-Specific Checklists

### Changing Cell.js
- [ ] Grid.js uses Cell structure - verify compatibility
- [ ] No other files should import Cell directly
- [ ] Update Grid.generate() if Cell constructor changes

### Changing Grid.js
**🔴 HIGH RISK - Used by 4+ components**
- [ ] main.js calls: revealCell, toggleFlag, chord, isComplete, getCell, revealAllMines
- [ ] CanvasRenderer reads: cells array, width, height
- [ ] GameState stores: grid reference
- [ ] Any method signature change requires updating ALL consumers
- [ ] Run full integration tests after changes

### Changing GameState.js
**🔴 CRITICAL - Used by everything**
- [ ] main.js reads/modifies: currentScreen, grid, currentRun, hoverCell, cursor
- [ ] Game.js calls: update()
- [ ] CanvasRenderer reads: currentScreen, grid, hoverCell, cursor
- [ ] Property renames break EVERYTHING
- [ ] Adding properties is safe, removing is DANGEROUS

### Changing Game.js
**🟡 MEDIUM RISK - Orchestrator**
- [ ] main.js calls: start, stop, accesses state/renderer
- [ ] Changes to public API affect main.js initialization
- [ ] Loop timing changes affect all gameplay

### Changing CanvasRenderer.js
**🟢 LOWER RISK - Visual only**
- [ ] main.js accesses: cellSize, padding (for coordinate conversion)
- [ ] Changes to rendering logic are isolated
- [ ] Changes to cellSize/padding break input coordinate conversion

### Changing main.js
**🟢 ISOLATED - Entry point**
- [ ] No other files import main.js
- [ ] Changes here don't cascade to other modules
- [ ] But breaks affect entire user experience
- [ ] Test ALL features after changes

---

## 🎯 Change Type Quick Reference

### Adding a New Method
**Risk: LOW** ✅
- [ ] No existing consumers affected
- [ ] Just add and test
- [ ] Document in file comments

### Renaming a Method
**Risk: HIGH** ⚠️
- [ ] Find all call sites (use global search)
- [ ] Update ALL consumers
- [ ] Update tests
- [ ] Update documentation

### Changing Method Signature
**Risk: HIGH** ⚠️
- [ ] Find all call sites
- [ ] Check if parameters are used correctly
- [ ] Update ALL consumers
- [ ] Add/update tests for new parameters

### Refactoring Internal Logic
**Risk: MEDIUM** 🟡
- [ ] Public API stays the same? → GOOD
- [ ] Behavior stays the same? → GOOD
- [ ] Performance impact? → Test
- [ ] Run all existing tests

### Adding a Property
**Risk: LOW** ✅
- [ ] No existing code breaks
- [ ] Just add and use
- [ ] Initialize in constructor if needed

### Renaming a Property
**Risk: HIGH** ⚠️
- [ ] Find all references (use global search)
- [ ] Update ALL reads and writes
- [ ] Update tests
- [ ] Update documentation

### Removing a Property/Method
**Risk: CRITICAL** 🔴
- [ ] Find all references
- [ ] Ensure NO code depends on it
- [ ] Check for indirect usage
- [ ] Remove from documentation

---

## 🔍 Quick Dependency Lookup

**"What depends on this file?"**

Use this quick reference (detailed info in [DEPENDENCIES.md](DEPENDENCIES.md)):

| File | Consumers | Risk |
|------|-----------|------|
| Cell.js | Grid.js | LOW |
| EventBus.js | main.js | LOW |
| Grid.js | main.js, GameState, CanvasRenderer, Game | **CRITICAL** |
| GameState.js | main.js, Game, CanvasRenderer | **CRITICAL** |
| Game.js | main.js | MEDIUM |
| CanvasRenderer.js | Game, main.js (props) | MEDIUM |
| main.js | None | ISOLATED |

**Rule of thumb**:
- **CRITICAL**: Use full [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)
- **MEDIUM**: Review consumers carefully
- **LOW**: Basic testing OK

---

## 🛠️ Quick Commands

### Find all usages of a function/property
```bash
# Windows (PowerShell)
Select-String -Path src/**/*.js -Pattern "functionName"

# Unix/Mac/Git Bash
grep -r "functionName" src/

# Or use your IDE's "Find All References" feature
```

### Check if a property is used
```bash
# Search for the property name in all files
Select-String -Path src/**/*.js -Pattern "propertyName"
```

### Find all files that import a module
```bash
# Search for import or usage patterns
Select-String -Path src/**/*.js -Pattern "ModuleName"
```

---

## 📋 Pre-Commit Checklist

**Before committing, verify:**

- [ ] **Code compiles/runs**: No syntax errors
- [ ] **Tests pass**: All relevant tests green
- [ ] **No console errors**: Clean browser console
- [ ] **Manual test**: Core functionality works
- [ ] **Documentation updated**: If API changed
- [ ] **Dependencies reviewed**: If structure changed
- [ ] **Commit message clear**: Describes what and why

---

## 🚨 Red Flags

**STOP and use [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md) if:**

- [ ] Changing Grid.js or GameState.js (CRITICAL components)
- [ ] Changing any public API (method signatures, property names)
- [ ] Affecting game loop, input handling, or rendering
- [ ] Touching code you don't fully understand
- [ ] Multiple files need to change together
- [ ] Existing tests will break
- [ ] User experience will noticeably change

**Yellow Flags** (proceed with caution):

- [ ] Changing code in a hot path (performance-critical)
- [ ] Refactoring without tests
- [ ] Adding new dependencies
- [ ] Changing error handling logic

**Green Flags** (low risk):

- [ ] Adding a new isolated function
- [ ] Fixing a typo in comments/strings
- [ ] Adding documentation
- [ ] Adding console.log for debugging (remember to remove!)

---

## 💡 Best Practices

### Before Making Changes
1. **Read First**: Understand existing code patterns
2. **Search First**: Find all consumers of what you're changing
3. **Plan First**: Know your testing strategy before coding
4. **Document First**: Update comments/docs while context is fresh

### During Implementation
1. **Make minimal changes**: One logical change per commit
2. **Test incrementally**: Don't batch up untested changes
3. **Keep backups**: Easy to revert if needed
4. **Comment non-obvious**: Explain "why", not "what"

### After Implementation
1. **Test thoroughly**: Run all affected tests
2. **Manual verification**: Actually use the feature
3. **Check console**: No new errors or warnings
4. **Review diff**: Does the change make sense?

---

## 🎓 When to Use Which Document

**This document (PRE_CHANGE_CHECKLIST.md)**:
- Quick reference before ANY change
- 2-minute sanity check
- Points you to deeper resources if needed

**[IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)**:
- Before CRITICAL or COMPLEX changes
- 15-minute deep analysis
- When red flags appear

**[DEPENDENCIES.md](DEPENDENCIES.md)**:
- To understand system relationships
- To map dependency trees
- Reference during impact analysis

**[ARCHITECTURE.md](ARCHITECTURE.md)**:
- To understand design patterns
- To see code organization
- When adding new systems

---

## 📝 Example Workflow

### Simple Change (Adding a method to Grid)
1. ✅ Read Grid.js
2. ✅ Check DEPENDENCIES.md - Grid has 4 consumers
3. ✅ Adding method = new API, not breaking existing
4. ✅ Write unit tests for new method
5. ✅ Implement method
6. ✅ Run tests
7. ✅ Manual test
8. ✅ Commit

### Complex Change (Refactoring Grid.revealCell)
1. ✅ Read Grid.js
2. ✅ Check DEPENDENCIES.md - CRITICAL component
3. ⚠️ Use [IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)
4. ⚠️ Full impact analysis (15 min)
5. ⚠️ Comprehensive test plan
6. ✅ Implement with extensive testing
7. ✅ Full integration test
8. ✅ Playtest complete game
9. ✅ Update documentation
10. ✅ Commit with detailed message

---

## 🔗 Quick Links

- **[DEPENDENCIES.md](DEPENDENCIES.md)** - Who depends on what
- **[IMPACT_ANALYSIS_CHECKLIST.md](IMPACT_ANALYSIS_CHECKLIST.md)** - Deep analysis for complex changes
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and patterns
- **[CHANGE_PROTOCOL.md](CHANGE_PROTOCOL.md)** - Full change management process

---

**Remember**: 2 minutes of planning prevents 2 hours of debugging! ⏱️

---

**Last Updated**: 2025-12-30
**Quick Reference - Keep this handy while coding!**
