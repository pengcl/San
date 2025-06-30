import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: number | string;
  icon?: React.ReactNode;
}

interface TabContainerProps {
  tabs: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onTabChange?: (key: string) => void;
  className?: string;
  tabPosition?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'card' | 'pills' | 'game';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  scrollable?: boolean;
  destroyInactiveTabPane?: boolean;
}

export const TabContainer: React.FC<TabContainerProps> = ({
  tabs,
  defaultActiveKey,
  activeKey: controlledActiveKey,
  onTabChange,
  className = '',
  tabPosition = 'top',
  variant = 'game',
  size = 'md',
  animated = true,
  scrollable = false,
  destroyInactiveTabPane = false,
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState<string>(
    defaultActiveKey || tabs[0]?.key || ''
  );

  const activeKey = controlledActiveKey ?? internalActiveKey;
  const isControlled = controlledActiveKey !== undefined;

  const handleTabClick = useCallback(
    (key: string) => {
      const tab = tabs.find(t => t.key === key);
      if (tab?.disabled) return;

      if (!isControlled) {
        setInternalActiveKey(key);
      }
      onTabChange?.(key);
    },
    [tabs, isControlled, onTabChange]
  );

  const activeTabContent = useMemo(() => {
    return tabs.find(tab => tab.key === activeKey)?.content;
  }, [tabs, activeKey]);

  const getTabClasses = useCallback(
    (tab: TabItem) => {
      const isActive = tab.key === activeKey;
      const baseClasses = [
        'relative',
        'flex',
        'items-center',
        'justify-center',
        'transition-all',
        'duration-200',
        'cursor-pointer',
        'select-none',
      ];

      // 尺寸样式
      const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
      };

      // 变体样式
      const variantClasses = {
        default: [
          'border-b-2',
          'border-transparent',
          'hover:text-slate-300',
          isActive ? 'border-orange-400 text-orange-400' : 'text-slate-400',
        ],
        card: [
          'border',
          'rounded-t-lg',
          'mr-1',
          isActive
            ? 'bg-slate-800 border-slate-600 text-orange-400 border-b-slate-800'
            : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700',
        ],
        pills: [
          'rounded-lg',
          'mx-1',
          isActive
            ? 'bg-orange-500 text-white'
            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
        ],
        game: [
          'rounded-lg',
          'mx-1',
          'border-2',
          'font-medium',
          isActive
            ? 'bg-gradient-to-b from-orange-500 to-orange-600 border-orange-400 text-white shadow-game'
            : 'bg-gradient-to-b from-slate-700 to-slate-800 border-slate-600 text-slate-300 hover:from-slate-600 hover:to-slate-700',
        ],
      };

      if (tab.disabled) {
        baseClasses.push('opacity-50', 'cursor-not-allowed');
      }

      return [...baseClasses, sizeClasses[size], ...variantClasses[variant]]
        .filter(Boolean)
        .join(' ');
    },
    [activeKey, variant, size]
  );

  const getContainerClasses = () => {
    const baseClasses = ['tab-container', 'w-full', 'h-full', 'flex'];

    const directionClasses = {
      top: 'flex-col',
      bottom: 'flex-col-reverse',
      left: 'flex-row',
      right: 'flex-row-reverse',
    };

    return [...baseClasses, directionClasses[tabPosition], className]
      .filter(Boolean)
      .join(' ');
  };

  const getTabListClasses = () => {
    const baseClasses = ['tab-list', 'flex', 'relative'];

    const positionClasses = {
      top: ['border-b', 'border-slate-700'],
      bottom: ['border-t', 'border-slate-700'],
      left: ['flex-col', 'border-r', 'border-slate-700', 'min-w-48'],
      right: ['flex-col', 'border-l', 'border-slate-700', 'min-w-48'],
    };

    if (scrollable) {
      baseClasses.push(
        'overflow-x-auto',
        'scrollbar-thin',
        'scrollbar-thumb-slate-600',
        'scrollbar-track-slate-800'
      );
    }

    return [...baseClasses, ...positionClasses[tabPosition]]
      .filter(Boolean)
      .join(' ');
  };

  const tabListVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const tabVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className={getContainerClasses()}>
      {/* Tab 导航 */}
      <motion.div
        className={getTabListClasses()}
        variants={tabListVariants}
        initial='hidden'
        animate='visible'
      >
        {tabs.map(tab => (
          <motion.button
            key={tab.key}
            className={getTabClasses(tab)}
            onClick={() => handleTabClick(tab.key)}
            variants={tabVariants}
            whileHover={{ scale: tab.disabled ? 1 : 1.02 }}
            whileTap={{ scale: tab.disabled ? 1 : 0.98 }}
          >
            {/* 图标 */}
            {tab.icon && <span className='mr-2 text-lg'>{tab.icon}</span>}

            {/* 标签文本 */}
            <span>{tab.label}</span>

            {/* 徽章 */}
            {tab.badge && (
              <motion.span
                className='ml-2 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                {typeof tab.badge === 'number' && tab.badge > 99
                  ? '99+'
                  : tab.badge}
              </motion.span>
            )}

            {/* 活跃指示器 */}
            {tab.key === activeKey && variant === 'default' && (
              <motion.div
                className='absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400'
                layoutId='activeIndicator'
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}

            {/* 游戏风格光效 */}
            {tab.key === activeKey && variant === 'game' && (
              <motion.div
                className='absolute inset-0 bg-gradient-to-b from-orange-400/20 to-transparent rounded-lg pointer-events-none'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}

        {/* 滚动指示器 */}
        {scrollable && (
          <div className='absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none' />
        )}
      </motion.div>

      {/* Tab 内容 */}
      <div className='tab-content flex-1 relative overflow-hidden'>
        <AnimatePresence mode='wait'>
          {animated ? (
            <motion.div
              key={activeKey}
              className='absolute inset-0 w-full h-full'
              variants={contentVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              transition={{ duration: 0.3 }}
            >
              {activeTabContent}
            </motion.div>
          ) : (
            <div className='w-full h-full'>{activeTabContent}</div>
          )}
        </AnimatePresence>

        {/* 非销毁模式下，预渲染所有内容 */}
        {!destroyInactiveTabPane && !animated && (
          <div className='w-full h-full'>
            {tabs.map(tab => (
              <div
                key={tab.key}
                className={`w-full h-full ${tab.key === activeKey ? 'block' : 'hidden'}`}
              >
                {tab.content}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 游戏风格装饰 */}
      {variant === 'game' && (
        <div className='absolute inset-0 pointer-events-none'>
          {/* 边框装饰 */}
          <div className='absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-400/30 rounded-tl-lg' />
          <div className='absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-400/30 rounded-tr-lg' />
          <div className='absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-400/30 rounded-bl-lg' />
          <div className='absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-400/30 rounded-br-lg' />
        </div>
      )}
    </div>
  );
};

// 导出类型
export type { TabItem, TabContainerProps };

// 默认导出
export default TabContainer;
