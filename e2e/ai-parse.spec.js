import { test, expect } from '@playwright/test'

test.describe('AI Task Parse', () => {
  test('shows AI input in new task modal', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("新建任务")')
    await expect(page.locator('.ai-parse-section')).toBeVisible()
    await expect(page.locator('textarea[placeholder*="AI 将自动填充"]')).toBeVisible()
  })

  test('AI parse button disabled when input empty', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("新建任务")')
    const btn = page.locator('button:has-text("AI 解析")')
    await expect(btn).toBeDisabled()
  })
})
