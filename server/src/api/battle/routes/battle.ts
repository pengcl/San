/**
 * 战斗系统路由配置
 * 基于API规范 battle-apis.json 实现
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/battles/stages',
      handler: 'battle.getStages',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/battles/start',
      handler: 'battle.startBattle',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/battles/:battleId/action',
      handler: 'battle.executeAction',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/battles/:battleId/auto',
      handler: 'battle.autoBattle',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/battles/:battleId/result',
      handler: 'battle.getBattleResult',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  ]
};