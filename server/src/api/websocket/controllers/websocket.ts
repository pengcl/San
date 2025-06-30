import webSocketService from '../../../websocket/websocket.service';

export default {
  /**
   * 获取WebSocket连接状态
   */
  async getStatus(ctx) {
    try {
      const stats = {
        totalClients: webSocketService.getConnectedClients(),
        authenticatedClients: webSocketService.getAuthenticatedClients(),
        serverTime: new Date().toISOString(),
      };

      ctx.body = {
        success: true,
        data: stats,
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * 向特定用户发送消息
   */
  async sendToUser(ctx) {
    try {
      const { userId, message } = ctx.request.body;

      if (!userId || !message) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: '缺少必要参数: userId 和 message',
        };
        return;
      }

      webSocketService.sendToUser(userId, {
        type: 'server_message',
        data: message,
        timestamp: Date.now(),
      });

      ctx.body = {
        success: true,
        message: '消息已发送',
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * 广播消息给所有已认证用户
   */
  async broadcast(ctx) {
    try {
      const { message } = ctx.request.body;

      if (!message) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: '缺少必要参数: message',
        };
        return;
      }

      webSocketService.broadcast({
        type: 'server_broadcast',
        data: message,
        timestamp: Date.now(),
      });

      ctx.body = {
        success: true,
        message: '广播消息已发送',
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * 发送游戏通知
   */
  async sendGameNotification(ctx) {
    try {
      const { userId, type, data } = ctx.request.body;

      if (!userId || !type) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: '缺少必要参数: userId 和 type',
        };
        return;
      }

      webSocketService.sendToUser(userId, {
        type: 'game_notification',
        data: {
          notificationType: type,
          ...data,
        },
        timestamp: Date.now(),
      });

      ctx.body = {
        success: true,
        message: '游戏通知已发送',
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message,
      };
    }
  },
};