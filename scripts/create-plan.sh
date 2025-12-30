#!/bin/bash
# Create implementation plan template for a feature

FEATURE_NAME=$1

if [ -z "$FEATURE_NAME" ]; then
    echo "Usage: ./create-plan.sh <feature-name>"
    echo "Example: ./create-plan.sh undo-last-move"
    exit 1
fi

FILENAME="PLAN_${FEATURE_NAME}.md"

cat > "$FILENAME" << 'EOF'
# Implementation Plan: [Feature Name]

**Date**: $(date +%Y-%m-%d)
**Planner**: Claude Code
**Based on**: `ANALYSIS_[feature].md` + `RESEARCH_[topics].md`
**Status**: Draft

---

## Overview

### Brief Description
[1-2 sentence summary of what we're building]

### Expected Outcome
[What the end result looks like]

### Success Criteria
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Measurable criterion 3]

---

## Technical Approach

### Architecture Pattern
**Pattern**: [e.g., Command Pattern, Observer Pattern, etc.]

**Rationale**:
- [Why this pattern fits]
- [Benefits it provides]
- [How it aligns with existing architecture]

### Design Decisions

| Decision | Options Considered | Chosen Approach | Rationale |
|----------|-------------------|-----------------|-----------|
| [Decision 1] | [Option A, B, C] | [Chosen] | [Why] |
| [Decision 2] | [Option A, B, C] | [Chosen] | [Why] |

### Alternative Approaches Considered
1. **[Approach 1]**: Rejected because [reason]
2. **[Approach 2]**: Rejected because [reason]

---

## Implementation Steps

### Phase 1: Data Structures
**Estimated Time**: [X hours]

1. [ ] Create/modify data structures
   - File: `src/entities/[ClassName].js`
   - What: [Description]
   - Why: [Rationale]

2. [ ] Add state management
   - File: `src/core/GameState.js`
   - What: [Description]
   - Why: [Rationale]

### Phase 2: Core Logic
**Estimated Time**: [X hours]

1. [ ] Implement core functionality
   - File: `src/systems/[SystemName].js`
   - What: [Description]
   - Why: [Rationale]

2. [ ] Integrate with existing systems
   - Files: [List]
   - What: [Description]
   - Why: [Rationale]

### Phase 3: UI Integration
**Estimated Time**: [X hours]

1. [ ] Add UI elements
   - File: `index.html`
   - What: [Description]
   - Why: [Rationale]

2. [ ] Wire up event handlers
   - File: `src/main.js`
   - What: [Description]
   - Why: [Rationale]

3. [ ] Update rendering
   - File: `src/rendering/[Renderer].js`
   - What: [Description]
   - Why: [Rationale]

### Phase 4: Testing & Polish
**Estimated Time**: [X hours]

1. [ ] Write automated tests
2. [ ] Manual testing
3. [ ] Edge case validation
4. [ ] Documentation updates

---

## Detailed File Changes

### 1. `src/entities/[FileName].js`

**Type**: [New/Modify]

**Changes**:
```javascript
// Add this new method:
methodName() {
  // Implementation
}

// Modify this existing method:
existingMethod() {
  // Add this logic
}
```

**Rationale**: [Why these changes]

### 2. `src/systems/[FileName].js`

**Type**: [New/Modify]

**Changes**:
[Details]

**Rationale**: [Why]

### 3. [Additional files...]

---

## Testing Strategy

### Automated Tests (If Playwright Available)

```javascript
test('feature works correctly', async ({ page }) => {
  // Test setup
  // Action
  // Assertion
});

test('edge case handling', async ({ page }) => {
  // Edge case test
});
```

### Manual Test Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC1: [Name] | 1. [Step]<br>2. [Step] | [Expected] |
| TC2: [Name] | 1. [Step]<br>2. [Step] | [Expected] |

### Edge Cases to Cover

1. **[Edge Case 1]**: [How to test]
2. **[Edge Case 2]**: [How to test]

---

## Data Flow

```
User Action
    ↓
Event Handler (main.js)
    ↓
System Logic (systems/[System].js)
    ↓
State Update (GameState.js)
    ↓
Rendering (CanvasRenderer.js)
    ↓
Visual Feedback
```

**Key Interactions**:
- [System A] → [System B]: [What data flows]
- [System B] → [System C]: [What data flows]

---

## Error Handling

### Error Scenarios

| Scenario | Detection | Handling | User Feedback |
|----------|-----------|----------|---------------|
| [Error 1] | [How to detect] | [How to handle] | [What user sees] |
| [Error 2] | [How to detect] | [How to handle] | [What user sees] |

### Validation

**Input Validation**:
- [ ] [What to validate]
- [ ] [What to validate]

**State Validation**:
- [ ] [What to check]
- [ ] [What to check]

---

## Performance Considerations

### Potential Bottlenecks
1. [Bottleneck 1]: [How to optimize]
2. [Bottleneck 2]: [How to optimize]

### Optimization Strategy
- [Strategy 1]
- [Strategy 2]

### Memory Management
- [How to prevent leaks]
- [Cleanup needed]

---

## Rollback Plan

### If Implementation Fails

**Step 1**: Revert commits
```bash
git revert [commit-hash]
```

**Step 2**: Restore previous state
- [What to restore]
- [How to verify]

**Step 3**: Communicate
- Update documentation
- Notify users (if deployed)

### What to Watch For
- [ ] [Metric 1] - Should be [value]
- [ ] [Metric 2] - Should be [value]
- [ ] [Metric 3] - Should be [value]

---

## Documentation Updates

### Files to Update
- [ ] PROGRESS.md - Add to "Recent Features"
- [ ] [GAME_DESIGN.md](GAME_DESIGN.md) - If game mechanics changed
- [ ] [ARCHITECTURE.md](ARCHITECTURE.md) - If patterns changed
- [ ] [DEVELOPMENT.md](DEVELOPMENT.md) - Mark task complete
- [ ] [SESSION_SUMMARY_LATEST.md](SESSION_SUMMARY_LATEST.md) - Add to accomplishments

### JSDoc Comments
- [ ] All new public methods documented
- [ ] All new classes documented
- [ ] Complex logic has inline comments

---

## Estimated Effort

### Time Breakdown
- Analysis: [Already done]
- Research: [Already done]
- Implementation: [X hours]
  - Phase 1: [X hours]
  - Phase 2: [X hours]
  - Phase 3: [X hours]
  - Phase 4: [X hours]
- Testing: [X hours]
- Documentation: [X hours]

**Total**: [X hours]

### Complexity Rating
[Trivial/Low/Medium/High/Very High]

### Risk Level
[Low/Medium/High]

### Dependencies
- [ ] [Dependency 1 - must be done first]
- [ ] [Dependency 2 - must be done first]

---

## Parallel Agent Strategy

### Can Be Parallelized?
[Yes/No]

### If Yes, Agent Breakdown:

**Agent 1**: [Task]
- Files: [List]
- Dependencies: None
- Est. time: [X min]

**Agent 2**: [Task]
- Files: [List]
- Dependencies: None
- Est. time: [X min]

**Agent 3**: [Task]
- Files: [List]
- Dependencies: Agent 1, Agent 2
- Est. time: [X min]

### Sequential Steps
1. [Step that must be done first]
2. [Step that depends on step 1]

---

## Pre-Implementation Checklist

- [ ] Analysis document reviewed and approved
- [ ] Research completed
- [ ] This plan reviewed by user (if needed)
- [ ] Architecture patterns confirmed
- [ ] Test strategy defined
- [ ] Rollback plan understood
- [ ] Documentation plan clear

**Ready to Implement**: [Yes/No]

---

## Post-Implementation Checklist

- [ ] All file changes committed
- [ ] Tests pass
- [ ] Documentation updated
- [ ] PROGRESS.md updated
- [ ] Session summary updated
- [ ] No TODOs left in code
- [ ] Performance validated
- [ ] Accessibility checked

---

**Plan Status**: [Draft/Approved/In Progress/Complete]
**Approval Needed**: [Yes/No]
**Blockers**: [None/List blockers]
EOF

echo "✅ Created $FILENAME"
echo "Next steps:"
echo "1. Fill in the implementation plan"
echo "2. Get user approval if needed"
echo "3. Begin implementation following the plan"
