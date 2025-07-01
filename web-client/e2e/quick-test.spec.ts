import { test, expect } from '@playwright/test';

test('快速前端验证', async ({ page }) => {
  // 访问首页
  await page.goto('http://localhost:3000');
  
  // 等待页面完全加载
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // 打印页面标题
  const title = await page.title();
  console.log('页面标题:', title);
  
  // 打印页面URL
  console.log('当前URL:', page.url());
  
  // 获取页面内容
  const bodyText = await page.locator('body').textContent();
  console.log('页面内容片段:', bodyText?.substring(0, 200));
  
  // 查找任何包含"三国"的文本
  const threeKingdomsText = page.locator(':has-text("三国")');
  if (await threeKingdomsText.count() > 0) {
    console.log('找到三国相关文本:', await threeKingdomsText.first().textContent());
  }
  
  // 查找任何按钮
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log('页面上的按钮数量:', buttonCount);
  
  if (buttonCount > 0) {
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const buttonText = await buttons.nth(i).textContent();
      console.log(`按钮 ${i + 1}:`, buttonText);
    }
  }
  
  // 基本断言
  expect(title).toContain('三国');
});