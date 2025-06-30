import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDeviceInfo, useSafeArea } from '../../hooks/useMobile';
import { vibrate } from '../../utils/mobile';
import TouchableButton from './TouchableButton';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
  badge?: number;
  disabled?: boolean;
}

interface GameMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  userInfo?: {
    name: string;
    level: number;
    avatar?: string;
    vip?: number;
  };
  className?: string;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  isOpen,
  onClose,
  menuItems,
  userInfo,
  className = '',
}) => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceInfo();
  const safeArea = useSafeArea();
  const [currentSection, setCurrentSection] = useState(0);

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.disabled) return;

    vibrate(25);

    if (item.path) {
      navigate(item.path);
      onClose();
    } else if (item.action) {
      item.action();
    }
  };

  const handleOverlayClick = () => {
    vibrate(25);
    onClose();
  };

  // 菜单项分组（每组6个）
  const menuSections = [];
  for (let i = 0; i < menuItems.length; i += 6) {
    menuSections.push(menuItems.slice(i, i + 6));
  }

  if (!isMobile) {
    return null; // 非移动端不显示抽屉菜单
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className='fixed inset-0 bg-black/50 z-40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
          />

          {/* 菜单面板 */}
          <motion.div
            className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-lg border-r border-slate-700 z-50 ${className}`}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              paddingTop: safeArea.top,
              paddingBottom: safeArea.bottom,
            }}
          >
            {/* 用户信息区域 */}
            {userInfo && (
              <div className='p-4 border-b border-slate-700'>
                <div className='flex items-center space-x-3'>
                  <div className='relative'>
                    <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center'>
                      {userInfo.avatar ? (
                        <img
                          src={userInfo.avatar}
                          alt={userInfo.name}
                          className='w-full h-full rounded-full object-cover'
                        />
                      ) : (
                        <span className='text-white font-bold text-lg'>
                          {userInfo.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* VIP标识 */}
                    {userInfo.vip && userInfo.vip > 0 && (
                      <div className='absolute -bottom-1 -right-1 bg-yellow-500 text-black text-xs font-bold px-1 rounded'>
                        V{userInfo.vip}
                      </div>
                    )}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <h3 className='text-white font-bold truncate'>
                      {userInfo.name}
                    </h3>
                    <p className='text-slate-400 text-sm'>
                      等级 {userInfo.level}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 菜单内容区域 */}
            <div className='flex-1 overflow-hidden'>
              {/* 分页指示器 */}
              {menuSections.length > 1 && (
                <div className='flex justify-center py-3 border-b border-slate-700'>
                  {menuSections.map((_, index) => (
                    <TouchableButton
                      key={index}
                      onClick={() => setCurrentSection(index)}
                      variant='ghost'
                      size='xs'
                      className={`mx-1 w-2 h-2 rounded-full ${
                        currentSection === index
                          ? 'bg-orange-400'
                          : 'bg-slate-600'
                      }`}
                    >
                      <span></span>
                    </TouchableButton>
                  ))}
                </div>
              )}

              {/* 菜单项网格 */}
              <div className='p-4 overflow-y-auto flex-1'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentSection}
                    className='grid grid-cols-2 gap-3'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {menuSections[currentSection]?.map((item, _index) => (
                      <TouchableButton
                        key={item.key}
                        onClick={() => handleMenuItemClick(item)}
                        disabled={item.disabled}
                        variant='ghost'
                        className='relative h-20 flex-col justify-center bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700'
                      >
                        <div className='relative mb-2'>
                          <div className='text-2xl text-orange-400'>
                            {item.icon}
                          </div>

                          {/* 徽章 */}
                          {item.badge && item.badge > 0 && (
                            <motion.span
                              className='absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center'
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 15,
                              }}
                            >
                              {item.badge > 99 ? '99+' : item.badge}
                            </motion.span>
                          )}
                        </div>

                        <span className='text-sm font-medium text-white text-center'>
                          {item.label}
                        </span>

                        {item.disabled && (
                          <div className='absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center'>
                            <span className='text-xs text-slate-400'>
                              敬请期待
                            </span>
                          </div>
                        )}
                      </TouchableButton>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* 底部操作区域 */}
            <div className='p-4 border-t border-slate-700'>
              <div className='grid grid-cols-2 gap-3'>
                <TouchableButton
                  onClick={() => {
                    navigate('/settings');
                    onClose();
                  }}
                  variant='secondary'
                  size='sm'
                  className='flex items-center justify-center space-x-2'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  <span>设置</span>
                </TouchableButton>

                <TouchableButton
                  onClick={onClose}
                  variant='ghost'
                  size='sm'
                  className='flex items-center justify-center space-x-2'
                >
                  <svg
                    className='w-4 h-4'
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
                  <span>关闭</span>
                </TouchableButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// 默认菜单项配置
export const defaultMenuItems: MenuItem[] = [
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
  {
    key: 'shop',
    label: '商城',
    path: '/shop',
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
          d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
        />
      </svg>
    ),
  },
  {
    key: 'guild',
    label: '军团',
    path: '/guild',
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
          d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
        />
      </svg>
    ),
    disabled: true,
  },
];

export default GameMenu;
