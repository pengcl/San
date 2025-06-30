-- 三国群英传：卡牌争霸 数据库表结构
-- 创建日期：2024-12-27

-- 创建数据库
DROP DATABASE IF EXISTS sanguo;
CREATE DATABASE sanguo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sanguo;

-- 1. 用户表
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    nickname VARCHAR(50) NOT NULL COMMENT '昵称',
    level INT DEFAULT 1 COMMENT '等级',
    exp INT DEFAULT 0 COMMENT '经验值',
    vip_level INT DEFAULT 0 COMMENT 'VIP等级',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    last_login_time DATETIME COMMENT '最后登录时间',
    status TINYINT DEFAULT 1 COMMENT '状态：0封号 1正常',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_level (level)
) ENGINE=InnoDB COMMENT='用户表';

-- 2. 用户资源表
CREATE TABLE user_resources (
    user_id BIGINT PRIMARY KEY,
    gold BIGINT DEFAULT 0 COMMENT '金币',
    diamond INT DEFAULT 0 COMMENT '钻石',
    stamina INT DEFAULT 120 COMMENT '体力',
    stamina_update_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '体力更新时间',
    arena_coin INT DEFAULT 0 COMMENT '竞技币',
    guild_coin INT DEFAULT 0 COMMENT '军团币',
    friend_point INT DEFAULT 0 COMMENT '友情点',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='用户资源表';

-- 3. 武将配置表
CREATE TABLE heroes (
    hero_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '武将名称',
    quality ENUM('N','R','SR','SSR','UR') NOT NULL COMMENT '品质',
    faction ENUM('wei','shu','wu','qun','han') NOT NULL COMMENT '势力',
    type ENUM('infantry','archer','cavalry') NOT NULL COMMENT '兵种',
    base_attack INT NOT NULL COMMENT '基础攻击力',
    base_defense INT NOT NULL COMMENT '基础防御力',
    base_hp INT NOT NULL COMMENT '基础生命值',
    base_speed INT NOT NULL COMMENT '基础速度',
    skill_ids VARCHAR(255) COMMENT '技能ID列表',
    avatar_url VARCHAR(255) COMMENT '头像URL',
    description TEXT COMMENT '武将描述',
    INDEX idx_quality (quality),
    INDEX idx_faction (faction),
    INDEX idx_type (type)
) ENGINE=InnoDB COMMENT='武将配置表';

-- 4. 用户武将表
CREATE TABLE user_heroes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    hero_id INT NOT NULL,
    level INT DEFAULT 1 COMMENT '等级',
    star INT DEFAULT 1 COMMENT '星级',
    exp INT DEFAULT 0 COMMENT '经验值',
    breakthrough INT DEFAULT 0 COMMENT '突破次数',
    skill_points INT DEFAULT 0 COMMENT '技能点',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (hero_id) REFERENCES heroes(hero_id),
    INDEX idx_user_hero (user_id, hero_id),
    INDEX idx_quality_level (hero_id, level)
) ENGINE=InnoDB COMMENT='用户武将表';

-- 5. 武将技能配置表
CREATE TABLE hero_skills (
    skill_id INT PRIMARY KEY,
    hero_id INT NOT NULL,
    skill_name VARCHAR(50) NOT NULL COMMENT '技能名称',
    skill_type ENUM('normal','active','passive','leader') NOT NULL COMMENT '技能类型',
    max_level INT DEFAULT 10 COMMENT '最大等级',
    description TEXT COMMENT '技能描述',
    effect_data JSON COMMENT '技能效果数据',
    icon_url VARCHAR(255) COMMENT '技能图标URL',
    FOREIGN KEY (hero_id) REFERENCES heroes(hero_id),
    INDEX idx_hero (hero_id),
    INDEX idx_type (skill_type)
) ENGINE=InnoDB COMMENT='武将技能配置表';

-- 6. 用户武将技能表
CREATE TABLE user_hero_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_hero_id BIGINT NOT NULL,
    skill_id INT NOT NULL,
    level INT DEFAULT 1 COMMENT '技能等级',
    skill_tree_points JSON COMMENT '技能树加点分配',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_hero_id) REFERENCES user_heroes(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES hero_skills(skill_id),
    UNIQUE KEY uk_user_hero_skill (user_hero_id, skill_id)
) ENGINE=InnoDB COMMENT='用户武将技能表';

-- 7. 装备配置表
CREATE TABLE equipments (
    equip_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '装备名称',
    type ENUM('weapon','helmet','armor','shoes','accessory','treasure') NOT NULL COMMENT '装备类型',
    quality ENUM('white','green','blue','purple','orange','red') NOT NULL COMMENT '装备品质',
    base_attr JSON COMMENT '基础属性',
    set_id INT DEFAULT 0 COMMENT '套装ID',
    level_required INT DEFAULT 1 COMMENT '需求等级',
    icon_url VARCHAR(255) COMMENT '装备图标URL',
    description TEXT COMMENT '装备描述',
    INDEX idx_type_quality (type, quality),
    INDEX idx_set (set_id),
    INDEX idx_level (level_required)
) ENGINE=InnoDB COMMENT='装备配置表';

-- 8. 用户装备表
CREATE TABLE user_equipments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    equip_id INT NOT NULL,
    level INT DEFAULT 1 COMMENT '装备等级',
    enhance_level INT DEFAULT 0 COMMENT '强化等级',
    extra_attr JSON COMMENT '附加属性',
    hero_id BIGINT DEFAULT 0 COMMENT '装备在哪个武将上',
    position INT DEFAULT 0 COMMENT '装备位置',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (equip_id) REFERENCES equipments(equip_id),
    INDEX idx_user_equip (user_id, equip_id),
    INDEX idx_hero_position (hero_id, position)
) ENGINE=InnoDB COMMENT='用户装备表';

-- 9. 用户队伍表
CREATE TABLE user_teams (
    user_id BIGINT NOT NULL,
    team_type INT NOT NULL COMMENT '队伍类型：1主线 2竞技场防守 3掠夺防守',
    team_data JSON COMMENT '队伍数据',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, team_type),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='用户队伍表';

-- 10. 战斗记录表
CREATE TABLE battle_records (
    battle_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attacker_id BIGINT NOT NULL COMMENT '攻击者ID',
    defender_id BIGINT DEFAULT 0 COMMENT '防守者ID，PVE时为0',
    battle_type ENUM('pve','arena','plunder','guild') NOT NULL COMMENT '战斗类型',
    stage_id INT DEFAULT 0 COMMENT '关卡ID，PVE时使用',
    result TINYINT NOT NULL COMMENT '战斗结果：0失败 1胜利',
    battle_data JSON COMMENT '战斗详情',
    rewards JSON COMMENT '奖励内容',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attacker_id) REFERENCES users(user_id),
    INDEX idx_attacker_time (attacker_id, create_time),
    INDEX idx_defender_time (defender_id, create_time),
    INDEX idx_type_time (battle_type, create_time)
) ENGINE=InnoDB COMMENT='战斗记录表';

-- 11. 关卡配置表
CREATE TABLE stages (
    stage_id INT PRIMARY KEY,
    chapter INT NOT NULL COMMENT '章节',
    stage_num INT NOT NULL COMMENT '关卡号',
    name VARCHAR(50) NOT NULL COMMENT '关卡名称',
    difficulty ENUM('normal','hard','hell') NOT NULL COMMENT '难度',
    stamina_cost INT NOT NULL COMMENT '体力消耗',
    level_required INT DEFAULT 1 COMMENT '需求等级',
    enemy_data JSON COMMENT '敌人配置',
    drop_data JSON COMMENT '掉落配置',
    first_clear_rewards JSON COMMENT '首通奖励',
    INDEX idx_chapter_stage (chapter, stage_num),
    INDEX idx_difficulty (difficulty),
    INDEX idx_level (level_required)
) ENGINE=InnoDB COMMENT='关卡配置表';

-- 12. 用户关卡进度表
CREATE TABLE user_stages (
    user_id BIGINT NOT NULL,
    stage_id INT NOT NULL,
    stars INT DEFAULT 0 COMMENT '星级：0-3星',
    best_score INT DEFAULT 0 COMMENT '最好成绩',
    daily_count INT DEFAULT 0 COMMENT '今日挑战次数',
    last_challenge_time DATE COMMENT '最后挑战日期',
    first_clear_time DATETIME COMMENT '首通时间',
    PRIMARY KEY (user_id, stage_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(stage_id),
    INDEX idx_user_progress (user_id, stage_id),
    INDEX idx_stars (stars)
) ENGINE=InnoDB COMMENT='用户关卡进度表';

-- 13. 军团表
CREATE TABLE guilds (
    guild_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '军团名称',
    leader_id BIGINT NOT NULL COMMENT '团长ID',
    level INT DEFAULT 1 COMMENT '军团等级',
    exp INT DEFAULT 0 COMMENT '军团经验',
    member_count INT DEFAULT 1 COMMENT '成员数量',
    max_members INT DEFAULT 30 COMMENT '最大成员数',
    notice TEXT COMMENT '公告',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(user_id),
    INDEX idx_name (name),
    INDEX idx_level (level)
) ENGINE=InnoDB COMMENT='军团表';

-- 14. 军团成员表
CREATE TABLE guild_members (
    guild_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    position ENUM('leader','vice_leader','member') DEFAULT 'member' COMMENT '职位',
    contribution INT DEFAULT 0 COMMENT '贡献度',
    join_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (guild_id, user_id),
    FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_contribution (contribution DESC)
) ENGINE=InnoDB COMMENT='军团成员表';

-- 15. 好友表
CREATE TABLE friends (
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='好友表';

-- 16. 商城配置表
CREATE TABLE shop_items (
    item_id INT PRIMARY KEY,
    item_type VARCHAR(50) NOT NULL COMMENT '物品类型',
    item_name VARCHAR(100) NOT NULL COMMENT '物品名称',
    item_data JSON COMMENT '物品数据',
    price_type ENUM('gold','diamond','arena_coin','guild_coin') NOT NULL COMMENT '价格类型',
    price INT NOT NULL COMMENT '价格',
    limit_type ENUM('daily','weekly','monthly','none') DEFAULT 'none' COMMENT '限制类型',
    limit_count INT DEFAULT 0 COMMENT '限制次数',
    is_active TINYINT DEFAULT 1 COMMENT '是否启用',
    INDEX idx_type (item_type),
    INDEX idx_price_type (price_type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB COMMENT='商城配置表';

-- 17. 用户购买记录表
CREATE TABLE user_purchases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    item_id INT NOT NULL,
    count INT NOT NULL COMMENT '购买数量',
    total_price INT NOT NULL COMMENT '总价格',
    price_type ENUM('gold','diamond','arena_coin','guild_coin') NOT NULL,
    purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES shop_items(item_id),
    INDEX idx_user_time (user_id, purchase_time),
    INDEX idx_item_time (item_id, purchase_time)
) ENGINE=InnoDB COMMENT='用户购买记录表';

-- 18. 充值记录表
CREATE TABLE recharge_records (
    order_id VARCHAR(64) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL COMMENT '充值金额',
    diamond INT NOT NULL COMMENT '获得钻石',
    bonus_diamond INT DEFAULT 0 COMMENT '额外钻石',
    status ENUM('pending','success','failed') DEFAULT 'pending' COMMENT '状态',
    platform VARCHAR(50) COMMENT '充值平台',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    complete_time DATETIME COMMENT '完成时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user_time (user_id, create_time),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='充值记录表';

-- 19. 用户登录日志表
CREATE TABLE user_login_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    login_ip VARCHAR(45) COMMENT '登录IP',
    device_info VARCHAR(255) COMMENT '设备信息',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_time (user_id, login_time),
    INDEX idx_login_time (login_time)
) ENGINE=InnoDB COMMENT='用户登录日志表';

-- 20. 用户行为日志表
CREATE TABLE user_action_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL COMMENT '行为类型',
    action_data JSON COMMENT '行为数据',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_action (user_id, action_type, create_time),
    INDEX idx_action_time (action_type, create_time)
) ENGINE=InnoDB COMMENT='用户行为日志表';

-- 创建管理员账户
INSERT INTO users (username, password, nickname, level, status) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxIh0Ca11Ew1o.S', '管理员', 100, 1);

-- 初始化管理员资源
INSERT INTO user_resources (user_id, gold, diamond, stamina, arena_coin, guild_coin, friend_point) VALUES 
(1, 9999999, 99999, 999, 99999, 99999, 99999);