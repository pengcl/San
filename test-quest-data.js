// 任务和成就测试数据配置
// 在Strapi后台管理界面中手动创建以下数据

const questData = {
  quests: [
    // 每日任务
    {
      quest_id: 'daily_battle',
      name: '每日征战',
      description: '完成3场战斗来获得经验和奖励',
      category: 'daily',
      type: 'battle',
      requirements: { battles_completed: 3 },
      rewards: { gold: 10000, energy: 20 },
      unlock_level: 1,
      priority: 1,
      is_repeatable: true,
      reset_type: 'daily',
      icon: 'sword_icon',
      is_active: true
    },
    {
      quest_id: 'daily_upgrade',
      name: '每日强化',
      description: '升级任意武将1次',
      category: 'daily',
      type: 'upgrade',
      requirements: { hero_upgrades: 1 },
      rewards: { gold: 8000, skill_books: 2 },
      unlock_level: 1,
      priority: 2,
      is_repeatable: true,
      reset_type: 'daily',
      icon: 'upgrade_icon',
      is_active: true
    },
    {
      quest_id: 'daily_arena',
      name: '每日切磋',
      description: '参与1次竞技场战斗',
      category: 'daily',
      type: 'battle',
      requirements: { arena_battles: 1 },
      rewards: { honor: 200, gems: 20 },
      unlock_level: 15,
      priority: 3,
      is_repeatable: true,
      reset_type: 'daily',
      icon: 'arena_icon',
      is_active: true
    },
    {
      quest_id: 'daily_enhance',
      name: '每日锻造',
      description: '强化装备1次',
      category: 'daily',
      type: 'upgrade',
      requirements: { equipment_enhancements: 1 },
      rewards: { gold: 5000, enhancement_stones: 3 },
      unlock_level: 12,
      priority: 4,
      is_repeatable: true,
      reset_type: 'daily',
      icon: 'hammer_icon',
      is_active: true
    },

    // 周常任务
    {
      quest_id: 'weekly_victories',
      name: '周胜利者',
      description: '赢得20场战斗',
      category: 'weekly',
      type: 'battle',
      requirements: { battles_won: 20 },
      rewards: { gems: 200, rare_materials: 10 },
      unlock_level: 5,
      priority: 1,
      is_repeatable: true,
      reset_type: 'weekly',
      icon: 'victory_icon',
      is_active: true
    },
    {
      quest_id: 'weekly_arena',
      name: '周竞技者',
      description: '获得5次竞技场胜利',
      category: 'weekly',
      type: 'battle',
      requirements: { arena_wins: 5 },
      rewards: { honor: 1000, gems: 150 },
      unlock_level: 15,
      priority: 2,
      is_repeatable: true,
      reset_type: 'weekly',
      icon: 'arena_victory_icon',
      is_active: true
    },

    // 主线任务
    {
      quest_id: 'main_first_hero',
      name: '招贤纳士',
      description: '招募第一个武将',
      category: 'main',
      type: 'collect',
      requirements: { heroes_obtained: 1 },
      rewards: { gold: 20000, gems: 100 },
      unlock_level: 1,
      priority: 1,
      is_repeatable: false,
      reset_type: 'none',
      icon: 'recruit_icon',
      is_active: true
    },
    {
      quest_id: 'main_first_victory',
      name: '初战告捷',
      description: '赢得第一场战斗',
      category: 'main',
      type: 'battle',
      requirements: { battles_won: 1 },
      rewards: { gold: 15000, energy: 50 },
      unlock_level: 1,
      priority: 2,
      is_repeatable: false,
      reset_type: 'none',
      icon: 'first_victory_icon',
      is_active: true
    }
  ],

  achievements: [
    // 战斗成就
    {
      achievement_id: 'first_victory',
      name: '初出茅庐',
      description: '赢得第一场战斗',
      category: 'combat',
      type: 'single',
      requirements: { battles_won: 1 },
      rewards: { gems: 50, gold: 5000 },
      rarity: 'common',
      points: 10,
      icon: 'first_battle_icon',
      unlock_level: 1,
      is_hidden: false,
      is_active: true,
      order: 1
    },
    {
      achievement_id: 'hundred_victories',
      name: '百战不殆',
      description: '赢得100场战斗',
      category: 'combat',
      type: 'single',
      requirements: { battles_won: 100 },
      rewards: { gems: 500, rare_materials: 20 },
      rarity: 'epic',
      points: 100,
      icon: 'hundred_battles_icon',
      unlock_level: 10,
      is_hidden: false,
      is_active: true,
      order: 2
    },
    {
      achievement_id: 'perfect_battles',
      name: '完美战士',
      description: '获得50次完美胜利',
      category: 'combat',
      type: 'single',
      requirements: { perfect_victories: 50 },
      rewards: { gems: 300, rare_materials: 20 },
      rarity: 'rare',
      points: 50,
      icon: 'perfect_icon',
      unlock_level: 5,
      is_hidden: false,
      is_active: true,
      order: 3
    },

    // 收集成就
    {
      achievement_id: 'hero_collector',
      name: '武将收藏家',
      description: '收集不同稀有度的武将',
      category: 'collection',
      type: 'tiered',
      requirements: { unique_heroes: 10 },
      rewards: { gems: 200, hero_fragments: 10 },
      tiers: {
        "1": { requirements: { unique_heroes: 10 }, rewards: { gems: 200, hero_fragments: 10 } },
        "2": { requirements: { unique_heroes: 25 }, rewards: { gems: 400, hero_fragments: 20 } },
        "3": { requirements: { unique_heroes: 50 }, rewards: { gems: 800, legendary_summon_ticket: 1 } }
      },
      rarity: 'epic',
      points: 75,
      icon: 'collector_icon',
      unlock_level: 5,
      is_hidden: false,
      is_active: true,
      order: 1
    },
    {
      achievement_id: 'max_star_hero',
      name: '六星传说',
      description: '拥有一名6星武将',
      category: 'collection',
      type: 'single',
      requirements: { six_star_heroes: 1 },
      rewards: { gems: 1000, awakening_crystals: 50 },
      rarity: 'legendary',
      points: 200,
      icon: 'six_star_icon',
      unlock_level: 30,
      is_hidden: false,
      is_active: true,
      order: 2
    },

    // 进度成就
    {
      achievement_id: 'level_milestone',
      name: '等级里程碑',
      description: '达到指定等级',
      category: 'progression',
      type: 'tiered',
      requirements: { player_level: 20 },
      rewards: { gems: 200 },
      tiers: {
        "1": { requirements: { player_level: 20 }, rewards: { gems: 200 } },
        "2": { requirements: { player_level: 50 }, rewards: { gems: 500 } },
        "3": { requirements: { player_level: 80 }, rewards: { gems: 1000 } },
        "4": { requirements: { player_level: 100 }, rewards: { gems: 2000 } }
      },
      rarity: 'rare',
      points: 50,
      icon: 'level_icon',
      unlock_level: 1,
      is_hidden: false,
      is_active: true,
      order: 1
    },

    // 社交成就
    {
      achievement_id: 'guild_member',
      name: '公会新兵',
      description: '加入一个公会',
      category: 'social',
      type: 'single',
      requirements: { guild_joined: 1 },
      rewards: { gems: 100, guild_coins: 500 },
      rarity: 'common',
      points: 15,
      icon: 'guild_icon',
      unlock_level: 30,
      is_hidden: false,
      is_active: true,
      order: 1
    },
    {
      achievement_id: 'friend_maker',
      name: '广交朋友',
      description: '添加10个好友',
      category: 'social',
      type: 'single',
      requirements: { friends_count: 10 },
      rewards: { gems: 150, energy: 100 },
      rarity: 'common',
      points: 20,
      icon: 'friend_icon',
      unlock_level: 10,
      is_hidden: false,
      is_active: true,
      order: 2
    }
  ]
};

console.log('任务成就数据结构:');
console.log('quests:', questData.quests.length, '个任务');
console.log('achievements:', questData.achievements.length, '个成就');

// 按分类统计
const questCategories = questData.quests.reduce((acc, quest) => {
  acc[quest.category] = (acc[quest.category] || 0) + 1;
  return acc;
}, {});

const achievementCategories = questData.achievements.reduce((acc, achievement) => {
  acc[achievement.category] = (acc[achievement.category] || 0) + 1;
  return acc;
}, {});

console.log('任务分类:', questCategories);
console.log('成就分类:', achievementCategories);

// 导出数据供手动输入使用
module.exports = questData;