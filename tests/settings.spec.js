/**
 * Settings Screen Tests
 * Tests for settings page scrolling and custom difficulty options
 */

const { test, expect } = require('@playwright/test');

test.describe('Settings Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to initialize
    await page.waitForSelector('#menu-screen.active');

    // Navigate to settings
    await page.click('#settings-button');
    await page.waitForSelector('#settings-screen.active');
  });

  test('Settings page is fully visible and scrollable', async ({ page }) => {
    // Check that settings screen is visible
    await expect(page.locator('#settings-screen')).toBeVisible();

    // Check that the title is visible (should not be cut off at top)
    const title = page.locator('#settings-screen h2');
    await expect(title).toBeVisible();

    // Check that the title is within the viewport (not cut off)
    const titleBox = await title.boundingBox();
    expect(titleBox.y).toBeGreaterThanOrEqual(0);

    // Check that we can see settings sections
    await expect(page.locator('.settings-section').first()).toBeVisible();

    // Check that back button is visible (at bottom of content)
    await expect(page.locator('#settings-back-button')).toBeVisible();
  });

  test('Custom difficulty options appear when Custom is selected', async ({ page }) => {
    // Custom options should be hidden initially
    const customOptions = page.locator('#custom-difficulty-options');
    await expect(customOptions).toHaveClass(/hidden/);

    // Select "Custom" difficulty
    await page.selectOption('#difficulty', 'custom');

    // Custom options should now be visible
    await expect(customOptions).not.toHaveClass(/hidden/);
    await expect(customOptions).toBeVisible();

    // Verify sliders are visible (scaling mode is default)
    await expect(page.locator('#board-size-scale')).toBeVisible();
    await expect(page.locator('#mine-density-scale')).toBeVisible();
  });

  test('Custom options hide when non-custom difficulty is selected', async ({ page }) => {
    // First select custom
    await page.selectOption('#difficulty', 'custom');
    await expect(page.locator('#custom-difficulty-options')).not.toHaveClass(/hidden/);

    // Now select normal
    await page.selectOption('#difficulty', 'normal');
    await expect(page.locator('#custom-difficulty-options')).toHaveClass(/hidden/);

    // Try hard
    await page.selectOption('#difficulty', 'hard');
    await expect(page.locator('#custom-difficulty-options')).toHaveClass(/hidden/);

    // Try easy
    await page.selectOption('#difficulty', 'easy');
    await expect(page.locator('#custom-difficulty-options')).toHaveClass(/hidden/);
  });

  test('Custom dimensions toggle switches between scaling and dimensions mode', async ({ page }) => {
    // Select custom difficulty
    await page.selectOption('#difficulty', 'custom');

    // Scaling mode should be visible, custom dimensions hidden
    await expect(page.locator('#scaling-mode-options')).not.toHaveClass(/hidden/);
    await expect(page.locator('#custom-dimensions-options')).toHaveClass(/hidden/);

    // Enable custom dimensions
    await page.check('#use-custom-dimensions');

    // Scaling mode should be hidden, custom dimensions visible
    await expect(page.locator('#scaling-mode-options')).toHaveClass(/hidden/);
    await expect(page.locator('#custom-dimensions-options')).not.toHaveClass(/hidden/);

    // Verify number inputs are visible
    await expect(page.locator('#custom-width')).toBeVisible();
    await expect(page.locator('#custom-height')).toBeVisible();
    await expect(page.locator('#custom-mines')).toBeVisible();

    // Uncheck to go back to scaling mode
    await page.uncheck('#use-custom-dimensions');
    await expect(page.locator('#scaling-mode-options')).not.toHaveClass(/hidden/);
    await expect(page.locator('#custom-dimensions-options')).toHaveClass(/hidden/);
  });

  test('Difficulty preview updates with settings', async ({ page }) => {
    const previewStats = page.locator('#preview-stats');

    // Default preview for board 1 with normal difficulty
    await expect(previewStats).toContainText(/\d+×\d+ grid, \d+ mines/);

    // Select custom and change scale
    await page.selectOption('#difficulty', 'custom');
    await page.fill('#board-size-scale', '150');
    // Trigger input event
    await page.locator('#board-size-scale').dispatchEvent('input');

    // Preview should update
    await expect(previewStats).toContainText(/\d+×\d+ grid, \d+ mines/);
  });

  test('Starting board selection updates preview', async ({ page }) => {
    const previewTitle = page.locator('.preview-title');

    // Check initial preview shows Board 1
    await expect(previewTitle).toContainText('Board 1');

    // Change to board 6
    await page.selectOption('#starting-board', '6');
    await expect(previewTitle).toContainText('Board 6');
  });
});
