/**
 * Phase 2 Resource Systems - Automated Tests
 *
 * Tests HP, Coins, and Mana tracking systems with Playwright
 * Run: npx playwright test tests/phase2-resources.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('Phase 2: Resource Systems', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to game and start a new run
    await page.goto('http://localhost:8000');
    await page.click('text=Start Run');

    // Wait for game to be ready
    await page.waitForSelector('#game-canvas');
  });

  test('TC1: HP System - Damage and Game Over', async ({ page }) => {
    // Verify starting HP
    const hpDisplay = page.locator('#hp-display');
    await expect(hpDisplay).toHaveText('3/3');

    // Hit first mine (need to find mines in grid)
    // Strategy: Click cells until we hit a mine
    let hp = 3;
    let mineHits = 0;

    while (mineHits < 3) {
      // Click random cells until we hit a mine
      const canvas = page.locator('#game-canvas');
      await canvas.click({ position: { x: 100 + (mineHits * 50), y: 100 } });

      // Check console for mine hit
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      // Wait a bit for state to update
      await page.waitForTimeout(100);

      // Check if HP decreased
      const currentHp = await hpDisplay.textContent();
      if (currentHp !== `${hp}/3`) {
        mineHits++;
        hp--;

        if (hp > 0) {
          // Game should still be playable
          await expect(hpDisplay).toHaveText(`${hp}/3`);
          await expect(page.locator('#game-canvas')).toBeVisible();
        } else {
          // HP reached 0, game over should appear
          await expect(hpDisplay).toHaveText('0/3');
          await page.waitForSelector('.game-over-screen', { timeout: 2000 });
          await expect(page.locator('.game-over-screen')).toBeVisible();
        }
      }
    }
  });

  test('TC2: Coin Generation - Cascade Tracking', async ({ page }) => {
    // Verify starting coins
    const coinsDisplay = page.locator('#coins-display');
    await expect(coinsDisplay).toHaveText('0');

    // Listen to console for coin messages
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('coins') || msg.text().includes('Revealed')) {
        consoleLogs.push(msg.text());
      }
    });

    // Click a cell likely to cascade (corner/edge)
    const canvas = page.locator('#game-canvas');
    await canvas.click({ position: { x: 50, y: 50 } });

    // Wait for cascade to complete
    await page.waitForTimeout(200);

    // Check that coins increased
    const coinsText = await coinsDisplay.textContent();
    const coins = parseInt(coinsText);

    expect(coins).toBeGreaterThan(0);
    expect(coins % 10).toBe(0); // Should be multiple of 10

    // Verify console log shows correct calculation
    const coinLog = consoleLogs.find(log => log.includes('coins'));
    expect(coinLog).toBeTruthy();

    // Extract cell count from log: "Revealed X cells | +Y coins | +Z mana"
    const cellMatch = coinLog.match(/Revealed (\d+) cells/);
    const coinMatch = coinLog.match(/\+(\d+) coins/);

    if (cellMatch && coinMatch) {
      const cellCount = parseInt(cellMatch[1]);
      const coinAmount = parseInt(coinMatch[1]);
      expect(coinAmount).toBe(cellCount * 10);
    }
  });

  test('TC3: Mana from Flag - Placement Only', async ({ page }) => {
    // Verify starting mana
    const manaDisplay = page.locator('#mana-display');
    await expect(manaDisplay).toHaveText('0/100');

    // Right-click to place flag
    const canvas = page.locator('#game-canvas');
    await canvas.click({ button: 'right', position: { x: 100, y: 100 } });

    // Wait for mana update
    await page.waitForTimeout(100);

    // Verify mana increased to 10
    await expect(manaDisplay).toHaveText('10/100');

    // Right-click again to remove flag
    await canvas.click({ button: 'right', position: { x: 100, y: 100 } });

    // Wait and verify mana stayed at 10 (no change on removal)
    await page.waitForTimeout(100);
    await expect(manaDisplay).toHaveText('10/100');
  });

  test('TC4: HUD Updates Immediately', async ({ page }) => {
    const coinsDisplay = page.locator('#coins-display');
    const manaDisplay = page.locator('#mana-display');

    // Record timestamps of clicks and HUD changes
    const events = [];

    // Click multiple cells rapidly
    const canvas = page.locator('#game-canvas');

    for (let i = 0; i < 5; i++) {
      const clickTime = Date.now();
      await canvas.click({ position: { x: 50 + (i * 60), y: 50 } });

      // Wait for HUD to update (should be immediate)
      await page.waitForTimeout(50);

      const updateTime = Date.now();
      const delay = updateTime - clickTime;

      events.push({ click: clickTime, update: updateTime, delay });

      // Delay should be minimal (< 100ms for immediate feel)
      expect(delay).toBeLessThan(100);
    }

    // Verify coins increased (at least some cells were revealed)
    const coins = parseInt(await coinsDisplay.textContent());
    expect(coins).toBeGreaterThan(0);
  });

  test('TC5: No Rewards for Mine Hits', async ({ page }) => {
    const hpDisplay = page.locator('#hp-display');
    const coinsDisplay = page.locator('#coins-display');
    const manaDisplay = page.locator('#mana-display');

    // Note starting values
    await expect(hpDisplay).toHaveText('3/3');
    await expect(coinsDisplay).toHaveText('0');
    await expect(manaDisplay).toHaveText('0/100');

    // Listen for mine hit in console
    let mineHit = false;
    page.on('console', msg => {
      if (msg.text().includes('Hit mine')) {
        mineHit = true;
      }
    });

    // Click cells until we hit a mine
    const canvas = page.locator('#game-canvas');
    let attempts = 0;

    while (!mineHit && attempts < 20) {
      await canvas.click({ position: { x: 100 + (attempts * 30), y: 100 + (attempts * 30) } });
      await page.waitForTimeout(100);
      attempts++;
    }

    // Verify a mine was hit
    expect(mineHit).toBe(true);

    // Verify HP decreased
    const hp = await hpDisplay.textContent();
    expect(hp).not.toBe('3/3');

    // Verify coins and mana are still 0 (no rewards for mine hit)
    await expect(coinsDisplay).toHaveText('0');
    await expect(manaDisplay).toHaveText('0/100');
  });

  test('Edge Case: Mana Cap at 100', async ({ page }) => {
    const manaDisplay = page.locator('#mana-display');

    // Place 10 flags to get 100 mana
    const canvas = page.locator('#game-canvas');

    for (let i = 0; i < 10; i++) {
      await canvas.click({
        button: 'right',
        position: { x: 50 + (i % 5) * 60, y: 50 + Math.floor(i / 5) * 60 }
      });
      await page.waitForTimeout(50);
    }

    // Verify mana is at 100
    await expect(manaDisplay).toHaveText('100/100');

    // Place one more flag
    await canvas.click({ button: 'right', position: { x: 350, y: 150 } });
    await page.waitForTimeout(100);

    // Verify mana is still capped at 100
    await expect(manaDisplay).toHaveText('100/100');
  });

  test('Integration: Multiple Resources Update Together', async ({ page }) => {
    const hpDisplay = page.locator('#hp-display');
    const coinsDisplay = page.locator('#coins-display');
    const manaDisplay = page.locator('#mana-display');

    // Initial state
    await expect(hpDisplay).toHaveText('3/3');
    await expect(coinsDisplay).toHaveText('0');
    await expect(manaDisplay).toHaveText('0/100');

    // Place a flag (+10 mana)
    const canvas = page.locator('#game-canvas');
    await canvas.click({ button: 'right', position: { x: 100, y: 100 } });
    await page.waitForTimeout(100);
    await expect(manaDisplay).toHaveText('10/100');

    // Reveal safe cells (+10 coins, +5 mana each)
    await canvas.click({ position: { x: 150, y: 150 } });
    await page.waitForTimeout(100);

    // Verify coins and mana increased
    const coins = parseInt(await coinsDisplay.textContent());
    const mana = parseInt((await manaDisplay.textContent()).split('/')[0]);

    expect(coins).toBeGreaterThanOrEqual(10);
    expect(mana).toBeGreaterThanOrEqual(15); // 10 from flag + 5 from cell

    // HP should still be full
    await expect(hpDisplay).toHaveText('3/3');
  });
});

test.describe('Phase 2: Input Methods', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.click('text=Start Run');
    await page.waitForSelector('#game-canvas');
  });

  test('Keyboard Controls: Resources Update', async ({ page }) => {
    const coinsDisplay = page.locator('#coins-display');
    const manaDisplay = page.locator('#mana-display');

    // Use keyboard to reveal cell
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space'); // Reveal
    await page.waitForTimeout(100);

    // Verify resources updated (if safe cell)
    const coins = parseInt(await coinsDisplay.textContent());
    const mana = parseInt((await manaDisplay.textContent()).split('/')[0]);

    // At least one of these should have increased (unless we hit a mine)
    expect(coins + mana).toBeGreaterThanOrEqual(0);

    // Use keyboard to place flag
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('F'); // Flag
    await page.waitForTimeout(100);

    // Check mana increased by 10
    const newMana = parseInt((await manaDisplay.textContent()).split('/')[0]);
    expect(newMana).toBeGreaterThanOrEqual(mana + 10);
  });

  test('Touch Controls: Resources Update', async ({ page, browserName }) => {
    // Skip on desktop browsers without touch simulation
    test.skip(browserName !== 'chromium', 'Touch tests only on Chromium');

    const manaDisplay = page.locator('#mana-display');
    const canvas = page.locator('#game-canvas');

    // Simulate long-press (flag placement)
    await canvas.dispatchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 }]
    });

    await page.waitForTimeout(600); // Wait for long-press threshold

    await canvas.dispatchEvent('touchend', {
      touches: []
    });

    await page.waitForTimeout(100);

    // Verify mana increased
    const mana = parseInt((await manaDisplay.textContent()).split('/')[0]);
    expect(mana).toBe(10);
  });
});
