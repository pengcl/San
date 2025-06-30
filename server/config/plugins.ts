export default ({ env }) => ({
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: '三国群英传API文档',
        description: '三国群英传卡牌争霸游戏的API接口文档',
        contact: {
          name: 'API Support',
          email: 'support@sanguo.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      'x-strapi-config': {
        // 插件配置
        plugins: ['upload', 'users-permissions'],
        path: '/documentation'
      },
      servers: [
        {
          url: 'http://localhost:1337/api',
          description: '开发环境服务器'
        }
      ]
    }
  }
});
