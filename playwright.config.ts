import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env.CI;
const mockEnv = { PUBLIC_MOCK: '1' };

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 900 }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }
    }
  ],
  webServer: [
    {
      command: 'pnpm --filter @dashboard/weather preview',
      url: 'http://localhost:4181',
      env: mockEnv,
      reuseExistingServer: !ci,
      timeout: 120_000
    },
    {
      command: 'pnpm --filter @dashboard/shell preview',
      url: 'http://localhost:4173',
      env: mockEnv,
      reuseExistingServer: !ci,
      timeout: 120_000
    }
  ]
});
