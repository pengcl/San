import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountupNumber from './CountupNumber';

export type CurrencyType =
  | 'gold'
  | 'gems'
  | 'energy'
  | 'experience'
  | 'honor'
  | 'custom';

interface CurrencyDisplayProps {
  type: CurrencyType;
  amount: number;
  maxAmount?: number;
  icon?: string | React.ReactNode;
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  showChange?: boolean;
  changeAmount?: number;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  type,
  amount,
  maxAmount,
  icon,
  label,
  size = 'md',
  layout = 'horizontal',
  showChange = false,
  changeAmount = 0,
  animated = true,
  className = '',
  onClick,
}) => {
  // 货币类型配置
  const getCurrencyConfig = (type: CurrencyType) => {
    const configs = {
      gold: {
        icon: '💰',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/30',
        label: '金币',
      },
      gems: {
        icon: '💎',
        color: 'text-blue-400',
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/30',
        label: '宝石',
      },
      energy: {
        icon: '⚡',
        color: 'text-green-400',
        bg: 'bg-green-500/20',
        border: 'border-green-500/30',
        label: '体力',
      },
      experience: {
        icon: '⭐',
        color: 'text-purple-400',
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/30',
        label: '经验',
      },
      honor: {
        icon: '🏆',
        color: 'text-orange-400',
        bg: 'bg-orange-500/20',
        border: 'border-orange-500/30',
        label: '荣誉',
      },
      custom: {
        icon: '🔸',
        color: 'text-gray-400',
        bg: 'bg-gray-500/20',
        border: 'border-gray-500/30',
        label: '自定义',
      },
    };
    return configs[type];
  };

  // 尺寸配置
  const getSizeConfig = (size: 'xs' | 'sm' | 'md' | 'lg') => {
    const configs = {
      xs: {
        text: 'text-xs',
        icon: 'text-sm',
        padding: 'px-2 py-1',
        spacing: 'space-x-1',
        verticalSpacing: 'space-y-1',
      },
      sm: {
        text: 'text-sm',
        icon: 'text-base',
        padding: 'px-3 py-1.5',
        spacing: 'space-x-2',
        verticalSpacing: 'space-y-1',
      },
      md: {
        text: 'text-base',
        icon: 'text-lg',
        padding: 'px-3 py-2',
        spacing: 'space-x-2',
        verticalSpacing: 'space-y-2',
      },
      lg: {
        text: 'text-lg',
        icon: 'text-xl',
        padding: 'px-4 py-3',
        spacing: 'space-x-3',
        verticalSpacing: 'space-y-2',
      },
    };
    return configs[size];
  };

  const config = getCurrencyConfig(type);
  const sizeConfig = getSizeConfig(size);

  // 格式化数字显示
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // 渲染图标
  const renderIcon = () => {
    if (icon) {
      if (typeof icon === 'string') {
        return <span className={sizeConfig.icon}>{icon}</span>;
      }
      return icon;
    }
    return <span className={sizeConfig.icon}>{config.icon}</span>;
  };

  const isClickable = !!onClick;

  return (
    <motion.div
      className={`
        inline-flex items-center
        ${layout === 'vertical' ? 'flex-col' : 'flex-row'}
        ${layout === 'vertical' ? sizeConfig.verticalSpacing : sizeConfig.spacing}
        ${sizeConfig.padding} rounded-lg
        ${config.bg} ${config.border} border
        ${isClickable ? 'cursor-pointer hover:bg-opacity-80' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={isClickable ? { scale: 1.05 } : undefined}
      whileTap={isClickable ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {/* 图标 */}
      <div className={`flex-shrink-0 ${config.color}`}>{renderIcon()}</div>

      {/* 内容 */}
      <div className={`flex-1 ${layout === 'vertical' ? 'text-center' : ''}`}>
        {/* 标签 */}
        {label && (
          <div className={`${sizeConfig.text} text-gray-400 font-medium`}>
            {label}
          </div>
        )}

        {/* 数量 */}
        <div className='flex items-center space-x-1'>
          {animated ? (
            <CountupNumber
              value={amount}
              className={`${sizeConfig.text} font-bold text-white font-mono`}
              formatFunction={formatNumber}
              duration={600}
            />
          ) : (
            <span
              className={`${sizeConfig.text} font-bold text-white font-mono`}
            >
              {formatNumber(amount)}
            </span>
          )}

          {/* 最大值显示 */}
          {maxAmount !== undefined && (
            <span className={`${sizeConfig.text} text-gray-500`}>
              / {formatNumber(maxAmount)}
            </span>
          )}
        </div>

        {/* 变化量显示 */}
        <AnimatePresence>
          {showChange && changeAmount !== 0 && (
            <motion.div
              className={`
                ${sizeConfig.text} font-medium
                ${changeAmount > 0 ? 'text-green-400' : 'text-red-400'}
              `}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
            >
              {changeAmount > 0 ? '+' : ''}
              {formatNumber(changeAmount)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 进度条（当有最大值时） */}
      {maxAmount !== undefined && maxAmount > 0 && (
        <div className='w-full mt-1'>
          <div className='w-full h-1 bg-gray-700 rounded-full overflow-hidden'>
            <motion.div
              className={`h-full ${config.color.replace('text-', 'bg-')} rounded-full`}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((amount / maxAmount) * 100, 100)}%`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CurrencyDisplay;
