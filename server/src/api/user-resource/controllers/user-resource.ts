/**
 * user-resource controller
 * 用户资源管理控制器
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::user-resource.user-resource', ({ strapi }) => ({
  /**
   * 获取用户资源概览
   */
  async getResources(ctx: Context) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 获取用户所有资源
      const userResources = await strapi.db.query('api::user-resource.user-resource').findMany({
        where: { user: user.id }
      });

      // 按资源类型分组
      const resourceMap = userResources.reduce((acc, resource) => {
        acc[resource.resource_type] = {
          quantity: parseInt(resource.quantity),
          maxQuantity: resource.max_quantity ? parseInt(resource.max_quantity) : null,
          dailyGained: resource.daily_gained,
          dailyUsed: resource.daily_used,
          lastUpdate: resource.last_update
        };
        return acc;
      }, {});

      // 构建响应数据
      const primaryResources = {
        gold: resourceMap.gold?.quantity || 0,
        gems: resourceMap.gems?.quantity || 0,
        energy: resourceMap.energy?.quantity || 0,
        maxEnergy: resourceMap.energy?.maxQuantity || 120,
        energyRegenRate: 1,
        nextEnergyTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      };

      const materials = {
        enhancementStones: resourceMap.enhancement_stones?.quantity || 0,
        skillBooks: resourceMap.skill_books?.quantity || 0,
        awakeningCrystals: resourceMap.awakening_crystals?.quantity || 0,
        heroFragments: resourceMap.hero_fragments?.quantity || 0,
        equipmentMaterials: resourceMap.equipment_materials?.quantity || 0
      };

      const currencies = {
        honor: resourceMap.honor?.quantity || 0,
        guildCoins: resourceMap.guild_coins?.quantity || 0,
        arenaTokens: resourceMap.arena_tokens?.quantity || 0,
        eventTokens: resourceMap.event_tokens?.quantity || 0
      };

      return ctx.body = {
        success: true,
        data: {
          primaryResources,
          materials,
          currencies,
          items: [] // 背包物品从user-item中获取
        }
      };
    } catch (error) {
      console.error('获取用户资源失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '获取用户资源失败' }
      };
    }
  },

  /**
   * 更新用户资源
   */
  async updateResource(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { resourceType, amount, operation = 'add' } = ctx.request.body as any;

      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      if (!resourceType || amount === undefined) {
        return ctx.body = {
          success: false,
          error: { message: '资源类型和数量必须提供' }
        };
      }

      // 查找或创建用户资源记录
      let userResource = await strapi.db.query('api::user-resource.user-resource').findOne({
        where: { user: user.id, resource_type: resourceType }
      });

      if (!userResource) {
        // 创建新的资源记录
        userResource = await strapi.db.query('api::user-resource.user-resource').create({
          data: {
            user: user.id,
            resource_type: resourceType,
            quantity: 0,
            last_update: new Date(),
            daily_gained: 0,
            daily_used: 0,
            last_reset: new Date().toISOString().split('T')[0]
          }
        });
      }

      // 计算新数量
      let newQuantity = parseInt(userResource.quantity);
      if (operation === 'add') {
        newQuantity += amount;
      } else if (operation === 'subtract') {
        newQuantity -= amount;
      } else if (operation === 'set') {
        newQuantity = amount;
      }

      // 确保数量不小于0
      newQuantity = Math.max(0, newQuantity);

      // 检查最大容量限制
      if (userResource.max_quantity && newQuantity > parseInt(userResource.max_quantity)) {
        return ctx.body = {
          success: false,
          error: { message: '超过资源最大容量限制' }
        };
      }

      // 更新资源
      const updatedResource = await strapi.db.query('api::user-resource.user-resource').update({
        where: { id: userResource.id },
        data: {
          quantity: newQuantity.toString(),
          last_update: new Date(),
          daily_gained: operation === 'add' ? userResource.daily_gained + amount : userResource.daily_gained,
          daily_used: operation === 'subtract' ? userResource.daily_used + amount : userResource.daily_used
        }
      });

      // 记录资源交易日志（简化处理，实际应该使用resource-transaction）
      console.log(`用户 ${user.id} ${operation} ${resourceType}: ${amount}, 新余额: ${newQuantity}`);

      return ctx.body = {
        success: true,
        data: {
          resourceType,
          previousAmount: parseInt(userResource.quantity),
          newAmount: newQuantity,
          change: amount,
          operation
        }
      };
    } catch (error) {
      console.error('更新用户资源失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '更新用户资源失败' }
      };
    }
  },

  /**
   * 购买体力
   */
  async purchaseEnergy(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { quantity = 60, useGems = true } = ctx.request.body as any;

      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 验证购买数量
      if (![60, 120, 180].includes(quantity)) {
        return ctx.body = {
          success: false,
          error: { message: '无效的体力购买数量' }
        };
      }

      // 计算费用（简化处理）
      const gemCost = quantity === 60 ? 50 : quantity === 120 ? 100 : 150;

      // 获取用户当前元宝和体力
      const gemsResource = await strapi.db.query('api::user-resource.user-resource').findOne({
        where: { user: user.id, resource_type: 'gems' }
      });

      const energyResource = await strapi.db.query('api::user-resource.user-resource').findOne({
        where: { user: user.id, resource_type: 'energy' }
      });

      if (!gemsResource || parseInt(gemsResource.quantity) < gemCost) {
        return ctx.body = {
          success: false,
          error: { message: '元宝不足' }
        };
      }

      // 扣除元宝
      await strapi.db.query('api::user-resource.user-resource').update({
        where: { id: gemsResource.id },
        data: {
          quantity: (parseInt(gemsResource.quantity) - gemCost).toString(),
          last_update: new Date(),
          daily_used: gemsResource.daily_used + gemCost
        }
      });

      // 增加体力
      let currentEnergy = energyResource ? parseInt(energyResource.quantity) : 0;
      const maxEnergy = energyResource?.max_quantity ? parseInt(energyResource.max_quantity) : 120;
      const newEnergy = Math.min(currentEnergy + quantity, maxEnergy);

      if (energyResource) {
        await strapi.db.query('api::user-resource.user-resource').update({
          where: { id: energyResource.id },
          data: {
            quantity: newEnergy.toString(),
            last_update: new Date(),
            daily_gained: energyResource.daily_gained + (newEnergy - currentEnergy)
          }
        });
      } else {
        await strapi.db.query('api::user-resource.user-resource').create({
          data: {
            user: user.id,
            resource_type: 'energy',
            quantity: newEnergy.toString(),
            max_quantity: maxEnergy.toString(),
            last_update: new Date(),
            daily_gained: newEnergy - currentEnergy,
            daily_used: 0,
            last_reset: new Date().toISOString().split('T')[0]
          }
        });
      }

      console.log(`用户 ${user.id} 购买体力: ${quantity}, 花费: ${gemCost} 元宝`);

      return ctx.body = {
        success: true,
        data: {
          energyAdded: newEnergy - currentEnergy,
          currentEnergy: newEnergy,
          maxEnergy: maxEnergy,
          gemsUsed: gemCost,
          dailyPurchaseCount: 1, // 简化处理
          nextPurchaseCost: gemCost
        }
      };
    } catch (error) {
      console.error('购买体力失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '购买体力失败' }
      };
    }
  },

  /**
   * 每日签到
   */
  async dailyLogin(ctx: Context) {
    try {
      const user = ctx.state.user;

      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 简化处理，固定奖励
      const loginRewards = [
        { type: 'gold', quantity: 10000, name: '金币' },
        { type: 'energy', quantity: 50, name: '体力' }
      ];

      // 发放奖励
      for (const reward of loginRewards) {
        // 查找或创建资源记录
        let userResource = await strapi.db.query('api::user-resource.user-resource').findOne({
          where: { user: user.id, resource_type: reward.type }
        });

        if (!userResource) {
          userResource = await strapi.db.query('api::user-resource.user-resource').create({
            data: {
              user: user.id,
              resource_type: reward.type,
              quantity: 0,
              last_update: new Date(),
              daily_gained: 0,
              daily_used: 0,
              last_reset: new Date().toISOString().split('T')[0]
            }
          });
        }

        // 增加资源
        await strapi.db.query('api::user-resource.user-resource').update({
          where: { id: userResource.id },
          data: {
            quantity: (parseInt(userResource.quantity) + reward.quantity).toString(),
            last_update: new Date(),
            daily_gained: userResource.daily_gained + reward.quantity
          }
        });
      }

      console.log(`用户 ${user.id} 每日签到完成`);

      return ctx.body = {
        success: true,
        data: {
          loginDay: 1,
          streakDay: 1,
          rewards: loginRewards,
          bonusReward: null,
          nextDayReward: { type: 'gems', quantity: 50, name: '元宝' },
          canClaimTomorrow: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      };
    } catch (error) {
      console.error('每日签到失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '每日签到失败' }
      };
    }
  }
}));