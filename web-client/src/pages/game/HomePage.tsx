import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAnalytics } from '../../hooks/useAnalytics';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
import CurrencyDisplay from '../../components/ui/CurrencyDisplay';

interface QuickAccess {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  badge?: string;
  badgeColor?: string;
}

interface DailyTask {
  id: string;
  title: string;
  progress: number;
  total: number;
  reward: string;
  completed: boolean;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { trackGameEvent } = useAnalytics();
  const user = useSelector((state: any) => state.auth.user);
  
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [onlineTime, setOnlineTime] = useState(0);

  useEffect(() => {
    trackGameEvent('home_view');
    loadDailyTasks();
    
    // 更新在线时间
    const interval = setInterval(() => {
      setOnlineTime(prev => prev + 1);
    }, 60000); // 每分钟更新
    
    return () => clearInterval(interval);
  }, [trackGameEvent]);

  const loadDailyTasks = () => {
    const mockTasks: DailyTask[] = [
      {
        id: 'daily_login',
        title: '每日登录',
        progress: 1,
        total: 1,
        reward: '金币 x1000',
        completed: true,
      },
      {
        id: 'daily_battle',
        title: '完成3场战斗',
        progress: 2,
        total: 3,
        reward: '经验丹 x5',
        completed: false,
      },
      {
        id: 'daily_upgrade',
        title: '升级任意建筑',
        progress: 0,
        total: 1,
        reward: '加速道具 x2',
        completed: false,
      },
      {
        id: 'daily_hero',
        title: '培养英雄2次',
        progress: 1,
        total: 2,
        reward: '英雄碎片 x10',
        completed: false,
      },
    ];
    setDailyTasks(mockTasks);
  };

  const quickAccessItems: QuickAccess[] = [
    {
      id: 'heroes',
      title: '武将',
      description: '管理你的武将团队',
      icon: '👥',
      path: '/heroes',
      badge: '新',
      badgeColor: 'bg-red-500',
    },
    {
      id: 'battle',
      title: '战斗',
      description: '开始征战之旅',
      icon: '⚔️',
      path: '/battle',
    },
    {
      id: 'city',
      title: '城池',
      description: '建设你的城市',
      icon: '🏰',
      path: '/city',
      badge: '2',
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'formation',
      title: '阵容',
      description: '调整战斗阵容',
      icon: '📋',
      path: '/formation',
    },
    {
      id: 'inventory',
      title: '背包',
      description: '查看物品装备',
      icon: '🎒',
      path: '/inventory',
    },
    {
      id: 'shop',
      title: '商城',
      description: '购买道具资源',
      icon: '🛒',
      path: '/shop',
      badge: '限时',
      badgeColor: 'bg-orange-500',
    },
  ];

  const handleQuickAccess = (path: string) => {
    trackGameEvent('quick_access_click', { path });
    navigate(path);
  };

  const formatOnlineTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  return (
    <motion.div
      className="space-y-6 particle-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 欢迎横幅 */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <GameCard className="p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.username?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  欢迎回来，{user?.username || '指挥官'}！
                </h1>
                <p className="text-gray-300">
                  等级 {user?.level || 25} · 在线时间 {formatOnlineTime(onlineTime)}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <CurrencyDisplay type="gold" amount={125000} />
              <CurrencyDisplay type="gems" amount={2500} />
            </div>
          </div>
        </GameCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 快速访问 */}
        <motion.div
          className="lg:col-span-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GameCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">快速访问</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickAccessItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Button
                    variant="secondary"
                    className="w-full h-full p-4 relative"
                    onClick={() => handleQuickAccess(item.path)}
                  >
                    {item.badge && (
                      <div className={`absolute top-2 right-2 px-2 py-1 ${item.badgeColor} text-white text-xs rounded`}>
                        {item.badge}
                      </div>
                    )}
                    <div className="flex flex-col items-center text-center">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.description}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </GameCard>
        </motion.div>

        {/* 每日任务 */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GameCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">每日任务</h2>
              <span className="text-sm text-gray-400">
                {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {dailyTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg ${
                    task.completed ? 'bg-green-500/20' : 'bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${
                      task.completed ? 'text-green-400' : 'text-white'
                    }`}>
                      {task.title}
                    </span>
                    {task.completed && <span className="text-green-400">✓</span>}
                  </div>
                  
                  {!task.completed && (
                    <div className="mb-2">
                      <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${(task.progress / task.total) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {task.progress}/{task.total}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400">
                    奖励: {task.reward}
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="primary" className="w-full mt-4">
              领取所有奖励
            </Button>
          </GameCard>
        </motion.div>
      </div>

      {/* 公告和活动 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <GameCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">最新动态</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 活动公告 */}
            <div className="bg-orange-500/20 rounded-lg p-4 border border-orange-500/30">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-bold text-orange-400 mb-1">限时活动</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    新英雄「吕布」限时UP！召唤概率提升200%
                  </p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/shop')}>
                    前往参与
                  </Button>
                </div>
              </div>
            </div>

            {/* 系统公告 */}
            <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📢</span>
                <div>
                  <h3 className="font-bold text-blue-400 mb-1">系统更新</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    新增阵容预设功能，可保存多套阵容配置
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/formation/presets')}>
                    查看详情
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </GameCard>
      </motion.div>

      {/* 底部快捷操作 */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="secondary"
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center space-x-2"
        >
          <span>⚙️</span>
          <span>设置</span>
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => console.log('邮件')}
          className="flex items-center justify-center space-x-2"
        >
          <span>📧</span>
          <span>邮件</span>
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => console.log('好友')}
          className="flex items-center justify-center space-x-2"
        >
          <span>👫</span>
          <span>好友</span>
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => console.log('排行榜')}
          className="flex items-center justify-center space-x-2"
        >
          <span>🏆</span>
          <span>排行榜</span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;