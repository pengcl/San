/**
 * shop router
 * 商店系统路由
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/shops',
      handler: 'shop.find',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/shops/types',
      handler: 'shop.getShopTypes',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/shops/purchase',
      handler: 'shop.purchase',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/shops/refresh',
      handler: 'shop.refresh',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    }
  ]
};