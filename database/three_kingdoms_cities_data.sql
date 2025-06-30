-- ===========================
-- 三国历史城池数据
-- Three Kingdoms Historical Cities Data
-- ===========================

-- 插入城池政策数据
INSERT IGNORE INTO city_policies (policy_id, name_zh, name_en, description, category, policy_type, policy_effects, cost_modifiers, implementation_cost, daily_maintenance, historical_context, dynasty_origin) VALUES

-- 税收政策
('light_taxation', '轻徭薄赋', 'Light Taxation', '减少税收负担，提升民心但降低财政收入', 'taxation', 'economic',
 JSON_OBJECT('tax_rate', -0.30, 'loyalty_bonus', 0.25, 'population_growth', 0.15),
 JSON_OBJECT('administrative_cost', -0.20), JSON_OBJECT('gold', 1000), JSON_OBJECT('gold', 50),
 '轻徭薄赋是仁政的体现，汉朝初期常采用此政策休养生息', 'han'),

('heavy_taxation', '厚敛重税', 'Heavy Taxation', '增加税收获取更多财政收入，但会降低民心', 'taxation', 'economic',
 JSON_OBJECT('tax_rate', 0.50, 'loyalty_penalty', -0.30, 'rebellion_risk', 0.20),
 JSON_OBJECT('administrative_cost', 0.30), JSON_OBJECT('gold', 2000), JSON_OBJECT('gold', 100),
 '重税政策虽可快速敛财，但易引发民变，需谨慎使用', 'general'),

-- 军事政策
('elite_training', '精兵政策', 'Elite Training', '重点培养精锐部队，提升军队质量', 'military', 'military',
 JSON_OBJECT('troop_quality', 0.40, 'training_cost', 0.60, 'recruitment_speed', -0.20),
 JSON_OBJECT('military_upkeep', 0.50), JSON_OBJECT('gold', 5000), JSON_OBJECT('gold', 200),
 '精兵少而精，以质取胜，适合资源有限但求战力强的情况', 'wei'),

('mass_recruitment', '征兵令', 'Mass Recruitment', '大规模征兵，快速扩充军队规模', 'military', 'military',
 JSON_OBJECT('recruitment_speed', 0.80, 'troop_quantity', 0.60, 'population_penalty', -0.15),
 JSON_OBJECT('recruitment_cost', -0.30), JSON_OBJECT('gold', 3000), JSON_OBJECT('gold', 150),
 '大规模征兵可迅速扩军，但会影响农业生产和民生', 'general'),

-- 贸易政策
('free_trade', '自由贸易', 'Free Trade', '开放贸易，促进商业发展和经济繁荣', 'trade', 'economic',
 JSON_OBJECT('trade_income', 0.35, 'market_activity', 0.40, 'cultural_exchange', 0.20),
 JSON_OBJECT('trade_routes', 0.25), JSON_OBJECT('gold', 2500), JSON_OBJECT('gold', 80),
 '自由贸易促进经济发展，吴国依靠江南水运发展贸易', 'wu'),

('trade_monopoly', '官营专卖', 'Trade Monopoly', '政府垄断重要商品贸易，增加财政收入', 'trade', 'economic',
 JSON_OBJECT('monopoly_income', 0.50, 'merchant_satisfaction', -0.40, 'black_market_risk', 0.30),
 JSON_OBJECT('enforcement_cost', 0.40), JSON_OBJECT('gold', 4000), JSON_OBJECT('gold', 180),
 '盐铁专卖等官营政策可增加国库收入，但需严格监管', 'han'),

-- 文化政策
('confucian_education', '兴学重教', 'Confucian Education', '推广儒学教育，提升文化水平和治理能力', 'culture', 'social',
 JSON_OBJECT('research_speed', 0.30, 'administrative_efficiency', 0.25, 'cultural_influence', 0.35),
 JSON_OBJECT('education_cost', 0.50), JSON_OBJECT('gold', 3500), JSON_OBJECT('gold', 120),
 '重视教育可培养人才，提升国家软实力', 'shu'),

('military_culture', '尚武精神', 'Military Culture', '弘扬武德，培养尚武精神，提升军队士气', 'culture', 'military',
 JSON_OBJECT('troop_morale', 0.40, 'recruitment_appeal', 0.30, 'cultural_militarization', 0.25),
 JSON_OBJECT('military_ceremonies', 0.20), JSON_OBJECT('gold', 2000), JSON_OBJECT('gold', 90),
 '尚武文化可提升军队士气，但过度武化可能影响文治', 'wei');

-- 插入城池发展路线数据
INSERT IGNORE INTO city_development_paths (path_id, name_zh, name_en, description, development_type, milestone_buildings, development_stages, primary_benefits, total_investment_estimate, time_investment_estimate, recommended_for, strategy_guide) VALUES

('military_fortress', '军事要塞', 'Military Fortress', '专注军事防御，建设坚固的防御体系', 'military_fortress',
 JSON_ARRAY('city_walls', 'barracks', 'armory', 'watchtower', 'garrison_quarters'),
 JSON_OBJECT('stage1', '基础防御建设', 'stage2', '军事设施完善', 'stage3', '要塞化完成'),
 JSON_OBJECT('defense_rating', 2.0, 'garrison_capacity', 1.5, 'siege_resistance', 1.8),
 50000000, 180, JSON_ARRAY('defensive_players', 'border_cities', 'strategic_locations'),
 '适合边境城市和战略要地，重点投资防御建筑和军事设施'),

('trade_hub', '贸易中心', 'Trade Hub', '发展为重要的商业贸易中心', 'trade_hub',
 JSON_ARRAY('market', 'warehouse', 'mint', 'embassy', 'merchant_quarter'),
 JSON_OBJECT('stage1', '基础市场建设', 'stage2', '贸易网络扩展', 'stage3', '区域贸易中心'),
 JSON_OBJECT('trade_income', 2.5, 'resource_circulation', 2.0, 'diplomatic_influence', 1.5),
 60000000, 200, JSON_ARRAY('economic_players', 'coastal_cities', 'river_cities'),
 '适合具备地理优势的城市，重点发展商业和贸易设施'),

('cultural_center', '文化中心', 'Cultural Center', '建设为地区的文化和学术中心', 'cultural_center',
 JSON_ARRAY('academy', 'library', 'temple', 'theater', 'scholar_residence'),
 JSON_OBJECT('stage1', '基础教育设施', 'stage2', '学术机构完善', 'stage3', '文化影响力辐射'),
 JSON_OBJECT('research_speed', 2.0, 'cultural_influence', 2.5, 'talent_attraction', 1.8),
 45000000, 160, JSON_ARRAY('research_players', 'capital_cities', 'peaceful_regions'),
 '适合和平发展的核心城市，重点投资教育和文化建筑'),

('resource_base', '资源基地', 'Resource Base', '专门开发和生产各类资源', 'resource_base',
 JSON_ARRAY('mine', 'lumber_mill', 'farm', 'workshop', 'storage_complex'),
 JSON_OBJECT('stage1', '资源开采设施', 'stage2', '生产规模扩大', 'stage3', '供应链优化'),
 JSON_OBJECT('resource_production', 2.5, 'supply_stability', 2.0, 'industrial_capacity', 1.8),
 40000000, 150, JSON_ARRAY('resource_focused_players', 'rich_terrain', 'supply_cities'),
 '适合资源丰富的地区，重点开发生产和储存设施'),

('defensive_stronghold', '防御据点', 'Defensive Stronghold', '建设为不可攻破的防御据点', 'defensive_stronghold',
 JSON_ARRAY('fortress_walls', 'siege_defenses', 'underground_tunnels', 'supply_depots'),
 JSON_OBJECT('stage1', '防御工事', 'stage2', '深度防御', 'stage3', '绝对要塞'),
 JSON_OBJECT('siege_resistance', 3.0, 'defensive_warfare', 2.5, 'strategic_control', 2.0),
 70000000, 250, JSON_ARRAY('defensive_specialists', 'choke_points', 'mountain_passes'),
 '适用于关键战略位置，投资巨大但防御力极强');

-- 插入魏国城池数据
INSERT IGNORE INTO cities (city_id, name, type_id, region, sub_region, terrain_type, base_population, base_prosperity, base_defense, base_loyalty, resource_production, strategic_value, historical_importance, dynasty_control, natural_defenses, trade_specialties, unlock_level) VALUES

-- 魏国都城和重要城市
(1001, '洛阳', 'capital', '中原', '河洛', 'plains', 80000, 95, 70, 85,
 JSON_OBJECT('gold', 1000, 'food', 800, 'iron', 300, 'wood', 200),
 10, 'capital', 'wei',
 JSON_OBJECT('river_defense', '洛水', 'mountain_barrier', '熊耳山'),
 JSON_ARRAY('silk', 'porcelain', 'bronze_ware'), 1, 1),

(1002, '邺城', 'prefecture', '河北', '魏郡', 'plains', 45000, 80, 85, 90,
 JSON_OBJECT('gold', 600, 'food', 1200, 'iron', 800, 'wood', 400),
 9, 'capital', 'wei',
 JSON_OBJECT('river_defense', '漳水', 'fortified_walls', true),
 JSON_ARRAY('grain', 'iron_weapons', 'war_horses'), 1, 2),

(1003, '许昌', 'prefecture', '中原', '颍川', 'plains', 35000, 75, 60, 80,
 JSON_OBJECT('gold', 500, 'food', 900, 'iron', 200, 'wood', 300),
 8, 'major', 'wei',
 JSON_OBJECT('strategic_location', '中原腹地'),
 JSON_ARRAY('agricultural_products', 'textiles'), 1, 3),

(1004, '长安', 'capital', '关中', '京兆', 'plains', 70000, 85, 80, 75,
 JSON_OBJECT('gold', 800, 'food', 600, 'iron', 400, 'wood', 500),
 9, 'capital', 'wei',
 JSON_OBJECT('mountain_defense', '秦岭', 'pass_control', '函谷关'),
 JSON_ARRAY('luxury_goods', 'jade', 'horses'), 2, 4),

(1005, '晋阳', 'prefecture', '并州', '太原', 'hills', 30000, 65, 75, 85,
 JSON_OBJECT('gold', 400, 'food', 700, 'iron', 600, 'wood', 800),
 7, 'important', 'wei',
 JSON_OBJECT('mountain_terrain', '太行山脉'),
 JSON_ARRAY('iron_ore', 'coal', 'timber'), 3, 5),

-- 魏国重要关隘和要塞
(1006, '函谷关', 'pass', '关中', '弘农', 'mountain', 3000, 30, 95, 90,
 JSON_OBJECT('gold', 100, 'food', 200, 'iron', 50, 'wood', 100),
 9, 'major', 'wei',
 JSON_OBJECT('natural_fortress', '峡谷地形', 'single_passage', true),
 JSON_ARRAY('toll_collection', 'strategic_control'), 2, 6),

(1007, '潼关', 'pass', '关中', '华阴', 'mountain', 2500, 25, 90, 85,
 JSON_OBJECT('gold', 80, 'food', 150, 'iron', 40, 'wood', 80),
 8, 'important', 'wei',
 JSON_OBJECT('river_mountain_defense', '黄河华山'),
 JSON_ARRAY('border_control', 'military_supplies'), 3, 7),

-- 蜀国城池数据
(2001, '成都', 'capital', '益州', '蜀郡', 'plains', 60000, 90, 65, 95,
 JSON_OBJECT('gold', 700, 'food', 1000, 'iron', 200, 'wood', 600),
 10, 'capital', 'shu',
 JSON_OBJECT('mountain_surrounding', '四川盆地', 'river_network', '岷江水系'),
 JSON_ARRAY('silk', 'tea', 'bamboo_products'), 1, 8),

(2002, '汉中', 'prefecture', '汉中', '汉中郡', 'river', 25000, 70, 80, 90,
 JSON_OBJECT('gold', 300, 'food', 800, 'iron', 300, 'wood', 500),
 9, 'major', 'shu',
 JSON_OBJECT('mountain_valley', '秦岭南坡', 'river_defense', '汉水'),
 JSON_ARRAY('grain', 'medicinal_herbs', 'timber'), 1, 9),

(2003, '剑门关', 'pass', '剑南', '梓潼', 'mountain', 2000, 20, 98, 95,
 JSON_OBJECT('gold', 50, 'food', 100, 'iron', 30, 'wood', 50),
 10, 'major', 'shu',
 JSON_OBJECT('cliff_fortress', '剑门山', 'single_road', '蜀道'),
 JSON_ARRAY('strategic_gateway', 'mountain_defense'), 2, 10),

(2004, '白帝城', 'fortress', '巴郡', '鱼复', 'mountain', 8000, 40, 85, 80,
 JSON_OBJECT('gold', 150, 'food', 300, 'iron', 100, 'wood', 200),
 8, 'important', 'shu',
 JSON_OBJECT('river_fortress', '长江三峡', 'cliff_position', true),
 JSON_ARRAY('river_control', 'eastern_gateway'), 3, 11),

-- 吴国城池数据  
(3001, '建业', 'capital', '扬州', '丹阳', 'river', 55000, 85, 60, 80,
 JSON_OBJECT('gold', 800, 'food', 600, 'iron', 150, 'wood', 400),
 10, 'capital', 'wu',
 JSON_OBJECT('river_defense', '长江天险', 'water_network', '江南水系'),
 JSON_ARRAY('silk', 'tea', 'porcelain', 'shipbuilding'), 1, 12),

(3002, '柴桑', 'prefecture', '江州', '庐江', 'river', 20000, 60, 50, 75,
 JSON_OBJECT('gold', 300, 'food', 500, 'iron', 100, 'wood', 600),
 7, 'important', 'wu',
 JSON_OBJECT('river_port', '长江中游'),
 JSON_ARRAY('shipbuilding', 'fish', 'river_trade'), 2, 13),

(3003, '会稽', 'prefecture', '会稽', '会稽郡', 'coastal', 30000, 75, 40, 85,
 JSON_OBJECT('gold', 500, 'food', 400, 'iron', 80, 'wood', 200),
 6, 'important', 'wu',
 JSON_OBJECT('coastal_advantage', '东海'),
 JSON_ARRAY('sea_salt', 'seafood', 'maritime_trade'), 1, 14),

(3004, '交州', 'prefecture', '岭南', '交趾', 'coastal', 15000, 50, 30, 70,
 JSON_OBJECT('gold', 200, 'food', 300, 'iron', 50, 'wood', 800),
 5, 'minor', 'wu',
 JSON_OBJECT('tropical_climate', '南海边陲'),
 JSON_ARRAY('pearls', 'spices', 'exotic_goods'), 4, 15),

-- 重要关隘和战略要地
(4001, '夷陵', 'fortress', '荆州', '宜都', 'river', 12000, 45, 75, 70,
 JSON_OBJECT('gold', 200, 'food', 400, 'iron', 150, 'wood', 300),
 8, 'major', 'wu',
 JSON_OBJECT('river_gorge', '长江峡谷'),
 JSON_ARRAY('strategic_position', 'river_control'), 3, 16),

(4002, '街亭', 'pass', '天水', '略阳', 'mountain', 1500, 15, 70, 60,
 JSON_OBJECT('gold', 30, 'food', 80, 'iron', 20, 'wood', 40),
 7, 'important', 'neutral',
 JSON_OBJECT('mountain_pass', '陇山要道'),
 JSON_ARRAY('road_control', 'military_supplies'), 4, 17),

(4003, '虎牢关', 'pass', '司隶', '河南', 'hills', 2000, 25, 88, 75,
 JSON_OBJECT('gold', 60, 'food', 120, 'iron', 30, 'wood', 60),
 8, 'important', 'wei',
 JSON_OBJECT('hills_fortress', '虎牢山'),
 JSON_ARRAY('central_plains_control', 'toll_collection'), 2, 18),

(4004, '赤壁', 'fortress', '荆州', '江夏', 'river', 5000, 35, 50, 60,
 JSON_OBJECT('gold', 100, 'food', 200, 'iron', 50, 'wood', 150),
 6, 'important', 'wu',
 JSON_OBJECT('river_battlefield', '长江南岸'),
 JSON_ARRAY('naval_base', 'historical_significance'), 3, 19),

-- 边境城镇和重要据点
(5001, '襄阳', 'prefecture', '荆州', '南郡', 'river', 40000, 70, 65, 75,
 JSON_OBJECT('gold', 400, 'food', 700, 'iron', 200, 'wood', 300),
 8, 'major', 'neutral',
 JSON_OBJECT('river_city', '汉江襄水'),
 JSON_ARRAY('grain', 'iron_goods', 'river_transport'), 2, 20),

(5002, '江陵', 'prefecture', '荆州', '南郡', 'river', 35000, 65, 55, 70,
 JSON_OBJECT('gold', 350, 'food', 600, 'iron', 180, 'wood', 400),
 7, 'important', 'neutral',
 JSON_OBJECT('river_confluence', '长江荆江段'),
 JSON_ARRAY('rice', 'fish', 'river_trade'), 2, 21),

(5003, '合肥', 'fortress', '扬州', '庐江', 'plains', 18000, 50, 80, 65,
 JSON_OBJECT('gold', 200, 'food', 400, 'iron', 250, 'wood', 200),
 7, 'important', 'wei',
 JSON_OBJECT('strategic_position', '淮南要地'),
 JSON_ARRAY('military_supplies', 'border_trade'), 3, 22),

(5004, '陈仓', 'fortress', '关中', '扶风', 'hills', 15000, 45, 75, 80,
 JSON_OBJECT('gold', 180, 'food', 350, 'iron', 200, 'wood', 250),
 6, 'important', 'wei',
 JSON_OBJECT('mountain_approach', '秦岭北坡'),
 JSON_ARRAY('grain_storage', 'mountain_defense'), 4, 23),

(5005, '祁山', 'pass', '天水', '祁山', 'mountain', 1200, 20, 85, 70,
 JSON_OBJECT('gold', 40, 'food', 100, 'iron', 60, 'wood', 80),
 6, 'important', 'neutral',
 JSON_OBJECT('mountain_fortress', '祁山要塞'),
 JSON_ARRAY('strategic_control', 'supply_route'), 5, 24);

-- 显示导入结果
SELECT 'Three Kingdoms Cities Data Imported Successfully!' as status;

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