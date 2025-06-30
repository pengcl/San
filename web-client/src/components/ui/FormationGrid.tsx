import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Hero } from '../../types';
import HeroCard from '../game/HeroCard';

interface FormationPosition {
  id: number;
  row: number;
  col: number;
  hero?: Hero;
  locked?: boolean;
  type?: 'front' | 'middle' | 'back';
}

interface FormationGridProps {
  formation?: FormationPosition[];
  onPositionClick?: (position: FormationPosition) => void;
  onHeroDrop?: (fromPosition: number, toPosition: number) => void;
  onHeroRemove?: (position: FormationPosition) => void;
  editable?: boolean;
  showIndices?: boolean;
  showTypes?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'game' | 'battle';
  gridSize?: { rows: number; cols: number };
  maxHeroes?: number;
  emptySlotComponent?: React.ReactNode;
  heroComponent?: (hero: Hero, position: FormationPosition) => React.ReactNode;
}

export const FormationGrid: React.FC<FormationGridProps> = ({
  formation = [],
  onPositionClick,
  onHeroDrop,
  onHeroRemove,
  editable = true,
  showIndices = true,
  showTypes = false,
  className = '',
  size = 'md',
  variant = 'game',
  gridSize = { rows: 2, cols: 3 },
  maxHeroes = 6,
  emptySlotComponent,
  heroComponent,
}) => {
  const [draggedHero, setDraggedHero] = useState<{
    hero: Hero;
    fromPosition: number;
  } | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);

  // 生成网格位置
  const gridPositions = useMemo(() => {
    // 确保formation数组存在且有效
    const validFormation = Array.isArray(formation) ? formation.filter(p => p !== null && p !== undefined) : [];
    
    const positions: FormationPosition[] = [];
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const id = row * gridSize.cols + col;
        const existingPosition = validFormation.find(p => p && p.id === id);

        // 确定位置类型（前排、中排、后排）
        let type: 'front' | 'middle' | 'back' = 'middle';
        if (gridSize.rows === 2) {
          type = row === 0 ? 'front' : 'back';
        } else if (gridSize.rows === 3) {
          type = row === 0 ? 'front' : row === 1 ? 'middle' : 'back';
        }

        positions.push({
          id,
          row,
          col,
          hero: existingPosition?.hero,
          locked: existingPosition?.locked || false,
          type,
        });
      }
    }
    return positions;
  }, [formation, gridSize.rows, gridSize.cols]);

  // 获取已部署的英雄数量
  const deployedCount = useMemo(() => {
    return gridPositions.filter(pos => pos.hero).length;
  }, [gridPositions]);

  // 获取总战力
  const totalPower = useMemo(() => {
    return gridPositions.reduce((total, pos) => {
      if (pos.hero) {
        return (
          total +
          (pos.hero.attack +
            pos.hero.defense +
            pos.hero.health +
            pos.hero.speed)
        );
      }
      return total;
    }, 0);
  }, [gridPositions]);

  // 处理位置点击
  const handlePositionClick = useCallback(
    (position: FormationPosition) => {
      if (!editable || position.locked) return;
      onPositionClick?.(position);
    },
    [editable, onPositionClick]
  );

  // 处理拖拽开始
  const handleDragStart = useCallback(
    (event: React.DragEvent, position: FormationPosition) => {
      if (!editable || !position.hero || position.locked) {
        event.preventDefault();
        return;
      }

      setDraggedHero({ hero: position.hero, fromPosition: position.id });
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', position.id.toString());
    },
    [editable]
  );

  // 处理拖拽悬停
  const handleDragOver = useCallback(
    (event: React.DragEvent, position: FormationPosition) => {
      if (!editable || position.locked) return;

      event.preventDefault();
      setHoveredPosition(position.id);
    },
    [editable]
  );

  // 处理拖拽离开
  const handleDragLeave = useCallback(() => {
    setHoveredPosition(null);
  }, []);

  // 处理拖拽放下
  const handleDrop = useCallback(
    (event: React.DragEvent, position: FormationPosition) => {
      event.preventDefault();
      setHoveredPosition(null);

      if (!editable || position.locked || !draggedHero) return;

      const fromPositionId = parseInt(event.dataTransfer.getData('text/plain'));
      if (fromPositionId !== position.id && onHeroDrop) {
        onHeroDrop(fromPositionId, position.id);
      }

      setDraggedHero(null);
    },
    [editable, draggedHero, onHeroDrop]
  );

  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    setDraggedHero(null);
    setHoveredPosition(null);
  }, []);

  // 处理英雄移除
  const handleHeroRemove = useCallback(
    (event: React.MouseEvent, position: FormationPosition) => {
      event.stopPropagation();
      if (!editable || position.locked) return;
      onHeroRemove?.(position);
    },
    [editable, onHeroRemove]
  );

  // 获取位置样式
  const getPositionClasses = useCallback(
    (position: FormationPosition) => {
      const baseClasses = [
        'relative',
        'aspect-square',
        'border-2',
        'rounded-lg',
        'transition-all',
        'duration-200',
        'flex',
        'items-center',
        'justify-center',
      ];

      // 尺寸样式
      const sizeClasses = {
        sm: 'w-16 h-20',
        md: 'w-20 h-24',
        lg: 'w-24 h-28',
      };

      // 变体样式
      const variantClasses = {
        default: [],
        game: [
          'bg-gradient-to-b',
          'from-slate-800',
          'to-slate-900',
          'shadow-inner',
        ],
        battle: [
          'bg-gradient-to-b',
          'from-slate-700',
          'to-slate-800',
          'border-orange-400/30',
        ],
      };

      // 状态样式
      if (position.hero) {
        baseClasses.push('border-orange-400', 'bg-orange-400/10');
      } else {
        baseClasses.push('border-dashed', 'border-slate-600');
        if (editable && !position.locked) {
          baseClasses.push('hover:border-slate-500', 'cursor-pointer');
        }
      }

      // 锁定状态
      if (position.locked) {
        baseClasses.push('opacity-50', 'cursor-not-allowed');
      }

      // 拖拽状态
      if (draggedHero?.fromPosition === position.id) {
        baseClasses.push('opacity-30', 'scale-95');
      }

      // 悬停状态
      if (hoveredPosition === position.id && draggedHero) {
        baseClasses.push('border-green-400', 'bg-green-400/20', 'scale-105');
      }

      // 位置类型样式
      if (showTypes) {
        const typeClasses = {
          front: 'ring-2 ring-red-400/50',
          middle: 'ring-2 ring-yellow-400/50',
          back: 'ring-2 ring-blue-400/50',
        };
        baseClasses.push(typeClasses[position.type || 'middle']);
      }

      return [...baseClasses, sizeClasses[size], ...variantClasses[variant]]
        .filter(Boolean)
        .join(' ');
    },
    [editable, draggedHero, hoveredPosition, showTypes, size, variant]
  );

  // 渲染空位置
  const renderEmptyPosition = (position: FormationPosition) => {
    if (emptySlotComponent) {
      return emptySlotComponent;
    }

    return (
      <div className='flex flex-col items-center justify-center text-slate-500'>
        {/* 位置编号 */}
        {showIndices && (
          <div className='w-6 h-6 border border-dashed border-current rounded-full flex items-center justify-center mb-1'>
            <span className='text-xs font-bold'>{position.id + 1}</span>
          </div>
        )}

        {/* 添加提示 */}
        {editable && !position.locked && deployedCount < maxHeroes && (
          <span className='text-xs text-center'>
            点击
            <br />
            添加
          </span>
        )}

        {/* 锁定图标 */}
        {position.locked && (
          <svg
            className='w-4 h-4 text-slate-600'
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
        )}
      </div>
    );
  };

  // 渲染英雄位置
  const renderHeroPosition = (position: FormationPosition) => {
    if (!position.hero) return null;

    if (heroComponent) {
      return heroComponent(position.hero, position);
    }

    return (
      <div className='relative w-full h-full'>
        <HeroCard
          hero={position.hero}
          size='sm'
          className='w-full h-full'
          showStats={false}
        />

        {/* 位置编号 */}
        {showIndices && (
          <div className='absolute -top-1 -left-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center'>
            {position.id + 1}
          </div>
        )}

        {/* 移除按钮 */}
        {editable && !position.locked && onHeroRemove && (
          <motion.button
            className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center'
            onClick={e => handleHeroRemove(e, position)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </motion.button>
        )}

        {/* 位置类型标识 */}
        {showTypes && (
          <div
            className={`absolute bottom-0 left-0 text-xs px-1 rounded-tr ${
              position.type === 'front'
                ? 'bg-red-500'
                : position.type === 'middle'
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
            } text-white`}
          >
            {position.type === 'front'
              ? '前'
              : position.type === 'middle'
                ? '中'
                : '后'}
          </div>
        )}
      </div>
    );
  };

  const containerClasses = ['formation-grid', 'relative', 'w-full', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {/* 统计信息 */}
      <div className='flex justify-between items-center mb-4 p-3 bg-slate-800/50 rounded-lg'>
        <div className='text-sm text-slate-300'>
          部署:{' '}
          <span className='text-orange-400 font-bold'>{deployedCount}</span>/
          {maxHeroes}
        </div>
        <div className='text-sm text-slate-300'>
          战力:{' '}
          <span className='text-orange-400 font-bold'>
            {totalPower.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 阵容网格 */}
      <div
        className='grid gap-3 justify-center'
        style={{ gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)` }}
      >
        <AnimatePresence>
          {gridPositions.map(position => (
            <motion.div
              key={position.id}
              className={getPositionClasses(position)}
              onClick={() => handlePositionClick(position)}
              onDragOver={e => handleDragOver(e, position)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, position)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: position.id * 0.05 }}
              whileHover={editable && !position.locked ? { scale: 1.02 } : {}}
            >
              <div
                draggable={editable && position.hero && !position.locked}
                onDragStart={e => handleDragStart(e, position)}
                onDragEnd={handleDragEnd}
                className='w-full h-full'
              >
                {position.hero
                  ? renderHeroPosition(position)
                  : renderEmptyPosition(position)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 拖拽指示器 */}
      <AnimatePresence>
        {draggedHero && (
          <motion.div
            className='fixed top-4 left-4 right-4 bg-blue-500/20 border border-blue-400 rounded-lg p-2 z-50 pointer-events-none'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className='text-sm text-blue-400 text-center'>
              拖拽 {draggedHero.hero.name} 到目标位置
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 游戏风格装饰 */}
      {variant === 'game' && (
        <div className='absolute inset-0 pointer-events-none'>
          <div className='absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-400/30' />
          <div className='absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-400/30' />
          <div className='absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-400/30' />
          <div className='absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-400/30' />
        </div>
      )}
    </div>
  );
};

// 导出类型
export type { FormationPosition, FormationGridProps };

// 默认导出
export default FormationGrid;
