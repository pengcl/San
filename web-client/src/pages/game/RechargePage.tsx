import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useAnalytics } from '../../hooks/useAnalytics';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
import TabContainer from '../../components/ui/TabContainer';

interface RechargeOption {
  id: string;
  name: string;
  gems: number;
  bonus: number;
  price: number;
  currency: string;
  isPopular?: boolean;
  isFirstTime?: boolean;
  firstTimeBonus?: number;
  icon: string;
  savePercentage?: number;
}

interface VIPPrivilege {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockLevel: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  discount?: number;
  available: boolean;
}

const RechargePage: React.FC = () => {
  const dispatch = useDispatch();
  const { trackGameEvent } = useAnalytics();

  const [selectedOption, setSelectedOption] = useState<RechargeOption | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('alipay');
  const [activeTab, setActiveTab] = useState('recharge');
  const [vipLevel, setVipLevel] = useState(3);
  const [vipProgress, setVipProgress] = useState(65);
  const [totalRecharged, setTotalRecharged] = useState(388);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    trackGameEvent('recharge_page_view');
  }, [trackGameEvent]);

  const rechargeOptions: RechargeOption[] = [
    {
      id: 'gems_60',
      name: '60宝石',
      gems: 60,
      bonus: 0,
      price: 6,
      currency: '¥',
      icon: '💎',
      isFirstTime: true,
      firstTimeBonus: 60,
    },
    {
      id: 'gems_300',
      name: '300宝石',
      gems: 300,
      bonus: 30,
      price: 30,
      currency: '¥',
      icon: '💎',
      isFirstTime: true,
      firstTimeBonus: 300,
      savePercentage: 10,
    },
    {
      id: 'gems_680',
      name: '680宝石',
      gems: 680,
      bonus: 88,
      price: 68,
      currency: '¥',
      icon: '💎',
      isPopular: true,
      isFirstTime: false,
      savePercentage: 15,
    },
    {
      id: 'gems_1280',
      name: '1280宝石',
      gems: 1280,
      bonus: 188,
      price: 128,
      currency: '¥',
      icon: '💎',
      savePercentage: 20,
    },
    {
      id: 'gems_3280',
      name: '3280宝石',
      gems: 3280,
      bonus: 588,
      price: 328,
      currency: '¥',
      icon: '💎',
      savePercentage: 25,
    },
    {
      id: 'gems_6480',
      name: '6480宝石',
      gems: 6480,
      bonus: 1280,
      price: 648,
      currency: '¥',
      icon: '💎',
      savePercentage: 30,
    },
  ];

  const vipPrivileges: VIPPrivilege[] = [
    {
      id: 'daily_gems',
      name: '每日宝石',
      description: '每日登录赠送宝石',
      icon: '💎',
      unlockLevel: 1,
    },
    {
      id: 'auto_battle',
      name: '自动战斗',
      description: '解锁自动战斗功能',
      icon: '⚡',
      unlockLevel: 2,
    },
    {
      id: 'extra_rewards',
      name: '额外奖励',
      description: '战斗奖励+20%',
      icon: '🎁',
      unlockLevel: 3,
    },
    {
      id: 'skip_battle',
      name: '战斗跳过',
      description: '可跳过战斗动画',
      icon: '⏭️',
      unlockLevel: 4,
    },
    {
      id: 'exclusive_shop',
      name: 'VIP商店',
      description: '解锁专属商品',
      icon: '🛍️',
      unlockLevel: 5,
    },
    {
      id: 'priority_support',
      name: '优先客服',
      description: '专属客服通道',
      icon: '🎧',
      unlockLevel: 6,
    },
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'alipay',
      name: '支付宝',
      icon: '🔷',
      available: true,
    },
    {
      id: 'wechat',
      name: '微信支付',
      icon: '🟩',
      available: true,
    },
    {
      id: 'card',
      name: '银行卡',
      icon: '💳',
      available: true,
    },
    {
      id: 'apple',
      name: 'Apple Pay',
      icon: '🍎',
      available: false,
    },
  ];

  const monthlyCard = {
    id: 'monthly_card',
    name: '月卡',
    price: 30,
    currency: '¥',
    benefits: [
      '立即获得300宝石',
      '每日领取100宝石（30天）',
      'VIP经验+300',
      '专属月卡称号',
    ],
    totalValue: 3300,
    icon: '📅',
  };

  const growthFund = {
    id: 'growth_fund',
    name: '成长基金',
    price: 98,
    currency: '¥',
    benefits: [
      '立即获得980宝石',
      '10级返还200宝石',
      '20级返还500宝石',
      '30级返还800宝石',
      '40级返还1200宝石',
      '50级返还1500宝石',
    ],
    totalValue: 5180,
    icon: '📈',
  };

  const handleOptionSelect = (option: RechargeOption) => {
    setSelectedOption(option);
    trackGameEvent('recharge_option_select', {
      optionId: option.id,
      price: option.price,
      gems: option.gems + option.bonus,
    });
  };

  const handleRecharge = () => {
    if (!selectedOption || !selectedPayment) {
      dispatch(addNotification({
        type: 'error',
        title: '请选择充值选项',
        message: '请选择充值金额和支付方式',
        duration: 3000,
      }));
      return;
    }

    trackGameEvent('recharge_start', {
      optionId: selectedOption.id,
      paymentMethod: selectedPayment,
      amount: selectedOption.price,
    });

    setShowPaymentDialog(true);

    // 模拟支付流程
    setTimeout(() => {
      setShowPaymentDialog(false);
      
      dispatch(addNotification({
        type: 'success',
        title: '充值成功',
        message: `成功充值 ${selectedOption.gems + selectedOption.bonus} 宝石`,
        duration: 5000,
      }));

      // 更新VIP经验
      const newProgress = vipProgress + Math.floor(selectedOption.price / 10);
      if (newProgress >= 100) {
        setVipLevel(prev => prev + 1);
        setVipProgress(newProgress - 100);
      } else {
        setVipProgress(newProgress);
      }

      setTotalRecharged(prev => prev + selectedOption.price);

      trackGameEvent('recharge_success', {
        optionId: selectedOption.id,
        amount: selectedOption.price,
        totalRecharged: totalRecharged + selectedOption.price,
      });
    }, 2000);
  };

  const getVIPNextLevel = () => {
    const vipRequirements = [0, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
    if (vipLevel >= vipRequirements.length - 1) return vipRequirements[vipRequirements.length - 1];
    return vipRequirements[vipLevel + 1];
  };

  const tabs = [
    { id: 'recharge', label: '充值', icon: '💎' },
    { id: 'monthly', label: '月卡', icon: '📅' },
    { id: 'fund', label: '基金', icon: '📈' },
    { id: 'vip', label: 'VIP特权', icon: '👑' },
  ];

  return (
    <motion.div
      className="space-y-6 particle-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-game-title text-shadow-glow font-game">
            充值中心
          </h1>
          <p className="text-gray-400 text-shadow">获取更多宝石，享受VIP特权</p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">累计充值</div>
          <div className="text-2xl font-bold text-yellow-400">¥{totalRecharged}</div>
        </div>
      </div>

      {/* VIP进度条 */}
      <GameCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">👑</div>
            <div>
              <div className="text-lg font-bold text-yellow-400">VIP {vipLevel}</div>
              <div className="text-sm text-gray-400">
                距离VIP{vipLevel + 1}还需 ¥{getVIPNextLevel() - totalRecharged}
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('vip')}>
            查看特权
          </Button>
        </div>
        
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
            style={{ width: `${vipProgress}%` }}
          />
        </div>
      </GameCard>

      {/* 标签页 */}
      <TabContainer
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 充值选项 */}
      <AnimatePresence mode="wait">
        {activeTab === 'recharge' && (
          <motion.div
            key="recharge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GameCard className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {rechargeOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedOption?.id === option.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                    onClick={() => handleOptionSelect(option)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* 热门标签 */}
                    {option.isPopular && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        热门
                      </div>
                    )}

                    {/* 首充标签 */}
                    {option.isFirstTime && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        首充双倍
                      </div>
                    )}

                    {/* 省钱标签 */}
                    {option.savePercentage && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        省{option.savePercentage}%
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="text-white font-bold mb-1">
                        {option.gems + option.bonus} 宝石
                      </div>
                      {option.bonus > 0 && (
                        <div className="text-xs text-green-400 mb-2">
                          {option.gems} + {option.bonus} 赠送
                        </div>
                      )}
                      <div className="text-2xl font-bold text-yellow-400">
                        {option.currency}{option.price}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 支付方式 */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">选择支付方式</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant={selectedPayment === method.id ? 'primary' : 'secondary'}
                      disabled={!method.available}
                      onClick={() => method.available && setSelectedPayment(method.id)}
                      className="flex items-center justify-center space-x-2"
                    >
                      <span>{method.icon}</span>
                      <span>{method.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* 充值按钮 */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleRecharge}
                disabled={!selectedOption}
                className="w-full mt-6"
              >
                {selectedOption
                  ? `立即充值 ${selectedOption.currency}${selectedOption.price}`
                  : '请选择充值金额'
                }
              </Button>
            </GameCard>
          </motion.div>
        )}

        {/* 月卡 */}
        {activeTab === 'monthly' && (
          <motion.div
            key="monthly"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GameCard className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">{monthlyCard.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{monthlyCard.name}</h2>
                <div className="text-3xl font-bold text-yellow-400">
                  {monthlyCard.currency}{monthlyCard.price}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  总价值 {monthlyCard.totalValue} 宝石
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">月卡特权</h3>
                <div className="space-y-2">
                  {monthlyCard.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <span className="text-green-400 mr-2">✓</span>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="primary" size="lg" className="w-full">
                购买月卡
              </Button>
            </GameCard>
          </motion.div>
        )}

        {/* 成长基金 */}
        {activeTab === 'fund' && (
          <motion.div
            key="fund"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GameCard className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">{growthFund.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{growthFund.name}</h2>
                <div className="text-3xl font-bold text-yellow-400">
                  {growthFund.currency}{growthFund.price}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  总回报 {growthFund.totalValue} 宝石
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">基金回报</h3>
                <div className="space-y-3">
                  {growthFund.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center text-gray-300">
                        <span className="text-blue-400 mr-2">◆</span>
                        {benefit}
                      </div>
                      {index === 0 && (
                        <span className="text-green-400 text-sm">立即获得</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="primary" size="lg" className="w-full">
                购买成长基金
              </Button>
            </GameCard>
          </motion.div>
        )}

        {/* VIP特权 */}
        {activeTab === 'vip' && (
          <motion.div
            key="vip"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GameCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">VIP特权一览</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vipPrivileges.map((privilege, index) => (
                  <motion.div
                    key={privilege.id}
                    className={`p-4 rounded-lg border ${
                      vipLevel >= privilege.unlockLevel
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : 'border-gray-600 bg-gray-700/30'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{privilege.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-bold ${
                            vipLevel >= privilege.unlockLevel
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                          }`}>
                            {privilege.name}
                          </h3>
                          <span className={`text-sm px-2 py-1 rounded ${
                            vipLevel >= privilege.unlockLevel
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-600 text-gray-400'
                          }`}>
                            VIP{privilege.unlockLevel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          {privilege.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-orange-500/20 rounded-lg text-center">
                <p className="text-orange-400 mb-2">
                  成为VIP{vipLevel + 1}，解锁更多特权！
                </p>
                <Button variant="primary" onClick={() => setActiveTab('recharge')}>
                  立即充值
                </Button>
              </div>
            </GameCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 支付确认对话框 */}
      <AnimatePresence>
        {showPaymentDialog && selectedOption && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-sm w-full text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-white mb-2">
                正在处理支付...
              </h3>
              <p className="text-gray-400 mb-4">
                充值金额：{selectedOption.currency}{selectedOption.price}
              </p>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: '50%' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RechargePage;