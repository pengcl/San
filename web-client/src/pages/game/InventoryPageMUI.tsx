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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Inventory,
  Category,
  Lock,
  LockOpen,
  Sell,
  PlayArrow,
  FilterList,
  Sort,
  MoreVert,
  LocalMall,
  Diamond,
  Build,
  Science,
  MonetizationOn,
  Star,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import {
  useGetUserItemsQuery,
  useUseItemMutation,
  useToggleItemLockMutation,
  useSellItemsMutation,
} from '../../store/slices/apiSlice';

interface UserItem {
  id: number;
  quantity: number;
  acquired_at: string;
  last_used?: string;
  is_locked: boolean;
  metadata: any;
  item_template: {
    id: number;
    item_id: number;
    name: string;
    description: string;
    category: 'materials' | 'consumables' | 'equipment' | 'fragments' | 'currency' | 'special';
    rarity: number;
    max_stack: number;
    sell_price: number;
    is_usable: boolean;
    effects: any;
    icon: string;
    quality?: {
      id: number;
      name: string;
      color: string;
    };
  };
}

const InventoryPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // API hooks
  const { data: inventoryData, error: inventoryError, isLoading } = useGetUserItemsQuery();
  const [useItem, { isLoading: using }] = useUseItemMutation();
  const [toggleLock] = useToggleItemLockMutation();
  const [sellItems, { isLoading: selling }] = useSellItemsMutation();

  // 状态管理
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [useDialogOpen, setUseDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserItem | null>(null);
  const [useQuantity, setUseQuantity] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'quantity' | 'acquired'>('acquired');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

  // 数据处理
  const userItems = inventoryData?.data?.items || [];
  const statistics = inventoryData?.data?.statistics || {};

  // 分类过滤
  const filteredItems = userItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.item_template.category === selectedCategory;
  });

  // 排序
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.item_template.name.localeCompare(b.item_template.name);
      case 'rarity':
        return b.item_template.rarity - a.item_template.rarity;
      case 'quantity':
        return b.quantity - a.quantity;
      case 'acquired':
        return new Date(b.acquired_at).getTime() - new Date(a.acquired_at).getTime();
      default:
        return 0;
    }
  });

  // 分类信息
  const categories = [
    { key: 'all', name: '全部', icon: <Category />, count: userItems.length },
    { key: 'materials', name: '材料', icon: <Build />, count: statistics.materials || 0 },
    { key: 'consumables', name: '消耗品', icon: <LocalMall />, count: statistics.consumables || 0 },
    { key: 'equipment', name: '装备', icon: <Diamond />, count: statistics.equipment || 0 },
    { key: 'fragments', name: '碎片', icon: <Science />, count: statistics.fragments || 0 },
    { key: 'currency', name: '货币', icon: <MonetizationOn />, count: statistics.currency || 0 },
    { key: 'special', name: '特殊', icon: <Star />, count: statistics.special || 0 },
  ];

  // 处理API错误
  useEffect(() => {
    if (inventoryError) {
      dispatch(addNotification({
        type: 'error',
        title: '加载失败',
        message: '无法加载背包数据，请检查网络连接',
        duration: 5000,
      }));
    }
  }, [inventoryError, dispatch]);

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

  // 选择物品
  const handleSelectItem = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // 全选/全不选
  const handleSelectAll = () => {
    if (selectedItems.length === sortedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sortedItems.map(item => item.id));
    }
  };

  // 使用物品
  const handleUseItem = async () => {
    if (!selectedItem) return;

    try {
      await useItem({
        id: selectedItem.id,
        quantity: useQuantity
      }).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: '使用成功',
        message: `成功使用 ${selectedItem.item_template.name} x${useQuantity}`,
        duration: 3000,
      }));

      setUseDialogOpen(false);
      setSelectedItem(null);
      setUseQuantity(1);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: '使用失败',
        message: '使用物品时出现错误',
        duration: 3000,
      }));
    }
  };

  // 锁定/解锁物品
  const handleToggleLock = async (item: UserItem) => {
    try {
      await toggleLock({
        id: item.id,
        is_locked: !item.is_locked
      }).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: item.is_locked ? '解锁成功' : '锁定成功',
        message: `${item.item_template.name} 已${item.is_locked ? '解锁' : '锁定'}`,
        duration: 2000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: '操作失败',
        message: '切换锁定状态失败',
        duration: 3000,
      }));
    }
  };

  // 批量售卖
  const handleSellItems = async () => {
    if (selectedItems.length === 0) return;

    const itemsToSell = sortedItems
      .filter(item => selectedItems.includes(item.id) && !item.is_locked)
      .map(item => ({
        id: item.id,
        quantity: item.quantity
      }));

    if (itemsToSell.length === 0) {
      dispatch(addNotification({
        type: 'warning',
        title: '无法售卖',
        message: '所选物品都已锁定或无法售卖',
        duration: 3000,
      }));
      return;
    }

    try {
      const result = await sellItems(itemsToSell).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: '售卖成功',
        message: `成功售卖 ${result.data.total_items} 种物品，获得 ${result.data.total_value} 金币`,
        duration: 3000,
      }));

      setSelectedItems([]);
      setSellDialogOpen(false);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: '售卖失败',
        message: '售卖物品时出现错误',
        duration: 3000,
      }));
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          加载背包数据中...
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
                背包 🎒
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                管理你的物品和装备 • 总计 {userItems.length} 项物品
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <IconButton
                color="inherit"
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              >
                <FilterList />
              </IconButton>
              
              {selectedItems.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Sell />}
                    onClick={() => setSellDialogOpen(true)}
                    disabled={selling}
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    售卖 ({selectedItems.length})
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        <Grid container spacing={3}>
          {/* 左侧 - 分类导航 */}
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)', mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  分类
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

            {/* 批量操作 */}
            {sortedItems.length > 0 && (
              <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    批量操作
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedItems.length === sortedItems.length}
                          indeterminate={selectedItems.length > 0 && selectedItems.length < sortedItems.length}
                          onChange={handleSelectAll}
                          sx={{ color: '#ff6b35' }}
                        />
                      }
                      label="全选"
                      sx={{ color: 'white' }}
                    />
                    
                    {selectedItems.length > 0 && (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        已选择 {selectedItems.length} 项物品
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* 右侧 - 物品列表 */}
          <Grid item xs={12} md={9}>
            <Card sx={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    {categories.find(c => c.key === selectedCategory)?.name || '全部物品'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    显示 {sortedItems.length} 项物品
                  </Typography>
                </Box>

                {sortedItems.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h4" sx={{ mb: 2 }}>📦</Typography>
                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                      暂无物品
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {selectedCategory === 'all' ? '背包是空的' : '此分类下暂无物品'}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    <AnimatePresence>
                      {sortedItems.map((item, index) => (
                        <Grid item xs={6} sm={4} md={3} key={item.id}>
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
                                border: selectedItems.includes(item.id) ? '2px solid #ff6b35' : '2px solid transparent',
                                background: selectedItems.includes(item.id) 
                                  ? 'linear-gradient(45deg, rgba(255,107,53,0.2), rgba(249,202,36,0.2))'
                                  : 'rgba(255,255,255,0.05)',
                                '&:hover': {
                                  background: 'rgba(255,255,255,0.1)',
                                },
                                position: 'relative',
                                minHeight: 180
                              }}
                              onClick={() => handleSelectItem(item.id)}
                            >
                              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                {/* 锁定状态 */}
                                {item.is_locked && (
                                  <Lock 
                                    sx={{ 
                                      position: 'absolute', 
                                      top: 8, 
                                      right: 8, 
                                      color: '#f44336',
                                      fontSize: '1rem'
                                    }} 
                                  />
                                )}

                                {/* 物品图标/头像 */}
                                <Box sx={{ 
                                  width: 64, 
                                  height: 64, 
                                  mx: 'auto', 
                                  mb: 1,
                                  backgroundColor: getQualityColor(item.item_template.rarity),
                                  borderRadius: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.8rem',
                                  position: 'relative'
                                }}>
                                  {/* 这里可以放物品图标 */}
                                  📦
                                  
                                  {/* 数量显示 */}
                                  {item.quantity > 1 && (
                                    <Chip 
                                      label={item.quantity}
                                      size="small"
                                      sx={{ 
                                        position: 'absolute',
                                        bottom: -8,
                                        right: -8,
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        height: 20,
                                        '& .MuiChip-label': { px: 1 }
                                      }}
                                    />
                                  )}
                                </Box>
                                
                                {/* 物品名称 */}
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    color: 'white', 
                                    fontWeight: 'bold',
                                    mb: 0.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {item.item_template.name}
                                </Typography>
                                
                                {/* 品质显示 */}
                                <Chip 
                                  label={getQualityName(item.item_template.rarity)}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: getQualityColor(item.item_template.rarity), 
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    mb: 1
                                  }}
                                />

                                {/* 操作按钮 */}
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                  {item.item_template.is_usable && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<PlayArrow />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItem(item);
                                        setUseQuantity(1);
                                        setUseDialogOpen(true);
                                      }}
                                      sx={{ 
                                        color: '#4caf50', 
                                        borderColor: '#4caf50',
                                        fontSize: '0.7rem',
                                        minWidth: 'auto',
                                        flex: 1
                                      }}
                                    >
                                      使用
                                    </Button>
                                  )}
                                  
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleLock(item);
                                    }}
                                    sx={{ color: item.is_locked ? '#f44336' : 'rgba(255,255,255,0.7)' }}
                                  >
                                    {item.is_locked ? <Lock /> : <LockOpen />}
                                  </IconButton>
                                </Stack>
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
          <MenuItem onClick={() => { setSortBy('acquired'); setFilterMenuAnchor(null); }}>
            <ListItemText>按获得时间排序</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('name'); setFilterMenuAnchor(null); }}>
            <ListItemText>按名称排序</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('rarity'); setFilterMenuAnchor(null); }}>
            <ListItemText>按品质排序</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('quantity'); setFilterMenuAnchor(null); }}>
            <ListItemText>按数量排序</ListItemText>
          </MenuItem>
        </Menu>

        {/* 使用物品对话框 */}
        <Dialog 
          open={useDialogOpen} 
          onClose={() => setUseDialogOpen(false)}
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              color: 'white'
            }
          }}
        >
          <DialogTitle>使用物品</DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {selectedItem.item_template.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                  {selectedItem.item_template.description}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  拥有数量: {selectedItem.quantity}
                </Typography>
                
                {/* 使用数量选择器 */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setUseQuantity(Math.max(1, useQuantity - 1))}
                    disabled={useQuantity <= 1}
                  >
                    -
                  </Button>
                  <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                    {useQuantity}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => setUseQuantity(Math.min(selectedItem.quantity, useQuantity + 1))}
                    disabled={useQuantity >= selectedItem.quantity}
                  >
                    +
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUseDialogOpen(false)} sx={{ color: 'gray' }}>
              取消
            </Button>
            <Button 
              onClick={handleUseItem} 
              variant="contained"
              disabled={using}
              sx={{ 
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                '&:hover': { background: 'linear-gradient(45deg, #66bb6a, #4caf50)' }
              }}
            >
              {using ? '使用中...' : '确认使用'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 售卖确认对话框 */}
        <Dialog 
          open={sellDialogOpen} 
          onClose={() => setSellDialogOpen(false)}
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              color: 'white'
            }
          }}
        >
          <DialogTitle>批量售卖</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              确认售卖选中的 {selectedItems.length} 项物品？
            </Typography>
            <Typography variant="body2" sx={{ color: '#f44336' }}>
              注意：已锁定的物品不会被售卖
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSellDialogOpen(false)} sx={{ color: 'gray' }}>
              取消
            </Button>
            <Button 
              onClick={handleSellItems} 
              variant="contained"
              disabled={selling}
              sx={{ 
                background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                '&:hover': { background: 'linear-gradient(45deg, #ffb74d, #ff9800)' }
              }}
            >
              {selling ? '售卖中...' : '确认售卖'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default InventoryPageMUI;