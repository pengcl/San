import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';

interface CityStats {
  cityLevel: number;
  population: number;
  happiness: number;
  defense: number;
  resources: {
    gold: number;
    wood: number;
    stone: number;
    iron: number;
    food: number;
  };
  buildings: {
    total: number;
    upgrading: number;
    maxLevel: number;
  };
}

const CityPage: React.FC = () => {
  const navigate = useNavigate();
  const { trackGameEvent } = useAnalytics();
  const [cityStats, setCityStats] = useState<CityStats | null>(null);

  useEffect(() => {
    trackGameEvent('city_overview_view');
    loadCityStats();
  }, [trackGameEvent]);

  const loadCityStats = () => {
    // 模拟加载城市统计数据
    const mockStats: CityStats = {
      cityLevel: 12,
      population: 25680,
      happiness: 85,
      defense: 1250,
      resources: {
        gold: 125000,
        wood: 68000,
        stone: 45000,
        iron: 32000,
        food: 89000,
      },
      buildings: {
        total: 15,
        upgrading: 2,
        maxLevel: 8,
      },
    };
    setCityStats(mockStats);
  };

  const navigateToBuildings = () => {
    trackGameEvent('navigate_to_buildings');
    navigate('/city/buildings');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getHappinessColor = (happiness: number) => {
    if (happiness >= 80) return 'text-green-400';
    if (happiness >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHappinessEmoji = (happiness: number) => {
    if (happiness >= 80) return '😊';
    if (happiness >= 60) return '😐';
    return '😟';
  };

  if (!cityStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 particle-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-game-title text-shadow-glow font-game">
          城池总览
        </h1>
        <p className="text-gray-400 text-shadow">管理你的城市发展</p>
      </div>

      {/* 城市基本信息 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <GameCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🏰</div>
              <div>
                <h2 className="text-2xl font-bold text-white">三国名城</h2>
                <div className="text-gray-400">等级 {cityStats.cityLevel}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {formatNumber(cityStats.population)}
              </div>
              <div className="text-gray-400 text-sm">总人口</div>
            </div>
          </div>

          {/* 城市状态指标 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">{getHappinessEmoji(cityStats.happiness)}</span>
                <span className={`text-xl font-bold ${getHappinessColor(cityStats.happiness)}`}>
                  {cityStats.happiness}%
                </span>
              </div>
              <div className="text-gray-400 text-sm">民众幸福度</div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">🛡️</span>
                <span className="text-xl font-bold text-blue-400">
                  {formatNumber(cityStats.defense)}
                </span>
              </div>
              <div className="text-gray-400 text-sm">城市防御</div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">🏗️</span>
                <span className="text-xl font-bold text-purple-400">
                  {cityStats.buildings.total}
                </span>
              </div>
              <div className="text-gray-400 text-sm">建筑总数</div>
            </div>
          </div>
        </GameCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 资源概览 */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GameCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">资源储备</h3>
            
            <div className="space-y-3">
              {Object.entries(cityStats.resources).map(([resource, amount]) => (
                <div key={resource} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {resource === 'gold' && '💰'}
                      {resource === 'wood' && '🌲'}
                      {resource === 'stone' && '⛏️'}
                      {resource === 'iron' && '⚒️'}
                      {resource === 'food' && '🌾'}
                    </span>
                    <span className="text-white font-medium capitalize">
                      {resource === 'gold' && '金币'}
                      {resource === 'wood' && '木材'}
                      {resource === 'stone' && '石材'}
                      {resource === 'iron' && '铁矿'}
                      {resource === 'food' && '粮食'}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-bold">
                    {formatNumber(amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg text-center">
              <div className="text-blue-400 text-sm">每小时资源产量</div>
              <div className="text-white font-bold">+2,580 🌲 +1,890 ⛏️ +1,240 ⚒️</div>
            </div>
          </GameCard>
        </motion.div>

        {/* 功能快捷入口 */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GameCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">城市管理</h3>
            
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full text-left justify-start p-4 h-auto"
                onClick={navigateToBuildings}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏗️</span>
                  <div>
                    <div className="font-medium text-white">建筑管理</div>
                    <div className="text-xs text-gray-400">
                      升级建筑 • {cityStats.buildings.upgrading} 个升级中
                    </div>
                  </div>
                  <div className="ml-auto text-orange-400">→</div>
                </div>
              </Button>

              <Button
                variant="secondary"
                className="w-full text-left justify-start p-4 h-auto"
                onClick={() => console.log('科技研究')}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔬</span>
                  <div>
                    <div className="font-medium text-white">科技研究</div>
                    <div className="text-xs text-gray-400">
                      研发新技术 • 即将开放
                    </div>
                  </div>
                  <div className="ml-auto text-gray-500">→</div>
                </div>
              </Button>

              <Button
                variant="secondary"
                className="w-full text-left justify-start p-4 h-auto"
                onClick={() => console.log('军队管理')}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚔️</span>
                  <div>
                    <div className="font-medium text-white">军队管理</div>
                    <div className="text-xs text-gray-400">
                      训练部队 • 即将开放
                    </div>
                  </div>
                  <div className="ml-auto text-gray-500">→</div>
                </div>
              </Button>

              <Button
                variant="secondary"
                className="w-full text-left justify-start p-4 h-auto"
                onClick={() => console.log('贸易系统')}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏪</span>
                  <div>
                    <div className="font-medium text-white">贸易系统</div>
                    <div className="text-xs text-gray-400">
                      资源交易 • 即将开放
                    </div>
                  </div>
                  <div className="ml-auto text-gray-500">→</div>
                </div>
              </Button>
            </div>
          </GameCard>
        </motion.div>
      </div>

      {/* 城市事件和公告 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <GameCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">城市动态</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-500/20 rounded-lg">
              <span className="text-green-400 text-xl">✅</span>
              <div>
                <div className="text-green-400 font-medium">建筑升级完成</div>
                <div className="text-gray-300 text-sm">兵营升级至 4 级，军队容量增加</div>
                <div className="text-gray-500 text-xs">2分钟前</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-500/20 rounded-lg">
              <span className="text-blue-400 text-xl">🔄</span>
              <div>
                <div className="text-blue-400 font-medium">资源收集完成</div>
                <div className="text-gray-300 text-sm">收集了 2,500 木材和 1,800 石材</div>
                <div className="text-gray-500 text-xs">15分钟前</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-yellow-500/20 rounded-lg">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <div>
                <div className="text-yellow-400 font-medium">资源仓库即将满载</div>
                <div className="text-gray-300 text-sm">建议升级仓库或使用资源</div>
                <div className="text-gray-500 text-xs">1小时前</div>
              </div>
            </div>
          </div>
        </GameCard>
      </motion.div>
    </motion.div>
  );
};

export default CityPage;