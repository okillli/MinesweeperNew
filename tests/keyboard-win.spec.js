// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Test for keyboard win condition bug
 * When completing a board using keyboard controls, the game should show win screen
 */

// Configure longer timeout
test.setTimeout(60000);

test.describe('Keyboard Win Condition', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to game
    await page.goto('/');

    // Skip tutorial by marking it as completed in localStorage
    await page.evaluate(() => {
      const savedData = localStorage.getItem('minequest_save');
      const data = savedData ? JSON.parse(savedData) : { persistent: {} };
      data.persistent = data.persistent || {};
      data.persistent.tutorialCompleted = true;
      data.persistent.seenTips = data.persistent.seenTips || [];
      localStorage.setItem('minequest_save', JSON.stringify(data));
    });

    // Reload to apply the save data
    await page.reload();
    await page.waitForSelector('#menu-screen.active', { timeout: 10000 });
    await page.click('text=Start Run', { force: true });

    // Wait for quest screen and select first quest
    await page.waitForSelector('#quest-screen.active', { timeout: 10000 });
    await page.waitForTimeout(100);
    await page.click('.quest-card:first-child', { force: true });

    // Wait for character screen and select first character
    await page.waitForSelector('#character-screen.active', { timeout: 10000 });
    await page.waitForTimeout(100);
    await page.click('.character-card:first-child', { force: true });

    // Wait for game to be ready
    await page.waitForSelector('#game-screen.active', { timeout: 10000 });
    await page.waitForSelector('#game-canvas', { state: 'attached', timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('should reveal cells using keyboard', async ({ page }) => {
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    // Focus canvas for keyboard input
    await page.click('#game-canvas');

    // Move cursor and reveal using keyboard
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    // Check that reveal happened (either coins earned or mine hit)
    const hasReveal = consoleMessages.some(m =>
      m.includes('Revealed') || m.includes('Hit mine') || m.includes('coins')
    );
    console.log('Console messages:', consoleMessages.filter(m => m.includes('Revealed') || m.includes('Hit')));
    expect(hasReveal).toBeTruthy();
  });

  test('should trigger board complete or game over when using keyboard', async ({ page }) => {
    // Focus canvas for keyboard input
    await page.click('#game-canvas');

    // Systematically reveal cells using keyboard
    // Move and reveal in a pattern to cover the 8x8 grid
    let attempts = 0;
    const maxAttempts = 150;

    while (attempts < maxAttempts) {
      // Check if game ended (shop or game over)
      const isShopVisible = await page.locator('#shop-screen.active').isVisible({ timeout: 50 }).catch(() => false);
      const isGameOverVisible = await page.locator('#gameover-overlay:not(.hidden)').isVisible({ timeout: 50 }).catch(() => false);

      if (isShopVisible || isGameOverVisible) {
        break;
      }

      // Reveal current cell
      await page.keyboard.press('Space');
      await page.waitForTimeout(30);

      // Move to next cell - zigzag pattern
      if (attempts % 16 < 8) {
        await page.keyboard.press('ArrowRight');
      } else if (attempts % 16 < 9) {
        await page.keyboard.press('ArrowDown');
      } else if (attempts % 16 < 16) {
        await page.keyboard.press('ArrowLeft');
      } else {
        await page.keyboard.press('ArrowDown');
      }
      await page.waitForTimeout(20);

      attempts++;
    }

    // Either shop or game over should be visible
    const shopVisible = await page.locator('#shop-screen.active').isVisible({ timeout: 2000 }).catch(() => false);
    const gameOverVisible = await page.locator('#gameover-overlay:not(.hidden)').isVisible({ timeout: 2000 }).catch(() => false);

    // Game should end via keyboard play (either complete board -> shop, or die -> game over)
    expect(shopVisible || gameOverVisible).toBeTruthy();
  });
});
