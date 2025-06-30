import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Person,
  Shield,
  SportsEsports,
  Castle,
  Settings,
  TrendingUp,
  Notifications,
  AccountCircle,
  Logout,
  Diamond,
  MonetizationOn,
  EmojiEvents,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface NavigationProps {
  onToggleTheme?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onToggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const navigationItems = [
    { text: '主页', icon: <Home />, path: '/' },
    { text: '武将', icon: <Person />, path: '/heroes' },
    { text: '阵容', icon: <Shield />, path: '/formation' },
    { text: '战斗', icon: <SportsEsports />, path: '/battle' },
    { text: '城池', icon: <Castle />, path: '/city' },
    { text: '训练', icon: <TrendingUp />, path: '/training' },
    { text: '设置', icon: <Settings />, path: '/settings' },
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ width: 280 }}>
      {/* 用户信息区域 */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
          color: 'white',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              玩家名称
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              等级 25
            </Typography>
          </Box>
        </Stack>
        
        {/* 货币显示 */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Chip
            icon={<MonetizationOn />}
            label="12,345"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '& .MuiChip-icon': { color: '#ffd700' },
            }}
          />
          <Chip
            icon={<Diamond />}
            label="678"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '& .MuiChip-icon': { color: '#00bcd4' },
            }}
          />
        </Stack>
      </Box>

      <Divider />

      {/* 导航菜单 */}
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isCurrentPath(item.path)}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isCurrentPath(item.path) ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isCurrentPath(item.path) ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* 快捷统计 */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          今日任务
        </Typography>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">每日登录</Typography>
            <Chip label="已完成" size="small" color="success" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">战斗3次</Typography>
            <Chip label="2/3" size="small" color="warning" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">训练武将</Typography>
            <Chip label="未完成" size="small" color="default" />
          </Box>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo和标题 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h5"
              component="div"
              sx={{
                flexGrow: 1,
                fontFamily: 'Cinzel',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #ffd700, #ff6b35)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
              onClick={() => navigate('/')}
            >
              三国卡牌
            </Typography>
          </motion.div>

          <Box sx={{ flexGrow: 1 }} />

          {/* 桌面端导航 */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {navigationItems.slice(0, -1).map((item) => (
              <Button
                key={item.text}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  fontWeight: isCurrentPath(item.path) ? 'bold' : 'normal',
                  bgcolor: isCurrentPath(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* 右侧操作区 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {/* 通知 */}
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* 用户菜单 */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 移动端抽屉 */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 桌面端抽屉 */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
        open
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* 用户菜单 */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          个人资料
        </MenuItem>
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/achievements'); }}>
          <ListItemIcon>
            <EmojiEvents fontSize="small" />
          </ListItemIcon>
          成就
        </MenuItem>
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          设置
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          退出登录
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navigation;