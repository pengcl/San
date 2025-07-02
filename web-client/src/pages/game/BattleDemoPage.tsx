import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  AutoMode,
  LocalFireDepartment,
  Shield,
  Favorite,
  Speed,
  Star,
  CheckCircle,
  SportsEsports,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';

// 演示战斗数据
const DEMO_PLAYER_TEAM = [
  {
    id: 1,
    name: '刘备',
    level: 15,
    currentHp: 1200,
    maxHp: 1200,
    stats: { attack: 180, defense: 160, speed: 90 },
    star: 3,
    position: 0,
    avatar: '👑',
    skills: [
      { id: '1-1', name: '仁德', type: 'buff', cooldown: 0 },
      { id: '1-2', name: '激励', type: 'active', cooldown: 0 }
    ]
  },
  {
    id: 2,
    name: '关羽',
    level: 14,
    currentHp: 1100,
    maxHp: 1100,
    stats: { attack: 220, defense: 140, speed: 85 },
    star: 3,
    position: 1,
    avatar: '🗡️',
    skills: [
      { id: '2-1', name: '青龙偃月', type: 'active', cooldown: 0 },
      { id: '2-2', name: '义薄云天', type: 'ultimate', cooldown: 0 }
    ]
  },
  {
    id: 3,
    name: '张飞',
    level: 13,
    currentHp: 1300,
    maxHp: 1300,
    stats: { attack: 200, defense: 180, speed: 70 },
    star: 2,
    position: 2,
    avatar: '🛡️',
    skills: [
      { id: '3-1', name: '咆哮', type: 'active', cooldown: 0 },
      { id: '3-2', name: '猛冲', type: 'active', cooldown: 0 }
    ]
  }
];

const DEMO_ENEMY_TEAM = [
  {
    id: 101,
    name: '黄巾兵甲',
    level: 10,
    currentHp: 800,
    maxHp: 800,
    stats: { attack: 120, defense: 100, speed: 80 },
    star: 1,
    position: 0,
    avatar: '⚔️'
  },
  {
    id: 102,
    name: '黄巾兵乙',
    level: 11,
    currentHp: 850,
    maxHp: 850,
    stats: { attack: 130, defense: 110, speed: 75 },
    star: 1,
    position: 1,
    avatar: '🏹'
  },
  {
    id: 103,
    name: '黄巾头目',
    level: 15,
    currentHp: 1200,
    maxHp: 1200,
    stats: { attack: 180, defense: 150, speed: 95 },
    star: 2,
    position: 2,
    avatar: '👹'
  }
];

const BattleDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [playerTeam, setPlayerTeam] = useState(DEMO_PLAYER_TEAM);
  const [enemyTeam, setEnemyTeam] = useState(DEMO_ENEMY_TEAM);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [battlePhase, setBattlePhase] = useState<'preparation' | 'battle' | 'ended'>('preparation');
  const [activeHero, setActiveHero] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<'attack' | 'skill' | 'defend'>('attack');
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);
  const [showResult, setShowResult] = useState(false);

  // 计算行动顺序
  const calculateTurnOrder = () => {
    const allHeroes = [...playerTeam, ...enemyTeam]
      .filter(hero => hero.currentHp > 0)
      .map(hero => ({
        ...hero,
        initiative: hero.stats.speed + Math.random() * 20,
        isPlayer: playerTeam.includes(hero)
      }))
      .sort((a, b) => b.initiative - a.initiative);
    
    return allHeroes;
  };

  // 开始战斗
  const startBattle = () => {
    setBattlePhase('battle');
    setCurrentTurn(1);
    setBattleLog(['🚀 战斗开始！']);
    
    const turnOrder = calculateTurnOrder();
    if (turnOrder.length > 0) {
      setActiveHero(turnOrder[0]);
    }

    dispatch(addNotification({
      type: 'info',
      title: '战斗开始',
      message: '桃园三兄弟 VS 黄巾贼',
      duration: 3000,
    }));
  };

  // 执行动作
  const executeAction = (actionType: string, target?: any) => {
    if (!activeHero || battlePhase !== 'battle') return;

    let damage = 0;
    let logMessage = '';

    if (actionType === 'attack' && target) {
      // 计算基础伤害
      const baseDamage = Math.max(1, activeHero.stats.attack - target.stats.defense);
      const variation = 0.8 + Math.random() * 0.4; // 80%-120%伤害变化
      damage = Math.floor(baseDamage * variation);
      
      // 检查暴击
      const isCritical = Math.random() < 0.15; // 15%暴击率
      if (isCritical) {
        damage = Math.floor(damage * 1.5);
        logMessage = `💥 ${activeHero.name} 对 ${target.name} 发起暴击攻击，造成 ${damage} 点伤害！`;
      } else {
        logMessage = `⚔️ ${activeHero.name} 攻击 ${target.name}，造成 ${damage} 点伤害`;
      }

      // 应用伤害
      target.currentHp = Math.max(0, target.currentHp - damage);
      
      // 更新队伍状态
      if (playerTeam.includes(target)) {
        setPlayerTeam(prev => prev.map(h => h.id === target.id ? target : h));
      } else {
        setEnemyTeam(prev => prev.map(h => h.id === target.id ? target : h));
      }
    } else if (actionType === 'skill') {
      const skill = activeHero.skills?.[0];
      if (skill) {
        if (skill.type === 'buff') {
          logMessage = `✨ ${activeHero.name} 使用技能「${skill.name}」，提升全队士气！`;
          // 简单的加血效果
          const healAmount = 100;
          activeHero.currentHp = Math.min(activeHero.maxHp, activeHero.currentHp + healAmount);
        } else {
          const skillDamage = Math.floor(activeHero.stats.attack * 1.3);
          target.currentHp = Math.max(0, target.currentHp - skillDamage);
          logMessage = `🔥 ${activeHero.name} 使用技能「${skill.name}」对 ${target.name} 造成 ${skillDamage} 点伤害！`;
          
          if (playerTeam.includes(target)) {
            setPlayerTeam(prev => prev.map(h => h.id === target.id ? target : h));
          } else {
            setEnemyTeam(prev => prev.map(h => h.id === target.id ? target : h));
          }
        }
      }
    } else if (actionType === 'defend') {
      logMessage = `🛡️ ${activeHero.name} 进入防御姿态`;
    }

    // 更新战斗日志
    setBattleLog(prev => [...prev.slice(-4), logMessage]);

    // 检查战斗是否结束
    const playerAlive = playerTeam.some(h => h.currentHp > 0);
    const enemyAlive = enemyTeam.some(h => h.currentHp > 0);

    if (!playerAlive) {
      setBattleResult('defeat');
      setBattlePhase('ended');
      setShowResult(true);
      setBattleLog(prev => [...prev, '💀 战斗失败...']);
    } else if (!enemyAlive) {
      setBattleResult('victory');
      setBattlePhase('ended');
      setShowResult(true);
      setBattleLog(prev => [...prev, '🏆 战斗胜利！']);
    } else {
      // 继续下一回合
      setTimeout(() => {
        nextTurn();
      }, 1500);
    }
  };

  // 下一回合
  const nextTurn = () => {
    const turnOrder = calculateTurnOrder();
    if (turnOrder.length === 0) return;

    const nextHero = turnOrder.find(h => h.id !== activeHero?.id) || turnOrder[0];
    setActiveHero(nextHero);

    // AI回合
    if (!nextHero.isPlayer) {
      setTimeout(() => {
        aiAction(nextHero);
      }, 1000);
    }

    if (nextHero === turnOrder[0]) {
      setCurrentTurn(prev => prev + 1);
    }
  };

  // AI行动
  const aiAction = (aiHero: any) => {
    const playerTargets = playerTeam.filter(h => h.currentHp > 0);
    if (playerTargets.length === 0) return;

    // AI简单策略：攻击血量最少的玩家武将
    const target = playerTargets.reduce((prev, current) => 
      prev.currentHp < current.currentHp ? prev : current
    );

    executeAction('attack', target);
  };

  // 自动战斗
  useEffect(() => {
    if (autoMode && battlePhase === 'battle' && activeHero?.isPlayer) {
      const enemyTargets = enemyTeam.filter(h => h.currentHp > 0);
      if (enemyTargets.length > 0) {
        const target = enemyTargets[Math.floor(Math.random() * enemyTargets.length)];
        setTimeout(() => {
          executeAction('attack', target);
        }, 1000);
      }
    }
  }, [activeHero, autoMode, battlePhase]);

  const renderHero = (hero: any, isEnemy = false) => (
    <motion.div
      key={hero.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          minWidth: { xs: 120, sm: 150 },
          border: 2,
          borderColor: hero.currentHp > 0 ? (isEnemy ? 'error.main' : 'primary.main') : 'grey.500',
          bgcolor: hero.currentHp > 0 ? (isEnemy ? 'error.dark' : 'primary.dark') : 'grey.800',
          opacity: hero.currentHp > 0 ? 1 : 0.5,
          boxShadow: activeHero?.id === hero.id ? 4 : 1,
          transform: activeHero?.id === hero.id ? 'scale(1.05)' : 'scale(1)',
          transition: 'all 0.3s ease',
          cursor: !isEnemy && battlePhase === 'battle' && activeHero?.isPlayer ? 'pointer' : 'default'
        }}
        onClick={() => {
          if (isEnemy && battlePhase === 'battle' && activeHero?.isPlayer && hero.currentHp > 0) {
            setSelectedTarget(hero);
          }
        }}
      >
        <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" textAlign="center" sx={{ color: 'white', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
              {hero.name}
            </Typography>
            
            <Box textAlign="center" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {hero.avatar}
            </Box>
            
            <Typography variant="caption" textAlign="center" sx={{ color: 'grey.300' }}>
              Lv.{hero.level}
            </Typography>
            
            <Stack direction="row" justifyContent="center" spacing={0.5}>
              {Array.from({ length: hero.star }, (_, i) => (
                <Star key={i} sx={{ fontSize: '0.8rem', color: '#ffd700' }} />
              ))}
            </Stack>
            
            <Box>
              <Typography variant="caption" sx={{ color: 'white' }}>
                HP: {hero.currentHp}/{hero.maxHp}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(hero.currentHp / hero.maxHp) * 100}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: hero.currentHp > hero.maxHp * 0.3 ? '#4caf50' : '#f44336'
                  }
                }}
              />
            </Box>
            
            <Grid container spacing={0.5} sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
              <Grid item xs={4}>
                <Typography variant="caption" sx={{ color: '#ff9800' }}>
                  ⚔️{hero.stats.attack}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" sx={{ color: '#2196f3' }}>
                  🛡️{hero.stats.defense}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" sx={{ color: '#4caf50' }}>
                  💨{hero.stats.speed}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="xl" disableGutters>
      {/* 顶部应用栏 */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              战斗演示 - 桃园结义
            </Typography>
            <Typography variant="caption" color="text.secondary">
              回合: {currentTurn} | 状态: {battlePhase === 'preparation' ? '准备中' : battlePhase === 'battle' ? '战斗中' : '已结束'}
            </Typography>
          </Box>
          
          {battlePhase === 'battle' && (
            <Button
              variant={autoMode ? "contained" : "outlined"}
              size="small"
              startIcon={<AutoMode />}
              onClick={() => setAutoMode(!autoMode)}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              自动
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
        {/* 战斗状态指示 */}
        {activeHero && battlePhase === 'battle' && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            icon={activeHero.isPlayer ? <SportsEsports /> : <PlayArrow />}
          >
            {activeHero.isPlayer ? `轮到你了！${activeHero.name} 的回合` : `敌方 ${activeHero.name} 的回合`}
          </Alert>
        )}

        {/* 玩家队伍 */}
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, bgcolor: 'primary.dark' }}>
          <Typography variant="h6" sx={{ mb: 1, color: 'primary.light', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            🏛️ 桃园三兄弟
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 2 }} justifyContent="center">
            {playerTeam.map(hero => (
              <Grid item key={hero.id}>
                {renderHero(hero, false)}
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* VS 分隔符 */}
        <Box textAlign="center" sx={{ my: 2 }}>
          <Typography variant="h4" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
            ⚔️ VS ⚔️
          </Typography>
        </Box>

        {/* 敌方队伍 */}
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, bgcolor: 'error.dark' }}>
          <Typography variant="h6" sx={{ mb: 1, color: 'error.light', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            👹 黄巾贼寇
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 2 }} justifyContent="center">
            {enemyTeam.map(hero => (
              <Grid item key={hero.id}>
                {renderHero(hero, true)}
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* 战斗日志 */}
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.900', maxHeight: 150, overflow: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 1, color: 'white', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
            📜 战斗日志
          </Typography>
          {battleLog.map((log, index) => (
            <Typography key={index} variant="body2" sx={{ color: 'grey.300', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              {log}
            </Typography>
          ))}
        </Paper>

        {/* 操作区域 */}
        {battlePhase === 'preparation' && (
          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={startBattle}
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
                py: { xs: 1.5, sm: 2 },
                px: { xs: 3, sm: 4 }
              }}
            >
              开始战斗
            </Button>
          </Box>
        )}

        {battlePhase === 'battle' && activeHero?.isPlayer && !autoMode && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
              选择行动 - {activeHero.name}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant={selectedAction === 'attack' ? 'contained' : 'outlined'}
                  startIcon={<LocalFireDepartment />}
                  onClick={() => setSelectedAction('attack')}
                  disabled={!selectedTarget}
                >
                  攻击
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant={selectedAction === 'skill' ? 'contained' : 'outlined'}
                  startIcon={<Star />}
                  onClick={() => setSelectedAction('skill')}
                  disabled={!activeHero.skills?.length}
                >
                  技能
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant={selectedAction === 'defend' ? 'contained' : 'outlined'}
                  startIcon={<Shield />}
                  onClick={() => setSelectedAction('defend')}
                >
                  防御
                </Button>
              </Grid>
            </Grid>
            
            {selectedTarget && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  目标: {selectedTarget.name}
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    executeAction(selectedAction, selectedTarget);
                    setSelectedTarget(null);
                  }}
                >
                  确认行动
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </Container>

      {/* 战斗结果对话框 */}
      <Dialog open={showResult} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">
          {battleResult === 'victory' ? '🏆 胜利！' : '💀 失败'}
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center">
            <Typography variant="h6" sx={{ mb: 2 }}>
              {battleResult === 'victory' 
                ? '恭喜！桃园三兄弟击败了黄巾贼！' 
                : '很遗憾，这次没能获胜...'}
            </Typography>
            
            {battleResult === 'victory' && (
              <Stack spacing={1}>
                <Typography variant="body2">获得奖励:</Typography>
                <Chip label="🪙 金币 +500" color="warning" />
                <Chip label="⭐ 经验 +200" color="info" />
                <Chip label="🎁 经验药水 x2" color="success" />
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/heroes')} fullWidth variant="contained">
            返回武将
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BattleDemoPage;