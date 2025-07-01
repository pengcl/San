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
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/item-templates/:id',
      handler: 'item-template.findOne',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/item-templates/category/:category',
      handler: 'item-template.getByCategory',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/item-templates/usable/list',
      handler: 'item-template.getUsableItems',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  ]
};