/**
 * friendship router
 * 好友系统路由
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/friends',
      handler: 'friendship.find',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/friends/search',
      handler: 'friendship.searchUsers',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/friends/request',
      handler: 'friendship.sendFriendRequest',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/friends/request/handle',
      handler: 'friendship.handleFriendRequest',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/friends/requests',
      handler: 'friendship.getFriendRequests',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'DELETE',
      path: '/friends/remove',
      handler: 'friendship.removeFriend',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/friends/send-energy',
      handler: 'friendship.sendEnergy',
      config: {
        auth: false,
        middlewares: [],
        policies: []
      }
    }
  ]
};