-- ===========================
-- 阵营字典系统数据
-- Three Kingdoms Faction Dictionary System
-- ===========================

-- 创建阵营配置表（如果不存在）
CREATE TABLE IF NOT EXISTS factions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) UNIQUE,
    faction_id VARCHAR(10) NOT NULL UNIQUE,
    name_zh VARCHAR(20) NOT NULL,
    name_en VARCHAR(20) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    banner_color VARCHAR(7) NOT NULL,
    emblem_url VARCHAR(255),
    historical_period VARCHAR(50),
    description TEXT,
    founding_emperor VARCHAR(50),
    capital_city VARCHAR(50),
    territory_bonus JSON,
    faction_bonus JSON,
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
DELETE FROM factions;

-- 插入阵营配置数据
INSERT INTO factions (
    document_id,
    faction_id, 
    name_zh, 
    name_en, 
    color_hex, 
    banner_color,
    emblem_url,
    historical_period, 
    description, 
    founding_emperor, 
    capital_city,
    territory_bonus,
    faction_bonus,
    display_order,
    is_active
) VALUES 
-- 魏国 - 以法治国，军事强盛
('f1001000-0000-0000-0000-000000000001', 'wei', '魏', 'Wei', '#FF0000', '#8B0000', 
 '/images/factions/wei_emblem.png', '220-266年',
 '魏国由曹操之子曹丕建立，都城洛阳，是三国中实力最强的政权。以法家治国，军事力量强大，最终统一北方。',
 '曹丕', '洛阳',
 JSON_OBJECT(
    'attack_bonus', 0.10,
    'defense_bonus', 0.05,
    'special_skill', 'wei_formation',
    'description', '魏国军队纪律严明，攻击力提升10%，防御力提升5%'
 ),
 JSON_OBJECT(
    'cavalry_bonus', 0.15,
    'archer_penalty', -0.05,
    'leader_effect', 'tactical_superiority',
    'description', '魏国善用骑兵，骑兵部队战力提升15%'
 ),
 1, true),

-- 蜀国 - 仁政治国，人才辈出  
('f2001000-0000-0000-0000-000000000002', 'shu', '蜀', 'Shu', '#00FF00', '#006400',
 '/images/factions/shu_emblem.png', '221-263年',
 '蜀汉由刘备建立，都城成都，以儒家仁政治国。虽然实力最弱，但因诸葛亮等贤臣辅佐，曾一度威胁魏国。',
 '刘备', '成都',
 JSON_OBJECT(
    'hp_bonus', 0.15,
    'exp_bonus', 0.10,
    'special_skill', 'shu_virtue',
    'description', '蜀国仁政，武将生命值提升15%，经验获得提升10%'
 ),
 JSON_OBJECT(
    'infantry_bonus', 0.12,
    'morale_bonus', 0.08,
    'leader_effect', 'righteous_cause',
    'description', '蜀军士气高昂，步兵战力提升12%，士气提升8%'
 ),
 2, true),

-- 吴国 - 水师称雄，商贸发达
('f3001000-0000-0000-0000-000000000003', 'wu', '吴', 'Wu', '#0000FF', '#000080',
 '/images/factions/wu_emblem.png', '229-280年', 
 '东吴由孙权建立，都城建业（今南京），依靠长江天险和强大水师，成为三国中最后灭亡的政权。',
 '孙权', '建业',
 JSON_OBJECT(
    'speed_bonus', 0.12,
    'crit_rate', 0.08,
    'special_skill', 'wu_naval',
    'description', '吴国水师强大，速度提升12%，暴击率提升8%'
 ),
 JSON_OBJECT(
    'archer_bonus', 0.18,
    'naval_advantage', 0.25,
    'leader_effect', 'swift_strike',
    'description', '吴军善射，弓兵战力提升18%，水战优势25%'
 ),
 3, true),

-- 群雄 - 割据混战，机会主义
('f4001000-0000-0000-0000-000000000004', 'qun', '群', 'Qun', '#FFFF00', '#DAA520',
 '/images/factions/qun_emblem.png', '184-220年',
 '群雄割据时期，各路诸侯争霸，包括袁绍、袁术、吕布、刘表、刘璋等，最终被三国统一。',
 '各路诸侯', '不固定',
 JSON_OBJECT(
    'gold_bonus', 0.20,
    'resource_bonus', 0.15,
    'special_skill', 'qun_plunder',
    'description', '群雄割据，金币获得提升20%，资源获得提升15%'
 ),
 JSON_OBJECT(
    'mixed_bonus', 0.08,
    'flexibility', 0.10,
    'leader_effect', 'opportunist',
    'description', '群雄兵种混合，各兵种适应性提升8%'
 ),
 4, true),

-- 汉朝 - 正统名义，皇室威严
('f5001000-0000-0000-0000-000000000005', 'han', '汉', 'Han', '#800080', '#4B0082',
 '/images/factions/han_emblem.png', '25-220年',
 '东汉王朝，虽然皇权衰微，但仍保持着天子的名义正统，最终被曹丕篡夺，建立魏国。',
 '汉献帝', '长安/洛阳',
 JSON_OBJECT(
    'all_stats_bonus', 0.05,
    'imperial_blessing', 0.12,
    'special_skill', 'han_legacy',
    'description', '汉室威严，全属性提升5%，获得皇室加护12%'
 ),
 JSON_OBJECT(
    'imperial_guard', 0.20,
    'legitimacy_bonus', 0.15,
    'leader_effect', 'imperial_mandate',
    'description', '汉室正统，禁军战力提升20%，正统性加成15%'
 ),
 5, true);

-- 创建阵营关系表（阵营间的外交关系）
CREATE TABLE IF NOT EXISTS faction_relations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faction_a VARCHAR(10) NOT NULL,
    faction_b VARCHAR(10) NOT NULL,
    relation_type ENUM('ally', 'enemy', 'neutral', 'vassal') NOT NULL,
    relation_strength DECIMAL(3,2) DEFAULT 0.00, -- -1.00 到 1.00
    historical_context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_relation (faction_a, faction_b),
    INDEX idx_faction_a (faction_a),
    INDEX idx_faction_b (faction_b)
);

-- 插入阵营关系数据
INSERT INTO faction_relations (faction_a, faction_b, relation_type, relation_strength, historical_context) VALUES
-- 魏蜀关系
('wei', 'shu', 'enemy', -0.80, '魏蜀两国为争夺正统，长期敌对，多次发生战争'),
('shu', 'wei', 'enemy', -0.80, '蜀汉视魏国为篡逆，志在北伐中原恢复汉室'),

-- 魏吴关系  
('wei', 'wu', 'enemy', -0.60, '魏吴因争夺荆州等地区多次交战，但冲突不如魏蜀激烈'),
('wu', 'wei', 'enemy', -0.60, '东吴与魏国在淮南等地区长期对峙'),

-- 蜀吴关系（联盟）
('shu', 'wu', 'ally', 0.70, '蜀吴联盟对抗魏国，史称"吴蜀联盟"'),
('wu', 'shu', 'ally', 0.70, '孙刘联盟共同对抗曹魏政权'),

-- 群雄与各国关系
('qun', 'wei', 'neutral', 0.20, '部分群雄后来归顺魏国'),
('qun', 'shu', 'neutral', 0.10, '少数群雄与蜀国有合作'),
('qun', 'wu', 'neutral', 0.15, '部分群雄与吴国有贸易往来'),

-- 汉朝关系
('han', 'wei', 'vassal', -0.90, '汉献帝被曹操控制，最终禅让给曹丕'),
('han', 'shu', 'ally', 0.95, '蜀汉以恢复汉室为己任'),
('han', 'wu', 'neutral', 0.30, '东吴名义上尊奉汉室'),
('han', 'qun', 'neutral', 0.00, '群雄对汉室态度不一');

-- 显示插入结果
SELECT 
    faction_id as '阵营ID',
    name_zh as '中文名',
    name_en as '英文名', 
    color_hex as '主色调',
    founding_emperor as '建立者',
    capital_city as '都城',
    historical_period as '存续时期'
FROM factions 
ORDER BY display_order;

SELECT 
    CONCAT(fr.faction_a, ' → ', fr.faction_b) as '关系',
    relation_type as '关系类型',
    relation_strength as '关系强度',
    historical_context as '历史背景'
FROM faction_relations fr
ORDER BY fr.faction_a, fr.faction_b;