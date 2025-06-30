/**
 * 竞技场记录路由配置
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/arena-record',
      handler: 'arena-record.find',
      config: {
        auth: {
          scope: ['authenticated']
        },
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'PUT',
      path: '/arena-record',
      handler: 'arena-record.update',
      config: {
        auth: {
          scope: ['authenticated']
        },
        middlewares: ['global::rateLimiter'],
        policies: []
      }
    }
  ]
};