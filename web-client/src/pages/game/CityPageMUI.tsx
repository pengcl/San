import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  Stack,
  LinearProgress,
  Divider,
  Alert,
  Fab,
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
} from '@mui/material';
import {
  ArrowBack,
  Domain,
  People,
  Security,
  Construction,
  TrendingUp,
  Settings,
  Build,
  Science,
  Groups,
  Storefront,
  CheckCircle,
  Loop,
  Warning,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';

interface CityStats {
  cityLevel: number;
  population: number;
  happiness: number;
  defense: number;
  resources: {
    gold: number;
    wood: number;
    stone: number;
    iron: number;
    food: number;
  };
  buildings: {
    total: number;
    upgrading: number;
    maxLevel: number;
  };
}

interface CityEvent {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

const CityPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cityStats, setCityStats] = useState<CityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCityStats();
  }, []);

  const loadCityStats = async () => {
    setIsLoading(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockStats: CityStats = {
      cityLevel: 12,
      population: 25680,
      happiness: 85,
      defense: 1250,
      resources: {
        gold: 125000,
        wood: 68000,
        stone: 45000,
        iron: 32000,
        food: 89000,
      },
      buildings: {
        total: 15,
        upgrading: 2,
        maxLevel: 8,
      },
    };
    setCityStats(mockStats);
    setIsLoading(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getHappinessColor = (happiness: number) => {
    if (happiness >= 80) return 'success';
    if (happiness >= 60) return 'warning';
    return 'error';
  };

  const getHappinessEmoji = (happiness: number) => {
    if (happiness >= 80) return '😊';
    if (happiness >= 60) return '😐';
    return '😟';
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'gold': return '💰';
      case 'wood': return '🌲';
      case 'stone': return '⛏️';
      case 'iron': return '⚒️';
      case 'food': return '🌾';
      default: return '📦';
    }
  };

  const getResourceName = (resource: string) => {
    const names = {
      gold: '金币',
      wood: '木材',
      stone: '石材',
      iron: '铁矿',
      food: '粮食'
    };
    return names[resource] || resource;
  };

  const cityEvents: CityEvent[] = [
    {
      id: '1',
      type: 'success',
      title: '建筑升级完成',
      description: '兵营升级至 4 级，军队容量增加',
      time: '2分钟前',
      icon: <CheckCircle sx={{ color: 'success.main' }} />
    },
    {
      id: '2',
      type: 'info',
      title: '资源收集完成',
      description: '收集了 2,500 木材和 1,800 石材',
      time: '15分钟前',
      icon: <Loop sx={{ color: 'info.main' }} />
    },
    {
      id: '3',
      type: 'warning',
      title: '资源仓库即将满载',
      description: '建议升级仓库或使用资源',
      time: '1小时前',
      icon: <Warning sx={{ color: 'warning.main' }} />
    },
  ];

  const managementOptions = [
    {
      icon: <Build sx={{ fontSize: '2rem', color: '#ff6b35' }} />,
      title: '建筑管理',
      description: `升级建筑 • ${cityStats?.buildings.upgrading || 0} 个升级中`,
      action: () => {
        dispatch(addNotification({
          type: 'info',
          title: '建筑管理',
          message: '建筑管理功能即将开放',
          duration: 3000,
        }));
        navigate('/city/buildings');
      },
      available: true
    },
    {
      icon: <Science sx={{ fontSize: '2rem', color: '#666' }} />,
      title: '科技研究',
      description: '研发新技术 • 即将开放',
      action: () => {
        dispatch(addNotification({
          type: 'info',
          title: '科技研究',
          message: '科技研究功能即将开放',
          duration: 3000,
        }));
      },
      available: false
    },
    {
      icon: <Groups sx={{ fontSize: '2rem', color: '#666' }} />,
      title: '军队管理',
      description: '训练部队 • 即将开放',
      action: () => {
        dispatch(addNotification({
          type: 'info',
          title: '军队管理',
          message: '军队管理功能即将开放',
          duration: 3000,
        }));
      },
      available: false
    },
    {
      icon: <Storefront sx={{ fontSize: '2rem', color: '#666' }} />,
      title: '贸易系统',
      description: '资源交易 • 即将开放',
      action: () => {
        dispatch(addNotification({
          type: 'info',
          title: '贸易系统',
          message: '贸易系统功能即将开放',
          duration: 3000,
        }));
      },
      available: false
    },
  ];

  if (isLoading || !cityStats) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          正在加载城池数据...
        </Typography>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" disableGutters>
      {/* 顶部应用栏 */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontFamily: 'Cinzel',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              城池总览
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              管理你的城市发展
            </Typography>
          </Box>

          <IconButton 
            color="inherit"
            onClick={() => navigate('/settings')}
          >
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        {/* 城市基本信息 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        bgcolor: '#ff6b35',
                        fontSize: '2rem'
                      }}
                    >
                      🏰
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h2" color="white" fontWeight="bold">
                        三国名城
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        等级 {cityStats.cityLevel}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box textAlign={{ xs: 'left', md: 'right' }}>
                    <Typography variant="h3" component="div" color="#ff6b35" fontWeight="bold">
                      {formatNumber(cityStats.population)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      总人口
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* 城市状态指标 */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="h4">{getHappinessEmoji(cityStats.happiness)}</Typography>
                      <Typography 
                        variant="h5" 
                        fontWeight="bold"
                        color={`${getHappinessColor(cityStats.happiness)}.main`}
                      >
                        {cityStats.happiness}%
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      民众幸福度
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Security sx={{ fontSize: '2rem', color: 'info.main' }} />
                      <Typography variant="h5" fontWeight="bold" color="info.main">
                        {formatNumber(cityStats.defense)}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      城市防御
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Construction sx={{ fontSize: '2rem', color: 'secondary.main' }} />
                      <Typography variant="h5" fontWeight="bold" color="secondary.main">
                        {cityStats.buildings.total}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      建筑总数
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        <Grid container spacing={3}>
          {/* 资源概览 */}
          <Grid item xs={12} lg={6}>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    资源储备
                  </Typography>
                  
                  <Stack spacing={2}>
                    {Object.entries(cityStats.resources).map(([resource, amount]) => (
                      <Box key={resource}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h6">{getResourceIcon(resource)}</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {getResourceName(resource)}
                            </Typography>
                          </Stack>
                          <Typography variant="h6" fontWeight="bold" color="#ff6b35">
                            {formatNumber(amount)}
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((amount / 100000) * 100, 100)} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Stack>

                  <Alert 
                    icon={<TrendingUp />} 
                    severity="info" 
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2">
                      每小时资源产量: +2,580 🌲 +1,890 ⛏️ +1,240 ⚒️
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* 城市管理 */}
          <Grid item xs={12} lg={6}>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    城市管理
                  </Typography>
                  
                  <List>
                    {managementOptions.map((option, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={option.action}
                        disabled={!option.available}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon>
                          {option.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body1" 
                              fontWeight="medium"
                              color={option.available ? 'text.primary' : 'text.disabled'}
                            >
                              {option.title}
                            </Typography>
                          }
                          secondary={
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                            >
                              {option.description}
                            </Typography>
                          }
                        />
                        <KeyboardArrowRight 
                          color={option.available ? 'primary' : 'disabled'} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* 城市动态 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                城市动态
              </Typography>
              
              <Stack spacing={2}>
                <AnimatePresence>
                  {cityEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Alert 
                        icon={event.icon}
                        severity={event.type}
                        sx={{ 
                          '& .MuiAlert-message': { width: '100%' },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {event.title}
                            </Typography>
                            <Typography variant="body2">
                              {event.description}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {event.time}
                          </Typography>
                        </Stack>
                      </Alert>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      {/* 快捷操作悬浮按钮 */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => navigate('/city/buildings')}
      >
        <Domain />
      </Fab>
    </Container>
  );
};

export default CityPageMUI;