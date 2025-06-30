import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceInfo } from '../../hooks/useMobile';
import { vibrate } from '../../utils/mobile';
import HeroCard from '../game/HeroCard';
import TouchableButton from './TouchableButton';

import type { Hero } from '../../types';

interface FormationPosition {
  id: number;
  row: number;
  col: number;
  hero?: Hero;
}

interface FormationEditorProps {
  formation: FormationPosition[];
  availableHeroes: Hero[];
  onFormationChange: (formation: FormationPosition[]) => void;
  onHeroSelect?: (hero: Hero) => void;
  className?: string;
  editable?: boolean;
  maxHeroes?: number;
}

export const FormationEditor: React.FC<FormationEditorProps> = ({
  formation,
  availableHeroes,
  onFormationChange,
  onHeroSelect,
  className = '',
  editable = true,
  maxHeroes = 6,
}) => {
  const {} = useDeviceInfo();
  const [draggedHero, setDraggedHero] = useState<Hero | null>(null);
  const [draggedFromPosition, setDraggedFromPosition] = useState<number | null>(
    null
  );
  const [showHeroSelector, setShowHeroSelector] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const handlePositionClick = useCallback(
    (position: FormationPosition) => {
      if (!editable) return;

      vibrate(25);

      if (position.hero) {
        // 移除武将
        const newFormation = formation.map(pos =>
          pos.id === position.id ? { ...pos, hero: undefined } : pos
        );
        onFormationChange(newFormation);
      } else {
        // 显示武将选择器
        setSelectedPosition(position.id);
        setShowHeroSelector(true);
      }
    },
    [editable, formation, onFormationChange]
  );

  const handleHeroSelection = useCallback(
    (hero: Hero) => {
      if (!selectedPosition) return;

      vibrate(50);

      // 检查武将是否已在阵容中
      const isHeroInFormation = formation.some(pos => pos.hero?.id === hero.id);
      if (isHeroInFormation) {
        // 如果武将已在阵容中，则交换位置
        const newFormation = formation.map(pos => {
          if (pos.hero?.id === hero.id) {
            return { ...pos, hero: undefined };
          }
          if (pos.id === selectedPosition) {
            return { ...pos, hero };
          }
          return pos;
        });
        onFormationChange(newFormation);
      } else {
        // 添加新武将到指定位置
        const newFormation = formation.map(pos =>
          pos.id === selectedPosition ? { ...pos, hero } : pos
        );
        onFormationChange(newFormation);
      }

      setShowHeroSelector(false);
      setSelectedPosition(null);
      onHeroSelect?.(hero);
    },
    [selectedPosition, formation, onFormationChange, onHeroSelect]
  );

  const handleHeroLongPress = useCallback(
    (hero: Hero, position: FormationPosition) => {
      if (!editable) return;

      vibrate([50, 50, 100]);

      // 长按开始拖拽
      setDraggedHero(hero);
      setDraggedFromPosition(position.id);
    },
    [editable]
  );

  // const _handlePositionDrop = useCallback((targetPosition: FormationPosition) => {
  //   if (!draggedHero || !draggedFromPosition) return;

  //   vibrate(25);

  //   const newFormation = formation.map(pos => {
  //     if (pos.id === draggedFromPosition) {
  //       return { ...pos, hero: targetPosition.hero };
  //     }
  //     if (pos.id === targetPosition.id) {
  //       return { ...pos, hero: draggedHero };
  //     }
  //     return pos;
  //   });

  //   onFormationChange(newFormation);
  //   setDraggedHero(null);
  //   setDraggedFromPosition(null);
  // }, [draggedHero, draggedFromPosition, formation, onFormationChange]);

  const getPositionClasses = (position: FormationPosition) => {
    const baseClasses = [
      'relative',
      'aspect-square',
      'border-2',
      'border-dashed',
      'rounded-lg',
      'flex',
      'items-center',
      'justify-center',
      'transition-all',
      'duration-200',
    ];

    if (position.hero) {
      baseClasses.push('border-orange-400', 'bg-orange-400/10');
    } else {
      baseClasses.push('border-slate-600', 'bg-slate-800/30');
      if (editable) {
        baseClasses.push('hover:border-slate-500', 'hover:bg-slate-700/30');
      }
    }

    if (draggedFromPosition === position.id) {
      baseClasses.push('opacity-50');
    }

    return baseClasses.join(' ');
  };

  const deployedHeroesCount = formation.filter(pos => pos.hero).length;
  const canAddMore = deployedHeroesCount < maxHeroes;

  const containerClasses = ['w-full', 'max-w-md', 'mx-auto', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {/* 阵容网格 */}
      <div className='bg-slate-800/50 rounded-xl p-4 mb-4'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-bold text-white'>阵容编辑</h3>
          <span className='text-sm text-slate-400'>
            {deployedHeroesCount}/{maxHeroes}
          </span>
        </div>

        <div className='grid grid-cols-3 gap-3'>
          {formation.map(position => (
            <TouchableButton
              key={position.id}
              onClick={() => handlePositionClick(position)}
              onLongPress={
                position.hero
                  ? () => handleHeroLongPress(position.hero!, position)
                  : undefined
              }
              disabled={!editable}
              variant='ghost'
              className={getPositionClasses(position)}
            >
              {position.hero ? (
                <div className='w-full h-full relative'>
                  <HeroCard
                    hero={position.hero}
                    size='sm'
                    className='w-full h-full'
                    showStats={false}
                  />

                  {/* 位置标识 */}
                  <div className='absolute -top-1 -left-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center'>
                    {position.row * 3 + position.col + 1}
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center text-slate-500'>
                  <div className='w-8 h-8 border-2 border-dashed border-current rounded-full flex items-center justify-center mb-1'>
                    <span className='text-xs font-bold'>
                      {position.row * 3 + position.col + 1}
                    </span>
                  </div>
                  {editable && canAddMore && (
                    <span className='text-xs'>点击添加</span>
                  )}
                </div>
              )}
            </TouchableButton>
          ))}
        </div>

        {/* 战力统计 */}
        <div className='mt-4 p-3 bg-slate-700/50 rounded-lg'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-slate-300'>总战力</span>
            <span className='text-lg font-bold text-orange-400'>
              {formation
                .reduce((total, pos) => {
                  const hero = pos.hero;
                  if (!hero) return total;
                  return (
                    total +
                    (hero.attack + hero.defense + hero.health + hero.speed)
                  );
                }, 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 武将选择器 */}
      <AnimatePresence>
        {showHeroSelector && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              className='fixed inset-0 bg-black/50 z-40'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHeroSelector(false)}
            />

            {/* 选择器面板 */}
            <motion.div
              className='fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-xl z-50 max-h-[70vh] overflow-hidden'
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className='p-4 border-b border-slate-700'>
                <div className='flex justify-between items-center'>
                  <h4 className='text-lg font-bold text-white'>选择武将</h4>
                  <TouchableButton
                    onClick={() => setShowHeroSelector(false)}
                    variant='ghost'
                    size='sm'
                  >
                    <svg
                      className='w-5 h-5'
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
                  </TouchableButton>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-2 p-4 overflow-y-auto max-h-96'>
                {availableHeroes.map(hero => {
                  const isInFormation = formation.some(
                    pos => pos.hero?.id === hero.id
                  );

                  return (
                    <TouchableButton
                      key={hero.id}
                      onClick={() => handleHeroSelection(hero)}
                      variant='ghost'
                      className={`relative p-1 ${isInFormation ? 'opacity-50' : ''}`}
                      disabled={isInFormation}
                    >
                      <HeroCard
                        hero={hero}
                        size='sm'
                        className='w-full'
                        showStats={false}
                      />

                      {isInFormation && (
                        <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
                          <span className='text-xs text-white font-medium'>
                            已上阵
                          </span>
                        </div>
                      )}
                    </TouchableButton>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 拖拽指示器 */}
      <AnimatePresence>
        {draggedHero && (
          <motion.div
            className='fixed top-4 left-4 right-4 bg-orange-500/20 border border-orange-400 rounded-lg p-2 z-30'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className='text-sm text-orange-400 text-center'>
              正在移动 {draggedHero.name}，点击目标位置完成移动
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormationEditor;
