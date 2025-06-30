import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { selectUser } from '../../store/slices/authSlice';
import { selectScreen, addNotification } from '../../store/slices/uiSlice';
import Button from '../ui/Button';
import AudioControls from '../audio/AudioControls';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const screen = useSelector(selectScreen);

  const handleMenuClick = () => {
    dispatch(
      addNotification({
        type: 'info',
        title: '菜单',
        message: '菜单功能即将开放',
        duration: 3000,
      })
    );
  };

  const handleSettingsClick = () => {
    window.location.href = '/settings';
  };

  return (
    <motion.header
      className='flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 左侧 - 移动端菜单按钮或Logo */}
      <div className='flex items-center space-x-4'>
        {screen.isMobile && (
          <Button
            variant='secondary'
            size='sm'
            onClick={handleMenuClick}
            className='px-2'
          >
            <span className='text-lg'>☰</span>
          </Button>
        )}

        <div className='flex items-center space-x-2'>
          <span className='text-2xl'>👑</span>
          <h1 className='text-xl font-bold text-orange-400'>三国志</h1>
        </div>
      </div>

      {/* 中间 - 玩家资源信息（桌面端显示） */}
      {screen.isDesktop && user && (
        <div className='flex items-center space-x-6'>
          <div className='flex items-center space-x-2'>
            <span className='text-yellow-400'>💰</span>
            <span className='font-medium'>
              {user.gold?.toLocaleString() || 0}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-blue-400'>💎</span>
            <span className='font-medium'>
              {user.gems?.toLocaleString() || 0}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-green-400'>⚡</span>
            <span className='font-medium'>{user.energy || 0}/100</span>
          </div>
        </div>
      )}

      {/* 右侧 - 用户信息和设置 */}
      <div className='flex items-center space-x-4'>
        {/* 用户头像和等级 */}
        {user && (
          <motion.div
            className='flex items-center space-x-2 px-3 py-1 bg-gray-700 rounded-lg'
            whileHover={{ scale: 1.05 }}
          >
            <div className='w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center'>
              <span className='text-sm font-bold text-white'>
                {user.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-medium text-white'>
                {user.username || 'Unknown'}
              </span>
              <span className='text-xs text-gray-400'>
                Lv.{user.level || 1}
              </span>
            </div>
          </motion.div>
        )}

        {/* 音频控制 */}
        <AudioControls variant="compact" />

        {/* 设置按钮 */}
        <Button
          variant='secondary'
          size='sm'
          onClick={handleSettingsClick}
          className='px-2'
        >
          <span className='text-lg'>⚙️</span>
        </Button>
      </div>
    </motion.header>
  );
};

export default Header;
