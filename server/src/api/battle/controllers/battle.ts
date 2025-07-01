/**
 * 战斗系统控制器
 * 基于API规范 battle-apis.json 实现
 */

import { Context } from 'koa';
import { v4 as uuidv4 } from 'uuid';

// 从游戏规则配置读取战斗系统配置
const BATTLE_SYSTEM_CONFIG = {
  formationSystem: {
    gridSize: { rows: 3, columns: 3, totalPositions: 9 },
    positionTypes: {
      frontRow: [0, 1, 2],
      middleRow: [3, 4, 5], 
      backRow: [6, 7, 8]
    },
    positionBonuses: {
      frontRow: { tauntChance: 0.3, damageReduction: 0.1 },
      middleRow: { balancedStats: 0.05 },
      backRow: { criticalChance: 0.1, spellPower: 0.15 }
    }
  },
  combatMechanics: {
    critical: { baseChance: 0.05, damageMultiplier: 1.5 },
    dodge: { baseChance: 0.03, speedInfluence: 0.001, maxChance: 0.3 },
    block: { baseChance: 0.02, defenseInfluence: 0.0005, damageReduction: 0.5, maxChance: 0.25 }
  },
  battleTypes: {
    pve_normal: { energyCost: 6, maxAttempts: -1, difficultyScaling: 1.0 },
    pve_elite: { energyCost: 12, maxAttempts: 3, difficultyScaling: 1.5 },
    pvp_arena: { energyCost: 0, maxAttempts: 5, difficultyScaling: 'player_based' }
  }
};

// 活跃战斗缓存
const activeBattles = new Map();

module.exports = {
  /**
   * 获取关卡列表
   */
  async getStages(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { chapter, difficulty, completed } = ctx.query;

      // TODO: 实现关卡系统
      // 这里先返回模拟数据
      const chapters = [
        {
          id: 1,
          name: '第一章：桃园结义',
          description: '刘关张三兄弟的传奇开始',
          unlocked: true,
          totalStars: 6,
          maxStars: 24,
          stages: [
            {
              id: '1-1',
              name: '黄巾起义',
              energyCost: 6,
              recommendedPower: 1000,
              unlocked: true,
              completed: false,
              stars: 0,
              firstClearReward: { gold: 1000, experience: 100 },
              dropItems: [
                { itemId: 1, name: '经验药水', dropRate: 0.8 },
                { itemId: 2, name: '金币袋', dropRate: 0.6 }
              ],
              enemies: [
                { name: '黄巾贼', level: 5, avatar: '/images/enemies/rebel.png' },
                { name: '黄巾头目', level: 8, avatar: '/images/enemies/rebel_leader.png' }
              ]
            },
            {
              id: '1-2',
              name: '遇见诸葛亮',
              energyCost: 6,
              recommendedPower: 1200,
              unlocked: true,
              completed: false,
              stars: 0,
              firstClearReward: { gold: 1200, experience: 120 },
              dropItems: [
                { itemId: 3, name: '智慧卷轴', dropRate: 0.4 },
                { itemId: 1, name: '经验药水', dropRate: 0.8 }
              ],
              enemies: [
                { name: '山贼', level: 10, avatar: '/images/enemies/bandit.png' }
              ]
            }
          ]
        }
      ];

      ctx.body = {
        success: true,
        data: {
          chapters
        }
      };
    } catch (error) {
      console.error('获取关卡列表错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_STAGES_ERROR',
          message: '获取关卡列表失败'
        }
      };
    }
  },

  /**
   * 开始战斗
   */
  async startBattle(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { battleType, stageId, opponentId, formation, autoSkill = true } = ctx.request.body;

      // 验证战斗类型
      if (!['pve_normal', 'pve_elite', 'pvp_arena', 'guild_war', 'world_boss'].includes(battleType)) {
        return ctx.badRequest('无效的战斗类型');
      }

      // 验证阵容
      if (!formation || !Array.isArray(formation) || formation.length === 0) {
        return ctx.badRequest('阵容无效');
      }

      // 检查体力消耗
      const battleConfig = BATTLE_SYSTEM_CONFIG.battleTypes[battleType];
      if (battleConfig && battleConfig.energyCost > 0) {
        const userProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
          where: { user: user.id }
        });

        if (!userProfile || userProfile.stamina < battleConfig.energyCost) {
          return ctx.badRequest('体力不足');
        }
      }

      // 获取玩家武将
      const playerHeroes = await getUserHeroesByFormation(user.id, formation);
      if (playerHeroes.length === 0) {
        return ctx.badRequest('没有有效的武将');
      }

      // 生成敌方队伍
      let enemyTeam;
      if (battleType.startsWith('pve')) {
        enemyTeam = await generatePveEnemies(stageId, battleConfig.difficultyScaling);
      } else if (battleType === 'pvp_arena') {
        if (!opponentId) {
          return ctx.badRequest('PVP战斗需要指定对手');
        }
        enemyTeam = await getUserHeroesByUserId(opponentId);
      } else {
        return ctx.badRequest('暂不支持此战斗类型');
      }

      // 创建战斗实例
      const battleId = uuidv4();
      const battle = {
        battleId,
        battleType,
        playerId: user.id,
        opponentId: opponentId || null,
        stageId: stageId || null,
        playerTeam: {
          heroes: playerHeroes.map((hero, index) => ({
            id: hero.id,
            name: hero.hero.name,
            level: hero.level,
            position: formation[index]?.position || index,
            currentHp: calculateHeroHp(hero.hero, hero.level, hero.star),
            maxHp: calculateHeroHp(hero.hero, hero.level, hero.star),
            stats: calculateHeroStats(hero.hero, hero.level, hero.star),
            skills: [], // TODO: 实现技能系统
            buffs: []
          }))
        },
        enemyTeam: {
          heroes: enemyTeam.map((enemy, index) => ({
            id: 1000 + index,
            name: enemy.name,
            level: enemy.level,
            position: index,
            currentHp: enemy.hp,
            maxHp: enemy.hp,
            stats: {
              hp: enemy.hp,
              attack: enemy.attack,
              defense: enemy.defense,
              speed: enemy.speed
            },
            skills: [],
            buffs: []
          }))
        },
        battleState: {
          turn: 1,
          phase: 'preparation',
          timeLimit: 300,
          battleEnded: false,
          winner: null
        },
        autoSkill,
        startedAt: new Date(),
        battleLog: []
      };

      // 缓存战斗数据
      activeBattles.set(battleId, battle);

      // 计算行动顺序
      const nextActions = calculateTurnOrder(battle);

      // 扣除体力
      if (battleConfig && battleConfig.energyCost > 0) {
        const currentUserProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
          where: { user: user.id }
        });
        
        if (currentUserProfile) {
          await strapi.db.query('api::user-profile.user-profile').update({
            where: { user: user.id },
            data: {
              stamina: Math.max(0, currentUserProfile.stamina - battleConfig.energyCost)
            }
          });
        }
      }

      ctx.body = {
        success: true,
        data: {
          battleId: battle.battleId,
          battleType: battle.battleType,
          playerTeam: battle.playerTeam,
          enemyTeam: battle.enemyTeam,
          battleState: battle.battleState,
          nextActions
        }
      };
    } catch (error) {
      console.error('开始战斗错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'START_BATTLE_ERROR',
          message: '开始战斗失败'
        }
      };
    }
  },

  /**
   * 执行战斗动作
   */
  async executeAction(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { battleId } = ctx.params;
      const { heroId, actionType, skillId, targetId, targetPosition } = ctx.request.body;

      // 获取战斗实例
      const battle = activeBattles.get(battleId);
      if (!battle) {
        return ctx.notFound('战斗不存在');
      }

      if (battle.playerId !== user.id) {
        return ctx.forbidden('不是你的战斗');
      }

      if (battle.battleState.battleEnded) {
        return ctx.badRequest('战斗已结束');
      }

      // 验证动作类型
      if (!['attack', 'skill', 'ultimate', 'defend'].includes(actionType)) {
        return ctx.badRequest('无效的动作类型');
      }

      // 查找执行动作的武将
      const activeHero = battle.playerTeam.heroes.find(h => h.id === heroId);
      if (!activeHero) {
        return ctx.badRequest('武将不存在');
      }

      if (activeHero.currentHp <= 0) {
        return ctx.badRequest('武将已倒下');
      }

      // 查找目标
      let target = null;
      if (targetId) {
        target = battle.enemyTeam.heroes.find(h => h.id === targetId) ||
                battle.playerTeam.heroes.find(h => h.id === targetId);
        if (!target) {
          return ctx.badRequest('目标不存在');
        }
      }

      // 执行动作
      const actionResult = await executeActionLogic(battle, activeHero, {
        actionType,
        skillId,
        target,
        targetPosition
      });

      // 更新战斗日志
      battle.battleLog.push({
        turn: battle.battleState.turn,
        heroId: activeHero.id,
        heroName: activeHero.name,
        actionType,
        target: target ? target.name : null,
        result: actionResult,
        timestamp: new Date()
      });

      // 检查战斗是否结束
      const battleEndCheck = checkBattleEnd(battle);
      if (battleEndCheck.ended) {
        battle.battleState.battleEnded = true;
        battle.battleState.winner = battleEndCheck.winner;
        battle.endedAt = new Date();
        
        // 保存战斗记录到数据库
        await saveBattleResult(battle);
      }

      // 计算下一轮行动
      const nextActions = battleEndCheck.ended ? [] : calculateTurnOrder(battle);

      // 更新回合数
      if (!battleEndCheck.ended) {
        battle.battleState.turn++;
      }

      ctx.body = {
        success: true,
        data: {
          actionResult,
          battleState: battle.battleState,
          nextActions,
          battleLog: battle.battleLog.slice(-5) // 只返回最近5条日志
        }
      };
    } catch (error) {
      console.error('执行战斗动作错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'EXECUTE_ACTION_ERROR',
          message: '执行战斗动作失败'
        }
      };
    }
  },

  /**
   * 获取战斗结果
   */
  async getBattleResult(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { battleId } = ctx.params;

      // 首先查找活跃战斗
      let battle = activeBattles.get(battleId);
      
      // 如果活跃战斗中没有，查询数据库
      if (!battle) {
        const battleRecord = await strapi.db.query('api::battle.battle').findOne({
          where: { 
            id: battleId,
            attacker: user.id 
          }
        });

        if (!battleRecord) {
          return ctx.notFound('战斗不存在或未结束');
        }

        battle = JSON.parse(battleRecord.battle_data);
      }

      if (!battle.battleState.battleEnded) {
        return ctx.badRequest('战斗未结束');
      }

      // 计算奖励
      const rewards = calculateBattleRewards(battle);
      
      // 计算经验
      const experience = calculateBattleExperience(battle);

      // 计算统计数据
      const statistics = calculateBattleStatistics(battle);

      // 计算星级评价
      const starRating = calculateStarRating(battle);

      const battleResult = {
        battleId: battle.battleId,
        battleType: battle.battleType,
        result: battle.battleState.winner === 'player' ? 'victory' : 'defeat',
        duration: Math.floor((new Date(battle.endedAt).getTime() - new Date(battle.startedAt).getTime()) / 1000),
        turns: battle.battleState.turn,
        starRating,
        experience,
        rewards,
        statistics,
        achievements: [] // TODO: 实现成就系统
      };

      ctx.body = {
        success: true,
        data: battleResult
      };
    } catch (error) {
      console.error('获取战斗结果错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_BATTLE_RESULT_ERROR',
          message: '获取战斗结果失败'
        }
      };
    }
  },

  /**
   * 自动战斗
   */
  async autoBattle(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { battleId } = ctx.params;
      const { enabled, skillPriority = 'balanced' } = ctx.request.body;

      const battle = activeBattles.get(battleId);
      if (!battle) {
        return ctx.notFound('战斗不存在');
      }

      if (battle.playerId !== user.id) {
        return ctx.forbidden('不是你的战斗');
      }

      battle.autoSkill = enabled;
      battle.skillPriority = skillPriority;

      // 如果启用自动战斗，立即执行到战斗结束
      let battleResult = null;
      if (enabled && !battle.battleState.battleEnded) {
        battleResult = await executeAutoBattle(battle);
      }

      ctx.body = {
        success: true,
        data: {
          autoEnabled: enabled,
          battleResult,
          message: enabled ? '自动战斗已启用' : '自动战斗已关闭'
        }
      };
    } catch (error) {
      console.error('自动战斗错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'AUTO_BATTLE_ERROR',
          message: '自动战斗失败'
        }
      };
    }
  }
};

// 辅助函数

async function getUserHeroesByFormation(userId: number, formation: any[]) {
  const heroIds = formation.map(f => f.heroId).filter(id => id);
  
  if (heroIds.length === 0) return [];

  return await strapi.db.query('api::user-hero.user-hero').findMany({
    where: {
      user: userId,
      id: { $in: heroIds }
    },
    populate: {
      hero: {
        populate: {
          quality: true,
          faction: true,
          unit_type: true
        }
      }
    }
  });
}

async function getUserHeroesByUserId(userId: number) {
  // TODO: 获取用户的防守阵容
  return [];
}

async function generatePveEnemies(stageId: string, difficultyScaling: number) {
  // 根据关卡生成敌人
  const baseEnemies = [
    { name: '黄巾贼', level: 5, hp: 800, attack: 100, defense: 80, speed: 70 },
    { name: '黄巾头目', level: 8, hp: 1200, attack: 150, defense: 120, speed: 85 }
  ];

  return baseEnemies.map(enemy => ({
    ...enemy,
    hp: Math.floor(enemy.hp * difficultyScaling),
    attack: Math.floor(enemy.attack * difficultyScaling),
    defense: Math.floor(enemy.defense * difficultyScaling),
    speed: Math.floor(enemy.speed * difficultyScaling)
  }));
}

function calculateHeroHp(hero: any, level: number, star: number) {
  const baseHp = hero.base_hp || 1000;
  const levelBonus = (level - 1) * 50;
  const starMultiplier = 1 + (star - 1) * 0.2;
  return Math.floor((baseHp + levelBonus) * starMultiplier);
}

function calculateHeroStats(hero: any, level: number, star: number) {
  const levelBonus = level - 1;
  const starMultiplier = 1 + (star - 1) * 0.2;
  
  return {
    hp: calculateHeroHp(hero, level, star),
    attack: Math.floor((hero.base_attack + levelBonus * 10) * starMultiplier),
    defense: Math.floor((hero.base_defense + levelBonus * 8) * starMultiplier),
    speed: Math.floor((hero.base_speed + levelBonus * 2) * starMultiplier)
  };
}

function calculateTurnOrder(battle: any) {
  const allHeroes = [...battle.playerTeam.heroes, ...battle.enemyTeam.heroes]
    .filter(hero => hero.currentHp > 0)
    .map(hero => ({
      heroId: hero.id,
      name: hero.name,
      initiative: hero.stats.speed * (0.9 + Math.random() * 0.2),
      isPlayer: battle.playerTeam.heroes.includes(hero)
    }))
    .sort((a, b) => b.initiative - a.initiative);

  return allHeroes.map(hero => ({
    heroId: hero.heroId,
    actionType: 'waiting',
    availableTargets: hero.isPlayer ? 
      battle.enemyTeam.heroes.filter(h => h.currentHp > 0).map(h => h.id) :
      battle.playerTeam.heroes.filter(h => h.currentHp > 0).map(h => h.id),
    availableSkills: [] // TODO: 实现技能系统
  }));
}

async function executeActionLogic(battle: any, activeHero: any, action: any) {
  const { actionType, target } = action;
  
  let damage = 0;
  let healing = 0;
  let criticalHit = false;
  let dodged = false;
  let blocked = false;

  if (actionType === 'attack' && target) {
    // 计算基础伤害
    const baseDamage = Math.max(1, activeHero.stats.attack - target.stats.defense);
    
    // 检查闪避
    const dodgeChance = BATTLE_SYSTEM_CONFIG.combatMechanics.dodge.baseChance + 
                      target.stats.speed * BATTLE_SYSTEM_CONFIG.combatMechanics.dodge.speedInfluence;
    dodged = Math.random() < Math.min(dodgeChance, BATTLE_SYSTEM_CONFIG.combatMechanics.dodge.maxChance);
    
    if (!dodged) {
      // 检查格挡
      const blockChance = BATTLE_SYSTEM_CONFIG.combatMechanics.block.baseChance + 
                         target.stats.defense * BATTLE_SYSTEM_CONFIG.combatMechanics.block.defenseInfluence;
      blocked = Math.random() < Math.min(blockChance, BATTLE_SYSTEM_CONFIG.combatMechanics.block.maxChance);
      
      // 检查暴击
      criticalHit = Math.random() < BATTLE_SYSTEM_CONFIG.combatMechanics.critical.baseChance;
      
      // 计算最终伤害
      damage = baseDamage;
      if (criticalHit) {
        damage *= BATTLE_SYSTEM_CONFIG.combatMechanics.critical.damageMultiplier;
      }
      if (blocked) {
        damage *= (1 - BATTLE_SYSTEM_CONFIG.combatMechanics.block.damageReduction);
      }
      
      damage = Math.floor(damage);
      target.currentHp = Math.max(0, target.currentHp - damage);
    }
  } else if (actionType === 'defend') {
    // 防御动作，下一次受到的伤害减少50%
    activeHero.buffs = activeHero.buffs || [];
    activeHero.buffs.push({
      type: 'defense_boost',
      duration: 1,
      value: 0.5
    });
  }

  return {
    success: true,
    damage,
    healing,
    effects: [],
    criticalHit,
    dodged,
    blocked
  };
}

function checkBattleEnd(battle: any) {
  const playerAlive = battle.playerTeam.heroes.some(h => h.currentHp > 0);
  const enemyAlive = battle.enemyTeam.heroes.some(h => h.currentHp > 0);
  
  if (!playerAlive) {
    return { ended: true, winner: 'enemy' };
  } else if (!enemyAlive) {
    return { ended: true, winner: 'player' };
  } else if (battle.battleState.turn > 100) { // 超时判定
    return { ended: true, winner: 'draw' };
  }
  
  return { ended: false, winner: null };
}

async function saveBattleResult(battle: any) {
  try {
    await strapi.db.query('api::battle.battle').create({
      data: {
        attacker: battle.playerId,
        defender: battle.opponentId,
        battle_type: battle.battleType.includes('pve') ? 'pve' : 'arena',
        stage_id: battle.stageId ? parseInt(battle.stageId.split('-')[1]) : 0,
        result: battle.battleState.winner === 'player' ? 'victory' : 'defeat',
        battle_data: JSON.stringify(battle),
        attacker_team: JSON.stringify(battle.playerTeam),
        defender_team: JSON.stringify(battle.enemyTeam),
        battle_log: JSON.stringify(battle.battleLog),
        duration: Math.floor((new Date(battle.endedAt).getTime() - new Date(battle.startedAt).getTime()) / 1000)
      }
    });
    
    // 从活跃战斗中移除
    activeBattles.delete(battle.battleId);
  } catch (error) {
    console.error('保存战斗记录失败:', error);
  }
}

function calculateBattleRewards(battle: any) {
  const isVictory = battle.battleState.winner === 'player';
  let baseGold = 100;
  let baseExp = 50;
  
  if (battle.stageId) {
    const stageLevel = parseInt(battle.stageId.split('-')[1]) || 1;
    baseGold = stageLevel * 50;
    baseExp = stageLevel * 10;
  }
  
  return {
    gold: isVictory ? baseGold : Math.floor(baseGold * 0.1),
    items: isVictory ? [
      { itemId: 1, name: '经验药水', quantity: 1, rarity: 1 }
    ] : [],
    heroFragments: []
  };
}

function calculateBattleExperience(battle: any) {
  const baseExp = 50;
  return {
    player: baseExp,
    heroes: battle.playerTeam.heroes.map(hero => ({
      heroId: hero.id,
      expGained: baseExp,
      levelUp: false,
      newLevel: hero.level
    }))
  };
}

function calculateBattleStatistics(battle: any) {
  let totalDamage = 0;
  let totalHealing = 0;
  let criticalHits = 0;
  let skillsUsed = 0;

  battle.battleLog.forEach(log => {
    if (log.result.damage) totalDamage += log.result.damage;
    if (log.result.healing) totalHealing += log.result.healing;
    if (log.result.criticalHit) criticalHits++;
    if (log.actionType === 'skill') skillsUsed++;
  });

  return {
    totalDamageDealt: totalDamage,
    totalDamageReceived: 0, // TODO: 计算承受伤害
    totalHealing,
    criticalHits,
    skillsUsed
  };
}

function calculateStarRating(battle: any) {
  const isVictory = battle.battleState.winner === 'player';
  if (!isVictory) return 0;
  
  const noDeaths = battle.playerTeam.heroes.every(h => h.currentHp > 0);
  const quickVictory = battle.battleState.turn <= 10;
  
  if (noDeaths && quickVictory) return 3;
  if (noDeaths || quickVictory) return 2;
  return 1;
}

async function executeAutoBattle(battle: any) {
  // 简单的自动战斗逻辑
  while (!battle.battleState.battleEnded) {
    const turnOrder = calculateTurnOrder(battle);
    
    for (const action of turnOrder) {
      if (battle.battleState.battleEnded) break;
      
      const hero = [...battle.playerTeam.heroes, ...battle.enemyTeam.heroes]
        .find(h => h.id === action.heroId);
      
      if (!hero || hero.currentHp <= 0) continue;
      
      // 选择目标
      const targets = action.availableTargets;
      if (targets.length === 0) continue;
      
      const targetId = targets[Math.floor(Math.random() * targets.length)];
      const target = [...battle.playerTeam.heroes, ...battle.enemyTeam.heroes]
        .find(h => h.id === targetId);
      
      // 执行攻击
      const actionResult = await executeActionLogic(battle, hero, {
        actionType: 'attack',
        target
      });
      
      // 更新战斗日志
      battle.battleLog.push({
        turn: battle.battleState.turn,
        heroId: hero.id,
        heroName: hero.name,
        actionType: 'attack',
        target: target.name,
        result: actionResult,
        timestamp: new Date()
      });
      
      // 检查战斗是否结束
      const battleEndCheck = checkBattleEnd(battle);
      if (battleEndCheck.ended) {
        battle.battleState.battleEnded = true;
        battle.battleState.winner = battleEndCheck.winner;
        battle.endedAt = new Date();
        break;
      }
    }
    
    battle.battleState.turn++;
    
    // 防止无限循环
    if (battle.battleState.turn > 100) {
      battle.battleState.battleEnded = true;
      battle.battleState.winner = 'draw';
      battle.endedAt = new Date();
      break;
    }
  }
  
  // 保存战斗结果
  await saveBattleResult(battle);
  
  return {
    battleId: battle.battleId,
    result: battle.battleState.winner,
    turns: battle.battleState.turn
  };
}