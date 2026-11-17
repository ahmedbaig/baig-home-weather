import { expect, test } from '@playwright/test';
import { SHELL, devLogin } from './helpers';

test('shell loads the weather module from the manifest', async ({ page }) => {
  await page.goto(SHELL);
  await devLogin(page);

  await expect(page.getByRole('heading', { name: 'Home dashboard' })).toBeVisible();
  const rail = page.getByRole('navigation', { name: 'Modules' });
  await rail.getByRole('link', { name: /Weather/ }).click();

  const host = page.locator('[data-module-host="weather"]');
  await expect(host).toHaveAttribute('data-status', 'mounted');
  await expect(host.locator('[data-module="weather"]')).toBeVisible();
  await expect(host.getByRole('heading', { name: /Sky/ })).toBeVisible();
  await expect(
    host.getByRole('list', { name: '7 day forecast' }).getByRole('listitem')
  ).toHaveCount(7);

  await page.screenshot({ path: 'docs/screenshots/shell.png' });

  await rail.getByRole('link', { name: '00 Home' }).click();
  await expect(page.locator('[data-module="weather"]')).toHaveCount(0);
});
