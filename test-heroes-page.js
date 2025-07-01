// 测试武将列表页面功能
const puppeteer = require('puppeteer');

async function testHeroesPage() {
  console.log('🧪 开始测试武将列表页面功能...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 375, height: 812 } // iPhone X 尺寸
  });
  
  try {
    const page = await browser.newPage();
    
    // 1. 访问登录页面并登录
    console.log('📱 访问登录页面...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    
    // 输入测试账号
    await page.type('input[name="username"]', 'pengcl');
    await page.type('input[name="password"]', 'zouleyuan');
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    console.log('✅ 登录完成');
    
    // 等待跳转到主页
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // 2. 访问武将列表页面
    console.log('🏮 访问武将列表页面...');
    await page.goto('http://localhost:3000/heroes');
    await page.waitForSelector('[data-testid="hero-card"], .hero-card, .MuiCard-root', { timeout: 10000 });
    
    // 3. 检查武将卡片是否正确显示
    console.log('🔍 检查武将卡片显示...');
    const heroCards = await page.$$('.MuiCard-root');
    console.log(`找到 ${heroCards.length} 个武将卡片`);
    
    // 4. 测试品质筛选功能
    console.log('⭐ 测试品质筛选功能...');
    
    // 点击品质筛选下拉框
    const qualitySelect = await page.$('#qualityFilter, [data-testid="quality-filter"]');
    if (qualitySelect) {
      await qualitySelect.click();
      await page.waitForTimeout(500);
      
      // 选择5星品质
      const fiveStarOption = await page.$('li[data-value="5"]');
      if (fiveStarOption) {
        await fiveStarOption.click();
        await page.waitForTimeout(1000);
        
        const filteredCards = await page.$$('.MuiCard-root');
        console.log(`筛选5星后显示 ${filteredCards.length} 个武将`);
      }
    }
    
    // 5. 测试搜索功能
    console.log('🔍 测试搜索功能...');
    const searchInput = await page.$('input[placeholder*="搜索"], input[placeholder*="武将"]');
    if (searchInput) {
      await searchInput.click();
      await searchInput.type('刘备');
      await page.waitForTimeout(1000);
      
      const searchResults = await page.$$('.MuiCard-root');
      console.log(`搜索"刘备"后显示 ${searchResults.length} 个武将`);
    }
    
    // 6. 检查品质颜色显示
    console.log('🌈 检查品质颜色显示...');
    const qualityBadges = await page.$$eval('.quality-badge, [class*="quality"], [class*="rarity"]', 
      badges => badges.map(badge => ({
        text: badge.textContent,
        color: window.getComputedStyle(badge).backgroundColor
      }))
    );
    
    console.log('品质标签颜色:', qualityBadges);
    
    // 7. 测试武将卡片点击
    console.log('👆 测试武将卡片点击...');
    const firstCard = heroCards[0];
    if (firstCard) {
      await firstCard.click();
      await page.waitForTimeout(2000);
      
      // 检查是否跳转到详情页
      const currentUrl = page.url();
      console.log('点击后跳转到:', currentUrl);
    }
    
    console.log('✅ 武将列表页面测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

// 检查依赖
async function checkDependencies() {
  try {
    await require('puppeteer');
    console.log('✅ Puppeteer 已安装');
    return true;
  } catch (error) {
    console.log('❌ 需要安装 Puppeteer: npm install puppeteer');
    return false;
  }
}

// 运行测试
async function run() {
  if (await checkDependencies()) {
    await testHeroesPage();
  } else {
    console.log('💡 替代方案：手动测试以下功能：');
    console.log('1. 访问 http://localhost:3000/heroes');
    console.log('2. 检查武将卡片是否显示正确的品质颜色');
    console.log('3. 测试品质筛选功能');
    console.log('4. 测试搜索功能');
    console.log('5. 测试武将卡片点击跳转');
  }
}

run();