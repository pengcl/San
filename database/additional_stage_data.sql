-- 添加更多关卡数据
USE sanguo;

-- 添加更多关卡
INSERT INTO stages (stage_id, chapter, stage_num, name, difficulty, stamina_cost, level_required, enemy_data, drop_data, first_clear_rewards) VALUES
(9, 2, 1, '董卓之乱', 'normal', 8, 8, '{"enemies": [{"id": 5, "name": "董卓军", "level": 8, "hp": 2500, "attack": 350}], "boss": {"id": 6, "name": "董卓", "level": 10, "hp": 4000, "attack": 450}}', '{"gold": 250, "exp": 120, "equipment_chance": 0.15}', '{"gold": 500, "exp": 240, "hero_fragment": {"hero_id": 5, "count": 3}}'),
(10, 2, 2, '连环计', 'normal', 9, 10, '{"enemies": [{"id": 7, "name": "吕布", "level": 12, "hp": 3500, "attack": 500}], "boss": {"id": 8, "name": "貂蝉", "level": 10, "hp": 2000, "attack": 300, "skill": "魅惑"}}', '{"gold": 300, "exp": 150, "equipment_chance": 0.18}', '{"gold": 600, "exp": 300, "equipment": {"equip_id": 25, "count": 1}}'),

-- 第三章：群雄割据
(11, 3, 1, '袁绍起兵', 'normal', 10, 12, '{"enemies": [{"id": 9, "name": "袁绍军", "level": 15, "hp": 4000, "attack": 550}], "boss": {"id": 10, "name": "袁绍", "level": 15, "hp": 5000, "attack": 600}}', '{"gold": 350, "exp": 180, "equipment_chance": 0.2}', '{"gold": 700, "exp": 360, "hero_fragment": {"hero_id": 6, "count": 5}}'),
(12, 3, 2, '曹操起兵', 'normal', 10, 12, '{"enemies": [{"id": 11, "name": "曹操军", "level": 15, "hp": 3800, "attack": 580}], "boss": {"id": 12, "name": "曹操", "level": 15, "hp": 4800, "attack": 620}}', '{"gold": 350, "exp": 180, "equipment_chance": 0.2}', '{"gold": 700, "exp": 360, "hero_fragment": {"hero_id": 7, "count": 5}}'),
(13, 3, 3, '刘备起义', 'normal', 11, 14, '{"enemies": [{"id": 13, "name": "黄巾余党", "level": 16, "hp": 3000, "attack": 400}], "boss": {"id": 14, "name": "张宝", "level": 16, "hp": 4500, "attack": 500}}', '{"gold": 400, "exp": 200, "equipment_chance": 0.22}', '{"gold": 800, "exp": 400, "hero_fragment": {"hero_id": 8, "count": 5}}'),
(14, 3, 4, '孙坚江东', 'normal', 11, 14, '{"enemies": [{"id": 15, "name": "江东兵", "level": 17, "hp": 4200, "attack": 520}], "boss": {"id": 16, "name": "孙坚", "level": 17, "hp": 5200, "attack": 580}}', '{"gold": 400, "exp": 200, "equipment_chance": 0.22}', '{"gold": 800, "exp": 400, "hero_fragment": {"hero_id": 9, "count": 5}}'),

-- 第四章：官渡之战
(15, 4, 1, '白马之围', 'hard', 12, 16, '{"enemies": [{"id": 17, "name": "袁军先锋", "level": 20, "hp": 5000, "attack": 650}], "boss": {"id": 18, "name": "颜良", "level": 22, "hp": 6500, "attack": 750}}', '{"gold": 500, "exp": 250, "equipment_chance": 0.25}', '{"gold": 1000, "exp": 500, "equipment": {"equip_id": 26, "count": 1}}'),
(16, 4, 2, '关羽斩颜良', 'hard', 12, 16, '{"enemies": [{"id": 19, "name": "袁军", "level": 20, "hp": 4800, "attack": 600}], "boss": {"id": 20, "name": "文丑", "level": 22, "hp": 6000, "attack": 700}}', '{"gold": 500, "exp": 250, "equipment_chance": 0.25}', '{"gold": 1000, "exp": 500, "hero_fragment": {"hero_id": 1, "count": 8}}'),
(17, 4, 3, '官渡决战', 'hard', 15, 18, '{"enemies": [{"id": 21, "name": "袁绍主力", "level": 25, "hp": 6000, "attack": 700}], "boss": {"id": 22, "name": "袁绍", "level": 25, "hp": 8000, "attack": 800}}', '{"gold": 600, "exp": 300, "equipment_chance": 0.3}', '{"gold": 1200, "exp": 600, "equipment": {"equip_id": 21, "count": 1}}'),

-- 第五章：赤壁之战  
(18, 5, 1, '诸葛亮出山', 'hard', 13, 18, '{"enemies": [{"id": 23, "name": "刘表军", "level": 22, "hp": 5500, "attack": 600}], "boss": {"id": 24, "name": "蔡瑁", "level": 23, "hp": 6500, "attack": 650}}', '{"gold": 550, "exp": 280, "equipment_chance": 0.28}', '{"gold": 1100, "exp": 560, "hero_fragment": {"hero_id": 10, "count": 10}}'),
(19, 5, 2, '舌战群儒', 'hard', 14, 20, '{"enemies": [{"id": 25, "name": "东吴文臣", "level": 23, "hp": 4000, "attack": 500}], "boss": {"id": 26, "name": "张昭", "level": 24, "hp": 5000, "attack": 550}}', '{"gold": 580, "exp": 300, "equipment_chance": 0.3}', '{"gold": 1160, "exp": 600, "equipment": {"equip_id": 33, "count": 1}}'),
(20, 5, 3, '草船借箭', 'hard', 14, 20, '{"enemies": [{"id": 27, "name": "曹军水师", "level": 25, "hp": 5500, "attack": 650}], "boss": {"id": 28, "name": "蔡瑁", "level": 25, "hp": 6000, "attack": 700}}', '{"gold": 600, "exp": 320, "equipment_chance": 0.32}', '{"gold": 1200, "exp": 640, "equipment": {"equip_id": 34, "count": 1}}'),
(21, 5, 4, '火烧赤壁', 'hell', 18, 22, '{"enemies": [{"id": 29, "name": "曹军主力", "level": 28, "hp": 7000, "attack": 800}], "boss": {"id": 30, "name": "曹操", "level": 30, "hp": 10000, "attack": 900}}', '{"gold": 800, "exp": 400, "equipment_chance": 0.4}', '{"gold": 1600, "exp": 800, "equipment": {"equip_id": 37, "count": 1}}'),

-- 精英关卡
(22, 1, 99, '吕布讨董卓', 'hell', 20, 25, '{"enemies": [{"id": 31, "name": "西凉军", "level": 35, "hp": 8000, "attack": 900}], "boss": {"id": 32, "name": "吕布", "level": 40, "hp": 15000, "attack": 1200}}', '{"gold": 1000, "exp": 500, "equipment_chance": 0.5}', '{"gold": 2000, "exp": 1000, "hero_fragment": {"hero_id": 3, "count": 20}, "equipment": {"equip_id": 21, "count": 1}}'),
(23, 2, 99, '关羽过五关', 'hell', 22, 28, '{"enemies": [{"id": 33, "name": "各路守将", "level": 38, "hp": 9000, "attack": 950}], "boss": {"id": 34, "name": "关羽", "level": 42, "hp": 16000, "attack": 1300}}', '{"gold": 1100, "exp": 550, "equipment_chance": 0.55}', '{"gold": 2200, "exp": 1100, "hero_fragment": {"hero_id": 1, "count": 20}, "equipment": {"equip_id": 22, "count": 1}}'),
(24, 3, 99, '赵云救阿斗', 'hell', 25, 30, '{"enemies": [{"id": 35, "name": "曹军精锐", "level": 40, "hp": 10000, "attack": 1000}], "boss": {"id": 36, "name": "赵云", "level": 45, "hp": 18000, "attack": 1400}}', '{"gold": 1200, "exp": 600, "equipment_chance": 0.6}', '{"gold": 2400, "exp": 1200, "hero_fragment": {"hero_id": 2, "count": 20}, "equipment": {"equip_id": 23, "count": 1}}');