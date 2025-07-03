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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Timeline as TimelineIcon,
  Build as BuildIcon,
  Group as ArmyIcon,
  Flag as FlagIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/strategic-board-map.css';

// 地形类型枚举
enum TerrainType {
  PLAINS = 'plains',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  WATER = 'water',
  DESERT = 'desert',
  CITY = 'city',
  FORTRESS = 'fortress',
  BRIDGE = 'bridge'
}

// 建筑类型
enum BuildingType {
  CITY = 'city',
  FORTRESS = 'fortress',
  FARM = 'farm',
  MINE = 'mine',
  BARRACKS = 'barracks',
  WORKSHOP = 'workshop'
}

// 军队单位
interface ArmyUnit {
  id: string;
  name: string;
  type: 'infantry' | 'cavalry' | 'archer' | 'siege';
  count: number;
  attack: number;
  defense: number;
  movement: number;
  x: number;
  y: number;
  kingdom: 'wei' | 'shu' | 'wu';
  isSelected: boolean;
  canMove: boolean;
  path?: { x: number; y: number }[];
}

// 城池数据
interface StrategicCity {
  id: string;
  name: string;
  x: number;
  y: number;
  level: number;
  kingdom: 'wei' | 'shu' | 'wu' | 'neutral';
  population: number;
  defenseLevel: number;
  economyLevel: number;
  buildings: BuildingType[];
  isCapital: boolean;
  isPlayerControlled: boolean;
  garrison: ArmyUnit[];
  production: {
    food: number;
    gold: number;
    wood: number;
    iron: number;
  };
  underSiege: boolean;
}

// 地图配置
interface MapConfig {
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  scale: number;
  showGrid: boolean;
  showTerritories: boolean;
  showMovementRange: boolean;
  showBattlePredictions: boolean;
  animationSpeed: number;
  currentTurn: number;
  isPaused: boolean;
}

// 策略棋盘地图页面
const StrategicBoardMapPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const [selectedCity, setSelectedCity] = useState<StrategicCity | null>(null);
  const [selectedArmy, setSelectedArmy] = useState<ArmyUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('初始化策略棋盘...');
  
  const [config, setConfig] = useState<MapConfig>({
    gridWidth: 20,
    gridHeight: 15,
    cellSize: 64,
    scale: 1,
    showGrid: true,
    showTerritories: true,
    showMovementRange: false,
    showBattlePredictions: true,
    animationSpeed: 1,
    currentTurn: 1,
    isPaused: false
  });

  const [gameState, setGameState] = useState({
    terrain: [] as TerrainType[][],
    cities: [] as StrategicCity[],
    armies: [] as ArmyUnit[],
    territories: {} as Record<string, { x: number; y: number; kingdom: string }[]>,
    currentPlayer: 'wei' as 'wei' | 'shu' | 'wu',
    turnPhase: 'movement' as 'movement' | 'combat' | 'building' | 'diplomacy'
  });

  const [debugInfo, setDebugInfo] = useState({
    terrainGenerated: false,
    citiesCreated: false,
    armiesDeployed: false,
    territoriesCalculated: false,
    renderingActive: false,
    fps: 0,
    lastFrameTime: 0
  });

  // 地形和建筑的颜色配置
  const colors = useMemo(() => ({
    terrain: {
      [TerrainType.PLAINS]: '#7ED321',
      [TerrainType.FOREST]: '#417505',
      [TerrainType.MOUNTAIN]: '#8B7355',
      [TerrainType.WATER]: '#4A90E2',
      [TerrainType.DESERT]: '#F5A623',
      [TerrainType.CITY]: '#BD10E0',
      [TerrainType.FORTRESS]: '#9013FE',
      [TerrainType.BRIDGE]: '#795548'
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
      grid: '#FFFFFF33',
      selection: '#FF6B3580',
      movement: '#4CAF5080',
      attack: '#F4433680'
    }
  }), []);

  // 生成地形
  const generateTerrain = useCallback(async () => {
    console.log('🎯 [Strategic Map] 开始生成策略地形...');
    setLoadingStatus('生成策略地形...');
    setLoadingProgress(20);

    const newTerrain: TerrainType[][] = [];
    
    for (let y = 0; y < config.gridHeight; y++) {
      const row: TerrainType[] = [];
      for (let x = 0; x < config.gridWidth; x++) {
        let terrain = TerrainType.PLAINS;
        
        // 边缘区域设置为水域
        if (x === 0 || x === config.gridWidth - 1 || y === 0 || y === config.gridHeight - 1) {
          if (Math.random() < 0.7) terrain = TerrainType.WATER;
        }
        // 山脉（对角线分布）
        else if ((x + y) % 7 === 0 && Math.random() < 0.6) {
          terrain = TerrainType.MOUNTAIN;
        }
        // 森林（集群分布）
        else if (Math.random() < 0.25) {
          terrain = TerrainType.FOREST;
        }
        // 沙漠（西北角）
        else if (x < 5 && y < 5 && Math.random() < 0.4) {
          terrain = TerrainType.DESERT;
        }
        
        row.push(terrain);
      }
      newTerrain.push(row);
    }

    setGameState(prev => ({ ...prev, terrain: newTerrain }));
    setDebugInfo(prev => ({ ...prev, terrainGenerated: true }));
    console.log('✅ [Strategic Map] 策略地形生成完成');
  }, [config.gridWidth, config.gridHeight]);

  // 生成城池
  const generateCities = useCallback(async () => {
    console.log('🏰 [Strategic Map] 开始生成策略城池...');
    setLoadingStatus('部署城池和要塞...');
    setLoadingProgress(40);

    const cities: StrategicCity[] = [
      {
        id: 'luoyang',
        name: '洛阳',
        x: 10, y: 4,
        level: 5,
        kingdom: 'wei',
        population: 500000,
        defenseLevel: 5,
        economyLevel: 5,
        buildings: [BuildingType.CITY, BuildingType.BARRACKS, BuildingType.WORKSHOP],
        isCapital: true,
        isPlayerControlled: false,
        garrison: [],
        production: { food: 1000, gold: 800, wood: 300, iron: 400 },
        underSiege: false
      },
      {
        id: 'chengdu',
        name: '成都',
        x: 3, y: 10,
        level: 4,
        kingdom: 'shu',
        population: 300000,
        defenseLevel: 4,
        economyLevel: 4,
        buildings: [BuildingType.CITY, BuildingType.FARM, BuildingType.MINE],
        isCapital: true,
        isPlayerControlled: true,
        garrison: [],
        production: { food: 1200, gold: 600, wood: 500, iron: 300 },
        underSiege: false
      },
      {
        id: 'jianye',
        name: '建业',
        x: 16, y: 11,
        level: 4,
        kingdom: 'wu',
        population: 350000,
        defenseLevel: 4,
        economyLevel: 5,
        buildings: [BuildingType.CITY, BuildingType.WORKSHOP, BuildingType.BARRACKS],
        isCapital: true,
        isPlayerControlled: false,
        garrison: [],
        production: { food: 800, gold: 1000, wood: 400, iron: 200 },
        underSiege: false
      },
      {
        id: 'xiangyang',
        name: '襄阳',
        x: 8, y: 8,
        level: 3,
        kingdom: 'neutral',
        population: 150000,
        defenseLevel: 5,
        economyLevel: 2,
        buildings: [BuildingType.FORTRESS, BuildingType.BARRACKS],
        isCapital: false,
        isPlayerControlled: false,
        garrison: [],
        production: { food: 400, gold: 200, wood: 100, iron: 300 },
        underSiege: false
      }
    ];

    // 更新地形以标记城池位置
    setGameState(prev => {
      const newTerrain = [...prev.terrain];
      cities.forEach(city => {
        if (newTerrain[city.y] && newTerrain[city.y][city.x] !== undefined) {
          newTerrain[city.y][city.x] = city.isCapital ? TerrainType.CITY : TerrainType.FORTRESS;
        }
      });
      return { ...prev, terrain: newTerrain, cities };
    });

    setDebugInfo(prev => ({ ...prev, citiesCreated: true }));
    console.log(`✅ [Strategic Map] ${cities.length}个策略城池部署完成`);
  }, []);

  // 生成军队
  const generateArmies = useCallback(async () => {
    console.log('⚔️ [Strategic Map] 开始部署军队...');
    setLoadingStatus('部署军队单位...');
    setLoadingProgress(60);

    const armies: ArmyUnit[] = [
      // 蜀国军队（玩家控制）
      {
        id: 'shu-army-1',
        name: '刘备军',
        type: 'infantry',
        count: 1000,
        attack: 80,
        defense: 75,
        movement: 3,
        x: 4, y: 10,
        kingdom: 'shu',
        isSelected: false,
        canMove: true
      },
      {
        id: 'shu-army-2',
        name: '关羽军',
        type: 'cavalry',
        count: 500,
        attack: 90,
        defense: 70,
        movement: 4,
        x: 2, y: 9,
        kingdom: 'shu',
        isSelected: false,
        canMove: true
      },
      // 魏国军队
      {
        id: 'wei-army-1',
        name: '曹操军',
        type: 'infantry',
        count: 1500,
        attack: 85,
        defense: 80,
        movement: 3,
        x: 11, y: 4,
        kingdom: 'wei',
        isSelected: false,
        canMove: true
      },
      {
        id: 'wei-army-2',
        name: '夏侯惇军',
        type: 'cavalry',
        count: 800,
        attack: 88,
        defense: 72,
        movement: 4,
        x: 9, y: 3,
        kingdom: 'wei',
        isSelected: false,
        canMove: true
      },
      // 吴国军队
      {
        id: 'wu-army-1',
        name: '孙权军',
        type: 'archer',
        count: 600,
        attack: 75,
        defense: 65,
        movement: 3,
        x: 17, y: 11,
        kingdom: 'wu',
        isSelected: false,
        canMove: true
      }
    ];

    setGameState(prev => ({ ...prev, armies }));
    setDebugInfo(prev => ({ ...prev, armiesDeployed: true }));
    console.log(`✅ [Strategic Map] ${armies.length}支军队部署完成`);
  }, []);

  // 计算势力范围
  const calculateTerritories = useCallback(async () => {
    console.log('🏛️ [Strategic Map] 开始计算势力范围...');
    setLoadingStatus('计算势力范围...');
    setLoadingProgress(80);

    const territories: Record<string, { x: number; y: number; kingdom: string }[]> = {
      wei: [],
      shu: [],
      wu: [],
      neutral: []
    };

    // 基于城池位置扩散势力范围
    gameState.cities.forEach(city => {
      const influence = city.isCapital ? 4 : 2;
      
      for (let dy = -influence; dy <= influence; dy++) {
        for (let dx = -influence; dx <= influence; dx++) {
          const x = city.x + dx;
          const y = city.y + dy;
          const distance = Math.abs(dx) + Math.abs(dy);
          
          if (x >= 0 && x < config.gridWidth && 
              y >= 0 && y < config.gridHeight && 
              distance <= influence) {
            
            territories[city.kingdom].push({ x, y, kingdom: city.kingdom });
          }
        }
      }
    });

    setGameState(prev => ({ ...prev, territories }));
    setDebugInfo(prev => ({ ...prev, territoriesCalculated: true }));
    console.log('✅ [Strategic Map] 势力范围计算完成');
  }, [gameState.cities, config.gridWidth, config.gridHeight]);

  // 绘制地形
  const drawTerrain = useCallback((ctx: CanvasRenderingContext2D) => {
    const { terrain } = gameState;
    const { cellSize, scale } = config;
    const size = cellSize * scale;

    for (let y = 0; y < terrain.length; y++) {
      for (let x = 0; x < terrain[y].length; x++) {
        const terrainType = terrain[y][x];
        const screenX = x * size;
        const screenY = y * size;

        // 基础地形颜色
        ctx.fillStyle = colors.terrain[terrainType];
        ctx.fillRect(screenX, screenY, size, size);

        // 地形纹理效果
        if (terrainType === TerrainType.MOUNTAIN) {
          // 山峰效果
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(screenX, screenY, size * 0.3, size * 0.3);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(screenX + size * 0.7, screenY + size * 0.7, size * 0.3, size * 0.3);
        } else if (terrainType === TerrainType.WATER) {
          // 水波效果
          const time = Date.now() * 0.002;
          const wave = Math.sin(time + x * 0.5 + y * 0.3) * 0.1;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + wave})`;
          ctx.fillRect(screenX, screenY, size, size);
        } else if (terrainType === TerrainType.FOREST) {
          // 森林纹理
          ctx.fillStyle = 'rgba(0, 100, 0, 0.5)';
          for (let i = 0; i < 3; i++) {
            const treeX = screenX + (i * size) / 3 + size / 6;
            const treeY = screenY + size / 4;
            ctx.fillRect(treeX - 2, treeY, 4, size / 2);
          }
        }
      }
    }
  }, [gameState.terrain, config, colors]);

  // 绘制势力范围
  const drawTerritories = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!config.showTerritories) return;

    const { territories } = gameState;
    const { cellSize, scale } = config;
    const size = cellSize * scale;

    Object.entries(territories).forEach(([kingdom, cells]) => {
      ctx.fillStyle = colors.kingdoms[kingdom as keyof typeof colors.kingdoms] + '20';
      cells.forEach(({ x, y }) => {
        ctx.fillRect(x * size, y * size, size, size);
      });

      // 势力边界
      ctx.strokeStyle = colors.kingdoms[kingdom as keyof typeof colors.kingdoms] + '80';
      ctx.lineWidth = 2;
      cells.forEach(({ x, y }) => {
        ctx.strokeRect(x * size, y * size, size, size);
      });
    });
  }, [gameState.territories, config, colors]);

  // 绘制城池
  const drawCities = useCallback((ctx: CanvasRenderingContext2D) => {
    const { cities } = gameState;
    const { cellSize, scale } = config;
    const size = cellSize * scale;

    cities.forEach(city => {
      const screenX = city.x * size;
      const screenY = city.y * size;

      // 城池背景
      ctx.fillStyle = colors.kingdoms[city.kingdom];
      if (city.isCapital) {
        // 都城使用圆形
        ctx.beginPath();
        ctx.arc(screenX + size/2, screenY + size/2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 普通城池使用方形
        ctx.fillRect(screenX + size*0.1, screenY + size*0.1, size*0.8, size*0.8);
      }

      // 城池边框
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      if (city.isCapital) {
        ctx.beginPath();
        ctx.arc(screenX + size/2, screenY + size/2, size * 0.4, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(screenX + size*0.1, screenY + size*0.1, size*0.8, size*0.8);
      }

      // 城池等级指示器
      ctx.fillStyle = '#FFD700';
      for (let i = 0; i < city.level; i++) {
        const dotX = screenX + 4 + (i * 8);
        const dotY = screenY + 4;
        ctx.fillRect(dotX, dotY, 6, 6);
      }

      // 城池名称
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(12, size/4)}px SimHei`;
      ctx.textAlign = 'center';
      ctx.fillText(city.name, screenX + size/2, screenY + size + 16);

      // 玩家控制标记
      if (city.isPlayerControlled) {
        ctx.fillStyle = colors.ui.primary;
        ctx.fillRect(screenX + size - 12, screenY, 12, 12);
      }

      // 被围困标记
      if (city.underSiege) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(screenX, screenY, size, size);
        ctx.setLineDash([]);
      }
    });
  }, [gameState.cities, config, colors]);

  // 绘制军队
  const drawArmies = useCallback((ctx: CanvasRenderingContext2D) => {
    const { armies } = gameState;
    const { cellSize, scale } = config;
    const size = cellSize * scale;

    armies.forEach(army => {
      const screenX = army.x * size;
      const screenY = army.y * size;

      // 军队背景（根据类型选择形状）
      ctx.fillStyle = colors.kingdoms[army.kingdom];
      ctx.save();
      ctx.translate(screenX + size/2, screenY + size/2);

      switch (army.type) {
        case 'infantry':
          // 步兵 - 方形
          ctx.fillRect(-size*0.25, -size*0.25, size*0.5, size*0.5);
          break;
        case 'cavalry':
          // 骑兵 - 菱形
          ctx.beginPath();
          ctx.moveTo(0, -size*0.3);
          ctx.lineTo(size*0.3, 0);
          ctx.lineTo(0, size*0.3);
          ctx.lineTo(-size*0.3, 0);
          ctx.closePath();
          ctx.fill();
          break;
        case 'archer':
          // 弓兵 - 三角形
          ctx.beginPath();
          ctx.moveTo(0, -size*0.3);
          ctx.lineTo(size*0.25, size*0.2);
          ctx.lineTo(-size*0.25, size*0.2);
          ctx.closePath();
          ctx.fill();
          break;
        case 'siege':
          // 攻城器械 - 六边形
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * size * 0.25;
            const y = Math.sin(angle) * size * 0.25;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          break;
      }

      ctx.restore();

      // 军队边框
      ctx.strokeStyle = army.isSelected ? colors.ui.selection : '#FFFFFF';
      ctx.lineWidth = army.isSelected ? 4 : 2;
      ctx.translate(screenX + size/2, screenY + size/2);
      
      // 重复形状绘制以添加边框
      switch (army.type) {
        case 'infantry':
          ctx.strokeRect(-size*0.25, -size*0.25, size*0.5, size*0.5);
          break;
        case 'cavalry':
          ctx.beginPath();
          ctx.moveTo(0, -size*0.3);
          ctx.lineTo(size*0.3, 0);
          ctx.lineTo(0, size*0.3);
          ctx.lineTo(-size*0.3, 0);
          ctx.closePath();
          ctx.stroke();
          break;
        case 'archer':
          ctx.beginPath();
          ctx.moveTo(0, -size*0.3);
          ctx.lineTo(size*0.25, size*0.2);
          ctx.lineTo(-size*0.25, size*0.2);
          ctx.closePath();
          ctx.stroke();
          break;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换

      // 兵力数量
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(10, size/6)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(army.count.toString(), screenX + size/2, screenY + size + 12);

      // 移动路径预览
      if (army.path && army.path.length > 0) {
        ctx.strokeStyle = colors.ui.movement;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(screenX + size/2, screenY + size/2);
        army.path.forEach(point => {
          ctx.lineTo(point.x * size + size/2, point.y * size + size/2);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 移动范围显示
      if (army.isSelected && config.showMovementRange) {
        ctx.fillStyle = colors.ui.movement;
        for (let dy = -army.movement; dy <= army.movement; dy++) {
          for (let dx = -army.movement; dx <= army.movement; dx++) {
            const distance = Math.abs(dx) + Math.abs(dy);
            if (distance <= army.movement && distance > 0) {
              const moveX = (army.x + dx) * size;
              const moveY = (army.y + dy) * size;
              if (moveX >= 0 && moveX < config.gridWidth * size && 
                  moveY >= 0 && moveY < config.gridHeight * size) {
                ctx.fillRect(moveX, moveY, size, size);
              }
            }
          }
        }
      }
    });
  }, [gameState.armies, config, colors]);

  // 绘制网格
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!config.showGrid) return;

    const { cellSize, scale, gridWidth, gridHeight } = config;
    const size = cellSize * scale;

    ctx.strokeStyle = colors.ui.grid;
    ctx.lineWidth = 1;

    // 垂直线
    for (let x = 0; x <= gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * size, 0);
      ctx.lineTo(x * size, gridHeight * size);
      ctx.stroke();
    }

    // 水平线
    for (let y = 0; y <= gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * size);
      ctx.lineTo(gridWidth * size, y * size);
      ctx.stroke();
    }
  }, [config, colors]);

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

    // 绘制各个层级
    drawTerritories(ctx);
    drawTerrain(ctx);
    drawCities(ctx);
    drawArmies(ctx);
    drawGrid(ctx);

    lastTimeRef.current = time;
    
    if (!config.isPaused) {
      animationRef.current = requestAnimationFrame(render);
    }
  }, [drawTerritories, drawTerrain, drawCities, drawArmies, drawGrid, config.isPaused]);

  // 初始化地图
  useEffect(() => {
    const initStrategicMap = async () => {
      console.log('🎯 [Strategic Map] 开始初始化策略棋盘地图...');
      setLoadingStatus('准备初始化...');
      setLoadingProgress(0);

      try {
        await generateTerrain();
        setLoadingProgress(30);

        await generateCities();
        setLoadingProgress(50);

        await generateArmies();
        setLoadingProgress(70);

        await calculateTerritories();
        setLoadingProgress(90);

        setLoadingStatus('准备完成...');
        setLoadingProgress(100);

        setTimeout(() => {
          setLoading(false);
          console.log('🎉 [Strategic Map] 策略棋盘地图初始化完成!');
        }, 500);

      } catch (error) {
        console.error('❌ [Strategic Map] 初始化失败:', error);
        setLoadingStatus(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };

    initStrategicMap();
  }, [generateTerrain, generateCities, generateArmies, calculateTerritories]);

  // 启动渲染循环
  useEffect(() => {
    if (!loading && !config.isPaused) {
      console.log('🎬 [Strategic Map] 启动渲染循环...');
      animationRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationRef.current) {
        console.log('🛑 [Strategic Map] 停止渲染循环');
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render, loading, config.isPaused]);

  // 设置画布尺寸
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = config.gridWidth * config.cellSize * config.scale;
    canvas.height = config.gridHeight * config.cellSize * config.scale;
  }, [config]);

  // 处理画布点击
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / (config.cellSize * config.scale));
    const y = Math.floor((event.clientY - rect.top) / (config.cellSize * config.scale));

    // 检查是否点击了城池
    const clickedCity = gameState.cities.find(city => city.x === x && city.y === y);
    if (clickedCity) {
      setSelectedCity(clickedCity);
      setSelectedArmy(null);
      return;
    }

    // 检查是否点击了军队
    const clickedArmy = gameState.armies.find(army => army.x === x && army.y === y);
    if (clickedArmy) {
      // 取消其他军队选中状态
      setGameState(prev => ({
        ...prev,
        armies: prev.armies.map(army => ({
          ...army,
          isSelected: army.id === clickedArmy.id
        }))
      }));
      setSelectedArmy(clickedArmy);
      setSelectedCity(null);
      return;
    }

    // 如果有选中的军队，尝试移动
    const selectedArmyUnit = gameState.armies.find(army => army.isSelected);
    if (selectedArmyUnit && selectedArmyUnit.kingdom === gameState.currentPlayer) {
      const distance = Math.abs(x - selectedArmyUnit.x) + Math.abs(y - selectedArmyUnit.y);
      if (distance <= selectedArmyUnit.movement && distance > 0) {
        // 执行移动
        setGameState(prev => ({
          ...prev,
          armies: prev.armies.map(army => 
            army.id === selectedArmyUnit.id 
              ? { ...army, x, y, canMove: false, isSelected: false }
              : army
          )
        }));
        setSelectedArmy(null);
      }
    }
  }, [config, gameState.cities, gameState.armies, gameState.currentPlayer]);

  // 控制面板变化
  const handleConfigChange = (key: keyof MapConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
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

  // 结束回合
  const endTurn = () => {
    setConfig(prev => ({ ...prev, currentTurn: prev.currentTurn + 1 }));
    setGameState(prev => {
      const players = ['wei', 'shu', 'wu'] as const;
      const currentIndex = players.indexOf(prev.currentPlayer);
      const nextPlayer = players[(currentIndex + 1) % players.length];
      
      return {
        ...prev,
        currentPlayer: nextPlayer,
        armies: prev.armies.map(army => ({ ...army, canMove: true, isSelected: false }))
      };
    });
    setSelectedArmy(null);
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
            🎯 三国策略棋盘
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
              策略系统状态:
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
              <div>🎯 地形生成: {debugInfo.terrainGenerated ? '完成' : '等待中...'}</div>
              <div>🏰 城池部署: {debugInfo.citiesCreated ? '完成' : '等待中...'}</div>
              <div>⚔️ 军队部署: {debugInfo.armiesDeployed ? '完成' : '等待中...'}</div>
              <div>🏛️ 势力计算: {debugInfo.territoriesCalculated ? '完成' : '等待中...'}</div>
              <div>🎬 渲染启动: {debugInfo.renderingActive ? '完成' : '等待中...'}</div>
              {debugInfo.fps > 0 && <div>⚡ FPS: {debugInfo.fps}</div>}
            </Box>
          </Stack>
          
          <Typography variant="caption" sx={{ color: '#999', mt: 2, display: 'block' }}>
            提示: 策略棋盘风格，支持回合制操作
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
            <TimelineIcon sx={{ mr: 1 }} />
            三国策略棋盘
          </Typography>
          <Chip 
            label={`第${config.currentTurn}回合`}
            color="primary" 
            sx={{ mr: 2 }}
          />
          <Chip 
            label={gameState.currentPlayer === 'wei' ? '魏国' : 
                   gameState.currentPlayer === 'shu' ? '蜀国' : '吴国'}
            color={gameState.currentPlayer === 'wei' ? 'primary' : 
                   gameState.currentPlayer === 'shu' ? 'success' : 'warning'}
            sx={{ mr: 2 }}
          />
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
        {/* 策略棋盘画布 */}
        <canvas
          ref={canvasRef}
          className="strategic-board-canvas"
          onClick={handleCanvasClick}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '2px solid #FFD700',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            cursor: 'pointer'
          }}
        />

        {/* 策略控制面板 */}
        <Paper
          className="strategic-controls"
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
            策略控制
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Typography gutterBottom>缩放: {config.scale}x</Typography>
              <Slider
                value={config.scale}
                onChange={(_, value) => handleConfigChange('scale', value)}
                min={0.5}
                max={2}
                step={0.1}
                marks
              />
            </Box>
            
            <Box>
              <Typography gutterBottom>动画速度: {config.animationSpeed}x</Typography>
              <Slider
                value={config.animationSpeed}
                onChange={(_, value) => handleConfigChange('animationSpeed', value)}
                min={0.5}
                max={3}
                step={0.5}
                marks
              />
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
                  checked={config.showTerritories}
                  onChange={(e) => handleConfigChange('showTerritories', e.target.checked)}
                />
              }
              label="显示势力范围"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={config.showMovementRange}
                  onChange={(e) => handleConfigChange('showMovementRange', e.target.checked)}
                />
              }
              label="显示移动范围"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={config.showBattlePredictions}
                  onChange={(e) => handleConfigChange('showBattlePredictions', e.target.checked)}
                />
              }
              label="战斗预测"
            />
            
            <Button
              variant={config.isPaused ? "contained" : "outlined"}
              onClick={() => handleConfigChange('isPaused', !config.isPaused)}
              startIcon={config.isPaused ? <PlayIcon /> : <PauseIcon />}
              fullWidth
            >
              {config.isPaused ? '继续' : '暂停'}
            </Button>
            
            <Button
              variant="contained"
              onClick={endTurn}
              disabled={gameState.currentPlayer !== 'shu'} // 只有玩家回合才能结束
              fullWidth
            >
              结束回合
            </Button>
          </Stack>
        </Paper>

        {/* 游戏状态面板 */}
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
            游戏状态
          </Typography>
          
          <Stack spacing={1}>
            <Typography variant="body2">
              回合: {config.currentTurn}
            </Typography>
            <Typography variant="body2">
              当前玩家: {gameState.currentPlayer === 'wei' ? '魏国' : 
                        gameState.currentPlayer === 'shu' ? '蜀国' : '吴国'}
            </Typography>
            <Typography variant="body2">
              阶段: {gameState.turnPhase === 'movement' ? '移动' :
                    gameState.turnPhase === 'combat' ? '战斗' :
                    gameState.turnPhase === 'building' ? '建设' : '外交'}
            </Typography>
            <Typography variant="body2">
              FPS: {debugInfo.fps}
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
                      <Typography>
                        {selectedCity.isCapital ? '都城' : '城池'}
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
                      {selectedCity.isPlayerControlled && (
                        <Chip label="玩家控制" color="secondary" size="small" />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      等级: {selectedCity.level} | 人口: {selectedCity.population.toLocaleString()}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      防御: {selectedCity.defenseLevel} | 经济: {selectedCity.economyLevel}
                    </Typography>
                    
                    <Box>
                      <Typography variant="body2" gutterBottom>生产:</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={`粮食: ${selectedCity.production.food}`} size="small" />
                        <Chip label={`金币: ${selectedCity.production.gold}`} size="small" />
                        <Chip label={`木材: ${selectedCity.production.wood}`} size="small" />
                        <Chip label={`铁矿: ${selectedCity.production.iron}`} size="small" />
                      </Box>
                    </Box>
                    
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
                        disabled={!selectedCity.isPlayerControlled}
                      >
                        管理建筑
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )}
        </Drawer>

        {/* 军队详情抽屉 */}
        <Drawer
          anchor="right"
          open={!!selectedArmy}
          onClose={() => setSelectedArmy(null)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 320,
            },
          }}
        >
          {selectedArmy && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">{selectedArmy.name}</Typography>
                <IconButton onClick={() => setSelectedArmy(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ArmyIcon />
                      <Typography>
                        {selectedArmy.type === 'infantry' ? '步兵' :
                         selectedArmy.type === 'cavalry' ? '骑兵' :
                         selectedArmy.type === 'archer' ? '弓兵' : '攻城器械'}
                      </Typography>
                      <Chip 
                        label={selectedArmy.kingdom === 'wei' ? '魏国' : 
                               selectedArmy.kingdom === 'shu' ? '蜀国' : '吴国'} 
                        color={selectedArmy.kingdom === 'wei' ? 'primary' : 
                               selectedArmy.kingdom === 'shu' ? 'success' : 'warning'}
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      兵力: {selectedArmy.count} | 移动力: {selectedArmy.movement}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      攻击力: {selectedArmy.attack} | 防御力: {selectedArmy.defense}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      位置: ({selectedArmy.x}, {selectedArmy.y})
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        disabled={!selectedArmy.canMove || selectedArmy.kingdom !== gameState.currentPlayer}
                      >
                        移动军队
                      </Button>
                      <Button 
                        variant="outlined" 
                        fullWidth
                        disabled={selectedArmy.kingdom !== gameState.currentPlayer}
                      >
                        军队详情
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

export default StrategicBoardMapPage;