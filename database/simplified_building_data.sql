-- ===========================
-- 简化的建筑配置数据
-- Simplified Building Configurations Data
-- ===========================

-- 插入具体建筑配置数据
INSERT IGNORE INTO buildings (building_id, name, type_id, max_level, level_bonuses, upgrade_costs, construction_cost, maintenance_cost, resource_production, garrison_capacity, special_functions, unlock_level, historical_reference, dynasty_origin, rarity_level) VALUES

-- 行政建筑配置
(10001, '县衙', 'government_office', 10,
 JSON_OBJECT('level_1', JSON_OBJECT('admin_efficiency', 0.20, 'tax_collection', 0.15),
             'level_5', JSON_OBJECT('admin_efficiency', 0.50, 'tax_collection', 0.40),
             'level_10', JSON_OBJECT('admin_efficiency', 1.00, 'tax_collection', 0.80)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 2000, 'wood', 500), 'level_5', JSON_OBJECT('gold', 8000, 'wood', 1500)),
 JSON_OBJECT('gold', 5000, 'wood', 1000, 'stone', 300),
 JSON_OBJECT('gold', 100, 'food', 50),
 JSON_OBJECT('tax_income', 200, 'administrative_points', 10),
 0,
 JSON_OBJECT('tax_collection', true, 'policy_implementation', true),
 1, '县衙是地方行政管理的核心，负责税收、治安、人口管理等政务', 'han', 'common'),

(10002, '太守府', 'city_hall', 15,
 JSON_OBJECT('level_1', JSON_OBJECT('admin_efficiency', 0.35, 'regional_control', 0.25),
             'level_8', JSON_OBJECT('admin_efficiency', 0.80, 'regional_control', 0.60),
             'level_15', JSON_OBJECT('admin_efficiency', 1.50, 'regional_control', 1.20)),
 JSON_OBJECT('level_3', JSON_OBJECT('gold', 5000, 'wood', 1200), 'level_8', JSON_OBJECT('gold', 15000, 'wood', 2500)),
 JSON_OBJECT('gold', 12000, 'wood', 2000, 'stone', 800),
 JSON_OBJECT('gold', 200, 'food', 100),
 JSON_OBJECT('administrative_points', 25, 'diplomatic_influence', 15),
 0,
 JSON_OBJECT('regional_governance', true, 'diplomatic_activities', true),
 3, '太守府是郡级行政中心，太守在此处理区域政务和外交事务', 'general', 'uncommon'),

-- 军事建筑配置
(20001, '教场', 'barracks', 12,
 JSON_OBJECT('level_1', JSON_OBJECT('training_speed', 0.30, 'troop_morale', 0.20),
             'level_6', JSON_OBJECT('training_speed', 0.70, 'troop_morale', 0.50),
             'level_12', JSON_OBJECT('training_speed', 1.20, 'troop_morale', 1.00)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 3000, 'wood', 800), 'level_6', JSON_OBJECT('gold', 10000, 'wood', 2000)),
 JSON_OBJECT('gold', 8000, 'wood', 1500, 'iron', 500),
 JSON_OBJECT('gold', 150, 'food', 200),
 JSON_OBJECT(),
 2000,
 JSON_OBJECT('troop_training', true, 'recruitment', true),
 2, '教场是训练士兵的军事设施，提升军队战斗力', 'general', 'common'),

(20002, '武库', 'armory', 10,
 JSON_OBJECT('level_1', JSON_OBJECT('equipment_quality', 0.25, 'storage_capacity', 1000),
             'level_5', JSON_OBJECT('equipment_quality', 0.60, 'storage_capacity', 3000),
             'level_10', JSON_OBJECT('equipment_quality', 1.20, 'storage_capacity', 6000)),
 JSON_OBJECT('level_3', JSON_OBJECT('gold', 4000, 'iron', 1000), 'level_7', JSON_OBJECT('gold', 12000, 'iron', 2500)),
 JSON_OBJECT('gold', 10000, 'wood', 800, 'iron', 1500),
 JSON_OBJECT('gold', 120, 'iron', 50),
 JSON_OBJECT('weapons', 50, 'armor', 30),
 500,
 JSON_OBJECT('weapon_storage', true, 'equipment_crafting', true),
 3, '武库储存军队装备，并可进行武器制造和维修', 'general', 'uncommon'),

-- 防御建筑配置
(30001, '城垣', 'city_walls', 15,
 JSON_OBJECT('level_1', JSON_OBJECT('defense_rating', 0.60, 'wall_durability', 1000),
             'level_8', JSON_OBJECT('defense_rating', 1.50, 'wall_durability', 5000),
             'level_15', JSON_OBJECT('defense_rating', 3.00, 'wall_durability', 12000)),
 JSON_OBJECT('level_3', JSON_OBJECT('gold', 8000, 'stone', 2000), 'level_8', JSON_OBJECT('gold', 25000, 'stone', 6000)),
 JSON_OBJECT('gold', 20000, 'wood', 2000, 'stone', 5000),
 JSON_OBJECT('gold', 300, 'stone', 100),
 JSON_OBJECT(),
 0,
 JSON_OBJECT('city_defense', true, 'siege_protection', true),
 1, '城垣是城池的基础防御设施，抵御外敌入侵的第一道屏障', 'general', 'common'),

-- 经济建筑配置
(40001, '集市', 'market', 12,
 JSON_OBJECT('level_1', JSON_OBJECT('trade_income', 0.30, 'market_capacity', 500),
             'level_6', JSON_OBJECT('trade_income', 0.80, 'market_capacity', 2000),
             'level_12', JSON_OBJECT('trade_income', 1.60, 'market_capacity', 5000)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 2500, 'wood', 600), 'level_6', JSON_OBJECT('gold', 8000, 'wood', 1500)),
 JSON_OBJECT('gold', 6000, 'wood', 1200),
 JSON_OBJECT('gold', 80, 'food', 40),
 JSON_OBJECT('gold', 300, 'trade_goods', 100),
 0,
 JSON_OBJECT('resource_trading', true, 'price_discovery', true),
 1, '集市是商品交易的场所，促进经济流通和商业发展', 'general', 'common'),

(40002, '谷仓', 'granary', 10,
 JSON_OBJECT('level_1', JSON_OBJECT('food_storage', 2000, 'spoilage_reduction', 0.20),
             'level_5', JSON_OBJECT('food_storage', 6000, 'spoilage_reduction', 0.50),
             'level_10', JSON_OBJECT('food_storage', 15000, 'spoilage_reduction', 0.80)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 2000, 'wood', 800), 'level_5', JSON_OBJECT('gold', 6000, 'wood', 2000)),
 JSON_OBJECT('gold', 4000, 'wood', 1000),
 JSON_OBJECT('gold', 60, 'food', 20),
 JSON_OBJECT(),
 0,
 JSON_OBJECT('food_storage', true, 'famine_prevention', true),
 1, '谷仓储存粮食，保障城池食物安全，防止饥荒发生', 'general', 'common'),

(40003, '铁匠作坊', 'blacksmith', 12,
 JSON_OBJECT('level_1', JSON_OBJECT('crafting_speed', 0.35, 'equipment_quality', 0.25),
             'level_6', JSON_OBJECT('crafting_speed', 0.80, 'equipment_quality', 0.60),
             'level_12', JSON_OBJECT('crafting_speed', 1.50, 'equipment_quality', 1.20)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 3000, 'iron', 600), 'level_6', JSON_OBJECT('gold', 9000, 'iron', 1500)),
 JSON_OBJECT('gold', 7000, 'wood', 600, 'iron', 1000),
 JSON_OBJECT('gold', 100, 'iron', 30),
 JSON_OBJECT('weapons', 30, 'armor', 20, 'tools', 50),
 0,
 JSON_OBJECT('equipment_crafting', true, 'weapon_forging', true),
 2, '铁匠作坊制造武器装备和生产工具，是重要的手工业设施', 'general', 'common'),

-- 文化建筑配置
(50001, '酒肆', 'tavern', 10,
 JSON_OBJECT('level_1', JSON_OBJECT('hero_recruitment_rate', 0.20, 'information_quality', 0.30),
             'level_5', JSON_OBJECT('hero_recruitment_rate', 0.50, 'information_quality', 0.70),
             'level_10', JSON_OBJECT('hero_recruitment_rate', 1.00, 'information_quality', 1.50)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 2000, 'wood', 500), 'level_5', JSON_OBJECT('gold', 6000, 'wood', 1200)),
 JSON_OBJECT('gold', 4000, 'wood', 800),
 JSON_OBJECT('gold', 80, 'food', 100),
 JSON_OBJECT('gold', 150),
 0,
 JSON_OBJECT('hero_recruitment', true, 'information_gathering', true),
 1, '酒肆是人们聚会饮酒的场所，也是招募英雄和收集情报的重要地点', 'general', 'common'),

(50002, '学堂', 'academy', 15,
 JSON_OBJECT('level_1', JSON_OBJECT('research_speed', 0.40, 'education_quality', 0.30),
             'level_8', JSON_OBJECT('research_speed', 1.00, 'education_quality', 0.80),
             'level_15', JSON_OBJECT('research_speed', 2.00, 'education_quality', 1.60)),
 JSON_OBJECT('level_3', JSON_OBJECT('gold', 4000, 'wood', 1000), 'level_8', JSON_OBJECT('gold', 12000, 'wood', 2500)),
 JSON_OBJECT('gold', 8000, 'wood', 1500),
 JSON_OBJECT('gold', 120, 'food', 80),
 JSON_OBJECT('knowledge', 50, 'research_points', 20),
 0,
 JSON_OBJECT('technology_research', true, 'education', true),
 3, '学堂是教育和研究的中心，培养人才和发展科技', 'general', 'uncommon'),

(50003, '庙宇', 'temple', 10,
 JSON_OBJECT('level_1', JSON_OBJECT('loyalty_bonus', 0.30, 'unrest_reduction', 0.25),
             'level_5', JSON_OBJECT('loyalty_bonus', 0.70, 'unrest_reduction', 0.60),
             'level_10', JSON_OBJECT('loyalty_bonus', 1.40, 'unrest_reduction', 1.20)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 3000, 'stone', 400), 'level_5', JSON_OBJECT('gold', 8000, 'stone', 1000)),
 JSON_OBJECT('gold', 6000, 'wood', 1000, 'stone', 800),
 JSON_OBJECT('gold', 100, 'food', 60),
 JSON_OBJECT('faith', 30, 'blessings', 10),
 0,
 JSON_OBJECT('loyalty_boost', true, 'spiritual_services', true),
 1, '庙宇是宗教信仰的中心，提升民众忠诚度和精神凝聚力', 'general', 'common');

-- 插入建筑协同效果数据
INSERT IGNORE INTO building_synergies (synergy_id, name_zh, name_en, description, synergy_type, required_buildings, proximity_requirement, synergy_effects, bonus_multiplier, city_scope) VALUES

-- 邻接协同效果
('market_blacksmith', '商贸工匠', 'Market-Blacksmith Synergy', '集市与铁匠铺相邻时，互相促进贸易和生产', 'adjacency',
 JSON_ARRAY(JSON_OBJECT('building_id', 40001, 'min_level', 1), JSON_OBJECT('building_id', 40003, 'min_level', 1)),
 1,
 JSON_OBJECT('trade_income', 0.25, 'crafting_speed', 0.20, 'equipment_sales', 0.30),
 1.25, 'same_city'),

('barracks_armory', '军营武库', 'Barracks-Armory Synergy', '教场与武库相邻时，提升军事训练效率和装备质量', 'adjacency',
 JSON_ARRAY(JSON_OBJECT('building_id', 20001, 'min_level', 1), JSON_OBJECT('building_id', 20002, 'min_level', 1)),
 1,
 JSON_OBJECT('training_speed', 0.30, 'equipment_quality', 0.25, 'military_readiness', 0.35),
 1.30, 'same_city'),

('temple_academy', '儒学昌明', 'Temple-Academy Synergy', '庙宇与学堂相邻时，促进文化教育和精神文明发展', 'adjacency',
 JSON_ARRAY(JSON_OBJECT('building_id', 50003, 'min_level', 1), JSON_OBJECT('building_id', 50002, 'min_level', 1)),
 1,
 JSON_OBJECT('research_speed', 0.25, 'loyalty_bonus', 0.20, 'cultural_influence', 0.40),
 1.20, 'same_city'),

-- 功能协同效果
('administrative_cluster', '政务中心', 'Administrative Cluster', '多个行政建筑集中时，形成高效的管理中心', 'collection',
 JSON_ARRAY(JSON_OBJECT('building_id', 10001, 'min_level', 1), JSON_OBJECT('building_id', 10002, 'min_level', 1), JSON_OBJECT('building_id', 50002, 'min_level', 1)),
 2,
 JSON_OBJECT('administrative_efficiency', 0.50, 'policy_effectiveness', 0.40, 'corruption_resistance', 0.35),
 1.50, 'same_city'),

('economic_hub', '经济中心', 'Economic Hub', '经济建筑集中形成繁荣的商业区', 'collection',
 JSON_ARRAY(JSON_OBJECT('building_id', 40001, 'min_level', 3), JSON_OBJECT('building_id', 40003, 'min_level', 3)),
 2,
 JSON_OBJECT('trade_income', 0.60, 'economic_growth', 0.50, 'merchant_attraction', 0.70),
 1.60, 'same_city');

-- 显示创建结果
SELECT 'Simplified Building Configurations Data Created Successfully!' as status;

-- 统计建筑配置数据
SELECT 
    bt.category,
    COUNT(b.building_id) as building_count,
    AVG(b.max_level) as avg_max_level,
    COUNT(CASE WHEN b.rarity_level = 'common' THEN 1 END) as common_buildings,
    COUNT(CASE WHEN b.rarity_level = 'uncommon' THEN 1 END) as uncommon_buildings
FROM buildings b
JOIN building_types bt ON b.type_id = bt.type_id
WHERE b.is_active = TRUE
GROUP BY bt.category
ORDER BY building_count DESC;