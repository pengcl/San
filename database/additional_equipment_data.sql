-- 添加更多装备数据
USE sanguo;

-- 武器装备
INSERT INTO equipments (equip_id, name, type, quality, level_required, base_attr, set_id, description) VALUES
(21, '青龙偃月刀', 'weapon', 'red', 50, '{"attack": 800, "defense": 0, "hp": 0, "speed": 0, "special": "攻击时有20%概率造成150%伤害"}', 0, '关羽的专属武器，威力无穷'),
(22, '丈八蛇矛', 'weapon', 'orange', 45, '{"attack": 720, "defense": 0, "hp": 0, "speed": 0, "special": "攻击时有15%概率造成连击"}', 0, '张飞的专属武器，霸气威猛'),
(23, '古锭刀', 'weapon', 'orange', 40, '{"attack": 680, "defense": 0, "hp": 0, "speed": 0, "special": "攻击时有12%概率无视防御"}', 0, '吕布的武器，锋利无比'),
(24, '七星宝刀', 'weapon', 'purple', 35, '{"attack": 580, "defense": 0, "hp": 0, "speed": 0, "special": "攻击时有10%概率造成额外伤害"}', 0, '传说中的宝刀'),
(25, '倚天剑', 'weapon', 'purple', 38, '{"attack": 620, "defense": 0, "hp": 0, "speed": 0, "special": "攻击时有8%概率降低敌人防御"}', 0, '倚天不出，谁与争锋'),
(26, '青釭剑', 'weapon', 'blue', 25, '{"attack": 420, "defense": 0, "hp": 0, "speed": 0, "special": "攻击时有5%概率造成暴击"}', 0, '曹操的佩剑'),
(27, '雌雄双股剑', 'weapon', 'blue', 28, '{"attack": 460, "defense": 0, "hp": 0, "speed": 0, "special": "攻击时有6%概率连击"}', 0, '刘备的武器'),

-- 防具装备
(28, '龙鳞甲', 'armor', 'red', 50, '{"attack": 0, "defense": 600, "hp": 800, "speed": 0, "special": "受到攻击时有15%概率反弹伤害"}', 0, '传说中的神甲'),
(29, '虎头铠', 'armor', 'orange', 45, '{"attack": 0, "defense": 520, "hp": 600, "speed": 0, "special": "受到攻击时有12%概率减伤50%"}', 0, '威猛的战甲'),
(30, '玄铁甲', 'armor', 'orange', 42, '{"attack": 0, "defense": 480, "hp": 550, "speed": 0, "special": "每回合恢复5%生命值"}', 0, '坚固的重甲'),
(31, '凤翎甲', 'armor', 'purple', 35, '{"attack": 0, "defense": 380, "hp": 450, "speed": 20, "special": "增加15%闪避率"}', 0, '轻便的羽甲'),
(32, '锁子甲', 'armor', 'blue', 25, '{"attack": 0, "defense": 280, "hp": 320, "speed": 0, "special": "减少10%物理伤害"}', 0, '常见的防具'),

-- 饰品装备
(33, '和氏璧', 'accessory', 'red', 50, '{"attack": 100, "defense": 100, "hp": 500, "speed": 50, "special": "所有属性提升10%"}', 0, '传国玉璧，价值连城'),
(34, '夜明珠', 'accessory', 'orange', 45, '{"attack": 80, "defense": 80, "hp": 400, "speed": 40, "special": "战斗开始时恢复20%生命值"}', 0, '夜夜生辉的宝珠'),
(35, '翡翠玉佩', 'accessory', 'purple', 35, '{"attack": 60, "defense": 60, "hp": 300, "speed": 30, "special": "每回合恢复3%生命值"}', 0, '美玉无瑕'),
(36, '金丝玉带', 'accessory', 'blue', 25, '{"attack": 40, "defense": 40, "hp": 200, "speed": 20, "special": "增加5%经验获得"}', 0, '华丽的腰带'),

-- 套装装备
(37, '龙王套装-头盔', 'helmet', 'red', 50, '{"attack": 0, "defense": 200, "hp": 300, "speed": 0, "special": "2件套：攻击力+20%"}', 1, '龙王套装的头盔部分'),
(38, '龙王套装-护甲', 'armor', 'red', 50, '{"attack": 0, "defense": 300, "hp": 400, "speed": 0, "special": "4件套：技能伤害+30%"}', 1, '龙王套装的护甲部分'),
(39, '龙王套装-护腿', 'armor', 'red', 50, '{"attack": 0, "defense": 160, "hp": 200, "speed": 0, "special": "6件套：全属性+25%"}', 1, '龙王套装的护腿部分'),

(40, '凤凰套装-翎羽', 'accessory', 'orange', 45, '{"attack": 50, "defense": 50, "hp": 200, "speed": 30, "special": "2件套：生命值+25%"}', 2, '凤凰套装的翎羽'),
(41, '凤凰套装-火羽', 'accessory', 'orange', 45, '{"attack": 60, "defense": 40, "hp": 180, "speed": 35, "special": "4件套：每回合恢复10%生命值"}', 2, '凤凰套装的火羽'),

(42, '虎啸套装-虎符', 'accessory', 'purple', 35, '{"attack": 80, "defense": 20, "hp": 100, "speed": 20, "special": "2件套：攻击力+15%"}', 3, '虎啸套装的虎符'),
(43, '虎啸套装-虎牌', 'accessory', 'purple', 35, '{"attack": 70, "defense": 30, "hp": 120, "speed": 15, "special": "4件套：暴击率+20%"}', 3, '虎啸套装的虎牌');