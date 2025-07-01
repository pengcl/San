import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  Box,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Construction,
  Timer,
  TrendingUp,
  Security,
  Science,
  Forest,
  AttachMoney,
  Terrain,
  Hardware,
  Restaurant,
  Check,
  Lock
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useAnalytics } from '../../hooks/useAnalytics';
import CountdownTimer from '../../components/ui/CountdownTimer';

interface Building {
  id: string;
  name: string;
  type: 'military' | 'resource' | 'research' | 'defensive' | 'special';
  level: number;
  maxLevel: number;
  description: string;
  icon: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  upgradeCost: {
    gold: number;
    wood: number;
    stone: number;
    iron: number;
  };
  upgradeTime: number; // 秒
  isUpgrading: boolean;
  upgradeStartTime?: number;
  production?: {
    resource: 'gold' | 'wood' | 'stone' | 'iron' | 'food';
    amount: number;
    interval: number; // 秒
  };
  capacity?: number;
  benefits: string[];
  requirements?: {
    buildings: { id: string; level: number }[];
    playerLevel: number;
  };
}

interface Resource {
  gold: number;
  wood: number;
  stone: number;
  iron: number;
  food: number;
}

const BuildingManagementPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { trackGameEvent } = useAnalytics();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [resources, setResources] = useState<Resource>({
    gold: 10000,
    wood: 5000,
    stone: 3000,
    iron: 2000,
    food: 8000,
  });
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [playerLevel] = useState(25);

  useEffect(() => {
    trackGameEvent('building_management_view');
    initializeBuildings();
    
    // 定时更新升级进度
    const interval = setInterval(updateUpgradeProgress, 1000);
    return () => clearInterval(interval);
  }, [trackGameEvent]);

  const initializeBuildings = () => {
    const mockBuildings: Building[] = [
      {
        id: 'city_hall',
        name: '城主府',
        type: 'special',
        level: 5,
        maxLevel: 20,
        description: '城市的核心建筑，提升城市整体等级',
        icon: '🏛️',
        position: { x: 40, y: 30 },
        size: { width: 20, height: 16 },
        upgradeCost: { gold: 5000, wood: 2000, stone: 3000, iron: 1000 },
        upgradeTime: 3600,
        isUpgrading: false,
        benefits: ['提升城市容量', '解锁新建筑', '增加资源上限'],
        requirements: { buildings: [], playerLevel: 1 },
      },
      {
        id: 'barracks',
        name: '兵营',
        type: 'military',
        level: 3,
        maxLevel: 15,
        description: '训练和管理军队的设施',
        icon: '⚔️',
        position: { x: 15, y: 50 },
        size: { width: 16, height: 12 },
        upgradeCost: { gold: 2000, wood: 1500, stone: 1000, iron: 800 },
        upgradeTime: 1800,
        isUpgrading: true,
        upgradeStartTime: Date.now() - 600000, // 已升级10分钟
        capacity: 50,
        benefits: ['增加军队容量', '提升训练效率', '解锁高级兵种'],
        requirements: { buildings: [{ id: 'city_hall', level: 2 }], playerLevel: 5 },
      },
      {
        id: 'lumber_mill',
        name: '伐木场',
        type: 'resource',
        level: 4,
        maxLevel: 12,
        description: '生产木材的基础设施',
        icon: '🌲',
        position: { x: 70, y: 20 },
        size: { width: 14, height: 14 },
        upgradeCost: { gold: 1000, wood: 500, stone: 800, iron: 300 },
        upgradeTime: 1200,
        isUpgrading: false,
        production: { resource: 'wood', amount: 100, interval: 3600 },
        benefits: ['增加木材产量', '提升收集效率', '解锁高级伐木技术'],
        requirements: { buildings: [], playerLevel: 3 },
      },
      {
        id: 'quarry',
        name: '采石场',
        type: 'resource',
        level: 3,
        maxLevel: 12,
        description: '开采石材的重要设施',
        icon: '⛏️',
        position: { x: 10, y: 20 },
        size: { width: 14, height: 14 },
        upgradeCost: { gold: 1200, wood: 600, stone: 400, iron: 500 },
        upgradeTime: 1500,
        isUpgrading: false,
        production: { resource: 'stone', amount: 80, interval: 3600 },
        benefits: ['增加石材产量', '提升开采效率', '解锁稀有石材'],
        requirements: { buildings: [], playerLevel: 4 },
      },
      {
        id: 'iron_mine',
        name: '铁矿',
        type: 'resource',
        level: 2,
        maxLevel: 10,
        description: '开采铁矿石的专业设施',
        icon: '⚒️',
        position: { x: 70, y: 60 },
        size: { width: 12, height: 12 },
        upgradeCost: { gold: 1500, wood: 800, stone: 1000, iron: 200 },
        upgradeTime: 2000,
        isUpgrading: false,
        production: { resource: 'iron', amount: 60, interval: 3600 },
        benefits: ['增加铁矿产量', '提升冶炼效率', '解锁高级合金'],
        requirements: { buildings: [{ id: 'city_hall', level: 3 }], playerLevel: 6 },
      },
      {
        id: 'academy',
        name: '学院',
        type: 'research',
        level: 2,
        maxLevel: 15,
        description: '研究科技和培养人才的学术机构',
        icon: '📚',
        position: { x: 25, y: 70 },
        size: { width: 18, height: 14 },
        upgradeCost: { gold: 3000, wood: 1000, stone: 2000, iron: 1500 },
        upgradeTime: 2400,
        isUpgrading: false,
        benefits: ['解锁科技研究', '提升英雄经验获取', '增加研究速度'],
        requirements: { buildings: [{ id: 'city_hall', level: 4 }], playerLevel: 10 },
      },
      {
        id: 'wall',
        name: '城墙',
        type: 'defensive',
        level: 3,
        maxLevel: 20,
        description: '保护城市免受攻击的防御工事',
        icon: '🏰',
        position: { x: 50, y: 70 },
        size: { width: 24, height: 8 },
        upgradeCost: { gold: 2500, wood: 1200, stone: 2000, iron: 800 },
        upgradeTime: 1800,
        isUpgrading: false,
        benefits: ['增加城市防御力', '减少攻击损失', '提升驻守效果'],
        requirements: { buildings: [{ id: 'city_hall', level: 3 }], playerLevel: 8 },
      },
    ];

    setBuildings(mockBuildings);
  };

  const updateUpgradeProgress = () => {
    setBuildings(prev => prev.map(building => {
      if (building.isUpgrading && building.upgradeStartTime) {
        const elapsed = Date.now() - building.upgradeStartTime;
        if (elapsed >= building.upgradeTime * 1000) {
          // 升级完成
          dispatch(addNotification({
            type: 'success',
            title: '建筑升级完成',
            message: `${building.name} 已升级至 ${building.level + 1} 级`,
            duration: 5000,
          }));
          
          return {
            ...building,
            level: building.level + 1,
            isUpgrading: false,
            upgradeStartTime: undefined,
          };
        }
      }
      return building;
    }));
  };

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
    trackGameEvent('building_select', { buildingId: building.id, level: building.level });
  };

  const canUpgrade = (building: Building): { canUpgrade: boolean; reason?: string } => {
    if (building.level >= building.maxLevel) {
      return { canUpgrade: false, reason: '已达到最高等级' };
    }
    
    if (building.isUpgrading) {
      return { canUpgrade: false, reason: '正在升级中' };
    }

    // 检查资源是否足够
    const costs = building.upgradeCost;
    if (resources.gold < costs.gold || resources.wood < costs.wood || 
        resources.stone < costs.stone || resources.iron < costs.iron) {
      return { canUpgrade: false, reason: '资源不足' };
    }

    // 检查前置条件
    if (building.requirements) {
      if (playerLevel < building.requirements.playerLevel) {
        return { canUpgrade: false, reason: `需要玩家等级 ${building.requirements.playerLevel}` };
      }

      for (const req of building.requirements.buildings) {
        const reqBuilding = buildings.find(b => b.id === req.id);
        if (!reqBuilding || reqBuilding.level < req.level) {
          return { canUpgrade: false, reason: `需要 ${reqBuilding?.name || req.id} ${req.level} 级` };
        }
      }
    }

    return { canUpgrade: true };
  };

  const startUpgrade = (building: Building) => {
    const { canUpgrade, reason } = canUpgrade(building);
    
    if (!canUpgrade) {
      dispatch(addNotification({
        type: 'error',
        title: '无法升级',
        message: reason || '升级条件不满足',
        duration: 3000,
      }));
      return;
    }

    // 扣除资源
    setResources(prev => ({
      gold: prev.gold - building.upgradeCost.gold,
      wood: prev.wood - building.upgradeCost.wood,
      stone: prev.stone - building.upgradeCost.stone,
      iron: prev.iron - building.upgradeCost.iron,
      food: prev.food,
    }));

    // 开始升级
    setBuildings(prev => prev.map(b => 
      b.id === building.id 
        ? { ...b, isUpgrading: true, upgradeStartTime: Date.now() }
        : b
    ));

    dispatch(addNotification({
      type: 'success',
      title: '开始升级',
      message: `${building.name} 开始升级，预计需要 ${Math.floor(building.upgradeTime / 60)} 分钟`,
      duration: 4000,
    }));

    trackGameEvent('building_upgrade_start', {
      buildingId: building.id,
      fromLevel: building.level,
      toLevel: building.level + 1,
      cost: building.upgradeCost,
    });

    setShowUpgradeDialog(false);
  };

  const getTypeIcon = (type: Building['type']) => {
    switch (type) {
      case 'military': return <Security sx={{ color: '#ef4444' }} />;
      case 'resource': return <Forest sx={{ color: '#10b981' }} />;
      case 'research': return <Science sx={{ color: '#3b82f6' }} />;
      case 'defensive': return <Security sx={{ color: '#f59e0b' }} />;
      case 'special': return <Construction sx={{ color: '#8b5cf6' }} />;
    }
  };

  const getTypeColor = (type: Building['type']) => {
    const colors = {
      military: '#ef4444',
      resource: '#10b981',
      research: '#3b82f6',
      defensive: '#f59e0b',
      special: '#8b5cf6',
    };
    return colors[type];
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'gold': return <AttachMoney sx={{ color: '#fbbf24' }} />;
      case 'wood': return <Forest sx={{ color: '#84cc16' }} />;
      case 'stone': return <Terrain sx={{ color: '#94a3b8' }} />;
      case 'iron': return <Hardware sx={{ color: '#6b7280' }} />;
      case 'food': return <Restaurant sx={{ color: '#f59e0b' }} />;
      default: return null;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时 ${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  const formatResource = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        pb: 3
      }}
    >
      {/* 顶部导航 */}
      <Box
        sx={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                建筑管理
              </Typography>
            </Box>
            
            {/* 资源显示 - 桌面端 */}
            {!isMobile && (
              <Stack direction="row" spacing={2}>
                {Object.entries(resources).map(([resource, amount]) => (
                  <Chip
                    key={resource}
                    icon={getResourceIcon(resource)}
                    label={formatResource(amount)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '& .MuiChip-icon': { color: 'inherit' }
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* 资源显示 - 移动端 */}
        {isMobile && (
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {Object.entries(resources).map(([resource, amount]) => (
              <Grid item xs={2.4} key={resource}>
                <Paper
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {getResourceIcon(resource)}
                  <Typography variant="caption" display="block" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {formatResource(amount)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Grid container spacing={3}>
          {/* 城市布局 */}
          <Grid item xs={12} lg={8}>
            <Card
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                height: '100%'
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  城市布局
                </Typography>
                
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: isMobile ? 400 : 500,
                    bgcolor: 'rgba(0,0,0,0.3)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)'
                  }}
                >
                  {buildings.map((building) => (
                    <motion.div
                      key={building.id}
                      style={{
                        position: 'absolute',
                        left: `${building.position.x}%`,
                        top: `${building.position.y}%`,
                        width: `${building.size.width}%`,
                        height: `${building.size.height}%`,
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Paper
                        onClick={() => handleBuildingClick(building)}
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          bgcolor: selectedBuilding?.id === building.id 
                            ? 'rgba(255, 107, 53, 0.3)' 
                            : `${getTypeColor(building.type)}20`,
                          border: selectedBuilding?.id === building.id
                            ? '2px solid #ff6b35'
                            : `1px solid ${getTypeColor(building.type)}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: `${getTypeColor(building.type)}30`,
                            borderColor: getTypeColor(building.type)
                          }
                        }}
                      >
                        <Typography variant="h4" sx={{ mb: 0.5 }}>
                          {building.icon}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.6rem' : '0.75rem'
                          }}
                        >
                          {building.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Lv.{building.level}
                        </Typography>
                        
                        {/* 升级进度条 */}
                        {building.isUpgrading && building.upgradeStartTime && (
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, ((Date.now() - building.upgradeStartTime) / (building.upgradeTime * 1000)) * 100)}
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 3,
                              bgcolor: 'rgba(0,0,0,0.3)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#3b82f6'
                              }
                            }}
                          />
                        )}
                      </Paper>
                    </motion.div>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 建筑详情 */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                height: '100%'
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  建筑详情
                </Typography>
                
                {selectedBuilding ? (
                  <Stack spacing={3}>
                    {/* 建筑基本信息 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h2">{selectedBuilding.icon}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {selectedBuilding.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            icon={getTypeIcon(selectedBuilding.type)}
                            label={
                              selectedBuilding.type === 'military' ? '军事' :
                              selectedBuilding.type === 'resource' ? '资源' :
                              selectedBuilding.type === 'research' ? '研究' :
                              selectedBuilding.type === 'defensive' ? '防御' : '特殊'
                            }
                            size="small"
                            sx={{
                              bgcolor: `${getTypeColor(selectedBuilding.type)}20`,
                              color: getTypeColor(selectedBuilding.type),
                              '& .MuiChip-icon': { color: 'inherit' }
                            }}
                          />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            等级 {selectedBuilding.level}/{selectedBuilding.maxLevel}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* 建筑描述 */}
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {selectedBuilding.description}
                    </Typography>

                    {/* 升级进度 */}
                    {selectedBuilding.isUpgrading && selectedBuilding.upgradeStartTime && (
                      <Paper sx={{ p: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#3b82f6' }}>
                            升级中...
                          </Typography>
                          <CountdownTimer
                            targetTime={selectedBuilding.upgradeStartTime + (selectedBuilding.upgradeTime * 1000)}
                            onComplete={() => updateUpgradeProgress()}
                            className="text-blue-400"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, ((Date.now() - selectedBuilding.upgradeStartTime) / (selectedBuilding.upgradeTime * 1000)) * 100)}
                          sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: 'rgba(59, 130, 246, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#3b82f6'
                            }
                          }}
                        />
                      </Paper>
                    )}

                    {/* 建筑效果 */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                        建筑效果
                      </Typography>
                      <Stack spacing={0.5}>
                        {selectedBuilding.benefits.map((benefit, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Check sx={{ fontSize: 16, color: '#10b981' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    {/* 生产信息 */}
                    {selectedBuilding.production && (
                      <Paper sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <Typography variant="subtitle2" sx={{ color: '#10b981', mb: 1 }}>
                          资源生产
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getResourceIcon(selectedBuilding.production.resource)}
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            每小时生产 {selectedBuilding.production.amount}
                          </Typography>
                        </Box>
                      </Paper>
                    )}

                    {/* 升级信息 */}
                    {selectedBuilding.level < selectedBuilding.maxLevel && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                          升级费用
                        </Typography>
                        <Grid container spacing={1}>
                          {Object.entries(selectedBuilding.upgradeCost).map(([resource, cost]) => (
                            <Grid item xs={6} key={resource}>
                              <Paper
                                sx={{
                                  p: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  bgcolor: resources[resource as keyof Resource] >= cost 
                                    ? 'rgba(16, 185, 129, 0.1)' 
                                    : 'rgba(239, 68, 68, 0.1)',
                                  border: resources[resource as keyof Resource] >= cost
                                    ? '1px solid rgba(16, 185, 129, 0.3)'
                                    : '1px solid rgba(239, 68, 68, 0.3)'
                                }}
                              >
                                {getResourceIcon(resource)}
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: resources[resource as keyof Resource] >= cost ? '#10b981' : '#ef4444',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {cost.toLocaleString()}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                        
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mt: 1 }}>
                          升级时间: {formatTime(selectedBuilding.upgradeTime)}
                        </Typography>

                        <Button
                          variant="contained"
                          fullWidth
                          disabled={!canUpgrade(selectedBuilding).canUpgrade}
                          onClick={() => setShowUpgradeDialog(true)}
                          startIcon={!canUpgrade(selectedBuilding).canUpgrade && <Lock />}
                          sx={{ 
                            mt: 2,
                            bgcolor: '#ff6b35',
                            '&:hover': { bgcolor: '#ff8555' },
                            '&:disabled': {
                              bgcolor: 'rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.3)'
                            }
                          }}
                        >
                          {canUpgrade(selectedBuilding).canUpgrade 
                            ? `升级至 ${selectedBuilding.level + 1} 级` 
                            : canUpgrade(selectedBuilding).reason
                          }
                        </Button>
                      </Box>
                    )}

                    {selectedBuilding.level >= selectedBuilding.maxLevel && (
                      <Alert 
                        severity="info" 
                        sx={{ 
                          bgcolor: 'rgba(251, 191, 36, 0.1)', 
                          color: '#fbbf24',
                          '& .MuiAlert-icon': { color: '#fbbf24' }
                        }}
                      >
                        已达到最高等级
                      </Alert>
                    )}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Construction sx={{ fontSize: 64, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      选择一个建筑查看详情
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* 升级确认对话框 */}
      <Dialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        {selectedBuilding && (
          <>
            <DialogTitle sx={{ color: 'white' }}>确认升级</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h2">{selectedBuilding.icon}</Typography>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {selectedBuilding.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {selectedBuilding.level} 级 → {selectedBuilding.level + 1} 级
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                    升级费用
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(selectedBuilding.upgradeCost).map(([resource, cost]) => (
                      <Grid item xs={6} key={resource}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getResourceIcon(resource)}
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {cost.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  升级时间: {formatTime(selectedBuilding.upgradeTime)}
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setShowUpgradeDialog(false)}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                取消
              </Button>
              <Button
                variant="contained"
                onClick={() => startUpgrade(selectedBuilding)}
                sx={{
                  bgcolor: '#ff6b35',
                  '&:hover': { bgcolor: '#ff8555' }
                }}
              >
                确认升级
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default BuildingManagementPageMUI;