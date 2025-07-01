/**
 * 城池系统控制器
 * 基于城池建筑系统设计实现
 */

import { Context } from 'koa';

export default {
  /**
   * 获取城池列表
   */
  async find(ctx: Context) {
    try {
      const user = ctx.state.user;
      
      // 如果没有用户认证，返回城池模板数据（公开访问）
      if (!user) {
        return this.findCityTemplates(ctx);
      }

      const { 
        page = 1, 
        limit = 20, 
        sort = 'name', 
        order = 'asc'
      } = ctx.query;

      // 构建查询条件 - 获取用户城池
      const where: any = { user: user.id };
      
      const populate = {
        city: {
          populate: {
            city_type: true
          }
        }
      };

      // 获取用户城池列表
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const orderBy = { [sort as string]: order };
      
      const userCities = await strapi.db.query('api::user-city.user-city').findWithCount({
        where,
        populate,
        orderBy,
        offset: (pageNum - 1) * limitNum,
        limit: limitNum
      });

      // 格式化响应数据
      const cities = userCities[0].map(userCity => {
        const city = userCity.city;
        if (!city) {
          console.warn('User city missing city data:', userCity.id);
          return null;
        }
        
        return {
          id: userCity.id,
          cityId: city.city_id,
          name: city.name,
          level: userCity.level,
          population: userCity.population,
          prosperity: userCity.prosperity,
          cityType: city.city_type?.type_name || 'unknown',
          buildings: [], // TODO: 实现建筑系统
          governor: null, // TODO: 实现武将任职系统
          policies: [], // TODO: 实现政策系统
          acquiredAt: userCity.createdAt
        };
      }).filter(city => city !== null);

      const pagination = {
        page: pageNum,
        limit: limitNum,
        total: userCities[1],
        totalPages: Math.ceil(userCities[1] / limitNum)
      };

      ctx.body = {
        success: true,
        data: {
          cities,
          pagination
        }
      };
    } catch (error) {
      console.error('获取城池列表错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_CITIES_ERROR',
          message: '获取城池列表失败'
        }
      };
    }
  },

  /**
   * 获取城池详情
   */
  async findOne(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;

      if (!user) {
        return ctx.unauthorized('未认证');
      }

      const userCity = await strapi.db.query('api::user-city.user-city').findOne({
        where: { 
          id: Number(id),
          user: user.id
        },
        populate: {
          city: {
            populate: {
              city_type: true
            }
          }
        }
      });

      if (!userCity) {
        ctx.status = 404;
        return ctx.body = {
          success: false,
          error: {
            code: 'CITY_NOT_FOUND',
            message: '城池不存在或不属于当前用户'
          }
        };
      }

      const city = userCity.city;

      const cityDetail = {
        id: userCity.id,
        cityId: city.city_id,
        name: city.name,
        description: city.description,
        level: userCity.level,
        population: userCity.population,
        prosperity: userCity.prosperity,
        cityType: city.city_type?.type_name || 'unknown',
        location: {
          region: city.region || '未知',
          coordinates: city.coordinates || null
        },
        buildings: [], // TODO: 实现建筑系统
        governor: null, // TODO: 实现武将任职系统
        policies: [], // TODO: 实现政策系统
        resources: {
          gold: 0, // TODO: 从城池收益计算
          food: 0,
          military: 0
        },
        upgradeCost: calculateUpgradeCost(userCity.level),
        acquiredAt: userCity.createdAt,
        lastUpdated: userCity.updatedAt
      };

      ctx.body = {
        success: true,
        data: cityDetail
      };
    } catch (error) {
      console.error('获取城池详情错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_CITY_DETAIL_ERROR',
          message: '获取城池详情失败'
        }
      };
    }
  },

  /**
   * 城池升级
   */
  async upgrade(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('未认证');
      }

      const { id } = ctx.params;
      const { useGold = 0 } = ctx.request.body;

      // 获取用户城池
      const userCity = await strapi.db.query('api::user-city.user-city').findOne({
        where: { id: Number(id), user: user.id },
        populate: { city: true }
      });

      if (!userCity) {
        return ctx.badRequest('城池不存在');
      }

      // 获取用户档案
      const userProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
        where: { user: user.id }
      });

      if (!userProfile) {
        return ctx.badRequest('用户档案不存在');
      }

      const currentLevel = userCity.level;
      const maxLevel = 20; // 城池最大等级

      if (currentLevel >= maxLevel) {
        return ctx.badRequest('已达到最大等级');
      }

      const upgradeCost = calculateUpgradeCost(currentLevel);

      // 检查资源是否足够
      if (useGold < upgradeCost.gold) {
        return ctx.badRequest('金币不足');
      }

      if (userProfile.gold < upgradeCost.gold) {
        return ctx.badRequest('用户金币不足');
      }

      // 执行升级
      const newLevel = currentLevel + 1;
      const prosperityIncrease = 100 * newLevel;

      // 更新城池
      const updatedCity = await strapi.db.query('api::user-city.user-city').update({
        where: { id: Number(id) },
        data: {
          level: newLevel,
          prosperity: userCity.prosperity + prosperityIncrease
        }
      });

      // 扣除金币
      await strapi.db.query('api::user-profile.user-profile').update({
        where: { id: userProfile.id },
        data: {
          gold: userProfile.gold - upgradeCost.gold
        }
      });

      ctx.body = {
        success: true,
        data: {
          city: updatedCity,
          levelsGained: 1,
          costsUsed: upgradeCost,
          prosperityIncrease,
          newBuildingsUnlocked: [] // TODO: 实现建筑解锁
        }
      };
    } catch (error) {
      console.error('城池升级错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'CITY_UPGRADE_ERROR',
          message: '城池升级失败'
        }
      };
    }
  },

  /**
   * 获取城池模板数据（公开访问）
   */
  async findCityTemplates(ctx: Context) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        region
      } = ctx.query;

      // 构建查询条件
      const where: any = {};
      const populate = {
        city_type: true
      };

      // 添加过滤条件
      if (region) {
        where.region = region;
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      const cities = await strapi.db.query('api::city.city').findWithCount({
        where,
        populate,
        offset: (pageNum - 1) * limitNum,
        limit: limitNum,
        orderBy: { city_id: 'asc' }
      });

      // 格式化响应数据
      const cityTemplates = cities[0].map(city => {
        return {
          id: city.city_id,
          name: city.name,
          description: city.description,
          cityType: city.city_type?.type_name || 'unknown',
          region: city.region || '未知',
          coordinates: city.coordinates,
          maxLevel: 20,
          basePopulation: 10000,
          baseProsperity: 1000,
          specialBuildings: [], // TODO: 从配置读取
          historicalSignificance: city.historical_significance || '',
          createdAt: city.createdAt
        };
      });

      const pagination = {
        page: pageNum,
        limit: limitNum,
        total: cities[1],
        totalPages: Math.ceil(cities[1] / limitNum)
      };

      ctx.body = {
        success: true,
        data: {
          cities: cityTemplates,
          pagination
        }
      };
    } catch (error) {
      console.error('获取城池模板数据错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_CITY_TEMPLATES_ERROR',
          message: '获取城池模板数据失败'
        }
      };
    }
  }
};

// 辅助函数

function calculateUpgradeCost(currentLevel: number) {
  const baseCost = 10000;
  const multiplier = Math.pow(1.5, currentLevel - 1);
  
  return {
    gold: Math.floor(baseCost * multiplier),
    materials: Math.floor(10 * multiplier),
    time: currentLevel * 30 // 分钟
  };
}