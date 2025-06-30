import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  selectWebSocketStatus,
  selectIsConnected,
  selectReconnectAttempts,
} from '../../store/slices/websocketSlice';
import type { WebSocketStatus } from '../../services/websocket';

interface WebSocketIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showText?: boolean;
  className?: string;
}

const WebSocketIndicator: React.FC<WebSocketIndicatorProps> = ({
  position = 'top-right',
  showText = false,
  className = '',
}) => {
  const status = useSelector(selectWebSocketStatus);
  const isConnected = useSelector(selectIsConnected);
  const reconnectAttempts = useSelector(selectReconnectAttempts);

  const getStatusConfig = (status: WebSocketStatus) => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          icon: '●',
          text: '已连接',
          pulse: false,
        };
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          icon: '●',
          text: '连接中...',
          pulse: true,
        };
      case 'reconnecting':
        return {
          color: 'bg-orange-500',
          icon: '●',
          text: `重连中... (${reconnectAttempts})`,
          pulse: true,
        };
      case 'disconnected':
        return {
          color: 'bg-gray-500',
          icon: '●',
          text: '已断开',
          pulse: false,
        };
      case 'error':
        return {
          color: 'bg-red-500',
          icon: '●',
          text: '连接错误',
          pulse: false,
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: '●',
          text: '未知状态',
          pulse: false,
        };
    }
  };

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const config = getStatusConfig(status);

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed ${getPositionClasses(position)} z-50 ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <div className='flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 shadow-lg'>
          {/* 状态指示器 */}
          <div className='relative'>
            <div
              className={`w-3 h-3 rounded-full ${config.color} ${
                config.pulse ? 'animate-pulse' : ''
              }`}
            />
            {isConnected && (
              <motion.div
                className='absolute inset-0 w-3 h-3 rounded-full bg-green-500 opacity-75'
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          {/* 状态文本 */}
          {showText && (
            <span className='text-sm text-gray-300 font-medium'>
              {config.text}
            </span>
          )}

          {/* 网络图标 */}
          <div className='text-gray-400'>
            {isConnected ? (
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M2 10.5a.5.5 0 01.5-.5h15a.5.5 0 010 1H3a.5.5 0 01-.5-.5zM2 6.5a.5.5 0 01.5-.5h15a.5.5 0 010 1H3a.5.5 0 01-.5-.5zM2 14.5a.5.5 0 01.5-.5h15a.5.5 0 010 1H3a.5.5 0 01-.5-.5z' />
              </svg>
            ) : (
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                  clipRule='evenodd'
                />
                <path d='M3 15l12-12' stroke='currentColor' strokeWidth='2' />
              </svg>
            )}
          </div>
        </div>

        {/* 悬停提示 */}
        <div className='absolute top-full right-0 mt-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
          <div className='bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap border border-gray-700'>
            WebSocket: {config.text}
            {reconnectAttempts > 0 && ` (重连${reconnectAttempts}次)`}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WebSocketIndicator;
