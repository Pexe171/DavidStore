import { test, expect } from '@playwright/test'

test.describe('Home', () => {
  test('exibe os destaques principais', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /david store/i })
    ).toBeVisible()
    await expect(page.getByRole('banner')).toContainText(/ofertas especiais/i)
  })
})
