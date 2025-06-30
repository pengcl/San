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
    }
  ]
}; 