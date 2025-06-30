import React from 'react';
import { motion } from 'framer-motion';

interface GameCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  headerAction?: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  children,
  title,
  className = '',
  headerAction,
  onClick,
  hoverable = false,
  loading = false,
  disabled = false,
}) => {
  const isClickable = !!onClick && !disabled && !loading;

  return (
    <motion.div
      className={`
        bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden
        ${isClickable ? 'cursor-pointer' : ''}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
      onClick={isClickable ? onClick : undefined}
      whileHover={
        hoverable && isClickable
          ? {
              scale: 1.02,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            }
          : undefined
      }
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* 标题栏 */}
      {title && (
        <div className='px-4 py-3 border-b border-gray-700 bg-gray-750'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-white'>{title}</h3>
            {headerAction && (
              <div className='flex-shrink-0'>{headerAction}</div>
            )}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className='relative'>
        {children}

        {/* 加载状态覆盖层 */}
        {loading && (
          <motion.div
            className='absolute inset-0 bg-gray-900/70 flex items-center justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className='flex items-center space-x-2 text-white'>
              <div className='w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin' />
              <span className='text-sm'>加载中...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* 悬停效果 */}
      {hoverable && isClickable && (
        <div className='absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
          <div className='absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent' />
        </div>
      )}
    </motion.div>
  );
};

export default GameCard;
