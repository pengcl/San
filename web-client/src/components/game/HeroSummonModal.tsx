import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import {
  Close,
  AutoAwesome,
  Casino,
  Star,
  Celebration,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import { useSummonHeroesMutation, useNewbieSummonMutation } from '../../store/slices/apiSlice';

interface SummonResult {
  id: number;
  name: string;
  title: string;
  rarity: number;
  faction: string;
  avatar?: string;
  isNew: boolean;
}

interface HeroSummonModalProps {
  open: boolean;
  onClose: () => void;
}

const HeroSummonModal: React.FC<HeroSummonModalProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const [summonHeroes] = useSummonHeroesMutation();
  const [newbieSummon] = useNewbieSummonMutation();
  const [summonResults, setSummonResults] = useState<SummonResult[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 模拟用户资源
  const userResources = {
    summonTickets: 5,
    premiumTickets: 2,
    gold: 10000,
    gems: 500,
    hasNewbieSummon: true,
  };

  const summonTypes = [
    {
      id: 'normal',
      name: '普通召唤',
      description: '消耗召唤券或500金币',
      cost: '1x 召唤券 或 500 金币',
      icon: <Casino />,
      color: '#4caf50',
      rateInfo: '3★以上概率: 10%',
    },
    {
      id: 'premium',
      name: '高级召唤',
      description: '消耗高级召唤券或100宝石',
      cost: '1x 高级召唤券 或 100 宝石',
      icon: <AutoAwesome />,
      color: '#ff9800',
      rateInfo: '4★以上概率: 30%',
    },
    {
      id: 'newbie',
      name: '新手召唤',
      description: '免费获得强力武将',
      cost: '免费 (限1次)',
      icon: <Celebration />,
      color: '#e91e63',
      rateInfo: '必得4★以上武将',
      disabled: !userResources.hasNewbieSummon,
    },
  ];

  const getRarityColor = (rarity: number) => {
    const colors = {
      1: '#9e9e9e',
      2: '#4caf50',
      3: '#2196f3',
      4: '#9c27b0',
      5: '#ff9800',
      6: '#f44336',
    };
    return colors[rarity as keyof typeof colors] || colors[1];
  };

  const getFactionIcon = (faction: string) => {
    const factionMap: Record<string, string> = {
      '蜀': '🛡️',
      '魏': '⚔️',
      '吴': '🏹',
      'unknown': '❓',
    };
    return factionMap[faction] || '❓';
  };

  const handleSummon = async (type: string, count: number = 1) => {
    setIsAnimating(true);
    setShowResults(false);

    try {
      let result;
      
      if (type === 'newbie') {
        result = await newbieSummon().unwrap();
      } else {
        result = await summonHeroes({
          summonType: type,
          count: count,
        }).unwrap();
      }

      // 模拟召唤动画时间
      setTimeout(() => {
        if (result.success && result.data) {
          setSummonResults(result.data.heroes || []);
          setShowResults(true);
          setIsAnimating(false);

          dispatch(addNotification({
            type: 'success',
            title: '召唤成功',
            message: `获得了 ${result.data.heroes?.length || 0} 名武将！`,
            duration: 3000,
          }));
        }
      }, 2000);
    } catch (error: any) {
      setIsAnimating(false);
      dispatch(addNotification({
        type: 'error',
        title: '召唤失败',
        message: error.message || '召唤失败，请重试',
        duration: 5000,
      }));
    }
  };

  const handleClose = () => {
    setSummonResults([]);
    setShowResults(false);
    setIsAnimating(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          color: 'white',
          minHeight: '60vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: '#ff6b35',
        fontSize: '1.5rem',
        fontWeight: 'bold',
      }}>
        武将召唤 ✨
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* 用户资源显示 */}
        <Card sx={{ mb: 3, background: 'rgba(255,255,255,0.05)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
              当前资源
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Typography variant="body2" color="gray">召唤券</Typography>
                  <Typography variant="h6" color="white">{userResources.summonTickets}</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Typography variant="body2" color="gray">高级券</Typography>
                  <Typography variant="h6" color="white">{userResources.premiumTickets}</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Typography variant="body2" color="gray">金币</Typography>
                  <Typography variant="h6" color="white">{userResources.gold.toLocaleString()}</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Typography variant="body2" color="gray">宝石</Typography>
                  <Typography variant="h6" color="white">{userResources.gems}</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 召唤动画 */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 1 },
                    scale: { repeat: Infinity, duration: 2 }
                  }}
                >
                  <AutoAwesome sx={{ fontSize: '4rem', color: '#ff6b35' }} />
                </motion.div>
                <Typography variant="h5" sx={{ mt: 2, color: 'white' }}>
                  召唤中...
                </Typography>
                <LinearProgress 
                  sx={{ 
                    mt: 2, 
                    mx: 4, 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#ff6b35'
                    }
                  }} 
                />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 召唤结果 */}
        <AnimatePresence>
          {showResults && summonResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: '#ff6b35', textAlign: 'center' }}>
                召唤结果 🎉
              </Typography>
              <Grid container spacing={2}>
                {summonResults.map((hero, index) => (
                  <Grid item xs={6} sm={4} key={hero.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                    >
                      <Card sx={{ 
                        border: `2px solid ${getRarityColor(hero.rarity)}`,
                        background: 'rgba(255,255,255,0.05)',
                        position: 'relative',
                      }}>
                        {hero.isNew && (
                          <Chip 
                            label="NEW!" 
                            size="small"
                            sx={{ 
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: '#4caf50',
                              color: 'white',
                              zIndex: 1,
                            }}
                          />
                        )}
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 60, 
                            mx: 'auto', 
                            mb: 1,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                          }}>
                            {hero.avatar ? (
                              <img 
                                src={hero.avatar} 
                                alt={hero.name}
                                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                              />
                            ) : (
                              getFactionIcon(hero.faction)
                            )}
                          </Box>
                          
                          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {hero.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'gray', display: 'block' }}>
                            {hero.title}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                            {Array.from({ length: hero.rarity }, (_, i) => (
                              <Star key={i} sx={{ color: getRarityColor(hero.rarity), fontSize: '1rem' }} />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setShowResults(false);
                    setSummonResults([]);
                  }}
                  sx={{ 
                    background: 'linear-gradient(45deg, #ff6b35, #f9ca24)',
                    '&:hover': { background: 'linear-gradient(45deg, #ff8c42, #f9d71c)' }
                  }}
                >
                  继续召唤
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 召唤选项 */}
        {!isAnimating && !showResults && (
          <Grid container spacing={2}>
            {summonTypes.map((summonType) => (
              <Grid item xs={12} sm={4} key={summonType.id}>
                <Card sx={{ 
                  height: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: `2px solid ${summonType.color}`,
                  cursor: summonType.disabled ? 'not-allowed' : 'pointer',
                  opacity: summonType.disabled ? 0.5 : 1,
                  '&:hover': !summonType.disabled ? {
                    boxShadow: `0 0 20px ${summonType.color}40`,
                  } : {},
                }}>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Box sx={{ 
                        color: summonType.color, 
                        fontSize: '2.5rem',
                        mb: 1,
                      }}>
                        {summonType.icon}
                      </Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {summonType.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'gray', mb: 2 }}>
                        {summonType.description}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Stack spacing={1}>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        <strong>消耗:</strong> {summonType.cost}
                      </Typography>
                      <Typography variant="body2" sx={{ color: summonType.color }}>
                        <strong>概率:</strong> {summonType.rateInfo}
                      </Typography>
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={summonType.disabled}
                        onClick={() => handleSummon(summonType.id)}
                        sx={{
                          mb: 1,
                          background: `linear-gradient(45deg, ${summonType.color}, ${summonType.color}88)`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${summonType.color}CC, ${summonType.color}AA)`,
                          }
                        }}
                      >
                        召唤 1次
                      </Button>
                      
                      {summonType.id !== 'newbie' && (
                        <Button
                          fullWidth
                          variant="outlined"
                          disabled={summonType.disabled}
                          onClick={() => handleSummon(summonType.id, 10)}
                          sx={{
                            borderColor: summonType.color,
                            color: summonType.color,
                            '&:hover': {
                              borderColor: summonType.color,
                              backgroundColor: `${summonType.color}20`,
                            }
                          }}
                        >
                          召唤 10次
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* 召唤规则说明 */}
        {!isAnimating && !showResults && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              💡 <strong>召唤规则:</strong> 每日免费召唤1次，高级召唤有更高几率获得稀有武将。
              新手召唤保证获得4★以上武将，每个账号限1次。
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} sx={{ color: 'gray' }}>
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HeroSummonModal;