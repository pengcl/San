/**
 * 战斗系统服务层
 * 处理战斗逻辑和计算
 */

import { factories } from '@strapi/strapi';

interface HeroStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  criticalRate: number;
  criticalDamage: number;
  accuracy: number;
  evasion: number;
}

interface BattleHero {
  id: number;
  name: string;
  level: number;
  position: number;
  currentHp: number;
  maxHp: number;
  stats: HeroStats;
  skills: any[];
  buffs: any[];
  cooldowns: Record<string, number>;
  energy: number;
  isAlive: boolean;
}

interface Battle {
  battleId: string;
  battleType: string;
  playerId: number;
  playerTeam: { heroes: BattleHero[] };
  enemyTeam: { heroes: BattleHero[] };
  battleState: {
    turn: number;
    phase: string;
    battleEnded: boolean;
    winner: string | null;
  };
  battleLog: any[];
  startedAt: Date;
}

// 武将属性计算
export function calculateHeroStats(heroTemplate: any, level: number, star: number): HeroStats {
  const baseStats = heroTemplate.baseStats || {
    hp: heroTemplate.base_hp || 3000,
    attack: heroTemplate.base_attack || 400,
    defense: heroTemplate.base_defense || 400,
    speed: heroTemplate.base_speed || 80
  };

  // 等级增长
  const levelMultiplier = 1 + (level - 1) * 0.1;
  
  // 星级增长
  const starMultiplier = 1 + (star - 1) * 0.2;
  
  // 品质增长
  const qualityMultiplier = getQualityMultiplier(heroTemplate.quality || star);

  return {
    hp: Math.floor(baseStats.hp * levelMultiplier * starMultiplier * qualityMultiplier),
    attack: Math.floor(baseStats.attack * levelMultiplier * starMultiplier * qualityMultiplier),
    defense: Math.floor(baseStats.defense * levelMultiplier * starMultiplier * qualityMultiplier),
    speed: Math.floor(baseStats.speed * (1 + (levelMultiplier - 1) * 0.5) * starMultiplier),
    criticalRate: 0.05 + (star - 1) * 0.01,
    criticalDamage: 1.5 + (star - 1) * 0.1,
    accuracy: 0.95,
    evasion: 0.05 + Math.min(baseStats.speed / 2000, 0.15)
  };
}

// 品质倍数计算
function getQualityMultiplier(quality: number): number {
  const multipliers = {
    1: 1.0,   // 普通
    2: 1.2,   // 优秀
    3: 1.5,   // 精良
    4: 2.0,   // 史诗
    5: 2.5,   // 传说
    6: 3.0    // 神话
  };
  return multipliers[quality] || 1.0;
}

// 伤害计算
export function calculateDamage(
  attacker: BattleHero, 
  defender: BattleHero, 
  skillMultiplier: number = 1.0,
  skillType: string = 'physical'
): number {
  const baseAttack = attacker.stats.attack;
  const defense = defender.stats.defense;
  
  // 基础伤害公式
  let damage = baseAttack * skillMultiplier;
  
  // 防御减免
  const defenseReduction = defense / (defense + 1000);
  damage = damage * (1 - defenseReduction);
  
  // 暴击判定
  const criticalRoll = Math.random();
  if (criticalRoll < attacker.stats.criticalRate) {
    damage *= attacker.stats.criticalDamage;
  }
  
  // 随机因子
  const randomFactor = 0.9 + Math.random() * 0.2; // 90%-110%
  damage *= randomFactor;
  
  // 技能类型修正
  if (skillType === 'magical') {
    // 魔法伤害，防御减免较少
    damage *= 1.2;
  }
  
  return Math.max(1, Math.floor(damage));
}

// 计算行动顺序
export function calculateTurnOrder(battle: Battle): BattleHero[] {
  const allHeroes = [
    ...battle.playerTeam.heroes.filter(h => h.isAlive),
    ...battle.enemyTeam.heroes.filter(h => h.isAlive)
  ];
  
  // 按速度排序，速度相同时随机
  return allHeroes.sort((a, b) => {
    if (a.stats.speed === b.stats.speed) {
      return Math.random() - 0.5;
    }
    return b.stats.speed - a.stats.speed;
  });
}

// 执行攻击动作
export function executeAttack(
  battle: Battle,
  attackerId: number,
  targetId: number,
  skillId?: number
): any {
  const attacker = findHeroInBattle(battle, attackerId);
  const target = findHeroInBattle(battle, targetId);
  
  if (!attacker || !target || !attacker.isAlive || !target.isAlive) {
    return { error: '无效的攻击目标' };
  }
  
  // 技能数据
  const skill = skillId ? attacker.skills.find(s => s.id === skillId) : null;
  const skillMultiplier = skill ? skill.damageMultiplier || 1.0 : 1.0;
  const skillType = skill ? skill.type || 'physical' : 'physical';
  
  // 命中判定
  const hitRoll = Math.random();
  const hitRate = attacker.stats.accuracy - target.stats.evasion;
  
  if (hitRoll > hitRate) {
    return {
      success: true,
      action: 'miss',
      attacker: attacker.name,
      target: target.name,
      damage: 0,
      message: `${attacker.name} 的攻击被 ${target.name} 闪避了！`
    };
  }
  
  // 计算伤害
  const damage = calculateDamage(attacker, target, skillMultiplier, skillType);
  
  // 扣除生命值
  target.currentHp = Math.max(0, target.currentHp - damage);
  if (target.currentHp <= 0) {
    target.isAlive = false;
  }
  
  // 增加能量
  attacker.energy = Math.min(100, attacker.energy + 20);
  target.energy = Math.min(100, target.energy + 10);
  
  const actionResult = {
    success: true,
    action: 'attack',
    attacker: attacker.name,
    target: target.name,
    damage,
    skill: skill ? skill.name : '普通攻击',
    targetCurrentHp: target.currentHp,
    targetMaxHp: target.maxHp,
    isKill: !target.isAlive,
    message: `${attacker.name} 对 ${target.name} 造成了 ${damage} 点伤害！`
  };
  
  // 记录战斗日志
  battle.battleLog.push({
    turn: battle.battleState.turn,
    timestamp: new Date(),
    ...actionResult
  });
  
  return actionResult;
}

// 检查战斗是否结束
export function checkBattleEnd(battle: Battle): { ended: boolean; winner: string | null } {
  const playerAlive = battle.playerTeam.heroes.some(h => h.isAlive);
  const enemyAlive = battle.enemyTeam.heroes.some(h => h.isAlive);
  
  if (!playerAlive) {
    battle.battleState.battleEnded = true;
    battle.battleState.winner = 'enemy';
    return { ended: true, winner: 'enemy' };
  }
  
  if (!enemyAlive) {
    battle.battleState.battleEnded = true;
    battle.battleState.winner = 'player';
    return { ended: true, winner: 'player' };
  }
  
  return { ended: false, winner: null };
}

// 在战斗中查找武将
function findHeroInBattle(battle: Battle, heroId: number): BattleHero | null {
  const playerHero = battle.playerTeam.heroes.find(h => h.id === heroId);
  if (playerHero) return playerHero;
  
  const enemyHero = battle.enemyTeam.heroes.find(h => h.id === heroId);
  if (enemyHero) return enemyHero;
  
  return null;
}

// 生成PVE敌人
export async function generatePveEnemies(stageId: string, difficultyScaling: number): Promise<any[]> {
  // 根据关卡ID生成敌人数据
  const baseEnemies = [
    {
      name: '黄巾贼',
      level: 5,
      hp: 2000,
      attack: 300,
      defense: 250,
      speed: 70,
      skills: []
    },
    {
      name: '黄巾头目',
      level: 8,
      hp: 3500,
      attack: 450,
      defense: 400,
      speed: 80,
      skills: []
    }
  ];
  
  // 应用难度缩放
  return baseEnemies.map(enemy => ({
    ...enemy,
    hp: Math.floor(enemy.hp * difficultyScaling),
    attack: Math.floor(enemy.attack * difficultyScaling),
    defense: Math.floor(enemy.defense * difficultyScaling),
    level: Math.floor(enemy.level * difficultyScaling)
  }));
}

// 获取用户武将按阵容
export async function getUserHeroesByFormation(userId: number, formation: any[]): Promise<any[]> {
  const heroIds = formation.map(f => f.heroId).filter(Boolean);
  
  const userHeroes = await strapi.db.query('api::user-hero.user-hero').findMany({
    where: {
      user: userId,
      id: { $in: heroIds }
    },
    populate: ['hero']
  });
  
  // 按阵容顺序排列
  return formation.map(f => {
    return userHeroes.find(uh => uh.id === f.heroId);
  }).filter(Boolean);
}

export default factories.createCoreService('api::battle.battle', ({ strapi }) => ({
  calculateHeroStats,
  calculateDamage,
  calculateTurnOrder,
  executeAttack,
  checkBattleEnd,
  generatePveEnemies,
  getUserHeroesByFormation
}));