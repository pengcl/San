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
import { useGetUserHeroesQuery } from '../../store/slices/apiSlice';
import HeroCard from '../../components/game/HeroCardMUI';
import type { Hero } from '../../types';

const HeroesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterRarity, setFilterRarity] = useState<number | null>(null);
  const [filterFaction, setFilterFaction] = useState<string>('');
  const [filterUnitType, setFilterUnitType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'level' | 'rarity' | 'attack' | 'power' | 'defense' | 'speed'>('power');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  const { data: heroesData, error, isLoading } = useGetUserHeroesQuery({
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

  // 过滤和排序武将 - 使用用户武将数据
  const getFilteredAndSortedHeroes = () => {
    const heroes = heroesData?.data || [];
    let filteredHeroes = [...heroes];

    // 搜索过滤
    if (searchQuery) {
      filteredHeroes = filteredHeroes.filter(hero =>
        hero.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 星级过滤
    if (filterRarity !== null) {
      filteredHeroes = filteredHeroes.filter(hero => 
        hero.star === filterRarity
      );
    }

    // 阵营过滤
    if (filterFaction) {
      filteredHeroes = filteredHeroes.filter(hero => 
        hero.faction === filterFaction
      );
    }

    // 兵种过滤
    if (filterUnitType) {
      filteredHeroes = filteredHeroes.filter(hero => 
        hero.unitType === filterUnitType
      );
    }

    // 排序
    filteredHeroes.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'level':
          comparison = (a.level || 0) - (b.level || 0);
          break;
        case 'rarity':
          comparison = (a.star || 1) - (b.star || 1);
          break;
        case 'attack':
          comparison = (a.stats?.attack || 0) - (b.stats?.attack || 0);
          break;
        case 'defense':
          comparison = (a.stats?.defense || 0) - (b.stats?.defense || 0);
          break;
        case 'speed':
          comparison = (a.stats?.speed || 0) - (b.stats?.speed || 0);
          break;
        case 'power':
          comparison = (a.power || 0) - (b.power || 0);
          break;
        default:
          return 0;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filteredHeroes;
  };

  const filteredHeroes = React.useMemo(() => getFilteredAndSortedHeroes(), [heroesData, searchQuery, filterRarity, filterFaction, filterUnitType, sortBy, sortOrder]);
  const totalHeroes = heroesData?.data?.length || 0;
  const rarityOptions = [1, 2, 3, 4, 5, 6];
  
  // 从现有武将中提取可用的阵营和兵种选项
  const factionOptions = React.useMemo(() => {
    const factions = new Set<string>();
    heroesData?.data?.forEach((hero: any) => {
      if (hero.faction && hero.faction !== 'unknown') {
        factions.add(hero.faction);
      }
    });
    return Array.from(factions).sort();
  }, [heroesData]);

  const unitTypeOptions = React.useMemo(() => {
    const unitTypes = new Set<string>();
    heroesData?.data?.forEach((hero: any) => {
      if (hero.unitType && hero.unitType !== 'unknown') {
        unitTypes.add(hero.unitType);
      }
    });
    return Array.from(unitTypes).sort();
  }, [heroesData]);

  // 转换用户武将数据为Hero类型
  const convertToHero = (userHero: any): Hero => ({
    id: userHero.id,
    name: userHero.name || '',
    title: `${userHero.level}级 ${userHero.star}星`,
    description: `战力: ${userHero.power || 0}`,
    level: userHero.level || 1,
    experience: userHero.experience || 0,
    rarity: userHero.star || 1, // 使用星级作为稀有度
    faction: userHero.faction || '未知',
    role: userHero.unitType || '未知',
    unit_type: userHero.unitType || '未知',
    cost: Math.floor((userHero.stats?.attack || 400) / 80) + 3,
    health: userHero.stats?.hp || 3000,
    attack: userHero.stats?.attack || 400,
    defense: userHero.stats?.defense || 400,
    speed: userHero.stats?.speed || 80,
    energy: 100,
    skills: userHero.skills || [],
    equipment: [],
    created_at: userHero.createdAt || '',
    updated_at: userHero.updatedAt || '',
    // 新增用户武将特有属性
    star: userHero.star || 1,
    power: userHero.power || 0,
    isFavorite: userHero.isFavorite || false,
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
              我的武将
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
              onClick={() => navigate('/summon')}
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

              {/* 星级筛选 - 手机端一行两个 */}
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>星级筛选</InputLabel>
                  <Select
                    value={filterRarity || ''}
                    onChange={(e) => setFilterRarity(e.target.value as number || null)}
                    label="星级筛选"
                  >
                    <MenuItem value="">
                      <em>全部星级</em>
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
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>排序方式</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'level' | 'rarity' | 'attack' | 'power' | 'defense' | 'speed')}
                    label="排序方式"
                  >
                    <MenuItem value="power">战力排序</MenuItem>
                    <MenuItem value="level">等级排序</MenuItem>
                    <MenuItem value="rarity">星级排序</MenuItem>
                    <MenuItem value="attack">攻击力排序</MenuItem>
                    <MenuItem value="defense">防御力排序</MenuItem>
                    <MenuItem value="speed">速度排序</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* 排序顺序 */}
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>排序顺序</InputLabel>
                  <Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    label="排序顺序"
                  >
                    <MenuItem value="desc">从高到低</MenuItem>
                    <MenuItem value="asc">从低到高</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* 阵营筛选 */}
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>阵营筛选</InputLabel>
                  <Select
                    value={filterFaction}
                    onChange={(e) => setFilterFaction(e.target.value)}
                    label="阵营筛选"
                  >
                    <MenuItem value="">
                      <em>全部阵营</em>
                    </MenuItem>
                    {factionOptions.map(faction => (
                      <MenuItem key={faction} value={faction}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%',
                            bgcolor: faction === '蜀' ? '#e74c3c' : faction === '魏' ? '#3498db' : '#2ecc71'
                          }} />
                          <Typography variant="body2">{faction}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 兵种筛选 */}
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>兵种筛选</InputLabel>
                  <Select
                    value={filterUnitType}
                    onChange={(e) => setFilterUnitType(e.target.value)}
                    label="兵种筛选"
                  >
                    <MenuItem value="">
                      <em>全部兵种</em>
                    </MenuItem>
                    {unitTypeOptions.map(unitType => (
                      <MenuItem key={unitType} value={unitType}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" sx={{
                            color: unitType === '步兵' ? '#ff5722' : unitType === '骑兵' ? '#ff9800' : '#4caf50'
                          }}>
                            {unitType === '步兵' ? '🛡️' : unitType === '骑兵' ? '🐎' : '🏹'}
                          </Typography>
                          <Typography variant="body2">{unitType}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 清除筛选 - 单独一行 */}
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFilterRarity(null);
                    setFilterFaction('');
                    setFilterUnitType('');
                    setSearchQuery('');
                    setSortBy('power');
                    setSortOrder('desc');
                  }}
                >
                  清除筛选
                </Button>
              </Grid>
            </Grid>

            {/* 当前筛选条件显示 */}
            {(filterRarity !== null || filterFaction || filterUnitType || searchQuery) && (
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
                      color="primary"
                    />
                  )}
                  {filterRarity !== null && (
                    <Chip
                      label={`星级: ${filterRarity}★`}
                      onDelete={() => setFilterRarity(null)}
                      size="small"
                      color="secondary"
                    />
                  )}
                  {filterFaction && (
                    <Chip
                      label={`阵营: ${filterFaction}`}
                      onDelete={() => setFilterFaction('')}
                      size="small"
                      color="error"
                    />
                  )}
                  {filterUnitType && (
                    <Chip
                      label={`兵种: ${filterUnitType}`}
                      onDelete={() => setFilterUnitType('')}
                      size="small"
                      color="success"
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
                  setFilterFaction('');
                  setFilterUnitType('');
                  setSearchQuery('');
                  setSortBy('power');
                  setSortOrder('desc');
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