import { test, expect } from '@playwright/test'

/**
 * Browser/UI golden path against the local Podman full-stack (web-mystore +
 * fn-mystore + Postgres + Azurite). Signup requires a real Stripe payment
 * method token (not practical to automate against test keys without the
 * Stripe Elements iframe), so this logs in with a seeded test company
 * instead of signing up fresh -- see scripts/db-admin or ask Claude for how
 * E2E_TEST_SLUG/EMAIL/PASSWORD were seeded locally.
 *
 * Run: `npm run test:e2e` (needs `npx playwright install chromium` once).
 */

const SLUG = process.env.E2E_TEST_SLUG ?? 'e2e-local-test'
const EMAIL = process.env.E2E_TEST_EMAIL ?? 'e2e-local-test@example.test'
const PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'E2eTest12345!'

test.describe('Company login journey (local)', () => {
  test('sign in → reach the dashboard, and key pages render', async ({ page }) => {
    await page.goto(`/${SLUG}/login`)
    await page.getByRole('textbox', { name: 'Email' }).fill(EMAIL)
    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()

    await page.waitForURL('**/dashboard', { timeout: 20_000 })
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20_000 })

    for (const path of ['/dashboard/inventory', '/dashboard/customers', '/dashboard/sales-history']) {
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')
      await expect(page, `'${path}' should stay authenticated`).not.toHaveURL(/\/login/)
      await expect(page.getByRole('heading').first(), `'${path}' should render a heading`).toBeVisible({ timeout: 20_000 })
    }
  })
})
