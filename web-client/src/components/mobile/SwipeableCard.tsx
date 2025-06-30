import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useDeviceInfo } from '../../hooks/useMobile';
import { vibrate } from '../../utils/mobile';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  enableSwipe?: boolean;
  swipeThreshold?: number;
  className?: string;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  enableSwipe = true,
  swipeThreshold = 100,
  className = '',
  disabled = false,
  hapticFeedback = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const {} = useDeviceInfo();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const lastTap = useRef<number>(0);

  // 处理拖拽开始
  const handleDragStart = () => {
    if (disabled || !enableSwipe) return;
    setIsDragging(true);
    if (hapticFeedback) {
      vibrate(25);
    }
  };

  // 处理拖拽过程
  const handleDrag = (_event: any, info: PanInfo) => {
    if (disabled || !enableSwipe) return;
    setDragOffset({ x: info.offset.x, y: info.offset.y });
  };

  // 处理拖拽结束
  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (disabled || !enableSwipe) return;

    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });

    const { velocity, offset } = info;
    const swipeVelocityThreshold = 500;
    const swipeOffsetThreshold = swipeThreshold;

    // 检测滑动方向和强度
    const isHorizontalSwipe = Math.abs(offset.x) > Math.abs(offset.y);
    const isVerticalSwipe = Math.abs(offset.y) > Math.abs(offset.x);

    let swipeDetected = false;

    if (isHorizontalSwipe) {
      // 水平滑动
      if (
        offset.x > swipeOffsetThreshold ||
        velocity.x > swipeVelocityThreshold
      ) {
        // 向右滑动
        if (onSwipeRight) {
          onSwipeRight();
          swipeDetected = true;
        }
      } else if (
        offset.x < -swipeOffsetThreshold ||
        velocity.x < -swipeVelocityThreshold
      ) {
        // 向左滑动
        if (onSwipeLeft) {
          onSwipeLeft();
          swipeDetected = true;
        }
      }
    } else if (isVerticalSwipe) {
      // 垂直滑动
      if (
        offset.y > swipeOffsetThreshold ||
        velocity.y > swipeVelocityThreshold
      ) {
        // 向下滑动
        if (onSwipeDown) {
          onSwipeDown();
          swipeDetected = true;
        }
      } else if (
        offset.y < -swipeOffsetThreshold ||
        velocity.y < -swipeVelocityThreshold
      ) {
        // 向上滑动
        if (onSwipeUp) {
          onSwipeUp();
          swipeDetected = true;
        }
      }
    }

    // 滑动反馈
    if (swipeDetected && hapticFeedback) {
      vibrate(50);
    }
  };

  // 处理点击
  const handleTap = () => {
    if (disabled) return;

    const now = Date.now();
    const timeDiff = now - lastTap.current;

    if (timeDiff < 300 && timeDiff > 0) {
      // 双击
      if (onDoubleTap) {
        onDoubleTap();
        if (hapticFeedback) {
          vibrate(100);
        }
      }
      lastTap.current = 0;
    } else {
      // 单击
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current === now && onTap) {
          onTap();
          if (hapticFeedback) {
            vibrate(25);
          }
        }
      }, 300);
    }
  };

  // 获取变换样式
  const getTransform = () => {
    if (!isDragging) return {};

    const maxRotation = 15;
    const rotationX = (dragOffset.y / 300) * maxRotation;
    const rotationY = -(dragOffset.x / 300) * maxRotation;

    return {
      x: dragOffset.x,
      y: dragOffset.y,
      rotateX: rotationX,
      rotateY: rotationY,
      scale: 1 + Math.abs(dragOffset.x + dragOffset.y) / 2000,
    };
  };

  // 获取阴影强度
  const getShadowIntensity = () => {
    if (!isDragging) return 1;
    const distance = Math.sqrt(dragOffset.x ** 2 + dragOffset.y ** 2);
    return 1 + distance / 200;
  };

  const cardClasses = [
    'relative',
    'select-none',
    'cursor-pointer',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    isDragging ? 'z-10' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cardStyle = {
    boxShadow: `0 ${4 * getShadowIntensity()}px ${20 * getShadowIntensity()}px rgba(0, 0, 0, 0.1)`,
  };

  return (
    <motion.div
      ref={cardRef}
      className={cardClasses}
      style={cardStyle}
      drag={enableSwipe && !disabled}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      animate={getTransform()}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      whileHover={!disabled && !isDragging ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}

      {/* 滑动指示器 */}
      {isDragging && enableSwipe && (
        <div className='absolute inset-0 pointer-events-none'>
          {/* 左滑指示器 */}
          {dragOffset.x < -50 && onSwipeLeft && (
            <motion.div
              className='absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500'
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-medium'>删除</span>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
              </div>
            </motion.div>
          )}

          {/* 右滑指示器 */}
          {dragOffset.x > 50 && onSwipeRight && (
            <motion.div
              className='absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500'
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className='flex items-center space-x-2'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                <span className='text-sm font-medium'>确认</span>
              </div>
            </motion.div>
          )}

          {/* 上滑指示器 */}
          {dragOffset.y < -50 && onSwipeUp && (
            <motion.div
              className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-blue-500'
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className='flex flex-col items-center space-y-1'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 16l4-4 4 4'
                  />
                </svg>
                <span className='text-xs font-medium'>详情</span>
              </div>
            </motion.div>
          )}

          {/* 下滑指示器 */}
          {dragOffset.y > 50 && onSwipeDown && (
            <motion.div
              className='absolute top-4 left-1/2 transform -translate-x-1/2 text-yellow-500'
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className='flex flex-col items-center space-y-1'>
                <span className='text-xs font-medium'>收起</span>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 8l-4 4-4-4'
                  />
                </svg>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SwipeableCard;
