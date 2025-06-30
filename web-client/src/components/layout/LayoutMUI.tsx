import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Navigation from './NavigationMUI';
import NotificationSystem from '../ui/NotificationSystem';
import ErrorBoundary from '../error/ErrorBoundary';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* 导航栏 */}
      <Navigation />
      
      {/* 主内容区域 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          marginLeft: { sm: '280px' }, // 匹配抽屉宽度
        }}
      >
        {/* 顶部空白占位（匹配AppBar高度） */}
        <Toolbar />
        
        {/* 页面内容 */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Box>
      </Box>

      {/* 通知系统 */}
      <NotificationSystem />
    </Box>
  );
};

export default Layout;