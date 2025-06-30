/**
 * 认证路由配置
 * 基于API规范 auth-apis.json 实现
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/register',
      handler: 'auth.register',
      config: {
        auth: false,
        middlewares: ['global::rateLimiter'],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/auth/login',
      handler: 'auth.login',
      config: {
        auth: false,
        middlewares: ['global::rateLimiter'],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/auth/refresh',
      handler: 'auth.refresh',
      config: {
        auth: false,
        middlewares: ['global::rateLimiter'],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/auth/me',
      handler: 'auth.me',
      config: {
        auth: {
          scope: ['authenticated']
        },
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/auth/logout',
      handler: 'auth.logout',
      config: {
        auth: {
          scope: ['authenticated']
        },
        middlewares: [],
        policies: []
      }
    }
  ]
};