import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDeviceInfo, useViewportSize } from '../../hooks/useMobile';
import { vibrate } from '../../utils/mobile';
import HeroCard from '../game/HeroCard';
import TouchableButton from './TouchableButton';
import SwipeableCard from './SwipeableCard';

import type { Hero } from '../../types';

interface ExtendedHero extends Hero {
  isLocked?: boolean;
}

interface HeroCardGridProps {
  heroes: ExtendedHero[];
  onHeroClick?: (hero: ExtendedHero) => void;
  onHeroLongPress?: (hero: ExtendedHero) => void;
  onHeroSwipeLeft?: (hero: ExtendedHero) => void;
  onHeroSwipeRight?: (hero: ExtendedHero) => void;
  selectedHeroId?: number;
  className?: string;
  enableSwipe?: boolean;
  enableSelection?: boolean;
  loading?: boolean;
  emptyText?: string;
}

export const HeroCardGrid: React.FC<HeroCardGridProps> = ({
  heroes,
  onHeroClick,
  onHeroLongPress,
  onHeroSwipeLeft,
  onHeroSwipeRight,
  selectedHeroId,
  className = '',
  enableSwipe = false,
  enableSelection = false,
  loading = false,
  emptyText = '暂无武将',
}) => {
  const { isMobile, deviceType } = useDeviceInfo();
  const { width } = useViewportSize();

  // 根据屏幕宽度计算列数
  const columns = useMemo(() => {
    if (!isMobile) return 6;

    if (deviceType === 'mobile') {
      return width < 360 ? 2 : 3;
    } else if (deviceType === 'tablet') {
      return 4;
    }

    return 6;
  }, [isMobile, deviceType, width]);

  // 计算卡片尺寸
  const cardSize = useMemo(() => {
    const padding = 16; // 总padding
    const gap = 8; // gap间隔
    const totalGap = (columns - 1) * gap;
    const availableWidth = width - padding - totalGap;
    const cardWidth = Math.floor(availableWidth / columns);

    // 确保最小和最大尺寸限制
    const minWidth = 120;
    const maxWidth = 200;
    const finalWidth = Math.max(minWidth, Math.min(maxWidth, cardWidth));

    return {
      width: finalWidth,
      height: Math.floor(finalWidth * 1.33), // 保持 3:4 的宽高比
    };
  }, [width, columns]);

  const handleHeroAction = (
    hero: ExtendedHero,
    action: 'click' | 'longPress' | 'swipeLeft' | 'swipeRight'
  ) => {
    vibrate(25);

    switch (action) {
      case 'click':
        onHeroClick?.(hero);
        break;
      case 'longPress':
        onHeroLongPress?.(hero);
        break;
      case 'swipeLeft':
        onHeroSwipeLeft?.(hero);
        break;
      case 'swipeRight':
        onHeroSwipeRight?.(hero);
        break;
    }
  };

  const renderHeroCard = (hero: ExtendedHero, _index: number) => {
    const isSelected = enableSelection && selectedHeroId === hero.id;

    const cardContent = (
      <div className='relative w-full h-full'>
        <HeroCard
          hero={hero}
          size='sm'
          className={`w-full h-full ${isSelected ? 'ring-2 ring-orange-400' : ''}`}
          showStats={!isMobile}
        />

        {/* 选中指示器 */}
        {isSelected && (
          <motion.div
            className='absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <svg
              className='w-4 h-4 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </motion.div>
        )}

        {/* 锁定指示器 */}
        {hero.isLocked && (
          <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
            <svg
              className='w-8 h-8 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
              />
            </svg>
          </div>
        )}
      </div>
    );

    if (enableSwipe) {
      return (
        <SwipeableCard
          key={hero.id}
          onTap={() => handleHeroAction(hero, 'click')}
          onDoubleTap={() => handleHeroAction(hero, 'longPress')}
          onSwipeLeft={
            onHeroSwipeLeft
              ? () => handleHeroAction(hero, 'swipeLeft')
              : undefined
          }
          onSwipeRight={
            onHeroSwipeRight
              ? () => handleHeroAction(hero, 'swipeRight')
              : undefined
          }
          disabled={hero.isLocked}
          className='w-full h-full'
        >
          {cardContent}
        </SwipeableCard>
      );
    } else {
      return (
        <TouchableButton
          key={hero.id}
          onClick={() => handleHeroAction(hero, 'click')}
          onLongPress={
            onHeroLongPress
              ? () => handleHeroAction(hero, 'longPress')
              : undefined
          }
          disabled={hero.isLocked}
          variant='ghost'
          className='w-full h-full p-0'
        >
          {cardContent}
        </TouchableButton>
      );
    }
  };

  const renderLoadingSkeleton = () => {
    const skeletonCount = columns * 3; // 显示3行骨架屏

    return Array.from({ length: skeletonCount }).map((_, index) => (
      <motion.div
        key={`skeleton-${index}`}
        className='bg-slate-700/50 rounded-lg animate-pulse'
        style={{
          width: cardSize.width,
          height: cardSize.height,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
      />
    ));
  };

  const gridClasses = [
    'grid',
    'gap-2',
    'p-4',
    isMobile ? 'mobile:gap-1 mobile:p-2' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
  };

  if (loading) {
    return (
      <div className={gridClasses} style={gridStyle}>
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (heroes.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 px-4'>
        <div className='w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4'>
          <svg
            className='w-8 h-8 text-slate-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
            />
          </svg>
        </div>
        <p className='text-slate-400 text-center'>{emptyText}</p>
      </div>
    );
  }

  return (
    <motion.div
      className={gridClasses}
      style={gridStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {heroes.map((hero, index) => (
        <motion.div
          key={hero.id}
          style={{
            width: cardSize.width,
            height: cardSize.height,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          {renderHeroCard(hero, index)}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default HeroCardGrid;
