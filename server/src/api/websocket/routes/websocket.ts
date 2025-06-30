export default {
  routes: [
    {
      method: 'GET',
      path: '/websocket/status',
      handler: 'websocket.getStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/websocket/send-to-user',
      handler: 'websocket.sendToUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/websocket/broadcast',
      handler: 'websocket.broadcast',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/websocket/game-notification',
      handler: 'websocket.sendGameNotification',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};