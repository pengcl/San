/**
 * 武将系统路由配置
 * 基于API规范 hero-apis.json 实现
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/heroes',
      handler: 'hero.find',
      config: {
        auth: false,  // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    // 特定路径必须在参数化路径之前
    {
      method: 'GET',
      path: '/heroes/library',
      handler: 'hero.library',
      config: {
        auth: false,  // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/heroes/summon',
      handler: 'hero.summon',
      config: {
        auth: false,  // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/heroes/newbie-summon',
      handler: 'hero.newbieSummon',
      config: {
        auth: false,  // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    // 参数化路径放在最后
    {
      method: 'GET',
      path: '/heroes/:id',
      handler: 'hero.findHeroTemplate',
      config: {
        auth: false,  // 公开访问武将模板详情
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/heroes/:id/level-up',
      handler: 'hero.levelUp',
      config: {
        auth: false,  // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/heroes/:id/star-up',
      handler: 'hero.starUp',
      config: {
        auth: false,  // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/heroes/:id/awaken',
      handler: 'hero.awaken',
      config: {
        auth: false,  // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    }
  ]
};