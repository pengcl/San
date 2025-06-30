import React from 'react';
import { motion } from 'framer-motion';
import type { Hero } from '../../types';

interface HeroCardProps {
  hero: Hero;
  onClick?: (hero: Hero) => void;
  isSelected?: boolean;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const HeroCard: React.FC<HeroCardProps> = ({
  hero,
  onClick,
  isSelected = false,
  showStats = true,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-full h-36',
    md: 'w-full h-44', 
    lg: 'w-full h-56',
  };

  const getQualityClasses = (rarity: number) => {
    const qualityMap = {
      1: 'quality-common',
      2: 'quality-common',
      3: 'quality-rare',
      4: 'quality-epic',
      5: 'quality-legendary',
      6: 'quality-legendary',
    };
    return qualityMap[rarity as keyof typeof qualityMap] || qualityMap[1];
  };

  const getGlowEffect = (rarity: number) => {
    if (rarity >= 6) return 'glow-legendary';
    if (rarity >= 5) return 'glow-legendary';
    if (rarity >= 4) return 'glow-epic';
    if (rarity >= 3) return 'glow-rare';
    return '';
  };

  const handleClick = () => {
    if (onClick) {
      onClick(hero);
    }
  };

  return (
    <motion.div
      className={`
        hero-card game-entrance card-hover-effect
        ${getQualityClasses(hero.rarity)} ${getGlowEffect(hero.rarity)}
        ${sizeClasses[size]} ${className}
        ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900' : ''}
      `}
      onClick={handleClick}
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      {/* 背景图片 */}
      <div className='absolute inset-0'>
        {hero.card_image ? (
          <img
            src={hero.card_image}
            alt={hero.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center'>
            <span className='text-4xl text-gray-500'>👤</span>
          </div>
        )}
      </div>

      {/* 遮罩层 */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent' />

      {/* 等级标识 */}
      <div className='absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded'>
        Lv.{hero.level}
      </div>

      {/* 品质星级 */}
      <div className='absolute top-1 right-1 flex'>
        {Array.from({ length: hero.rarity }, (_, i) => (
          <span key={i} className='text-yellow-400 text-xs leading-none'>
            ★
          </span>
        ))}
      </div>

      {/* 英雄信息 */}
      <div className='absolute bottom-0 left-0 right-0 p-1.5 md:p-2 text-white'>
        <h3
          className={`font-bold text-xs md:text-sm truncate mb-1 text-shadow ${
            hero.rarity >= 5 ? 'text-game-title' : 'text-white'
          }`}
        >
          {hero.name}
        </h3>
        {hero.title && (
          <p className='text-xs text-gray-300 truncate mb-1 text-shadow'>
            {hero.title}
          </p>
        )}

        {showStats && (
          <div className='grid grid-cols-2 gap-0.5 md:gap-1 text-xs'>
            <div className='flex items-center'>
              <span className='text-red-400 text-xs'>⚔</span>
              <span className='ml-0.5 text-xs'>{hero.attack}</span>
            </div>
            <div className='flex items-center'>
              <span className='text-blue-400 text-xs'>🛡</span>
              <span className='ml-0.5 text-xs'>{hero.defense}</span>
            </div>
            <div className='flex items-center'>
              <span className='text-green-400 text-xs'>❤</span>
              <span className='ml-0.5 text-xs'>{hero.health}</span>
            </div>
            <div className='flex items-center'>
              <span className='text-yellow-400 text-xs'>⚡</span>
              <span className='ml-0.5 text-xs'>{hero.speed}</span>
            </div>
          </div>
        )}
      </div>

      {/* 选中效果 */}
      {isSelected && (
        <motion.div
          className='absolute inset-0 border-2 border-orange-500 rounded-lg'
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* 悬停效果 */}
      <div className='absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300'>
        <div className='absolute inset-0 bg-gradient-to-t from-orange-500/20 via-transparent to-transparent' />
      </div>
    </motion.div>
  );
};

export default HeroCard;
