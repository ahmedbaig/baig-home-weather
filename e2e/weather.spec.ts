import { expect, test } from '@playwright/test';
import { WEATHER, devLogin } from './helpers';

test('standalone weather shows now, forecast and time zones', async ({ page }) => {
  await page.goto(WEATHER);
  await devLogin(page);

  await expect(page.getByRole('heading', { name: /Sky/ })).toBeVisible();
  await expect(page.getByText(/feels like/)).toBeVisible();
  await expect(
    page.getByRole('list', { name: '7 day forecast' }).getByRole('listitem')
  ).toHaveCount(7);
  await expect(page.getByRole('heading', { name: 'Time zones' })).toBeVisible();

  await page.screenshot({ path: 'docs/screenshots/weather.png' });
});

test('time zones can be added and removed', async ({ page }) => {
  await page.goto(`${WEATHER}/lab`);

  await page.getByLabel('Add').selectOption('Asia/Tokyo');
  await page.getByRole('button', { name: 'Add zone' }).click();
  await expect(page.getByRole('button', { name: 'Remove Tokyo' })).toBeVisible();

  await page.getByRole('button', { name: 'Remove Tokyo' }).click();
  await expect(page.getByRole('button', { name: 'Remove Tokyo' })).toHaveCount(0);
});

test('shows no access without weather:read', async ({ page }) => {
  await page.goto(WEATHER);
  await devLogin(page, ['weather:read']);

  await expect(page.getByText("You can't see the weather")).toBeVisible();
});
