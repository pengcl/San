import { test, expect } from '@playwright/test';

test.describe('核心游戏流程测试', () => {
  test.beforeEach(async ({ page }) => {
    // 清理本地存储
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('完整的新手游戏流程', async ({ page }) => {
    // 模拟认证API
    await page.route('/api/auth/local', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jwt: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'testplayer',
            email: 'test@example.com'
          }
        })
      });
    });

    // 模拟用户资料API
    await page.route('/api/user-profiles/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            username: 'testplayer',
            level: 1,
            gold: 50000,
            gems: 1000,
            stamina: 100
          }
        })
      });
    });

    // 模拟武将API
    await page.route('/api/user-heroes?*', async route => {
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

    // 模拟召唤配置API
    await page.route('/api/summon/rates', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            normal: {
              cost: { type: 'gold', amount: 10000 },
              rates: { 1: 0.5, 2: 0.3, 3: 0.15, 4: 0.04, 5: 0.01, 6: 0.0 }
            },
            premium: {
              cost: { type: 'gems', amount: 300 },
              rates: { 1: 0.1, 2: 0.25, 3: 0.35, 4: 0.2, 5: 0.08, 6: 0.02 }
            }
          }
        })
      });
    });

    // 1. 访问登录页面
    await page.goto('/login');
    await expect(page).toHaveTitle(/三国/);

    // 2. 登录
    await page.fill('input[name="identifier"]', 'testplayer');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');

    // 3. 等待跳转到首页
    await page.waitForURL('/home');
    
    // 4. 验证新手引导是否出现
    await expect(page.locator('[data-testid="new-player-guide"]')).toBeVisible({ timeout: 10000 });
    
    // 5. 完成新手引导 - 第一步
    await expect(page.locator('text=欢迎来到三国英雄传')).toBeVisible();
    await page.click('button:has-text("下一步")');

    // 6. 引导到召唤系统
    await expect(page.locator('text=免费召唤武将')).toBeVisible();
    await page.click('button:has-text("前往召唤")');

    // 7. 验证跳转到召唤页面
    await page.waitForURL('/summon');
    await expect(page.locator('text=武将召唤')).toBeVisible();

    // 8. 模拟召唤API
    await page.route('/api/summon/normal', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            results: [{
              heroId: 1001,
              heroName: '刘备',
              quality: 5,
              qualityName: '传说',
              qualityColor: '#FF8000',
              isNewHero: true,
              fragments: 0
            }],
            newHeroesCount: 1,
            totalFragments: 0
          }
        })
      });
    });

    // 9. 执行普通召唤
    await page.click('button:has-text("普通召唤1次")');
    
    // 10. 验证召唤结果
    await expect(page.locator('[data-testid="summon-result-dialog"]')).toBeVisible();
    await expect(page.locator('text=刘备')).toBeVisible();
    await expect(page.locator('text=新武将!')).toBeVisible();
    
    // 11. 关闭召唤结果
    await page.click('button:has-text("确定")');

    // 12. 返回首页继续引导
    await page.goto('/home');
    
    // 13. 重新打开引导
    await page.click('button:has-text("新手引导")');
    
    // 14. 跳到武将系统步骤
    await page.click('button:has-text("下一步")'); // 欢迎
    await page.click('button:has-text("下一步")'); // 召唤
    await page.click('button:has-text("查看武将")'); // 武将系统

    // 15. 验证武将页面
    await page.waitForURL('/heroes');
    await expect(page.locator('text=我的武将')).toBeVisible();

    // 16. 模拟有武将的API响应
    await page.route('/api/user-heroes?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            heroes: [{
              id: 1,
              hero: {
                id: 1001,
                name: '刘备',
                quality: { id: 5, name: '传说', color: '#FF8000' }
              },
              level: 1,
              star: 5,
              experience: 0
            }],
            pagination: { page: 1, limit: 10, total: 1 }
          }
        })
      });
    }, { times: 1 });

    // 17. 刷新页面查看武将
    await page.reload();
    await expect(page.locator('text=刘备')).toBeVisible();

    // 18. 继续引导 - 阵容配置
    await page.goto('/home');
    await page.click('button:has-text("新手引导")');
    
    // 跳到阵容步骤
    await page.click('button:has-text("下一步")'); // 欢迎
    await page.click('button:has-text("下一步")'); // 召唤
    await page.click('button:has-text("下一步")'); // 武将
    await page.click('button:has-text("配置阵容")'); // 阵容

    // 19. 验证阵容页面
    await page.waitForURL('/formation');
    await expect(page.locator('text=阵容配置')).toBeVisible();

    // 20. 最后一步 - 战斗
    await page.goto('/home');
    await page.click('button:has-text("新手引导")');
    
    // 跳到战斗步骤
    await page.click('button:has-text("下一步")'); // 欢迎
    await page.click('button:has-text("下一步")'); // 召唤
    await page.click('button:has-text("下一步")'); // 武将
    await page.click('button:has-text("下一步")'); // 阵容
    await page.click('button:has-text("开始战斗")'); // 战斗

    // 21. 验证战斗关卡页面
    await page.waitForURL('/battle/stages');
    await expect(page.locator('text=战斗关卡')).toBeVisible();

    // 22. 验证引导完成状态
    await page.goto('/home');
    const guideCompleted = await page.evaluate(() => 
      localStorage.getItem('newPlayerGuideCompleted')
    );
    expect(guideCompleted).toBe('true');
  });

  test('首页核心功能验证', async ({ page }) => {
    // 设置已登录状态
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 1,
        username: 'testplayer'
      }));
    });

    // 模拟用户数据
    await page.route('/api/user-profiles/me', async route => {
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

    await page.route('/api/user-heroes?*', async route => {
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

    await page.goto('/home');
    
    // 验证用户信息显示
    await expect(page.locator('text=testplayer')).toBeVisible();
    await expect(page.locator('text=等级 25')).toBeVisible();
    await expect(page.locator('text=123,456')).toBeVisible(); // 金币
    await expect(page.locator('text=789')).toBeVisible(); // 钻石

    // 验证快捷操作
    await expect(page.locator('text=武将系统')).toBeVisible();
    await expect(page.locator('text=武将召唤')).toBeVisible();
    await expect(page.locator('text=阵容配置')).toBeVisible();
    await expect(page.locator('text=关卡挑战')).toBeVisible();
    
    // 验证武将数量徽章
    await expect(page.locator('text=3').first()).toBeVisible(); // 武将数量

    // 验证新功能标识
    await expect(page.locator('text=新').first()).toBeVisible(); // 召唤功能新标识
  });

  test('导航系统验证', async ({ page }) => {
    // 设置已登录状态
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });

    await page.goto('/home');
    
    // 打开导航抽屉
    await page.click('[data-testid="menu-button"]');
    
    // 验证导航项
    await expect(page.locator('text=主页')).toBeVisible();
    await expect(page.locator('text=武将')).toBeVisible();
    await expect(page.locator('text=召唤')).toBeVisible();
    await expect(page.locator('text=阵容')).toBeVisible();
    await expect(page.locator('text=战斗')).toBeVisible();
    
    // 验证召唤功能的新标识
    await expect(page.locator('text=新').nth(1)).toBeVisible();
    
    // 测试导航跳转
    await page.click('text=召唤');
    await page.waitForURL('/summon');
    await expect(page.locator('text=武将召唤')).toBeVisible();
  });

  test('召唤系统核心功能', async ({ page }) => {
    // 设置已登录状态
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });

    // 模拟API响应
    await page.route('/api/user-profiles/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { gold: 50000, gems: 1000 }
        })
      });
    });

    await page.route('/api/summon/rates', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            normal: {
              cost: { type: 'gold', amount: 10000 },
              rates: { 1: 0.5, 2: 0.3, 3: 0.15, 4: 0.04, 5: 0.01, 6: 0.0 }
            }
          }
        })
      });
    });

    await page.goto('/summon');
    
    // 验证资源显示
    await expect(page.locator('text=50,000').first()).toBeVisible(); // 金币
    await expect(page.locator('text=1,000').first()).toBeVisible(); // 钻石
    
    // 验证召唤选项
    await expect(page.locator('text=普通召唤')).toBeVisible();
    await expect(page.locator('text=高级召唤')).toBeVisible();
    
    // 验证概率显示
    await expect(page.locator('text=获得概率')).toBeVisible();
    await expect(page.locator('text=50.0%')).toBeVisible(); // 1星概率
    
    // 验证召唤次数选择
    await expect(page.locator('button:has-text("1次")')).toBeVisible();
    await expect(page.locator('button:has-text("5次")')).toBeVisible();
    await expect(page.locator('button:has-text("10次")')).toBeVisible();
    
    // 选择5次召唤
    await page.click('button:has-text("5次")');
    await expect(page.locator('text=50,000 金币')).toBeVisible(); // 5次费用
  });

  test('移动端响应式验证', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });

    await page.goto('/home');
    
    // 验证移动端布局
    const container = page.locator('.MuiContainer-root').first();
    await expect(container).toHaveCSS('padding-left', '16px'); // xs padding
    
    // 验证按钮触控友好尺寸
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    const buttonHeight = await firstButton.evaluate(el => el.offsetHeight);
    expect(buttonHeight).toBeGreaterThanOrEqual(44); // 最小触控高度
    
    // 验证快捷操作在移动端的布局
    const quickActions = page.locator('[data-testid="quick-actions"]');
    await expect(quickActions).toBeVisible();
    
    // 验证移动端文字大小
    const title = page.locator('h4').first();
    await expect(title).toHaveCSS('font-size', '1.5rem'); // xs font size
  });

  test('错误处理和网络问题', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });

    // 模拟网络错误
    await page.route('/api/user-profiles/me', async route => {
      await route.abort('failed');
    });

    await page.goto('/home');
    
    // 验证错误处理 - 应该有优雅的降级
    await expect(page.locator('text=主公')).toBeVisible(); // 默认用户名
    await expect(page.locator('text=等级 1')).toBeVisible(); // 默认等级
  });

  test('本地存储功能', async ({ page }) => {
    await page.goto('/home');
    
    // 测试新手引导状态保存
    await page.evaluate(() => {
      localStorage.setItem('newPlayerGuideCompleted', 'true');
    });
    
    await page.reload();
    
    // 验证引导不会自动显示
    await expect(page.locator('[data-testid="new-player-guide"]')).not.toBeVisible();
    
    // 但可以手动打开
    await page.click('button:has-text("新手引导")');
    await expect(page.locator('[data-testid="new-player-guide"]')).toBeVisible();
  });
});