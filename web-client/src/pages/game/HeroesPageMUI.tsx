import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Box,
  CircularProgress,
  Alert,
  Fab,
  Toolbar,
  AppBar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  ArrowBack,
  Sort,
  Star,
  AutoAwesome,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useGetHeroesQuery } from '../../store/slices/apiSlice';
import HeroCard from '../../components/game/HeroCardMUI';
import type { Hero } from '../../types';

const HeroesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterRarity, setFilterRarity] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'level' | 'rarity' | 'attack'>('level');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  const { data: heroesData, error, isLoading } = useGetHeroesQuery({
    page: 1,
    limit: 100,
    sort: sortBy,
    order: 'desc'
  });

  // 处理API错误
  useEffect(() => {
    if (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: '加载失败',
          message: '无法加载武将数据，请检查网络连接',
          duration: 5000,
        })
      );
    }
  }, [error, dispatch]);

  // 处理武将点击 - 直接导航到详情页面
  const handleHeroClick = (hero: Hero) => {
    navigate(`/heroes/${hero.id}`);
  };

  const handleHeroDetail = (hero: Hero) => {
    navigate(`/heroes/${hero.id}`);
  };

  // 过滤和排序武将 - 使用后端返回的真实数据
  const getFilteredAndSortedHeroes = () => {
    const heroes = heroesData?.data?.heroes || [];
    let filteredHeroes = [...heroes];

    // 搜索过滤
    if (searchQuery) {
      filteredHeroes = filteredHeroes.filter(hero =>
        hero.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hero.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 品质过滤
    if (filterRarity !== null) {
      filteredHeroes = filteredHeroes.filter(hero => 
        (hero.quality === filterRarity) || (hero.rarity === filterRarity)
      );
    }

    // 排序
    filteredHeroes.sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return (b.id || 0) - (a.id || 0); // 按武将ID排序
        case 'rarity':
          return (b.quality || b.rarity || 1) - (a.quality || a.rarity || 1); // 按品质排序
        case 'attack':
          return (b.baseStats?.attack || 0) - (a.baseStats?.attack || 0); // 按攻击力排序
        default:
          return 0;
      }
    });

    return filteredHeroes;
  };

  const filteredHeroes = React.useMemo(() => getFilteredAndSortedHeroes(), [heroesData, searchQuery, filterRarity, sortBy]);
  const totalHeroes = heroesData?.data?.heroes?.length || 0;
  const rarityOptions = [1, 2, 3, 4, 5, 6];

  // 转换API数据为Hero类型 - 适配用户武将数据
  const convertToHero = (apiHero: any): Hero => ({
    id: apiHero.id,
    name: apiHero.name || '',
    title: apiHero.description || '',
    description: apiHero.description || '',
    level: apiHero.level || 1,
    experience: apiHero.experience || 0,
    rarity: apiHero.rarity || apiHero.quality || 1,
    faction: apiHero.faction || '未知', // 使用后端返回的阵营
    role: apiHero.unitType === '骑兵' ? '敏攻' : apiHero.unitType === '步兵' ? '物理输出' : '远程输出',
    unit_type: apiHero.unitType || '步兵', // 使用后端返回的兵种
    cost: Math.floor((apiHero.baseStats?.attack || 400) / 80) + 3,
    health: apiHero.stats?.hp || apiHero.baseStats?.hp || 3000,
    attack: apiHero.stats?.attack || apiHero.baseStats?.attack || 400,
    defense: apiHero.stats?.defense || apiHero.baseStats?.defense || 400,
    speed: apiHero.stats?.speed || apiHero.baseStats?.speed || 80,
    energy: 100,
    skills: [],
    equipment: [],
    created_at: apiHero.createdAt || '',
    updated_at: apiHero.updatedAt || '',
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          正在加载武将数据...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" disableGutters>
      {/* 顶部应用栏 - 手机端优化 */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontFamily: 'Cinzel',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              武将系统
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              共 {totalHeroes} 名 | 已筛选 {filteredHeroes.length} 名
            </Typography>
          </Box>

          {/* 按钮组 - 手机端显示所有功能，只调整大小和布局 */}
          <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/heroes/library')}
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              图鉴
            </Button>
            
            <Button
              variant="contained"
              size="small"
              startIcon={<AutoAwesome sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
              onClick={() =>
                dispatch(
                  addNotification({
                    type: 'info',
                    title: '召唤功能',
                    message: '武将召唤功能即将开放',
                    duration: 3000,
                  })
                )
              }
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>召唤武将</Box>
              <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>召唤</Box>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 筛选和搜索区域 */}
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              {/* 搜索框 - 手机端占满宽度 */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="搜索武将名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* 品质筛选 - 手机端一行两个 */}
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>品质筛选</InputLabel>
                  <Select
                    value={filterRarity || ''}
                    onChange={(e) => setFilterRarity(e.target.value as number || null)}
                    label="品质筛选"
                  >
                    <MenuItem value="">
                      <em>全部品质</em>
                    </MenuItem>
                    {rarityOptions.map(rarity => (
                      <MenuItem key={rarity} value={rarity}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ display: 'flex' }}>
                            {Array.from({ length: rarity }, (_, i) => (
                              <Star key={i} sx={{ fontSize: '0.8rem', color: '#ffd700' }} />
                            ))}
                          </Box>
                          <Typography variant="body2">{rarity}★</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 排序选择 - 手机端一行两个 */}
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>排序方式</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'level' | 'rarity' | 'attack')}
                    label="排序方式"
                  >
                    <MenuItem value="level">等级排序</MenuItem>
                    <MenuItem value="rarity">品质排序</MenuItem>
                    <MenuItem value="attack">攻击力排序</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* 清除筛选 - 手机端独占一行，平板以上和上面并列 */}
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFilterRarity(null);
                    setSearchQuery('');
                    setSortBy('level');
                  }}
                >
                  清除筛选
                </Button>
              </Grid>
            </Grid>

            {/* 当前筛选条件显示 */}
            {(filterRarity !== null || searchQuery) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  当前筛选条件:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {searchQuery && (
                    <Chip
                      label={`搜索: ${searchQuery}`}
                      onDelete={() => setSearchQuery('')}
                      size="small"
                    />
                  )}
                  {filterRarity !== null && (
                    <Chip
                      label={`品质: ${filterRarity}★`}
                      onDelete={() => setFilterRarity(null)}
                      size="small"
                    />
                  )}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* 武将网格 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            加载武将数据失败，请检查网络连接后重试
          </Alert>
        )}

        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <AnimatePresence>
            {filteredHeroes.map((heroData, index) => {
              const hero = convertToHero(heroData);
              return (
                <Grid item xs={6} sm={6} md={4} lg={3} xl={2} key={hero.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    layout
                  >
                    <HeroCard
                      hero={hero}
                      onClick={handleHeroClick}
                      isSelected={selectedHero?.id === hero.id}
                      size="sm"
                    />
                  </motion.div>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>

        {/* 空状态 */}
        {filteredHeroes.length === 0 && !isLoading && (
          <Card sx={{ mt: 4, textAlign: 'center', py: 6 }}>
            <CardContent>
              <Typography variant="h2" sx={{ fontSize: '4rem', mb: 2 }}>
                🔍
              </Typography>
              <Typography variant="h5" gutterBottom>
                没有找到符合条件的武将
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                尝试调整搜索条件或筛选器
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setFilterRarity(null);
                  setSearchQuery('');
                  setSortBy('level');
                }}
              >
                清除所有筛选条件
              </Button>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* 选中武将的详情操作 */}
      {selectedHero && (
        <Fab
          variant="extended"
          color="primary"
          onClick={() => handleHeroDetail(selectedHero)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          查看 {selectedHero.name} 详情
        </Fab>
      )}
    </Container>
  );
};

export default HeroesPage;