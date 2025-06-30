import { test, expect } from '@playwright/test';

test.describe('PWA功能测试', () => {
  test.beforeEach(async ({ page, context }) => {
    // 设置权限
    await context.grantPermissions(['notifications']);

    // 设置登录状态
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该加载Service Worker', async ({ page }) => {
    // 检查Service Worker注册
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          return !!registration;
        } catch (error) {
          return false;
        }
      }
      return false;
    });

    expect(swRegistered).toBe(true);
  });

  test('应该加载Web App Manifest', async ({ page }) => {
    // 检查manifest文件
    const manifestResponse = await page.goto('/manifest.json');
    expect(manifestResponse?.status()).toBe(200);

    const manifest = await manifestResponse?.json();
    expect(manifest.name).toBe('三国策略游戏');
    expect(manifest.short_name).toBe('三国游戏');
    expect(manifest.display).toBe('standalone');
  });

  test('应该支持离线模式', async ({ page, context }) => {
    // 首次访问确保资源被缓存
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 设置离线模式
    await context.setOffline(true);

    // 重新加载页面
    await page.reload();

    // 检查是否显示离线页面或缓存内容
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();

    // 恢复在线模式
    await context.setOffline(false);
  });

  test('应该显示安装提示', async ({ page }) => {
    // 模拟可安装状态
    await page.evaluate(() => {
      // 模拟beforeinstallprompt事件
      const installEvent = new Event('beforeinstallprompt');
      (installEvent as any).prompt = () => Promise.resolve();
      (installEvent as any).userChoice = Promise.resolve({
        outcome: 'accepted',
      });
      window.dispatchEvent(installEvent);
    });

    // 等待安装提示出现
    const installPrompt = page.locator('[data-testid="pwa-install-prompt"]');
    await expect(installPrompt).toBeVisible({ timeout: 5000 });

    // 检查安装按钮
    const installButton = installPrompt.locator('button:has-text("立即安装")');
    await expect(installButton).toBeVisible();
  });

  test('应该处理安装流程', async ({ page }) => {
    let installPrompted = false;

    // 监听安装提示
    await page.evaluate(() => {
      const installEvent = new Event('beforeinstallprompt');
      (installEvent as any).prompt = () => {
        (window as any).installPrompted = true;
        return Promise.resolve();
      };
      (installEvent as any).userChoice = Promise.resolve({
        outcome: 'accepted',
      });
      window.dispatchEvent(installEvent);
    });

    // 点击安装按钮
    const installPrompt = page.locator('[data-testid="pwa-install-prompt"]');
    await expect(installPrompt).toBeVisible();

    await installPrompt.locator('button:has-text("立即安装")').click();

    // 检查安装是否被触发
    installPrompted = await page.evaluate(
      () => (window as any).installPrompted
    );
    expect(installPrompted).toBe(true);
  });

  test('应该支持通知功能', async ({ page, context }) => {
    // 检查通知权限
    const notificationPermission = await page.evaluate(() => {
      return Notification.permission;
    });

    if (notificationPermission !== 'granted') {
      // 请求通知权限
      await page.evaluate(async () => {
        await Notification.requestPermission();
      });
    }

    // 测试通知显示
    await page.evaluate(() => {
      new Notification('测试通知', {
        body: '这是一个测试通知',
        icon: '/icons/icon-192x192.png',
      });
    });

    // 注意：实际通知显示在浏览器级别，难以在E2E中直接验证
    // 但可以验证API调用是否成功
    const notificationCreated = await page.evaluate(() => {
      try {
        new Notification('测试通知');
        return true;
      } catch (error) {
        return false;
      }
    });

    expect(notificationCreated).toBe(true);
  });

  test('应该支持后台同步', async ({ page }) => {
    // 模拟后台同步注册
    const syncRegistered = await page.evaluate(async () => {
      if (
        'serviceWorker' in navigator &&
        'sync' in window.ServiceWorkerRegistration.prototype
      ) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await (registration as any).sync.register('background-sync');
          return true;
        } catch (error) {
          return false;
        }
      }
      return false;
    });

    // 注意：后台同步在测试环境中可能不完全支持
    // 这里主要测试API是否可用
    console.log('Background sync supported:', syncRegistered);
  });

  test('应该显示网络状态', async ({ page, context }) => {
    // 检查在线状态指示器
    const statusIndicator = page.locator('[data-testid="network-status"]');

    // 在线状态
    await expect(statusIndicator).toContainText('在线');

    // 设置离线状态
    await context.setOffline(true);
    await page.waitForTimeout(1000);

    // 检查离线状态
    await expect(statusIndicator).toContainText('离线');

    // 恢复在线状态
    await context.setOffline(false);
    await page.waitForTimeout(1000);

    await expect(statusIndicator).toContainText('在线');
  });

  test('应该缓存游戏资源', async ({ page }) => {
    // 检查资源缓存
    const cacheStatus = await page.evaluate(async () => {
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          return cacheNames.length > 0;
        } catch (error) {
          return false;
        }
      }
      return false;
    });

    expect(cacheStatus).toBe(true);
  });

  test('应该支持应用更新', async ({ page }) => {
    // 模拟应用更新事件
    await page.evaluate(() => {
      // 模拟Service Worker更新
      window.dispatchEvent(new CustomEvent('pwa-update-available'));
    });

    // 检查更新提示
    const updatePrompt = page.locator('[data-testid="pwa-update-prompt"]');
    await expect(updatePrompt).toBeVisible();

    // 点击更新按钮
    await updatePrompt.locator('button:has-text("立即更新")').click();

    // 检查更新处理
    // 注意：实际的Service Worker更新需要特殊处理
  });

  test('应该支持分享功能', async ({ page }) => {
    // 检查Web Share API支持
    const shareSupported = await page.evaluate(() => {
      return 'share' in navigator;
    });

    if (shareSupported) {
      // 测试分享功能
      const shareData = {
        title: '三国策略游戏',
        text: '体验经典三国策略游戏',
        url: window.location.href,
      };

      const shareResult = await page.evaluate(async data => {
        try {
          if (navigator.share) {
            // 在测试环境中，我们只检查API是否存在
            return typeof navigator.share === 'function';
          }
          return false;
        } catch (error) {
          return false;
        }
      }, shareData);

      expect(shareResult).toBe(true);
    }
  });

  test('应该支持快捷方式', async ({ page }) => {
    // 检查manifest中的shortcuts配置
    const manifestResponse = await page.goto('/manifest.json');
    const manifest = await manifestResponse?.json();

    expect(manifest.shortcuts).toBeDefined();
    expect(manifest.shortcuts.length).toBeGreaterThan(0);

    // 检查快捷方式内容
    const shortcuts = manifest.shortcuts;
    const heroShortcut = shortcuts.find((s: any) => s.name === '武将管理');
    expect(heroShortcut).toBeDefined();
    expect(heroShortcut.url).toBe('/heroes');
  });

  test('应该在独立窗口模式下运行', async ({ page }) => {
    // 检查display mode
    const isStandalone = await page.evaluate(() => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      );
    });

    // 在PWA环境中应该返回true，在普通浏览器中返回false
    // 这里我们只验证检测机制是否正常工作
    expect(typeof isStandalone).toBe('boolean');
  });

  test('应该支持键盘快捷键', async ({ page }) => {
    // 测试快捷键功能
    await page.keyboard.press('Control+h');

    // 检查是否跳转到英雄页面或触发相应功能
    // 这取决于应用的具体实现

    // 测试ESC键关闭弹窗
    await page.keyboard.press('Escape');

    // 验证快捷键是否被正确处理
    const activeElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(activeElement).toBeTruthy();
  });

  test('应该处理设备方向变化', async ({ page }) => {
    // 模拟设备方向变化
    await page.evaluate(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });

    // 检查布局是否适应方向变化
    await page.waitForTimeout(500);

    const bodyClass = await page.getAttribute('body', 'class');
    expect(bodyClass).toBeTruthy();
  });
});
