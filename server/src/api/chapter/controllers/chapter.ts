/**
 * 章节控制器
 */

import { factories } from '@strapi/strapi';

const CHAPTER_CONFIG = {
  // 章节数据
  chapters: [
    {
      chapter_id: 1,
      name: "黄巾起义",
      description: "东汉末年，太平道首领张角率领黄巾军起义",
      unlock_level: 1,
      total_stages: 8,
      difficulty: "tutorial",
      prev_chapter_id: null,
      required_stars: 0,
      first_clear_rewards: {
        gold: 10000,
        exp: 5000,
        items: [{ id: 1001, count: 5 }]
      },
      three_star_rewards: {
        gold: 20000,
        exp: 10000,
        gems: 100
      },
      background_image: "chapter_1_bg.jpg",
      story_intro: "公元184年，太平道首领张角自称'黄天'，其部众头戴黄巾为标志，史称'黄巾起义'。",
      is_active: true,
      sort_order: 1,
      special_rules: {
        tutorial: true,
        auto_battle_unlock: 1
      }
    },
    {
      chapter_id: 2,
      name: "董卓之乱",
      description: "董卓专权，袁绍联合诸侯共讨董卓",
      unlock_level: 8,
      total_stages: 6,
      difficulty: "easy",
      prev_chapter_id: 1,
      required_stars: 16,
      first_clear_rewards: {
        gold: 15000,
        exp: 8000,
        items: [{ id: 1002, count: 3 }]
      },
      three_star_rewards: {
        gold: 30000,
        exp: 15000,
        gems: 150
      },
      background_image: "chapter_2_bg.jpg",
      story_intro: "公元189年，董卓入京控制朝政，废立皇帝，引起天下诸侯不满。",
      is_active: true,
      sort_order: 2,
      special_rules: {
        formation_unlock: true
      }
    },
    {
      chapter_id: 3,
      name: "群雄割据",
      description: "诸侯各自为政，天下大乱",
      unlock_level: 15,
      total_stages: 10,
      difficulty: "normal",
      prev_chapter_id: 2,
      required_stars: 12,
      first_clear_rewards: {
        gold: 20000,
        exp: 12000,
        items: [{ id: 1003, count: 2 }]
      },
      three_star_rewards: {
        gold: 40000,
        exp: 20000,
        gems: 200
      },
      background_image: "chapter_3_bg.jpg",
      story_intro: "董卓死后，各路诸侯争夺地盘，形成群雄割据的局面。",
      is_active: true,
      sort_order: 3,
      special_rules: {
        arena_unlock: true
      }
    },
    {
      chapter_id: 4,
      name: "官渡之战",
      description: "曹袁决战官渡，奠定霸业基础",
      unlock_level: 25,
      total_stages: 8,
      difficulty: "hard",
      prev_chapter_id: 3,
      required_stars: 24,
      first_clear_rewards: {
        gold: 30000,
        exp: 18000,
        items: [{ id: 1004, count: 2 }]
      },
      three_star_rewards: {
        gold: 60000,
        exp: 30000,
        gems: 300
      },
      background_image: "chapter_4_bg.jpg",
      story_intro: "公元200年，曹操与袁绍在官渡展开决战，以弱胜强成就一代霸业。",
      is_active: true,
      sort_order: 4,
      special_rules: {
        guild_unlock: true
      }
    },
    {
      chapter_id: 5,
      name: "赤壁之战",
      description: "孙刘联盟火烧赤壁，三分天下",
      unlock_level: 35,
      total_stages: 12,
      difficulty: "hell",
      prev_chapter_id: 4,
      required_stars: 20,
      first_clear_rewards: {
        gold: 50000,
        exp: 25000,
        items: [{ id: 1005, count: 1 }]
      },
      three_star_rewards: {
        gold: 100000,
        exp: 50000,
        gems: 500
      },
      background_image: "chapter_5_bg.jpg",
      story_intro: "公元208年，曹操南下欲统一天下，孙刘联盟于赤壁以火攻大败曹军。",
      is_active: true,
      sort_order: 5,
      special_rules: {
        artifact_unlock: true,
        formation_upgrade: true
      }
    }
  ]
};

export default factories.createCoreController('api::chapter.chapter', ({ strapi }) => ({
  /**
   * 获取所有章节列表
   */
  async find(ctx) {
    try {
      const user = ctx.state.user;
      
      // 获取章节数据
      const chapters = await strapi.entityService.findMany('api::chapter.chapter', {
        sort: { sort_order: 'asc' },
        filters: { is_active: true },
      });

      // 如果数据库中没有章节数据，初始化章节配置
      if (!chapters || chapters.length === 0) {
        console.log('初始化章节数据...');
        for (const chapterData of CHAPTER_CONFIG.chapters) {
          await strapi.entityService.create('api::chapter.chapter', {
            data: {
              ...chapterData,
              difficulty: chapterData.difficulty as "tutorial" | "easy" | "normal" | "hard" | "hell" | "nightmare"
            }
          });
        }
        
        // 重新获取章节数据
        const newChapters = await strapi.entityService.findMany('api::chapter.chapter', {
          sort: { sort_order: 'asc' },
          filters: { is_active: true },
        });
        
        return this.transformResponse(newChapters);
      }

      // 获取用户进度信息（如果已登录）
      let userProgress = {};
      if (user) {
        const userStageProgress = await strapi.entityService.findMany('api::user-stage-progress.user-stage-progress', {
          filters: { user: user.id },
        });
        
        userProgress = userStageProgress.reduce((acc: any, progress: any) => {
          if (!progress.stage) return acc;
          
          const stage = progress.stage;
          const stageId = stage.stage_id || stage.id;
          const chapterId = String(stageId).split('-')[0];
          
          if (!acc[chapterId]) {
            acc[chapterId] = { completed: 0, totalStars: 0 };
          }
          if (progress.stars > 0) {
            acc[chapterId].completed++;
          }
          acc[chapterId].totalStars += progress.stars || 0;
          return acc;
        }, {});
      }

      // 处理章节解锁状态
      const processedChapters = chapters.map(chapter => {
        const chapterProgress = userProgress[chapter.chapter_id] || { completed: 0, totalStars: 0 };
        const isUnlocked = user ? this.checkChapterUnlocked(chapter as any, userProgress as any) : (chapter.chapter_id === 1);
        
        return {
          ...chapter,
          progress: chapterProgress,
          is_unlocked: isUnlocked,
          completion_rate: chapter.total_stages > 0 ? (chapterProgress.completed / chapter.total_stages) : 0
        };
      });

      return this.transformResponse(processedChapters);
    } catch (error) {
      console.error('获取章节列表失败:', error);
      return ctx.badRequest('获取章节列表失败', { error: error.message });
    }
  },

  /**
   * 获取章节详情
   */
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;

      const chapter = await strapi.entityService.findOne('api::chapter.chapter', id);
      
      if (!chapter) {
        return ctx.notFound('章节不存在');
      }

      // 获取章节的关卡列表
      const stages = await strapi.entityService.findMany('api::stage.stage', {
        filters: { chapter: id, is_active: true },
        sort: { stage_number: 'asc' },
      });

      // 获取用户关卡进度（如果已登录）
      let stageProgress = {};
      if (user) {
        const userStageProgress = await strapi.entityService.findMany('api::user-stage-progress.user-stage-progress', {
          filters: { 
            user: user.id,
            stage_id: { $startsWith: `${chapter.chapter_id}-` }
          },
        });
        
        stageProgress = userStageProgress.reduce((acc: any, progress: any) => {
          const stageId = progress.stage?.stage_id || progress.stage?.id;
          if (stageId) {
            acc[stageId] = progress;
          }
          return acc;
        }, {});
      }

      // 处理关卡数据
      const processedStages = stages.map((stage, index) => {
        const progress = stageProgress[stage.stage_id] || {};
        const prevStageCompleted = index === 0 || stageProgress[stages[index-1].stage_id]?.is_completed;
        
        return {
          ...stage,
          progress,
          is_unlocked: prevStageCompleted,
          is_completed: progress.stars > 0 || false,
          stars_earned: progress.stars || 0,
          best_clear_time: progress.best_clear_time || null
        };
      });

      const result = {
        ...chapter,
        stages: processedStages,
        total_stages: stages.length,
        completed_stages: Object.values(stageProgress).filter((p: any) => p.stars > 0).length,
        total_stars: Object.values(stageProgress).reduce((sum: number, p: any) => sum + (p.stars || 0), 0)
      };

      return this.transformResponse(result);
    } catch (error) {
      console.error('获取章节详情失败:', error);
      return ctx.badRequest('获取章节详情失败', { error: error.message });
    }
  },

  /**
   * 检查章节是否解锁
   */
  checkChapterUnlocked(chapter, userProgress) {
    // 第一章总是解锁的
    if (chapter.chapter_id === 1) {
      return true;
    }

    // 检查前置章节条件
    if (chapter.prev_chapter_id) {
      const prevProgress = userProgress[chapter.prev_chapter_id];
      if (!prevProgress || prevProgress.totalStars < chapter.required_stars) {
        return false;
      }
    }

    return true;
  }
}));