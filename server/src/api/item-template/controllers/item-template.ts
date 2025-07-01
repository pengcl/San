/**
 * 物品模板控制器
 * 管理游戏物品模板的查询和管理功能
 */

import { Context } from 'koa';

export default {
  /**
   * 获取所有物品模板
   */
  async find(ctx: Context) {
    try {
      const { page = '1', limit = '50', category, rarity, is_active = 'true' } = ctx.query as {
        page?: string;
        limit?: string;
        category?: string;
        rarity?: string;
        is_active?: string;
      };

      // 构建查询条件
      const where: any = {};
      
      if (category) {
        where.category = category;
      }
      
      if (rarity) {
        where.rarity = parseInt(rarity);
      }
      
      // 默认只查询活跃的物品
      if (is_active === 'true') {
        where.is_active = true;
      }

      const items = await strapi.db.query('api::item-template.item-template').findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { rarity: 'desc' },
          { name: 'asc' }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        populate: {
          quality: {
            select: ['id', 'name', 'color']
          }
        }
      });

      // 获取总数
      const total = await strapi.db.query('api::item-template.item-template').count({
        where
      });

      ctx.body = {
        success: true,
        data: items,
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
      console.error('获取物品模板失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_ITEM_TEMPLATES_ERROR',
          message: '获取物品模板失败'
        }
      };
    }
  },

  /**
   * 获取指定物品模板详情
   */
  async findOne(ctx: Context) {
    try {
      const { id } = ctx.params;

      const item = await strapi.db.query('api::item-template.item-template').findOne({
        where: { id: Number(id) },
        populate: {
          quality: {
            select: ['id', 'name', 'color', 'description']
          }
        }
      });

      if (!item) {
        return ctx.notFound('物品模板不存在');
      }

      ctx.body = {
        success: true,
        data: item
      };
    } catch (error) {
      console.error('获取物品模板详情失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_ITEM_TEMPLATE_ERROR',
          message: '获取物品模板详情失败'
        }
      };
    }
  },

  /**
   * 按分类获取物品模板
   */
  async getByCategory(ctx: Context) {
    try {
      const { category } = ctx.params;
      const { page = '1', limit = '50' } = ctx.query as {
        page?: string;
        limit?: string;
      };

      const validCategories = ['materials', 'consumables', 'equipment', 'fragments', 'currency', 'special'];
      
      if (!validCategories.includes(category)) {
        return ctx.badRequest('无效的物品分类');
      }

      const items = await strapi.db.query('api::item-template.item-template').findMany({
        where: { 
          category,
          is_active: true 
        },
        orderBy: [
          { rarity: 'desc' },
          { name: 'asc' }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        populate: {
          quality: true
        }
      });

      const total = await strapi.db.query('api::item-template.item-template').count({
        where: { 
          category,
          is_active: true 
        }
      });

      ctx.body = {
        success: true,
        data: items,
        meta: {
          category,
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(limit),
            total,
            pageCount: Math.ceil(total / parseInt(limit))
          }
        }
      };
    } catch (error) {
      console.error('按分类获取物品模板失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_ITEMS_BY_CATEGORY_ERROR',
          message: '按分类获取物品模板失败'
        }
      };
    }
  },

  /**
   * 获取可使用的物品模板
   */
  async getUsableItems(ctx: Context) {
    try {
      const { page = '1', limit = '50' } = ctx.query as {
        page?: string;
        limit?: string;
      };

      const items = await strapi.db.query('api::item-template.item-template').findMany({
        where: { 
          is_usable: true,
          is_active: true 
        },
        orderBy: [
          { category: 'asc' },
          { rarity: 'desc' },
          { name: 'asc' }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        populate: {
          quality: true
        }
      });

      const total = await strapi.db.query('api::item-template.item-template').count({
        where: { 
          is_usable: true,
          is_active: true 
        }
      });

      ctx.body = {
        success: true,
        data: items,
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
      console.error('获取可使用物品失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_USABLE_ITEMS_ERROR',
          message: '获取可使用物品失败'
        }
      };
    }
  }
};