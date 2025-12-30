# Impact Analysis Checklist

> **Purpose**: Systematic checklist for analyzing the impact of changes before implementation
> **When to Use**: Before making any non-trivial change to the codebase
> **Time Investment**: 5-15 minutes (saves hours of debugging later)
> **Related**: [DEPENDENCIES.md](DEPENDENCIES.md), [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md)

---

## Quick Start

**Before making any change, answer these 5 critical questions:**

1. ❓ What files will be modified?
2. ❓ What components depend on these files?
3. ❓ What tests cover these components?
4. ❓ What could break?
5. ❓ How will I verify it works?

If you can't confidently answer these, **use the full checklist below**.

---

## Full Impact Analysis Process

### Phase 1: Change Description

**What are you changing and why?**

- [ ] **Change Type**:
  - [ ] Bug fix
  - [ ] New feature
  - [ ] Refactoring
  - [ ] Performance optimization
  - [ ] Documentation only

- [ ] **Files to be modified**: (list all)
  - [ ] File 1:
  - [ ] File 2:
  - [ ] File 3:

- [ ] **Reason for change**: (why is this necessary?)

- [ ] **Expected outcome**: (what should happen after the change?)

---

### Phase 2: Dependency Mapping

**What components are affected by this change?**

#### Direct Dependencies

- [ ] **What does this component import?** (check file imports)
  - [ ] Component 1:
  - [ ] Component 2:

- [ ] **What imports this component?** (check [DEPENDENCIES.md](DEPENDENCIES.md))
  - [ ] Consumer 1:
  - [ ] Consumer 2:

- [ ] **Are there any circular dependencies?** (check [DEPENDENCIES.md](DEPENDENCIES.md))
  - [ ] Yes → ⚠️ Proceed with extreme caution
  - [ ] No → ✅ Safe to proceed

#### Indirect Dependencies (2+ levels deep)

- [ ] **What depends on the direct consumers?**
  - [ ] Level 2 dependency 1:
  - [ ] Level 2 dependency 2:

- [ ] **Are any critical paths affected?** (Game loop? Input handling? Rendering?)
  - [ ] Yes → List critical paths:
  - [ ] No → ✅ Lower risk

---

### Phase 3: Impact Scoring

**Rate the severity of this change:**

#### Volatility (How often does this code change?)
- [ ] 1 - Rarely changes (foundation code)
- [ ] 3 - Changes occasionally (feature code)
- [ ] 5 - Changes frequently (UI, experimental features)

**Score:** _____

#### Complexity (How difficult to understand/modify?)
- [ ] 1 - Simple, obvious logic
- [ ] 3 - Moderate complexity
- [ ] 5 - Complex algorithms, many edge cases

**Score:** _____

#### Completeness (How well-defined is the requirement?)
- [ ] 1 - Crystal clear requirements
- [ ] 3 - Some ambiguity
- [ ] 5 - Vague or undefined requirements

**Score:** _____

#### Criticality (How essential is this to core functionality?)
- [ ] 1 - Nice-to-have feature
- [ ] 3 - Important but not critical
- [ ] 5 - Core game mechanic or critical path

**Score:** _____

**Total Impact Score:** _____ / 20

**Risk Assessment:**
- **15-20**: 🔴 CRITICAL - Extensive planning and testing required
- **10-14**: 🟡 HIGH - Thorough review and integration testing needed
- **5-9**: 🟢 MEDIUM - Standard testing and code review
- **1-4**: ⚪ LOW - Basic testing acceptable

---

### Phase 4: Blast Radius Analysis

**What is the maximum reach of this change?**

- [ ] **Radius 0** (the changed component itself):
  - Component:
  - Testing strategy: 100% unit test coverage

- [ ] **Radius 1** (direct dependencies):
  - Component 1:
  - Component 2:
  - Testing strategy: 80% integration test coverage

- [ ] **Radius 2** (dependencies of dependencies):
  - Component 1:
  - Component 2:
  - Testing strategy: 50% integration test coverage

- [ ] **Radius 3+** (indirect dependencies):
  - Component 1:
  - Testing strategy: Smoke tests

**Estimated Blast Radius:** _____ (0-3+)

---

### Phase 5: Failure Mode Analysis

**What could go wrong?**

For each potential failure, document:

#### Failure Mode 1:
- [ ] **What could fail?**
  - Description:

- [ ] **What would cause it?**
  - Root cause:

- [ ] **What happens if it fails?**
  - Effect:

- [ ] **How will we detect it?**
  - Detection method:

- [ ] **How will we prevent/mitigate it?**
  - Mitigation:

#### Failure Mode 2:
- [ ] **What could fail?**
  - Description:

- [ ] **What would cause it?**
  - Root cause:

- [ ] **What happens if it fails?**
  - Effect:

- [ ] **How will we detect it?**
  - Detection method:

- [ ] **How will we prevent/mitigate it?**
  - Mitigation:

*(Add more as needed)*

---

### Phase 6: Testing Strategy

**How will you verify this change works?**

#### Unit Tests
- [ ] **What unit tests exist?**
  - Test file 1:
  - Test file 2:

- [ ] **What new tests are needed?**
  - Test 1:
  - Test 2:

- [ ] **Will existing tests break?**
  - [ ] Yes → List tests to update:
  - [ ] No → ✅ Safe

#### Integration Tests
- [ ] **What integration flows are affected?**
  - Flow 1:
  - Flow 2:

- [ ] **What integration tests exist?**
  - Test 1:
  - Test 2:

- [ ] **What new integration tests are needed?**
  - Test 1:
  - Test 2:

#### Manual Testing
- [ ] **What should be manually tested?**
  - [ ] Feature 1:
  - [ ] Feature 2:
  - [ ] Edge case 1:
  - [ ] Edge case 2:

- [ ] **What scenarios could expose regressions?**
  - Scenario 1:
  - Scenario 2:

---

### Phase 7: Rollback Plan

**If this change breaks production, how do you revert?**

- [ ] **Can this change be reverted cleanly?**
  - [ ] Yes → Describe rollback process:
  - [ ] No → ⚠️ Why not?

- [ ] **Will reverting require data migration?**
  - [ ] Yes → Document migration plan:
  - [ ] No → ✅ Simple revert

- [ ] **Are there any permanent side effects?**
  - [ ] Yes → ⚠️ Document:
  - [ ] No → ✅ Safe

---

### Phase 8: Documentation Updates

**What documentation needs updating?**

- [ ] **Code comments**
  - [ ] Inline dependency comments
  - [ ] Method documentation
  - [ ] Complex algorithm explanations

- [ ] **System documentation**
  - [ ] [DEPENDENCIES.md](DEPENDENCIES.md) (if dependency structure changes)
  - [ ] [ARCHITECTURE.md](ARCHITECTURE.md) (if architecture patterns change)
  - [ ] [GAME_DESIGN.md](GAME_DESIGN.md) (if game mechanics change)

- [ ] **User-facing documentation**
  - [ ] [README.md](README.md) (if user experience changes)
  - [ ] Inline help text (if UI changes)

---

### Phase 9: Performance Considerations

**Could this change affect performance?**

- [ ] **Does this run in a hot path?** (Game loop? Input handler? Render?)
  - [ ] Yes → ⚠️ Performance testing required
  - [ ] No → ✅ Lower priority

- [ ] **Does this add new iterations?** (Loops over cells? Nested loops?)
  - [ ] Yes → Estimate complexity: O(_____)
  - [ ] No → ✅ No complexity impact

- [ ] **Does this affect memory usage?** (New arrays? Large objects?)
  - [ ] Yes → Estimate memory impact:
  - [ ] No → ✅ No memory impact

- [ ] **Performance testing plan:**
  - Benchmark 1:
  - Benchmark 2:

---

### Phase 10: Security Considerations

**Could this change introduce security vulnerabilities?**

- [ ] **User input handling**
  - [ ] Does this process user input? → Validate and sanitize
  - [ ] Could this lead to XSS? → Escape output
  - [ ] Could this lead to injection attacks? → Parameterize queries

- [ ] **Data persistence**
  - [ ] Does this save/load data? → Validate structure
  - [ ] Could malicious data break the game? → Add validation

- [ ] **External resources**
  - [ ] Does this load external resources? → Validate sources
  - [ ] Could this expose sensitive data? → Review data flow

---

## Decision Tree

Use this flowchart to determine your testing strategy:

```
START
  │
  ├─ Is this a critical component? (Grid, GameState, Game)
  │   YES → Run full test suite + extensive manual testing
  │   NO  → Continue
  │
  ├─ Does this affect multiple files?
  │   YES → Run integration tests for all affected systems
  │   NO  → Continue
  │
  ├─ Is this a public API change? (Method signature, property name)
  │   YES → Check all consumers + update documentation
  │   NO  → Continue
  │
  ├─ Is this in a hot path? (Game loop, input handler, render)
  │   YES → Performance testing required
  │   NO  → Continue
  │
  ├─ Is this a bug fix?
  │   YES → Add regression test + verify fix
  │   NO  → Continue
  │
  └─ Standard testing: Unit tests + smoke test
```

---

## Example: Changing Grid.revealCell()

Let's walk through an example analysis:

### Phase 1: Change Description
- **Change Type**: Refactoring
- **Files Modified**: `src/entities/Grid.js`
- **Reason**: Convert recursive cascade to iterative algorithm for better performance
- **Expected Outcome**: Same behavior, better performance on large grids

### Phase 2: Dependency Mapping
- **Direct consumers**: main.js (click handlers), Grid.revealAdjacent (cascade)
- **Indirect consumers**: CanvasRenderer (reads revealed cells), GameState (win condition)
- **Critical paths**: User click → revealCell → cascade → rendering

### Phase 3: Impact Scoring
- Volatility: 1 (stable code)
- Complexity: 5 (complex cascade algorithm)
- Completeness: 1 (well-defined behavior)
- Criticality: 5 (core game mechanic)
- **Total: 12 / 20 - HIGH RISK** 🟡

### Phase 4: Blast Radius
- Radius 0: Grid.revealCell
- Radius 1: main.js handlers, Grid.revealAdjacent
- Radius 2: CanvasRenderer, GameState
- **Blast Radius: 2**

### Phase 5: Failure Modes
1. **Infinite loop**: Stack overflow → Add loop counter limit
2. **Wrong cells revealed**: Logic error → Add unit tests for all cascade patterns
3. **Performance regression**: Slower than before → Benchmark before/after

### Phase 6: Testing Strategy
- Unit tests: All Grid.revealCell test cases (zeros, numbers, boundaries)
- Integration: Full game playtest (reveal large areas)
- Manual: Test on 16x16 grid with many zeros

### Phase 7: Rollback
- Clean revert: Yes (single function change)
- No data migration needed

### Phase 8: Documentation
- Update Grid.js method comments
- Update DEPENDENCIES.md if call patterns change

### Phase 9: Performance
- Hot path: Yes (called frequently during gameplay)
- Performance testing: Benchmark reveal on 16x16 grid with 50% zeros

### Phase 10: Security
- No security implications (internal logic only)

**Decision**: Proceed with extensive testing ✅

---

## Templates

### Quick Analysis (5 minutes)

```markdown
## Quick Impact Analysis: [Change Description]

**Files Modified**:
**Direct Dependencies**:
**Risk Score**: ___ / 20
**Blast Radius**: ___
**Testing Required**:
**Rollback Plan**:
```

### Full Analysis (15 minutes)

Copy this checklist and fill out all sections for critical changes.

---

## Post-Change Verification

After implementing your change, verify:

- [ ] All identified tests pass
- [ ] Manual test scenarios complete successfully
- [ ] No unexpected console errors or warnings
- [ ] Performance is acceptable (if applicable)
- [ ] Documentation is updated
- [ ] Code review completed (if applicable)
- [ ] Rollback plan validated

---

## Related Documents

- [DEPENDENCIES.md](DEPENDENCIES.md) - Dependency mapping reference
- [PRE_CHANGE_CHECKLIST.md](PRE_CHANGE_CHECKLIST.md) - Quick reference before changes
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture patterns and principles
- [CHANGE_PROTOCOL.md](CHANGE_PROTOCOL.md) - Change management workflow

---

**Last Updated**: 2025-12-30
**Next Review**: After completing Phase 2 (when more systems exist)
