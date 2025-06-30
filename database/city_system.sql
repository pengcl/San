-- ===========================
-- 城池系统数据库设计
-- City System Database Design
-- ===========================

-- 1. 创建城池类型字典表
CREATE TABLE IF NOT EXISTS city_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) UNIQUE DEFAULT (UUID()),
    type_id VARCHAR(20) NOT NULL UNIQUE,
    name_zh VARCHAR(30) NOT NULL,
    name_en VARCHAR(30) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    icon_url VARCHAR(255),
    
    -- 城池特性
    max_buildings INT DEFAULT 20,
    population_capacity INT DEFAULT 10000,
    defensive_bonus DECIMAL(3,2) DEFAULT 0.00,
    economic_bonus DECIMAL(3,2) DEFAULT 0.00,
    
    -- 发展特色
    development_focus ENUM('military', 'economic', 'cultural', 'defensive') NOT NULL,
    special_features JSON,
    terrain_requirements JSON,
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_type_id (type_id),
    INDEX idx_focus (development_focus)
);

-- 插入城池类型数据
INSERT IGNORE INTO city_types (type_id, name_zh, name_en, description, color_hex, max_buildings, population_capacity, defensive_bonus, economic_bonus, development_focus, special_features, terrain_requirements, display_order) VALUES

-- 都城级别
('capital', '都城', 'Capital', '王朝都城，政治经济文化中心，拥有最高等级的建设能力', '#FFD700', 50, 100000, 0.50, 0.50, 'cultural',
 JSON_OBJECT('imperial_palace', true, 'royal_guard', true, 'imperial_academy', true, 'treasury', true),
 JSON_ARRAY('plains', 'river'), 1),

-- 郡城级别  
('prefecture', '郡城', 'Prefecture', '重要的区域中心城市，具备完整的行政和军事功能', '#4169E1', 35, 50000, 0.30, 0.35, 'military',
 JSON_OBJECT('governor_mansion', true, 'regional_army', true, 'tax_office', true),
 JSON_ARRAY('plains', 'hills', 'river'), 2),

-- 县城级别
('county', '县城', 'County', '基础的行政城市，承担地方治理和资源收集职能', '#32CD32', 25, 20000, 0.20, 0.25, 'economic',
 JSON_OBJECT('county_office', true, 'local_market', true, 'militia', true),
 JSON_ARRAY('plains', 'hills', 'coastal'), 3),

-- 军事要塞
('fortress', '要塞', 'Fortress', '专门的军事防御据点，具备强大的防御能力', '#B22222', 20, 5000, 0.80, 0.10, 'military',
 JSON_OBJECT('thick_walls', true, 'watchtowers', true, 'armory', true, 'siege_defense', true),
 JSON_ARRAY('mountain', 'hills'), 4),

-- 关隘
('pass', '关隘', 'Strategic Pass', '控制交通要道的关键据点，易守难攻', '#8B4513', 15, 3000, 1.00, 0.20, 'defensive',
 JSON_OBJECT('narrow_passage', true, 'gate_towers', true, 'chokepoint', true),
 JSON_ARRAY('mountain', 'hills'), 5),

-- 港口城市
('port', '港口', 'Port City', '重要的海上贸易中心，具备强大的商业功能', '#4682B4', 30, 30000, 0.15, 0.60, 'economic',
 JSON_OBJECT('harbor', true, 'shipyard', true, 'lighthouse', true, 'customs', true),
 JSON_ARRAY('coastal'), 6),

-- 边境城镇
('frontier', '边城', 'Frontier Town', '位于边境的城镇，具备一定的军事和贸易功能', '#CD853F', 18, 8000, 0.40, 0.30, 'military',
 JSON_OBJECT('border_post', true, 'trading_post', true, 'scout_towers', true),
 JSON_ARRAY('plains', 'hills', 'desert'), 7);

-- 2. 创建城池配置表
CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) UNIQUE DEFAULT (UUID()),
    city_id INT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    type_id VARCHAR(20) NOT NULL,
    
    -- 地理信息
    region VARCHAR(30) NOT NULL,
    sub_region VARCHAR(30),
    coordinates JSON,
    terrain_type ENUM('plains', 'hills', 'mountain', 'river', 'coastal', 'desert') NOT NULL,
    
    -- 基础属性
    base_population INT DEFAULT 1000,
    base_prosperity INT DEFAULT 100,
    base_defense INT DEFAULT 50,
    base_loyalty INT DEFAULT 80,
    
    -- 资源产出
    resource_production JSON,
    trade_routes JSON,
    strategic_value INT DEFAULT 1,
    
    -- 历史背景
    historical_importance ENUM('capital', 'major', 'important', 'minor') DEFAULT 'minor',
    historical_events JSON,
    famous_residents JSON,
    dynasty_control ENUM('han', 'wei', 'shu', 'wu', 'neutral') DEFAULT 'neutral',
    
    -- 军事信息
    natural_defenses JSON,
    siege_difficulty ENUM('very_easy', 'easy', 'medium', 'hard', 'very_hard') DEFAULT 'medium',
    garrison_capacity INT DEFAULT 1000,
    
    -- 经济信息
    trade_specialties JSON,
    resource_richness ENUM('poor', 'average', 'rich', 'very_rich') DEFAULT 'average',
    tax_efficiency DECIMAL(3,2) DEFAULT 1.00,
    
    -- 系统属性
    unlock_level INT DEFAULT 1,
    unlock_conditions JSON,
    is_capturable BOOLEAN DEFAULT TRUE,
    capture_difficulty INT DEFAULT 5,
    
    -- 文化特色
    cultural_traits JSON,
    local_specialties JSON,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_city_id (city_id),
    INDEX idx_type (type_id),
    INDEX idx_region (region),
    INDEX idx_unlock_level (unlock_level),
    INDEX idx_dynasty (dynasty_control),
    INDEX idx_historical (historical_importance),
    FOREIGN KEY (type_id) REFERENCES city_types(type_id)
);

-- 3. 创建用户城池表
CREATE TABLE IF NOT EXISTS user_cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    city_id INT NOT NULL,
    
    -- 占领信息
    occupation_status ENUM('controlled', 'contested', 'neutral', 'allied', 'enemy') DEFAULT 'neutral',
    control_level DECIMAL(3,2) DEFAULT 0.00,
    occupied_at DATETIME NULL,
    last_battle_at DATETIME NULL,
    
    -- 发展状态
    current_population INT DEFAULT 0,
    current_prosperity INT DEFAULT 0,
    current_defense INT DEFAULT 0,
    current_loyalty INT DEFAULT 0,
    
    -- 资源状态
    stored_resources JSON,
    daily_production JSON,
    tax_rate DECIMAL(3,2) DEFAULT 0.10,
    resource_efficiency DECIMAL(3,2) DEFAULT 1.00,
    
    -- 发展投入
    total_investment BIGINT DEFAULT 0,
    development_focus VARCHAR(20),
    development_level INT DEFAULT 1,
    development_points INT DEFAULT 0,
    
    -- 军事状态
    garrison_strength INT DEFAULT 0,
    defensive_improvements INT DEFAULT 0,
    military_readiness DECIMAL(3,2) DEFAULT 0.50,
    
    -- 民政管理
    administrative_efficiency DECIMAL(3,2) DEFAULT 0.50,
    public_order INT DEFAULT 50,
    infrastructure_level INT DEFAULT 1,
    
    -- 统计数据
    battles_fought INT DEFAULT 0,
    battles_won INT DEFAULT 0,
    total_revenue BIGINT DEFAULT 0,
    governance_score INT DEFAULT 50,
    reputation_score INT DEFAULT 0,
    
    -- 特殊状态
    siege_status ENUM('none', 'under_siege', 'besieging') DEFAULT 'none',
    disaster_status JSON, -- 自然灾害、瘟疫等
    special_events JSON, -- 特殊事件记录
    
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_city_id (city_id),
    INDEX idx_occupation (occupation_status),
    INDEX idx_development (development_level),
    UNIQUE KEY unique_user_city (user_id, city_id),
    FOREIGN KEY (city_id) REFERENCES cities(city_id)
);

-- 4. 创建城池政策表
CREATE TABLE IF NOT EXISTS city_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) UNIQUE DEFAULT (UUID()),
    policy_id VARCHAR(30) NOT NULL UNIQUE,
    name_zh VARCHAR(30) NOT NULL,
    name_en VARCHAR(30) NOT NULL,
    description TEXT,
    
    -- 政策分类
    category ENUM('taxation', 'military', 'trade', 'culture', 'development', 'diplomacy') NOT NULL,
    policy_type ENUM('economic', 'social', 'military', 'diplomatic', 'administrative') NOT NULL,
    sub_type VARCHAR(20),
    
    -- 政策效果
    policy_effects JSON,
    cost_modifiers JSON,
    population_effects JSON,
    loyalty_effects JSON,
    
    -- 实施条件
    min_city_level INT DEFAULT 1,
    min_population INT DEFAULT 1000,
    required_buildings JSON,
    required_technologies JSON,
    unlock_conditions JSON,
    
    -- 维护成本
    implementation_cost JSON,
    daily_maintenance JSON,
    duration_days INT DEFAULT 0, -- 0表示永久
    
    -- 互斥关系
    conflicting_policies JSON,
    prerequisite_policies JSON,
    
    -- 适用性
    applicable_city_types JSON,
    min_governance_level INT DEFAULT 0,
    
    -- 历史背景
    historical_context TEXT,
    dynasty_origin ENUM('han', 'wei', 'shu', 'wu', 'general') DEFAULT 'general',
    
    effectiveness_rating INT DEFAULT 5,
    difficulty_level INT DEFAULT 3,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_policy_id (policy_id),
    INDEX idx_category (category),
    INDEX idx_type (policy_type),
    INDEX idx_dynasty (dynasty_origin)
);

-- 5. 创建用户城池政策表
CREATE TABLE IF NOT EXISTS user_city_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    city_id INT NOT NULL,
    policy_id VARCHAR(30) NOT NULL,
    
    -- 政策状态
    policy_status ENUM('active', 'suspended', 'planning', 'expired') DEFAULT 'active',
    implementation_level DECIMAL(3,2) DEFAULT 1.00,
    efficiency_modifier DECIMAL(3,2) DEFAULT 1.00,
    
    -- 时间信息
    implemented_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    last_review_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- 效果评估
    effectiveness_score DECIMAL(3,2) DEFAULT 0.50,
    popularity_score DECIMAL(3,2) DEFAULT 0.50,
    economic_impact DECIMAL(4,2) DEFAULT 0.00,
    
    -- 成本追踪
    total_cost_spent BIGINT DEFAULT 0,
    daily_cost BIGINT DEFAULT 0,
    roi_score DECIMAL(4,2) DEFAULT 0.00,
    
    -- 反馈数据
    citizen_approval DECIMAL(3,2) DEFAULT 0.50,
    administrative_burden INT DEFAULT 0,
    unintended_consequences JSON,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_city (user_id, city_id),
    INDEX idx_policy (policy_id),
    INDEX idx_status (policy_status),
    INDEX idx_implemented (implemented_at),
    UNIQUE KEY unique_user_city_policy (user_id, city_id, policy_id),
    FOREIGN KEY (city_id) REFERENCES cities(city_id),
    FOREIGN KEY (policy_id) REFERENCES city_policies(policy_id)
);

-- 6. 创建城池发展路线表
CREATE TABLE IF NOT EXISTS city_development_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) UNIQUE DEFAULT (UUID()),
    path_id VARCHAR(30) NOT NULL UNIQUE,
    name_zh VARCHAR(30) NOT NULL,
    name_en VARCHAR(30) NOT NULL,
    description TEXT,
    
    -- 发展方向
    development_type ENUM('military_fortress', 'trade_hub', 'cultural_center', 'resource_base', 'defensive_stronghold') NOT NULL,
    specialization_focus VARCHAR(30),
    
    -- 里程碑建筑
    milestone_buildings JSON, -- 关键建筑序列
    development_stages JSON, -- 发展阶段描述
    stage_requirements JSON, -- 各阶段要求
    
    -- 收益模式
    primary_benefits JSON,
    secondary_benefits JSON,
    late_game_bonuses JSON,
    unique_abilities JSON,
    
    -- 投资需求
    total_investment_estimate BIGINT,
    time_investment_estimate INT, -- 天数
    resource_requirements JSON,
    
    -- 推荐条件
    recommended_for JSON, -- 适合的玩家类型、城池类型等
    optimal_city_types JSON,
    synergy_cities JSON, -- 协同发展的城池
    
    -- 风险与挑战
    development_risks JSON,
    maintenance_challenges JSON,
    vulnerability_factors JSON,
    
    -- 策略指导
    early_priorities JSON,
    mid_game_focus JSON,
    late_game_objectives JSON,
    
    -- 历史参考
    historical_examples JSON,
    famous_implementations JSON,
    
    success_rate DECIMAL(3,2) DEFAULT 0.70,
    difficulty_rating INT DEFAULT 5,
    popularity_score DECIMAL(3,2) DEFAULT 0.50,
    
    strategy_guide TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_path_id (path_id),
    INDEX idx_development_type (development_type),
    INDEX idx_difficulty (difficulty_rating)
);

-- 显示创建结果
SELECT 'City System Database Structure Created Successfully!' as status;

-- 统计城池系统数据结构
SELECT 
    'City Types' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM city_types WHERE is_active = TRUE

UNION ALL

SELECT 
    'City Policies Categories' as category,
    COUNT(DISTINCT category) as count,
    GROUP_CONCAT(DISTINCT category) as items
FROM city_policies WHERE is_active = TRUE

UNION ALL

SELECT 
    'Development Paths' as category,
    COUNT(*) as count,
    GROUP_CONCAT(name_zh ORDER BY display_order) as items
FROM city_development_paths WHERE is_active = TRUE;