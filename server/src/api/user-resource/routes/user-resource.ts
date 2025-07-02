/**
 * user-resource router
 * 用户资源管理路由
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/user-resources',
      handler: 'user-resource.getResources',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-resources/update',
      handler: 'user-resource.updateResource',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-resources/energy/purchase',
      handler: 'user-resource.purchaseEnergy',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-resources/daily-login',
      handler: 'user-resource.dailyLogin',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    }
  ]
};