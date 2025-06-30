const WebSocket = require('ws');

async function testWebSocket() {
  console.log('🧪 开始WebSocket连接测试...');

  // 测试参数
  const wsUrl = 'ws://localhost:1337/?token=test-token-123';
  
  try {
    // 创建WebSocket连接
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log('✅ WebSocket连接成功');
      
      // 发送认证消息
      ws.send(JSON.stringify({
        type: 'authenticate',
        data: { userId: 'test-user-123' }
      }));

      // 发送ping消息
      setTimeout(() => {
        console.log('📤 发送ping消息');
        ws.send(JSON.stringify({ type: 'ping' }));
      }, 1000);

      // 发送游戏动作
      setTimeout(() => {
        console.log('📤 发送游戏动作');
        ws.send(JSON.stringify({
          type: 'game_action',
          data: { action: 'test_action', value: 123 }
        }));
      }, 2000);

      // 发送聊天消息
      setTimeout(() => {
        console.log('📤 发送聊天消息');
        ws.send(JSON.stringify({
          type: 'chat',
          data: { message: '这是一条测试消息' }
        }));
      }, 3000);

      // 5秒后关闭连接
      setTimeout(() => {
        console.log('🔌 关闭WebSocket连接');
        ws.close();
      }, 5000);
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📨 收到消息:', message);
      } catch (error) {
        console.log('📨 收到原始数据:', data.toString());
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`🔌 连接已关闭: ${code} - ${reason}`);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket错误:', error.message);
    });

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testWebSocket();
}

module.exports = testWebSocket;