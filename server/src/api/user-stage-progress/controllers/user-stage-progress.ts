/**
 * 用户关卡进度控制器
 */

import { Context } from 'koa';

export default {
  /**
   * 获取用户关卡进度列表
   */
  async find(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { chapter_id, stage_type } = ctx.query;

      // 构建查询条件
      const where: any = {
        user: user.id
      };

      // 查询用户的关卡进度
      let userProgresses = await strapi.db.query('api::user-stage-progress.user-stage-progress').findMany({
        where,
        populate: {
          stage: {
            populate: {
              chapter: true
            }
          }
        },
        orderBy: [
          { stage: { chapter_id: 'asc' } },
          { stage: { stage_order: 'asc' } }
        ]
      });

      // 根据参数过滤
      if (chapter_id) {
        userProgresses = userProgresses.filter(progress => 
          progress.stage?.chapter_id === parseInt(String(chapter_id))
        );
      }

      if (stage_type) {
        userProgresses = userProgresses.filter(progress => 
          progress.stage?.stage_type === String(stage_type)
        );
      }

      ctx.body = {
        success: true,
        data: userProgresses
      };
    } catch (error) {
      console.error('获取用户关卡进度失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_USER_STAGE_PROGRESS_ERROR',
          message: '获取用户关卡进度失败'
        }
      };
    }
  },

  /**
   * 获取单个关卡的用户进度
   */
  async findOne(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { id } = ctx.params;

      const userProgress = await strapi.db.query('api::user-stage-progress.user-stage-progress').findOne({
        where: {
          id: parseInt(id),
          user: user.id
        },
        populate: {
          stage: {
            populate: {
              chapter: true
            }
          }
        }
      });

      if (!userProgress) {
        return ctx.notFound('关卡进度不存在');
      }

      ctx.body = {
        success: true,
        data: userProgress
      };
    } catch (error) {
      console.error('获取关卡进度详情失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_STAGE_PROGRESS_ERROR',
          message: '获取关卡进度详情失败'
        }
      };
    }
  },

  /**
   * 根据关卡ID获取用户进度
   */
  async getByStage(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { stageId } = ctx.params;

      // 查找关卡
      const stage = await strapi.db.query('api::stage.stage').findOne({
        where: { stage_id: stageId }
      });

      if (!stage) {
        return ctx.notFound('关卡不存在');
      }

      // 查找用户对该关卡的进度
      const userProgress = await strapi.db.query('api::user-stage-progress.user-stage-progress').findOne({
        where: {
          user: user.id,
          stage: stage.id
        },
        populate: {
          stage: {
            populate: {
              chapter: true
            }
          }
        }
      });

      if (!userProgress) {
        // 如果没有进度记录，返回默认数据
        ctx.body = {
          success: true,
          data: {
            stage: stage,
            stars: 0,
            best_score: 0,
            clear_count: 0,
            is_unlocked: false,
            rewards_claimed: {},
            battle_statistics: {}
          }
        };
        return;
      }

      ctx.body = {
        success: true,
        data: userProgress
      };
    } catch (error) {
      console.error('获取关卡进度失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_STAGE_PROGRESS_BY_STAGE_ERROR',
          message: '获取关卡进度失败'
        }
      };
    }
  },

  /**
   * 初始化用户关卡进度（解锁第一关）
   */
  async initializeProgress(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      // 查找第一关卡 1-1
      const firstStage = await strapi.db.query('api::stage.stage').findOne({
        where: { stage_id: '1-1' }
      });

      if (!firstStage) {
        return ctx.badRequest('第一关卡不存在');
      }

      // 检查是否已经有进度记录
      const existingProgress = await strapi.db.query('api::user-stage-progress.user-stage-progress').findOne({
        where: {
          user: user.id,
          stage: firstStage.id
        }
      });

      if (existingProgress) {
        ctx.body = {
          success: true,
          data: existingProgress,
          message: '进度已存在'
        };
        return;
      }

      // 创建第一关的进度记录
      const newProgress = await strapi.db.query('api::user-stage-progress.user-stage-progress').create({
        data: {
          user: user.id,
          stage: firstStage.id,
          stars: 0,
          best_score: 0,
          clear_count: 0,
          daily_attempts: 0,
          is_unlocked: true,
          rewards_claimed: {},
          battle_statistics: {}
        }
      });

      ctx.body = {
        success: true,
        data: newProgress,
        message: '初始化关卡进度成功'
      };
    } catch (error) {
      console.error('初始化关卡进度失败:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INITIALIZE_PROGRESS_ERROR',
          message: '初始化关卡进度失败'
        }
      };
    }
  }
};