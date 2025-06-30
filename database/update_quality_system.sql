-- 更新品质系统为字典格式
USE sanguo;

-- 标准游戏品质字典
-- 1 = 白色 (普通)
-- 2 = 绿色 (优秀) 
-- 3 = 蓝色 (稀有)
-- 4 = 紫色 (史诗)
-- 5 = 橙色 (传说)
-- 6 = 红色 (神话)

-- 更新武将品质为数字格式
UPDATE heroes SET quality = '1' WHERE quality = 'N';    -- 白色(普通)
UPDATE heroes SET quality = '2' WHERE quality = 'R';    -- 绿色(优秀)  
UPDATE heroes SET quality = '3' WHERE quality = 'SR';   -- 蓝色(稀有)
UPDATE heroes SET quality = '4' WHERE quality = 'SSR';  -- 紫色(史诗)
UPDATE heroes SET quality = '5' WHERE quality = 'UR';   -- 橙色(传说)

-- 为了更好的体验，我们也可以添加红色品质(神话级)
-- 给最顶级的几个武将设置红色品质
UPDATE heroes SET quality = '6' WHERE hero_id IN (1002, 2001, 4001); -- 诸葛亮、曹操、吕布升级为神话级

-- 更新装备品质为数字格式
UPDATE equipments SET quality = '1' WHERE quality = 'white';   -- 白色
UPDATE equipments SET quality = '2' WHERE quality = 'green';   -- 绿色
UPDATE equipments SET quality = '3' WHERE quality = 'blue';    -- 蓝色  
UPDATE equipments SET quality = '4' WHERE quality = 'purple';  -- 紫色
UPDATE equipments SET quality = '5' WHERE quality = 'orange';  -- 橙色
UPDATE equipments SET quality = '6' WHERE quality = 'red';     -- 红色

-- 创建品质配置表来存储品质字典
CREATE TABLE IF NOT EXISTS quality_config (
    quality_id INT PRIMARY KEY,
    name_zh VARCHAR(20) NOT NULL COMMENT '中文名称',
    name_en VARCHAR(20) NOT NULL COMMENT '英文名称', 
    color_hex VARCHAR(7) NOT NULL COMMENT '颜色代码',
    star_count INT NOT NULL COMMENT '星级数量',
    rarity_weight DECIMAL(3,2) NOT NULL COMMENT '稀有度权重(0.01-1.00)',
    description TEXT COMMENT '品质描述'
);

-- 插入品质配置数据
INSERT INTO quality_config (quality_id, name_zh, name_en, color_hex, star_count, rarity_weight, description) VALUES
(1, '普通', 'Normal', '#9E9E9E', 1, 1.00, '最基础的品质，容易获得，适合新手培养'),
(2, '优秀', 'Rare', '#4CAF50', 2, 0.60, '较为常见的优秀品质，属性有一定提升'),
(3, '稀有', 'Elite', '#2196F3', 3, 0.35, '稀有品质，具有不错的战斗能力'),
(4, '史诗', 'Epic', '#9C27B0', 4, 0.15, '史诗品质，拥有强大的技能和属性'),
(5, '传说', 'Legendary', '#FF9800', 5, 0.05, '传说品质，历史名将，能力卓越'),
(6, '神话', 'Mythic', '#F44336', 6, 0.01, '神话品质，绝世无双，万中无一');

-- 创建品质效果配置表
CREATE TABLE IF NOT EXISTS quality_effects (
    quality_id INT,
    effect_type ENUM('attribute', 'skill', 'special') NOT NULL,
    effect_name VARCHAR(50) NOT NULL,
    effect_value DECIMAL(4,2) NOT NULL,
    description TEXT,
    PRIMARY KEY (quality_id, effect_type, effect_name),
    FOREIGN KEY (quality_id) REFERENCES quality_config(quality_id)
);

-- 插入品质效果数据
INSERT INTO quality_effects (quality_id, effect_type, effect_name, effect_value, description) VALUES
-- 普通品质效果
(1, 'attribute', 'base_multiplier', 1.00, '基础属性倍率'),
(1, 'skill', 'skill_slots', 1.00, '技能槽位数量'),

-- 优秀品质效果  
(2, 'attribute', 'base_multiplier', 1.20, '基础属性倍率+20%'),
(2, 'skill', 'skill_slots', 2.00, '技能槽位数量+1'),
(2, 'special', 'exp_bonus', 1.05, '经验获得+5%'),

-- 稀有品质效果
(3, 'attribute', 'base_multiplier', 1.40, '基础属性倍率+40%'),
(3, 'skill', 'skill_slots', 3.00, '技能槽位数量+2'),
(3, 'special', 'exp_bonus', 1.10, '经验获得+10%'),
(3, 'special', 'crit_rate', 1.05, '暴击率+5%'),

-- 史诗品质效果
(4, 'attribute', 'base_multiplier', 1.70, '基础属性倍率+70%'),
(4, 'skill', 'skill_slots', 4.00, '技能槽位数量+3'),
(4, 'special', 'exp_bonus', 1.15, '经验获得+15%'),
(4, 'special', 'crit_rate', 1.10, '暴击率+10%'),
(4, 'special', 'skill_damage', 1.10, '技能伤害+10%'),

-- 传说品质效果
(5, 'attribute', 'base_multiplier', 2.00, '基础属性倍率+100%'),
(5, 'skill', 'skill_slots', 5.00, '技能槽位数量+4'),
(5, 'special', 'exp_bonus', 1.25, '经验获得+25%'),
(5, 'special', 'crit_rate', 1.15, '暴击率+15%'),
(5, 'special', 'skill_damage', 1.20, '技能伤害+20%'),
(5, 'special', 'unique_skill', 1.00, '解锁专属技能'),

-- 神话品质效果
(6, 'attribute', 'base_multiplier', 2.50, '基础属性倍率+150%'),
(6, 'skill', 'skill_slots', 6.00, '技能槽位数量+5'),
(6, 'special', 'exp_bonus', 1.35, '经验获得+35%'),
(6, 'special', 'crit_rate', 1.25, '暴击率+25%'),
(6, 'special', 'skill_damage', 1.35, '技能伤害+35%'),
(6, 'special', 'unique_skill', 1.00, '解锁专属技能'),
(6, 'special', 'divine_aura', 1.00, '神话光环效果'),
(6, 'special', 'team_bonus', 1.15, '队伍加成+15%');

-- 验证更新结果
SELECT '=== 武将品质分布 ===' as info;
SELECT 
    qc.name_zh as 品质名称,
    qc.name_en as 英文名称,
    qc.color_hex as 颜色代码,
    qc.star_count as 星级,
    COUNT(h.hero_id) as 武将数量,
    CONCAT(ROUND(qc.rarity_weight * 100, 1), '%') as 稀有度
FROM quality_config qc
LEFT JOIN heroes h ON qc.quality_id = h.quality
GROUP BY qc.quality_id, qc.name_zh, qc.name_en, qc.color_hex, qc.star_count, qc.rarity_weight
ORDER BY qc.quality_id;

SELECT '=== 装备品质分布 ===' as info;
SELECT 
    qc.name_zh as 品质名称,
    COUNT(e.equip_id) as 装备数量
FROM quality_config qc
LEFT JOIN equipments e ON qc.quality_id = e.quality
GROUP BY qc.quality_id, qc.name_zh
ORDER BY qc.quality_id;