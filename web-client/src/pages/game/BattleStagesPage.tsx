import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  Star,
  StarBorder,
  PlayArrow,
  Lock,
  EmojiEvents,
  LocalFireDepartment,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import { useGetChaptersQuery, useGetStagesQuery } from '../../store/slices/apiSlice';

interface BattleStage {
  id: number;
  name: string;
  chapter: number;
  stage: number;
  difficulty: 'normal' | 'elite' | 'nightmare';
  requiredLevel: number;
  maxStars: number;
  currentStars: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  rewards: {
    exp: number;
    gold: number;
    items?: string[];
  };
  enemyTeam: {
    level: number;
    power: number;
  };
}

const BattleStagesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [selectedDifficulty, setSelectedDifficulty] = useState<'normal' | 'elite' | 'nightmare'>('normal');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  
  // 获取章节列表
  const { data: chaptersData, error: chaptersError, isLoading: chaptersLoading } = useGetChaptersQuery();
  
  // 获取当前章节的关卡
  const { data: stagesData, error: stagesError, isLoading: stagesLoading } = useGetStagesQuery({
    chapter_id: selectedChapter,
    stage_type: selectedDifficulty,
  });

  const chapters = chaptersData?.data || [];
  const stages = stagesData?.data || [];
  const isLoading = chaptersLoading || stagesLoading;
  const error = chaptersError || stagesError;

  const handleStageClick = (stage: any) => {
    if (!stage.is_unlocked) {
      dispatch(addNotification({
        type: 'warning',
        title: '关卡未解锁',
        message: `需要完成前置关卡才能挑战 ${stage.name}`,
        duration: 3000,
      }));
      return;
    }

    // 导航到战斗页面，携带关卡信息
    navigate('/battle', { state: { stage } });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'normal': return '#4caf50';
      case 'elite': return '#ff9800';
      case 'nightmare': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'normal': return <PlayArrow />;
      case 'elite': return <EmojiEvents />;
      case 'nightmare': return <LocalFireDepartment />;
      default: return <PlayArrow />;
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={40} sx={{ color: '#ff6b35' }} />
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          加载关卡数据中...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 头部 */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/home')} 
            sx={{ color: 'white' }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
            战斗关卡 ⚔️
          </Typography>
        </Box>

        {/* 难度和章节选择 */}
        <Card sx={{ mb: 3, background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>难度</InputLabel>
                  <Select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as 'normal' | 'elite' | 'nightmare')}
                    sx={{ 
                      color: 'white', 
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } 
                    }}
                  >
                    <MenuItem value="normal">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PlayArrow sx={{ color: '#4caf50' }} />
                        普通
                      </Box>
                    </MenuItem>
                    <MenuItem value="elite">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEvents sx={{ color: '#ff9800' }} />
                        精英
                      </Box>
                    </MenuItem>
                    <MenuItem value="nightmare">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalFireDepartment sx={{ color: '#f44336' }} />
                        噩梦
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>章节</InputLabel>
                  <Select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(Number(e.target.value))}
                    sx={{ 
                      color: 'white', 
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } 
                    }}
                  >
                    {chapters.map(chapter => (
                      <MenuItem key={chapter.chapter_id} value={chapter.chapter_id}>
                        第 {chapter.chapter_id} 章 - {chapter.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            加载关卡数据失败，请检查网络连接后重试
          </Alert>
        )}

        {/* 关卡网格 */}
        <Grid container spacing={2}>
          <AnimatePresence>
            {stages.map((stage, index) => (
              <Grid item xs={12} sm={6} md={4} key={stage.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: stage.is_unlocked ? 1.02 : 1 }}
                  whileTap={{ scale: stage.is_unlocked ? 0.98 : 1 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: stage.is_unlocked 
                        ? 'linear-gradient(45deg, #1a1a2e, #16213e)'
                        : 'linear-gradient(45deg, #2a2a2a, #3a3a3a)',
                      border: `2px solid ${getDifficultyColor(stage.stage_type || 'normal')}`,
                      cursor: stage.is_unlocked ? 'pointer' : 'not-allowed',
                      opacity: stage.is_unlocked ? 1 : 0.6,
                      position: 'relative',
                      '&:hover': stage.is_unlocked ? {
                        boxShadow: `0 0 20px ${getDifficultyColor(stage.stage_type || 'normal')}40`,
                      } : {},
                    }}
                    onClick={() => handleStageClick(stage)}
                  >
                    {/* 锁定状态 */}
                    {!stage.is_unlocked && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          borderRadius: '50%',
                          p: 1,
                          zIndex: 1,
                        }}
                      >
                        <Lock sx={{ color: 'gray', fontSize: '1.2rem' }} />
                      </Box>
                    )}

                    {/* 完成状态 */}
                    {stage.is_completed && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: '#4caf50',
                          borderRadius: '50%',
                          p: 0.5,
                          zIndex: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white', fontSize: '10px' }}>
                          ✓
                        </Typography>
                      </Box>
                    )}

                    <CardContent>
                      {/* 关卡标题 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getDifficultyIcon(stage.stage_type || 'normal')}
                        <Typography 
                          variant="h6" 
                          sx={{ color: 'white', ml: 1, fontWeight: 'bold' }}
                        >
                          {stage.stage_id} {stage.name}
                        </Typography>
                      </Box>

                      {/* 关卡信息 */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: 'gray' }}>
                            推荐战力
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {stage.recommended_power || 0}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: 'gray' }}>
                            体力消耗
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {stage.energy_cost || 6}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* 星级 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'gray', mr: 1 }}>
                          星级:
                        </Typography>
                        {Array.from({ length: 3 }, (_, i) => (
                          <Box key={i}>
                            {i < (stage.stars_earned || 0) ? (
                              <Star sx={{ color: '#ffd700', fontSize: '1.2rem' }} />
                            ) : (
                              <StarBorder sx={{ color: 'gray', fontSize: '1.2rem' }} />
                            )}
                          </Box>
                        ))}
                      </Box>

                      {/* 奖励 */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'gray', mb: 1 }}>
                          奖励:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip 
                            label={`${stage.base_rewards?.exp || 0} 经验`}
                            size="small"
                            sx={{ backgroundColor: 'rgba(76,175,80,0.2)', color: '#4caf50' }}
                          />
                          <Chip 
                            label={`${stage.base_rewards?.gold || 0} 金币`}
                            size="small"
                            sx={{ backgroundColor: 'rgba(255,193,7,0.2)', color: '#ffc107' }}
                          />
                        </Stack>
                      </Box>

                      {/* 挑战按钮 */}
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={!stage.is_unlocked}
                        startIcon={stage.is_unlocked ? <PlayArrow /> : <Lock />}
                        sx={{
                          background: stage.is_unlocked 
                            ? `linear-gradient(45deg, ${getDifficultyColor(stage.stage_type || 'normal')}, ${getDifficultyColor(stage.stage_type || 'normal')}88)`
                            : 'rgba(158,158,158,0.3)',
                          '&:hover': stage.is_unlocked ? {
                            background: `linear-gradient(45deg, ${getDifficultyColor(stage.stage_type || 'normal')}CC, ${getDifficultyColor(stage.stage_type || 'normal')}AA)`,
                          } : {},
                        }}
                      >
                        {stage.is_unlocked ? '开始挑战' : '未解锁'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {/* 空状态 */}
        {stages.length === 0 && !isLoading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
              🏰
            </Typography>
            <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
              暂无可用关卡
            </Typography>
            <Typography variant="body1" sx={{ color: 'gray', mb: 4 }}>
              请尝试切换难度或章节
            </Typography>
          </Box>
        )}
      </motion.div>
    </Container>
  );
};

export default BattleStagesPage;