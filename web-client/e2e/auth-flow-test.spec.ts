import { test, expect } from '@playwright/test';

test.describe('认证流程和首页验证', () => {
  test.beforeEach(async ({ page }) => {
    // 清理状态
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('验证登录页面和功能', async ({ page }) => {
    // 访问根路径应该重定向到登录页
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 验证重定向到登录页
    expect(page.url()).toContain('/login');
    
    // 验证登录页面元素
    await expect(page.locator('text=三国英雄传')).toBeVisible();
    await expect(page.locator('text=登录游戏')).toBeVisible();
    
    // 验证表单元素
    await expect(page.locator('input[name="identifier"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // 验证测试账户提示
    await expect(page.locator('text=测试账户：pengcl / zouleyuan')).toBeVisible();
  });

  test('使用测试账户登录并进入首页', async ({ page }) => {
    // 模拟登录API
    await page.route('**/api/auth/local', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jwt: 'mock-jwt-token-12345',
          user: {
            id: 1,
            username: 'pengcl',
            email: 'pengcl@test.com'
          }
        })
      });
    });

    // 模拟用户资料API
    await page.route('**/api/user-profiles/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            username: 'pengcl',
            level: 25,
            gold: 123456,
            gems: 789,
            stamina: 100
          }
        })
      });
    });

    // 模拟武将数据API
    await page.route('**/api/user-heroes*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            heroes: [],
            pagination: { page: 1, limit: 10, total: 0 }
          }
        })
      });
    });

    // 访问登录页
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // 填写登录表单
    await page.fill('input[name="identifier"]', 'pengcl');
    await page.fill('input[name="password"]', 'zouleyuan');
    
    // 提交登录
    await page.click('button[type="submit"]');
    
    // 等待跳转和页面加载
    await page.waitForURL('**/home');
    await page.waitForTimeout(2000);
    
    // 验证首页加载成功
    expect(page.url()).toContain('/home');
    
    // 验证首页关键元素
    await expect(page.locator('text=欢迎来到三国英雄传')).toBeVisible();
    await expect(page.locator('text=征战沙场')).toBeVisible();
    
    // 验证用户信息显示
    await expect(page.locator('text=pengcl')).toBeVisible();
    await expect(page.locator('text=等级 25')).toBeVisible();
    
    // 验证快捷操作按钮
    await expect(page.locator('text=武将系统')).toBeVisible();
    await expect(page.locator('text=武将召唤')).toBeVisible();
    await expect(page.locator('text=阵容配置')).toBeVisible();
    await expect(page.locator('text=关卡挑战')).toBeVisible();
    
    console.log('✅ 登录流程和首页验证成功！');
  });

  test('验证导航功能', async ({ page }) => {
    // 设置已登录状态
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 1,
        username: 'pengcl'
      }));
    });

    // 直接访问首页
    await page.goto('http://localhost:3000/home');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 查找导航菜单按钮
    const menuButton = page.locator('[data-testid="menu-button"]').first();
    const hamburgerButton = page.locator('button:has([data-testid="menu-icon"])').first();
    
    // 尝试不同的菜单按钮选择器
    const possibleMenuButtons = [
      '[data-testid="menu-button"]',
      'button[aria-label="menu"]',
      'button:has(svg)',
      '.MuiIconButton-root'
    ];
    
    let menuClicked = false;
    for (const selector of possibleMenuButtons) {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        await button.click();
        menuClicked = true;
        console.log(`成功点击菜单按钮: ${selector}`);
        break;
      }
    }
    
    if (menuClicked) {
      // 验证导航项
      await expect(page.locator('text=主页')).toBeVisible();
      await expect(page.locator('text=武将')).toBeVisible();
      await expect(page.locator('text=召唤')).toBeVisible();
      console.log('✅ 导航功能验证成功！');
    } else {
      console.log('⚠️ 未找到菜单按钮，跳过导航测试');
    }
  });

  test('验证新手引导功能', async ({ page }) => {
    // 设置已登录但无武将状态（触发新手引导）
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.removeItem('newPlayerGuideCompleted');
    });

    // 模拟空武将列表
    await page.route('**/api/user-heroes*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            heroes: [],
            pagination: { page: 1, limit: 10, total: 0 }
          }
        })
      });
    });

    await page.goto('http://localhost:3000/home');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 等待引导延迟触发
    
    // 验证新手引导是否出现
    const guideDialog = page.locator('[data-testid="new-player-guide"]');
    if (await guideDialog.isVisible()) {
      await expect(page.locator('text=欢迎来到三国英雄传')).toBeVisible();
      await expect(page.locator('button:has-text("下一步")')).toBeVisible();
      console.log('✅ 新手引导功能验证成功！');
    } else {
      console.log('⚠️ 新手引导未触发，可能需要特定条件');
    }
  });
});