# Documentation Structure

> **Purpose**: Single source of truth for all documentation organization
> **Last Updated**: 2025-12-30
> **Maintenance**: Review monthly, archive obsolete docs

---

## Active Documentation (Root Directory)

These files are **actively used** and should **stay in root**:

### Essential Developer Docs
1. **[README.md](README.md)** - Project overview, quick start
2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - START HERE for sessions
3. **[CLAUDE.md](CLAUDE.md)** - For AI assistants

### Process & Workflow
4. **[PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)** - Multi-session workflow
5. **[CHANGE_PROTOCOL.md](CHANGE_PROTOCOL.md)** - How to make changes
6. **[AUTOMATION_FRAMEWORK.md](AUTOMATION_FRAMEWORK.md)** - Testing strategy

### Design & Architecture
7. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Vision & principles
8. **[GAME_DESIGN.md](GAME_DESIGN.md)** - Game mechanics
9. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Code structure

### Planning & Progress
10. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Roadmap & tasks
11. **[PROGRESS.md](PROGRESS.md)** - Current status

### Session History
12. **[SESSION_SUMMARY_LATEST.md](SESSION_SUMMARY_LATEST.md)** - Most recent session

**Total Active Docs**: 12 files

---

## Archive Directory Structure

```
archive/
├── implementation-docs/     # Implementation details from specific features
│   ├── hover-system/
│   ├── touch-support/
│   ├── keyboard-nav/
│   └── critical-fixes/
│
├── testing-docs/           # Test results and guides
│   ├── playtest-results/
│   └── automated-tests/
│
├── session-summaries/      # Historical session summaries
│   ├── 2025-12-30-session-1.md
│   └── 2025-12-30-session-2.md
│
└── deprecated/             # Old docs kept for reference
```

---

## Files to Archive Now

### Implementation Details (Move to archive/implementation-docs/)
- `CRITICAL_ISSUES_ANALYSIS.md` → `archive/implementation-docs/critical-fixes/`
- `IMPLEMENTATION_SUMMARY.md` → `archive/implementation-docs/hover-system/`
- `HOVER_IMPLEMENTATION_SUMMARY.md` → `archive/implementation-docs/hover-system/`
- `TOUCH_FLOW.md` → `archive/implementation-docs/touch-support/`
- `TOUCH_SUPPORT.md` → `archive/implementation-docs/touch-support/`
- `KEYBOARD_*.md` (3 files) → `archive/implementation-docs/keyboard-nav/`

### Testing Docs (Move to archive/testing-docs/)
- `HOVER_TESTING_GUIDE.md` → `archive/testing-docs/`
- `PLAYTEST_CHECKLIST.md` → Keep in root (still used)

### Session History (Rename current, archive old)
- `SESSION_SUMMARY.md` → Archive as `archive/session-summaries/2025-12-30-phase1.md`
- Keep `SESSION_SUMMARY_LATEST.md` in root

### Cleanup Temp Files
- `DOCUMENTATION_CLEANUP.md` → Delete (one-time use)
- Any `nul` files → Delete

---

## File Naming Convention

### Active Files (Root)
- Use SCREAMING_SNAKE_CASE: `CHANGE_PROTOCOL.md`
- Descriptive names: What it contains, not when created
- No dates in filenames (use git history)

### Archive Files
- Include date if one-time: `2025-12-30-session-summary.md`
- Group by topic in subdirectories
- Keep original names for reference

---

## When to Archive

**Archive a file when**:
- It's implementation-specific (not general guidance)
- It's a snapshot in time (session summary, test results)
- It's superseded by another doc
- It hasn't been referenced in 2+ months

**Keep in root when**:
- It's actively consulted during development
- It's part of the standard workflow
- It contains current project state
- It's referenced in README's doc guide

---

## Maintenance Schedule

### Monthly Review
- [ ] Check for obsolete files in root
- [ ] Archive implementation-specific docs
- [ ] Archive old session summaries (keep last 3 in root)
- [ ] Update this structure doc

### After Each Phase
- [ ] Archive phase-specific implementation docs
- [ ] Archive old test results
- [ ] Update PROGRESS.md
- [ ] Create new session summary

### Before Each Session
- [ ] Read QUICK_REFERENCE.md
- [ ] Check PROGRESS.md for current state
- [ ] Review SESSION_SUMMARY_LATEST.md

---

## Quick Reference

**"I want to..."**

- Start working → Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Make a change → Read [CHANGE_PROTOCOL.md](CHANGE_PROTOCOL.md)
- Understand architecture → Read [ARCHITECTURE.md](ARCHITECTURE.md)
- See what's done → Read [PROGRESS.md](PROGRESS.md)
- Plan next phase → Read [DEVELOPMENT.md](DEVELOPMENT.md)
- Understand the vision → Read [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- Learn game mechanics → Read [GAME_DESIGN.md](GAME_DESIGN.md)
- Multi-session work → Read [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)
- Find old implementations → Check `archive/implementation-docs/`
- Find old test results → Check `archive/testing-docs/`

---

## Cleanup Script

```bash
#!/bin/bash
# cleanup-docs.sh - Organize documentation structure

# Create archive structure
mkdir -p archive/implementation-docs/{hover-system,touch-support,keyboard-nav,critical-fixes}
mkdir -p archive/testing-docs
mkdir -p archive/session-summaries
mkdir -p archive/deprecated

# Move implementation docs
mv CRITICAL_ISSUES_ANALYSIS.md archive/implementation-docs/critical-fixes/ 2>/dev/null
mv *IMPLEMENTATION*.md archive/implementation-docs/hover-system/ 2>/dev/null
mv TOUCH_*.md archive/implementation-docs/touch-support/ 2>/dev/null
mv KEYBOARD_*.md archive/implementation-docs/keyboard-nav/ 2>/dev/null

# Move testing docs
mv HOVER_TESTING_GUIDE.md archive/testing-docs/ 2>/dev/null

# Archive old session summaries
mv SESSION_SUMMARY.md archive/session-summaries/2025-12-30-phase1.md 2>/dev/null

# Remove temp files
rm -f DOCUMENTATION_CLEANUP.md nul 2>/dev/null

echo "✅ Documentation cleanup complete"
echo "📁 Active docs in root: $(ls -1 *.md | wc -l)"
echo "📁 Archived docs: $(find archive -name "*.md" | wc -l)"
```

---

## Documentation Health Checklist

Run this before each session:

- [ ] All active docs in root are current (updated in last month)
- [ ] No duplicate information across docs
- [ ] All docs cross-reference correctly
- [ ] Archive contains only reference material
- [ ] No temp files in root
- [ ] README accurately lists all active docs

---

**Principle**: **Active docs in root, reference in archive, delete nothing (git remembers)**
