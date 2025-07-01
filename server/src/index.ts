import type { Core } from '@strapi/strapi';
import webSocketService from './websocket/websocket.service';
import { importStageData } from './data/import-stage-data';
import { importCityData } from './data/import-city-data';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('🚀 Strapi application started successfully');
    
    // 配置API权限
    try {
      // 配置认证用户权限
      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' }
      });

      if (authenticatedRole) {
        // 认证用户API权限 - 严格按照 Content-Type 命名规范
        const authenticatedPermissions = [
          // 认证系统 - 自定义路由权限
          'api::auth.auth.me',
          'api::auth.auth.logout',
          'api::auth.auth.refresh',
          'api::auth.auth.profile',
          'api::auth.auth.changePassword',
          
          // 用户武将管理
          'api::user-hero.user-hero.find',
          'api::user-hero.user-hero.findOne',
          'api::user-hero.user-hero.create',
          'api::user-hero.user-hero.update',
          'api::user-hero.user-hero.delete',
          
          // 武将系统
          'api::hero.hero.find',
          'api::hero.hero.findOne',
          'api::hero.hero.library',
          'api::hero.hero.levelUp',
          
          // 品质系统
          'api::quality.quality.find',
          'api::quality.quality.findOne',
          
          // 阵营系统
          'api::faction.faction.find',
          'api::faction.faction.findOne',
          
          // 兵种系统
          'api::unit-type.unit-type.find',
          'api::unit-type.unit-type.findOne',
          
          // 技能系统
          'api::skill.skill.find',
          'api::skill.skill.findOne',
          
          // 用户资料
          'api::user-profile.user-profile.find',
          'api::user-profile.user-profile.findOne',
          'api::user-profile.user-profile.update',
          
          // 战斗系统
          'api::battle.battle.find',
          'api::battle.battle.findOne',
          'api::battle.battle.create',
          'api::battle.battle.getStages',
          'api::battle.battle.startBattle',
          'api::battle.battle.executeAction',
          'api::battle.battle.getBattleResult',
          'api::battle.battle.autoBattle',
          
          // 章节关卡
          'api::chapter.chapter.find',
          'api::chapter.chapter.findOne',
          'api::stage.stage.find',
          'api::stage.stage.findOne',
          'api::stage.stage.start',
          'api::stage.stage.complete',
          
          // 阵容系统权限
          'api::formation.formation.find',
          'api::formation.formation.findOne',
          'api::formation.formation.create',
          'api::formation.formation.update',
          'api::formation.formation.delete',
          
          // 城池系统权限
          'api::city.city.find',
          'api::city.city.findOne',
          'api::city.city.upgrade',
          
          // 背包系统 - 物品模板
          'api::item-template.item-template.find',
          'api::item-template.item-template.findOne',
          'api::item-template.item-template.getByCategory',
          'api::item-template.item-template.getUsableItems',
          
          // 背包系统 - 用户物品
          'api::user-item.user-item.getUserItems',
          'api::user-item.user-item.useItem',
          'api::user-item.user-item.toggleItemLock',
          'api::user-item.user-item.sellItems',
          'api::user-item.user-item.addItem',
          
          // WebSocket连接
          'api::websocket.websocket.connect',
          'api::websocket.websocket.disconnect',
          'api::websocket.websocket.message',
          
          // 召唤系统
          'api::summon.summon.find',
          'api::summon.summon.findOne',
          'api::summon.summon.normalSummon',
          'api::summon.summon.premiumSummon',
          'api::summon.summon.getSummonHistory',
          'api::summon.summon.getSummonRates',
          'api::summon.summon.synthesizeHero',
        ];

        for (const permission of authenticatedPermissions) {
          const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              role: authenticatedRole.id,
              action: permission
            }
          });

          if (!existingPermission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                role: authenticatedRole.id,
                action: permission,
                enabled: true
              }
            });
            console.log(`✅ Created permission: ${permission}`);
          } else if (!existingPermission.enabled) {
            await strapi.db.query('plugin::users-permissions.permission').update({
              where: { id: existingPermission.id },
              data: { enabled: true }
            });
            console.log(`✅ Enabled permission: ${permission}`);
          } else {
            console.log(`✓ Permission already exists and enabled: ${permission}`);
          }
        }

        console.log('✅ Authenticated API permissions configured');
      }

      // 配置公开权限（无需认证）
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });

      if (publicRole) {
        const publicPermissions = [
          // 认证系统 - 公开接口
          'api::auth.auth.register',
          'api::auth.auth.login',
          'api::auth.auth.forgotPassword',
          'api::auth.auth.resetPassword',
          
          // 武将图鉴 - 公开访问
          'api::hero.hero.library',
          
          // 品质系统 - 公开查看
          'api::quality.quality.find',
          'api::quality.quality.findOne',
          
          // 阵营系统 - 公开查看
          'api::faction.faction.find',
          'api::faction.faction.findOne',
          
          // 兵种系统 - 公开查看
          'api::unit-type.unit-type.find',
          'api::unit-type.unit-type.findOne',
          
          // 技能系统 - 公开查看
          'api::skill.skill.find',
          'api::skill.skill.findOne',
          
          // 阵容系统 - 临时公开测试
          'api::formation.formation.find',
        ];

        for (const permission of publicPermissions) {
          const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              role: publicRole.id,
              action: permission
            }
          });

          if (!existingPermission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                role: publicRole.id,
                action: permission,
                enabled: true
              }
            });
          }
        }

        console.log('✅ Public API permissions configured');
      }

    } catch (error) {
      console.error('❌ 权限配置失败:', error);
    }

    // 数据导入和初始化
    try {
      console.log('📊 Starting data import...');
      
      // 导入关卡数据
      await importStageData(strapi);
      console.log('✅ Stage data imported successfully');
      
      // 导入城池数据
      await importCityData(strapi);
      console.log('✅ City data imported successfully');
      
      console.log('🎉 All data imported successfully');
    } catch (error) {
      console.error('❌ 数据导入失败:', error);
    }

    // 初始化WebSocket服务
    strapi.server.httpServer.on('listening', () => {
      try {
        const httpServer = strapi.server.httpServer;
        if (httpServer) {
          webSocketService.initialize(httpServer);
          console.log('🔗 WebSocket service initialized successfully');
        } else {
          console.error('❌ 无法获取HTTP服务器实例');
          console.log('📋 可用的strapi.server属性:', Object.keys(strapi.server || {}));
        }
      } catch (error) {
        console.error('❌ WebSocket初始化失败:', error);
      }
    });
    
    // 监听应用关闭事件
    process.on('SIGTERM', () => {
      console.log('🛑 收到SIGTERM信号，关闭WebSocket服务');
      webSocketService.close();
    });

    process.on('SIGINT', () => {
      console.log('🛑 收到SIGINT信号，关闭WebSocket服务');
      webSocketService.close();
    });
  },
};