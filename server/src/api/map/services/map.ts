import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::map.map' as any, ({ strapi }: { strapi: any }) => ({
  async getSpawnLocation({ faction_id }: { faction_id: string }) {
    try {
      // 获取地图配置
      const mapConfig = await strapi.entityService.findMany('api::map.map' as any, {
        limit: 1
      });

      if (!mapConfig || mapConfig.length === 0) {
        throw new Error('地图配置不存在');
      }

      const map = mapConfig[0];
      const spawnRules = map.spawn_rules;
      
      // 获取现有的主城位置
      const existingCities = await strapi.entityService.findMany('api::user-city.user-city' as any, {
        filters: {
          is_main_city: true
        },
        fields: ['coordinate_x', 'coordinate_y']
      });
      
      // 获取指定阵营的生成区域
      const spawnAreas = spawnRules.faction_spawn_areas[faction_id]?.areas || spawnRules.faction_spawn_areas.neutral.areas;
      
      let coordinates = null;
      let attempts = 0;
      const maxAttempts = spawnRules.max_retries || 100;
      
      while (!coordinates && attempts < maxAttempts) {
        const area = spawnAreas[Math.floor(Math.random() * spawnAreas.length)];
        
        const x = Math.floor(Math.random() * (area.max_x - area.min_x) + area.min_x);
        const y = Math.floor(Math.random() * (area.max_y - area.min_y) + area.min_y);
        
        // 检查距离是否合适
        const isValidLocation = !existingCities.some((city: any) => {
          const distance = Math.sqrt(
            Math.pow(city.coordinate_x - x, 2) + 
            Math.pow(city.coordinate_y - y, 2)
          );
          return distance < spawnRules.min_distance;
        });
        
        if (isValidLocation) {
          coordinates = { coordinate_x: x, coordinate_y: y };
        }
        
        attempts++;
      }
      
      if (!coordinates) {
        throw new Error('无法找到合适的主城位置');
      }
      
      return coordinates;
      
    } catch (error) {
      console.error('获取生成位置失败:', error);
      throw error;
    }
  },

  async find() {
    return await strapi.entityService.findMany('api::map.map' as any, {
      limit: 1
    }).then(maps => maps[0]);
  }
}));