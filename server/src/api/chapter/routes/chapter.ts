/**
 * 章节路由配置
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/chapters',
      handler: 'chapter.find',
      config: {
        auth: false, // 允许未登录用户查看章节列表
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/chapters/:id',
      handler: 'chapter.findOne',
      config: {
        auth: false, // 允许未登录用户查看章节详情
        policies: [],
        middlewares: [],
      },
    },
  ],
};