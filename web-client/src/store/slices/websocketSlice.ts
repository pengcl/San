import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { WebSocketStatus } from '../../services/websocket';

interface WebSocketState {
  status: WebSocketStatus;
  isConnected: boolean;
  reconnectAttempts: number;
  lastConnected: string | null;
  lastDisconnected: string | null;
  error: string | null;
  messageQueue: any[];
  statistics: {
    totalMessages: number;
    messagesReceived: number;
    messagesSent: number;
    reconnectCount: number;
  };
}

const initialState: WebSocketState = {
  status: 'disconnected',
  isConnected: false,
  reconnectAttempts: 0,
  lastConnected: null,
  lastDisconnected: null,
  error: null,
  messageQueue: [],
  statistics: {
    totalMessages: 0,
    messagesReceived: 0,
    messagesSent: 0,
    reconnectCount: 0,
  },
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<WebSocketStatus>) => {
      const newStatus = action.payload;
      const previousStatus = state.status;

      state.status = newStatus;
      state.isConnected = newStatus === 'connected';

      // 更新连接时间戳
      if (newStatus === 'connected' && previousStatus !== 'connected') {
        state.lastConnected = new Date().toISOString();
        state.error = null;
        state.reconnectAttempts = 0;
      }

      if (newStatus === 'disconnected' && previousStatus === 'connected') {
        state.lastDisconnected = new Date().toISOString();
      }

      if (newStatus === 'reconnecting') {
        state.reconnectAttempts += 1;
        state.statistics.reconnectCount += 1;
      }
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = 'error';
      state.isConnected = false;
    },

    clearError: state => {
      state.error = null;
    },

    addToQueue: (state, action: PayloadAction<any>) => {
      state.messageQueue.push({
        ...action.payload,
        timestamp: Date.now(),
      });
    },

    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.messageQueue = state.messageQueue.filter(
        msg => msg.id !== action.payload
      );
    },

    clearQueue: state => {
      state.messageQueue = [];
    },

    incrementMessagesSent: state => {
      state.statistics.messagesSent += 1;
      state.statistics.totalMessages += 1;
    },

    incrementMessagesReceived: state => {
      state.statistics.messagesReceived += 1;
      state.statistics.totalMessages += 1;
    },

    resetStatistics: state => {
      state.statistics = {
        totalMessages: 0,
        messagesReceived: 0,
        messagesSent: 0,
        reconnectCount: 0,
      };
    },

    setReconnectAttempts: (state, action: PayloadAction<number>) => {
      state.reconnectAttempts = action.payload;
    },
  },
});

export const {
  setStatus,
  setError,
  clearError,
  addToQueue,
  removeFromQueue,
  clearQueue,
  incrementMessagesSent,
  incrementMessagesReceived,
  resetStatistics,
  setReconnectAttempts,
} = websocketSlice.actions;

export default websocketSlice.reducer;

// 选择器
export const selectWebSocketStatus = (state: { websocket: WebSocketState }) =>
  state.websocket.status;
export const selectIsConnected = (state: { websocket: WebSocketState }) =>
  state.websocket.isConnected;
export const selectWebSocketError = (state: { websocket: WebSocketState }) =>
  state.websocket.error;
export const selectMessageQueue = (state: { websocket: WebSocketState }) =>
  state.websocket.messageQueue;
export const selectWebSocketStatistics = (state: {
  websocket: WebSocketState;
}) => state.websocket.statistics;
export const selectReconnectAttempts = (state: { websocket: WebSocketState }) =>
  state.websocket.reconnectAttempts;
export const selectLastConnected = (state: { websocket: WebSocketState }) =>
  state.websocket.lastConnected;
export const selectLastDisconnected = (state: { websocket: WebSocketState }) =>
  state.websocket.lastDisconnected;
