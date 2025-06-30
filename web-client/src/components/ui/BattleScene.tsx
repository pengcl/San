import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Hero } from '../../types';
import HeroCard from '../game/HeroCard';
import HealthBar from './HealthBar';
import CountdownTimer from './CountdownTimer';

interface BattleHero extends Hero {
  currentHealth: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  position: { x: number; y: number };
  status: 'alive' | 'dead' | 'stunned' | 'poisoned' | 'blessed';
  isActive?: boolean;
  isTarget?: boolean;
}

interface SkillEffect {
  id: string;
  type: 'damage' | 'heal' | 'buff' | 'debuff';
  value: number;
  position: { x: number; y: number };
  color: string;
  duration: number;
}

interface BattleAction {
  id: string;
  type: 'attack' | 'skill' | 'defend';
  source: BattleHero;
  target?: BattleHero;
  targets?: BattleHero[];
  damage?: number;
  heal?: number;
  description: string;
  timestamp: number;
}

interface BattleSceneProps {
  playerTeam: BattleHero[];
  enemyTeam: BattleHero[];
  onHeroClick?: (hero: BattleHero) => void;
  onSkillClick?: (skillId: number) => void;
  onAutoToggle?: (auto: boolean) => void;
  onSpeedChange?: (speed: number) => void;
  onBattleEnd?: (result: 'victory' | 'defeat') => void;
  battleTime?: number;
  maxBattleTime?: number;
  isPlaying?: boolean;
  battleSpeed?: number;
  autoMode?: boolean;
  className?: string;
  showEffects?: boolean;
}

export const BattleScene: React.FC<BattleSceneProps> = ({
  playerTeam,
  enemyTeam,
  onHeroClick,
  onSkillClick,
  onAutoToggle,
  onSpeedChange,
  onBattleEnd,
  battleTime = 0,
  maxBattleTime = 300,
  // isPlaying = false,
  battleSpeed = 1,
  autoMode = false,
  className = '',
  // showEffects = true,
}) => {
  const [effects] = useState<SkillEffect[]>([]);
  const [battleLog] = useState<BattleAction[]>([]);
  const [selectedHero, setSelectedHero] = useState<BattleHero | null>(null);
  const [activeSkill, setActiveSkill] = useState<number | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  // const effectIdRef = useRef(0);

  // 添加技能效果
  // const _addEffect = useCallback((effect: Omit<SkillEffect, 'id'>) => {
  //   if (!showEffects) return;

  //   const newEffect: SkillEffect = {
  //     ...effect,
  //     id: `effect-${++effectIdRef.current}`,
  //   };

  //   setEffects(prev => [...prev, newEffect]);

  //   // 自动移除效果
  //   setTimeout(() => {
  //     setEffects(prev => prev.filter(e => e.id !== newEffect.id));
  //   }, effect.duration);
  // }, [showEffects]);

  // 添加战斗记录
  // const _addBattleLog = useCallback((action: Omit<BattleAction, 'id' | 'timestamp'>) => {
  //   const newAction: BattleAction = {
  //     ...action,
  //     id: `action-${Date.now()}-${Math.random()}`,
  //     timestamp: Date.now(),
  //   };

  //   setBattleLog(prev => [...prev.slice(-9), newAction]); // 保持最新10条记录
  // }, []);

  // 处理英雄点击
  const handleHeroClick = useCallback(
    (hero: BattleHero) => {
      setSelectedHero(hero);
      onHeroClick?.(hero);
    },
    [onHeroClick]
  );

  // 处理技能点击
  const handleSkillClick = useCallback(
    (skillId: number) => {
      setActiveSkill(skillId);
      onSkillClick?.(skillId);
    },
    [onSkillClick]
  );

  // 获取英雄状态类
  const getHeroStatusClass = (hero: BattleHero) => {
    const statusClasses = {
      alive: '',
      dead: 'opacity-30 grayscale',
      stunned: 'animate-pulse opacity-75',
      poisoned: 'animate-pulse',
      blessed: 'animate-pulse',
    };
    return statusClasses[hero.status];
  };

  // 获取英雄状态颜色
  const getStatusColor = (status: BattleHero['status']) => {
    const colors = {
      alive: 'bg-green-500',
      dead: 'bg-gray-500',
      stunned: 'bg-yellow-500',
      poisoned: 'bg-purple-500',
      blessed: 'bg-blue-500',
    };
    return colors[status];
  };

  // 渲染英雄
  const renderHero = (hero: BattleHero, _isPlayer: boolean) => {
    return (
      <motion.div
        key={hero.id}
        className={`relative cursor-pointer ${getHeroStatusClass(hero)}`}
        style={{
          position: 'absolute',
          left: `${hero.position.x}%`,
          top: `${hero.position.y}%`,
        }}
        onClick={() => handleHeroClick(hero)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {/* 英雄卡片 */}
        <div className='w-16 h-20 md:w-20 md:h-24'>
          <HeroCard
            hero={hero}
            size='sm'
            className='w-full h-full'
            showStats={false}
          />
        </div>

        {/* 血条 */}
        <div className='absolute -bottom-2 left-0 right-0'>
          <HealthBar
            current={hero.currentHealth}
            max={hero.maxHealth}
            size='sm'
            showText={false}
            color='health'
          />
        </div>

        {/* 能量条 */}
        <div className='absolute -bottom-1 left-0 right-0'>
          <HealthBar
            current={hero.energy}
            max={hero.maxEnergy}
            size='sm'
            showText={false}
            color='mana'
          />
        </div>

        {/* 状态指示器 */}
        {hero.status !== 'alive' && (
          <div
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(hero.status)}`}
          />
        )}

        {/* 激活指示器 */}
        {hero.isActive && (
          <motion.div
            className='absolute inset-0 border-2 border-orange-400 rounded-lg'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* 目标指示器 */}
        {hero.isTarget && (
          <motion.div
            className='absolute inset-0 border-2 border-red-500 rounded-lg'
            animate={{
              borderColor: ['#ef4444', '#ffffff', '#ef4444'],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        )}

        {/* 选中指示器 */}
        {selectedHero?.id === hero.id && (
          <motion.div
            className='absolute inset-0 border-2 border-yellow-400 rounded-lg'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>
    );
  };

  // 渲染技能效果
  const renderEffects = () => {
    return (
      <AnimatePresence>
        {effects.map(effect => (
          <motion.div
            key={effect.id}
            className='absolute pointer-events-none z-20 font-bold text-lg'
            style={{
              left: `${effect.position.x}%`,
              top: `${effect.position.y}%`,
              color: effect.color,
            }}
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1.2, y: -20 }}
            exit={{ opacity: 0, scale: 0.5, y: -40 }}
            transition={{ duration: effect.duration / 1000 }}
          >
            {effect.type === 'damage' && `-${effect.value}`}
            {effect.type === 'heal' && `+${effect.value}`}
            {effect.type === 'buff' && '↑'}
            {effect.type === 'debuff' && '↓'}
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  const containerClasses = [
    'battle-scene',
    'relative',
    'w-full',
    'h-full',
    'min-h-96',
    'bg-gradient-to-b',
    'from-slate-900',
    'to-slate-800',
    'border-2',
    'border-orange-400/50',
    'rounded-xl',
    'overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {/* 战斗场景背景 */}
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/50 to-slate-900/80' />

      {/* 分界线 */}
      <div className='absolute left-1/2 top-0 bottom-0 w-0.5 bg-orange-400/30 transform -translate-x-px' />

      {/* 战斗区域 */}
      <div ref={sceneRef} className='relative w-full h-full p-4'>
        {/* 玩家队伍（左侧） */}
        <div className='absolute left-0 top-0 w-1/2 h-full'>
          <div className='relative w-full h-full'>
            {playerTeam.map(hero => renderHero(hero, true))}
          </div>
        </div>

        {/* 敌方队伍（右侧） */}
        <div className='absolute right-0 top-0 w-1/2 h-full'>
          <div className='relative w-full h-full'>
            {enemyTeam.map(hero => renderHero(hero, false))}
          </div>
        </div>

        {/* 技能效果 */}
        {renderEffects()}
      </div>

      {/* 顶部状态栏 */}
      <div className='absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2'>
        <div className='flex justify-between items-center'>
          {/* 战斗时间 */}
          <div className='flex items-center space-x-2'>
            <span className='text-white text-sm'>战斗时间:</span>
            <CountdownTimer
              duration={maxBattleTime - battleTime}
              onComplete={() => onBattleEnd?.('defeat')}
            />
          </div>

          {/* 控制按钮 */}
          <div className='flex items-center space-x-2'>
            {/* 自动战斗 */}
            <motion.button
              className={`px-3 py-1 rounded text-sm font-medium ${
                autoMode
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
              onClick={() => onAutoToggle?.(!autoMode)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              自动
            </motion.button>

            {/* 战斗速度 */}
            <div className='flex items-center space-x-1'>
              <span className='text-white text-sm'>速度:</span>
              {[1, 2, 4].map(speed => (
                <motion.button
                  key={speed}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    battleSpeed === speed
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                  onClick={() => onSpeedChange?.(speed)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {speed}x
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部技能栏 */}
      {selectedHero && selectedHero.skills && (
        <div className='absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2'>
          <div className='flex justify-center space-x-2'>
            {selectedHero.skills.map((skill, index) => (
              <motion.button
                key={skill.id}
                className={`p-2 rounded border-2 ${
                  activeSkill === skill.id
                    ? 'border-orange-400 bg-orange-400/20'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                }`}
                onClick={() => handleSkillClick(skill.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className='w-12 h-12 bg-slate-600 rounded flex items-center justify-center'>
                  <span className='text-white font-bold'>{index + 1}</span>
                </div>
                <div className='text-xs text-white mt-1 text-center'>
                  {skill.name}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* 战斗日志 */}
      <div className='absolute top-12 right-2 w-64 max-h-32 bg-black/70 backdrop-blur-sm rounded p-2 overflow-y-auto'>
        <div className='space-y-1'>
          {battleLog.slice(-5).map(action => (
            <div key={action.id} className='text-xs text-slate-300'>
              <span className='text-orange-400'>{action.source.name}</span>
              <span className='mx-1'>{action.description}</span>
              {action.damage && (
                <span className='text-red-400'>造成{action.damage}伤害</span>
              )}
              {action.heal && (
                <span className='text-green-400'>恢复{action.heal}生命</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 游戏风格装饰 */}
      <div className='absolute inset-0 pointer-events-none'>
        {/* 边角装饰 */}
        <div className='absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-orange-400/60 rounded-tl-lg' />
        <div className='absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-orange-400/60 rounded-tr-lg' />
        <div className='absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-orange-400/60 rounded-bl-lg' />
        <div className='absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-orange-400/60 rounded-br-lg' />
      </div>
    </div>
  );
};

// 导出类型
export type { BattleHero, SkillEffect, BattleAction, BattleSceneProps };

// 默认导出
export default BattleScene;
