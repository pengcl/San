import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
  ButtonGroup,
  Badge,
  Tooltip
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
  Layers as LayersIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/tiled-map.css';

// 瓦片类型定义
interface Tile {
  id: number;
  terrain: 'grass' | 'water' | 'mountain' | 'forest' | 'desert' | 'city' | 'road';
  walkable: boolean;
  cost: number;
  sprite?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 地图图层
interface MapLayer {
  id: string;
  name: string;
  type: 'tile' | 'object' | 'collision';
  visible: boolean;
  opacity: number;
  data: number[][] | GameObjectData[];
  properties?: Record<string, any>;
}

// 游戏对象数据
interface GameObjectData {
  id: string;
  type: 'city' | 'army' | 'resource' | 'npc';
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
}

// 地图配置
interface TiledMapConfig {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  scale: number;
  showGrid: boolean;
  showCollisions: boolean;
  cameraX: number;
  cameraY: number;
  layers: Record<string, boolean>;
}

// 城池对象
interface TiledCity {
  id: string;
  name: string;
  x: number;
  y: number;
  kingdom: 'wei' | 'shu' | 'wu' | 'neutral';
  level: number;
  population: number;
  buildings: string[];
}

const TiledMapPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const mousePos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('初始化瓦片地图...');
  const [selectedCity, setSelectedCity] = useState<TiledCity | null>(null);
  
  const [config, setConfig] = useState<TiledMapConfig>({
    width: 50,
    height: 30,
    tileWidth: 32,
    tileHeight: 32,
    scale: 2,
    showGrid: false,
    showCollisions: false,
    cameraX: 0,
    cameraY: 0,
    layers: {
      terrain: true,
      objects: true,
      cities: true,
      armies: true,
      effects: true
    }
  });

  const [mapData, setMapData] = useState({
    tileset: [] as Tile[],
    layers: [] as MapLayer[],
    cities: [] as TiledCity[]
  });

  const [debugInfo, setDebugInfo] = useState({
    tilesLoaded: false,
    layersCreated: false,
    objectsPlaced: false,
    renderingActive: false,
    fps: 0,
    visibleTiles: 0,
    totalObjects: 0
  });

  // 瓦片集定义 - 使用程序生成的纹理
  const createTileset = useCallback(async () => {
    console.log('🎨 [Tiled Map] 开始创建瓦片集...');
    setLoadingStatus('生成瓦片纹理...');
    setLoadingProgress(20);

    const tileset: Tile[] = [
      { id: 0, terrain: 'grass', walkable: true, cost: 1 }, // 草地
      { id: 1, terrain: 'water', walkable: false, cost: 999 }, // 水域
      { id: 2, terrain: 'mountain', walkable: false, cost: 999 }, // 山脉
      { id: 3, terrain: 'forest', walkable: true, cost: 2 }, // 森林
      { id: 4, terrain: 'desert', walkable: true, cost: 3 }, // 沙漠
      { id: 5, terrain: 'city', walkable: true, cost: 1 }, // 城池
      { id: 6, terrain: 'road', walkable: true, cost: 0.5 } // 道路
    ];

    // 生成瓦片纹理
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = config.tileWidth * 7; // 7种瓦片
    tileCanvas.height = config.tileHeight;
    const ctx = tileCanvas.getContext('2d')!;

    const colors = {
      grass: '#7ED321',
      water: '#4A90E2',
      mountain: '#8B7355',
      forest: '#417505',
      desert: '#F5A623',
      city: '#BD10E0',
      road: '#B8860B'
    };

    tileset.forEach((tile, index) => {
      const x = index * config.tileWidth;
      const y = 0;

      // 基础颜色
      ctx.fillStyle = colors[tile.terrain];
      ctx.fillRect(x, y, config.tileWidth, config.tileHeight);

      // 添加纹理细节
      if (tile.terrain === 'water') {
        // 水波纹理
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 3; i++) {
          const waveY = y + (i + 1) * (config.tileHeight / 4);
          ctx.fillRect(x + 2, waveY, config.tileWidth - 4, 2);
        }
      } else if (tile.terrain === 'mountain') {
        // 山峰纹理
        ctx.fillStyle = '#FFFFFF33';
        ctx.fillRect(x, y, config.tileWidth / 3, config.tileHeight / 3);
        ctx.fillStyle = '#00000033';
        ctx.fillRect(x + config.tileWidth * 2/3, y + config.tileHeight * 2/3, config.tileWidth / 3, config.tileHeight / 3);
      } else if (tile.terrain === 'forest') {
        // 树木纹理
        ctx.fillStyle = '#2E7D32';
        for (let i = 0; i < 3; i++) {
          const treeX = x + (i + 1) * (config.tileWidth / 4);
          const treeY = y + config.tileHeight / 4;
          ctx.fillRect(treeX - 2, treeY, 4, config.tileHeight / 2);
        }
      } else if (tile.terrain === 'city') {
        // 城池纹理
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + config.tileWidth/4, y + config.tileHeight/4, config.tileWidth/2, config.tileHeight/2);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + config.tileWidth/4, y + config.tileHeight/4, config.tileWidth/2, config.tileHeight/2);
      } else if (tile.terrain === 'road') {
        // 道路纹理
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x, y + config.tileHeight/3, config.tileWidth, config.tileHeight/3);
      }

      // 边框
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, config.tileWidth, config.tileHeight);
    });

    // 将画布转换为图片
    const tilesetImage = new Image();
    tilesetImage.src = tileCanvas.toDataURL();
    await new Promise(resolve => {
      tilesetImage.onload = resolve;
    });

    imageCache.current['tileset'] = tilesetImage;
    setMapData(prev => ({ ...prev, tileset }));
    setDebugInfo(prev => ({ ...prev, tilesLoaded: true }));
    console.log('✅ [Tiled Map] 瓦片集创建完成');
  }, [config.tileWidth, config.tileHeight]);

  // 生成地图图层
  const createMapLayers = useCallback(async () => {
    console.log('🗺️ [Tiled Map] 开始生成地图图层...');
    setLoadingStatus('生成地图图层...');
    setLoadingProgress(40);

    const layers: MapLayer[] = [];

    // 地形图层
    const terrainData: number[][] = [];
    for (let y = 0; y < config.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < config.width; x++) {
        let tileId = 0; // 默认草地

        // 边缘水域
        if (x === 0 || x === config.width - 1 || y === 0 || y === config.height - 1) {
          if (Math.random() < 0.7) tileId = 1; // 水域
        }
        // 山脉带（对角线）
        else if ((x + y) % 8 === 0 && Math.random() < 0.6) {
          tileId = 2; // 山脉
        }
        // 森林区域
        else if (Math.random() < 0.3) {
          tileId = 3; // 森林
        }
        // 沙漠区域（西北角）
        else if (x < config.width * 0.3 && y < config.height * 0.3 && Math.random() < 0.4) {
          tileId = 4; // 沙漠
        }
        // 道路网络
        else if ((x % 5 === 0 || y % 5 === 0) && Math.random() < 0.1) {
          tileId = 6; // 道路
        }

        row.push(tileId);
      }
      terrainData.push(row);
    }

    layers.push({
      id: 'terrain',
      name: '地形层',
      type: 'tile',
      visible: true,
      opacity: 1,
      data: terrainData
    });

    // 城池对象图层
    const cityObjects: GameObjectData[] = [
      {
        id: 'luoyang',
        type: 'city',
        x: 25, y: 8,
        width: 2, height: 2,
        properties: { name: '洛阳', kingdom: 'wei', level: 5, population: 500000 }
      },
      {
        id: 'chengdu',
        type: 'city',
        x: 8, y: 20,
        width: 2, height: 2,
        properties: { name: '成都', kingdom: 'shu', level: 4, population: 300000 }
      },
      {
        id: 'jianye',
        type: 'city',
        x: 40, y: 22,
        width: 2, height: 2,
        properties: { name: '建业', kingdom: 'wu', level: 4, population: 350000 }
      },
      {
        id: 'xiangyang',
        type: 'city',
        x: 20, y: 15,
        width: 1, height: 1,
        properties: { name: '襄阳', kingdom: 'neutral', level: 3, population: 150000 }
      }
    ];

    // 将城池放置到地形图层上
    cityObjects.forEach(city => {
      for (let dy = 0; dy < city.height; dy++) {
        for (let dx = 0; dx < city.width; dx++) {
          if (city.y + dy < config.height && city.x + dx < config.width) {
            terrainData[city.y + dy][city.x + dx] = 5; // 城池瓦片
          }
        }
      }
    });

    layers.push({
      id: 'cities',
      name: '城池层',
      type: 'object',
      visible: true,
      opacity: 1,
      data: cityObjects
    });

    // 转换城池数据
    const cities: TiledCity[] = cityObjects.map(obj => ({
      id: obj.id,
      name: obj.properties.name,
      x: obj.x,
      y: obj.y,
      kingdom: obj.properties.kingdom,
      level: obj.properties.level,
      population: obj.properties.population,
      buildings: []
    }));

    setMapData(prev => ({ ...prev, layers, cities }));
    setDebugInfo(prev => ({ 
      ...prev, 
      layersCreated: true, 
      objectsPlaced: true,
      totalObjects: cityObjects.length
    }));
    console.log('✅ [Tiled Map] 地图图层生成完成');
  }, [config.width, config.height]);

  // 渲染瓦片图层
  const renderTileLayer = useCallback((ctx: CanvasRenderingContext2D, layer: MapLayer) => {
    if (!config.layers[layer.id] || !layer.visible) return;
    if (layer.type !== 'tile' || !Array.isArray(layer.data[0])) return;

    const tilesetImage = imageCache.current['tileset'];
    if (!tilesetImage) return;

    const data = layer.data as number[][];
    const { tileWidth, tileHeight, scale, cameraX, cameraY } = config;
    const scaledTileW = tileWidth * scale;
    const scaledTileH = tileHeight * scale;

    ctx.globalAlpha = layer.opacity;

    let visibleTiles = 0;

    // 计算可见区域
    const canvas = ctx.canvas;
    const startX = Math.max(0, Math.floor(-cameraX / scaledTileW));
    const endX = Math.min(config.width, Math.ceil((canvas.width - cameraX) / scaledTileW));
    const startY = Math.max(0, Math.floor(-cameraY / scaledTileH));
    const endY = Math.min(config.height, Math.ceil((canvas.height - cameraY) / scaledTileH));

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (data[y] && data[y][x] !== undefined) {
          const tileId = data[y][x];
          if (tileId >= 0) {
            const screenX = x * scaledTileW + cameraX;
            const screenY = y * scaledTileH + cameraY;

            // 从瓦片集中绘制对应瓦片
            ctx.drawImage(
              tilesetImage,
              tileId * tileWidth, 0, tileWidth, tileHeight, // 源矩形
              screenX, screenY, scaledTileW, scaledTileH // 目标矩形
            );

            visibleTiles++;
          }
        }
      }
    }

    setDebugInfo(prev => ({ ...prev, visibleTiles }));
    ctx.globalAlpha = 1;
  }, [config]);

  // 渲染对象图层
  const renderObjectLayer = useCallback((ctx: CanvasRenderingContext2D, layer: MapLayer) => {
    if (!config.layers[layer.id] || !layer.visible) return;
    if (layer.type !== 'object') return;

    const objects = layer.data as GameObjectData[];
    const { tileWidth, tileHeight, scale, cameraX, cameraY } = config;
    const scaledTileW = tileWidth * scale;
    const scaledTileH = tileHeight * scale;

    ctx.globalAlpha = layer.opacity;

    objects.forEach(obj => {
      const screenX = obj.x * scaledTileW + cameraX;
      const screenY = obj.y * scaledTileH + cameraY;
      const width = obj.width * scaledTileW;
      const height = obj.height * scaledTileH;

      if (obj.type === 'city') {
        const kingdomColors = {
          wei: '#4285F4',
          shu: '#34A853',
          wu: '#FBBC04',
          neutral: '#9E9E9E'
        };

        // 城池背景
        ctx.fillStyle = kingdomColors[obj.properties.kingdom as keyof typeof kingdomColors] || '#9E9E9E';
        ctx.fillRect(screenX, screenY, width, height);

        // 城池边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, width, height);

        // 城池名称
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(12, scaledTileW / 3)}px SimHei`;
        ctx.textAlign = 'center';
        ctx.fillText(
          obj.properties.name,
          screenX + width / 2,
          screenY + height + 16
        );

        // 等级星星
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < obj.properties.level; i++) {
          const starX = screenX + 2 + (i * 6);
          const starY = screenY + 2;
          ctx.fillRect(starX, starY, 4, 4);
        }
      }
    });

    ctx.globalAlpha = 1;
  }, [config]);

  // 渲染网格
  const renderGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!config.showGrid) return;

    const { tileWidth, tileHeight, scale, cameraX, cameraY } = config;
    const scaledTileW = tileWidth * scale;
    const scaledTileH = tileHeight * scale;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    const canvas = ctx.canvas;

    // 垂直线
    for (let x = 0; x <= config.width; x++) {
      const screenX = x * scaledTileW + cameraX;
      if (screenX >= -scaledTileW && screenX <= canvas.width + scaledTileW) {
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, canvas.height);
        ctx.stroke();
      }
    }

    // 水平线
    for (let y = 0; y <= config.height; y++) {
      const screenY = y * scaledTileH + cameraY;
      if (screenY >= -scaledTileH && screenY <= canvas.height + scaledTileH) {
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(canvas.width, screenY);
        ctx.stroke();
      }
    }
  }, [config]);

  // 主渲染循环
  const render = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 计算FPS
    const fps = Math.round(1000 / (time - (render as any).lastTime || 16));
    (render as any).lastTime = time;

    setDebugInfo(prev => ({ ...prev, fps, renderingActive: true }));

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置像素完美渲染
    ctx.imageSmoothingEnabled = false;

    // 渲染各图层
    mapData.layers.forEach(layer => {
      if (layer.type === 'tile') {
        renderTileLayer(ctx, layer);
      } else if (layer.type === 'object') {
        renderObjectLayer(ctx, layer);
      }
    });

    // 渲染网格
    renderGrid(ctx);

    animationRef.current = requestAnimationFrame(render);
  }, [mapData.layers, renderTileLayer, renderObjectLayer, renderGrid]);

  // 初始化地图
  useEffect(() => {
    const initTiledMap = async () => {
      console.log('🗺️ [Tiled Map] 开始初始化瓦片地图...');
      setLoadingStatus('准备初始化...');
      setLoadingProgress(0);

      try {
        await createTileset();
        setLoadingProgress(50);

        await createMapLayers();
        setLoadingProgress(80);

        setLoadingStatus('准备完成...');
        setLoadingProgress(100);

        setTimeout(() => {
          setLoading(false);
          console.log('🎉 [Tiled Map] 瓦片地图初始化完成!');
        }, 500);

      } catch (error) {
        console.error('❌ [Tiled Map] 初始化失败:', error);
        setLoadingStatus(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };

    initTiledMap();
  }, [createTileset, createMapLayers]);

  // 启动渲染循环
  useEffect(() => {
    if (!loading) {
      console.log('🎬 [Tiled Map] 启动渲染循环...');
      animationRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationRef.current) {
        console.log('🛑 [Tiled Map] 停止渲染循环');
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render, loading]);

  // 设置画布尺寸
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // 鼠标控制
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    mousePos.current = { x: event.clientX, y: event.clientY };

    if (isDragging.current) {
      const deltaX = event.clientX - lastMousePos.current.x;
      const deltaY = event.clientY - lastMousePos.current.y;

      setConfig(prev => ({
        ...prev,
        cameraX: prev.cameraX + deltaX,
        cameraY: prev.cameraY + deltaY
      }));

      lastMousePos.current = { x: event.clientX, y: event.clientY };
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 转换为瓦片坐标
    const tileX = Math.floor((x - config.cameraX) / (config.tileWidth * config.scale));
    const tileY = Math.floor((y - config.cameraY) / (config.tileHeight * config.scale));

    // 检查点击的城池
    const clickedCity = mapData.cities.find(city => 
      tileX >= city.x && tileX < city.x + 2 &&
      tileY >= city.y && tileY < city.y + 2
    );

    if (clickedCity) {
      setSelectedCity(clickedCity);
    }
  }, [config, mapData.cities]);

  // 控制面板变化
  const handleConfigChange = (key: keyof TiledMapConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleLayerToggle = (layerId: string) => {
    setConfig(prev => ({
      ...prev,
      layers: { ...prev.layers, [layerId]: !prev.layers[layerId] }
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

  // 重置视图
  const resetView = () => {
    setConfig(prev => ({
      ...prev,
      cameraX: 0,
      cameraY: 0,
      scale: 2
    }));
  };

  // 聚焦到城池
  const focusOnCity = (city: TiledCity) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = -(city.x * config.tileWidth * config.scale) + canvas.width / 2;
    const centerY = -(city.y * config.tileHeight * config.scale) + canvas.height / 2;

    setConfig(prev => ({
      ...prev,
      cameraX: centerX,
      cameraY: centerY
    }));
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
          border: '2px solid #4caf50'
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#fff', mb: 3 }}>
            🗺️ 瓦片地图系统
          </Typography>
          
          <CircularProgress 
            variant="determinate" 
            value={loadingProgress}
            size={80}
            thickness={4}
            sx={{ 
              color: '#4caf50',
              mb: 2
            }}
          />
          
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            {loadingProgress}%
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#4caf50', mb: 3 }}>
            {loadingStatus}
          </Typography>
          
          <Stack spacing={1} sx={{ mt: 3 }}>
            <Typography variant="caption" sx={{ color: '#fff', textAlign: 'left' }}>
              瓦片系统状态:
            </Typography>
            <Box sx={{ 
              background: 'rgba(0, 0, 0, 0.3)', 
              p: 2, 
              borderRadius: 1,
              fontFamily: 'Courier New, monospace',
              fontSize: '12px',
              color: '#fff',
              textAlign: 'left',
              border: '1px solid #4caf50'
            }}>
              <div>🎨 瓦片纹理: {debugInfo.tilesLoaded ? '完成' : '等待中...'}</div>
              <div>🗺️ 图层生成: {debugInfo.layersCreated ? '完成' : '等待中...'}</div>
              <div>🏰 对象放置: {debugInfo.objectsPlaced ? '完成' : '等待中...'}</div>
              <div>🎬 渲染启动: {debugInfo.renderingActive ? '完成' : '等待中...'}</div>
              {debugInfo.totalObjects > 0 && <div>📦 游戏对象: {debugInfo.totalObjects}</div>}
              {debugInfo.fps > 0 && <div>⚡ FPS: {debugInfo.fps}</div>}
            </Box>
          </Stack>
          
          <Typography variant="caption" sx={{ color: '#999', mt: 2, display: 'block' }}>
            提示: 专业瓦片地图系统，支持多图层渲染
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
            <LayersIcon sx={{ mr: 1 }} />
            瓦片地图系统
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => navigate('/map/3d')}
            sx={{ mr: 1 }}
          >
            3D地图
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/map/pixel')}
            sx={{ mr: 1 }}
          >
            像素地图
          </Button>
          <Button color="inherit" onClick={() => navigate('/home')}>
            返回主页
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* 瓦片地图画布 */}
        <canvas
          ref={canvasRef}
          className="tiled-map-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleMouseClick}
          style={{
            width: '100%',
            height: '100%',
            cursor: isDragging.current ? 'grabbing' : 'grab',
            imageRendering: 'pixelated'
          }}
        />

        {/* 瓦片地图控制面板 */}
        <Paper
          className="tiled-controls"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            p: 2,
            minWidth: 280,
            maxHeight: '80vh',
            overflow: 'auto'
          }}
        >
          <Typography variant="h6" gutterBottom>
            瓦片控制
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Typography gutterBottom>缩放: {config.scale}x</Typography>
              <Slider
                value={config.scale}
                onChange={(_, value) => handleConfigChange('scale', value)}
                min={0.5}
                max={4}
                step={0.5}
                marks
              />
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              图层控制
            </Typography>
            
            {Object.entries(config.layers).map(([layerId, visible]) => (
              <FormControlLabel
                key={layerId}
                control={
                  <Switch
                    checked={visible}
                    onChange={() => handleLayerToggle(layerId)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                    {layerId === 'terrain' && '地形层'}
                    {layerId === 'objects' && '对象层'}
                    {layerId === 'cities' && '城池层'}
                    {layerId === 'armies' && '军队层'}
                    {layerId === 'effects' && '特效层'}
                  </Box>
                }
              />
            ))}
            
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
                  checked={config.showCollisions}
                  onChange={(e) => handleConfigChange('showCollisions', e.target.checked)}
                />
              }
              label="显示碰撞"
            />
            
            <Button
              variant="outlined"
              onClick={resetView}
              fullWidth
            >
              重置视图
            </Button>
          </Stack>
        </Paper>

        {/* 调试信息面板 */}
        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            p: 2,
            minWidth: 200
          }}
        >
          <Typography variant="h6" gutterBottom>
            调试信息
          </Typography>
          
          <Stack spacing={1}>
            <Typography variant="body2">
              FPS: {debugInfo.fps}
            </Typography>
            <Typography variant="body2">
              可见瓦片: {debugInfo.visibleTiles}
            </Typography>
            <Typography variant="body2">
              游戏对象: {debugInfo.totalObjects}
            </Typography>
            <Typography variant="body2">
              相机: ({Math.round(config.cameraX)}, {Math.round(config.cameraY)})
            </Typography>
            <Typography variant="body2">
              缩放: {config.scale}x
            </Typography>
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
                      <Typography>城池</Typography>
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
                        onClick={() => focusOnCity(selectedCity)}
                      >
                        聚焦
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

export default TiledMapPage;