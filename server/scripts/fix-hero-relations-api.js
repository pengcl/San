// 通过API调用来修复武将关联关系
const axios = require('axios');

const API_BASE = 'http://localhost:1337/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJQZW5nY2wiLCJlbWFpbCI6IjM1NTk5OTZAcXEuY29tIiwiaWF0IjoxNzUxMzQ4Mzk0LCJleHAiOjE3NTEzNTE5OTQsImF1ZCI6ImdhbWUtY2xpZW50IiwiaXNzIjoic2FuZ3VvLWdhbWUifQ._l5U3KAF7ToUzcKzq8byRr1F_D2rOlMIkzNZzaT4WF4';

const httpClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// 创建基础数据
async function createBasicData() {
  console.log('📊 创建基础数据...');

  // 品质数据
  const qualityData = [
    { quality_id: 1, name_zh: '普通', name_en: 'Common', color_hex: '#808080', star_count: 1, rarity_weight: 0.60 },
    { quality_id: 2, name_zh: '优秀', name_en: 'Good', color_hex: '#00FF00', star_count: 2, rarity_weight: 0.30 },
    { quality_id: 3, name_zh: '精良', name_en: 'Rare', color_hex: '#0080FF', star_count: 3, rarity_weight: 0.09 },
    { quality_id: 4, name_zh: '史诗', name_en: 'Epic', color_hex: '#8000FF', star_count: 4, rarity_weight: 0.01 },
    { quality_id: 5, name_zh: '传说', name_en: 'Legendary', color_hex: '#FF8000', star_count: 5, rarity_weight: 0.001 },
    { quality_id: 6, name_zh: '神话', name_en: 'Mythic', color_hex: '#FF0000', star_count: 6, rarity_weight: 0.0001 }
  ];

  // 阵营数据
  const factionData = [
    { faction_id: 'shu', name_zh: '蜀', name_en: 'Shu', color_hex: '#FF4444', banner_color: '#CC0000' },
    { faction_id: 'wei', name_zh: '魏', name_en: 'Wei', color_hex: '#4444FF', banner_color: '#0000CC' },
    { faction_id: 'wu', name_zh: '吴', name_en: 'Wu', color_hex: '#44FF44', banner_color: '#00CC00' },
    { faction_id: 'other', name_zh: '群雄', name_en: 'Other', color_hex: '#FFFF44', banner_color: '#CCCC00' }
  ];

  // 兵种数据
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

  try {
    // 检查并创建品质数据
    console.log('创建品质数据...');
    for (const quality of qualityData) {
      try {
        await httpClient.post('/qualities', { data: quality });
        console.log(`✅ 创建品质: ${quality.name_zh}`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`⚠️  品质已存在: ${quality.name_zh}`);
        } else {
          console.error(`❌ 创建品质失败: ${quality.name_zh}`, error.message);
        }
      }
    }

    // 检查并创建阵营数据
    console.log('创建阵营数据...');
    for (const faction of factionData) {
      try {
        await httpClient.post('/factions', { data: faction });
        console.log(`✅ 创建阵营: ${faction.name_zh}`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`⚠️  阵营已存在: ${faction.name_zh}`);
        } else {
          console.error(`❌ 创建阵营失败: ${faction.name_zh}`, error.message);
        }
      }
    }

    // 检查并创建兵种数据
    console.log('创建兵种数据...');
    for (const unitType of unitTypeData) {
      try {
        await httpClient.post('/unit-types', { data: unitType });
        console.log(`✅ 创建兵种: ${unitType.name_zh}`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`⚠️  兵种已存在: ${unitType.name_zh}`);
        } else {
          console.error(`❌ 创建兵种失败: ${unitType.name_zh}`, error.message);
        }
      }
    }

  } catch (error) {
    console.error('创建基础数据失败:', error.message);
  }
}

async function main() {
  console.log('🔧 开始修复武将关联关系...');
  
  try {
    // 1. 创建基础数据
    await createBasicData();
    
    // 2. 获取现有数据
    console.log('📊 获取现有数据...');
    const [qualitiesRes, factionsRes, unitTypesRes] = await Promise.all([
      httpClient.get('/qualities'),
      httpClient.get('/factions'), 
      httpClient.get('/unit-types')
    ]);

    const qualities = qualitiesRes.data.data;
    const factions = factionsRes.data.data;
    const unitTypes = unitTypesRes.data.data;

    console.log(`找到 ${qualities.length} 个品质, ${factions.length} 个阵营, ${unitTypes.length} 个兵种`);

    // 3. 获取武将数据并更新关联
    console.log('🔗 更新武将关联关系...');
    const heroesRes = await httpClient.get('/heroes?limit=100');
    const heroes = heroesRes.data.data.heroes;

    console.log(`找到 ${heroes.length} 个武将`);

    // 创建映射
    const qualityMap = new Map(qualities.map(q => [q.quality_id, q.id]));
    const factionMap = new Map(factions.map(f => [f.faction_id, f.id]));
    const unitTypeMap = new Map(unitTypes.map(ut => [ut.type_id, ut.id]));

    // 武将关联数据
    const heroData = {
      // 神话级武将
      1002: { quality: 6, faction: 'shu', unitType: 'strategist' }, // 诸葛亮
      2001: { quality: 6, faction: 'wei', unitType: 'guardian' },   // 曹操
      4004: { quality: 6, faction: 'other', unitType: 'cavalry' }, // 吕布

      // 传说级武将
      1001: { quality: 5, faction: 'shu', unitType: 'infantry' },   // 刘备
      1003: { quality: 5, faction: 'shu', unitType: 'guardian' },   // 关羽
      1005: { quality: 5, faction: 'shu', unitType: 'cavalry' },    // 赵云
      2002: { quality: 5, faction: 'wei', unitType: 'strategist' }, // 司马懿
      2003: { quality: 5, faction: 'wei', unitType: 'cavalry' },    // 张辽
      3001: { quality: 5, faction: 'wu', unitType: 'cavalry' },     // 孙策
      3003: { quality: 5, faction: 'wu', unitType: 'strategist' },  // 周瑜

      // 史诗级武将
      1004: { quality: 4, faction: 'shu', unitType: 'infantry' },   // 张飞
      1006: { quality: 4, faction: 'shu', unitType: 'cavalry' },    // 马超
      1007: { quality: 4, faction: 'shu', unitType: 'archer' },     // 黄忠
      2004: { quality: 4, faction: 'wei', unitType: 'infantry' },   // 夏侯惇
      2005: { quality: 4, faction: 'wei', unitType: 'infantry' },   // 许褚
      2006: { quality: 4, faction: 'wei', unitType: 'infantry' },   // 典韦
      3002: { quality: 4, faction: 'wu', unitType: 'guardian' },    // 孙权
      3004: { quality: 4, faction: 'wu', unitType: 'infantry' },    // 太史慈
      3005: { quality: 4, faction: 'wu', unitType: 'infantry' },    // 甘宁
      4010: { quality: 4, faction: 'other', unitType: 'healer' },   // 华佗

      // 其他武将使用默认配置
    };

    let updatedCount = 0;

    for (const hero of heroes) {
      const heroId = hero.id;
      const config = heroData[heroId];
      
      if (config) {
        const updateData = {};
        
        if (config.quality && qualityMap.has(config.quality)) {
          updateData.quality = qualityMap.get(config.quality);
        }
        if (config.faction && factionMap.has(config.faction)) {
          updateData.faction = factionMap.get(config.faction);
        }
        if (config.unitType && unitTypeMap.has(config.unitType)) {
          updateData.unit_type = unitTypeMap.get(config.unitType);
        }

        if (Object.keys(updateData).length > 0) {
          try {
            // 这里需要使用Strapi的直接更新API
            console.log(`🔄 更新武将: ${hero.name} (${heroId})`);
            console.log(`   品质: ${config.quality}星, 阵营: ${config.faction}, 兵种: ${config.unitType}`);
            updatedCount++;
          } catch (error) {
            console.error(`❌ 更新武将失败: ${hero.name}`, error.message);
          }
        }
      }
    }

    console.log(`✅ 准备更新 ${updatedCount} 个武将的关联关系`);
    console.log('⚠️  注意：由于API限制，需要在Strapi管理后台手动建立关联关系');
    console.log('💡 建议：使用Strapi Admin UI批量更新武将的品质、阵营和兵种关联');

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

main();