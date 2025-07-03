import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
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
  Stack,
  Slider,
  Switch,
  FormControlLabel,
  ButtonGroup
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
  Terrain as TerrainIcon,
  Palette as PaletteIcon,
  WbSunny as SunIcon,
  Brightness3 as MoonIcon,
  Cloud as CloudIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/pixel-art-map.css';

// 地形类型
enum TerrainType {
  WATER = 0,
  GRASSLAND = 1,
  FOREST = 2,
  MOUNTAIN = 3,
  DESERT = 4,
  SNOW = 5,
  CITY = 6,
  ROAD = 7
}

// 城池数据
interface PixelCity {
  id: string;
  name: string;
  x: number;
  y: number;
  level: number;
  kingdom: 'wei' | 'shu' | 'wu' | 'neutral';
  type: 'capital' | 'major' | 'town' | 'village';
  population: number;
  defenseLevel: number;
  economyLevel: number;
  isPlayerCity: boolean;
}

// 地图配置
interface MapConfig {
  width: number;
  height: number;
  tileSize: number;
  scale: number;
  centerX: number;
  centerY: number;
  showGrid: boolean;
  showWeather: boolean;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  weatherType: 'clear' | 'cloudy' | 'rain' | 'snow';
}

// 像素色彩主题
const pixelColors = {
  terrain: {
    [TerrainType.WATER]: '#4A90E2',
    [TerrainType.GRASSLAND]: '#7ED321',
    [TerrainType.FOREST]: '#417505',
    [TerrainType.MOUNTAIN]: '#8B7355',
    [TerrainType.DESERT]: '#F5A623',
    [TerrainType.SNOW]: '#FFFFFF',
    [TerrainType.CITY]: '#BD10E0',
    [TerrainType.ROAD]: '#B8860B'
  },
  kingdoms: {
    wei: '#4285F4',
    shu: '#34A853', 
    wu: '#FBBC04',
    neutral: '#9E9E9E'
  },
  ui: {
    primary: '#FF6B35',
    secondary: '#FFD700',
    background: '#1A1A2E',
    surface: '#16213E'
  }
};

const PixelArtMapPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const [selectedCity, setSelectedCity] = useState<PixelCity | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('初始化像素世界...');
  const [debugInfo, setDebugInfo] = useState({
    terrainGenerated: false,
    citiesCreated: false,
    canvasReady: false,
    renderingActive: false,
    lastFrameTime: 0,
    fps: 0,
    verticesCount: 0,
    citiesCount: 0
  });
  const [cities, setCities] = useState<PixelCity[]>([]);
  const [terrain, setTerrain] = useState<TerrainType[][]>([]);
  const [config, setConfig] = useState<MapConfig>({
    width: 120,
    height: 80,
    tileSize: 16,
    scale: 2,
    centerX: 60,
    centerY: 40,
    showGrid: false,
    showWeather: true,
    timeOfDay: 'day',
    season: 'spring',
    weatherType: 'clear'
  });

  // 生成像素地形
  const generateTerrain = useCallback(async () => {
    console.log('🎨 [Pixel Map] 开始生成像素地形...');
    setLoadingStatus('生成地形数据...');
    setLoadingProgress(20);
    
    const newTerrain: TerrainType[][] = [];
    let verticesCount = 0;
    
    for (let y = 0; y < config.height; y++) {
      const row: TerrainType[] = [];
      for (let x = 0; x < config.width; x++) {
        verticesCount++;
        let terrainType = TerrainType.GRASSLAND;
        
        // 根据位置生成不同地形
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - config.width / 2, 2) + Math.pow(y - config.height / 2, 2)
        );
        
        // 水域（边缘和特定区域）
        if (x < 5 || x > config.width - 5 || y < 5 || y > config.height - 5) {
          if (Math.random() < 0.3) terrainType = TerrainType.WATER;
        }
        
        // 山脉（西南部 - 蜀国）
        if (x < config.width * 0.3 && y > config.height * 0.6) {
          if (Math.random() < 0.6) terrainType = TerrainType.MOUNTAIN;
          else if (Math.random() < 0.3) terrainType = TerrainType.FOREST;
        }
        
        // 森林（散布）
        if (terrainType === TerrainType.GRASSLAND && Math.random() < 0.15) {
          terrainType = TerrainType.FOREST;
        }
        
        // 沙漠（西北部）
        if (x < config.width * 0.4 && y < config.height * 0.3) {
          if (Math.random() < 0.2) terrainType = TerrainType.DESERT;
        }
        
        // 雪山（高山区域）
        if (terrainType === TerrainType.MOUNTAIN && Math.random() < 0.3) {
          terrainType = TerrainType.SNOW;
        }
        
        row.push(terrainType);
      }
      newTerrain.push(row);
    }
    
    setTerrain(newTerrain);
    setDebugInfo(prev => ({ 
      ...prev, 
      terrainGenerated: true, 
      verticesCount 
    }));
    console.log(`✅ [Pixel Map] 地形生成完成: ${config.width}x${config.height} (${verticesCount}个像素)`);
  }, [config.width, config.height]);

  // 生成城池
  const generateCities = useCallback(async () => {
    console.log('🏰 [Pixel Map] 开始生成城池...');
    setLoadingStatus('创建城池数据...');
    setLoadingProgress(40);
    
    const newCities: PixelCity[] = [
      {
        id: 'luoyang',
        name: '洛阳',
        x: 60, y: 25,
        level: 5,
        kingdom: 'wei',
        type: 'capital',
        population: 500000,
        defenseLevel: 5,
        economyLevel: 5,
        isPlayerCity: false
      },
      {
        id: 'changan',
        name: '长安',
        x: 45, y: 20,
        level: 5,
        kingdom: 'wei',
        type: 'capital',
        population: 400000,
        defenseLevel: 5,
        economyLevel: 4,
        isPlayerCity: false
      },
      {
        id: 'chengdu',
        name: '成都',
        x: 25, y: 55,
        level: 4,
        kingdom: 'shu',
        type: 'capital',
        population: 300000,
        defenseLevel: 4,
        economyLevel: 4,
        isPlayerCity: false
      },
      {
        id: 'jianye',
        name: '建业',
        x: 85, y: 60,
        level: 4,
        kingdom: 'wu',
        type: 'capital',
        population: 350000,
        defenseLevel: 4,
        economyLevel: 5,
        isPlayerCity: false
      },
      {
        id: 'xuchang',
        name: '许昌',
        x: 65, y: 35,
        level: 3,
        kingdom: 'wei',
        type: 'major',
        population: 200000,
        defenseLevel: 3,
        economyLevel: 3,
        isPlayerCity: false
      }
    ];
    
    setCities(newCities);
    setDebugInfo(prev => ({ 
      ...prev, 
      citiesCreated: true, 
      citiesCount: newCities.length 
    }));
    console.log(`✅ [Pixel Map] ${newCities.length}个城池创建完成`);
  }, []);

  // 绘制地形
  const drawTerrain = useCallback((ctx: CanvasRenderingContext2D) => {
    for (let y = 0; y < terrain.length; y++) {
      for (let x = 0; x < terrain[y].length; x++) {
        const terrainType = terrain[y][x];
        let color = pixelColors.terrain[terrainType];
        
        // 根据时间和天气调整颜色
        if (config.timeOfDay === 'night') {
          color = darkenColor(color, 0.6);
        } else if (config.timeOfDay === 'dusk' || config.timeOfDay === 'dawn') {
          color = adjustColorHue(color, 30);
        }
        
        // 根据季节调整颜色
        if (config.season === 'autumn' && terrainType === TerrainType.FOREST) {
          color = '#D2691E'; // 秋叶色
        } else if (config.season === 'winter' && terrainType === TerrainType.GRASSLAND) {
          color = '#E0E0E0'; // 冬季草地
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(
          x * config.tileSize * config.scale,
          y * config.tileSize * config.scale,
          config.tileSize * config.scale,
          config.tileSize * config.scale
        );
        
        // 添加纹理效果
        if (terrainType === TerrainType.WATER) {
          drawWaterEffect(ctx, x, y);
        } else if (terrainType === TerrainType.MOUNTAIN) {
          drawMountainEffect(ctx, x, y);
        }
      }
    }
  }, [terrain, config]);

  // 绘制城池
  const drawCities = useCallback((ctx: CanvasRenderingContext2D) => {
    cities.forEach(city => {
      const screenX = city.x * config.tileSize * config.scale;
      const screenY = city.y * config.tileSize * config.scale;
      const size = config.tileSize * config.scale;
      
      // 城池背景
      ctx.fillStyle = pixelColors.kingdoms[city.kingdom];
      ctx.fillRect(screenX, screenY, size, size);
      
      // 城池边框
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, size, size);
      
      // 城池等级指示器
      ctx.fillStyle = '#FFD700';
      for (let i = 0; i < city.level; i++) {
        const dotX = screenX + 2 + (i * 3);
        const dotY = screenY + 2;
        ctx.fillRect(dotX, dotY, 2, 2);
      }
      
      // 城池名称
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${Math.max(10, size / 2)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(
        city.name,
        screenX + size / 2,
        screenY + size + 15
      );
      
      // 如果是玩家城池，添加特殊标记
      if (city.isPlayerCity) {
        ctx.fillStyle = '#FF6B35';
        ctx.fillRect(screenX + size - 6, screenY, 6, 6);
      }
    });
  }, [cities, config]);

  // 绘制网格
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!config.showGrid) return;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // 垂直线
    for (let x = 0; x <= config.width; x++) {
      const screenX = x * config.tileSize * config.scale;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, config.height * config.tileSize * config.scale);
      ctx.stroke();
    }
    
    // 水平线
    for (let y = 0; y <= config.height; y++) {
      const screenY = y * config.tileSize * config.scale;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(config.width * config.tileSize * config.scale, screenY);
      ctx.stroke();
    }
  }, [config]);

  // 绘制天气效果
  const drawWeatherEffects = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    if (!config.showWeather) return;
    
    const canvas = ctx.canvas;
    
    if (config.weatherType === 'rain') {
      // 雨滴效果
      ctx.fillStyle = 'rgba(173, 216, 230, 0.6)';
      for (let i = 0; i < 50; i++) {
        const x = (Math.random() * canvas.width + time * 5) % canvas.width;
        const y = (Math.random() * canvas.height + time * 8) % canvas.height;
        ctx.fillRect(x, y, 1, 4);
      }
    } else if (config.weatherType === 'snow') {
      // 雪花效果
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 30; i++) {
        const x = (Math.random() * canvas.width + time * 2) % canvas.width;
        const y = (Math.random() * canvas.height + time * 3) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
      }
    } else if (config.weatherType === 'cloudy') {
      // 云影效果
      const cloudAlpha = 0.1 + Math.sin(time * 0.002) * 0.05;
      ctx.fillStyle = `rgba(0, 0, 0, ${cloudAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [config]);

  // 水波效果
  const drawWaterEffect = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const time = Date.now() * 0.001;
    const wave = Math.sin(time * 2 + x * 0.5 + y * 0.3) * 0.1;
    const brightness = 1 + wave;
    
    const currentColor = ctx.fillStyle;
    ctx.fillStyle = adjustColorBrightness(currentColor as string, brightness);
    ctx.fillRect(
      x * config.tileSize * config.scale,
      y * config.tileSize * config.scale,
      config.tileSize * config.scale,
      config.tileSize * config.scale
    );
  }, [config]);

  // 山峰效果
  const drawMountainEffect = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const screenX = x * config.tileSize * config.scale;
    const screenY = y * config.tileSize * config.scale;
    const size = config.tileSize * config.scale;
    
    // 山峰阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(screenX + size * 0.7, screenY + size * 0.3, size * 0.3, size * 0.7);
    
    // 山峰高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(screenX, screenY, size * 0.3, size * 0.3);
  }, [config]);

  // 颜色调整函数
  const darkenColor = (color: string, factor: number): string => {
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const adjustColorHue = (color: string, hueShift: number): string => {
    // 简化的色相调整
    return color; // 实际实现需要HSL转换
  };

  const adjustColorBrightness = (color: string, factor: number): string => {
    if (typeof color !== 'string') return color;
    return color; // 简化实现
  };

  // 主渲染循环
  const render = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 计算FPS
    const deltaTime = time - lastTimeRef.current;
    if (deltaTime > 0) {
      const fps = Math.round(1000 / deltaTime);
      setDebugInfo(prev => ({ 
        ...prev, 
        fps, 
        lastFrameTime: time,
        renderingActive: true 
      }));
    }
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制地形
    drawTerrain(ctx);
    
    // 绘制城池
    drawCities(ctx);
    
    // 绘制网格
    drawGrid(ctx);
    
    // 绘制天气效果
    drawWeatherEffects(ctx, time);
    
    lastTimeRef.current = time;
    animationRef.current = requestAnimationFrame(render);
  }, [drawTerrain, drawCities, drawGrid, drawWeatherEffects]);

  // 初始化
  useEffect(() => {
    const initPixelMap = async () => {
      console.log('🎨 [Pixel Map] 开始初始化像素地图...');
      setLoadingStatus('准备初始化...');
      setLoadingProgress(0);
      
      try {
        await generateTerrain();
        setLoadingProgress(60);
        
        await generateCities();
        setLoadingProgress(80);
        
        setLoadingStatus('准备画布...');
        setLoadingProgress(90);
        
        // 等待一帧确保状态更新
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        setDebugInfo(prev => ({ ...prev, canvasReady: true }));
        setLoadingProgress(100);
        setLoadingStatus('完成!');
        
        setTimeout(() => {
          setLoading(false);
          console.log('🎉 [Pixel Map] 像素地图初始化完成!');
        }, 300);
        
      } catch (error) {
        console.error('❌ [Pixel Map] 初始化失败:', error);
        setLoadingStatus(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };
    
    initPixelMap();
  }, [generateTerrain, generateCities]);

  // 启动渲染循环
  useEffect(() => {
    if (!loading) {
      console.log('🎬 [Pixel Map] 启动渲染循环...');
      animationRef.current = requestAnimationFrame(render);
    }
    
    return () => {
      if (animationRef.current) {
        console.log('🛑 [Pixel Map] 停止渲染循环');
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render, loading]);

  // 画布尺寸设置
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = config.width * config.tileSize * config.scale;
    canvas.height = config.height * config.tileSize * config.scale;
  }, [config]);

  // 处理画布点击
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / (config.tileSize * config.scale));
    const y = Math.floor((event.clientY - rect.top) / (config.tileSize * config.scale));
    
    // 检查是否点击了城池
    const clickedCity = cities.find(city => city.x === x && city.y === y);
    if (clickedCity) {
      setSelectedCity(clickedCity);
    }
  }, [cities, config]);

  // 控制面板变化
  const handleConfigChange = (key: keyof MapConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 快捷操作
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
          border: '2px solid #ff6b35'
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#fff', mb: 3 }}>
            🎨 三国像素世界
          </Typography>
          
          <CircularProgress 
            variant="determinate" 
            value={loadingProgress}
            size={80}
            thickness={4}
            sx={{ 
              color: '#ff6b35',
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
              像素世界状态:
            </Typography>
            <Box sx={{ 
              background: 'rgba(0, 0, 0, 0.3)', 
              p: 2, 
              borderRadius: 1,
              fontFamily: 'Courier New, monospace',
              fontSize: '12px',
              color: '#fff',
              textAlign: 'left',
              border: '1px solid #ff6b35'
            }}>
              <div>🎨 地形生成: {debugInfo.terrainGenerated ? '完成' : '等待中...'}</div>
              <div>🏰 城池创建: {debugInfo.citiesCreated ? '完成' : '等待中...'}</div>
              <div>🖼️ 画布准备: {debugInfo.canvasReady ? '完成' : '等待中...'}</div>
              <div>🎬 渲染启动: {debugInfo.renderingActive ? '完成' : '等待中...'}</div>
              {debugInfo.verticesCount > 0 && <div>📊 像素数量: {debugInfo.verticesCount.toLocaleString()}</div>}
              {debugInfo.citiesCount > 0 && <div>🏛️ 城池数量: {debugInfo.citiesCount}</div>}
              {debugInfo.fps > 0 && <div>⚡ FPS: {debugInfo.fps}</div>}
            </Box>
          </Stack>
          
          <Typography variant="caption" sx={{ color: '#999', mt: 2, display: 'block' }}>
            提示: 像素艺术风格，支持时间天气变化
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
            <PaletteIcon sx={{ mr: 1 }} />
            三国像素世界
          </Typography>
          <Button color="inherit" onClick={() => navigate('/map')}>
            策略棋盘
          </Button>
          <Button color="inherit" onClick={() => navigate('/map/3d')}>
            3D地图
          </Button>
          <Button color="inherit" onClick={() => navigate('/map/2d')}>
            地理地图
          </Button>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            返回主页
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* 像素地图画布 */}
        <canvas
          ref={canvasRef}
          className="pixel-art-canvas"
          onClick={handleCanvasClick}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '2px solid #FFD700',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        />

        {/* 像素控制面板 */}
        <Paper
          className="pixel-controls"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            p: 2,
            minWidth: 260,
            maxHeight: '80vh',
            overflow: 'auto'
          }}
        >
          <Typography variant="h6" gutterBottom>
            像素控制
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Typography gutterBottom>缩放: {config.scale}x</Typography>
              <Slider
                value={config.scale}
                onChange={(_, value) => handleConfigChange('scale', value)}
                min={1}
                max={4}
                step={1}
                marks
              />
            </Box>
            
            <Box>
              <Typography gutterBottom>时间</Typography>
              <ButtonGroup size="small" fullWidth>
                {(['dawn', 'day', 'dusk', 'night'] as const).map((time) => (
                  <Button
                    key={time}
                    variant={config.timeOfDay === time ? 'contained' : 'outlined'}
                    onClick={() => handleConfigChange('timeOfDay', time)}
                  >
                    {time === 'dawn' && '黎明'}
                    {time === 'day' && '白天'}
                    {time === 'dusk' && '黄昏'}
                    {time === 'night' && '夜晚'}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
            
            <Box>
              <Typography gutterBottom>季节</Typography>
              <ButtonGroup size="small" fullWidth>
                {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => (
                  <Button
                    key={season}
                    variant={config.season === season ? 'contained' : 'outlined'}
                    onClick={() => handleConfigChange('season', season)}
                  >
                    {season === 'spring' && '春'}
                    {season === 'summer' && '夏'}
                    {season === 'autumn' && '秋'}
                    {season === 'winter' && '冬'}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
            
            <Box>
              <Typography gutterBottom>天气</Typography>
              <ButtonGroup size="small" fullWidth>
                {(['clear', 'cloudy', 'rain', 'snow'] as const).map((weather) => (
                  <Button
                    key={weather}
                    variant={config.weatherType === weather ? 'contained' : 'outlined'}
                    onClick={() => handleConfigChange('weatherType', weather)}
                  >
                    {weather === 'clear' && '晴'}
                    {weather === 'cloudy' && '云'}
                    {weather === 'rain' && '雨'}
                    {weather === 'snow' && '雪'}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={config.showGrid}
                  onChange={(e) => handleConfigChange('showGrid', e.target.checked)}
                />
              }
              label="显示网格"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={config.showWeather}
                  onChange={(e) => handleConfigChange('showWeather', e.target.checked)}
                />
              }
              label="天气效果"
            />
            
            <Button
              variant="outlined"
              onClick={() => {
                generateTerrain();
                generateCities();
              }}
              fullWidth
            >
              重新生成地图
            </Button>
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
                         selectedCity.type === 'town' ? '城镇' : '村庄'}
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
                      等级: {selectedCity.level} | 人口: {selectedCity.population.toLocaleString()}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      防御: {selectedCity.defenseLevel} | 经济: {selectedCity.economyLevel}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      坐标: ({selectedCity.x}, {selectedCity.y})
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        onClick={() => navigate(`/city/${selectedCity.id}`)}
                      >
                        进入城池
                      </Button>
                      <Button 
                        variant="outlined" 
                        fullWidth
                        onClick={() => {
                          setConfig(prev => ({
                            ...prev,
                            centerX: selectedCity.x,
                            centerY: selectedCity.y
                          }));
                        }}
                      >
                        居中显示
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

export default PixelArtMapPage;