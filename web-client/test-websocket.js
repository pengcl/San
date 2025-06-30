// Test script to check WebSocket configuration
import { config } from './src/config/env.js';

console.log('WebSocket enabled:', config.enableWebSocket);
console.log('WebSocket URL:', config.wsUrl);
console.log('All config:', config);