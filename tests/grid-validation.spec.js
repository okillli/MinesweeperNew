/**
 * Grid Validation Tests
 * Tests to identify issues with mine count, grid dimensions, and cell numbers
 */

const { test, expect } = require('@playwright/test');

test.describe('Grid Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#menu-screen.active');

    // Mark tutorial as completed so tests go directly to quest screen
    await page.evaluate(() => {
      const existingSave = localStorage.getItem('minequest_save');
      let saveData;
      if (existingSave) {
        saveData = JSON.parse(existingSave);
        saveData.persistent = saveData.persistent || {};
        saveData.persistent.tutorialCompleted = true;
        saveData.persistent.seenTips = saveData.persistent.seenTips || [];
      } else {
        saveData = {
          version: '0.6.0',
          timestamp: Date.now(),
          persistent: { tutorialCompleted: true, seenTips: [] }
        };
      }
      localStorage.setItem('minequest_save', JSON.stringify(saveData));
    });
    await page.reload();
    await page.waitForSelector('#menu-screen.active');
  });

  test('TC1: Mine count matches configuration', async ({ page }) => {
    // Set custom difficulty with exact dimensions
    await page.click('#settings-button');
    await page.waitForSelector('#settings-screen.active');

    await page.selectOption('#difficulty', 'custom');
    await page.check('#use-custom-dimensions');

    // Set a specific configuration: 10x10 grid with 15 mines
    await page.fill('#custom-width', '10');
    await page.fill('#custom-height', '10');
    await page.fill('#custom-mines', '15');

    await page.click('#settings-back-button');
    await page.waitForSelector('#menu-screen.active');

    // Start a game
    await page.click('#start-button');
    await page.waitForSelector('#quest-screen.active');
    await page.click('.quest-card:not(.locked)');
    await page.waitForSelector('#character-screen.active');
    await page.click('.character-card:not(.locked)');
    await page.waitForSelector('#game-screen.active');

    // Wait for grid to be rendered
    await page.waitForTimeout(500);

    // Use evaluate to check the grid state
    const gridInfo = await page.evaluate(() => {
      // Access the game instance - need to find it
      // The game is created in main.js inside DOMContentLoaded
      // We need to access it through a different means

      // Create a test grid to verify Grid class behavior
      const testGrid = new Grid(10, 10, 15);

      let mineCount = 0;
      let cellCount = 0;

      for (let y = 0; y < testGrid.height; y++) {
        for (let x = 0; x < testGrid.width; x++) {
          cellCount++;
          if (testGrid.cells[y][x].isMine) {
            mineCount++;
          }
        }
      }

      return {
        width: testGrid.width,
        height: testGrid.height,
        configuredMines: testGrid.mineCount,
        actualMines: mineCount,
        totalCells: cellCount
      };
    });

    console.log('Grid Info:', gridInfo);
    expect(gridInfo.width).toBe(10);
    expect(gridInfo.height).toBe(10);
    expect(gridInfo.totalCells).toBe(100);
    expect(gridInfo.actualMines).toBe(gridInfo.configuredMines);
    expect(gridInfo.actualMines).toBe(15);
  });

  test('TC2: Cell numbers are calculated correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Create a small test grid with known mine positions
      const testGrid = new Grid(5, 5, 4);

      // Clear existing mines
      for (let y = 0; y < testGrid.height; y++) {
        for (let x = 0; x < testGrid.width; x++) {
          testGrid.cells[y][x].isMine = false;
          testGrid.cells[y][x].number = 0;
        }
      }

      // Place mines in known positions: corners
      // (0,0), (4,0), (0,4), (4,4)
      testGrid.cells[0][0].isMine = true;  // top-left
      testGrid.cells[0][4].isMine = true;  // top-right
      testGrid.cells[4][0].isMine = true;  // bottom-left
      testGrid.cells[4][4].isMine = true;  // bottom-right

      // Recalculate numbers
      testGrid.calculateNumbers();

      // Expected numbers:
      // M 1 0 1 M   (row 0)
      // 1 1 0 1 1   (row 1)
      // 0 0 0 0 0   (row 2)
      // 1 1 0 1 1   (row 3)
      // M 1 0 1 M   (row 4)

      const issues = [];
      const expected = [
        [0, 1, 0, 1, 0], // row 0 (mines have number 0)
        [1, 1, 0, 1, 1], // row 1
        [0, 0, 0, 0, 0], // row 2
        [1, 1, 0, 1, 1], // row 3
        [0, 1, 0, 1, 0], // row 4 (mines have number 0)
      ];

      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const cell = testGrid.cells[y][x];
          const expectedNum = expected[y][x];
          if (!cell.isMine && cell.number !== expectedNum) {
            issues.push({
              x, y,
              expected: expectedNum,
              actual: cell.number,
              isMine: cell.isMine
            });
          }
        }
      }

      return {
        issues,
        grid: testGrid.cells.map(row => row.map(c => ({
          isMine: c.isMine,
          number: c.number
        })))
      };
    });

    console.log('Number calculation issues:', result.issues);
    console.log('Grid state:', JSON.stringify(result.grid, null, 2));
    expect(result.issues.length).toBe(0);
  });

  test('TC3: Large grid mine count validation (20x20 with 80 mines)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const testGrid = new Grid(20, 20, 80);

      let actualMines = 0;
      for (let y = 0; y < testGrid.height; y++) {
        for (let x = 0; x < testGrid.width; x++) {
          if (testGrid.cells[y][x].isMine) {
            actualMines++;
          }
        }
      }

      return {
        width: testGrid.width,
        height: testGrid.height,
        configuredMines: testGrid.mineCount,
        actualMines: actualMines,
        totalCells: testGrid.width * testGrid.height
      };
    });

    console.log('Large grid info:', result);
    expect(result.actualMines).toBe(80);
    expect(result.width).toBe(20);
    expect(result.height).toBe(20);
  });

  test('TC4: Verify cell number calculations on randomly generated grid', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Create a grid and verify ALL cell numbers are correct
      const testGrid = new Grid(15, 15, 40);

      const errors = [];

      for (let y = 0; y < testGrid.height; y++) {
        for (let x = 0; x < testGrid.width; x++) {
          const cell = testGrid.cells[y][x];

          if (cell.isMine) continue; // Skip mine cells

          // Manually count adjacent mines
          let manualCount = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < testGrid.width && ny >= 0 && ny < testGrid.height) {
                if (testGrid.cells[ny][nx].isMine) {
                  manualCount++;
                }
              }
            }
          }

          if (cell.number !== manualCount) {
            errors.push({
              x, y,
              storedNumber: cell.number,
              calculatedNumber: manualCount
            });
          }
        }
      }

      return {
        totalCells: testGrid.width * testGrid.height,
        mineCount: testGrid.mineCount,
        errorCount: errors.length,
        errors: errors.slice(0, 10) // First 10 errors
      };
    });

    console.log('Number validation result:', result);
    expect(result.errorCount).toBe(0);
  });

  test('TC5: getScaledBoardConfig returns correct dimensions', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Test custom dimensions mode
      const customSettings = {
        difficulty: 'custom',
        useCustomDimensions: true,
        customWidth: 20,
        customHeight: 15,
        customMines: 50
      };

      const config = getScaledBoardConfig(1, customSettings);

      return {
        width: config.width,
        height: config.height,
        mines: config.mines,
        expected: {
          width: 20,
          height: 15,
          mines: 50
        }
      };
    });

    console.log('getScaledBoardConfig result:', result);
    expect(result.width).toBe(result.expected.width);
    expect(result.height).toBe(result.expected.height);
    expect(result.mines).toBe(result.expected.mines);
  });

  test('TC6: Grid dimensions match getScaledBoardConfig output', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Simulate what happens in GameState.generateNextBoard()
      const settings = {
        difficulty: 'custom',
        useCustomDimensions: true,
        customWidth: 18,
        customHeight: 12,
        customMines: 40
      };

      const config = getScaledBoardConfig(1, settings);
      const grid = new Grid(config.width, config.height, config.mines);

      // Count actual mines
      let actualMines = 0;
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          if (grid.cells[y][x].isMine) {
            actualMines++;
          }
        }
      }

      return {
        configWidth: config.width,
        configHeight: config.height,
        configMines: config.mines,
        gridWidth: grid.width,
        gridHeight: grid.height,
        gridMineCount: grid.mineCount,
        actualMines: actualMines,
        totalCells: grid.width * grid.height,
        cellArrayRows: grid.cells.length,
        cellArrayCols: grid.cells[0] ? grid.cells[0].length : 0
      };
    });

    console.log('Grid vs Config comparison:', result);

    // Config should match requested
    expect(result.configWidth).toBe(18);
    expect(result.configHeight).toBe(12);
    expect(result.configMines).toBe(40);

    // Grid should match config
    expect(result.gridWidth).toBe(result.configWidth);
    expect(result.gridHeight).toBe(result.configHeight);
    expect(result.gridMineCount).toBe(result.configMines);

    // Actual mines should match
    expect(result.actualMines).toBe(result.configMines);

    // Cell array dimensions should be correct (height x width)
    expect(result.cellArrayRows).toBe(result.gridHeight);
    expect(result.cellArrayCols).toBe(result.gridWidth);
  });

  test('TC7: Verify scaling mode calculations', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Test scaling mode with 150% size scale
      const settings = {
        difficulty: 'custom',
        useCustomDimensions: false,
        boardSizeScale: 150, // 150%
        mineDensityScale: 100
      };

      // Board 1 base: 8x8 with 10 mines
      const config = getScaledBoardConfig(1, settings);

      // Expected: 8 * 1.5 = 12 (rounded)
      // Mine density: 10/(8*8) = 0.15625
      // Scaled mines: 12*12 * 0.15625 * 1.0 = 22.5 -> 23 (rounded)

      return {
        width: config.width,
        height: config.height,
        mines: config.mines,
        originalWidth: config.originalWidth,
        originalHeight: config.originalHeight,
        originalMines: config.originalMines,
        appliedSizeScale: config.appliedSizeScale,
        appliedMineScale: config.appliedMineScale
      };
    });

    console.log('Scaling mode result:', result);

    // 8 * 1.5 = 12
    expect(result.width).toBe(12);
    expect(result.height).toBe(12);
    expect(result.originalWidth).toBe(8);
    expect(result.originalHeight).toBe(8);
    expect(result.appliedSizeScale).toBe(1.5);
  });
});
