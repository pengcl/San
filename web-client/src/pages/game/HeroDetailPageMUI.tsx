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
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  TextField,
  FormControlLabel,
  Switch,
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
  StarBorder,
  Diamond,
  MonetizationOn,
  Psychology,
  Flare,
  EmojiEvents,
  Whatshot,
  Psychology,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import {
  useGetHeroQuery,
  useLevelUpHeroMutation,
  useStarUpHeroMutation,
  useAwakenHeroMutation,
  useGetUserProfileQuery,
} from '../../store/slices/apiSlice';
import HeroCultivation from '../../components/game/HeroCultivation';

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
      id={`hero-tabpanel-${index}`}
      aria-labelledby={`hero-tab-${index}`}
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

const HeroDetailPageMUI: React.FC = () => {
  const { heroId } = useParams<{ heroId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { data: heroData, error: heroError, isLoading } = useGetHeroQuery(heroId || '');
  const { data: userProfile } = useGetUserProfileQuery({});
  const [levelUpHero, { isLoading: levelingUp }] = useLevelUpHeroMutation();
  const [starUpHero] = useStarUpHeroMutation();
  const [awakenHero] = useAwakenHeroMutation();

  const [selectedTab, setSelectedTab] = useState(0);

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

  // 计算战力
  const calculatePower = (hero: any) => {
    if (!hero) return 0;
    const attack = hero.base_attack || hero.baseStats?.attack || 0;
    const defense = hero.base_defense || hero.baseStats?.defense || 0;
    const hp = hero.base_hp || hero.baseStats?.hp || 0;
    const speed = hero.base_speed || hero.baseStats?.speed || 0;
    
    return Math.floor(attack + defense + hp / 10 + speed);
  };

  // 处理升级
  const handleLevelUp = async (heroId: number, data: any) => {
    try {
      await levelUpHero({
        id: heroId,
        ...data
      }).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: '升级成功',
        message: `武将升级成功！`,
        duration: 3000,
      }));
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
  const handleStarUp = async (heroId: number, data: any) => {
    try {
      await starUpHero({
        id: heroId,
        ...data
      }).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: '升星成功',
        message: `武将升星成功！属性大幅提升！`,
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: '升星失败',
        message: '武将升星失败，请检查材料是否充足',
        duration: 3000,
      }));
    }
  };

  // 处理觉醒
  const handleAwaken = async (heroId: number, data: any) => {
    try {
      await awakenHero({
        id: heroId,
        ...data
      }).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: '觉醒成功',
        message: `武将觉醒成功！获得强大的觉醒能力！`,
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: '觉醒失败',
        message: '武将觉醒失败，请检查材料和等级要求',
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
                {hero.name} {hero.title && `• ${hero.title}`}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                武将详情 • 等级 {hero.level || 1} • 战力 {(hero.power || calculatePower(hero)).toLocaleString()}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                onClick={() => navigate(`/heroes/${heroId}/training`)}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                培养
              </Button>
              <Button
                variant="outlined"
                startIcon={<Build />}
                onClick={() => navigate(`/heroes/${heroId}/equipment`)}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                装备
              </Button>
              <Button
                variant="contained"
                startIcon={<Upgrade />}
                onClick={handleLevelUp}
                disabled={levelingUp}
                sx={{ 
                  background: 'linear-gradient(45deg, #ff6b35, #f9ca24)',
                  '&:hover': { background: 'linear-gradient(45deg, #ff8c42, #f9d71c)' }
                }}
              >
                {levelingUp ? '升级中...' : '升级'}
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* 武将基本信息卡片 */}
        <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)', mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {/* 左侧 - 武将头像 */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      position: 'relative',
                      display: 'inline-block',
                      mb: 2
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 200,
                        height: 200,
                        border: `4px solid ${getQualityColor(hero.star || hero.rarity || 1)}`,
                        fontSize: '4rem'
                      }}
                    >
                      ⚔️
                    </Avatar>
                    
                    {/* 品质星级 */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: -10, 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 0.5
                    }}>
                      {Array.from({ length: hero.star || hero.rarity || 1 }, (_, i) => (
                        <Star key={i} sx={{ color: '#ffd700', fontSize: '1.5rem' }} />
                      ))}
                    </Box>

                    {/* 等级标签 */}
                    <Chip 
                      label={`Lv.${hero.level || 1}`}
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        bottom: 10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  {/* 品质显示 */}
                  <Chip 
                    label={hero.qualityName || getQualityName(hero.star || hero.rarity || 1)}
                    sx={{ 
                      backgroundColor: hero.qualityColor || getQualityColor(hero.star || hero.rarity || 1), 
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 2
                    }}
                  />
                </Box>
              </Grid>

              {/* 右侧 - 详细信息 */}
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  {/* 基本信息 */}
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                      {hero.name}
                    </Typography>
                    {hero.title && (
                      <Typography variant="h6" sx={{ color: '#ff6b35', mb: 2 }}>
                        {hero.title}
                      </Typography>
                    )}
                    {hero.description && (
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                        {hero.description}
                      </Typography>
                    )}
                  </Box>

                  {/* 属性标签 */}
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          阵营
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {hero.faction || '未知'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          兵种
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {hero.unitType || '未知'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          费用
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {Math.floor((hero.base_attack || hero.baseStats?.attack || 400) / 200) + 3}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          战力
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                          {(hero.power || calculatePower(hero)).toLocaleString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* 经验值进度条 */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        经验值
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4caf50' }}>
                        {hero.experience || 0} / {hero.maxExperience || (hero.level || 1) * 1000}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={((hero.experience || 0) / (hero.maxExperience || (hero.level || 1) * 1000)) * 100}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4caf50'
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 标签页 */}
        <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
                '& .Mui-selected': { color: '#ff6b35' },
                '& .MuiTabs-indicator': { backgroundColor: '#ff6b35' }
              }}
            >
              <Tab icon={<Info />} label="属性" />
              <Tab icon={<AutoAwesome />} label="技能" />
              <Tab icon={<TrendingUp />} label="培养" />
              <Tab icon={<EmojiEvents />} label="成就" />
              <Tab icon={<Psychology />} label="分析" />
            </Tabs>
          </Box>

          {/* 属性页面 */}
          <TabPanel value={selectedTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  基础属性
                </Typography>
                <Stack spacing={2}>
                  {/* 生命值 */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Favorite sx={{ color: '#f44336', mr: 1 }} />
                      <Typography variant="body1" sx={{ color: 'white', flexGrow: 1 }}>
                        生命值
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                        {(hero.currentStats?.hp || hero.baseStats?.hp || 3000).toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={100}
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#f44336' }
                      }}
                    />
                  </Box>

                  {/* 攻击力 */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalFireDepartment sx={{ color: '#ff9800', mr: 1 }} />
                      <Typography variant="body1" sx={{ color: 'white', flexGrow: 1 }}>
                        攻击力
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                        {hero.currentStats?.attack || hero.baseStats?.attack || 400}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(((hero.currentStats?.attack || hero.baseStats?.attack || 400) / 1000) * 100, 100)}
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800' }
                      }}
                    />
                  </Box>

                  {/* 防御力 */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Shield sx={{ color: '#2196f3', mr: 1 }} />
                      <Typography variant="body1" sx={{ color: 'white', flexGrow: 1 }}>
                        防御力
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                        {hero.currentStats?.defense || hero.baseStats?.defense || 400}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(((hero.currentStats?.defense || hero.baseStats?.defense || 400) / 1000) * 100, 100)}
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#2196f3' }
                      }}
                    />
                  </Box>

                  {/* 速度 */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Speed sx={{ color: '#4caf50', mr: 1 }} />
                      <Typography variant="body1" sx={{ color: 'white', flexGrow: 1 }}>
                        速度
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                        {hero.currentStats?.speed || hero.baseStats?.speed || 80}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(((hero.currentStats?.speed || hero.baseStats?.speed || 80) / 200) * 100, 100)}
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' }
                      }}
                    />
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  属性评级
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ 
                    p: 3, 
                    background: 'linear-gradient(45deg, rgba(255,107,53,0.1), rgba(249,202,36,0.1))',
                    borderRadius: 2,
                    border: '1px solid rgba(255,107,53,0.2)'
                  }}>
                    <Typography variant="h4" sx={{ color: '#ff6b35', fontWeight: 'bold', textAlign: 'center' }}>
                      {calculatePower(hero).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                      综合战力
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                        <Typography variant="h6" sx={{ color: '#f44336' }}>
                          S
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          生存能力
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                        <Typography variant="h6" sx={{ color: '#ff9800' }}>
                          A
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          输出能力
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                        <Typography variant="h6" sx={{ color: '#2196f3' }}>
                          B
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          防护能力
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                        <Typography variant="h6" sx={{ color: '#4caf50' }}>
                          A
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          敏捷度
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          {/* 技能页面 */}
          <TabPanel value={selectedTab} index={1}>
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              武将技能
            </Typography>
            
            <Alert 
              severity="info" 
              sx={{ mb: 3, backgroundColor: 'rgba(33,150,243,0.1)', color: 'white' }}
              icon={<Info />}
            >
              技能系统正在开发中，敬请期待更丰富的技能体验！
            </Alert>

            <Grid container spacing={2}>
              {/* 模拟技能卡片 */}
              {['主动技能', '被动技能', '终极技能'].map((skillType, index) => (
                <Grid item xs={12} key={skillType}>
                  <Card sx={{ background: 'rgba(255,255,255,0.05)' }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ 
                          background: `linear-gradient(45deg, ${['#ff6b35', '#2196f3', '#9c27b0'][index]}, ${['#f9ca24', '#4caf50', '#f44336'][index]})`,
                          width: 56,
                          height: 56
                        }}>
                          {['🔥', '🛡️', '⚡'][index]}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                            {skillType}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            技能详情即将开放，为武将提供强大的战斗能力
                          </Typography>
                        </Box>
                        <Chip 
                          label="即将开放" 
                          size="small" 
                          sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* 培养页面 */}
          <TabPanel value={selectedTab} index={2}>
            <HeroCultivation
              hero={hero}
              userResources={{
                gold: userProfile?.data?.gold || 0,
                diamond: userProfile?.data?.diamond || 0,
                stardust: userProfile?.data?.stardust || 0,
                heroFragments: userProfile?.data?.heroFragments || 0,
                experience: userProfile?.data?.experience || 0
              }}
              onLevelUp={handleLevelUp}
              onStarUp={handleStarUp}
              onAwaken={handleAwaken}
            />
          </TabPanel>

          {/* 成就页面 */}
          <TabPanel value={selectedTab} index={3}>
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              武将成就
            </Typography>
            
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <EmojiEvents sx={{ fontSize: '4rem', color: '#ffd700', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                成就系统
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                武将成就功能正在开发中
              </Typography>
            </Box>
          </TabPanel>

          {/* 分析页面 */}
          <TabPanel value={selectedTab} index={4}>
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              武将分析
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: 'rgba(255,255,255,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                      使用统计
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          出战次数
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          {Math.floor(Math.random() * 100) + 1}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          胜率
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4caf50' }}>
                          {Math.floor(Math.random() * 30) + 70}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          平均伤害
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ff9800' }}>
                          {(Math.floor(Math.random() * 5000) + 2000).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ background: 'rgba(255,255,255,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                      推荐搭配
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      基于当前武将属性和技能特点，推荐与以下武将搭配：
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      {['张飞', '刘备', '赵云'].map((name) => (
                        <Chip 
                          key={name}
                          label={name}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(255,107,53,0.2)', 
                            color: '#ff6b35',
                            width: 'fit-content'
                          }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </motion.div>
    </Container>
  );
};

export default HeroDetailPageMUI;