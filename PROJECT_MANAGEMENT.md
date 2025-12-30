# LiMineZZsweeperIE - Project Management Protocol

> **When to Read This**: Before starting any work session, especially multi-session or parallel work
> **Related Docs**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for quick context, [CLAUDE.md](CLAUDE.md) for Claude-specific guidance
> **Read Time**: ~15 minutes (skim sections as needed)
>
> **Single Source of Truth for Multi-Session Development**
>
> This document establishes how to manage this project across multiple Claude Code sessions without losing context or creating conflicts.

## 🗺️ Decision Tree: Which Doc to Read?

```
Are you starting work?
├─ First time on project?
│  └─ Read: README.md → QUICK_REFERENCE.md → PROJECT_OVERVIEW.md
├─ Returning after break?
│  └─ Read: QUICK_REFERENCE.md → PROGRESS.md → DEVELOPMENT.md
├─ Working with other sessions?
│  └─ Read: This file (PROJECT_MANAGEMENT.md)
└─ Need to implement feature?
   └─ Read: GAME_DESIGN.md → ARCHITECTURE.md → QUICK_REFERENCE.md
```

## 📚 Quick Links to Other Docs

- **[README.md](README.md)** - User-facing documentation
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick facts & constants
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Vision & design philosophy
- **[GAME_DESIGN.md](GAME_DESIGN.md)** - Complete game mechanics
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Code structure & patterns
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Roadmap & task tracking
- **[CLAUDE.md](CLAUDE.md)** - Claude Code guidance
- **[PROGRESS.md](PROGRESS.md)** - What's complete
- **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** - Session notes

---

## 1. Single Source of Truth Principle

### Authoritative Files by Category

| Information | Authoritative File | Backup | Update Frequency |
|---|---|---|---|
| **Project Vision** | PROJECT_OVERVIEW.md | GAME_DESIGN.md | Once per phase |
| **Technical Architecture** | ARCHITECTURE.md | Code comments | When structure changes |
| **Development Status** | PROGRESS.md | DEVELOPMENT.md | After each task |
| **Next Tasks** | DEVELOPMENT.md + TodoWrite | QUICK_REFERENCE.md | Start of session |
| **Game Rules & Balance** | GAME_DESIGN.md | QUICK_REFERENCE.md (summary) | During design phase |
| **Code Patterns** | ARCHITECTURE.md | Code files (see examples) | Before new features |
| **What Changed Last** | Git commit log | SESSION_SUMMARY.md | Every commit |

### Where to Check Current Status (Priority Order)

1. **First**: [PROGRESS.md](PROGRESS.md) - Always the source of truth for what's done
2. **Second**: [DEVELOPMENT.md](DEVELOPMENT.md) - Phase roadmap and task breakdown
3. **Third**: Latest git commit - What was just finished
4. **Fourth**: Code itself - Verify assumptions

### Where to Find Next Tasks

1. **First**: [DEVELOPMENT.md](DEVELOPMENT.md) - Current phase tasks, ordered by priority
2. **Second**: TodoWrite task list - If session in progress
3. **Third**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) "Next Immediate Steps" - Quick-start guide
4. **Fourth**: Comment any blockers in [PROGRESS.md](PROGRESS.md)

---

## 2. Agent Coordination Rules

### When to Use Parallel Agents (No Dependencies)

Parallel execution is safe when tasks don't modify the same files or require each other's output.

**Example - ALLOWED (independent files)**:
```
Agent A: Implement ItemSystem.js
Agent B: Implement ShopSystem.js
Agent C: Define items.js data
Agent D: Create UIRenderer.js

Run ALL in parallel - different files, no dependencies
```

**Process**:
1. Ensure each agent modifies different files (check FILES_BEING_WORKED_ON section below)
2. Pre-allocate file ownership in [SESSION_SUMMARY.md](SESSION_SUMMARY.md)
3. Each agent reads [ARCHITECTURE.md](ARCHITECTURE.md) before starting
4. Agents complete independently, then meet for integration
5. One agent does final git commit combining all changes

### When to Use Sequential Agents (Has Dependencies)

Sequential execution required when Agent B needs output from Agent A.

**Example - MUST BE SEQUENTIAL**:
```
Agent A: Create Cell.js class
Agent B: Create Grid.js that uses Cell.js
Agent C: Wire Grid into Game.js

Do A → B → C in order
```

**Process**:
1. Agent A completes and commits first
2. Agent B reads commit, then starts work
3. Agent C reads both previous commits, then starts
4. Single final commit or chain of commits tracking dependency

### How to Communicate Progress Between Agents

**During parallel work**:
1. Update [SESSION_SUMMARY.md](SESSION_SUMMARY.md) with current file, completion %, and blockers
2. Post comments in code at key decision points (use `// NOTE:` prefix)
3. If discovering new dependencies, immediately update task breakdown

**After completing work**:
1. Update [PROGRESS.md](PROGRESS.md) with what was accomplished
2. Add entry to [SESSION_SUMMARY.md](SESSION_SUMMARY.md) with results
3. Create git commit with clear message (see Commit Protocol)
4. Update [DEVELOPMENT.md](DEVELOPMENT.md) task status (mark ✅)

### File Locking/Ownership to Prevent Conflicts

**Rule**: Maximum 1 agent per file at a time.

**File Ownership Protocol**:

```
SESSION_SUMMARY.md - FILES BEING WORKED ON
============================================
Current Session: [Date/Time]
Agent 1: [File] - [%Complete] - [Blocker if any]
Agent 2: [File] - [%Complete] - [Blocker if any]

Example:
Agent 1: src/entities/Cell.js - 100% - DONE
Agent 2: src/entities/Grid.js - 80% - Waiting for Cell.js integration
Agent 3: src/core/Game.js - 50% - BLOCKED: waiting for GameState pattern review
```

**Before starting work on a file**:
1. Check [SESSION_SUMMARY.md](SESSION_SUMMARY.md) - Is it already assigned?
2. If assigned to another agent → WAIT or work on different file
3. If free → Add your name + file to [SESSION_SUMMARY.md](SESSION_SUMMARY.md)
4. Read that file completely to understand current state
5. Make changes, test, commit

**When finished with a file**:
1. Mark as 100% in [SESSION_SUMMARY.md](SESSION_SUMMARY.md)
2. Update [PROGRESS.md](PROGRESS.md)
3. Create specific git commit for that file
4. Remove from "FILES BEING WORKED ON" section

---

## 3. Progress Tracking Protocol

### Session Start Checklist

**EVERY session, first agent should**:

```
1. Read PROGRESS.md (current status)
2. Read DEVELOPMENT.md (phase roadmap)
3. Check SESSION_SUMMARY.md (last session's work)
4. Run: git log -5 --oneline (see last commits)
5. Identify next task from DEVELOPMENT.md
6. Update TodoWrite with session plan
7. Add session entry to SESSION_SUMMARY.md
```

> See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for condensed startup checklist

### Update TodoWrite at Start

When starting work, create task list:

```
TodoWrite task format:
{
  content: "Implement ItemSystem.js class",
  activeForm: "Implementing ItemSystem.js class",
  status: "in_progress"  // Mark ONE task as in_progress
}
```

**Rules**:
- ONE task at a time marked `in_progress`
- Move through tasks sequentially
- Mark `completed` immediately after finish
- Add blockers as new tasks if needed
- Remove tasks no longer relevant

### Update TodoWrite at End

When ending session:

```
1. Mark all completed tasks as "completed"
2. Mark in-progress task status clearly
3. Add summary of what was accomplished
4. List any blockers for next session
```

### Update PROGRESS.md After Each Phase

**When completing a major phase** (e.g., Phase 1 MVP done):

1. Add section with date completed
2. List all files implemented with checkmarks
3. Document what works vs. not yet
4. Add git commits for that phase
5. Update "Next Steps" with Phase 2 preview

**Template**:
```markdown
## Phase X: [Name] ✅ COMPLETE

**Date Completed**: YYYY-MM-DD

### Implemented Files
- ✅ **src/path/File.js** - Brief description

### What Works
- Feature A
- Feature B

### Testing Status
- Tested: [list of tests run]
- Results: All passing

### Next Phase Preview
- First task will be...
```

### Git Commit After Each Significant Milestone

**Commit frequency**:
- After completing each file → Small commit
- After completing system → Medium commit
- After completing phase → Large commit

**Commit message format**:
```
type: Brief description

- Bullet 1: What was added
- Bullet 2: How it connects to existing code
- Bullet 3: Any important decisions made

Related: [Task from DEVELOPMENT.md]
```

**Examples**:
```
feat: Implement Grid.js minesweeper logic

- Added Grid class with mine placement, number calculation
- Implements reveal, flag, chord mechanics
- Uses Cell.js for individual cell state
- Random mine placement with rejection sampling to prevent clusters

Related: Phase 1 - Basic minesweeper implementation

---

refactor: Consolidate color palette in constants.js

- Extracted all hardcoded colors to src/data/constants.js
- Updated CanvasRenderer.js and UIRenderer.js to reference constants
- Easier theme switching, single source of truth for colors

Related: Prep for multi-theme support
```

### Document All Decisions in Relevant Files

**Where to document decisions**:

| Decision Type | File | Format |
|---|---|---|
| Why we chose vanilla JS | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Design Decisions Log table |
| How to structure Grid.js | [ARCHITECTURE.md](ARCHITECTURE.md) | Code pattern example |
| What cells render as | Code comment in CanvasRenderer.js | `// NOTE: cells render as 32x32 squares` |
| Why phase 2 takes 15 hrs | [DEVELOPMENT.md](DEVELOPMENT.md) | Estimated Time section |
| Bug workaround | [PROGRESS.md](PROGRESS.md) under "Known Issues" | Description + any gotchas |

---

## 4. Context Recovery Process

### How to Resume Work After Context Loss

**Situation**: You're back for a new session and context was cleared.

**Recovery steps (5 minutes)**:

1. **Check Project Status** (1 min)
   ```
   Read: PROGRESS.md (top to bottom)
   Scan for: What's complete vs. what's next
   ```

2. **Understand Current Phase** (1 min)
   ```
   Read: DEVELOPMENT.md - Current Sprint Tasks
   Look for: Completed vs. In Progress tasks
   ```

3. **Get Technical Context** (1 min)
   ```
   Read: QUICK_REFERENCE.md - Essential Documents
   Skim: ARCHITECTURE.md if implementing code
   ```

4. **Check Last Work Session** (1 min)
   ```
   Read: SESSION_SUMMARY.md (bottom, most recent)
   Run: git log -10 --oneline
   Look for: What was just finished, any blockers noted
   ```

5. **Identify Next Task** (1 min)
   ```
   From DEVELOPMENT.md, find first unchecked task
   Verify file doesn't exist or needs modification
   Create TodoWrite task list for this session
   ```

> See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for condensed version of this process

### Files to Read First (Priority)

| Priority | File | Why |
|---|---|---|
| 1 | [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Overview + next steps |
| 2 | [PROGRESS.md](PROGRESS.md) | What's done, current phase |
| 3 | [DEVELOPMENT.md](DEVELOPMENT.md) | Detailed task list |
| 4 | [SESSION_SUMMARY.md](SESSION_SUMMARY.md) | Last work session notes |
| 5 | [ARCHITECTURE.md](ARCHITECTURE.md) | If writing code |
| 6 | Git log | If confusion on current state |

### How to Determine Current State

**Quick diagnosis**:

```bash
# See last few commits
git log -5 --oneline

# Check which files changed recently
git diff HEAD~1 --name-only

# If major confusion, check what's in PROGRESS.md "Phase X: ... ✅ COMPLETE"
# Count checkmarks to gauge progress
```

**Read these in order until you understand**:
1. PROGRESS.md - "Phase X: ... ✅ COMPLETE" checkmarks
2. DEVELOPMENT.md - "Current Sprint Tasks" section
3. SESSION_SUMMARY.md - Most recent session notes

### How to Find Next Tasks

**Process**:

```
1. Open DEVELOPMENT.md
2. Scroll to "Current Sprint Tasks"
3. Look for sections with "In Progress" or "Completed"
4. Find first task marked [ ] (not done)
5. Verify it's not blocked in "Blocked" section
6. If blocked, find task above it that's unblocked
```

**If unclear**:
- Check [PROGRESS.md](PROGRESS.md) "Next Steps: Phase X Planning"
- Look at [QUICK_REFERENCE.md](QUICK_REFERENCE.md) "Next Immediate Steps"
- Review [CLAUDE.md](CLAUDE.md) if it has context notes

---

## 5. File Modification Rules

### Always Read File Before Modifying

**Never assume file structure**. Always read first:

```
1. Use Read tool to see current contents
2. Check for existing patterns to match
3. Look for edge cases in existing code
4. Understand why it's structured that way (comments help)
5. THEN make changes
```

**Exception**: If creating a brand new file from scratch (no previous version):
- Still read [ARCHITECTURE.md](ARCHITECTURE.md) pattern first
- Still check related files for style
- Create file with same patterns as similar files

### Use Edit Tool for Small Changes, Write for New Files

**Edit tool** (surgical changes to existing files):
- Changing a function implementation
- Adding a new method to a class
- Fixing a bug
- Updating documentation paragraph

**Write tool** (starting fresh):
- Creating brand new files
- Completely rewriting a file
- When file structure will be very different

**Rule of thumb**: If existing file has code you want to preserve and understand, use Edit. If blank or starting over, use Write.

### Document Why Changes Were Made

**Every commit should have context**. Add in two places:

**In code** (inline comments):
```javascript
// CHANGE 2025-12-31: Increased default grid size to 12x12
// Reason: 10x10 felt too easy in playtesting
const DEFAULT_GRID_SIZE = 12;
```

**In git commit**:
```
refactor: Increase default grid size to 12x12

- Changed DEFAULT_GRID_SIZE from 10 to 12
- Playtesting showed 10x10 grid too easy, players finished in <2 mins
- 12x12 reaches target 5-10 min run duration

Related: Phase 1 playtesting feedback
```

### Test Changes Before Moving On

**Before committing**, test in this order:

1. **Syntax Check** - No console errors
   ```bash
   Open index.html in browser
   Check browser console (F12 > Console)
   Should show no red errors
   ```

2. **Unit Test** - Feature works in isolation
   ```javascript
   // Example: Testing Grid.js
   const grid = new Grid(10, 10, 15);
   console.assert(grid.cells.length === 100, "Grid has 100 cells");
   console.assert(grid.mineCount === 15, "Grid has 15 mines");
   ```

3. **Integration Test** - Feature works with other systems
   ```
   Play the game, try the feature
   Check it interacts correctly with other systems
   ```

4. **Playtest** - Feature is fun and balanced
   ```
   Play 3-5 full runs
   Does feature feel right?
   Any balance issues?
   ```

**Only commit after all pass**. If test fails:
- Fix the code
- Re-test
- THEN commit

---

## 6. Testing Protocol

### What to Test After Each Change

**Scope**: Minimum viable tests for that feature

| Change Type | Test | Command |
|---|---|---|
| New class | Instantiate, test basic methods | `const obj = new Class(); obj.method()` |
| Bug fix | Reproduce bug scenario, verify fix | Play game, trigger bug condition |
| UI change | Visual inspection | Open in browser, look at screen |
| Game mechanic | Full gameplay cycle | Play 1 complete run |
| Algorithm | Unit test with known inputs | `console.assert(result === expected)` |

### How to Verify Nothing Broke

**Integration checklist** (after ANY change):

```
1. Game Startup
   [ ] index.html loads without errors
   [ ] Canvas renders
   [ ] No console errors

2. Minesweeper Core
   [ ] Can left-click to reveal
   [ ] Can right-click to flag
   [ ] Cascading reveals work
   [ ] Chording works
   [ ] Win/lose detection works

3. If modified Game.js or GameState.js
   [ ] Game loop runs at consistent FPS
   [ ] State updates correctly
   [ ] No memory leaks (check dev tools)

4. If modified rendering files
   [ ] Grid displays correctly
   [ ] Numbers/mines/flags visible
   [ ] Layout responsive on different sizes
   [ ] Colors look right

5. If modified core files (must do full playtest)
   [ ] Complete one 5-board run
   [ ] No crashes
   [ ] Shop appears between boards
   [ ] Items work correctly
```

### When to Playtest vs Unit Test

**Unit Test** (quick, isolated):
- New calculation function
- Data transformation logic
- String formatting
- Anything without visual/game effect

**Playtest** (full game):
- Anything touching game state
- UI/UX changes
- Balancing tweaks
- New mechanics
- After any integration
- End of every phase

---

## 7. Session Management

### Session Template (Copy for each new session)

Add this to SESSION_SUMMARY.md each time you start:

```markdown
## Session: [Date] - [Agent Name]

**Goal**: [What you're trying to accomplish]

**Starting Status**:
- Phase: [current phase]
- Last task completed: [what was done last session]
- Blockers: [any known blockers]

### Files Being Worked On
- [File] - [%complete] - [blocker if any]

### Decisions Made This Session
- [Decision 1 + rationale]

### Completed This Session
- [File 1] - [what was done]

### Blockers Found
- [Blocker] - [impact] - [suggested fix]

### For Next Session
- [Thing to remember]
- [File to read]
- [Next task]
```

### End-of-Session Checklist

Before signing off:

```
[ ] All changes committed with descriptive messages
[ ] SESSION_SUMMARY.md updated with results
[ ] PROGRESS.md updated with new completed items
[ ] TodoWrite task list cleaned up
[ ] DEVELOPMENT.md task checkmarks updated
[ ] No uncommitted changes (git status clean)
[ ] Noted any blockers for next session
[ ] Code tested and working
```

---

## 8. Conflict Resolution

### If Two Sessions Modify Same File

**Prevention is better**:
- Always check SESSION_SUMMARY.md FILES_BEING_WORKED_ON
- Never work on file assigned to another session

**If conflict happens**:

1. **Review both changes**
   ```bash
   git log -p --follow [file]
   ```

2. **Determine which is correct**
   - Read PROGRESS.md for context
   - Check git commit messages
   - Read DEVELOPMENT.md for task intentions

3. **Merge manually**
   - Read both versions
   - Take the more recent AND correct one
   - Test thoroughly
   - Create new commit explaining merge

4. **Document the conflict**
   - Add note to SESSION_SUMMARY.md
   - Reason for the conflict
   - How it was resolved

### If Task Dependencies Change Mid-Development

**Example**: Thought you could do X in parallel with Y, but turns out X blocks Y.

**Immediate action**:
1. Comment blocker in PROGRESS.md
2. Add blocker to DEVELOPMENT.md "Blocked" section
3. Update TodoWrite status
4. Update SESSION_SUMMARY.md "Blockers Found"
5. Add note explaining dependency in code

**Example note**:
```markdown
## Blocker: ShopSystem needs ItemSystem first

**Discovery**: 2025-12-31, Session A
**Impact**: Can't start ShopSystem.js until ItemSystem defines Item interface
**Solution**: Reorder Phase 2 tasks - do ItemSystem before ShopSystem
**Updated**: DEVELOPMENT.md Phase 2 task order
```

---

## 9. Phase Completion Ceremony

When finishing a phase, follow this exact process:

### Step 1: Update PROGRESS.md

Add completed phase section:

```markdown
## Phase [N]: [Name] ✅ COMPLETE

**Date Completed**: YYYY-MM-DD

### Implemented Files (count)
- ✅ **src/path/File1.js** - Description

### What Works (bullet list of features)
- Feature A
- Feature B

### Testing Status
- Playtested: [number of runs]
- Results: [summary]

### Git Commits
1. `commit-hash` - Commit message

### Phase [N] Success Criteria
- ✅ Criterion 1
- ✅ Criterion 2
```

### Step 2: Update DEVELOPMENT.md

Check off all Phase tasks:
```
- [x] Task 1
- [x] Task 2
- [x] Task 3
```

### Step 3: Create Git Tag

Mark milestone in git:
```bash
git tag -a phase-1-complete -m "Phase 1 MVP: Core minesweeper working"
git push origin --tags
```

### Step 4: Plan Next Phase

Add "Next Steps: Phase [N+1]" section in PROGRESS.md with:
- 3-5 top priority tasks
- Time estimate
- Brief description of what phase does

### Step 5: Final Commit

Create summary commit:
```
docs: Complete Phase 1 - Core Proof of Fun

- Implemented 7 core files (Cell, Grid, Game, GameState, EventBus, CanvasRenderer, main.js)
- All minesweeper mechanics working (reveal, flag, chord, cascades)
- Grid renders correctly with colors and symbols
- Playtested: 15 playthroughs, 100% success rate
- Ready for Phase 2: Roguelike Elements

See PROGRESS.md for details.
```

---

## 10. Quick Emergency Reference

### "I have 5 minutes and need to resume"

```
1. Read: PROGRESS.md (2 min) - What's done?
2. Read: DEVELOPMENT.md "Current Sprint" (1 min) - What's next?
3. Read: SESSION_SUMMARY.md bottom (1 min) - What did last session do?
4. Start work (1 min remaining)
```

### "Code isn't working, where do I look?"

```
1. Check: Browser console (F12) for errors
2. Read: Code comments at top of file for known issues
3. Search: PROGRESS.md "Known Issues" section
4. Check: DEVELOPMENT.md for blockers
5. Review: Most recent git commit for context
```

### "What file do I work on next?"

```
1. Open: DEVELOPMENT.md
2. Find: "Current Sprint Tasks"
3. Look for: First [ ] (unchecked) task
4. Check: Is it blocked? If yes, skip to next
5. Start: Read that task description, start work
```

### "Did I do this right?"

```
1. Check: ARCHITECTURE.md for code patterns
2. Compare: Against similar file in codebase
3. Match: Naming conventions, structure, comments
4. Test: Run the code, does it work?
5. Ask: Does this match the description in DEVELOPMENT.md?
```

---

## Summary: The Golden Rules

1. **Always read [PROGRESS.md](PROGRESS.md) first** - It's your truth
2. **Update [SESSION_SUMMARY.md](SESSION_SUMMARY.md)** - Help future sessions
3. **Commit often, clearly** - Git log is your lifeline
4. **Document decisions** - Future you will thank present you
5. **Test before moving on** - Broken code breaks everything
6. **One file per agent** - Check [SESSION_SUMMARY.md](SESSION_SUMMARY.md) for ownership
7. **Read before modifying** - Never assume file structure
8. **Update TodoWrite** - Track what you're doing
9. **Playtest frequently** - Fun > features
10. **When stuck, read docs** - The answer is usually there

---

## 🔗 Quick Navigation

- **Main**: [README.md](README.md) - User-facing documentation
- **Quick Ref**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Fast facts
- **Overview**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Vision & principles
- **Design**: [GAME_DESIGN.md](GAME_DESIGN.md) - Game mechanics
- **Code**: [ARCHITECTURE.md](ARCHITECTURE.md) - Technical structure
- **Tasks**: [DEVELOPMENT.md](DEVELOPMENT.md) - Roadmap
- **Claude**: [CLAUDE.md](CLAUDE.md) - AI assistant guidance
- **Progress**: [PROGRESS.md](PROGRESS.md) - What's complete
- **Sessions**: [SESSION_SUMMARY.md](SESSION_SUMMARY.md) - Session notes

---

**Last Updated**: 2025-12-30
**Version**: 1.0 (Established at Project Start)

This document prevents context loss and coordinates development across multiple sessions. Update it if the process changes.
