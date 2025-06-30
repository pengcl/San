/**
 * 城池数据导入脚本
 * 用于初始化城池相关数据
 */

import type { Core } from '@strapi/strapi';
import cityData from './city-data.json';

export async function importCityData(strapi: Core.Strapi) {
  try {
    console.log('开始导入城池数据...');

    // 1. 导入城池类型数据
    console.log('导入城池类型数据...');
    for (const cityType of cityData.cityTypes) {
      const existingCityType = await strapi.db.query('api::city-type.city-type').findOne({
        where: { type_id: cityType.type_id }
      });

      if (!existingCityType) {
        await strapi.db.query('api::city-type.city-type').create({
          data: cityType
        });
        console.log(`城池类型 ${cityType.name_zh} 导入成功`);
      } else {
        console.log(`城池类型 ${cityType.name_zh} 已存在，跳过`);
      }
    }

    // 2. 导入城池数据
    console.log('导入城池数据...');
    for (const city of cityData.cities) {
      const existingCity = await strapi.db.query('api::city.city').findOne({
        where: { city_id: city.city_id }
      });

      if (!existingCity) {
        // 查找对应的城池类型
        const cityType = await strapi.db.query('api::city-type.city-type').findOne({
          where: { type_id: city.type_id }
        });

        if (cityType) {
          const cityDataToCreate = {
            ...city,
            city_type: cityType.id
          };
          delete cityDataToCreate.type_id;

          await strapi.db.query('api::city.city').create({
            data: cityDataToCreate
          });
          console.log(`城池 ${city.name} 导入成功`);
        } else {
          console.error(`城池 ${city.name} 的类型不存在: ${city.type_id}`);
        }
      } else {
        console.log(`城池 ${city.name} 已存在，跳过`);
      }
    }

    // 3. 导入城池政策数据
    console.log('导入城池政策数据...');
    for (const policy of cityData.cityPolicies) {
      const existingPolicy = await strapi.db.query('api::city-policy.city-policy').findOne({
        where: { policy_id: policy.policy_id }
      });

      if (!existingPolicy) {
        await strapi.db.query('api::city-policy.city-policy').create({
          data: policy
        });
        console.log(`城池政策 ${policy.name_zh} 导入成功`);
      } else {
        console.log(`城池政策 ${policy.name_zh} 已存在，跳过`);
      }
    }

    // 4. 导入城池发展路线数据
    console.log('导入城池发展路线数据...');
    for (const path of cityData.cityDevelopmentPaths) {
      const existingPath = await strapi.db.query('api::city-development-path.city-development-path').findOne({
        where: { path_id: path.path_id }
      });

      if (!existingPath) {
        await strapi.db.query('api::city-development-path.city-development-path').create({
          data: path
        });
        console.log(`发展路线 ${path.name_zh} 导入成功`);
      } else {
        console.log(`发展路线 ${path.name_zh} 已存在，跳过`);
      }
    }

    console.log('城池数据导入完成！');
  } catch (error) {
    console.error('城池数据导入失败:', error);
    throw error;
  }
}

// 可以在 bootstrap 中调用此函数
export default importCityData;