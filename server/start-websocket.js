const { createServer } = require('http');
const { WebSocketServer, WebSocket } = require('ws');

// 创建HTTP服务器
const server = createServer();

// 创建WebSocket服务器
const wss = new WebSocketServer({ 
  server,
  path: '/',
  verifyClient: (info) => {
    const url = new URL(info.req.url || '', `http://${info.req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (!token) {
      console.log('❌ WebSocket连接被拒绝：缺少token');
      return false;
    }
    
    console.log('✅ WebSocket连接验证成功，token:', token);
    return true;
  }
});

// 客户端连接管理
const clients = new Map();

// 生成客户端ID
function generateClientId() {
  return Math.random().toString(36).substring(2, 15);
}

// 处理WebSocket连接
wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  const client = {
    ws,
    clientId,
    token,
    authenticated: false,
    lastPing: Date.now(),
  };

  clients.set(clientId, client);
  console.log(`🔌 新的WebSocket连接: ${clientId} (token: ${token})`);

  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'connected',
    data: { clientId, message: '连接成功' },
    timestamp: Date.now(),
  }));

  // 处理消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 收到消息 [${clientId}]:`, message);

      switch (message.type) {
        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now(),
          }));
          break;

        case 'authenticate':
          client.authenticated = true;
          client.userId = message.data?.userId || 'anonymous';
          ws.send(JSON.stringify({
            type: 'authenticated',
            data: { success: true, userId: client.userId },
            timestamp: Date.now(),
          }));
          console.log(`✅ 客户端认证成功 [${clientId}]: ${client.userId}`);
          break;

        case 'game_action':
          if (!client.authenticated) {
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: '未认证的客户端' },
              timestamp: Date.now(),
            }));
            return;
          }
          
          console.log(`🎮 游戏动作 [${clientId}]:`, message.data);
          ws.send(JSON.stringify({
            type: 'game_response',
            data: { success: true, action: message.data?.action },
            timestamp: Date.now(),
          }));
          break;

        case 'chat':
          if (!client.authenticated) return;
          
          // 广播聊天消息
          const chatMessage = {
            type: 'chat_message',
            data: {
              from: client.userId,
              message: message.data?.message,
              timestamp: Date.now(),
            },
          };
          
          clients.forEach((otherClient, otherClientId) => {
            if (otherClientId !== clientId && 
                otherClient.authenticated && 
                otherClient.ws.readyState === WebSocket.OPEN) {
              otherClient.ws.send(JSON.stringify(chatMessage));
            }
          });
          break;

        default:
          console.log(`⚠️ 未知消息类型: ${message.type}`);
      }
    } catch (error) {
      console.error(`❌ 解析消息失败 [${clientId}]:`, error);
    }
  });

  // 处理连接关闭
  ws.on('close', (code, reason) => {
    console.log(`🔌 客户端断开连接: ${clientId} (${client.userId || 'anonymous'}) - 代码: ${code}`);
    clients.delete(clientId);
  });

  // 处理错误
  ws.on('error', (error) => {
    console.error(`❌ WebSocket错误 [${clientId}]:`, error);
  });

  // 处理pong响应
  ws.on('pong', () => {
    client.lastPing = Date.now();
  });
});

// 心跳检测
setInterval(() => {
  const now = Date.now();
  
  clients.forEach((client, clientId) => {
    if (client.lastPing && now - client.lastPing > 60000) {
      // 60秒无响应，断开连接
      console.log(`💔 客户端心跳超时，断开连接: ${clientId}`);
      client.ws.terminate();
      clients.delete(clientId);
    } else {
      // 发送心跳
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.ping();
      }
    }
  });
}, 30000); // 每30秒检查一次

// 启动服务器
const PORT = 1337;
server.listen(PORT, () => {
  console.log('🚀 独立WebSocket服务器启动成功');
  console.log(`📡 HTTP服务器监听端口: ${PORT}`);
  console.log(`🔗 WebSocket URL: ws://localhost:${PORT}`);
  console.log('✅ 等待客户端连接...');
});

// 优雅关闭
const shutdown = () => {
  console.log('🛑 关闭WebSocket服务器');
  wss.close();
  server.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('🔧 WebSocket服务器配置完成，按 Ctrl+C 停止');