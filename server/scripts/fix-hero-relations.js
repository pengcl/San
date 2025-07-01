const strapi = require('@strapi/strapi');

// 武将与各系统的关联数据
const heroRelationshipData = {
  // 品质分配 - 基于战力和历史地位
  qualities: {
    // 神话级 (6星) - 顶级历史人物
    6: [1002, 2001, 4004], // 诸葛亮、曹操、吕布
    
    // 传说级 (5星) - 一流名将
    5: [1001, 1003, 1005, 2002, 2003, 3001, 3003, 4001], // 刘备、关羽、赵云、司马懿、张辽、孙策、周瑜、董卓
    
    // 史诗级 (4星) - 知名武将
    4: [1004, 1006, 1007, 1008, 1009, 2004, 2005, 2006, 2007, 3002, 3004, 3005, 3006, 4002, 4003, 4005, 4006, 4007, 4008, 4009, 4010], 
    // 张飞、马超、黄忠、魏延、姜维、夏侯惇、许褚、典韦、郭嘉、孙权、太史慈、甘宁、陆逊、袁绍、袁术、张角、于吉、左慈、南华老仙、华佗、貂蝉
    
    // 精良级 (3星) - 二线武将
    3: [1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 2008, 2009, 2010, 2011, 2012, 3007, 3008, 3009, 3010, 3011],
    // 徐庶、庞统、法正、刘备麾下其他将领、曹营二线将领、吴国二线将领
    
    // 优秀级 (2星) - 普通武将
    2: [1019, 1020, 2013, 2014, 2015, 3012, 3013, 3014],
    
    // 普通级 (1星) - 基础武将
    1: []
  },

  // 阵营分配
  factions: {
    'shu': [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020], // 1001-1020 蜀汉
    'wei': [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015], // 2001-2015 魏国
    'wu': [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014], // 3001-3014 吴国
    'other': [4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010] // 4001-4010 群雄
  },

  // 兵种分配 - 基于历史记录和武将特点
  unitTypes: {
    'infantry': [1001, 1004, 2004, 2005, 2006, 3004, 3005, 4001, 4004], // 步兵 - 重甲武将
    'cavalry': [1005, 1006, 2003, 2007, 3001, 4002], // 骑兵 - 高机动武将  
    'archer': [1007, 2008, 3006, 4003], // 弓兵 - 远程武将
    'strategist': [1002, 1010, 1011, 2002, 2009, 3003, 4005, 4006, 4007], // 军师 - 智谋武将
    'guardian': [1003, 2001, 3002, 4008], // 守护 - 防御武将
    'assassin': [1008, 2010, 3007, 4009], // 刺客 - 敏捷武将
    'healer': [4010], // 医者 - 华佗
    'mystic': [4005, 4006, 4007] // 术士 - 张角、于吉、左慈等
  }
};

async function fixHeroRelations() {
  console.log('🔧 开始修复武将关联关系...');

  try {
    const app = await strapi().load();
    
    // 1. 确保基础数据存在
    await ensureBasicData(app);
    
    // 2. 修复武将关联
    await updateHeroRelations(app);
    
    console.log('✅ 武将关联关系修复完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

async function ensureBasicData(app) {
  console.log('📊 检查基础数据...');

  // 确保品质数据存在
  const qualities = await app.db.query('api::quality.quality').findMany();
  if (qualities.length === 0) {
    console.log('⚠️  品质数据不存在，创建基础品质数据...');
    const qualityData = [
      { quality_id: 1, name_zh: '普通', name_en: 'Common', color_hex: '#808080', star_count: 1, rarity_weight: 0.60 },
      { quality_id: 2, name_zh: '优秀', name_en: 'Good', color_hex: '#00FF00', star_count: 2, rarity_weight: 0.30 },
      { quality_id: 3, name_zh: '精良', name_en: 'Rare', color_hex: '#0080FF', star_count: 3, rarity_weight: 0.09 },
      { quality_id: 4, name_zh: '史诗', name_en: 'Epic', color_hex: '#8000FF', star_count: 4, rarity_weight: 0.01 },
      { quality_id: 5, name_zh: '传说', name_en: 'Legendary', color_hex: '#FF8000', star_count: 5, rarity_weight: 0.001 },
      { quality_id: 6, name_zh: '神话', name_en: 'Mythic', color_hex: '#FF0000', star_count: 6, rarity_weight: 0.0001 }
    ];
    
    for (const quality of qualityData) {
      await app.db.query('api::quality.quality').create({ data: quality });
    }
  }

  // 确保阵营数据存在
  const factions = await app.db.query('api::faction.faction').findMany();
  if (factions.length === 0) {
    console.log('⚠️  阵营数据不存在，创建基础阵营数据...');
    const factionData = [
      { faction_id: 'shu', name_zh: '蜀', name_en: 'Shu', color_hex: '#FF4444', banner_color: '#CC0000' },
      { faction_id: 'wei', name_zh: '魏', name_en: 'Wei', color_hex: '#4444FF', banner_color: '#0000CC' },
      { faction_id: 'wu', name_zh: '吴', name_en: 'Wu', color_hex: '#44FF44', banner_color: '#00CC00' },
      { faction_id: 'other', name_zh: '群雄', name_en: 'Other', color_hex: '#FFFF44', banner_color: '#CCCC00' }
    ];
    
    for (const faction of factionData) {
      await app.db.query('api::faction.faction').create({ data: faction });
    }
  }

  // 确保兵种数据存在
  const unitTypes = await app.db.query('api::unit-type.unit-type').findMany();
  if (unitTypes.length === 0) {
    console.log('⚠️  兵种数据不存在，创建基础兵种数据...');
    const unitTypeData = [
      { type_id: 'infantry', name_zh: '步兵', name_en: 'Infantry', color_hex: '#8B4513', movement_type: 'land', range_type: 'melee' },
      { type_id: 'cavalry', name_zh: '骑兵', name_en: 'Cavalry', color_hex: '#DAA520', movement_type: 'land', range_type: 'melee' },
      { type_id: 'archer', name_zh: '弓兵', name_en: 'Archer', color_hex: '#228B22', movement_type: 'land', range_type: 'ranged' },
      { type_id: 'strategist', name_zh: '军师', name_en: 'Strategist', color_hex: '#4169E1', movement_type: 'land', range_type: 'ranged' },
      { type_id: 'guardian', name_zh: '守护', name_en: 'Guardian', color_hex: '#708090', movement_type: 'land', range_type: 'melee' },
      { type_id: 'assassin', name_zh: '刺客', name_en: 'Assassin', color_hex: '#2F4F4F', movement_type: 'land', range_type: 'melee' },
      { type_id: 'healer', name_zh: '医者', name_en: 'Healer', color_hex: '#98FB98', movement_type: 'land', range_type: 'ranged' },
      { type_id: 'mystic', name_zh: '术士', name_en: 'Mystic', color_hex: '#9370DB', movement_type: 'land', range_type: 'ranged' }
    ];
    
    for (const unitType of unitTypeData) {
      await app.db.query('api::unit-type.unit-type').create({ data: unitType });
    }
  }

  console.log('✅ 基础数据检查完成');
}

async function updateHeroRelations(app) {
  console.log('🔗 更新武将关联关系...');

  // 获取所有武将
  const heroes = await app.db.query('api::hero.hero').findMany();
  console.log(`📋 找到 ${heroes.length} 个武将`);

  // 获取关联数据
  const qualities = await app.db.query('api::quality.quality').findMany();
  const factions = await app.db.query('api::faction.faction').findMany();
  const unitTypes = await app.db.query('api::unit-type.unit-type').findMany();

  // 创建ID映射
  const qualityMap = new Map(qualities.map(q => [q.quality_id, q.id]));
  const factionMap = new Map(factions.map(f => [f.faction_id, f.id]));
  const unitTypeMap = new Map(unitTypes.map(ut => [ut.type_id, ut.id]));

  let updatedCount = 0;

  for (const hero of heroes) {
    const heroId = hero.hero_id;
    let updateData = {};

    // 设置品质关联
    for (const [qualityLevel, heroIds] of Object.entries(heroRelationshipData.qualities)) {
      if (heroIds.includes(heroId)) {
        const qualityDbId = qualityMap.get(parseInt(qualityLevel));
        if (qualityDbId) {
          updateData.quality = qualityDbId;
        }
        break;
      }
    }

    // 设置阵营关联
    for (const [factionKey, heroIds] of Object.entries(heroRelationshipData.factions)) {
      if (heroIds.includes(heroId)) {
        const factionDbId = factionMap.get(factionKey);
        if (factionDbId) {
          updateData.faction = factionDbId;
        }
        break;
      }
    }

    // 设置兵种关联
    for (const [unitTypeKey, heroIds] of Object.entries(heroRelationshipData.unitTypes)) {
      if (heroIds.includes(heroId)) {
        const unitTypeDbId = unitTypeMap.get(unitTypeKey);
        if (unitTypeDbId) {
          updateData.unit_type = unitTypeDbId;
        }
        break;
      }
    }

    // 如果有更新数据，则更新武将
    if (Object.keys(updateData).length > 0) {
      await app.db.query('api::hero.hero').update({
        where: { id: hero.id },
        data: updateData
      });
      
      updatedCount++;
      console.log(`✅ 更新武将: ${hero.name} (${heroId}) - 品质: ${updateData.quality ? '✓' : '✗'}, 阵营: ${updateData.faction ? '✓' : '✗'}, 兵种: ${updateData.unit_type ? '✓' : '✗'}`);
    }
  }

  console.log(`🎉 成功更新 ${updatedCount} 个武将的关联关系`);
}

// 执行修复
fixHeroRelations();