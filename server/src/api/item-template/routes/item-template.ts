/**
 * 物品模板路由配置
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/item-templates',
      handler: 'item-template.find',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/item-templates/:id',
      handler: 'item-template.findOne',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/item-templates/category/:category',
      handler: 'item-template.getByCategory',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/item-templates/usable/list',
      handler: 'item-template.getUsableItems',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    }
  ]
};