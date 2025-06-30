import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useAnalytics } from '../../hooks/useAnalytics';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
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

const BuildingManagementPage: React.FC = () => {
  const dispatch = useDispatch();
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
        position: { x: 250, y: 150 },
        size: { width: 100, height: 80 },
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
        position: { x: 100, y: 250 },
        size: { width: 80, height: 60 },
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
        position: { x: 400, y: 100 },
        size: { width: 70, height: 70 },
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
        position: { x: 50, y: 100 },
        size: { width: 70, height: 70 },
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
        position: { x: 400, y: 300 },
        size: { width: 60, height: 60 },
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
        position: { x: 150, y: 350 },
        size: { width: 90, height: 70 },
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
        position: { x: 300, y: 350 },
        size: { width: 120, height: 40 },
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

  const getTypeColor = (type: Building['type']) => {
    const colors = {
      military: 'text-red-400',
      resource: 'text-green-400',
      research: 'text-blue-400',
      defensive: 'text-yellow-400',
      special: 'text-purple-400',
    };
    return colors[type];
  };

  const getTypeBgColor = (type: Building['type']) => {
    const colors = {
      military: 'bg-red-500/20',
      resource: 'bg-green-500/20',
      research: 'bg-blue-500/20',
      defensive: 'bg-yellow-500/20',
      special: 'bg-purple-500/20',
    };
    return colors[type];
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
    <motion.div
      className="space-y-6 particle-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 页面标题和资源显示 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-game-title text-shadow-glow font-game">
            建筑管理
          </h1>
          <p className="text-gray-400 text-shadow">管理和升级你的城市建筑</p>
        </div>

        {/* 资源显示 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(resources).map(([resource, amount]) => (
            <div key={resource} className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-lg mb-1">
                {resource === 'gold' && '💰'}
                {resource === 'wood' && '🌲'}
                {resource === 'stone' && '⛏️'}
                {resource === 'iron' && '⚒️'}
                {resource === 'food' && '🌾'}
              </div>
              <div className="text-white font-bold text-sm">
                {formatResource(amount)}
              </div>
              <div className="text-gray-400 text-xs capitalize">{resource}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 城市俯视图 */}
        <div className="xl:col-span-2">
          <GameCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">城市布局</h3>
            
            <div 
              className="relative bg-gradient-to-br from-green-900/30 to-brown-900/30 rounded-lg border-2 border-gray-600 overflow-hidden"
              style={{ height: '500px', backgroundImage: 'url("/images/city-background.jpg")', backgroundSize: 'cover' }}
            >
              {/* 建筑物 */}
              {buildings.map((building) => (
                <motion.div
                  key={building.id}
                  className={`absolute cursor-pointer rounded-lg border-2 transition-all ${
                    selectedBuilding?.id === building.id
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-gray-600 bg-gray-800/60 hover:border-gray-500'
                  } ${getTypeBgColor(building.type)}`}
                  style={{
                    left: `${building.position.x}px`,
                    top: `${building.position.y}px`,
                    width: `${building.size.width}px`,
                    height: `${building.size.height}px`,
                  }}
                  onClick={() => handleBuildingClick(building)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* 建筑图标 */}
                  <div className="h-full flex flex-col items-center justify-center text-white">
                    <div className="text-2xl mb-1">{building.icon}</div>
                    <div className="text-xs font-medium text-center px-1">
                      {building.name}
                    </div>
                    <div className="text-xs text-gray-300">
                      Lv.{building.level}
                    </div>
                    
                    {/* 升级进度条 */}
                    {building.isUpgrading && building.upgradeStartTime && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-1000"
                            style={{
                              width: `${Math.min(100, ((Date.now() - building.upgradeStartTime) / (building.upgradeTime * 1000)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </GameCard>
        </div>

        {/* 建筑详情 */}
        <div>
          <GameCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">建筑详情</h3>
            
            {selectedBuilding ? (
              <div className="space-y-4">
                {/* 建筑基本信息 */}
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">{selectedBuilding.icon}</div>
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {selectedBuilding.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`px-2 py-1 rounded ${getTypeBgColor(selectedBuilding.type)} ${getTypeColor(selectedBuilding.type)}`}>
                        {selectedBuilding.type === 'military' && '军事'}
                        {selectedBuilding.type === 'resource' && '资源'}
                        {selectedBuilding.type === 'research' && '研究'}
                        {selectedBuilding.type === 'defensive' && '防御'}
                        {selectedBuilding.type === 'special' && '特殊'}
                      </span>
                      <span className="text-gray-400">
                        等级 {selectedBuilding.level}/{selectedBuilding.maxLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 建筑描述 */}
                <div className="text-gray-300 text-sm">
                  {selectedBuilding.description}
                </div>

                {/* 升级进度 */}
                {selectedBuilding.isUpgrading && selectedBuilding.upgradeStartTime && (
                  <div className="bg-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 font-medium">升级中...</span>
                      <CountdownTimer
                        targetTime={selectedBuilding.upgradeStartTime + (selectedBuilding.upgradeTime * 1000)}
                        onComplete={() => updateUpgradeProgress()}
                        className="text-blue-400"
                      />
                    </div>
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, ((Date.now() - selectedBuilding.upgradeStartTime) / (selectedBuilding.upgradeTime * 1000)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 建筑效果 */}
                <div>
                  <h5 className="text-white font-medium mb-2">建筑效果</h5>
                  <div className="space-y-1">
                    {selectedBuilding.benefits.map((benefit, index) => (
                      <div key={index} className="text-sm text-gray-300 flex items-center">
                        <span className="text-green-400 mr-2">•</span>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 生产信息 */}
                {selectedBuilding.production && (
                  <div className="bg-green-500/20 rounded-lg p-3">
                    <h5 className="text-green-400 font-medium mb-2">资源生产</h5>
                    <div className="text-sm text-gray-300">
                      每小时生产 {selectedBuilding.production.amount} 
                      {selectedBuilding.production.resource === 'wood' && ' 木材'}
                      {selectedBuilding.production.resource === 'stone' && ' 石材'}
                      {selectedBuilding.production.resource === 'iron' && ' 铁矿'}
                      {selectedBuilding.production.resource === 'gold' && ' 金币'}
                      {selectedBuilding.production.resource === 'food' && ' 粮食'}
                    </div>
                  </div>
                )}

                {/* 升级按钮和费用 */}
                {selectedBuilding.level < selectedBuilding.maxLevel && (
                  <div>
                    <h5 className="text-white font-medium mb-2">升级费用</h5>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(selectedBuilding.upgradeCost).map(([resource, cost]) => (
                        <div 
                          key={resource} 
                          className={`text-sm p-2 rounded ${
                            resources[resource as keyof Resource] >= cost 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {resource === 'gold' && '💰'}
                          {resource === 'wood' && '🌲'}
                          {resource === 'stone' && '⛏️'}
                          {resource === 'iron' && '⚒️'}
                          {cost.toLocaleString()}
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-3">
                      升级时间: {formatTime(selectedBuilding.upgradeTime)}
                    </div>

                    <Button
                      variant="primary"
                      disabled={!canUpgrade(selectedBuilding).canUpgrade}
                      onClick={() => setShowUpgradeDialog(true)}
                      className="w-full"
                    >
                      {canUpgrade(selectedBuilding).canUpgrade 
                        ? `升级至 ${selectedBuilding.level + 1} 级` 
                        : canUpgrade(selectedBuilding).reason
                      }
                    </Button>
                  </div>
                )}

                {selectedBuilding.level >= selectedBuilding.maxLevel && (
                  <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
                    <div className="text-yellow-400 font-medium">✨ 已达到最高等级</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏗️</div>
                <div className="text-gray-400 mb-2">选择一个建筑</div>
                <div className="text-sm text-gray-500">点击城市中的建筑查看详情</div>
              </div>
            )}
          </GameCard>
        </div>
      </div>

      {/* 升级确认对话框 */}
      <AnimatePresence>
        {showUpgradeDialog && selectedBuilding && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border-2 border-gray-600"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">确认升级</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{selectedBuilding.icon}</div>
                  <div>
                    <div className="text-white font-medium">{selectedBuilding.name}</div>
                    <div className="text-gray-400 text-sm">
                      {selectedBuilding.level} 级 → {selectedBuilding.level + 1} 级
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-2">升级费用:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedBuilding.upgradeCost).map(([resource, cost]) => (
                      <div key={resource} className="text-sm flex items-center space-x-1">
                        <span>
                          {resource === 'gold' && '💰'}
                          {resource === 'wood' && '🌲'}
                          {resource === 'stone' && '⛏️'}
                          {resource === 'iron' && '⚒️'}
                        </span>
                        <span className="text-white">{cost.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  升级时间: {formatTime(selectedBuilding.upgradeTime)}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setShowUpgradeDialog(false)}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => startUpgrade(selectedBuilding)}
                    className="flex-1"
                  >
                    确认升级
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BuildingManagementPage;