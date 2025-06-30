import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
import HeroCard from '../../components/game/HeroCard';
import type { Hero } from '../../types';

interface FormationSlot {
  id: number;
  position: { x: number; y: number };
  hero: Hero | null;
  type: 'front' | 'middle' | 'back';
}

const FormationPage: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedFormation, setSelectedFormation] = useState(0);
  const [formations, setFormations] = useState<FormationSlot[][]>([]);
  const [availableHeroes, setAvailableHeroes] = useState<Hero[]>([]);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // 初始化阵容数据
  useEffect(() => {
    // 初始化3个阵容预设
    const initFormations = Array.from({ length: 3 }, () => {
      // 每个阵容有9个位置 (3x3网格)
      return Array.from({ length: 9 }, (_, slotIndex) => ({
        id: slotIndex,
        position: {
          x: slotIndex % 3,
          y: Math.floor(slotIndex / 3),
        },
        hero: null,
        type:
          slotIndex < 3
            ? ('front' as const)
            : slotIndex < 6
              ? ('middle' as const)
              : ('back' as const),
      }));
    });

    setFormations(initFormations);

    // 模拟可用武将数据
    const generateMockHeroes = (): Hero[] => {
      const heroData = [
        { name: '关羽', title: '武圣', faction: '蜀', rarity: 5 },
        { name: '张飞', title: '万夫不当', faction: '蜀', rarity: 4 },
        { name: '赵云', title: '常胜将军', faction: '蜀', rarity: 5 },
        { name: '马超', title: '西凉锦马超', faction: '蜀', rarity: 4 },
        { name: '黄忠', title: '老当益壮', faction: '蜀', rarity: 4 },
        { name: '诸葛亮', title: '卧龙', faction: '蜀', rarity: 6 },
        { name: '夏侯惇', title: '独眼龙', faction: '魏', rarity: 3 },
        { name: '司马懿', title: '冢虎', faction: '魏', rarity: 5 },
        { name: '周瑜', title: '美周郎', faction: '吴', rarity: 5 },
      ];

      return heroData.map((hero, index) => ({
        id: index + 1,
        name: hero.name,
        title: hero.title,
        description: `${hero.name}，${hero.title}`,
        level: Math.floor(Math.random() * 50) + 1,
        experience: Math.floor(Math.random() * 5000),
        rarity: hero.rarity,
        faction: hero.faction,
        role: ['物理输出', '法术输出', '坦克', '辅助'][
          Math.floor(Math.random() * 4)
        ],
        unit_type: ['步兵', '骑兵', '弓兵'][Math.floor(Math.random() * 3)],
        cost: Math.floor(Math.random() * 8) + 3,
        health: Math.floor(Math.random() * 2000) + 1000,
        attack: Math.floor(Math.random() * 300) + 200,
        defense: Math.floor(Math.random() * 200) + 100,
        speed: Math.floor(Math.random() * 100) + 50,
        energy: 100,
        skills: [],
        equipment: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    };

    setAvailableHeroes(generateMockHeroes());
  }, []);

  const handleSlotClick = (slotId: number) => {
    setSelectedSlot(slotId);

    if (selectedHero) {
      // 将选中的武将放入该位置
      setFormations(prev => {
        const newFormations = [...prev];
        const currentFormation = [...newFormations[selectedFormation]];

        // 清除该武将在其他位置的存在
        currentFormation.forEach(slot => {
          if (slot.hero?.id === selectedHero.id) {
            slot.hero = null;
          }
        });

        // 将武将放入新位置
        currentFormation[slotId].hero = selectedHero;
        newFormations[selectedFormation] = currentFormation;

        return newFormations;
      });

      setSelectedHero(null);
      dispatch(
        addNotification({
          type: 'success',
          title: '阵容调整',
          message: `${selectedHero.name} 已放入阵容`,
          duration: 2000,
        })
      );
    }
  };

  const handleHeroClick = (hero: Hero) => {
    setSelectedHero(selectedHero?.id === hero.id ? null : hero);
  };

  const handleRemoveHero = (slotId: number) => {
    setFormations(prev => {
      const newFormations = [...prev];
      const currentFormation = [...newFormations[selectedFormation]];

      if (currentFormation[slotId].hero) {
        const removedHero = currentFormation[slotId].hero;
        currentFormation[slotId].hero = null;
        newFormations[selectedFormation] = currentFormation;

        dispatch(
          addNotification({
            type: 'info',
            title: '移除武将',
            message: `${removedHero?.name} 已从阵容中移除`,
            duration: 2000,
          })
        );
      }

      return newFormations;
    });
  };

  const saveFormation = () => {
    dispatch(
      addNotification({
        type: 'success',
        title: '保存成功',
        message: `阵容 ${selectedFormation + 1} 已保存`,
        duration: 3000,
      })
    );
  };

  const resetFormation = () => {
    setFormations(prev => {
      const newFormations = [...prev];
      newFormations[selectedFormation] = newFormations[selectedFormation].map(
        slot => ({
          ...slot,
          hero: null,
        })
      );
      return newFormations;
    });

    dispatch(
      addNotification({
        type: 'info',
        title: '重置阵容',
        message: '当前阵容已重置',
        duration: 2000,
      })
    );
  };

  const currentFormation = formations[selectedFormation] || [];
  const deployedHeroes = currentFormation
    .filter(slot => slot.hero)
    .map(slot => slot.hero!.id);
  const unusedHeroes = availableHeroes.filter(
    hero => !deployedHeroes.includes(hero.id)
  );

  const getSlotStyle = (slot: FormationSlot) => {
    const baseClass =
      'relative w-20 h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300';

    if (slot.hero) {
      return `${baseClass} border-solid border-orange-500 bg-orange-500/10`;
    }

    if (selectedSlot === slot.id) {
      return `${baseClass} border-blue-500 bg-blue-500/20`;
    }

    return `${baseClass} hover:border-gray-400 hover:bg-gray-700/30`;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      front: '前排',
      middle: '中排',
      back: '后排',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      front: 'text-red-400',
      middle: 'text-yellow-400',
      back: 'text-blue-400',
    };
    return colors[type as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <motion.div
      className='space-y-6 particle-bg'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 页面标题 */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
        <div>
          <h1 className='text-3xl font-bold text-game-title text-shadow-glow font-game'>
            阵容编辑
          </h1>
          <p className='text-gray-400 text-shadow'>配置你的战斗阵容</p>
        </div>

        <div className='flex items-center space-x-2 mt-4 sm:mt-0'>
          <Button 
            variant='secondary' 
            onClick={() => window.location.href = '/formation/presets'}
          >
            阵容预设
          </Button>
          <Button variant='secondary' onClick={resetFormation}>
            重置阵容
          </Button>
          <Button variant='primary' onClick={saveFormation}>
            保存阵容
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* 阵容配置区 */}
        <div className='lg:col-span-2 space-y-6'>
          {/* 阵容选择器 */}
          <GameCard className='p-4'>
            <h3 className='text-lg font-semibold text-white mb-4'>选择阵容</h3>
            <div className='flex space-x-2'>
              {[0, 1, 2].map(index => (
                <Button
                  key={index}
                  variant={
                    selectedFormation === index ? 'primary' : 'secondary'
                  }
                  size='sm'
                  onClick={() => setSelectedFormation(index)}
                >
                  阵容 {index + 1}
                </Button>
              ))}
            </div>
          </GameCard>

          {/* 阵容网格 */}
          <GameCard className='p-6'>
            <h3 className='text-lg font-semibold text-white mb-6'>战斗阵型</h3>

            <div className='space-y-4'>
              {/* 阵容网格 */}
              {[0, 1, 2].map(row => (
                <div key={row} className='flex items-center space-x-4'>
                  {/* 行标签 */}
                  <div
                    className={`w-12 text-sm font-medium ${getTypeColor(
                      row === 0 ? 'front' : row === 1 ? 'middle' : 'back'
                    )}`}
                  >
                    {getTypeLabel(
                      row === 0 ? 'front' : row === 1 ? 'middle' : 'back'
                    )}
                  </div>

                  {/* 该行的位置槽 */}
                  <div className='flex space-x-3'>
                    {[0, 1, 2].map(col => {
                      const slotIndex = row * 3 + col;
                      const slot = currentFormation[slotIndex];

                      if (!slot) return null;

                      return (
                        <motion.div
                          key={slotIndex}
                          className={getSlotStyle(slot)}
                          onClick={() => handleSlotClick(slotIndex)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {slot.hero ? (
                            <div className='relative w-full h-full'>
                              <HeroCard
                                hero={slot.hero}
                                size='sm'
                                showStats={false}
                                className='w-full h-full'
                              />
                              {/* 移除按钮 */}
                              <button
                                className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors'
                                onClick={e => {
                                  e.stopPropagation();
                                  handleRemoveHero(slotIndex);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className='text-gray-500 text-xs text-center'>
                              <div className='text-lg mb-1'>+</div>
                              <div>点击放置</div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* 阵容统计 */}
            <div className='mt-6 pt-4 border-t border-gray-600'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div className='text-center'>
                  <div className='text-gray-400'>已部署</div>
                  <div className='text-white font-semibold'>
                    {deployedHeroes.length}/9
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-gray-400'>总战力</div>
                  <div className='text-white font-semibold'>
                    {currentFormation
                      .filter(slot => slot.hero)
                      .reduce(
                        (total, slot) =>
                          total +
                          (slot.hero!.attack +
                            slot.hero!.defense +
                            slot.hero!.health / 10),
                        0
                      )
                      .toFixed(0)}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-gray-400'>平均等级</div>
                  <div className='text-white font-semibold'>
                    {deployedHeroes.length > 0
                      ? Math.floor(
                          currentFormation
                            .filter(slot => slot.hero)
                            .reduce(
                              (total, slot) => total + slot.hero!.level,
                              0
                            ) / deployedHeroes.length
                        )
                      : 0}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-gray-400'>费用</div>
                  <div className='text-white font-semibold'>
                    {currentFormation
                      .filter(slot => slot.hero)
                      .reduce((total, slot) => total + slot.hero!.cost, 0)}
                    /30
                  </div>
                </div>
              </div>
            </div>
          </GameCard>
        </div>

        {/* 武将选择区 */}
        <div className='space-y-6'>
          <GameCard className='p-4'>
            <h3 className='text-lg font-semibold text-white mb-4'>可用武将</h3>

            {selectedHero && (
              <div className='mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg'>
                <div className='text-sm text-blue-400 mb-1'>已选择武将</div>
                <div className='text-white font-semibold'>
                  {selectedHero.name}
                </div>
                <div className='text-xs text-gray-400'>
                  点击阵容位置放置武将
                </div>
              </div>
            )}

            <div className='grid grid-cols-2 gap-3 max-h-96 overflow-y-auto'>
              <AnimatePresence>
                {unusedHeroes.map((hero, index) => (
                  <motion.div
                    key={hero.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <HeroCard
                      hero={hero}
                      onClick={handleHeroClick}
                      isSelected={selectedHero?.id === hero.id}
                      size='sm'
                      className='hover:transform hover:scale-105 transition-transform'
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {unusedHeroes.length === 0 && (
              <div className='text-center py-8'>
                <div className='text-4xl mb-2'>🎖️</div>
                <div className='text-gray-400'>所有武将都已部署</div>
              </div>
            )}
          </GameCard>
        </div>
      </div>
    </motion.div>
  );
};

export default FormationPage;
