/**
 * city router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/cities',
      handler: 'city.find',
      config: {
        auth: false // 允许公开访问城池模板数据
      }
    },
    {
      method: 'GET',
      path: '/cities/:id',
      handler: 'city.findOne',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/cities/:id/upgrade',
      handler: 'city.upgrade',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  ]
};