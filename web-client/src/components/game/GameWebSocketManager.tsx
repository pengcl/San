import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { useGameWebSocket } from '../../hooks/useWebSocket';
import { logger } from '../../utils/logger';
import { config } from '../../config/env';

const GameWebSocketManager: React.FC = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const gameWS = useGameWebSocket();

  useEffect(() => {
    // 如果WebSocket被禁用，直接返回
    if (!config.enableWebSocket) {
      logger.info('WebSocket功能已禁用', undefined, 'GAME_WS_MANAGER');
      return;
    }

    if (!isAuthenticated) {
      // 用户未登录，断开连接
      if (gameWS.isConnected) {
        gameWS.disconnect();
        logger.info(
          '用户登出，断开游戏WebSocket连接',
          undefined,
          'GAME_WS_MANAGER'
        );
      }
      return;
    }

    // 用户已登录，建立连接
    if (!gameWS.isConnected && gameWS.status === 'disconnected') {
      gameWS.connect();
      logger.info(
        '用户已登录，建立游戏WebSocket连接',
        undefined,
        'GAME_WS_MANAGER'
      );
    }

    // 设置游戏消息监听器
    const cleanupHandlers: (() => void)[] = [];

    // 监听系统通知
    cleanupHandlers.push(
      gameWS.onGameMessage('notification', data => {
        dispatch(
          addNotification({
            type: data.type || 'info',
            title: data.title || '系统通知',
            message: data.message,
            duration: data.duration || 5000,
          })
        );
      })
    );

    // 监听服务器广播
    cleanupHandlers.push(
      gameWS.onGameMessage('broadcast', data => {
        dispatch(
          addNotification({
            type: 'info',
            title: '系统公告',
            message: data.message,
            duration: 8000,
          })
        );
        logger.info('收到服务器广播', data, 'GAME_WS_MANAGER');
      })
    );

    // 监听用户状态更新
    cleanupHandlers.push(
      gameWS.onGameMessage('user.update', data => {
        // 这里可以更新用户状态到Redux store
        logger.info('收到用户状态更新', data, 'GAME_WS_MANAGER');
      })
    );

    // 监听战斗邀请
    cleanupHandlers.push(
      gameWS.onGameMessage('battle.invite', data => {
        dispatch(
          addNotification({
            type: 'info',
            title: '战斗邀请',
            message: `${data.from} 邀请你进行战斗`,
            duration: 10000,
          })
        );
        logger.info('收到战斗邀请', data, 'GAME_WS_MANAGER');
      })
    );

    // 监听好友上线通知
    cleanupHandlers.push(
      gameWS.onGameMessage('friend.online', data => {
        dispatch(
          addNotification({
            type: 'info',
            title: '好友上线',
            message: `${data.username} 上线了`,
            duration: 3000,
          })
        );
      })
    );

    // 定期发送心跳
    const heartbeatInterval = setInterval(() => {
      if (gameWS.isConnected) {
        gameWS.user.heartbeat();
      }
    }, 30000); // 每30秒发送一次心跳

    // 清理函数
    return () => {
      cleanupHandlers.forEach(cleanup => cleanup());
      clearInterval(heartbeatInterval);
    };
  }, [isAuthenticated, gameWS, dispatch]);

  // 监听连接状态变化
  useEffect(() => {
    if (!isAuthenticated) return;

    const notificationId: string | null = null;

    if (gameWS.status === 'connected') {
      // 连接成功通知
      dispatch(
        addNotification({
          type: 'success',
          title: '连接成功',
          message: '游戏服务器连接成功',
          duration: 3000,
        })
      );
    } else if (gameWS.status === 'error') {
      // 连接错误通知
      dispatch(
        addNotification({
          type: 'error',
          title: '连接失败',
          message: '游戏服务器连接失败，请检查网络',
          duration: 5000,
        })
      );
    } else if (gameWS.status === 'reconnecting') {
      // 重连通知
      dispatch(
        addNotification({
          type: 'warning',
          title: '连接中断',
          message: '正在尝试重新连接游戏服务器...',
          duration: 0, // 不自动消失
        })
      );
    }

    return () => {
      if (notificationId) {
        // 这里可以移除特定通知，但当前通知系统还没有这个功能
      }
    };
  }, [gameWS.status, isAuthenticated, dispatch]);

  // 这个组件不渲染任何内容，只负责管理WebSocket连接
  return null;
};

export default GameWebSocketManager;
