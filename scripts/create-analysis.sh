#!/bin/bash
# Create analysis document template for a feature/change

FEATURE_NAME=$1

if [ -z "$FEATURE_NAME" ]; then
    echo "Usage: ./create-analysis.sh <feature-name>"
    echo "Example: ./create-analysis.sh undo-last-move"
    exit 1
fi

FILENAME="ANALYSIS_${FEATURE_NAME}.md"

cat > "$FILENAME" << 'EOF'
# Analysis: [Feature Name]

**Date**: $(date +%Y-%m-%d)
**Analyst**: Claude Code
**Status**: Draft

---

## 1. Understanding the Request

### What is being asked?
- [Detailed description of the request]
- [What the user wants to achieve]

### Why is it needed?
- [Problem being solved]
- [Value it provides]
- [User pain point it addresses]

### What problem does it solve?
- [Root problem]
- [How this solution addresses it]

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## 2. Scope Analysis

### Files Affected
| File | Changes | Reason |
|------|---------|--------|
| `path/to/file1.js` | [description] | [rationale] |
| `path/to/file2.js` | [description] | [rationale] |

### Systems Interaction
- **System 1**: [How it's affected]
- **System 2**: [How it's affected]

### Dependencies
- **Code Dependencies**: [List of modules/classes that depend on this]
- **External Dependencies**: [Any new libraries/APIs needed]

### What Could Break?
- [Potential breaking change 1]
- [Potential breaking change 2]

---

## 3. Assumptions & Unknowns

### Assumptions
1. [Assumption 1]
2. [Assumption 2]

### Unknowns (Need Clarification)
1. [Unknown 1 - question for user]
2. [Unknown 2 - question for user]

### Edge Cases
1. [Edge case 1 - how to handle?]
2. [Edge case 2 - how to handle?]

---

## 4. Risk Assessment

### Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How to mitigate] |
| [Risk 2] | High/Med/Low | High/Med/Low | [How to mitigate] |

### Blast Radius
- **If it fails**: [What breaks]
- **Affected users**: [Who is impacted]
- **Recovery time**: [How long to fix]

### Mitigation Strategies
1. [Strategy 1]
2. [Strategy 2]

---

## 5. Complexity Assessment

**Estimated Complexity**: [Trivial/Low/Medium/High/Very High]

**Factors**:
- **Code Complexity**: [1-5]
- **Integration Complexity**: [1-5]
- **Testing Complexity**: [1-5]
- **Risk Level**: [1-5]

**Total Score**: [Sum/20]

**Recommendation**:
- [ ] Proceed with standard workflow
- [ ] Requires detailed planning
- [ ] Needs research phase
- [ ] Requires user clarification first

---

## 6. Alternatives Considered

### Option 1: [Approach Name]
- **Pros**: [List]
- **Cons**: [List]
- **Verdict**: [Accept/Reject - why]

### Option 2: [Approach Name]
- **Pros**: [List]
- **Cons**: [List]
- **Verdict**: [Accept/Reject - why]

**Recommended Approach**: [Which option and why]

---

## 7. Next Steps

1. [ ] Research best practices → Create `RESEARCH_[topic].md`
2. [ ] Create implementation plan → Create `PLAN_[feature].md`
3. [ ] Get user approval on approach
4. [ ] Begin implementation

---

## 8. Research Topics Needed

- [ ] [Topic 1 - e.g., "undo/redo patterns in JavaScript"]
- [ ] [Topic 2 - e.g., "state history management best practices"]
- [ ] [Topic 3 - e.g., "command pattern implementation"]

---

**Analysis Complete**: [Yes/No]
**Ready for Planning**: [Yes/No - if no, what's needed?]
**User Approval Needed**: [Yes/No - for what?]
EOF

echo "✅ Created $FILENAME"
echo "Next steps:"
echo "1. Fill in the analysis document"
echo "2. Run: ./create-research.sh <topic> (for each research topic)"
echo "3. Run: ./create-plan.sh $FEATURE_NAME (after analysis + research complete)"
