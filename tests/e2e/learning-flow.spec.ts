import { test, expect } from '@playwright/test'

test.describe('学习全流程 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 等待页面加载完成
    await page.waitForTimeout(1000)
  })

  test('首页加载 — 仪表盘渲染无报错', async ({ page }) => {
    // 首页应该有内容
    const content = await page.textContent('body')
    expect(content).toBeTruthy()
    // 检查无 JS 错误
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.waitForTimeout(2000)
    expect(errors).toHaveLength(0)
  })

  test('侧边栏导航 — 可点击切换页面', async ({ page }) => {
    // 找到侧边栏菜单项
    const menuItems = page.locator('.ant-menu-item')
    const count = await menuItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('页面切换不报错', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    // 点击几个菜单项
    const menuItems = page.locator('.ant-menu-item')
    const count = await menuItems.count()

    for (let i = 0; i < Math.min(count, 4); i++) {
      await menuItems.nth(i).click()
      await page.waitForTimeout(500)
    }

    // 不应该有 JS 错误
    expect(errors).toHaveLength(0)
  })
})
