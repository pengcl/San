import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  SportsMartialArts,
  Shield,
  Favorite,
  Speed,
  ArrowBack,
  PlayArrow,
  AutoMode,
  PauseCircleOutline,
  CheckCircle,
  Star,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import {
  useStartBattleMutation,
  useExecuteActionMutation,
  useAutoBattleMutation,
  useGetBattleResultQuery,
} from '../../store/slices/apiSlice';

const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // 战斗状态
  const [battleId, setBattleId] = useState<string | null>(null);
  const [battleState, setBattleState] = useState<any>(null);
  const [playerTeam, setPlayerTeam] = useState<any[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<any[]>([]);
  const [battleLog, setBattleLog] = useState<any[]>([]);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [nextActions, setNextActions] = useState<any[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('attack');
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  
  // API mutations
  const [startBattle, { isLoading: startingBattle }] = useStartBattleMutation();
  const [executeAction, { isLoading: executingAction }] = useExecuteActionMutation();
  const [enableAutoBattle] = useAutoBattleMutation();
  
  // 获取战斗结果
  const { data: battleResult } = useGetBattleResultQuery(battleId, {
    skip: !battleId || !battleState?.battleEnded,
  });
  
  // 从路由状态获取关卡信息
  const stageData = location.state?.stage;
  
  useEffect(() => {
    // 如果有关卡数据，自动开始战斗
    if (stageData && !battleId) {
      initializeBattle();
    }
  }, [stageData]);
  
  useEffect(() => {
    // 战斗结束时显示结果
    if (battleState?.battleEnded && battleResult) {
      setShowResult(true);
    }
  }, [battleState, battleResult]);
  
  const initializeBattle = async () => {
    try {
      // 获取用户武将作为阵容（从localStorage或API获取）
      const savedFormation = localStorage.getItem('currentFormation');
      let formation;
      
      if (savedFormation) {
        formation = JSON.parse(savedFormation);
      } else {
        // 使用默认阵容 - 需要真实的武将ID
        formation = [
          { heroId: 36, position: 0 },  // 刘备
          { heroId: 37, position: 1 },  // 关羽 
          { heroId: 38, position: 2 },  // 张飞
        ];
      }
      
      const battleData = {
        battleType: 'pve_normal',
        stageId: stageData?.stage_id || '1-1',
        formation: formation,
        autoSkill: false,
      };
      
      const result = await startBattle(battleData).unwrap();
      
      if (result.success) {
        setBattleId(result.data.battleId);
        setBattleState(result.data.battleState);
        setPlayerTeam(result.data.playerTeam.heroes);
        setEnemyTeam(result.data.enemyTeam.heroes);
        setNextActions(result.data.nextActions || []);
        
        dispatch(addNotification({
          type: 'success',
          title: '战斗开始',
          message: `正在挑战 ${stageData?.name || '未知关卡'}`,
          duration: 3000,
        }));
      } else {
        throw new Error(result.error?.message || '战斗初始化失败');
      }
    } catch (error: any) {
      console.error('开始战斗失败:', error);
      const errorMessage = error?.data?.error?.message || error?.message || '无法开始战斗，请重试';
      
      dispatch(addNotification({
        type: 'error',
        title: '战斗失败',
        message: errorMessage,
        duration: 5000,
      }));
      navigate(-1);
    }
  };
  
  const handleAction = async (actionType: string, targetId?: number, skillId?: string) => {
    if (!battleId || !nextActions.length) return;
    
    const currentAction = nextActions.find(action => action.isPlayer);
    if (!currentAction) {
      dispatch(addNotification({
        type: 'warning',
        title: '等待回合',
        message: '请等待您的回合',
        duration: 2000,
      }));
      return;
    }
    
    try {
      // 确定目标
      let finalTargetId = targetId;
      if (!finalTargetId) {
        const availableTargets = enemyTeam.filter(h => h.currentHp > 0);
        if (availableTargets.length > 0) {
          finalTargetId = availableTargets[0].id;
        }
      }
      
      const actionData = {
        heroId: currentAction.heroId,
        actionType,
        targetId: finalTargetId,
        skillId: skillId,
      };
      
      dispatch(addNotification({
        type: 'info',
        title: '执行动作',
        message: `${currentAction.heroName || '武将'} 正在行动...`,
        duration: 1500,
      }));
      
      const result = await executeAction({ battleId, action: actionData }).unwrap();
      
      if (result.success) {
        // 更新战斗状态
        setBattleState(result.data.battleState);
        setNextActions(result.data.nextActions || []);
        setBattleLog(prev => [...prev, ...result.data.battleLog]);
        setCurrentTurn(result.data.battleState.turn);
        
        // 更新队伍HP状态（如果API返回了更新的队伍信息）
        if (result.data.playerTeam) {
          setPlayerTeam(result.data.playerTeam.heroes);
        }
        if (result.data.enemyTeam) {
          setEnemyTeam(result.data.enemyTeam.heroes);
        }
        
        // 清除选中的目标和动作
        setSelectedTarget(null);
        setSelectedAction('attack');
        
      } else {
        throw new Error(result.error?.message || '动作执行失败');
      }
      
    } catch (error: any) {
      console.error('执行动作失败:', error);
      const errorMessage = error?.data?.error?.message || error?.message || '执行战斗动作失败';
      
      dispatch(addNotification({
        type: 'error',
        title: '动作失败',
        message: errorMessage,
        duration: 3000,
      }));
    }
  };
  
  const toggleAutoMode = async () => {
    if (!battleId) return;
    
    try {
      await enableAutoBattle({ battleId, enabled: !autoMode }).unwrap();
      setAutoMode(!autoMode);
      
      dispatch(addNotification({
        type: 'info',
        title: autoMode ? '关闭自动战斗' : '开启自动战斗',
        message: autoMode ? '手动控制战斗' : '自动执行战斗',
        duration: 2000,
      }));
    } catch (error) {
      console.error('切换自动模式失败:', error);
    }
  };
  
  const handleBattleComplete = () => {
    if (battleResult?.data.result === 'victory') {
      dispatch(addNotification({
        type: 'success',
        title: '战斗胜利！',
        message: `获得 ${battleResult.data.rewards.gold} 金币`,
        duration: 5000,
      }));
    }
    navigate('/battle/stages');
  };
  
  // 如果还没有战斗数据，显示加载状态
  if (!battleId && stageData) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#ff6b35', mb: 3 }} />
        <Typography variant="h6" sx={{ color: 'white' }}>
          正在初始化战斗...
        </Typography>
      </Container>
    );
  }
  
  // 如果没有关卡数据，显示错误
  if (!stageData && !battleId) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          没有找到战斗数据，请从关卡页面重新进入
        </Alert>
        <Button variant="contained" onClick={() => navigate('/battle/stages')}>
          返回关卡选择
        </Button>
      </Container>
    );
  }

  const renderHero = (hero: any, isEnemy = false) => {
    const currentHp = hero.currentHp || hero.health || 0;
    const maxHp = hero.maxHp || hero.maxHealth || 1;
    const hpPercentage = (currentHp / maxHp) * 100;
    const isAlive = currentHp > 0;
    const isActiveHero = nextActions.some(action => action.heroId === hero.id && action.isPlayer);
    
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: isActiveHero ? 1.05 : 1, 
          opacity: isAlive ? 1 : 0.5,
        }}
        transition={{ duration: 0.3 }}
        whileHover={isAlive ? { scale: 1.02 } : {}}
      >
        <Card
          key={hero.id}
          sx={{
            minWidth: { xs: 150, sm: 180, md: 200 },
            border: 2,
            borderColor: isActiveHero 
              ? '#ffd700' 
              : isEnemy ? 'error.main' : 'primary.main',
            bgcolor: isEnemy ? 'error.light' : 'primary.light',
            opacity: isAlive ? 0.95 : 0.5,
            cursor: (!isEnemy && isAlive && isActiveHero) ? 'pointer' : 'default',
            boxShadow: isActiveHero ? '0 0 15px rgba(255, 215, 0, 0.5)' : 2,
            position: 'relative',
            overflow: 'visible'
          }}
          onClick={() => {
            if (isEnemy && isAlive && !autoMode) {
              setSelectedTarget(hero);
            }
          }}
        >
          {/* 活跃指示器 */}
          {isActiveHero && (
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: '#ffd700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                animation: 'pulse 2s infinite'
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '10px', color: 'black' }}>
                ⚡
              </Typography>
            </Box>
          )}
          
          {/* 选中目标指示器 */}
          {selectedTarget?.id === hero.id && (
            <Box
              sx={{
                position: 'absolute',
                top: -5,
                left: -5,
                right: -5,
                bottom: -5,
                border: '3px solid #ff6b35',
                borderRadius: 1,
                pointerEvents: 'none',
                animation: 'glow 1s ease-in-out infinite alternate'
              }}
            />
          )}
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack spacing={{ xs: 0.5, sm: 1 }}>
          <Typography 
            variant="h6" 
            textAlign="center" 
            color="white"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.125rem' } }}
          >
            {hero.name}
          </Typography>
          
          <Typography 
            variant="caption" 
            textAlign="center" 
            color="white"
            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
          >
            Lv.{hero.level || 1}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              sx={{
                width: { xs: 36, sm: 42, md: 48 },
                height: { xs: 36, sm: 42, md: 48 },
                bgcolor: isEnemy ? 'error.dark' : 'primary.dark',
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              {hero.name[0]}
            </Avatar>
          </Box>

          {/* 生命值 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography 
                variant="caption" 
                color="white"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                HP
              </Typography>
              <Typography 
                variant="caption" 
                color={hpPercentage > 50 ? '#4caf50' : hpPercentage > 25 ? '#ff9800' : '#f44336'}
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  fontWeight: 'bold'
                }}
              >
                {currentHp}/{maxHp}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={hpPercentage}
              sx={{
                height: { xs: 8, sm: 10 },
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: hpPercentage > 50 ? '#4caf50' : hpPercentage > 25 ? '#ff9800' : '#f44336',
                  borderRadius: 4,
                  transition: 'all 0.3s ease'
                },
              }}
            />
          </Box>

          {/* 属性 */}
          <Grid container spacing={{ xs: 0.5, sm: 1 }}>
            <Grid item xs={6}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <SportsMartialArts sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' }, 
                  color: 'white' 
                }} />
                <Typography 
                  variant="caption" 
                  color="white"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                  {hero.stats?.attack || hero.attack}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Shield sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' }, 
                  color: 'white' 
                }} />
                <Typography 
                  variant="caption" 
                  color="white"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                  {hero.stats?.defense || hero.defense}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
      </motion.div>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 3 } }}>
      {/* 顶部栏 - 移动端优化 */}
      <Box sx={{ 
        mb: { xs: 2, sm: 3 }, 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1, sm: 2 }
      }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ 
            minHeight: 44,
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            px: { xs: 2, sm: 3 }
          }}
        >
          返回
        </Button>
        <Typography 
          variant="h4" 
          fontFamily="Cinzel"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
        >
          战斗场景
        </Typography>
      </Box>

      {/* 战斗信息栏 */}
      <Card sx={{ mb: 3, background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
        <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ color: 'white', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                {stageData?.name || '战斗中'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stageData?.stage_id || battleId}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="body2" color="white" textAlign="center">
                回合: {currentTurn}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant={autoMode ? "contained" : "outlined"}
                  size="small"
                  onClick={toggleAutoMode}
                  startIcon={autoMode ? <PauseCircleOutline /> : <AutoMode />}
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 32, sm: 36 }
                  }}
                >
                  {autoMode ? '暂停' : '自动'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 战斗区域 - 移动端优化 */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '1px solid #374151',
          minHeight: { xs: 300, sm: 400 },
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
          {/* 玩家队伍 */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              gutterBottom 
              color="primary.main" 
              textAlign="center"
              sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
            >
              我方队伍
            </Typography>
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
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
                py: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 2, sm: 3 },
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <SportsMartialArts sx={{ 
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' }, 
                  color: 'warning.main' 
                }} />
              </motion.div>
              
              <Typography 
                variant="h5" 
                color="white" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                战斗进行中
              </Typography>
              
              <Chip
                label={`回合 ${currentTurn}`}
                color="warning"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' }, 
                  py: { xs: 0.5, sm: 1 },
                  minHeight: { xs: 28, sm: 32 }
                }}
              />
              
              {battleState?.battleEnded && (
                <Chip
                  label={battleState.winner === 'player' ? '胜利' : '失败'}
                  color={battleState.winner === 'player' ? 'success' : 'error'}
                  icon={<CheckCircle />}
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 'bold'
                  }}
                />
              )}

              {!battleState?.battleEnded && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  disabled={executingAction || autoMode || nextActions.length === 0}
                  sx={{ 
                    mt: { xs: 1, sm: 2 },
                    minHeight: { xs: 44, sm: 48 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    px: { xs: 3, sm: 4 }
                  }}
                  onClick={() => handleAction('attack')}
                >
                  {executingAction ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      执行中...
                    </>
                  ) : (
                    '执行攻击'
                  )}
                </Button>
              )}
              
              {battleState?.battleEnded && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CheckCircle />}
                  sx={{ 
                    mt: { xs: 1, sm: 2 },
                    minHeight: { xs: 44, sm: 48 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    px: { xs: 3, sm: 4 }
                  }}
                  onClick={() => setShowResult(true)}
                >
                  查看结果
                </Button>
              )}
            </Box>
          </Grid>

          {/* 敌方队伍 */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              gutterBottom 
              color="error.main" 
              textAlign="center"
              sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
            >
              敌方队伍
            </Typography>
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
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

      {/* 技能栏 - 移动端优化 */}
      {nextActions.length > 0 && (
        <Paper sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 2, sm: 2 } }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
          >
            战斗操作
          </Typography>
          
          {/* 当前行动武将信息 */}
          {(() => {
            const currentAction = nextActions.find(action => action.isPlayer);
            if (!currentAction) return null;
            
            return (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: '#ffd700' }}>
                  当前回合: {currentAction.heroName || `武将 ${currentAction.heroId}`}
                </Typography>
                
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  {/* 基础攻击 */}
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant={selectedAction === 'attack' ? "contained" : "outlined"}
                      disabled={battleState?.battleEnded || autoMode || executingAction}
                      startIcon={<SportsMartialArts />}
                      sx={{ 
                        py: { xs: 1, sm: 1.5 },
                        minHeight: { xs: 40, sm: 44 },
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}
                      onClick={() => {
                        if (selectedTarget) {
                          handleAction('attack', selectedTarget.id);
                        } else {
                          setSelectedAction('attack');
                          // 自动选择第一个可用目标
                          const availableTargets = enemyTeam.filter(h => h.currentHp > 0);
                          if (availableTargets.length > 0) {
                            handleAction('attack', availableTargets[0].id);
                          }
                        }
                      }}
                    >
                      基础攻击
                    </Button>
                  </Grid>
                  
                  {/* 技能列表 */}
                  {currentAction.availableSkills?.map((skill: any, index: number) => (
                    <Grid item xs={6} sm={3} key={skill.skillId}>
                      <Button
                        fullWidth
                        variant={selectedAction === skill.skillId ? "contained" : "outlined"}
                        disabled={battleState?.battleEnded || autoMode || executingAction || skill.onCooldown}
                        startIcon={skill.type === 'ultimate' ? <Star /> : <PlayArrow />}
                        sx={{ 
                          py: { xs: 1, sm: 1.5 },
                          minHeight: { xs: 40, sm: 44 },
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                        onClick={() => {
                          setSelectedAction(skill.skillId);
                          if (selectedTarget) {
                            handleAction('skill', selectedTarget.id, skill.skillId);
                          }
                        }}
                      >
                        {skill.name}
                        {skill.onCooldown && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              ml: 1,
                              fontSize: { xs: '0.65rem', sm: '0.75rem' }
                            }}
                          >
                            ({skill.remainingCooldown})
                          </Typography>
                        )}
                      </Button>
                    </Grid>
                  ))}
                  
                  {/* 防御 */}
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant={selectedAction === 'defend' ? "contained" : "outlined"}
                      disabled={battleState?.battleEnded || autoMode || executingAction}
                      startIcon={<Shield />}
                      sx={{ 
                        py: { xs: 1, sm: 1.5 },
                        minHeight: { xs: 40, sm: 44 },
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}
                      onClick={() => {
                        handleAction('defend');
                      }}
                    >
                      防御
                    </Button>
                  </Grid>
                </Grid>
                
                {/* 目标选择提示 */}
                {(selectedAction === 'attack' || selectedAction.includes('skill')) && !selectedTarget && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 1, 
                      color: '#ff9800',
                      textAlign: 'center'
                    }}
                  >
                    请点击敌方武将选择目标
                  </Typography>
                )}
                
                {selectedTarget && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 1, 
                      color: '#4caf50',
                      textAlign: 'center'
                    }}
                  >
                    目标: {selectedTarget.name}
                  </Typography>
                )}
              </Box>
            );
          })()}
        </Paper>
      )}

      {/* 战斗日志 - 移动端优化 */}
      <Paper sx={{ 
        mt: { xs: 2, sm: 3 }, 
        p: { xs: 2, sm: 2 }, 
        maxHeight: { xs: 150, sm: 200 }, 
        overflow: 'auto' 
      }}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
        >
          战斗日志
        </Typography>
        <Stack spacing={{ xs: 0.5, sm: 1 }}>
          <AnimatePresence>
            {battleLog.length === 0 ? (
              <Typography 
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                战斗日志将在这里显示...
              </Typography>
            ) : (
              battleLog.slice(-5).map((log, index) => (
                <motion.div
                  key={`${log.turn}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      color: log.result?.criticalHit ? 'warning.main' : 
                             log.result?.dodged ? 'info.main' : 'text.primary'
                    }}
                  >
                    {log.heroName} {log.actionType === 'attack' ? '攻击' : '使用技能'} 
                    {log.target && `对 ${log.target}`}
                    {log.result?.damage && ` 造成了 ${log.result.damage} 点伤害`}
                    {log.result?.criticalHit && ' (暴击!)'}
                    {log.result?.dodged && ' (闪避!)'}
                    {log.result?.blocked && ' (格挡!)'}
                  </Typography>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </Stack>
      </Paper>
      
      {/* 战斗结果对话框 */}
      <Dialog
        open={showResult}
        onClose={() => setShowResult(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            color: 'white',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            {battleResult?.data?.result === 'victory' ? '🎉 胜利!' : '💀 失败'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {battleResult?.data && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  战斗统计
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      耗时: {battleResult.data.duration}秒
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      回合: {battleResult.data.turns}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      星级: {Array.from({ length: battleResult.data.starRating }, () => '⭐').join('')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              {battleResult.data.rewards && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    战斗奖励
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      💰 金币: +{battleResult.data.rewards.gold}
                    </Typography>
                    {battleResult.data.rewards.items?.map((item: any, index: number) => (
                      <Typography key={index} variant="body2">
                        🎁 {item.name} x{item.quantity}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleBattleComplete}
            variant="contained"
            fullWidth
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BattlePage;