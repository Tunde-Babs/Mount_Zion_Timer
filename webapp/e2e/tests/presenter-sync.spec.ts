import { test, expect, addTimerFromPreset, timerTiles } from '../fixtures/app';

test.describe('Presenter view sync (same-browser BroadcastChannel)', () => {
  test('I2: presenter tab reflects the on-air timer once it starts running', async ({ dashboardPage: page, context }) => {
    await addTimerFromPreset(page, '5 min');
    await timerTiles(page).first().getByLabel('Edit').click();
    await page.getByPlaceholder('Enter timer title').fill('Welcome Song');
    await page.getByPlaceholder('Enter timer title').blur();
    await page.getByRole('button', { name: 'Done' }).click();

    await page.getByRole('button', { name: 'Presenter' }).click();
    const codeBlock = page.getByText(/Session code:/);
    const codeText = (await codeBlock.textContent()) || '';
    const roomCode = codeText.replace('Session code:', '').trim();
    expect(roomCode.length).toBeGreaterThan(0);
    await page.keyboard.press('Escape');

    // Start the timer so the dashboard's ~100ms tick loop keeps re-publishing —
    // this sidesteps the race where a presenter tab opened after a one-off
    // publish (BroadcastChannel doesn't replay past messages) would otherwise
    // sit on "Waiting for the control panel…" until the next state change.
    await timerTiles(page).first().getByLabel('Play').click();

    const presenterPage = await context.newPage();
    await presenterPage.goto(`/present/${roomCode}`);

    await expect(presenterPage.getByText('Welcome Song')).toBeVisible({ timeout: 5000 });
  });
});
