import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useAnalytics } from '../../hooks/useAnalytics';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
import HealthBar from '../../components/ui/HealthBar';
import CountdownTimer from '../../components/ui/CountdownTimer';
import type { Hero } from '../../types';

interface TrainingOption {
  id: string;
  name: string;
  description: string;
  cost: {
    gold?: number;
    gems?: number;
    items?: Array<{ id: string; name: string; count: number }>;
  };
  duration: number; // 秒
  rewards: {
    experience: number;
    stats?: {
      attack?: number;
      defense?: number;
      health?: number;
      speed?: number;
    };
  };
  unlockLevel: number;
  icon: string;
}

interface TrainingSession {
  heroId: number;
  trainingId: string;
  startTime: number;
  endTime: number;
  rewards: TrainingOption['rewards'];
}

const HeroTrainingPage: React.FC = () => {
  const { heroId } = useParams<{ heroId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { trackGameEvent } = useAnalytics();
  
  const [hero, setHero] = useState<Hero | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<TrainingOption | null>(null);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [playerResources, setPlayerResources] = useState({
    gold: 50000,
    gems: 1200,
    items: [
      { id: 'training_manual', name: '训练手册', count: 15 },
      { id: 'weapon_stone', name: '武器强化石', count: 8 },
      { id: 'armor_stone', name: '防具强化石', count: 12 },
    ]
  });

  const trainingOptions: TrainingOption[] = [
    {
      id: 'basic_combat',
      name: '基础战斗训练',
      description: '提升武将基础战斗经验和攻击力',
      cost: { gold: 1000 },
      duration: 300, // 5分钟（演示用）
      rewards: {
        experience: 500,
        stats: { attack: 5 }
      },
      unlockLevel: 1,
      icon: '⚔️'
    },
    {
      id: 'defense_training',
      name: '防御技巧训练',
      description: '强化武将的防御能力和血量',
      cost: { gold: 1500 },
      duration: 450,
      rewards: {
        experience: 600,
        stats: { defense: 8, health: 50 }
      },
      unlockLevel: 5,
      icon: '🛡️'
    },
    {
      id: 'speed_training',
      name: '敏捷速度训练',
      description: '提升武将的行动速度和闪避能力',
      cost: { gold: 1200 },
      duration: 360,
      rewards: {
        experience: 450,
        stats: { speed: 10 }
      },
      unlockLevel: 8,
      icon: '🏃'
    },
    {
      id: 'advanced_combat',
      name: '高级战斗训练',
      description: '全面提升武将的战斗技能',
      cost: { 
        gold: 3000,
        items: [{ id: 'training_manual', name: '训练手册', count: 2 }]
      },
      duration: 900,
      rewards: {
        experience: 1200,
        stats: { attack: 12, defense: 8, speed: 5 }
      },
      unlockLevel: 15,
      icon: '🎯'
    },
    {
      id: 'elite_training',
      name: '精英特训',
      description: '最高级的训练课程，大幅提升所有属性',
      cost: { 
        gems: 50,
        items: [
          { id: 'weapon_stone', name: '武器强化石', count: 1 },
          { id: 'armor_stone', name: '防具强化石', count: 1 }
        ]
      },
      duration: 1800,
      rewards: {
        experience: 2000,
        stats: { attack: 20, defense: 15, health: 100, speed: 8 }
      },
      unlockLevel: 25,
      icon: '👑'
    }
  ];

  useEffect(() => {
    trackGameEvent('hero_training_view', { heroId });
    
    // 模拟加载武将数据
    const mockHero: Hero = {
      id: parseInt(heroId || '1'),
      name: '赵云',
      title: '常胜将军',
      description: '赵云，字子龙，常山真定人，三国时期蜀汉名将。',
      level: 18,
      experience: 3250,
      rarity: 5,
      faction: '蜀',
      role: '物理输出',
      unit_type: '骑兵',
      cost: 6,
      health: 1850,
      attack: 285,
      defense: 180,
      speed: 95,
      energy: 100,
      skills: [],
      equipment: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setHero(mockHero);

    // 检查是否有进行中的训练
    const savedSession = localStorage.getItem(`training_${heroId}`);
    if (savedSession) {
      const session: TrainingSession = JSON.parse(savedSession);
      if (session.endTime > Date.now()) {
        setCurrentSession(session);
      } else {
        // 训练已完成，清理存储
        localStorage.removeItem(`training_${heroId}`);
      }
    }
  }, [heroId, trackGameEvent]);

  const canAfford = (cost: TrainingOption['cost']): boolean => {
    if (cost.gold && playerResources.gold < cost.gold) return false;
    if (cost.gems && playerResources.gems < cost.gems) return false;
    if (cost.items) {
      for (const item of cost.items) {
        const playerItem = playerResources.items.find(i => i.id === item.id);
        if (!playerItem || playerItem.count < item.count) return false;
      }
    }
    return true;
  };

  const startTraining = (training: TrainingOption) => {
    if (!hero || !canAfford(training.cost)) return;

    const startTime = Date.now();
    const endTime = startTime + (training.duration * 1000);
    
    const session: TrainingSession = {
      heroId: hero.id,
      trainingId: training.id,
      startTime,
      endTime,
      rewards: training.rewards
    };

    // 扣除资源
    setPlayerResources(prev => {
      const newResources = { ...prev };
      if (training.cost.gold) newResources.gold -= training.cost.gold;
      if (training.cost.gems) newResources.gems -= training.cost.gems;
      if (training.cost.items) {
        newResources.items = newResources.items.map(item => {
          const costItem = training.cost.items?.find(i => i.id === item.id);
          if (costItem) {
            return { ...item, count: item.count - costItem.count };
          }
          return item;
        });
      }
      return newResources;
    });

    setCurrentSession(session);
    localStorage.setItem(`training_${heroId}`, JSON.stringify(session));
    
    trackGameEvent('hero_training_start', {
      heroId: hero.id,
      trainingId: training.id,
      duration: training.duration
    });

    dispatch(
      addNotification({
        type: 'success',
        title: '训练开始',
        message: `${hero.name} 开始了 ${training.name}`,
        duration: 3000,
      })
    );

    setSelectedTraining(null);
  };

  const completeTraining = () => {
    if (!currentSession || !hero) return;

    // 应用奖励
    setHero(prev => {
      if (!prev) return prev;
      const newHero = { ...prev };
      newHero.experience += currentSession.rewards.experience;
      
      if (currentSession.rewards.stats) {
        if (currentSession.rewards.stats.attack) {
          newHero.attack += currentSession.rewards.stats.attack;
        }
        if (currentSession.rewards.stats.defense) {
          newHero.defense += currentSession.rewards.stats.defense;
        }
        if (currentSession.rewards.stats.health) {
          newHero.health += currentSession.rewards.stats.health;
        }
        if (currentSession.rewards.stats.speed) {
          newHero.speed += currentSession.rewards.stats.speed;
        }
      }
      
      return newHero;
    });

    trackGameEvent('hero_training_complete', {
      heroId: hero.id,
      trainingId: currentSession.trainingId,
      experience_gained: currentSession.rewards.experience
    });

    dispatch(
      addNotification({
        type: 'success',
        title: '训练完成',
        message: `${hero.name} 完成了训练，获得 ${currentSession.rewards.experience} 经验值！`,
        duration: 5000,
      })
    );

    localStorage.removeItem(`training_${heroId}`);
    setCurrentSession(null);
  };

  const cancelTraining = () => {
    if (!currentSession) return;

    trackGameEvent('hero_training_cancel', {
      heroId: hero?.id,
      trainingId: currentSession.trainingId
    });

    localStorage.removeItem(`training_${heroId}`);
    setCurrentSession(null);

    dispatch(
      addNotification({
        type: 'info',
        title: '训练取消',
        message: '训练已取消，资源不会退还',
        duration: 3000,
      })
    );
  };

  const renderCost = (cost: TrainingOption['cost']) => {
    const items = [];
    
    if (cost.gold) {
      items.push(
        <span key="gold" className="flex items-center space-x-1">
          <span className="text-yellow-400">💰</span>
          <span>{cost.gold.toLocaleString()}</span>
        </span>
      );
    }
    
    if (cost.gems) {
      items.push(
        <span key="gems" className="flex items-center space-x-1">
          <span className="text-blue-400">💎</span>
          <span>{cost.gems}</span>
        </span>
      );
    }
    
    if (cost.items) {
      cost.items.forEach(item => {
        items.push(
          <span key={item.id} className="flex items-center space-x-1">
            <span className="text-purple-400">📦</span>
            <span>{item.name} x{item.count}</span>
          </span>
        );
      });
    }

    return (
      <div className="flex flex-wrap gap-2 text-sm">
        {items}
      </div>
    );
  };

  if (!hero) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载武将信息中...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 particle-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 返回按钮和标题 */}
      <div className="flex items-center space-x-4">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <span>←</span>
          <span>返回</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-game-title text-shadow-glow font-game">
            武将培养
          </h1>
          <p className="text-gray-400 text-shadow">
            {hero.name} - {hero.title}
          </p>
        </div>
      </div>

      {/* 武将信息面板 */}
      <GameCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 武将基本信息 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {hero.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{hero.name}</h3>
                <p className="text-orange-400">{hero.title}</p>
                <p className="text-sm text-gray-400">等级 {hero.level} | {hero.faction}国</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">经验值</span>
                <span className="text-white">{hero.experience.toLocaleString()}</span>
              </div>
              <HealthBar 
                current={hero.experience % 1000} 
                max={1000} 
                color="experience"
                className="h-2"
              />
            </div>
          </div>

          {/* 武将属性 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-red-400 text-sm">攻击力</div>
              <div className="text-xl font-bold text-white">{hero.attack}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-blue-400 text-sm">防御力</div>
              <div className="text-xl font-bold text-white">{hero.defense}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-green-400 text-sm">生命值</div>
              <div className="text-xl font-bold text-white">{hero.health}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-yellow-400 text-sm">速度</div>
              <div className="text-xl font-bold text-white">{hero.speed}</div>
            </div>
          </div>
        </div>
      </GameCard>

      {/* 当前训练状态 */}
      <AnimatePresence>
        {currentSession && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GameCard className="p-6 border-2 border-orange-500 bg-gradient-to-r from-orange-900/20 to-red-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">🏃‍♂️</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">训练进行中</h3>
                    <p className="text-orange-400">
                      {trainingOptions.find(t => t.id === currentSession.trainingId)?.name}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <CountdownTimer
                    endTime={currentSession.endTime}
                    onComplete={completeTraining}
                    className="text-xl font-bold text-orange-400"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={cancelTraining}
                    className="mt-2"
                  >
                    取消训练
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">训练进度</div>
                <HealthBar
                  current={Date.now() - currentSession.startTime}
                  max={currentSession.endTime - currentSession.startTime}
                  color="orange"
                  className="h-3"
                />
              </div>
            </GameCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 资源显示 */}
      <GameCard className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">我的资源</h3>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">💰</span>
              <span className="text-white">{playerResources.gold.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">💎</span>
              <span className="text-white">{playerResources.gems}</span>
            </div>
            {playerResources.items.map(item => (
              <div key={item.id} className="flex items-center space-x-2">
                <span className="text-purple-400">📦</span>
                <span className="text-white text-sm">{item.name}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </GameCard>

      {/* 训练选项 */}
      {!currentSession && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-game-title">选择训练课程</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingOptions.map((training, index) => {
              const isUnlocked = hero.level >= training.unlockLevel;
              const canAffordTraining = canAfford(training.cost);
              
              return (
                <motion.div
                  key={training.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GameCard 
                    className={`p-6 cursor-pointer transition-all ${
                      isUnlocked 
                        ? canAffordTraining
                          ? 'hover:shadow-lg hover:shadow-orange-500/20 border-transparent hover:border-orange-500'
                          : 'opacity-60'
                        : 'opacity-40'
                    }`}
                    onClick={() => {
                      if (isUnlocked && canAffordTraining) {
                        setSelectedTraining(training);
                      }
                    }}
                  >
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">{training.icon}</div>
                      <h3 className="text-lg font-bold text-white">{training.name}</h3>
                      {!isUnlocked && (
                        <p className="text-red-400 text-sm">需要等级 {training.unlockLevel}</p>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {training.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">消耗</div>
                        {renderCost(training.cost)}
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-500 mb-1">时长</div>
                        <div className="text-sm text-white">
                          {Math.floor(training.duration / 60)}分{training.duration % 60}秒
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-500 mb-1">奖励</div>
                        <div className="text-sm text-green-400">
                          +{training.rewards.experience} 经验值
                        </div>
                        {training.rewards.stats && (
                          <div className="text-xs text-blue-400">
                            {Object.entries(training.rewards.stats).map(([stat, value]) => (
                              <span key={stat} className="mr-2">
                                +{value} {stat === 'attack' ? '攻击' : stat === 'defense' ? '防御' : stat === 'health' ? '生命' : '速度'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </GameCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 确认训练对话框 */}
      <AnimatePresence>
        {selectedTraining && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTraining(null)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{selectedTraining.icon}</div>
                <h3 className="text-xl font-bold text-white">{selectedTraining.name}</h3>
                <p className="text-gray-400 mt-2">{selectedTraining.description}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-2">消耗资源</div>
                  {renderCost(selectedTraining.cost)}
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-2">训练时长</div>
                  <div className="text-white">
                    {Math.floor(selectedTraining.duration / 60)}分{selectedTraining.duration % 60}秒
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-2">获得奖励</div>
                  <div className="text-green-400">+{selectedTraining.rewards.experience} 经验值</div>
                  {selectedTraining.rewards.stats && (
                    <div className="text-blue-400 text-sm">
                      {Object.entries(selectedTraining.rewards.stats).map(([stat, value]) => (
                        <div key={stat}>
                          +{value} {stat === 'attack' ? '攻击力' : stat === 'defense' ? '防御力' : stat === 'health' ? '生命值' : '速度'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setSelectedTraining(null)}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => startTraining(selectedTraining)}
                >
                  开始训练
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HeroTrainingPage;