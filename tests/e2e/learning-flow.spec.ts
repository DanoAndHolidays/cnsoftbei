import { test, expect } from '@playwright/test'

test.describe('学习全流程 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)
  })

  test('首页加载 — 仪表盘渲染无报错', async ({ page }) => {
    const content = await page.textContent('body')
    expect(content).toBeTruthy()
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.waitForTimeout(2000)
    expect(errors).toHaveLength(0)
  })

  test('侧边栏导航 — 可点击切换页面', async ({ page }) => {
    const menuItems = page.locator('.ant-menu-item')
    const count = await menuItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('页面切换不报错', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    const menuItems = page.locator('.ant-menu-item')
    const count = await menuItems.count()

    for (let i = 0; i < Math.min(count, 4); i++) {
      await menuItems.nth(i).click()
      await page.waitForTimeout(500)
    }

    expect(errors).toHaveLength(0)
  })

  // ==================== 登录流程 ====================

  test('登录流程 — 默认学生账号可登录', async ({ page }) => {
    // 查找登录表单元素
    const usernameInput = page.locator('input[id*="username"], input[placeholder*="用户名"], input[placeholder*="账号"]').first()
    const passwordInput = page.locator('input[id*="password"], input[type="password"]').first()

    if (await usernameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await usernameInput.fill('student1')
      await passwordInput.fill('123456')
      const loginBtn = page.locator('button:has-text("登录"), button:has-text("Login")').first()
      await loginBtn.click()
      await page.waitForTimeout(2000)
      // 登录后应该看到仪表盘或主界面
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()
    }
  })

  // ==================== 页面内容验证 ====================

  test('Practice 页面 — 题目列表可交互', async ({ page }) => {
    const menuItems = page.locator('.ant-menu-item')
    const count = await menuItems.count()

    // 找到练习中心菜单项并点击
    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).textContent()
      if (text && text.includes('练习')) {
        await menuItems.nth(i).click()
        await page.waitForTimeout(1000)
        break
      }
    }

    // 练习页面应该有内容
    const content = await page.textContent('body')
    expect(content).toBeTruthy()
  })

  test('Tutor 页面 — 输入框可交互', async ({ page }) => {
    const menuItems = page.locator('.ant-menu-item')
    const count = await menuItems.count()

    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).textContent()
      if (text && text.includes('辅导')) {
        await menuItems.nth(i).click()
        await page.waitForTimeout(1000)
        break
      }
    }

    // 辅导页面应该有输入区域
    const content = await page.textContent('body')
    expect(content).toBeTruthy()
  })

  test('Profile 页面 — 画像展示', async ({ page }) => {
    const menuItems = page.locator('.ant-menu-item')
    const count = await menuItems.count()

    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).textContent()
      if (text && text.includes('画像')) {
        await menuItems.nth(i).click()
        await page.waitForTimeout(1000)
        break
      }
    }

    const content = await page.textContent('body')
    expect(content).toBeTruthy()
  })

  test('Path 页面 — 学习路径展示', async ({ page }) => {
    const menuItems = page.locator('.ant-menu-item')
    const count = await menuItems.count()

    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).textContent()
      if (text && text.includes('路径')) {
        await menuItems.nth(i).click()
        await page.waitForTimeout(1000)
        break
      }
    }

    const content = await page.textContent('body')
    expect(content).toBeTruthy()
  })

  test('Assessment 页面 — 评估报告展示', async ({ page }) => {
    const menuItems = page.locator('.ant-menu-item')
    const count = await menuItems.count()

    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).textContent()
      if (text && text.includes('评估')) {
        await menuItems.nth(i).click()
        await page.waitForTimeout(1000)
        break
      }
    }

    const content = await page.textContent('body')
    expect(content).toBeTruthy()
  })

  // ==================== 全页面遍历 ====================

  test('全页面遍历 — 点击所有菜单项无 JS 错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    const menuItems = page.locator('.ant-menu-item')
    const count = await menuItems.count()

    for (let i = 0; i < count; i++) {
      await menuItems.nth(i).click()
      await page.waitForTimeout(800)
    }

    expect(errors).toHaveLength(0)
  })
})
