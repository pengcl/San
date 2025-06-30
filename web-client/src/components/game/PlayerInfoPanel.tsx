import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import GameCard from '../ui/GameCard';
import CurrencyDisplay from '../ui/CurrencyDisplay';
import HealthBar from '../ui/HealthBar';
import Button from '../ui/Button';

interface PlayerStats {
  level: number;
  exp: number;
  maxExp: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  gem: number;
  honor: number;
  vipLevel: number;
  loginDays: number;
}

const PlayerInfoPanel: React.FC = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [isExpanded, setIsExpanded] = useState(false);

  // 模拟玩家数据
  const [playerStats] = useState<PlayerStats>({
    level: 45,
    exp: 8750,
    maxExp: 10000,
    energy: 85,
    maxEnergy: 120,
    gold: 1250000,
    gem: 980,
    honor: 15670,
    vipLevel: 6,
    loginDays: 127,
  });

  const handleClaimReward = () => {
    dispatch(
      addNotification({
        type: 'success',
        title: '每日奖励',
        message: '成功领取每日登录奖励！',
        duration: 3000,
      })
    );
  };

  const handleUpgrade = () => {
    dispatch(
      addNotification({
        type: 'info',
        title: '升级功能',
        message: '角色升级功能即将开放',
        duration: 3000,
      })
    );
  };

  const getVipColor = (vipLevel: number) => {
    if (vipLevel >= 10) return 'text-legendary';
    if (vipLevel >= 6) return 'text-game-title';
    if (vipLevel >= 3) return 'text-blue-400';
    return 'text-gray-300';
  };

  return (
    <motion.div
      className='relative'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 主面板 */}
      <GameCard
        className={`p-4 cursor-pointer transition-all duration-300 ${
          isExpanded ? 'mb-4' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center justify-between'>
          {/* 玩家头像和基本信息 */}
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <div className='w-16 h-16 rounded-full border-3 border-orange-400 overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center'>
                <span className='text-2xl'>👤</span>
              </div>
              {/* VIP标识 */}
              <div
                className={`absolute -top-1 -right-1 text-xs font-bold px-2 py-1 rounded-full bg-black/80 ${getVipColor(playerStats.vipLevel)}`}
              >
                VIP{playerStats.vipLevel}
              </div>
            </div>

            <div>
              <h3 className='text-lg font-bold text-white text-shadow'>
                {auth.user?.username || '玩家'}
              </h3>
              <div className='flex items-center space-x-2 text-sm text-gray-400'>
                <span>Lv.{playerStats.level}</span>
                <span>•</span>
                <span>连续登录 {playerStats.loginDays} 天</span>
              </div>
            </div>
          </div>

          {/* 快速信息显示 */}
          <div className='flex items-center space-x-4'>
            <CurrencyDisplay type='gold' amount={playerStats.gold} size='sm' />
            <CurrencyDisplay type='gems' amount={playerStats.gem} size='sm' />
            <CurrencyDisplay
              type='energy'
              amount={playerStats.energy}
              size='sm'
            />

            {/* 展开/收起按钮 */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className='text-gray-400 hover:text-white transition-colors'
            >
              ▼
            </motion.div>
          </div>
        </div>

        {/* 经验条 */}
        <div className='mt-3'>
          <HealthBar
            current={playerStats.exp}
            max={playerStats.maxExp}
            label='经验值'
            color='experience'
            size='sm'
          />
        </div>
      </GameCard>

      {/* 扩展面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className='overflow-hidden'
          >
            <GameCard className='p-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {/* 详细统计 */}
                <div className='space-y-4'>
                  <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wide'>
                    详细信息
                  </h4>

                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-300'>等级</span>
                      <span className='text-white font-semibold'>
                        {playerStats.level}
                      </span>
                    </div>

                    <div className='space-y-1'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-300'>经验值</span>
                        <span className='text-white font-semibold'>
                          {playerStats.exp.toLocaleString()} /{' '}
                          {playerStats.maxExp.toLocaleString()}
                        </span>
                      </div>
                      <HealthBar
                        current={playerStats.exp}
                        max={playerStats.maxExp}
                        color='experience'
                        size='sm'
                      />
                    </div>

                    <div className='space-y-1'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-300'>体力</span>
                        <span className='text-white font-semibold'>
                          {playerStats.energy} / {playerStats.maxEnergy}
                        </span>
                      </div>
                      <HealthBar
                        current={playerStats.energy}
                        max={playerStats.maxEnergy}
                        color='energy'
                        size='sm'
                      />
                    </div>
                  </div>
                </div>

                {/* 货币信息 */}
                <div className='space-y-4'>
                  <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wide'>
                    资源
                  </h4>

                  <div className='space-y-3'>
                    <CurrencyDisplay
                      type='gold'
                      amount={playerStats.gold}
                      label='金币'
                      size='md'
                    />
                    <CurrencyDisplay
                      type='gems'
                      amount={playerStats.gem}
                      label='宝石'
                      size='md'
                    />
                    <CurrencyDisplay
                      type='custom'
                      amount={playerStats.honor}
                      icon='🏆'
                      label='荣誉'
                      size='md'
                    />
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className='space-y-4'>
                  <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wide'>
                    操作
                  </h4>

                  <div className='space-y-3'>
                    <Button
                      variant='primary'
                      size='sm'
                      onClick={handleClaimReward}
                      className='w-full'
                    >
                      领取每日奖励
                    </Button>

                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={handleUpgrade}
                      className='w-full'
                    >
                      角色升级
                    </Button>

                    <div className='text-center'>
                      <div className='text-xs text-gray-400'>
                        下次升级需要:{' '}
                        {(
                          playerStats.maxExp - playerStats.exp
                        ).toLocaleString()}{' '}
                        经验
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 成就展示 */}
              <div className='mt-6 pt-6 border-t border-gray-600'>
                <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4'>
                  最近成就
                </h4>

                <div className='flex space-x-4 overflow-x-auto'>
                  {[
                    {
                      icon: '⚔️',
                      name: '战斗胜利',
                      desc: '赢得100场战斗',
                      progress: 87,
                    },
                    {
                      icon: '🏆',
                      name: '收集大师',
                      desc: '收集50名武将',
                      progress: 45,
                    },
                    {
                      icon: '💎',
                      name: '财富积累',
                      desc: '拥有100万金币',
                      progress: 100,
                    },
                  ].map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className='flex-shrink-0 w-32 p-3 bg-gray-700/50 rounded-lg text-center'
                    >
                      <div className='text-2xl mb-2'>{achievement.icon}</div>
                      <div className='text-xs font-semibold text-white mb-1'>
                        {achievement.name}
                      </div>
                      <div className='text-xs text-gray-400 mb-2'>
                        {achievement.desc}
                      </div>
                      <div className='w-full bg-gray-600 rounded-full h-1'>
                        <div
                          className='bg-orange-500 h-1 rounded-full transition-all duration-500'
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                      <div className='text-xs text-gray-400 mt-1'>
                        {achievement.progress}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GameCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlayerInfoPanel;
