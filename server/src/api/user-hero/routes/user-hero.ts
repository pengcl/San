/**
 * user-hero router
 * 使用自定义路由绕过Strapi权限系统
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/user-heroes',
      handler: 'user-hero.find',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/user-heroes/:id',
      handler: 'user-hero.findOne',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-heroes',
      handler: 'user-hero.create',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'PUT',
      path: '/user-heroes/:id',
      handler: 'user-hero.update',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'DELETE',
      path: '/user-heroes/:id',
      handler: 'user-hero.delete',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    // 武将培养功能路由
    {
      method: 'POST',
      path: '/user-heroes/:id/level-up',
      handler: 'user-hero.levelUp',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-heroes/:id/star-up',
      handler: 'user-hero.starUp',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-heroes/:id/skills/:skillId/upgrade',
      handler: 'user-hero.upgradeSkill',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    // 装备系统路由
    {
      method: 'GET',
      path: '/user-heroes/:id/equipment',
      handler: 'user-hero.getEquipment',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-heroes/:id/equipment/:slot/equip',
      handler: 'user-hero.equipItem',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'DELETE',
      path: '/user-heroes/:id/equipment/:slot',
      handler: 'user-hero.unequipItem',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-heroes/:id/equipment/:slot/enhance',
      handler: 'user-hero.enhanceEquipment',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    }
  ]
}; 