# Testing Guide - LiMineZZsweeperIE

**Quick Start**: Automated tests eliminate manual testing!

---

## 🚀 Quick Start (First Time Setup)

```bash
# 1. Install Playwright (one-time setup)
npm install

# 2. Install browsers (one-time setup)
npx playwright install

# 3. Run all tests
npm test

# 4. Run Phase 2 tests only
npm run test:phase2
```

**Total setup time**: ~5 minutes (one-time)

---

## ✅ What's Automated

All 5 critical Phase 2 tests are now automated:

1. **HP System** - Verifies damage tracking and game over at 0 HP
2. **Coin Generation** - Tests cascade tracking and +10 coins per cell
3. **Mana from Flags** - Verifies +10 mana on placement, none on removal
4. **HUD Reactivity** - Confirms instant updates (< 100ms)
5. **No Mine Rewards** - Ensures coins/mana don't increase on mine hits

**Plus edge cases**:
- Mana cap at 100
- Multiple resources updating together
- Keyboard controls
- Touch controls (Chromium only)

---

## 📝 Running Tests

### Run All Tests (Recommended)
```bash
npm test
```
Runs on: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari

### Run Specific Tests
```bash
# Phase 2 tests only
npm run test:phase2

# Chrome only (fastest)
npm run test:chrome

# With UI (visual test runner)
npm run test:ui

# With browser visible (see what's happening)
npm run test:headed

# Debug mode (step through tests)
npm run test:debug
```

### View Test Results
```bash
# Open HTML report
npm run report
```

---

## 🎯 Test Output

### Passing Test
```
✓ TC1: HP System - Damage and Game Over (2.3s)
✓ TC2: Coin Generation - Cascade Tracking (1.8s)
✓ TC3: Mana from Flag - Placement Only (1.2s)
✓ TC4: HUD Updates Immediately (1.5s)
✓ TC5: No Rewards for Mine Hits (1.9s)

  5 passed (8.7s)
```

### Failing Test
```
✗ TC1: HP System - Damage and Game Over (timeout)
  Error: Expected "2/3" but got "3/3"
  Screenshot: test-results/phase2-resources-TC1/test-failed-1.png
```

Screenshots and videos automatically saved on failure!

---

## 📋 Phase 2 Test Coverage

| Test | What It Validates | Status |
|------|------------------|--------|
| TC1: HP System | HP decreases on mine hit, game over at 0 | ✅ Automated |
| TC2: Coin Cascade | Coins = cells × 10 (including cascades) | ✅ Automated |
| TC3: Flag Mana | +10 mana on place, 0 on remove | ✅ Automated |
| TC4: HUD Reactivity | Updates < 100ms after action | ✅ Automated |
| TC5: No Mine Rewards | Coins/mana unchanged on mine hit | ✅ Automated |
| TC6: Mana Cap | Mana stops at 100 | ✅ Automated |
| TC7: Integration | Multiple resources update correctly | ✅ Automated |
| TC8: Keyboard | Keyboard controls work | ✅ Automated |
| TC9: Touch | Touch controls work (mobile) | ✅ Automated |

**Coverage**: 100% of critical paths automated!

---

## 🐛 Debugging Failed Tests

### 1. Check Screenshot
Failed tests automatically save screenshots:
```
test-results/phase2-resources-TC1/test-failed-1.png
```

### 2. Watch Video
Failed tests record video:
```
test-results/phase2-resources-TC1/video.webm
```

### 3. Run in Debug Mode
```bash
npm run test:debug
```
Opens Playwright Inspector - step through test line by line

### 4. Run with Browser Visible
```bash
npm run test:headed
```
See the browser as tests run

---

## 📊 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🔧 Configuration

### Browser Selection
Edit `playwright.config.js` to customize browsers:

```javascript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  // Add or remove browsers as needed
]
```

### Timeouts
```javascript
timeout: 30 * 1000,  // Test timeout (30s)
expect: { timeout: 5000 }  // Assertion timeout (5s)
```

### Parallel Execution
```javascript
fullyParallel: true,  // Run tests in parallel
workers: 4,  // Number of parallel workers
```

---

## 📁 File Structure

```
MinesweeperNew/
├── tests/
│   └── phase2-resources.spec.js  ← Phase 2 automated tests
├── playwright.config.js           ← Playwright configuration
├── package.json                   ← Test scripts
└── test-results/                  ← Screenshots, videos (auto-generated)
```

---

## ✨ Benefits of Automated Tests

### Before (Manual Testing)
- ❌ 5-10 minutes per test run
- ❌ Prone to human error
- ❌ Boring and repetitive
- ❌ Can't test on multiple browsers easily
- ❌ No CI/CD integration

### After (Automated with Playwright)
- ✅ 8-10 seconds per test run
- ✅ 100% consistent results
- ✅ Zero manual effort
- ✅ Tests on 5 browsers automatically
- ✅ Runs on every commit (CI/CD ready)

---

## 🎓 Writing New Tests

### Basic Test Structure
```javascript
test('My New Test', async ({ page }) => {
  // 1. Navigate and setup
  await page.goto('http://localhost:8000');
  await page.click('text=Start Run');

  // 2. Perform actions
  await page.click('#game-canvas', { position: { x: 100, y: 100 } });

  // 3. Assert expectations
  await expect(page.locator('#coins-display')).toHaveText('10');
});
```

### Common Patterns
```javascript
// Wait for element
await page.waitForSelector('#game-canvas');

// Click at specific position
await canvas.click({ position: { x: 100, y: 100 } });

// Right-click (flag)
await canvas.click({ button: 'right', position: { x: 100, y: 100 } });

// Check text content
await expect(element).toHaveText('expected');

// Check visibility
await expect(element).toBeVisible();

// Listen to console
page.on('console', msg => console.log(msg.text()));
```

---

## 📝 Adding Tests for New Features

When implementing a new feature:

1. **Create test file**: `tests/phase3-feature.spec.js`
2. **Write tests first** (TDD approach)
3. **Implement feature**
4. **Run tests**: `npm run test:phase3`
5. **Debug if needed**: `npm run test:debug`

---

## 🚨 Troubleshooting

### "Cannot find module '@playwright/test'"
```bash
npm install
```

### "Executable doesn't exist"
```bash
npx playwright install
```

### "Server not responding"
Make sure http.server isn't already running:
```bash
# Kill existing server on port 8000 (if needed)
# Then Playwright will start its own
```

### Tests timing out
Increase timeout in `playwright.config.js`:
```javascript
timeout: 60 * 1000,  // 60 seconds
```

---

## 📚 Resources

- [Playwright Docs](https://playwright.dev)
- [Test Generator](https://playwright.dev/docs/codegen) - Record tests by interacting with UI
- [Trace Viewer](https://playwright.dev/docs/trace-viewer) - Debug test execution

---

## ✅ Summary

**Manual Testing**: 5-10 minutes, error-prone, boring
**Automated Testing**: 10 seconds, consistent, reliable

**Phase 2 Status**: ✅ 100% automated, zero manual testing required!

**Next Steps**:
1. Run `npm install` (one-time)
2. Run `npx playwright install` (one-time)
3. Run `npm test` (every change)
4. Commit with confidence! 🚀

---

**Last Updated**: 2025-12-30
**Test Framework**: Playwright
**Coverage**: Phase 2 - 100% automated
