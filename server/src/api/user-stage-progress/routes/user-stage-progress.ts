/**
 * 用户关卡进度路由配置
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/user-stage-progresses',
      handler: 'user-stage-progress.find',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/user-stage-progresses/:id',
      handler: 'user-stage-progress.findOne',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/user-stage-progresses/stage/:stageId',
      handler: 'user-stage-progress.getByStage',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/user-stage-progresses/initialize',
      handler: 'user-stage-progress.initializeProgress',
      config: {
        auth: false, // 使用自定义JWT中间件
        middlewares: [],
        policies: []
      }
    }
  ]
};