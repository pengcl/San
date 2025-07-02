/**
 * achievement controller
 * 成就系统控制器
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::achievement.achievement', ({ strapi }) => ({
  /**
   * 获取成就列表
   */
  async find(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { category = 'all', status } = ctx.query;
      
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

      // 获取成就模板
      const achievements = await strapi.db.query('api::achievement.achievement').findMany({
        where: filters,
        orderBy: [{ category: 'asc' }, { order: 'asc' }]
      });

      // 获取用户成就进度
      const userAchievements = await strapi.db.query('api::user-achievement.user-achievement').findMany({
        where: { user: user.id },
        populate: { achievement: true }
      });

      // 创建用户成就状态映射
      const userAchievementMap = userAchievements.reduce((acc, ua) => {
        acc[ua.achievement.achievement_id] = ua;
        return acc;
      }, {});

      // 组合成就数据
      const achievementsWithProgress = achievements.map(achievement => {
        const userAchievement = userAchievementMap[achievement.achievement_id];
        
        // 如果是隐藏成就且用户未解锁，不显示
        if (achievement.is_hidden && (!userAchievement || userAchievement.status === 'locked')) {
          return null;
        }

        const achievementData = {
          id: achievement.id,
          achievementId: achievement.achievement_id,
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          type: achievement.type,
          rarity: achievement.rarity,
          points: achievement.points,
          icon: achievement.icon,
          requirements: achievement.requirements,
          rewards: achievement.rewards,
          tiers: achievement.tiers,
          status: userAchievement?.status || 'locked',
          progress: userAchievement?.progress || {},
          currentTier: userAchievement?.current_tier || 0,
          maxTier: userAchievement?.max_tier || (achievement.tiers ? Object.keys(achievement.tiers).length : 1),
          progressPercentage: userAchievement?.progress_percentage || 0,
          canClaim: userAchievement?.status === 'completed',
          completedAt: userAchievement?.completed_at,
          claimedAt: userAchievement?.claimed_at
        };

        return achievementData;
      }).filter(Boolean);

      // 按状态筛选
      let filteredAchievements = achievementsWithProgress;
      if (status) {
        filteredAchievements = achievementsWithProgress.filter(a => a.status === status);
      }

      // 按分类分组
      const groupedAchievements = filteredAchievements.reduce((acc, achievement) => {
        const category = achievement.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(achievement);
        return acc;
      }, {});

      // 计算统计信息
      const totalAchievements = achievementsWithProgress.length;
      const completedAchievements = achievementsWithProgress.filter(a => a.status === 'completed' || a.status === 'claimed').length;
      const totalPoints = achievementsWithProgress.filter(a => a.status === 'claimed').reduce((sum, a) => sum + a.points, 0);

      return ctx.body = {
        success: true,
        data: {
          achievements: filteredAchievements,
          groupedAchievements,
          statistics: {
            total: totalAchievements,
            completed: completedAchievements,
            percentage: totalAchievements > 0 ? (completedAchievements / totalAchievements * 100).toFixed(1) : 0,
            totalPoints
          },
          categories: ['combat', 'collection', 'progression', 'social', 'special']
        }
      };
    } catch (error) {
      console.error('获取成就列表失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '获取成就列表失败' }
      };
    }
  },

  /**
   * 更新成就进度
   */
  async updateProgress(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { achievementId, action, value = 1 } = ctx.request.body as any;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 获取成就模板
      const achievement = await strapi.db.query('api::achievement.achievement').findOne({
        where: { achievement_id: achievementId, is_active: true }
      });

      if (!achievement) {
        return ctx.body = {
          success: false,
          error: { message: '成就不存在' }
        };
      }

      // 获取或创建用户成就进度
      let userAchievement = await strapi.db.query('api::user-achievement.user-achievement').findOne({
        where: { user: user.id, achievement: achievement.id }
      });

      if (!userAchievement) {
        userAchievement = await strapi.db.query('api::user-achievement.user-achievement').create({
          data: {
            user: user.id,
            achievement: achievement.id,
            status: 'in_progress',
            progress: {},
            current_tier: 0,
            max_tier: achievement.tiers ? Object.keys(achievement.tiers).length : 1,
            unlocked_at: new Date()
          }
        });
      }

      // 如果成就已完成，不更新进度
      if (userAchievement.status === 'completed' || userAchievement.status === 'claimed') {
        return ctx.body = {
          success: true,
          data: {
            achievementId,
            alreadyCompleted: true
          }
        };
      }

      // 更新进度
      const currentProgress = userAchievement.progress || {};
      currentProgress[action] = (currentProgress[action] || 0) + value;

      // 检查完成状态
      let isCompleted = false;
      let currentTier = userAchievement.current_tier;
      let progressPercentage = 0;

      if (achievement.type === 'tiered' && achievement.tiers) {
        // 分级成就
        const tiers = achievement.tiers;
        const tierKeys = Object.keys(tiers).sort((a, b) => parseInt(a) - parseInt(b));
        
        for (const tierKey of tierKeys) {
          const tierRequirements = tiers[tierKey].requirements;
          let tierCompleted = true;
          
          for (const [key, targetValue] of Object.entries(tierRequirements)) {
            if ((currentProgress[key] || 0) < (targetValue as number)) {
              tierCompleted = false;
              break;
            }
          }
          
          if (tierCompleted) {
            currentTier = Math.max(currentTier, parseInt(tierKey));
          }
        }
        
        // 检查是否完成最高级
        const maxTierKey = tierKeys[tierKeys.length - 1];
        isCompleted = currentTier >= parseInt(maxTierKey);
        
        // 计算进度百分比
        if (tierKeys.length > 0) {
          progressPercentage = (currentTier / parseInt(maxTierKey)) * 100;
        }
      } else {
        // 单级成就
        const requirements = achievement.requirements;
        isCompleted = true;
        let totalProgress = 0;
        let maxProgress = 0;
        
        for (const [key, targetValue] of Object.entries(requirements)) {
          const currentValue = currentProgress[key] || 0;
          totalProgress += Math.min(currentValue, targetValue as number);
          maxProgress += targetValue as number;
          
          if (currentValue < (targetValue as number)) {
            isCompleted = false;
          }
        }
        
        progressPercentage = maxProgress > 0 ? (totalProgress / maxProgress) * 100 : 0;
      }

      // 更新用户成就
      const updatedUserAchievement = await strapi.db.query('api::user-achievement.user-achievement').update({
        where: { id: userAchievement.id },
        data: {
          progress: currentProgress,
          current_tier: currentTier,
          progress_percentage: progressPercentage,
          status: isCompleted ? 'completed' : 'in_progress',
          completed_at: isCompleted ? new Date() : null
        }
      });

      console.log(`成就进度更新: 用户${user.id}, 成就${achievementId}, 动作${action}, 值${value}`);

      return ctx.body = {
        success: true,
        data: {
          achievementId,
          progress: currentProgress,
          currentTier,
          progressPercentage,
          status: updatedUserAchievement.status,
          completed: isCompleted,
          newlyCompleted: isCompleted && userAchievement.status !== 'completed'
        }
      };
    } catch (error) {
      console.error('更新成就进度失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '更新成就进度失败' }
      };
    }
  },

  /**
   * 领取成就奖励
   */
  async claimReward(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { achievementId, tier } = ctx.request.body as any;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 获取用户成就
      const userAchievement = await strapi.db.query('api::user-achievement.user-achievement').findOne({
        where: { 
          user: user.id, 
          achievement: { achievement_id: achievementId }
        },
        populate: { achievement: true }
      });

      if (!userAchievement) {
        return ctx.body = {
          success: false,
          error: { message: '成就不存在' }
        };
      }

      if (userAchievement.status !== 'completed') {
        return ctx.body = {
          success: false,
          error: { message: '成就未完成' }
        };
      }

      // 确定奖励
      let rewards;
      if (userAchievement.achievement.type === 'tiered' && tier) {
        rewards = userAchievement.achievement.tiers[tier]?.rewards;
      } else {
        rewards = userAchievement.achievement.rewards;
      }

      if (!rewards) {
        return ctx.body = {
          success: false,
          error: { message: '奖励配置不存在' }
        };
      }

      // 发放奖励
      const rewardResults = [];
      for (const [rewardType, amount] of Object.entries(rewards)) {
        if (typeof amount === 'number') {
          rewardResults.push({
            type: rewardType,
            amount: amount,
            name: getRewardName(rewardType)
          });
        }
      }

      // 更新成就状态
      await strapi.db.query('api::user-achievement.user-achievement').update({
        where: { id: userAchievement.id },
        data: {
          status: 'claimed',
          claimed_at: new Date()
        }
      });

      console.log(`成就奖励领取: 用户${user.id}, 成就${achievementId}`);

      return ctx.body = {
        success: true,
        data: {
          achievementId,
          rewards: rewardResults,
          points: userAchievement.achievement.points,
          claimedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('领取成就奖励失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '领取成就奖励失败' }
      };
    }
  },

  /**
   * 获取成就统计
   */
  async getStatistics(ctx: Context) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 获取用户所有成就进度
      const userAchievements = await strapi.db.query('api::user-achievement.user-achievement').findMany({
        where: { user: user.id },
        populate: { achievement: true }
      });

      // 统计各分类成就
      const categoryStats = {};
      let totalPoints = 0;
      let totalCompleted = 0;

      userAchievements.forEach(ua => {
        const category = ua.achievement.category;
        if (!categoryStats[category]) {
          categoryStats[category] = {
            total: 0,
            completed: 0,
            points: 0
          };
        }

        categoryStats[category].total++;
        if (ua.status === 'completed' || ua.status === 'claimed') {
          categoryStats[category].completed++;
          totalCompleted++;
        }
        if (ua.status === 'claimed') {
          categoryStats[category].points += ua.achievement.points;
          totalPoints += ua.achievement.points;
        }
      });

      // 获取总成就数量
      const totalAchievements = await strapi.db.query('api::achievement.achievement').count({
        where: { is_active: true }
      });

      return ctx.body = {
        success: true,
        data: {
          totalAchievements,
          completedAchievements: totalCompleted,
          completionPercentage: totalAchievements > 0 ? (totalCompleted / totalAchievements * 100).toFixed(1) : 0,
          totalPoints,
          categoryStats
        }
      };
    } catch (error) {
      console.error('获取成就统计失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '获取成就统计失败' }
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
    rare_materials: '稀有材料',
    legendary_summon_ticket: '传说召唤券',
    awakening_crystals: '觉醒水晶'
  };
  
  return rewardNames[rewardType] || rewardType;
}