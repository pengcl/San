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
  ThreeDRotation as View3DIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Height as HeightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/isometric-map.css';

// 2.5D等距瓦片类型
interface IsometricTile {
  id: number;
  terrain: 'grass' | 'water' | 'mountain' | 'forest' | 'desert' | 'city' | 'road';
  height: number; // 高度层级 0-5
  walkable: boolean;
  cost: number;
  elevation: number; // 实际高度值
  sprite?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 等距坐标系统
interface IsometricCoords {
  x: number;
  y: number;
  z?: number; // 高度
}

// 屏幕坐标
interface ScreenCoords {
  x: number;
  y: number;
}

// 地图图层（2.5D版本）
interface IsometricLayer {
  id: string;
  name: string;
  type: 'terrain' | 'height' | 'object' | 'decoration' | 'effect';
  visible: boolean;
  opacity: number;
  data: number[][] | IsometricObjectData[];
  properties?: Record<string, any>;
}

// 2.5D游戏对象
interface IsometricObjectData {
  id: string;
  type: 'city' | 'army' | 'building' | 'tree' | 'rock' | 'resource';
  x: number;
  y: number;
  z: number; // 高度
  width: number;
  height: number;
  depth: number; // 深度
  properties: Record<string, any>;
}

// 2.5D地图配置
interface IsometricMapConfig {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  tileDepth: number; // 等距深度
  scale: number;
  showGrid: boolean;
  showHeights: boolean;
  showShadows: boolean;
  enableLighting: boolean;
  cameraX: number;
  cameraY: number;
  lightAngle: number; // 光照角度
  layers: Record<string, boolean>;
}

// 城池对象（2.5D版本）
interface IsometricCity {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  kingdom: 'wei' | 'shu' | 'wu' | 'neutral';
  level: number;
  population: number;
  buildings: string[];
  elevation: number; // 海拔高度
}

const IsometricMapPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const mousePos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('初始化2.5D等距地图...');
  const [selectedCity, setSelectedCity] = useState<IsometricCity | null>(null);
  
  const [config, setConfig] = useState<IsometricMapConfig>({
    width: 30,
    height: 20,
    tileWidth: 64,
    tileHeight: 32,
    tileDepth: 16,
    scale: 1.5,
    showGrid: false,
    showHeights: true,
    showShadows: true,
    enableLighting: true,
    cameraX: 0,
    cameraY: 0,
    lightAngle: 45,
    layers: {
      terrain: true,
      height: true,
      objects: true,
      cities: true,
      decoration: true,
      effects: true
    }
  });

  const [mapData, setMapData] = useState({
    tileset: [] as IsometricTile[],
    heightMap: [] as number[][],
    layers: [] as IsometricLayer[],
    cities: [] as IsometricCity[]
  });

  const [debugInfo, setDebugInfo] = useState({
    tilesLoaded: false,
    heightMapGenerated: false,
    layersCreated: false,
    objectsPlaced: false,
    renderingActive: false,
    fps: 0,
    visibleTiles: 0,
    totalObjects: 0,
    renderTime: 0
  });

  // 等距坐标转换工具
  const coordUtils = useMemo(() => ({
    // 将瓦片坐标转换为屏幕坐标（等距投影）
    tileToScreen: (tileX: number, tileY: number, tileZ: number = 0): ScreenCoords => {
      const { tileWidth, tileHeight, tileDepth } = config;
      return {
        x: (tileX - tileY) * (tileWidth / 2),
        y: (tileX + tileY) * (tileHeight / 2) - tileZ * tileDepth
      };
    },

    // 将屏幕坐标转换为瓦片坐标
    screenToTile: (screenX: number, screenY: number): IsometricCoords => {
      const { tileWidth, tileHeight } = config;
      const x = (screenX / (tileWidth / 2) + screenY / (tileHeight / 2)) / 2;
      const y = (screenY / (tileHeight / 2) - screenX / (tileWidth / 2)) / 2;
      return { x: Math.floor(x), y: Math.floor(y) };
    },

    // 获取渲染顺序（从后到前）
    getRenderOrder: (width: number, height: number): IsometricCoords[] => {
      const order: IsometricCoords[] = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          order.push({ x, y });
        }
      }
      // 按等距顺序排序（后面的瓦片先渲染）
      return order.sort((a, b) => (a.x + a.y) - (b.x + b.y));
    }
  }), [config]);

  // 创建2.5D瓦片集
  const createIsometricTileset = useCallback(async () => {
    console.log('🎨 [Isometric Map] 开始创建2.5D瓦片集...');
    setLoadingStatus('生成等距瓦片纹理...');
    setLoadingProgress(20);

    const tileset: IsometricTile[] = [
      { id: 0, terrain: 'grass', height: 0, walkable: true, cost: 1, elevation: 0 },
      { id: 1, terrain: 'water', height: -1, walkable: false, cost: 999, elevation: -5 },
      { id: 2, terrain: 'mountain', height: 3, walkable: false, cost: 999, elevation: 15 },
      { id: 3, terrain: 'forest', height: 1, walkable: true, cost: 2, elevation: 3 },
      { id: 4, terrain: 'desert', height: 0, walkable: true, cost: 3, elevation: 0 },
      { id: 5, terrain: 'city', height: 2, walkable: true, cost: 1, elevation: 5 },
      { id: 6, terrain: 'road', height: 0, walkable: true, cost: 0.5, elevation: 0 }
    ];

    // 生成等距瓦片纹理
    const { tileWidth, tileHeight, tileDepth } = config;
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = tileWidth * tileset.length;
    tileCanvas.height = tileHeight + tileDepth * 4; // 为高度预留空间
    const ctx = tileCanvas.getContext('2d')!;

    const colors = {
      grass: { base: '#7ED321', side: '#6BC317', top: '#8EE332' },
      water: { base: '#4A90E2', side: '#3A7BC2', top: '#5AA0F2' },
      mountain: { base: '#8B7355', side: '#7B6345', top: '#9B8365' },
      forest: { base: '#417505', side: '#316504', top: '#518506' },
      desert: { base: '#F5A623', side: '#E59613', top: '#FFB633' },
      city: { base: '#BD10E0', side: '#AD00D0', top: '#CD20F0' },
      road: { base: '#B8860B', side: '#A87600', top: '#C8961B' }
    };

    tileset.forEach((tile, index) => {
      const startX = index * tileWidth;
      const startY = 0;
      const height = Math.max(1, tile.height + 1) * tileDepth;
      const colorSet = colors[tile.terrain];

      // 绘制等距瓦片
      drawIsometricTile(ctx, startX, startY, tileWidth, tileHeight, height, colorSet, tile.terrain);
    });

    // 辅助函数：绘制等距瓦片
    function drawIsometricTile(
      ctx: CanvasRenderingContext2D,
      x: number, y: number,
      width: number, height: number, depth: number,
      colors: { base: string; side: string; top: string },
      terrain: string
    ) {
      // 顶面（菱形）
      ctx.fillStyle = colors.top;
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x + width / 2, y + height);
      ctx.lineTo(x, y + height / 2);
      ctx.closePath();
      ctx.fill();

      // 左侧面
      if (depth > 0) {
        ctx.fillStyle = colors.side;
        ctx.beginPath();
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x + width / 2, y + height);
        ctx.lineTo(x + width / 2, y + height + depth);
        ctx.lineTo(x, y + height / 2 + depth);
        ctx.closePath();
        ctx.fill();
      }

      // 右侧面
      if (depth > 0) {
        ctx.fillStyle = colors.base;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y + height);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width, y + height / 2 + depth);
        ctx.lineTo(x + width / 2, y + height + depth);
        ctx.closePath();
        ctx.fill();
      }

      // 添加地形特定纹理
      addTerrainTexture(ctx, x, y, width, height, depth, terrain);

      // 边框
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      
      // 顶面边框
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x + width / 2, y + height);
      ctx.lineTo(x, y + height / 2);
      ctx.closePath();
      ctx.stroke();
    }

    // 添加地形纹理
    function addTerrainTexture(
      ctx: CanvasRenderingContext2D,
      x: number, y: number,
      width: number, height: number, depth: number,
      terrain: string
    ) {
      ctx.save();
      
      if (terrain === 'water') {
        // 水波纹理
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 2; i++) {
          const waveY = y + height / 4 + i * height / 4;
          ctx.beginPath();
          ctx.ellipse(x + width / 2, waveY, width / 4, height / 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (terrain === 'mountain') {
        // 山峰纹理
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y + height / 8);
        ctx.lineTo(x + width / 4, y + height / 3);
        ctx.lineTo(x + 3 * width / 4, y + height / 3);
        ctx.closePath();
        ctx.fill();
      } else if (terrain === 'forest') {
        // 树木纹理
        ctx.fillStyle = 'rgba(0, 100, 0, 0.6)';
        for (let i = 0; i < 3; i++) {
          const treeX = x + width / 4 + i * width / 6;
          const treeY = y + height / 3;
          ctx.beginPath();
          ctx.ellipse(treeX, treeY, width / 12, height / 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (terrain === 'city') {
        // 城池建筑纹理
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(x + width / 3, y + height / 3, width / 3, height / 6);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.strokeRect(x + width / 3, y + height / 3, width / 3, height / 6);
      } else if (terrain === 'road') {
        // 道路纹理
        ctx.fillStyle = 'rgba(139, 110, 99, 0.8)';
        ctx.fillRect(x + width / 8, y + height / 2 - height / 16, 3 * width / 4, height / 8);
      } else if (terrain === 'desert') {
        // 沙丘纹理
        ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
        for (let i = 0; i < 4; i++) {
          const dotX = x + width / 4 + (i % 2) * width / 2;
          const dotY = y + height / 4 + Math.floor(i / 2) * height / 4;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    }

    // 将画布转换为图片
    const tilesetImage = new Image();
    tilesetImage.src = tileCanvas.toDataURL();
    await new Promise(resolve => {
      tilesetImage.onload = resolve;
    });

    imageCache.current['isometric_tileset'] = tilesetImage;
    setMapData(prev => ({ ...prev, tileset }));
    setDebugInfo(prev => ({ ...prev, tilesLoaded: true }));
    console.log('✅ [Isometric Map] 2.5D瓦片集创建完成');
  }, [config]);

  // 生成高度图
  const generateHeightMap = useCallback(async () => {
    console.log('🏔️ [Isometric Map] 开始生成高度图...');
    setLoadingStatus('生成地形高度...');
    setLoadingProgress(40);

    const heightMap: number[][] = [];
    
    for (let y = 0; y < config.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < config.width; x++) {
        let height = 0;
        
        // 创建地形高度变化
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        // 中心高地
        if (distanceFromCenter < config.width * 0.3) {
          height = Math.floor(3 - (distanceFromCenter / (config.width * 0.1)));
        }
        
        // 山脉（对角线）
        if ((x + y) % 8 === 0 && Math.random() < 0.4) {
          height = Math.max(height, 4);
        }
        
        // 河谷（水域）
        if (x === 0 || x === config.width - 1 || y === 0 || y === config.height - 1) {
          if (Math.random() < 0.6) height = -1;
        }
        
        // 平滑处理
        height = Math.max(-2, Math.min(5, height));
        row.push(height);
      }
      heightMap.push(row);
    }

    setMapData(prev => ({ ...prev, heightMap }));
    setDebugInfo(prev => ({ ...prev, heightMapGenerated: true }));
    console.log('✅ [Isometric Map] 高度图生成完成');
  }, [config.width, config.height]);

  // 生成等距地图图层
  const createIsometricLayers = useCallback(async () => {
    console.log('🗺️ [Isometric Map] 开始生成等距图层...');
    setLoadingStatus('生成地图图层...');
    setLoadingProgress(60);

    const layers: IsometricLayer[] = [];

    // 地形图层（基于高度图）
    const terrainData: number[][] = [];
    for (let y = 0; y < config.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < config.width; x++) {
        const height = mapData.heightMap[y]?.[x] || 0;
        let tileId = 0; // 默认草地

        if (height < -0.5) {
          tileId = 1; // 水域
        } else if (height > 3) {
          tileId = 2; // 山脉
        } else if (height > 1 && Math.random() < 0.4) {
          tileId = 3; // 森林
        } else if (x < config.width * 0.3 && y < config.height * 0.3 && Math.random() < 0.3) {
          tileId = 4; // 沙漠
        } else if ((x % 4 === 0 || y % 4 === 0) && height >= 0 && Math.random() < 0.15) {
          tileId = 6; // 道路
        }

        row.push(tileId);
      }
      terrainData.push(row);
    }

    layers.push({
      id: 'terrain',
      name: '地形层',
      type: 'terrain',
      visible: true,
      opacity: 1,
      data: terrainData
    });

    // 城池对象图层
    const cityObjects: IsometricObjectData[] = [
      {
        id: 'luoyang',
        type: 'city',
        x: 15, y: 6, z: 2,
        width: 2, height: 2, depth: 3,
        properties: { name: '洛阳', kingdom: 'wei', level: 5, population: 500000 }
      },
      {
        id: 'chengdu',
        type: 'city',
        x: 6, y: 14, z: 3,
        width: 2, height: 2, depth: 2,
        properties: { name: '成都', kingdom: 'shu', level: 4, population: 300000 }
      },
      {
        id: 'jianye',
        type: 'city',
        x: 22, y: 15, z: 1,
        width: 2, height: 2, depth: 2,
        properties: { name: '建业', kingdom: 'wu', level: 4, population: 350000 }
      },
      {
        id: 'xiangyang',
        type: 'city',
        x: 12, y: 10, z: 2,
        width: 1, height: 1, depth: 2,
        properties: { name: '襄阳', kingdom: 'neutral', level: 3, population: 150000 }
      }
    ];

    // 将城池放置到地形图层上
    cityObjects.forEach(city => {
      for (let dy = 0; dy < city.height; dy++) {
        for (let dx = 0; dx < city.width; dx++) {
          const mapX = city.x + dx;
          const mapY = city.y + dy;
          if (mapY < config.height && mapX < config.width && terrainData[mapY]) {
            terrainData[mapY][mapX] = 5; // 城池瓦片
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
    const cities: IsometricCity[] = cityObjects.map(obj => ({
      id: obj.id,
      name: obj.properties.name,
      x: obj.x,
      y: obj.y,
      z: obj.z,
      kingdom: obj.properties.kingdom,
      level: obj.properties.level,
      population: obj.properties.population,
      buildings: [],
      elevation: obj.z * 5
    }));

    setMapData(prev => ({ ...prev, layers, cities }));
    setDebugInfo(prev => ({ 
      ...prev, 
      layersCreated: true, 
      objectsPlaced: true,
      totalObjects: cityObjects.length
    }));
    console.log('✅ [Isometric Map] 等距图层生成完成');
  }, [config.width, config.height, mapData.heightMap]);

  // 渲染等距瓦片图层
  const renderIsometricTileLayer = useCallback((ctx: CanvasRenderingContext2D, layer: IsometricLayer) => {
    if (!config.layers[layer.id] || !layer.visible) return;
    if (layer.type !== 'terrain' || !Array.isArray(layer.data[0])) return;

    const tilesetImage = imageCache.current['isometric_tileset'];
    if (!tilesetImage) return;

    const data = layer.data as number[][];
    const { tileWidth, tileHeight, tileDepth, scale, cameraX, cameraY } = config;
    const scaledTileW = tileWidth * scale;
    const scaledTileH = tileHeight * scale;
    const scaledTileD = tileDepth * scale;

    ctx.globalAlpha = layer.opacity;
    ctx.imageSmoothingEnabled = false;

    let visibleTiles = 0;

    // 按等距顺序渲染（从后到前）
    const renderOrder = coordUtils.getRenderOrder(config.width, config.height);

    renderOrder.forEach(({ x, y }) => {
      if (data[y] && data[y][x] !== undefined) {
        const tileId = data[y][x];
        if (tileId >= 0) {
          const heightValue = mapData.heightMap[y]?.[x] || 0;
          const tile = mapData.tileset[tileId];
          
          // 转换为屏幕坐标
          const screenPos = coordUtils.tileToScreen(x, y, heightValue);
          const screenX = screenPos.x * scale + cameraX + ctx.canvas.width / 2;
          const screenY = screenPos.y * scale + cameraY + ctx.canvas.height / 4;

          // 裁剪检查
          if (screenX > -scaledTileW && screenX < ctx.canvas.width + scaledTileW &&
              screenY > -scaledTileH - scaledTileD * 4 && screenY < ctx.canvas.height + scaledTileH) {
            
            const tileHeight = scaledTileH + Math.max(0, tile?.height || 0) * scaledTileD;
            
            // 从瓦片集中绘制对应瓦片
            ctx.drawImage(
              tilesetImage,
              tileId * tileWidth, 0, tileWidth, tileHeight / scale, // 源矩形
              screenX - scaledTileW / 2, screenY - tileHeight, scaledTileW, tileHeight // 目标矩形
            );

            // 绘制阴影效果
            if (config.showShadows && tile && tile.height > 0) {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
              const shadowOffset = tile.height * 2;
              ctx.fillRect(
                screenX - scaledTileW / 2 + shadowOffset,
                screenY + shadowOffset,
                scaledTileW,
                scaledTileH / 2
              );
            }

            // 显示高度数值
            if (config.showHeights && heightValue !== 0) {
              ctx.fillStyle = heightValue > 0 ? '#4CAF50' : '#2196F3';
              ctx.font = `bold ${Math.max(10, scaledTileW / 6)}px monospace`;
              ctx.textAlign = 'center';
              ctx.fillText(
                heightValue.toString(),
                screenX,
                screenY - scaledTileH / 2
              );
            }

            visibleTiles++;
          }
        }
      }
    });

    setDebugInfo(prev => ({ ...prev, visibleTiles }));
    ctx.globalAlpha = 1;
  }, [config, mapData, coordUtils]);

  // 渲染等距对象图层
  const renderIsometricObjectLayer = useCallback((ctx: CanvasRenderingContext2D, layer: IsometricLayer) => {
    if (!config.layers[layer.id] || !layer.visible) return;
    if (layer.type !== 'object') return;

    const objects = layer.data as IsometricObjectData[];
    const { scale, cameraX, cameraY } = config;

    ctx.globalAlpha = layer.opacity;

    objects.forEach(obj => {
      const screenPos = coordUtils.tileToScreen(obj.x, obj.y, obj.z);
      const screenX = screenPos.x * scale + cameraX + ctx.canvas.width / 2;
      const screenY = screenPos.y * scale + cameraY + ctx.canvas.height / 4;

      if (obj.type === 'city') {
        const kingdomColors = {
          wei: { base: '#4285F4', light: '#64B5F6', dark: '#1976D2' },
          shu: { base: '#34A853', light: '#66BB6A', dark: '#388E3C' },
          wu: { base: '#FBBC04', light: '#FFCA28', dark: '#FFA000' },
          neutral: { base: '#9E9E9E', light: '#BDBDBD', dark: '#616161' }
        };

        const colors = kingdomColors[obj.properties.kingdom as keyof typeof kingdomColors] || kingdomColors.neutral;
        const buildingWidth = obj.width * config.tileWidth * scale;
        const buildingHeight = obj.height * config.tileHeight * scale;
        const buildingDepth = obj.depth * config.tileDepth * scale;

        // 绘制3D城池建筑
        // 顶面
        ctx.fillStyle = colors.light;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - buildingDepth);
        ctx.lineTo(screenX + buildingWidth / 2, screenY - buildingHeight / 2 - buildingDepth);
        ctx.lineTo(screenX, screenY - buildingHeight - buildingDepth);
        ctx.lineTo(screenX - buildingWidth / 2, screenY - buildingHeight / 2 - buildingDepth);
        ctx.closePath();
        ctx.fill();

        // 左侧面
        ctx.fillStyle = colors.dark;
        ctx.beginPath();
        ctx.moveTo(screenX - buildingWidth / 2, screenY - buildingHeight / 2 - buildingDepth);
        ctx.lineTo(screenX, screenY - buildingHeight - buildingDepth);
        ctx.lineTo(screenX, screenY - buildingHeight);
        ctx.lineTo(screenX - buildingWidth / 2, screenY - buildingHeight / 2);
        ctx.closePath();
        ctx.fill();

        // 右侧面
        ctx.fillStyle = colors.base;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - buildingHeight - buildingDepth);
        ctx.lineTo(screenX + buildingWidth / 2, screenY - buildingHeight / 2 - buildingDepth);
        ctx.lineTo(screenX + buildingWidth / 2, screenY - buildingHeight / 2);
        ctx.lineTo(screenX, screenY - buildingHeight);
        ctx.closePath();
        ctx.fill();

        // 城池名称
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(12, buildingWidth / 4)}px SimHei`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText(obj.properties.name, screenX, screenY + 20);
        ctx.fillText(obj.properties.name, screenX, screenY + 20);

        // 等级星星
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < obj.properties.level; i++) {
          const starX = screenX - (obj.properties.level * 6) / 2 + i * 12;
          const starY = screenY + 35;
          drawStar(ctx, starX, starY, 5, 2, 5);
        }
      }
    });

    ctx.globalAlpha = 1;
  }, [config, coordUtils]);

  // 绘制星星的辅助函数
  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, outerRadius: number, innerRadius: number, points: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const pointX = x + Math.cos(angle) * radius;
      const pointY = y + Math.sin(angle) * radius;
      ctx.lineTo(pointX, pointY);
    }
    
    ctx.closePath();
    ctx.fill();
  };

  // 渲染等距网格
  const renderIsometricGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!config.showGrid) return;

    const { scale, cameraX, cameraY } = config;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    // 绘制等距网格
    for (let y = 0; y <= config.height; y++) {
      for (let x = 0; x <= config.width; x++) {
        const screenPos = coordUtils.tileToScreen(x, y, 0);
        const screenX = screenPos.x * scale + cameraX + ctx.canvas.width / 2;
        const screenY = screenPos.y * scale + cameraY + ctx.canvas.height / 4;

        // 水平网格线
        if (x < config.width) {
          const nextPos = coordUtils.tileToScreen(x + 1, y, 0);
          const nextScreenX = nextPos.x * scale + cameraX + ctx.canvas.width / 2;
          const nextScreenY = nextPos.y * scale + cameraY + ctx.canvas.height / 4;
          
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(nextScreenX, nextScreenY);
          ctx.stroke();
        }

        // 垂直网格线
        if (y < config.height) {
          const nextPos = coordUtils.tileToScreen(x, y + 1, 0);
          const nextScreenX = nextPos.x * scale + cameraX + ctx.canvas.width / 2;
          const nextScreenY = nextPos.y * scale + cameraY + ctx.canvas.height / 4;
          
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(nextScreenX, nextScreenY);
          ctx.stroke();
        }
      }
    }
  }, [config, coordUtils]);

  // 主渲染循环
  const render = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = performance.now();

    // 计算FPS
    const fps = Math.round(1000 / (time - (render as any).lastTime || 16));
    (render as any).lastTime = time;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 渲染各图层
    mapData.layers.forEach(layer => {
      if (layer.type === 'terrain') {
        renderIsometricTileLayer(ctx, layer);
      } else if (layer.type === 'object') {
        renderIsometricObjectLayer(ctx, layer);
      }
    });

    // 渲染网格
    renderIsometricGrid(ctx);

    const renderTime = performance.now() - startTime;
    setDebugInfo(prev => ({ ...prev, fps, renderingActive: true, renderTime: Math.round(renderTime) }));

    animationRef.current = requestAnimationFrame(render);
  }, [mapData.layers, renderIsometricTileLayer, renderIsometricObjectLayer, renderIsometricGrid]);

  // 初始化等距地图
  useEffect(() => {
    const initIsometricMap = async () => {
      console.log('🎯 [Isometric Map] 开始初始化2.5D等距地图...');
      setLoadingStatus('准备初始化...');
      setLoadingProgress(0);

      try {
        await createIsometricTileset();
        setLoadingProgress(40);

        await generateHeightMap();
        setLoadingProgress(60);

        await createIsometricLayers();
        setLoadingProgress(90);

        setLoadingStatus('准备完成...');
        setLoadingProgress(100);

        setTimeout(() => {
          setLoading(false);
          console.log('🎉 [Isometric Map] 2.5D等距地图初始化完成!');
        }, 500);

      } catch (error) {
        console.error('❌ [Isometric Map] 初始化失败:', error);
        setLoadingStatus(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };

    initIsometricMap();
  }, [createIsometricTileset, generateHeightMap, createIsometricLayers]);

  // 启动渲染循环
  useEffect(() => {
    if (!loading) {
      console.log('🎬 [Isometric Map] 启动渲染循环...');
      animationRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationRef.current) {
        console.log('🛑 [Isometric Map] 停止渲染循环');
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
    const screenX = event.clientX - rect.left - config.cameraX - canvas.width / 2;
    const screenY = event.clientY - rect.top - config.cameraY - canvas.height / 4;

    // 转换为瓦片坐标
    const tileCoords = coordUtils.screenToTile(screenX / config.scale, screenY / config.scale);

    // 检查点击的城池
    const clickedCity = mapData.cities.find(city => 
      tileCoords.x >= city.x && tileCoords.x < city.x + 2 &&
      tileCoords.y >= city.y && tileCoords.y < city.y + 2
    );

    if (clickedCity) {
      setSelectedCity(clickedCity);
    }
  }, [config, mapData.cities, coordUtils]);

  // 控制面板变化
  const handleConfigChange = (key: keyof IsometricMapConfig, value: any) => {
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
      scale: 1.5
    }));
  };

  // 聚焦到城池
  const focusOnCity = (city: IsometricCity) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const screenPos = coordUtils.tileToScreen(city.x, city.y, city.z);
    const centerX = -screenPos.x * config.scale;
    const centerY = -screenPos.y * config.scale;

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
          border: '2px solid #ff6b35'
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#fff', mb: 3 }}>
            🎯 2.5D等距地图
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
          
          <Typography variant="body1" sx={{ color: '#ff6b35', mb: 3 }}>
            {loadingStatus}
          </Typography>
          
          <Stack spacing={1} sx={{ mt: 3 }}>
            <Typography variant="caption" sx={{ color: '#fff', textAlign: 'left' }}>
              等距系统状态:
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
              <div>🎨 等距瓦片: {debugInfo.tilesLoaded ? '完成' : '等待中...'}</div>
              <div>🏔️ 高度图: {debugInfo.heightMapGenerated ? '完成' : '等待中...'}</div>
              <div>🗺️ 图层生成: {debugInfo.layersCreated ? '完成' : '等待中...'}</div>
              <div>🏰 对象放置: {debugInfo.objectsPlaced ? '完成' : '等待中...'}</div>
              <div>🎬 渲染启动: {debugInfo.renderingActive ? '完成' : '等待中...'}</div>
              {debugInfo.totalObjects > 0 && <div>📦 游戏对象: {debugInfo.totalObjects}</div>}
              {debugInfo.fps > 0 && <div>⚡ FPS: {debugInfo.fps}</div>}
            </Box>
          </Stack>
          
          <Typography variant="caption" sx={{ color: '#999', mt: 2, display: 'block' }}>
            提示: 2.5D等距视角，支持高度和阴影效果
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
            <View3DIcon sx={{ mr: 1 }} />
            2.5D等距地图
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => navigate('/map/strategic')}
            sx={{ mr: 1 }}
          >
            策略棋盘
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/map/3d')}
            sx={{ mr: 1 }}
          >
            3D地图
          </Button>
          <Button color="inherit" onClick={() => navigate('/home')}>
            返回主页
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* 2.5D等距地图画布 */}
        <canvas
          ref={canvasRef}
          className="isometric-map-canvas"
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

        {/* 等距地图控制面板 */}
        <Paper
          className="isometric-controls"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            p: 2,
            minWidth: 300,
            maxHeight: '80vh',
            overflow: 'auto'
          }}
        >
          <Typography variant="h6" gutterBottom>
            2.5D控制
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Typography gutterBottom>缩放: {config.scale.toFixed(1)}x</Typography>
              <Slider
                value={config.scale}
                onChange={(_, value) => handleConfigChange('scale', value)}
                min={0.5}
                max={3}
                step={0.1}
                marks
              />
            </Box>
            
            <Box>
              <Typography gutterBottom>光照角度: {config.lightAngle}°</Typography>
              <Slider
                value={config.lightAngle}
                onChange={(_, value) => handleConfigChange('lightAngle', value)}
                min={0}
                max={360}
                step={15}
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
                    {layerId === 'height' && '高度层'}
                    {layerId === 'objects' && '对象层'}
                    {layerId === 'cities' && '城池层'}
                    {layerId === 'decoration' && '装饰层'}
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
                  checked={config.showHeights}
                  onChange={(e) => handleConfigChange('showHeights', e.target.checked)}
                />
              }
              label="显示高度"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={config.showShadows}
                  onChange={(e) => handleConfigChange('showShadows', e.target.checked)}
                />
              }
              label="显示阴影"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={config.enableLighting}
                  onChange={(e) => handleConfigChange('enableLighting', e.target.checked)}
                />
              }
              label="启用光照"
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
            minWidth: 220
          }}
        >
          <Typography variant="h6" gutterBottom>
            性能监控
          </Typography>
          
          <Stack spacing={1}>
            <Typography variant="body2">
              FPS: {debugInfo.fps}
            </Typography>
            <Typography variant="body2">
              渲染时间: {debugInfo.renderTime}ms
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
              缩放: {config.scale.toFixed(1)}x
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
                      坐标: ({selectedCity.x}, {selectedCity.y}) | 海拔: {selectedCity.elevation}m
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

export default IsometricMapPage;