/**
 * 导入物品模板数据
 */

export async function importItemData(strapi: any) {
  console.log('开始导入物品模板数据...');

  try {
    // 获取品质数据
    const qualities = await strapi.db.query('api::quality.quality').findMany();
    
    // 物品模板数据
    const itemTemplates = [
      // 消耗品 - 恢复类
      {
        item_id: 1001,
        name: '小回血药',
        description: '恢复少量生命值的基础药剂',
        category: 'consumables',
        rarity: 1,
        max_stack: 99,
        sell_price: 10,
        is_usable: true,
        effects: {
          heal_hp: 100
        },
        icon: '🧪',
        quality: qualities.find(q => q.level === 1)?.id
      },
      {
        item_id: 1002,
        name: '中回血药',
        description: '恢复中等生命值的药剂',
        category: 'consumables',
        rarity: 2,
        max_stack: 99,
        sell_price: 25,
        is_usable: true,
        effects: {
          heal_hp: 300
        },
        icon: '🧪',
        quality: qualities.find(q => q.level === 2)?.id
      },
      {
        item_id: 1003,
        name: '大回血药',
        description: '恢复大量生命值的高级药剂',
        category: 'consumables',
        rarity: 3,
        max_stack: 99,
        sell_price: 50,
        is_usable: true,
        effects: {
          heal_hp: 600
        },
        icon: '🧪',
        quality: qualities.find(q => q.level === 3)?.id
      },

      // 消耗品 - 经验类
      {
        item_id: 1101,
        name: '经验药水',
        description: '增加武将经验值的神奇药水',
        category: 'consumables',
        rarity: 2,
        max_stack: 99,
        sell_price: 20,
        is_usable: true,
        effects: {
          add_exp: 100
        },
        icon: '⚗️',
        quality: qualities.find(q => q.level === 2)?.id
      },
      {
        item_id: 1102,
        name: '高级经验药水',
        description: '大幅增加武将经验值的珍贵药水',
        category: 'consumables',
        rarity: 4,
        max_stack: 99,
        sell_price: 100,
        is_usable: true,
        effects: {
          add_exp: 500
        },
        icon: '⚗️',
        quality: qualities.find(q => q.level === 4)?.id
      },

      // 材料 - 升级材料
      {
        item_id: 2001,
        name: '铁矿石',
        description: '用于锻造和升级装备的基础材料',
        category: 'materials',
        rarity: 1,
        max_stack: 999,
        sell_price: 5,
        is_usable: false,
        icon: '⛏️',
        quality: qualities.find(q => q.level === 1)?.id
      },
      {
        item_id: 2002,
        name: '银锭',
        description: '贵重的金属材料，用于高级装备制作',
        category: 'materials',
        rarity: 3,
        max_stack: 999,
        sell_price: 25,
        is_usable: false,
        icon: '🔩',
        quality: qualities.find(q => q.level === 3)?.id
      },
      {
        item_id: 2003,
        name: '精金',
        description: '极其珍稀的神级材料，可制作传说装备',
        category: 'materials',
        rarity: 5,
        max_stack: 99,
        sell_price: 200,
        is_usable: false,
        icon: '💎',
        quality: qualities.find(q => q.level === 5)?.id
      },

      // 碎片 - 武将碎片
      {
        item_id: 3001,
        name: '刘备碎片',
        description: '汉昭烈帝刘备的灵魂碎片，可用于召唤',
        category: 'fragments',
        rarity: 4,
        max_stack: 999,
        sell_price: 50,
        is_usable: false,
        icon: '👑',
        quality: qualities.find(q => q.level === 4)?.id
      },
      {
        item_id: 3002,
        name: '关羽碎片',
        description: '武圣关羽的灵魂碎片，可用于召唤',
        category: 'fragments',
        rarity: 4,
        max_stack: 999,
        sell_price: 50,
        is_usable: false,
        icon: '⚔️',
        quality: qualities.find(q => q.level === 4)?.id
      },
      {
        item_id: 3003,
        name: '诸葛亮碎片',
        description: '卧龙诸葛亮的灵魂碎片，神话品质',
        category: 'fragments',
        rarity: 6,
        max_stack: 999,
        sell_price: 500,
        is_usable: false,
        icon: '🧙‍♂️',
        quality: qualities.find(q => q.level === 6)?.id
      },

      // 装备 - 武器
      {
        item_id: 4001,
        name: '青铜剑',
        description: '基础的青铜材质长剑，攻击力+20',
        category: 'equipment',
        rarity: 1,
        max_stack: 1,
        sell_price: 100,
        is_usable: false,
        effects: {
          attack: 20
        },
        icon: '⚔️',
        quality: qualities.find(q => q.level === 1)?.id
      },
      {
        item_id: 4002,
        name: '精钢刀',
        description: '锋利的精钢战刀，攻击力+50',
        category: 'equipment',
        rarity: 3,
        max_stack: 1,
        sell_price: 300,
        is_usable: false,
        effects: {
          attack: 50
        },
        icon: '🗡️',
        quality: qualities.find(q => q.level === 3)?.id
      },
      {
        item_id: 4003,
        name: '龙泉宝剑',
        description: '传说中的神兵，攻击力+150',
        category: 'equipment',
        rarity: 5,
        max_stack: 1,
        sell_price: 2000,
        is_usable: false,
        effects: {
          attack: 150
        },
        icon: '⚔️',
        quality: qualities.find(q => q.level === 5)?.id
      },

      // 货币
      {
        item_id: 5001,
        name: '金币袋',
        description: '装满金币的钱袋，使用后获得金币',
        category: 'currency',
        rarity: 2,
        max_stack: 99,
        sell_price: 0,
        is_usable: true,
        effects: {
          add_currency: {
            gold: 1000
          }
        },
        icon: '💰',
        quality: qualities.find(q => q.level === 2)?.id
      },
      {
        item_id: 5002,
        name: '钻石',
        description: '珍贵的钻石，游戏中的高级货币',
        category: 'currency',
        rarity: 5,
        max_stack: 9999,
        sell_price: 0,
        is_usable: false,
        icon: '💎',
        quality: qualities.find(q => q.level === 5)?.id
      },

      // 特殊物品
      {
        item_id: 6001,
        name: '随机召唤券',
        description: '可以召唤一个随机武将的神秘卷轴',
        category: 'special',
        rarity: 4,
        max_stack: 99,
        sell_price: 0,
        is_usable: true,
        icon: '📜',
        quality: qualities.find(q => q.level === 4)?.id
      },
      {
        item_id: 6002,
        name: '体力药水',
        description: '恢复体力的神奇药水，可以继续战斗',
        category: 'special',
        rarity: 3,
        max_stack: 99,
        sell_price: 50,
        is_usable: true,
        effects: {
          restore_stamina: 50
        },
        icon: '🧪',
        quality: qualities.find(q => q.level === 3)?.id
      }
    ];

    // 导入物品模板
    for (const itemData of itemTemplates) {
      const existingItem = await strapi.db.query('api::item-template.item-template').findOne({
        where: { item_id: itemData.item_id }
      });

      if (existingItem) {
        console.log(`物品模板 ${itemData.name} 已存在，跳过`);
        continue;
      }

      await strapi.db.query('api::item-template.item-template').create({
        data: itemData
      });

      console.log(`物品模板 ${itemData.name} 导入成功`);
    }

    console.log('物品模板数据导入完成！');

  } catch (error) {
    console.error('导入物品模板数据失败:', error);
  }
}