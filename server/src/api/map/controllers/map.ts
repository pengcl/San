import { factories } from '@strapi/strapi';
import webSocketService from '../../../websocket/websocket.service';

export default factories.createCoreController('api::map.map' as any, ({ strapi }: { strapi: any }) => ({
  async find(ctx) {
    const map = await strapi.service('api::map.map').find();
    
    return {
      success: true,
      data: map,
      error: null
    };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;
    
    const updatedMap = await strapi.service('api::map.map').update(id, {
      data: body
    });
    
    return {
      success: true,
      data: updatedMap,
      error: null
    };
  },

  async getSpawnLocation(ctx) {
    try {
      const { faction_id } = ctx.request.body;
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('用户未认证');
      }
      
      if (!faction_id) {
        return ctx.badRequest('必须指定阵营');
      }
      
      const mapConfig = await strapi.service('api::map.map').find();
      const spawnRules = mapConfig.spawn_rules;
      
      const existingCities = await strapi.entityService.findMany('api::user-city.user-city', {
        filters: {
          is_main_city: true
        } as any,
        fields: ['coordinate_x', 'coordinate_y'] as any
      });
      
      const spawnAreas = spawnRules.faction_spawn_areas[faction_id]?.areas || spawnRules.faction_spawn_areas.neutral.areas;
      
      let coordinates = null;
      let attempts = 0;
      const maxAttempts = spawnRules.max_retries || 100;
      
      while (!coordinates && attempts < maxAttempts) {
        const area = spawnAreas[Math.floor(Math.random() * spawnAreas.length)];
        
        const x = Math.floor(Math.random() * (area.max_x - area.min_x) + area.min_x);
        const y = Math.floor(Math.random() * (area.max_y - area.min_y) + area.min_y);
        
        const isValidLocation = !existingCities.some((city: any) => {
          const distance = Math.sqrt(
            Math.pow(city.coordinate_x - x, 2) + 
            Math.pow(city.coordinate_y - y, 2)
          );
          return distance < spawnRules.min_distance;
        });
        
        if (isValidLocation) {
          coordinates = { x, y };
        }
        
        attempts++;
      }
      
      if (!coordinates) {
        return ctx.badRequest('无法找到合适的主城位置，请稍后重试');
      }
      
      return {
        success: true,
        data: {
          coordinate_x: coordinates.x,
          coordinate_y: coordinates.y,
          faction_id: faction_id
        },
        error: null
      };
      
    } catch (error) {
      strapi.log.error('获取主城位置失败:', error);
      return {
        success: false,
        data: null,
        error: {
          code: 'SPAWN_LOCATION_ERROR',
          message: '获取主城位置失败'
        }
      };
    }
  },

  async getMapData(ctx) {
    try {
      const { 
        center_x = 500, 
        center_y = 500, 
        radius = 100 
      } = ctx.query as any;
      
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('用户未认证');
      }
      
      const mapConfig = await strapi.service('api::map.map').find();
      
      const minX = Math.max(0, Number(center_x) - Number(radius));
      const maxX = Math.min(mapConfig.map_width, Number(center_x) + Number(radius));
      const minY = Math.max(0, Number(center_y) - Number(radius));
      const maxY = Math.min(mapConfig.map_height, Number(center_y) + Number(radius));
      
      const cities = await strapi.entityService.findMany('api::user-city.user-city', {
        filters: {
          coordinate_x: {
            $gte: minX,
            $lte: maxX
          },
          coordinate_y: {
            $gte: minY,
            $lte: maxY
          }
        } as any,
        populate: ['user', 'faction', 'city'] as any
      });
      
      const historicalCities = mapConfig.historical_cities.filter(city => 
        city.x >= minX && city.x <= maxX &&
        city.y >= minY && city.y <= maxY
      );
      
      return {
        success: true,
        data: {
          mapConfig: {
            width: mapConfig.map_width,
            height: mapConfig.map_height,
            terrainTypes: mapConfig.terrain_types,
            regions: mapConfig.regions
          },
          viewArea: {
            minX,
            maxX,
            minY,
            maxY
          },
          cities: cities.map((city: any) => ({
            id: city.id,
            name: city.city?.name || `${city.user?.username}的主城`,
            x: city.coordinate_x,
            y: city.coordinate_y,
            level: city.city_level,
            type: city.city_type,
            faction: city.faction?.faction_id,
            owner: city.user ? {
              id: city.user.id,
              username: city.user.username
            } : null,
            isMainCity: city.is_main_city
          })),
          historicalCities: historicalCities
        },
        error: null
      };
      
    } catch (error) {
      strapi.log.error('获取地图数据失败:', error);
      return {
        success: false,
        data: null,
        error: {
          code: 'MAP_DATA_ERROR',
          message: '获取地图数据失败'
        }
      };
    }
  },

  async attackCity(ctx) {
    try {
      const { targetCityId } = ctx.params;
      const { formation, battleType = 'normal' } = ctx.request.body;
      const attacker = ctx.state.user;
      
      if (!attacker) {
        return ctx.unauthorized('用户未认证');
      }
      
      // 获取目标城池
      const targetCity = await strapi.entityService.findOne('api::user-city.user-city', targetCityId, {
        populate: ['user', 'faction'] as any
      });
      
      if (!targetCity) {
        return ctx.badRequest('目标城池不存在');
      }
      
      // 检查是否为自己的城池
      if (targetCity.user?.id === attacker.id) {
        return ctx.badRequest('不能攻击自己的城池');
      }
      
      // 检查是否为主城（主城不可攻击）
      if (targetCity.is_main_city) {
        return ctx.badRequest('主城不可攻击');
      }
      
      // 获取攻击者主城
      const attackerCity = await strapi.entityService.findMany('api::user-city.user-city', {
        filters: {
          user: attacker.id,
          is_main_city: true
        } as any,
        limit: 1
      });
      
      if (!attackerCity || attackerCity.length === 0) {
        return ctx.badRequest('攻击者没有主城');
      }
      
      const attackerMainCity = attackerCity[0];
      
      // 计算距离
      const distance = Math.sqrt(
        Math.pow(targetCity.coordinate_x - attackerMainCity.coordinate_x, 2) +
        Math.pow(targetCity.coordinate_y - attackerMainCity.coordinate_y, 2)
      );
      
      // 检查攻击距离（最大攻击距离100单位）
      const maxAttackDistance = 100;
      if (distance > maxAttackDistance) {
        return ctx.badRequest('目标城池距离过远，无法攻击');
      }
      
      // 创建战斗记录
      const battleRecord = await strapi.entityService.create('api::battle.battle', {
        data: {
          attacker_user: attacker.id,
          defender_user: targetCity.user?.id,
          attacker_city: attackerMainCity.id,
          defender_city: targetCity.id,
          battle_type: 'city_attack',
          status: 'ongoing',
          battle_data: {
            formation: formation,
            distance: distance,
            attack_power: calculateAttackPower(formation),
            defense_power: targetCity.defense_value || 100
          }
        } as any
      });
      
      // 获取地形加成
      const mapConfig = await strapi.service('api::map.map').find();
      const terrainBonus = calculateTerrainBonus(targetCity.coordinate_x, targetCity.coordinate_y, mapConfig);
      
      // 战斗结算（考虑地形影响）
      const attackPower = calculateAttackPower(formation);
      const baseDensePower = targetCity.defense_value || 100;
      const defensePower = baseDensePower + (baseDensePower * terrainBonus.defense_bonus / 100);
      
      // 计算距离影响（远程攻击的衰减）
      const distancePenalty = Math.max(0.7, 1 - (distance / 1000));
      const finalAttackPower = attackPower * distancePenalty;
      
      const isVictory = finalAttackPower > defensePower * (0.8 + Math.random() * 0.4);
      
      // 更新战斗结果
      await strapi.entityService.update('api::battle.battle', battleRecord.id, {
        data: {
          status: 'completed',
          result: isVictory ? 'victory' : 'defeat',
          completed_at: new Date(),
          battle_data: {
            ...battleRecord.battle_data,
            result: isVictory ? 'victory' : 'defeat',
            damage_dealt: Math.floor(attackPower * (0.5 + Math.random() * 0.5)),
            damage_received: Math.floor(defensePower * (0.3 + Math.random() * 0.4))
          }
        } as any
      });
      
      // 如果攻击成功，转移城池控制权
      if (isVictory) {
        const updatedCity = await strapi.entityService.update('api::user-city.user-city', targetCityId, {
          data: {
            user: attacker.id,
            faction: attackerMainCity.faction,
            occupation_status: 'controlled',
            occupied_at: new Date(),
            last_battle_at: new Date()
          } as any
        });

        // 通知地图更新 - 城池易主
        webSocketService.notifyCityUpdate({
          ...updatedCity,
          updateType: 'city_captured',
          newOwner: attacker.username,
          oldOwner: targetCity.user?.username
        });
      } else {
        // 攻击失败，只更新最后战斗时间
        await strapi.entityService.update('api::user-city.user-city', targetCityId, {
          data: {
            last_battle_at: new Date()
          } as any
        });
      }

      // 通知战斗结果
      webSocketService.notifyBattleUpdate({
        battleId: battleRecord.id,
        result: isVictory ? 'victory' : 'defeat',
        attacker_city: {
          coordinate_x: attackerMainCity.coordinate_x,
          coordinate_y: attackerMainCity.coordinate_y,
          owner: attacker.username
        },
        defender_city: {
          coordinate_x: targetCity.coordinate_x,
          coordinate_y: targetCity.coordinate_y,
          owner: targetCity.user?.username
        },
        attackPower,
        defensePower
      });
      
      return {
        success: true,
        data: {
          battleId: battleRecord.id,
          result: isVictory ? 'victory' : 'defeat',
          attackPower,
          defensePower,
          distance,
          experience: isVictory ? 100 : 50,
          rewards: isVictory ? {
            gold: Math.floor(Math.random() * 1000) + 500,
            experience: 100
          } : {
            experience: 50
          }
        },
        error: null
      };
      
    } catch (error) {
      strapi.log.error('攻击城池失败:', error);
      return {
        success: false,
        data: null,
        error: {
          code: 'ATTACK_CITY_ERROR',
          message: '攻击城池失败'
        }
      };
    }
  },

  async defendCity(ctx) {
    try {
      const { cityId } = ctx.params;
      const { reinforcements } = ctx.request.body;
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('用户未认证');
      }
      
      // 获取城池
      const city = await strapi.entityService.findOne('api::user-city.user-city', cityId, {
        populate: ['user'] as any
      });
      
      if (!city || city.user?.id !== user.id) {
        return ctx.badRequest('只能防守自己的城池');
      }
      
      // 增加防御力
      const additionalDefense = Math.floor(reinforcements * 10);
      
      await strapi.entityService.update('api::user-city.user-city', cityId, {
        data: {
          defense_value: (city.defense_value || 100) + additionalDefense,
          garrison_strength: (city.garrison_strength || 0) + reinforcements
        } as any
      });
      
      return {
        success: true,
        data: {
          newDefenseValue: (city.defense_value || 100) + additionalDefense,
          newGarrisonStrength: (city.garrison_strength || 0) + reinforcements,
          reinforcements
        },
        error: null
      };
      
    } catch (error) {
      strapi.log.error('防守城池失败:', error);
      return {
        success: false,
        data: null,
        error: {
          code: 'DEFEND_CITY_ERROR',
          message: '防守城池失败'
        }
      };
    }
  },

  async collectResources(ctx) {
    try {
      const { cityId } = ctx.params;
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('用户未认证');
      }
      
      // 获取城池
      const city = await strapi.entityService.findOne('api::user-city.user-city', cityId, {
        populate: ['user'] as any
      });
      
      if (!city) {
        return ctx.badRequest('城池不存在');
      }
      
      if (city.user?.id !== user.id) {
        return ctx.badRequest('只能从自己的城池采集资源');
      }
      
      // 计算资源产出（基于城池等级和发展程度）
      const baseProduction = {
        gold: 100,
        food: 50,
        iron: 25,
        wood: 30
      };
      
      const levelMultiplier = city.city_level || 1;
      const prosperityMultiplier = (city.current_prosperity || 50) / 50;
      
      const production = {
        gold: Math.floor(baseProduction.gold * levelMultiplier * prosperityMultiplier),
        food: Math.floor(baseProduction.food * levelMultiplier * prosperityMultiplier),
        iron: Math.floor(baseProduction.iron * levelMultiplier * prosperityMultiplier),
        wood: Math.floor(baseProduction.wood * levelMultiplier * prosperityMultiplier)
      };
      
      // 更新城池的最后采集时间
      await strapi.entityService.update('api::user-city.user-city', cityId, {
        data: {
          stored_resources: production,
          daily_production: production
        } as any
      });
      
      return {
        success: true,
        data: {
          resources: production,
          cityLevel: city.city_level,
          prosperity: city.current_prosperity
        },
        error: null
      };
      
    } catch (error) {
      strapi.log.error('采集资源失败:', error);
      return {
        success: false,
        data: null,
        error: {
          code: 'COLLECT_RESOURCES_ERROR',
          message: '采集资源失败'
        }
      };
    }
  },

  async upgradeCity(ctx) {
    try {
      const { cityId } = ctx.params;
      const { upgradeType = 'level' } = ctx.request.body;
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('用户未认证');
      }
      
      // 获取城池
      const city = await strapi.entityService.findOne('api::user-city.user-city', cityId, {
        populate: ['user'] as any
      });
      
      if (!city) {
        return ctx.badRequest('城池不存在');
      }
      
      if (city.user?.id !== user.id) {
        return ctx.badRequest('只能升级自己的城池');
      }
      
      const currentLevel = city.city_level || 1;
      const maxLevel = 10;
      
      if (currentLevel >= maxLevel) {
        return ctx.badRequest('城池已达最高等级');
      }
      
      // 计算升级成本
      const upgradeCost = {
        gold: currentLevel * 1000,
        food: currentLevel * 500,
        iron: currentLevel * 200,
        wood: currentLevel * 300
      };
      
      // 这里应该检查用户是否有足够资源，暂时跳过
      
      const newLevel = currentLevel + 1;
      const updateData: any = {
        city_level: newLevel,
        development_level: newLevel,
        development_points: (city.development_points || 0) + 100
      };
      
      // 根据升级类型增加不同属性
      switch (upgradeType) {
        case 'defense':
          updateData.defense_value = (city.defense_value || 100) + newLevel * 50;
          updateData.defensive_improvements = (city.defensive_improvements || 0) + 1;
          break;
        case 'economy':
          updateData.current_prosperity = Math.min(100, (city.current_prosperity || 50) + 10);
          updateData.resource_efficiency = Math.min(2, (city.resource_efficiency || 1) + 0.1);
          break;
        case 'military':
          updateData.max_garrison = (city.max_garrison || 1000) + newLevel * 200;
          updateData.military_readiness = Math.min(1, (city.military_readiness || 0.5) + 0.1);
          break;
        default: // general level up
          updateData.defense_value = (city.defense_value || 100) + newLevel * 20;
          updateData.max_garrison = (city.max_garrison || 1000) + newLevel * 100;
          updateData.current_prosperity = Math.min(100, (city.current_prosperity || 50) + 5);
      }
      
      const updatedCity = await strapi.entityService.update('api::user-city.user-city', cityId, {
        data: updateData
      });

      // 通知地图更新 - 城池升级
      webSocketService.notifyCityUpdate({
        ...updatedCity,
        updateType: 'city_upgraded',
        upgradeType: upgradeType,
        newLevel: newLevel
      });
      
      return {
        success: true,
        data: {
          newLevel: newLevel,
          upgradeType: upgradeType,
          cost: upgradeCost,
          improvements: updateData,
          experience: 200
        },
        error: null
      };
      
    } catch (error) {
      strapi.log.error('升级城池失败:', error);
      return {
        success: false,
        data: null,
        error: {
          code: 'UPGRADE_CITY_ERROR',
          message: '升级城池失败'
        }
      };
    }
  },

  async getDevelopmentInfo(ctx) {
    try {
      const { cityId } = ctx.params;
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('用户未认证');
      }
      
      // 获取城池详细信息
      const city = await strapi.entityService.findOne('api::user-city.user-city', cityId, {
        populate: ['user', 'faction', 'city'] as any
      });
      
      if (!city) {
        return ctx.badRequest('城池不存在');
      }
      
      // 计算发展状态
      const developmentInfo = {
        basic: {
          level: city.city_level || 1,
          experience: city.development_points || 0,
          nextLevelExp: (city.city_level || 1) * 100
        },
        military: {
          defenseValue: city.defense_value || 100,
          garrisonCurrent: city.garrison_strength || 0,
          garrisonMax: city.max_garrison || 1000,
          readiness: city.military_readiness || 0.5,
          improvements: city.defensive_improvements || 0
        },
        economy: {
          prosperity: city.current_prosperity || 50,
          efficiency: city.resource_efficiency || 1,
          dailyProduction: city.daily_production || {
            gold: 100,
            food: 50,
            iron: 25,
            wood: 30
          },
          storedResources: city.stored_resources || {}
        },
        administration: {
          publicOrder: city.public_order || 50,
          efficiency: city.administrative_efficiency || 0.5,
          infrastructureLevel: city.infrastructure_level || 1,
          governanceScore: city.governance_score || 50
        },
        upgradeCosts: {
          level: {
            gold: (city.city_level || 1) * 1000,
            food: (city.city_level || 1) * 500,
            iron: (city.city_level || 1) * 200,
            wood: (city.city_level || 1) * 300
          },
          defense: {
            gold: (city.city_level || 1) * 800,
            iron: (city.city_level || 1) * 400
          },
          economy: {
            gold: (city.city_level || 1) * 600,
            wood: (city.city_level || 1) * 400
          },
          military: {
            gold: (city.city_level || 1) * 1200,
            iron: (city.city_level || 1) * 300,
            food: (city.city_level || 1) * 200
          }
        }
      };
      
      return {
        success: true,
        data: developmentInfo,
        error: null
      };
      
    } catch (error) {
      strapi.log.error('获取发展信息失败:', error);
      return {
        success: false,
        data: null,
        error: {
          code: 'GET_DEVELOPMENT_INFO_ERROR',
          message: '获取发展信息失败'
        }
      };
    }
  }
}));

// 辅助函数：计算攻击力
function calculateAttackPower(formation: any): number {
  if (!formation || !formation.heroes) {
    return 100; // 默认攻击力
  }
  
  // 简单的攻击力计算
  return formation.heroes.reduce((total: number, hero: any) => {
    if (!hero) return total;
    const heroAttack = (hero.level || 1) * 10 + (hero.attack || 50);
    return total + heroAttack;
  }, 0);
}

// 辅助函数：计算地形加成
function calculateTerrainBonus(x: number, y: number, mapConfig: any): any {
  if (!mapConfig || !mapConfig.terrain_types) {
    return { defense_bonus: 0, movement_cost: 1 };
  }

  // 简化的地形判断（实际项目中应该有更详细的地形图数据）
  let terrainType = 'plain'; // 默认平原

  // 根据坐标判断地形类型（示例逻辑）
  if (y > 700) {
    terrainType = 'plain'; // 北方平原
  } else if (x < 300 && y < 500) {
    terrainType = 'mountain'; // 西南山地
  } else if (x > 700 && y < 500) {
    terrainType = 'river'; // 东南水乡
  } else if (x >= 300 && x <= 700 && y >= 300 && y <= 700) {
    terrainType = 'plain'; // 中原平原
  }

  // 特殊地形判断
  if ((x >= 295 && x <= 305 && y >= 645 && y <= 655) || // 长安附近
      (x >= 145 && x <= 155 && y >= 245 && y <= 255)) { // 成都附近
    terrainType = 'fortress'; // 关隘要塞
  }

  const terrain = mapConfig.terrain_types[terrainType] || mapConfig.terrain_types.plain;
  
  return {
    defense_bonus: terrain.defense_bonus || 0,
    movement_cost: terrain.movement_cost || 1,
    terrain_name: terrain.name || '平原'
  };
}