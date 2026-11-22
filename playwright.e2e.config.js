import { defineConfig } from '@playwright/test'

/**
 * Browser E2E config, mirroring web-strata-reports' pattern. Run locally against
 * the Podman local stack (`npm run test:e2e`) -- this repo has no CI test gate
 * for E2E yet, by design (it's slower and hits external state, unlike the unit
 * tests required to merge). Override the target with E2E_BASE_URL.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  outputDir: 'test-results/e2e',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
  },
})
