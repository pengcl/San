import React from 'react';
import { motion } from 'framer-motion';

interface HealthBarProps {
  current: number;
  max: number;
  label?: string;
  color?: 'health' | 'mana' | 'energy' | 'experience';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  label,
  color = 'health',
  size = 'md',
  showText = true,
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((current / max) * 100, 0), 100);

  const colorClasses = {
    health: {
      bg: 'bg-red-600',
      gradient: 'from-red-500 to-red-700',
      glow: 'shadow-red-500/50',
    },
    mana: {
      bg: 'bg-blue-600',
      gradient: 'from-blue-500 to-blue-700',
      glow: 'shadow-blue-500/50',
    },
    energy: {
      bg: 'bg-yellow-600',
      gradient: 'from-yellow-500 to-yellow-700',
      glow: 'shadow-yellow-500/50',
    },
    experience: {
      bg: 'bg-green-600',
      gradient: 'from-green-500 to-green-700',
      glow: 'shadow-green-500/50',
    },
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const config = colorClasses[color] || colorClasses.health;

  return (
    <div className={`w-full ${className}`}>
      {/* 标签和数值 */}
      {(label || showText) && (
        <div className='flex justify-between items-center mb-1'>
          {label && (
            <span
              className={`font-medium text-gray-300 ${textSizeClasses[size]}`}
            >
              {label}
            </span>
          )}
          {showText && (
            <span
              className={`font-mono text-gray-300 ${textSizeClasses[size]}`}
            >
              {current} / {max}
            </span>
          )}
        </div>
      )}

      {/* 进度条容器 */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-gray-700 rounded-full overflow-hidden`}
      >
        {/* 背景光效 */}
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent' />

        {/* 进度条 */}
        <motion.div
          className={`h-full bg-gradient-to-r ${config.gradient} rounded-full relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.5, ease: 'easeOut' } : undefined}
        >
          {/* 内部光效 */}
          <div className='absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent' />

          {/* 动态光条 */}
          {animated && percentage > 0 && (
            <motion.div
              className='absolute inset-y-0 w-4 bg-gradient-to-r from-transparent via-white/40 to-transparent'
              animate={{ x: [-20, '100%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
                repeatDelay: 1,
              }}
            />
          )}
        </motion.div>

        {/* 分段标记 */}
        {max >= 100 && (
          <div className='absolute inset-0 flex'>
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className='flex-1 border-r border-gray-600 last:border-r-0'
                style={{ opacity: 0.3 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 百分比显示 */}
      {size === 'lg' && (
        <div className='text-center mt-1'>
          <span className={`text-xs text-gray-400 font-mono`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default HealthBar;
