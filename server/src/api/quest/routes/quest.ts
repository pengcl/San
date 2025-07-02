/**
 * quest router
 * 任务系统路由
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/quests',
      handler: 'quest.find',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/quests/daily',
      handler: 'quest.getDailyQuests',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/quests/progress',
      handler: 'quest.updateProgress',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/quests/claim',
      handler: 'quest.claimReward',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    }
  ]
};