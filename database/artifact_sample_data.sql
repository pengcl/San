-- ===========================
-- 法宝系统示例数据
-- Artifact System Sample Data
-- ===========================

-- 插入法宝套装数据
INSERT IGNORE INTO artifact_sets (set_id, name_zh, name_en, description, theme_color, set_type, total_pieces, piece_2_bonus, piece_3_bonus, piece_full_bonus, display_order) VALUES
('dragon_emperor', '真龙天子', 'Dragon Emperor', '传说中真龙天子的遗物，蕴含帝王霸气', '#FFD700', 'combat', 3,
 JSON_OBJECT('attack_bonus', 0.20, 'description', '攻击力提升20%'),
 JSON_OBJECT('dragon_aura', true, 'description', '获得真龙威压，使敌人畏惧'),
 JSON_OBJECT('emperor_dominion', true, 'description', '帝王威仪，全队属性提升30%'), 1),

('phoenix_rebirth', '凤凰涅槃', 'Phoenix Rebirth', '不死凤凰的神圣遗物，具有重生之力', '#FF6347', 'utility', 3,
 JSON_OBJECT('heal_bonus', 0.25, 'description', '治疗效果提升25%'),
 JSON_OBJECT('auto_revive', true, 'description', '死亡时自动复活一次'),
 JSON_OBJECT('phoenix_blessing', true, 'description', '凤凰庇佑，免疫致命伤害'), 2),

('qilin_wisdom', '麒麟智慧', 'Qilin Wisdom', '智慧麒麟的神圣法宝，提升悟性', '#8A2BE2', 'utility', 3,
 JSON_OBJECT('exp_bonus', 0.30, 'description', '经验获得提升30%'),
 JSON_OBJECT('skill_enhance', true, 'description', '所有技能效果提升15%'),
 JSON_OBJECT('wisdom_enlightenment', true, 'description', '开启智慧之光，减少技能冷却50%'), 3);

-- 插入示例法宝数据
INSERT IGNORE INTO artifacts (artifact_id, name, type_id, rarity_id, description, lore, base_power, base_defense, base_energy, special_attributes, passive_effects, source_type, level_requirement, set_id, set_piece_index) VALUES
-- 真龙天子套装
(50001, '天子剑灵', 'weapon_spirit', 'divine', '传说中真龙天子佩剑的器灵，拥有斩龙之威', 
 '上古真龙天子的佩剑器灵，曾斩杀过邪龙，剑身蕴含真龙之血，威力无穷。', 500, 100, 200,
 JSON_OBJECT('dragon_slayer', 0.50, 'critical_rate', 0.25, 'armor_penetration', 0.30),
 JSON_OBJECT('dragon_roar', '攻击时15%概率发出龙吟，震慑敌人3秒', 'true_damage', '10%概率造成真实伤害'),
 'quest', 80, 'dragon_emperor', 1),

(50002, '真龙护心镜', 'protection_charm', 'divine', '真龙天子的护心宝镜，可反射一切邪恶', 
 '以真龙鳞片炼制的护心镜，传说能反射一切针对君王的诅咒和暗杀。', 100, 800, 150,
 JSON_OBJECT('damage_reflection', 0.30, 'magic_resistance', 0.40, 'status_immunity', true),
 JSON_OBJECT('emperor_protection', '受到致命伤害时，20%概率完全免疫', 'royal_aura', '周围友军防御力提升25%'),
 'quest', 80, 'dragon_emperor', 2),

(50003, '帝王玺印', 'power_crystal', 'divine', '真龙天子的帝王印玺，象征至高无上的权威', 
 '刻有真龙图腾的帝王印玺，持有者将获得统御万民的威严气息。', 300, 300, 400,
 JSON_OBJECT('command_aura', 0.30, 'leadership_bonus', 0.25, 'morale_boost', true),
 JSON_OBJECT('imperial_command', '可强制控制敌人5秒', 'emperor_blessing', '全队获得帝王加护'),
 'quest', 80, 'dragon_emperor', 3),

-- 凤凰涅槃套装  
(50004, '涅槃凤羽', 'mystical_scroll', 'immortal', '浴火重生的凤凰翎羽，蕴含重生之力', 
 '传说中凤凰涅槃时留下的神圣翎羽，每根羽毛都闪烁着重生的火焰。', 200, 200, 300,
 JSON_OBJECT('fire_immunity', true, 'hp_regeneration', 0.05, 'resurrection_power', 0.20),
 JSON_OBJECT('phoenix_fire', '释放凤凰真火，持续恢复生命', 'rebirth_chance', '死亡时30%概率满血复活'),
 'drop', 70, 'phoenix_rebirth', 1),

(50005, '不死鸟心', 'spirit_gem', 'immortal', '不死鸟的心脏结晶，永恒跳动着生命之火', 
 '凤凰的心脏化成的神圣结晶，据说只要它还在跳动，持有者就不会真正死亡。', 150, 400, 250,
 JSON_OBJECT('life_force', 0.50, 'healing_amplify', 0.40, 'immortal_essence', true),
 JSON_OBJECT('undying_will', '生命值低于30%时，所有属性翻倍', 'phoenix_blessing', '每回合恢复最大生命值的8%'),
 'drop', 70, 'phoenix_rebirth', 2),

(50006, '涅槃之炎', 'elemental_orb', 'immortal', '凤凰涅槃时的神圣火焰，可净化一切邪恶', 
 '凤凰涅槃重生时迸发的神圣火焰，具有净化和重生的双重力量。', 400, 150, 350,
 JSON_OBJECT('purification', true, 'fire_mastery', 0.60, 'cleanse_power', 0.80),
 JSON_OBJECT('cleansing_flame', '移除所有负面状态并灼烧敌人', 'rebirth_aura', '死亡盟友有15%概率复活'),
 'drop', 70, 'phoenix_rebirth', 3),

-- 独立神器
(50007, '混沌钟', 'divine_blessing', 'divine', '开天辟地时留下的混沌至宝，可操控时间', 
 '盘古开天时用过的混沌钟，据说能够逆转时间，改变因果。是世间最强的时间系神器。', 600, 600, 500,
 JSON_OBJECT('time_control', true, 'causality_manipulation', 0.50, 'chaos_power', 0.80),
 JSON_OBJECT('time_reversal', '战斗中可回到3秒前的状态', 'chaos_field', '周围时空扭曲，敌人行动减缓50%'),
 'event', 90, NULL, 0),

(50008, '女娲石', 'protection_charm', 'divine', '女娲补天时留下的五彩神石，蕴含造化之力', 
 '女娲娘娘补天时留下的五彩神石，拥有创造和修复一切的神奇力量。', 300, 900, 400,
 JSON_OBJECT('creation_power', 0.70, 'restoration_ability', true, 'divine_protection', 0.60),
 JSON_OBJECT('stone_aegis', '创造护盾吸收所有伤害', 'creation_field', '可创造有利地形和临时建筑'),
 'event', 95, NULL, 0),

-- 各种类型的示例法宝
(50009, '太上老君丹炉', 'divine_elixir', 'ancient', '太上老君的炼丹宝炉，可炼制仙丹', 
 '传说中太上老君用来炼制九转金丹的神炉，任何药材放入都能炼出神丹妙药。', 100, 200, 800,
 JSON_OBJECT('alchemy_mastery', 0.90, 'potion_effectiveness', 0.80, 'elixir_creation', true),
 JSON_OBJECT('golden_elixir', '使用后恢复所有状态并提升属性', 'immortal_pill', '有概率炼出延寿丹'),
 'craft', 60, NULL, 0),

(50010, '孙悟空金箍棒', 'weapon_spirit', 'mystical', '齐天大圣的如意金箍棒器灵', 
 '东海龙宫的定海神针，被齐天大圣孙悟空取走，从此跟随大圣征战天庭。', 666, 333, 200,
 JSON_OBJECT('size_change', true, 'monkey_king_power', 0.72, 'divine_iron', 0.50),
 JSON_OBJECT('72_transformations', '可变化成任意武器形态', 'havoc_in_heaven', '攻击时概率召唤分身'),
 'drop', 50, NULL, 0);

-- 插入法宝效果数据
INSERT IGNORE INTO artifact_effects (effect_id, name_zh, name_en, description, effect_type, effect_category, base_value, scaling_type, trigger_condition, color_hex) VALUES
('dragon_slayer', '屠龙', 'Dragon Slayer', '对龙族生物造成额外伤害', 'special', 'offensive', 50.0, 'percentage', 'vs_dragon', '#FF4500'),
('phoenix_rebirth', '凤凰重生', 'Phoenix Rebirth', '死亡时有概率满血复活', 'trigger', 'utility', 30.0, 'percentage', 'on_death', '#FF6347'),
('time_reversal', '时光倒流', 'Time Reversal', '将状态回到数秒前', 'special', 'utility', 3.0, 'fixed', 'active_use', '#8A2BE2'),
('chaos_field', '混沌领域', 'Chaos Field', '扭曲周围时空，减缓敌人行动', 'special', 'utility', 50.0, 'percentage', 'aura', '#4B0082'),
('emperor_dominion', '帝王威仪', 'Emperor Dominion', '散发帝王气息，威慑敌人', 'special', 'utility', 25.0, 'percentage', 'aura', '#FFD700'),
('immortal_essence', '不死精华', 'Immortal Essence', '蕴含不死之力，大幅提升生存能力', 'attribute', 'defensive', 40.0, 'percentage', 'passive', '#E6E6FA'),
('creation_power', '造化之力', 'Creation Power', '创造和修复的神奇力量', 'special', 'utility', 70.0, 'percentage', 'active_use', '#32CD32'),
('alchemy_mastery', '炼丹术', 'Alchemy Mastery', '精通炼丹之术，提升药物效果', 'skill', 'utility', 80.0, 'percentage', 'passive', '#9ACD32');

-- 插入强化材料数据
INSERT IGNORE INTO artifact_materials (material_id, name_zh, name_en, description, material_type, rarity_tier, usage_type, enhancement_power, source_methods, color_hex) VALUES
('divine_essence', '神性精华', 'Divine Essence', '从神器中提炼的纯净能量', 'essence', 6, 'enhancement', 50,
 JSON_ARRAY('神级BOSS掉落', '分解神器获得', '特殊事件奖励'), '#FFD700'),
('immortal_crystal', '仙灵水晶', 'Immortal Crystal', '仙境中孕育的神秘水晶', 'crystal', 5, 'evolution', 30,
 JSON_ARRAY('仙境副本', '击败仙级怪物', '仙人任务奖励'), '#E6E6FA'),
('chaos_fragment', '混沌碎片', 'Chaos Fragment', '混沌初开时留下的原始碎片', 'fragment', 6, 'craft', 100,
 JSON_ARRAY('混沌副本', '开天事件', '盘古遗迹'), '#4B0082'),
('phoenix_feather', '凤凰翎羽', 'Phoenix Feather', '凤凰涅槃时掉落的神圣羽毛', 'catalyst', 5, 'evolution', 40,
 JSON_ARRAY('火焰山', '凤凰巢穴', '涅槃试炼'), '#FF6347'),
('dragon_scale', '真龙鳞片', 'Dragon Scale', '真龙身上脱落的珍贵鳞片', 'core', 5, 'enhancement', 35,
 JSON_ARRAY('龙族副本', '屠龙任务', '龙宫宝库'), '#B22222');

-- 显示插入结果统计
SELECT 'Artifact Sample Data Created Successfully!' as status;

SELECT 
    '法宝数据统计' as category,
    CONCAT(
        '神器:', (SELECT COUNT(*) FROM artifacts WHERE rarity_id = 'divine'), '件 | ',
        '仙器:', (SELECT COUNT(*) FROM artifacts WHERE rarity_id = 'immortal'), '件 | ',
        '古器:', (SELECT COUNT(*) FROM artifacts WHERE rarity_id = 'ancient'), '件 | ',
        '灵器:', (SELECT COUNT(*) FROM artifacts WHERE rarity_id = 'mystical'), '件'
    ) as summary;

SELECT 
    set_id as '套装ID',
    name_zh as '套装名称', 
    set_type as '类型',
    total_pieces as '总件数',
    (SELECT COUNT(*) FROM artifacts WHERE set_id = artifact_sets.set_id) as '已有件数'
FROM artifact_sets 
ORDER BY display_order;