import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDeviceInfo } from '../../hooks/useMobile';
import { vibrate } from '../../utils/mobile';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  refreshThreshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
  refreshThreshold = 80,
  maxPullDistance = 120,
  disabled = false,
  hapticFeedback = true,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);
  const { isMobile } = useDeviceInfo();
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const hasTriggeredHaptic = useRef<boolean>(false);

  const handleRefresh = useCallback(async () => {
    if (disabled || isRefreshing) return;

    setIsRefreshing(true);
    setPullDistance(0);
    setCanRefresh(false);

    if (hapticFeedback) {
      vibrate([50, 50, 100]);
    }

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, disabled, isRefreshing, hapticFeedback]);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || isRefreshing) return;

      const container = containerRef.current;
      if (!container) return;

      // 只有在容器顶部时才允许下拉刷新
      if (container.scrollTop > 0) return;

      startY.current = event.touches[0].clientY;
      hasTriggeredHaptic.current = false;
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || isRefreshing || startY.current === 0) return;

      const container = containerRef.current;
      if (!container || container.scrollTop > 0) return;

      const currentY = event.touches[0].clientY;
      const deltaY = currentY - startY.current;

      if (deltaY > 0) {
        event.preventDefault();

        // 计算拉拽距离（使用阻尼效果）
        const distance = Math.min(deltaY * 0.5, maxPullDistance);
        setPullDistance(distance);

        // 检查是否达到刷新阈值
        const shouldRefresh = distance >= refreshThreshold;
        setCanRefresh(shouldRefresh);

        // 触发震动反馈
        if (shouldRefresh && !hasTriggeredHaptic.current && hapticFeedback) {
          vibrate(50);
          hasTriggeredHaptic.current = true;
        } else if (!shouldRefresh && hasTriggeredHaptic.current) {
          hasTriggeredHaptic.current = false;
        }
      }
    },
    [disabled, isRefreshing, refreshThreshold, maxPullDistance, hapticFeedback]
  );

  const handleTouchEnd = useCallback(() => {
    if (disabled || isRefreshing) return;

    startY.current = 0;

    if (canRefresh) {
      handleRefresh();
    } else {
      setPullDistance(0);
      setCanRefresh(false);
    }
  }, [disabled, isRefreshing, canRefresh, handleRefresh]);

  // 非移动端不显示下拉刷新
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const refreshIconRotation =
    pullDistance > 0 ? (pullDistance / refreshThreshold) * 180 : 0;
  const refreshOpacity = Math.min(pullDistance / refreshThreshold, 1);

  const containerClasses = ['relative', 'overflow-hidden', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {/* 刷新指示器 */}
      <motion.div
        className='absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm'
        initial={{ height: 0 }}
        animate={{ height: pullDistance > 0 ? Math.min(pullDistance, 80) : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          marginTop: -Math.min(pullDistance, 80),
        }}
      >
        {isRefreshing ? (
          <div className='flex items-center space-x-2 text-orange-400'>
            <motion.div
              className='w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full'
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span className='text-sm font-medium'>刷新中...</span>
          </div>
        ) : (
          <div
            className='flex items-center space-x-2 transition-opacity duration-200'
            style={{ opacity: refreshOpacity }}
          >
            <motion.div
              className={`w-5 h-5 ${canRefresh ? 'text-orange-400' : 'text-slate-400'}`}
              animate={{ rotate: refreshIconRotation }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 14l-7 7m0 0l-7-7m7 7V3'
                />
              </svg>
            </motion.div>
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                canRefresh ? 'text-orange-400' : 'text-slate-400'
              }`}
            >
              {canRefresh ? '松开刷新' : '下拉刷新'}
            </span>
          </div>
        )}
      </motion.div>

      {/* 内容容器 */}
      <motion.div
        ref={containerRef}
        className='h-full overflow-auto'
        animate={{ y: isRefreshing ? 60 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
