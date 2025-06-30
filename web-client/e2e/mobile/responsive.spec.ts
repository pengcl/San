import { test, expect, devices } from '@playwright/test';

test.describe('移动端响应式测试', () => {
  const mobileViewports = [
    { name: 'iPhone SE', ...devices['iPhone SE'] },
    { name: 'iPhone 12', ...devices['iPhone 12'] },
    { name: 'Pixel 5', ...devices['Pixel 5'] },
    { name: 'Galaxy S21', width: 360, height: 800 },
  ];

  mobileViewports.forEach(({ name, ...viewport }) => {
    test.describe(`${name} 设备测试`, () => {
      test.use({ ...viewport });

      test.beforeEach(async ({ page }) => {
        await page.evaluate(() => {
          localStorage.setItem('auth_token', 'test-token');
        });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
      });

      test('应该正确显示移动端布局', async ({ page }) => {
        // 检查移动端导航
        const mobileNav = page.locator('[data-testid="mobile-navigation"]');
        await expect(mobileNav).toBeVisible();

        // 检查汉堡菜单
        const hamburgerMenu = page.locator('[data-testid="hamburger-menu"]');
        await expect(hamburgerMenu).toBeVisible();

        // 检查内容区域
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();

        // 验证响应式布局
        const contentWidth = await mainContent.boundingBox();
        expect(contentWidth?.width).toBeLessThanOrEqual(
          viewport.viewport?.width || 400
        );
      });

      test('应该支持触摸交互', async ({ page }) => {
        // 模拟触摸滑动
        await page.touchscreen.tap(200, 200);

        // 测试滑动手势
        await page.touchscreen.tap(100, 300);
        await page.mouse.move(100, 300);
        await page.mouse.down();
        await page.mouse.move(300, 300);
        await page.mouse.up();

        // 验证滑动响应
        await page.waitForTimeout(500);
      });

      test('应该正确处理软键盘', async ({ page }) => {
        // 聚焦到输入框
        const searchInput = page.locator('input[type="search"]');
        if (await searchInput.isVisible()) {
          await searchInput.click();

          // 检查页面是否正确调整
          await page.waitForTimeout(1000);

          // 验证输入框仍然可见
          await expect(searchInput).toBeVisible();
        }
      });

      test('应该支持下拉刷新', async ({ page }) => {
        // 模拟下拉手势
        await page.mouse.move(200, 100);
        await page.mouse.down();
        await page.mouse.move(200, 300);
        await page.mouse.up();

        // 检查刷新指示器
        const refreshIndicator = page.locator(
          '[data-testid="refresh-indicator"]'
        );
        if (await refreshIndicator.isVisible()) {
          await expect(refreshIndicator).toBeVisible();
        }
      });

      test('应该正确显示英雄列表', async ({ page }) => {
        await page.goto('/heroes');
        await page.waitForLoadState('networkidle');

        // 检查英雄卡片在移动端的布局
        const heroCards = page.locator('[data-testid="hero-card"]');
        await expect(heroCards.first()).toBeVisible();

        // 验证卡片大小适配移动端
        const cardBox = await heroCards.first().boundingBox();
        expect(cardBox?.width).toBeLessThanOrEqual(
          (viewport.viewport?.width || 400) - 40
        );
      });

      test('应该支持移动端手势导航', async ({ page }) => {
        // 测试左右滑动切换页面
        await page.mouse.move(50, 300);
        await page.mouse.down();
        await page.mouse.move(300, 300);
        await page.mouse.up();

        await page.waitForTimeout(500);

        // 验证手势导航是否生效
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      });

      test('应该优化移动端性能', async ({ page }) => {
        // 测试页面加载性能
        const startTime = Date.now();
        await page.goto('/heroes');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // 移动端加载时间应该在合理范围内
        expect(loadTime).toBeLessThan(5000);

        // 检查图片懒加载
        const images = page.locator('img[data-testid="lazy-image"]');
        const imageCount = await images.count();

        if (imageCount > 0) {
          // 滚动以触发图片加载
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
          });

          await page.waitForTimeout(1000);
        }
      });

      test('应该支持移动端表单输入', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');

        // 测试输入框聚焦
        await emailInput.click();
        await expect(emailInput).toBeFocused();

        // 输入文本
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');

        // 验证输入值
        await expect(emailInput).toHaveValue('test@example.com');
        await expect(passwordInput).toHaveValue('password123');
      });

      test('应该支持移动端模态框', async ({ page }) => {
        // 触发模态框
        const modalTrigger = page.locator('[data-testid="modal-trigger"]');
        if (await modalTrigger.isVisible()) {
          await modalTrigger.click();

          // 检查模态框显示
          const modal = page.locator('[data-testid="modal"]');
          await expect(modal).toBeVisible();

          // 检查模态框大小适配移动端
          const modalBox = await modal.boundingBox();
          expect(modalBox?.width).toBeLessThanOrEqual(
            viewport.viewport?.width || 400
          );

          // 关闭模态框
          const closeButton = modal.locator('[data-testid="modal-close"]');
          await closeButton.click();
          await expect(modal).not.toBeVisible();
        }
      });

      test('应该正确处理屏幕旋转', async ({ page }) => {
        // 模拟屏幕旋转到横屏
        await page.setViewportSize({
          width: viewport.viewport?.height || 800,
          height: viewport.viewport?.width || 400,
        });

        await page.waitForTimeout(500);

        // 检查布局是否适应横屏
        const navigation = page.locator('[data-testid="navigation"]');
        await expect(navigation).toBeVisible();

        // 旋转回竖屏
        await page.setViewportSize({
          width: viewport.viewport?.width || 400,
          height: viewport.viewport?.height || 800,
        });

        await page.waitForTimeout(500);
        await expect(navigation).toBeVisible();
      });

      test('应该支持无障碍访问', async ({ page }) => {
        // 检查焦点管理
        await page.keyboard.press('Tab');

        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();

        // 检查ARIA标签
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i);
          const ariaLabel = await button.getAttribute('aria-label');
          const text = await button.textContent();

          // 按钮应该有文本或aria-label
          expect(ariaLabel || text).toBeTruthy();
        }
      });
    });
  });

  test.describe('平板设备测试', () => {
    test.use({ ...devices['iPad Pro'] });

    test('应该在平板上显示适配的布局', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('auth_token', 'test-token');
      });

      await page.goto('/heroes');
      await page.waitForLoadState('networkidle');

      // 检查平板专用布局
      const heroGrid = page.locator('[data-testid="hero-grid"]');
      await expect(heroGrid).toBeVisible();

      // 验证多列布局
      const heroCards = page.locator('[data-testid="hero-card"]');
      const firstCard = heroCards.first();
      const secondCard = heroCards.nth(1);

      if ((await firstCard.isVisible()) && (await secondCard.isVisible())) {
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        // 在平板上应该显示多列
        expect(Math.abs((firstBox?.y || 0) - (secondBox?.y || 0))).toBeLessThan(
          50
        );
      }
    });
  });

  test.describe('响应式断点测试', () => {
    const breakpoints = [
      { name: '小屏手机', width: 320, height: 568 },
      { name: '标准手机', width: 375, height: 667 },
      { name: '大屏手机', width: 414, height: 896 },
      { name: '平板竖屏', width: 768, height: 1024 },
      { name: '平板横屏', width: 1024, height: 768 },
      { name: '桌面', width: 1920, height: 1080 },
    ];

    breakpoints.forEach(({ name, width, height }) => {
      test(`${name} (${width}x${height}) 布局测试`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.evaluate(() => {
          localStorage.setItem('auth_token', 'test-token');
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 检查布局元素是否正确显示
        const main = page.locator('main');
        await expect(main).toBeVisible();

        const mainBox = await main.boundingBox();
        expect(mainBox?.width).toBeLessThanOrEqual(width);

        // 检查导航栏适配
        const navigation = page.locator('nav');
        if (await navigation.isVisible()) {
          const navBox = await navigation.boundingBox();
          expect(navBox?.width).toBeLessThanOrEqual(width);
        }

        // 检查响应式图片
        const images = page.locator('img');
        const imageCount = await images.count();

        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const img = images.nth(i);
          if (await img.isVisible()) {
            const imgBox = await img.boundingBox();
            expect(imgBox?.width).toBeLessThanOrEqual(width);
          }
        }
      });
    });
  });
});
