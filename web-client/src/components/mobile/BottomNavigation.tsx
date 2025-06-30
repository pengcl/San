import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceInfo } from '../../hooks/useMobile';
import { vibrate } from '../../utils/mobile';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface BottomNavigationProps {
  items: NavItem[];
  className?: string;
  hapticFeedback?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  className = '',
  hapticFeedback = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useDeviceInfo();

  const handleItemClick = (item: NavItem) => {
    if (hapticFeedback) {
      vibrate(25);
    }

    if (location.pathname !== item.path) {
      navigate(item.path);
    }
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  if (!isMobile) {
    return null; // 非移动端不显示底部导航
  }

  const navigationClasses = [
    'fixed',
    'bottom-0',
    'left-0',
    'right-0',
    'z-40',
    'bg-slate-900/95',
    'backdrop-blur-lg',
    'border-t',
    'border-slate-700',
    'pb-safe-bottom',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={navigationClasses}>
      <div className='flex items-center justify-around px-2 pt-2 pb-1'>
        {items.map(item => {
          const active = isActive(item.path);

          return (
            <motion.button
              key={item.key}
              className={[
                'relative',
                'flex',
                'flex-col',
                'items-center',
                'justify-center',
                'min-w-12',
                'min-h-12',
                'rounded-lg',
                'transition-colors',
                'duration-200',
                'select-none',
                active
                  ? 'text-orange-400 bg-orange-400/10'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50',
              ].join(' ')}
              onClick={() => handleItemClick(item)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {/* 图标容器 */}
              <div className='relative mb-1'>
                <div
                  className={`text-xl ${active ? 'text-orange-400' : 'text-current'}`}
                >
                  {item.icon}
                </div>

                {/* 徽章 */}
                {item.badge && item.badge > 0 && (
                  <motion.span
                    className='absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center'
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}
              </div>

              {/* 标签 */}
              <span
                className={`text-xs font-medium ${active ? 'text-orange-400' : 'text-current'}`}
              >
                {item.label}
              </span>

              {/* 活跃指示器 */}
              {active && (
                <motion.div
                  className='absolute top-0 left-1/2 w-8 h-1 bg-orange-400 rounded-full'
                  layoutId='activeTab'
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ transform: 'translateX(-50%)' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

// 默认导航项目配置
export const defaultNavItems: NavItem[] = [
  {
    key: 'home',
    label: '主页',
    path: '/home',
    icon: (
      <svg
        className='w-6 h-6'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        />
      </svg>
    ),
  },
  {
    key: 'heroes',
    label: '武将',
    path: '/heroes',
    icon: (
      <svg
        className='w-6 h-6'
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
    ),
  },
  {
    key: 'formation',
    label: '阵容',
    path: '/formation',
    icon: (
      <svg
        className='w-6 h-6'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a1 1 0 011-1h6a1 1 0 011 1v2M7 7h10'
        />
      </svg>
    ),
  },
  {
    key: 'battle',
    label: '战斗',
    path: '/battle',
    icon: (
      <svg
        className='w-6 h-6'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
        />
      </svg>
    ),
  },
  {
    key: 'inventory',
    label: '背包',
    path: '/inventory',
    icon: (
      <svg
        className='w-6 h-6'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
        />
      </svg>
    ),
  },
];

export default BottomNavigation;
