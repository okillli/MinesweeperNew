# Change Protocol & Definition of Done

> **When to Read This**: Before making any code changes, before committing, or when unsure about process
> **Related Docs**: [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md) for multi-session workflow
> **Read Time**: ~5 minutes

**Purpose**: Simple, practical guidelines for making changes without overcomplicating the process.

---

## Core Principles

1. **Keep It Simple** - If a process feels too heavy, simplify it
2. **Document What Matters** - Update docs that help future you, skip busywork
3. **Test Before Committing** - Always verify changes work
4. **Communicate Intent** - Commit messages should explain "why," code comments explain "how"

---

## Change Workflow

### 0. Analysis & Research (MANDATORY for Non-Trivial Changes)

**⚠️ CRITICAL: Never blindly implement requests. Always analyze first.**

**Step 1: Create Analysis Document** (5-10 minutes)
```markdown
# ANALYSIS_[feature-name].md

## Understanding the Request
- What is being asked?
- Why is it needed?
- What problem does it solve?

## Scope Analysis
- What files will be affected?
- What systems interact with this?
- What are the dependencies?

## Risk Assessment
- What could go wrong?
- What's the blast radius?
- How do we mitigate risks?
```

**Step 2: Research Best Practices** (10-20 minutes for complex features)
- Search for industry standards (MDN, web.dev, WCAG)
- Review similar implementations
- Check OWASP for security
- Document findings in `RESEARCH_[topic].md`

**Step 3: Create Implementation Plan** (10-15 minutes)
```markdown
# PLAN_[feature-name].md

## Technical Approach
- Architecture pattern to use
- Design decisions and rationale
- Alternative approaches considered

## File Changes
- Detailed list of what changes where and why

## Testing Strategy
- Automated tests needed
- Manual test cases
- Edge cases to cover

## Rollback Plan
- How to revert if needed
```

**When to Skip Analysis**:
- Typo fixes
- Comment updates
- Code formatting only
- Trivial changes (< 5 lines, 1 file, no logic)

**See [AUTOMATION_FRAMEWORK.md](AUTOMATION_FRAMEWORK.md) for complete analysis guidelines**

---

### 1. Before Making Changes

**Quick Checklist** (~2 minutes):
- [ ] Read [PROGRESS.md](PROGRESS.md) - Understand current state
- [ ] Check [DEVELOPMENT.md](DEVELOPMENT.md) - See if task is planned
- [ ] Review [ARCHITECTURE.md](ARCHITECTURE.md) - Check patterns for relevant code
- [ ] **Create analysis document if non-trivial** (see above)

**For New Features**:
- [ ] **MANDATORY**: Create `ANALYSIS_[feature].md`
- [ ] **MANDATORY**: Research best practices
- [ ] **MANDATORY**: Create `PLAN_[feature].md`
- [ ] Add task to [DEVELOPMENT.md](DEVELOPMENT.md) if not already there
- [ ] Understand game design from [GAME_DESIGN.md](GAME_DESIGN.md)

**For Bug Fixes**:
- [ ] Reproduce the bug
- [ ] **MANDATORY**: Analyze root cause (not just symptoms)
- [ ] Research best practices for this type of bug
- [ ] Plan the fix with testing strategy

### 2. While Making Changes

**Code Standards**:
- ✅ Follow existing code style (match surrounding code)
- ✅ Add JSDoc comments for new functions/classes
- ✅ Use descriptive variable names
- ✅ Keep functions focused (one responsibility)
- ✅ Maintain separation of concerns (logic ≠ rendering)

**What to Avoid**:
- ❌ Mixing multiple unrelated changes in one commit
- ❌ Leaving commented-out code (delete it, git remembers)
- ❌ Adding features without requirements
- ❌ Breaking existing functionality

**When to Ask for Review** (from user/teammate):
- Major architectural changes
- Performance optimizations
- Security-related code
- Unclear requirements

### 3. Before Committing

**Definition of Done** - ALL must be true:

#### Code Complete
- [ ] **Feature works** - Tested manually, behaves as expected
- [ ] **No breaking changes** - Existing features still work
- [ ] **No console errors** - Clean browser console
- [ ] **Code follows patterns** - Matches [ARCHITECTURE.md](ARCHITECTURE.md)
- [ ] **Comments added** - JSDoc for public APIs, inline for complex logic

#### Testing Complete
- [ ] **Manual testing done** - Used the feature/fix yourself
- [ ] **Edge cases tested** - Tried to break it (invalid inputs, boundary conditions)
- [ ] **Cross-browser tested** - Works in Chrome/Firefox/Safari (desktop)
- [ ] **Mobile tested** (if UI change) - Works on phone/tablet

#### Documentation Updated
- [ ] **[PROGRESS.md](PROGRESS.md) updated** - Added to relevant section
- [ ] **Code comments added** - Explain "why" not "what"
- [ ] **[ARCHITECTURE.md](ARCHITECTURE.md) updated** (if patterns changed)
- [ ] **[GAME_DESIGN.md](GAME_DESIGN.md) updated** (if mechanics changed)

#### Commit Ready
- [ ] **Files staged** - `git add` only relevant files
- [ ] **Commit message drafted** - Clear, concise, explains why
- [ ] **No debug code** - Removed console.logs, debugger statements
- [ ] **No TODO comments** - Either implement or create task in [DEVELOPMENT.md](DEVELOPMENT.md)

---

## Commit Message Format

### Structure
```
<type>: <short summary> (50 chars max)

<optional detailed explanation>
- Why this change was needed
- What problem it solves
- Any important implementation notes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring (no behavior change)
- `docs` - Documentation only
- `style` - Code formatting (no logic change)
- `perf` - Performance improvement
- `test` - Adding tests
- `chore` - Build/tooling changes

### Examples

**Good**:
```
fix: Prevent infinite loop in Grid constructor

Added validation to reject mine counts >= total cells, which caused
the rejection sampling algorithm to loop forever. Also added validation
for negative/non-integer dimensions.

Fixes browser freeze when Grid is created with invalid parameters.
```

**Good**:
```
feat: Add mobile touch support for gameplay

Implemented tap-to-reveal and long-press-to-flag gestures for mobile
devices. Includes haptic feedback and swipe cancellation. Cell size
increased to 44x44px for WCAG compliance.
```

**Bad**:
```
updates
```

**Bad**:
```
Fixed bug, added feature, updated docs, refactored code, changed styles
```

---

## After Committing

### Update Session Summary
After each commit (or at end of session):

1. Update [PROGRESS.md](PROGRESS.md):
   - Mark completed tasks
   - Add new git commit to list
   - Update "What Works" section

2. Update [SESSION_SUMMARY_LATEST.md](SESSION_SUMMARY_LATEST.md):
   - Add commit to list
   - Summarize what was accomplished
   - Note any blockers or next steps

### Multi-Session Work
If you're stopping mid-feature:

1. Create a TODO comment in code: `// TODO(Phase X): <what's left>`
2. Update [DEVELOPMENT.md](DEVELOPMENT.md) with current status
3. Update [SESSION_SUMMARY_LATEST.md](SESSION_SUMMARY_LATEST.md) with handoff notes

---

## Common Scenarios

### Scenario 1: Small Bug Fix
**Workflow**:
1. Reproduce bug
2. Fix code
3. Test fix works
4. Check nothing broke
5. Update [PROGRESS.md](PROGRESS.md)
6. Commit with `fix:` type

**Time**: 15-30 minutes
**Docs to update**: PROGRESS.md only

### Scenario 2: New Feature (Small)
**Example**: Add new item type

**Workflow**:
1. Read [GAME_DESIGN.md](GAME_DESIGN.md) for requirements
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) for patterns
3. Implement feature
4. Test thoroughly
5. Update [PROGRESS.md](PROGRESS.md)
6. Update [GAME_DESIGN.md](GAME_DESIGN.md) (item list)
7. Commit with `feat:` type

**Time**: 1-2 hours
**Docs to update**: PROGRESS.md, GAME_DESIGN.md

### Scenario 3: New Feature (Large)
**Example**: Implement entire shop system

**Workflow**:
1. Review design in [GAME_DESIGN.md](GAME_DESIGN.md)
2. Plan implementation (use agents if parallelizable)
3. Implement in stages:
   - Stage 1: Data structures → commit
   - Stage 2: Core logic → commit
   - Stage 3: UI integration → commit
   - Stage 4: Testing & polish → commit
4. Update all relevant docs
5. Final integration commit

**Time**: 4-8 hours
**Docs to update**: PROGRESS.md, ARCHITECTURE.md, DEVELOPMENT.md
**Commits**: 3-5 (one per stage)

### Scenario 4: Refactoring
**Workflow**:
1. Ensure tests pass (or manually test current behavior)
2. Refactor code
3. Verify behavior unchanged
4. Update [ARCHITECTURE.md](ARCHITECTURE.md) if patterns changed
5. Commit with `refactor:` type

**Time**: 1-3 hours
**Docs to update**: ARCHITECTURE.md (if patterns changed), PROGRESS.md

### Scenario 5: Critical Bug Fix
**Workflow**:
1. Identify and reproduce bug
2. Fix immediately
3. Test thoroughly
4. Update [PROGRESS.md](PROGRESS.md) with "Critical Fix" note
5. Commit with `fix(critical):` prefix
6. Consider hotfix deployment

**Time**: Varies
**Docs to update**: PROGRESS.md (mark as critical)

---

## Review Checklist

Use this before every commit:

### Code Quality
- [ ] No console.log/debugger statements (unless intentional)
- [ ] No commented-out code
- [ ] No temporary test code
- [ ] Variable names are clear
- [ ] Functions are focused (< 50 lines ideally)
- [ ] No code duplication (DRY principle)

### Functionality
- [ ] Feature works as intended
- [ ] Edge cases handled
- [ ] Error handling added where needed
- [ ] No regressions (old features still work)

### Performance
- [ ] No obvious performance issues
- [ ] No memory leaks (event listeners cleaned up)
- [ ] Efficient algorithms used

### Documentation
- [ ] JSDoc comments on new public functions
- [ ] Complex logic has inline comments
- [ ] README/docs updated if user-facing changes
- [ ] PROGRESS.md updated

### Git
- [ ] Only relevant files staged
- [ ] Commit message is clear
- [ ] Commit is atomic (one logical change)
- [ ] No secrets/credentials in code

---

## When to Skip Steps

**You can skip** documentation updates for:
- Fixing typos in comments
- Formatting changes (whitespace, indentation)
- Renaming variables for clarity (no behavior change)

**You must NOT skip** testing for:
- Anything that affects game logic
- Anything that changes UI
- Anything that modifies state management
- Any bug fix

---

## Emergency Fixes

If production is broken (or demo is in 5 minutes):

1. **Fix first, document later**
   - Get it working
   - Commit with `fix(urgent):` prefix
   - Add TODO to document later

2. **Come back and document** (within 24 hours)
   - Update [PROGRESS.md](PROGRESS.md)
   - Add comments explaining the fix
   - Update relevant design docs

---

## Guidelines Summary

### Always Do
✅ Test your changes manually
✅ Update [PROGRESS.md](PROGRESS.md)
✅ Write clear commit messages
✅ Follow existing code patterns
✅ Clean up before committing

### Never Do
❌ Commit broken code
❌ Mix unrelated changes
❌ Leave debug code in commits
❌ Skip testing
❌ Write unclear commit messages

### Sometimes Do (Use Judgment)
🤔 Update [ARCHITECTURE.md](ARCHITECTURE.md) - Only if patterns changed
🤔 Update [GAME_DESIGN.md](GAME_DESIGN.md) - Only if mechanics changed
🤔 Write detailed commit body - For complex changes
🤔 Create multiple commits - For large features

---

## Quick Reference

| Change Type | Time | Docs to Update | Testing Required |
|-------------|------|----------------|------------------|
| Typo fix | 1 min | None | Visual check |
| Small bug fix | 15-30 min | PROGRESS.md | Manual + edge cases |
| Small feature | 1-2 hrs | PROGRESS.md, GAME_DESIGN.md | Manual + edge cases + cross-browser |
| Large feature | 4-8 hrs | PROGRESS.md, ARCHITECTURE.md, DEVELOPMENT.md | Full testing suite |
| Refactoring | 1-3 hrs | ARCHITECTURE.md (maybe) | Verify no behavior change |
| Critical fix | Varies | PROGRESS.md (mark critical) | Thorough testing |

---

## When in Doubt

**Ask yourself**:
1. Will future me understand this code in 6 months?
2. Will this change break anything?
3. Is this the simplest solution?
4. Have I tested this enough?

**If any answer is "no"**, revise before committing.

**Still unsure?**
- Review [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)
- Check similar past commits for patterns
- Ask for review (from user or AI assistant)

---

**Last Updated**: 2025-12-30
**Version**: 1.0

*This is a living document - update it as we learn what works and what doesn't.*
