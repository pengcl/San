const strapi = require('@strapi/strapi');

(async () => {
  try {
    const app = await strapi().load();
    
    console.log('=== 检查品质数据 ===');
    const qualities = await app.db.query('api::quality.quality').findMany();
    console.log(`品质数据总数: ${qualities.length}`);
    if (qualities.length > 0) {
      console.log('品质列表:');
      qualities.forEach(q => {
        console.log(`  - ${q.quality_id}: ${q.name_zh} (${q.name_en}) - ${q.color_hex}`);
      });
    }
    
    console.log('\n=== 检查武将数据关联 ===');
    const heroesWithRelations = await app.db.query('api::hero.hero').findMany({
      limit: 5,
      populate: ['quality', 'faction', 'unit_type']
    });
    
    console.log(`获取到 ${heroesWithRelations.length} 个武将数据`);
    heroesWithRelations.forEach(hero => {
      console.log(`\n武将: ${hero.name} (ID: ${hero.hero_id})`);
      console.log(`  - 品质: ${hero.quality ? `${hero.quality.name_zh} (${hero.quality.quality_id})` : '未关联'}`);
      console.log(`  - 阵营: ${hero.faction ? `${hero.faction.name_zh} (${hero.faction.faction_id})` : '未关联'}`);
      console.log(`  - 兵种: ${hero.unit_type ? `${hero.unit_type.name_zh} (${hero.unit_type.type_id})` : '未关联'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
})();