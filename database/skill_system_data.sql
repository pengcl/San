-- 技能系统数据
USE sanguo;

-- 创建技能表 (如果不存在)
CREATE TABLE IF NOT EXISTS skills (
    skill_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type ENUM('active', 'passive', 'ultimate') NOT NULL,
    target_type ENUM('self', 'single', 'multiple', 'all_enemies', 'all_allies') NOT NULL,
    cooldown INT DEFAULT 0,
    energy_cost INT DEFAULT 0,
    level_required INT DEFAULT 1,
    effect_data JSON,
    description TEXT,
    icon_url VARCHAR(255),
    INDEX idx_type (type),
    INDEX idx_level (level_required)
);

-- 插入技能数据
INSERT INTO skills (skill_id, name, type, target_type, cooldown, energy_cost, level_required, effect_data, description) VALUES
-- 关羽技能
(1, '青龙偃月', 'active', 'single', 3, 30, 1, '{"damage_multiplier": 1.5, "bleed_chance": 0.3, "bleed_duration": 3}', '关羽挥舞青龙偃月刀，对单个敌人造成150%攻击力伤害，30%概率造成流血效果'),
(2, '武圣之怒', 'ultimate', 'all_enemies', 5, 60, 20, '{"damage_multiplier": 2.0, "ignore_defense": 0.5}', '关羽怒发冲冠，对所有敌人造成200%攻击力伤害，无视50%防御'),
(3, '忠义无双', 'passive', 'self', 0, 0, 10, '{"attack_bonus": 0.15, "crit_rate": 0.1}', '关羽的忠义之心，永久增加15%攻击力和10%暴击率'),

-- 张飞技能
(4, '丈八蛇矛', 'active', 'multiple', 3, 25, 1, '{"damage_multiplier": 1.3, "target_count": 3, "stun_chance": 0.2}', '张飞长矛横扫，对3个敌人造成130%攻击力伤害，20%概率眩晕'),
(5, '燕人咆哮', 'ultimate', 'all_enemies', 6, 70, 25, '{"damage_multiplier": 1.8, "fear_chance": 0.8, "fear_duration": 2}', '张飞怒吼震天，对所有敌人造成180%攻击力伤害，80%概率恐惧2回合'),
(6, '猛将之威', 'passive', 'self', 0, 0, 15, '{"hp_bonus": 0.2, "defense_bonus": 0.15}', '张飞的猛将威势，永久增加20%生命值和15%防御力'),

-- 赵云技能
(7, '龙胆枪法', 'active', 'single', 2, 20, 1, '{"damage_multiplier": 1.4, "crit_rate": 0.5}', '赵云精妙枪法，对单个敌人造成140%攻击力伤害，50%暴击率'),
(8, '七进七出', 'ultimate', 'self', 8, 80, 30, '{"invincible_turns": 2, "damage_multiplier": 2.5, "heal_percent": 0.3}', '赵云如入无人之境，2回合无敌，下次攻击造成250%伤害并恢复30%生命值'),
(9, '龙威天下', 'passive', 'self', 0, 0, 18, '{"speed_bonus": 0.25, "dodge_rate": 0.15}', '赵云如龙一般，永久增加25%速度和15%闪避率'),

-- 诸葛亮技能
(10, '火计', 'active', 'all_enemies', 4, 40, 1, '{"damage_multiplier": 1.2, "burn_chance": 0.6, "burn_duration": 3}', '诸葛亮施展火计，对所有敌人造成120%攻击力伤害，60%概率灼烧3回合'),
(11, '借东风', 'ultimate', 'all_allies', 7, 90, 35, '{"heal_percent": 0.5, "buff_duration": 3, "all_stats_bonus": 0.3}', '诸葛亮借来东风，为所有友军恢复50%生命值，3回合内所有属性+30%'),
(12, '智者千虑', 'passive', 'self', 0, 0, 12, '{"energy_regen": 5, "skill_damage": 0.2}', '诸葛亮智谋无双，每回合额外获得5点能量，技能伤害+20%'),

-- 吕布技能
(13, '天下无双', 'active', 'single', 3, 35, 1, '{"damage_multiplier": 1.8, "armor_break": 0.4}', '吕布展现无双武艺，对单个敌人造成180%攻击力伤害，破甲40%'),
(14, '方天画戟', 'ultimate', 'multiple', 6, 100, 40, '{"damage_multiplier": 3.0, "target_count": 5, "execute_threshold": 0.25}', '吕布方天画戟横扫，对5个敌人造成300%攻击力伤害，对生命值低于25%的敌人直接击杀'),
(15, '飞将之勇', 'passive', 'self', 0, 0, 20, '{"attack_bonus": 0.3, "crit_damage": 0.5}', '吕布勇冠三军，永久增加30%攻击力和50%暴击伤害'),

-- 貂蝉技能
(16, '闭月之舞', 'active', 'all_enemies', 3, 30, 1, '{"charm_chance": 0.4, "charm_duration": 2, "damage_multiplier": 0.8}', '貂蝉施展魅惑之舞，对所有敌人造成80%攻击力伤害，40%概率魅惑2回合'),
(17, '倾国倾城', 'ultimate', 'all_enemies', 8, 120, 45, '{"charm_chance": 0.8, "charm_duration": 3, "damage_reduction": 0.5}', '貂蝉展现绝世美貌，80%概率魅惑所有敌人3回合，己方受到伤害减少50%'),
(18, '红颜祸水', 'passive', 'self', 0, 0, 25, '{"dodge_rate": 0.3, "counter_chance": 0.25}', '貂蝉美貌天成，永久增加30%闪避率，25%概率反击'),

-- 大乔技能
(19, '国色天香', 'active', 'all_allies', 3, 25, 1, '{"heal_percent": 0.25, "buff_duration": 2, "defense_bonus": 0.2}', '大乔治疗所有友军25%生命值，2回合内防御力+20%'),
(20, '江东之花', 'ultimate', 'all_allies', 6, 80, 30, '{"heal_percent": 0.6, "dispel": true, "immunity_duration": 2}', '大乔展现江东美貌，治疗所有友军60%生命值，驱散负面效果并免疫2回合'),
(21, '贤妻良母', 'passive', 'all_allies', 0, 0, 15, '{"heal_bonus": 0.3, "support_range": 1}', '大乔温柔贤淑，治疗效果+30%，邻近友军受到的治疗+50%'),

-- 小乔技能
(22, '天真烂漫', 'active', 'single', 2, 20, 1, '{"damage_multiplier": 1.3, "silence_chance": 0.3, "silence_duration": 2}', '小乔天真一击，对单个敌人造成130%攻击力伤害，30%概率沉默2回合'),
(23, '双剑合璧', 'ultimate', 'all_enemies', 7, 90, 35, '{"damage_multiplier": 2.2, "require_daqiao": true, "bonus_if_both": 1.5}', '小乔与大乔合作，对所有敌人造成220%攻击力伤害，若大乔在场伤害提升50%'),
(24, '双生花语', 'passive', 'self', 0, 0, 18, '{"speed_bonus": 0.2, "energy_bonus": 3, "sister_synergy": true}', '小乔与姐姐心灵相通，永久增加20%速度，每回合获得3点额外能量'),

-- 孙尚香技能  
(25, '弓马娴熟', 'active', 'multiple', 3, 30, 1, '{"damage_multiplier": 1.4, "target_count": 2, "pierce": true}', '孙尚香连射两箭，对2个敌人造成140%攻击力伤害，可穿透防御'),
(26, '江东烈女', 'ultimate', 'self', 5, 60, 28, '{"berserk_duration": 3, "attack_bonus": 0.8, "speed_bonus": 0.5, "hp_drain": 0.1}', '孙尚香进入狂暴状态3回合，攻击力+80%，速度+50%，但每回合失去10%生命值'),
(27, '巾帼英雄', 'passive', 'self', 0, 0, 22, '{"crit_rate": 0.2, "female_bonus": 0.15}', '孙尚香英姿飒爽，永久增加20%暴击率，与女性武将同队时攻击力额外+15%'),

-- 甄姬技能
(28, '洛神赋', 'active', 'all_allies', 4, 35, 1, '{"heal_percent": 0.3, "mana_restore": 10, "buff_duration": 2}', '甄姬如洛神降临，治疗所有友军30%生命值，恢复10点能量，2回合内魔法伤害+25%'),
(29, '倾世容颜', 'ultimate', 'all_enemies', 8, 100, 38, '{"charm_chance": 0.7, "damage_multiplier": 1.5, "beauty_aura": 3}', '甄姬展现绝世容颜，对所有敌人造成150%伤害，70%概率魅惑，3回合内己方全体魅力+50%'),
(30, '才女之智', 'passive', 'self', 0, 0, 20, '{"mana_bonus": 20, "skill_cooldown": -1, "wisdom_bonus": 0.25}', '甄姬才华横溢，永久增加20点最大能量，技能冷却-1回合，智力相关效果+25%');

-- 创建英雄技能关联表
CREATE TABLE IF NOT EXISTS hero_skills (
    hero_id INT,
    skill_id INT,
    unlock_level INT DEFAULT 1,
    max_level INT DEFAULT 10,
    PRIMARY KEY (hero_id, skill_id),
    INDEX idx_hero (hero_id),
    INDEX idx_skill (skill_id)
);

-- 插入英雄技能关联
INSERT INTO hero_skills (hero_id, skill_id, unlock_level, max_level) VALUES
-- 关羽 (hero_id: 1)
(1, 1, 1, 10), (1, 2, 20, 5), (1, 3, 10, 5),
-- 张飞 (hero_id: 2)  
(2, 4, 1, 10), (2, 5, 25, 5), (2, 6, 15, 5),
-- 赵云 (hero_id: 3)
(3, 7, 1, 10), (3, 8, 30, 5), (3, 9, 18, 5),
-- 诸葛亮 (hero_id: 4)
(4, 10, 1, 10), (4, 11, 35, 5), (4, 12, 12, 5),
-- 吕布 (hero_id: 5)
(5, 13, 1, 10), (5, 14, 40, 5), (5, 15, 20, 5),
-- 貂蝉 (hero_id: 6)
(6, 16, 1, 10), (6, 17, 45, 5), (6, 18, 25, 5),
-- 大乔 (hero_id: 7)
(7, 19, 1, 10), (7, 20, 30, 5), (7, 21, 15, 5),
-- 小乔 (hero_id: 8)
(8, 22, 1, 10), (8, 23, 35, 5), (8, 24, 18, 5),
-- 孙尚香 (hero_id: 9)
(9, 25, 1, 10), (9, 26, 28, 5), (9, 27, 22, 5),
-- 甄姬 (hero_id: 10)
(10, 28, 1, 10), (10, 29, 38, 5), (10, 30, 20, 5);