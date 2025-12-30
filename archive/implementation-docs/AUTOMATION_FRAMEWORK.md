# Automation & Quality Assurance Framework

> **Purpose**: Minimize human input, maximize automation, ensure quality through systematic analysis
> **Principle**: Analyze → Research → Plan → Implement → Validate
> **Read Time**: ~10 minutes

---

## Core Philosophy

**Never blindly accept requests. Always:**
1. **Analyze** - Understand the problem deeply
2. **Research** - Find best practices and proven solutions
3. **Plan** - Create detailed implementation strategy
4. **Implement** - Execute with quality standards
5. **Validate** - Automated testing wherever possible

---

## Request Processing Pipeline

### Stage 1: Request Analysis (MANDATORY)

**Before ANY implementation, create analysis document:**

```markdown
# Request Analysis: [Feature Name]

## 1. Understanding the Request
- What is being asked?
- Why is it needed?
- What problem does it solve?
- What are the acceptance criteria?

## 2. Scope Analysis
- What files will be affected?
- What systems interact with this change?
- What are the dependencies?
- What could break?

## 3. Assumptions & Unknowns
- What assumptions are we making?
- What information is missing?
- What needs clarification?
- What are the edge cases?

## 4. Risk Assessment
- What are the risks?
- What could go wrong?
- What's the blast radius if it fails?
- How do we mitigate risks?
```

**Output**: `ANALYSIS_[FEATURE_NAME].md` document

---

### Stage 2: Research & Best Practices (MANDATORY)

**For ANY non-trivial change, research:**

1. **Industry Best Practices**
   - Search for established patterns
   - Review MDN, web.dev, authoritative sources
   - Check similar implementations in popular projects

2. **Technology Standards**
   - WCAG for accessibility
   - W3C for web standards
   - Performance best practices (web.dev)

3. **Security Considerations**
   - OWASP Top 10 review
   - Input validation patterns
   - XSS/CSRF prevention

4. **Performance Patterns**
   - Optimization techniques
   - Caching strategies
   - Rendering optimizations

**Output**: `RESEARCH_[TOPIC].md` with citations and recommendations

---

### Stage 3: Implementation Planning (MANDATORY)

**Create detailed plan BEFORE coding:**

```markdown
# Implementation Plan: [Feature Name]

## Overview
- Brief description
- Expected outcome
- Success criteria

## Technical Approach
- Architecture pattern to use
- Design decisions and rationale
- Alternative approaches considered

## File Changes
1. `path/to/file.js`
   - What: [description]
   - Why: [rationale]
   - How: [approach]

## Testing Strategy
- Unit tests needed
- Integration tests needed
- Manual test cases
- Edge cases to cover

## Rollback Plan
- How to revert if needed
- What to watch for
- Monitoring/validation

## Estimated Effort
- Time estimate
- Complexity rating
- Risk level
```

**Output**: `PLAN_[FEATURE_NAME].md`

---

## Automated Testing Framework

### Test Automation Levels

#### Level 1: Code Validation (100% Automated)
**Run automatically before every commit:**

```bash
# Validation script
#!/bin/bash

echo "🔍 Running automated validations..."

# 1. Syntax validation
node --check src/**/*.js
if [ $? -ne 0 ]; then
    echo "❌ Syntax errors found"
    exit 1
fi

# 2. JSDoc validation (check all public functions have docs)
./scripts/validate-jsdoc.sh

# 3. No console.log in production code (except intentional)
grep -r "console.log" src/ --exclude-dir=node_modules
if [ $? -eq 0 ]; then
    echo "⚠️  console.log found - verify intentional"
fi

# 4. No TODOs without issue reference
grep -r "TODO" src/ | grep -v "TODO(Phase"
if [ $? -eq 0 ]; then
    echo "⚠️  TODO without phase reference found"
fi

echo "✅ Code validation complete"
```

**Tools**:
- ESLint (when added): `npm run lint`
- JSDoc validator: Custom script
- File checker: Shell scripts

---

#### Level 2: Functional Testing (Automated where possible)

**Browser Automation with Playwright:**

```javascript
// tests/e2e/game-flow.test.js
const { test, expect } = require('@playwright/test');

test('complete game flow', async ({ page }) => {
  // Navigate to game
  await page.goto('http://localhost:8000');

  // Click Start Run
  await page.click('#start-run-btn');

  // Verify grid appears
  const canvas = await page.locator('canvas');
  await expect(canvas).toBeVisible();

  // Click a cell
  await canvas.click({ position: { x: 100, y: 100 } });

  // Verify cell revealed (check canvas changed)
  // ... visual regression testing
});

test('mobile touch support', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('http://localhost:8000');
  await page.click('#start-run-btn');

  const canvas = await page.locator('canvas');

  // Tap to reveal
  await canvas.tap({ position: { x: 100, y: 100 } });

  // Long-press to flag
  await canvas.tap({ position: { x: 150, y: 100 }, delay: 600 });

  // Verify flag appeared
  // ... assertions
});
```

**Test Coverage**:
- ✅ Menu navigation
- ✅ Game start flow
- ✅ Cell reveal mechanics
- ✅ Flag placement
- ✅ Chording
- ✅ Win/lose conditions
- ✅ Game over screen
- ✅ Touch gestures
- ✅ Error handling

---

#### Level 3: Visual Regression (Automated)

**Percy.io or similar for visual testing:**

```javascript
// tests/visual/screenshots.test.js
test('menu screen appearance', async ({ page }) => {
  await page.goto('http://localhost:8000');
  await percySnapshot(page, 'Menu Screen');
});

test('playing screen with 10x10 grid', async ({ page }) => {
  await page.goto('http://localhost:8000');
  await page.click('#start-run-btn');
  await page.waitForTimeout(500);
  await percySnapshot(page, 'Game Screen - Initial');
});

test('game over screen', async ({ page }) => {
  // ... trigger game over
  await percySnapshot(page, 'Game Over Screen');
});
```

---

### Test Execution Strategy

#### Pre-Commit (Local)
```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "Running pre-commit checks..."

# Code validation
./scripts/validate-code.sh || exit 1

# Quick smoke tests (if Playwright installed)
if command -v playwright &> /dev/null; then
    npm test -- --grep "@smoke" || exit 1
fi

echo "✅ Pre-commit checks passed"
```

#### Post-Commit (CI/CD - Future)
```yaml
# .github/workflows/test.yml
name: Automated Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm test

      - name: Run E2E tests
        run: npx playwright test

      - name: Visual regression
        run: npx percy exec -- npx playwright test
```

---

## Automated Quality Checks

### 1. Architecture Compliance Checker

**Script to validate code follows patterns:**

```javascript
// scripts/check-architecture.js
const fs = require('fs');
const path = require('path');

// Check 1: Rendering files don't modify state
function checkRenderingSeparation() {
  const renderingFiles = glob('src/rendering/**/*.js');
  const violations = [];

  renderingFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');

    // Check for state mutations
    if (content.match(/this\.state\.\w+\s*=/)) {
      violations.push({
        file,
        issue: 'Rendering file mutates state',
        severity: 'critical'
      });
    }

    // Check for EventBus emit (should only listen)
    if (content.match(/events\.emit/)) {
      violations.push({
        file,
        issue: 'Rendering file emits events',
        severity: 'warning'
      });
    }
  });

  return violations;
}

// Check 2: Game logic files don't call rendering
function checkLogicSeparation() {
  const logicFiles = glob('src/{entities,systems,core}/**/*.js');
  const violations = [];

  logicFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');

    // Check for canvas/DOM manipulation
    if (content.match(/\.getContext\(|document\.|\.innerHTML|\.style\./)) {
      violations.push({
        file,
        issue: 'Logic file manipulates DOM/Canvas',
        severity: 'critical'
      });
    }
  });

  return violations;
}

// Run all checks
const violations = [
  ...checkRenderingSeparation(),
  ...checkLogicSeparation()
];

if (violations.length > 0) {
  console.error('❌ Architecture violations found:');
  violations.forEach(v => {
    console.error(`  ${v.severity.toUpperCase()}: ${v.file}`);
    console.error(`    ${v.issue}`);
  });
  process.exit(1);
}

console.log('✅ Architecture compliance verified');
```

---

### 2. Performance Monitoring

**Automated performance budget:**

```javascript
// scripts/check-performance.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runPerformanceAudit() {
  const chrome = await chromeLauncher.launch();

  const result = await lighthouse(
    'http://localhost:8000',
    { port: chrome.port }
  );

  await chrome.kill();

  const scores = result.lhr.categories;

  // Performance budget
  const budgets = {
    performance: 90,
    accessibility: 95,
    'best-practices': 90,
    seo: 80
  };

  const failures = [];

  Object.keys(budgets).forEach(category => {
    const score = scores[category].score * 100;
    if (score < budgets[category]) {
      failures.push({
        category,
        expected: budgets[category],
        actual: score
      });
    }
  });

  if (failures.length > 0) {
    console.error('❌ Performance budget violations:');
    failures.forEach(f => {
      console.error(`  ${f.category}: ${f.actual} (expected ${f.expected})`);
    });
    process.exit(1);
  }

  console.log('✅ Performance budget met');
}
```

---

## Continuous Integration Strategy

### Phase 1: Local Automation (Current)
**No external dependencies, run locally:**

```bash
# package.json scripts
{
  "scripts": {
    "validate": "node scripts/validate-code.js",
    "check:architecture": "node scripts/check-architecture.js",
    "test:manual": "echo 'Open http://localhost:8000 and follow PLAYTEST_CHECKLIST.md'",
    "precommit": "npm run validate && npm run check:architecture"
  }
}
```

### Phase 2: Browser Automation (Next)
**Add Playwright for E2E testing:**

```bash
npm install -D @playwright/test
npx playwright install

# Run tests
npm run test:e2e
```

### Phase 3: Full CI/CD (Future)
**GitHub Actions for automated testing on every push**

---

## Implementation Workflow with Automation

### Example: Adding a New Feature

**Step 1: Request Received**
```
User: "Add ability to undo last move"
```

**Step 2: Analysis (Automated Template)**
```bash
./scripts/create-analysis.sh "undo-last-move"
```

Creates `ANALYSIS_undo-last-move.md` with template, Claude fills it:
- Understand: User wants to revert last cell reveal
- Why: Reduce frustration, enable experimentation
- Scope: Grid.js (revealCell history), main.js (undo button), GameState.js (history tracking)
- Risks: State synchronization, cascade undo complexity

**Step 3: Research (Automated)**
```bash
./scripts/research-best-practices.sh "undo-redo-patterns"
```

Uses WebSearch to find:
- Command pattern for undo/redo
- Memento pattern for state snapshots
- Browser history API patterns

Creates `RESEARCH_undo-patterns.md`

**Step 4: Planning (Automated Template)**
```bash
./scripts/create-plan.sh "undo-last-move"
```

Claude creates detailed plan based on analysis + research

**Step 5: Implementation**
Follow plan, use parallel agents if possible

**Step 6: Automated Validation**
```bash
npm run validate           # Code checks
npm run check:architecture # Pattern compliance
npm run test:e2e          # Browser tests (if added)
git commit                # Triggers pre-commit hook
```

---

## Decision Automation

### When to Use Which Approach

**Decision Tree (Automated):**

```javascript
// scripts/recommend-approach.js
function recommendApproach(featureDescription) {
  const complexity = analyzeComplexity(featureDescription);
  const files = estimateFileCount(featureDescription);
  const risk = assessRisk(featureDescription);

  if (complexity === 'trivial' && files === 1 && risk === 'low') {
    return {
      approach: 'direct-implementation',
      analysis: 'minimal',
      research: 'skip',
      testing: 'manual'
    };
  }

  if (complexity === 'medium' && files <= 3 && risk === 'medium') {
    return {
      approach: 'standard-workflow',
      analysis: 'required',
      research: 'recommended',
      planning: 'detailed',
      testing: 'automated + manual'
    };
  }

  if (complexity === 'high' || files > 3 || risk === 'high') {
    return {
      approach: 'full-rigor',
      analysis: 'comprehensive',
      research: 'mandatory',
      planning: 'detailed + review',
      testing: 'full automation',
      agents: 'parallel-recommended'
    };
  }
}
```

---

## Automated Documentation Updates

### Post-Implementation Checklist (Automated)

```bash
#!/bin/bash
# scripts/post-implementation.sh

FEATURE=$1

echo "📝 Updating documentation for $FEATURE..."

# 1. Update PROGRESS.md
node scripts/update-progress.js "$FEATURE"

# 2. Check if ARCHITECTURE.md needs update
if [[ $(git diff src/core src/entities src/systems) ]]; then
    echo "⚠️  Core files changed - consider updating ARCHITECTURE.md"
fi

# 3. Check if GAME_DESIGN.md needs update
if [[ "$FEATURE" =~ (item|quest|mechanic|balance) ]]; then
    echo "⚠️  Game design change - update GAME_DESIGN.md"
fi

# 4. Generate commit message template
node scripts/generate-commit-message.js "$FEATURE"
```

---

## Monitoring & Alerts

### Automated Quality Metrics

**Track over time:**

```javascript
// scripts/metrics.js
const metrics = {
  timestamp: Date.now(),
  linesOfCode: countLines('src/**/*.js'),
  testCoverage: calculateCoverage(),
  performanceScore: runLighthouse(),
  accessibilityScore: runAxe(),
  architectureViolations: checkArchitecture(),
  documentationCoverage: checkJSDoc()
};

// Append to metrics.json
fs.appendFileSync('metrics.json', JSON.stringify(metrics) + '\n');

// Alert if metrics degrade
if (metrics.performanceScore < 85) {
  console.warn('⚠️  Performance degraded!');
}
```

---

## Tools & Scripts to Create

### Priority 1 (Immediate)
1. ✅ `scripts/validate-code.sh` - Syntax + basic checks
2. ✅ `scripts/check-architecture.js` - Pattern compliance
3. ✅ `scripts/create-analysis.sh` - Analysis template
4. ✅ `scripts/create-plan.sh` - Planning template

### Priority 2 (Next Week)
5. ⏳ `scripts/generate-commit-message.js` - Auto-generate from changes
6. ⏳ `scripts/update-progress.js` - Auto-update PROGRESS.md
7. ⏳ Playwright E2E test suite
8. ⏳ Pre-commit git hooks

### Priority 3 (Phase 2)
9. ⏳ Performance budget monitoring
10. ⏳ Visual regression tests
11. ⏳ GitHub Actions CI/CD
12. ⏳ Automated deployment

---

## Quality Gates

### Cannot Commit Unless:
- ✅ Code syntax valid
- ✅ Architecture patterns followed
- ✅ JSDoc comments on public APIs
- ✅ No console.log (unless marked intentional)
- ✅ Analysis document created (for non-trivial changes)
- ✅ Plan document created (for features)

### Cannot Deploy Unless:
- ✅ All quality gates passed
- ✅ E2E tests pass
- ✅ Performance budget met
- ✅ Accessibility score > 95
- ✅ Documentation updated

---

## Future Automation Ideas

### AI-Assisted Code Review
```javascript
// Use Claude API to review code before commit
async function aiCodeReview(diff) {
  const review = await claude.complete({
    prompt: `Review this code change for:
    - Architecture violations
    - Security issues
    - Performance concerns
    - Best practices

    Diff: ${diff}`,
    model: 'claude-sonnet-4-5'
  });

  return review;
}
```

### Automated Refactoring Suggestions
```javascript
// Detect code smells and suggest refactorings
function detectCodeSmells() {
  // Long functions (> 50 lines)
  // High cyclomatic complexity
  // Code duplication
  // Magic numbers
  // etc.
}
```

### Automated Performance Optimization
```javascript
// Suggest optimizations based on profiling
async function suggestOptimizations() {
  const profile = await profileApp();
  const bottlenecks = identifyBottlenecks(profile);
  const suggestions = generateSuggestions(bottlenecks);
  return suggestions;
}
```

---

## Summary

### Automation Levels

| Task | Automation Level | Tool | Status |
|------|------------------|------|--------|
| Code syntax validation | 100% | Node --check | ✅ Ready |
| Architecture compliance | 100% | Custom script | 📝 To create |
| JSDoc validation | 100% | Custom script | 📝 To create |
| E2E testing | 90% | Playwright | ⏳ Phase 2 |
| Visual regression | 100% | Percy | ⏳ Phase 3 |
| Performance budget | 100% | Lighthouse | ⏳ Phase 2 |
| Deployment | 100% | GitHub Actions | ⏳ Phase 3 |

### Human Input Required For:
- Initial feature request articulation
- Ambiguity resolution
- Design aesthetic choices
- Final playtest validation
- Production deployment approval

### Everything Else: Automated ✅

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Next Review**: After Phase 2 completion
