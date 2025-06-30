import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global E2E test setup...');

  // 创建浏览器实例用于初始化
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 检查开发服务器是否运行
    console.log('⏳ Checking development server...');
    await page.goto('http://localhost:3000', { timeout: 30000 });
    console.log('✅ Development server is running');

    // 初始化测试数据
    await setupTestData(page);

    // 检查PWA功能
    await checkPWACapabilities(page);

    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page: any) {
  console.log('📊 Setting up test data...');

  // 清理本地存储
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // 设置测试用户数据
  await page.evaluate(() => {
    const testUser = {
      id: 'test-user-1',
      username: 'testuser',
      email: 'test@example.com',
      level: 10,
      gold: 5000,
      gems: 250,
    };

    const testHeroes = [
      {
        id: 1,
        name: '关羽',
        level: 30,
        rarity: 'legendary',
        faction: '蜀',
      },
      {
        id: 2,
        name: '诸葛亮',
        level: 25,
        rarity: 'legendary',
        faction: '蜀',
      },
    ];

    localStorage.setItem('auth_user', JSON.stringify(testUser));
    localStorage.setItem('auth_token', 'test-token-12345');
    localStorage.setItem('game_heroes', JSON.stringify(testHeroes));
    localStorage.setItem('test_mode', 'true');
  });

  console.log('✅ Test data setup completed');
}

async function checkPWACapabilities(page: any) {
  console.log('📱 Checking PWA capabilities...');

  try {
    // 检查Service Worker支持
    const swSupported = await page.evaluate(() => 'serviceWorker' in navigator);
    console.log(`Service Worker supported: ${swSupported ? '✅' : '❌'}`);

    // 检查Notification API
    const notificationSupported = await page.evaluate(
      () => 'Notification' in window
    );
    console.log(
      `Notifications supported: ${notificationSupported ? '✅' : '❌'}`
    );

    // 检查Manifest文件
    try {
      const manifestResponse = await page.goto(
        'http://localhost:3000/manifest.json'
      );
      const manifestValid = manifestResponse?.status() === 200;
      console.log(`Manifest file: ${manifestValid ? '✅' : '❌'}`);
    } catch (error) {
      console.log('Manifest file: ❌');
    }
  } catch (error) {
    console.warn('⚠️ PWA capability check failed:', error);
  }
}

export default globalSetup;
