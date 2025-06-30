-- ===========================
-- 建筑配置数据
-- Building Configurations Data
-- ===========================

-- 插入具体建筑配置数据
INSERT IGNORE INTO buildings (building_id, name, type_id, max_level, level_bonuses, upgrade_costs, construction_cost, maintenance_cost, resource_production, garrison_capacity, special_functions, unlock_level, historical_reference, dynasty_origin, rarity_level) VALUES

-- 行政建筑配置
(10001, '县衙', 'government_office', 10,
 JSON_OBJECT('level_1', JSON_OBJECT('admin_efficiency', 0.20, 'tax_collection', 0.15),
             'level_5', JSON_OBJECT('admin_efficiency', 0.50, 'tax_collection', 0.40, 'corruption_resistance', 0.30),
             'level_10', JSON_OBJECT('admin_efficiency', 1.00, 'tax_collection', 0.80, 'corruption_resistance', 0.60, 'policy_slots', 2)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 2000, 'wood', 500), 'level_5', JSON_OBJECT('gold', 8000, 'wood', 1500, 'stone', 800), 'level_10', JSON_OBJECT('gold', 25000, 'wood', 3000, 'stone', 2000)),
 JSON_OBJECT('gold', 5000, 'wood', 1000, 'stone', 300, 'time_hours', 6),
 JSON_OBJECT('gold', 100, 'food', 50),
 JSON_OBJECT('tax_income', 200, 'administrative_points', 10),
 0,
 JSON_OBJECT('tax_collection', true, 'policy_implementation', true, 'population_management', true, 'legal_affairs', true),
 1, '县衙是地方行政管理的核心，负责税收、治安、人口管理等政务', 'han', 'common', 1),

(10002, '太守府', 'city_hall', 15,
 JSON_OBJECT('level_1', JSON_OBJECT('admin_efficiency', 0.35, 'regional_control', 0.25),
             'level_8', JSON_OBJECT('admin_efficiency', 0.80, 'regional_control', 0.60, 'diplomatic_bonus', 0.40),
             'level_15', JSON_OBJECT('admin_efficiency', 1.50, 'regional_control', 1.20, 'diplomatic_bonus', 0.80, 'governor_residence', true)),
 JSON_OBJECT('level_3', JSON_OBJECT('gold', 5000, 'wood', 1200, 'stone', 600), 'level_8', JSON_OBJECT('gold', 15000, 'wood', 2500, 'stone', 1500), 'level_15', JSON_OBJECT('gold', 50000, 'wood', 5000, 'stone', 3000)),
 JSON_OBJECT('gold', 12000, 'wood', 2000, 'stone', 800, 'time_hours', 12),
 JSON_OBJECT('gold', 200, 'food', 100),
 JSON_OBJECT('administrative_points', 25, 'diplomatic_influence', 15),
 0,
 JSON_OBJECT('regional_governance', true, 'diplomatic_activities', true, 'advanced_policies', true, 'hero_recruitment', true),
 3, '太守府是郡级行政中心，太守在此处理区域政务和外交事务', 'general', 'uncommon', 2),

-- 军事建筑配置
(20001, '教场', 'barracks', 12,
 JSON_OBJECT('level_1', JSON_OBJECT('training_speed', 0.30, 'troop_morale', 0.20),
             'level_6', JSON_OBJECT('training_speed', 0.70, 'troop_morale', 0.50, 'veteran_training', true),
             'level_12', JSON_OBJECT('training_speed', 1.20, 'troop_morale', 1.00, 'veteran_training', true, 'elite_units', true)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 3000, 'wood', 800, 'iron', 200), 'level_6', JSON_OBJECT('gold', 10000, 'wood', 2000, 'iron', 800), 'level_12', JSON_OBJECT('gold', 30000, 'wood', 4000, 'iron', 2000)),
 JSON_OBJECT('gold', 8000, 'wood', 1500, 'iron', 500, 'time_hours', 8),
 JSON_OBJECT('gold', 150, 'food', 200),
 JSON_OBJECT(),
 2000,
 JSON_OBJECT('troop_training', true, 'recruitment', true, 'military_drills', true, 'weapon_practice', true),
 2, '教场是训练士兵的重要场所，通过各种军事训练提升军队战斗力', 'general', 'common', 3),

(20002, '武库', 'armory', 10,
 JSON_OBJECT('level_1', JSON_OBJECT('equipment_quality', 0.25, 'storage_capacity', 1000),
             'level_5', JSON_OBJECT('equipment_quality', 0.60, 'storage_capacity', 3000, 'weapon_crafting', true),
             'level_10', JSON_OBJECT('equipment_quality', 1.20, 'storage_capacity', 6000, 'weapon_crafting', true, 'siege_weapons', true)),
 JSON_OBJECT('level_3', JSON_OBJECT('gold', 4000, 'wood', 600, 'iron', 1000), 'level_7', JSON_OBJECT('gold', 12000, 'wood', 1500, 'iron', 2500), 'level_10', JSON_OBJECT('gold', 35000, 'wood', 3000, 'iron', 5000)),
 JSON_OBJECT('gold', 10000, 'wood', 800, 'iron', 1500, 'time_hours', 10),
 JSON_OBJECT('gold', 120, 'iron', 50),
 JSON_OBJECT('weapons', 50, 'armor', 30),
 500,
 JSON_OBJECT('weapon_storage', true, 'equipment_crafting', true, 'siege_engine_production', true, 'maintenance_services', true),
 3, '武库储存军队装备，并可进行武器制造和维修', 'general', 'uncommon', 4),

(20003, '烽火台', 'watchtower', 8,
 JSON_OBJECT('level_1', JSON_OBJECT('detection_range', 0.50, 'early_warning', true),
             'level_4', JSON_OBJECT('detection_range', 1.00, 'early_warning', true, 'communication_network', true),
             'level_8', JSON_OBJECT('detection_range', 2.00, 'early_warning', true, 'communication_network', true, 'intelligence_gathering', true)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 1500, 'wood', 400, 'stone', 200), 'level_5', JSON_OBJECT('gold', 5000, 'wood', 1000, 'stone', 600), 'level_8', JSON_OBJECT('gold', 15000, 'wood', 2000, 'stone', 1200)),
 JSON_OBJECT('gold', 3000, 'wood', 600, 'stone', 400, 'time_hours', 4),
 JSON_OBJECT('gold', 50, 'food', 30),
 JSON_OBJECT('intelligence', 20),
 100,
 JSON_OBJECT('surveillance', true, 'communication', true, 'border_patrol', true, 'signal_transmission', true),
 1, '烽火台用于传递军情，是古代重要的通信和预警设施', 'general', 'common', 5),

-- 防御建筑配置
(30001, '城垣', 'city_walls', 15,
 JSON_OBJECT('level_1', JSON_OBJECT('defense_rating', 0.60, 'wall_durability', 1000),
             'level_8', JSON_OBJECT('defense_rating', 1.50, 'wall_durability', 5000, 'siege_resistance', 0.40),
             'level_15', JSON_OBJECT('defense_rating', 3.00, 'wall_durability', 12000, 'siege_resistance', 1.00, 'tower_defenses', true)),
 JSON_OBJECT('level_3', JSON_OBJECT('gold', 8000, 'wood', 1000, 'stone', 2000), 'level_8', JSON_OBJECT('gold', 25000, 'wood', 3000, 'stone', 6000), 'level_15', JSON_OBJECT('gold', 80000, 'wood', 8000, 'stone', 15000)),
 JSON_OBJECT('gold', 20000, 'wood', 2000, 'stone', 5000, 'time_hours', 24),
 JSON_OBJECT('gold', 300, 'stone', 100),
 JSON_OBJECT(),
 0,
 JSON_OBJECT('city_defense', true, 'siege_protection', true, 'border_control', true, 'defensive_positions', true),
 1, '城垣是城池的基础防御设施，抵御外敌入侵的第一道屏障', 'general', 'essential', 6),

-- 经济建筑配置
(40001, '集市', 'market', 12,
 JSON_OBJECT('level_1', JSON_OBJECT('trade_income', 0.30, 'market_capacity', 500),
             'level_6', JSON_OBJECT('trade_income', 0.80, 'market_capacity', 2000, 'merchant_attraction', 0.40),
             'level_12', JSON_OBJECT('trade_income', 1.60, 'market_capacity', 5000, 'merchant_attraction', 1.00, 'luxury_trading', true)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 2500, 'wood', 600), 'level_6', JSON_OBJECT('gold', 8000, 'wood', 1500), 'level_12', JSON_OBJECT('gold', 25000, 'wood', 4000)),
 JSON_OBJECT('gold', 6000, 'wood', 1200, 'time_hours', 6),
 JSON_OBJECT('gold', 80, 'food', 40),
 JSON_OBJECT('gold', 300, 'trade_goods', 100),
 0,
 JSON_OBJECT('resource_trading', true, 'price_discovery', true, 'merchant_services', true, 'economic_information', true),
 1, '集市是商品交易的场所，促进经济流通和商业发展', 'general', 'common', 7),

(40002, '谷仓', 'granary', 10,
 JSON_OBJECT('level_1', JSON_OBJECT('food_storage', 2000, 'spoilage_reduction', 0.20),
             'level_5', JSON_OBJECT('food_storage', 6000, 'spoilage_reduction', 0.50, 'price_stabilization', true),
             'level_10', JSON_OBJECT('food_storage', 15000, 'spoilage_reduction', 0.80, 'price_stabilization', true, 'emergency_reserves', true)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 2000, 'wood', 800), 'level_5', JSON_OBJECT('gold', 6000, 'wood', 2000), 'level_10', JSON_OBJECT('gold', 18000, 'wood', 5000)),
 JSON_OBJECT('gold', 4000, 'wood', 1000, 'time_hours', 5),
 JSON_OBJECT('gold', 60, 'food', 20),
 JSON_OBJECT(),
 0,
 JSON_OBJECT('food_storage', true, 'famine_prevention', true, 'price_regulation', true, 'emergency_supplies', true),
 1, '谷仓储存粮食，保障城池食物安全，防止饥荒发生', 'general', 'essential', 8),

(40003, '铁匠作坊', 'blacksmith', 12,
 JSON_OBJECT('level_1', JSON_OBJECT('crafting_speed', 0.35, 'equipment_quality', 0.25),
             'level_6', JSON_OBJECT('crafting_speed', 0.80, 'equipment_quality', 0.60, 'advanced_crafting', true),
             'level_12', JSON_OBJECT('crafting_speed', 1.50, 'equipment_quality', 1.20, 'advanced_crafting', true, 'masterwork_creation', true)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 3000, 'wood', 400, 'iron', 600), 'level_6', JSON_OBJECT('gold', 9000, 'wood', 1000, 'iron', 1500), 'level_12', JSON_OBJECT('gold', 28000, 'wood', 2500, 'iron', 4000)),
 JSON_OBJECT('gold', 7000, 'wood', 600, 'iron', 1000, 'time_hours', 8),
 JSON_OBJECT('gold', 100, 'iron', 30),
 JSON_OBJECT('weapons', 30, 'armor', 20, 'tools', 50),
 0,
 JSON_OBJECT('equipment_crafting', true, 'weapon_forging', true, 'tool_making', true, 'repair_services', true),
 2, '铁匠作坊制造武器装备和生产工具，是重要的手工业设施', 'general', 'common', 9),

(40004, '钱庄', 'mint', 8,
 JSON_OBJECT('level_1', JSON_OBJECT('gold_income', 0.25, 'financial_services', true),
             'level_4', JSON_OBJECT('gold_income', 0.60, 'financial_services', true, 'trade_financing', true),
             'level_8', JSON_OBJECT('gold_income', 1.20, 'financial_services', true, 'trade_financing', true, 'currency_stability', true)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 5000, 'wood', 800), 'level_5', JSON_OBJECT('gold', 15000, 'wood', 2000), 'level_8', JSON_OBJECT('gold', 40000, 'wood', 4000)),
 JSON_OBJECT('gold', 12000, 'wood', 1500, 'time_hours', 10),
 JSON_OBJECT('gold', 150, 'food', 60),
 JSON_OBJECT('gold', 400),
 0,
 JSON_OBJECT('currency_minting', true, 'banking_services', true, 'trade_financing', true, 'wealth_management', true),
 4, '钱庄负责货币制造和金融服务，是经济发展的重要支撑', 'general', 'rare', 10),

-- 文化建筑配置
(50001, '酒肆', 'tavern', 10,
 JSON_OBJECT('level_1', JSON_OBJECT('hero_recruitment_rate', 0.20, 'information_quality', 0.30),
             'level_5', JSON_OBJECT('hero_recruitment_rate', 0.50, 'information_quality', 0.70, 'morale_boost', 0.25),
             'level_10', JSON_OBJECT('hero_recruitment_rate', 1.00, 'information_quality', 1.50, 'morale_boost', 0.60, 'legendary_heroes', true)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 2000, 'wood', 500), 'level_5', JSON_OBJECT('gold', 6000, 'wood', 1200), 'level_10', JSON_OBJECT('gold', 18000, 'wood', 3000)),
 JSON_OBJECT('gold', 4000, 'wood', 800, 'time_hours', 4),
 JSON_OBJECT('gold', 80, 'food', 100),
 JSON_OBJECT('gold', 150),
 0,
 JSON_OBJECT('hero_recruitment', true, 'information_gathering', true, 'entertainment', true, 'social_networking', true),
 1, '酒肆是人们聚会饮酒的场所，也是招募英雄和收集情报的重要地点', 'general', 'common', 11),

(50002, '学堂', 'academy', 15,
 JSON_OBJECT('level_1', JSON_OBJECT('research_speed', 0.40, 'education_quality', 0.30),
             'level_8', JSON_OBJECT('research_speed', 1.00, 'education_quality', 0.80, 'talent_cultivation', true),
             'level_15', JSON_OBJECT('research_speed', 2.00, 'education_quality', 1.60, 'talent_cultivation', true, 'advanced_research', true)),
 JSON_OBJECT('level_3', JSON_OBJECT('gold', 4000, 'wood', 1000), 'level_8', JSON_OBJECT('gold', 12000, 'wood', 2500), 'level_15', JSON_OBJECT('gold', 40000, 'wood', 6000)),
 JSON_OBJECT('gold', 8000, 'wood', 1500, 'time_hours', 12),
 JSON_OBJECT('gold', 120, 'food', 80),
 JSON_OBJECT('knowledge', 50, 'research_points', 20),
 0,
 JSON_OBJECT('technology_research', true, 'education', true, 'talent_training', true, 'knowledge_preservation', true),
 3, '学堂是教育和研究的中心，培养人才和发展科技', 'general', 'uncommon', 12),

(50003, '庙宇', 'temple', 10,
 JSON_OBJECT('level_1', JSON_OBJECT('loyalty_bonus', 0.30, 'unrest_reduction', 0.25),
             'level_5', JSON_OBJECT('loyalty_bonus', 0.70, 'unrest_reduction', 0.60, 'spiritual_healing', true),
             'level_10', JSON_OBJECT('loyalty_bonus', 1.40, 'unrest_reduction', 1.20, 'spiritual_healing', true, 'divine_blessing', true)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 3000, 'wood', 600, 'stone', 400), 'level_5', JSON_OBJECT('gold', 8000, 'wood', 1500, 'stone', 1000), 'level_10', JSON_OBJECT('gold', 25000, 'wood', 4000, 'stone', 2500)),
 JSON_OBJECT('gold', 6000, 'wood', 1000, 'stone', 800, 'time_hours', 8),
 JSON_OBJECT('gold', 100, 'food', 60),
 JSON_OBJECT('faith', 30, 'blessings', 10),
 0,
 JSON_OBJECT('loyalty_boost', true, 'spiritual_services', true, 'cultural_unity', true, 'divine_intervention', true),
 1, '庙宇是宗教信仰的中心，提升民众忠诚度和精神凝聚力', 'general', 'common', 13),

(50004, '藏书阁', 'library', 12,
 JSON_OBJECT('level_1', JSON_OBJECT('strategy_effectiveness', 0.20, 'knowledge_preservation', true),
             'level_6', JSON_OBJECT('strategy_effectiveness', 0.50, 'knowledge_preservation', true, 'ancient_wisdom', 0.30),
             'level_12', JSON_OBJECT('strategy_effectiveness', 1.00, 'knowledge_preservation', true, 'ancient_wisdom', 0.80, 'legendary_texts', true)),
 JSON_OBJECT('level_3', JSON_OBJECT('gold', 6000, 'wood', 1500), 'level_6', JSON_OBJECT('gold', 15000, 'wood', 3000), 'level_12', JSON_OBJECT('gold', 45000, 'wood', 8000)),
 JSON_OBJECT('gold', 12000, 'wood', 2000, 'time_hours', 15),
 JSON_OBJECT('gold', 150, 'food', 50),
 JSON_OBJECT('knowledge', 100, 'ancient_texts', 20),
 0,
 JSON_OBJECT('knowledge_storage', true, 'research_bonus', true, 'strategy_development', true, 'cultural_preservation', true),
 5, '藏书阁收藏各类典籍，是知识传承和策略研究的重要场所', 'general', 'rare', 14),

-- 特殊建筑配置
(60001, '驿站', 'embassy', 8,
 JSON_OBJECT('level_1', JSON_OBJECT('diplomacy_effectiveness', 0.35, 'intelligence_network', 0.25),
             'level_4', JSON_OBJECT('diplomacy_effectiveness', 0.80, 'intelligence_network', 0.60, 'trade_agreements', true),
             'level_8', JSON_OBJECT('diplomacy_effectiveness', 1.60, 'intelligence_network', 1.20, 'trade_agreements', true, 'alliance_bonuses', true)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 4000, 'wood', 800), 'level_5', JSON_OBJECT('gold', 12000, 'wood', 2000), 'level_8', JSON_OBJECT('gold', 35000, 'wood', 5000)),
 JSON_OBJECT('gold', 10000, 'wood', 1500, 'time_hours', 12),
 JSON_OBJECT('gold', 200, 'food', 80),
 JSON_OBJECT('diplomatic_influence', 40, 'intelligence', 30),
 0,
 JSON_OBJECT('diplomatic_activities', true, 'intelligence_gathering', true, 'alliance_management', true, 'trade_negotiation', true),
 4, '驿站负责外交事务和情报收集，是对外交流的重要窗口', 'general', 'uncommon', 15),

(60002, '码头', 'port_facility', 12,
 JSON_OBJECT('level_1', JSON_OBJECT('naval_capacity', 0.50, 'maritime_trade', 0.40),
             'level_6', JSON_OBJECT('naval_capacity', 1.20, 'maritime_trade', 1.00, 'shipbuilding', true),
             'level_12', JSON_OBJECT('naval_capacity', 2.50, 'maritime_trade', 2.00, 'shipbuilding', true, 'naval_supremacy', true)),
 JSON_OBJECT('level_2', JSON_OBJECT('gold', 5000, 'wood', 1200, 'iron', 300), 'level_6', JSON_OBJECT('gold', 15000, 'wood', 3000, 'iron', 800), 'level_12', JSON_OBJECT('gold', 50000, 'wood', 8000, 'iron', 2000)),
 JSON_OBJECT('gold', 12000, 'wood', 2500, 'iron', 500, 'time_hours', 18),
 JSON_OBJECT('gold', 180, 'wood', 50),
 JSON_OBJECT('naval_units', 100, 'trade_goods', 200),
 1000,
 JSON_OBJECT('naval_operations', true, 'sea_trade', true, 'shipbuilding', true, 'fishing_fleet', true),
 2, '码头是海上活动的基地，支持海军建设和海上贸易', 'wu', 'rare', 16);

-- 插入建筑协同效果数据
INSERT IGNORE INTO building_synergies (synergy_id, name_zh, name_en, description, synergy_type, required_buildings, proximity_requirement, synergy_effects, bonus_multiplier, city_scope, display_order) VALUES

-- 邻接协同效果
('market_blacksmith', '商贸工匠', 'Market-Blacksmith Synergy', '集市与铁匠铺相邻时，互相促进贸易和生产', 'adjacency',
 JSON_ARRAY(JSON_OBJECT('building_id', 40001, 'min_level', 1), JSON_OBJECT('building_id', 40003, 'min_level', 1)),
 1,
 JSON_OBJECT('trade_income', 0.25, 'crafting_speed', 0.20, 'equipment_sales', 0.30),
 1.25, 'same_city', 1),

('barracks_armory', '军营武库', 'Barracks-Armory Synergy', '教场与武库相邻时，提升军事训练效率和装备质量', 'adjacency',
 JSON_ARRAY(JSON_OBJECT('building_id', 20001, 'min_level', 1), JSON_OBJECT('building_id', 20002, 'min_level', 1)),
 1,
 JSON_OBJECT('training_speed', 0.30, 'equipment_quality', 0.25, 'military_readiness', 0.35),
 1.30, 'same_city', 2),

('temple_academy', '儒学昌明', 'Temple-Academy Synergy', '庙宇与学堂相邻时，促进文化教育和精神文明发展', 'adjacency',
 JSON_ARRAY(JSON_OBJECT('building_id', 50003, 'min_level', 1), JSON_OBJECT('building_id', 50002, 'min_level', 1)),
 1,
 JSON_OBJECT('research_speed', 0.25, 'loyalty_bonus', 0.20, 'cultural_influence', 0.40),
 1.20, 'same_city', 3),

-- 功能协同效果
('administrative_cluster', '政务中心', 'Administrative Cluster', '多个行政建筑集中时，形成高效的管理中心', 'collection',
 JSON_ARRAY(JSON_OBJECT('building_id', 10001, 'min_level', 1), JSON_OBJECT('building_id', 10002, 'min_level', 1), JSON_OBJECT('building_id', 50002, 'min_level', 1)),
 2,
 JSON_OBJECT('administrative_efficiency', 0.50, 'policy_effectiveness', 0.40, 'corruption_resistance', 0.35),
 1.50, 'same_city', 4),

('economic_hub', '经济中心', 'Economic Hub', '经济建筑集中形成繁荣的商业区', 'collection',
 JSON_ARRAY(JSON_OBJECT('building_id', 40001, 'min_level', 3), JSON_OBJECT('building_id', 40003, 'min_level', 3), JSON_OBJECT('building_id', 40004, 'min_level', 1)),
 2,
 JSON_OBJECT('trade_income', 0.60, 'economic_growth', 0.50, 'merchant_attraction', 0.70),
 1.60, 'same_city', 5),

('military_complex', '军事重镇', 'Military Complex', '完整的军事设施提供强大的防御和训练能力', 'collection',
 JSON_ARRAY(JSON_OBJECT('building_id', 20001, 'min_level', 5), JSON_OBJECT('building_id', 20002, 'min_level', 3), JSON_OBJECT('building_id', 30001, 'min_level', 5), JSON_OBJECT('building_id', 20003, 'min_level', 3)),
 3,
 JSON_OBJECT('military_effectiveness', 1.00, 'defense_rating', 0.80, 'siege_resistance', 0.90),
 2.00, 'same_city', 6),

-- 等级协同效果
('advanced_governance', '盛世治理', 'Advanced Governance', '高等级行政建筑展现盛世治理水平', 'level_based',
 JSON_ARRAY(JSON_OBJECT('building_id', 10002, 'min_level', 10), JSON_OBJECT('building_id', 50002, 'min_level', 10)),
 0,
 JSON_OBJECT('golden_age_bonus', 1.00, 'cultural_prestige', 0.80, 'population_growth', 0.60),
 2.50, 'same_region', 7),

('fortress_city', '要塞之城', 'Fortress City', '高等级防御建筑打造坚不可摧的要塞', 'level_based',
 JSON_ARRAY(JSON_OBJECT('building_id', 30001, 'min_level', 12), JSON_OBJECT('building_id', 20002, 'min_level', 8)),
 0,
 JSON_OBJECT('siege_immunity', 0.70, 'intimidation_factor', 0.80, 'strategic_dominance', 1.00),
 3.00, 'same_region', 8);

-- 显示创建结果
SELECT 'Building Configurations Data Created Successfully!' as status;

-- 统计建筑配置数据
SELECT 
    bt.category,
    COUNT(b.building_id) as building_count,
    AVG(b.max_level) as avg_max_level,
    COUNT(CASE WHEN b.rarity_level = 'common' THEN 1 END) as common_buildings,
    COUNT(CASE WHEN b.rarity_level = 'uncommon' THEN 1 END) as uncommon_buildings,
    COUNT(CASE WHEN b.rarity_level = 'rare' THEN 1 END) as rare_buildings
FROM buildings b
JOIN building_types bt ON b.type_id = bt.type_id
WHERE b.is_active = TRUE
GROUP BY bt.category
ORDER BY building_count DESC;