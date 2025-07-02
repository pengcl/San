/**
 * friendship controller
 * 好友系统控制器
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::friendship.friendship', ({ strapi }) => ({
  /**
   * 获取好友列表
   */
  async find(ctx: Context) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 获取用户的所有好友关系
      const friendships = await strapi.db.query('api::friendship.friendship').findMany({
        where: {
          $or: [
            { user: user.id },
            { friend: user.id }
          ]
        },
        populate: {
          user: {
            select: ['id', 'username', 'email']
          },
          friend: {
            select: ['id', 'username', 'email']
          }
        }
      });

      // 格式化好友数据
      const friends = friendships.map(friendship => {
        const friend = friendship.user.id === user.id ? friendship.friend : friendship.user;
        
        return {
          id: friendship.id,
          friendId: friend.id,
          username: friend.username,
          email: friend.email,
          friendshipLevel: friendship.friendship_level,
          friendshipPoints: friendship.friendship_points,
          dailyInteracted: friendship.daily_interacted,
          lastInteraction: friendship.last_interaction,
          totalInteractions: friendship.total_interactions,
          // 这里可以添加好友的其他信息，如头像、等级等
          isOnline: false, // 简化处理，实际需要从用户会话中获取
          lastSeen: new Date().toISOString()
        };
      });

      return ctx.body = {
        success: true,
        data: {
          friends,
          totalFriends: friends.length,
          onlineFriends: friends.filter(f => f.isOnline).length
        }
      };
    } catch (error) {
      console.error('获取好友列表失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '获取好友列表失败' }
      };
    }
  },

  /**
   * 搜索用户
   */
  async searchUsers(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { username, email, page = 1, limit = 20 } = ctx.query;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      if (!username && !email) {
        return ctx.body = {
          success: false,
          error: { message: '请提供用户名或邮箱进行搜索' }
        };
      }

      // 构建搜索条件
      const filters: any = {
        id: { $ne: user.id } // 排除自己
      };

      if (username) {
        filters.username = { $containsi: username };
      }
      if (email) {
        filters.email = { $containsi: email };
      }

      // 搜索用户
      const users = await strapi.db.query('plugin::users-permissions.user').findMany({
        where: filters,
        select: ['id', 'username', 'email'],
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string)
      });

      // 获取当前用户的好友ID列表
      const friendships = await strapi.db.query('api::friendship.friendship').findMany({
        where: {
          $or: [
            { user: user.id },
            { friend: user.id }
          ]
        },
        select: ['user', 'friend']
      });

      const friendIds = new Set();
      friendships.forEach(f => {
        if (f.user.id === user.id) {
          friendIds.add(f.friend.id);
        } else {
          friendIds.add(f.user.id);
        }
      });

      // 获取待处理的好友申请
      const pendingRequests = await strapi.db.query('api::friend-request.friend-request').findMany({
        where: {
          $or: [
            { from_user: user.id, status: 'pending' },
            { to_user: user.id, status: 'pending' }
          ]
        },
        select: ['from_user', 'to_user', 'status']
      });

      const pendingIds = new Set();
      pendingRequests.forEach(req => {
        if (req.from_user.id === user.id) {
          pendingIds.add(req.to_user.id);
        } else {
          pendingIds.add(req.from_user.id);
        }
      });

      // 添加好友状态信息
      const usersWithStatus = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        isFriend: friendIds.has(u.id),
        hasPendingRequest: pendingIds.has(u.id),
        canSendRequest: !friendIds.has(u.id) && !pendingIds.has(u.id)
      }));

      return ctx.body = {
        success: true,
        data: {
          users: usersWithStatus,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: users.length
          }
        }
      };
    } catch (error) {
      console.error('搜索用户失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '搜索用户失败' }
      };
    }
  },

  /**
   * 发送好友申请
   */
  async sendFriendRequest(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { friendId, message = '' } = ctx.request.body as any;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      if (!friendId || friendId === user.id) {
        return ctx.body = {
          success: false,
          error: { message: '无效的好友ID' }
        };
      }

      // 检查目标用户是否存在
      const targetUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: friendId }
      });

      if (!targetUser) {
        return ctx.body = {
          success: false,
          error: { message: '用户不存在' }
        };
      }

      // 检查是否已经是好友
      const existingFriendship = await strapi.db.query('api::friendship.friendship').findOne({
        where: {
          $or: [
            { user: user.id, friend: friendId },
            { user: friendId, friend: user.id }
          ]
        }
      });

      if (existingFriendship) {
        return ctx.body = {
          success: false,
          error: { message: '您们已经是好友了' }
        };
      }

      // 检查是否有待处理的申请
      const existingRequest = await strapi.db.query('api::friend-request.friend-request').findOne({
        where: {
          $or: [
            { from_user: user.id, to_user: friendId, status: 'pending' },
            { from_user: friendId, to_user: user.id, status: 'pending' }
          ]
        }
      });

      if (existingRequest) {
        return ctx.body = {
          success: false,
          error: { message: '已有待处理的好友申请' }
        };
      }

      // 创建好友申请
      const friendRequest = await strapi.db.query('api::friend-request.friend-request').create({
        data: {
          from_user: user.id,
          to_user: friendId,
          message: message,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后过期
        }
      });

      console.log(`好友申请发送: 用户${user.id} 向用户${friendId} 发送好友申请`);

      return ctx.body = {
        success: true,
        data: {
          requestId: friendRequest.id,
          targetUser: {
            id: targetUser.id,
            username: targetUser.username
          },
          message: '好友申请已发送'
        }
      };
    } catch (error) {
      console.error('发送好友申请失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '发送好友申请失败' }
      };
    }
  },

  /**
   * 处理好友申请
   */
  async handleFriendRequest(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { requestId, action } = ctx.request.body as any;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      if (!['accept', 'reject'].includes(action)) {
        return ctx.body = {
          success: false,
          error: { message: '无效的操作' }
        };
      }

      // 获取好友申请
      const friendRequest = await strapi.db.query('api::friend-request.friend-request').findOne({
        where: { 
          id: requestId,
          to_user: user.id,
          status: 'pending'
        },
        populate: {
          from_user: {
            select: ['id', 'username']
          }
        }
      });

      if (!friendRequest) {
        return ctx.body = {
          success: false,
          error: { message: '好友申请不存在或已处理' }
        };
      }

      // 更新申请状态
      const newStatus = action === 'accept' ? 'accepted' : 'rejected';
      await strapi.db.query('api::friend-request.friend-request').update({
        where: { id: requestId },
        data: {
          status: newStatus,
          responded_at: new Date()
        }
      });

      let friendshipResult = null;

      // 如果接受申请，创建好友关系
      if (action === 'accept') {
        friendshipResult = await strapi.db.query('api::friendship.friendship').create({
          data: {
            user: friendRequest.from_user.id,
            friend: user.id,
            friendship_level: 1,
            friendship_points: 0,
            daily_interacted: false,
            total_interactions: 0,
            last_interaction: new Date()
          }
        });

        console.log(`好友关系建立: 用户${friendRequest.from_user.id} 和用户${user.id} 成为好友`);
      }

      return ctx.body = {
        success: true,
        data: {
          action,
          requestId,
          fromUser: friendRequest.from_user,
          friendshipCreated: !!friendshipResult,
          message: action === 'accept' ? '好友申请已接受' : '好友申请已拒绝'
        }
      };
    } catch (error) {
      console.error('处理好友申请失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '处理好友申请失败' }
      };
    }
  },

  /**
   * 获取好友申请列表
   */
  async getFriendRequests(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { type = 'received' } = ctx.query;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 构建查询条件
      const filters: any = { status: 'pending' };
      if (type === 'received') {
        filters.to_user = user.id;
      } else if (type === 'sent') {
        filters.from_user = user.id;
      }

      const requests = await strapi.db.query('api::friend-request.friend-request').findMany({
        where: filters,
        populate: {
          from_user: {
            select: ['id', 'username', 'email']
          },
          to_user: {
            select: ['id', 'username', 'email']
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formattedRequests = requests.map(request => ({
        id: request.id,
        message: request.message,
        status: request.status,
        expiresAt: request.expires_at,
        createdAt: request.createdAt,
        fromUser: request.from_user,
        toUser: request.to_user,
        isExpired: new Date() > new Date(request.expires_at)
      }));

      return ctx.body = {
        success: true,
        data: {
          requests: formattedRequests,
          type,
          total: formattedRequests.length
        }
      };
    } catch (error) {
      console.error('获取好友申请失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '获取好友申请失败' }
      };
    }
  },

  /**
   * 删除好友
   */
  async removeFriend(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { friendId } = ctx.request.body as any;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 查找好友关系
      const friendship = await strapi.db.query('api::friendship.friendship').findOne({
        where: {
          $or: [
            { user: user.id, friend: friendId },
            { user: friendId, friend: user.id }
          ]
        }
      });

      if (!friendship) {
        return ctx.body = {
          success: false,
          error: { message: '好友关系不存在' }
        };
      }

      // 删除好友关系
      await strapi.db.query('api::friendship.friendship').delete({
        where: { id: friendship.id }
      });

      console.log(`好友关系删除: 用户${user.id} 删除了好友${friendId}`);

      return ctx.body = {
        success: true,
        data: {
          message: '好友已删除',
          friendId
        }
      };
    } catch (error) {
      console.error('删除好友失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '删除好友失败' }
      };
    }
  },

  /**
   * 赠送体力
   */
  async sendEnergy(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { friendId, amount = 5 } = ctx.request.body as any;
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: { message: '用户未认证' }
        };
      }

      // 检查好友关系
      const friendship = await strapi.db.query('api::friendship.friendship').findOne({
        where: {
          $or: [
            { user: user.id, friend: friendId },
            { user: friendId, friend: user.id }
          ]
        }
      });

      if (!friendship) {
        return ctx.body = {
          success: false,
          error: { message: '不是好友关系' }
        };
      }

      // 检查今日是否已互动
      if (friendship.daily_interacted) {
        return ctx.body = {
          success: false,
          error: { message: '今日已互动过了' }
        };
      }

      // 这里应该调用资源系统给好友增加体力
      // 简化处理，只更新好友关系数据
      await strapi.db.query('api::friendship.friendship').update({
        where: { id: friendship.id },
        data: {
          daily_interacted: true,
          last_interaction: new Date(),
          total_interactions: friendship.total_interactions + 1,
          friendship_points: friendship.friendship_points + 10
        }
      });

      console.log(`好友互动: 用户${user.id} 向好友${friendId} 赠送体力${amount}`);

      return ctx.body = {
        success: true,
        data: {
          message: '体力赠送成功',
          friendId,
          amount,
          friendshipPoints: friendship.friendship_points + 10
        }
      };
    } catch (error) {
      console.error('赠送体力失败:', error);
      return ctx.body = {
        success: false,
        error: { message: '赠送体力失败' }
      };
    }
  }
}));