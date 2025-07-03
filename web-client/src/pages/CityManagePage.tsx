import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Stack,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Castle as CastleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Build as BuildIcon,
  Security as SecurityIcon,
  Agriculture as AgricultureIcon,
  AccountBalance as AccountBalanceIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetUserCityQuery, useGetCityDevelopmentQuery, useUpdateUserCityMutation } from '../store/slices/apiSlice';

const CityManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { cityId } = useParams<{ cityId: string }>();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedUpgradeType, setSelectedUpgradeType] = useState<string>('');

  // 获取城池数据
  const { data: cityData, isLoading: cityLoading, refetch: refetchCity } = useGetUserCityQuery(cityId || '');
  const { data: developmentData, isLoading: devLoading, refetch: refetchDevelopment } = useGetCityDevelopmentQuery(cityId || '');
  const [updateCity] = useUpdateUserCityMutation();

  const city = cityData?.data;
  const development = developmentData?.data;

  // 如果没有提供cityId，返回主城管理
  useEffect(() => {
    if (!cityId) {
      // 可以在这里获取用户的主城ID
      console.log('没有指定城池ID，应该跳转到主城');
    }
  }, [cityId]);

  const handleUpgrade = async (upgradeType: string) => {
    try {
      const response = await fetch(`/api/map/cities/${cityId}/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ upgradeType })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`升级成功！新等级: ${result.data.newLevel}`);
        refetchCity();
        refetchDevelopment();
        setUpgradeDialogOpen(false);
      } else {
        alert('升级失败');
      }
    } catch (error) {
      console.error('升级错误:', error);
      alert('升级失败');
    }
  };

  const handleCollectResources = async () => {
    try {
      const response = await fetch(`/api/map/cities/${cityId}/collect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const resources = result.data.resources;
        alert(`资源采集成功！\\n金币: +${resources.gold}\\n粮食: +${resources.food}\\n铁矿: +${resources.iron}\\n木材: +${resources.wood}`);
        refetchCity();
        refetchDevelopment();
      } else {
        alert('资源采集失败');
      }
    } catch (error) {
      console.error('资源采集错误:', error);
      alert('资源采集失败');
    }
  };

  const upgradeOptions = [
    {
      type: 'level',
      title: '城池等级',
      description: '提升城池整体发展水平',
      icon: <CastleIcon />,
      color: 'primary' as const
    },
    {
      type: 'defense',
      title: '防御设施',
      description: '增强城池防御能力',
      icon: <SecurityIcon />,
      color: 'error' as const
    },
    {
      type: 'economy',
      title: '经济发展',
      description: '提升资源产出效率',
      icon: <TrendingUpIcon />,
      color: 'success' as const
    },
    {
      type: 'military',
      title: '军事建设',
      description: '扩大军队规模和战斗力',
      icon: <GroupIcon />,
      color: 'warning' as const
    }
  ];

  if (cityLoading || devLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!city) {
    return (
      <Container>
        <Alert severity="error">城池数据加载失败</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
      <AppBar position="static" sx={{ bgcolor: '#1a1a2e' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/map')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            城池管理 - {city.city?.name || `${city.user?.username}的主城`}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 城池基本信息 */}
          <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CastleIcon sx={{ mr: 1, color: '#ff6b35' }} />
                    <Typography variant="h5" sx={{ color: 'white' }}>
                      {city.city?.name || `${city.user?.username}的主城`}
                    </Typography>
                    {city.is_main_city && (
                      <Chip 
                        label="主城" 
                        color="warning" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Box>
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1, color: '#999' }} />
                      <Typography color="text.secondary">
                        坐标: ({city.coordinate_x}, {city.coordinate_y})
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 1, color: '#999' }} />
                      <Typography color="text.secondary">
                        等级: {city.city_level} | 发展度: {city.development_level}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalanceIcon sx={{ mr: 1, color: '#999' }} />
                      <Typography color="text.secondary">
                        繁荣度: {city.current_prosperity}/100
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                    城池状态
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      防御值: {city.defense_value}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(city.defense_value || 0) / 10} 
                      sx={{ mt: 0.5 }}
                      color="error"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      驻军: {city.garrison_strength}/{city.max_garrison}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={((city.garrison_strength || 0) / (city.max_garrison || 1)) * 100} 
                      sx={{ mt: 0.5 }}
                      color="warning"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      繁荣度: {city.current_prosperity}/100
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={city.current_prosperity || 0} 
                      sx={{ mt: 0.5 }}
                      color="success"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* 资源状况 */}
          {city.stored_resources && (
            <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                  <AgricultureIcon sx={{ mr: 1, color: '#ff6b35' }} />
                  资源储备
                </Typography>
                
                <Grid container spacing={2}>
                  {Object.entries(city.stored_resources).map(([resource, amount]) => (
                    <Grid item xs={6} sm={3} key={resource}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#ff6b35' }}>
                          {amount as number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {resource === 'gold' ? '金币' : 
                           resource === 'food' ? '粮食' :
                           resource === 'iron' ? '铁矿' : '木材'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleCollectResources}
                    startIcon={<AgricultureIcon />}
                  >
                    采集资源
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* 发展信息 */}
          {development && (
            <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ mr: 1, color: '#ff6b35' }} />
                  发展详情
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                      军事
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      防御值: {development.military.defenseValue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      军备度: {Math.round(development.military.readiness * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      改进次数: {development.military.improvements}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                      经济
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      繁荣度: {development.economy.prosperity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      效率: {development.economy.efficiency}x
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                      行政
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      公共秩序: {development.administration.publicOrder}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      行政效率: {Math.round(development.administration.efficiency * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      治理评分: {development.administration.governanceScore}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                      基础
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      等级: {development.basic.level}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      经验: {development.basic.experience}/{development.basic.nextLevelExp}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(development.basic.experience / development.basic.nextLevelExp) * 100} 
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* 升级选项 */}
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                <BuildIcon sx={{ mr: 1, color: '#ff6b35' }} />
                城池发展
              </Typography>
              
              <Grid container spacing={2}>
                {upgradeOptions.map((option) => (
                  <Grid item xs={12} sm={6} md={3} key={option.type}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color={option.color}
                      startIcon={option.icon}
                      onClick={() => {
                        setSelectedUpgradeType(option.type);
                        setUpgradeDialogOpen(true);
                      }}
                      sx={{ 
                        height: 80, 
                        flexDirection: 'column',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {option.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* 升级确认对话框 */}
          <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)}>
            <DialogTitle>确认升级</DialogTitle>
            <DialogContent>
              <Typography>
                确定要升级{upgradeOptions.find(opt => opt.type === selectedUpgradeType)?.title}吗？
              </Typography>
              {development?.upgradeCosts?.[selectedUpgradeType] && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>升级成本:</Typography>
                  {Object.entries(development.upgradeCosts[selectedUpgradeType]).map(([resource, cost]) => (
                    <Typography key={resource} variant="body2">
                      {resource === 'gold' ? '金币' : 
                       resource === 'food' ? '粮食' :
                       resource === 'iron' ? '铁矿' : '木材'}: {cost as number}
                    </Typography>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUpgradeDialogOpen(false)}>取消</Button>
              <Button onClick={() => handleUpgrade(selectedUpgradeType)} variant="contained">
                确认升级
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CityManagePage;