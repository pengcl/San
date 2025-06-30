-- ===========================
-- 装备分类增强系统
-- Enhanced Equipment Classification System
-- ===========================

-- 1. 创建装备战斗角色分类表
CREATE TABLE IF NOT EXISTS equipment_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    icon_url VARCHAR(255),
    primary_focus ENUM('attack', 'defense', 'utility', 'balanced') NOT NULL,
    stat_emphasis JSON, -- 主要属性侧重
    recommended_for JSON, -- 推荐兵种
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入装备角色数据
INSERT IGNORE INTO equipment_roles (role_id, name_zh, name_en, description, color_hex, primary_focus, stat_emphasis, recommended_for, display_order) VALUES
('tank', '坦克', 'Tank', '专注防御和生存能力的装备，适合前排肉盾', '#4682B4', 'defense',
 JSON_OBJECT('hp', 0.40, 'defense', 0.35, 'attack', 0.15, 'speed', 0.10),
 JSON_ARRAY('infantry', 'spear'), 1),

('dps', '输出', 'DPS', '专注攻击输出的装备，适合主力输出角色', '#B22222', 'attack',
 JSON_OBJECT('attack', 0.45, 'crit_rate', 0.25, 'speed', 0.20, 'defense', 0.10),
 JSON_ARRAY('cavalry', 'archer'), 2),

('assassin', '刺客', 'Assassin', '专注爆发和机动性的装备，适合敏捷型角色', '#8B008B', 'attack',
 JSON_OBJECT('speed', 0.35, 'crit_rate', 0.30, 'attack', 0.25, 'penetration', 0.10),
 JSON_ARRAY('cavalry', 'archer'), 3),

('support', '辅助', 'Support', '专注辅助和治疗能力的装备，适合后排支援', '#32CD32', 'utility',
 JSON_OBJECT('energy', 0.30, 'hp', 0.25, 'skill_power', 0.25, 'defense', 0.20),
 JSON_ARRAY('archer', 'spear'), 4),

('mage', '法师', 'Mage', '专注法术攻击的装备，适合智力型角色', '#4169E1', 'attack',
 JSON_OBJECT('magic_power', 0.40, 'energy', 0.30, 'penetration', 0.20, 'speed', 0.10),
 JSON_ARRAY('archer', 'siege'), 5),

('balanced', '平衡', 'Balanced', '各属性均衡发展的通用装备', '#FFD700', 'balanced',
 JSON_OBJECT('attack', 0.25, 'defense', 0.25, 'hp', 0.25, 'speed', 0.25),
 JSON_ARRAY('infantry', 'cavalry', 'archer', 'spear'), 6);

-- 2. 创建装备专精系统表
CREATE TABLE IF NOT EXISTS equipment_specializations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spec_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    specialization_type ENUM('anti_physical', 'anti_magical', 'anti_ranged', 'anti_melee', 'balanced') NOT NULL,
    resistance_bonuses JSON, -- 抗性加成
    weakness_penalties JSON, -- 弱点惩罚
    situational_bonuses JSON, -- 情境加成
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入装备专精数据
INSERT IGNORE INTO equipment_specializations (spec_id, name_zh, name_en, description, color_hex, specialization_type, resistance_bonuses, weakness_penalties, situational_bonuses, display_order) VALUES
('anti_physical', '抗物理', 'Anti-Physical', '专门对抗物理攻击的装备，高物理防御', '#CD853F', 'anti_physical',
 JSON_OBJECT('physical_resistance', 0.30, 'armor_rating', 0.25),
 JSON_OBJECT('magic_vulnerability', 0.15),
 JSON_OBJECT('vs_melee', 0.20, 'vs_cavalry', 0.15), 1),

('anti_magical', '抗法术', 'Anti-Magical', '专门对抗法术攻击的装备，高魔法抗性', '#4169E1', 'anti_magical',
 JSON_OBJECT('magic_resistance', 0.30, 'spell_protection', 0.25),
 JSON_OBJECT('physical_vulnerability', 0.15),
 JSON_OBJECT('vs_magic', 0.20, 'vs_siege', 0.15), 2),

('anti_ranged', '抗远程', 'Anti-Ranged', '专门对抗远程攻击的装备，高远程防护', '#228B22', 'anti_ranged',
 JSON_OBJECT('ranged_resistance', 0.25, 'projectile_defense', 0.20),
 JSON_OBJECT('melee_vulnerability', 0.10),
 JSON_OBJECT('vs_archer', 0.25, 'vs_siege', 0.20), 3),

('anti_melee', '抗近战', 'Anti-Melee', '专门对抗近战攻击的装备，高近战防护', '#FF6347', 'anti_melee',
 JSON_OBJECT('melee_resistance', 0.25, 'contact_defense', 0.20),
 JSON_OBJECT('ranged_vulnerability', 0.10),
 JSON_OBJECT('vs_infantry', 0.20, 'vs_cavalry', 0.25), 4),

('balanced_defense', '平衡防御', 'Balanced Defense', '各种抗性均衡的通用防御装备', '#8B008B', 'balanced',
 JSON_OBJECT('all_resistance', 0.15),
 JSON_OBJECT('none', 0),
 JSON_OBJECT('versatile', 0.10), 5);

-- 3. 创建装备强化路线表
CREATE TABLE IF NOT EXISTS equipment_enhancement_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    path_id VARCHAR(30) NOT NULL UNIQUE,
    name_zh VARCHAR(30) NOT NULL,
    name_en VARCHAR(30) NOT NULL,
    description TEXT,
    enhancement_type ENUM('attack_focus', 'defense_focus', 'speed_focus', 'utility_focus', 'balanced') NOT NULL,
    enhancement_stages JSON, -- 强化阶段和效果
    material_requirements JSON, -- 材料需求
    cost_progression JSON, -- 费用递增
    max_enhancement_level INT DEFAULT 15,
    special_effects JSON, -- 特殊效果
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入强化路线数据
INSERT IGNORE INTO equipment_enhancement_paths (path_id, name_zh, name_en, description, enhancement_type, enhancement_stages, material_requirements, cost_progression, special_effects, display_order) VALUES
('berserker_path', '狂战之路', 'Berserker Path', '极致攻击强化路线，牺牲防御换取超高攻击力', 'attack_focus',
 JSON_OBJECT(
    'stage_5', JSON_OBJECT('attack', 0.25, 'crit_rate', 0.15, 'defense', -0.10),
    'stage_10', JSON_OBJECT('attack', 0.50, 'crit_rate', 0.30, 'defense', -0.20, 'berserker_rage', true),
    'stage_15', JSON_OBJECT('attack', 0.80, 'crit_rate', 0.50, 'defense', -0.30, 'bloodlust', true)
 ),
 JSON_OBJECT('primary', 'attack_crystal', 'secondary', 'berserker_essence'),
 JSON_OBJECT('base_cost', 1000, 'multiplier', 1.5),
 JSON_OBJECT('berserker_rage', '血量越低攻击力越高', 'bloodlust', '击杀敌人恢复生命值'), 1),

('fortress_path', '堡垒之路', 'Fortress Path', '极致防御强化路线，成为不可摧毁的堡垒', 'defense_focus',
 JSON_OBJECT(
    'stage_5', JSON_OBJECT('defense', 0.30, 'hp', 0.20, 'attack', -0.05),
    'stage_10', JSON_OBJECT('defense', 0.60, 'hp', 0.40, 'attack', -0.10, 'damage_reflect', 0.15),
    'stage_15', JSON_OBJECT('defense', 1.0, 'hp', 0.70, 'attack', -0.15, 'fortress_aura', true)
 ),
 JSON_OBJECT('primary', 'defense_crystal', 'secondary', 'fortress_stone'),
 JSON_OBJECT('base_cost', 1000, 'multiplier', 1.4),
 JSON_OBJECT('damage_reflect', '反弹部分伤害给攻击者', 'fortress_aura', '周围友军获得防御加成'), 2),

('swift_path', '疾风之路', 'Swift Path', '极致速度强化路线，快如闪电的行动力', 'speed_focus',
 JSON_OBJECT(
    'stage_5', JSON_OBJECT('speed', 0.35, 'dodge', 0.20, 'hp', -0.10),
    'stage_10', JSON_OBJECT('speed', 0.70, 'dodge', 0.40, 'hp', -0.20, 'lightning_strike', true),
    'stage_15', JSON_OBJECT('speed', 1.2, 'dodge', 0.65, 'hp', -0.25, 'time_dilation', true)
 ),
 JSON_OBJECT('primary', 'speed_crystal', 'secondary', 'wind_essence'),
 JSON_OBJECT('base_cost', 1000, 'multiplier', 1.3),
 JSON_OBJECT('lightning_strike', '攻击时有概率连击', 'time_dilation', '回合开始时有概率获得额外行动'), 3),

('mystic_path', '奥术之路', 'Mystic Path', '法术强化路线，提升技能威力和法力效率', 'utility_focus',
 JSON_OBJECT(
    'stage_5', JSON_OBJECT('magic_power', 0.30, 'mana', 0.25, 'mana_regen', 0.20),
    'stage_10', JSON_OBJECT('magic_power', 0.60, 'mana', 0.50, 'mana_regen', 0.40, 'spell_echo', true),
    'stage_15', JSON_OBJECT('magic_power', 1.0, 'mana', 0.80, 'mana_regen', 0.70, 'arcane_mastery', true)
 ),
 JSON_OBJECT('primary', 'mystic_crystal', 'secondary', 'arcane_essence'),
 JSON_OBJECT('base_cost', 1200, 'multiplier', 1.6),
 JSON_OBJECT('spell_echo', '技能有概率不消耗冷却时间', 'arcane_mastery', '所有技能效果提升50%'), 4),

('harmony_path', '和谐之路', 'Harmony Path', '平衡强化路线，各属性均衡发展', 'balanced',
 JSON_OBJECT(
    'stage_5', JSON_OBJECT('all_stats', 0.15),
    'stage_10', JSON_OBJECT('all_stats', 0.30, 'synergy_bonus', 0.10),
    'stage_15', JSON_OBJECT('all_stats', 0.50, 'synergy_bonus', 0.20, 'perfect_balance', true)
 ),
 JSON_OBJECT('primary', 'harmony_crystal', 'secondary', 'balance_stone'),
 JSON_OBJECT('base_cost', 1000, 'multiplier', 1.2),
 JSON_OBJECT('synergy_bonus', '装备间产生协同效应', 'perfect_balance', '免疫属性削弱效果'), 5);

-- 4. 扩展现有装备表，添加新的分类字段
-- 检查equipments表是否存在
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'equipments');

SET @sql = IF(@table_exists > 0, 
'ALTER TABLE equipments 
ADD COLUMN role_id VARCHAR(20) DEFAULT ''balanced'',
ADD COLUMN specialization_id VARCHAR(20) DEFAULT ''balanced_defense'',
ADD COLUMN enhancement_path_id VARCHAR(30) DEFAULT ''harmony_path'',
ADD COLUMN combat_effectiveness INT DEFAULT 0,
ADD COLUMN situational_bonuses JSON,
ADD COLUMN synergy_tags JSON,
ADD COLUMN meta_classification ENUM(''early_game'', ''mid_game'', ''late_game'', ''endgame'') DEFAULT ''mid_game'',
ADD COLUMN pvp_effectiveness DECIMAL(3,2) DEFAULT 1.00,
ADD COLUMN pve_effectiveness DECIMAL(3,2) DEFAULT 1.00;',
'SELECT ''Equipments table does not exist, skipping ALTER TABLE'' as message;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. 创建装备-技能协同表
CREATE TABLE IF NOT EXISTS equipment_skill_synergy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT,
    skill_damage_type VARCHAR(20), -- 对应技能伤害类型
    skill_focus_type VARCHAR(20), -- 对应技能焦点类型
    synergy_bonus DECIMAL(3,2) DEFAULT 0.00, -- 协同加成
    synergy_description TEXT,
    trigger_condition VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_damage_type (skill_damage_type),
    INDEX idx_focus_type (skill_focus_type)
);

-- 6. 创建装备套装协同效果表
CREATE TABLE IF NOT EXISTS equipment_set_synergy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    set_id VARCHAR(50) NOT NULL,
    synergy_type ENUM('intra_set', 'inter_set', 'artifact_combo') NOT NULL, -- 套装内/套装间/法宝组合
    trigger_condition VARCHAR(100),
    bonus_effects JSON,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_set_id (set_id)
);

-- 插入装备套装协同数据示例
INSERT IGNORE INTO equipment_set_synergy (set_id, synergy_type, trigger_condition, bonus_effects, description) VALUES
('dragon_scale_set', 'intra_set', '2_pieces', 
 JSON_OBJECT('fire_resistance', 0.25, 'dragon_power', 0.15),
 '龙鳞套装2件：火焰抗性25%，龙之力量15%'),

('phoenix_feather_set', 'intra_set', '3_pieces',
 JSON_OBJECT('auto_revive', 0.20, 'fire_damage', 0.30),
 '凤羽套装3件：20%概率复活，火焰伤害30%'),

('cross_set_synergy', 'inter_set', 'dragon_phoenix_combo',
 JSON_OBJECT('legendary_aura', true, 'elemental_mastery', 0.40),
 '龙凤呼应：龙鳞+凤羽套装组合，获得传说光环');

-- 显示创建结果
SELECT 'Enhanced Equipment Classification System Created!' as status;

-- 统计装备分类数据
SELECT 
    'Equipment Roles' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM equipment_roles WHERE is_active = TRUE

UNION ALL

SELECT 
    'Equipment Specializations' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM equipment_specializations WHERE is_active = TRUE

UNION ALL

SELECT 
    'Enhancement Paths' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM equipment_enhancement_paths WHERE is_active = TRUE;