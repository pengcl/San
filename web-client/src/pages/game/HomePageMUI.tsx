import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
  Avatar,
  Stack,
  LinearProgress,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Person,
  Shield,
  SportsMartialArts,
  Castle,
  TrendingUp,
  EmojiEvents,
  Notifications,
  PlayArrow,
  Add,
  Star,
  AutoAwesome,
  MonetizationOn,
  Diamond,
  Help,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGetUserProfileQuery, useGetUserHeroesQuery } from '../../store/slices/apiSlice';
import NewPlayerGuide from '../../components/game/NewPlayerGuide';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);
  
  // 获取用户数据
  const { data: userProfile } = useGetUserProfileQuery();
  const { data: userHeroes } = useGetUserHeroesQuery({ page: 1, limit: 10 });

  // 检查是否需要显示新手引导
  useEffect(() => {
    const guideCompleted = localStorage.getItem('newPlayerGuideCompleted');
    const heroCount = userHeroes?.data?.heroes?.length || 0;
    
    // 如果是新用户（没有武将且未完成引导），显示引导
    if (!guideCompleted && heroCount === 0) {
      setTimeout(() => setShowGuide(true), 1000);
    }
  }, [userHeroes]);

  const quickActions = [
    {
      title: '武将系统',
      description: '查看和管理您的武将',
      icon: <Person />,
      color: 'primary',
      path: '/heroes',
      badge: userHeroes?.data?.heroes?.length || 0,
    },
    {
      title: '武将召唤',
      description: '召唤强力武将',
      icon: <AutoAwesome />,
      color: 'warning',
      path: '/summon',
      isNew: true,
    },
    {
      title: '阵容配置',
      description: '设置战斗阵容',
      icon: <Shield />,
      color: 'secondary',
      path: '/formation',
    },
    {
      title: '关卡挑战',
      description: '挑战关卡获得奖励',
      icon: <SportsMartialArts />,
      color: 'error',
      path: '/battle/stages',
    },
    {
      title: '城池管理',
      description: '发展您的城池',
      icon: <Castle />,
      color: 'success',
      path: '/city',
    },
  ];

  const recentActivities = [
    { text: '获得了新武将：赵云', time: '2分钟前', type: 'hero' },
    { text: '完成了每日任务', time: '10分钟前', type: 'quest' },
    { text: '在竞技场中获胜', time: '1小时前', type: 'battle' },
    { text: '升级了城池建筑', time: '2小时前', type: 'building' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
      {/* 欢迎区域 - 移动端优化 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: { xs: 2, sm: 3, md: 4 },
            background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 200,
              height: 200,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)',
            }}
          />
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h4" 
                gutterBottom 
                fontFamily="Cinzel"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
              >
                欢迎来到三国英雄传
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9, 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                征战沙场，问鼎天下！
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
                sx={{ '& .MuiButton-root': { minHeight: 44 } }} // 触控友好的最小高度
              >
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: 150 }
                  }}
                  startIcon={<PlayArrow />}
                  onClick={() => navigate('/battle')}
                >
                  开始游戏
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: 150 }
                  }}
                  onClick={() => navigate('/heroes')}
                >
                  查看武将
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    minHeight: 32,
                  }}
                  startIcon={<Help />}
                  onClick={() => setShowGuide(true)}
                >
                  新手引导
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', mt: { xs: 2, md: 0 } }}>
                <Avatar
                  sx={{
                    width: { xs: 80, sm: 100, md: 120 },
                    height: { xs: 80, sm: 100, md: 120 },
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Person fontSize="inherit" />
                </Avatar>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                >
                  {userProfile?.data?.username || '主公'}
                </Typography>
                <Chip
                  label={`等级 ${userProfile?.data?.level || 1}`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    mb: 2,
                  }}
                />
                
                {/* 资源显示 */}
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MonetizationOn sx={{ color: '#ffc107', fontSize: '1.2rem' }} />
                    <Typography variant="body2" sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                      {userProfile?.data?.gold?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Diamond sx={{ color: '#e91e63', fontSize: '1.2rem' }} />
                    <Typography variant="body2" sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                      {userProfile?.data?.gems?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* 快捷操作 */}
        <Grid item xs={12} lg={8}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            快捷操作
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={6} md={3} key={action.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      minHeight: { xs: 140, sm: 180 }, // 移动端最小高度
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)',
                      },
                      '&:active': {
                        transform: 'scale(0.98)', // 触控反馈
                      },
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent sx={{ 
                      textAlign: 'center', 
                      pb: 1,
                      p: { xs: 1.5, sm: 2 }, // 移动端调整内边距
                      position: 'relative'
                    }}>
                      {/* 新功能标识 */}
                      {action.isNew && (
                        <Chip
                          label="新"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: '#ff4757',
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20,
                            zIndex: 1
                          }}
                        />
                      )}
                      
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                          sx={{
                            bgcolor: `${action.color}.main`,
                            width: { xs: 40, sm: 48, md: 56 },
                            height: { xs: 40, sm: 48, md: 56 },
                            mx: 'auto',
                            mb: { xs: 1, sm: 2 },
                          }}
                        >
                          {action.icon}
                        </Avatar>
                        
                        {/* 数量徽章 */}
                        {action.badge !== undefined && action.badge > 0 && (
                          <Chip
                            label={action.badge}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              bgcolor: '#ff6b35',
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 20,
                              minWidth: 20,
                            }}
                          />
                        )}
                      </Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.125rem' },
                          lineHeight: 1.2
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          display: { xs: 'none', sm: 'block' } // 手机端隐藏描述文字节省空间
                        }}
                      >
                        {action.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ 
                      justifyContent: 'center', 
                      pt: 0,
                      pb: { xs: 1, sm: 1.5 }
                    }}>
                      <Button 
                        size="small" 
                        color={action.color as any}
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          minHeight: 32 // 触控友好高度
                        }}
                      >
                        进入
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* 游戏进度 */}
          <Box sx={{ mt: { xs: 3, sm: 4 } }}>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              游戏进度
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 }
                        }}
                      >
                        <TrendingUp sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h6"
                          sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                        >
                          等级进度
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          等级 25 (75%)
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={75}
                          sx={{ mt: 1, height: { xs: 6, sm: 8 } }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'secondary.main',
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 }
                        }}
                      >
                        <EmojiEvents sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h6"
                          sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                        >
                          成就进度
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          已解锁 12/50 个成就
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={24}
                          color="secondary"
                          sx={{ mt: 1, height: { xs: 6, sm: 8 } }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* 侧边栏 - 移动端在底部显示 */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={{ xs: 2, sm: 3 }}>
            {/* 最近活动 */}
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  mb={2}
                >
                  <Typography 
                    variant="h6"
                    sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                  >
                    最近活动
                  </Typography>
                  <IconButton 
                    size="small"
                    sx={{ 
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 }
                    }}
                  >
                    <Notifications sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                  </IconButton>
                </Stack>
                <Stack spacing={{ xs: 1.5, sm: 2 }}>
                  {recentActivities.map((activity, index) => (
                    <Box key={index}>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
                        {activity.text}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {activity.time}
                      </Typography>
                      {index < recentActivities.length - 1 && <Divider sx={{ mt: 1 }} />}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* 推荐武将 */}
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                >
                  今日推荐武将
                </Typography>
                <Stack spacing={{ xs: 1.5, sm: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'error.main',
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 }
                      }}
                    >
                      <Person sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold"
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        关羽
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ display: 'flex' }}>
                          {[1,2].map(i => (
                            <Star key={i} sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, color: '#ffd700' }} />
                          ))}
                        </Box>
                        <Chip 
                          label="蜀" 
                          size="small" 
                          sx={{ 
                            bgcolor: 'error.main', 
                            color: 'white',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            height: { xs: 20, sm: 24 }
                          }} 
                        />
                      </Stack>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => navigate('/heroes')}
                    sx={{ 
                      minHeight: { xs: 36, sm: 40 },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    查看详情
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* 每日任务 */}
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                >
                  每日任务
                </Typography>
                <Stack spacing={{ xs: 1, sm: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      完成3场战斗
                    </Typography>
                    <Chip 
                      label="2/3" 
                      size="small"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 20, sm: 24 }
                      }}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={67} 
                    sx={{ height: { xs: 6, sm: 8 } }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      训练武将
                    </Typography>
                    <Chip 
                      label="已完成" 
                      size="small" 
                      color="success"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 20, sm: 24 }
                      }}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    color="success" 
                    sx={{ height: { xs: 6, sm: 8 } }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
      
      {/* 新手引导 */}
      <NewPlayerGuide 
        open={showGuide} 
        onClose={() => setShowGuide(false)} 
      />
    </Container>
  );
};

export default HomePage;