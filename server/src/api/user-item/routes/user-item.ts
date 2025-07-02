/**
 * 用户物品路由配置（背包系统）
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/user-items',
      handler: 'user-item.getUserItems',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-items/:id/use',
      handler: 'user-item.useItem',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'PUT',
      path: '/user-items/:id/lock',
      handler: 'user-item.toggleItemLock',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-items/sell',
      handler: 'user-item.sellItems',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-items/add',
      handler: 'user-item.addItem',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    }
  ]
};