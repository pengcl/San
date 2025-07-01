/**
 * 战斗系统路由配置
 * 基于API规范 battle-apis.json 实现
 * 使用自定义JWT中间件绕过Strapi权限系统
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/battles/stages',
      handler: 'battle.getStages',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/battles/start',
      handler: 'battle.startBattle',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/battles/:battleId/action',
      handler: 'battle.executeAction',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/battles/:battleId/auto',
      handler: 'battle.autoBattle',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/battles/:battleId/result',
      handler: 'battle.getBattleResult',
      config: {
        auth: false,  // 关闭Strapi默认认证，使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    }
  ]
};