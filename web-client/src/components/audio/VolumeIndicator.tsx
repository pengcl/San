/**
 * 音量指示器组件
 * 显示当前音量级别的可视化指示器
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioConfig, useVolumeVisualization } from '../../hooks/useAudio';

interface VolumeIndicatorProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  animated?: boolean;
  orientation?: 'horizontal' | 'vertical';
  barCount?: number;
}

const VolumeIndicator: React.FC<VolumeIndicatorProps> = ({
  className = '',
  size = 'medium',
  showValue = false,
  animated = true,
  orientation = 'horizontal',
  barCount = 5,
}) => {
  const { config } = useAudioConfig();
  const { volumeLevel, startVisualization, stopVisualization } = useVolumeVisualization();
  const [displayVolume, setDisplayVolume] = useState(0);

  useEffect(() => {
    if (animated && !config.muted && config.volume > 0) {
      startVisualization();
    } else {
      stopVisualization();
      setDisplayVolume(config.volume * 100);
    }

    return () => stopVisualization();
  }, [animated, config.muted, config.volume, startVisualization, stopVisualization]);

  useEffect(() => {
    if (animated && !config.muted) {
      setDisplayVolume(volumeLevel);
    }
  }, [volumeLevel, animated, config.muted]);

  const sizeClasses = {
    small: 'w-16 h-2',
    medium: 'w-20 h-3',
    large: 'w-24 h-4',
  };

  const barSizeClasses = {
    small: orientation === 'horizontal' ? 'w-2 h-2' : 'w-2 h-4',
    medium: orientation === 'horizontal' ? 'w-3 h-3' : 'w-3 h-6',
    large: orientation === 'horizontal' ? 'w-4 h-4' : 'w-4 h-8',
  };

  // 条形音量指示器
  const BarIndicator = () => {
    const bars = Array.from({ length: barCount }, (_, index) => {
      const threshold = ((index + 1) / barCount) * 100;
      const isActive = displayVolume >= threshold;
      const intensity = Math.max(0, Math.min(1, (displayVolume - threshold + 20) / 20));

      return (
        <motion.div
          key={index}
          className={`
            ${barSizeClasses[size]}
            rounded-sm transition-all duration-150
            ${isActive
              ? `bg-gradient-to-t from-green-400 to-green-600 ${
                  config.muted ? 'opacity-30' : ''
                }`
              : 'bg-gray-200'
            }
          `}
          animate={{
            scaleY: animated && isActive ? 0.7 + intensity * 0.3 : 1,
            backgroundColor: config.muted
              ? '#d1d5db'
              : isActive
              ? index < barCount * 0.7
                ? '#10b981'
                : index < barCount * 0.9
                ? '#f59e0b'
                : '#ef4444'
              : '#d1d5db',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      );
    });

    return (
      <div
        className={`
          flex gap-1 items-end
          ${orientation === 'vertical' ? 'flex-col-reverse' : 'flex-row'}
          ${className}
        `}
      >
        {bars}
        {showValue && (
          <motion.div
            className="ml-2 text-xs font-mono text-gray-600"
            animate={{ opacity: config.muted ? 0.5 : 1 }}
          >
            {config.muted ? 'MUTE' : `${Math.round(displayVolume)}%`}
          </motion.div>
        )}
      </div>
    );
  };

  // 波形音量指示器
  const WaveIndicator = () => {
    const waveHeight = Math.max(2, (displayVolume / 100) * 40);
    
    return (
      <div className={`${sizeClasses[size]} ${className} relative overflow-hidden bg-gray-100 rounded-full`}>
        <motion.div
          className={`
            absolute left-0 top-0 h-full rounded-full transition-all duration-200
            ${config.muted
              ? 'bg-gray-300'
              : displayVolume < 30
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : displayVolume < 70
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
              : 'bg-gradient-to-r from-orange-500 to-red-500'
            }
          `}
          animate={{
            width: config.muted ? '100%' : `${displayVolume}%`,
            opacity: config.muted ? 0.3 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
        
        {/* 波纹效果 */}
        <AnimatePresence>
          {animated && !config.muted && displayVolume > 10 && (
            <motion.div
              className="absolute inset-0 bg-white rounded-full"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 1.2, opacity: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          )}
        </AnimatePresence>

        {showValue && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference"
            animate={{ opacity: config.muted ? 0.5 : 1 }}
          >
            {config.muted ? 'MUTE' : `${Math.round(displayVolume)}`}
          </motion.div>
        )}
      </div>
    );
  };

  // 圆形音量指示器
  const CircularIndicator = () => {
    const circumference = 2 * Math.PI * 20; // 半径为20的圆
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (displayVolume / 100) * circumference;

    return (
      <div className={`relative ${className}`}>
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
          {/* 背景圆 */}
          <circle
            cx="22"
            cy="22"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-200"
          />
          
          {/* 进度圆 */}
          <motion.circle
            cx="22"
            cy="22"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className={`
              ${config.muted
                ? 'text-gray-400'
                : displayVolume < 30
                ? 'text-green-500'
                : displayVolume < 70
                ? 'text-yellow-500'
                : 'text-red-500'
              }
            `}
            strokeLinecap="round"
            animate={{
              strokeDasharray,
              strokeDashoffset: config.muted ? circumference : strokeDashoffset,
              opacity: config.muted ? 0.3 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          />
        </svg>
        
        {/* 中心文字 */}
        {showValue && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700"
            animate={{ opacity: config.muted ? 0.5 : 1 }}
          >
            {config.muted ? 'M' : Math.round(displayVolume)}
          </motion.div>
        )}
      </div>
    );
  };

  // 根据size和类型返回对应的指示器
  if (size === 'large') {
    return <CircularIndicator />;
  } else if (orientation === 'vertical') {
    return <BarIndicator />;
  } else {
    return <WaveIndicator />;
  }
};

export default VolumeIndicator;