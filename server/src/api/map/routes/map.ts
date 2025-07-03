export default {
  routes: [
    {
      method: 'GET',
      path: '/map',
      handler: 'map.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/map',
      handler: 'map.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/map/spawn-location',
      handler: 'map.getSpawnLocation',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/map/data',
      handler: 'map.getMapData',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/map/cities/:targetCityId/attack',
      handler: 'map.attackCity',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/map/cities/:cityId/defend',
      handler: 'map.defendCity',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/map/cities/:cityId/collect',
      handler: 'map.collectResources',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/map/cities/:cityId/upgrade',
      handler: 'map.upgradeCity',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/map/cities/:cityId/development',
      handler: 'map.getDevelopmentInfo',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};