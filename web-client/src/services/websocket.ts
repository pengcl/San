import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: number;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  timeout?: number;
}

export type WebSocketStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'reconnecting';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private status: WebSocketStatus = 'disconnected';
  private messageQueue: WebSocketMessage[] = [];
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private statusListeners: ((status: WebSocketStatus) => void)[] = [];

  constructor(wsConfig: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.wsUrl,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      timeout: 10000,
      ...wsConfig,
    };
  }

  // 生成带token的WebSocket URL
  private buildWebSocketUrl(): string {
    const baseUrl = this.config.url;
    // 生成一个简单的token（实际应用中应该使用JWT或从认证系统获取）
    const token = this.generateToken();
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${token}`;
  }

  // 生成简单token（实际项目中应该从认证系统获取）
  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // 连接WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.setStatus('connecting');
      const wsUrl = this.buildWebSocketUrl();
      logger.info('尝试连接WebSocket', { url: wsUrl }, 'WEBSOCKET');

      try {
        this.ws = new WebSocket(wsUrl, this.config.protocols);

        const connectTimeout = setTimeout(() => {
          logger.error(
            'WebSocket连接超时',
            { url: wsUrl },
            'WEBSOCKET'
          );
          this.ws?.close();
          reject(new Error('连接超时'));
        }, this.config.timeout);

        this.ws.onopen = () => {
          clearTimeout(connectTimeout);
          this.setStatus('connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.processMessageQueue();
          logger.info(
            'WebSocket连接成功',
            { url: this.config.url },
            'WEBSOCKET'
          );
          resolve();
        };

        this.ws.onmessage = event => {
          this.handleMessage(event);
        };

        this.ws.onclose = event => {
          clearTimeout(connectTimeout);
          this.handleClose(event);
        };

        this.ws.onerror = event => {
          clearTimeout(connectTimeout);
          this.handleError(event);
          reject(new Error('WebSocket连接失败'));
        };
      } catch (error) {
        logger.error('创建WebSocket连接失败', error, 'WEBSOCKET');
        this.setStatus('error');
        reject(error);
      }
    });
  }

  // 断开连接
  disconnect(): void {
    logger.info('主动断开WebSocket连接', undefined, 'WEBSOCKET');
    this.stopReconnect();
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, '主动断开');
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  // 发送消息
  send(message: WebSocketMessage): boolean {
    if (!this.isConnected()) {
      logger.warn('WebSocket未连接，消息已加入队列', message, 'WEBSOCKET');
      this.messageQueue.push(message);
      return false;
    }

    try {
      const payload = {
        ...message,
        timestamp: Date.now(),
        id: message.id || this.generateMessageId(),
      };

      this.ws!.send(JSON.stringify(payload));
      logger.debug('发送WebSocket消息', payload, 'WEBSOCKET');
      return true;
    } catch (error) {
      logger.error('发送WebSocket消息失败', error, 'WEBSOCKET');
      return false;
    }
  }

  // 监听消息类型
  on(messageType: string, callback: (data: any) => void): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType)!.push(callback);
    logger.debug(`注册WebSocket监听器: ${messageType}`, undefined, 'WEBSOCKET');
  }

  // 取消监听
  off(messageType: string, callback?: (data: any) => void): void {
    if (!this.listeners.has(messageType)) {
      return;
    }

    if (callback) {
      const callbacks = this.listeners.get(messageType)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(messageType);
    }

    logger.debug(`取消WebSocket监听器: ${messageType}`, undefined, 'WEBSOCKET');
  }

  // 监听连接状态变化
  onStatusChange(callback: (status: WebSocketStatus) => void): void {
    this.statusListeners.push(callback);
  }

  // 获取当前状态
  getStatus(): WebSocketStatus {
    return this.status;
  }

  // 是否已连接
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // 私有方法

  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusListeners.forEach(callback => callback(status));
      logger.info(`WebSocket状态变更: ${status}`, undefined, 'WEBSOCKET');
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      logger.debug('收到WebSocket消息', message, 'WEBSOCKET');

      // 处理心跳响应
      if (message.type === 'pong') {
        return;
      }

      // 分发消息给监听器
      const callbacks = this.listeners.get(message.type);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(message.payload);
          } catch (error) {
            logger.error(
              `WebSocket消息处理器错误: ${message.type}`,
              error,
              'WEBSOCKET'
            );
          }
        });
      }

      // 分发给全局监听器
      const globalCallbacks = this.listeners.get('*');
      if (globalCallbacks) {
        globalCallbacks.forEach(callback => {
          try {
            callback(message);
          } catch (error) {
            logger.error('WebSocket全局消息处理器错误', error, 'WEBSOCKET');
          }
        });
      }
    } catch (error) {
      logger.error(
        '解析WebSocket消息失败',
        { error, data: event.data },
        'WEBSOCKET'
      );
    }
  }

  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();

    if (event.code === 1000) {
      // 正常关闭
      this.setStatus('disconnected');
      logger.info(
        'WebSocket正常关闭',
        { code: event.code, reason: event.reason },
        'WEBSOCKET'
      );
    } else {
      // 异常关闭，尝试重连
      this.setStatus('disconnected');
      logger.warn(
        'WebSocket异常关闭',
        { code: event.code, reason: event.reason },
        'WEBSOCKET'
      );
      this.attemptReconnect();
    }
  }

  private handleError(event: Event): void {
    this.setStatus('error');
    logger.error('WebSocket错误', event, 'WEBSOCKET');
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      logger.error(
        'WebSocket重连次数超限',
        {
          attempts: this.reconnectAttempts,
          max: this.config.maxReconnectAttempts,
        },
        'WEBSOCKET'
      );
      this.setStatus('error');
      return;
    }

    this.reconnectAttempts++;
    this.setStatus('reconnecting');

    logger.info(
      `WebSocket重连尝试 ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`,
      undefined,
      'WEBSOCKET'
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        logger.error('WebSocket重连失败', error, 'WEBSOCKET');
      });
    }, this.config.reconnectInterval);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift()!;
      this.send(message);
    }
  }

  private generateMessageId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

// 创建单例WebSocket服务实例
export const wsService = new WebSocketService();

export default wsService;
