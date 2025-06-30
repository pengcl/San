import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
  IconButton,
  Tooltip,
  LinearProgress,
  CardActions,
} from '@mui/material';
import {
  Search,
  FilterList,
  ArrowBack,
  Sort,
  Star,
  AutoAwesome,
  Casino,
  Visibility,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import { useGetHeroLibraryQuery } from '../../store/slices/apiSlice';
import HeroSummonModal from '../../components/game/HeroSummonModal';

// 获取武将品质颜色
const getRarityColor = (rarity: number) => {
  const colors = {
    1: '#9e9e9e', // 灰色 - 1星
    2: '#4caf50', // 绿色 - 2星  
    3: '#2196f3', // 蓝色 - 3星
    4: '#9c27b0', // 紫色 - 4星
    5: '#ff9800', // 橙色 - 5星
    6: '#f44336', // 红色 - 6星
  };
  return colors[rarity as keyof typeof colors] || colors[1];
};

// 获取阵营图标
const getFactionIcon = (faction: string) => {
  const factionMap: Record<string, string> = {
    '蜀': '🛡️',
    '魏': '⚔️', 
    '吴': '🏹',
    'unknown': '❓',
  };
  return factionMap[faction] || '❓';
};

const HeroLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: libraryData, error, isLoading } = useGetHeroLibraryQuery();
  
  const [filterRarity, setFilterRarity] = useState<number | null>(null);
  const [filterFaction, setFilterFaction] = useState<string>('');
  const [sortBy, setSortBy] = useState<'heroId' | 'rarity' | 'name'>('heroId');
  const [searchQuery, setSearchQuery] = useState('');
  const [summonModalOpen, setSummonModalOpen] = useState(false);

  // 处理API错误
  useEffect(() => {
    if (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: '加载失败',
          message: '无法加载武将图鉴，请检查网络连接',
          duration: 5000,
        })
      );
    }
  }, [error, dispatch]);

  // 处理武将召唤
  const handleSummon = () => {
    setSummonModalOpen(true);
  };

  // 过滤和排序武将
  const getFilteredAndSortedHeroes = () => {
    const heroes = libraryData?.data?.heroes || [];
    let filteredHeroes = [...heroes];

    // 搜索过滤
    if (searchQuery) {
      filteredHeroes = filteredHeroes.filter(hero =>
        hero.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hero.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 品质过滤
    if (filterRarity !== null) {
      filteredHeroes = filteredHeroes.filter(hero => hero.rarity === filterRarity);
    }

    // 阵营过滤
    if (filterFaction) {
      filteredHeroes = filteredHeroes.filter(hero => hero.faction === filterFaction);
    }

    // 排序
    filteredHeroes.sort((a, b) => {
      switch (sortBy) {
        case 'heroId':
          return a.id - b.id;
        case 'rarity':
          return b.rarity - a.rarity;
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN');
        default:
          return 0;
      }
    });

    return filteredHeroes;
  };

  const filteredHeroes = getFilteredAndSortedHeroes();
  const totalHeroes = libraryData?.data?.heroes?.length || 0;
  const collectionStats = libraryData?.data?.collectionStats || {
    total: 0,
    owned: 0,
    percentage: 0
  };

  const rarityOptions = [1, 2, 3, 4, 5, 6];
  const factionOptions = ['蜀', '魏', '吴'];

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={40} sx={{ color: '#ff6b35' }} />
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          加载武将图鉴中...
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
        {/* 标题和统计 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              onClick={() => navigate('/home')} 
              sx={{ mr: 1, color: 'white' }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
              武将图鉴 📖
            </Typography>
          </Box>

          {/* 收集进度 */}
          <Card sx={{ mb: 2, background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                收集进度
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1" sx={{ color: 'white', flexGrow: 1 }}>
                  {collectionStats.owned} / {collectionStats.total} 武将
                </Typography>
                <Typography variant="body2" sx={{ color: '#ff6b35' }}>
                  {collectionStats.percentage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={collectionStats.percentage}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff6b35'
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* 搜索和过滤 */}
          <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    placeholder="搜索武将..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: 'white' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: '#ff6b35' },
                        '&.Mui-focused fieldset': { borderColor: '#ff6b35' },
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={6} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'white' }}>品质</InputLabel>
                    <Select
                      value={filterRarity || ''}
                      onChange={(e) => setFilterRarity(e.target.value ? Number(e.target.value) : null)}
                      sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
                    >
                      <MenuItem value="">全部</MenuItem>
                      {rarityOptions.map(rarity => (
                        <MenuItem key={rarity} value={rarity}>
                          {'★'.repeat(rarity)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'white' }}>阵营</InputLabel>
                    <Select
                      value={filterFaction}
                      onChange={(e) => setFilterFaction(e.target.value)}
                      sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
                    >
                      <MenuItem value="">全部</MenuItem>
                      {factionOptions.map(faction => (
                        <MenuItem key={faction} value={faction}>
                          {getFactionIcon(faction)} {faction}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'white' }}>排序</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'heroId' | 'rarity' | 'name')}
                      sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
                    >
                      <MenuItem value="heroId">编号</MenuItem>
                      <MenuItem value="rarity">品质</MenuItem>
                      <MenuItem value="name">姓名</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Casino />}
                    onClick={handleSummon}
                    sx={{
                      background: 'linear-gradient(45deg, #ff6b35, #f9ca24)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #ff8c42, #f9d71c)',
                      }
                    }}
                  >
                    召唤
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* 武将网格 */}
        <AnimatePresence>
          <Grid container spacing={2}>
            {filteredHeroes.map((hero, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={hero.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: hero.isOwned 
                        ? 'linear-gradient(45deg, #1a1a2e, #16213e)'
                        : 'linear-gradient(45deg, #2a2a2a, #3a3a3a)',
                      border: `2px solid ${getRarityColor(hero.rarity)}`,
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: `0 0 20px ${getRarityColor(hero.rarity)}40`,
                      }
                    }}
                  >
                    {/* 武将头像 */}
                    <CardMedia
                      component="div"
                      sx={{
                        height: 120,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        opacity: hero.isOwned ? 1 : 0.6,
                      }}
                    >
                      {hero.avatar ? (
                        <img 
                          src={hero.avatar} 
                          alt={hero.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Typography variant="h3">
                          {getFactionIcon(hero.faction)}
                        </Typography>
                      )}
                    </CardMedia>

                    {/* 品质星级 */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        borderRadius: 2,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: getRarityColor(hero.rarity),
                          fontWeight: 'bold'
                        }}
                      >
                        {'★'.repeat(hero.rarity)}
                      </Typography>
                    </Box>

                    {/* 拥有状态 */}
                    {hero.isOwned && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: '#4caf50',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
                          ✓
                        </Typography>
                      </Box>
                    )}

                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          textAlign: 'center',
                          opacity: hero.isOwned ? 1 : 0.6,
                        }}
                      >
                        {hero.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'gray',
                          textAlign: 'center',
                          display: 'block',
                          opacity: hero.isOwned ? 1 : 0.6,
                        }}
                      >
                        {hero.title}
                      </Typography>
                    </CardContent>

                    {/* 获取方式 */}
                    {!hero.isOwned && (
                      <CardActions sx={{ p: 1, pt: 0 }}>
                        <Stack direction="row" spacing={0.5} sx={{ width: '100%' }}>
                          {hero.obtainMethods?.map((method, idx) => (
                            <Chip
                              key={idx}
                              label={method === 'summon' ? '召唤' : method === 'fragments' ? '碎片' : method}
                              size="small"
                              sx={{
                                fontSize: '10px',
                                height: 20,
                                backgroundColor: 'rgba(255,107,53,0.2)',
                                color: '#ff6b35',
                                flex: 1,
                              }}
                            />
                          ))}
                        </Stack>
                      </CardActions>
                    )}
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </AnimatePresence>

        {/* 空状态 */}
        {filteredHeroes.length === 0 && !isLoading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
              🔍
            </Typography>
            <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
              没有找到武将
            </Typography>
            <Typography variant="body1" sx={{ color: 'gray', mb: 4 }}>
              尝试调整搜索条件或过滤器
            </Typography>
            <Button 
              variant="contained"
              onClick={() => {
                setSearchQuery('');
                setFilterRarity(null);
                setFilterFaction('');
              }}
              sx={{
                background: 'linear-gradient(45deg, #ff6b35, #f9ca24)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ff8c42, #f9d71c)',
                }
              }}
            >
              重置筛选
            </Button>
          </Box>
        )}

        {/* 悬浮召唤按钮 */}
        <Fab
          color="primary"
          aria-label="summon"
          onClick={handleSummon}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #ff6b35, #f9ca24)',
            '&:hover': {
              background: 'linear-gradient(45deg, #ff8c42, #f9d71c)',
            }
          }}
        >
          <AutoAwesome />
        </Fab>

        {/* 召唤模态框 */}
        <HeroSummonModal 
          open={summonModalOpen} 
          onClose={() => setSummonModalOpen(false)} 
        />
      </motion.div>
    </Container>
  );
};

export default HeroLibraryPage;