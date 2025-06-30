-- ===========================
-- 简化的三国城池数据
-- Simplified Three Kingdoms Cities Data
-- ===========================

-- 插入城池政策数据
INSERT IGNORE INTO city_policies (policy_id, name_zh, name_en, description, category, policy_type, policy_effects, implementation_cost, daily_maintenance, historical_context, dynasty_origin) VALUES

-- 税收政策
('light_taxation', '轻徭薄赋', 'Light Taxation', '减少税收负担，提升民心但降低财政收入', 'taxation', 'economic',
 JSON_OBJECT('tax_rate', -0.30, 'loyalty_bonus', 0.25, 'population_growth', 0.15),
 JSON_OBJECT('gold', 1000), JSON_OBJECT('gold', 50),
 '轻徭薄赋是仁政的体现，汉朝初期常采用此政策休养生息', 'han'),

('heavy_taxation', '厚敛重税', 'Heavy Taxation', '增加税收获取更多财政收入，但会降低民心', 'taxation', 'economic',
 JSON_OBJECT('tax_rate', 0.50, 'loyalty_penalty', -0.30, 'rebellion_risk', 0.20),
 JSON_OBJECT('gold', 2000), JSON_OBJECT('gold', 100),
 '重税政策虽可快速敛财，但易引发民变，需谨慎使用', 'general'),

-- 军事政策
('elite_training', '精兵政策', 'Elite Training', '重点培养精锐部队，提升军队质量', 'military', 'military',
 JSON_OBJECT('troop_quality', 0.40, 'training_cost', 0.60, 'recruitment_speed', -0.20),
 JSON_OBJECT('gold', 5000), JSON_OBJECT('gold', 200),
 '精兵少而精，以质取胜，适合资源有限但求战力强的情况', 'wei'),

('mass_recruitment', '征兵令', 'Mass Recruitment', '大规模征兵，快速扩充军队规模', 'military', 'military',
 JSON_OBJECT('recruitment_speed', 0.80, 'troop_quantity', 0.60, 'population_penalty', -0.15),
 JSON_OBJECT('gold', 3000), JSON_OBJECT('gold', 150),
 '大规模征兵可迅速扩军，但会影响农业生产和民生', 'general'),

-- 贸易政策
('free_trade', '自由贸易', 'Free Trade', '开放贸易，促进商业发展和经济繁荣', 'trade', 'economic',
 JSON_OBJECT('trade_income', 0.35, 'market_activity', 0.40, 'cultural_exchange', 0.20),
 JSON_OBJECT('gold', 2500), JSON_OBJECT('gold', 80),
 '自由贸易促进经济发展，吴国依靠江南水运发展贸易', 'wu'),

('confucian_education', '兴学重教', 'Confucian Education', '推广儒学教育，提升文化水平和治理能力', 'culture', 'social',
 JSON_OBJECT('research_speed', 0.30, 'administrative_efficiency', 0.25, 'cultural_influence', 0.35),
 JSON_OBJECT('gold', 3500), JSON_OBJECT('gold', 120),
 '重视教育可培养人才，提升国家软实力', 'shu');

-- 插入城池发展路线数据
INSERT IGNORE INTO city_development_paths (path_id, name_zh, name_en, description, development_type, milestone_buildings, development_stages, primary_benefits, total_investment_estimate, time_investment_estimate, recommended_for, strategy_guide) VALUES

('military_fortress', '军事要塞', 'Military Fortress', '专注军事防御，建设坚固的防御体系', 'military_fortress',
 JSON_ARRAY('city_walls', 'barracks', 'armory', 'watchtower'),
 JSON_OBJECT('stage1', '基础防御建设', 'stage2', '军事设施完善', 'stage3', '要塞化完成'),
 JSON_OBJECT('defense_rating', 2.0, 'garrison_capacity', 1.5, 'siege_resistance', 1.8),
 50000000, 180, JSON_ARRAY('defensive_players', 'border_cities', 'strategic_locations'),
 '适合边境城市和战略要地，重点投资防御建筑和军事设施'),

('trade_hub', '贸易中心', 'Trade Hub', '发展为重要的商业贸易中心', 'trade_hub',
 JSON_ARRAY('market', 'warehouse', 'mint', 'embassy'),
 JSON_OBJECT('stage1', '基础市场建设', 'stage2', '贸易网络扩展', 'stage3', '区域贸易中心'),
 JSON_OBJECT('trade_income', 2.5, 'resource_circulation', 2.0, 'diplomatic_influence', 1.5),
 60000000, 200, JSON_ARRAY('economic_players', 'coastal_cities', 'river_cities'),
 '适合具备地理优势的城市，重点发展商业和贸易设施'),

('cultural_center', '文化中心', 'Cultural Center', '建设为地区的文化和学术中心', 'cultural_center',
 JSON_ARRAY('academy', 'library', 'temple'),
 JSON_OBJECT('stage1', '基础教育设施', 'stage2', '学术机构完善', 'stage3', '文化影响力辐射'),
 JSON_OBJECT('research_speed', 2.0, 'cultural_influence', 2.5, 'talent_attraction', 1.8),
 45000000, 160, JSON_ARRAY('research_players', 'capital_cities', 'peaceful_regions'),
 '适合和平发展的核心城市，重点投资教育和文化建筑');

-- 插入重要城池数据
INSERT IGNORE INTO cities (city_id, name, type_id, region, terrain_type, base_population, base_prosperity, base_defense, base_loyalty, resource_production, strategic_value, historical_importance, dynasty_control, natural_defenses, trade_specialties, unlock_level) VALUES

-- 魏国重要城市
(1001, '洛阳', 'capital', '中原', 'plains', 80000, 95, 70, 85,
 JSON_OBJECT('gold', 1000, 'food', 800, 'iron', 300, 'wood', 200),
 10, 'capital', 'wei',
 JSON_OBJECT('river_defense', '洛水', 'mountain_barrier', '熊耳山'),
 JSON_ARRAY('silk', 'porcelain', 'bronze_ware'), 1),

(1002, '邺城', 'prefecture', '河北', 'plains', 45000, 80, 85, 90,
 JSON_OBJECT('gold', 600, 'food', 1200, 'iron', 800, 'wood', 400),
 9, 'capital', 'wei',
 JSON_OBJECT('river_defense', '漳水', 'fortified_walls', true),
 JSON_ARRAY('grain', 'iron_weapons', 'war_horses'), 1),

(1003, '许昌', 'prefecture', '中原', 'plains', 35000, 75, 60, 80,
 JSON_OBJECT('gold', 500, 'food', 900, 'iron', 200, 'wood', 300),
 8, 'major', 'wei',
 JSON_OBJECT('strategic_location', '中原腹地'),
 JSON_ARRAY('agricultural_products', 'textiles'), 1),

(1004, '长安', 'capital', '关中', 'plains', 70000, 85, 80, 75,
 JSON_OBJECT('gold', 800, 'food', 600, 'iron', 400, 'wood', 500),
 9, 'capital', 'wei',
 JSON_OBJECT('mountain_defense', '秦岭', 'pass_control', '函谷关'),
 JSON_ARRAY('luxury_goods', 'jade', 'horses'), 2),

-- 蜀国重要城市
(2001, '成都', 'capital', '益州', 'plains', 60000, 90, 65, 95,
 JSON_OBJECT('gold', 700, 'food', 1000, 'iron', 200, 'wood', 600),
 10, 'capital', 'shu',
 JSON_OBJECT('mountain_surrounding', '四川盆地', 'river_network', '岷江水系'),
 JSON_ARRAY('silk', 'tea', 'bamboo_products'), 1),

(2002, '汉中', 'prefecture', '汉中', 'river', 25000, 70, 80, 90,
 JSON_OBJECT('gold', 300, 'food', 800, 'iron', 300, 'wood', 500),
 9, 'major', 'shu',
 JSON_OBJECT('mountain_valley', '秦岭南坡', 'river_defense', '汉水'),
 JSON_ARRAY('grain', 'medicinal_herbs', 'timber'), 1),

(2003, '剑门关', 'pass', '剑南', 'mountain', 2000, 20, 98, 95,
 JSON_OBJECT('gold', 50, 'food', 100, 'iron', 30, 'wood', 50),
 10, 'major', 'shu',
 JSON_OBJECT('cliff_fortress', '剑门山', 'single_road', '蜀道'),
 JSON_ARRAY('strategic_gateway', 'mountain_defense'), 2),

-- 吴国重要城市
(3001, '建业', 'capital', '扬州', 'river', 55000, 85, 60, 80,
 JSON_OBJECT('gold', 800, 'food', 600, 'iron', 150, 'wood', 400),
 10, 'capital', 'wu',
 JSON_OBJECT('river_defense', '长江天险', 'water_network', '江南水系'),
 JSON_ARRAY('silk', 'tea', 'porcelain', 'shipbuilding'), 1),

(3002, '柴桑', 'prefecture', '江州', 'river', 20000, 60, 50, 75,
 JSON_OBJECT('gold', 300, 'food', 500, 'iron', 100, 'wood', 600),
 7, 'important', 'wu',
 JSON_OBJECT('river_port', '长江中游'),
 JSON_ARRAY('shipbuilding', 'fish', 'river_trade'), 2),

(3003, '会稽', 'prefecture', '会稽', 'coastal', 30000, 75, 40, 85,
 JSON_OBJECT('gold', 500, 'food', 400, 'iron', 80, 'wood', 200),
 6, 'important', 'wu',
 JSON_OBJECT('coastal_advantage', '东海'),
 JSON_ARRAY('sea_salt', 'seafood', 'maritime_trade'), 1),

-- 重要关隘
(4001, '函谷关', 'pass', '关中', 'mountain', 3000, 30, 95, 90,
 JSON_OBJECT('gold', 100, 'food', 200, 'iron', 50, 'wood', 100),
 9, 'major', 'wei',
 JSON_OBJECT('natural_fortress', '峡谷地形', 'single_passage', true),
 JSON_ARRAY('toll_collection', 'strategic_control'), 2),

(4002, '夷陵', 'fortress', '荆州', 'river', 12000, 45, 75, 70,
 JSON_OBJECT('gold', 200, 'food', 400, 'iron', 150, 'wood', 300),
 8, 'major', 'wu',
 JSON_OBJECT('river_gorge', '长江峡谷'),
 JSON_ARRAY('strategic_position', 'river_control'), 3),

(4003, '襄阳', 'prefecture', '荆州', 'river', 40000, 70, 65, 75,
 JSON_OBJECT('gold', 400, 'food', 700, 'iron', 200, 'wood', 300),
 8, 'major', 'neutral',
 JSON_OBJECT('river_city', '汉江襄水'),
 JSON_ARRAY('grain', 'iron_goods', 'river_transport'), 2);

-- 显示导入结果
SELECT 'Simplified Three Kingdoms Cities Data Imported Successfully!' as status;

-- 统计导入的城池数据
SELECT 
    dynasty_control,
    COUNT(*) as city_count,
    AVG(strategic_value) as avg_strategic_value,
    SUM(base_population) as total_population
FROM cities 
WHERE is_active = TRUE 
GROUP BY dynasty_control
ORDER BY city_count DESC;