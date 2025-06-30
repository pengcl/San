-- ===========================
-- 技能分类增强系统
-- Enhanced Skill Classification System
-- ===========================

-- 1. 创建技能伤害类型表 (物理/法术/真实伤害)
CREATE TABLE IF NOT EXISTS skill_damage_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    icon_url VARCHAR(255),
    damage_formula VARCHAR(100), -- 伤害计算公式参考
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入伤害类型数据 (使用INSERT IGNORE避免重复)
INSERT IGNORE INTO skill_damage_types (type_id, name_zh, name_en, description, color_hex, damage_formula, display_order) VALUES
('physical', '物理伤害', 'Physical', '基于力量和武器攻击力的物理伤害，可被护甲减免', '#CD853F', 'ATK * (1 - DEF/1000)', 1),
('magical', '法术伤害', 'Magical', '基于智力和法术强度的魔法伤害，可被魔抗减免', '#4169E1', 'INT * (1 - MR/1000)', 2),
('true', '真实伤害', 'True', '无视防御的真实伤害，无法被减免', '#DC143C', 'DMG * 1.0', 3),
('hybrid', '混合伤害', 'Hybrid', '同时包含物理和法术伤害成分', '#8B008B', '(ATK + INT) * 0.7', 4),
('pure', '纯净伤害', 'Pure', '特殊的纯净伤害，穿透部分防御', '#FFD700', 'DMG * (1 - DEF*0.3/1000)', 5);

-- 2. 创建技能焦点类型表 (智力/体力/物理/混合)
CREATE TABLE IF NOT EXISTS skill_focus_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    primary_stat VARCHAR(20), -- 主要属性依赖
    secondary_stat VARCHAR(20), -- 次要属性依赖
    resource_type VARCHAR(20), -- 消耗资源类型
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入焦点类型数据 (使用INSERT IGNORE避免重复)  
INSERT IGNORE INTO skill_focus_types (type_id, name_zh, name_en, description, color_hex, primary_stat, secondary_stat, resource_type, display_order) VALUES
('intelligence', '智力型', 'Intelligence', '依赖智力属性，消耗法力值，擅长法术攻击和控制', '#4169E1', 'INT', 'SPD', 'mana', 1),
('strength', '力量型', 'Strength', '依赖力量属性，消耗体力值，擅长物理攻击和破甲', '#B22222', 'STR', 'ATK', 'stamina', 2),
('agility', '敏捷型', 'Agility', '依赖敏捷属性，消耗能量值，擅长暴击和连击', '#228B22', 'AGI', 'SPD', 'energy', 3),
('vitality', '体质型', 'Vitality', '依赖体质属性，消耗生命值，擅长治疗和防护', '#32CD32', 'VIT', 'HP', 'life', 4),
('hybrid', '混合型', 'Hybrid', '平衡多种属性，适应性强，消耗通用资源', '#8B008B', 'multiple', 'multiple', 'energy', 5),
('special', '特殊型', 'Special', '独特的技能类型，可能有特殊的资源消耗', '#FF8C00', 'special', 'special', 'special', 6);

-- 3. 创建技能作用范围表 (单体/群体/链式/劈砍)
CREATE TABLE IF NOT EXISTS skill_area_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    max_targets INT DEFAULT 1, -- 最大目标数量
    target_pattern VARCHAR(50), -- 目标模式 (line, circle, cone, etc.)
    range_modifier DECIMAL(3,2) DEFAULT 1.00, -- 范围修正
    damage_falloff DECIMAL(3,2) DEFAULT 1.00, -- 伤害递减
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入作用范围数据 (使用INSERT IGNORE避免重复)
INSERT IGNORE INTO skill_area_types (type_id, name_zh, name_en, description, color_hex, max_targets, target_pattern, range_modifier, damage_falloff, display_order) VALUES
('single', '单体攻击', 'Single Target', '精准攻击单一目标，伤害最高', '#FF4500', 1, 'point', 1.00, 1.00, 1),
('multi', '多重攻击', 'Multiple Target', '同时攻击多个指定目标', '#FF6347', 3, 'selected', 1.10, 0.85, 2),
('aoe', '范围攻击', 'Area of Effect', '攻击一定范围内的所有敌人', '#FF8C00', 9, 'circle', 1.50, 0.70, 3),
('line', '直线攻击', 'Line Attack', '沿直线攻击路径上的所有敌人', '#FFA500', 5, 'line', 1.30, 0.80, 4),
('cone', '扇形攻击', 'Cone Attack', '扇形范围内的所有敌人', '#FFD700', 6, 'cone', 1.20, 0.75, 5),
('chain', '连锁攻击', 'Chain Attack', '攻击主目标后跳跃到附近敌人', '#FFFF00', 4, 'chain', 1.00, 0.60, 6),
('cleave', '劈砍攻击', 'Cleave Attack', '攻击主目标及其身后的敌人', '#ADFF2F', 3, 'cleave', 1.10, 0.90, 7),
('splash', '溅射攻击', 'Splash Attack', '攻击主目标并对周围造成溅射伤害', '#98FB98', 5, 'splash', 1.20, 0.50, 8);

-- 4. 创建技能效果类型表
CREATE TABLE IF NOT EXISTS skill_effect_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    effect_category ENUM('damage', 'control', 'buff', 'debuff', 'utility', 'heal') NOT NULL,
    is_stackable BOOLEAN DEFAULT FALSE, -- 是否可叠加
    duration_type ENUM('instant', 'duration', 'permanent', 'toggle') DEFAULT 'instant',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入技能效果类型数据 (使用INSERT IGNORE避免重复)
INSERT IGNORE INTO skill_effect_types (type_id, name_zh, name_en, description, color_hex, effect_category, is_stackable, duration_type, display_order) VALUES
-- 伤害类效果
('burst', '爆发伤害', 'Burst Damage', '瞬间造成大量伤害', '#FF0000', 'damage', FALSE, 'instant', 1),
('dot', '持续伤害', 'Damage over Time', '在一段时间内持续造成伤害', '#DC143C', 'damage', TRUE, 'duration', 2),
('execute', '斩杀伤害', 'Execute Damage', '对低血量敌人造成额外伤害', '#8B0000', 'damage', FALSE, 'instant', 3),

-- 控制类效果
('stun', '眩晕', 'Stun', '使目标无法行动', '#4B0082', 'control', FALSE, 'duration', 4),
('slow', '减速', 'Slow', '降低目标移动和攻击速度', '#6A5ACD', 'control', TRUE, 'duration', 5),
('silence', '沉默', 'Silence', '禁止目标使用技能', '#483D8B', 'control', FALSE, 'duration', 6),
('charm', '魅惑', 'Charm', '使目标为我方作战', '#9370DB', 'control', FALSE, 'duration', 7),
('fear', '恐惧', 'Fear', '使目标随机移动', '#8A2BE2', 'control', FALSE, 'duration', 8),

-- 增益类效果
('attack_buff', '攻击强化', 'Attack Buff', '提升攻击力', '#FF4500', 'buff', TRUE, 'duration', 9),
('defense_buff', '防御强化', 'Defense Buff', '提升防御力', '#4169E1', 'buff', TRUE, 'duration', 10),
('speed_buff', '速度强化', 'Speed Buff', '提升移动和攻击速度', '#32CD32', 'buff', TRUE, 'duration', 11),
('crit_buff', '暴击强化', 'Critical Buff', '提升暴击率和暴击伤害', '#FFD700', 'buff', TRUE, 'duration', 12),

-- 减益类效果
('attack_debuff', '攻击削弱', 'Attack Debuff', '降低敌人攻击力', '#8B4513', 'debuff', TRUE, 'duration', 13),
('defense_debuff', '防御削弱', 'Defense Debuff', '降低敌人防御力', '#A0522D', 'debuff', TRUE, 'duration', 14),
('accuracy_debuff', '命中削弱', 'Accuracy Debuff', '降低敌人命中率', '#D2691E', 'debuff', TRUE, 'duration', 15),

-- 治疗类效果
('heal', '治疗', 'Heal', '恢复生命值', '#00FF00', 'heal', FALSE, 'instant', 16),
('hot', '持续治疗', 'Heal over Time', '在一段时间内持续恢复生命值', '#90EE90', 'heal', TRUE, 'duration', 17),
('shield', '护盾', 'Shield', '提供额外的伤害吸收', '#87CEEB', 'heal', TRUE, 'duration', 18),

-- 辅助类效果
('teleport', '传送', 'Teleport', '瞬间移动到指定位置', '#FF1493', 'utility', FALSE, 'instant', 19),
('dispel', '驱散', 'Dispel', '移除目标身上的效果', '#DDA0DD', 'utility', FALSE, 'instant', 20),
('immune', '免疫', 'Immunity', '对某些效果免疫', '#F0E68C', 'utility', FALSE, 'duration', 21);

-- 5. 创建技能资源类型表
CREATE TABLE IF NOT EXISTS skill_resource_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    max_value INT DEFAULT 100, -- 资源最大值
    regen_rate DECIMAL(4,2) DEFAULT 1.00, -- 每回合恢复量
    is_percentage BOOLEAN DEFAULT FALSE, -- 是否以百分比消耗
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入资源类型数据 (使用INSERT IGNORE避免重复)
INSERT IGNORE INTO skill_resource_types (type_id, name_zh, name_en, description, color_hex, max_value, regen_rate, display_order) VALUES
('energy', '能量', 'Energy', '通用的技能能量，攻击和移动时恢复', '#00BFFF', 100, 20.00, 1),
('mana', '法力', 'Mana', '施放法术的魔法能量，冥想时恢复', '#4169E1', 100, 10.00, 2),
('stamina', '体力', 'Stamina', '物理技能消耗的体力值，休息时恢复', '#FF6347', 100, 15.00, 3),
('rage', '怒气', 'Rage', '战斗中积累的怒气值，受伤时增加', '#B22222', 100, 0.00, 4),
('life', '生命', 'Life Force', '消耗生命值释放的强力技能', '#DC143C', 100, 0.00, 5),
('special', '特殊', 'Special', '独特的资源类型，有特殊的获取方式', '#8B008B', 100, 5.00, 6);

-- 6. 技能表字段已存在，跳过ALTER TABLE
SELECT 'Skills table already has enhanced classification fields' as message;

-- 7. 创建技能分类关联表
CREATE TABLE IF NOT EXISTS skill_classifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_id INT NOT NULL,
    damage_type_id VARCHAR(20),
    focus_type_id VARCHAR(20),
    area_type_id VARCHAR(20),
    primary_effect_id VARCHAR(20), -- 主要效果
    secondary_effect_id VARCHAR(20), -- 次要效果  
    resource_type_id VARCHAR(20),
    synergy_tags JSON, -- 协同标签
    counter_tags JSON, -- 反制标签
    situational_modifiers JSON, -- 情境修正
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_skill_id (skill_id),
    INDEX idx_damage_type (damage_type_id),
    INDEX idx_focus_type (focus_type_id),
    INDEX idx_area_type (area_type_id)
);

-- 8. 创建技能标签系统
CREATE TABLE IF NOT EXISTS skill_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag_id VARCHAR(30) NOT NULL UNIQUE,
    name_zh VARCHAR(30) NOT NULL,
    name_en VARCHAR(30) NOT NULL,
    description TEXT,
    tag_category ENUM('combat', 'utility', 'movement', 'social', 'crafting') NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入技能标签数据 (使用INSERT IGNORE避免重复)
INSERT IGNORE INTO skill_tags (tag_id, name_zh, name_en, description, tag_category, color_hex) VALUES
-- 战斗标签
('anti_armor', '破甲', 'Anti-Armor', '对重甲目标有额外效果', 'combat', '#CD853F'),
('anti_magic', '反法', 'Anti-Magic', '对法师目标有额外效果', 'combat', '#4169E1'),
('berserker', '狂暴', 'Berserker', '血量越低伤害越高', 'combat', '#B22222'),
('precision', '精准', 'Precision', '高命中率和暴击率', 'combat', '#FFD700'),
('explosive', '爆炸', 'Explosive', '造成范围爆炸伤害', 'combat', '#FF4500'),
('poison', '中毒', 'Poison', '造成毒性持续伤害', 'combat', '#9ACD32'),
('fire', '火焰', 'Fire', '火属性伤害和点燃效果', 'combat', '#FF6347'),
('ice', '冰霜', 'Ice', '冰属性伤害和冰冻效果', 'combat', '#87CEEB'),
('lightning', '雷电', 'Lightning', '雷属性伤害和麻痹效果', 'combat', '#FFD700'),

-- 辅助标签  
('stealth', '潜行', 'Stealth', '隐身和偷袭相关', 'utility', '#2F4F4F'),
('movement', '位移', 'Movement', '改变位置的技能', 'movement', '#32CD32'),
('buff_self', '自强', 'Self Buff', '强化自身属性', 'utility', '#00FF00'),
('buff_ally', '援护', 'Ally Support', '强化队友属性', 'utility', '#90EE90'),
('crowd_control', '控场', 'Crowd Control', '大范围控制技能', 'combat', '#8B008B'),
('resource_drain', '吸取', 'Resource Drain', '吸取敌人资源', 'combat', '#8B0000'),
('summoning', '召唤', 'Summoning', '召唤生物或物体', 'utility', '#9370DB'),
('transformation', '变形', 'Transformation', '改变形态或外观', 'utility', '#FF1493');

-- 9. 创建技能-标签关联表
CREATE TABLE IF NOT EXISTS skill_tag_relations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_id INT NOT NULL,
    tag_id VARCHAR(30) NOT NULL,
    tag_strength ENUM('primary', 'secondary', 'minor') DEFAULT 'primary',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_skill_tag (skill_id, tag_id),
    INDEX idx_skill_id (skill_id),
    INDEX idx_tag_id (tag_id)
);

-- 显示创建结果
SELECT 'Skill Classification System Created Successfully!' as status;

SELECT 
    'Damage Types' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM skill_damage_types WHERE is_active = TRUE

UNION ALL

SELECT 
    'Focus Types' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items  
FROM skill_focus_types WHERE is_active = TRUE

UNION ALL

SELECT 
    'Area Types' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM skill_area_types WHERE is_active = TRUE

UNION ALL

SELECT 
    'Effect Types' as category,
    COUNT(*) as count,
    SUBSTRING(GROUP_CONCAT(name_zh ORDER BY display_order), 1, 100) as items
FROM skill_effect_types WHERE is_active = TRUE

UNION ALL

SELECT 
    'Resource Types' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM skill_resource_types WHERE is_active = TRUE

UNION ALL

SELECT 
    'Skill Tags' as category,
    COUNT(*) as count,
    SUBSTRING(GROUP_CONCAT(name_zh ORDER BY tag_id), 1, 100) as items
FROM skill_tags WHERE is_active = TRUE;