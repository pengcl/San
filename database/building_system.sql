-- ===========================
-- 建筑系统数据库设计
-- Building System Database Design
-- ===========================

-- 1. 创建建筑类型字典表
CREATE TABLE IF NOT EXISTS building_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) UNIQUE DEFAULT (UUID()),
    type_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(30) NOT NULL,
    name_en VARCHAR(30) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    icon_url VARCHAR(255),
    
    -- 建筑分类
    category ENUM('military', 'economic', 'administrative', 'cultural', 'defensive', 'special') NOT NULL,
    sub_category VARCHAR(20),
    building_class ENUM('essential', 'advanced', 'luxury', 'unique') DEFAULT 'essential',
    
    -- 功能特性
    primary_function VARCHAR(50) NOT NULL,
    secondary_functions JSON,
    resource_effects JSON,
    population_effects JSON,
    
    -- 建设要求
    terrain_requirements JSON,
    prerequisite_buildings JSON,
    prerequisite_technologies JSON,
    max_per_city INT DEFAULT 1,
    requires_adjacent_to JSON, -- 需要邻接的建筑
    
    -- 空间要求
    grid_size JSON, -- {"width": 2, "height": 2}
    space_requirement INT DEFAULT 1,
    can_expand BOOLEAN DEFAULT FALSE,
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_type_id (type_id),
    INDEX idx_category (category),
    INDEX idx_class (building_class)
);

-- 插入建筑类型数据
INSERT IGNORE INTO building_types (type_id, name_zh, name_en, description, color_hex, category, sub_category, building_class, primary_function, secondary_functions, resource_effects, terrain_requirements, max_per_city, display_order) VALUES

-- 行政建筑
('government_office', '衙门', 'Government Office', '城池的行政中心，处理政务和法律事务', '#4169E1', 'administrative', 'government', 'essential',
 'city_administration', JSON_ARRAY('tax_collection', 'law_enforcement', 'policy_implementation'),
 JSON_OBJECT('administrative_efficiency', 0.20, 'tax_rate', 0.15), JSON_ARRAY('plains', 'hills'), 1, 1),

('city_hall', '市政厅', 'City Hall', '更高级的行政建筑，提升城池管理效率', '#1E90FF', 'administrative', 'government', 'advanced',
 'advanced_administration', JSON_ARRAY('urban_planning', 'public_services', 'bureaucracy'),
 JSON_OBJECT('administrative_efficiency', 0.35, 'public_order', 0.25), JSON_ARRAY('plains'), 1, 2),

-- 军事建筑
('barracks', '校场', 'Barracks', '训练士兵的军事设施，提升军队战斗力', '#B22222', 'military', 'training', 'essential',
 'troop_training', JSON_ARRAY('recruit_soldiers', 'military_drills', 'weapon_training'),
 JSON_OBJECT('military_training_speed', 0.30, 'troop_morale', 0.20), JSON_ARRAY('plains', 'hills'), 3, 3),

('armory', '军械库', 'Armory', '储存和制造武器装备的设施', '#8B0000', 'military', 'equipment', 'advanced',
 'weapon_storage', JSON_ARRAY('weapon_production', 'equipment_maintenance', 'siege_engines'),
 JSON_OBJECT('equipment_quality', 0.25, 'weapon_production_rate', 0.40), JSON_ARRAY('plains', 'hills'), 2, 4),

('watchtower', '瞭望塔', 'Watchtower', '侦查敌情和预警的防御建筑', '#CD853F', 'defensive', 'surveillance', 'essential',
 'surveillance', JSON_ARRAY('early_warning', 'scouting', 'communication'),
 JSON_OBJECT('detection_range', 0.50, 'defense_bonus', 0.15), JSON_ARRAY('hills', 'mountain'), 5, 5),

('city_walls', '城墙', 'City Walls', '保护城池的基础防御设施', '#696969', 'defensive', 'fortification', 'essential',
 'city_defense', JSON_ARRAY('siege_resistance', 'border_control', 'symbolic_power'),
 JSON_OBJECT('defense_rating', 0.60, 'siege_resistance', 0.40), JSON_ARRAY('plains', 'hills', 'mountain'), 1, 6),

-- 经济建筑
('market', '市集', 'Market', '商品交易的中心，促进经济发展', '#32CD32', 'economic', 'commerce', 'essential',
 'trade_commerce', JSON_ARRAY('resource_trading', 'price_discovery', 'merchant_activities'),
 JSON_OBJECT('trade_income', 0.30, 'resource_circulation', 0.25), JSON_ARRAY('plains', 'coastal'), 2, 7),

('granary', '粮仓', 'Granary', '储存粮食的重要设施，保障城池食物供应', '#DAA520', 'economic', 'storage', 'essential',
 'food_storage', JSON_ARRAY('famine_prevention', 'price_stabilization', 'emergency_reserves'),
 JSON_OBJECT('food_security', 0.40, 'population_growth', 0.20), JSON_ARRAY('plains', 'river'), 3, 8),

('blacksmith', '铁匠铺', 'Blacksmith', '制造和修理武器装备的手工业设施', '#FF4500', 'economic', 'crafting', 'essential',
 'equipment_crafting', JSON_ARRAY('weapon_forging', 'tool_making', 'equipment_repair'),
 JSON_OBJECT('equipment_production', 0.35, 'repair_efficiency', 0.30), JSON_ARRAY('plains', 'hills'), 2, 9),

('mint', '钱庄', 'Mint', '货币制造和金融服务的设施', '#FFD700', 'economic', 'finance', 'advanced',
 'currency_finance', JSON_ARRAY('money_minting', 'banking_services', 'trade_financing'),
 JSON_OBJECT('gold_income', 0.25, 'trade_efficiency', 0.20), JSON_ARRAY('plains'), 1, 10),

-- 文化建筑
('tavern', '酒肆', 'Tavern', '提供娱乐和信息交流的场所，可招募武将', '#8B4513', 'cultural', 'entertainment', 'essential',
 'entertainment_info', JSON_ARRAY('hero_recruitment', 'information_gathering', 'morale_boost'),
 JSON_OBJECT('hero_recruitment_rate', 0.20, 'information_access', 0.30), JSON_ARRAY('plains', 'coastal'), 3, 11),

('academy', '学堂', 'Academy', '教育和研究的中心，提升科技发展', '#4B0082', 'cultural', 'education', 'advanced',
 'education_research', JSON_ARRAY('technology_research', 'talent_cultivation', 'knowledge_preservation'),
 JSON_OBJECT('research_speed', 0.40, 'hero_experience_gain', 0.25), JSON_ARRAY('plains'), 1, 12),

('temple', '庙宇', 'Temple', '宗教和精神信仰的场所，提升民心和忠诚', '#9370DB', 'cultural', 'religion', 'essential',
 'religious_spiritual', JSON_ARRAY('loyalty_boost', 'spiritual_healing', 'cultural_unity'),
 JSON_OBJECT('loyalty_bonus', 0.30, 'unrest_reduction', 0.25), JSON_ARRAY('plains', 'hills'), 2, 13),

('library', '藏书楼', 'Library', '知识储存和学术研究的高级文化建筑', '#663399', 'cultural', 'knowledge', 'luxury',
 'knowledge_preservation', JSON_ARRAY('ancient_wisdom', 'strategy_research', 'cultural_development'),
 JSON_OBJECT('strategy_effectiveness', 0.20, 'research_bonus', 0.30), JSON_ARRAY('plains'), 1, 14),

-- 特殊建筑
('embassy', '使馆', 'Embassy', '外交活动的场所，处理对外关系', '#2E8B57', 'special', 'diplomacy', 'advanced',
 'diplomatic_relations', JSON_ARRAY('alliance_negotiation', 'trade_agreements', 'intelligence_exchange'),
 JSON_OBJECT('diplomacy_effectiveness', 0.35, 'trade_route_access', 0.25), JSON_ARRAY('plains', 'coastal'), 1, 15),

('port_facility', '港口设施', 'Port Facility', '海上贸易和军事的综合设施', '#4682B4', 'special', 'maritime', 'essential',
 'maritime_operations', JSON_ARRAY('naval_base', 'sea_trade', 'fishing_fleet'),
 JSON_OBJECT('naval_capacity', 0.50, 'maritime_trade', 0.40), JSON_ARRAY('coastal'), 1, 16),

('workshop', '工坊', 'Workshop', '手工业生产的专业设施', '#D2691E', 'economic', 'manufacturing', 'advanced',
 'specialized_production', JSON_ARRAY('luxury_goods', 'specialized_tools', 'artisan_training'),
 JSON_OBJECT('production_quality', 0.30, 'artisan_skill', 0.25), JSON_ARRAY('plains', 'hills'), 3, 17);

-- 2. 创建建筑配置表
CREATE TABLE IF NOT EXISTS buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) UNIQUE DEFAULT (UUID()),
    building_id INT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    type_id VARCHAR(20) NOT NULL,
    
    -- 建筑等级系统
    max_level INT DEFAULT 10,
    level_bonuses JSON,
    upgrade_costs JSON,
    upgrade_time_base INT DEFAULT 3600, -- 秒
    upgrade_requirements JSON,
    
    -- 基础效果
    base_effects JSON,
    passive_bonuses JSON,
    active_abilities JSON,
    level_scaling JSON, -- 等级成长系数
    
    -- 建设成本
    construction_cost JSON,
    construction_time INT DEFAULT 1800, -- 秒
    construction_requirements JSON,
    
    -- 维护成本
    maintenance_cost JSON,
    operating_cost JSON,
    efficiency_factors JSON,
    
    -- 资源相关
    resource_production JSON,
    resource_consumption JSON,
    storage_capacity JSON,
    population_requirement INT DEFAULT 100,
    
    -- 军事相关
    garrison_capacity INT DEFAULT 0,
    defensive_value INT DEFAULT 0,
    training_capabilities JSON,
    military_bonuses JSON,
    
    -- 功能特性
    special_functions JSON,
    interaction_options JSON,
    automation_level ENUM('manual', 'semi_auto', 'full_auto') DEFAULT 'manual',
    
    -- 环境影响
    environment_effects JSON,
    adjacency_bonuses JSON,
    pollution_level INT DEFAULT 0,
    
    -- 解锁条件
    unlock_level INT DEFAULT 1,
    unlock_conditions JSON,
    prerequisite_tech JSON,
    prerequisite_buildings JSON,
    
    -- 历史文化
    historical_reference TEXT,
    cultural_significance TEXT,
    dynasty_origin ENUM('han', 'wei', 'shu', 'wu', 'general') DEFAULT 'general',
    
    -- 系统属性
    rarity_level ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
    build_priority INT DEFAULT 5,
    ai_preference_score DECIMAL(3,2) DEFAULT 0.50,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_building_id (building_id),
    INDEX idx_type (type_id),
    INDEX idx_unlock_level (unlock_level),
    INDEX idx_rarity (rarity_level),
    INDEX idx_dynasty (dynasty_origin),
    FOREIGN KEY (type_id) REFERENCES building_types(type_id)
);

-- 3. 创建用户建筑表
CREATE TABLE IF NOT EXISTS user_buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    city_id INT NOT NULL,
    building_id INT NOT NULL,
    
    -- 建筑状态
    current_level INT DEFAULT 1,
    construction_status ENUM('planning', 'building', 'completed', 'upgrading', 'damaged', 'destroyed', 'abandoned') DEFAULT 'completed',
    construction_started_at DATETIME NULL,
    completion_time DATETIME NULL,
    last_upgrade_at DATETIME NULL,
    
    -- 位置信息
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    slot_id INT,
    grid_position JSON, -- 对于占用多格的建筑
    orientation ENUM('north', 'east', 'south', 'west') DEFAULT 'north',
    
    -- 运营状态
    is_active BOOLEAN DEFAULT TRUE,
    efficiency_rate DECIMAL(3,2) DEFAULT 1.00,
    maintenance_status ENUM('excellent', 'good', 'fair', 'poor', 'critical') DEFAULT 'good',
    automation_enabled BOOLEAN DEFAULT FALSE,
    
    -- 工作人员
    worker_count INT DEFAULT 0,
    max_workers INT DEFAULT 0,
    worker_efficiency DECIMAL(3,2) DEFAULT 1.00,
    specialist_assigned JSON, -- 分配的专家或武将
    
    -- 军事相关（仅军事建筑）
    garrison_troops JSON,
    commander_hero_id INT DEFAULT 0,
    defensive_modifications JSON,
    siege_damage INT DEFAULT 0,
    
    -- 生产状态（仅经济建筑）
    production_rate DECIMAL(4,2) DEFAULT 1.00,
    last_collection_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    accumulated_resources JSON,
    production_queue JSON,
    
    -- 研究/训练状态（仅相关建筑）
    current_research JSON,
    research_progress DECIMAL(3,2) DEFAULT 0.00,
    training_queue JSON,
    completed_projects JSON,
    
    -- 商业状态（仅商业建筑）
    trade_partnerships JSON,
    inventory_status JSON,
    customer_satisfaction DECIMAL(3,2) DEFAULT 0.50,
    daily_visitors INT DEFAULT 0,
    
    -- 升级历史
    upgrade_history JSON,
    total_investment BIGINT DEFAULT 0,
    total_maintenance_paid BIGINT DEFAULT 0,
    
    -- 特殊状态
    special_events JSON,
    temporary_bonuses JSON,
    status_effects JSON,
    
    -- 绩效统计
    lifetime_production JSON,
    efficiency_history JSON,
    contribution_score INT DEFAULT 0,
    
    -- 自定义
    custom_name VARCHAR(100),
    custom_description TEXT,
    decoration_level INT DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_city (user_id, city_id),
    INDEX idx_building_id (building_id),
    INDEX idx_status (construction_status),
    INDEX idx_position (position_x, position_y),
    INDEX idx_level (current_level),
    INDEX idx_commander (commander_hero_id),
    UNIQUE KEY unique_city_position (city_id, position_x, position_y),
    FOREIGN KEY (building_id) REFERENCES buildings(building_id),
    FOREIGN KEY (city_id) REFERENCES cities(city_id)
);

-- 4. 创建建筑协同效果表
CREATE TABLE IF NOT EXISTS building_synergies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) UNIQUE DEFAULT (UUID()),
    synergy_id VARCHAR(30) NOT NULL UNIQUE,
    name_zh VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- 触发条件
    synergy_type ENUM('adjacency', 'collection', 'functional', 'level_based', 'special') NOT NULL,
    required_buildings JSON, -- [{"building_id": 1001, "min_level": 3, "count": 2}]
    proximity_requirement INT DEFAULT 0, -- 0=同城即可，>0=需要相邻格数
    level_requirements JSON,
    
    -- 协同效果
    synergy_effects JSON,
    bonus_multiplier DECIMAL(4,2) DEFAULT 1.00,
    effect_scaling JSON, -- 效果随等级/数量的变化
    stacking_rules ENUM('no_stack', 'additive', 'multiplicative', 'diminishing') DEFAULT 'additive',
    
    -- 适用范围
    city_scope ENUM('same_city', 'adjacent_cities', 'same_region', 'global') DEFAULT 'same_city',
    max_range INT DEFAULT 0,
    
    -- 条件限制
    terrain_requirements JSON,
    season_effects JSON,
    time_of_day_effects JSON,
    
    -- 成本和维护
    activation_cost JSON,
    maintenance_modifier DECIMAL(3,2) DEFAULT 1.00,
    
    -- 视觉效果
    visual_indicators JSON,
    audio_cues JSON,
    animation_effects JSON,
    
    -- 历史背景
    historical_basis TEXT,
    cultural_context TEXT,
    
    -- 系统属性
    discovery_chance DECIMAL(3,2) DEFAULT 1.00, -- 自动发现的概率
    player_visible BOOLEAN DEFAULT TRUE,
    activation_method ENUM('automatic', 'manual', 'research_required') DEFAULT 'automatic',
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_synergy_id (synergy_id),
    INDEX idx_type (synergy_type),
    INDEX idx_scope (city_scope)
);

-- 5. 创建城池-武将任职关系表
CREATE TABLE IF NOT EXISTS city_hero_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    city_id INT NOT NULL,
    user_hero_id INT NOT NULL,
    
    -- 任职信息
    assignment_type ENUM('governor', 'commander', 'advisor', 'garrison', 'administrator', 'diplomat', 'merchant') NOT NULL,
    assignment_level INT DEFAULT 1,
    position_title VARCHAR(50),
    
    -- 权限和职责
    authority_level ENUM('limited', 'moderate', 'extensive', 'full') DEFAULT 'moderate',
    responsibilities JSON,
    decision_powers JSON,
    
    -- 效果加成
    governance_bonus DECIMAL(3,2) DEFAULT 0.00,
    military_bonus DECIMAL(3,2) DEFAULT 0.00,
    economic_bonus DECIMAL(3,2) DEFAULT 0.00,
    cultural_bonus DECIMAL(3,2) DEFAULT 0.00,
    diplomatic_bonus DECIMAL(3,2) DEFAULT 0.00,
    
    -- 任期管理
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    term_duration INT DEFAULT 0, -- 0=无限期，单位天
    expected_end_date DATETIME NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    
    -- 绩效评估
    performance_score DECIMAL(3,2) DEFAULT 0.50,
    achievement_bonuses JSON,
    failure_penalties JSON,
    citizen_approval DECIMAL(3,2) DEFAULT 0.50,
    
    -- 报酬和激励
    salary_amount BIGINT DEFAULT 0,
    bonus_payments JSON,
    special_privileges JSON,
    retirement_benefits JSON,
    
    -- 工作状态
    current_tasks JSON,
    completed_projects JSON,
    ongoing_initiatives JSON,
    work_efficiency DECIMAL(3,2) DEFAULT 1.00,
    
    -- 关系网络
    political_connections JSON,
    business_relationships JSON,
    military_alliances JSON,
    
    -- 历史记录
    previous_assignments JSON,
    career_progression JSON,
    notable_achievements JSON,
    disciplinary_actions JSON,
    
    -- 特殊状态
    loyalty_level DECIMAL(3,2) DEFAULT 0.80,
    corruption_risk DECIMAL(3,2) DEFAULT 0.10,
    rebellion_threat DECIMAL(3,2) DEFAULT 0.05,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_city (user_id, city_id),
    INDEX idx_hero (user_hero_id),
    INDEX idx_assignment_type (assignment_type),
    INDEX idx_performance (performance_score),
    INDEX idx_loyalty (loyalty_level),
    UNIQUE KEY unique_hero_assignment (user_hero_id, assignment_type),
    FOREIGN KEY (city_id) REFERENCES cities(city_id)
);

-- 显示创建结果
SELECT 'Building System Database Structure Created Successfully!' as status;

-- 统计建筑系统数据结构
SELECT 
    'Building Types' as category,
    COUNT(*) as count,
    SUBSTRING(GROUP_CONCAT(name_zh ORDER BY display_order), 1, 200) as items
FROM building_types WHERE is_active = TRUE

UNION ALL

SELECT 
    'Building Categories' as category,
    COUNT(DISTINCT category) as count,
    GROUP_CONCAT(DISTINCT category) as items
FROM building_types WHERE is_active = TRUE

UNION ALL

SELECT 
    'Assignment Types' as category,
    COUNT(DISTINCT assignment_type) as count,
    GROUP_CONCAT(DISTINCT assignment_type) as items
FROM city_hero_assignments WHERE is_active = TRUE;