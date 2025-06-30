import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useAnalytics } from '../../hooks/useAnalytics';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
import HealthBar from '../../components/ui/HealthBar';
import type { Hero } from '../../types';

interface BattleResult {
  victory: boolean;
  statistics: {
    turnsCount: number;
    totalDamageDealt: number;
    totalDamageReceived: number;
    skillsUsed: number;
    healingDone: number;
    battleDuration: number; // 秒
  };
  playerTeam: {
    hero: Hero;
    finalHealth: number;
    maxHealth: number;
    damageDealt: number;
    damageReceived: number;
    skillsUsed: number;
    survived: boolean;
  }[];
  enemyTeam: {
    hero: Hero;
    finalHealth: number;
    maxHealth: number;
    defeated: boolean;
  }[];
  rewards: {
    experience: number;
    gold: number;
    items: {
      id: string;
      name: string;
      rarity: number;
      quantity: number;
      icon: string;
    }[];
  };
  levelUps: {
    heroId: number;
    oldLevel: number;
    newLevel: number;
    statsGained: {
      health: number;
      attack: number;
      defense: number;
      speed: number;
    };
  }[];
}

const BattleResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { trackGameEvent } = useAnalytics();

  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [showRewards, setShowRewards] = useState(false);
  const [showLevelUps, setShowLevelUps] = useState(false);
  const [currentLevelUpIndex, setCurrentLevelUpIndex] = useState(0);

  useEffect(() => {
    // 从路由状态或 localStorage 获取战斗结果
    const result = location.state?.battleResult || generateMockBattleResult();
    setBattleResult(result);

    // 记录战斗结果分析
    trackGameEvent('battle_result_view', {
      victory: result.victory,
      turnsCount: result.statistics.turnsCount,
      battleDuration: result.statistics.battleDuration,
      totalDamage: result.statistics.totalDamageDealt,
      survivedHeroes: result.playerTeam.filter(h => h.survived).length,
    });

    // 延迟显示奖励
    setTimeout(() => setShowRewards(true), 2000);
    
    // 如果有升级，延迟显示升级动画
    if (result.levelUps.length > 0) {
      setTimeout(() => setShowLevelUps(true), 3500);
    }
  }, [location.state, trackGameEvent]);

  // 生成模拟战斗结果数据
  const generateMockBattleResult = (): BattleResult => {
    const victory = Math.random() > 0.3; // 70% 胜率
    const turnsCount = Math.floor(Math.random() * 15) + 5;
    const battleDuration = Math.floor(Math.random() * 180) + 30;

    return {
      victory,
      statistics: {
        turnsCount,
        totalDamageDealt: Math.floor(Math.random() * 5000) + 2000,
        totalDamageReceived: Math.floor(Math.random() * 3000) + 1000,
        skillsUsed: Math.floor(Math.random() * 20) + 5,
        healingDone: Math.floor(Math.random() * 1000) + 200,
        battleDuration,
      },
      playerTeam: [
        {
          hero: {
            id: 1, name: '刘备', title: '仁德之主', description: '', level: 45, experience: 8750,
            rarity: 5, faction: '蜀', role: '辅助', unit_type: '步兵', cost: 7,
            health: 2100, attack: 180, defense: 220, speed: 75, energy: 100,
            skills: [], equipment: [], created_at: '', updated_at: '',
          },
          finalHealth: victory ? 1200 : 0,
          maxHealth: 2100,
          damageDealt: 850,
          damageReceived: 900,
          skillsUsed: 3,
          survived: victory,
        },
        {
          hero: {
            id: 2, name: '关羽', title: '武圣', description: '', level: 50, experience: 12000,
            rarity: 6, faction: '蜀', role: '物理输出', unit_type: '骑兵', cost: 8,
            health: 1800, attack: 320, defense: 180, speed: 90, energy: 100,
            skills: [], equipment: [], created_at: '', updated_at: '',
          },
          finalHealth: victory ? 600 : 0,
          maxHealth: 1800,
          damageDealt: 1450,
          damageReceived: 1200,
          skillsUsed: 5,
          survived: victory,
        },
        {
          hero: {
            id: 3, name: '张飞', title: '万夫不当', description: '', level: 42, experience: 7200,
            rarity: 4, faction: '蜀', role: '坦克', unit_type: '步兵', cost: 6,
            health: 2800, attack: 200, defense: 280, speed: 60, energy: 100,
            skills: [], equipment: [], created_at: '', updated_at: '',
          },
          finalHealth: victory ? 1800 : 0,
          maxHealth: 2800,
          damageDealt: 680,
          damageReceived: 1000,
          skillsUsed: 2,
          survived: victory || Math.random() > 0.5,
        },
      ],
      enemyTeam: [
        {
          hero: {
            id: 4, name: '曹操', title: '魏武帝', description: '', level: 48, experience: 10000,
            rarity: 6, faction: '魏', role: '法术输出', unit_type: '步兵', cost: 8,
            health: 1900, attack: 290, defense: 200, speed: 85, energy: 100,
            skills: [], equipment: [], created_at: '', updated_at: '',
          },
          finalHealth: victory ? 0 : 800,
          maxHealth: 1900,
          defeated: victory,
        },
        {
          hero: {
            id: 5, name: '司马懿', title: '冢虎', description: '', level: 46, experience: 9000,
            rarity: 5, faction: '魏', role: '法术输出', unit_type: '弓兵', cost: 7,
            health: 1600, attack: 310, defense: 160, speed: 95, energy: 100,
            skills: [], equipment: [], created_at: '', updated_at: '',
          },
          finalHealth: victory ? 0 : 400,
          maxHealth: 1600,
          defeated: victory,
        },
      ],
      rewards: victory ? {
        experience: Math.floor(Math.random() * 500) + 200,
        gold: Math.floor(Math.random() * 1000) + 500,
        items: [
          {
            id: 'item_1',
            name: '经验丹',
            rarity: 3,
            quantity: 2,
            icon: '💊',
          },
          {
            id: 'item_2',
            name: '金币袋',
            rarity: 2,
            quantity: 1,
            icon: '💰',
          },
        ],
      } : {
        experience: Math.floor(Math.random() * 100) + 50,
        gold: Math.floor(Math.random() * 200) + 100,
        items: [],
      },
      levelUps: victory && Math.random() > 0.5 ? [
        {
          heroId: 3,
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
    };
  };

  const handleNextLevelUp = () => {
    if (currentLevelUpIndex < battleResult!.levelUps.length - 1) {
      setCurrentLevelUpIndex(prev => prev + 1);
    } else {
      setShowLevelUps(false);
    }
  };

  const handleRetry = () => {
    trackGameEvent('battle_retry');
    navigate('/battle');
  };

  const handleContinue = () => {
    trackGameEvent('battle_continue');
    navigate('/home');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRarityColor = (rarity: number) => {
    const colors = {
      1: 'text-gray-400',
      2: 'text-green-400',
      3: 'text-blue-400',
      4: 'text-purple-400',
      5: 'text-orange-400',
      6: 'text-red-400',
    };
    return colors[rarity as keyof typeof colors] || 'text-gray-400';
  };

  if (!battleResult) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* 胜利/失败标题 */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className={`text-6xl font-bold font-game text-shadow-glow mb-2 ${
            battleResult.victory ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {battleResult.victory ? '胜利！' : '失败！'}
          </div>
          <div className="text-xl text-gray-300">
            {battleResult.victory ? '战斗获胜，英雄们凯旋而归！' : '虽败犹荣，再接再厉！'}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 战斗统计 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GameCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">战斗统计</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400">回合数</div>
                    <div className="text-white font-bold text-lg">
                      {battleResult.statistics.turnsCount}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400">战斗时长</div>
                    <div className="text-white font-bold text-lg">
                      {formatTime(battleResult.statistics.battleDuration)}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400">总伤害</div>
                    <div className="text-red-400 font-bold text-lg">
                      {battleResult.statistics.totalDamageDealt.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400">受到伤害</div>
                    <div className="text-orange-400 font-bold text-lg">
                      {battleResult.statistics.totalDamageReceived.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400">技能使用</div>
                    <div className="text-blue-400 font-bold text-lg">
                      {battleResult.statistics.skillsUsed}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400">治疗量</div>
                    <div className="text-green-400 font-bold text-lg">
                      {battleResult.statistics.healingDone.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </GameCard>
          </motion.div>

          {/* 英雄状态 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GameCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">英雄状态</h3>
              
              <div className="space-y-3">
                {battleResult.playerTeam.map((heroData, index) => (
                  <motion.div
                    key={heroData.hero.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      heroData.survived ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {heroData.hero.name[0]}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{heroData.hero.name}</span>
                        <span className={`text-sm ${heroData.survived ? 'text-green-400' : 'text-red-400'}`}>
                          {heroData.survived ? '存活' : '阵亡'}
                        </span>
                      </div>
                      
                      <HealthBar
                        current={heroData.finalHealth}
                        max={heroData.maxHealth}
                        color={heroData.survived ? 'green' : 'red'}
                        showText
                        className="h-2"
                      />
                      
                      <div className="flex space-x-4 text-xs text-gray-400 mt-1">
                        <span>伤害: {heroData.damageDealt}</span>
                        <span>技能: {heroData.skillsUsed}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GameCard>
          </motion.div>
        </div>

        {/* 奖励显示 */}
        <AnimatePresence>
          {showRewards && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GameCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">战斗奖励</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <motion.div
                    className="bg-yellow-500/20 rounded-lg p-4 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl mb-2">⭐</div>
                    <div className="text-yellow-400 font-bold text-lg">
                      +{battleResult.rewards.experience.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">经验值</div>
                  </motion.div>
                  
                  <motion.div
                    className="bg-yellow-600/20 rounded-lg p-4 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl mb-2">💰</div>
                    <div className="text-yellow-300 font-bold text-lg">
                      +{battleResult.rewards.gold.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">金币</div>
                  </motion.div>
                  
                  <motion.div
                    className="bg-purple-500/20 rounded-lg p-4 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl mb-2">🎁</div>
                    <div className="text-purple-400 font-bold text-lg">
                      {battleResult.rewards.items.length}
                    </div>
                    <div className="text-gray-400 text-sm">物品</div>
                  </motion.div>
                </div>

                {/* 物品奖励详情 */}
                {battleResult.rewards.items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">获得物品:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {battleResult.rewards.items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          className="bg-gray-700/50 rounded-lg p-3 text-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          <div className="text-2xl mb-1">{item.icon}</div>
                          <div className={`font-medium ${getRarityColor(item.rarity)}`}>
                            {item.name}
                          </div>
                          <div className="text-gray-400 text-sm">x{item.quantity}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </GameCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 升级动画 */}
        <AnimatePresence>
          {showLevelUps && battleResult.levelUps.length > 0 && (
            <motion.div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-8 border-2 border-yellow-500 max-w-md w-full mx-4"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {(() => {
                  const levelUp = battleResult.levelUps[currentLevelUpIndex];
                  const hero = battleResult.playerTeam.find(h => h.hero.id === levelUp.heroId)?.hero;
                  return (
                    <div className="text-center">
                      <motion.div
                        className="text-4xl mb-4"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        ⭐
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-yellow-400 mb-2">升级！</h3>
                      <div className="text-white font-medium mb-4">
                        {hero?.name} 升级到 {levelUp.newLevel} 级！
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">生命值</span>
                          <span className="text-red-400">+{levelUp.statsGained.health}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">攻击力</span>
                          <span className="text-orange-400">+{levelUp.statsGained.attack}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">防御力</span>
                          <span className="text-blue-400">+{levelUp.statsGained.defense}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">速度</span>
                          <span className="text-green-400">+{levelUp.statsGained.speed}</span>
                        </div>
                      </div>
                      
                      <Button
                        variant="primary"
                        className="mt-6"
                        onClick={handleNextLevelUp}
                      >
                        {currentLevelUpIndex < battleResult.levelUps.length - 1 ? '下一个' : '确定'}
                      </Button>
                    </div>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 操作按钮 */}
        <motion.div
          className="flex justify-center space-x-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {!battleResult.victory && (
            <Button variant="secondary" onClick={handleRetry}>
              重新挑战
            </Button>
          )}
          <Button variant="primary" onClick={handleContinue}>
            {battleResult.victory ? '继续冒险' : '返回主界面'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BattleResultPage;