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
  const { data: heroesData, error, isLoading } = useGetHeroesQuery();
  
  const [filterRarity, setFilterRarity] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'level' | 'rarity' | 'attack'>('level');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

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

  // 处理武将点击
  const handleHeroClick = (hero: Hero) => {
    setSelectedHero(selectedHero?.id === hero.id ? null : hero);
  };

  const handleHeroDetail = (hero: Hero) => {
    navigate(`/heroes/${hero.id}`);
  };

  // 过滤和排序武将
  const getFilteredAndSortedHeroes = () => {
    const heroes = heroesData?.data || [];
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
      filteredHeroes = filteredHeroes.filter(hero => {
        const rarity = Math.min(6, Math.max(1, Math.floor((hero.base_attack || 400) / 100)));
        return rarity === filterRarity;
      });
    }

    // 排序
    filteredHeroes.sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return (b.hero_id || 0) - (a.hero_id || 0);
        case 'rarity':
          const rarityA = Math.min(6, Math.max(1, Math.floor((a.base_attack || 400) / 100)));
          const rarityB = Math.min(6, Math.max(1, Math.floor((b.base_attack || 400) / 100)));
          return rarityB - rarityA;
        case 'attack':
          return (b.base_attack || 0) - (a.base_attack || 0);
        default:
          return 0;
      }
    });

    return filteredHeroes;
  };

  const filteredHeroes = getFilteredAndSortedHeroes();
  const totalHeroes = heroesData?.data?.length || 0;
  const rarityOptions = [1, 2, 3, 4, 5, 6];

  // 转换API数据为Hero类型
  const convertToHero = (apiHero: any): Hero => ({
    id: apiHero.id,
    name: apiHero.name || '',
    title: '',
    description: apiHero.description || '',
    level: Math.floor((apiHero.hero_id || 1000) / 100),
    experience: 0,
    rarity: Math.min(6, Math.max(1, Math.floor((apiHero.base_attack || 400) / 100))),
    faction: apiHero.hero_id ? (apiHero.hero_id < 2000 ? '蜀' : apiHero.hero_id < 3000 ? '魏' : '吴') : '',
    role: apiHero.base_attack > 600 ? '物理输出' : apiHero.base_hp > 4000 ? '坦克' : apiHero.base_speed > 90 ? '敏攻' : '辅助',
    unit_type: apiHero.base_speed > 100 ? '骑兵' : apiHero.base_attack > 650 ? '步兵' : '弓兵',
    cost: Math.floor((apiHero.base_attack || 400) / 80) + 3,
    health: apiHero.base_hp || 3000,
    attack: apiHero.base_attack || 400,
    defense: apiHero.base_defense || 400,
    speed: apiHero.base_speed || 80,
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
      {/* 顶部应用栏 */}
      <AppBar position="static" elevation={0}>
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
            <Typography variant="h4" component="h1" sx={{ fontFamily: 'Cinzel' }}>
              武将系统
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              共 {totalHeroes} 名武将 | 已筛选 {filteredHeroes.length} 名
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => navigate('/heroes/library')}
            sx={{ ml: 1 }}
          >
            武将图鉴
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
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
            sx={{ ml: 1 }}
          >
            召唤武将
          </Button>
        </Toolbar>
      </AppBar>

      {/* 筛选和搜索区域 */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              {/* 搜索框 */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="搜索武将名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* 品质筛选 */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>品质筛选</InputLabel>
                  <Select
                    value={filterRarity || ''}
                    onChange={(e) => setFilterRarity(e.target.value as number || null)}
                    label="品质筛选"
                    startAdornment={<FilterList sx={{ mr: 1 }} />}
                  >
                    <MenuItem value="">
                      <em>全部品质</em>
                    </MenuItem>
                    {rarityOptions.map(rarity => (
                      <MenuItem key={rarity} value={rarity}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ display: 'flex' }}>
                            {Array.from({ length: rarity }, (_, i) => (
                              <Star key={i} sx={{ fontSize: '1rem', color: '#ffd700' }} />
                            ))}
                          </Box>
                          <Typography>{rarity}★</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 排序选择 */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>排序方式</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'level' | 'rarity' | 'attack')}
                    label="排序方式"
                    startAdornment={<Sort sx={{ mr: 1 }} />}
                  >
                    <MenuItem value="level">等级排序</MenuItem>
                    <MenuItem value="rarity">品质排序</MenuItem>
                    <MenuItem value="attack">攻击力排序</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* 清除筛选 */}
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
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

        <Grid container spacing={2}>
          <AnimatePresence>
            {filteredHeroes.map((heroData, index) => {
              const hero = convertToHero(heroData);
              return (
                <Grid item xs={6} sm={4} md={3} lg={2} xl={2} key={hero.id}>
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