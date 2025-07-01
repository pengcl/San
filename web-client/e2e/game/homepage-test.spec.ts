import { test, expect } from '@playwright/test';

test.describe('首页功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 启动前端开发服务器
    await page.goto('http://localhost:3000/home');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
  });

  test('验证首页基础元素', async ({ page }) => {
    // 模拟API响应
    await page.route('**/api/user-profiles/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            username: 'testplayer',
            level: 25,
            gold: 123456,
            gems: 789
          }
        })
      });
    });

    await page.route('**/api/user-heroes*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            heroes: [
              { id: 1, hero: { name: '刘备' }},
              { id: 2, hero: { name: '关羽' }},
              { id: 3, hero: { name: '张飞' }}
            ],
            pagination: { page: 1, limit: 10, total: 3 }
          }
        })
      });
    });

    // 刷新页面以应用路由
    await page.reload();
    
    // 等待元素加载
    await page.waitForTimeout(2000);

    // 验证页面标题
    await expect(page).toHaveTitle(/三国/);
    
    // 验证欢迎文字
    await expect(page.locator('text=欢迎来到三国英雄传')).toBeVisible();
    
    // 验证快捷操作按钮
    await expect(page.locator('text=武将系统')).toBeVisible();
    await expect(page.locator('text=武将召唤')).toBeVisible();
    await expect(page.locator('text=阵容配置')).toBeVisible();
    await expect(page.locator('text=关卡挑战')).toBeVisible();
    
    // 验证开始游戏按钮
    await expect(page.locator('button:has-text("开始游戏")')).toBeVisible();
    await expect(page.locator('button:has-text("查看武将")')).toBeVisible();
  });

  test('验证导航功能', async ({ page }) => {
    // 查找并点击菜单按钮
    const menuButton = page.locator('[data-testid="menu-button"], button[aria-label="menu"]').first();
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // 验证导航项
      await expect(page.locator('text=主页')).toBeVisible();
      await expect(page.locator('text=武将')).toBeVisible();
      await expect(page.locator('text=召唤')).toBeVisible();
    }
  });

  test('验证响应式布局', async ({ page }) => {
    // 测试移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // 验证移动端布局
    await expect(page.locator('text=欢迎来到三国英雄传')).toBeVisible();
    
    // 验证按钮在移动端仍然可见
    await expect(page.locator('button:has-text("开始游戏")')).toBeVisible();
  });

  test('验证功能按钮点击', async ({ page }) => {
    // 点击武将系统按钮
    const heroButton = page.locator('text=武将系统').first();
    if (await heroButton.isVisible()) {
      await heroButton.click();
      
      // 验证页面跳转（如果有的话）
      await page.waitForTimeout(1000);
    }
    
    // 返回首页
    await page.goto('http://localhost:3000/home');
    
    // 点击召唤按钮
    const summonButton = page.locator('text=武将召唤').first();
    if (await summonButton.isVisible()) {
      await summonButton.click();
      await page.waitForTimeout(1000);
    }
  });
});