/**
 * 关卡控制器
 */

import { factories } from '@strapi/strapi';

const STAGE_CONFIG = {
  // 关卡数据配置
  stages: [
    // 第一章：黄巾起义（教学关卡）
    {
      stage_id: "1-1",
      name: "民心不安",
      stage_type: "normal",
      stage_number: 1,
      energy_cost: 6,
      recommended_power: 800,
      enemy_formation: {
        formation: [
          { position: 0, hero_id: 9001, level: 3 }, // 黄巾兵
          { position: 1, hero_id: 9001, level: 3 },
          { position: 2, hero_id: 9002, level: 5 }  // 黄巾小将
        ]
      },
      battle_background: "village_battlefield.jpg",
      star_conditions: {
        star1: { type: "win", description: "获得胜利" },
        star2: { type: "time", value: 60, description: "60秒内完成战斗" },
        star3: { type: "no_death", description: "无人阵亡" }
      },
      base_rewards: {
        gold: 500,
        exp: 300,
        items: [{ id: 1001, count: 1 }]
      },
      drop_items: {
        common: [{ id: 2001, rate: 0.3 }],
        rare: [{ id: 2002, rate: 0.1 }]
      },
      daily_attempts: 0,
      unlock_conditions: {},
      story_dialogue: {
        pre_battle: [
          { speaker: "村民", text: "将军，黄巾贼寇就在前方！" },
          { speaker: "玩家", text: "放心，我会保护村民的安全！" }
        ],
        post_battle: [
          { speaker: "村民", text: "多谢将军相救！" }
        ]
      },
      battle_tips: "这是你的第一场战斗，试试点击武将释放技能！",
      is_boss_stage: false,
      is_active: true
    },
    {
      stage_id: "1-2",
      name: "黄巾小卒",
      stage_type: "normal",
      stage_number: 2,
      energy_cost: 6,
      recommended_power: 1000,
      enemy_formation: {
        formation: [
          { position: 0, hero_id: 9001, level: 4 },
          { position: 1, hero_id: 9001, level: 4 },
          { position: 2, hero_id: 9002, level: 6 },
          { position: 3, hero_id: 9003, level: 5 }
        ]
      },
      battle_background: "village_battlefield.jpg",
      star_conditions: {
        star1: { type: "win", description: "获得胜利" },
        star2: { type: "time", value: 90, description: "90秒内完成战斗" },
        star3: { type: "hp_remain", value: 80, description: "队伍剩余血量80%以上" }
      },
      base_rewards: {
        gold: 600,
        exp: 400,
        items: [{ id: 1001, count: 1 }]
      },
      drop_items: {
        common: [{ id: 2001, rate: 0.3 }],
        rare: [{ id: 2002, rate: 0.1 }]
      },
      daily_attempts: 0,
      unlock_conditions: {},
      story_dialogue: {
        pre_battle: [
          { speaker: "黄巾兵", text: "苍天已死，黄天当立！" }
        ]
      },
      battle_tips: "学会使用阵型克制，步兵克制弓兵！",
      is_boss_stage: false,
      is_active: true
    },
    // 第一章BOSS关
    {
      stage_id: "1-8",
      name: "黄巾渠帅",
      stage_type: "normal",
      stage_number: 8,
      energy_cost: 8,
      recommended_power: 2500,
      enemy_formation: {
        formation: [
          { position: 2, hero_id: 9010, level: 12 }, // 黄巾渠帅（BOSS）
          { position: 0, hero_id: 9002, level: 10 },
          { position: 1, hero_id: 9002, level: 10 },
          { position: 3, hero_id: 9003, level: 8 },
          { position: 4, hero_id: 9003, level: 8 }
        ]
      },
      battle_background: "yellow_turban_camp.jpg",
      star_conditions: {
        star1: { type: "win", description: "获得胜利" },
        star2: { type: "time", value: 120, description: "120秒内完成战斗" },
        star3: { type: "no_death", description: "无人阵亡" }
      },
      base_rewards: {
        gold: 1500,
        exp: 1000,
        items: [{ id: 1001, count: 3 }, { id: 1002, count: 1 }]
      },
      drop_items: {
        rare: [{ id: 2003, rate: 0.2 }],
        epic: [{ id: 2004, rate: 0.05 }]
      },
      daily_attempts: 0,
      unlock_conditions: {},
      story_dialogue: {
        pre_battle: [
          { speaker: "黄巾渠帅", text: "汝等官军，今日必死于此！" },
          { speaker: "玩家", text: "为了天下百姓，我绝不会退缩！" }
        ],
        post_battle: [
          { speaker: "黄巾渠帅", text: "黄天...不会...败..." },
          { speaker: "玩家", text: "黄巾之乱暂告平息，但更大的风暴即将来临..." }
        ]
      },
      battle_tips: "BOSS拥有强力技能，注意时机释放治疗和防御技能！",
      is_boss_stage: true,
      is_active: true
    },
    
    // 第二章：董卓之乱
    {
      stage_id: "2-1",
      name: "董卓入京",
      stage_type: "normal",
      stage_number: 1,
      energy_cost: 8,
      recommended_power: 3000,
      enemy_formation: {
        formation: [
          { position: 0, hero_id: 9020, level: 15 }, // 董卓军
          { position: 1, hero_id: 9021, level: 13 },
          { position: 2, hero_id: 9022, level: 14 },
          { position: 3, hero_id: 9023, level: 12 }
        ]
      },
      battle_background: "luoyang_palace.jpg",
      star_conditions: {
        star1: { type: "win", description: "获得胜利" },
        star2: { type: "time", value: 100, description: "100秒内完成战斗" },
        star3: { type: "skill_use", value: 3, description: "使用技能3次以上" }
      },
      base_rewards: {
        gold: 800,
        exp: 600,
        items: [{ id: 1002, count: 1 }]
      },
      drop_items: {
        common: [{ id: 2005, rate: 0.3 }],
        rare: [{ id: 2006, rate: 0.15 }]
      },
      daily_attempts: 0,
      unlock_conditions: {},
      story_dialogue: {
        pre_battle: [
          { speaker: "董卓", text: "谁敢阻挡我入主洛阳！" }
        ]
      },
      battle_tips: "敌人战力更强，记得升级你的武将！",
      is_boss_stage: false,
      is_active: true
    },
    
    // 第二章BOSS关
    {
      stage_id: "2-6",
      name: "董卓专权",
      stage_type: "normal",
      stage_number: 6,
      energy_cost: 10,
      recommended_power: 4500,
      enemy_formation: {
        formation: [
          { position: 2, hero_id: 9030, level: 20 }, // 董卓（BOSS）
          { position: 0, hero_id: 9031, level: 18 }, // 吕布
          { position: 1, hero_id: 9032, level: 16 },
          { position: 3, hero_id: 9033, level: 16 },
          { position: 4, hero_id: 9034, level: 15 }
        ]
      },
      battle_background: "luoyang_throne_hall.jpg",
      star_conditions: {
        star1: { type: "win", description: "获得胜利" },
        star2: { type: "time", value: 150, description: "150秒内完成战斗" },
        star3: { type: "combo", value: 5, description: "连击5次以上" }
      },
      base_rewards: {
        gold: 2000,
        exp: 1500,
        items: [{ id: 1002, count: 3 }, { id: 1003, count: 1 }]
      },
      drop_items: {
        rare: [{ id: 2007, rate: 0.25 }],
        epic: [{ id: 2008, rate: 0.1 }]
      },
      daily_attempts: 0,
      unlock_conditions: {},
      story_dialogue: {
        pre_battle: [
          { speaker: "董卓", text: "我乃当今天子之父，谁敢与我为敌！" },
          { speaker: "吕布", text: "义父，让我来解决他们！" }
        ],
        post_battle: [
          { speaker: "董卓", text: "不可能...我的帝业..." },
          { speaker: "玩家", text: "董卓之乱已平，但天下大乱才刚刚开始..." }
        ]
      },
      battle_tips: "董卓拥有强力护卫，优先击败吕布！",
      is_boss_stage: true,
      is_active: true
    }
  ]
};

export default factories.createCoreController('api::stage.stage', ({ strapi }) => ({
  /**
   * 获取关卡列表
   */
  async find(ctx) {
    try {
      const { chapter_id, stage_type } = ctx.query;
      const user = ctx.state.user;

      let filters: any = { is_active: true };
      if (chapter_id) {
        filters.chapter = chapter_id;
      }
      if (stage_type) {
        filters.stage_type = stage_type;
      }

      const stages = await strapi.entityService.findMany('api::stage.stage', {
        filters,
        sort: { stage_number: 'asc' },
        populate: ['chapter'],
      });

      // 如果数据库中没有关卡数据，初始化关卡配置
      if (!stages || stages.length === 0) {
        console.log('初始化关卡数据...');
        
        // 先获取章节数据
        const chapters = await strapi.entityService.findMany('api::chapter.chapter', {
          filters: { is_active: true },
        });
        
        const chapterMap = chapters.reduce((acc, chapter) => {
          acc[chapter.chapter_id] = chapter.id;
          return acc;
        }, {});

        // 创建关卡数据
        for (const stageData of STAGE_CONFIG.stages) {
          const chapterId = parseInt(stageData.stage_id.split('-')[0]);
          const chapterEntityId = chapterMap[chapterId];
          
          if (chapterEntityId) {
            await strapi.entityService.create('api::stage.stage', {
              data: {
                ...stageData,
                chapter: chapterEntityId,
                stage_type: stageData.stage_type as "normal" | "elite" | "heroic" | "event" | "daily"
              }
            });
          }
        }
        
        // 重新获取关卡数据
        const newStages = await strapi.entityService.findMany('api::stage.stage', {
          filters,
          sort: { stage_number: 'asc' },
          populate: ['chapter'],
        });
        
        return this.processStagesWithProgress(newStages as any, user);
      }

      return this.processStagesWithProgress(stages as any, user);
    } catch (error) {
      console.error('获取关卡列表失败:', error);
      return ctx.badRequest('获取关卡列表失败', { error: error.message });
    }
  },

  /**
   * 获取关卡详情
   */
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;

      const stage = await strapi.entityService.findOne('api::stage.stage', id, {
        populate: ['chapter'],
      });
      
      if (!stage) {
        return ctx.notFound('关卡不存在');
      }

      // 获取用户关卡进度
      let progress = null;
      if (user) {
        const userProgress = await strapi.entityService.findMany('api::user-stage-progress.user-stage-progress', {
          filters: { 
            user: (user as any).id,
            stage: { stage_id: stage.stage_id }
          },
        });
        progress = userProgress[0] || null;
      }

      // 检查关卡是否解锁
      const isUnlocked = await this.checkStageUnlocked(stage as any, user);

      const result = {
        ...stage,
        progress,
        is_unlocked: isUnlocked,
        is_completed: progress?.stars > 0 || false,
        stars_earned: progress?.stars || 0,
        best_clear_time: progress?.best_clear_time || null,
        attempts_today: progress?.daily_attempts || 0
      };

      return this.transformResponse(result);
    } catch (error) {
      console.error('获取关卡详情失败:', error);
      return ctx.badRequest('获取关卡详情失败', { error: error.message });
    }
  },

  /**
   * 开始关卡挑战
   */
  async startChallenge(ctx) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const stage = await strapi.entityService.findOne('api::stage.stage', id);
      if (!stage) {
        return ctx.notFound('关卡不存在');
      }

      // 检查关卡是否解锁
      const isUnlocked = await this.checkStageUnlocked(stage as any, user);
      if (!isUnlocked) {
        return ctx.badRequest('关卡未解锁');
      }

      // 检查体力是否足够
      const userProfile = await strapi.entityService.findMany('api::user-profile.user-profile', {
        filters: { user: (user as any).id },
      });
      
      const profile = userProfile[0];
      if (!profile || profile.stamina < stage.energy_cost) {
        return ctx.badRequest('体力不足');
      }

      // 检查每日挑战次数
      if (stage.daily_attempts > 0) {
        const progress = await strapi.entityService.findMany('api::user-stage-progress.user-stage-progress', {
          filters: { 
            user: (user as any).id,
            stage: { stage_id: stage.stage_id }
          },
        });
        
        const todayProgress = progress[0];
        if (todayProgress && todayProgress.daily_attempts >= stage.daily_attempts) {
          return ctx.badRequest('今日挑战次数已用完');
        }
      }

      // 扣除体力
      await strapi.entityService.update('api::user-profile.user-profile', profile.id, {
        data: {
          stamina: profile.stamina - stage.energy_cost
        }
      });

      // 创建战斗记录
      const battle = await strapi.entityService.create('api::battle.battle', {
        data: {
          battle_id: `battle_${Date.now()}_${(user as any).id}`,
          player: (user as any).id,
          stage_id: stage.stage_id,
          battle_type: 'pve_normal',
          result: 'ongoing',
          enemy_formation: stage.enemy_formation
        }
      });

      return this.transformResponse({
        battle_id: battle.id,
        stage: stage,
        energy_cost: stage.energy_cost,
        remaining_energy: profile.stamina - stage.energy_cost
      });
    } catch (error) {
      console.error('开始关卡挑战失败:', error);
      return ctx.badRequest('开始关卡挑战失败', { error: error.message });
    }
  },

  /**
   * 处理关卡数据，添加用户进度信息
   */
  async processStagesWithProgress(stages, user) {
    if (!user) {
      return this.transformResponse(stages.map(stage => ({
        ...stage,
        is_unlocked: stage.stage_id === '1-1', // 只有第一关解锁
        is_completed: false,
        stars_earned: 0
      })));
    }

    // 获取用户所有关卡进度
    const userProgress = await strapi.entityService.findMany('api::user-stage-progress.user-stage-progress', {
      filters: { user: (user as any).id },
    });

    const progressMap = userProgress.reduce((acc: any, progress: any) => {
      const stageId = progress.stage?.stage_id || progress.stage?.id;
      if (stageId) {
        acc[stageId] = progress;
      }
      return acc;
    }, {});

    // 处理每个关卡的解锁状态
    const processedStages = [];
    for (const stage of stages as unknown as any[]) {
      const progress = progressMap[stage.stage_id];
      const isUnlocked = await this.checkStageUnlocked(stage as any, user);
      
      processedStages.push({
        ...stage,
        progress,
        is_unlocked: isUnlocked,
        is_completed: progress?.stars > 0 || false,
        stars_earned: progress?.stars || 0,
        best_clear_time: progress?.best_clear_time || null,
        attempts_today: progress?.daily_attempts || 0
      });
    }

    return this.transformResponse(processedStages);
  },

  /**
   * 检查关卡是否解锁
   */
  async checkStageUnlocked(stage, user) {
    if (!user) {
      return stage.stage_id === '1-1';
    }

    // 第一关总是解锁的
    if (stage.stage_id === '1-1') {
      return true;
    }

    // 检查前一关是否通关
    const [chapterId, stageNum] = stage.stage_id.split('-').map(Number);
    let prevStageId;
    
    if (stageNum > 1) {
      // 同章节的前一关
      prevStageId = `${chapterId}-${stageNum - 1}`;
    } else {
      // 前一章节的最后一关
      const prevChapterId = chapterId - 1;
      if (prevChapterId < 1) {
        return true; // 第一章第一关
      }
      
      // 需要获取前一章节的最后一关
      const prevChapter = await strapi.entityService.findMany('api::chapter.chapter', {
        filters: { chapter_id: prevChapterId },
      });
      
      if (prevChapter.length > 0) {
        prevStageId = `${prevChapterId}-${prevChapter[0].total_stages}`;
      } else {
        return false;
      }
    }

    // 检查前置关卡是否完成
    const prevProgress = await strapi.entityService.findMany('api::user-stage-progress.user-stage-progress', {
      filters: {
        user: (user as any).id,
        stage: { stage_id: prevStageId },
        stars: { $gt: 0 }
      },
    });

    return prevProgress.length > 0;
  }
}));