import { test, expect, addTimerFromPreset, timerTiles } from '../fixtures/app';

test.describe('Schedules (save/load, local device storage)', () => {
  test('G1: saving current timers creates a named local schedule', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page, '5 min');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await page.getByPlaceholder('e.g. Sunday Service, Conference Day 1').fill('Sunday Service');
    await page.getByRole('button', { name: 'Save Schedule' }).click();

    // Modal closes on save; reopening in Load mode confirms it persisted.
    await page.getByRole('button', { name: 'Load', exact: true }).click();
    await expect(page.getByTestId('schedule-row').filter({ hasText: 'Sunday Service' })).toBeVisible();
  });

  test('G2: loading a saved schedule replaces the active room\'s timers', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page, '5 min');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByPlaceholder('e.g. Sunday Service, Conference Day 1').fill('Sunday Service');
    await page.getByRole('button', { name: 'Save Schedule' }).click();

    // A different timer now sits on top of the saved schedule's state.
    await addTimerFromPreset(page, '1 min');
    await expect(timerTiles(page)).toHaveCount(2);

    await page.getByRole('button', { name: 'Load', exact: true }).click();
    const row = page.getByTestId('schedule-row').filter({ hasText: 'Sunday Service' });
    await row.getByRole('button', { name: 'Load', exact: true }).click();

    await expect(timerTiles(page)).toHaveCount(1);
    await expect(timerTiles(page).first()).toContainText('5:00');
  });

  test('G3: deleting a local schedule removes it after confirming', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByPlaceholder('e.g. Sunday Service, Conference Day 1').fill('Temp Schedule');
    await page.getByRole('button', { name: 'Save Schedule' }).click();

    await page.getByRole('button', { name: 'Load', exact: true }).click();
    const row = page.getByTestId('schedule-row').filter({ hasText: 'Temp Schedule' });
    await expect(row).toBeVisible();

    await row.getByLabel('Delete schedule').click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByTestId('schedule-row')).toHaveCount(0);
    await expect(page.getByText('Nothing saved here yet.')).toBeVisible();
  });
});
