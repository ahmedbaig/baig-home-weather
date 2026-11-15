import { expect, test } from '@playwright/test';
import { SHELL, createPost, devLogin, uniqueTitle, waitForLive } from './helpers';

test('shell loads the posts module from the manifest', async ({ page }) => {
  await page.goto(SHELL);
  await devLogin(page);

  await expect(page.getByRole('heading', { name: 'Home dashboard' })).toBeVisible();
  const rail = page.getByRole('navigation', { name: 'Modules' });
  await expect(rail.getByRole('link', { name: /Posts/ })).toBeVisible();
  await expect(rail.getByRole('link', { name: /TV/ })).toHaveCount(0);

  await rail.getByRole('link', { name: /Posts/ }).click();

  const host = page.locator('[data-module-host="posts"]');
  await expect(host).toHaveAttribute('data-status', 'mounted');
  await expect(host.locator('[data-module="posts"]')).toBeVisible();
  await expect(host.getByRole('heading', { name: 'Posts board' })).toBeVisible();
  await expect(host.locator('tbody tr')).toHaveCount(10);
  await waitForLive(page);

  await page.screenshot({ path: 'docs/screenshots/shell.png' });

  await rail.getByRole('link', { name: '00 Home' }).click();
  await expect(page.locator('[data-module="posts"]')).toHaveCount(0);
});

test('a post created in one page shows up live in another', async ({ context }) => {
  const first = await context.newPage();
  await first.goto(SHELL);
  await devLogin(first);
  await first.goto(`${SHELL}/posts`);
  await waitForLive(first);

  const second = await context.newPage();
  await second.goto(`${SHELL}/posts`);
  await waitForLive(second);

  const title = uniqueTitle('Live');
  await createPost(first, title);

  await expect(first.locator('tbody').getByText(title, { exact: true })).toBeVisible();
  await expect(second.locator('tbody').getByText(title, { exact: true })).toBeVisible();
  await expect(second.getByText('Live events').locator('..')).toContainText(/[1-9]/);
});
