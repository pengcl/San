import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Shield,
  Speed,
  Favorite,
  LocalFireDepartment,
  Star,
  TrendingUp,
  Build,
  AutoAwesome,
  ExpandMore,
  PlayArrow,
  Upgrade,
  Settings,
  Info,
  Military,
  EmojiEvents,
  Whatshot,
  Psychology,
  Add,
  Remove,
  MonetizationOn,
  Diamond,
  Inventory,
  StarBorder,
  FlashOn,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import {
  useGetUserHeroQuery,
  useLevelUpHeroMutation,
  useStarUpHeroMutation,
  useAwakenHeroMutation,
  useGetUserProfileQuery,
} from '../../store/slices/apiSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`training-tabpanel-${index}`}
      aria-labelledby={`training-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const HeroTrainingPageMUI: React.FC = () => {
  const { heroId } = useParams<{ heroId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { data: heroData, error: heroError, isLoading } = useGetUserHeroQuery(heroId || '');
  const { data: userProfile } = useGetUserProfileQuery();
  const [levelUpHero, { isLoading: levelingUp }] = useLevelUpHeroMutation();
  const [starUpHero, { isLoading: starringUp }] = useStarUpHeroMutation();
  const [awakenHero, { isLoading: awakening }] = useAwakenHeroMutation();

  const [selectedTab, setSelectedTab] = useState(0);
  const [levelUpDialog, setLevelUpDialog] = useState(false);
  const [starUpDialog, setStarUpDialog] = useState(false);
  const [awakenDialog, setAwakenDialog] = useState(false);
  
  // 升级相关状态
  const [goldToUse, setGoldToUse] = useState(0);
  const [targetLevel, setTargetLevel] = useState(1);
  
  // 升星相关状态
  const [fragmentsToUse, setFragmentsToUse] = useState(0);
  const [duplicatesToUse, setDuplicatesToUse] = useState<number[]>([]);

  // 处理API错误
  useEffect(() => {
    if (heroError) {
      dispatch(addNotification({
        type: 'error',
        title: '加载失败',
        message: '无法加载武将详情，请检查网络连接',
        duration: 5000,
      }));
    }
  }, [heroError, dispatch]);

  const hero = heroData?.data;
  const profile = userProfile?.data;

  // 获取品质颜色
  const getQualityColor = (rarity: number) => {
    const colors = {
      1: '#9e9e9e', // 普通 - 灰色
      2: '#4caf50', // 优秀 - 绿色  
      3: '#2196f3', // 精良 - 蓝色
      4: '#9c27b0', // 史诗 - 紫色
      5: '#ff9800', // 传说 - 橙色
      6: '#f44336', // 神话 - 红色
    };
    return colors[rarity] || colors[1];
  };

  // 获取品质名称
  const getQualityName = (rarity: number) => {
    const names = {
      1: '普通',
      2: '优秀', 
      3: '精良',
      4: '史诗',
      5: '传说',
      6: '神话',
    };
    return names[rarity] || '普通';
  };

  // 计算升级所需金币
  const calculateLevelUpCost = (fromLevel: number, toLevel: number) => {
    let totalCost = 0;
    for (let i = fromLevel; i < toLevel; i++) {
      totalCost += i * 1000; // 每级1000金币基础，随等级递增
    }
    return totalCost;
  };

  // 计算升星所需碎片
  const getStarUpRequiredFragments = (currentStar: number) => {
    const requirements = {
      1: 5,   // 1星→2星需要5个碎片
      2: 10,  // 2星→3星需要10个碎片
      3: 20,  // 3星→4星需要20个碎片
      4: 30,  // 4星→5星需要30个碎片
      5: 50   // 5星→6星需要50个碎片
    };
    return requirements[currentStar] || 0;
  };

  // 获取觉醒需求
  const getAwakeningRequirements = (stage: number) => {
    const requirements = {
      1: { awakening_crystals: 10, hero_essence: 5, gold: 500000 },
      2: { awakening_crystals: 25, hero_essence: 15, divine_fragments: 3, gold: 1000000 },
      3: { awakening_crystals: 50, hero_essence: 30, divine_fragments: 10, celestial_orb: 1, gold: 2000000 }
    };
    return requirements[stage] || null;
  };

  // 处理升级
  const handleLevelUp = async () => {
    if (!hero || !profile) return;

    const cost = calculateLevelUpCost(hero.level, targetLevel);
    if (profile.gold < cost) {
      dispatch(addNotification({
        type: 'error',
        title: '金币不足',
        message: `升级需要 ${cost.toLocaleString()} 金币`,
        duration: 3000,
      }));
      return;
    }

    try {
      await levelUpHero({
        id: hero.id,
        useGold: cost,
        targetLevel
      }).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: '升级成功',
        message: `${hero.name} 升级到 ${targetLevel} 级！`,
        duration: 3000,
      }));
      setLevelUpDialog(false);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: '升级失败',
        message: '武将升级失败，请稍后重试',
        duration: 3000,
      }));
    }
  };

  // 处理升星
  const handleStarUp = async () => {
    if (!hero) return;

    const requiredFragments = getStarUpRequiredFragments(hero.rarity);
    
    try {
      await starUpHero({
        id: hero.id,
        useFragments: fragmentsToUse,
        useDuplicates: duplicatesToUse
      }).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: '升星成功',
        message: `${hero.name} 升星成功！`,
        duration: 3000,
      }));
      setStarUpDialog(false);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: '升星失败',
        message: '武将升星失败，请检查材料是否足够',
        duration: 3000,
      }));
    }
  };

  // 处理觉醒
  const handleAwaken = async () => {
    if (!hero) return;

    if (hero.rarity < 6) {
      dispatch(addNotification({
        type: 'error',
        title: '条件不足',
        message: '武将必须达到6星才能觉醒',
        duration: 3000,
      }));
      return;
    }

    if (hero.level < 80) {
      dispatch(addNotification({
        type: 'error',
        title: '条件不足',
        message: '武将必须达到80级才能觉醒',
        duration: 3000,
      }));
      return;
    }

    try {
      const requirements = getAwakeningRequirements(hero.awakening?.stage + 1 || 1);
      
      await awakenHero({
        id: hero.id,
        ...requirements
      }).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: '觉醒成功',
        message: `${hero.name} 觉醒成功！`,
        duration: 3000,
      }));
      setAwakenDialog(false);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: '觉醒失败',
        message: '武将觉醒失败，请检查材料是否足够',
        duration: 3000,
      }));
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          加载武将详情中...
        </Typography>
        <LinearProgress sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </Container>
    );
  }

  if (!hero) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>😔</Typography>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          武将不存在
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
          找不到指定的武将信息
        </Typography>
        <Button variant="contained" onClick={() => navigate('/heroes')}>
          返回武将列表
        </Button>
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
                {hero.name} • 武将培养
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                等级 {hero.level} • {hero.rarity}星 • 战力 {hero.power?.toLocaleString() || 0}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip 
                icon={<MonetizationOn />}
                label={profile?.gold?.toLocaleString() || 0}
                sx={{ backgroundColor: '#ffd700', color: '#000' }}
              />
              <Chip 
                icon={<Diamond />}
                label={profile?.gems?.toLocaleString() || 0}
                sx={{ backgroundColor: '#e91e63', color: '#fff' }}
              />
            </Stack>
          </Toolbar>
        </AppBar>

        {/* 武将信息概览 */}
        <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        border: `3px solid ${getQualityColor(hero.rarity)}`,
                        fontSize: '3rem'
                      }}
                    >
                      ⚔️
                    </Avatar>
                    
                    {/* 品质星级 */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: -5, 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 0.25
                    }}>
                      {Array.from({ length: hero.rarity }, (_, i) => (
                        <Star key={i} sx={{ color: '#ffd700', fontSize: '1rem' }} />
                      ))}
                    </Box>

                    {/* 等级标签 */}
                    <Chip 
                      label={`Lv.${hero.level}`}
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        bottom: 5,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={9}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {hero.name}
                    </Typography>
                    <Chip 
                      label={getQualityName(hero.rarity)}
                      sx={{ 
                        backgroundColor: getQualityColor(hero.rarity), 
                        color: 'white',
                        fontWeight: 'bold',
                        mt: 1
                      }}
                    />
                  </Box>

                  {/* 属性显示 */}
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                        <Favorite sx={{ color: '#e74c3c', mb: 0.5 }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {hero.currentStats?.hp || hero.baseStats?.hp || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          生命值
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                        <LocalFireDepartment sx={{ color: '#f39c12', mb: 0.5 }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {hero.currentStats?.attack || hero.baseStats?.attack || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          攻击力
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                        <Shield sx={{ color: '#3498db', mb: 0.5 }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {hero.currentStats?.defense || hero.baseStats?.defense || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          防御力
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                        <Speed sx={{ color: '#9b59b6', mb: 0.5 }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {hero.currentStats?.speed || hero.baseStats?.speed || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          速度
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* 经验进度条（如果有的话） */}
                  {hero.experience !== undefined && hero.maxExperience && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          经验值
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {hero.experience} / {hero.maxExperience}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(hero.experience / hero.maxExperience) * 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 1,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#ff6b35'
                          }
                        }}
                      />
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 培养选项卡 */}
        <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-selected': {
                    color: '#ff6b35'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#ff6b35'
                }
              }}
            >
              <Tab 
                icon={<TrendingUp />} 
                label="升级" 
                id="training-tab-0"
                aria-controls="training-tabpanel-0"
              />
              <Tab 
                icon={<Star />} 
                label="升星" 
                id="training-tab-1"
                aria-controls="training-tabpanel-1"
              />
              <Tab 
                icon={<AutoAwesome />} 
                label="觉醒" 
                id="training-tab-2"
                aria-controls="training-tabpanel-2"
              />
            </Tabs>
          </Box>

          {/* 升级面板 */}
          <TabPanel value={selectedTab} index={0}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                武将升级
              </Typography>
              
              <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                消耗金币提升武将等级，增强基础属性
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      当前状态
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>等级</Typography>
                        <Typography sx={{ color: 'white' }}>{hero.level}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>最大等级</Typography>
                        <Typography sx={{ color: 'white' }}>100</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>拥有金币</Typography>
                        <Typography sx={{ color: '#ffd700' }}>
                          {profile?.gold?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      升级效果预览
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      每级提升基础属性约10%
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        setTargetLevel(Math.min(hero.level + 1, 100));
                        setLevelUpDialog(true);
                      }}
                      disabled={hero.level >= 100 || levelingUp}
                      sx={{ 
                        background: 'linear-gradient(45deg, #ff6b35, #f9ca24)',
                        '&:hover': { background: 'linear-gradient(45deg, #ff8c42, #f9d71c)' }
                      }}
                    >
                      {hero.level >= 100 ? '已满级' : (levelingUp ? '升级中...' : '升级')}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </TabPanel>

          {/* 升星面板 */}
          <TabPanel value={selectedTab} index={1}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                武将升星
              </Typography>
              
              <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                消耗碎片或重复武将提升星级，大幅增强属性和解锁新技能
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      当前状态
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>当前星级</Typography>
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                          {Array.from({ length: hero.rarity }, (_, i) => (
                            <Star key={i} sx={{ color: '#ffd700', fontSize: '1rem' }} />
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>所需碎片</Typography>
                        <Typography sx={{ color: 'white' }}>
                          {hero.rarity < 6 ? `${getStarUpRequiredFragments(hero.rarity)} 个` : '已满星'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      升星效果
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      星级提升将大幅增强属性，4星以上解锁新技能
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        setFragmentsToUse(getStarUpRequiredFragments(hero.rarity));
                        setStarUpDialog(true);
                      }}
                      disabled={hero.rarity >= 6 || starringUp}
                      sx={{ 
                        background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                        '&:hover': { background: 'linear-gradient(45deg, #7b1fa2, #c2185b)' }
                      }}
                    >
                      {hero.rarity >= 6 ? '已满星' : (starringUp ? '升星中...' : '升星')}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </TabPanel>

          {/* 觉醒面板 */}
          <TabPanel value={selectedTab} index={2}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                武将觉醒
              </Typography>
              
              <Alert severity="warning" sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
                需要6星且80级以上才能觉醒，消耗珍贵材料获得强大力量
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      觉醒条件
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>星级要求</Typography>
                        <Typography sx={{ color: hero.rarity >= 6 ? '#4caf50' : '#f44336' }}>
                          {hero.rarity}/6星 {hero.rarity >= 6 ? '✓' : '✗'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>等级要求</Typography>
                        <Typography sx={{ color: hero.level >= 80 ? '#4caf50' : '#f44336' }}>
                          {hero.level}/80级 {hero.level >= 80 ? '✓' : '✗'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>觉醒阶段</Typography>
                        <Typography sx={{ color: 'white' }}>
                          {hero.awakening?.stage || 0}/3
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      觉醒效果
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      觉醒将大幅提升属性，解锁神话技能和特殊能力
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => setAwakenDialog(true)}
                      disabled={
                        hero.rarity < 6 || 
                        hero.level < 80 || 
                        (hero.awakening?.stage || 0) >= 3 ||
                        awakening
                      }
                      sx={{ 
                        background: 'linear-gradient(45deg, #ff6b35, #ff4757)',
                        '&:hover': { background: 'linear-gradient(45deg, #ff8c42, #ff3838)' }
                      }}
                    >
                      {(hero.awakening?.stage || 0) >= 3 ? '已满觉醒' : 
                       (awakening ? '觉醒中...' : '觉醒')}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>

              {/* 觉醒历程 */}
              {hero.awakening?.stage > 0 && (
                <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                    觉醒历程
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3].map((stage) => (
                      <Box 
                        key={stage}
                        sx={{ 
                          flex: 1, 
                          textAlign: 'center',
                          opacity: stage <= (hero.awakening?.stage || 0) ? 1 : 0.3
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: stage <= (hero.awakening?.stage || 0) ? '#ff6b35' : 'rgba(255,255,255,0.1)',
                            mx: 'auto',
                            mb: 1
                          }}
                        >
                          <AutoAwesome />
                        </Avatar>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          觉醒 {stage}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}
            </Stack>
          </TabPanel>
        </Card>

        {/* 升级对话框 */}
        <Dialog 
          open={levelUpDialog} 
          onClose={() => setLevelUpDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'white', backgroundColor: '#1a1a2e' }}>
            武将升级
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#1a1a2e' }}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  目标等级
                </Typography>
                <Slider
                  value={targetLevel}
                  onChange={(_, value) => setTargetLevel(value as number)}
                  min={hero.level + 1}
                  max={Math.min(100, hero.level + 10)}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ color: '#ff6b35' }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  消耗金币
                </Typography>
                <Typography variant="h6" sx={{ color: '#ffd700' }}>
                  {calculateLevelUpCost(hero.level, targetLevel).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  升级后获得
                </Typography>
                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                  等级提升：{hero.level} → {targetLevel}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                  属性提升：约 {((targetLevel - hero.level) * 10)}%
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#1a1a2e' }}>
            <Button onClick={() => setLevelUpDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleLevelUp}
              variant="contained"
              disabled={levelingUp || (profile?.gold || 0) < calculateLevelUpCost(hero.level, targetLevel)}
              sx={{ 
                background: 'linear-gradient(45deg, #ff6b35, #f9ca24)',
                '&:hover': { background: 'linear-gradient(45deg, #ff8c42, #f9d71c)' }
              }}
            >
              {levelingUp ? '升级中...' : '确认升级'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 升星对话框 */}
        <Dialog 
          open={starUpDialog} 
          onClose={() => setStarUpDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'white', backgroundColor: '#1a1a2e' }}>
            武将升星
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#1a1a2e' }}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Alert severity="info">
                升星需要消耗该武将的专属碎片或重复的同名武将
              </Alert>

              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  所需碎片
                </Typography>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {getStarUpRequiredFragments(hero.rarity)} 个
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  升星后获得
                </Typography>
                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                  星级提升：{hero.rarity} → {hero.rarity + 1}星
                </Typography>
                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                  属性大幅提升
                </Typography>
                {hero.rarity + 1 >= 4 && (
                  <Typography variant="body2" sx={{ color: '#ff9800' }}>
                    解锁新技能
                  </Typography>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#1a1a2e' }}>
            <Button onClick={() => setStarUpDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleStarUp}
              variant="contained"
              disabled={starringUp}
              sx={{ 
                background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                '&:hover': { background: 'linear-gradient(45deg, #7b1fa2, #c2185b)' }
              }}
            >
              {starringUp ? '升星中...' : '确认升星'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 觉醒对话框 */}
        <Dialog 
          open={awakenDialog} 
          onClose={() => setAwakenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'white', backgroundColor: '#1a1a2e' }}>
            武将觉醒
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#1a1a2e' }}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Alert severity="warning">
                觉醒是不可逆的强化，需要消耗珍贵材料
              </Alert>

              {(() => {
                const nextStage = (hero.awakening?.stage || 0) + 1;
                const requirements = getAwakeningRequirements(nextStage);
                
                if (!requirements) return null;

                return (
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      觉醒 {nextStage} 阶段所需材料：
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>觉醒水晶</Typography>
                        <Typography sx={{ color: 'white' }}>{requirements.awakening_crystals} 个</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>英雄精华</Typography>
                        <Typography sx={{ color: 'white' }}>{requirements.hero_essence} 个</Typography>
                      </Box>
                      {requirements.divine_fragments && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>神性碎片</Typography>
                          <Typography sx={{ color: 'white' }}>{requirements.divine_fragments} 个</Typography>
                        </Box>
                      )}
                      {requirements.celestial_orb && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>天界宝珠</Typography>
                          <Typography sx={{ color: 'white' }}>{requirements.celestial_orb} 个</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>金币</Typography>
                        <Typography sx={{ color: '#ffd700' }}>{requirements.gold.toLocaleString()}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              })()}

              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  觉醒后获得
                </Typography>
                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                  全属性大幅提升
                </Typography>
                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                  解锁神话级技能
                </Typography>
                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                  获得特殊战场光环
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#1a1a2e' }}>
            <Button onClick={() => setAwakenDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleAwaken}
              variant="contained"
              disabled={awakening}
              sx={{ 
                background: 'linear-gradient(45deg, #ff6b35, #ff4757)',
                '&:hover': { background: 'linear-gradient(45deg, #ff8c42, #ff3838)' }
              }}
            >
              {awakening ? '觉醒中...' : '确认觉醒'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default HeroTrainingPageMUI;