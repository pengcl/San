/**
 * 召唤系统控制器
 * 实现武将召唤、碎片合成等功能
 */

import { Context } from 'koa';

// 召唤配置
const SUMMON_CONFIG = {
  normal: {
    cost: { type: 'gold', amount: 10000 },
    rates: {
      1: 0.50, // 50% 普通品质
      2: 0.30, // 30% 优秀品质  
      3: 0.15, // 15% 精良品质
      4: 0.04, // 4% 史诗品质
      5: 0.01, // 1% 传说品质
      6: 0.00  // 0% 神话品质
    }
  },
  premium: {
    cost: { type: 'gems', amount: 300 },
    rates: {
      1: 0.10, // 10% 普通品质
      2: 0.25, // 25% 优秀品质
      3: 0.35, // 35% 精良品质  
      4: 0.20, // 20% 史诗品质
      5: 0.08, // 8% 传说品质
      6: 0.02  // 2% 神话品质
    }
  }
};

// 碎片合成要求
const FRAGMENT_REQUIREMENTS = {
  1: 10, 2: 20, 3: 50, 4: 80, 5: 100, 6: 150
};

module.exports = {
  /**
   * 普通召唤 - 使用金币
   */
  async normalSummon(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { count = 1 } = ctx.request.body;
      if (count < 1 || count > 10) {
        return ctx.badRequest('召唤次数必须在1-10之间');
      }

      const totalCost = SUMMON_CONFIG.normal.cost.amount * count;

      // 检查用户资源
      const userProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
        where: { user: user.id }
      });

      if (!userProfile || userProfile.gold < totalCost) {
        return ctx.badRequest('金币不足');
      }

      // 执行召唤
      const results = [];
      for (let i = 0; i < count; i++) {
        const result = await performSummon(user.id, 'normal');
        results.push(result);
      }

      // 扣除金币
      await strapi.db.query('api::user-profile.user-profile').update({
        where: { user: user.id },
        data: { 
          gold: userProfile.gold - totalCost
        }
      });

      ctx.body = {
        success: true,
        data: {
          results,
          totalCost,
          newHeroesCount: results.filter(r => r.isNewHero).length,
          totalFragments: results.reduce((sum, r) => sum + r.fragments, 0)
        }
      };
    } catch (error) {
      console.error('普通召唤错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'NORMAL_SUMMON_ERROR',
          message: '普通召唤失败'
        }
      };
    }
  },

  /**
   * 高级召唤 - 使用钻石
   */
  async premiumSummon(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { count = 1 } = ctx.request.body;
      if (count < 1 || count > 10) {
        return ctx.badRequest('召唤次数必须在1-10之间');
      }

      const totalCost = SUMMON_CONFIG.premium.cost.amount * count;

      // 检查用户资源
      const userProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
        where: { user: user.id }
      });

      if (!userProfile || userProfile.gems < totalCost) {
        return ctx.badRequest('钻石不足');
      }

      // 执行召唤
      const results = [];
      for (let i = 0; i < count; i++) {
        const result = await performSummon(user.id, 'premium');
        results.push(result);
      }

      // 扣除钻石
      await strapi.db.query('api::user-profile.user-profile').update({
        where: { user: user.id },
        data: { 
          gems: userProfile.gems - totalCost
        }
      });

      ctx.body = {
        success: true,
        data: {
          results,
          totalCost,
          newHeroesCount: results.filter(r => r.isNewHero).length,
          totalFragments: results.reduce((sum, r) => sum + r.fragments, 0)
        }
      };
    } catch (error) {
      console.error('高级召唤错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'PREMIUM_SUMMON_ERROR',
          message: '高级召唤失败'
        }
      };
    }
  },

  /**
   * 获取召唤历史
   */
  async getSummonHistory(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { page = 1, limit = 20 } = ctx.query;
      const pageNum = parseInt(String(page));
      const limitNum = parseInt(String(limit));

      const history = await strapi.db.query('api::summon.summon').findMany({
        where: { user: user.id },
        populate: {
          summoned_hero: {
            populate: {
              quality: true,
              faction: true
            }
          }
        },
        orderBy: { summon_time: 'desc' },
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      });

      const total = await strapi.db.query('api::summon.summon').count({
        where: { user: user.id }
      });

      ctx.body = {
        success: true,
        data: {
          history,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      };
    } catch (error) {
      console.error('获取召唤历史错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_SUMMON_HISTORY_ERROR',
          message: '获取召唤历史失败'
        }
      };
    }
  },

  /**
   * 获取召唤配置和概率
   */
  async getSummonRates(ctx: Context) {
    try {
      ctx.body = {
        success: true,
        data: {
          normal: {
            cost: SUMMON_CONFIG.normal.cost,
            rates: SUMMON_CONFIG.normal.rates,
            description: '使用金币召唤，主要获得低品质武将'
          },
          premium: {
            cost: SUMMON_CONFIG.premium.cost,
            rates: SUMMON_CONFIG.premium.rates,
            description: '使用钻石召唤，有更高概率获得高品质武将'
          },
          fragmentRequirements: FRAGMENT_REQUIREMENTS
        }
      };
    } catch (error) {
      console.error('获取召唤配置错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_SUMMON_RATES_ERROR',
          message: '获取召唤配置失败'
        }
      };
    }
  },

  /**
   * 使用碎片合成武将
   */
  async synthesizeHero(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { heroId, star = 1 } = ctx.request.body;
      if (!heroId || star < 1 || star > 6) {
        return ctx.badRequest('参数无效');
      }

      const requiredFragments = FRAGMENT_REQUIREMENTS[star];

      // 检查碎片数量
      const userItem = await strapi.db.query('api::user-item.user-item').findOne({
        where: { 
          user: user.id,
          item_template: { item_type: 'hero_fragment', target_hero: heroId }
        }
      });

      if (!userItem || userItem.quantity < requiredFragments) {
        return ctx.badRequest('碎片数量不足');
      }

      // 检查是否已拥有该武将
      const existingHero = await strapi.db.query('api::user-hero.user-hero').findOne({
        where: {
          user: user.id,
          hero: heroId
        }
      });

      let result;
      if (existingHero) {
        // 已拥有，增加星级或转换为碎片
        result = {
          type: 'upgrade',
          heroId,
          message: '武将已拥有，转换为额外碎片'
        };
      } else {
        // 新武将，创建
        await strapi.db.query('api::user-hero.user-hero').create({
          data: {
            user: user.id,
            hero: heroId,
            level: 1,
            star: star,
            experience: 0,
            is_locked: false,
            obtained_at: new Date()
          }
        });

        result = {
          type: 'new_hero',
          heroId,
          star,
          message: '成功合成新武将'
        };
      }

      // 扣除碎片
      await strapi.db.query('api::user-item.user-item').update({
        where: { id: userItem.id },
        data: {
          quantity: userItem.quantity - requiredFragments
        }
      });

      ctx.body = {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('合成武将错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'SYNTHESIZE_HERO_ERROR',
          message: '合成武将失败'
        }
      };
    }
  }
};

// 辅助函数

async function performSummon(userId: number, summonType: 'normal' | 'premium') {
  // 随机选择品质
  const quality = getRandomQuality(SUMMON_CONFIG[summonType].rates);
  
  // 根据品质随机选择武将
  const hero = await getRandomHeroByQuality(quality);
  
  if (!hero) {
    throw new Error(`无法找到品质为 ${quality} 的武将`);
  }

  // 检查是否已拥有该武将
  const existingHero = await strapi.db.query('api::user-hero.user-hero').findOne({
    where: {
      user: userId,
      hero: hero.id
    }
  });

  let isNewHero = !existingHero;
  let fragments = 0;

  if (existingHero) {
    // 已拥有，转换为碎片
    fragments = getFragmentsByQuality(quality);
    
    // 添加碎片到背包
    await addFragmentsToUser(userId, hero.id, fragments);
  } else {
    // 新武将，直接添加
    await strapi.db.query('api::user-hero.user-hero').create({
      data: {
        user: userId,
        hero: hero.id,
        level: 1,
        star: quality,
        experience: 0,
        is_locked: false,
        obtained_at: new Date()
      }
    });
  }

  // 记录召唤历史
  await strapi.db.query('api::summon.summon').create({
    data: {
      user: userId,
      summon_type: summonType,
      cost_type: SUMMON_CONFIG[summonType].cost.type,
      cost_amount: SUMMON_CONFIG[summonType].cost.amount,
      summoned_hero: hero.id,
      hero_star: quality,
      is_new_hero: isNewHero,
      fragments_gained: fragments,
      summon_time: new Date()
    }
  });

  return {
    heroId: hero.id,
    heroName: hero.name,
    quality,
    qualityName: hero.quality?.name || `${quality}星`,
    qualityColor: hero.quality?.color || '#888888',
    isNewHero,
    fragments
  };
}

function getRandomQuality(rates: Record<number, number>): number {
  const random = Math.random();
  let accumulated = 0;
  
  for (const [quality, rate] of Object.entries(rates)) {
    accumulated += rate;
    if (random <= accumulated) {
      return parseInt(quality);
    }
  }
  
  return 1; // 默认返回1星
}

async function getRandomHeroByQuality(quality: number) {
  const heroes = await strapi.db.query('api::hero.hero').findMany({
    where: { quality },
    populate: { quality: true }
  });
  
  if (heroes.length === 0) {
    return null;
  }
  
  return heroes[Math.floor(Math.random() * heroes.length)];
}

function getFragmentsByQuality(quality: number): number {
  // 根据品质返回不同数量的碎片
  const fragmentMap = { 1: 1, 2: 2, 3: 5, 4: 10, 5: 20, 6: 50 };
  return fragmentMap[quality] || 1;
}

async function addFragmentsToUser(userId: number, heroId: number, fragmentCount: number) {
  // 查找或创建碎片物品
  const existingItem = await strapi.db.query('api::user-item.user-item').findOne({
    where: {
      user: userId,
      item_template: { item_type: 'hero_fragment', target_hero: heroId }
    }
  });

  if (existingItem) {
    // 增加碎片数量
    await strapi.db.query('api::user-item.user-item').update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + fragmentCount
      }
    });
  } else {
    // 创建新的碎片物品
    const fragmentTemplate = await strapi.db.query('api::item-template.item-template').findOne({
      where: { item_type: 'hero_fragment', target_hero: heroId }
    });

    if (fragmentTemplate) {
      await strapi.db.query('api::user-item.user-item').create({
        data: {
          user: userId,
          item_template: fragmentTemplate.id,
          quantity: fragmentCount,
          obtained_at: new Date()
        }
      });
    }
  }
}