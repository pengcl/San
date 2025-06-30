-- ===========================
-- 技能系统数据
-- Skills System Data
-- ===========================

-- 插入基础技能数据
INSERT IGNORE INTO skills (skill_id, name, name_en, description, skill_type, damage_type, target_type, cooldown, cost, base_damage, damage_scaling, effects, unlock_level, max_level, is_active) VALUES

-- 物理攻击技能
(1001, '破军斩', 'Army Breaking Slash', '强力的单体物理攻击，造成{damage}点伤害', 'active', 'physical', 'single', 3, 20, 150, 1.2, 
 JSON_OBJECT('damage', 150, 'crit_bonus', 0.2), 1, 10, 1),

(1002, '连环击', 'Chain Strike', '连续攻击多个敌人，每次攻击造成{damage}点伤害', 'active', 'physical', 'multiple', 4, 30, 100, 1.0,
 JSON_OBJECT('damage', 100, 'hit_count', 3, 'damage_reduction', 0.1), 5, 10, 1),

(1003, '致命一击', 'Critical Strike', '必定暴击的强力攻击，造成{damage}点伤害', 'active', 'physical', 'single', 5, 35, 120, 1.5,
 JSON_OBJECT('damage', 120, 'crit_rate', 1.0, 'crit_damage', 2.0), 10, 10, 1),

-- 法术攻击技能
(2001, '火球术', 'Fireball', '发射火球攻击敌人，造成{damage}点火焰伤害', 'active', 'magical', 'single', 2, 25, 130, 1.1,
 JSON_OBJECT('damage', 130, 'burn_chance', 0.3, 'burn_damage', 20), 1, 10, 1),

(2002, '冰霜新星', 'Frost Nova', '冰霜爆炸攻击所有敌人，造成{damage}点伤害并减速', 'active', 'magical', 'all_enemies', 6, 50, 80, 0.9,
 JSON_OBJECT('damage', 80, 'slow_duration', 2, 'slow_effect', 0.3), 8, 10, 1),

(2003, '雷电链', 'Chain Lightning', '雷电在敌人间跳跃，造成递减伤害', 'active', 'magical', 'multiple', 4, 40, 110, 1.0,
 JSON_OBJECT('damage', 110, 'jump_count', 4, 'damage_decay', 0.2), 12, 10, 1),

-- 治疗技能
(3001, '治疗术', 'Heal', '恢复友军{heal}点生命值', 'active', 'healing', 'single', 1, 20, 100, 1.0,
 JSON_OBJECT('heal', 100, 'bonus_healing', 0.1), 1, 10, 1),

(3002, '群体治疗', 'Mass Heal', '恢复所有友军{heal}点生命值', 'active', 'healing', 'all_allies', 4, 60, 60, 0.8,
 JSON_OBJECT('heal', 60, 'bonus_healing', 0.05), 15, 10, 1),

(3003, '再生术', 'Regeneration', '为目标施加持续治疗效果，每回合恢复{heal}点生命', 'active', 'healing', 'single', 3, 30, 40, 0.6,
 JSON_OBJECT('heal', 40, 'duration', 5, 'tick_heal', 25), 6, 10, 1),

-- 被动技能
(4001, '武器精通', 'Weapon Mastery', '永久增加{attack}点攻击力', 'passive', 'physical', 'self', 0, 0, 0, 0,
 JSON_OBJECT('attack', 50, 'crit_rate', 0.05), 1, 5, 1),

(4002, '魔法亲和', 'Magic Affinity', '永久增加{magic_power}点法术强度和{mana}点法力值', 'passive', 'magical', 'self', 0, 0, 0, 0,
 JSON_OBJECT('magic_power', 40, 'mana', 100, 'mana_regen', 5), 1, 5, 1),

(4003, '坚韧体魄', 'Tough Body', '永久增加{hp}点生命值和{defense}点防御力', 'passive', 'physical', 'self', 0, 0, 0, 0,
 JSON_OBJECT('hp', 200, 'defense', 30, 'status_resistance', 0.1), 1, 5, 1),

(4004, '迅捷身法', 'Swift Movement', '永久增加{speed}点速度和{dodge}闪避率', 'passive', 'physical', 'self', 0, 0, 0, 0,
 JSON_OBJECT('speed', 25, 'dodge', 0.1, 'action_speed', 0.05), 1, 5, 1),

-- 终极技能
(5001, '无双乱舞', 'Unparalleled Dance', '对所有敌人造成连续攻击，每次{damage}点伤害', 'ultimate', 'physical', 'all_enemies', 8, 80, 200, 1.8,
 JSON_OBJECT('damage', 200, 'hit_count', 5, 'crit_bonus', 0.3), 20, 3, 1),

(5002, '禁咒·毁灭', 'Forbidden Destruction', '最强法术攻击，对所有敌人造成{damage}点毁灭伤害', 'ultimate', 'magical', 'all_enemies', 10, 100, 300, 2.0,
 JSON_OBJECT('damage', 300, 'ignore_resistance', 0.5, 'silence_chance', 0.8), 25, 3, 1),

(5003, '神圣庇护', 'Divine Protection', '为所有友军提供强力保护和治疗', 'ultimate', 'healing', 'all_allies', 6, 80, 150, 1.5,
 JSON_OBJECT('heal', 150, 'shield', 200, 'immunity_duration', 2), 22, 3, 1);

-- 显示插入结果
SELECT 'Skills Data Inserted Successfully!' as status;

-- 统计技能数据
SELECT 
    skill_type,
    COUNT(*) as skill_count,
    AVG(base_damage) as avg_damage,
    AVG(cooldown) as avg_cooldown
FROM skills 
WHERE is_active = TRUE 
GROUP BY skill_type
ORDER BY skill_count DESC;