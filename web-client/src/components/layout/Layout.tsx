import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectScreen } from '../../store/slices/uiSlice';
import Navigation from './Navigation';
import Header from './Header';
import WebSocketIndicator from '../ui/WebSocketIndicator';
import PlayerInfoPanel from '../game/PlayerInfoPanel';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const screen = useSelector(selectScreen);

  return (
    <div className='flex h-screen bg-gray-900 text-white'>
      {/* 侧边导航 - 仅桌面端显示 */}
      {screen.isDesktop && (
        <aside className='w-64 bg-gray-800 border-r border-gray-700'>
          <Navigation />
        </aside>
      )}

      {/* 主内容区域 */}
      <div className='flex flex-col flex-1 overflow-hidden'>
        {/* 顶部导航栏 */}
        <Header />

        {/* 玩家信息面板 */}
        <div className='px-4 pt-4'>
          <PlayerInfoPanel />
        </div>

        {/* 页面内容 */}
        <motion.main
          className='flex-1 overflow-auto p-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>

      {/* 移动端底部导航 */}
      {screen.isMobile && (
        <div className='fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700'>
          <Navigation isMobile />
        </div>
      )}

      {/* WebSocket连接状态指示器 */}
      <WebSocketIndicator position='top-right' showText={screen.isDesktop} />
    </div>
  );
};

export default Layout;
