/**
 * 召唤系统路由配置
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/summon/normal',
      handler: 'summon.normalSummon',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/summon/premium',
      handler: 'summon.premiumSummon',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/summon/history',
      handler: 'summon.getSummonHistory',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/summon/rates',
      handler: 'summon.getSummonRates',
      config: {
        auth: false  // 召唤概率可公开查看
      }
    },
    {
      method: 'POST',
      path: '/summon/synthesize',
      handler: 'summon.synthesizeHero',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  ]
};