/**
 * user-hero controller
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

/**
 * 获取武将阵营信息（硬编码映射）
 */
function getHeroFaction(heroId: number, heroName: string): string {
  const factionMap: Record<number, string> = {
    // 蜀国武将
    1001: '蜀', // 刘备
    1003: '蜀', // 关羽
    1004: '蜀', // 张飞
    1005: '蜀', // 诸葛亮
    1006: '蜀', // 赵云
    1007: '蜀', // 马超
    1008: '蜀', // 黄忠
    1009: '蜀', // 魏延
    1010: '蜀', // 姜维
    // 魏国武将
    2001: '魏', // 曹操
    2002: '魏', // 夏侯惇
    2003: '魏', // 司马懿
    2004: '魏', // 典韦
    2005: '魏', // 许褚
    2006: '魏', // 张辽
    2007: '魏', // 郭嘉
    2008: '魏', // 徐庶
    // 吴国武将
    3001: '吴', // 孙权
    3002: '吴', // 周瑜
    3003: '吴', // 太史慈
    3004: '吴', // 甘宁
    3005: '吴', // 陆逊
    3006: '吴', // 孙尚香
    3007: '吴', // 大乔
    3008: '吴', // 小乔
  };
  
  return factionMap[heroId] || (heroName?.includes('刘') || heroName?.includes('关') || heroName?.includes('张') ? '蜀' : 
                                heroName?.includes('曹') || heroName?.includes('司马') ? '魏' : 
                                heroName?.includes('孙') || heroName?.includes('周') ? '吴' : 'unknown');
}

/**
 * 获取武将兵种信息（硬编码映射）
 */
function getHeroUnitType(heroId: number, heroName: string): string {
  const unitTypeMap: Record<number, string> = {
    // 步兵类
    1001: '步兵', // 刘备
    1004: '步兵', // 张飞
    1007: '步兵', // 马超
    2001: '步兵', // 曹操
    2004: '步兵', // 典韦
    2005: '步兵', // 许褚
    3001: '步兵', // 孙权
    3004: '步兵', // 甘宁
    
    // 骑兵类
    1003: '骑兵', // 关羽
    1006: '骑兵', // 赵云
    1009: '骑兵', // 魏延
    2002: '骑兵', // 夏侯惇
    2006: '骑兵', // 张辽
    3003: '骑兵', // 太史慈
    
    // 弓兵类（军师、谋士）
    1005: '弓兵', // 诸葛亮
    1008: '弓兵', // 黄忠
    1010: '弓兵', // 姜维
    2003: '弓兵', // 司马懿
    2007: '弓兵', // 郭嘉
    2008: '弓兵', // 徐庶
    3002: '弓兵', // 周瑜
    3005: '弓兵', // 陆逊
    3006: '弓兵', // 孙尚香
    3007: '弓兵', // 大乔
    3008: '弓兵', // 小乔
  };
  
  return unitTypeMap[heroId] || '步兵'; // 默认为步兵
}

export default factories.createCoreController('api::user-hero.user-hero', ({ strapi }) => ({
  /**
   * 获取用户武将列表（带完整武将信息）
   */
  async find(ctx: Context) {
    try {
      const user = ctx.state.user;
      
      // 如果没有认证用户，返回空列表
      if (!user) {
        return ctx.body = {
          data: [],
          meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } }
        };
      }

      const { 
        page = 1, 
        pageSize = 25, 
        sort = 'power:desc',
        filters = {}
      } = ctx.query;

      // 构建查询条件
      const queryFilters = {
        user: user.id,
        ...(typeof filters === 'object' && filters !== null ? filters : {})
      };

      // 查询用户武将，包含关联的武将模板数据
      const userHeroes = await strapi.db.query('api::user-hero.user-hero').findWithCount({
        where: queryFilters,
        populate: {
          hero: {
            populate: {
              quality: true,
              faction: true,
              unit_type: true,
              skills: {
                populate: {
                  skill_type: true
                }
              }
            }
          }
        },
        orderBy: parseSort(String(sort)),
        offset: (Number(page) - 1) * Number(pageSize),
        limit: Number(pageSize)
      });

      const [results, total] = userHeroes;

      // 格式化响应数据
      const formattedHeroes = results.map(userHero => ({
        id: userHero.id,
        documentId: userHero.documentId,
        heroId: userHero.hero?.hero_id,
        name: userHero.hero?.name,
        level: userHero.level,
        star: userHero.star,
        experience: userHero.exp,
        rarity: userHero.hero?.quality?.level || 1,
        faction: getHeroFaction(userHero.hero?.hero_id, userHero.hero?.name),
        unitType: getHeroUnitType(userHero.hero?.hero_id, userHero.hero?.name),
        power: userHero.power,
        isFavorite: userHero.is_favorite,
        position: userHero.position,
        breakthrough: userHero.breakthrough,
        skillPoints: userHero.skill_points,
        skillTree: userHero.skill_tree,
        stats: {
          hp: calculateCurrentStat(userHero.hero?.base_hp || 100, userHero.level, userHero.star),
          attack: calculateCurrentStat(userHero.hero?.base_attack || 20, userHero.level, userHero.star),
          defense: calculateCurrentStat(userHero.hero?.base_defense || 15, userHero.level, userHero.star),
          speed: calculateCurrentStat(userHero.hero?.base_speed || 10, userHero.level, userHero.star)
        },
        skills: userHero.hero?.skills?.map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          description: skill.description,
          type: skill.skill_type?.name || 'unknown',
          cooldown: skill.cooldown || 0,
          energyCost: skill.energy_cost || 0
        })) || [],
        avatar: userHero.hero?.avatar_url,
        createdAt: userHero.createdAt,
        updatedAt: userHero.updatedAt
      }));

      ctx.body = {
        data: formattedHeroes,
        meta: {
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            pageCount: Math.ceil(total / Number(pageSize)),
            total
          }
        }
      };
    } catch (error) {
      console.error('获取用户武将列表错误:', error);
      ctx.status = 500;
      ctx.body = {
        data: null,
        error: {
          status: 500,
          name: 'InternalServerError',
          message: '获取武将列表失败'
        }
      };
    }
  },

  /**
   * 获取单个用户武将详情
   */
  async findOne(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;

      if (!user) {
        return ctx.unauthorized('未认证');
      }

      const userHero = await strapi.db.query('api::user-hero.user-hero').findOne({
        where: { 
          id: Number(id),
          user: user.id
        },
        populate: {
          hero: {
            populate: {
              quality: true,
              faction: true,
              unit_type: true,
              skills: {
                populate: {
                  skill_type: true
                }
              }
            }
          }
        }
      });

      if (!userHero) {
        return ctx.notFound('武将不存在或不属于当前用户');
      }

      const hero = userHero.hero;
      const currentStats = {
        hp: calculateCurrentStat(hero.base_hp, userHero.level, userHero.star),
        attack: calculateCurrentStat(hero.base_attack, userHero.level, userHero.star),
        defense: calculateCurrentStat(hero.base_defense, userHero.level, userHero.star),
        speed: calculateCurrentStat(hero.base_speed, userHero.level, userHero.star)
      };

      const heroDetail = {
        id: userHero.id,
        documentId: userHero.documentId,
        heroId: hero.hero_id,
        name: hero.name,
        description: hero.description,
        level: userHero.level,
        star: userHero.star,
        experience: userHero.exp,
        maxExperience: calculateMaxExperience(userHero.level),
        rarity: hero.quality?.level || 1,
        faction: getHeroFaction(hero.hero_id, hero.name),
        unitType: getHeroUnitType(hero.hero_id, hero.name),
        power: userHero.power,
        isFavorite: userHero.is_favorite,
        position: userHero.position,
        breakthrough: userHero.breakthrough,
        skillPoints: userHero.skill_points,
        skillTree: userHero.skill_tree,
        baseStats: {
          hp: hero.base_hp,
          attack: hero.base_attack,
          defense: hero.base_defense,
          speed: hero.base_speed
        },
        currentStats,
        skills: hero.skills?.map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          description: skill.description,
          level: getSkillLevel(userHero.skill_tree, skill.id),
          maxLevel: 5,
          type: skill.skill_type?.name || 'unknown',
          cooldown: skill.cooldown || 0,
          energyCost: skill.energy_cost || 0,
          effects: skill.effects ? JSON.parse(skill.effects) : []
        })) || [],
        avatar: hero.avatar_url,
        createdAt: userHero.createdAt,
        updatedAt: userHero.updatedAt
      };

      ctx.body = {
        data: heroDetail
      };
    } catch (error) {
      console.error('获取武将详情错误:', error);
      ctx.status = 500;
      ctx.body = {
        data: null,
        error: {
          status: 500,
          name: 'InternalServerError',
          message: '获取武将详情失败'
        }
      };
    }
  },

  /**
   * 创建用户武将
   */
  async create(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { hero_id, level = 1, star = 1 } = ctx.request.body;

      if (!user) {
        return ctx.unauthorized('未认证');
      }

      // 查找武将模板
      const hero = await strapi.db.query('api::hero.hero').findOne({
        where: { hero_id }
      });

      if (!hero) {
        return ctx.badRequest('武将不存在');
      }

      // 检查是否已拥有该武将
      const existingUserHero = await strapi.db.query('api::user-hero.user-hero').findOne({
        where: {
          user: user.id,
          hero: hero.id
        }
      });

      if (existingUserHero) {
        return ctx.badRequest('已拥有该武将');
      }

      // 计算武将战力
      const basePower = hero.base_hp + hero.base_attack * 2 + hero.base_defense * 1.5 + hero.base_speed;
      const levelMultiplier = 1 + (level - 1) * 0.1;
      const starMultiplier = 1 + (star - 1) * 0.2;
      const power = Math.floor(basePower * levelMultiplier * starMultiplier);

      // 创建用户武将
      const userHero = await strapi.db.query('api::user-hero.user-hero').create({
        data: {
          user: user.id,
          hero: hero.id,
          level,
          star,
          exp: 0,
          breakthrough: 0,
          skill_points: 0,
          skill_tree: {},
          power,
          is_favorite: false,
          position: 0,
          publishedAt: new Date()
        }
      });

      ctx.body = {
        data: {
          id: userHero.id,
          heroId: hero.hero_id,
          name: hero.name,
          level: userHero.level,
          star: userHero.star,
          power: userHero.power,
          message: '武将创建成功'
        }
      };
    } catch (error) {
      console.error('创建武将错误:', error);
      ctx.status = 500;
      ctx.body = {
        data: null,
        error: {
          status: 500,
          name: 'InternalServerError',
          message: '创建武将失败'
        }
      };
    }
  },

  /**
   * 武将升级
   */
  levelUp,

  /**
   * 武将升星
   */
  starUp,

  /**
   * 技能升级
   */
  upgradeSkill,

  /**
   * 装备武器/护甲
   */
  equipItem,

  /**
   * 卸下装备
   */
  unequipItem,

  /**
   * 装备强化
   */
  enhanceEquipment,

  /**
   * 获取武将装备信息
   */
  getEquipment
}));

/**
 * 解析排序参数
 */
function parseSort(sort: string): Record<string, any> {
  const [field, direction = 'asc'] = sort.split(':');
  return { [field]: direction };
}

/**
 * 计算当前属性值
 */
function calculateCurrentStat(baseStat: number, level: number, star: number): number {
  const levelBonus = (level - 1) * (baseStat * 0.1);
  const starMultiplier = 1 + (star - 1) * 0.2;
  return Math.floor((baseStat + levelBonus) * starMultiplier);
}

/**
 * 计算升级所需最大经验
 */
function calculateMaxExperience(level: number): number {
  return level * 100 + Math.pow(level, 2) * 10;
}

/**
 * 获取技能等级
 */
function getSkillLevel(skillTree: any, skillId: number): number {
  return skillTree?.[skillId] || 1;
}

/**
 * 武将升级
 */
const levelUp = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const { useItems = [], useGold = 0, targetLevel } = ctx.request.body as any;
    const user = ctx.state.user;

    console.log('武将升级请求:', { id, useItems, useGold, targetLevel, userId: user.id });

    // 获取用户武将
    const userHero = await strapi.entityService.findOne('api::user-hero.user-hero', id, {
      populate: ['user']
    }) as any;

    if (!userHero || userHero.user?.id !== user.id) {
      return ctx.notFound('武将不存在或不属于当前用户');
    }

    // 获取用户资源
    const userProfile = await strapi.entityService.findMany('api::user-profile.user-profile', {
      filters: { user: user.id }
    }) as any;

    const userResources = userProfile[0] || { gold: 0, gems: 0 };

    // 计算所需经验和金币
    const currentLevel = userHero.level || 1;
    const currentExp = userHero.exp || 0;
    const maxLevel = targetLevel || 100;

    let totalExpNeeded = 0;
    let totalGoldCost = useGold;

    // 计算升级所需的总经验
    for (let level = currentLevel; level < Math.min(maxLevel, 100); level++) {
      const expForNextLevel = calculateExpForLevel(level + 1);
      totalExpNeeded += expForNextLevel;
    }

    // 减去当前经验
    totalExpNeeded -= currentExp;

    if (totalExpNeeded <= 0) {
      return ctx.badRequest('武将已达到目标等级');
    }

    // 计算道具提供的经验
    let expFromItems = 0;
    let itemCosts = [];

    for (const item of useItems) {
      // 这里应该查询道具模板获取经验值，简化处理
      const expValue = getItemExpValue(item.itemId);
      expFromItems += expValue * item.quantity;
      itemCosts.push({
        itemId: item.itemId,
        quantity: item.quantity,
        expProvided: expValue * item.quantity
      });
    }

    // 检查是否有足够的经验和金币
    const totalExp = expFromItems + (useGold * 0.1); // 1金币=0.1经验
    
    if (totalExp < totalExpNeeded) {
      return ctx.badRequest('经验不足，无法升级到目标等级');
    }

    if (useGold > userResources.gold) {
      return ctx.badRequest('金币不足');
    }

    // 执行升级
    let newLevel = currentLevel;
    let newExp = currentExp + totalExp;
    let levelGained = 0;

    // 计算新等级
    while (newExp >= calculateExpForLevel(newLevel + 1) && newLevel < 100) {
      newExp -= calculateExpForLevel(newLevel + 1);
      newLevel++;
      levelGained++;
    }

    // 计算属性提升 - 基于等级和星级计算，不依赖数据库中的stats字段
    const oldStats = calculateStatsForLevel(currentLevel, userHero.star || 1);
    const newStats = calculateStatsForLevel(newLevel, userHero.star || 1);
    
    const statsIncrease = {
      hp: newStats.hp - oldStats.hp,
      attack: newStats.attack - oldStats.attack,
      defense: newStats.defense - oldStats.defense,
      speed: newStats.speed - oldStats.speed
    };

    // 更新武将数据
    const updatedHero = await strapi.entityService.update('api::user-hero.user-hero', id, {
      data: {
        level: newLevel,
        exp: newExp,
        power: calculatePower(newStats),
        updatedAt: new Date()
      }
    });

    // 扣除金币（如果使用了金币）
    if (useGold > 0 && userProfile.length > 0) {
      await strapi.entityService.update('api::user-profile.user-profile', userProfile[0].id, {
        data: {
          gold: Number(userResources.gold) - useGold
        }
      });
    }

    console.log('✅ 武将升级成功:', { heroId: id, oldLevel: currentLevel, newLevel, levelGained });

    return {
      success: true,
      data: {
        hero: updatedHero,
        levelsGained: levelGained,
        experienceGained: totalExp,
        costsUsed: {
          gold: useGold,
          items: itemCosts
        },
        statsIncrease,
        newSkillsUnlocked: [] // 技能解锁逻辑待实现
      }
    };

  } catch (error) {
    console.error('❌ 武将升级失败:', error);
    return {
      success: false,
      error: {
        status: 500,
        name: 'InternalServerError',
        message: '武将升级失败'
      }
    };
  }
};

/**
 * 武将升星
 */
const starUp = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const { materials, gold, confirm } = ctx.request.body as any;
    const user = ctx.state.user;

    if (!confirm) {
      return ctx.badRequest('必须确认升星操作');
    }

    console.log('武将升星请求:', { id, materials, gold, userId: user.id });

    // 获取用户武将
    const userHero = await strapi.entityService.findOne('api::user-hero.user-hero', id, {
      populate: ['user']
    }) as any;

    if (!userHero || userHero.user?.id !== user.id) {
      return ctx.notFound('武将不存在或不属于当前用户');
    }

    const currentStar = userHero.star || 1;
    if (currentStar >= 6) {
      return ctx.badRequest('武将已达到最高星级');
    }

    // 获取升星配置
    const starUpConfig = getStarUpConfig(currentStar, currentStar + 1);
    if (!starUpConfig) {
      return ctx.badRequest('升星配置不存在');
    }

    // 检查材料是否足够
    const requiredMaterials = starUpConfig.materials;
    for (const [materialType, requiredAmount] of Object.entries(requiredMaterials)) {
      const providedAmount = materials[materialType] || 0;
      if (providedAmount < requiredAmount) {
        return ctx.badRequest(`${materialType}材料不足: 需要${requiredAmount}, 提供${providedAmount}`);
      }
    }

    if (gold < starUpConfig.materials.gold) {
      return ctx.badRequest('金币不足');
    }

    // 计算升星成功率
    const successRate = starUpConfig.successRate;
    const isSuccess = Math.random() < successRate;

    let result;
    if (isSuccess) {
      // 升星成功
      const newStar = currentStar + 1;
      const newStats = calculateStatsForLevel(userHero.level || 1, newStar);
      
      const updatedHero = await strapi.entityService.update('api::user-hero.user-hero', id, {
        data: {
          star: newStar,
          stats: newStats,
          power: calculatePower(newStats),
          updatedAt: new Date()
        }
      });

      result = {
        success: true,
        newRarity: newStar,
        materialsUsed: materials,
        goldUsed: gold,
        statsIncrease: {
          hp: newStats.hp - calculateStatsForLevel(userHero.level || 1, currentStar).hp,
          attack: newStats.attack - calculateStatsForLevel(userHero.level || 1, currentStar).attack,
          defense: newStats.defense - calculateStatsForLevel(userHero.level || 1, currentStar).defense,
          speed: newStats.speed - calculateStatsForLevel(userHero.level || 1, currentStar).speed
        },
        newSkillsUnlocked: [], // 新技能解锁逻辑
        compensationItems: []
      };

      console.log('✅ 武将升星成功:', { heroId: id, oldStar: currentStar, newStar });
    } else {
      // 升星失败，返还部分材料
      const compensationRate = 0.5; // 50%补偿
      const compensationItems = Object.entries(materials).map(([type, amount]: [string, any]) => ({
        type,
        amount: Math.floor(amount * compensationRate)
      }));

      result = {
        success: false,
        newRarity: currentStar,
        materialsUsed: materials,
        goldUsed: gold,
        statsIncrease: { hp: 0, attack: 0, defense: 0, speed: 0 },
        newSkillsUnlocked: [],
        compensationItems
      };

      console.log('❌ 武将升星失败，返还部分材料:', { heroId: id, compensationItems });
    }

    return {
      success: true,
      data: {
        hero: userHero,
        ...result
      }
    };

  } catch (error) {
    console.error('❌ 武将升星失败:', error);
    return {
      success: false,
      error: {
        status: 500,
        name: 'InternalServerError',
        message: '武将升星失败'
      }
    };
  }
};

/**
 * 技能升级
 */
const upgradeSkill = async (ctx: Context) => {
  try {
    const { id, skillId } = ctx.params;
    const { materials, gold } = ctx.request.body as any;
    const user = ctx.state.user;

    console.log('技能升级请求:', { heroId: id, skillId, materials, gold, userId: user.id });

    // 获取用户武将
    const userHero = await strapi.entityService.findOne('api::user-hero.user-hero', id, {
      populate: ['user']
    }) as any;

    if (!userHero || userHero.user?.id !== user.id) {
      return ctx.notFound('武将不存在或不属于当前用户');
    }

    const skillTree = userHero.skill_tree || {};
    const currentSkillLevel = skillTree[skillId] || 1;
    const maxSkillLevel = 10;

    if (currentSkillLevel >= maxSkillLevel) {
      return ctx.badRequest('技能已达到最高等级');
    }

    // 获取技能升级配置
    const skillUpgradeConfig = getSkillUpgradeConfig(currentSkillLevel);
    if (!skillUpgradeConfig) {
      return ctx.badRequest('技能升级配置不存在');
    }

    // 检查材料和金币
    const requiredMaterials = skillUpgradeConfig.materials;
    for (const [materialType, requiredAmount] of Object.entries(requiredMaterials)) {
      const providedAmount = materials[materialType] || 0;
      if (providedAmount < requiredAmount) {
        return ctx.badRequest(`${materialType}材料不足`);
      }
    }

    if (gold < skillUpgradeConfig.materials.gold) {
      return ctx.badRequest('金币不足');
    }

    // 升级技能
    const newSkillLevel = currentSkillLevel + 1;
    const updatedSkillTree = {
      ...skillTree,
      [skillId]: newSkillLevel
    };

    const updatedHero = await strapi.entityService.update('api::user-hero.user-hero', id, {
      data: {
        skill_tree: updatedSkillTree,
        updatedAt: new Date()
      }
    });

    console.log('✅ 技能升级成功:', { heroId: id, skillId, oldLevel: currentSkillLevel, newLevel: newSkillLevel });

    return {
      success: true,
      data: {
        skill: {
          id: skillId,
          level: newSkillLevel,
          maxLevel: maxSkillLevel
        },
        newLevel: newSkillLevel,
        materialsUsed: materials,
        goldUsed: gold,
        skillEffectIncrease: {
          damage: `+${newSkillLevel * 10}%`,
          description: `技能等级提升至${newSkillLevel}级`
        }
      }
    };

  } catch (error) {
    console.error('❌ 技能升级失败:', error);
    return {
      success: false,
      error: {
        status: 500,
        name: 'InternalServerError',
        message: '技能升级失败'
      }
    };
  }
};

/**
 * 辅助函数 - 计算等级所需经验
 */
function calculateExpForLevel(level: number): number {
  const base = 100;
  const growth = 1.1;
  return Math.floor(base * Math.pow(level, growth));
}

/**
 * 辅助函数 - 根据道具ID获取经验值
 */
function getItemExpValue(itemId: number): number {
  const expValues: Record<number, number> = {
    4: 50,    // 经验药水
    5: 200,   // 高级经验药水
    // 其他经验道具...
  };
  
  return expValues[itemId] || 0;
}

/**
 * 辅助函数 - 计算等级和星级对应的属性
 */
function calculateStatsForLevel(level: number, star: number): any {
  const baseStats = {
    hp: 3000,
    attack: 400,
    defense: 400,
    speed: 80
  };

  const starMultiplier = 1 + (star - 1) * 0.2;
  const levelMultiplier = 1 + (level - 1) * 0.1;

  return {
    hp: Math.floor(baseStats.hp * starMultiplier * levelMultiplier),
    attack: Math.floor(baseStats.attack * starMultiplier * levelMultiplier),
    defense: Math.floor(baseStats.defense * starMultiplier * levelMultiplier),
    speed: Math.floor(baseStats.speed * starMultiplier * levelMultiplier)
  };
}

/**
 * 辅助函数 - 计算战力
 */
function calculatePower(stats: any): number {
  return Math.floor(
    (stats.hp || 0) * 0.3 +
    (stats.attack || 0) * 1.0 +
    (stats.defense || 0) * 0.8 +
    (stats.speed || 0) * 0.5
  );
}

/**
 * 辅助函数 - 获取升星配置
 */
function getStarUpConfig(fromStar: number, toStar: number): any {
  const configs: Record<string, any> = {
    '1_2': {
      materials: { duplicates: 1, gold: 10000, upgradeStones: 5 },
      successRate: 1.0
    },
    '2_3': {
      materials: { duplicates: 2, gold: 25000, upgradeStones: 15 },
      successRate: 0.8
    },
    '3_4': {
      materials: { duplicates: 3, gold: 50000, upgradeStones: 30, rareGems: 5 },
      successRate: 0.6
    },
    '4_5': {
      materials: { duplicates: 5, gold: 100000, upgradeStones: 50, rareGems: 15, epicCrystals: 3 },
      successRate: 0.4
    },
    '5_6': {
      materials: { duplicates: 8, gold: 200000, upgradeStones: 100, rareGems: 30, epicCrystals: 10, legendaryEssence: 1 },
      successRate: 0.25
    }
  };

  return configs[`${fromStar}_${toStar}`];
}

/**
 * 辅助函数 - 获取技能升级配置
 */
function getSkillUpgradeConfig(currentLevel: number): any {
  if (currentLevel >= 1 && currentLevel <= 3) {
    return {
      materials: { skillBooks: 1, gold: 5000 }
    };
  } else if (currentLevel >= 4 && currentLevel <= 6) {
    return {
      materials: { skillBooks: 3, gold: 15000, wisdomScrolls: 1 }
    };
  } else if (currentLevel >= 7 && currentLevel <= 9) {
    return {
      materials: { skillBooks: 5, gold: 30000, wisdomScrolls: 3, masterTomes: 1 }
    };
  } else if (currentLevel === 10) {
    return {
      materials: { skillBooks: 10, gold: 50000, wisdomScrolls: 5, masterTomes: 3 }
    };
  }
  
  return null;
}

/**
 * 装备道具到武将
 */
const equipItem = async (ctx: Context) => {
  try {
    const { id, slot } = ctx.params;
    const { itemId } = ctx.request.body as any;
    const user = ctx.state.user;

    console.log('装备道具请求:', { heroId: id, slot, itemId, userId: user.id });

    // 获取用户武将
    const userHero = await strapi.entityService.findOne('api::user-hero.user-hero', id, {
      populate: ['user']
    }) as any;

    if (!userHero || userHero.user?.id !== user.id) {
      return ctx.notFound('武将不存在或不属于当前用户');
    }

    // 获取用户物品
    const userItem = await strapi.entityService.findMany('api::user-item.user-item', {
      filters: {
        user: user.id,
        item_template: itemId
      },
      populate: ['item_template']
    }) as any;

    if (!userItem || userItem.length === 0) {
      return ctx.badRequest('物品不存在或不属于当前用户');
    }

    const item = userItem[0];
    const itemTemplate = item.item_template;

    // 验证物品是否为装备类型
    if (itemTemplate.category !== 'equipment') {
      return ctx.badRequest('物品不是装备类型');
    }

    // 验证装备槽位是否正确
    const validSlots = ['weapon', 'armor', 'helmet', 'boots', 'accessory1', 'accessory2'];
    if (!validSlots.includes(slot)) {
      return ctx.badRequest('无效的装备槽位');
    }

    // 获取当前武将装备配置
    const equipment = userHero.equipment || {};
    const previousItem = equipment[slot] || null;

    // 计算装备属性加成
    const equipmentStats = calculateEquipmentStats(itemTemplate);
    const previousStats = previousItem ? calculateEquipmentStats(previousItem) : {};

    // 更新武将装备
    const newEquipment = {
      ...equipment,
      [slot]: {
        itemId: itemTemplate.item_id,
        name: itemTemplate.name,
        rarity: itemTemplate.rarity,
        enhanceLevel: item.metadata?.enhanceLevel || 0,
        stats: equipmentStats
      }
    };

    // 重新计算武将总属性
    const baseStats = calculateStatsForLevel(userHero.level || 1, userHero.star || 1);
    const totalEquipmentStats = calculateTotalEquipmentStats(newEquipment);
    const finalStats = {
      hp: baseStats.hp + totalEquipmentStats.hp,
      attack: baseStats.attack + totalEquipmentStats.attack,
      defense: baseStats.defense + totalEquipmentStats.defense,
      speed: baseStats.speed + totalEquipmentStats.speed
    };

    // 更新武将数据
    const updatedHero = await strapi.entityService.update('api::user-hero.user-hero', id, {
      data: {
        equipment: newEquipment,
        power: calculatePower(finalStats),
        updatedAt: new Date()
      }
    });

    // 如果有之前的装备，返还到背包
    if (previousItem) {
      await returnItemToInventory(user.id, previousItem.itemId);
    }

    // 从背包中移除装备的物品
    if (item.quantity > 1) {
      await strapi.entityService.update('api::user-item.user-item', item.id, {
        data: { quantity: item.quantity - 1 }
      });
    } else {
      await strapi.entityService.delete('api::user-item.user-item', item.id);
    }

    console.log('✅ 装备成功:', { heroId: id, slot, itemName: itemTemplate.name });

    return {
      success: true,
      data: {
        hero: updatedHero,
        equippedItem: newEquipment[slot],
        previousItem,
        statsChange: {
          hp: equipmentStats.hp - (previousStats.hp || 0),
          attack: equipmentStats.attack - (previousStats.attack || 0),
          defense: equipmentStats.defense - (previousStats.defense || 0),
          speed: equipmentStats.speed - (previousStats.speed || 0)
        }
      }
    };

  } catch (error) {
    console.error('❌ 装备失败:', error);
    return {
      success: false,
      error: {
        status: 500,
        name: 'InternalServerError',
        message: '装备失败'
      }
    };
  }
};

/**
 * 卸下装备
 */
const unequipItem = async (ctx: Context) => {
  try {
    const { id, slot } = ctx.params;
    const user = ctx.state.user;

    console.log('卸下装备请求:', { heroId: id, slot, userId: user.id });

    // 获取用户武将
    const userHero = await strapi.entityService.findOne('api::user-hero.user-hero', id, {
      populate: ['user']
    }) as any;

    if (!userHero || userHero.user?.id !== user.id) {
      return ctx.notFound('武将不存在或不属于当前用户');
    }

    const equipment = userHero.equipment || {};
    const unequippedItem = equipment[slot];

    if (!unequippedItem) {
      return ctx.badRequest('该装备槽位为空');
    }

    // 移除装备
    const newEquipment = { ...equipment };
    delete newEquipment[slot];

    // 重新计算属性
    const baseStats = calculateStatsForLevel(userHero.level || 1, userHero.star || 1);
    const totalEquipmentStats = calculateTotalEquipmentStats(newEquipment);
    const finalStats = {
      hp: baseStats.hp + totalEquipmentStats.hp,
      attack: baseStats.attack + totalEquipmentStats.attack,
      defense: baseStats.defense + totalEquipmentStats.defense,
      speed: baseStats.speed + totalEquipmentStats.speed
    };

    // 更新武将数据
    const updatedHero = await strapi.entityService.update('api::user-hero.user-hero', id, {
      data: {
        equipment: newEquipment,
        power: calculatePower(finalStats),
        updatedAt: new Date()
      }
    });

    // 返还装备到背包
    await returnItemToInventory(user.id, unequippedItem.itemId);

    console.log('✅ 卸下装备成功:', { heroId: id, slot, itemName: unequippedItem.name });

    return {
      success: true,
      data: {
        hero: updatedHero,
        unequippedItem,
        statsChange: {
          hp: -unequippedItem.stats.hp,
          attack: -unequippedItem.stats.attack,
          defense: -unequippedItem.stats.defense,
          speed: -unequippedItem.stats.speed
        }
      }
    };

  } catch (error) {
    console.error('❌ 卸下装备失败:', error);
    return {
      success: false,
      error: {
        status: 500,
        name: 'InternalServerError',
        message: '卸下装备失败'
      }
    };
  }
};

/**
 * 装备强化
 */
const enhanceEquipment = async (ctx: Context) => {
  try {
    const { id, slot } = ctx.params;
    const { materials, gold, targetLevel } = ctx.request.body as any;
    const user = ctx.state.user;

    console.log('装备强化请求:', { heroId: id, slot, materials, gold, targetLevel, userId: user.id });

    // 获取用户武将
    const userHero = await strapi.entityService.findOne('api::user-hero.user-hero', id, {
      populate: ['user']
    }) as any;

    if (!userHero || userHero.user?.id !== user.id) {
      return ctx.notFound('武将不存在或不属于当前用户');
    }

    const equipment = userHero.equipment || {};
    const targetEquipment = equipment[slot];

    if (!targetEquipment) {
      return ctx.badRequest('该装备槽位为空');
    }

    const currentLevel = targetEquipment.enhanceLevel || 0;
    const maxLevel = 15;
    const newLevel = Math.min(targetLevel || currentLevel + 1, maxLevel);

    if (currentLevel >= maxLevel) {
      return ctx.badRequest('装备已达到最高强化等级');
    }

    // 获取强化配置
    const enhanceConfig = getEnhanceConfig(newLevel);
    if (!enhanceConfig) {
      return ctx.badRequest('强化配置不存在');
    }

    // 检查材料和金币
    const requiredGold = enhanceConfig.goldCost;
    if (gold < requiredGold) {
      return ctx.badRequest('金币不足');
    }

    // 计算强化成功率
    const successRate = enhanceConfig.successRate;
    const isSuccess = Math.random() < successRate;

    let result;
    if (isSuccess || newLevel <= 10) { // 1-10级必定成功
      // 强化成功
      const newEquipment = {
        ...equipment,
        [slot]: {
          ...targetEquipment,
          enhanceLevel: newLevel,
          stats: calculateEquipmentStats({
            ...targetEquipment,
            enhanceLevel: newLevel
          })
        }
      };

      // 重新计算武将属性
      const baseStats = calculateStatsForLevel(userHero.level || 1, userHero.star || 1);
      const totalEquipmentStats = calculateTotalEquipmentStats(newEquipment);
      const finalStats = {
        hp: baseStats.hp + totalEquipmentStats.hp,
        attack: baseStats.attack + totalEquipmentStats.attack,
        defense: baseStats.defense + totalEquipmentStats.defense,
        speed: baseStats.speed + totalEquipmentStats.speed
      };

      const updatedHero = await strapi.entityService.update('api::user-hero.user-hero', id, {
        data: {
          equipment: newEquipment,
          power: calculatePower(finalStats),
          updatedAt: new Date()
        }
      });

      result = {
        success: true,
        newLevel,
        goldUsed: requiredGold,
        statsIncrease: {
          hp: newEquipment[slot].stats.hp - targetEquipment.stats.hp,
          attack: newEquipment[slot].stats.attack - targetEquipment.stats.attack,
          defense: newEquipment[slot].stats.defense - targetEquipment.stats.defense,
          speed: newEquipment[slot].stats.speed - targetEquipment.stats.speed
        }
      };

      console.log('✅ 装备强化成功:', { heroId: id, slot, oldLevel: currentLevel, newLevel });
    } else {
      // 强化失败
      let finalLevel = currentLevel;
      
      // 11级以上失败可能降级
      if (currentLevel >= 11 && enhanceConfig.canDowngrade) {
        finalLevel = Math.max(currentLevel - 1, 10);
      }

      if (finalLevel !== currentLevel) {
        const newEquipment = {
          ...equipment,
          [slot]: {
            ...targetEquipment,
            enhanceLevel: finalLevel,
            stats: calculateEquipmentStats({
              ...targetEquipment,
              enhanceLevel: finalLevel
            })
          }
        };

        await strapi.entityService.update('api::user-hero.user-hero', id, {
          data: { equipment: newEquipment }
        });
      }

      result = {
        success: false,
        newLevel: finalLevel,
        goldUsed: requiredGold,
        statsIncrease: { hp: 0, attack: 0, defense: 0, speed: 0 }
      };

      console.log('❌ 装备强化失败:', { heroId: id, slot, level: currentLevel, finalLevel });
    }

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('❌ 装备强化失败:', error);
    return {
      success: false,
      error: {
        status: 500,
        name: 'InternalServerError',
        message: '装备强化失败'
      }
    };
  }
};

/**
 * 获取武将装备信息
 */
const getEquipment = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const user = ctx.state.user;

    // 获取用户武将
    const userHero = await strapi.entityService.findOne('api::user-hero.user-hero', id, {
      populate: ['user']
    }) as any;

    if (!userHero || userHero.user?.id !== user.id) {
      return ctx.notFound('武将不存在或不属于当前用户');
    }

    const equipment = userHero.equipment || {};
    const equipmentSlots = [
      { id: 'weapon', name: '武器', primaryStat: 'attack' },
      { id: 'armor', name: '护甲', primaryStat: 'defense' },
      { id: 'helmet', name: '头盔', primaryStat: 'hp' },
      { id: 'boots', name: '靴子', primaryStat: 'speed' },
      { id: 'accessory1', name: '饰品1', primaryStat: 'critical' },
      { id: 'accessory2', name: '饰品2', primaryStat: 'resistance' }
    ];

    const equipmentDetails = equipmentSlots.map(slot => ({
      slot: slot.id,
      name: slot.name,
      primaryStat: slot.primaryStat,
      item: equipment[slot.id] || null,
      isEmpty: !equipment[slot.id]
    }));

    const totalStats = calculateTotalEquipmentStats(equipment);

    return {
      success: true,
      data: {
        heroId: id,
        equipment: equipmentDetails,
        totalStats,
        enhanceMaterials: ['强化石', '精炼石', '传说精华']
      }
    };

  } catch (error) {
    console.error('❌ 获取装备信息失败:', error);
    return {
      success: false,
      error: {
        status: 500,
        name: 'InternalServerError',
        message: '获取装备信息失败'
      }
    };
  }
};

/**
 * 辅助函数 - 计算装备属性
 */
function calculateEquipmentStats(equipment: any): any {
  const baseStats = {
    hp: 0,
    attack: 0,
    defense: 0,
    speed: 0
  };

  if (!equipment) return baseStats;

  const enhanceLevel = equipment.enhanceLevel || 0;
  const rarity = equipment.rarity || 1;
  
  // 基础属性值
  const baseValues: Record<string, number> = {
    hp: 300 * rarity,
    attack: 50 * rarity,
    defense: 40 * rarity,
    speed: 8 * rarity
  };

  // 强化加成 (每级+10%)
  const enhanceMultiplier = 1 + (enhanceLevel * 0.1);

  return {
    hp: Math.floor(baseValues.hp * enhanceMultiplier),
    attack: Math.floor(baseValues.attack * enhanceMultiplier),
    defense: Math.floor(baseValues.defense * enhanceMultiplier),
    speed: Math.floor(baseValues.speed * enhanceMultiplier)
  };
}

/**
 * 辅助函数 - 计算总装备属性
 */
function calculateTotalEquipmentStats(equipment: any): any {
  const totalStats = { hp: 0, attack: 0, defense: 0, speed: 0 };

  Object.values(equipment).forEach((item: any) => {
    if (item && item.stats) {
      totalStats.hp += item.stats.hp || 0;
      totalStats.attack += item.stats.attack || 0;
      totalStats.defense += item.stats.defense || 0;
      totalStats.speed += item.stats.speed || 0;
    }
  });

  return totalStats;
}

/**
 * 辅助函数 - 获取强化配置
 */
function getEnhanceConfig(level: number): any {
  const configs: Record<number, any> = {};
  
  // 1-5级: 100%成功率
  for (let i = 1; i <= 5; i++) {
    configs[i] = {
      goldCost: 1000 * i,
      successRate: 1.0,
      canDowngrade: false
    };
  }
  
  // 6-10级: 80%成功率
  for (let i = 6; i <= 10; i++) {
    configs[i] = {
      goldCost: 2000 * i,
      successRate: 0.8,
      canDowngrade: false
    };
  }
  
  // 11-12级: 60%成功率，失败可能降级
  for (let i = 11; i <= 12; i++) {
    configs[i] = {
      goldCost: 5000 * i,
      successRate: 0.6,
      canDowngrade: true
    };
  }
  
  // 13-14级: 40%成功率，失败可能降级
  for (let i = 13; i <= 14; i++) {
    configs[i] = {
      goldCost: 10000 * i,
      successRate: 0.4,
      canDowngrade: true
    };
  }
  
  // 15级: 20%成功率，失败可能降级
  configs[15] = {
    goldCost: 50000,
    successRate: 0.2,
    canDowngrade: true
  };

  return configs[level];
}

/**
 * 辅助函数 - 返还物品到背包
 */
async function returnItemToInventory(userId: number, itemId: number): Promise<void> {
  try {
    // 查找用户是否已有该物品
    const existingItem = await strapi.entityService.findMany('api::user-item.user-item', {
      filters: {
        user: { id: userId },
        item_template: { id: itemId }
      }
    }) as any;

    if (existingItem && existingItem.length > 0) {
      // 增加数量
      await strapi.entityService.update('api::user-item.user-item', existingItem[0].id, {
        data: {
          quantity: existingItem[0].quantity + 1
        }
      });
    } else {
      // 创建新物品
      await strapi.entityService.create('api::user-item.user-item', {
        data: {
          user: { id: userId },
          item_template: { id: itemId },
          quantity: 1,
          acquired_at: new Date(),
          is_locked: false
        }
      });
    }
  } catch (error) {
    console.error('返还物品到背包失败:', error);
  }
}

