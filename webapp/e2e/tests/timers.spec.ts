import { test, expect, addTimerFromPreset, timerTiles } from '../fixtures/app';

test.describe('Timer CRUD & controls', () => {
  test('D1: quick presets add a timer tile with the right duration', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page, '5 min');
    const tile = timerTiles(page).first();
    await expect(tile).toBeVisible();
    // formatTime() (webapp/src/lib/time.js) doesn't zero-pad minutes under an hour.
    await expect(tile).toContainText('5:00');
  });

  test('D3: "N" keyboard shortcut adds a timer', async ({ dashboardPage: page }) => {
    await page.keyboard.press('n');
    await expect(timerTiles(page)).toHaveCount(1);
  });

  test('D4: editing title, notes, and duration persists', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page);
    await timerTiles(page).first().getByLabel('Edit').click();

    await page.getByLabel('Timer title').fill('Opening Prayer');
    await page.getByLabel('Timer title').blur();
    await page.getByLabel('Notes (optional)').fill('Pastor John');
    await page.getByLabel('Notes (optional)').blur();

    const durationInput = page.getByLabel('Duration (MM:SS)');
    await durationInput.fill('03:30');
    await durationInput.blur();

    await page.getByRole('button', { name: 'Done' }).click();

    const tile = timerTiles(page).first();
    await expect(tile).toContainText('Opening Prayer');
    await expect(tile).toContainText('3:30');
  });

  test('D6: deleting a timer confirms, then can be undone from the toast', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page);
    await timerTiles(page).first().getByLabel('Delete').click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    // The tile's own icon-only Delete button also matches by accessible name
    // (it's in the DOM even when visually hidden by group-hover opacity), so
    // this must be scoped to the confirm dialog specifically.
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(timerTiles(page)).toHaveCount(0);

    await page.getByRole('button', { name: /Undo/ }).click();
    await expect(timerTiles(page)).toHaveCount(1);
  });

  test('D8: starting a timer via click, and toggling via Space', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page);
    const tile = timerTiles(page).first();

    await expect(tile.getByLabel('Play')).toBeVisible();
    await tile.getByLabel('Play').click();
    await expect(tile.getByLabel('Pause')).toBeVisible();

    // Space toggles the first (on-air) timer regardless of focus, per the
    // Dashboard-level keydown handler — skip if focus is in a text input.
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press(' ');
    await expect(tile.getByLabel('Play')).toBeVisible();
  });

  test('D10: "R" resets the on-air timer back to full duration', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page, '5 min');
    const tile = timerTiles(page).first();
    await tile.getByLabel('Play').click();
    await page.waitForTimeout(1500);

    await page.keyboard.press('r');
    await expect(tile).toContainText('5:00');
  });

  test('D5: quick-adjust in the edit modal changes duration by the chosen step', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page, '5 min');
    await timerTiles(page).first().getByLabel('Edit').click();

    // adjustTime() (useTimerStore.js) bumps both remainingTime and duration —
    // 5 min + 1 min = 6:00.
    await page.getByRole('button', { name: '+1', exact: true }).click();
    await page.getByRole('button', { name: 'Done' }).click();

    await expect(timerTiles(page).first()).toContainText('6:00');
  });

  test('D7: drag-and-drop reorders timers, changing which one is on-air', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page, '1 min');
    await addTimerFromPreset(page, '5 min');

    const tiles = timerTiles(page);
    await expect(tiles).toHaveCount(2);
    await expect(tiles.first()).toContainText('1 min');

    // Native HTML5 draggable (see TimerTile's dragProps), not a custom mouse-move
    // sortable — dragTo() dispatches the real dragstart/dragover/drop sequence.
    await tiles.nth(1).dragTo(tiles.nth(0));

    await expect(tiles.first()).toContainText('5 min');
    await expect(page.getByTestId('on-air-display')).toContainText('5 min');
  });

  test('D9: number keys toggle the corresponding timer by position', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page, '1 min');
    await addTimerFromPreset(page, '5 min');
    const tiles = timerTiles(page);

    // The second tile (index 1, "5 min") shows "Key 2" and is toggled by pressing "2".
    await expect(tiles.nth(1)).toContainText('Key 2');
    await expect(tiles.nth(1)).toContainText('5 min');
    await page.keyboard.press('2');

    // toggleTimer() (useTimerStore.js) re-sorts the array to put whichever timer
    // just *started* at index 0 ("on air") — so the tile that was at index 1
    // (the one we started) is now at index 0, not still at index 1.
    await expect(tiles.nth(0)).toContainText('5 min');
    await expect(tiles.nth(0).getByLabel('Pause')).toBeVisible();
    await expect(tiles.nth(1)).toContainText('1 min');
    await expect(tiles.nth(1).getByLabel('Play')).toBeVisible();
  });
});
