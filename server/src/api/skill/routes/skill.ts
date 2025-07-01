/**
 * 技能系统路由配置
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/skills',
      handler: 'skill.find',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/skills/:id',
      handler: 'skill.findOne',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/skills/type/:type',
      handler: 'skill.getByType',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/skills/hero/:heroId',
      handler: 'skill.getHeroSkills',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/skills/stats/overview',
      handler: 'skill.getSkillStats',
      config: {
        auth: false
      }
    }
  ]
};