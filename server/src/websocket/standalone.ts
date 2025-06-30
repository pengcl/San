import { createServer } from 'http';
import webSocketService from './websocket.service';

// 创建独立的WebSocket服务器
const createStandaloneWebSocketServer = (port: number = 1338) => {
  const server = createServer();
  
  // 初始化WebSocket服务
  webSocketService.initialize(server);
  
  server.listen(port, () => {
    console.log(`🔗 独立WebSocket服务器启动在端口 ${port}`);
    console.log(`📡 WebSocket URL: ws://localhost:${port}`);
  });

  // 优雅关闭
  const shutdown = () => {
    console.log('🛑 关闭独立WebSocket服务器');
    webSocketService.close();
    server.close();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
};

// 如果直接运行此文件，启动独立服务器
if (require.main === module) {
  createStandaloneWebSocketServer(1338);
}

export { createStandaloneWebSocketServer };