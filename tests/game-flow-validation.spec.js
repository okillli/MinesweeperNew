/**
 * Game Flow Validation Tests
 * Tests to identify issues in the full game flow from settings to gameplay
 */

const { test, expect } = require('@playwright/test');

test.describe('Game Flow Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#menu-screen.active');

    // Clear any saved settings to start fresh
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForSelector('#menu-screen.active');
  });

  test('TC1: Verify custom dimensions flow through entire game', async ({ page }) => {
    // Step 1: Set custom dimensions in settings
    await page.click('#settings-button');
    await page.waitForSelector('#settings-screen.active');

    await page.selectOption('#difficulty', 'custom');
    await page.check('#use-custom-dimensions');

    // Set specific values
    await page.fill('#custom-width', '20');
    await page.fill('#custom-height', '15');
    await page.fill('#custom-mines', '50');

    // Verify preview shows correct values
    const previewText = await page.locator('#preview-stats').textContent();
    console.log('Preview text:', previewText);
    expect(previewText).toContain('20×15');
    expect(previewText).toContain('50 mines');

    // Go back and start game
    await page.click('#settings-back-button');
    await page.waitForSelector('#menu-screen.active');

    // Start run
    await page.click('#start-button');
    await page.waitForSelector('#quest-screen.active');
    await page.click('.quest-card:not(.locked)');
    await page.waitForSelector('#character-screen.active');
    await page.click('.character-card:not(.locked)');
    await page.waitForSelector('#game-screen.active');

    // Wait for grid to render
    await page.waitForTimeout(500);

    // Step 2: Verify actual grid dimensions and mine count
    const gridInfo = await page.evaluate(() => {
      // Access the game state through the window object or find the game instance
      // The game is created in an IIFE in main.js, so we need another way

      // For now, let's check what we can from the current state
      // We can access globals like Grid and test directly
      const gameCanvas = document.getElementById('game-canvas');
      const canvasRect = gameCanvas.getBoundingClientRect();

      return {
        canvasWidth: canvasRect.width,
        canvasHeight: canvasRect.height
      };
    });

    console.log('Canvas info:', gridInfo);

    // The canvas should be sized to fit the grid
    // A 20x15 grid with 44px cells + 2px padding should be:
    // Width: 20*44 + 19*2 = 880 + 38 = 918
    // Height: 15*44 + 14*2 = 660 + 28 = 688
    // But capped by screen size

    // The test can't easily access the game instance due to the IIFE
    // We need to expose it or add a test hook
  });

  test('TC2: Verify settings are persisted correctly', async ({ page }) => {
    // Set custom dimensions
    await page.click('#settings-button');
    await page.waitForSelector('#settings-screen.active');

    await page.selectOption('#difficulty', 'custom');
    await page.check('#use-custom-dimensions');
    await page.fill('#custom-width', '25');
    await page.fill('#custom-height', '18');
    await page.fill('#custom-mines', '80');

    // Go back to save settings
    await page.click('#settings-back-button');

    // Reload page
    await page.reload();
    await page.waitForSelector('#menu-screen.active');

    // Check settings were persisted
    await page.click('#settings-button');
    await page.waitForSelector('#settings-screen.active');

    const difficulty = await page.locator('#difficulty').inputValue();
    const useCustomDimensions = await page.locator('#use-custom-dimensions').isChecked();
    const customWidth = await page.locator('#custom-width').inputValue();
    const customHeight = await page.locator('#custom-height').inputValue();
    const customMines = await page.locator('#custom-mines').inputValue();

    console.log('Loaded settings:', {
      difficulty,
      useCustomDimensions,
      customWidth,
      customHeight,
      customMines
    });

    expect(difficulty).toBe('custom');
    expect(useCustomDimensions).toBe(true);
    expect(customWidth).toBe('25');
    expect(customHeight).toBe('18');
    expect(customMines).toBe('80');
  });

  test('TC3: Verify HUD board display matches actual board', async ({ page }) => {
    // Set starting board to 3
    await page.click('#settings-button');
    await page.waitForSelector('#settings-screen.active');

    await page.selectOption('#starting-board', '3');
    await page.click('#settings-back-button');
    await page.waitForSelector('#menu-screen.active');

    // Start game
    await page.click('#start-button');
    await page.waitForSelector('#quest-screen.active');
    await page.click('.quest-card:not(.locked)');
    await page.waitForSelector('#character-screen.active');
    await page.click('.character-card:not(.locked)');
    await page.waitForSelector('#game-screen.active');

    // Check HUD display
    const boardDisplay = await page.locator('#board-display').textContent();
    console.log('HUD Board Display:', boardDisplay);

    // Should show "3/6" since we started at board 3
    expect(boardDisplay).toBe('3/6');
  });

  test('TC4: Debug - Expose game state for testing', async ({ page }) => {
    // This test exposes the game state for debugging

    await page.click('#settings-button');
    await page.waitForSelector('#settings-screen.active');

    await page.selectOption('#difficulty', 'custom');
    await page.check('#use-custom-dimensions');
    await page.fill('#custom-width', '12');
    await page.fill('#custom-height', '10');
    await page.fill('#custom-mines', '20');

    await page.click('#settings-back-button');

    await page.click('#start-button');
    await page.waitForSelector('#quest-screen.active');
    await page.click('.quest-card:not(.locked)');
    await page.waitForSelector('#character-screen.active');
    await page.click('.character-card:not(.locked)');
    await page.waitForSelector('#game-screen.active');
    await page.waitForTimeout(500);

    // Try to access game state via console
    const debugInfo = await page.evaluate(() => {
      // The game is inside the DOMContentLoaded IIFE, but we can check
      // if there's a way to access it

      // Let's check what's available globally
      const globals = [];
      for (let key in window) {
        if (typeof window[key] === 'function' &&
            ['Grid', 'Cell', 'GameState', 'getScaledBoardConfig', 'Game', 'CanvasRenderer'].includes(key)) {
          globals.push(key);
        }
      }

      // Try to create our own test to verify the flow
      const settings = {
        difficulty: 'custom',
        useCustomDimensions: true,
        customWidth: 12,
        customHeight: 10,
        customMines: 20
      };

      const config = getScaledBoardConfig(1, settings);

      // Create grid with these settings
      const testGrid = new Grid(config.width, config.height, config.mines);

      // Count mines
      let mineCount = 0;
      for (let y = 0; y < testGrid.height; y++) {
        for (let x = 0; x < testGrid.width; x++) {
          if (testGrid.cells[y][x].isMine) mineCount++;
        }
      }

      return {
        availableGlobals: globals,
        configFromSettings: {
          width: config.width,
          height: config.height,
          mines: config.mines
        },
        testGridDimensions: {
          width: testGrid.width,
          height: testGrid.height,
          mineCount: testGrid.mineCount,
          actualMines: mineCount,
          cellRows: testGrid.cells.length,
          cellCols: testGrid.cells[0].length
        }
      };
    });

    console.log('Debug Info:', JSON.stringify(debugInfo, null, 2));

    expect(debugInfo.configFromSettings.width).toBe(12);
    expect(debugInfo.configFromSettings.height).toBe(10);
    expect(debugInfo.configFromSettings.mines).toBe(20);
    expect(debugInfo.testGridDimensions.width).toBe(12);
    expect(debugInfo.testGridDimensions.height).toBe(10);
    expect(debugInfo.testGridDimensions.actualMines).toBe(20);
    // cells is indexed as [y][x], so rows = height, cols = width
    expect(debugInfo.testGridDimensions.cellRows).toBe(10);
    expect(debugInfo.testGridDimensions.cellCols).toBe(12);
  });

  test('TC5: Verify large custom grid (30x30 max)', async ({ page }) => {
    await page.click('#settings-button');
    await page.waitForSelector('#settings-screen.active');

    await page.selectOption('#difficulty', 'custom');
    await page.check('#use-custom-dimensions');
    await page.fill('#custom-width', '30');
    await page.fill('#custom-height', '30');
    await page.fill('#custom-mines', '150');

    // Check preview
    const previewText = await page.locator('#preview-stats').textContent();
    console.log('Large grid preview:', previewText);

    // Max mines for 30x30 = 900 - 9 = 891, so 150 should work
    expect(previewText).toContain('30×30');
    expect(previewText).toContain('150 mines');

    // Verify the config
    const configInfo = await page.evaluate(() => {
      const settings = {
        difficulty: 'custom',
        useCustomDimensions: true,
        customWidth: 30,
        customHeight: 30,
        customMines: 150
      };

      const config = getScaledBoardConfig(1, settings);
      const testGrid = new Grid(config.width, config.height, config.mines);

      let mineCount = 0;
      for (let y = 0; y < testGrid.height; y++) {
        for (let x = 0; x < testGrid.width; x++) {
          if (testGrid.cells[y][x].isMine) mineCount++;
        }
      }

      return {
        config,
        gridWidth: testGrid.width,
        gridHeight: testGrid.height,
        actualMines: mineCount,
        totalCells: testGrid.width * testGrid.height
      };
    });

    console.log('Large grid config:', configInfo);
    expect(configInfo.config.width).toBe(30);
    expect(configInfo.config.height).toBe(30);
    expect(configInfo.config.mines).toBe(150);
    expect(configInfo.actualMines).toBe(150);
  });

  test('TC6: Test settings parsing from HTML inputs', async ({ page }) => {
    // This test verifies that the values from HTML inputs are correctly parsed

    await page.click('#settings-button');
    await page.waitForSelector('#settings-screen.active');

    await page.selectOption('#difficulty', 'custom');
    await page.check('#use-custom-dimensions');

    // Set values and check they're correctly read
    await page.fill('#custom-width', '22');
    await page.fill('#custom-height', '17');
    await page.fill('#custom-mines', '65');

    // Trigger input events
    await page.locator('#custom-width').dispatchEvent('input');
    await page.locator('#custom-height').dispatchEvent('input');
    await page.locator('#custom-mines').dispatchEvent('input');

    // Get the values that would be saved
    const parsedValues = await page.evaluate(() => {
      const customWidth = parseInt(document.getElementById('custom-width').value, 10);
      const customHeight = parseInt(document.getElementById('custom-height').value, 10);
      const customMines = parseInt(document.getElementById('custom-mines').value, 10);

      return {
        customWidth,
        customHeight,
        customMines,
        types: {
          widthType: typeof customWidth,
          heightType: typeof customHeight,
          minesType: typeof customMines
        }
      };
    });

    console.log('Parsed values:', parsedValues);

    expect(parsedValues.customWidth).toBe(22);
    expect(parsedValues.customHeight).toBe(17);
    expect(parsedValues.customMines).toBe(65);
    expect(parsedValues.types.widthType).toBe('number');
    expect(parsedValues.types.heightType).toBe('number');
    expect(parsedValues.types.minesType).toBe('number');
  });
});
