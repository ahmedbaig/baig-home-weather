import { expect, type Page } from '@playwright/test';

export const SHELL = 'http://localhost:4173';
export const WEATHER = 'http://localhost:4181';

export async function devLogin(page: Page, uncheck: string[] = []): Promise<void> {
  await expect(page.getByTestId('splash')).toBeHidden();
  for (const scope of uncheck) await page.getByLabel(scope).uncheck();
  await page.getByRole('button', { name: 'Sign in' }).click();
}
