-- ===========================
-- 武将角色定位系统
-- Hero Role Positioning System
-- ===========================

-- 1. 创建武将战斗角色表
CREATE TABLE IF NOT EXISTS hero_combat_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    icon_url VARCHAR(255),
    
    -- 角色特性
    primary_attribute ENUM('attack', 'defense', 'utility', 'balance') NOT NULL,
    position_preference ENUM('front', 'middle', 'back', 'flexible') NOT NULL,
    combat_style ENUM('burst', 'sustained', 'control', 'support') NOT NULL,
    
    -- 属性倾向
    stat_priorities JSON, -- 属性优先级
    recommended_equipment JSON, -- 推荐装备类型
    synergy_roles JSON, -- 协同角色
    counter_roles JSON, -- 克制角色
    
    -- 战术价值
    early_game_value DECIMAL(3,2) DEFAULT 1.00, -- 前期价值
    mid_game_value DECIMAL(3,2) DEFAULT 1.00,   -- 中期价值
    late_game_value DECIMAL(3,2) DEFAULT 1.00,  -- 后期价值
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入武将战斗角色数据
INSERT IGNORE INTO hero_combat_roles (role_id, name_zh, name_en, description, color_hex, primary_attribute, position_preference, combat_style, stat_priorities, recommended_equipment, synergy_roles, counter_roles, early_game_value, mid_game_value, late_game_value, display_order) VALUES

-- 前排角色
('vanguard', '先锋', 'Vanguard', '冲锋在前的勇猛战士，承担开团和突破任务', '#B22222', 'attack', 'front', 'burst',
 JSON_OBJECT('attack', 0.35, 'speed', 0.25, 'hp', 0.25, 'defense', 0.15),
 JSON_ARRAY('dps', 'assassin'),
 JSON_ARRAY('guardian', 'support'),
 JSON_ARRAY('controller', 'sniper'), 1.2, 1.0, 0.8, 1),

('guardian', '守护', 'Guardian', '坚如磐石的防守专家，保护队友免受伤害', '#4682B4', 'defense', 'front', 'sustained',
 JSON_OBJECT('defense', 0.35, 'hp', 0.35, 'attack', 0.15, 'speed', 0.15),
 JSON_ARRAY('tank', 'balanced'),
 JSON_ARRAY('vanguard', 'support'),
 JSON_ARRAY('assassin', 'mage'), 0.8, 1.2, 1.3, 2),

-- 中排角色  
('warrior', '战士', 'Warrior', '攻守兼备的全能战士，战场的中坚力量', '#FF6347', 'balance', 'middle', 'sustained',
 JSON_OBJECT('attack', 0.30, 'defense', 0.25, 'hp', 0.25, 'speed', 0.20),
 JSON_ARRAY('balanced', 'dps'),
 JSON_ARRAY('guardian', 'tactician'),
 JSON_ARRAY('controller', 'assassin'), 1.0, 1.2, 1.1, 3),

('tactician', '军师', 'Tactician', '智谋超群的战术大师，擅长控制战场局势', '#4169E1', 'utility', 'middle', 'control',
 JSON_OBJECT('intelligence', 0.40, 'speed', 0.25, 'energy', 0.20, 'defense', 0.15),
 JSON_ARRAY('support', 'mage'),
 JSON_ARRAY('warrior', 'archer'),
 JSON_ARRAY('vanguard', 'berserker'), 0.9, 1.3, 1.4, 4),

-- 后排角色
('archer', '弓手', 'Archer', '精准的远程射手，提供持续火力支援', '#228B22', 'attack', 'back', 'sustained',
 JSON_OBJECT('attack', 0.35, 'accuracy', 0.25, 'speed', 0.25, 'defense', 0.15),
 JSON_ARRAY('dps', 'assassin'),
 JSON_ARRAY('tactician', 'support'),
 JSON_ARRAY('vanguard', 'guardian'), 1.1, 1.1, 1.0, 5),

('mage', '法师', 'Mage', '掌握神秘力量的法术师，拥有强大的魔法攻击', '#8A2BE2', 'attack', 'back', 'burst',
 JSON_OBJECT('magic_power', 0.40, 'intelligence', 0.30, 'energy', 0.20, 'speed', 0.10),
 JSON_ARRAY('mage', 'support'),
 JSON_ARRAY('tactician', 'healer'),
 JSON_ARRAY('assassin', 'vanguard'), 0.8, 1.2, 1.5, 6),

('support', '辅助', 'Support', '提供治疗和增益的支援专家，保障队伍续航', '#32CD32', 'utility', 'back', 'support',
 JSON_OBJECT('healing', 0.35, 'energy', 0.30, 'defense', 0.20, 'speed', 0.15),
 JSON_ARRAY('support', 'mage'),
 JSON_ARRAY('guardian', 'tactician', 'healer'),
 JSON_ARRAY('assassin', 'sniper'), 1.0, 1.1, 1.2, 7),

-- 特殊角色
('assassin', '刺客', 'Assassin', '来无影去无踪的暗杀者，专门猎杀敌方后排', '#000000', 'attack', 'flexible', 'burst',
 JSON_OBJECT('speed', 0.35, 'crit_rate', 0.30, 'attack', 0.25, 'stealth', 0.10),
 JSON_ARRAY('assassin', 'dps'),
 JSON_ARRAY('archer', 'mage'),
 JSON_ARRAY('guardian', 'vanguard'), 1.3, 1.0, 0.9, 8),

('berserker', '狂战', 'Berserker', '疯狂的战斗狂人，血量越低战斗力越强', '#8B0000', 'attack', 'front', 'burst',
 JSON_OBJECT('attack', 0.40, 'crit_rate', 0.25, 'speed', 0.20, 'hp', 0.15),
 JSON_ARRAY('dps', 'assassin'),
 JSON_ARRAY('support', 'healer'),
 JSON_ARRAY('controller', 'tactician'), 1.4, 0.9, 0.8, 9),

('controller', '控制', 'Controller', '擅长控制和限制敌人的战术专家', '#9370DB', 'utility', 'middle', 'control',
 JSON_OBJECT('control_power', 0.35, 'intelligence', 0.25, 'speed', 0.25, 'energy', 0.15),
 JSON_ARRAY('support', 'mage'),
 JSON_ARRAY('tactician', 'warrior'),
 JSON_ARRAY('berserker', 'vanguard'), 0.9, 1.3, 1.2, 10),

('sniper', '狙击', 'Sniper', '超远程精确打击专家，一击必杀', '#FFD700', 'attack', 'back', 'burst',
 JSON_OBJECT('attack', 0.40, 'accuracy', 0.30, 'crit_damage', 0.20, 'range', 0.10),
 JSON_ARRAY('dps', 'archer'),
 JSON_ARRAY('support', 'controller'),
 JSON_ARRAY('assassin', 'vanguard'), 1.0, 1.1, 1.3, 11),

('healer', '治疗', 'Healer', '专精治疗和恢复的医者，队伍的生命保障', '#90EE90', 'utility', 'back', 'support',
 JSON_OBJECT('healing_power', 0.40, 'energy', 0.30, 'defense', 0.20, 'speed', 0.10),
 JSON_ARRAY('support', 'mage'),
 JSON_ARRAY('guardian', 'warrior', 'berserker'),
 JSON_ARRAY('assassin', 'sniper'), 0.8, 1.1, 1.4, 12);

-- 2. 创建队伍组成推荐表
CREATE TABLE IF NOT EXISTS team_compositions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    composition_id VARCHAR(30) NOT NULL UNIQUE,
    name_zh VARCHAR(30) NOT NULL,
    name_en VARCHAR(30) NOT NULL,
    description TEXT,
    composition_type ENUM('balanced', 'offensive', 'defensive', 'control', 'rush') NOT NULL,
    
    -- 角色配置
    required_roles JSON, -- 必需角色
    optional_roles JSON, -- 可选角色
    forbidden_roles JSON, -- 禁用角色
    
    -- 适用场景
    pvp_effectiveness DECIMAL(3,2) DEFAULT 1.00,
    pve_effectiveness DECIMAL(3,2) DEFAULT 1.00,
    early_game_viability DECIMAL(3,2) DEFAULT 1.00,
    late_game_viability DECIMAL(3,2) DEFAULT 1.00,
    
    -- 战术特色
    strategy_focus ENUM('burst', 'sustained', 'control', 'turtle', 'rush') NOT NULL,
    counter_strategies JSON, -- 克制策略
    weakness_strategies JSON, -- 被克制策略
    
    difficulty_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    popularity_score DECIMAL(3,2) DEFAULT 1.00,
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入队伍组成推荐数据
INSERT IGNORE INTO team_compositions (composition_id, name_zh, name_en, description, composition_type, required_roles, optional_roles, strategy_focus, pvp_effectiveness, pve_effectiveness, counter_strategies, difficulty_level, display_order) VALUES

('classic_balanced', '经典平衡', 'Classic Balanced', '攻守兼备的标准配置，适合各种场合', 'balanced',
 JSON_ARRAY('guardian', 'warrior', 'archer', 'tactician', 'support'),
 JSON_ARRAY('mage', 'controller'),
 'sustained', 1.0, 1.2, 
 JSON_ARRAY('rush', 'control'), 'beginner', 1),

('rush_assault', '突击冲锋', 'Rush Assault', '快速突击战术，追求速战速决', 'offensive',
 JSON_ARRAY('vanguard', 'berserker', 'assassin'),
 JSON_ARRAY('warrior', 'archer'),
 'rush', 1.3, 0.8,
 JSON_ARRAY('turtle', 'control'), 'intermediate', 2),

('fortress_defense', '堡垒防御', 'Fortress Defense', '极致防御战术，消耗敌人进攻', 'defensive',
 JSON_ARRAY('guardian', 'healer', 'support'),
 JSON_ARRAY('controller', 'tactician'),
 'turtle', 0.9, 1.4,
 JSON_ARRAY('rush', 'burst'), 'intermediate', 3),

('control_master', '控制大师', 'Control Master', '以控制为核心的战术体系', 'control',
 JSON_ARRAY('controller', 'tactician', 'mage'),
 JSON_ARRAY('support', 'archer'),
 'control', 1.2, 1.1,
 JSON_ARRAY('rush', 'assassin_dive'), 'advanced', 4),

('burst_combo', '爆发连击', 'Burst Combo', '瞬间爆发的高伤害组合', 'offensive',
 JSON_ARRAY('mage', 'sniper', 'assassin'),
 JSON_ARRAY('berserker', 'support'),
 'burst', 1.4, 0.9,
 JSON_ARRAY('turtle', 'sustain'), 'expert', 5),

('sustain_endurance', '持久战', 'Sustain Endurance', '依靠持续作战能力获胜', 'balanced',
 JSON_ARRAY('warrior', 'archer', 'healer', 'support'),
 JSON_ARRAY('guardian', 'tactician'),
 'sustained', 0.8, 1.3,
 JSON_ARRAY('burst', 'rush'), 'intermediate', 6);

-- 3. 扩展现有武将表，添加角色定位字段
-- 检查heroes表是否存在
SET @heroes_table_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'heroes');

-- Heroes table role columns already exist, skipping ALTER TABLE
SELECT 'Heroes table already has role positioning fields' as message;

-- 4. 创建武将推荐组合表
CREATE TABLE IF NOT EXISTS hero_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recommendation_type ENUM('synergy', 'counter', 'composition', 'equipment') NOT NULL,
    hero_id INT NOT NULL,
    target_hero_id INT, -- 目标武将ID（用于协同/克制关系）
    target_composition_id VARCHAR(30), -- 目标阵容ID
    
    -- 推荐信息
    recommendation_strength DECIMAL(3,2) DEFAULT 1.00, -- 推荐强度
    situational_modifier JSON, -- 情境修正
    explanation TEXT, -- 推荐理由
    
    -- 条件限制
    level_requirement INT DEFAULT 1,
    unlock_conditions JSON,
    
    priority_score DECIMAL(3,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_hero_id (hero_id),
    INDEX idx_recommendation_type (recommendation_type),
    INDEX idx_target_hero (target_hero_id)
);

-- 5. 创建角色发展路线表
CREATE TABLE IF NOT EXISTS hero_development_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    path_id VARCHAR(30) NOT NULL UNIQUE,
    name_zh VARCHAR(30) NOT NULL,
    name_en VARCHAR(30) NOT NULL,
    description TEXT,
    
    -- 发展重点
    development_focus ENUM('early_power', 'scaling', 'utility', 'specialization') NOT NULL,
    stat_priorities JSON, -- 属性优先级
    skill_priorities JSON, -- 技能优先级
    equipment_priorities JSON, -- 装备优先级
    
    -- 里程碑
    level_milestones JSON, -- 等级里程碑
    progression_rewards JSON, -- 发展奖励
    
    -- 适用角色
    suitable_roles JSON,
    suitable_factions JSON,
    
    difficulty_rating ENUM('easy', 'medium', 'hard', 'expert') DEFAULT 'medium',
    meta_tier ENUM('S', 'A', 'B', 'C', 'D') DEFAULT 'B',
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入角色发展路线数据
INSERT IGNORE INTO hero_development_paths (path_id, name_zh, name_en, description, development_focus, stat_priorities, skill_priorities, equipment_priorities, suitable_roles, difficulty_rating, meta_tier, display_order) VALUES

('early_domination', '前期统治', 'Early Domination', '专注前期压制力，快速建立优势', 'early_power',
 JSON_OBJECT('attack', 0.40, 'speed', 0.30, 'hp', 0.20, 'defense', 0.10),
 JSON_OBJECT('burst_skills', 0.60, 'mobility', 0.40),
 JSON_OBJECT('attack_items', 0.70, 'speed_items', 0.30),
 JSON_ARRAY('vanguard', 'berserker', 'assassin'), 'easy', 'A', 1),

('late_game_carry', '后期核心', 'Late Game Carry', '注重后期发力，成为队伍核心输出', 'scaling',
 JSON_OBJECT('attack', 0.35, 'crit_rate', 0.25, 'crit_damage', 0.25, 'speed', 0.15),
 JSON_OBJECT('ultimate_skills', 0.50, 'passive_growth', 0.50),
 JSON_OBJECT('scaling_items', 0.60, 'crit_items', 0.40),
 JSON_ARRAY('archer', 'mage', 'sniper'), 'hard', 'S', 2),

('support_specialist', '辅助专精', 'Support Specialist', '专精辅助技能，成为团队粘合剂', 'utility',
 JSON_OBJECT('energy', 0.35, 'speed', 0.25, 'defense', 0.25, 'healing', 0.15),
 JSON_OBJECT('support_skills', 0.70, 'utility_skills', 0.30),
 JSON_OBJECT('support_items', 0.60, 'utility_items', 0.40),
 JSON_ARRAY('support', 'healer', 'tactician'), 'medium', 'A', 3),

('tank_fortress', '肉盾要塞', 'Tank Fortress', '极致防御发展，成为不可撼动的堡垒', 'specialization',
 JSON_OBJECT('defense', 0.40, 'hp', 0.35, 'resistance', 0.15, 'speed', 0.10),
 JSON_OBJECT('defensive_skills', 0.60, 'taunt_skills', 0.40),
 JSON_OBJECT('tank_items', 0.70, 'resistance_items', 0.30),
 JSON_ARRAY('guardian', 'warrior'), 'medium', 'B', 4),

('control_master', '控制大师', 'Control Master', '专精控制技能，掌握战场节奏', 'specialization',
 JSON_OBJECT('intelligence', 0.35, 'speed', 0.30, 'energy', 0.25, 'control_power', 0.10),
 JSON_OBJECT('control_skills', 0.80, 'utility_skills', 0.20),
 JSON_OBJECT('control_items', 0.60, 'intelligence_items', 0.40),
 JSON_ARRAY('controller', 'tactician', 'mage'), 'expert', 'S', 5);

-- 显示创建结果
SELECT 'Hero Role Positioning System Created Successfully!' as status;

-- 统计角色定位数据
SELECT 
    'Combat Roles' as category,
    COUNT(*) as count,
    SUBSTRING(GROUP_CONCAT(name_zh ORDER BY display_order), 1, 100) as items
FROM hero_combat_roles WHERE is_active = TRUE

UNION ALL

SELECT 
    'Team Compositions' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM team_compositions WHERE is_active = TRUE

UNION ALL

SELECT 
    'Development Paths' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM hero_development_paths WHERE is_active = TRUE;