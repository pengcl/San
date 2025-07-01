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
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/user-items/:id/use',
      handler: 'user-item.useItem',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'PUT',
      path: '/user-items/:id/lock',
      handler: 'user-item.toggleItemLock',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/user-items/sell',
      handler: 'user-item.sellItems',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/user-items/add',
      handler: 'user-item.addItem',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  ]
};