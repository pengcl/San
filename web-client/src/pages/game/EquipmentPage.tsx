import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useAnalytics } from '../../hooks/useAnalytics';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
import TabContainer from '../../components/ui/TabContainer';
import type { Hero } from '../../types';

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'boots' | 'helmet' | 'gloves';
  rarity: number;
  level: number;
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    speed?: number;
    critical?: number;
    accuracy?: number;
  };
  requirements?: {
    level?: number;
    faction?: string;
    role?: string;
  };
  description: string;
  isEquipped: boolean;
  equippedBy?: number; // heroId
  icon: string;
  price?: number;
}

interface EquipmentSlot {
  type: Equipment['type'];
  name: string;
  icon: string;
  equipment?: Equipment;
}

const EquipmentPage: React.FC = () => {
  const { heroId } = useParams<{ heroId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { trackGameEvent } = useAnalytics();
  
  const [hero, setHero] = useState<Hero | null>(null);
  const [selectedTab, setSelectedTab] = useState<'equipped' | 'inventory' | 'enhance'>('equipped');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [equipmentInventory, setEquipmentInventory] = useState<Equipment[]>([]);

  // 装备槽位定义
  const equipmentSlots: EquipmentSlot[] = [
    { type: 'weapon', name: '武器', icon: '⚔️' },
    { type: 'helmet', name: '头盔', icon: '⛑️' },
    { type: 'armor', name: '护甲', icon: '🛡️' },
    { type: 'gloves', name: '手套', icon: '🧤' },
    { type: 'boots', name: '靴子', icon: '👢' },
    { type: 'accessory', name: '饰品', icon: '💍' },
  ];

  useEffect(() => {
    trackGameEvent('equipment_page_view', { heroId });
    
    // 模拟加载武将数据
    const mockHero: Hero = {
      id: parseInt(heroId || '1'),
      name: '赵云',
      title: '常胜将军',
      description: '赵云，字子龙，常山真定人，三国时期蜀汉名将。',
      level: 18,
      experience: 3250,
      rarity: 5,
      faction: '蜀',
      role: '物理输出',
      unit_type: '骑兵',
      cost: 6,
      health: 1850,
      attack: 285,
      defense: 180,
      speed: 95,
      energy: 100,
      skills: [],
      equipment: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setHero(mockHero);

    // 生成模拟装备数据
    const mockEquipment: Equipment[] = [
      {
        id: 'weapon_1',
        name: '青龙偃月刀',
        type: 'weapon',
        rarity: 5,
        level: 15,
        stats: { attack: 45, critical: 8 },
        requirements: { level: 10, faction: '蜀' },
        description: '关羽的武器，锋利无比，威震天下',
        isEquipped: true,
        equippedBy: parseInt(heroId || '1'),
        icon: '⚔️',
      },
      {
        id: 'armor_1',
        name: '龙鳞甲',
        type: 'armor',
        rarity: 4,
        level: 12,
        stats: { defense: 35, health: 150 },
        requirements: { level: 8 },
        description: '用龙鳞制作的护甲，防御力惊人',
        isEquipped: true,
        equippedBy: parseInt(heroId || '1'),
        icon: '🛡️',
      },
      {
        id: 'weapon_2',
        name: '霸王枪',
        type: 'weapon',
        rarity: 6,
        level: 20,
        stats: { attack: 65, speed: 10, critical: 12 },
        requirements: { level: 20, role: '物理输出' },
        description: '传说中霸王项羽使用的神兵',
        isEquipped: false,
        icon: '🔱',
        price: 50000,
      },
      {
        id: 'helmet_1',
        name: '虎头盔',
        type: 'helmet',
        rarity: 3,
        level: 10,
        stats: { defense: 20, health: 80 },
        requirements: { level: 5 },
        description: '虎头造型的头盔，威风凛凛',
        isEquipped: false,
        icon: '⛑️',
        price: 8000,
      },
      {
        id: 'boots_1',
        name: '风行靴',
        type: 'boots',
        rarity: 4,
        level: 8,
        stats: { speed: 15, accuracy: 5 },
        requirements: { level: 8 },
        description: '轻如羽毛的靴子，大大提升移动速度',
        isEquipped: false,
        icon: '👢',
        price: 12000,
      },
      {
        id: 'accessory_1',
        name: '玉佩',
        type: 'accessory',
        rarity: 5,
        level: 15,
        stats: { health: 200, defense: 15, critical: 5 },
        requirements: { level: 15 },
        description: '温润如玉的佩饰，蕴含神秘力量',
        isEquipped: false,
        icon: '💍',
        price: 25000,
      },
    ];

    setEquipmentInventory(mockEquipment);
  }, [heroId, trackGameEvent]);

  const getEquippedItem = (type: Equipment['type']): Equipment | undefined => {
    return equipmentInventory.find(eq => eq.type === type && eq.isEquipped && eq.equippedBy === hero?.id);
  };

  const getAvailableEquipment = (type: Equipment['type']): Equipment[] => {
    return equipmentInventory.filter(eq => 
      eq.type === type && 
      !eq.isEquipped && 
      canEquip(eq)
    );
  };

  const canEquip = (equipment: Equipment): boolean => {
    if (!hero) return false;
    
    if (equipment.requirements) {
      if (equipment.requirements.level && hero.level < equipment.requirements.level) return false;
      if (equipment.requirements.faction && hero.faction !== equipment.requirements.faction) return false;
      if (equipment.requirements.role && hero.role !== equipment.requirements.role) return false;
    }
    
    return true;
  };

  const equipItem = (equipment: Equipment) => {
    if (!hero || !canEquip(equipment)) return;

    // 先卸下同类型装备
    const currentEquipped = getEquippedItem(equipment.type);
    if (currentEquipped) {
      unequipItem(currentEquipped);
    }

    // 装备新物品
    setEquipmentInventory(prev => 
      prev.map(eq => 
        eq.id === equipment.id 
          ? { ...eq, isEquipped: true, equippedBy: hero.id }
          : eq
      )
    );

    // 更新武将属性
    setHero(prev => {
      if (!prev) return prev;
      const newStats = { ...prev };
      if (equipment.stats.attack) newStats.attack += equipment.stats.attack;
      if (equipment.stats.defense) newStats.defense += equipment.stats.defense;
      if (equipment.stats.health) newStats.health += equipment.stats.health;
      if (equipment.stats.speed) newStats.speed += equipment.stats.speed;
      return newStats;
    });

    trackGameEvent('equipment_equip', {
      heroId: hero.id,
      equipmentId: equipment.id,
      equipmentType: equipment.type,
      equipmentRarity: equipment.rarity
    });

    dispatch(
      addNotification({
        type: 'success',
        title: '装备成功',
        message: `${hero.name} 装备了 ${equipment.name}`,
        duration: 3000,
      })
    );

    setSelectedEquipment(null);
  };

  const unequipItem = (equipment: Equipment) => {
    if (!hero) return;

    setEquipmentInventory(prev => 
      prev.map(eq => 
        eq.id === equipment.id 
          ? { ...eq, isEquipped: false, equippedBy: undefined }
          : eq
      )
    );

    // 更新武将属性
    setHero(prev => {
      if (!prev) return prev;
      const newStats = { ...prev };
      if (equipment.stats.attack) newStats.attack -= equipment.stats.attack;
      if (equipment.stats.defense) newStats.defense -= equipment.stats.defense;
      if (equipment.stats.health) newStats.health -= equipment.stats.health;
      if (equipment.stats.speed) newStats.speed -= equipment.stats.speed;
      return newStats;
    });

    trackGameEvent('equipment_unequip', {
      heroId: hero.id,
      equipmentId: equipment.id,
      equipmentType: equipment.type
    });

    dispatch(
      addNotification({
        type: 'info',
        title: '卸下装备',
        message: `${hero.name} 卸下了 ${equipment.name}`,
        duration: 3000,
      })
    );
  };

  const enhanceEquipment = (equipment: Equipment) => {
    const cost = equipment.level * 1000;
    
    setEquipmentInventory(prev =>
      prev.map(eq => {
        if (eq.id === equipment.id) {
          const enhanced = { ...eq, level: eq.level + 1 };
          // 提升属性
          if (enhanced.stats.attack) enhanced.stats.attack = Math.floor(enhanced.stats.attack * 1.1);
          if (enhanced.stats.defense) enhanced.stats.defense = Math.floor(enhanced.stats.defense * 1.1);
          if (enhanced.stats.health) enhanced.stats.health = Math.floor(enhanced.stats.health * 1.1);
          if (enhanced.stats.speed) enhanced.stats.speed = Math.floor(enhanced.stats.speed * 1.1);
          return enhanced;
        }
        return eq;
      })
    );

    trackGameEvent('equipment_enhance', {
      equipmentId: equipment.id,
      newLevel: equipment.level + 1,
      cost
    });

    dispatch(
      addNotification({
        type: 'success',
        title: '强化成功',
        message: `${equipment.name} 强化至 +${equipment.level + 1}`,
        duration: 3000,
      })
    );
  };

  const getRarityColor = (rarity: number): string => {
    const colors = {
      1: 'border-gray-500 bg-gray-500/10',
      2: 'border-green-500 bg-green-500/10',
      3: 'border-blue-500 bg-blue-500/10',
      4: 'border-purple-500 bg-purple-500/10',
      5: 'border-orange-500 bg-orange-500/10',
      6: 'border-red-500 bg-red-500/10',
    };
    return colors[rarity as keyof typeof colors] || colors[1];
  };

  const renderEquipmentCard = (equipment: Equipment, isSlot = false) => (
    <motion.div
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
        getRarityColor(equipment.rarity)
      } ${selectedEquipment?.id === equipment.id ? 'ring-2 ring-orange-500' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedEquipment(equipment)}
    >
      <div className="text-center">
        <div className="text-2xl mb-2">{equipment.icon}</div>
        <div className="text-sm font-medium text-white truncate">{equipment.name}</div>
        <div className="text-xs text-gray-400">+{equipment.level}</div>
        
        {/* 品质星级 */}
        <div className="flex justify-center mt-1">
          {Array.from({ length: equipment.rarity }, (_, i) => (
            <span key={i} className="text-yellow-400 text-xs">★</span>
          ))}
        </div>

        {/* 主要属性 */}
        <div className="mt-2 space-y-1">
          {equipment.stats.attack && (
            <div className="text-xs text-red-400">攻击 +{equipment.stats.attack}</div>
          )}
          {equipment.stats.defense && (
            <div className="text-xs text-blue-400">防御 +{equipment.stats.defense}</div>
          )}
          {equipment.stats.health && (
            <div className="text-xs text-green-400">生命 +{equipment.stats.health}</div>
          )}
          {equipment.stats.speed && (
            <div className="text-xs text-yellow-400">速度 +{equipment.stats.speed}</div>
          )}
        </div>

        {equipment.isEquipped && (
          <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
            已装备
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderEquippedTab = () => (
    <div className="space-y-6">
      {/* 武将属性预览 */}
      {hero && (
        <GameCard className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
              {hero.name[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{hero.name}</h3>
              <p className="text-orange-400">{hero.title}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-red-400 text-sm">攻击力</div>
              <div className="text-xl font-bold text-white">{hero.attack}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-blue-400 text-sm">防御力</div>
              <div className="text-xl font-bold text-white">{hero.defense}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-green-400 text-sm">生命值</div>
              <div className="text-xl font-bold text-white">{hero.health}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-yellow-400 text-sm">速度</div>
              <div className="text-xl font-bold text-white">{hero.speed}</div>
            </div>
          </div>
        </GameCard>
      )}

      {/* 装备槽位 */}
      <GameCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">装备栏</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {equipmentSlots.map(slot => {
            const equippedItem = getEquippedItem(slot.type);
            
            return (
              <div key={slot.type} className="space-y-2">
                <div className="text-center text-sm text-gray-400">{slot.name}</div>
                {equippedItem ? (
                  renderEquipmentCard(equippedItem)
                ) : (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <div className="text-2xl opacity-50">{slot.icon}</div>
                    <div className="text-xs text-gray-500 mt-2">无装备</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GameCard>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="space-y-6">
      {equipmentSlots.map(slot => {
        const availableItems = getAvailableEquipment(slot.type);
        
        if (availableItems.length === 0) return null;
        
        return (
          <GameCard key={slot.type} className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <span>{slot.icon}</span>
              <span>{slot.name}</span>
              <span className="text-sm text-gray-400">({availableItems.length})</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {availableItems.map(equipment => renderEquipmentCard(equipment))}
            </div>
          </GameCard>
        );
      })}
    </div>
  );

  const renderEnhanceTab = () => (
    <div className="space-y-6">
      <GameCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">装备强化</h3>
        <p className="text-gray-400 mb-6">选择已装备的物品进行强化，提升属性</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {equipmentSlots.map(slot => {
            const equippedItem = getEquippedItem(slot.type);
            
            if (!equippedItem) return null;
            
            return (
              <div key={slot.type} className="space-y-4">
                {renderEquipmentCard(equippedItem)}
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">
                    强化费用: {equippedItem.level * 1000} 金币
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => enhanceEquipment(equippedItem)}
                    className="w-full"
                  >
                    强化 +{equippedItem.level + 1}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </GameCard>
    </div>
  );

  if (!hero) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载武将信息中...</p>
        </div>
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
      {/* 返回按钮和标题 */}
      <div className="flex items-center space-x-4">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <span>←</span>
          <span>返回</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-game-title text-shadow-glow font-game">
            装备管理
          </h1>
          <p className="text-gray-400 text-shadow">
            {hero.name} - {hero.title}
          </p>
        </div>
      </div>

      {/* 标签页 */}
      <TabContainer
        tabs={[
          { key: 'equipped', label: '已装备', icon: '⚔️' },
          { key: 'inventory', label: '装备库', icon: '📦' },
          { key: 'enhance', label: '装备强化', icon: '⭐' },
        ]}
        activeTab={selectedTab}
        onTabChange={(tab) => setSelectedTab(tab as typeof selectedTab)}
      >
        {selectedTab === 'equipped' && renderEquippedTab()}
        {selectedTab === 'inventory' && renderInventoryTab()}
        {selectedTab === 'enhance' && renderEnhanceTab()}
      </TabContainer>

      {/* 装备详情弹窗 */}
      <AnimatePresence>
        {selectedEquipment && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEquipment(null)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{selectedEquipment.icon}</div>
                <h3 className="text-xl font-bold text-white">{selectedEquipment.name}</h3>
                <div className="flex justify-center mt-1">
                  {Array.from({ length: selectedEquipment.rarity }, (_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-400 mt-2 text-sm">{selectedEquipment.description}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-2">属性</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedEquipment.stats).map(([stat, value]) => (
                      <div key={stat} className="bg-gray-700 rounded p-2 text-center">
                        <div className="text-xs text-gray-400 capitalize">{stat}</div>
                        <div className="text-white font-bold">+{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedEquipment.requirements && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">装备要求</div>
                    <div className="text-sm space-y-1">
                      {selectedEquipment.requirements.level && (
                        <div className={hero && hero.level >= selectedEquipment.requirements.level ? 'text-green-400' : 'text-red-400'}>
                          等级: {selectedEquipment.requirements.level}
                        </div>
                      )}
                      {selectedEquipment.requirements.faction && (
                        <div className={hero && hero.faction === selectedEquipment.requirements.faction ? 'text-green-400' : 'text-red-400'}>
                          阵营: {selectedEquipment.requirements.faction}
                        </div>
                      )}
                      {selectedEquipment.requirements.role && (
                        <div className={hero && hero.role === selectedEquipment.requirements.role ? 'text-green-400' : 'text-red-400'}>
                          职业: {selectedEquipment.requirements.role}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setSelectedEquipment(null)}
                >
                  关闭
                </Button>
                {selectedEquipment.isEquipped ? (
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => {
                      unequipItem(selectedEquipment);
                      setSelectedEquipment(null);
                    }}
                  >
                    卸下
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="flex-1"
                    disabled={!canEquip(selectedEquipment)}
                    onClick={() => equipItem(selectedEquipment)}
                  >
                    装备
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EquipmentPage;