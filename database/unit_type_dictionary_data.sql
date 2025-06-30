-- ===========================
-- 兵种字典系统数据
-- Three Kingdoms Unit Type Dictionary System
-- ===========================

-- 创建兵种配置表（如果不存在）
CREATE TABLE IF NOT EXISTS unit_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) UNIQUE,
    type_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    color_hex VARCHAR(7) NOT NULL,
    base_stats_modifier JSON,
    combat_advantages JSON,
    combat_disadvantages JSON,
    special_abilities JSON,
    movement_type ENUM('land', 'water', 'flying', 'mixed') DEFAULT 'land',
    range_type ENUM('melee', 'ranged', 'mixed') DEFAULT 'melee',
    formation_bonus JSON,
    terrain_modifier JSON,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_id INT,
    updated_by_id INT,
    locale VARCHAR(255) DEFAULT 'en'
);

-- 清空现有数据
DELETE FROM unit_types;

-- 插入兵种配置数据
INSERT INTO unit_types (
    document_id,
    type_id, 
    name_zh, 
    name_en, 
    description,
    icon_url,
    color_hex,
    base_stats_modifier,
    combat_advantages,
    combat_disadvantages,
    special_abilities,
    movement_type,
    range_type,
    formation_bonus,
    terrain_modifier,
    display_order,
    is_active
) VALUES 
-- 步兵 - 防御坚固，阵型严密
('u1001000-0000-0000-0000-000000000001', 'infantry', '步兵', 'Infantry',
 '重装步兵是战场的中坚力量，装备精良的盔甲和武器，擅长防御和正面作战，是军队的基石。',
 '/images/unit_types/infantry_icon.png', '#8B4513',
 JSON_OBJECT(
    'attack', 1.0,
    'defense', 1.2,
    'hp', 1.1,
    'speed', 0.8
 ),
 JSON_OBJECT(
    'archer', 0.25,
    'siege', 0.15
 ),
 JSON_OBJECT(
    'cavalry', -0.20
 ),
 JSON_OBJECT(
    'shield_wall', '盾墙防御，减少远程伤害20%',
    'formation_discipline', '阵型纪律，相邻友军+10%防御',
    'siege_resistance', '攻城抗性，城墙战斗+15%防御'
 ),
 'land', 'melee',
 JSON_OBJECT(
    'phalanx', JSON_OBJECT('defense', 0.30, 'attack', -0.10),
    'line', JSON_OBJECT('attack', 0.10, 'defense', 0.10),
    'square', JSON_OBJECT('defense', 0.25, 'hp', 0.15)
 ),
 JSON_OBJECT(
    'plains', 1.0, 'hills', 1.1, 'forest', 0.9, 'swamp', 0.8,
    'desert', 0.9, 'mountain', 1.2, 'city', 1.3, 'river', 0.7
 ),
 1, true),

-- 骑兵 - 速度迅猛，冲锋致命
('u2001000-0000-0000-0000-000000000002', 'cavalry', '骑兵', 'Cavalry',
 '重装骑兵是战场上的闪电，凭借强大的机动性和冲击力，能够迅速突破敌军防线，是决定性的战术兵种。',
 '/images/unit_types/cavalry_icon.png', '#FF6347',
 JSON_OBJECT(
    'attack', 1.2,
    'defense', 0.8,
    'hp', 0.9,
    'speed', 1.3
 ),
 JSON_OBJECT(
    'infantry', 0.20,
    'archer', 0.30,
    'siege', 0.25
 ),
 JSON_OBJECT(
    'spear', -0.25
 ),
 JSON_OBJECT(
    'charge', '冲锋，首轮攻击+50%伤害',
    'mobility', '机动性，每回合可移动两次',
    'flanking', '侧翼攻击，从侧面攻击+20%伤害'
 ),
 'land', 'melee',
 JSON_OBJECT(
    'wedge', JSON_OBJECT('attack', 0.25, 'speed', 0.15),
    'line', JSON_OBJECT('attack', 0.15, 'defense', 0.05),
    'loose', JSON_OBJECT('speed', 0.20, 'defense', -0.10)
 ),
 JSON_OBJECT(
    'plains', 1.3, 'hills', 0.9, 'forest', 0.6, 'swamp', 0.5,
    'desert', 1.1, 'mountain', 0.4, 'city', 0.7, 'river', 0.6
 ),
 2, true),

-- 弓兵 - 远程精准，战术灵活
('u3001000-0000-0000-0000-000000000003', 'archer', '弓兵', 'Archer',
 '精锐弓箭手具备出色的射术和战术意识，能够在远距离有效杀伤敌人，是重要的火力支援兵种。',
 '/images/unit_types/archer_icon.png', '#32CD32',
 JSON_OBJECT(
    'attack', 1.1,
    'defense', 0.7,
    'hp', 0.8,
    'speed', 1.0
 ),
 JSON_OBJECT(
    'cavalry', 0.15,
    'siege', 0.20
 ),
 JSON_OBJECT(
    'infantry', -0.25
 ),
 JSON_OBJECT(
    'ranged_attack', '远程攻击，可攻击2格外敌人',
    'volley', '齐射，攻击范围内所有敌人',
    'high_ground', '高地优势，高地作战+25%攻击'
 ),
 'land', 'ranged',
 JSON_OBJECT(
    'line', JSON_OBJECT('attack', 0.20, 'range', 1),
    'scattered', JSON_OBJECT('defense', 0.15, 'attack', -0.05),
    'concentrated', JSON_OBJECT('attack', 0.30, 'defense', -0.15)
 ),
 JSON_OBJECT(
    'plains', 1.1, 'hills', 1.3, 'forest', 1.2, 'swamp', 0.8,
    'desert', 1.0, 'mountain', 1.4, 'city', 1.2, 'river', 0.9
 ),
 3, true),

-- 长枪兵 - 反骑克星，防御专家
('u4001000-0000-0000-0000-000000000004', 'spear', '长枪兵', 'Spearman',
 '长枪兵装备长矛和重甲，专门训练对抗骑兵冲锋，是步兵中的精英防御力量。',
 '/images/unit_types/spear_icon.png', '#4682B4',
 JSON_OBJECT(
    'attack', 0.9,
    'defense', 1.3,
    'hp', 1.0,
    'speed', 0.9
 ),
 JSON_OBJECT(
    'cavalry', 0.30,
    'beast', 0.25
 ),
 JSON_OBJECT(
    'archer', -0.15
 ),
 JSON_OBJECT(
    'anti_cavalry', '反骑兵，骑兵冲锋无效',
    'phalanx_formation', '方阵，相邻长枪兵+15%防御',
    'reach_attack', '长兵器，可攻击2格内敌人'
 ),
 'land', 'melee',
 JSON_OBJECT(
    'phalanx', JSON_OBJECT('defense', 0.40, 'attack', 0.10),
    'line', JSON_OBJECT('defense', 0.20, 'attack', 0.05),
    'square', JSON_OBJECT('defense', 0.35, 'attack', -0.05)
 ),
 JSON_OBJECT(
    'plains', 1.2, 'hills', 1.0, 'forest', 0.7, 'swamp', 0.8,
    'desert', 1.0, 'mountain', 0.9, 'city', 1.1, 'river', 0.8
 ),
 4, true),

-- 攻城器械 - 破城利器，大杀伤力
('u5001000-0000-0000-0000-000000000005', 'siege', '攻城器械', 'Siege Engine',
 '包括投石机、床弩、冲车等大型攻城武器，专门用于摧毁敌方防御工事和大范围杀伤。',
 '/images/unit_types/siege_icon.png', '#696969',
 JSON_OBJECT(
    'attack', 1.5,
    'defense', 0.6,
    'hp', 1.8,
    'speed', 0.3
 ),
 JSON_OBJECT(
    'building', 0.50,
    'infantry', 0.20
 ),
 JSON_OBJECT(
    'cavalry', -0.30,
    'archer', -0.25
 ),
 JSON_OBJECT(
    'siege_attack', '攻城，对城墙和建筑额外伤害',
    'area_damage', '范围伤害，攻击范围内所有单位',
    'slow_movement', '缓慢移动，但攻击力强大'
 ),
 'land', 'ranged',
 JSON_OBJECT(
    'protected', JSON_OBJECT('defense', 0.30, 'attack', 0.05),
    'spread', JSON_OBJECT('defense', 0.10, 'attack', 0.15)
 ),
 JSON_OBJECT(
    'plains', 1.0, 'hills', 0.8, 'forest', 0.5, 'swamp', 0.3,
    'desert', 0.9, 'mountain', 0.6, 'city', 1.5, 'river', 0.4
 ),
 5, true),

-- 水师 - 水战之王，运输专家
('u6001000-0000-0000-0000-000000000006', 'naval', '水师', 'Naval',
 '专业的水上作战部队，装备战船和水战武器，掌控江河湖海，是水域作战的绝对主力。',
 '/images/unit_types/naval_icon.png', '#1E90FF',
 JSON_OBJECT(
    'attack', 1.1,
    'defense', 1.0,
    'hp', 1.2,
    'speed', 1.1
 ),
 JSON_OBJECT(
    'land_unit', 0.20
 ),
 JSON_OBJECT(
    'archer', -0.10
 ),
 JSON_OBJECT(
    'water_combat', '水战，在河流湖泊战斗力翻倍',
    'transport', '运输，可搭载其他单位渡河',
    'naval_bombardment', '舰炮，对岸上目标远程攻击'
 ),
 'water', 'mixed',
 JSON_OBJECT(
    'line_ahead', JSON_OBJECT('attack', 0.20, 'speed', 0.10),
    'line_abreast', JSON_OBJECT('defense', 0.15, 'attack', 0.10),
    'column', JSON_OBJECT('speed', 0.15, 'defense', 0.05)
 ),
 JSON_OBJECT(
    'plains', 0.5, 'hills', 0.3, 'forest', 0.2, 'swamp', 1.3,
    'desert', 0.1, 'mountain', 0.1, 'city', 0.8, 'river', 2.0,
    'lake', 2.0, 'sea', 2.5
 ),
 6, true);

-- 创建兵种克制关系表
CREATE TABLE IF NOT EXISTS unit_type_counters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attacker_type VARCHAR(20) NOT NULL,
    defender_type VARCHAR(20) NOT NULL,
    effectiveness DECIMAL(4,2) NOT NULL, -- 战斗效果倍率
    counter_type ENUM('advantage', 'disadvantage', 'neutral') NOT NULL,
    description TEXT,
    historical_context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_counter (attacker_type, defender_type),
    INDEX idx_attacker (attacker_type),
    INDEX idx_defender (defender_type)
);

-- 插入兵种克制关系数据
INSERT INTO unit_type_counters (attacker_type, defender_type, effectiveness, counter_type, description, historical_context) VALUES
-- 步兵的克制关系
('infantry', 'archer', 1.25, 'advantage', '步兵近战优势，能够有效压制弓兵', '历史上步兵冲锋往往能突破弓兵防线'),
('infantry', 'siege', 1.15, 'advantage', '步兵灵活性强，能够接近并摧毁攻城器械', '步兵可以快速接近并破坏笨重的攻城设备'),
('infantry', 'cavalry', 0.80, 'disadvantage', '步兵难以应对骑兵的机动冲击', '骑兵的冲击力往往能突破步兵阵线'),

-- 骑兵的克制关系
('cavalry', 'infantry', 1.20, 'advantage', '骑兵冲锋能够有效突破步兵防线', '骑兵的机动性和冲击力是步兵的天敌'),
('cavalry', 'archer', 1.30, 'advantage', '骑兵能够快速接近并消灭弓兵', '弓兵在骑兵冲锋面前往往来不及反应'),
('cavalry', 'siege', 1.25, 'advantage', '骑兵能够快速机动攻击笨重的攻城器械', '攻城器械移动缓慢，是骑兵的理想目标'),
('cavalry', 'spear', 0.75, 'disadvantage', '长枪兵是骑兵的专门克星', '长枪阵是历史上对抗骑兵冲锋的有效手段'),

-- 弓兵的克制关系
('archer', 'cavalry', 1.15, 'advantage', '弓兵远程攻击能够在距离上克制骑兵', '弓兵可以在骑兵接近前造成伤害'),
('archer', 'siege', 1.20, 'advantage', '弓兵能够远程攻击缓慢的攻城器械', '攻城器械目标大且移动慢，是弓兵的好目标'),
('archer', 'infantry', 0.75, 'disadvantage', '弓兵近战能力弱，难以对抗步兵', '一旦被步兵接近，弓兵就失去了优势'),

-- 长枪兵的克制关系
('spear', 'cavalry', 1.30, 'advantage', '长枪兵是骑兵冲锋的专门克星', '长枪阵能够有效阻止骑兵冲锋'),
('spear', 'beast', 1.25, 'advantage', '长枪能够有效对付大型野兽和战象', '长兵器对大型目标有天然优势'),
('spear', 'archer', 0.85, 'disadvantage', '长枪兵难以应对远程攻击', '长枪兵主要是防御兵种，对远程单位缺乏有效手段'),

-- 攻城器械的克制关系
('siege', 'building', 1.50, 'advantage', '攻城器械专门用于摧毁建筑和防御工事', '攻城器械就是为了破城而设计的'),
('siege', 'infantry', 1.20, 'advantage', '攻城器械的范围伤害对密集步兵有效', '投石机等能够对密集阵型造成大量伤亡'),
('siege', 'cavalry', 0.70, 'disadvantage', '攻城器械移动缓慢，易受骑兵突袭', '攻城器械无法应对快速机动的骑兵'),
('siege', 'archer', 0.75, 'disadvantage', '攻城器械易受远程攻击', '弓兵可以在安全距离攻击攻城器械'),

-- 水师的克制关系
('naval', 'land_unit', 1.20, 'advantage', '水师在水域作战时对陆上单位有优势', '掌控水域的一方能够限制敌军行动'),
('naval', 'archer', 0.90, 'disadvantage', '木制战船容易被火箭攻击', '历史上火攻是对抗水师的有效手段');

-- 创建地形效果表
CREATE TABLE IF NOT EXISTS terrain_effects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    terrain_name VARCHAR(20) NOT NULL,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    description TEXT,
    movement_cost DECIMAL(3,1) DEFAULT 1.0,
    defense_bonus DECIMAL(3,2) DEFAULT 0.00,
    visibility_modifier DECIMAL(3,2) DEFAULT 1.00,
    special_effects JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入地形效果数据
INSERT INTO terrain_effects (terrain_name, name_zh, name_en, description, movement_cost, defense_bonus, visibility_modifier, special_effects) VALUES
('plains', '平原', 'Plains', '开阔的平原地带，适合大规模军团作战', 1.0, 0.00, 1.00, JSON_OBJECT('cavalry_bonus', 0.2, 'formation_bonus', 0.1)),
('hills', '丘陵', 'Hills', '起伏的丘陵地形，提供一定的防御优势', 1.5, 0.15, 1.2, JSON_OBJECT('archer_bonus', 0.3, 'high_ground', true)),
('forest', '森林', 'Forest', '茂密的森林，限制视野但提供掩护', 2.0, 0.10, 0.5, JSON_OBJECT('ambush_bonus', 0.25, 'archer_advantage', true)),
('swamp', '沼泽', 'Swamp', '泥泞的沼泽地带，严重限制移动', 3.0, 0.05, 0.8, JSON_OBJECT('movement_penalty', 0.5, 'disease_risk', true)),
('desert', '沙漠', 'Desert', '干燥的沙漠地区，消耗体力', 1.5, 0.00, 1.5, JSON_OBJECT('stamina_drain', 0.2, 'water_required', true)),
('mountain', '山地', 'Mountain', '险峻的山地，极难通行但防御力极强', 4.0, 0.30, 1.5, JSON_OBJECT('pass_control', true, 'siege_difficult', true)),
('city', '城市', 'City', '有城墙保护的城市，提供最强防御', 1.0, 0.50, 1.0, JSON_OBJECT('wall_defense', 0.5, 'siege_required', true)),
('river', '河流', 'River', '流动的河水，需要渡河设备', 2.0, 0.00, 1.0, JSON_OBJECT('bridge_required', true, 'naval_advantage', 2.0));

-- 显示插入结果
SELECT 
    type_id as '兵种ID',
    name_zh as '中文名',
    name_en as '英文名',
    color_hex as '颜色',
    movement_type as '移动类型',
    range_type as '攻击类型',
    display_order as '显示顺序'
FROM unit_types 
ORDER BY display_order;

SELECT 
    CONCAT(uc.attacker_type, ' → ', uc.defender_type) as '克制关系',
    uc.effectiveness as '效果倍率',
    uc.counter_type as '关系类型',
    uc.description as '描述'
FROM unit_type_counters uc
ORDER BY uc.attacker_type, uc.effectiveness DESC;

SELECT 
    terrain_name as '地形ID',
    name_zh as '中文名',
    name_en as '英文名',
    movement_cost as '移动消耗',
    defense_bonus as '防御加成',
    visibility_modifier as '视野修正'
FROM terrain_effects 
ORDER BY movement_cost;