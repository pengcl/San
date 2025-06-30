import { test, expect } from '@playwright/test';

test.describe('英雄管理功能', () => {
  test.beforeEach(async ({ page }) => {
    // 设置登录状态
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem(
        'auth_user',
        JSON.stringify({
          id: '1',
          username: 'testuser',
        })
      );
    });

    // 模拟英雄数据API
    await page.route('/api/heroes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              name: '关羽',
              title: '武圣',
              level: 30,
              rarity: 'legendary',
              faction: '蜀',
              health: 2800,
              attack: 450,
              defense: 380,
              speed: 320,
            },
            {
              id: 2,
              name: '诸葛亮',
              title: '卧龙',
              level: 25,
              rarity: 'legendary',
              faction: '蜀',
              health: 1800,
              attack: 380,
              defense: 250,
              speed: 420,
            },
            {
              id: 3,
              name: '张飞',
              title: '猛张飞',
              level: 28,
              rarity: 'epic',
              faction: '蜀',
              health: 3200,
              attack: 420,
              defense: 350,
              speed: 280,
            },
          ],
        }),
      });
    });

    await page.goto('/heroes');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示英雄列表', async ({ page }) => {
    await expect(page).toHaveTitle(/英雄/);

    // 检查英雄卡片
    const heroCards = page.locator('[data-testid="hero-card"]');
    await expect(heroCards).toHaveCount(3);

    // 检查英雄信息
    await expect(page.locator('text=关羽')).toBeVisible();
    await expect(page.locator('text=诸葛亮')).toBeVisible();
    await expect(page.locator('text=张飞')).toBeVisible();
  });

  test('应该显示英雄详细信息', async ({ page }) => {
    // 检查关羽的信息
    const guanyuCard = page
      .locator('[data-testid="hero-card"]')
      .filter({ hasText: '关羽' });

    await expect(guanyuCard.locator('text=武圣')).toBeVisible();
    await expect(guanyuCard.locator('text=Lv.30')).toBeVisible();
    await expect(guanyuCard.locator('text=2800')).toBeVisible(); // health
    await expect(guanyuCard.locator('text=450')).toBeVisible(); // attack
  });

  test('应该支持英雄筛选', async ({ page }) => {
    // 检查筛选器
    const rarityFilter = page.locator('[data-testid="rarity-filter"]');
    await expect(rarityFilter).toBeVisible();

    // 筛选传奇英雄
    await rarityFilter.selectOption('legendary');

    const visibleCards = page.locator('[data-testid="hero-card"]:visible');
    await expect(visibleCards).toHaveCount(2); // 关羽和诸葛亮

    // 筛选史诗英雄
    await rarityFilter.selectOption('epic');
    await expect(visibleCards).toHaveCount(1); // 张飞
  });

  test('应该支持按阵营筛选', async ({ page }) => {
    const factionFilter = page.locator('[data-testid="faction-filter"]');

    // 筛选蜀国英雄
    await factionFilter.selectOption('蜀');

    const visibleCards = page.locator('[data-testid="hero-card"]:visible');
    await expect(visibleCards).toHaveCount(3); // 全部都是蜀国
  });

  test('应该支持英雄搜索', async ({ page }) => {
    const searchInput = page.locator('[data-testid="hero-search"]');

    // 搜索关羽
    await searchInput.fill('关羽');

    const visibleCards = page.locator('[data-testid="hero-card"]:visible');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.locator('text=关羽')).toBeVisible();

    // 清空搜索
    await searchInput.clear();
    await expect(page.locator('[data-testid="hero-card"]')).toHaveCount(3);
  });

  test('应该支持英雄排序', async ({ page }) => {
    const sortSelect = page.locator('[data-testid="hero-sort"]');

    // 按等级排序
    await sortSelect.selectOption('level');

    const heroNames = await page
      .locator('[data-testid="hero-card"] .hero-name')
      .allTextContents();
    expect(heroNames[0]).toBe('关羽'); // 等级最高

    // 按攻击力排序
    await sortSelect.selectOption('attack');

    const heroNamesAfterSort = await page
      .locator('[data-testid="hero-card"] .hero-name')
      .allTextContents();
    expect(heroNamesAfterSort[0]).toBe('关羽'); // 攻击力最高
  });

  test('应该支持英雄选择', async ({ page }) => {
    const firstHeroCard = page.locator('[data-testid="hero-card"]').first();

    // 点击选择英雄
    await firstHeroCard.click();

    // 检查选中状态
    await expect(firstHeroCard).toHaveClass(/selected/);

    // 取消选择
    await firstHeroCard.click();
    await expect(firstHeroCard).not.toHaveClass(/selected/);
  });

  test('应该支持多选英雄', async ({ page }) => {
    const heroCards = page.locator('[data-testid="hero-card"]');

    // 启用多选模式
    await page.click('[data-testid="multi-select-toggle"]');

    // 选择多个英雄
    await heroCards.nth(0).click();
    await heroCards.nth(1).click();

    const selectedCards = page.locator('[data-testid="hero-card"].selected');
    await expect(selectedCards).toHaveCount(2);

    // 检查批量操作按钮
    await expect(page.locator('[data-testid="batch-actions"]')).toBeVisible();
  });

  test('应该打开英雄详情页', async ({ page }) => {
    // 模拟英雄详情API
    await page.route('/api/heroes/1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            name: '关羽',
            title: '武圣',
            level: 30,
            skills: [
              { id: 1, name: '青龙偃月', level: 5 },
              { id: 2, name: '义薄云天', level: 3 },
            ],
            equipment: {
              weapon: { name: '青龙偃月刀', level: 10 },
              armor: { name: '虎胆甲', level: 8 },
            },
          },
        }),
      });
    });

    // 点击英雄卡片的详情按钮
    await page.click(
      '[data-testid="hero-card"]:has-text("关羽") .hero-detail-btn'
    );

    // 等待详情页加载
    await page.waitForURL('/heroes/1');

    // 检查详情页内容
    await expect(page.locator('text=关羽')).toBeVisible();
    await expect(page.locator('text=武圣')).toBeVisible();
    await expect(page.locator('text=青龙偃月')).toBeVisible();
    await expect(page.locator('text=青龙偃月刀')).toBeVisible();
  });

  test('应该支持英雄升级', async ({ page }) => {
    // 模拟升级API
    await page.route('/api/heroes/1/upgrade', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            level: 31,
            experience: 0,
          },
        }),
      });
    });

    // 打开英雄操作菜单
    await page.click(
      '[data-testid="hero-card"]:has-text("关羽") .hero-actions'
    );

    // 点击升级按钮
    await page.click('text=升级');

    // 确认升级
    await page.click('[data-testid="confirm-upgrade"]');

    // 检查升级成功提示
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('应该处理加载状态', async ({ page }) => {
    // 模拟慢速API响应
    await page.route('/api/heroes', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto('/heroes');

    // 检查加载状态
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test('应该处理空数据状态', async ({ page }) => {
    // 模拟空数据响应
    await page.route('/api/heroes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      });
    });

    await page.goto('/heroes');
    await page.waitForLoadState('networkidle');

    // 检查空状态提示
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('text=暂无英雄')).toBeVisible();
  });

  test('应该支持响应式布局', async ({ page }) => {
    // 测试桌面布局
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopCards = page.locator('[data-testid="hero-card"]');
    await expect(desktopCards.first()).toBeVisible();

    // 测试移动端布局
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(desktopCards.first()).toBeVisible();

    // 检查移动端特定元素
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('应该支持无限滚动', async ({ page }) => {
    // 模拟分页数据
    let page_num = 1;
    await page.route('/api/heroes*', async route => {
      const url = new URL(route.request().url());
      const pageParam = url.searchParams.get('page') || '1';
      page_num = parseInt(pageParam);

      const mockData = Array.from({ length: 10 }, (_, i) => ({
        id: (page_num - 1) * 10 + i + 1,
        name: `英雄${(page_num - 1) * 10 + i + 1}`,
        level: 20 + i,
        rarity: 'common',
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockData,
          hasMore: page_num < 3,
        }),
      });
    });

    await page.goto('/heroes');

    // 滚动到底部触发加载更多
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // 等待新数据加载
    await page.waitForTimeout(1000);

    // 检查是否加载了更多英雄
    const heroCards = page.locator('[data-testid="hero-card"]');
    await expect(heroCards).toHaveCount.greaterThan(10);
  });
});
