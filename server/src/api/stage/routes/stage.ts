/**
 * 关卡路由配置
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/stages',
      handler: 'stage.find',
      config: {
        auth: false, // 允许未登录用户查看关卡列表
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/stages/:id',
      handler: 'stage.findOne',
      config: {
        auth: false, // 允许未登录用户查看关卡详情
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/stages/:id/challenge',
      handler: 'stage.startChallenge',
      config: {
        auth: { scope: ['authenticated'] }, // 需要登录才能挑战关卡
        policies: [],
        middlewares: [],
      },
    },
  ],
};