/**
 * 用户物品控制器（背包系统）
 * 管理用户的物品背包功能
 */

import { Context } from 'koa';

export default {
  /**
   * 获取用户背包物品
   */
  async getUserItems(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { page = '1', limit = '50', category, rarity, is_locked } = ctx.query as {
        page?: string;
        limit?: string;
        category?: string;
        rarity?: string;
        is_locked?: string;
      };

      // 构建查询条件
      const where: any = { user: user.id };
      
      // 物品模板相关过滤
      const itemTemplateWhere: any = {};
      if (category) {
        itemTemplateWhere.category = category;
      }
      if (rarity) {
        itemTemplateWhere.rarity = parseInt(rarity);
      }

      // 用户物品过滤
      if (is_locked !== undefined) {
        where.is_locked = is_locked === 'true';
      }

      const userItems = await strapi.db.query('api::user-item.user-item').findMany({
        where,
        orderBy: [
          { acquired_at: 'desc' }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        populate: {
          item_template: {
            where: itemTemplateWhere,
            populate: {
              quality: {
                select: ['id', 'name', 'color']
              }
            }
          }
        }
      });

      // 过滤掉item_template为null的记录（如果有分类过滤的话）
      const filteredItems = userItems.filter(item => item.item_template);

      // 获取总数
      const total = await strapi.db.query('api::user-item.user-item').count({
        where
      });

      // 按类别分组统计
      const categoryStats = await getCategoryStatistics(user.id);

      ctx.body = {
        success: true,
        data: {
          items: filteredItems,
          statistics: categoryStats
        },
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
      console.error('获取用户背包失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_USER_ITEMS_ERROR',
          message: '获取背包物品失败'
        }
      };
    }
  },

  /**
   * 使用物品
   */
  async useItem(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { id } = ctx.params;
      const { quantity = 1, target_id } = ctx.request.body;

      // 验证用户物品
      const userItem = await strapi.db.query('api::user-item.user-item').findOne({
        where: { 
          id: Number(id),
          user: user.id 
        },
        populate: {
          item_template: true
        }
      });

      if (!userItem) {
        return ctx.notFound('物品不存在');
      }

      if (!userItem.item_template.is_usable) {
        return ctx.badRequest('该物品不可使用');
      }

      if (userItem.quantity < quantity) {
        return ctx.badRequest('物品数量不足');
      }

      // 检查冷却时间
      if (userItem.item_template.cooldown > 0 && userItem.last_used) {
        const cooldownEnd = new Date(userItem.last_used.getTime() + userItem.item_template.cooldown * 1000);
        if (new Date() < cooldownEnd) {
          return ctx.badRequest('物品还在冷却中');
        }
      }

      // 执行物品效果
      const useResult = await executeItemEffects(userItem.item_template, user.id, target_id, quantity);
      
      if (!useResult.success) {
        return ctx.badRequest(useResult.message || '使用物品失败');
      }

      // 更新物品数量
      const newQuantity = userItem.quantity - quantity;
      if (newQuantity <= 0) {
        // 删除物品
        await strapi.db.query('api::user-item.user-item').delete({
          where: { id: Number(id) }
        });
      } else {
        // 更新数量和使用时间
        await strapi.db.query('api::user-item.user-item').update({
          where: { id: Number(id) },
          data: { 
            quantity: newQuantity,
            last_used: new Date()
          }
        });
      }

      ctx.body = {
        success: true,
        data: {
          used_quantity: quantity,
          remaining_quantity: Math.max(0, newQuantity),
          effects: useResult.effects
        },
        message: `成功使用 ${userItem.item_template.name} x${quantity}`
      };
    } catch (error) {
      console.error('使用物品失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'USE_ITEM_ERROR',
          message: '使用物品失败'
        }
      };
    }
  },

  /**
   * 锁定/解锁物品
   */
  async toggleItemLock(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { id } = ctx.params;
      const { is_locked } = ctx.request.body;

      const userItem = await strapi.db.query('api::user-item.user-item').findOne({
        where: { 
          id: Number(id),
          user: user.id 
        }
      });

      if (!userItem) {
        return ctx.notFound('物品不存在');
      }

      const updatedItem = await strapi.db.query('api::user-item.user-item').update({
        where: { id: Number(id) },
        data: { is_locked }
      });

      ctx.body = {
        success: true,
        data: updatedItem,
        message: is_locked ? '物品已锁定' : '物品已解锁'
      };
    } catch (error) {
      console.error('切换物品锁定状态失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'TOGGLE_ITEM_LOCK_ERROR',
          message: '切换物品锁定状态失败'
        }
      };
    }
  },

  /**
   * 批量售卖物品
   */
  async sellItems(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { items } = ctx.request.body as {
        items: Array<{ id: number; quantity: number }>
      };

      if (!items || items.length === 0) {
        return ctx.badRequest('请选择要售卖的物品');
      }

      let totalValue = 0;
      const soldItems = [];

      for (const sellItem of items) {
        const userItem = await strapi.db.query('api::user-item.user-item').findOne({
          where: { 
            id: sellItem.id,
            user: user.id 
          },
          populate: {
            item_template: true
          }
        });

        if (!userItem) {
          continue; // 跳过不存在的物品
        }

        if (userItem.is_locked) {
          continue; // 跳过锁定的物品
        }

        const sellQuantity = Math.min(sellItem.quantity, userItem.quantity);
        const itemValue = userItem.item_template.sell_price * sellQuantity;
        
        totalValue += itemValue;
        soldItems.push({
          name: userItem.item_template.name,
          quantity: sellQuantity,
          value: itemValue
        });

        // 更新物品数量
        const newQuantity = userItem.quantity - sellQuantity;
        if (newQuantity <= 0) {
          await strapi.db.query('api::user-item.user-item').delete({
            where: { id: sellItem.id }
          });
        } else {
          await strapi.db.query('api::user-item.user-item').update({
            where: { id: sellItem.id },
            data: { quantity: newQuantity }
          });
        }
      }

      // 添加金币到用户账户
      if (totalValue > 0) {
        await addUserCurrency(user.id, 'gold', totalValue);
      }

      ctx.body = {
        success: true,
        data: {
          sold_items: soldItems,
          total_value: totalValue,
          total_items: soldItems.length
        },
        message: `成功售卖 ${soldItems.length} 种物品，获得 ${totalValue} 金币`
      };
    } catch (error) {
      console.error('售卖物品失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'SELL_ITEMS_ERROR',
          message: '售卖物品失败'
        }
      };
    }
  },

  /**
   * 添加物品到背包
   */
  async addItem(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { item_template_id, quantity = 1, metadata = {} } = ctx.request.body;

      // 验证物品模板
      const itemTemplate = await strapi.db.query('api::item-template.item-template').findOne({
        where: { id: Number(item_template_id) }
      });

      if (!itemTemplate) {
        return ctx.notFound('物品模板不存在');
      }

      // 检查是否已有该物品
      const existingItem = await strapi.db.query('api::user-item.user-item').findOne({
        where: { 
          user: user.id,
          item_template: item_template_id
        }
      });

      let result;
      if (existingItem) {
        // 叠加物品数量
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          itemTemplate.max_stack
        );
        
        result = await strapi.db.query('api::user-item.user-item').update({
          where: { id: existingItem.id },
          data: { 
            quantity: newQuantity,
            metadata: { ...existingItem.metadata, ...metadata }
          }
        });
      } else {
        // 创建新物品
        result = await strapi.db.query('api::user-item.user-item').create({
          data: {
            user: user.id,
            item_template: item_template_id,
            quantity: Math.min(quantity, itemTemplate.max_stack),
            acquired_at: new Date(),
            metadata
          }
        });
      }

      ctx.body = {
        success: true,
        data: result,
        message: `获得 ${itemTemplate.name} x${quantity}`
      };
    } catch (error) {
      console.error('添加物品失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'ADD_ITEM_ERROR',
          message: '添加物品失败'
        }
      };
    }
  }
};

// 辅助函数

/**
 * 获取用户背包分类统计
 */
async function getCategoryStatistics(userId: number) {
  const categories = ['materials', 'consumables', 'equipment', 'fragments', 'currency', 'special'];
  const stats = {};

  for (const category of categories) {
    const count = await strapi.db.query('api::user-item.user-item').count({
      where: { user: userId },
      populate: {
        item_template: {
          where: { category }
        }
      }
    });
    stats[category] = count;
  }

  return stats;
}

/**
 * 执行物品效果
 */
async function executeItemEffects(itemTemplate: any, userId: number, targetId?: number, quantity = 1) {
  const effects = itemTemplate.effects || {};
  const appliedEffects = [];

  try {
    // 恢复生命值
    if (effects.heal_hp) {
      const healAmount = effects.heal_hp * quantity;
      // 这里应该实现实际的生命值恢复逻辑
      appliedEffects.push({
        type: 'heal_hp',
        value: healAmount,
        description: `恢复 ${healAmount} 点生命值`
      });
    }

    // 恢复法力值
    if (effects.heal_mp) {
      const healAmount = effects.heal_mp * quantity;
      appliedEffects.push({
        type: 'heal_mp',
        value: healAmount,
        description: `恢复 ${healAmount} 点法力值`
      });
    }

    // 增加经验值
    if (effects.add_exp) {
      const expAmount = effects.add_exp * quantity;
      appliedEffects.push({
        type: 'add_exp',
        value: expAmount,
        description: `获得 ${expAmount} 点经验值`
      });
    }

    // 增加货币
    if (effects.add_currency) {
      for (const [currencyType, amount] of Object.entries(effects.add_currency)) {
        const totalAmount = (amount as number) * quantity;
        await addUserCurrency(userId, currencyType, totalAmount);
        appliedEffects.push({
          type: 'add_currency',
          currency: currencyType,
          value: totalAmount,
          description: `获得 ${totalAmount} ${currencyType}`
        });
      }
    }

    return {
      success: true,
      effects: appliedEffects
    };
  } catch (error) {
    console.error('执行物品效果失败:', error);
    return {
      success: false,
      message: '执行物品效果失败'
    };
  }
}

/**
 * 添加用户货币
 */
async function addUserCurrency(userId: number, currencyType: string, amount: number) {
  // 这里应该实现实际的货币添加逻辑
  // 可能需要查询用户资源表并更新
  console.log(`为用户 ${userId} 添加 ${amount} ${currencyType}`);
}