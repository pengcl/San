import React, { useEffect, useState, useRef } from 'react';
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
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Alert,
  Stack
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
  Layers as LayersIcon,
  Terrain as TerrainIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/three-kingdoms-map.css';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapCity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  level: number;
  type: 'capital' | 'major' | 'strategic' | 'resource';
  kingdom: string;
  owner?: {
    id: string;
    username: string;
  };
  isMainCity: boolean;
  importance: number;
}

const ThreeKingdomsMapPage: React.FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const [selectedCity, setSelectedCity] = useState<MapCity | null>(null);
  const [mapLayers, setMapLayers] = useState({
    kingdoms: true,
    cities: true,
    terrain: true,
    playerCities: true
  });
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('初始化地理地图...');
  const [debugInfo, setDebugInfo] = useState({
    dataLoaded: {
      kingdoms: false,
      cities: false,
      terrain: false
    },
    mapInitialized: false,
    layersAdded: {
      kingdoms: false,
      cities: false,
      terrain: false
    },
    dataStats: {
      kingdomsCount: 0,
      citiesCount: 0,
      terrainCount: 0
    }
  });
  const [geoData, setGeoData] = useState<any>({
    kingdoms: null,
    cities: null,
    terrain: null
  });

  // 加载GeoJSON数据
  useEffect(() => {
    const loadGeoData = async () => {
      console.log('🗺️ [Geo Map] 开始加载地理数据...');
      setLoadingStatus('加载地理数据...');
      setLoadingProgress(10);
      
      try {
        setLoadingStatus('获取三国领土数据...');
        setLoadingProgress(20);
        const kingdomsRes = await fetch('/data/sanguo-map.json');
        
        if (!kingdomsRes.ok) {
          throw new Error(`加载三国地图失败: ${kingdomsRes.status}`);
        }
        
        const kingdoms = await kingdomsRes.json();
        console.log('✅ [Geo Map] 三国领土数据加载完成');
        setDebugInfo(prev => ({
          ...prev,
          dataLoaded: { ...prev.dataLoaded, kingdoms: true },
          dataStats: { ...prev.dataStats, kingdomsCount: kingdoms.features?.length || 0 }
        }));
        
        setLoadingStatus('获取城池数据...');
        setLoadingProgress(40);
        const citiesRes = await fetch('/data/sanguo-cities.json');
        
        if (!citiesRes.ok) {
          throw new Error(`加载城池数据失败: ${citiesRes.status}`);
        }
        
        const cities = await citiesRes.json();
        console.log('✅ [Geo Map] 城池数据加载完成');
        setDebugInfo(prev => ({
          ...prev,
          dataLoaded: { ...prev.dataLoaded, cities: true },
          dataStats: { ...prev.dataStats, citiesCount: cities.features?.length || 0 }
        }));
        
        setLoadingStatus('获取地形数据...');
        setLoadingProgress(60);
        const terrainRes = await fetch('/data/sanguo-terrain.json');
        
        if (!terrainRes.ok) {
          throw new Error(`加载地形数据失败: ${terrainRes.status}`);
        }
        
        const terrain = await terrainRes.json();
        console.log('✅ [Geo Map] 地形数据加载完成');
        setDebugInfo(prev => ({
          ...prev,
          dataLoaded: { ...prev.dataLoaded, terrain: true },
          dataStats: { ...prev.dataStats, terrainCount: terrain.features?.length || 0 }
        }));
        
        setLoadingStatus('数据处理完成...');
        setLoadingProgress(80);
        
        setGeoData({ kingdoms, cities, terrain });
        
        setLoadingStatus('准备初始化地图...');
        setLoadingProgress(90);
        
        setTimeout(() => {
          setLoading(false);
          console.log('🎉 [Geo Map] 地理数据加载完成');
        }, 500);
        
      } catch (error) {
        console.error('❌ [Geo Map] 加载地图数据失败:', error);
        setLoadingStatus(`错误: ${error instanceof Error ? error.message : '数据加载失败'}`);
        
        // 即使加载失败也要停止loading，显示错误状态
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    loadGeoData();
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || loading || !geoData.kingdoms) return;

    console.log('🗺️ [Geo Map] 开始初始化Leaflet地图...');
    
    // 创建地图实例
    const map = L.map(mapContainerRef.current, {
      center: [32.0, 112.0], // 中国中部
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });
    console.log('✅ [Geo Map] Leaflet地图实例创建完成');

    // 添加自定义底图样式
    const customTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      opacity: 0.3
    });
    map.addLayer(customTileLayer);
    console.log('✅ [Geo Map] 底图图层添加完成');

    mapRef.current = map;
    setDebugInfo(prev => ({ ...prev, mapInitialized: true }));

    // 添加图层
    console.log('🏛️ [Geo Map] 开始添加三国领土图层...');
    addKingdomLayers(map);
    
    console.log('🏰 [Geo Map] 开始添加城池图层...');
    addCityLayers(map);
    
    console.log('🏔️ [Geo Map] 开始添加地形图层...');
    addTerrainLayers(map);
    
    console.log('🎉 [Geo Map] 所有图层添加完成');

    return () => {
      console.log('🧹 [Geo Map] 清理Leaflet地图...');
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [geoData, loading]);

  // 添加三国领土图层
  const addKingdomLayers = (map: L.Map) => {
    if (!geoData.kingdoms) return;

    const kingdomStyles = {
      wei: { color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.2 },
      shu: { color: '#34A853', fillColor: '#34A853', fillOpacity: 0.2 },
      wu: { color: '#FBBC04', fillColor: '#FBBC04', fillOpacity: 0.2 }
    };

    geoData.kingdoms.features.forEach((feature: any) => {
      const kingdom = feature.properties.kingdom;
      const style = kingdomStyles[kingdom as keyof typeof kingdomStyles];
      
      const layer = L.geoJSON(feature, {
        style: {
          ...style,
          weight: 3,
          opacity: 0.8,
          className: 'kingdom-polygon'
        }
      });

      layer.bindTooltip(`
        <div style="font-family: 'SimHei', sans-serif;">
          <strong>${feature.properties.name}</strong><br/>
          都城: ${feature.properties.capital}
        </div>
      `, { permanent: false, direction: 'top' });

      layer.addTo(map);
    });
    
    setDebugInfo(prev => ({ 
      ...prev, 
      layersAdded: { ...prev.layersAdded, kingdoms: true } 
    }));
    console.log(`✅ [Geo Map] ${geoData.kingdoms.features.length}个三国领土添加完成`);
  };

  // 添加城市图层
  const addCityLayers = (map: L.Map) => {
    if (!geoData.cities) return;

    geoData.cities.features.forEach((feature: any) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;
      
      // 根据城市重要性调整图标大小
      const iconSize = Math.max(20, props.importance * 3);
      
      // 根据阵营选择颜色
      const kingdomColors = {
        wei: '#4285F4',
        shu: '#34A853', 
        wu: '#FBBC04',
        neutral: '#9E9E9E'
      };

      const cityIcon = L.divIcon({
        html: `
          <div style="
            width: ${iconSize}px;
            height: ${iconSize}px;
            background-color: ${kingdomColors[props.kingdom as keyof typeof kingdomColors]};
            border: 2px solid #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${Math.max(8, iconSize/3)}px;
            color: white;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${props.type === 'capital' ? '都' : 
              props.type === 'major' ? '府' : 
              props.type === 'strategic' ? '关' : '城'}
          </div>
        `,
        className: 'custom-city-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize/2, iconSize/2]
      });

      const marker = L.marker([lat, lng], { icon: cityIcon });
      
      marker.bindTooltip(`
        <div style="font-family: 'SimHei', sans-serif; min-width: 150px;">
          <strong style="font-size: 14px;">${props.name}</strong><br/>
          <span style="color: ${kingdomColors[props.kingdom]};">
            ${props.kingdom === 'wei' ? '魏国' : 
              props.kingdom === 'shu' ? '蜀国' : 
              props.kingdom === 'wu' ? '吴国' : '中立'}
          </span><br/>
          <small>${props.description}</small>
        </div>
      `, { 
        permanent: false, 
        direction: 'top',
        offset: [0, -10]
      });

      marker.on('click', () => {
        setSelectedCity({
          id: props.name,
          name: props.name,
          lat: lat,
          lng: lng,
          level: props.importance,
          type: props.type,
          kingdom: props.kingdom,
          isMainCity: props.type === 'capital',
          importance: props.importance
        });
      });

      marker.addTo(map);
    });
    
    setDebugInfo(prev => ({ 
      ...prev, 
      layersAdded: { ...prev.layersAdded, cities: true } 
    }));
    console.log(`✅ [Geo Map] ${geoData.cities.features.length}个城池添加完成`);
  };

  // 添加地形图层
  const addTerrainLayers = (map: L.Map) => {
    if (!geoData.terrain) return;

    geoData.terrain.features.forEach((feature: any) => {
      const props = feature.properties;
      
      if (feature.geometry.type === 'LineString') {
        // 河流和山脉
        const style = props.type === 'river' ? 
          { color: '#1976D2', weight: 4, opacity: 0.8, className: 'river-line' } :
          { color: '#8D6E63', weight: 3, opacity: 0.7, className: 'mountain-line' };
          
        const layer = L.geoJSON(feature, { style });
        
        layer.bindTooltip(`
          <div style="font-family: 'SimHei', sans-serif;">
            <strong>${props.name}</strong><br/>
            <small>${props.description}</small>
          </div>
        `, { permanent: false });
        
        layer.addTo(map);
      } else if (feature.geometry.type === 'Point') {
        // 关隘和山峰
        const [lng, lat] = feature.geometry.coordinates;
        
        const terrainIcon = L.divIcon({
          html: `
            <div data-type="${props.type}" style="
              background-color: ${props.type === 'pass' ? '#FF5722' : '#795548'};
              color: white;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: bold;
              border: 1px solid #fff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              font-family: 'SimHei', 'Microsoft YaHei', serif;
            ">
              ${props.type === 'pass' ? '关' : '山'}
            </div>
          `,
          className: 'custom-terrain-icon',
          iconAnchor: [18, 10]
        });

        const marker = L.marker([lat, lng], { icon: terrainIcon });
        
        marker.bindTooltip(`
          <div style="font-family: 'SimHei', sans-serif;">
            <strong>${props.name}</strong><br/>
            <small>${props.description}</small>
          </div>
        `, { permanent: false, direction: 'top' });

        marker.addTo(map);
      }
    });
    
    setDebugInfo(prev => ({ 
      ...prev, 
      layersAdded: { ...prev.layersAdded, terrain: true } 
    }));
    console.log(`✅ [Geo Map] ${geoData.terrain.features.length}个地形要素添加完成`);
  };

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

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleLocateMainCity = () => {
    if (mapRef.current) {
      // 定位到成都（蜀国首都）
      mapRef.current.setView([30.7, 104.1], 8);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }}>
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          minWidth: 400,
          border: '2px solid #ffd700'
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#fff', mb: 3 }}>
            🗺️ 三国地理大地图
          </Typography>
          
          <CircularProgress 
            variant="determinate" 
            value={loadingProgress}
            size={80}
            thickness={4}
            sx={{ 
              color: '#ffd700',
              mb: 2
            }}
          />
          
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            {loadingProgress}%
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#ffd700', mb: 3 }}>
            {loadingStatus}
          </Typography>
          
          <Stack spacing={1} sx={{ mt: 3 }}>
            <Typography variant="caption" sx={{ color: '#fff', textAlign: 'left' }}>
              地理数据状态:
            </Typography>
            <Box sx={{ 
              background: 'rgba(0, 0, 0, 0.3)', 
              p: 2, 
              borderRadius: 1,
              fontFamily: 'KaiTi, SimHei, serif',
              fontSize: '12px',
              color: '#fff',
              textAlign: 'left',
              border: '1px solid #ffd700'
            }}>
              <div>🏛️ 三国领土: {debugInfo.dataLoaded.kingdoms ? '已加载' : '等待中...'} 
                {debugInfo.dataStats.kingdomsCount > 0 && ` (${debugInfo.dataStats.kingdomsCount}个)`}
              </div>
              <div>🏰 历史城池: {debugInfo.dataLoaded.cities ? '已加载' : '等待中...'} 
                {debugInfo.dataStats.citiesCount > 0 && ` (${debugInfo.dataStats.citiesCount}个)`}
              </div>
              <div>🏔️ 地形要素: {debugInfo.dataLoaded.terrain ? '已加载' : '等待中...'} 
                {debugInfo.dataStats.terrainCount > 0 && ` (${debugInfo.dataStats.terrainCount}个)`}
              </div>
              <div>🗺️ 地图初始化: {debugInfo.mapInitialized ? '完成' : '等待中...'}</div>
              <div>📍 领土图层: {debugInfo.layersAdded.kingdoms ? '完成' : '等待中...'}</div>
              <div>🏘️ 城池图层: {debugInfo.layersAdded.cities ? '完成' : '等待中...'}</div>
              <div>⛰️ 地形图层: {debugInfo.layersAdded.terrain ? '完成' : '等待中...'}</div>
            </Box>
          </Stack>
          
          <Typography variant="caption" sx={{ color: '#999', mt: 2, display: 'block' }}>
            提示: 基于真实地理的三国历史地图
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ bgcolor: '#1a1a2e' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <TerrainIcon sx={{ mr: 1 }} />
            三国地理大地图
          </Typography>
          <Button color="inherit" onClick={() => navigate('/map')}>
            策略棋盘
          </Button>
          <Button color="inherit" onClick={() => navigate('/map/3d')}>
            3D地图
          </Button>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            返回主页
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative' }}>
        {/* 地图容器 */}
        <div 
          ref={mapContainerRef} 
          className="three-kingdoms-map"
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        />

        {/* 地图控制面板 */}
        <Paper
          className="map-control-panel"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={handleLocateMainCity} size="small">
            <MyLocationIcon />
          </IconButton>
        </Paper>

        {/* 图例 */}
        <Paper
          className="map-legend"
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            minWidth: 200
          }}
        >
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            图例
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#4285F4', borderRadius: '50%' }} />
              <Typography variant="caption">魏国</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#34A853', borderRadius: '50%' }} />
              <Typography variant="caption">蜀国</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#FBBC04', borderRadius: '50%' }} />
              <Typography variant="caption">吴国</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 3, bgcolor: '#1976D2' }} />
              <Typography variant="caption">河流</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 3, bgcolor: '#8D6E63' }} />
              <Typography variant="caption">山脉</Typography>
            </Box>
          </Stack>
        </Paper>

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
                        {selectedCity.type === 'capital' ? '都城' : 
                         selectedCity.type === 'major' ? '府城' :
                         selectedCity.type === 'strategic' ? '要地' : '城池'}
                      </Typography>
                      <Chip 
                        label={selectedCity.kingdom === 'wei' ? '魏国' : 
                               selectedCity.kingdom === 'shu' ? '蜀国' :
                               selectedCity.kingdom === 'wu' ? '吴国' : '中立'} 
                        color={selectedCity.kingdom === 'wei' ? 'primary' : 
                               selectedCity.kingdom === 'shu' ? 'success' :
                               selectedCity.kingdom === 'wu' ? 'warning' : 'default'}
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      重要度: {selectedCity.importance}/10
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      坐标: ({selectedCity.lat.toFixed(2)}, {selectedCity.lng.toFixed(2)})
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        onClick={() => navigate(`/city/${selectedCity.id}`)}
                      >
                        查看详情
                      </Button>
                      <Button 
                        variant="outlined" 
                        fullWidth
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.setView([selectedCity.lat, selectedCity.lng], 10);
                          }
                        }}
                      >
                        定位
                      </Button>
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

export default ThreeKingdomsMapPage;