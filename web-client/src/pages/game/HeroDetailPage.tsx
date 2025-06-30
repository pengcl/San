import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { selectHeroes } from '../../store/slices/heroesSlice';
import { addNotification } from '../../store/slices/uiSlice';
import Button from '../../components/ui/Button';
import GameCard from '../../components/ui/GameCard';
import HealthBar from '../../components/ui/HealthBar';
import CurrencyDisplay from '../../components/ui/CurrencyDisplay';
import type { Hero } from '../../types';

const HeroDetailPage: React.FC = () => {
  const { heroId } = useParams<{ heroId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const heroes = useSelector(selectHeroes);

  const [selectedTab, setSelectedTab] = useState<
    'stats' | 'skills' | 'equipment' | 'upgrade'
  >('stats');
  const [hero, setHero] = useState<Hero | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟加载武将数据
    const loadHero = async () => {
      setIsLoading(true);

      // 从store中查找武将或模拟API请求
      const foundHero = heroes.find(h => h.id.toString() === heroId);

      if (foundHero) {
        setHero(foundHero);
      } else {
        // 模拟API调用获取武将详情
        setTimeout(() => {
          const mockHero: Hero = {
            id: parseInt(heroId || '1'),
            name: '关羽',
            title: '武圣',
            description:
              '蜀汉五虎上将之首，忠义无双，武艺超群。手持青龙偃月刀，坐骑赤兔马，威震华夏。',
            level: 45,
            experience: 8750,
            rarity: 5,
            faction: '蜀',
            role: '物理输出',
            unit_type: '骑兵',
            cost: 8,
            health: 2800,
            attack: 420,
            defense: 180,
            speed: 95,
            energy: 100,
            avatar: '/heroes/guanyu_avatar.jpg',
            card_image: '/heroes/guanyu_card.jpg',
            skills: [
              {
                id: 1,
                name: '青龙斩',
                description: '挥舞青龙偃月刀，对前方敌人造成巨大伤害',
                skill_type: '主动',
                target_type: '单体',
                cost: 3,
                cooldown: 0,
                damage: 180,
                effect: '造成180%攻击力的伤害',
                icon: '⚔️',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: 2,
                name: '武圣威名',
                description: '被动提升自身攻击力和暴击率',
                skill_type: '被动',
                target_type: '自身',
                cost: 0,
                cooldown: 0,
                damage: 0,
                effect: '攻击力+15%，暴击率+10%',
                icon: '👑',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
            equipment: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setHero(mockHero);
        }, 500);
      }

      setIsLoading(false);
    };

    if (heroId) {
      loadHero();
    }
  }, [heroId, heroes]);

  const handleUpgrade = () => {
    if (!hero) return;

    dispatch(
      addNotification({
        type: 'info',
        title: '升级功能',
        message: '武将升级功能即将开放',
        duration: 3000,
      })
    );
  };

  const handleEquip = () => {
    dispatch(
      addNotification({
        type: 'info',
        title: '装备功能',
        message: '装备管理功能即将开放',
        duration: 3000,
      })
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-400'>加载武将信息中...</p>
        </div>
      </div>
    );
  }

  if (!hero) {
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>🤔</div>
        <h2 className='text-xl font-semibold text-white mb-2'>武将不存在</h2>
        <p className='text-gray-400 mb-6'>找不到指定的武将信息</p>
        <Button onClick={() => navigate('/heroes')}>返回武将列表</Button>
      </div>
    );
  }

  const getQualityColor = (rarity: number) => {
    const colors = {
      1: 'border-gray-400',
      2: 'border-green-400',
      3: 'border-blue-400',
      4: 'border-purple-400',
      5: 'border-orange-400',
      6: 'border-red-400',
    };
    return colors[rarity as keyof typeof colors] || colors[1];
  };

  const tabs = [
    { key: 'stats', label: '属性', icon: '📊' },
    { key: 'skills', label: '技能', icon: '⚔️' },
    { key: 'equipment', label: '装备', icon: '🛡️' },
    { key: 'upgrade', label: '升级', icon: '⬆️' },
  ] as const;

  return (
    <motion.div
      className='space-y-6'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 返回按钮 */}
      <div className='flex items-center justify-between'>
        <Button
          variant='secondary'
          onClick={() => navigate('/heroes')}
          className='flex items-center space-x-2'
        >
          <span>←</span>
          <span>返回</span>
        </Button>

        <div className='flex space-x-2'>
          <Button variant='success' onClick={handleUpgrade}>
            升级武将
          </Button>
          <Button 
            variant='primary' 
            onClick={() => navigate(`/heroes/${heroId}/training`)}
          >
            武将培养
          </Button>
          <Button 
            variant='secondary' 
            onClick={() => navigate(`/heroes/${heroId}/equipment`)}
          >
            管理装备
          </Button>
        </div>
      </div>

      {/* 武将基本信息 */}
      <GameCard className='p-6'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* 武将头像和基本信息 */}
          <div className='flex-shrink-0'>
            <div
              className={`relative w-48 h-64 border-4 ${getQualityColor(hero.rarity)} rounded-lg overflow-hidden`}
            >
              {hero.card_image ? (
                <img
                  src={hero.card_image}
                  alt={hero.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center'>
                  <span className='text-8xl'>👤</span>
                </div>
              )}

              {/* 品质星级 */}
              <div className='absolute top-2 left-2 flex'>
                {Array.from({ length: hero.rarity }, (_, i) => (
                  <span key={i} className='text-yellow-400 text-lg'>
                    ★
                  </span>
                ))}
              </div>

              {/* 等级 */}
              <div className='absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded'>
                Lv.{hero.level}
              </div>
            </div>
          </div>

          {/* 详细信息 */}
          <div className='flex-1 space-y-4'>
            <div>
              <h1 className='text-3xl font-bold text-white mb-2'>
                {hero.name}
              </h1>
              <h2 className='text-xl text-orange-400 mb-2'>{hero.title}</h2>
              <p className='text-gray-300 leading-relaxed'>
                {hero.description}
              </p>
            </div>

            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              <div>
                <span className='text-gray-400 text-sm'>阵营</span>
                <div className='text-white font-semibold'>{hero.faction}</div>
              </div>
              <div>
                <span className='text-gray-400 text-sm'>职业</span>
                <div className='text-white font-semibold'>{hero.role}</div>
              </div>
              <div>
                <span className='text-gray-400 text-sm'>兵种</span>
                <div className='text-white font-semibold'>{hero.unit_type}</div>
              </div>
              <div>
                <span className='text-gray-400 text-sm'>费用</span>
                <div className='text-white font-semibold'>{hero.cost}</div>
              </div>
            </div>

            {/* 经验值 */}
            <div>
              <HealthBar
                current={hero.experience}
                max={10000}
                label='经验值'
                color='experience'
                size='md'
              />
            </div>
          </div>
        </div>
      </GameCard>

      {/* 标签页 */}
      <div className='flex space-x-1 bg-gray-800 rounded-lg p-1'>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all
              ${
                selectedTab === tab.key
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span className='hidden sm:inline'>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 标签页内容 */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'stats' && (
            <GameCard title='属性详情' className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <HealthBar
                    current={hero.health}
                    max={hero.health}
                    label='生命值'
                    color='health'
                    size='lg'
                  />
                  <div className='grid grid-cols-2 gap-4'>
                    <CurrencyDisplay
                      type='custom'
                      amount={hero.attack}
                      icon='⚔️'
                      label='攻击力'
                      size='md'
                    />
                    <CurrencyDisplay
                      type='custom'
                      amount={hero.defense}
                      icon='🛡️'
                      label='防御力'
                      size='md'
                    />
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <CurrencyDisplay
                      type='custom'
                      amount={hero.speed}
                      icon='💨'
                      label='速度'
                      size='md'
                    />
                    <CurrencyDisplay
                      type='energy'
                      amount={hero.energy}
                      label='能量'
                      size='md'
                    />
                  </div>
                  <div className='bg-gray-700 rounded-lg p-4'>
                    <h4 className='text-white font-semibold mb-2'>战力评估</h4>
                    <div className='text-2xl font-bold text-orange-400'>
                      {Math.floor(
                        (hero.attack +
                          hero.defense +
                          hero.health / 10 +
                          hero.speed) *
                          1.2
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </GameCard>
          )}

          {selectedTab === 'skills' && (
            <div className='space-y-4'>
              {hero.skills.map(skill => (
                <GameCard key={skill.id} className='p-4'>
                  <div className='flex items-start space-x-4'>
                    <div className='text-3xl'>{skill.icon}</div>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <h3 className='text-lg font-semibold text-white'>
                          {skill.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            skill.skill_type === '主动'
                              ? 'bg-orange-600'
                              : 'bg-blue-600'
                          }`}
                        >
                          {skill.skill_type}
                        </span>
                      </div>
                      <p className='text-gray-300 mb-2'>{skill.description}</p>
                      <div className='flex items-center space-x-4 text-sm text-gray-400'>
                        <span>目标: {skill.target_type}</span>
                        {skill.cost > 0 && <span>消耗: {skill.cost}</span>}
                        {skill.cooldown > 0 && (
                          <span>冷却: {skill.cooldown}回合</span>
                        )}
                      </div>
                      <div className='mt-2 text-sm text-orange-400'>
                        效果: {skill.effect}
                      </div>
                    </div>
                  </div>
                </GameCard>
              ))}
            </div>
          )}

          {selectedTab === 'equipment' && (
            <GameCard title='装备管理' className='p-6'>
              <div className='text-center py-8'>
                <div className='text-6xl mb-4'>🛡️</div>
                <h3 className='text-xl font-semibold text-white mb-2'>
                  装备系统
                </h3>
                <p className='text-gray-400 mb-6'>
                  为你的武将装备强力的武器和防具
                </p>
                <Button onClick={handleEquip}>管理装备</Button>
              </div>
            </GameCard>
          )}

          {selectedTab === 'upgrade' && (
            <GameCard title='武将升级' className='p-6'>
              <div className='text-center py-8'>
                <div className='text-6xl mb-4'>⬆️</div>
                <h3 className='text-xl font-semibold text-white mb-2'>
                  升级系统
                </h3>
                <p className='text-gray-400 mb-6'>提升武将等级和能力</p>
                <Button onClick={handleUpgrade}>升级武将</Button>
              </div>
            </GameCard>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default HeroDetailPage;
