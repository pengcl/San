import React, { useState, useEffect } from 'react';
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
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ButtonGroup,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  AutoAwesome,
  Shield,
  LocalFireDepartment,
  Healing,
  Psychology,
  Star,
  Info,
  Search,
  FilterList,
  Sort,
  PlayArrow,
  Person,
  Groups,
  ExpandMore,
  FlashOn,
  Security,
  Favorite,
  Whatshot,
  Speed,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import {
  useGetSkillsQuery,
} from '../../store/slices/apiSlice';

interface Skill {
  id: number;
  skill_id: number;
  name: string;
  name_en: string;
  description: string;
  skill_type: 'active' | 'passive' | 'ultimate';
  damage_type: 'physical' | 'magical' | 'true' | 'healing';
  target_type: 'single' | 'multiple' | 'all_enemies' | 'all_allies' | 'self';
  cooldown: number;
  cost: number;
  base_damage: number;
  damage_scaling: number;
  effects: any;
  animation_url?: string;
  icon_url?: string;
  unlock_level: number;
  max_level: number;
  is_active: boolean;
  heroes?: any[];
}

const SkillsPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { data: skillsData, error: skillsError, isLoading } = useGetSkillsQuery();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillDetailOpen, setSkillDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('type');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

  // 处理API错误
  useEffect(() => {
    if (skillsError) {
      dispatch(addNotification({
        type: 'error',
        title: '加载失败',
        message: '无法加载技能数据，请检查网络连接',
        duration: 5000,
      }));
    }
  }, [skillsError, dispatch]);

  const skills = skillsData?.data || [];

  // 分类配置
  const categories = [
    { key: 'all', name: '全部技能', icon: <AutoAwesome />, count: skills.length },
    { key: 'active', name: '主动技能', icon: <FlashOn />, count: skills.filter(s => s.skill_type === 'active').length },
    { key: 'passive', name: '被动技能', icon: <Security />, count: skills.filter(s => s.skill_type === 'passive').length },
    { key: 'ultimate', name: '终极技能', icon: <Whatshot />, count: skills.filter(s => s.skill_type === 'ultimate').length },
  ];

  // 过滤和排序技能
  const getFilteredAndSortedSkills = () => {
    let filteredSkills = [...skills];

    // 分类过滤
    if (selectedCategory !== 'all') {
      filteredSkills = filteredSkills.filter(skill => skill.skill_type === selectedCategory);
    }

    // 搜索过滤
    if (searchQuery) {
      filteredSkills = filteredSkills.filter(skill =>
        skill.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 排序
    filteredSkills.sort((a, b) => {
      switch (sortBy) {
        case 'type':
          return a.skill_type.localeCompare(b.skill_type);
        case 'level':
          return a.unlock_level - b.unlock_level;
        case 'damage':
          return b.base_damage - a.base_damage;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filteredSkills;
  };

  const filteredSkills = getFilteredAndSortedSkills();

  // 获取技能类型颜色
  const getSkillTypeColor = (type: string) => {
    switch (type) {
      case 'active':
        return '#ff6b35';
      case 'passive':
        return '#2196f3';
      case 'ultimate':
        return '#9c27b0';
      default:
        return '#9e9e9e';
    }
  };

  // 获取伤害类型颜色
  const getDamageTypeColor = (type: string) => {
    switch (type) {
      case 'physical':
        return '#f44336';
      case 'magical':
        return '#3f51b5';
      case 'true':
        return '#9c27b0';
      case 'healing':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  // 获取技能类型名称
  const getSkillTypeName = (type: string) => {
    switch (type) {
      case 'active':
        return '主动';
      case 'passive':
        return '被动';
      case 'ultimate':
        return '终极';
      default:
        return '未知';
    }
  };

  // 获取伤害类型名称
  const getDamageTypeName = (type: string) => {
    switch (type) {
      case 'physical':
        return '物理';
      case 'magical':
        return '魔法';
      case 'true':
        return '真实';
      case 'healing':
        return '治疗';
      default:
        return '未知';
    }
  };

  // 获取目标类型名称
  const getTargetTypeName = (type: string) => {
    switch (type) {
      case 'single':
        return '单体';
      case 'multiple':
        return '多体';
      case 'all_enemies':
        return '全敌';
      case 'all_allies':
        return '全友';
      case 'self':
        return '自身';
      default:
        return '未知';
    }
  };

  // 处理技能点击
  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
    setSkillDetailOpen(true);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          加载技能数据中...
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
                技能大全 ⚡
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                探索强大的武将技能 • 总计 {skills.length} 个技能
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <IconButton
                color="inherit"
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              >
                <FilterList />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* 搜索和筛选 */}
        <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)', mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="搜索技能名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                      </InputAdornment>
                    ),
                    sx: { color: 'white' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#ff6b35' },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ButtonGroup variant="outlined" fullWidth>
                  <Button
                    startIcon={<Sort />}
                    onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    排序
                  </Button>
                </ButtonGroup>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* 左侧 - 分类导航 */}
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)', mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  技能分类
                </Typography>
                <Stack spacing={1}>
                  {categories.map((category) => (
                    <Button
                      key={category.key}
                      variant={selectedCategory === category.key ? 'contained' : 'outlined'}
                      startIcon={category.icon}
                      onClick={() => setSelectedCategory(category.key)}
                      sx={{
                        justifyContent: 'flex-start',
                        color: selectedCategory === category.key ? 'white' : 'rgba(255,255,255,0.7)',
                        borderColor: 'rgba(255,255,255,0.3)',
                        backgroundColor: selectedCategory === category.key ? '#ff6b35' : 'transparent',
                        '&:hover': {
                          backgroundColor: selectedCategory === category.key ? '#ff8c42' : 'rgba(255,255,255,0.1)',
                        }
                      }}
                      endIcon={
                        <Chip 
                          label={category.count} 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)', 
                            color: 'white',
                            fontSize: '0.7rem'
                          }} 
                        />
                      }
                    >
                      {category.name}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 右侧 - 技能列表 */}
          <Grid item xs={12} md={9}>
            <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    {categories.find(c => c.key === selectedCategory)?.name || '全部技能'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    显示 {filteredSkills.length} 个技能
                  </Typography>
                </Box>

                {filteredSkills.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h4" sx={{ mb: 2 }}>🔍</Typography>
                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                      暂无技能
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {selectedCategory === 'all' ? '技能数据为空' : '此分类下暂无技能'}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    <AnimatePresence>
                      {filteredSkills.map((skill, index) => (
                        <Grid item xs={12} sm={6} md={4} key={skill.id}>
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
                                background: 'rgba(255,255,255,0.05)',
                                '&:hover': {
                                  background: 'rgba(255,255,255,0.1)',
                                },
                                minHeight: 200,
                                position: 'relative'
                              }}
                              onClick={() => handleSkillClick(skill)}
                            >
                              <CardContent sx={{ p: 2 }}>
                                {/* 技能图标/头像 */}
                                <Box sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2
                                }}>
                                  <Avatar
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      bgcolor: getSkillTypeColor(skill.skill_type),
                                      mr: 2
                                    }}
                                  >
                                    {skill.skill_type === 'active' && <FlashOn />}
                                    {skill.skill_type === 'passive' && <Security />}
                                    {skill.skill_type === 'ultimate' && <Whatshot />}
                                  </Avatar>
                                  
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography 
                                      variant="h6" 
                                      sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {skill.name}
                                    </Typography>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: 'rgba(255,255,255,0.7)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      解锁等级: {skill.unlock_level}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {/* 技能标签 */}
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                  <Chip 
                                    label={getSkillTypeName(skill.skill_type)}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: getSkillTypeColor(skill.skill_type), 
                                      color: 'white',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                  <Chip 
                                    label={getDamageTypeName(skill.damage_type)}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: getDamageTypeColor(skill.damage_type), 
                                      color: 'white',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                </Stack>

                                {/* 技能描述 */}
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: 'rgba(255,255,255,0.8)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: 1.4,
                                    minHeight: '2.8em'
                                  }}
                                >
                                  {skill.description || '暂无描述'}
                                </Typography>

                                {/* 技能数据 */}
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                  <Grid container spacing={1}>
                                    {skill.cost > 0 && (
                                      <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                          消耗: {skill.cost}
                                        </Typography>
                                      </Grid>
                                    )}
                                    {skill.cooldown > 0 && (
                                      <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                          冷却: {skill.cooldown}回合
                                        </Typography>
                                      </Grid>
                                    )}
                                    {skill.base_damage > 0 && (
                                      <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ color: '#ff9800' }}>
                                          伤害: {skill.base_damage}
                                        </Typography>
                                      </Grid>
                                    )}
                                    <Grid item xs={6}>
                                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                        目标: {getTargetTypeName(skill.target_type)}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Box>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))}
                    </AnimatePresence>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 过滤菜单 */}
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={() => setFilterMenuAnchor(null)}
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              color: 'white'
            }
          }}
        >
          <MenuItem onClick={() => { setSortBy('type'); setFilterMenuAnchor(null); }}>
            按类型排序
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('level'); setFilterMenuAnchor(null); }}>
            按解锁等级排序
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('damage'); setFilterMenuAnchor(null); }}>
            按伤害排序
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('name'); setFilterMenuAnchor(null); }}>
            按名称排序
          </MenuItem>
        </Menu>

        {/* 技能详情对话框 */}
        <Dialog 
          open={skillDetailOpen} 
          onClose={() => setSkillDetailOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              color: 'white'
            }
          }}
        >
          {selectedSkill && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: getSkillTypeColor(selectedSkill.skill_type),
                      mr: 2
                    }}
                  >
                    {selectedSkill.skill_type === 'active' && <FlashOn />}
                    {selectedSkill.skill_type === 'passive' && <Security />}
                    {selectedSkill.skill_type === 'ultimate' && <Whatshot />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {selectedSkill.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip 
                        label={getSkillTypeName(selectedSkill.skill_type)}
                        size="small"
                        sx={{ 
                          backgroundColor: getSkillTypeColor(selectedSkill.skill_type), 
                          color: 'white'
                        }}
                      />
                      <Chip 
                        label={getDamageTypeName(selectedSkill.damage_type)}
                        size="small"
                        sx={{ 
                          backgroundColor: getDamageTypeColor(selectedSkill.damage_type), 
                          color: 'white'
                        }}
                      />
                    </Stack>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={3}>
                  {/* 技能描述 */}
                  <Box>
                    <Typography variant="h6" sx={{ color: '#ff6b35', mb: 1 }}>
                      技能描述
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {selectedSkill.description || '暂无描述'}
                    </Typography>
                  </Box>

                  {/* 技能属性 */}
                  <Box>
                    <Typography variant="h6" sx={{ color: '#ff6b35', mb: 2 }}>
                      技能属性
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            目标类型
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'white' }}>
                            {getTargetTypeName(selectedSkill.target_type)}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            解锁等级
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'white' }}>
                            {selectedSkill.unlock_level}
                          </Typography>
                        </Paper>
                      </Grid>
                      {selectedSkill.cost > 0 && (
                        <Grid item xs={6} sm={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              能量消耗
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#2196f3' }}>
                              {selectedSkill.cost}
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                      {selectedSkill.cooldown > 0 && (
                        <Grid item xs={6} sm={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              冷却时间
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#ff9800' }}>
                              {selectedSkill.cooldown}回合
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                      {selectedSkill.base_damage > 0 && (
                        <Grid item xs={6} sm={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              基础伤害
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#f44336' }}>
                              {selectedSkill.base_damage}
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {/* 拥有此技能的武将 */}
                  {selectedSkill.heroes && selectedSkill.heroes.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ color: '#ff6b35', mb: 2 }}>
                        拥有此技能的武将
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {selectedSkill.heroes.map((hero) => (
                          <Chip
                            key={hero.id}
                            label={hero.name}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(255,107,53,0.2)',
                              color: '#ff6b35',
                              mb: 1
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSkillDetailOpen(false)} sx={{ color: 'gray' }}>
                  关闭
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default SkillsPageMUI;