import { test, expect, Locator } from '@playwright/test';
import { selectDialog } from './combobox-util';

test.describe('Tab states', () => {
  test('different states on different tabs', async ({ page }) => {
    await page.goto('');
    const name = page.getByRole('tab', { name: 'Name' }).locator('.tab-state');
    const call = page.getByRole('tab', { name: 'Call' }).locator('.tab-state');
    await assertTabState(name, 'empty');
    await assertTabState(call, 'warning');

    await page.getByLabel('Display name').clear();
    await assertTabState(name, 'error');
    await assertTabState(call, 'warning');

    await page.getByRole('tab', { name: 'Call' }).click();
    await selectDialog(page);
    await assertTabState(name, 'error');
    await assertTabState(call, 'empty');
  });

  test('error over warning', async ({ page }) => {
    await page.goto('');
    const name = page.getByRole('tab', { name: 'Name' }).locator('.tab-state');
    await assertTabState(name, 'empty');

    await page.getByLabel('Description').clear();
    await assertTabState(name, 'warning');

    await page.getByLabel('Display name').clear();
    await assertTabState(name, 'error');
  });

  async function assertTabState(tab: Locator, state: string): Promise<void> {
    await expect(tab).toHaveAttribute('data-state', state);
  }
});
