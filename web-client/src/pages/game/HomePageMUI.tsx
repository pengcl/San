import React from 'react';
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: '武将系统',
      description: '查看和管理您的武将',
      icon: <Person />,
      color: 'primary',
      path: '/heroes',
    },
    {
      title: '阵容配置',
      description: '设置战斗阵容',
      icon: <Shield />,
      color: 'secondary',
      path: '/formation',
    },
    {
      title: '开始战斗',
      description: '挑战强敌',
      icon: <SportsMartialArts />,
      color: 'error',
      path: '/battle',
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          sx={{
            p: 4,
            mb: 4,
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
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" gutterBottom fontFamily="Cinzel">
                欢迎来到三国卡牌
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                征战沙场，问鼎天下！
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                  startIcon={<PlayArrow />}
                  onClick={() => navigate('/battle')}
                >
                  开始游戏
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                  onClick={() => navigate('/heroes')}
                >
                  查看武将
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '3rem',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Person fontSize="inherit" />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  主公
                </Typography>
                <Chip
                  label="等级 25"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      <Grid container spacing={3}>
        {/* 快捷操作 */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            快捷操作
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={action.title}>
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
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${action.color}.main`,
                          width: 56,
                          height: 56,
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                      <Button size="small" color={action.color as any}>
                        进入
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* 游戏进度 */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              游戏进度
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <TrendingUp />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">等级进度</Typography>
                        <Typography variant="body2" color="text.secondary">
                          等级 25 (75%)
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={75}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <EmojiEvents />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">成就进度</Typography>
                        <Typography variant="body2" color="text.secondary">
                          已解锁 12/50 个成就
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={24}
                          color="secondary"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* 侧边栏 */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* 最近活动 */}
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">最近活动</Typography>
                  <IconButton size="small">
                    <Notifications />
                  </IconButton>
                </Stack>
                <Stack spacing={2}>
                  {recentActivities.map((activity, index) => (
                    <Box key={index}>
                      <Typography variant="body2">{activity.text}</Typography>
                      <Typography variant="caption" color="text.secondary">
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
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  今日推荐武将
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'shu.main' }}>
                      <Person />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        关羽
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ display: 'flex' }}>
                          {[1,2,3,4,5,6].map(i => (
                            <Star key={i} sx={{ fontSize: '1rem', color: '#ffd700' }} />
                          ))}
                        </Box>
                        <Chip label="蜀" size="small" sx={{ bgcolor: 'shu.main', color: 'white' }} />
                      </Stack>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => navigate('/heroes')}
                  >
                    查看详情
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* 每日任务 */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  每日任务
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">完成3场战斗</Typography>
                    <Chip label="2/3" size="small" />
                  </Box>
                  <LinearProgress variant="determinate" value={67} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">训练武将</Typography>
                    <Chip label="已完成" size="small" color="success" />
                  </Box>
                  <LinearProgress variant="determinate" value={100} color="success" />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;