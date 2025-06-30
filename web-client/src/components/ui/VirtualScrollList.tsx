import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
  overscan?: number;
  onItemClick?: (item: T, index: number) => void;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  threshold?: number;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  onLoadMore,
  loading = false,
  hasMore = false,
  className = '',
  overscan = 3,
  onItemClick,
  emptyComponent,
  loadingComponent,
  threshold = 200,
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // 计算可见范围
  const visibleRange = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

    // 添加overscan缓冲区
    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

    return {
      startIndex,
      endIndex,
      totalHeight,
      visibleStart,
      visibleEnd,
    };
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);

  // 获取可见项目
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // 处理滚动事件
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = event.currentTarget.scrollTop;
      setScrollTop(scrollTop);
      setIsScrolling(true);

      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 设置滚动结束检测
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // 检查是否需要加载更多
      if (onLoadMore && hasMore && !loading) {
        const scrollHeight = event.currentTarget.scrollHeight;
        const clientHeight = event.currentTarget.clientHeight;
        const scrollBottom = scrollHeight - scrollTop - clientHeight;

        if (scrollBottom <= threshold) {
          onLoadMore();
        }
      }
    },
    [onLoadMore, hasMore, loading, threshold]
  );

  // 滚动到指定项目
  const scrollToItem = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (containerRef.current) {
        const scrollTop = index * itemHeight;
        containerRef.current.scrollTo({
          top: scrollTop,
          behavior,
        });
      }
    },
    [itemHeight]
  );

  // 滚动到顶部
  const scrollToTop = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      scrollToItem(0, behavior);
    },
    [scrollToItem]
  );

  // 滚动到底部
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // 处理项目点击
  const handleItemClick = useCallback(
    (item: T, originalIndex: number) => {
      if (onItemClick) {
        onItemClick(item, originalIndex);
      }
    },
    [onItemClick]
  );

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 如果没有数据且提供了空状态组件
  if (items.length === 0 && emptyComponent) {
    return (
      <div
        className={`virtual-scroll-list ${className}`}
        style={{ height: containerHeight }}
      >
        {emptyComponent}
      </div>
    );
  }

  const containerClasses = [
    'virtual-scroll-list',
    'relative',
    'overflow-auto',
    'scrollbar-thin',
    'scrollbar-thumb-slate-600',
    'scrollbar-track-slate-800',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <div
        ref={containerRef}
        className='h-full overflow-auto'
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* 总容器，设置总高度以保持滚动条正确 */}
        <div style={{ height: visibleRange.totalHeight, position: 'relative' }}>
          {/* 可见项目容器 */}
          <div
            style={{
              transform: `translateY(${visibleRange.startIndex * itemHeight}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <AnimatePresence mode='popLayout'>
              {visibleItems.map((item, index) => {
                const originalIndex = visibleRange.startIndex + index;
                const key = keyExtractor(item, originalIndex);

                return (
                  <motion.div
                    key={key}
                    className='virtual-scroll-item'
                    style={{
                      height: itemHeight,
                      position: 'relative',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    onClick={() => handleItemClick(item, originalIndex)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {renderItem(item, originalIndex)}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* 加载更多指示器 */}
        {loading && loadingComponent && (
          <motion.div
            className='flex justify-center items-center py-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {loadingComponent}
          </motion.div>
        )}

        {/* 默认加载更多指示器 */}
        {loading && !loadingComponent && (
          <motion.div
            className='flex justify-center items-center py-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className='flex items-center space-x-2 text-slate-400'>
              <div className='w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin' />
              <span className='text-sm'>加载中...</span>
            </div>
          </motion.div>
        )}

        {/* 没有更多数据提示 */}
        {!hasMore && items.length > 0 && (
          <motion.div
            className='flex justify-center items-center py-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className='text-sm text-slate-500'>没有更多数据了</span>
          </motion.div>
        )}
      </div>

      {/* 滚动指示器 */}
      {isScrolling && (
        <motion.div
          className='absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none z-10'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Math.round(
            (scrollTop / (visibleRange.totalHeight - containerHeight)) * 100
          )}
          %
        </motion.div>
      )}

      {/* 快速滚动按钮 */}
      {items.length > 10 && (
        <div className='absolute bottom-4 right-4 flex flex-col space-y-2 z-10'>
          {/* 滚动到顶部 */}
          {scrollTop > containerHeight && (
            <motion.button
              className='w-10 h-10 bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm'
              onClick={() => scrollToTop()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 11l5-5m0 0l5 5m-5-5v12'
                />
              </svg>
            </motion.button>
          )}

          {/* 滚动到底部 */}
          {scrollTop < visibleRange.totalHeight - containerHeight - 100 && (
            <motion.button
              className='w-10 h-10 bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm'
              onClick={() => scrollToBottom()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 13l-5 5m0 0l-5-5m5 5V6'
                />
              </svg>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}

// 导出类型
export type { VirtualScrollListProps };

// 默认导出
export default VirtualScrollList;
