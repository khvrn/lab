import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('shows the gallery heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /lab/i })).toBeVisible()
  })

  test('shows an app card for Counter', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('app-card-counter')).toBeVisible()
  })

  test('navigates to the Counter app', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('app-card-counter').click()
    await expect(page).toHaveURL('/apps/counter')
    await expect(page.getByText('← Back to Lab')).toBeVisible()
  })

  test('counter increments and decrements', async ({ page }) => {
    await page.goto('/apps/counter')
    await expect(page.getByText('0')).toBeVisible()
    await page.getByTestId('increment').click()
    await expect(page.getByText('1')).toBeVisible()
    await page.getByTestId('decrement').click()
    await expect(page.getByText('0')).toBeVisible()
  })
})
