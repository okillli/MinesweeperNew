/**
 * Debug Overlay Tests
 * Tests for the debug overlay feature (Press D during gameplay)
 */

const { test, expect } = require('@playwright/test');

test.describe('Debug Overlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#menu-screen.active');

    // Clear save data for consistent tests
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('#menu-screen.active');
  });

  test('Debug overlay toggles with D key during gameplay', async ({ page }) => {
    // Start a game
    await page.click('#start-button');
    await page.waitForSelector('#quest-screen.active');
    await page.click('.quest-card:not(.locked)');
    await page.waitForSelector('#character-screen.active');
    await page.click('.character-card:not(.locked)');
    await page.waitForSelector('#game-screen.active');

    // Debug overlay should be hidden initially
    const debugOverlay = page.locator('#debug-overlay');
    await expect(debugOverlay).toHaveClass(/hidden/);

    // Press D to show debug overlay
    await page.keyboard.press('d');
    await expect(debugOverlay).not.toHaveClass(/hidden/);
    await expect(debugOverlay).toBeVisible();

    // Press D again to hide
    await page.keyboard.press('d');
    await expect(debugOverlay).toHaveClass(/hidden/);
  });

  test('Debug overlay shows correct grid information', async ({ page }) => {
    // Set custom dimensions
    await page.click('#settings-button');
    await page.waitForSelector('#settings-screen.active');

    await page.selectOption('#difficulty', 'custom');
    await page.check('#use-custom-dimensions');
    await page.fill('#custom-width', '15');
    await page.fill('#custom-height', '12');
    await page.fill('#custom-mines', '30');

    await page.click('#settings-back-button');

    // Start game
    await page.click('#start-button');
    await page.waitForSelector('#quest-screen.active');
    await page.click('.quest-card:not(.locked)');
    await page.waitForSelector('#character-screen.active');
    await page.click('.character-card:not(.locked)');
    await page.waitForSelector('#game-screen.active');

    // Open debug overlay
    await page.keyboard.press('d');
    await page.waitForSelector('#debug-overlay:not(.hidden)');

    // Verify displayed values
    const gridSize = await page.locator('#debug-grid-size').textContent();
    const totalCells = await page.locator('#debug-total-cells').textContent();
    const configMines = await page.locator('#debug-config-mines').textContent();
    const actualMines = await page.locator('#debug-actual-mines').textContent();
    const numbersValid = await page.locator('#debug-numbers-valid').textContent();
    const cellArray = await page.locator('#debug-cell-array').textContent();

    console.log('Debug overlay values:', {
      gridSize,
      totalCells,
      configMines,
      actualMines,
      numbersValid,
      cellArray
    });

    // Verify grid dimensions
    expect(gridSize).toBe('15x12');
    expect(totalCells).toBe('180');
    expect(configMines).toBe('30');
    expect(actualMines).toBe('30');
    expect(numbersValid).toBe('OK');
    // Cell array should be height x width (row-major: 12 rows x 15 cols)
    expect(cellArray).toBe('12x15');
  });

  test('Debug overlay shows mine count matches', async ({ page }) => {
    // Start game with default settings
    await page.click('#start-button');
    await page.waitForSelector('#quest-screen.active');
    await page.click('.quest-card:not(.locked)');
    await page.waitForSelector('#character-screen.active');
    await page.click('.character-card:not(.locked)');
    await page.waitForSelector('#game-screen.active');

    // Open debug overlay
    await page.keyboard.press('d');
    await page.waitForSelector('#debug-overlay:not(.hidden)');

    // Get mine counts
    const configMines = await page.locator('#debug-config-mines').textContent();
    const actualMines = await page.locator('#debug-actual-mines').textContent();

    // They should match
    expect(configMines).toBe(actualMines);

    // Check that actual mines span doesn't have error class
    const actualMinesSpan = page.locator('#debug-actual-mines');
    await expect(actualMinesSpan).not.toHaveClass(/debug-error/);
  });
});
