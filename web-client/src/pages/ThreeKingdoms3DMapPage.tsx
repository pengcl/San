import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
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
  Slider,
  Stack,
  Switch,
  FormControlLabel
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
  Rotate90DegreesCcw as RotateIcon,
  WbSunny as SunIcon,
  Cloud as CloudIcon,
  Opacity as OpacityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import '../styles/three-kingdoms-3d-map.css';

interface MapCity {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  level: number;
  type: 'capital' | 'major' | 'strategic' | 'resource';
  kingdom: 'wei' | 'shu' | 'wu' | 'neutral';
  population: number;
  isMainCity: boolean;
}

interface MapControls {
  zoom: number;
  rotation: number;
  tilt: number;
  showTerrain: boolean;
  showCities: boolean;
  showWeather: boolean;
  timeOfDay: number; // 0-24 小时
}

const ThreeKingdoms3DMapPage: React.FC = () => {
  console.log('🚀 [3D Map] ThreeKingdoms3DMapPage组件开始渲染');
  
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const terrainRef = useRef<THREE.Mesh | null>(null);
  
  const [selectedCity, setSelectedCity] = useState<MapCity | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('初始化...');
  const [debugInfo, setDebugInfo] = useState({
    sceneCreated: false,
    terrainGenerated: false,
    citiesLoaded: false,
    lightsSetup: false,
    weatherCreated: false,
    renderStarted: false,
    lastRenderTime: 0,
    fps: 0
  });
  const [cities, setCities] = useState<MapCity[]>([]);
  const [controls, setControls] = useState<MapControls>({
    zoom: 50,
    rotation: 0,
    tilt: 45,
    showTerrain: true,
    showCities: true,
    showWeather: true,
    timeOfDay: 12
  });

  // 简化：移除过度复杂的状态管理

  // 简化：采用和其他地图页面相同的简单初始化方式

  // 简化初始化 - 采用和2D地图、像素地图相同的简单模式
  useEffect(() => {
    console.log('🔄 [3D Map] useEffect执行，当前状态:', {
      mountRefExists: !!mountRef.current,
      loading,
      containerDimensions: mountRef.current ? {
        width: mountRef.current.clientWidth,
        height: mountRef.current.clientHeight,
        offsetWidth: mountRef.current.offsetWidth,
        offsetHeight: mountRef.current.offsetHeight
      } : null
    });

    if (!mountRef.current) {
      console.log('❌ [3D Map] mountRef.current为null，等待容器挂载...');
      return;
    }

    // 注意：这里不检查loading状态，因为我们需要在容器存在时立即初始化

    console.log('🎮 [3D Map] 开始初始化3D场景 (简化版)');

    const initThreeJS = async () => {
      const container = mountRef.current!;
      console.log('📦 [3D Map] 容器信息:', {
        width: container.clientWidth,
        height: container.clientHeight,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        nodeName: container.nodeName,
        isConnected: container.isConnected
      });
      
      try {
        console.log('🏗️ [3D Map] Step 1: 创建场景');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        console.log('✅ [3D Map] 场景创建成功');
        
        console.log('📷 [3D Map] Step 2: 创建相机');
        const camera = new THREE.PerspectiveCamera(
          75,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        camera.position.set(0, 50, 50);
        camera.lookAt(0, 0, 0);
        console.log('✅ [3D Map] 相机创建成功');

        console.log('🎨 [3D Map] Step 3: 创建渲染器');
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        console.log('✅ [3D Map] 渲染器创建成功');
        
        console.log('🔗 [3D Map] Step 4: 添加渲染器到DOM');
        container.appendChild(renderer.domElement);
        console.log('✅ [3D Map] 渲染器已添加到DOM');

        console.log('💾 [3D Map] Step 5: 保存引用');
        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;
        console.log('✅ [3D Map] 引用保存成功');

        console.log('🏔️ [3D Map] Step 6: 创建地形');
        await createTerrain(scene);
        console.log('✅ [3D Map] 地形创建完成');

        console.log('💡 [3D Map] Step 7: 设置光照');
        await setupLighting(scene);
        console.log('✅ [3D Map] 光照设置完成');

        console.log('🏰 [3D Map] Step 8: 创建城池');
        await createCities(scene);
        console.log('✅ [3D Map] 城池创建完成');

        console.log('🌤️ [3D Map] Step 9: 创建天气效果');
        await createWeatherEffects(scene);
        console.log('✅ [3D Map] 天气效果创建完成');

        console.log('🔄 [3D Map] Step 10: 启动渲染循环');
        const animate = () => {
          requestAnimationFrame(animate);
          updateCamera();
          renderer.render(scene, camera);
        };
        animate();
        console.log('✅ [3D Map] 渲染循环启动');

        console.log('🎯 [3D Map] Step 11: 设置loading为false');
        setLoading(false);
        console.log('🎉 [3D Map] 所有步骤完成，初始化成功!');

      } catch (error) {
        console.error('❌ [3D Map] 初始化失败 at step:', error);
        console.error('错误详情:', error);
      }
    };

    initThreeJS();

    return () => {
      console.log('🧹 [3D Map] 清理函数执行');
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []); // 改为空依赖数组，让它在组件挂载后执行

  // 简化容器尺寸监听
  useEffect(() => {
    const handleResize = () => {
      if (mountRef.current && rendererRef.current && cameraRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 创建地形
  const createTerrain = async (scene: THREE.Scene) => {
    console.log('🏔️ [3D Map] 开始生成地形...');
    
    // 创建地形几何体
    const geometry = new THREE.PlaneGeometry(100, 100, 128, 128);
    console.log('✅ [3D Map] 地形几何体创建完成');
    
    // 生成高度数据（模拟三国地形）
    const vertices = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      
      // 使用噪声函数生成高度
      let height = 0;
      
      // 西南部（蜀国）- 山地
      if (x < -20 && y < -20) {
        height = Math.random() * 8 + 2;
      }
      // 东南部（吴国）- 丘陵
      else if (x > 20 && y < -20) {
        height = Math.random() * 4 + 1;
      }
      // 北部（魏国）- 平原
      else if (y > 20) {
        height = Math.random() * 2;
      }
      // 中部 - 混合地形
      else {
        height = Math.random() * 3;
      }
      
      vertices[i + 2] = height;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    // 创建地形材质
    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      wireframe: false
    });

    // 为地形添加颜色
    const colors = [];
    for (let i = 0; i < vertices.length; i += 3) {
      const height = vertices[i + 2];
      const x = vertices[i];
      const y = vertices[i + 1];
      
      let color = new THREE.Color();
      
      if (height > 6) {
        color.setHex(0xFFFFFF); // 雪山
      } else if (height > 4) {
        color.setHex(0x8B7355); // 山地
      } else if (height > 2) {
        color.setHex(0x228B22); // 丘陵
      } else if (height > 0.5) {
        color.setHex(0x90EE90); // 平原
      } else {
        color.setHex(0x4682B4); // 水域
      }
      
      colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // 创建地形网格
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    terrainRef.current = terrain;
    setDebugInfo(prev => ({ ...prev, terrainGenerated: true }));
    console.log('✅ [3D Map] 地形添加到场景完成');
  };

  // 设置光照
  const setupLighting = async (scene: THREE.Scene) => {
    console.log('💡 [3D Map] 开始设置光照...');
    
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    console.log('✅ [3D Map] 环境光添加完成');

    // 主光源（太阳）
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    console.log('✅ [3D Map] 方向光添加完成');

    // 添加天空盒
    const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x87CEEB,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    
    setDebugInfo(prev => ({ ...prev, lightsSetup: true }));
    console.log('✅ [3D Map] 天空盒和光照设置完成');
  };

  // 创建城池
  const createCities = async (scene: THREE.Scene) => {
    console.log('🏰 [3D Map] 开始创建城池...');
    
    const citiesData: MapCity[] = [
      { 
        id: 'luoyang', name: '洛阳', x: 0, y: 2, z: 20, level: 5, 
        type: 'capital', kingdom: 'wei', population: 500000, isMainCity: false 
      },
      { 
        id: 'changan', name: '长安', x: -10, y: 3, z: 15, level: 5, 
        type: 'capital', kingdom: 'wei', population: 400000, isMainCity: false 
      },
      { 
        id: 'chengdu', name: '成都', x: -30, y: 4, z: -20, level: 4, 
        type: 'capital', kingdom: 'shu', population: 300000, isMainCity: false 
      },
      { 
        id: 'jianye', name: '建业', x: 35, y: 2, z: -15, level: 4, 
        type: 'capital', kingdom: 'wu', population: 350000, isMainCity: false 
      },
      { 
        id: 'xuchang', name: '许昌', x: 5, y: 1, z: 10, level: 3, 
        type: 'major', kingdom: 'wei', population: 200000, isMainCity: false 
      }
    ];

    citiesData.forEach(city => {
      // 创建城池建筑群
      const cityGroup = new THREE.Group();
      
      // 主建筑（宫殿或城楼）
      const buildingGeometry = new THREE.BoxGeometry(2, city.level, 2);
      const kingdomColors = {
        wei: 0x4285F4,
        shu: 0x34A853, 
        wu: 0xFBBC04,
        neutral: 0x9E9E9E
      };
      
      const buildingMaterial = new THREE.MeshLambertMaterial({
        color: kingdomColors[city.kingdom]
      });
      
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.y = city.level / 2;
      building.castShadow = true;
      cityGroup.add(building);

      // 城墙
      const wallGeometry = new THREE.RingGeometry(3, 4, 8);
      const wallMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B7355,
        side: THREE.DoubleSide 
      });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.rotation.x = -Math.PI / 2;
      wall.position.y = 0.1;
      cityGroup.add(wall);

      // 旗帜
      const flagGeometry = new THREE.PlaneGeometry(1, 0.6);
      const flagMaterial = new THREE.MeshLambertMaterial({
        color: kingdomColors[city.kingdom],
        side: THREE.DoubleSide
      });
      const flag = new THREE.Mesh(flagGeometry, flagMaterial);
      flag.position.set(0.5, city.level + 1, 0.5);
      cityGroup.add(flag);

      // 城池名称标签
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = 'rgba(0, 0, 0, 0.8)';
      context.fillRect(0, 0, 256, 64);
      context.fillStyle = 'white';
      context.font = '24px SimHei';
      context.textAlign = 'center';
      context.fillText(city.name, 128, 40);
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.SpriteMaterial({ map: texture });
      const label = new THREE.Sprite(labelMaterial);
      label.position.set(0, city.level + 3, 0);
      label.scale.set(8, 2, 1);
      cityGroup.add(label);

      // 设置城池组位置
      cityGroup.position.set(city.x, city.y, city.z);
      
      // 添加点击事件（通过射线检测）
      cityGroup.userData = { city };
      
      scene.add(cityGroup);
    });

    setCities(citiesData);
    setDebugInfo(prev => ({ ...prev, citiesLoaded: true }));
    console.log(`✅ [3D Map] ${citiesData.length}个城池创建完成`);
  };

  // 创建天气效果
  const createWeatherEffects = async (scene: THREE.Scene) => {
    console.log('🌤️ [3D Map] 开始创建天气效果...');
    
    // 云朵
    const cloudGeometry = new THREE.SphereGeometry(5, 8, 6);
    const cloudMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < 10; i++) {
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.position.set(
        (Math.random() - 0.5) * 200,
        20 + Math.random() * 10,
        (Math.random() - 0.5) * 200
      );
      cloud.scale.set(
        1 + Math.random(),
        0.5 + Math.random() * 0.5,
        1 + Math.random()
      );
      scene.add(cloud);
    }
    
    setDebugInfo(prev => ({ ...prev, weatherCreated: true }));
    console.log('✅ [3D Map] 10个云朵天气效果创建完成');
  };

  // 更新相机
  const updateCamera = () => {
    if (!cameraRef.current) return;
    
    const camera = cameraRef.current;
    const distance = controls.zoom;
    const angle = (controls.rotation * Math.PI) / 180;
    const tiltRad = (controls.tilt * Math.PI) / 180;
    
    camera.position.x = Math.sin(angle) * distance;
    camera.position.z = Math.cos(angle) * distance;
    camera.position.y = Math.sin(tiltRad) * distance;
    
    camera.lookAt(0, 0, 0);
  };

  // 控制面板变化处理
  const handleControlChange = (key: keyof MapControls, value: any) => {
    setControls(prev => ({
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

  console.log('🎨 [3D Map] 渲染检查:', {
    loading,
    mountRefExists: !!mountRef.current
  });

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ bgcolor: '#1a1a2e' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <TerrainIcon sx={{ mr: 1 }} />
            三国立体世界
          </Typography>
          <Button color="inherit" onClick={() => navigate('/map')}>
            策略棋盘
          </Button>
          <Button color="inherit" onClick={() => navigate('/map/2d')}>
            2D地图
          </Button>
          <Button color="inherit" onClick={() => navigate('/home')}>
            返回主页
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative' }}>
        {/* 简化的3D地图容器 - 始终存在，即使在loading时 */}
        <div 
          ref={mountRef}
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        />

        {/* Loading遮罩层 - 显示在容器上方 */}
        {loading && (
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            zIndex: 1000
          }}>
            <Typography variant="h5" sx={{ color: '#fff' }}>
              🎮 加载三国立体世界...
            </Typography>
          </Box>
        )}

        {/* 3D控制面板 */}
        <Paper
          className="map-3d-controls"
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
            3D控制
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Typography gutterBottom>视距: {controls.zoom}</Typography>
              <Slider
                value={controls.zoom}
                onChange={(_, value) => handleControlChange('zoom', value)}
                min={20}
                max={100}
                step={1}
              />
            </Box>
            
            <Box>
              <Typography gutterBottom>旋转: {controls.rotation}°</Typography>
              <Slider
                value={controls.rotation}
                onChange={(_, value) => handleControlChange('rotation', value)}
                min={0}
                max={360}
                step={1}
              />
            </Box>
            
            <Box>
              <Typography gutterBottom>俯视角度: {controls.tilt}°</Typography>
              <Slider
                value={controls.tilt}
                onChange={(_, value) => handleControlChange('tilt', value)}
                min={10}
                max={80}
                step={1}
              />
            </Box>
            
            <Box>
              <Typography gutterBottom>时间: {controls.timeOfDay}:00</Typography>
              <Slider
                value={controls.timeOfDay}
                onChange={(_, value) => handleControlChange('timeOfDay', value)}
                min={0}
                max={23}
                step={1}
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={controls.showTerrain}
                  onChange={(e) => handleControlChange('showTerrain', e.target.checked)}
                />
              }
              label="显示地形"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={controls.showCities}
                  onChange={(e) => handleControlChange('showCities', e.target.checked)}
                />
              }
              label="显示城池"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={controls.showWeather}
                  onChange={(e) => handleControlChange('showWeather', e.target.checked)}
                />
              }
              label="天气效果"
            />
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

        {/* 城池信息抽屉 */}
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
                      等级: {selectedCity.level} | 人口: {selectedCity.population.toLocaleString()}
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
                          // 聚焦到选中城池
                          console.log('聚焦到城池:', selectedCity);
                        }}
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

export default ThreeKingdoms3DMapPage;