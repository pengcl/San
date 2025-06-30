-- 为Strapi v5创建武将数据
USE sanguo;

-- 插入武将数据到Strapi生成的heroes表
INSERT INTO heroes (document_id, hero_id, name, quality, faction, type, base_attack, base_defense, base_hp, base_speed, skill_ids, description, created_at, updated_at, published_at, locale) VALUES
-- 蜀国武将
(UUID(), 1001, '刘备', 'SSR', 'shu', 'infantry', 850, 900, 5200, 85, '1001,1002,1003', '仁德之君，蜀汉开国皇帝', NOW(), NOW(), NOW(), 'en'),
(UUID(), 1002, '关羽', 'SSR', 'shu', 'infantry', 1200, 800, 4800, 75, '1004,1005,1006', '武圣关公，义薄云天', NOW(), NOW(), NOW(), 'en'),
(UUID(), 1003, '张飞', 'SSR', 'shu', 'infantry', 1100, 750, 5000, 70, '1007,1008,1009', '燕人张翼德，勇猛无敌', NOW(), NOW(), NOW(), 'en'),
(UUID(), 1004, '赵云', 'SSR', 'shu', 'cavalry', 1000, 850, 4600, 95, '1010,1011,1012', '常山赵子龙，一身是胆', NOW(), NOW(), NOW(), 'en'),
(UUID(), 1005, '诸葛亮', 'UR', 'shu', 'archer', 900, 700, 4200, 90, '1013,1014,1015', '卧龙先生，智绝天下', NOW(), NOW(), NOW(), 'en'),

-- 魏国武将
(UUID(), 2001, '曹操', 'UR', 'wei', 'infantry', 950, 850, 5000, 88, '2001,2002,2003', '魏武帝，治世之能臣', NOW(), NOW(), NOW(), 'en'),
(UUID(), 2002, '司马懿', 'SSR', 'wei', 'archer', 850, 800, 4500, 92, '2004,2005,2006', '鹰视狼顾，谋略深沉', NOW(), NOW(), NOW(), 'en'),
(UUID(), 2005, '张辽', 'SSR', 'wei', 'cavalry', 1050, 750, 4600, 95, '2013,2014,2015', '魏国名将，威震逍遥津', NOW(), NOW(), NOW(), 'en'),

-- 吴国武将
(UUID(), 3001, '孙权', 'SSR', 'wu', 'infantry', 800, 900, 4800, 82, '3001,3002,3003', '江东之主，紫髯碧眼', NOW(), NOW(), NOW(), 'en'),
(UUID(), 3002, '周瑜', 'SSR', 'wu', 'archer', 900, 700, 4200, 90, '3004,3005,3006', '美周郎，儒将风范', NOW(), NOW(), NOW(), 'en'),

-- 群雄武将
(UUID(), 4001, '吕布', 'UR', 'qun', 'cavalry', 1400, 800, 5000, 105, '4001,4002,4003', '飞将吕奉先，人中吕布', NOW(), NOW(), NOW(), 'en'),

-- 女性角色
(UUID(), 5001, '貂蝉', 'SSR', 'qun', 'archer', 750, 600, 3800, 95, '5001,5002,5003', '闭月羞花，连环美人计', NOW(), NOW(), NOW(), 'en'),
(UUID(), 5002, '大乔', 'SR', 'wu', 'archer', 500, 700, 4200, 80, '5004,5005,5006', '江东二乔之大乔，国色天香', NOW(), NOW(), NOW(), 'en'),
(UUID(), 5003, '小乔', 'SR', 'wu', 'archer', 650, 600, 3600, 88, '5007,5008,5009', '江东二乔之小乔，天香国色', NOW(), NOW(), NOW(), 'en'),
(UUID(), 5004, '甄姬', 'SSR', 'wei', 'archer', 680, 650, 3900, 90, '5010,5011,5012', '洛神甄宓，才貌双全', NOW(), NOW(), NOW(), 'en'),
(UUID(), 5005, '孙尚香', 'SR', 'wu', 'archer', 850, 550, 3800, 92, '5013,5014,5015', '弓腰姬，刘备之妻', NOW(), NOW(), NOW(), 'en');