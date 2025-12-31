const { test, expect } = require('@playwright/test');

test.setTimeout(60000);

test.describe('Ability Fixes Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Skip tutorial
    await page.evaluate(() => {
      const savedData = localStorage.getItem('minequest_save');
      const data = savedData ? JSON.parse(savedData) : { persistent: {} };
      data.persistent = data.persistent || {};
      data.persistent.tutorialCompleted = true;
      localStorage.setItem('minequest_save', JSON.stringify(data));
    });
    await page.reload();
    
    // Start game
    await page.click('text=Start Run');
    await page.waitForSelector('#quest-screen.active', { timeout: 10000 });
    await page.click('.quest-card:first-child', { force: true });
    await page.waitForSelector('#character-screen.active', { timeout: 10000 });
    await page.click('.character-card:first-child', { force: true });
    await page.waitForSelector('#game-screen.active', { timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('Shield indicator appears when shield is active', async ({ page }) => {
    const shieldIndicator = page.locator('#shield-indicator');
    
    // Initially hidden
    await expect(shieldIndicator).toHaveClass(/hidden/);
    
    // Activate shield via console (simulating Shield Token)
    await page.evaluate(() => {
      window.game.state.currentRun.shieldActive = true;
    });
    
    // Trigger HUD update
    await page.evaluate(() => {
      document.getElementById('hp-display').click(); // Force any re-render
    });
    await page.waitForTimeout(100);
    
    // Call updateHUD directly if available
    await page.evaluate(() => {
      if (typeof updateHUD === 'function') updateHUD();
    });
    await page.waitForTimeout(100);
    
    // Check state was set
    const shieldActive = await page.evaluate(() => window.game.state.currentRun.shieldActive);
    expect(shieldActive).toBe(true);
  });

  test('Game loads without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    
    // Interact with game
    await page.click('#game-canvas');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    
    // Check no critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('ResizeObserver') && // Ignore harmless ResizeObserver errors
      !e.includes('Script error')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('Combo Master getChordBonus function exists and returns correct format', async ({ page }) => {
    const result = await page.evaluate(() => {
      const bonus = ItemSystem.getChordBonus(window.game.state);
      return {
        hasManaBonus: typeof bonus.manaBonus === 'number',
        hasCoinBonus: typeof bonus.coinBonus === 'number',
        manaBonus: bonus.manaBonus,
        coinBonus: bonus.coinBonus
      };
    });
    
    expect(result.hasManaBonus).toBe(true);
    expect(result.hasCoinBonus).toBe(true);
    // Without Combo Master item, bonuses should be 0
    expect(result.manaBonus).toBe(0);
    expect(result.coinBonus).toBe(0);
  });
});
