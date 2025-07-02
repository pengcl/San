/**
 * achievement router
 * 成就系统路由
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/achievements',
      handler: 'achievement.find',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/achievements/progress',
      handler: 'achievement.updateProgress',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/achievements/claim',
      handler: 'achievement.claimReward',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/achievements/statistics',
      handler: 'achievement.getStatistics',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    }
  ]
};