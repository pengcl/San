/**
 * 武将系统控制器
 * 基于API规范 hero-apis.json 实现
 */

import { Context } from 'koa';

// 从游戏规则配置读取数值
const HERO_SYSTEM_CONFIG = {
  maxLevel: 100,
  experienceFormula: {
    base: 100,
    growth: 1.1
  },
  statGrowth: {
    hp: { perLevel: 50, rarityMultiplier: [1.0, 1.2, 1.5, 2.0, 2.5, 3.0] },
    attack: { perLevel: 10, rarityMultiplier: [1.0, 1.2, 1.5, 2.0, 2.5, 3.0] },
    defense: { perLevel: 8, rarityMultiplier: [1.0, 1.2, 1.5, 2.0, 2.5, 3.0] },
    speed: { perLevel: 2, rarityMultiplier: [1.0, 1.1, 1.25, 1.5, 1.75, 2.0] }
  },
  summonRates: {
    normal: { 1: 0.6, 2: 0.3, 3: 0.09, 4: 0.01, 5: 0.001, 6: 0.0001 },
    premium: { 3: 0.6, 4: 0.3, 5: 0.08, 6: 0.02 }
  },
  summonCosts: {
    normal: { gold: 10000 },
    premium: { gems: 280 },
    newbie: { gems: 0 } // 新手召唤免费
  },
  newbieSummonRates: {
    // 新手召唤保证高品质武将
    guaranteed: { 3: 0.3, 4: 0.5, 5: 0.2 } // 3-5星武将，比普通召唤概率高很多
  }
};

export default {
  /**
   * 获取武将列表
   */
  async find(ctx: Context) {
    try {
      const user = ctx.state.user;
      
      // 如果没有用户认证，返回武将模板数据（公开访问）
      if (!user) {
        return this.findHeroTemplates(ctx);
      }

      const { 
        page = 1, 
        limit = 20, 
        sort = 'power', 
        order = 'desc',
        faction,
        rarity,
        unitType 
      } = ctx.query;

      // 构建查询条件
      const where: any = { user: user.id };
      
      // 添加过滤条件
      const populate = {
        hero: {
          populate: {
            quality: true,
            faction: true,
            unit_type: true
          }
        }
      };

      // 获取用户武将列表
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const orderBy = { [sort as string]: order };
      
      const userHeroes = await strapi.db.query('api::user-hero.user-hero').findWithCount({
        where,
        populate,
        orderBy,
        offset: (pageNum - 1) * limitNum,
        limit: limitNum
      });

      // 过滤条件应用
      let filteredHeroes = userHeroes[0];
      if (faction) {
        filteredHeroes = filteredHeroes.filter(uh => uh.hero?.faction?.faction_id === faction);
      }
      if (rarity) {
        filteredHeroes = filteredHeroes.filter(uh => uh.star >= parseInt(rarity as string));
      }
      if (unitType) {
        filteredHeroes = filteredHeroes.filter(uh => uh.hero?.unit_type?.type_id === unitType);
      }

      // 格式化响应数据
      const heroes = filteredHeroes.map(userHero => {
        const hero = userHero.hero;
        if (!hero) {
          console.warn('User hero missing hero data:', userHero.id);
          return null;
        }
        const stats = calculateCurrentStats(hero, userHero.level, userHero.star);
        
        // 使用相同的临时逻辑来获取武将属性
        const { faction, unitType, quality, qualityName, qualityColor } = getHeroRelationships(hero.hero_id);
        
        return {
          id: userHero.id,
          heroId: hero.hero_id,
          name: hero.name,
          level: userHero.level,
          experience: userHero.exp,
          rarity: userHero.star,
          faction: hero.faction?.faction_id || faction,
          unitType: hero.unit_type?.type_id || unitType,
          quality: hero.quality?.quality_id || quality,
          qualityName: hero.quality?.name_zh || qualityName,
          qualityColor: hero.quality?.color_hex || qualityColor,
          power: userHero.power,
          stats,
          skills: [], // TODO: 实现技能系统
          equipment: [], // TODO: 实现装备系统
          awakening: {
            stage: userHero.breakthrough,
            isAwakened: userHero.breakthrough > 0
          },
          avatar: hero.avatar_url,
          acquiredAt: userHero.createdAt
        };
      }).filter(hero => hero !== null);

      const pagination = {
        page: pageNum,
        limit: limitNum,
        total: userHeroes[1],
        totalPages: Math.ceil(userHeroes[1] / limitNum)
      };

      ctx.body = {
        success: true,
        data: {
          heroes,
          pagination
        }
      };
    } catch (error) {
      console.error('获取武将列表错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_HEROES_ERROR',
          message: '获取武将列表失败'
        }
      };
    }
  },

  /**
   * 获取武将模板详情（公开访问，用于武将详情页面）
   */
  async findHeroTemplate(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      // 获取武将模板数据
      const heroId = Number(id);
      const heroRelations = getHeroRelationships(heroId);
      
      if (!heroRelations) {
        ctx.status = 404;
        return ctx.body = {
          success: false,
          error: {
            code: 'HERO_NOT_FOUND',
            message: '武将不存在'
          }
        };
      }

      // 获取武将基础信息
      const heroInfo = getHeroInfo(heroId);
      
      // 构建武将详情数据
      const heroDetail = {
        id: heroId,
        name: heroInfo.name,
        description: heroInfo.description,
        faction: heroRelations.faction,
        unitType: heroRelations.unitType,
        quality: heroRelations.quality,
        qualityName: heroRelations.qualityName,
        qualityColor: heroRelations.qualityColor,
        baseStats: heroInfo.baseStats,
        skills: [], // TODO: 实现技能系统
        avatar: null,
        cardImage: null,
        rarity: heroRelations.quality,
        level: 1, // 模板默认等级
        experience: 0,
        base_hp: heroInfo.baseStats.hp,
        base_attack: heroInfo.baseStats.attack,
        base_defense: heroInfo.baseStats.defense,
        base_speed: heroInfo.baseStats.speed
      };

      ctx.body = {
        success: true,
        data: heroDetail
      };
    } catch (error) {
      console.error('获取武将模板详情错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_HERO_TEMPLATE_ERROR',
          message: '获取武将模板详情失败'
        }
      };
    }
  },

  /**
   * 获取武将详情
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
        ctx.status = 404;
        return ctx.body = {
          success: false,
          error: {
            code: 'HERO_NOT_FOUND',
            message: '武将不存在或不属于当前用户'
          }
        };
      }

      const hero = userHero.hero;
      const currentStats = calculateCurrentStats(hero, userHero.level, userHero.star);
      const maxExperience = calculateRequiredExperience(userHero.level + 1);

      const heroDetail = {
        id: userHero.id,
        heroId: hero.hero_id,
        name: hero.name,
        title: hero.description || '',
        description: hero.description,
        level: userHero.level,
        experience: userHero.exp,
        maxExperience,
        rarity: userHero.star,
        faction: hero.faction?.faction_id || 'unknown',
        unitType: hero.unit_type?.type_id || 'unknown',
        power: userHero.power,
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
        equipment: [], // TODO: 实现装备系统
        awakening: {
          stage: userHero.breakthrough,
          isAwakened: userHero.breakthrough > 0,
          nextStageRequirements: userHero.breakthrough < 3 ? getAwakeningRequirements(userHero.breakthrough + 1) : null
        },
        bonds: [], // TODO: 实现羁绊系统
        avatar: hero.avatar_url,
        cardImage: hero.avatar_url,
        acquiredAt: userHero.createdAt,
        lastUsed: userHero.updatedAt
      };

      ctx.body = {
        success: true,
        data: heroDetail
      };
    } catch (error) {
      console.error('获取武将详情错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_HERO_DETAIL_ERROR',
          message: '获取武将详情失败'
        }
      };
    }
  },

  /**
   * 武将升级
   */
  async levelUp(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('未认证');
      }

      const { id } = ctx.params;
      const { useItems = [], useGold = 0, targetLevel } = ctx.request.body;

      // 获取用户武将
      const userHero = await strapi.db.query('api::user-hero.user-hero').findOne({
        where: { id: Number(id), user: user.id },
        populate: { hero: true }
      });

      if (!userHero) {
        return ctx.badRequest('武将不存在');
      }

      // 获取用户档案
      const userProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
        where: { user: user.id }
      });

      if (!userProfile) {
        return ctx.badRequest('用户档案不存在');
      }

      // 检查资源是否足够
      if (useGold > userProfile.gold) {
        return ctx.badRequest('金币不足');
      }

      const currentLevel = userHero.level;
      const maxLevel = Math.min(targetLevel || currentLevel + 1, HERO_SYSTEM_CONFIG.maxLevel, userProfile.level);

      if (currentLevel >= maxLevel) {
        return ctx.badRequest('已达到最大等级');
      }

      // 计算所需经验
      let totalExpNeeded = 0;
      for (let level = currentLevel; level < maxLevel; level++) {
        totalExpNeeded += calculateRequiredExperience(level + 1);
      }

      let availableExp = userHero.exp;
      
      // 添加金币转换的经验 (1金币 = 10经验)
      if (useGold > 0) {
        availableExp += useGold * 10;
      }

      // TODO: 添加道具转换的经验
      for (const item of useItems) {
        // 这里应该查询道具并计算经验值
        // availableExp += item.quantity * item.expValue;
      }

      if (availableExp < totalExpNeeded) {
        return ctx.badRequest('经验不足');
      }

      // 执行升级
      const levelsGained = maxLevel - currentLevel;
      const finalLevel = maxLevel;
      const remainingExp = availableExp - totalExpNeeded;

      // 计算属性提升
      const oldStats = calculateCurrentStats(userHero.hero, currentLevel, userHero.star);
      const newStats = calculateCurrentStats(userHero.hero, finalLevel, userHero.star);
      const statsIncrease = {
        hp: newStats.hp - oldStats.hp,
        attack: newStats.attack - oldStats.attack,
        defense: newStats.defense - oldStats.defense,
        speed: newStats.speed - oldStats.speed
      };

      // 更新武将
      const updatedHero = await strapi.db.query('api::user-hero.user-hero').update({
        where: { id: Number(id) },
        data: {
          level: finalLevel,
          exp: remainingExp,
          power: calculatePower(newStats)
        }
      });

      // 扣除金币
      if (useGold > 0) {
        await strapi.db.query('api::user-profile.user-profile').update({
          where: { id: userProfile.id },
          data: {
            gold: userProfile.gold - useGold
          }
        });
      }

      ctx.body = {
        success: true,
        data: {
          hero: updatedHero,
          levelsGained,
          experienceGained: totalExpNeeded,
          costsUsed: {
            gold: useGold,
            items: useItems
          },
          statsIncrease,
          newSkillsUnlocked: [] // TODO: 实现技能解锁
        }
      };
    } catch (error) {
      console.error('武将升级错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'LEVEL_UP_ERROR',
          message: '武将升级失败'
        }
      };
    }
  },

  /**
   * 武将图鉴
   */
  async library(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('未认证');
      }

      const { faction, rarity, owned } = ctx.query;

      // 获取所有武将模板
      let where: any = {};
      if (faction) {
        where['faction.faction_id'] = faction;
      }

      const allHeroes = await strapi.db.query('api::hero.hero').findMany({
        where,
        populate: {
          quality: true,
          faction: true,
          unit_type: true
        }
      });

      // 获取用户拥有的武将
      const userHeroes = await strapi.db.query('api::user-hero.user-hero').findMany({
        where: { user: user.id },
        populate: { hero: true }
      });

      const ownedHeroIds = new Set(userHeroes.map(uh => uh.hero.id));

      // 过滤和格式化
      let filteredHeroes = allHeroes;
      
      if (rarity) {
        filteredHeroes = filteredHeroes.filter(hero => 
          hero.quality && hero.quality.quality_id >= parseInt(rarity as string)
        );
      }

      if (owned !== undefined) {
        const isOwned = owned === 'true';
        filteredHeroes = filteredHeroes.filter(hero => 
          ownedHeroIds.has(hero.id) === isOwned
        );
      }

      const heroes = filteredHeroes.map(hero => {
        // 使用临时逻辑获取武将属性
        const { faction, unitType, quality, qualityName, qualityColor } = getHeroRelationships(hero.hero_id);
        
        return {
          id: hero.hero_id,
          name: hero.name,
          title: hero.description || '',
          faction: hero.faction?.faction_id || faction,
          rarity: hero.quality?.quality_id || quality,
          qualityName: hero.quality?.name_zh || qualityName,
          qualityColor: hero.quality?.color_hex || qualityColor,
          unitType: hero.unit_type?.type_id || unitType,
          avatar: hero.avatar_url,
          isOwned: ownedHeroIds.has(hero.id),
          maxRarityOwned: ownedHeroIds.has(hero.id) ? 
            Math.max(...userHeroes.filter(uh => uh.hero.id === hero.id).map(uh => uh.star)) : null,
          obtainMethods: ['summon', 'fragments'] // TODO: 从配置读取
        };
      });

      const collectionStats = {
        total: allHeroes.length,
        owned: userHeroes.length,
        percentage: Math.round((userHeroes.length / allHeroes.length) * 100),
        bonuses: [
          { threshold: 10, bonus: { attack: '2%' }, isUnlocked: userHeroes.length >= 10 },
          { threshold: 25, bonus: { hp: '3%' }, isUnlocked: userHeroes.length >= 25 },
          { threshold: 50, bonus: { defense: '2%', speed: '1%' }, isUnlocked: userHeroes.length >= 50 },
          { threshold: 100, bonus: { all_stats: '5%' }, isUnlocked: userHeroes.length >= 100 }
        ]
      };

      ctx.body = {
        success: true,
        data: {
          heroes,
          collectionStats
        }
      };
    } catch (error) {
      console.error('获取武将图鉴错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_LIBRARY_ERROR',
          message: '获取武将图鉴失败'
        }
      };
    }
  },

  /**
   * 武将召唤
   */
  async summon(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('未认证');
      }

      const { summonType, quantity = 1, useTickets = false } = ctx.request.body;

      if (!['normal', 'premium'].includes(summonType)) {
        return ctx.badRequest('无效的召唤类型');
      }

      if (![1, 10].includes(quantity)) {
        return ctx.badRequest('无效的召唤数量');
      }

      // 获取用户档案
      const userProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
        where: { user: user.id }
      });

      if (!userProfile) {
        return ctx.badRequest('用户档案不存在');
      }

      // 计算消耗
      const costs = HERO_SYSTEM_CONFIG.summonCosts[summonType];
      const totalCost = {
        gold: (costs.gold || 0) * quantity,
        gems: (costs.gems || 0) * quantity,
        tickets: 0
      };

      // 检查资源
      if (totalCost.gold > 0 && userProfile.gold < totalCost.gold) {
        return ctx.badRequest('金币不足');
      }
      if (totalCost.gems > 0 && userProfile.diamond < totalCost.gems) {
        return ctx.badRequest('钻石不足');
      }

      // 获取所有可召唤的武将
      const allHeroes = await strapi.db.query('api::hero.hero').findMany({
        populate: { quality: true }
      });

      if (!allHeroes || allHeroes.length === 0) {
        return ctx.badRequest('没有可召唤的武将');
      }

      // 执行召唤
      const results = [];
      for (let i = 0; i < quantity; i++) {
        const rarity = performSummon(summonType);
        const availableHeroes = allHeroes.filter(hero => 
          hero.quality && hero.quality.quality_id === rarity
        );

        if (availableHeroes.length > 0) {
          const selectedHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
          
          // 检查是否已拥有
          const existingUserHero = await strapi.db.query('api::user-hero.user-hero').findOne({
            where: {
              user: user.id,
              hero: selectedHero.id
            }
          });

          if (existingUserHero) {
            // 已拥有，给碎片
            results.push({
              isNew: false,
              hero: null,
              fragments: {
                heroId: selectedHero.hero_id,
                quantity: 10
              },
              rarity
            });
          } else {
            // 新武将，创建用户武将
            const newUserHero = await strapi.db.query('api::user-hero.user-hero').create({
              data: {
                user: user.id,
                hero: selectedHero.id,
                level: 1,
                star: rarity,
                exp: 0,
                breakthrough: 0,
                power: calculatePower({
                  hp: selectedHero.base_hp,
                  attack: selectedHero.base_attack,
                  defense: selectedHero.base_defense,
                  speed: selectedHero.base_speed
                })
              }
            });

            results.push({
              isNew: true,
              hero: {
                id: newUserHero.id,
                heroId: selectedHero.hero_id,
                name: selectedHero.name,
                rarity,
                avatar: selectedHero.avatar_url
              },
              fragments: {
                heroId: selectedHero.hero_id,
                quantity: 0
              },
              rarity
            });
          }
        }
      }

      // 扣除资源
      const updateData: any = {};
      if (totalCost.gold > 0) {
        updateData.gold = userProfile.gold - totalCost.gold;
      }
      if (totalCost.gems > 0) {
        updateData.diamond = userProfile.diamond - totalCost.gems;
      }

      if (Object.keys(updateData).length > 0) {
        await strapi.db.query('api::user-profile.user-profile').update({
          where: { id: userProfile.id },
          data: updateData
        });
      }

      ctx.body = {
        success: true,
        data: {
          results,
          costsUsed: totalCost,
          pityCounter: 0, // TODO: 实现保底系统
          guaranteeProgress: {}
        }
      };
    } catch (error) {
      console.error('召唤错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'SUMMON_ERROR',
          message: '召唤失败'
        }
      };
    }
  },

  /**
   * 新手召唤
   * 专为新玩家设计的特殊召唤，保证获得高品质武将
   */
  async newbieSummon(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('未认证');
      }

      // 获取用户档案
      const userProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
        where: { user: user.id }
      });

      if (!userProfile) {
        return ctx.badRequest('用户档案不存在');
      }

      // 检查是否是新手（等级低于10且拥有武将数少于10个）
      const userHeroCount = await strapi.db.query('api::user-hero.user-hero').count({
        where: { user: user.id }
      });

      if (userProfile.level > 10 || userHeroCount > 10) {
        return ctx.badRequest('新手召唤仅限新玩家使用');
      }

      // 简单检查新手召唤次数（通过检查用户等级和武将数量）
      // 如果用户等级低且武将少，允许召唤
      const canSummon = userProfile.level <= 5 || userHeroCount <= 6;
      if (!canSummon) {
        return ctx.badRequest('新手召唤次数已用完');
      }

      // 获取所有武将并手动分配品质
      const allHeroes = await strapi.db.query('api::hero.hero').findMany({
        populate: { 
          quality: true,
          faction: true 
        }
      });

      // 根据hero_id手动分配品质等级（3-5星适合新手召唤）
      const filteredHeroes = allHeroes.filter(hero => {
        const heroId = hero.hero_id;
        // 主要英雄设为高品质：刘备、关羽、张飞、诸葛亮、曹操、孙策等
        const highQualityHeroIds = [1001, 1002, 1003, 1004, 1005, 2001, 2002, 2003, 3001, 3002, 3003];
        return highQualityHeroIds.includes(heroId);
      }).map(hero => {
        // 手动分配品质
        const qualityMapping = {
          1001: 4, // 刘备 - 史诗
          1002: 5, // 诸葛亮 - 传说
          1003: 4, // 关羽 - 史诗
          1004: 3, // 张飞 - 精良
          1005: 4, // 赵云 - 史诗
          2001: 5, // 曹操 - 传说
          2002: 4, // 司马懿 - 史诗
          2003: 3, // 张辽 - 精良
          3001: 4, // 孙策 - 史诗
          3002: 3, // 孙权 - 精良
          3003: 4  // 周瑜 - 史诗
        };
        
        hero.assigned_quality = qualityMapping[hero.hero_id] || 3;
        return hero;
      });

      if (!filteredHeroes || filteredHeroes.length === 0) {
        return ctx.badRequest('没有可召唤的高品质武将');
      }

      // 执行新手召唤（保证高品质）
      const rarity = performNewbieSummon();
      const availableHeroes = filteredHeroes.filter(hero => 
        hero.assigned_quality === rarity
      );

      if (availableHeroes.length === 0) {
        return ctx.badRequest('该品质武将暂时不可用');
      }

      const selectedHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
      
      // 检查是否已拥有（新手召唤不给重复武将，而是提升星级）
      let existingUserHero = await strapi.db.query('api::user-hero.user-hero').findOne({
        where: {
          user: user.id,
          hero: selectedHero.id
        }
      });

      let result;
      if (existingUserHero && existingUserHero.star < 3) {
        // 已拥有且星级不足3星，提升星级
        const newStar = Math.min(existingUserHero.star + 1, 3);
        const newStats = calculateCurrentStats(selectedHero, existingUserHero.level, newStar);
        
        const updatedHero = await strapi.db.query('api::user-hero.user-hero').update({
          where: { id: existingUserHero.id },
          data: {
            star: newStar,
            power: calculatePower(newStats)
          }
        });

        result = {
          isNew: false,
          isUpgrade: true,
          hero: {
            id: updatedHero.id,
            heroId: selectedHero.hero_id,
            name: selectedHero.name,
            rarity: newStar,
            oldRarity: existingUserHero.star,
            avatar: selectedHero.avatar_url
          },
          message: `${selectedHero.name} 星级提升至 ${newStar} 星！`
        };
      } else {
        // 新武将或已是高星级，创建新的用户武将
        const newUserHero = await strapi.db.query('api::user-hero.user-hero').create({
          data: {
            user: user.id,
            hero: selectedHero.id,
            level: 10, // 新手召唤的武将起始等级更高
            star: rarity,
            exp: 0,
            breakthrough: 0,
            power: calculatePower(calculateCurrentStats(selectedHero, 10, rarity))
          }
        });

        result = {
          isNew: true,
          isUpgrade: false,
          hero: {
            id: newUserHero.id,
            heroId: selectedHero.hero_id,
            name: selectedHero.name,
            rarity,
            level: 10,
            avatar: selectedHero.avatar_url,
            faction: selectedHero.faction?.faction_id || 'unknown'
          },
          message: `恭喜获得 ${rarity} 星武将：${selectedHero.name}！`
        };
      }

      // 给予额外奖励（金币和经验药水）
      const bonusRewards = {
        gold: 5000,
        exp: 500,
        gems: 50
      };

      await strapi.db.query('api::user-profile.user-profile').update({
        where: { id: userProfile.id },
        data: {
          gold: userProfile.gold + bonusRewards.gold,
          exp: userProfile.exp + bonusRewards.exp,
          diamond: userProfile.diamond + bonusRewards.gems
        }
      });

      const remainingSummons = userProfile.level <= 3 ? 2 : (userProfile.level <= 5 ? 1 : 0);

      ctx.body = {
        success: true,
        data: {
          result,
          bonusRewards,
          remainingSummons,
          isLastFree: remainingSummons === 0,
          specialMessage: remainingSummons > 0 ? 
            `您还有约 ${remainingSummons} 次新手召唤机会！` : 
            '继续探索三国世界，获得更多强力武将吧！'
        }
      };
    } catch (error) {
      console.error('新手召唤错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'NEWBIE_SUMMON_ERROR',
          message: '新手召唤失败'
        }
      };
    }
  },

  /**
   * 获取武将模板数据（公开访问）
   */
  async findHeroTemplates(ctx: Context) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        faction,
        rarity 
      } = ctx.query;

      // 构建查询条件
      const where: any = {};
      const populate = {
        quality: true,
        faction: true,
        unit_type: true
      };

      // 添加过滤条件
      if (faction) {
        where['faction.faction_id'] = faction;
      }
      if (rarity) {
        where['quality.quality_id'] = parseInt(rarity as string);
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      const heroes = await strapi.db.query('api::hero.hero').findWithCount({
        where,
        populate,
        offset: (pageNum - 1) * limitNum,
        limit: limitNum,
        orderBy: { hero_id: 'asc' }
      });

      // 格式化响应数据 - 临时逻辑：基于hero_id和属性分配品质和阵营
      const heroTemplates = heroes[0].map(hero => {
        // 基于hero_id分配阵营
        let faction = 'unknown';
        if (hero.hero_id >= 1000 && hero.hero_id < 2000) {
          faction = '蜀';
        } else if (hero.hero_id >= 2000 && hero.hero_id < 3000) {
          faction = '魏';
        } else if (hero.hero_id >= 3000 && hero.hero_id < 4000) {
          faction = '吴';
        } else if (hero.hero_id >= 4000 && hero.hero_id < 5000) {
          faction = '群雄';
        }

        // 基于历史地位和hero_id精确分配品质
        let quality = 3; // 默认精良
        let qualityName = '精良';
        let qualityColor = '#0080FF';

        // 神话级 (6星) - 三国最顶级人物
        if ([1002, 2001, 4004].includes(hero.hero_id)) { // 诸葛亮、曹操、吕布
          quality = 6; qualityName = '神话'; qualityColor = '#FF0000';
        }
        // 传说级 (5星) - 一流名将
        else if ([1001, 1003, 1005, 2002, 2003, 3001, 3003].includes(hero.hero_id)) { // 刘备、关羽、赵云、司马懿、张辽、孙策、周瑜
          quality = 5; qualityName = '传说'; qualityColor = '#FF8000';
        }
        // 史诗级 (4星) - 知名武将
        else if ([1004, 1006, 1007, 1008, 1009, 2004, 2005, 2006, 2007, 3002, 3004, 3005, 3006, 4001, 4002, 4003, 4005, 4006, 4007, 4008, 4009, 4010].includes(hero.hero_id)) {
          quality = 4; qualityName = '史诗'; qualityColor = '#8000FF';
        }
        // 优秀级 (2星) - 二线武将
        else if (hero.hero_id > 1015 || hero.hero_id > 2010 || hero.hero_id > 3010) {
          quality = 2; qualityName = '优秀'; qualityColor = '#00FF00';
        }

        // 基于历史职业和特点分配兵种类型
        let unitType = '步兵'; // 默认步兵
        
        // 军师类
        if ([1002, 1010, 1011, 2002, 2009, 3003, 4005, 4006, 4007].includes(hero.hero_id)) {
          unitType = '军师';
        }
        // 骑兵类
        else if ([1005, 1006, 2003, 2007, 3001, 4002, 4004].includes(hero.hero_id)) {
          unitType = '骑兵';
        }
        // 弓兵类
        else if ([1007, 2008, 3006, 4003].includes(hero.hero_id)) {
          unitType = '弓兵';
        }
        // 守护类
        else if ([1003, 2001, 3002].includes(hero.hero_id)) {
          unitType = '守护';
        }
        // 刺客类
        else if ([1008, 2010, 3007].includes(hero.hero_id)) {
          unitType = '刺客';
        }
        // 医者
        else if ([4010].includes(hero.hero_id)) {
          unitType = '医者';
        }
        // 术士
        else if ([4005, 4006, 4007].includes(hero.hero_id)) {
          unitType = '术士';
        }

        return {
          id: hero.hero_id,
          name: hero.name,
          description: hero.description,
          faction: hero.faction?.faction_id || faction,
          unitType: hero.unit_type?.type_id || unitType,
          quality: hero.quality?.quality_id || quality,
          qualityName: hero.quality?.name_zh || qualityName,
          qualityColor: hero.quality?.color_hex || qualityColor,
          baseStats: {
            hp: hero.base_hp,
            attack: hero.base_attack,
            defense: hero.base_defense,
            speed: hero.base_speed
          },
          avatar: hero.avatar_url,
          createdAt: hero.createdAt
        };
      });

      const pagination = {
        page: pageNum,
        limit: limitNum,
        total: heroes[1],
        totalPages: Math.ceil(heroes[1] / limitNum)
      };

      ctx.body = {
        success: true,
        data: {
          heroes: heroTemplates,
          pagination
        }
      };
    } catch (error) {
      console.error('获取武将模板数据错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_HERO_TEMPLATES_ERROR',
          message: '获取武将模板数据失败'
        }
      };
    }
  }
};

// 辅助函数

function calculateCurrentStats(hero: any, level: number, rarity: number) {
  const config = HERO_SYSTEM_CONFIG.statGrowth;
  const multiplier = config.hp.rarityMultiplier[rarity - 1] || 1;
  
  return {
    hp: Math.floor(hero.base_hp + (config.hp.perLevel * (level - 1) * multiplier)),
    attack: Math.floor(hero.base_attack + (config.attack.perLevel * (level - 1) * multiplier)),
    defense: Math.floor(hero.base_defense + (config.defense.perLevel * (level - 1) * multiplier)),
    speed: Math.floor(hero.base_speed + (config.speed.perLevel * (level - 1) * multiplier))
  };
}

function calculateRequiredExperience(level: number) {
  const { base, growth } = HERO_SYSTEM_CONFIG.experienceFormula;
  return Math.floor(base * Math.pow(level, growth));
}

function calculatePower(stats: any) {
  return Math.floor(stats.hp * 0.3 + stats.attack * 1.0 + stats.defense * 0.8 + stats.speed * 0.5);
}

function performSummon(summonType: string): number {
  const rates = HERO_SYSTEM_CONFIG.summonRates[summonType];
  const random = Math.random();
  let cumulative = 0;
  
  for (const [rarity, rate] of Object.entries(rates)) {
    cumulative += rate as number;
    if (random <= cumulative) {
      return parseInt(rarity);
    }
  }
  
  return summonType === 'normal' ? 1 : 3; // 默认最低品质
}

function getAwakeningRequirements(stage: number) {
  const requirements = {
    1: { awakening_crystals: 10, hero_essence: 5, gold: 500000 },
    2: { awakening_crystals: 25, hero_essence: 15, divine_fragments: 3, gold: 1000000 },
    3: { awakening_crystals: 50, hero_essence: 30, divine_fragments: 10, celestial_orb: 1, gold: 2000000 }
  };
  return requirements[stage] || null;
}

function performNewbieSummon(): number {
  const rates = HERO_SYSTEM_CONFIG.newbieSummonRates.guaranteed;
  const random = Math.random();
  let cumulative = 0;
  
  for (const [rarity, rate] of Object.entries(rates)) {
    cumulative += rate as number;
    if (random <= cumulative) {
      return parseInt(rarity);
    }
  }
  
  return 3; // 默认3星
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
 * 获取武将关系信息（临时解决方案）
 */
function getHeroRelationships(heroId: number) {
  // 基于hero_id分配阵营
  let faction = 'unknown';
  if (heroId >= 1000 && heroId < 2000) {
    faction = '蜀';
  } else if (heroId >= 2000 && heroId < 3000) {
    faction = '魏';
  } else if (heroId >= 3000 && heroId < 4000) {
    faction = '吴';
  } else if (heroId >= 4000 && heroId < 5000) {
    faction = '群雄';
  }

  // 基于历史地位和hero_id精确分配品质
  let quality = 3; // 默认精良
  let qualityName = '精良';
  let qualityColor = '#0080FF';

  // 神话级 (6星) - 三国最顶级人物
  if ([1002, 2001, 4004].includes(heroId)) { // 诸葛亮、曹操、吕布
    quality = 6; qualityName = '神话'; qualityColor = '#FF0000';
  }
  // 传说级 (5星) - 一流名将
  else if ([1001, 1003, 1005, 2002, 2003, 3001, 3003].includes(heroId)) { // 刘备、关羽、赵云、司马懿、张辽、孙策、周瑜
    quality = 5; qualityName = '传说'; qualityColor = '#FF8000';
  }
  // 史诗级 (4星) - 知名武将
  else if ([1004, 1006, 1007, 1008, 1009, 2004, 2005, 2006, 2007, 3002, 3004, 3005, 3006, 4001, 4002, 4003, 4005, 4006, 4007, 4008, 4009, 4010].includes(heroId)) {
    quality = 4; qualityName = '史诗'; qualityColor = '#8000FF';
  }
  // 优秀级 (2星) - 二线武将
  else if (heroId > 1015 || heroId > 2010 || heroId > 3010) {
    quality = 2; qualityName = '优秀'; qualityColor = '#00FF00';
  }

  // 基于历史职业和特点分配兵种类型
  let unitType = '步兵'; // 默认步兵
  
  // 军师类
  if ([1002, 1010, 1011, 2002, 2009, 3003, 4005, 4006, 4007].includes(heroId)) {
    unitType = '军师';
  }
  // 骑兵类
  else if ([1005, 1006, 2003, 2007, 3001, 4002, 4004].includes(heroId)) {
    unitType = '骑兵';
  }
  // 弓兵类
  else if ([1007, 2008, 3006, 4003].includes(heroId)) {
    unitType = '弓兵';
  }
  // 守护类
  else if ([1003, 2001, 3002].includes(heroId)) {
    unitType = '守护';
  }
  // 刺客类
  else if ([1008, 2010, 3007].includes(heroId)) {
    unitType = '刺客';
  }
  // 医者
  else if ([4010].includes(heroId)) {
    unitType = '医者';
  }
  // 术士
  else if ([4005, 4006, 4007].includes(heroId)) {
    unitType = '术士';
  }

  return { faction, unitType, quality, qualityName, qualityColor };
}

// 获取武将基础信息
function getHeroInfo(heroId: number) {
  // 武将名字和描述映射
  const heroData = {
    // 蜀汉武将
    1001: { name: '刘备', description: '仁德君主，蜀汉开国皇帝，以仁义治天下' },
    1002: { name: '诸葛亮', description: '卧龙先生，智谋无双，鞠躬尽瘁死而后已' },
    1003: { name: '关羽', description: '武圣关云长，义薄云天，忠义无双' },
    1004: { name: '张飞', description: '燕人张翼德，勇猛无敌，咆哮震天' },
    1005: { name: '赵云', description: '常山赵子龙，一身是胆，龙威天下' },
    1006: { name: '马超', description: '锦马超，西凉的猛将，驰骋疆场' },
    1007: { name: '黄忠', description: '老当益壮，百步穿杨，神射无双' },
    1008: { name: '魏延', description: '蜀汉猛将，勇冠三军，敢为人先' },
    1009: { name: '姜维', description: '诸葛亮的传人，文武双全，忠心耿耿' },
    1010: { name: '徐庶', description: '水镜先生门下，足智多谋，忠贞不渝' },
    
    // 曹魏武将
    2001: { name: '曹操', description: '魏武帝，治世之能臣，乱世之英雄' },
    2002: { name: '司马懿', description: '冢虎，深谋远虑，终成帝业' },
    2003: { name: '张辽', description: '曹魏五子良将之首，威震逍遥津' },
    2004: { name: '夏侯惇', description: '曹操的心腹大将，忠勇无双' },
    2005: { name: '许褚', description: '虎痴，曹操的贴身护卫，力大无穷' },
    2006: { name: '典韦', description: '古之恶来，为主舍身，忠义典范' },
    2007: { name: '郭嘉', description: '曹操的首席谋士，料事如神' },
    2008: { name: '荀彧', description: '曹操的谋主，王佐之才' },
    2009: { name: '荀攸', description: '曹操的军师，深谋远虑' },
    2010: { name: '贾诩', description: '毒士，精于算计，善保自身' },
    
    // 东吴武将
    3001: { name: '孙策', description: '小霸王，江东的奠基者，英年早逝' },
    3002: { name: '孙权', description: '江东之主，善于用人，建立帝业' },
    3003: { name: '周瑜', description: '美周郎，智勇双全，火烧赤壁' },
    3004: { name: '太史慈', description: '东莱太史慈，箭法精准，忠义双全' },
    3005: { name: '甘宁', description: '锦帆贼，水战专家，勇猛无敌' },
    3006: { name: '陆逊', description: '江东儒将，火烧连营，智谋过人' },
    3007: { name: '黄盖', description: '老将黄公覆，苦肉计献身' },
    3008: { name: '程普', description: '江东宿将，德高望重' },
    3009: { name: '韩当', description: '江东老将，追随孙氏三代' },
    3010: { name: '周泰', description: '江东猛将，浑身刀疤，忠心护主' },
    
    // 群雄武将
    4001: { name: '董卓', description: '西凉军阀，挟天子以令诸侯的始作俑者' },
    4002: { name: '袁绍', description: '四世三公，名门望族，官渡败北' },
    4003: { name: '袁术', description: '袁家次子，称帝南阳，终成笑柄' },
    4004: { name: '吕布', description: '人中吕布，马中赤兔，三国第一猛将' },
    4005: { name: '张角', description: '太平道首领，黄巾起义的发起者' },
    4006: { name: '于吉', description: '太平道传人，善用妖术蛊惑人心' },
    4007: { name: '左慈', description: '方士左元放，精通奇门遁甲' },
    4008: { name: '南华老仙', description: '传说中的仙人，太平要术的传授者' },
    4009: { name: '貂蝉', description: '中国古代四大美女之一，连环计的关键' },
    4010: { name: '华佗', description: '神医华佗，医术高超，救死扶伤' }
  };

  const info = heroData[heroId] || { name: `武将${heroId}`, description: '未知武将' };
  
  // 基于品质和类型计算基础属性
  const relations = getHeroRelationships(heroId);
  const qualityMultiplier = [1.0, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0][relations.quality] || 1.0;
  
  // 基础属性（会根据品质调整）
  let baseAttack = 400;
  let baseDefense = 400;
  let baseHp = 3000;
  let baseSpeed = 80;
  
  // 根据兵种类型调整属性
  switch (relations.unitType) {
    case '军师':
      baseAttack = 350; baseDefense = 300; baseHp = 2800; baseSpeed = 100;
      break;
    case '骑兵':
      baseAttack = 450; baseDefense = 350; baseHp = 3200; baseSpeed = 120;
      break;
    case '弓兵':
      baseAttack = 480; baseDefense = 320; baseHp = 2600; baseSpeed = 90;
      break;
    case '守护':
      baseAttack = 350; baseDefense = 550; baseHp = 4500; baseSpeed = 60;
      break;
    case '刺客':
      baseAttack = 500; baseDefense = 280; baseHp = 2400; baseSpeed = 140;
      break;
    case '医者':
      baseAttack = 200; baseDefense = 300; baseHp = 2500; baseSpeed = 70;
      break;
    case '术士':
      baseAttack = 380; baseDefense = 250; baseHp = 2200; baseSpeed = 110;
      break;
  }
  
  // 应用品质倍数
  const finalStats = {
    attack: Math.floor(baseAttack * qualityMultiplier),
    defense: Math.floor(baseDefense * qualityMultiplier),
    hp: Math.floor(baseHp * qualityMultiplier),
    speed: Math.floor(baseSpeed * (1 + (qualityMultiplier - 1) * 0.5)) // 速度增长较缓慢
  };
  
  return {
    name: info.name,
    description: info.description,
    baseStats: finalStats
  };
}