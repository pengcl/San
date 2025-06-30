import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试目录
  testDir: './e2e',

  // 超时配置
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  // 全局设置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 报告器
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // 输出目录
  outputDir: 'test-results/',

  // 全局配置
  use: {
    // 基础URL
    baseURL: 'http://localhost:3000',

    // 追踪配置
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 浏览器配置
    actionTimeout: 0,
    navigationTimeout: 30000,

    // 移动端测试
    isMobile: false,
    hasTouch: false,

    // 语言设置
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  },

  // 项目配置
  projects: [
    // 桌面浏览器测试
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 移动端测试
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // 平板测试
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },

    // PWA测试
    {
      name: 'PWA Desktop',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          viewport: { width: 1280, height: 720 },
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      },
    },

    // 特定功能测试
    {
      name: 'Game Features',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: '**/game/**/*.spec.ts',
    },
  ],

  // Web服务器配置
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // 全局设置和清理
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),
});
