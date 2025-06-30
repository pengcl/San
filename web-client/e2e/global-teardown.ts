import { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global E2E test teardown...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 清理测试数据
    await page.goto('http://localhost:3000');

    await page.evaluate(() => {
      // 清理本地存储
      localStorage.clear();
      sessionStorage.clear();

      // 清理IndexedDB（如果使用）
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('test-db');
      }

      // 取消注册Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }
    });

    console.log('✅ Test data cleanup completed');

    // 生成测试报告摘要
    await generateTestSummary();

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  } finally {
    await browser.close();
  }
}

async function generateTestSummary() {
  console.log('📊 Generating test summary...');

  try {
    // 这里可以添加测试结果统计逻辑
    // 例如：读取测试结果文件，生成摘要报告

    const summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      browser: 'chromium',
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    };

    console.log('📈 Test Summary:', summary);
  } catch (error) {
    console.warn('⚠️ Failed to generate test summary:', error);
  }
}

export default globalTeardown;
