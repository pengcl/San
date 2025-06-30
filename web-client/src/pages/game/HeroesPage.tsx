import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useGetHeroesQuery } from '../../store/slices/apiSlice';
import HeroCard from '../../components/game/HeroCard';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
import LoadingScreen from '../../components/ui/LoadingScreen';
import type { Hero } from '../../types';

const HeroesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: heroesData, error, isLoading } = useGetHeroesQuery();
  const [filterRarity, setFilterRarity] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'level' | 'rarity' | 'attack'>('level');

  // 处理API错误
  useEffect(() => {
    if (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: '加载失败',
          message: '无法加载武将数据，请检查网络连接',
          duration: 5000,
        })
      );
    }
  }, [error, dispatch]);

  // 处理武将点击
  const handleHeroClick = (hero: Hero) => {
    navigate(`/heroes/${hero.id}`);
  };

  // 过滤和排序武将
  const getFilteredAndSortedHeroes = () => {
    const heroes = heroesData?.data || [];
    // 创建数组副本以避免修改只读数组
    let filteredHeroes = [...heroes];

    // 品质过滤
    if (filterRarity !== null) {
      filteredHeroes = filteredHeroes.filter(
        hero => hero.rarity === filterRarity
      );
    }

    // 排序
    filteredHeroes.sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return (b.level || 0) - (a.level || 0);
        case 'rarity':
          return (b.rarity || 0) - (a.rarity || 0);
        case 'attack':
          return (b.stats?.attack || 0) - (a.stats?.attack || 0);
        default:
          return 0;
      }
    });

    return filteredHeroes;
  };

  const filteredHeroes = getFilteredAndSortedHeroes();
  const totalHeroes = heroesData?.data?.length || 0;
  const rarityOptions = [1, 2, 3, 4, 5, 6];

  // 加载状态
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <motion.div
      className='space-y-6 particle-bg'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 标题和统计 */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
        <div>
          <h1 className='text-3xl font-bold text-game-title text-shadow-glow font-game'>
            武将系统
          </h1>
          <p className='text-gray-400 text-shadow'>
            共 {totalHeroes} 名武将
          </p>
        </div>

        <div className='flex items-center space-x-2 mt-4 sm:mt-0'>
          <Button
            variant='primary'
            onClick={() =>
              dispatch(
                addNotification({
                  type: 'info',
                  title: '召唤功能',
                  message: '武将召唤功能即将开放',
                  duration: 3000,
                })
              )
            }
          >
            召唤武将
          </Button>
        </div>
      </div>

      {/* 过滤和排序选项 */}
      <GameCard className='p-4'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex items-center space-x-2'>
            <span className='text-gray-400 text-sm'>品质筛选:</span>
            <button
              onClick={() => setFilterRarity(null)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filterRarity === null
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              全部
            </button>
            {rarityOptions.map(rarity => (
              <button
                key={rarity}
                onClick={() => setFilterRarity(rarity)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filterRarity === rarity
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {rarity}★
              </button>
            ))}
          </div>

          <div className='flex items-center space-x-2'>
            <span className='text-gray-400 text-sm'>排序:</span>
            <select
              value={sortBy}
              onChange={e =>
                setSortBy(e.target.value as 'level' | 'rarity' | 'attack')
              }
              className='bg-gray-700 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-orange-500 focus:outline-none'
            >
              <option value='level'>等级</option>
              <option value='rarity'>品质</option>
              <option value='attack'>攻击力</option>
            </select>
          </div>
        </div>
      </GameCard>

      {/* 武将网格 */}
      <motion.div
        className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 auto-rows-fr'
        layout
      >
        {filteredHeroes.map((hero, index) => (
          <motion.div
            key={hero.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            layout
            className="w-full h-full flex items-stretch"
            style={{ minHeight: '160px' }}
          >
            <HeroCard
              hero={{
                id: hero.id,
                name: hero.name || '未知武将',
                title: '', // API中没有title字段
                description: '', // 由于API数据结构问题，暂时为空
                level: hero.level || 1,
                experience: hero.experience || 0,
                rarity: hero.rarity || 1,
                faction: hero.faction || 'unknown',
                role: hero.unitType || 'unknown',
                unit_type: hero.unitType || 'unknown',
                cost: Math.floor((hero.stats?.attack || 400) / 80) + 3,
                health: hero.stats?.hp || 3000,
                attack: hero.stats?.attack || 400,
                defense: hero.stats?.defense || 400,
                speed: hero.stats?.speed || 80,
                energy: 100,
                skills: hero.skills || [],
                equipment: [],
                created_at: hero.createdAt || '',
                updated_at: hero.updatedAt || '',
              }}
              onClick={handleHeroClick}
              size="sm"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* 空状态 */}
      {filteredHeroes.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-6xl mb-4'>🔍</div>
          <h3 className='text-xl font-semibold text-white mb-2'>
            没有找到武将
          </h3>
          <p className='text-gray-400 mb-6'>尝试调整筛选条件</p>
          <Button onClick={() => setFilterRarity(null)}>清除筛选</Button>
        </div>
      )}
    </motion.div>
  );
};

export default HeroesPage;
