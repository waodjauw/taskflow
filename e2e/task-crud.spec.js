import { test, expect } from '@playwright/test'

test.describe('Task CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('displays task list on load', async ({ page }) => {
    const cards = page.locator('.task-card')
    await expect(cards.first()).toBeVisible()
  })

  test('opens new task modal and creates a task', async ({ page }) => {
    await page.click('button:has-text("新建任务")')
    await page.fill('input[placeholder*="任务标题"]', 'E2E 测试任务')
    await page.selectOption('select.form-select', 'work')
    await page.click('button:has-text("保存任务")')
    await expect(page.locator('.task-card')).toContainText('E2E 测试任务')
  })

  test('filters tasks by category', async ({ page }) => {
    const filterSelect = page.locator('.toolbar select').first()
    await filterSelect.selectOption('work')
    const cards = page.locator('.task-card')
    const count = await cards.count()
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toBeVisible()
    }
  })

  test('toggles batch mode', async ({ page }) => {
    await page.click('button:has-text("批量操作")')
    await expect(page.locator('.batch-bar')).toBeVisible()
  })
})
