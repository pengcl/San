-- ===========================
-- 法宝系统
-- Artifact System - Advanced Treasures Beyond Equipment
-- ===========================

-- 1. 创建法宝品质等级表 (超越普通装备的稀有度)
CREATE TABLE IF NOT EXISTS artifact_rarities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rarity_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    glow_effect VARCHAR(50), -- 发光特效
    particle_effect VARCHAR(50), -- 粒子特效
    rarity_tier INT NOT NULL, -- 稀有度等级 (7-12，超越装备的6级)
    drop_rate DECIMAL(5,4) DEFAULT 0.0001, -- 掉落概率
    max_level INT DEFAULT 100, -- 最大等级
    upgrade_cost_multiplier DECIMAL(4,2) DEFAULT 1.0,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入法宝品质数据
INSERT IGNORE INTO artifact_rarities (rarity_id, name_zh, name_en, description, color_hex, glow_effect, particle_effect, rarity_tier, drop_rate, max_level, upgrade_cost_multiplier, display_order) VALUES
('divine', '神器', 'Divine', '传说中的神明遗物，拥有改变战局的神秘力量', '#FFD700', 'golden_aura', 'divine_sparks', 12, 0.0001, 200, 10.0, 1),
('immortal', '仙器', 'Immortal', '仙人炼制的超凡宝物，蕴含仙灵之力', '#E6E6FA', 'silver_aura', 'immortal_mist', 11, 0.0005, 180, 7.5, 2),
('legendary', '圣器', 'Sacred', '圣贤遗留的神圣宝物，承载着古老的智慧', '#FF6347', 'crimson_aura', 'sacred_flames', 10, 0.002, 160, 5.0, 3),
('ancient', '古器', 'Ancient', '上古时代流传下来的神秘器物', '#8A2BE2', 'purple_aura', 'ancient_runes', 9, 0.01, 140, 3.5, 4),
('mystical', '灵器', 'Mystical', '充满灵性的奇异宝物，具有独特能力', '#00CED1', 'cyan_aura', 'mystical_orbs', 8, 0.05, 120, 2.0, 5),
('magical', '宝器', 'Precious', '珍贵的魔法物品，蕴含强大魔力', '#FF1493', 'pink_aura', 'magical_sparkles', 7, 0.1, 100, 1.5, 6);

-- 2. 创建法宝类型表
CREATE TABLE IF NOT EXISTS artifact_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    icon_url VARCHAR(255),
    slot_type ENUM('primary', 'secondary', 'accessory', 'consumable') DEFAULT 'accessory',
    max_equipped INT DEFAULT 1, -- 可同时装备的数量
    effect_category ENUM('combat', 'passive', 'active', 'utility') NOT NULL,
    cooldown_base INT DEFAULT 0, -- 基础冷却时间(秒)
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入法宝类型数据
INSERT IGNORE INTO artifact_types (type_id, name_zh, name_en, description, color_hex, slot_type, max_equipped, effect_category, cooldown_base, display_order) VALUES
-- 主要法宝 (Primary Artifacts)
('weapon_spirit', '器灵', 'Weapon Spirit', '附着在武器上的强大灵体，大幅提升战斗能力', '#FF4500', 'primary', 1, 'combat', 0, 1),
('battle_soul', '战魂', 'Battle Soul', '古代英雄的战斗灵魂，提供强大的作战技巧', '#B22222', 'primary', 1, 'combat', 0, 2),
('divine_blessing', '神佑', 'Divine Blessing', '神明的祝福，提供全方位的能力加成', '#FFD700', 'primary', 1, 'passive', 0, 3),

-- 次要法宝 (Secondary Artifacts)  
('tactical_manual', '兵书', 'Tactical Manual', '记载古代兵法的珍贵典籍，提升战术能力', '#4169E1', 'secondary', 2, 'passive', 0, 4),
('mystical_scroll', '奇门', 'Mystical Scroll', '神秘的法术卷轴，蕴含强大的魔法力量', '#8B008B', 'secondary', 2, 'active', 300, 5),
('protection_charm', '护符', 'Protection Charm', '具有防护能力的神秘符咒', '#32CD32', 'secondary', 2, 'passive', 0, 6),

-- 饰品法宝 (Accessory Artifacts)
('power_crystal', '灵晶', 'Power Crystal', '蕴含纯净能量的神秘水晶', '#00BFFF', 'accessory', 3, 'passive', 0, 7),
('spirit_gem', '魂玉', 'Spirit Gem', '封印灵魂力量的珍贵宝石', '#9370DB', 'accessory', 3, 'passive', 0, 8),
('elemental_orb', '元珠', 'Elemental Orb', '掌控元素力量的神奇珠子', '#FF6347', 'accessory', 3, 'active', 600, 9),

-- 消耗品法宝 (Consumable Artifacts)
('divine_elixir', '仙丹', 'Divine Elixir', '仙人炼制的神丹妙药，可瞬间恢复状态', '#FFB6C1', 'consumable', 10, 'utility', 0, 10),
('summoning_talisman', '符令', 'Summoning Talisman', '可召唤神兽协助作战的神秘符令', '#DDA0DD', 'consumable', 5, 'active', 0, 11),
('teleport_stone', '遁石', 'Teleport Stone', '可瞬间传送的神奇石头', '#F0E68C', 'consumable', 3, 'utility', 0, 12);

-- 3. 创建法宝主表
CREATE TABLE IF NOT EXISTS artifacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artifact_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type_id VARCHAR(20) NOT NULL,
    rarity_id VARCHAR(20) NOT NULL,
    description TEXT,
    lore TEXT, -- 背景故事
    icon_url VARCHAR(255),
    model_url VARCHAR(255),
    
    -- 基础属性
    base_power INT DEFAULT 0, -- 基础威力
    base_defense INT DEFAULT 0, -- 基础防御
    base_energy INT DEFAULT 0, -- 基础能量
    
    -- 特殊属性
    special_attributes JSON, -- 特殊属性加成
    passive_effects JSON, -- 被动效果
    active_abilities JSON, -- 主动技能
    
    -- 等级和成长
    max_level INT DEFAULT 100,
    exp_curve_type ENUM('linear', 'exponential', 'plateau') DEFAULT 'exponential',
    growth_rate DECIMAL(4,2) DEFAULT 1.0,
    
    -- 获取和合成
    source_type ENUM('drop', 'craft', 'quest', 'shop', 'event') NOT NULL,
    drop_locations JSON, -- 掉落地点
    craft_materials JSON, -- 合成材料
    craft_cost INT DEFAULT 0, -- 合成费用
    
    -- 装备限制
    level_requirement INT DEFAULT 1,
    class_restrictions JSON, -- 职业限制
    faction_restrictions JSON, -- 阵营限制
    
    -- 强化和进阶
    enhancement_max INT DEFAULT 15, -- 最大强化等级
    evolution_materials JSON, -- 进阶材料
    evolution_stages JSON, -- 进阶阶段
    
    -- 套装相关
    set_id VARCHAR(50), -- 套装ID
    set_piece_index INT DEFAULT 0, -- 套装件数索引
    
    -- 系统属性
    is_tradeable BOOLEAN DEFAULT TRUE, -- 是否可交易
    is_destroyable BOOLEAN DEFAULT TRUE, -- 是否可分解
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type_id),
    INDEX idx_rarity (rarity_id),
    INDEX idx_set (set_id),
    INDEX idx_level_req (level_requirement),
    FOREIGN KEY (type_id) REFERENCES artifact_types(type_id),
    FOREIGN KEY (rarity_id) REFERENCES artifact_rarities(rarity_id)
);

-- 4. 创建法宝套装表
CREATE TABLE IF NOT EXISTS artifact_sets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    set_id VARCHAR(50) NOT NULL UNIQUE,
    name_zh VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    description TEXT,
    lore TEXT, -- 套装背景故事
    theme_color VARCHAR(7) NOT NULL,
    set_type ENUM('combat', 'utility', 'hybrid') NOT NULL,
    
    -- 套装件数和效果
    total_pieces INT NOT NULL DEFAULT 3, -- 总件数
    piece_2_bonus JSON, -- 2件套效果
    piece_3_bonus JSON, -- 3件套效果
    piece_4_bonus JSON, -- 4件套效果
    piece_5_bonus JSON, -- 5件套效果
    piece_full_bonus JSON, -- 全套效果
    
    -- 套装特性
    synergy_effects JSON, -- 协同效果
    evolution_bonuses JSON, -- 进化加成
    legendary_effect JSON, -- 传说效果
    
    -- 获取信息
    source_expansion VARCHAR(50), -- 来源版本
    difficulty_tier INT DEFAULT 1, -- 难度等级
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 创建法宝效果表
CREATE TABLE IF NOT EXISTS artifact_effects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    effect_id VARCHAR(30) NOT NULL UNIQUE,
    name_zh VARCHAR(30) NOT NULL,
    name_en VARCHAR(30) NOT NULL,
    description TEXT,
    effect_type ENUM('attribute', 'skill', 'special', 'trigger') NOT NULL,
    effect_category ENUM('offensive', 'defensive', 'utility', 'resource') NOT NULL,
    
    -- 效果数值
    base_value DECIMAL(10,2) DEFAULT 0,
    scaling_type ENUM('fixed', 'percentage', 'level_based', 'attribute_based') DEFAULT 'fixed',
    scaling_factor DECIMAL(4,2) DEFAULT 1.0,
    
    -- 触发条件
    trigger_condition VARCHAR(100), -- 触发条件
    trigger_chance DECIMAL(3,2) DEFAULT 1.0, -- 触发概率
    cooldown_seconds INT DEFAULT 0, -- 冷却时间
    
    -- 持续时间
    duration_type ENUM('instant', 'duration', 'permanent', 'toggle') DEFAULT 'instant',
    duration_seconds INT DEFAULT 0,
    
    -- 效果标签
    effect_tags JSON, -- 效果标签
    counter_effects JSON, -- 反制效果
    
    color_hex VARCHAR(7) NOT NULL,
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 创建用户法宝表
CREATE TABLE IF NOT EXISTS user_artifacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    artifact_id INT NOT NULL,
    
    -- 个体属性
    current_level INT DEFAULT 1,
    current_exp INT DEFAULT 0,
    enhancement_level INT DEFAULT 0, -- 强化等级
    evolution_stage INT DEFAULT 0, -- 进化阶段
    
    -- 装备状态
    is_equipped BOOLEAN DEFAULT FALSE,
    equipped_at DATETIME NULL,
    equipment_slot VARCHAR(20), -- 装备槽位
    
    -- 个性化
    custom_name VARCHAR(100), -- 自定义名称
    custom_description TEXT, -- 自定义描述
    
    -- 历史记录
    acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    acquired_method ENUM('drop', 'craft', 'trade', 'gift', 'event') NOT NULL,
    upgrade_history JSON, -- 升级历史
    
    -- 统计数据
    battles_used INT DEFAULT 0, -- 使用次数
    damage_dealt BIGINT DEFAULT 0, -- 造成伤害
    abilities_triggered INT DEFAULT 0, -- 技能触发次数
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_artifact_id (artifact_id),
    INDEX idx_equipped (is_equipped),
    INDEX idx_level (current_level),
    UNIQUE KEY unique_user_artifact (user_id, artifact_id)
);

-- 7. 创建法宝强化材料表
CREATE TABLE IF NOT EXISTS artifact_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id VARCHAR(30) NOT NULL UNIQUE,
    name_zh VARCHAR(30) NOT NULL,
    name_en VARCHAR(30) NOT NULL,
    description TEXT,
    material_type ENUM('essence', 'crystal', 'fragment', 'core', 'catalyst') NOT NULL,
    rarity_tier INT DEFAULT 1, -- 材料稀有度
    
    -- 用途
    usage_type ENUM('enhancement', 'evolution', 'repair', 'craft') NOT NULL,
    enhancement_power INT DEFAULT 1, -- 强化力度
    success_rate DECIMAL(3,2) DEFAULT 1.0, -- 成功率
    
    -- 获取方式
    source_methods JSON, -- 获取方法
    drop_rate DECIMAL(5,4) DEFAULT 0.01,
    
    -- 经济属性
    base_value INT DEFAULT 100, -- 基础价值
    stack_size INT DEFAULT 999, -- 堆叠上限
    
    color_hex VARCHAR(7) NOT NULL,
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 显示创建结果
SELECT 'Artifact System Created Successfully!' as status;

-- 统计各个系统的数据
SELECT 
    'Artifact Rarities' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM artifact_rarities WHERE is_active = TRUE

UNION ALL

SELECT 
    'Artifact Types' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM artifact_types WHERE is_active = TRUE;