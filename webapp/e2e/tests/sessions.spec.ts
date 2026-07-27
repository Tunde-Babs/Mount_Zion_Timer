import { test, expect, addTimerFromPreset, openSessionMenu } from '../fixtures/app';

test.describe('Session (room) management', () => {
  test('C1: default "Session 1" exists on first load', async ({ dashboardPage: page }) => {
    await expect(page.getByTestId('session-switcher-button')).toContainText('Session 1');
  });

  test('C2: creating a new session makes it active', async ({ dashboardPage: page }) => {
    const menu = await openSessionMenu(page);
    await menu.getByTestId('new-session-button').click();

    await expect(page.getByTestId('session-switcher-button')).toContainText('Session 2');
  });

  test('C3: switching sessions shows that session\'s own timers', async ({ dashboardPage: page }) => {
    // Session 1 gets a timer, then we create and switch to Session 2, which should start empty.
    await addTimerFromPreset(page);
    await expect(page.getByTestId('timer-tile')).toHaveCount(1);

    let menu = await openSessionMenu(page);
    await menu.getByTestId('new-session-button').click();
    await expect(page.getByTestId('timer-tile')).toHaveCount(0);

    // Switch back to Session 1 and confirm its timer is still there.
    menu = await openSessionMenu(page);
    await menu.getByTestId('session-item').filter({ hasText: 'Session 1' }).click();
    await expect(page.getByTestId('timer-tile')).toHaveCount(1);
  });

  test('C6 (regression): session dropdown renders above the on-air banner once a timer exists', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page);
    await expect(page.getByTestId('on-air-display')).toBeVisible();

    const menu = await openSessionMenu(page);
    await expect(menu).toBeVisible();

    // The regression was the on-air banner's stacking context painting over the
    // dropdown, making its items unclickable even though they were visible-ish
    // underneath. Actually clicking through confirms it's on top, not just present.
    const newSessionButton = menu.getByTestId('new-session-button');
    await expect(newSessionButton).toBeVisible();
    await newSessionButton.click();

    await expect(page.getByTestId('session-switcher-button')).toContainText('Session 2');
  });

  test('C4: renaming a session updates its name', async ({ dashboardPage: page }) => {
    page.once('dialog', (dialog) => dialog.accept('Sunday Service'));

    const menu = await openSessionMenu(page);
    const item = menu.getByTestId('session-item').filter({ hasText: 'Session 1' });
    await item.hover(); // rename/delete are group-hover-revealed, hidden otherwise
    await item.getByLabel('Rename session').click();

    await expect(page.getByTestId('session-switcher-button')).toContainText('Sunday Service');
  });

  test('C5: deleting a session removes it (only available when more than one exists)', async ({ dashboardPage: page }) => {
    let menu = await openSessionMenu(page);
    await menu.getByTestId('new-session-button').click();
    await expect(page.getByTestId('session-switcher-button')).toContainText('Session 2');

    menu = await openSessionMenu(page);
    await expect(menu.getByTestId('session-item')).toHaveCount(2);

    const session1Item = menu.getByTestId('session-item').filter({ hasText: 'Session 1' });
    await session1Item.hover();
    await session1Item.getByLabel('Delete session').click();

    menu = await openSessionMenu(page);
    await expect(menu.getByTestId('session-item')).toHaveCount(1);
    await expect(menu.getByTestId('session-item')).toContainText('Session 2');
  });
});
