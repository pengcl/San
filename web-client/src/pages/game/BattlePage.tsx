import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addNotification } from '../../store/slices/uiSlice';
import { useAnalytics } from '../../hooks/useAnalytics';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
import HealthBar from '../../components/ui/HealthBar';
import SkillAnimationSystem from '../../components/battle/SkillAnimationSystem';
import type { Hero } from '../../types';

interface BattleHero extends Hero {
  currentHealth: number;
  maxHealth: number;
  energy: number;
  position: { x: number; y: number };
  isPlayer: boolean;
  skills: BattleSkill[];
}

interface BattleSkill {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldown: number;
  currentCooldown: number;
  animationId: string;
  damage?: number;
  healing?: number;
  icon: string;
}

const BattlePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trackGameEvent } = useAnalytics();
  const battleFieldRef = useRef<HTMLDivElement>(null);
  const animationSystemRef = useRef<{
    playAnimation: (effect: any, casterId: number, targetId: number) => void;
    clearQueue: () => void;
    isPlaying: boolean;
  }>(null);

  const [playerTeam, setPlayerTeam] = useState<BattleHero[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<BattleHero[]>([]);
  const [selectedHero, setSelectedHero] = useState<BattleHero | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<BattleSkill | null>(null);
  const [battlePhase, setBattlePhase] = useState<'preparation' | 'battle' | 'victory' | 'defeat'>('preparation');
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [turnCount, setTurnCount] = useState(1);

  useEffect(() => {
    trackGameEvent('battle_view');
    initializeBattle();
  }, [trackGameEvent]);

  const initializeBattle = () => {
    // 初始化玩家队伍
    const mockPlayerTeam: BattleHero[] = [
      {
        id: 1, name: '刘备', title: '仁德之主', description: '', level: 45, experience: 8750,
        rarity: 5, faction: '蜀', role: '辅助', unit_type: '步兵', cost: 7,
        health: 2100, attack: 180, defense: 220, speed: 75, energy: 100,
        equipment: [], created_at: '', updated_at: '',
        currentHealth: 2100, maxHealth: 2100,
        position: { x: 100, y: 150 }, isPlayer: true,
        skills: [
          {
            id: 'heal_1', name: '仁德治疗', description: '恢复友军生命值',
            energyCost: 30, cooldown: 2, currentCooldown: 0,
            animationId: 'heal', healing: 500, icon: '💚'
          },
          {
            id: 'buff_1', name: '王者威严', description: '提升全队攻击力',
            energyCost: 50, cooldown: 4, currentCooldown: 0,
            animationId: 'power_up', icon: '👑'
          }
        ]
      },
      {
        id: 2, name: '关羽', title: '武圣', description: '', level: 50, experience: 12000,
        rarity: 6, faction: '蜀', role: '物理输出', unit_type: '骑兵', cost: 8,
        health: 1800, attack: 320, defense: 180, speed: 90, energy: 100,
        equipment: [], created_at: '', updated_at: '',
        currentHealth: 1800, maxHealth: 1800,
        position: { x: 100, y: 250 }, isPlayer: true,
        skills: [
          {
            id: 'slash_1', name: '青龙斩', description: '强力的斩击攻击',
            energyCost: 40, cooldown: 1, currentCooldown: 0,
            animationId: 'slash_attack', damage: 450, icon: '⚔️'
          },
          {
            id: 'ultimate_1', name: '武圣神威', description: '终极必杀技',
            energyCost: 80, cooldown: 6, currentCooldown: 0,
            animationId: 'ultimate_strike', damage: 800, icon: '🌪️'
          }
        ]
      },
      {
        id: 3, name: '张飞', title: '万夫不当', description: '', level: 42, experience: 7200,
        rarity: 4, faction: '蜀', role: '坦克', unit_type: '步兵', cost: 6,
        health: 2800, attack: 200, defense: 280, speed: 60, energy: 100,
        equipment: [], created_at: '', updated_at: '',
        currentHealth: 2800, maxHealth: 2800,
        position: { x: 100, y: 350 }, isPlayer: true,
        skills: [
          {
            id: 'thrust_1', name: '蛇矛突刺', description: '快速突刺攻击',
            energyCost: 35, cooldown: 1, currentCooldown: 0,
            animationId: 'thrust_attack', damage: 380, icon: '🗡️'
          }
        ]
      }
    ];

    // 初始化敌人队伍
    const mockEnemyTeam: BattleHero[] = [
      {
        id: 4, name: '曹操', title: '魏武帝', description: '', level: 48, experience: 10000,
        rarity: 6, faction: '魏', role: '法术输出', unit_type: '步兵', cost: 8,
        health: 1900, attack: 290, defense: 200, speed: 85, energy: 100,
        equipment: [], created_at: '', updated_at: '',
        currentHealth: 1900, maxHealth: 1900,
        position: { x: 500, y: 150 }, isPlayer: false,
        skills: [
          {
            id: 'fire_1', name: '霸王烈焰', description: '火球法术攻击',
            energyCost: 45, cooldown: 2, currentCooldown: 0,
            animationId: 'fireball', damage: 520, icon: '🔥'
          }
        ]
      },
      {
        id: 5, name: '司马懿', title: '冢虎', description: '', level: 46, experience: 9000,
        rarity: 5, faction: '魏', role: '法术输出', unit_type: '弓兵', cost: 7,
        health: 1600, attack: 310, defense: 160, speed: 95, energy: 100,
        equipment: [], created_at: '', updated_at: '',
        currentHealth: 1600, maxHealth: 1600,
        position: { x: 500, y: 250 }, isPlayer: false,
        skills: [
          {
            id: 'lightning_1', name: '雷霆万钧', description: '闪电魔法攻击',
            energyCost: 40, cooldown: 1, currentCooldown: 0,
            animationId: 'lightning_bolt', damage: 480, icon: '⚡'
          }
        ]
      }
    ];

    setPlayerTeam(mockPlayerTeam);
    setEnemyTeam(mockEnemyTeam);
  };

  const startBattle = () => {
    setBattlePhase('battle');
    trackGameEvent('battle_start', {
      playerTeamSize: playerTeam.length,
      enemyTeamSize: enemyTeam.length,
      turnCount: 1
    });

    dispatch(addNotification({
      type: 'info',
      title: '战斗开始',
      message: '选择英雄和技能进行攻击！',
      duration: 3000,
    }));
  };

  const selectHero = (hero: BattleHero) => {
    if (battlePhase !== 'battle' || turn !== 'player' || !hero.isPlayer) return;
    setSelectedHero(hero);
    setSelectedSkill(null);
  };

  const selectSkill = (skill: BattleSkill) => {
    if (!selectedHero || skill.currentCooldown > 0 || selectedHero.energy < skill.energyCost) return;
    setSelectedSkill(skill);
  };

  const executeSkill = (targetHero: BattleHero) => {
    if (!selectedHero || !selectedSkill || !animationSystemRef.current) return;

    // 消耗能量
    setPlayerTeam(prev => prev.map(hero => 
      hero.id === selectedHero.id 
        ? { ...hero, energy: hero.energy - selectedSkill.energyCost }
        : hero
    ));

    // 执行技能动画
    animationSystemRef.current.playAnimation(
      selectedSkill.animationId,
      selectedHero.id,
      targetHero.id,
      {
        damage: selectedSkill.damage,
        healing: selectedSkill.healing,
        onComplete: () => {
          // 应用技能效果
          applySkillEffect(targetHero, selectedSkill);
          // 设置技能冷却
          setPlayerTeam(prev => prev.map(hero => 
            hero.id === selectedHero.id 
              ? { 
                  ...hero, 
                  skills: hero.skills.map(skill => 
                    skill.id === selectedSkill.id 
                      ? { ...skill, currentCooldown: skill.cooldown }
                      : skill
                  )
                }
              : hero
          ));
          
          endPlayerTurn();
        }
      }
    );

    trackGameEvent('skill_use', {
      heroId: selectedHero.id,
      skillId: selectedSkill.id,
      targetId: targetHero.id,
      damage: selectedSkill.damage || 0,
      healing: selectedSkill.healing || 0
    });

    setSelectedHero(null);
    setSelectedSkill(null);
  };

  const applySkillEffect = (target: BattleHero, skill: BattleSkill) => {
    if (skill.damage) {
      // 计算伤害（考虑防御力）
      const actualDamage = Math.max(1, skill.damage - target.defense * 0.5);
      
      if (target.isPlayer) {
        setPlayerTeam(prev => prev.map(hero => 
          hero.id === target.id 
            ? { ...hero, currentHealth: Math.max(0, hero.currentHealth - actualDamage) }
            : hero
        ));
      } else {
        setEnemyTeam(prev => prev.map(hero => 
          hero.id === target.id 
            ? { ...hero, currentHealth: Math.max(0, hero.currentHealth - actualDamage) }
            : hero
        ));
      }
    }

    if (skill.healing) {
      if (target.isPlayer) {
        setPlayerTeam(prev => prev.map(hero => 
          hero.id === target.id 
            ? { ...hero, currentHealth: Math.min(hero.maxHealth, hero.currentHealth + skill.healing!) }
            : hero
        ));
      }
    }
  };

  const endPlayerTurn = () => {
    setTurn('enemy');
    
    // 敌人AI回合
    setTimeout(() => {
      executeEnemyTurn();
    }, 1000);
  };

  const executeEnemyTurn = () => {
    const aliveEnemies = enemyTeam.filter(hero => hero.currentHealth > 0);
    const alivePlayerHeroes = playerTeam.filter(hero => hero.currentHealth > 0);
    
    if (aliveEnemies.length === 0 || alivePlayerHeroes.length === 0) {
      endBattle();
      return;
    }

    // 简单AI：随机选择一个敌人和技能攻击玩家
    const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    const availableSkills = randomEnemy.skills.filter(skill => 
      skill.currentCooldown === 0 && randomEnemy.energy >= skill.energyCost
    );
    
    if (availableSkills.length > 0) {
      const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      const randomTarget = alivePlayerHeroes[Math.floor(Math.random() * alivePlayerHeroes.length)];

      // 执行敌人技能
      animationSystemRef.current?.playAnimation(
        randomSkill.animationId,
        randomEnemy.id,
        randomTarget.id,
        {
          damage: randomSkill.damage,
          onComplete: () => {
            applySkillEffect(randomTarget, randomSkill);
            
            // 更新敌人状态
            setEnemyTeam(prev => prev.map(hero => 
              hero.id === randomEnemy.id 
                ? { 
                    ...hero, 
                    energy: hero.energy - randomSkill.energyCost,
                    skills: hero.skills.map(skill => 
                      skill.id === randomSkill.id 
                        ? { ...skill, currentCooldown: skill.cooldown }
                        : skill
                    )
                  }
                : hero
            ));
            
            setTimeout(() => {
              startNewTurn();
            }, 500);
          }
        }
      );
    } else {
      setTimeout(() => {
        startNewTurn();
      }, 1000);
    }
  };

  const startNewTurn = () => {
    setTurnCount(prev => prev + 1);
    setTurn('player');
    
    // 减少冷却时间，恢复能量
    setPlayerTeam(prev => prev.map(hero => ({
      ...hero,
      energy: Math.min(100, hero.energy + 10),
      skills: hero.skills.map(skill => ({
        ...skill,
        currentCooldown: Math.max(0, skill.currentCooldown - 1)
      }))
    })));
    
    setEnemyTeam(prev => prev.map(hero => ({
      ...hero,
      energy: Math.min(100, hero.energy + 10),
      skills: hero.skills.map(skill => ({
        ...skill,
        currentCooldown: Math.max(0, skill.currentCooldown - 1)
      }))
    })));

    // 检查胜负
    checkBattleEnd();
  };

  const checkBattleEnd = () => {
    const alivePlayerHeroes = playerTeam.filter(hero => hero.currentHealth > 0);
    const aliveEnemies = enemyTeam.filter(hero => hero.currentHealth > 0);
    
    if (alivePlayerHeroes.length === 0) {
      setBattlePhase('defeat');
      trackGameEvent('battle_end', { result: 'defeat', turnCount });
      // 延迟跳转到结算页面
      setTimeout(() => {
        navigate('/battle/result', {
          state: {
            battleResult: {
              victory: false,
              statistics: {
                turnsCount: turnCount,
                totalDamageDealt: playerTeam.reduce((total, hero) => total + (hero.attack * 2), 0),
                totalDamageReceived: playerTeam.reduce((total, hero) => total + (hero.maxHealth - hero.currentHealth), 0),
                skillsUsed: turnCount * 2,
                healingDone: 0,
                battleDuration: turnCount * 8,
              },
              playerTeam: playerTeam.map(hero => ({
                hero,
                finalHealth: hero.currentHealth,
                maxHealth: hero.maxHealth,
                damageDealt: hero.attack * 2,
                damageReceived: hero.maxHealth - hero.currentHealth,
                skillsUsed: Math.floor(turnCount / 2),
                survived: hero.currentHealth > 0,
              })),
              enemyTeam: enemyTeam.map(hero => ({
                hero,
                finalHealth: hero.currentHealth,
                maxHealth: hero.maxHealth,
                defeated: hero.currentHealth <= 0,
              })),
              rewards: {
                experience: Math.floor(Math.random() * 100) + 50,
                gold: Math.floor(Math.random() * 200) + 100,
                items: [],
              },
              levelUps: [],
            }
          }
        });
      }, 2000);
    } else if (aliveEnemies.length === 0) {
      setBattlePhase('victory');
      trackGameEvent('battle_end', { result: 'victory', turnCount });
      // 延迟跳转到结算页面
      setTimeout(() => {
        navigate('/battle/result', {
          state: {
            battleResult: {
              victory: true,
              statistics: {
                turnsCount: turnCount,
                totalDamageDealt: playerTeam.reduce((total, hero) => total + (hero.attack * 3), 0),
                totalDamageReceived: playerTeam.reduce((total, hero) => total + (hero.maxHealth - hero.currentHealth), 0),
                skillsUsed: turnCount * 3,
                healingDone: Math.floor(Math.random() * 500),
                battleDuration: turnCount * 8,
              },
              playerTeam: playerTeam.map(hero => ({
                hero,
                finalHealth: hero.currentHealth,
                maxHealth: hero.maxHealth,
                damageDealt: hero.attack * 3,
                damageReceived: hero.maxHealth - hero.currentHealth,
                skillsUsed: Math.floor(turnCount / 2) + 1,
                survived: hero.currentHealth > 0,
              })),
              enemyTeam: enemyTeam.map(hero => ({
                hero,
                finalHealth: 0,
                maxHealth: hero.maxHealth,
                defeated: true,
              })),
              rewards: {
                experience: Math.floor(Math.random() * 500) + 200,
                gold: Math.floor(Math.random() * 1000) + 500,
                items: [
                  {
                    id: 'exp_potion',
                    name: '经验丹',
                    rarity: 3,
                    quantity: 2,
                    icon: '💊',
                  },
                  {
                    id: 'gold_bag',
                    name: '金币袋',
                    rarity: 2,
                    quantity: 1,
                    icon: '💰',
                  },
                ],
              },
              levelUps: Math.random() > 0.5 ? [
                {
                  heroId: playerTeam[Math.floor(Math.random() * playerTeam.length)].id,
                  oldLevel: 42,
                  newLevel: 43,
                  statsGained: {
                    health: 50,
                    attack: 8,
                    defense: 12,
                    speed: 2,
                  },
                },
              ] : [],
            }
          }
        });
      }, 2000);
    }
  };

  const endBattle = () => {
    checkBattleEnd();
  };

  const renderHero = (hero: BattleHero) => (
    <motion.div
      key={hero.id}
      id={`hero-${hero.id}`}
      className={`absolute w-20 h-24 cursor-pointer transition-all ${
        selectedHero?.id === hero.id ? 'ring-4 ring-orange-500' : ''
      } ${hero.currentHealth <= 0 ? 'opacity-30 grayscale' : ''}`}
      style={{
        left: `${hero.position.x}px`,
        top: `${hero.position.y}px`,
      }}
      onClick={() => {
        if (battlePhase === 'battle') {
          if (hero.isPlayer && turn === 'player') {
            selectHero(hero);
          } else if (!hero.isPlayer && selectedSkill && selectedHero) {
            executeSkill(hero);
          }
        }
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 英雄头像 */}
      <div className={`w-16 h-16 mx-auto rounded-lg flex items-center justify-center text-lg font-bold text-white shadow-lg ${
        hero.isPlayer ? 'bg-blue-600' : 'bg-red-600'
      }`}>
        {hero.name[0]}
      </div>
      
      {/* 英雄名称 */}
      <div className="text-xs text-center text-white mt-1 font-medium">
        {hero.name}
      </div>
      
      {/* 血量条 */}
      <div className="mt-1">
        <HealthBar
          current={hero.currentHealth}
          max={hero.maxHealth}
          color={hero.isPlayer ? 'green' : 'red'}
          className="h-1"
        />
      </div>
      
      {/* 能量条 */}
      <div className="mt-1">
        <HealthBar
          current={hero.energy}
          max={100}
          color="energy"
          className="h-1"
        />
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className='space-y-6 particle-bg'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 战斗标题和状态 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className='text-3xl font-bold text-game-title text-shadow-glow font-game'>
            战斗系统
          </h1>
          <p className='text-gray-400 text-shadow'>
            回合 {turnCount} - {turn === 'player' ? '玩家回合' : '敌人回合'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {battlePhase === 'preparation' && (
            <Button variant="primary" onClick={startBattle}>
              开始战斗
            </Button>
          )}
          {battlePhase === 'victory' && (
            <div className="text-green-400 font-bold text-xl">胜利！</div>
          )}
          {battlePhase === 'defeat' && (
            <div className="text-red-400 font-bold text-xl">失败！</div>
          )}
        </div>
      </div>

      {/* 战斗场地 */}
      <GameCard className="relative">
        <div 
          ref={battleFieldRef}
          className="relative h-96 bg-gradient-to-b from-blue-900/20 to-green-900/20 border-2 border-gray-600 rounded-lg overflow-hidden"
          style={{ 
            backgroundImage: 'url("/images/battle-background.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* 分割线 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-500 opacity-50" />
          
          {/* 玩家队伍 */}
          {playerTeam.map(hero => renderHero(hero))}
          
          {/* 敌人队伍 */}
          {enemyTeam.map(hero => renderHero(hero))}
          
          {/* 技能动画系统 */}
          <SkillAnimationSystem
            ref={animationSystemRef}
            heroes={[...playerTeam, ...enemyTeam]}
            battleFieldRef={battleFieldRef}
            onAnimationComplete={(animationId) => {
              console.log('Animation completed:', animationId);
            }}
          />
        </div>
      </GameCard>

      {/* 技能面板 */}
      <AnimatePresence>
        {selectedHero && battlePhase === 'battle' && turn === 'player' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <GameCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedHero.name}</h3>
                  <p className="text-gray-400">选择技能进行攻击</p>
                </div>
                <div className="text-sm text-gray-300">
                  能量: {selectedHero.energy}/100
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedHero.skills.map(skill => (
                  <Button
                    key={skill.id}
                    variant={selectedSkill?.id === skill.id ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={skill.currentCooldown > 0 || selectedHero.energy < skill.energyCost}
                    onClick={() => selectSkill(skill)}
                    className="flex flex-col items-center p-3 h-auto"
                  >
                    <div className="text-2xl mb-1">{skill.icon}</div>
                    <div className="text-xs font-medium">{skill.name}</div>
                    <div className="text-xs text-gray-400">
                      {skill.energyCost} 能量
                    </div>
                    {skill.currentCooldown > 0 && (
                      <div className="text-xs text-red-400">
                        冷却: {skill.currentCooldown}
                      </div>
                    )}
                  </Button>
                ))}
              </div>
              
              {selectedSkill && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                  <div className="font-medium text-white">{selectedSkill.name}</div>
                  <div className="text-sm text-gray-300 mt-1">{selectedSkill.description}</div>
                  {selectedSkill.damage && (
                    <div className="text-sm text-red-400">伤害: {selectedSkill.damage}</div>
                  )}
                  {selectedSkill.healing && (
                    <div className="text-sm text-green-400">治疗: {selectedSkill.healing}</div>
                  )}
                  <div className="text-xs text-orange-400 mt-2">
                    点击敌人来施放技能
                  </div>
                </div>
              )}
            </GameCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BattlePage;
