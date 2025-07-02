import React, { useState, useEffect, useMemo } from 'react';
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
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Divider,
  Paper,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Refresh,
  PlayArrow,
  Person,
  Security,
  FlashOn,
  Favorite,
  BookmarkBorder,
  Bookmark,
  SwapHoriz,
  InfoOutlined,
  Settings,
  AutoAwesome,
  Groups,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import {
  useGetHeroesQuery,
  useGetFormationsQuery,
  useUpdateFormationMutation,
  useCreateFormationMutation,
  useDeleteFormationMutation,
  useCopyFormationMutation,
  useGetRecommendedFormationsQuery,
} from '../../store/slices/apiSlice';
import DragDropFormationGrid from '../../components/ui/DragDropFormationGrid';
import type { FormationPosition, FormationHero } from '../../components/ui/DragDropFormationGrid';

// 扩展FormationHero类型以匹配我们的数据结构
interface ExtendedFormationHero extends FormationHero {
  attack?: number;
  defense?: number;
  health?: number;
  cost?: number;
  base_attack?: number;
  base_defense?: number;
  base_hp?: number;
}

interface FormationPreset {
  id: number;
  name: string;
  formation: FormationPosition[];
  totalPower: number;
  isActive: boolean;
  description: string;
}

interface FormationStats {
  totalPower: number;
  averageLevel: number;
  deployedCount: number;
  maxDeployable: number;
  totalCost: number;
  maxCost: number;
}

const FormationPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: heroesData, error: heroesError, isLoading: heroesLoading } = useGetHeroesQuery({});
  // 阵容API调用
  const { data: formationsData, error: formationsError, isLoading: formationsLoading } = useGetFormationsQuery({});
  
  // API mutations
  const [updateFormation, { isLoading: updating }] = useUpdateFormationMutation();
  const [createFormation, { isLoading: creating }] = useCreateFormationMutation();
  const [deleteFormation] = useDeleteFormationMutation();
  const [copyFormation] = useCopyFormationMutation();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [localFormations, setLocalFormations] = useState<FormationPosition[][]>([]);
  const [selectedHero, setSelectedHero] = useState<any>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // 从API获取的阵容数据
  const formations = formationsData?.data?.formations || [];
  
  // 处理阵容数据 - 使用useMemo优化性能
  const processedFormations = useMemo(() => {
    return formations.map((formation: any) => ({
      id: formation.id,
      name: formation.name,
      description: formation.description,
      totalPower: formation.total_power,
      isActive: formation.is_active,
      formation: formation.formation_data || [],
      preset_type: formation.preset_type
    }));
  }, [formations]);
  
  // 如果没有阵容数据，使用默认阵容 - 使用useMemo避免无限循环
  const presets = useMemo(() => {
    return processedFormations.length > 0 ? processedFormations : [
      {
        id: 0,
        name: '主力阵容',
        formation: [],
        totalPower: 0,
        isActive: true,
        description: '日常战斗推荐阵容',
        preset_type: 'main'
      },
      {
        id: 1,
        name: '副阵容',
        formation: [],
        totalPower: 0,
        isActive: false,
        description: '备用阵容配置',
        preset_type: 'secondary'
      },
      {
        id: 2,
        name: '挑战阵容',
        formation: [],
        totalPower: 0,
        isActive: false,
        description: '高难度关卡专用',
        preset_type: 'challenge'
      }
    ];
  }, [processedFormations]);

  // 初始化本地阵容数据 - 只在formations数据变化时初始化一次
  useEffect(() => {
    if (presets.length > 0 && localFormations.length === 0) {
      const initFormations = presets.map((preset: any) => {
        if (preset.formation && preset.formation.length > 0) {
          return preset.formation;
        }
        // 创建空阵容
        return Array.from({ length: 6 }, (_, index) => ({
          position: index,
          hero: null,
        }));
      });
      setLocalFormations(initFormations);
    }
  }, [formations, presets.length]); // 改为依赖formations而不是presets对象本身

  // 处理API错误
  useEffect(() => {
    if (heroesError) {
      dispatch(addNotification({
        type: 'error',
        title: '加载失败',
        message: '无法加载武将数据，请检查网络连接',
        duration: 5000,
      }));
    }
    if (formationsError) {
      dispatch(addNotification({
        type: 'error',
        title: '阵容加载失败',
        message: '无法加载阵容数据，请检查网络连接',
        duration: 5000,
      }));
    }
  }, [heroesError, formationsError, dispatch]);

  // 当前阵容
  const currentFormation = localFormations[selectedPreset] || [];
  const availableHeroes = heroesData?.data?.heroes || [];

  // 计算阵容统计
  const getFormationStats = (): FormationStats => {
    const deployedHeroes = currentFormation.filter(pos => pos.hero);
    const totalPower = deployedHeroes.reduce((sum, pos) => {
      if (pos.hero) {
        const hero = pos.hero as ExtendedFormationHero;
        return sum + (hero.attack || hero.stats?.attack || 0) + (hero.defense || hero.stats?.defense || 0) + (hero.health || hero.stats?.hp || 0) / 10;
      }
      return sum;
    }, 0);

    const averageLevel = deployedHeroes.length > 0 
      ? deployedHeroes.reduce((sum, pos) => sum + (pos.hero?.level || 1), 0) / deployedHeroes.length
      : 0;

    return {
      totalPower: Math.floor(totalPower),
      averageLevel: Math.floor(averageLevel),
      deployedCount: deployedHeroes.length,
      maxDeployable: 6,
      totalCost: deployedHeroes.reduce((sum, pos) => sum + ((pos.hero as ExtendedFormationHero)?.cost || 3), 0),
      maxCost: 30
    };
  };

  const stats = getFormationStats();

  // 处理武将选择
  const handleHeroClick = (hero: any) => {
    setSelectedHero(selectedHero?.id === hero.id ? null : hero);
  };

  // 处理阵容位置点击
  const handlePositionClick = (position: FormationPosition) => {
    if (selectedHero) {
      // 放置武将
      setLocalFormations(prev => {
        const newFormations = [...prev];
        const currentFormation = [...newFormations[selectedPreset]];
        
        // 清除该武将在其他位置的存在
        currentFormation.forEach(pos => {
          if (pos.hero?.id === selectedHero.id) {
            pos.hero = null;
          }
        });

        // 放置武将到新位置
        const targetPosition = currentFormation.find(pos => pos.position === position.position);
        if (targetPosition) {
          targetPosition.hero = {
            ...selectedHero,
            name: selectedHero.name || '未知武将',
            title: selectedHero.title || '',
            rarity: Math.min(6, Math.max(1, Math.floor((selectedHero.base_attack || 400) / 100))),
            faction: selectedHero.hero_id ? 
              (selectedHero.hero_id < 2000 ? '蜀' : selectedHero.hero_id < 3000 ? '魏' : '吴') : '未知',
            level: selectedHero.level || 1,
            attack: selectedHero.base_attack || 400,
            defense: selectedHero.base_defense || 400,
            health: selectedHero.base_hp || 3000,
            speed: selectedHero.base_speed || 80,
            cost: Math.floor((selectedHero.base_attack || 400) / 80) + 3,
          };
        }

        newFormations[selectedPreset] = currentFormation;
        setHasChanges(true);
        return newFormations;
      });

      setSelectedHero(null);
      dispatch(addNotification({
        type: 'success',
        title: '武将部署',
        message: `${selectedHero.name} 已部署到阵容`,
        duration: 2000,
      }));
    } else if (position.hero) {
      // 移除武将
      handleHeroRemove(position);
    }
  };

  // 处理武将移除
  const handleHeroRemove = (position: FormationPosition) => {
    setLocalFormations(prev => {
      const newFormations = [...prev];
      const currentFormation = [...newFormations[selectedPreset]];
      const targetPosition = currentFormation.find(pos => pos.position === position.position);
      
      if (targetPosition && targetPosition.hero) {
        const removedHero = targetPosition.hero;
        targetPosition.hero = null;
        newFormations[selectedPreset] = currentFormation;
        setHasChanges(true);

        dispatch(addNotification({
          type: 'info',
          title: '移除武将',
          message: `${removedHero.name} 已从阵容中移除`,
          duration: 2000,
        }));
      }

      return newFormations;
    });
  };

  // 处理武将拖拽
  const handleHeroDrop = (fromPosition: number, toPosition: number) => {
    setLocalFormations(prev => {
      const newFormations = [...prev];
      const currentFormation = [...newFormations[selectedPreset]];
      
      const fromPos = currentFormation.find(pos => pos.position === fromPosition);
      const toPos = currentFormation.find(pos => pos.position === toPosition);
      
      if (fromPos && toPos) {
        // 交换位置
        const tempHero = fromPos.hero;
        fromPos.hero = toPos.hero;
        toPos.hero = tempHero;
        
        newFormations[selectedPreset] = currentFormation;
        setHasChanges(true);
      }

      return newFormations;
    });
  };

  // 保存阵容
  const handleSaveFormation = async () => {
    try {
      const currentPreset = presets[selectedPreset];
      const formationData = {
        formation_data: currentFormation,
        total_power: stats.totalPower,
        deployed_count: stats.deployedCount
      };
      
      if (currentPreset.id && currentPreset.id !== 0) {
        // 更新现有阵容
        await updateFormation({ id: currentPreset.id, ...formationData }).unwrap();
      } else {
        // 创建新阵容 (如果是默认阵容但没有ID)
        const newFormationData = {
          name: currentPreset.name,
          description: currentPreset.description,
          preset_type: currentPreset.preset_type || 'main',
          ...formationData
        };
        await createFormation(newFormationData).unwrap();
      }
      
      // 同时保存到localStorage供战斗系统使用
      const battleFormation = currentFormation
        .filter(pos => pos.hero) // 只保存有武将的位置
        .map(pos => ({
          heroId: pos.hero.id,
          position: pos.position
        }));
      
      localStorage.setItem('currentFormation', JSON.stringify(battleFormation));
      
      setHasChanges(false);
      dispatch(addNotification({
        type: 'success',
        title: '保存成功',
        message: `${currentPreset.name} 已保存，可用于战斗`,
        duration: 3000,
      }));
    } catch (error) {
      console.error('保存阵容失败:', error);
      dispatch(addNotification({
        type: 'error',
        title: '保存失败',
        message: '保存阵容时出现错误',
        duration: 3000,
      }));
    }
    setSaveDialogOpen(false);
  };

  // 重置阵容
  const handleResetFormation = () => {
    setLocalFormations(prev => {
      const newFormations = [...prev];
      newFormations[selectedPreset] = newFormations[selectedPreset].map(pos => ({
        ...pos,
        hero: null
      }));
      setHasChanges(true);
      return newFormations;
    });

    dispatch(addNotification({
      type: 'info',
      title: '重置阵容',
      message: '当前阵容已重置',
      duration: 2000,
    }));
  };

  // 已部署的武将ID列表
  const deployedHeroIds = currentFormation
    .filter(pos => pos.hero)
    .map(pos => pos.hero!.id);

  // 可用武将（未部署的）
  const unusedHeroes = availableHeroes.filter((hero: any) => 
    !deployedHeroIds.includes(hero.id)
  );

  const isLoading = heroesLoading || formationsLoading;
  
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          加载武将数据中...
        </Typography>
        <LinearProgress sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 顶部应用栏 */}
        <AppBar position="static" elevation={0} sx={{ mb: 3, background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
          <Toolbar>
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={() => navigate(-1)}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                阵容编辑 ⚔️
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                配置你的战斗阵容 • 当前: {presets[selectedPreset].name}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<BookmarkBorder />}
                onClick={() => navigate('/formation/presets')}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                预设管理
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleResetFormation}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                重置
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => setSaveDialogOpen(true)}
                disabled={!hasChanges || updating || creating}
                sx={{ 
                  background: hasChanges ? 'linear-gradient(45deg, #ff6b35, #f9ca24)' : 'rgba(158,158,158,0.3)',
                  '&:hover': hasChanges ? { background: 'linear-gradient(45deg, #ff8c42, #f9d71c)' } : {},
                  '&:disabled': { background: 'rgba(158,158,158,0.3)' }
                }}
              >
                {updating || creating ? '保存中...' : '保存'}
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Grid container spacing={3}>
          {/* 左侧 - 阵容配置 */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* 阵容选择标签 */}
              <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
                <CardContent>
                  <Tabs 
                    value={selectedPreset} 
                    onChange={(_, newValue) => setSelectedPreset(newValue)}
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .Mui-selected': { color: '#ff6b35' },
                      '& .MuiTabs-indicator': { backgroundColor: '#ff6b35' }
                    }}
                  >
                    {presets.map((preset: any, index: number) => (
                      <Tab 
                        key={preset.id}
                        label={
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {preset.name}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {preset.description}
                            </Typography>
                          </Box>
                        }
                        icon={preset.isActive ? <Bookmark /> : <BookmarkBorder />}
                      />
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* 阵容统计 */}
              <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    阵容数据
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                          {stats.totalPower.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          总战力
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          {stats.deployedCount}/{stats.maxDeployable}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          已部署
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                          {stats.averageLevel}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          平均等级
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                          {stats.totalCost}/{stats.maxCost}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          部署费用
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {/* 费用进度条 */}
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        部署费用
                      </Typography>
                      <Typography variant="body2" sx={{ color: stats.totalCost > stats.maxCost ? '#f44336' : '#4caf50' }}>
                        {stats.totalCost}/{stats.maxCost}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((stats.totalCost / stats.maxCost) * 100, 100)}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stats.totalCost > stats.maxCost ? '#f44336' : '#4caf50'
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* 阵容网格 */}
              <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Groups sx={{ color: '#ff6b35', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      战斗阵型
                    </Typography>
                    <Tooltip title="拖拽武将调整位置，点击空位部署武将">
                      <InfoOutlined sx={{ color: 'rgba(255,255,255,0.5)', ml: 1, fontSize: '1rem' }} />
                    </Tooltip>
                  </Box>

                  <DragDropFormationGrid
                    formation={currentFormation}
                    availableHeroes={unusedHeroes}
                                         onFormationChange={(newFormation: FormationPosition[]) => {
                      setLocalFormations(prev => {
                        const newFormations = [...prev];
                        newFormations[selectedPreset] = newFormation;
                        setHasChanges(true);
                        return newFormations;
                      });
                    }}
                    readonly={false}
                    showPowerCalculation={false}
                    size="medium"
                  />
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* 右侧 - 武将选择 */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
              height: 'fit-content',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  可用武将 ({unusedHeroes.length})
                </Typography>

                {selectedHero && (
                  <Alert 
                    severity="info" 
                    sx={{ mb: 2, backgroundColor: 'rgba(33,150,243,0.1)' }}
                    icon={<Person />}
                  >
                    <Typography variant="body2">
                      已选择 <strong>{selectedHero.name}</strong>
                    </Typography>
                    <Typography variant="caption">
                      点击阵容位置进行部署
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  maxHeight: 'calc(80vh - 200px)',
                  pr: 1
                }}>
                  <Grid container spacing={2}>
                    <AnimatePresence>
                      {unusedHeroes.map((hero: any, index: number) => (
                        <Grid item xs={6} key={hero.id}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card 
                              sx={{ 
                                cursor: 'pointer',
                                border: selectedHero?.id === hero.id ? '2px solid #ff6b35' : '2px solid transparent',
                                background: selectedHero?.id === hero.id 
                                  ? 'linear-gradient(45deg, rgba(255,107,53,0.2), rgba(249,202,36,0.2))'
                                  : 'rgba(255,255,255,0.05)',
                                '&:hover': {
                                  background: 'rgba(255,255,255,0.1)',
                                }
                              }}
                              onClick={() => handleHeroClick(hero)}
                            >
                              <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
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
                                  fontSize: '1.5rem',
                                }}>
                                  {/* 这里可以放武将头像 */}
                                  ⚔️
                                </Box>
                                
                                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                  {hero.name || '未知武将'}
                                </Typography>
                                
                                <Typography variant="caption" sx={{ color: 'gray', display: 'block' }}>
                                  {hero.title || ''}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                  <Chip 
                                    label={`Lv.${hero.level || 1}`}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: 'rgba(76,175,80,0.2)', 
                                      color: '#4caf50',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))}
                    </AnimatePresence>
                  </Grid>

                  {unusedHeroes.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h4" sx={{ mb: 1 }}>🎖️</Typography>
                      <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                        所有武将都已部署
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        移除阵容中的武将以重新配置
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 保存对话框 */}
        <Dialog 
          open={saveDialogOpen} 
          onClose={() => setSaveDialogOpen(false)}
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              color: 'white'
            }
          }}
        >
          <DialogTitle>保存阵容</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              确认保存当前阵容配置？
            </Typography>
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Typography variant="subtitle2" sx={{ color: '#ff6b35', mb: 1 }}>
                {presets[selectedPreset].name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                总战力: {stats.totalPower.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                部署武将: {stats.deployedCount}/{stats.maxDeployable}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)} sx={{ color: 'gray' }}>
              取消
            </Button>
            <Button 
              onClick={handleSaveFormation} 
              variant="contained"
              disabled={updating || creating}
              sx={{ 
                background: 'linear-gradient(45deg, #ff6b35, #f9ca24)',
                '&:hover': { background: 'linear-gradient(45deg, #ff8c42, #f9d71c)' }
              }}
            >
              {updating || creating ? '保存中...' : '确认保存'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default FormationPageMUI;