import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  IconButton,
  Typography,
  Drawer,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  Slider,
  Stack,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  MyLocation as MyLocationIcon,
  Close as CloseIcon,
  Castle as CastleIcon,
  Person as PersonIcon,
  SportsEsports as BattleIcon,
  Inventory as InventoryIcon,
  AutoAwesome as SummonIcon,
  Shield as FormationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetMapDataQuery, useAttackCityMutation, useDefendCityMutation, useCollectResourcesMutation, useUpgradeCityMutation } from '../store/slices/apiSlice';
import { motion } from 'framer-motion';

interface MapCity {
  id: string;
  name: string;
  x: number;
  y: number;
  level: number;
  type: 'main' | 'npc' | 'resource';
  faction?: string;
  owner?: {
    id: string;
    username: string;
  };
  isMainCity: boolean;
}

interface MapConfig {
  width: number;
  height: number;
  terrainTypes: Record<string, any>;
  regions: Record<string, any>;
}

const GameMapPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 地图状态
  const [viewport, setViewport] = useState({
    x: 500,
    y: 500,
    zoom: 1,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedCity, setSelectedCity] = useState<MapCity | null>(null);
  const [battleLoading, setBattleLoading] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([]);
  
  // 获取地图数据
  const { data: mapData, isLoading, refetch } = useGetMapDataQuery({
    center_x: viewport.x,
    center_y: viewport.y,
    radius: Math.floor(150 / viewport.zoom),
  });

  // 攻城和防守 mutations
  const [attackCity] = useAttackCityMutation();
  const [defendCity] = useDefendCityMutation();
  const [collectResources] = useCollectResourcesMutation();
  const [upgradeCity] = useUpgradeCityMutation();

  // 绘制地图
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !mapData?.data) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    const gridSize = 50 * viewport.zoom;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // 绘制区域
    const regions = mapData.data.mapConfig.regions;
    Object.entries(regions).forEach(([key, region]: [string, any]) => {
      const regionColors: Record<string, string> = {
        north: 'rgba(66, 165, 245, 0.1)',    // 蓝色 - 魏
        southwest: 'rgba(76, 175, 80, 0.1)',  // 绿色 - 蜀
        southeast: 'rgba(255, 152, 0, 0.1)',  // 橙色 - 吴
        central: 'rgba(158, 158, 158, 0.1)', // 灰色 - 中原
      };
      
      ctx.fillStyle = regionColors[key] || 'rgba(255, 255, 255, 0.05)';
      const coords = region.coordinates;
      const x = (coords.min_x - viewport.x + canvas.width / 2 / viewport.zoom) * viewport.zoom;
      const y = (coords.min_y - viewport.y + canvas.height / 2 / viewport.zoom) * viewport.zoom;
      const width = (coords.max_x - coords.min_x) * viewport.zoom;
      const height = (coords.max_y - coords.min_y) * viewport.zoom;
      
      ctx.fillRect(x, y, width, height);
    });
    
    // 绘制城池
    mapData.data.cities.forEach((city: MapCity) => {
      const x = (city.x - viewport.x + canvas.width / 2 / viewport.zoom) * viewport.zoom;
      const y = (city.y - viewport.y + canvas.height / 2 / viewport.zoom) * viewport.zoom;
      
      // 城池图标
      ctx.save();
      ctx.translate(x, y);
      
      // 根据城池类型绘制不同样式
      const citySize = (10 + city.level * 2) * viewport.zoom;
      
      // 阵营颜色
      const factionColors: Record<string, string> = {
        wei: '#42A5F5',
        shu: '#4CAF50',
        wu: '#FF9800',
        neutral: '#9E9E9E',
      };
      
      ctx.fillStyle = factionColors[city.faction || 'neutral'];
      ctx.strokeStyle = city.isMainCity ? '#FFD700' : '#fff';
      ctx.lineWidth = city.isMainCity ? 3 : 2;
      
      // 绘制城池形状
      if (city.type === 'main') {
        // 主城 - 星形
        drawStar(ctx, 0, 0, citySize, citySize * 0.5, 5);
      } else {
        // 其他城池 - 圆形
        ctx.beginPath();
        ctx.arc(0, 0, citySize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      // 绘制城池名称
      if (viewport.zoom > 0.8) {
        ctx.fillStyle = '#fff';
        ctx.font = `${12 * viewport.zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(city.name, 0, citySize + 5);
      }
      
      ctx.restore();
    });
    
    // 绘制历史名城
    mapData.data.historicalCities?.forEach((city: any) => {
      const x = (city.x - viewport.x + canvas.width / 2 / viewport.zoom) * viewport.zoom;
      const y = (city.y - viewport.y + canvas.height / 2 / viewport.zoom) * viewport.zoom;
      
      ctx.save();
      ctx.translate(x, y);
      
      // 历史名城用特殊标记
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      
      const size = (15 + city.importance * 3) * viewport.zoom;
      drawStar(ctx, 0, 0, size, size * 0.5, 6);
      
      // 名称
      if (viewport.zoom > 0.6) {
        ctx.fillStyle = '#FFD700';
        ctx.font = `bold ${14 * viewport.zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(city.name, 0, size + 5);
        ctx.fillText(city.name, 0, size + 5);
      }
      
      ctx.restore();
    });
  }, [mapData, viewport]);

  // 绘制星形
  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    outerRadius: number,
    innerRadius: number,
    points: number
  ) => {
    let angle = -Math.PI / 2;
    const step = Math.PI / points;
    
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      angle += step;
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // 处理鼠标/触摸事件
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const dx = (clientX - dragStart.x) / viewport.zoom;
    const dy = (clientY - dragStart.y) / viewport.zoom;
    
    setViewport(prev => ({
      ...prev,
      x: Math.max(0, Math.min(1000, prev.x - dx)),
      y: Math.max(0, Math.min(1000, prev.y - dy)),
    }));
    
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !mapData?.data) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 转换为地图坐标
    const mapX = viewport.x + (x - canvas.width / 2) / viewport.zoom;
    const mapY = viewport.y + (y - canvas.height / 2) / viewport.zoom;
    
    // 查找点击的城池
    const clickedCity = mapData.data.cities.find((city: MapCity) => {
      const distance = Math.sqrt(
        Math.pow(city.x - mapX, 2) + Math.pow(city.y - mapY, 2)
      );
      return distance < 15 / viewport.zoom;
    });
    
    if (clickedCity) {
      setSelectedCity(clickedCity);
    }
  };

  // 缩放控制
  const handleZoom = (delta: number) => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(3, prev.zoom + delta)),
    }));
  };

  // 定位到主城
  const handleLocateMainCity = () => {
    const mainCity = mapData?.data.cities.find(
      (city: MapCity) => city.isMainCity && city.owner?.id === localStorage.getItem('userId')
    );
    
    if (mainCity) {
      setViewport({
        x: mainCity.x,
        y: mainCity.y,
        zoom: 1.5,
      });
    }
  };

  // 更新画布大小
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawMap();
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [drawMap]);

  // 绘制地图
  useEffect(() => {
    drawMap();
  }, [drawMap]);

  // WebSocket连接和实时更新
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = `ws://localhost:1337/?token=${token}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('🔗 WebSocket连接已建立');
      setWs(websocket);
      
      // 认证
      websocket.send(JSON.stringify({
        type: 'authenticate',
        data: { userId: localStorage.getItem('userId') || 'anonymous' }
      }));
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('WebSocket消息解析失败:', error);
      }
    };

    websocket.onclose = () => {
      console.log('🔌 WebSocket连接已关闭');
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  // 处理WebSocket消息
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'connected':
        console.log('✅ WebSocket已连接:', message.data);
        break;
      case 'authenticated':
        console.log('✅ WebSocket认证成功:', message.data);
        // 加入地图房间
        if (ws) {
          ws.send(JSON.stringify({
            type: 'join_map_room',
            data: {
              center_x: viewport.x,
              center_y: viewport.y,
              radius: Math.floor(150 / viewport.zoom)
            }
          }));
        }
        break;
      case 'map_update':
        console.log('🗺️ 收到地图更新:', message.data);
        handleMapUpdate(message.data);
        break;
      case 'battle_update':
        console.log('⚔️ 收到战斗更新:', message.data);
        handleBattleUpdate(message.data);
        break;
      default:
        console.log('📨 收到WebSocket消息:', message);
    }
  };

  // 处理地图更新
  const handleMapUpdate = (updateData: any) => {
    setRealTimeUpdates(prev => [...prev, updateData]);
    
    // 根据更新类型显示通知
    switch (updateData.updateType) {
      case 'city_captured':
        alert(`城池易主！${updateData.newOwner} 占领了 ${updateData.oldOwner} 的城池`);
        break;
      case 'city_upgraded':
        alert(`城池升级！等级提升至 ${updateData.newLevel}`);
        break;
    }
    
    // 刷新地图数据
    refetch();
  };

  // 处理战斗更新
  const handleBattleUpdate = (updateData: any) => {
    const { result, attacker_city, defender_city } = updateData;
    const resultText = result === 'victory' ? '胜利' : '失败';
    
    alert(`战斗结果：${attacker_city.owner} 攻击 ${defender_city.owner} ${resultText}！`);
    
    // 刷新地图数据以显示最新状态
    refetch();
  };

  // 数据更新时刷新
  useEffect(() => {
    if (mapData) {
      refetch();
    }
  }, [viewport.x, viewport.y, viewport.zoom]);

  // 视口变化时更新WebSocket房间
  useEffect(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'join_map_room',
        data: {
          center_x: viewport.x,
          center_y: viewport.y,
          radius: Math.floor(150 / viewport.zoom)
        }
      }));
    }
  }, [viewport.x, viewport.y, viewport.zoom, ws]);

  // 快捷导航操作
  const quickActions = [
    {
      icon: <PersonIcon />,
      name: '武将',
      action: () => navigate('/heroes'),
    },
    {
      icon: <SummonIcon />,
      name: '召唤',
      action: () => navigate('/summon'),
    },
    {
      icon: <FormationIcon />,
      name: '阵容',
      action: () => navigate('/formation'),
    },
    {
      icon: <BattleIcon />,
      name: '战斗',
      action: () => navigate('/battle'),
    },
    {
      icon: <InventoryIcon />,
      name: '背包',
      action: () => navigate('/inventory'),
    },
  ];

  // 攻击城池
  const handleAttackCity = async (cityId: string) => {
    if (!selectedCity) return;
    
    setBattleLoading(true);
    try {
      // 这里应该从用户的阵容中获取，暂时使用模拟数据
      const mockFormation = {
        heroes: [
          { id: '1', level: 10, attack: 100 },
          { id: '2', level: 8, attack: 80 },
        ]
      };
      
      const result = await attackCity({
        targetCityId: cityId,
        formation: mockFormation,
        battleType: 'normal'
      }).unwrap();
      
      alert(`攻城${result.data.result === 'victory' ? '成功' : '失败'}！\n攻击力: ${result.data.attackPower}\n防御力: ${result.data.defensePower}\n获得经验: ${result.data.experience}`);
      
      // 刷新地图数据
      refetch();
      setSelectedCity(null);
      
    } catch (error: any) {
      alert(error?.data?.error?.message || '攻城失败');
    } finally {
      setBattleLoading(false);
    }
  };

  // 防守城池
  const handleDefendCity = async (cityId: string) => {
    setBattleLoading(true);
    try {
      const reinforcements = 50; // 默认增援50部队
      
      const result = await defendCity({
        cityId: cityId,
        reinforcements: reinforcements
      }).unwrap();
      
      alert(`防守加强成功！\n新防御值: ${result.data.newDefenseValue}\n新驻军: ${result.data.newGarrisonStrength}`);
      
      // 刷新地图数据
      refetch();
      setSelectedCity(null);
      
    } catch (error: any) {
      alert(error?.data?.error?.message || '防守失败');
    } finally {
      setBattleLoading(false);
    }
  };

  // 采集资源
  const handleCollectResources = async (cityId: string) => {
    if (!selectedCity) return;
    
    setBattleLoading(true);
    try {
      const result = await collectResources({ cityId }).unwrap();
      
      const resources = result.data.resources;
      alert(`资源采集成功！\n金币: +${resources.gold}\n粮食: +${resources.food}\n铁矿: +${resources.iron}\n木材: +${resources.wood}`);
      
      // 刷新地图数据
      refetch();
      setSelectedCity(null);
      
    } catch (error: any) {
      alert(error?.data?.error?.message || '资源采集失败');
    } finally {
      setBattleLoading(false);
    }
  };

  // 升级城池
  const handleUpgradeCity = async (cityId: string, upgradeType: string = 'level') => {
    if (!selectedCity) return;
    
    setBattleLoading(true);
    try {
      const result = await upgradeCity({ cityId, upgradeType }).unwrap();
      
      alert(`城池升级成功！\n新等级: ${result.data.newLevel}\n升级类型: ${result.data.upgradeType}\n获得经验: ${result.data.experience}`);
      
      // 刷新地图数据
      refetch();
      setSelectedCity(null);
      
    } catch (error: any) {
      alert(error?.data?.error?.message || '城池升级失败');
    } finally {
      setBattleLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ bgcolor: '#1a1a2e' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            三国大地图
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            返回主页
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* 地图画布 */}
        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            height: '100%',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{ display: 'block' }}
          />
        </Box>

        {/* 控制面板 */}
        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <IconButton onClick={() => handleZoom(0.2)}>
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={() => handleZoom(-0.2)}>
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={handleLocateMainCity}>
            <MyLocationIcon />
          </IconButton>
        </Paper>

        {/* 坐标信息 */}
        <Paper
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            p: 1,
          }}
        >
          <Typography variant="caption">
            坐标: ({Math.round(viewport.x)}, {Math.round(viewport.y)}) | 缩放: {(viewport.zoom * 100).toFixed(0)}%
          </Typography>
        </Paper>

        {/* 加载状态 */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* 快捷导航 */}
        <SpeedDial
          ariaLabel="快捷导航"
          sx={{
            position: 'absolute',
            bottom: 80,
            right: 16,
          }}
          icon={<SpeedDialIcon />}
        >
          {quickActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
            />
          ))}
        </SpeedDial>

        {/* 城池详情抽屉 */}
        <Drawer
          anchor="bottom"
          open={!!selectedCity}
          onClose={() => setSelectedCity(null)}
          sx={{
            '& .MuiDrawer-paper': {
              maxHeight: '50vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          {selectedCity && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">{selectedCity.name}</Typography>
                <IconButton onClick={() => setSelectedCity(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CastleIcon />
                      <Typography>
                        等级 {selectedCity.level} {selectedCity.type === 'main' ? '主城' : '城池'}
                      </Typography>
                    </Box>
                    
                    {selectedCity.owner && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          城主
                        </Typography>
                        <Typography>{selectedCity.owner.username}</Typography>
                      </Box>
                    )}
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        坐标
                      </Typography>
                      <Typography>({selectedCity.x}, {selectedCity.y})</Typography>
                    </Box>
                    
                    {selectedCity.faction && (
                      <Chip
                        label={selectedCity.faction}
                        color="primary"
                        size="small"
                      />
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      {selectedCity.owner?.id !== localStorage.getItem('userId') && !selectedCity.isMainCity && (
                        <Button 
                          variant="contained" 
                          color="error" 
                          fullWidth
                          disabled={battleLoading}
                          onClick={() => handleAttackCity(selectedCity.id)}
                        >
                          {battleLoading ? '攻击中...' : '发起攻击'}
                        </Button>
                      )}
                      {selectedCity.owner?.id === localStorage.getItem('userId') && !selectedCity.isMainCity && (
                        <Button 
                          variant="contained" 
                          color="success" 
                          fullWidth
                          disabled={battleLoading}
                          onClick={() => handleDefendCity(selectedCity.id)}
                        >
                          {battleLoading ? '防守中...' : '加强防守'}
                        </Button>
                      )}
                      {selectedCity.type === 'resource' && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          fullWidth
                          disabled={battleLoading}
                          onClick={() => handleCollectResources(selectedCity.id)}
                        >
                          {battleLoading ? '采集中...' : '采集资源'}
                        </Button>
                      )}
                      {selectedCity.owner?.id === localStorage.getItem('userId') && (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={battleLoading}
                            onClick={() => navigate('/city/' + selectedCity.id)}
                            sx={{ mr: 1 }}
                          >
                            管理城池
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            disabled={battleLoading}
                            onClick={() => handleCollectResources(selectedCity.id)}
                            sx={{ mr: 1 }}
                          >
                            {battleLoading ? '采集中...' : '采集资源'}
                          </Button>
                          <Button
                            variant="outlined"
                            color="warning"
                            disabled={battleLoading}
                            onClick={() => handleUpgradeCity(selectedCity.id, 'level')}
                          >
                            {battleLoading ? '升级中...' : '升级城池'}
                          </Button>
                        </>
                      )}
                      {selectedCity.isMainCity && selectedCity.owner?.id !== localStorage.getItem('userId') && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                          主城无法攻击
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )}
        </Drawer>
      </Box>
    </Box>
  );
};

export default GameMapPage;