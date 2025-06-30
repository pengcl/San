import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
  duration: number; // 持续时间（秒）
  onComplete?: () => void;
  onTick?: (remainingTime: number) => void;
  format?: 'mm:ss' | 'hh:mm:ss' | 'seconds' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'warning' | 'danger' | 'success';
  showProgress?: boolean;
  autoStart?: boolean;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration,
  onComplete,
  onTick,
  format = 'auto',
  size = 'md',
  color = 'default',
  showProgress = false,
  autoStart = true,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  // 格式化时间显示
  const formatTime = useCallback(
    (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      switch (format) {
        case 'seconds':
          return seconds.toString();
        case 'mm:ss':
          return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        case 'hh:mm:ss':
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        case 'auto':
          if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          }
        default:
          return seconds.toString();
      }
    },
    [format]
  );

  // 获取颜色配置
  const getColorConfig = useCallback(() => {
    const warningThreshold = duration * 0.3; // 30% 时显示警告
    const dangerThreshold = duration * 0.1; // 10% 时显示危险

    if (color !== 'default') {
      const configs = {
        warning: {
          text: 'text-yellow-400',
          bg: 'bg-yellow-500',
          ring: 'ring-yellow-500',
        },
        danger: {
          text: 'text-red-400',
          bg: 'bg-red-500',
          ring: 'ring-red-500',
        },
        success: {
          text: 'text-green-400',
          bg: 'bg-green-500',
          ring: 'ring-green-500',
        },
      };
      return configs[color];
    }

    // 自动颜色判断
    if (timeLeft <= dangerThreshold) {
      return { text: 'text-red-400', bg: 'bg-red-500', ring: 'ring-red-500' };
    } else if (timeLeft <= warningThreshold) {
      return {
        text: 'text-yellow-400',
        bg: 'bg-yellow-500',
        ring: 'ring-yellow-500',
      };
    } else {
      return {
        text: 'text-blue-400',
        bg: 'bg-blue-500',
        ring: 'ring-blue-500',
      };
    }
  }, [timeLeft, duration, color]);

  // 获取尺寸配置
  const getSizeConfig = () => {
    const configs = {
      sm: { text: 'text-sm', padding: 'px-2 py-1', width: 'w-3 h-3' },
      md: { text: 'text-base', padding: 'px-3 py-2', width: 'w-4 h-4' },
      lg: { text: 'text-lg', padding: 'px-4 py-3', width: 'w-5 h-5' },
    };
    return configs[size];
  };

  const colorConfig = getColorConfig();
  const sizeConfig = getSizeConfig();
  const progress = ((duration - timeLeft) / duration) * 100;

  // 倒计时逻辑
  useEffect(() => {
    if (!isRunning || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;

        onTick?.(newTime);

        if (newTime <= 0) {
          setIsCompleted(true);
          setIsRunning(false);
          onComplete?.();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isCompleted, onComplete, onTick]);

  // 控制方法（供将来扩展使用）
  // const start = () => setIsRunning(true);
  // const pause = () => setIsRunning(false);
  // const reset = () => {
  //   setTimeLeft(duration);
  //   setIsCompleted(false);
  //   setIsRunning(autoStart);
  // };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      {/* 倒计时显示 */}
      <motion.div
        className={`
          ${sizeConfig.text} ${colorConfig.text} font-mono font-bold
          ${sizeConfig.padding} bg-gray-800 rounded-lg border border-gray-600
          ${timeLeft <= 10 ? 'animate-pulse' : ''}
        `}
        animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : undefined}
        transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
      >
        {formatTime(timeLeft)}
      </motion.div>

      {/* 进度环 */}
      {showProgress && (
        <div className='relative'>
          <svg className={`${sizeConfig.width} transform -rotate-90`}>
            <circle
              cx='50%'
              cy='50%'
              r='40%'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              className='text-gray-600'
            />
            <motion.circle
              cx='50%'
              cy='50%'
              r='40%'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              className={colorConfig.text}
              style={{
                strokeDasharray: `${2 * Math.PI * 40} ${2 * Math.PI * 40}`,
                strokeDashoffset: `${2 * Math.PI * 40 * (1 - progress / 100)}`,
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>

          {/* 中心点 */}
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <div className={`w-1 h-1 rounded-full ${colorConfig.bg}`} />
          </div>
        </div>
      )}

      {/* 完成状态 */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className='text-green-400'
          >
            ✓
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountdownTimer;
