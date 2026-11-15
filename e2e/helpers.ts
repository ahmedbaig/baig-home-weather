import { expect, type Page } from '@playwright/test';

export const SHELL = 'http://localhost:4173';
export const EXAMPLE = 'http://localhost:4174';

export async function devLogin(page: Page, uncheck: string[] = []): Promise<void> {
  await expect(page.getByTestId('splash')).toBeHidden();
  for (const scope of uncheck) await page.getByLabel(scope).uncheck();
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now().toString(36)}`;
}

export async function waitForLive(page: Page): Promise<void> {
  await expect(page.getByTestId('live-status').getByRole('status')).toHaveAttribute(
    'data-status',
    'live'
  );
}

export async function createPost(page: Page, title: string): Promise<void> {
  await page.getByRole('button', { name: 'New post' }).click();
  const form = page.getByRole('form', { name: 'New post' });
  await form.getByLabel('Title').fill(title);
  await form.getByLabel('Body').fill('Written by the end to end suite.');
  await form.getByRole('button', { name: 'Create post' }).click();
}
