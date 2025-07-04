-- 完整武将数据
USE sanguo;

-- 首先删除现有武将数据，重新创建完整的武将系统
DELETE FROM heroes;

-- 插入完整的武将数据
INSERT INTO heroes (hero_id, name, faction, quality, type, base_attack, base_defense, base_hp, base_speed, skill_ids, description) VALUES

-- === 蜀国武将 ===
-- UR级蜀国武将
(1001, '刘备', 'shu', 'UR', '君主', 650, 580, 4200, 85, '1,41,42', '仁德君主，蜀汉开国皇帝，以仁义治天下'),
(1002, '诸葛亮', 'shu', 'UR', '军师', 480, 420, 3500, 95, '10,11,12', '卧龙先生，智谋无双，鞠躬尽瘁死而后已'),

-- SSR级蜀国武将  
(1003, '关羽', 'shu', 'SSR', '武将', 780, 520, 3800, 75, '1,2,3', '武圣关云长，义薄云天，忠义无双'),
(1004, '张飞', 'shu', 'SSR', '武将', 720, 680, 4500, 65, '4,5,6', '燕人张翼德，勇猛无敌，咆哮震天'),
(1005, '赵云', 'shu', 'SSR', '武将', 700, 550, 4000, 120, '7,8,9', '常山赵子龙，一身是胆，龙威天下'),
(1006, '马超', 'shu', 'SSR', '武将', 750, 480, 3600, 110, '43,44,45', '西凉锦马超，神威天将军，勇冠三军'),
(1007, '黄忠', 'shu', 'SSR', '武将', 680, 520, 3700, 70, '46,47,48', '老当益壮的神射手，百步穿杨'),

-- SR级蜀国武将
(1008, '魏延', 'shu', 'SR', '武将', 580, 450, 3200, 80, '49,50,51', '镇远将军，勇猛善战的蜀汉名将'),
(1009, '姜维', 'shu', 'SR', '武将', 520, 480, 3300, 85, '52,53,54', '诸葛亮的传人，智勇双全'),
(1010, '法正', 'shu', 'SR', '军师', 420, 380, 2800, 90, '55,56,57', '蜀汉谋士，为刘备出谋划策'),

-- === 魏国武将 ===
-- UR级魏国武将
(2001, '曹操', 'wei', 'UR', '君主', 700, 600, 4500, 90, '58,59,60', '魏武帝，治世之能臣，乱世之奸雄'),
(2002, '司马懿', 'wei', 'UR', '军师', 500, 550, 4000, 100, '61,62,63', '高平陵之变的主谋，晋朝奠基者'),

-- SSR级魏国武将
(2003, '张辽', 'wei', 'SSR', '武将', 680, 520, 3600, 95, '64,65,66', '逍遥津的英雄，威震江东'),
(2004, '许褚', 'wei', 'SSR', '武将', 650, 650, 4200, 60, '67,68,69', '虎痴，曹操的贴身护卫'),
(2005, '典韦', 'wei', 'SSR', '武将', 720, 580, 4000, 70, '70,71,72', '古之恶来，力大无穷的猛将'),
(2006, '夏侯惇', 'wei', 'SSR', '武将', 620, 550, 3800, 75, '73,74,75', '独眼将军，曹操的族弟'),
(2007, '夏侯渊', 'wei', 'SSR', '武将', 650, 480, 3400, 105, '76,77,78', '妙才，行军神速的将军'),

-- SR级魏国武将
(2008, '张郃', 'wei', 'SR', '武将', 580, 520, 3500, 85, '79,80,81', '巧变多端的名将'),
(2009, '徐晃', 'wei', 'SR', '武将', 560, 540, 3600, 80, '82,83,84', '周仓克星，樊城之战的功臣'),
(2010, '郭嘉', 'wei', 'SR', '军师', 450, 420, 3000, 95, '85,86,87', '鬼才郭奉孝，料事如神'),

-- === 吴国武将 ===
-- UR级吴国武将
(3001, '孙策', 'wu', 'UR', '君主', 720, 550, 4000, 110, '88,89,90', '小霸王，江东奠基者'),

-- SSR级吴国武将
(3002, '孙权', 'wu', 'SSR', '君主', 580, 580, 4200, 85, '91,92,93', '吴大帝，坐断东南的帝王'),
(3003, '周瑜', 'wu', 'SSR', '军师', 520, 480, 3500, 100, '94,95,96', '美周郎，赤壁之战的主帅'),
(3004, '鲁肃', 'wu', 'SSR', '军师', 480, 520, 3600, 90, '97,98,99', '忠厚长者，联盟外交家'),
(3005, '太史慈', 'wu', 'SSR', '武将', 680, 500, 3400, 95, '100,101,102', '神亭岭的英雄'),
(3006, '甘宁', 'wu', 'SSR', '武将', 660, 480, 3300, 105, '103,104,105', '锦帆贼，江东悍将'),

-- SR级吴国武将
(3007, '黄盖', 'wu', 'SR', '武将', 550, 600, 3800, 70, '106,107,108', '苦肉计的主演者'),
(3008, '程普', 'wu', 'SR', '武将', 530, 550, 3700, 75, '109,110,111', '江东十二虎臣之首'),
(3009, '陆逊', 'wu', 'SR', '军师', 500, 480, 3200, 95, '112,113,114', '白衣渡江的智将'),

-- === 群雄武将 ===
-- UR级群雄武将
(4001, '吕布', 'qun', 'UR', '武将', 900, 520, 4200, 95, '13,14,15', '飞将吕奉先，天下无双的武勇'),

-- SSR级群雄武将
(4002, '董卓', 'qun', 'SSR', '君主', 580, 650, 4500, 60, '115,116,117', '西凉军阀，祸乱朝纲的权臣'),
(4003, '袁绍', 'qun', 'SSR', '君主', 520, 580, 4000, 70, '118,119,120', '四世三公，盟主袁本初'),
(4004, '袁术', 'qun', 'SSR', '君主', 500, 550, 3800, 75, '121,122,123', '仲氏帝，僭越称帝的诸侯'),
(4005, '公孙瓒', 'qun', 'SSR', '武将', 650, 520, 3600, 100, '124,125,126', '白马将军，幽州牧'),

-- SR级群雄武将
(4006, '张角', 'qun', 'SR', '术士', 480, 420, 3200, 85, '127,128,129', '太平道教主，黄巾起义领袖'),
(4007, '于吉', 'qun', 'SR', '术士', 350, 380, 2800, 110, '130,131,132', '方士于吉，能呼风唤雨的神秘道士'),
(4008, '南华老仙', 'qun', 'SR', '术士', 420, 400, 3000, 95, '133,134,135', '传说中的仙人，张角的师父'),
(4009, '华佗', 'qun', 'SR', '医者', 300, 350, 2500, 80, '136,137,138', '神医华佗，医术高超，妙手回春'),
(4010, '左慈', 'qun', 'SR', '术士', 380, 360, 2700, 120, '139,140,141', '乌角先生，奇门遁甲的高手'),

-- === 美人武将 ===
-- UR级美人
(5001, '貂蝉', 'qun', 'UR', '美人', 450, 380, 3200, 115, '16,17,18', '闭月美人，连环计的关键人物'),

-- SSR级美人
(5002, '甄姬', 'wei', 'SSR', '美人', 480, 420, 3400, 100, '28,29,30', '洛神甄宓，才华与美貌并重'),
(5003, '孙尚香', 'wu', 'SSR', '美人', 580, 450, 3300, 105, '25,26,27', '弓腰姬，江东烈女'),

-- SR级美人
(5004, '大乔', 'wu', 'SR', '美人', 400, 480, 3600, 90, '19,20,21', '国色天香，江东二乔之姐'),
(5005, '小乔', 'wu', 'SR', '美人', 420, 450, 3400, 95, '22,23,24', '天真烂漫，江东二乔之妹'),
(5006, '蔡文姬', 'qun', 'SR', '美人', 380, 400, 3000, 85, '142,143,144', '才女蔡琰，胡笳十八拍的作者'),
(5007, '糜夫人', 'shu', 'SR', '美人', 350, 450, 3200, 80, '145,146,147', '刘备夫人，贤妻良母'),
(5008, '步练师', 'wu', 'SR', '美人', 360, 430, 3100, 85, '148,149,150', '孙权皇后，温婉贤淑'),

-- R级武将（新手武将）
(6001, '关平', 'shu', 'R', '武将', 450, 400, 2800, 85, '151,152,153', '关羽义子，勇敢的年轻将领'),
(6002, '张苞', 'shu', 'R', '武将', 480, 420, 3000, 90, '154,155,156', '张飞长子，虎父无犬子'),
(6003, '关兴', 'shu', 'R', '武将', 460, 380, 2700, 95, '157,158,159', '关羽次子，继承父志'),
(6004, '曹彰', 'wei', 'R', '武将', 500, 450, 3100, 80, '160,161,162', '黄须儿，曹操三子'),
(6005, '曹植', 'wei', 'R', '文士', 380, 350, 2500, 75, '163,164,165', '八斗之才，七步成诗'),
(6006, '孙登', 'wu', 'R', '君主', 420, 480, 3200, 70, '166,167,168', '孙权长子，仁德太子'),

-- N级武将（炮灰武将）
(7001, '刘禅', 'shu', 'N', '君主', 300, 400, 2800, 50, '169,170,171', '阿斗，蜀汉后主，乐不思蜀'),
(7002, '马谡', 'shu', 'N', '军师', 350, 320, 2200, 60, '172,173,174', '纸上谈兵，失守街亭'),
(7003, '袁谭', 'qun', 'N', '武将', 380, 360, 2500, 65, '175,176,177', '袁绍长子，兄弟相争'),
(7004, '袁熙', 'qun', 'N', '武将', 370, 370, 2600, 60, '178,179,180', '袁绍次子，平庸之辈'),
(7005, '刘表', 'qun', 'N', '君主', 320, 450, 3000, 55, '181,182,183', '荆州牧，守成之主'),
(7006, '刘璋', 'qun', 'N', '君主', 310, 430, 2900, 50, '184,185,186', '益州牧，懦弱无能');