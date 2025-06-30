import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { wsService } from '../services/websocket';
import type { WebSocketMessage, WebSocketStatus } from '../services/websocket';
import {
  setStatus,
  setError,
  incrementMessagesSent,
  incrementMessagesReceived,
  selectWebSocketStatus,
  selectIsConnected,
} from '../store/slices/websocketSlice';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const dispatch = useDispatch();
  const status = useSelector(selectWebSocketStatus);
  const isConnected = useSelector(selectIsConnected);
  const optionsRef = useRef(options);

  // 更新选项引用
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // 连接WebSocket
  const connect = useCallback(async () => {
    if (!config.enableWebSocket) {
      logger.info('WebSocket功能已禁用，跳过连接', undefined, 'WEBSOCKET_HOOK');
      return;
    }
    
    try {
      await wsService.connect();
      optionsRef.current.onConnect?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '连接失败';
      dispatch(setError(errorMessage));
      optionsRef.current.onError?.(errorMessage);
      logger.error('WebSocket连接失败', error, 'WEBSOCKET_HOOK');
    }
  }, [dispatch]);

  // 断开连接
  const disconnect = useCallback(() => {
    wsService.disconnect();
    optionsRef.current.onDisconnect?.();
  }, []);

  // 发送消息
  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      const success = wsService.send(message);
      if (success) {
        dispatch(incrementMessagesSent());
      }
      return success;
    },
    [dispatch]
  );

  // 监听消息
  const onMessage = useCallback(
    (messageType: string, callback: (data: any) => void) => {
      wsService.on(messageType, callback);
      return () => wsService.off(messageType, callback);
    },
    []
  );

  // 监听特定消息类型（一次性）
  const onceMessage = useCallback(
    (messageType: string, callback: (data: any) => void) => {
      const wrappedCallback = (data: any) => {
        callback(data);
        wsService.off(messageType, wrappedCallback);
      };
      wsService.on(messageType, wrappedCallback);
      return () => wsService.off(messageType, wrappedCallback);
    },
    []
  );

  // 初始化WebSocket连接和状态监听
  useEffect(() => {
    // 监听连接状态变化
    const handleStatusChange = (newStatus: WebSocketStatus) => {
      dispatch(setStatus(newStatus));

      switch (newStatus) {
        case 'connected':
          optionsRef.current.onConnect?.();
          break;
        case 'disconnected':
          optionsRef.current.onDisconnect?.();
          break;
        case 'error':
          optionsRef.current.onError?.('连接错误');
          break;
      }
    };

    // 监听全局消息
    const handleGlobalMessage = (message: WebSocketMessage) => {
      dispatch(incrementMessagesReceived());
      optionsRef.current.onMessage?.(message);
    };

    wsService.onStatusChange(handleStatusChange);
    wsService.on('*', handleGlobalMessage);

    // 自动连接
    if (options.autoConnect && !wsService.isConnected()) {
      connect();
    }

    return () => {
      wsService.off('*', handleGlobalMessage);
      // 注意：状态监听器没有提供移除方法，这在实际项目中需要改进
    };
  }, [dispatch, connect, options.autoConnect]);

  return {
    status,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    onMessage,
    onceMessage,
  };
};

// 游戏专用WebSocket Hook
export const useGameWebSocket = () => {
  const webSocket = useWebSocket({
    autoConnect: true,
    onConnect: () => {
      logger.info('游戏WebSocket连接成功', undefined, 'GAME_WS');
    },
    onDisconnect: () => {
      logger.warn('游戏WebSocket连接断开', undefined, 'GAME_WS');
    },
    onError: error => {
      logger.error('游戏WebSocket错误', error, 'GAME_WS');
    },
  });

  // 游戏专用消息发送方法
  const sendGameMessage = useCallback(
    (type: string, payload?: any) => {
      return webSocket.sendMessage({
        type: `game.${type}`,
        payload,
      });
    },
    [webSocket]
  );

  // 监听游戏消息
  const onGameMessage = useCallback(
    (messageType: string, callback: (data: any) => void) => {
      return webSocket.onMessage(`game.${messageType}`, callback);
    },
    [webSocket]
  );

  // 战斗相关消息
  const battle = {
    startBattle: (battleData: any) =>
      sendGameMessage('battle.start', battleData),
    useSkill: (skillData: any) => sendGameMessage('battle.skill', skillData),
    endTurn: () => sendGameMessage('battle.endTurn'),
    onBattleUpdate: (callback: (data: any) => void) =>
      onGameMessage('battle.update', callback),
    onBattleEnd: (callback: (data: any) => void) =>
      onGameMessage('battle.end', callback),
  };

  // 聊天相关消息
  const chat = {
    sendMessage: (message: string, channel = 'world') =>
      sendGameMessage('chat.message', { message, channel }),
    onMessage: (callback: (data: any) => void) =>
      onGameMessage('chat.message', callback),
  };

  // 用户状态相关
  const user = {
    updateStatus: (status: string) =>
      sendGameMessage('user.status', { status }),
    heartbeat: () => sendGameMessage('user.heartbeat'),
    onStatusUpdate: (callback: (data: any) => void) =>
      onGameMessage('user.status', callback),
  };

  return {
    ...webSocket,
    sendGameMessage,
    onGameMessage,
    battle,
    chat,
    user,
  };
};

export default useWebSocket;
