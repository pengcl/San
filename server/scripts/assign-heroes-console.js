// 使用此脚本在 Strapi console 中执行
// 运行命令：npm run strapi console
// 然后复制粘贴以下代码

async function assignInitialHeroes() {
  try {
    console.log('开始为测试账号分配初始武将...');
    
    // 查找用户ID为1的用户
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: 1 }
    });
    
    if (!user) {
      console.error('未找到ID为1的用户');
      return;
    }
    
    console.log(`找到用户: ${user.username} (ID: ${user.id})`);
    
    // 定义要分配的武将
    const heroesToAssign = [
      { hero_id: 1001, level: 10, star: 2, name: '刘备' },
      { hero_id: 1003, level: 8, star: 2, name: '关羽' },
      { hero_id: 1004, level: 5, star: 1, name: '张飞' }
    ];
    
    // 检查并创建武将
    for (const heroData of heroesToAssign) {
      // 查找对应的武将模板
      const hero = await strapi.db.query('api::hero.hero').findOne({
        where: { hero_id: heroData.hero_id }
      });
      
      if (!hero) {
        console.error(`未找到武将模板: ${heroData.name} (hero_id: ${heroData.hero_id})`);
        continue;
      }
      
      // 检查是否已经拥有该武将
      const existingUserHero = await strapi.db.query('api::user-hero.user-hero').findOne({
        where: {
          user: user.id,
          hero: hero.id
        }
      });
      
      if (existingUserHero) {
        console.log(`用户已拥有武将: ${heroData.name}，跳过创建`);
        continue;
      }
      
      // 计算武将战力
      const basePower = hero.base_hp + hero.base_attack * 2 + hero.base_defense * 1.5 + hero.base_speed;
      const levelMultiplier = 1 + (heroData.level - 1) * 0.1;
      const starMultiplier = 1 + (heroData.star - 1) * 0.2;
      const power = Math.floor(basePower * levelMultiplier * starMultiplier);
      
      // 创建用户武将
      const userHero = await strapi.db.query('api::user-hero.user-hero').create({
        data: {
          user: user.id,
          hero: hero.id,
          level: heroData.level,
          star: heroData.star,
          exp: 0,
          breakthrough: 0,
          skill_points: 0,
          skill_tree: {},
          power: power,
          is_favorite: false,
          position: 0,
          publishedAt: new Date()
        }
      });
      
      console.log(`成功创建武将: ${heroData.name} (等级: ${heroData.level}, 星级: ${heroData.star}, 战力: ${power})`);
    }
    
    // 查询并显示用户当前拥有的所有武将
    const userHeroes = await strapi.db.query('api::user-hero.user-hero').findMany({
      where: { user: user.id },
      populate: { hero: true }
    });
    
    console.log('\n用户当前拥有的武将:');
    userHeroes.forEach((uh, index) => {
      console.log(`${index + 1}. ${uh.hero.name} - 等级: ${uh.level}, 星级: ${uh.star}, 战力: ${uh.power}`);
    });
    
    console.log('\n初始武将分配完成！');
    
  } catch (error) {
    console.error('错误:', error);
  }
}

// 执行函数
assignInitialHeroes();