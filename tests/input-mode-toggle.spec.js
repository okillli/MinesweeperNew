/**
 * Input Mode Toggle - Automated Tests
 *
 * Tests the mobile FAB button that switches tap action between reveal and flag mode
 * Run: npx playwright test tests/input-mode-toggle.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('Input Mode Toggle Feature', () => {

  /**
   * Helper to get click position on a grid cell
   */
  async function getCellPosition(canvas, cellX, cellY) {
    const box = await canvas.boundingBox();
    const cellSize = 44;
    const padding = 2;
    const gridCols = 8;
    const gridRows = 8;

    const gridWidth = (gridCols * cellSize) + ((gridCols - 1) * padding);
    const gridHeight = (gridRows * cellSize) + ((gridRows - 1) * padding);

    const offsetX = (box.width - gridWidth) / 2;
    const offsetY = (box.height - gridHeight) / 2;

    const x = offsetX + (cellX * (cellSize + padding)) + (cellSize / 2);
    const y = offsetY + (cellY * (cellSize + padding)) + (cellSize / 2);

    return { x, y };
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to game and start a new run
    await page.goto('/');
    await page.click('text=Start Run');

    // Wait for quest screen and select first quest
    await page.waitForSelector('#quest-screen.active', { timeout: 5000 });
    await page.locator('.quest-card:first-child').scrollIntoViewIfNeeded();
    await page.click('.quest-card:first-child', { force: true });

    // Wait for character screen and select first character (Explorer)
    await page.waitForSelector('#character-screen.active', { timeout: 5000 });
    await page.locator('.character-card:first-child').scrollIntoViewIfNeeded();
    await page.click('.character-card:first-child', { force: true });

    // Wait for game screen and canvas
    await page.waitForSelector('#game-screen.active', { timeout: 5000 });
    await page.waitForSelector('#game-canvas', { state: 'attached', timeout: 10000 });

    // Extra wait for game initialization
    await page.waitForTimeout(500);
  });

  test('Mode toggle button is visible during gameplay', async ({ page }) => {
    const toggleButton = page.locator('#input-mode-toggle');

    // Button should be visible during gameplay
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toHaveClass(/visible/);
  });

  test('Mode toggle button is hidden on menu screen', async ({ page }) => {
    const toggleButton = page.locator('#input-mode-toggle');

    // First verify it's visible during gameplay
    await expect(toggleButton).toBeVisible();

    // Go back to menu - use waitUntil to ensure full page load
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#menu-screen.active', { timeout: 5000 });

    // Button should not be visible on menu (no 'visible' class = display: none)
    await expect(toggleButton).not.toHaveClass(/visible/);
  });

  test('Mode toggle switches between reveal and flag mode', async ({ page }) => {
    const toggleButton = page.locator('#input-mode-toggle');
    const modeLabel = page.locator('#input-mode-toggle .mode-label');

    // Initial state should be REVEAL mode
    await expect(modeLabel).toHaveText('REVEAL');
    await expect(toggleButton).not.toHaveClass(/flag-mode/);

    // Click toggle to switch to FLAG mode
    await toggleButton.click();
    await page.waitForTimeout(100);

    // Should now be in FLAG mode
    await expect(modeLabel).toHaveText('FLAG');
    await expect(toggleButton).toHaveClass(/flag-mode/);

    // Click again to switch back to REVEAL mode
    await toggleButton.click();
    await page.waitForTimeout(100);

    // Should be back to REVEAL mode
    await expect(modeLabel).toHaveText('REVEAL');
    await expect(toggleButton).not.toHaveClass(/flag-mode/);
  });

  test('In flag mode, tap places a flag instead of revealing', async ({ page }) => {
    const toggleButton = page.locator('#input-mode-toggle');
    const manaDisplay = page.locator('#mana-display');
    const canvas = page.locator('#game-canvas');

    // Initial mana should be 0
    await expect(manaDisplay).toHaveText('0/100');

    // Switch to FLAG mode
    await toggleButton.click();
    await page.waitForTimeout(100);

    // Tap a cell - should place flag (not reveal)
    const pos = await getCellPosition(canvas, 3, 3);
    await canvas.click({ position: pos, force: true });
    await page.waitForTimeout(200);

    // Mana should increase by 10 (flag placed)
    await expect(manaDisplay).toHaveText('10/100');
  });

  test('In reveal mode, tap reveals cell (default behavior)', async ({ page }) => {
    const canvas = page.locator('#game-canvas');
    const coinsDisplay = page.locator('#coins-display');
    const hpDisplay = page.locator('#hp-display');

    // Make sure we're in REVEAL mode (default)
    const modeLabel = page.locator('#input-mode-toggle .mode-label');
    await expect(modeLabel).toHaveText('REVEAL');

    // Tap a cell - should reveal
    const pos = await getCellPosition(canvas, 0, 0);
    await canvas.click({ position: pos, force: true });
    await page.waitForTimeout(200);

    // Either coins increased (safe cell) or HP decreased (mine)
    const coins = parseInt(await coinsDisplay.textContent());
    const hp = await hpDisplay.textContent();

    const somethingHappened = coins > 0 || hp !== '1/1';
    expect(somethingHappened).toBe(true);
  });

  test('Long-press always flags regardless of mode', async ({ page }) => {
    const manaDisplay = page.locator('#mana-display');
    const canvas = page.locator('#game-canvas');

    // Stay in REVEAL mode (default)
    const modeLabel = page.locator('#input-mode-toggle .mode-label');
    await expect(modeLabel).toHaveText('REVEAL');

    // Initial mana should be 0
    await expect(manaDisplay).toHaveText('0/100');

    // Long-press a cell using touch events - should place flag even in reveal mode
    const pos = await getCellPosition(canvas, 4, 4);
    const box = await canvas.boundingBox();
    const touchX = box.x + pos.x;
    const touchY = box.y + pos.y;

    // Simulate complete long-press sequence in browser context
    // Running in single evaluate ensures proper event timing
    await page.evaluate(async ({x, y, duration}) => {
      const canvas = document.getElementById('game-canvas');
      const touchId = Date.now();

      // Create touch for start event
      const startTouch = new Touch({
        identifier: touchId,
        target: canvas,
        clientX: x,
        clientY: y,
        radiusX: 2.5,
        radiusY: 2.5,
        rotationAngle: 0,
        force: 0.5,
      });

      // Dispatch touchstart
      const touchStartEvent = new TouchEvent('touchstart', {
        cancelable: true,
        bubbles: true,
        touches: [startTouch],
        targetTouches: [startTouch],
        changedTouches: [startTouch],
      });
      canvas.dispatchEvent(touchStartEvent);

      // Wait for long-press duration to trigger flag action
      await new Promise(resolve => setTimeout(resolve, duration));

      // Create touch for end event (same identifier)
      const endTouch = new Touch({
        identifier: touchId,
        target: canvas,
        clientX: x,
        clientY: y,
        radiusX: 2.5,
        radiusY: 2.5,
        rotationAngle: 0,
        force: 0.5,
      });

      // Dispatch touchend
      const touchEndEvent = new TouchEvent('touchend', {
        cancelable: true,
        bubbles: true,
        touches: [],
        targetTouches: [],
        changedTouches: [endTouch],
      });
      canvas.dispatchEvent(touchEndEvent);
    }, {x: touchX, y: touchY, duration: 600});

    await page.waitForTimeout(200);

    // Mana should increase by 10 (flag placed via long-press)
    await expect(manaDisplay).toHaveText('10/100');
  });

  test('Mode resets to reveal when starting new game', async ({ page }) => {
    const toggleButton = page.locator('#input-mode-toggle');
    const modeLabel = page.locator('#input-mode-toggle .mode-label');

    // Switch to FLAG mode
    await toggleButton.click();
    await page.waitForTimeout(100);
    await expect(modeLabel).toHaveText('FLAG');

    // Go back to menu and start a new game
    await page.goto('/');
    await page.click('text=Start Run');

    // Complete quest/character selection
    await page.waitForSelector('#quest-screen.active', { timeout: 5000 });
    await page.locator('.quest-card:first-child').scrollIntoViewIfNeeded();
    await page.click('.quest-card:first-child', { force: true });

    await page.waitForSelector('#character-screen.active', { timeout: 5000 });
    await page.locator('.character-card:first-child').scrollIntoViewIfNeeded();
    await page.click('.character-card:first-child', { force: true });

    await page.waitForSelector('#game-screen.active', { timeout: 5000 });
    await page.waitForTimeout(500);

    // Mode should be reset to REVEAL
    await expect(modeLabel).toHaveText('REVEAL');
  });

  test('Canvas has mode indicator class', async ({ page }) => {
    const toggleButton = page.locator('#input-mode-toggle');
    const canvas = page.locator('#game-canvas');

    // In reveal mode, canvas should have reveal-mode-active class
    await expect(canvas).toHaveClass(/reveal-mode-active/);
    await expect(canvas).not.toHaveClass(/flag-mode-active/);

    // Switch to FLAG mode
    await toggleButton.click();
    await page.waitForTimeout(100);

    // Canvas should now have flag-mode-active class
    await expect(canvas).toHaveClass(/flag-mode-active/);
    await expect(canvas).not.toHaveClass(/reveal-mode-active/);
  });

  test('Toggle button has correct aria attributes', async ({ page }) => {
    const toggleButton = page.locator('#input-mode-toggle');

    // Initial state - reveal mode
    await expect(toggleButton).toHaveAttribute('role', 'switch');
    await expect(toggleButton).toHaveAttribute('aria-checked', 'false');

    // Switch to flag mode
    await toggleButton.click();
    await page.waitForTimeout(100);

    // aria-checked should be true in flag mode
    await expect(toggleButton).toHaveAttribute('aria-checked', 'true');
  });

  test('Mode toggle is hidden on game over', async ({ page }) => {
    test.setTimeout(60000); // Extend timeout for this test
    const toggleButton = page.locator('#input-mode-toggle');
    const canvas = page.locator('#game-canvas');
    const hpDisplay = page.locator('#hp-display');
    const gameoverOverlay = page.locator('#gameover-overlay');

    // Button should be visible initially
    await expect(toggleButton).toHaveClass(/visible/);

    // Click cells until game over (mine revealed when HP=0)
    let attempts = 0;

    while (attempts < 64) {
      const pos = await getCellPosition(canvas, attempts % 8, Math.floor(attempts / 8));
      await canvas.click({ position: pos, force: true });
      await page.waitForTimeout(50);

      // Check if game over overlay is visible (works regardless of HP setting)
      const overlayVisible = await gameoverOverlay.evaluate(el => !el.classList.contains('hidden'));
      if (overlayVisible) {
        break;
      }
      attempts++;
    }

    // Wait for game over UI to fully render
    await page.waitForTimeout(300);

    // Toggle button should be hidden on game over
    await expect(toggleButton).not.toHaveClass(/visible/);
  });
});

test.describe('Mode Button Position Setting', () => {

  test('Button position can be changed in settings', async ({ page }) => {
    await page.goto('/');

    // Go to settings
    await page.click('text=Settings');
    await page.waitForSelector('#settings-screen.active', { timeout: 5000 });

    // Find and change mode button position
    const positionSelect = page.locator('#mode-button-position');
    await expect(positionSelect).toBeVisible();

    // Default should be 'right'
    await expect(positionSelect).toHaveValue('right');

    // Change to 'left'
    await positionSelect.selectOption('left');
    await page.waitForTimeout(100);

    // Go back and start a game
    await page.click('#settings-back-button');
    await page.waitForSelector('#menu-screen.active', { timeout: 5000 });

    await page.click('text=Start Run');

    // Complete quest/character selection
    await page.waitForSelector('#quest-screen.active', { timeout: 5000 });
    await page.locator('.quest-card:first-child').scrollIntoViewIfNeeded();
    await page.click('.quest-card:first-child', { force: true });

    await page.waitForSelector('#character-screen.active', { timeout: 5000 });
    await page.locator('.character-card:first-child').scrollIntoViewIfNeeded();
    await page.click('.character-card:first-child', { force: true });

    await page.waitForSelector('#game-screen.active', { timeout: 5000 });
    await page.waitForTimeout(500);

    // Toggle button should have position-left class
    const toggleButton = page.locator('#input-mode-toggle');
    await expect(toggleButton).toHaveClass(/position-left/);
  });

  test('Button position setting persists', async ({ page }) => {
    await page.goto('/');

    // Go to settings and change to left
    await page.click('text=Settings');
    await page.waitForSelector('#settings-screen.active', { timeout: 5000 });

    const positionSelect = page.locator('#mode-button-position');
    await positionSelect.selectOption('left');
    await page.waitForTimeout(100);

    // Go back and return to settings
    await page.click('#settings-back-button');
    await page.waitForSelector('#menu-screen.active', { timeout: 5000 });

    await page.click('text=Settings');
    await page.waitForSelector('#settings-screen.active', { timeout: 5000 });

    // Setting should still be 'left'
    await expect(positionSelect).toHaveValue('left');
  });
});
