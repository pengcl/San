import { test, expect } from '@playwright/test';

test.describe('用户登录功能', () => {
  test.beforeEach(async ({ page }) => {
    // 清理认证状态
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示登录页面', async ({ page }) => {
    await expect(page).toHaveTitle(/三国/);
    await expect(page.locator('h1')).toContainText('登录');

    // 检查表单元素
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('应该验证必填字段', async ({ page }) => {
    // 尝试提交空表单
    await page.click('button[type="submit"]');

    // 检查验证错误
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('应该验证邮箱格式', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 检查邮箱格式错误
    await expect(page.locator('.error-message')).toContainText('邮箱格式');
  });

  test('应该成功登录', async ({ page }) => {
    // 模拟API响应
    await page.route('/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
            },
            token: 'mock-jwt-token',
          },
        }),
      });
    });

    // 填写登录表单
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 等待重定向到主页
    await page.waitForURL('/home');
    await expect(page).toHaveURL('/home');
  });

  test('应该处理登录失败', async ({ page }) => {
    // 模拟登录失败
    await page.route('/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: '用户名或密码错误',
        }),
      });
    });

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // 检查错误消息
    await expect(page.locator('.error-message')).toContainText(
      '用户名或密码错误'
    );
    await expect(page).toHaveURL('/login'); // 应该停留在登录页
  });

  test('应该显示加载状态', async ({ page }) => {
    // 模拟慢速响应
    await page.route('/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // 点击提交并检查加载状态
    await page.click('button[type="submit"]');
    await expect(page.locator('.loading-spinner')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('应该支持回车键提交', async ({ page }) => {
    await page.route('/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // 按回车键
    await page.press('input[type="password"]', 'Enter');

    // 验证表单提交
    await page.waitForRequest('/api/auth/login');
  });

  test('应该记住登录状态', async ({ page }) => {
    // 设置已登录状态
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'existing-token');
      localStorage.setItem(
        'auth_user',
        JSON.stringify({
          id: '1',
          username: 'testuser',
        })
      );
    });

    // 访问登录页面应该重定向到主页
    await page.goto('/login');
    await page.waitForURL('/home');
    await expect(page).toHaveURL('/home');
  });

  test('应该处理网络错误', async ({ page }) => {
    // 模拟网络错误
    await page.route('/api/auth/login', async route => {
      await route.abort('failed');
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 检查网络错误提示
    await expect(page.locator('.error-message')).toContainText('网络错误');
  });

  test('密码可见性切换', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('.password-toggle');

    await page.fill('input[type="password"]', 'password123');

    // 初始状态应该是隐藏的
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // 点击切换按钮
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // 再次点击恢复隐藏
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
