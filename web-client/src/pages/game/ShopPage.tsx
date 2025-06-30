import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addNotification } from '../../store/slices/uiSlice';
import { useAnalytics } from '../../hooks/useAnalytics';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
import TabContainer from '../../components/ui/TabContainer';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'hero' | 'equipment' | 'material' | 'currency' | 'special';
  category: string;
  icon: string;
  rarity: number;
  price: {
    currency: 'gold' | 'gems' | 'honor_points' | 'arena_coins';
    amount: number;
  };
  originalPrice?: number;
  discount?: number;
  stock?: number;
  dailyLimit?: number;
  purchasedToday?: number;
  isLimited?: boolean;
  endTime?: number;
  requirements?: {
    playerLevel?: number;
    vipLevel?: number;
    completedQuests?: string[];
  };
  benefits?: string[];
  previewImage?: string;
}

interface PlayerCurrency {
  gold: number;
  gems: number;
  honor_points: number;
  arena_coins: number;
}

const ShopPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trackGameEvent } = useAnalytics();

  const [shopItems, setShopItems] = useState<{ [category: string]: ShopItem[] }>({});
  const [selectedCategory, setSelectedCategory] = useState('recommended');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [playerCurrency, setPlayerCurrency] = useState<PlayerCurrency>({
    gold: 125000,
    gems: 2500,
    honor_points: 1800,
    arena_coins: 950,
  });
  const [playerLevel] = useState(25);
  const [vipLevel] = useState(3);

  useEffect(() => {
    trackGameEvent('shop_view');
    loadShopItems();
  }, [trackGameEvent]);

  const loadShopItems = () => {
    const mockItems: { [category: string]: ShopItem[] } = {
      recommended: [
        {
          id: 'hero_pack_legendary',
          name: '传说英雄礼包',
          description: '包含一名传说级英雄和丰富装备',
          type: 'special',
          category: '推荐',
          icon: '🎁',
          rarity: 6,
          price: { currency: 'gems', amount: 2000 },
          originalPrice: 2500,
          discount: 20,
          isLimited: true,
          endTime: Date.now() + 24 * 60 * 60 * 1000, // 24小时
          benefits: ['传说级英雄 x1', '史诗装备 x3', '经验丹 x10', '金币 x50000'],
        },
        {
          id: 'starter_pack',
          name: '新手特惠包',
          description: '专为新手玩家设计的超值礼包',
          type: 'special',
          category: '推荐',
          icon: '🌟',
          rarity: 4,
          price: { currency: 'gold', amount: 10000 },
          originalPrice: 25000,
          discount: 60,
          requirements: { playerLevel: 10 },
          dailyLimit: 1,
          purchasedToday: 0,
          benefits: ['稀有英雄 x2', '装备宝箱 x5', '经验丹 x20'],
        },
      ],
      heroes: [
        {
          id: 'hero_gacha_normal',
          name: '英雄召唤券',
          description: '有机会获得稀有以上英雄',
          type: 'hero',
          category: '英雄',
          icon: '🎫',
          rarity: 3,
          price: { currency: 'gems', amount: 300 },
          benefits: ['稀有英雄概率: 70%', '史诗英雄概率: 25%', '传说英雄概率: 5%'],
        },
        {
          id: 'hero_gacha_premium',
          name: '高级召唤券',
          description: '保底史诗级英雄的高级召唤',
          type: 'hero',
          category: '英雄',
          icon: '🎖️',
          rarity: 5,
          price: { currency: 'gems', amount: 800 },
          benefits: ['史诗英雄概率: 80%', '传说英雄概率: 20%'],
        },
        {
          id: 'hero_fragments_common',
          name: '通用英雄碎片',
          description: '可用于任意英雄升星',
          type: 'material',
          category: '英雄',
          icon: '🧩',
          rarity: 3,
          price: { currency: 'honor_points', amount: 50 },
          stock: 100,
          dailyLimit: 20,
          purchasedToday: 5,
        },
      ],
      equipment: [
        {
          id: 'equipment_chest_rare',
          name: '稀有装备宝箱',
          description: '开启后获得稀有品质装备',
          type: 'equipment',
          category: '装备',
          icon: '📦',
          rarity: 3,
          price: { currency: 'gold', amount: 15000 },
          benefits: ['稀有装备 x1', '强化石 x5'],
        },
        {
          id: 'equipment_chest_epic',
          name: '史诗装备宝箱',
          description: '开启后获得史诗品质装备',
          type: 'equipment',
          category: '装备',
          icon: '🎁',
          rarity: 5,
          price: { currency: 'gems', amount: 500 },
          benefits: ['史诗装备 x1', '高级强化石 x3'],
        },
        {
          id: 'enhancement_stones',
          name: '强化石礼包',
          description: '装备强化必备材料',
          type: 'material',
          category: '装备',
          icon: '💎',
          rarity: 2,
          price: { currency: 'gold', amount: 5000 },
          dailyLimit: 10,
          purchasedToday: 2,
          benefits: ['强化石 x20', '高级强化石 x5'],
        },
      ],
      materials: [
        {
          id: 'exp_potion_large',
          name: '大型经验丹',
          description: '提供大量英雄经验值',
          type: 'material',
          category: '材料',
          icon: '💊',
          rarity: 4,
          price: { currency: 'gold', amount: 2000 },
          dailyLimit: 50,
          purchasedToday: 8,
          benefits: ['英雄经验 +5000'],
        },
        {
          id: 'skill_book_rare',
          name: '稀有技能书',
          description: '用于升级英雄技能',
          type: 'material',
          category: '材料',
          icon: '📚',
          rarity: 3,
          price: { currency: 'arena_coins', amount: 100 },
          stock: 50,
          benefits: ['技能经验 +1000'],
        },
        {
          id: 'gold_bag_large',
          name: '大金币袋',
          description: '包含大量金币',
          type: 'currency',
          category: '材料',
          icon: '💰',
          rarity: 2,
          price: { currency: 'gems', amount: 100 },
          dailyLimit: 5,
          purchasedToday: 1,
          benefits: ['金币 +25000'],
        },
      ],
      vip: [
        {
          id: 'vip_monthly_card',
          name: 'VIP月卡',
          description: '30天每日领取奖励',
          type: 'special',
          category: 'VIP',
          icon: '👑',
          rarity: 6,
          price: { currency: 'gems', amount: 1000 },
          requirements: { vipLevel: 1 },
          benefits: ['每日宝石 +100', 'VIP经验 +300', '特殊称号'],
        },
        {
          id: 'vip_growth_fund',
          name: 'VIP成长基金',
          description: '根据VIP等级获得丰厚奖励',
          type: 'special',
          category: 'VIP',
          icon: '💎',
          rarity: 6,
          price: { currency: 'gems', amount: 3000 },
          requirements: { vipLevel: 2 },
          benefits: ['VIP3奖励解锁', 'VIP5奖励解锁', 'VIP7奖励解锁'],
        },
      ],
    };

    setShopItems(mockItems);
  };

  const categories = [
    { id: 'recommended', name: '推荐', icon: '🌟' },
    { id: 'heroes', name: '英雄', icon: '👥' },
    { id: 'equipment', name: '装备', icon: '⚔️' },
    { id: 'materials', name: '材料', icon: '🧪' },
    { id: 'vip', name: 'VIP', icon: '👑' },
  ];

  const handleItemClick = (item: ShopItem) => {
    setSelectedItem(item);
    trackGameEvent('shop_item_select', {
      itemId: item.id,
      category: item.category,
      price: item.price.amount,
      currency: item.price.currency,
    });
  };

  const canPurchase = (item: ShopItem): { canPurchase: boolean; reason?: string } => {
    // 检查库存
    if (item.stock !== undefined && item.stock <= 0) {
      return { canPurchase: false, reason: '库存不足' };
    }

    // 检查每日限购
    if (item.dailyLimit && item.purchasedToday && item.purchasedToday >= item.dailyLimit) {
      return { canPurchase: false, reason: '今日购买次数已达上限' };
    }

    // 检查货币是否足够
    const playerAmount = playerCurrency[item.price.currency];
    if (playerAmount < item.price.amount) {
      return { canPurchase: false, reason: '货币不足' };
    }

    // 检查等级要求
    if (item.requirements?.playerLevel && playerLevel < item.requirements.playerLevel) {
      return { canPurchase: false, reason: `需要玩家等级 ${item.requirements.playerLevel}` };
    }

    // 检查VIP要求
    if (item.requirements?.vipLevel && vipLevel < item.requirements.vipLevel) {
      return { canPurchase: false, reason: `需要VIP等级 ${item.requirements.vipLevel}` };
    }

    return { canPurchase: true };
  };

  const handlePurchase = (item: ShopItem) => {
    const { canPurchase, reason } = canPurchase(item);

    if (!canPurchase) {
      dispatch(addNotification({
        type: 'error',
        title: '无法购买',
        message: reason || '购买条件不满足',
        duration: 3000,
      }));
      return;
    }

    // 扣除货币
    setPlayerCurrency(prev => ({
      ...prev,
      [item.price.currency]: prev[item.price.currency] - item.price.amount,
    }));

    // 更新购买数据
    setShopItems(prev => {
      const updated = { ...prev };
      const categoryItems = [...updated[selectedCategory]];
      const itemIndex = categoryItems.findIndex(i => i.id === item.id);
      
      if (itemIndex >= 0) {
        categoryItems[itemIndex] = {
          ...categoryItems[itemIndex],
          stock: item.stock ? item.stock - 1 : undefined,
          purchasedToday: (item.purchasedToday || 0) + 1,
        };
        updated[selectedCategory] = categoryItems;
      }

      return updated;
    });

    dispatch(addNotification({
      type: 'success',
      title: '购买成功',
      message: `${item.name} 已添加到背包`,
      duration: 4000,
    }));

    trackGameEvent('shop_purchase', {
      itemId: item.id,
      itemName: item.name,
      price: item.price.amount,
      currency: item.price.currency,
      category: item.category,
    });

    setShowPurchaseDialog(false);
  };

  const getRarityColor = (rarity: number) => {
    const colors = {
      1: 'text-gray-400',
      2: 'text-green-400',
      3: 'text-blue-400',
      4: 'text-purple-400',
      5: 'text-orange-400',
      6: 'text-red-400',
    };
    return colors[rarity as keyof typeof colors] || 'text-gray-400';
  };

  const getRarityBg = (rarity: number) => {
    const colors = {
      1: 'bg-gray-500/20',
      2: 'bg-green-500/20',
      3: 'bg-blue-500/20',
      4: 'bg-purple-500/20',
      5: 'bg-orange-500/20',
      6: 'bg-red-500/20',
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-500/20';
  };

  const getCurrencyIcon = (currency: string) => {
    const icons = {
      gold: '💰',
      gems: '💎',
      honor_points: '🏆',
      arena_coins: '⚔️',
    };
    return icons[currency as keyof typeof icons] || '❓';
  };

  const formatPrice = (price: ShopItem['price'], originalPrice?: number) => (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <span>{getCurrencyIcon(price.currency)}</span>
        <span className="font-bold text-yellow-400">{price.amount.toLocaleString()}</span>
      </div>
      {originalPrice && originalPrice > price.amount && (
        <div className="flex items-center space-x-1 text-sm">
          <span className="line-through text-gray-500">{originalPrice.toLocaleString()}</span>
          <span className="bg-red-500 text-white px-1 py-0.5 rounded text-xs">
            -{Math.round(((originalPrice - price.amount) / originalPrice) * 100)}%
          </span>
        </div>
      )}
    </div>
  );

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <motion.div
      className="space-y-6 particle-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 页面标题和货币显示 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-game-title text-shadow-glow font-game">
            商城
          </h1>
          <p className="text-gray-400 text-shadow">购买道具和资源</p>
        </div>

        {/* 货币显示和充值按钮 */}
        <div className="flex items-center space-x-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(playerCurrency).map(([currency, amount]) => (
              <div key={currency} className="bg-gray-800/60 rounded-lg p-3 text-center min-w-[100px]">
                <div className="text-lg mb-1">{getCurrencyIcon(currency)}</div>
                <div className="text-white font-bold text-sm">
                  {amount.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs">
                  {currency === 'gold' && '金币'}
                  {currency === 'gems' && '宝石'}
                  {currency === 'honor_points' && '荣誉'}
                  {currency === 'arena_coins' && '竞技币'}
                </div>
              </div>
            ))}
          </div>
          
          <Button
            variant="primary"
            onClick={() => navigate('/recharge')}
            className="flex items-center space-x-2"
          >
            <span>💎</span>
            <span>充值</span>
          </Button>
        </div>
      </div>

      {/* 分类标签 */}
      <TabContainer
        tabs={categories.map(cat => ({
          id: cat.id,
          label: cat.name,
          icon: cat.icon,
        }))}
        activeTab={selectedCategory}
        onTabChange={setSelectedCategory}
      />

      {/* 商品列表 */}
      <motion.div
        key={selectedCategory}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GameCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(shopItems[selectedCategory] || []).map((item, index) => (
              <motion.div
                key={item.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedItem?.id === item.id 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                } ${getRarityBg(item.rarity)}`}
                onClick={() => handleItemClick(item)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* 限时标签 */}
                {item.isLimited && item.endTime && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    限时: {formatTimeRemaining(item.endTime)}
                  </div>
                )}

                {/* 折扣标签 */}
                {item.discount && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    -{item.discount}%
                  </div>
                )}

                {/* 商品图标和名称 */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`text-3xl p-2 rounded-lg ${getRarityBg(item.rarity)}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${getRarityColor(item.rarity)}`}>
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* 价格 */}
                <div className="mb-3">
                  {formatPrice(item.price, item.originalPrice)}
                </div>

                {/* 库存和限购信息 */}
                <div className="text-xs text-gray-400 mb-3 space-y-1">
                  {item.stock !== undefined && (
                    <div>库存: {item.stock}</div>
                  )}
                  {item.dailyLimit && (
                    <div>
                      今日限购: {item.purchasedToday || 0}/{item.dailyLimit}
                    </div>
                  )}
                </div>

                {/* 购买按钮 */}
                <Button
                  variant={canPurchase(item).canPurchase ? 'primary' : 'secondary'}
                  size="sm"
                  disabled={!canPurchase(item).canPurchase}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPurchaseDialog(true);
                  }}
                  className="w-full"
                >
                  {canPurchase(item).canPurchase ? '购买' : canPurchase(item).reason}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* 空状态 */}
          {(!shopItems[selectedCategory] || shopItems[selectedCategory].length === 0) && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏪</div>
              <div className="text-gray-400 mb-2">该分类暂无商品</div>
              <div className="text-sm text-gray-500">请稍后再来查看</div>
            </div>
          )}
        </GameCard>
      </motion.div>

      {/* 购买确认对话框 */}
      <AnimatePresence>
        {showPurchaseDialog && selectedItem && (
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
              <h3 className="text-xl font-bold text-white mb-4">确认购买</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`text-3xl p-2 rounded-lg ${getRarityBg(selectedItem.rarity)}`}>
                    {selectedItem.icon}
                  </div>
                  <div>
                    <div className={`font-medium ${getRarityColor(selectedItem.rarity)}`}>
                      {selectedItem.name}
                    </div>
                    <div className="text-gray-400 text-sm">{selectedItem.description}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-2">价格:</div>
                  {formatPrice(selectedItem.price, selectedItem.originalPrice)}
                </div>

                {selectedItem.benefits && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">包含内容:</div>
                    <div className="space-y-1">
                      {selectedItem.benefits.map((benefit, index) => (
                        <div key={index} className="text-sm text-gray-300 flex items-center">
                          <span className="text-green-400 mr-2">•</span>
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setShowPurchaseDialog(false)}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handlePurchase(selectedItem)}
                    className="flex-1"
                  >
                    确认购买
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

export default ShopPage;