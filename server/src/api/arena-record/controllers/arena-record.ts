/**
 * 竞技场记录控制器
 */

import { Context } from 'koa';

export default {
  /**
   * 获取用户竞技场记录
   */
  async find(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const arenaRecord = await strapi.db.query('api::arena-record.arena-record').findOne({
        where: { user: user.id },
        populate: { user: true }
      });

      if (!arenaRecord) {
        // 如果用户没有竞技场记录，创建一个默认的
        const newRecord = await strapi.db.query('api::arena-record.arena-record').create({
          data: {
            user: user.id,
            current_rank: 999999,
            best_rank: 999999,
            points: 1000,
            season_id: 1
          }
        });

        ctx.body = {
          success: true,
          data: newRecord
        };
      } else {
        ctx.body = {
          success: true,
          data: arenaRecord
        };
      }
    } catch (error) {
      console.error('获取竞技场记录错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_ARENA_RECORD_ERROR',
          message: '获取竞技场记录失败'
        }
      };
    }
  },

  /**
   * 更新竞技场记录
   */
  async update(ctx: Context) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('需要登录');
      }

      const { points, rank, battleResult } = ctx.request.body;
      
      const arenaRecord = await strapi.db.query('api::arena-record.arena-record').findOne({
        where: { user: user.id }
      });

      if (!arenaRecord) {
        return ctx.notFound('竞技场记录不存在');
      }

      const updateData: any = {
        last_battle_at: new Date()
      };

      // 更新积分
      if (points !== undefined) {
        updateData.points = Math.max(0, arenaRecord.points + points);
      }

      // 更新排名
      if (rank !== undefined) {
        updateData.current_rank = rank;
        updateData.best_rank = Math.min(arenaRecord.best_rank, rank);
      }

      // 更新战斗统计
      if (battleResult) {
        updateData.total_battles = arenaRecord.total_battles + 1;
        
        if (battleResult === 'victory') {
          updateData.victories = arenaRecord.victories + 1;
          updateData.win_streak = arenaRecord.win_streak + 1;
        } else {
          updateData.defeats = arenaRecord.defeats + 1;
          updateData.win_streak = 0;
        }
      }

      const updatedRecord = await strapi.db.query('api::arena-record.arena-record').update({
        where: { id: arenaRecord.id },
        data: updateData
      });

      ctx.body = {
        success: true,
        data: updatedRecord
      };
    } catch (error) {
      console.error('更新竞技场记录错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'UPDATE_ARENA_RECORD_ERROR',
          message: '更新竞技场记录失败'
        }
      };
    }
  }
};