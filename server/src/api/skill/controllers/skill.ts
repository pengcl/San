/**
 * 技能系统控制器
 * 管理游戏技能的查询和相关功能
 */

import { Context } from 'koa';

export default {
  /**
   * 获取所有技能
   */
  async find(ctx: Context) {
    try {
      const { page = '1', limit = '50', skill_type, damage_type, hero_id } = ctx.query as {
        page?: string;
        limit?: string;
        skill_type?: string;
        damage_type?: string;
        hero_id?: string;
      };

      // 构建查询条件
      const where: any = { is_active: true };
      
      if (skill_type) {
        where.skill_type = skill_type;
      }
      
      if (damage_type) {
        where.damage_type = damage_type;
      }

      // 如果指定了武将ID，只返回该武将拥有的技能
      const populateOptions: any = {
        heroes: {
          select: ['id', 'name', 'hero_id']
        }
      };

      if (hero_id) {
        populateOptions.heroes.where = { hero_id: parseInt(hero_id) };
      }

      const skills = await strapi.db.query('api::skill.skill').findMany({
        where,
        orderBy: [
          { skill_type: 'asc' },
          { unlock_level: 'asc' },
          { name: 'asc' }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        populate: populateOptions
      });

      // 如果指定了武将ID，过滤掉没有关联该武将的技能
      let filteredSkills = skills;
      if (hero_id) {
        filteredSkills = skills.filter(skill => 
          skill.heroes && skill.heroes.length > 0
        );
      }

      const total = await strapi.db.query('api::skill.skill').count({ where });

      ctx.body = {
        success: true,
        data: filteredSkills,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(limit),
            total,
            pageCount: Math.ceil(total / parseInt(limit))
          }
        }
      };
    } catch (error) {
      console.error('获取技能列表失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_SKILLS_ERROR',
          message: '获取技能列表失败'
        }
      };
    }
  },

  /**
   * 获取指定技能详情
   */
  async findOne(ctx: Context) {
    try {
      const { id } = ctx.params;

      const skill = await strapi.db.query('api::skill.skill').findOne({
        where: { id: Number(id) },
        populate: {
          heroes: {
            select: ['id', 'name', 'hero_id', 'rarity'],
            populate: {
              faction: {
                select: ['id', 'name']
              },
              unit_type: {
                select: ['id', 'name']
              }
            }
          }
        }
      });

      if (!skill) {
        return ctx.notFound('技能不存在');
      }

      ctx.body = {
        success: true,
        data: skill
      };
    } catch (error) {
      console.error('获取技能详情失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_SKILL_ERROR',
          message: '获取技能详情失败'
        }
      };
    }
  },

  /**
   * 按技能类型获取技能
   */
  async getByType(ctx: Context) {
    try {
      const { type } = ctx.params;
      const { page = '1', limit = '50' } = ctx.query as {
        page?: string;
        limit?: string;
      };

      const validTypes = ['active', 'passive', 'ultimate'];
      
      if (!validTypes.includes(type)) {
        return ctx.badRequest('无效的技能类型');
      }

      const skills = await strapi.db.query('api::skill.skill').findMany({
        where: { 
          skill_type: type,
          is_active: true 
        },
        orderBy: [
          { unlock_level: 'asc' },
          { name: 'asc' }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        populate: {
          heroes: {
            select: ['id', 'name', 'hero_id']
          }
        }
      });

      const total = await strapi.db.query('api::skill.skill').count({
        where: { 
          skill_type: type,
          is_active: true 
        }
      });

      ctx.body = {
        success: true,
        data: skills,
        meta: {
          skill_type: type,
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(limit),
            total,
            pageCount: Math.ceil(total / parseInt(limit))
          }
        }
      };
    } catch (error) {
      console.error('按类型获取技能失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_SKILLS_BY_TYPE_ERROR',
          message: '按类型获取技能失败'
        }
      };
    }
  },

  /**
   * 获取武将的技能
   */
  async getHeroSkills(ctx: Context) {
    try {
      const { heroId } = ctx.params;

      const hero = await strapi.db.query('api::hero.hero').findOne({
        where: { hero_id: parseInt(heroId) },
        populate: {
          skills: {
            orderBy: [
              { skill_type: 'asc' },
              { unlock_level: 'asc' }
            ]
          }
        }
      });

      if (!hero) {
        return ctx.notFound('武将不存在');
      }

      ctx.body = {
        success: true,
        data: {
          hero: {
            id: hero.id,
            hero_id: hero.hero_id,
            name: hero.name
          },
          skills: hero.skills || []
        }
      };
    } catch (error) {
      console.error('获取武将技能失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_HERO_SKILLS_ERROR',
          message: '获取武将技能失败'
        }
      };
    }
  },

  /**
   * 获取技能统计信息
   */
  async getSkillStats(ctx: Context) {
    try {
      const totalSkills = await strapi.db.query('api::skill.skill').count({
        where: { is_active: true }
      });

      const skillsByType = await Promise.all([
        strapi.db.query('api::skill.skill').count({
          where: { skill_type: 'active', is_active: true }
        }),
        strapi.db.query('api::skill.skill').count({
          where: { skill_type: 'passive', is_active: true }
        }),
        strapi.db.query('api::skill.skill').count({
          where: { skill_type: 'ultimate', is_active: true }
        })
      ]);

      const skillsByDamageType = await Promise.all([
        strapi.db.query('api::skill.skill').count({
          where: { damage_type: 'physical', is_active: true }
        }),
        strapi.db.query('api::skill.skill').count({
          where: { damage_type: 'magical', is_active: true }
        }),
        strapi.db.query('api::skill.skill').count({
          where: { damage_type: 'true', is_active: true }
        }),
        strapi.db.query('api::skill.skill').count({
          where: { damage_type: 'healing', is_active: true }
        })
      ]);

      ctx.body = {
        success: true,
        data: {
          total: totalSkills,
          by_type: {
            active: skillsByType[0],
            passive: skillsByType[1],
            ultimate: skillsByType[2]
          },
          by_damage_type: {
            physical: skillsByDamageType[0],
            magical: skillsByDamageType[1],
            true: skillsByDamageType[2],
            healing: skillsByDamageType[3]
          }
        }
      };
    } catch (error) {
      console.error('获取技能统计失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_SKILL_STATS_ERROR',
          message: '获取技能统计失败'
        }
      };
    }
  }
};