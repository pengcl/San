/**
 * shop controller
 * 商店系统控制器
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::shop.shop', ({ strapi }) => ({
  /**
   * 获取商店列表
   */
  async find(ctx: Context) {
    try {
      const { shopType = 'general' } = ctx.query;
      
      // 获取商店配置
      const shop = await strapi.db.query('api::shop.shop').findOne({
        where: { shop_type: shopType, is_active: true }
      });

      if (!shop) {
        return ctx.body = {
          success: false,
          error: { message: '商店未找到或已关闭' }
        };
      }

      // 获取商店商品（这里简化处理，实际应该根据玩家等级、VIP等级等筛选）
      const shopItems = await strapi.db.query('api::shop-item.shop-item').findMany({
        where: { 
          is_active: true,
          shop_types: { $containsi: shopType }
        },
        limit: shop.item_slots || 8
      });

      // 模拟商品的当前价格和库存（实际应该从用户商店刷新数据中获取）
      const itemsWithPricing = shopItems.map(item => ({
        id: item.id,
        itemId: item.item_id,
        name: item.name,
        description: item.description,
        category: item.category,
        rarity: item.rarity,
        icon: item.icon,
        price: item.base_price,
        currency: item.currency,
        originalPrice: item.base_price,
        discount: 0,
        limitType: 'daily',
        limitQuantity: 5,
        purchased: 0,
        available: true,
        quantity: 1
      }));

      return ctx.body = {
        success: true,
        data: {
          shop: {
            type: shop.shop_type,
            name: shop.name,
            description: shop.description,
            currency: shop.currency,
            refreshTime: new Date(Date.now() + shop.refresh_interval * 1000).toISOString()
          },
          items: itemsWithPricing,
          playerCurrency: 10000, // 实际应该从用户资源中获取
          refreshCost: shop.refresh_cost || { gems: 50 },
          freeRefreshes: shop.free_refreshes_daily || 1
        }
      };
    } catch (error) {
      console.error('获取商店信息失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '获取商店信息失败' }
      };
    }
  },

  /**
   * 购买商品
   */
  async purchase(ctx: Context) {
    try {
      const { shopType, itemId, quantity = 1 } = ctx.request.body as any;
      
      if (!shopType || !itemId) {
        return ctx.body = {
          success: false,
          error: { message: '商店类型和商品ID必须提供' }
        };
      }

      // 获取商品信息
      const shopItem = await strapi.db.query('api::shop-item.shop-item').findOne({
        where: { item_id: itemId, is_active: true }
      });

      if (!shopItem) {
        return ctx.body = {
          success: false,
          error: { message: '商品不存在或已下架' }
        };
      }

      // 检查商品是否在当前商店类型中销售
      const shopTypes = shopItem.shop_types || [];
      if (!shopTypes.includes(shopType)) {
        return ctx.body = {
          success: false,
          error: { message: '该商品在当前商店中不可购买' }
        };
      }

      // 计算总价
      const totalCost = shopItem.base_price * quantity;

      // 这里简化处理，实际应该检查用户资源是否足够
      // 并从用户资源中扣除，同时添加到用户物品中

      // 模拟购买成功
      const purchaseResult = {
        purchasedItem: {
          itemId: shopItem.item_id,
          name: shopItem.name,
          category: shopItem.category,
          rarity: shopItem.rarity,
          quantity: quantity
        },
        totalCost: totalCost,
        currency: shopItem.currency,
        remainingCurrency: 10000 - totalCost, // 模拟剩余货币
        itemsObtained: [
          {
            id: shopItem.item_id,
            name: shopItem.name,
            quantity: quantity,
            rarity: shopItem.rarity
          }
        ]
      };

      console.log(`玩家购买商品: ${shopItem.name} x${quantity}, 花费: ${totalCost} ${shopItem.currency}`);

      return ctx.body = {
        success: true,
        data: purchaseResult
      };
    } catch (error) {
      console.error('购买商品失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '购买商品失败' }
      };
    }
  },

  /**
   * 刷新商店
   */
  async refresh(ctx: Context) {
    try {
      const { shopType, useGems = false } = ctx.request.body as any;
      
      if (!shopType) {
        return ctx.body = {
          success: false,
          error: { message: '商店类型必须提供' }
        };
      }

      // 获取商店配置
      const shop = await strapi.db.query('api::shop.shop').findOne({
        where: { shop_type: shopType, is_active: true }
      });

      if (!shop) {
        return ctx.body = {
          success: false,
          error: { message: '商店未找到' }
        };
      }

      // 模拟刷新逻辑
      const refreshCost = useGems ? (shop.refresh_cost?.gems || 50) : 0;
      
      // 重新获取商品列表（这里简化处理，实际应该随机生成新的商品组合）
      const newItems = await strapi.db.query('api::shop-item.shop-item').findMany({
        where: { 
          is_active: true,
          shop_types: { $containsi: shopType }
        },
        limit: shop.item_slots || 8,
        orderBy: { id: 'desc' } // 模拟新的商品顺序
      });

      const refreshResult = {
        newItems: newItems.map(item => ({
          id: item.id,
          itemId: item.item_id,
          name: item.name,
          price: item.base_price,
          currency: item.currency,
          rarity: item.rarity,
          available: true
        })),
        refreshCost: refreshCost,
        currency: 'gems',
        nextFreeRefresh: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        remainingFreeRefreshes: useGems ? 1 : 0
      };

      console.log(`商店 ${shopType} 已刷新, 费用: ${refreshCost} gems`);

      return ctx.body = {
        success: true,
        data: refreshResult
      };
    } catch (error) {
      console.error('刷新商店失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '刷新商店失败' }
      };
    }
  },

  /**
   * 获取商店类型列表
   */
  async getShopTypes(ctx: Context) {
    try {
      const shops = await strapi.db.query('api::shop.shop').findMany({
        where: { is_active: true },
        select: ['shop_type', 'name', 'description', 'currency', 'level_requirement', 'vip_requirement']
      });

      return ctx.body = {
        success: true,
        data: {
          shops: shops.map(shop => ({
            type: shop.shop_type,
            name: shop.name,
            description: shop.description,
            currency: shop.currency,
            levelRequirement: shop.level_requirement,
            vipRequirement: shop.vip_requirement
          }))
        }
      };
    } catch (error) {
      console.error('获取商店类型失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '获取商店类型失败' }
      };
    }
  }
}));