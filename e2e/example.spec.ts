import { expect, test } from '@playwright/test';
import { EXAMPLE, createPost, devLogin, uniqueTitle, waitForLive } from './helpers';

test('creates a post in the standalone module', async ({ page }) => {
  await page.goto(EXAMPLE);
  await devLogin(page);
  await waitForLive(page);

  const title = uniqueTitle('Created');
  await createPost(page, title);

  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('tbody').getByText(title, { exact: true })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Post created' })).toBeVisible();

  await page.screenshot({ path: 'docs/screenshots/example.png' });
});

test('shows field errors and an error toast for a short title', async ({ page }) => {
  await page.goto(EXAMPLE);
  await devLogin(page);

  await page.getByRole('button', { name: 'New post' }).click();
  const form = page.getByRole('form', { name: 'New post' });
  await form.getByLabel('Title').fill('ab');
  await form.getByRole('button', { name: 'Create post' }).click();

  await expect(form.getByLabel('Title')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.getByText('Title must be at least 3 characters')).toBeVisible();
  const toast = page.getByRole('alert');
  await expect(toast).toContainText('Validation failed');
  await expect(toast).toContainText(/Request [0-9a-f-]{36}/);
});

test('hides write actions without posts:write', async ({ page }) => {
  await page.goto(EXAMPLE);
  await devLogin(page, ['posts:write']);

  await expect(page.getByRole('heading', { name: 'Posts board' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'New post' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Delete / })).toHaveCount(0);
});

test('shows no access without posts:read', async ({ page }) => {
  await page.goto(EXAMPLE);
  await devLogin(page, ['posts:read', 'posts:write']);

  await expect(page.getByText("You can't see posts")).toBeVisible();
});
