// 商店测试数据创建脚本
// 在Strapi后台管理界面中手动创建以下数据

const shopData = {
  shops: [
    {
      shop_type: 'general',
      name: '通用商店',
      description: '售卖各种基础道具和材料',
      currency: 'gold',
      refresh_interval: 86400,
      refresh_cost: { gems: 50 },
      free_refreshes_daily: 1,
      item_slots: 8,
      level_requirement: 1,
      vip_requirement: 0,
      is_active: true
    },
    {
      shop_type: 'arena',
      name: '竞技场商店',
      description: '使用荣誉购买PVP专属道具',
      currency: 'honor',
      refresh_interval: 86400,
      refresh_cost: { honor: 100 },
      free_refreshes_daily: 2,
      item_slots: 6,
      level_requirement: 10,
      vip_requirement: 0,
      is_active: true
    },
    {
      shop_type: 'guild',
      name: '公会商店',
      description: '公会成员专属商店',
      currency: 'guild_coins',
      refresh_interval: 604800,
      refresh_cost: { guild_coins: 500 },
      free_refreshes_daily: 0,
      item_slots: 10,
      level_requirement: 20,
      vip_requirement: 0,
      is_active: true
    },
    {
      shop_type: 'event',
      name: '活动商店',
      description: '限时活动专属商店',
      currency: 'event_tokens',
      refresh_interval: 3600,
      refresh_cost: { gems: 100 },
      free_refreshes_daily: 3,
      item_slots: 5,
      level_requirement: 1,
      vip_requirement: 0,
      is_active: true
    },
    {
      shop_type: 'vip',
      name: 'VIP商店',
      description: 'VIP玩家专享高级商品',
      currency: 'gems',
      refresh_interval: 86400,
      refresh_cost: { gems: 200 },
      free_refreshes_daily: 1,
      item_slots: 12,
      level_requirement: 30,
      vip_requirement: 3,
      is_active: true
    }
  ],

  shopItems: [
    {
      item_id: 1,
      name: '小回血药',
      description: '恢复少量生命值',
      category: 'consumable',
      rarity: 1,
      base_price: 100,
      currency: 'gold',
      shop_types: ['general'],
      icon: 'healing_potion_small',
      max_stack: 999,
      sellable: true,
      sell_price: 30,
      effects: { heal: 500 },
      is_active: true
    },
    {
      item_id: 2,
      name: '中回血药',
      description: '恢复中等生命值',
      category: 'consumable',
      rarity: 2,
      base_price: 500,
      currency: 'gold',
      shop_types: ['general'],
      icon: 'healing_potion_medium',
      max_stack: 999,
      sellable: true,
      sell_price: 150,
      effects: { heal: 2000 },
      is_active: true
    },
    {
      item_id: 12,
      name: '青铜剑',
      description: '普通的青铜制武器',
      category: 'equipment',
      rarity: 2,
      base_price: 2000,
      currency: 'gold',
      shop_types: ['general'],
      icon: 'bronze_sword',
      max_stack: 1,
      sellable: true,
      sell_price: 600,
      effects: { attack: 100, hit: 5 },
      is_active: true
    },
    {
      item_id: 13,
      name: '精钢刀',
      description: '锋利的精钢制武器',
      category: 'equipment',
      rarity: 3,
      base_price: 5000,
      currency: 'gold',
      shop_types: ['general', 'arena'],
      icon: 'steel_blade',
      max_stack: 1,
      sellable: true,
      sell_price: 1500,
      effects: { attack: 250, critical: 10 },
      is_active: true
    },
    {
      item_id: 6,
      name: '铁矿石',
      description: '用于装备强化的基础材料',
      category: 'material',
      rarity: 1,
      base_price: 50,
      currency: 'gold',
      shop_types: ['general'],
      icon: 'iron_ore',
      max_stack: 9999,
      sellable: true,
      sell_price: 15,
      effects: {},
      is_active: true
    },
    {
      item_id: 9,
      name: '刘备碎片',
      description: '合成刘备武将所需的碎片',
      category: 'fragment',
      rarity: 4,
      base_price: 500,
      currency: 'honor',
      shop_types: ['arena'],
      icon: 'liubei_fragment',
      max_stack: 999,
      sellable: false,
      sell_price: 0,
      effects: {},
      is_active: true
    },
    {
      item_id: 18,
      name: '体力药水',
      description: '立即恢复60点体力',
      category: 'consumable',
      rarity: 3,
      base_price: 100,
      currency: 'gems',
      shop_types: ['vip'],
      icon: 'energy_potion',
      max_stack: 99,
      sellable: false,
      sell_price: 0,
      effects: { energy: 60 },
      is_active: true
    }
  ]
};

console.log('商店测试数据结构:');
console.log('shops:', shopData.shops.length, '个商店');
console.log('shopItems:', shopData.shopItems.length, '个商品');

// 导出数据供手动输入使用
module.exports = shopData;