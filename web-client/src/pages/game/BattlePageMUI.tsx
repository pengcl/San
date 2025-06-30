import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
  Stack,
  Alert,
  Paper,
} from '@mui/material';
import {
  SportsMartialArts,
  Shield,
  Favorite,
  Speed,
  ArrowBack,
  PlayArrow,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BattlePage: React.FC = () => {
  const navigate = useNavigate();

  // 模拟战斗数据
  const playerTeam = [
    { id: 1, name: '刘备', health: 80, maxHealth: 100, attack: 150, defense: 120 },
    { id: 2, name: '关羽', health: 95, maxHealth: 120, attack: 180, defense: 100 },
    { id: 3, name: '张飞', health: 70, maxHealth: 110, attack: 160, defense: 140 },
  ];

  const enemyTeam = [
    { id: 4, name: '曹操', health: 90, maxHealth: 110, attack: 170, defense: 130 },
    { id: 5, name: '夏侯惇', health: 85, maxHealth: 100, attack: 140, defense: 150 },
  ];

  const renderHero = (hero: any, isEnemy = false) => (
    <Card
      key={hero.id}
      sx={{
        minWidth: 200,
        border: 2,
        borderColor: isEnemy ? 'error.main' : 'primary.main',
        bgcolor: isEnemy ? 'error.light' : 'primary.light',
        opacity: 0.9,
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6" textAlign="center" color="white">
            {hero.name}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: isEnemy ? 'error.dark' : 'primary.dark',
              }}
            >
              {hero.name[0]}
            </Avatar>
          </Box>

          {/* 生命值 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="white">
                生命值
              </Typography>
              <Typography variant="caption" color="white">
                {hero.health}/{hero.maxHealth}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(hero.health / hero.maxHealth) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: hero.health > hero.maxHealth * 0.3 ? 'success.main' : 'warning.main',
                },
              }}
            />
          </Box>

          {/* 属性 */}
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <SportsMartialArts sx={{ fontSize: '1rem', color: 'white' }} />
                <Typography variant="caption" color="white">
                  {hero.attack}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Shield sx={{ fontSize: '1rem', color: 'white' }} />
                <Typography variant="caption" color="white">
                  {hero.defense}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 顶部栏 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          返回
        </Button>
        <Typography variant="h4" fontFamily="Cinzel">
          战斗场景
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        这是Material Design版本的战斗页面。技能动画系统已简化以避免错误。
      </Alert>

      {/* 战斗区域 */}
      <Paper
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '1px solid #374151',
          minHeight: 400,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          {/* 玩家队伍 */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom color="primary.main" textAlign="center">
              我方队伍
            </Typography>
            <Stack spacing={2}>
              {playerTeam.map(hero => (
                <motion.div
                  key={hero.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * hero.id, duration: 0.5 }}
                >
                  {renderHero(hero, false)}
                </motion.div>
              ))}
            </Stack>
          </Grid>

          {/* 战斗中央区域 */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <SportsMartialArts sx={{ fontSize: '4rem', color: 'warning.main' }} />
              </motion.div>
              
              <Typography variant="h5" color="white" fontWeight="bold">
                战斗进行中
              </Typography>
              
              <Chip
                label="回合 3"
                color="warning"
                sx={{ fontSize: '1rem', py: 1 }}
              />

              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                sx={{ mt: 2 }}
                onClick={() => {
                  // 模拟战斗结束
                  setTimeout(() => {
                    navigate('/battle/result');
                  }, 1000);
                }}
              >
                执行攻击
              </Button>
            </Box>
          </Grid>

          {/* 敌方队伍 */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom color="error.main" textAlign="center">
              敌方队伍
            </Typography>
            <Stack spacing={2}>
              {enemyTeam.map(hero => (
                <motion.div
                  key={hero.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * hero.id, duration: 0.5 }}
                >
                  {renderHero(hero, true)}
                </motion.div>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 技能栏 */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          技能操作
        </Typography>
        <Grid container spacing={2}>
          {['基础攻击', '技能攻击', '防御', '治疗'].map((skill, index) => (
            <Grid item xs={6} sm={3} key={skill}>
              <Button
                fullWidth
                variant="outlined"
                disabled={index > 1} // 模拟部分技能冷却
                sx={{ py: 1.5 }}
              >
                {skill}
                {index > 1 && (
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    (冷却中)
                  </Typography>
                )}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 战斗日志 */}
      <Paper sx={{ mt: 3, p: 2, maxHeight: 200, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          战斗日志
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">刘备对曹操造成了 45 点伤害</Typography>
          <Typography variant="body2">夏侯惇使用了防御技能</Typography>
          <Typography variant="body2">关羽的攻击被格挡</Typography>
          <Typography variant="body2">张飞使用了咆哮技能</Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default BattlePage;