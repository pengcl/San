/**
 * user-hero controller
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

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
        faction: userHero.hero?.faction?.name || 'unknown',
        unitType: userHero.hero?.unit_type?.name || 'unknown',
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
        faction: hero.faction?.name || 'unknown',
        unitType: hero.unit_type?.name || 'unknown',
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
  }
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