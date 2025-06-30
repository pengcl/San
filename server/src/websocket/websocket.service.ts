import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import { URL } from 'url';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

interface GameClient {
  ws: WebSocket;
  userId?: string;
  authenticated: boolean;
  lastPing?: number;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, GameClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: '/',
      verifyClient: this.verifyClient.bind(this),
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();

    console.log('🔗 WebSocket服务已启动');
  }

  private verifyClient(info: { req: IncomingMessage }) {
    // 可以在这里添加身份验证逻辑
    const url = new URL(info.req.url || '', `http://${info.req.headers.host}`);
    const token = url.searchParams.get('token');
    
    // 简单的token验证（实际项目中应该验证JWT token）
    if (!token) {
      console.log('❌ WebSocket连接被拒绝：缺少token');
      return false;
    }

    return true;
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage) {
    const clientId = this.generateClientId();
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    const client: GameClient = {
      ws,
      authenticated: false,
      lastPing: Date.now(),
    };

    this.clients.set(clientId, client);

    console.log(`🔌 新的WebSocket连接: ${clientId} (token: ${token})`);

    // 发送欢迎消息
    this.sendToClient(clientId, {
      type: 'connected',
      data: { clientId, message: '连接成功' },
      timestamp: Date.now(),
    });

    // 设置消息处理器
    ws.on('message', (data) => this.handleMessage(clientId, data));
    ws.on('close', () => this.handleDisconnection(clientId));
    ws.on('error', (error) => this.handleError(clientId, error));

    // 发送心跳响应
    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.lastPing = Date.now();
      }
    });
  }

  private handleMessage(clientId: string, data: any) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) {
        console.log(`❌ 客户端不存在: ${clientId}`);
        return;
      }

      console.log(`📨 收到消息 [${clientId}]:`, message);

      switch (message.type) {
        case 'ping':
          this.handlePing(clientId);
          break;
        case 'authenticate':
          this.handleAuthentication(clientId, message.data);
          break;
        case 'game_action':
          this.handleGameAction(clientId, message.data);
          break;
        case 'chat':
          this.handleChat(clientId, message.data);
          break;
        default:
          console.log(`⚠️ 未知消息类型: ${message.type}`);
      }
    } catch (error) {
      console.error(`❌ 解析消息失败 [${clientId}]:`, error);
    }
  }

  private handlePing(clientId: string) {
    this.sendToClient(clientId, {
      type: 'pong',
      timestamp: Date.now(),
    });
  }

  private handleAuthentication(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // 这里应该验证用户身份
    // 暂时简单设置为已认证
    client.authenticated = true;
    client.userId = data.userId || 'anonymous';

    this.sendToClient(clientId, {
      type: 'authenticated',
      data: { success: true, userId: client.userId },
      timestamp: Date.now(),
    });

    console.log(`✅ 客户端认证成功 [${clientId}]: ${client.userId}`);
  }

  private handleGameAction(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client || !client.authenticated) {
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: '未认证的客户端' },
        timestamp: Date.now(),
      });
      return;
    }

    // 处理游戏动作
    console.log(`🎮 游戏动作 [${clientId}]:`, data);

    // 这里可以添加具体的游戏逻辑
    this.sendToClient(clientId, {
      type: 'game_response',
      data: { success: true, action: data.action },
      timestamp: Date.now(),
    });
  }

  private handleChat(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client || !client.authenticated) return;

    const chatMessage = {
      type: 'chat_message',
      data: {
        from: client.userId,
        message: data.message,
        timestamp: Date.now(),
      },
    };

    // 广播聊天消息给所有认证的客户端
    this.broadcast(chatMessage, clientId);
  }

  private handleDisconnection(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`🔌 客户端断开连接: ${clientId} (${client.userId || 'anonymous'})`);
      this.clients.delete(clientId);
    }
  }

  private handleError(clientId: string, error: Error) {
    console.error(`❌ WebSocket错误 [${clientId}]:`, error);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      
      this.clients.forEach((client, clientId) => {
        if (client.lastPing && now - client.lastPing > 60000) {
          // 60秒无响应，断开连接
          console.log(`💔 客户端心跳超时，断开连接: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
        } else {
          // 发送心跳
          client.ws.ping();
        }
      });
    }, 30000); // 每30秒检查一次
  }

  public sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  public sendToUser(userId: string, message: WebSocketMessage) {
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  public broadcast(message: WebSocketMessage, excludeClientId?: string) {
    this.clients.forEach((client, clientId) => {
      if (
        clientId !== excludeClientId &&
        client.authenticated &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public getAuthenticatedClients(): number {
    return Array.from(this.clients.values()).filter(client => client.authenticated).length;
  }

  public close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach((client) => {
      client.ws.close();
    });

    if (this.wss) {
      this.wss.close();
    }

    console.log('🔌 WebSocket服务已关闭');
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;