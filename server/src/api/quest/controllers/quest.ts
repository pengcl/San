/**
 * quest controller
 * 任务系统控制器
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::quest.quest', ({ strapi }) => ({
  /**
   * 获取可用任务列表
   */
  async find(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { category = 'all', type } = ctx.query;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 构建查询条件
      const filters: any = { is_active: true };
      if (category !== 'all') {
        filters.category = category;
      }
      if (type) {
        filters.type = type;
      }

      // 获取任务模板
      const quests = await strapi.db.query('api::quest.quest').findMany({
        where: filters,
        orderBy: { priority: 'asc' }
      });

      // 获取用户任务进度
      const userQuests = await strapi.db.query('api::user-quest.user-quest').findMany({
        where: { user: user.id },
        populate: { quest: true }
      });

      // 创建用户任务状态映射
      const userQuestMap = userQuests.reduce((acc, uq) => {
        acc[uq.quest.quest_id] = uq;
        return acc;
      }, {});

      // 组合任务数据
      const questsWithProgress = quests.map(quest => {
        const userQuest = userQuestMap[quest.quest_id];
        
        return {
          id: quest.id,
          questId: quest.quest_id,
          name: quest.name,
          description: quest.description,
          category: quest.category,
          type: quest.type,
          requirements: quest.requirements,
          rewards: quest.rewards,
          unlockLevel: quest.unlock_level,
          priority: quest.priority,
          isRepeatable: quest.is_repeatable,
          resetType: quest.reset_type,
          icon: quest.icon,
          status: userQuest?.status || 'not_started',
          progress: userQuest?.progress || {},
          targetValues: userQuest?.target_values || quest.requirements,
          canClaim: userQuest?.status === 'completed',
          expiresAt: userQuest?.expires_at
        };
      });

      return ctx.body = {
        success: true,
        data: {
          quests: questsWithProgress,
          categories: ['daily', 'weekly', 'main', 'side', 'achievement', 'event']
        }
      };
    } catch (error) {
      console.error('获取任务列表失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '获取任务列表失败' }
      };
    }
  },

  /**
   * 获取每日任务
   */
  async getDailyQuests(ctx: Context) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 获取今日的每日任务
      const today = new Date().toISOString().split('T')[0];
      
      const dailyQuests = await strapi.db.query('api::quest.quest').findMany({
        where: { 
          category: 'daily',
          is_active: true
        },
        orderBy: { priority: 'asc' }
      });

      // 获取用户今日任务进度
      const userDailyQuests = await strapi.db.query('api::user-quest.user-quest').findMany({
        where: { 
          user: user.id,
          quest: { $in: dailyQuests.map(q => q.id) },
          // 这里应该检查是否为今日创建的任务
        },
        populate: { quest: true }
      });

      // 如果用户没有今日任务，创建它们
      const existingQuestIds = userDailyQuests.map(uq => uq.quest.quest_id);
      const missingQuests = dailyQuests.filter(q => !existingQuestIds.includes(q.quest_id));

      for (const quest of missingQuests) {
        await strapi.db.query('api::user-quest.user-quest').create({
          data: {
            user: user.id,
            quest: quest.id,
            status: 'in_progress',
            progress: {},
            target_values: quest.requirements,
            started_at: new Date(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
          }
        });
      }

      // 重新获取完整的用户任务数据
      const allUserDailyQuests = await strapi.db.query('api::user-quest.user-quest').findMany({
        where: { 
          user: user.id,
          quest: { $in: dailyQuests.map(q => q.id) }
        },
        populate: { quest: true }
      });

      const questsWithProgress = allUserDailyQuests.map(userQuest => {
        const quest = userQuest.quest;
        
        return {
          id: userQuest.id,
          questId: quest.quest_id,
          name: quest.name,
          description: quest.description,
          requirements: quest.requirements,
          rewards: quest.rewards,
          status: userQuest.status,
          progress: userQuest.progress,
          targetValues: userQuest.target_values,
          canClaim: userQuest.status === 'completed',
          expiresAt: userQuest.expires_at
        };
      });

      // 计算完成情况
      const completedCount = questsWithProgress.filter(q => q.status === 'completed' || q.status === 'claimed').length;
      const totalCount = questsWithProgress.length;

      return ctx.body = {
        success: true,
        data: {
          quests: questsWithProgress,
          summary: {
            completed: completedCount,
            total: totalCount,
            canClaimAll: completedCount === totalCount && questsWithProgress.some(q => q.status === 'completed')
          },
          resetTime: '05:00:00'
        }
      };
    } catch (error) {
      console.error('获取每日任务失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '获取每日任务失败' }
      };
    }
  },

  /**
   * 更新任务进度
   */
  async updateProgress(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { questId, action, value = 1 } = ctx.request.body as any;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 获取任务模板
      const quest = await strapi.db.query('api::quest.quest').findOne({
        where: { quest_id: questId, is_active: true }
      });

      if (!quest) {
        return ctx.body = {
          success: false,
          error: { message: '任务不存在' }
        };
      }

      // 获取或创建用户任务进度
      let userQuest = await strapi.db.query('api::user-quest.user-quest').findOne({
        where: { user: user.id, quest: quest.id }
      });

      if (!userQuest) {
        userQuest = await strapi.db.query('api::user-quest.user-quest').create({
          data: {
            user: user.id,
            quest: quest.id,
            status: 'in_progress',
            progress: {},
            target_values: quest.requirements,
            started_at: new Date()
          }
        });
      }

      // 如果任务已完成或已过期，不更新进度
      if (userQuest.status === 'completed' || userQuest.status === 'claimed') {
        return ctx.body = {
          success: false,
          error: { message: '任务已完成' }
        };
      }

      // 更新进度
      const currentProgress = userQuest.progress || {};
      currentProgress[action] = (currentProgress[action] || 0) + value;

      // 检查是否完成
      const requirements = quest.requirements;
      let isCompleted = true;
      
      for (const [key, targetValue] of Object.entries(requirements)) {
        if ((currentProgress[key] || 0) < (targetValue as number)) {
          isCompleted = false;
          break;
        }
      }

      // 更新用户任务
      const updatedUserQuest = await strapi.db.query('api::user-quest.user-quest').update({
        where: { id: userQuest.id },
        data: {
          progress: currentProgress,
          status: isCompleted ? 'completed' : 'in_progress',
          completed_at: isCompleted ? new Date() : null
        }
      });

      console.log(`任务进度更新: 用户${user.id}, 任务${questId}, 动作${action}, 值${value}`);

      return ctx.body = {
        success: true,
        data: {
          questId,
          progress: currentProgress,
          status: updatedUserQuest.status,
          completed: isCompleted
        }
      };
    } catch (error) {
      console.error('更新任务进度失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '更新任务进度失败' }
      };
    }
  },

  /**
   * 领取任务奖励
   */
  async claimReward(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { questId } = ctx.request.body as any;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 获取用户任务
      const userQuest = await strapi.db.query('api::user-quest.user-quest').findOne({
        where: { 
          user: user.id, 
          quest: { quest_id: questId }
        },
        populate: { quest: true }
      });

      if (!userQuest) {
        return ctx.body = {
          success: false,
          error: { message: '任务不存在' }
        };
      }

      if (userQuest.status !== 'completed') {
        return ctx.body = {
          success: false,
          error: { message: '任务未完成' }
        };
      }

      // 发放奖励
      const rewards = userQuest.quest.rewards;
      const rewardResults = [];

      for (const [rewardType, amount] of Object.entries(rewards)) {
        if (typeof amount === 'number') {
          // 这里应该调用资源系统发放奖励
          // 简化处理，记录奖励信息
          rewardResults.push({
            type: rewardType,
            amount: amount,
            name: getRewardName(rewardType)
          });
        }
      }

      // 更新任务状态
      await strapi.db.query('api::user-quest.user-quest').update({
        where: { id: userQuest.id },
        data: {
          status: 'claimed',
          claimed_at: new Date()
        }
      });

      console.log(`任务奖励领取: 用户${user.id}, 任务${questId}`);

      return ctx.body = {
        success: true,
        data: {
          questId,
          rewards: rewardResults,
          claimedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('领取任务奖励失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '领取任务奖励失败' }
      };
    }
  }
}));

/**
 * 获取奖励名称
 */
function getRewardName(rewardType: string): string {
  const rewardNames: Record<string, string> = {
    gold: '金币',
    gems: '元宝',
    energy: '体力',
    honor: '荣誉',
    skill_books: '技能书',
    enhancement_stones: '强化石',
    hero_fragments: '武将碎片',
    rare_materials: '稀有材料'
  };
  
  return rewardNames[rewardType] || rewardType;
}