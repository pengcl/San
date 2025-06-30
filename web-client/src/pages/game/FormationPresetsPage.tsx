import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useAnalytics } from '../../hooks/useAnalytics';
import GameCard from '../../components/ui/GameCard';
import Button from '../../components/ui/Button';
import FormationGrid from '../../components/ui/FormationGrid';
import type { Hero } from '../../types';

interface FormationPreset {
  id: string;
  name: string;
  description: string;
  formation: (Hero | null)[];
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  tags: string[];
  power: number; // 阵容总战力
  isDefault: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
}

interface PresetStats {
  totalAttack: number;
  totalDefense: number;
  totalHealth: number;
  averageLevel: number;
  factionDistribution: Record<string, number>;
  roleDistribution: Record<string, number>;
}

const FormationPresetsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { trackGameEvent } = useAnalytics();
  
  const [presets, setPresets] = useState<FormationPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<FormationPreset | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<FormationPreset | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'power' | 'usage' | 'date'>('power');
  const [searchQuery, setSearchQuery] = useState('');

  // 新建阵容表单
  const [newPresetForm, setNewPresetForm] = useState({
    name: '',
    description: '',
    tags: '',
    difficulty: 'normal' as FormationPreset['difficulty'],
  });

  // 模拟英雄数据
  const [availableHeroes] = useState<Hero[]>([
    {
      id: 1, name: '刘备', title: '仁德之主', description: '', level: 45, experience: 8750,
      rarity: 5, faction: '蜀', role: '辅助', unit_type: '步兵', cost: 7,
      health: 2100, attack: 180, defense: 220, speed: 75, energy: 100,
      skills: [], equipment: [], created_at: '', updated_at: ''
    },
    {
      id: 2, name: '关羽', title: '武圣', description: '', level: 50, experience: 12000,
      rarity: 6, faction: '蜀', role: '物理输出', unit_type: '骑兵', cost: 8,
      health: 1800, attack: 320, defense: 180, speed: 90, energy: 100,
      skills: [], equipment: [], created_at: '', updated_at: ''
    },
    {
      id: 3, name: '张飞', title: '万夫不当', description: '', level: 42, experience: 7200,
      rarity: 4, faction: '蜀', role: '坦克', unit_type: '步兵', cost: 6,
      health: 2800, attack: 200, defense: 280, speed: 60, energy: 100,
      skills: [], equipment: [], created_at: '', updated_at: ''
    },
    {
      id: 4, name: '诸葛亮', title: '卧龙', description: '', level: 48, experience: 11000,
      rarity: 6, faction: '蜀', role: '法术输出', unit_type: '弓兵', cost: 8,
      health: 1500, attack: 350, defense: 140, speed: 95, energy: 100,
      skills: [], equipment: [], created_at: '', updated_at: ''
    },
    {
      id: 5, name: '赵云', title: '常胜将军', description: '', level: 46, experience: 9500,
      rarity: 5, faction: '蜀', role: '物理输出', unit_type: '骑兵', cost: 7,
      health: 1900, attack: 280, defense: 200, speed: 100, energy: 100,
      skills: [], equipment: [], created_at: '', updated_at: ''
    },
  ]);

  useEffect(() => {
    trackGameEvent('formation_presets_view');
    loadPresets();
  }, [trackGameEvent]);

  const loadPresets = () => {
    // 模拟预设数据
    const mockPresets: FormationPreset[] = [
      {
        id: 'preset_1',
        name: '蜀国精锐',
        description: '以蜀国五虎将为核心的强力阵容',
        formation: [
          availableHeroes[0], // 刘备
          availableHeroes[1], // 关羽
          availableHeroes[2], // 张飞
          availableHeroes[3], // 诸葛亮
          availableHeroes[4], // 赵云
          null,
        ],
        createdAt: '2024-01-15T10:00:00Z',
        lastUsed: '2024-01-20T15:30:00Z',
        usageCount: 25,
        tags: ['蜀国', '五虎将', '平衡'],
        power: 18500,
        isDefault: true,
        difficulty: 'hard',
      },
      {
        id: 'preset_2',
        name: '速攻流',
        description: '高机动性快速击败敌人',
        formation: [
          availableHeroes[1], // 关羽
          availableHeroes[4], // 赵云
          null,
          availableHeroes[3], // 诸葛亮
          null,
          null,
        ],
        createdAt: '2024-01-10T09:00:00Z',
        lastUsed: '2024-01-18T12:15:00Z',
        usageCount: 15,
        tags: ['速攻', '高机动'],
        power: 12800,
        isDefault: false,
        difficulty: 'normal',
      },
      {
        id: 'preset_3',
        name: '坦克流',
        description: '以防御为主的持久战阵容',
        formation: [
          availableHeroes[0], // 刘备
          null,
          availableHeroes[2], // 张飞
          null,
          null,
          null,
        ],
        createdAt: '2024-01-08T14:20:00Z',
        usageCount: 8,
        tags: ['防御', '持久战'],
        power: 8900,
        isDefault: false,
        difficulty: 'easy',
      },
    ];

    setPresets(mockPresets);
  };

  const calculatePresetStats = (preset: FormationPreset): PresetStats => {
    const heroes = preset.formation.filter((hero): hero is Hero => hero !== null);
    
    const stats: PresetStats = {
      totalAttack: heroes.reduce((sum, hero) => sum + hero.attack, 0),
      totalDefense: heroes.reduce((sum, hero) => sum + hero.defense, 0),
      totalHealth: heroes.reduce((sum, hero) => sum + hero.health, 0),
      averageLevel: heroes.length > 0 ? Math.round(heroes.reduce((sum, hero) => sum + hero.level, 0) / heroes.length) : 0,
      factionDistribution: {},
      roleDistribution: {},
    };

    // 计算阵营分布
    heroes.forEach(hero => {
      stats.factionDistribution[hero.faction] = (stats.factionDistribution[hero.faction] || 0) + 1;
    });

    // 计算职业分布
    heroes.forEach(hero => {
      stats.roleDistribution[hero.role] = (stats.roleDistribution[hero.role] || 0) + 1;
    });

    return stats;
  };

  const getFilteredAndSortedPresets = () => {
    let filtered = presets;

    // 难度筛选
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(preset => preset.difficulty === filterDifficulty);
    }

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(preset => 
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'power':
          return b.power - a.power;
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  const createPreset = () => {
    if (!newPresetForm.name.trim()) {
      dispatch(addNotification({
        type: 'error',
        title: '创建失败',
        message: '请输入阵容名称',
        duration: 3000,
      }));
      return;
    }

    const newPreset: FormationPreset = {
      id: `preset_${Date.now()}`,
      name: newPresetForm.name,
      description: newPresetForm.description,
      formation: new Array(6).fill(null),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      tags: newPresetForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      power: 0,
      isDefault: false,
      difficulty: newPresetForm.difficulty,
    };

    setPresets(prev => [...prev, newPreset]);
    
    trackGameEvent('formation_preset_create', {
      presetId: newPreset.id,
      presetName: newPreset.name,
      difficulty: newPreset.difficulty
    });

    dispatch(addNotification({
      type: 'success',
      title: '创建成功',
      message: `阵容预设 "${newPreset.name}" 已创建`,
      duration: 3000,
    }));

    setNewPresetForm({ name: '', description: '', tags: '', difficulty: 'normal' });
    setShowCreateModal(false);
  };

  const deletePreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset?.isDefault) {
      dispatch(addNotification({
        type: 'error',
        title: '删除失败',
        message: '无法删除默认预设',
        duration: 3000,
      }));
      return;
    }

    setPresets(prev => prev.filter(p => p.id !== presetId));
    
    trackGameEvent('formation_preset_delete', {
      presetId,
      presetName: preset?.name
    });

    dispatch(addNotification({
      type: 'success',
      title: '删除成功',
      message: '阵容预设已删除',
      duration: 3000,
    }));
  };

  const usePreset = (preset: FormationPreset) => {
    // 更新使用次数和最后使用时间
    setPresets(prev => prev.map(p => 
      p.id === preset.id 
        ? { 
            ...p, 
            usageCount: p.usageCount + 1, 
            lastUsed: new Date().toISOString() 
          }
        : p
    ));

    trackGameEvent('formation_preset_use', {
      presetId: preset.id,
      presetName: preset.name,
      power: preset.power
    });

    dispatch(addNotification({
      type: 'success',
      title: '阵容应用',
      message: `已应用阵容预设 "${preset.name}"`,
      duration: 3000,
    }));

    // 这里应该导航到阵容编辑页面并应用预设
    navigate('/formation', { state: { preset } });
  };

  const setAsDefault = (presetId: string) => {
    setPresets(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === presetId
    })));

    trackGameEvent('formation_preset_set_default', { presetId });

    dispatch(addNotification({
      type: 'success',
      title: '设置成功',
      message: '默认阵容已更新',
      duration: 3000,
    }));
  };

  const getDifficultyColor = (difficulty: FormationPreset['difficulty']) => {
    const colors = {
      easy: 'text-green-400 bg-green-400/10 border-green-400',
      normal: 'text-blue-400 bg-blue-400/10 border-blue-400',
      hard: 'text-orange-400 bg-orange-400/10 border-orange-400',
      extreme: 'text-red-400 bg-red-400/10 border-red-400',
    };
    return colors[difficulty];
  };

  const getDifficultyText = (difficulty: FormationPreset['difficulty']) => {
    const texts = {
      easy: '简单',
      normal: '普通',
      hard: '困难',
      extreme: '极难',
    };
    return texts[difficulty];
  };

  const filteredPresets = getFilteredAndSortedPresets();

  return (
    <motion.div
      className="space-y-6 particle-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 返回按钮和标题 */}
      <div className="flex items-center justify-between">
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
              阵容预设
            </h1>
            <p className="text-gray-400 text-shadow">
              管理和使用预设阵容
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <span>+</span>
          <span>新建预设</span>
        </Button>
      </div>

      {/* 筛选和排序 */}
      <GameCard className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">搜索:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索预设名称或标签..."
              className="bg-gray-700 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">难度:</span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-gray-700 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-orange-500 focus:outline-none"
            >
              <option value="all">全部</option>
              <option value="easy">简单</option>
              <option value="normal">普通</option>
              <option value="hard">困难</option>
              <option value="extreme">极难</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-gray-700 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-orange-500 focus:outline-none"
            >
              <option value="power">战力</option>
              <option value="name">名称</option>
              <option value="usage">使用次数</option>
              <option value="date">创建时间</option>
            </select>
          </div>
        </div>
      </GameCard>

      {/* 预设列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPresets.map((preset, index) => {
          const stats = calculatePresetStats(preset);
          
          return (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GameCard className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:shadow-orange-500/20 ${
                preset.isDefault ? 'border-2 border-orange-500' : ''
              }`}>
                {/* 预设头部 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{preset.name}</h3>
                      {preset.isDefault && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">
                          默认
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(preset.difficulty)}`}>
                        {getDifficultyText(preset.difficulty)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{preset.description}</p>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {preset.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 统计信息 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">战力</div>
                        <div className="text-orange-400 font-bold">{preset.power.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">使用次数</div>
                        <div className="text-white">{preset.usageCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">平均等级</div>
                        <div className="text-blue-400">{stats.averageLevel}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">最后使用</div>
                        <div className="text-gray-300 text-xs">
                          {preset.lastUsed 
                            ? new Date(preset.lastUsed).toLocaleDateString() 
                            : '未使用'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 阵容预览 */}
                  <div className="ml-4">
                    <FormationGrid
                      formation={preset.formation || []}
                      onPositionClick={() => {}}
                      size="sm"
                      editable={false}
                    />
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => usePreset(preset)}
                    className="flex-1"
                  >
                    使用阵容
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedPreset(preset)}
                  >
                    详情
                  </Button>

                  {!preset.isDefault && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setAsDefault(preset.id)}
                    >
                      设为默认
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deletePreset(preset.id)}
                    disabled={preset.isDefault}
                  >
                    删除
                  </Button>
                </div>
              </GameCard>
            </motion.div>
          );
        })}
      </div>

      {/* 空状态 */}
      {filteredPresets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            没有找到匹配的预设
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || filterDifficulty !== 'all' 
              ? '尝试调整搜索条件或筛选器' 
              : '还没有创建任何阵容预设'
            }
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            创建第一个预设
          </Button>
        </div>
      )}

      {/* 创建预设弹窗 */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6">创建阵容预设</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    预设名称 *
                  </label>
                  <input
                    type="text"
                    value={newPresetForm.name}
                    onChange={(e) => setNewPresetForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入预设名称"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    描述
                  </label>
                  <textarea
                    value={newPresetForm.description}
                    onChange={(e) => setNewPresetForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="描述这个阵容的特点..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    标签 (用逗号分隔)
                  </label>
                  <input
                    type="text"
                    value={newPresetForm.tags}
                    onChange={(e) => setNewPresetForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="例如: 蜀国, 物理输出, 速攻"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    难度等级
                  </label>
                  <select
                    value={newPresetForm.difficulty}
                    onChange={(e) => setNewPresetForm(prev => ({ ...prev, difficulty: e.target.value as FormationPreset['difficulty'] }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="easy">简单</option>
                    <option value="normal">普通</option>
                    <option value="hard">困难</option>
                    <option value="extreme">极难</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={createPreset}
                >
                  创建
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 预设详情弹窗 */}
      <AnimatePresence>
        {selectedPreset && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPreset(null)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedPreset.name}</h3>
                  <p className="text-gray-400">{selectedPreset.description}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedPreset(null)}
                >
                  ✕
                </Button>
              </div>

              {/* 阵容详情内容 */}
              <div className="space-y-6">
                {/* 阵容展示 */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">阵容配置</h4>
                  <FormationGrid
                    formation={selectedPreset.formation || []}
                    onPositionClick={() => {}}
                    editable={false}
                  />
                </div>

                {/* 统计信息 */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">统计信息</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      const stats = calculatePresetStats(selectedPreset);
                      return (
                        <>
                          <div className="bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-red-400 text-sm">总攻击</div>
                            <div className="text-xl font-bold text-white">{stats.totalAttack}</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-blue-400 text-sm">总防御</div>
                            <div className="text-xl font-bold text-white">{stats.totalDefense}</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-green-400 text-sm">总生命</div>
                            <div className="text-xl font-bold text-white">{stats.totalHealth}</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-yellow-400 text-sm">平均等级</div>
                            <div className="text-xl font-bold text-white">{stats.averageLevel}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 阵营和职业分布 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">阵营分布</h4>
                    <div className="space-y-2">
                      {Object.entries(calculatePresetStats(selectedPreset).factionDistribution).map(([faction, count]) => (
                        <div key={faction} className="flex justify-between items-center">
                          <span className="text-gray-300">{faction}</span>
                          <span className="text-orange-400">{count}人</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">职业分布</h4>
                    <div className="space-y-2">
                      {Object.entries(calculatePresetStats(selectedPreset).roleDistribution).map(([role, count]) => (
                        <div key={role} className="flex justify-between items-center">
                          <span className="text-gray-300">{role}</span>
                          <span className="text-blue-400">{count}人</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    usePreset(selectedPreset);
                    setSelectedPreset(null);
                  }}
                >
                  使用这个阵容
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FormationPresetsPage;