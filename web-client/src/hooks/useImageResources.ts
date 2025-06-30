import { useState, useEffect, useCallback, useRef } from 'react';
import {
  checkWebPSupport,
  checkAVIFSupport,
  gameImageCache,
  imagePerformanceMonitor,
} from '../utils/imageOptimizer';
import type { GameImageAsset } from '../utils/imageOptimizer';

// 图片加载状态
type ImageLoadState = 'idle' | 'loading' | 'loaded' | 'error';

// 图片资源信息
interface ImageResource {
  id: string;
  url: string;
  thumbnail?: string;
  webpUrl?: string;
  avifUrl?: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  loadState: ImageLoadState;
  loadTime?: number;
  error?: string;
}

// 图片支持检测结果
interface FormatSupport {
  webp: boolean;
  avif: boolean;
  loading: boolean;
}

// 图片预加载选项
interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
  retries?: number;
}

// 使用图片格式支持检测
export const useFormatSupport = (): FormatSupport => {
  const [support, setSupport] = useState<FormatSupport>({
    webp: false,
    avif: false,
    loading: true,
  });

  useEffect(() => {
    const checkSupport = async () => {
      try {
        const [webpSupported, avifSupported] = await Promise.all([
          checkWebPSupport(),
          checkAVIFSupport(),
        ]);

        setSupport({
          webp: webpSupported,
          avif: avifSupported,
          loading: false,
        });
      } catch (error) {
        console.error('Format support check failed:', error);
        setSupport({
          webp: false,
          avif: false,
          loading: false,
        });
      }
    };

    checkSupport();
  }, []);

  return support;
};

// 使用图片资源管理
export const useImageResources = () => {
  const [resources, setResources] = useState<Map<string, ImageResource>>(
    new Map()
  );
  const [preloadQueue, setPreloadQueue] = useState<Set<string>>(new Set());
  const formatSupport = useFormatSupport();
  const abortControllerRef = useRef<Map<string, AbortController>>(new Map());

  // 获取最佳格式的URL
  const getBestFormatUrl = useCallback(
    (resource: ImageResource): string => {
      if (formatSupport.avif && resource.avifUrl) {
        return resource.avifUrl;
      }
      if (formatSupport.webp && resource.webpUrl) {
        return resource.webpUrl;
      }
      return resource.url;
    },
    [formatSupport]
  );

  // 添加图片资源
  const addResource = useCallback(
    (id: string, asset: Partial<ImageResource>) => {
      setResources(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(id) || { id, url: '', loadState: 'idle' };

        newMap.set(id, {
          ...existing,
          ...asset,
          id,
        });

        return newMap;
      });
    },
    []
  );

  // 预加载图片
  const preloadImage = useCallback(
    async (id: string, options: PreloadOptions = {}): Promise<void> => {
      const resource = resources.get(id);
      if (!resource || resource.loadState === 'loaded') {
        return;
      }

      const { timeout = 10000, retries = 2 } = options;

      // 避免重复预加载
      if (preloadQueue.has(id)) {
        return;
      }

      setPreloadQueue(prev => new Set(prev).add(id));

      // 更新加载状态
      setResources(prev => {
        const newMap = new Map(prev);
        const updated = { ...resource, loadState: 'loading' as ImageLoadState };
        newMap.set(id, updated);
        return newMap;
      });

      // 开始性能监控
      imagePerformanceMonitor.startTiming(id);

      let attempt = 0;
      while (attempt < retries) {
        try {
          // 创建AbortController
          const abortController = new AbortController();
          abortControllerRef.current.set(id, abortController);

          const img = new Image();
          const url = getBestFormatUrl(resource);

          await new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              abortController.abort();
              reject(new Error('Image load timeout'));
            }, timeout);

            img.onload = () => {
              clearTimeout(timeoutId);
              resolve();
            };

            img.onerror = () => {
              clearTimeout(timeoutId);
              reject(new Error('Image load failed'));
            };

            // 处理中断
            abortController.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              reject(new Error('Image load aborted'));
            });

            img.src = url;
          });

          // 记录图片尺寸
          const loadTime = imagePerformanceMonitor.endTiming(id) || 0;

          setResources(prev => {
            const newMap = new Map(prev);
            const updated = {
              ...resource,
              loadState: 'loaded' as ImageLoadState,
              width: img.naturalWidth,
              height: img.naturalHeight,
              loadTime,
            };
            newMap.set(id, updated);
            return newMap;
          });

          break; // 成功加载，退出重试循环
        } catch (error) {
          attempt++;
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          if (attempt >= retries) {
            // 记录错误
            imagePerformanceMonitor.recordError(id, error as Error);

            setResources(prev => {
              const newMap = new Map(prev);
              const updated = {
                ...resource,
                loadState: 'error' as ImageLoadState,
                error: errorMessage,
              };
              newMap.set(id, updated);
              return newMap;
            });
          } else {
            // 等待重试
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        } finally {
          abortControllerRef.current.delete(id);
        }
      }

      setPreloadQueue(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    },
    [resources, getBestFormatUrl]
  );

  // 批量预加载
  const preloadImages = useCallback(
    async (ids: string[], options: PreloadOptions = {}): Promise<void> => {
      const { priority = 'medium' } = options;

      // 根据优先级排序
      const sortedIds = [...ids];

      // 并发控制
      const concurrency =
        priority === 'high' ? 4 : priority === 'medium' ? 2 : 1;
      const chunks = [];
      for (let i = 0; i < sortedIds.length; i += concurrency) {
        chunks.push(sortedIds.slice(i, i + concurrency));
      }

      for (const chunk of chunks) {
        await Promise.allSettled(chunk.map(id => preloadImage(id, options)));
      }
    },
    [preloadImage]
  );

  // 取消预加载
  const cancelPreload = useCallback((id: string) => {
    const abortController = abortControllerRef.current.get(id);
    if (abortController) {
      abortController.abort();
      abortControllerRef.current.delete(id);
    }

    setPreloadQueue(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    setResources(prev => {
      const newMap = new Map(prev);
      const resource = newMap.get(id);
      if (resource && resource.loadState === 'loading') {
        newMap.set(id, { ...resource, loadState: 'idle' });
      }
      return newMap;
    });
  }, []);

  // 清理资源
  const clearResources = useCallback(() => {
    // 取消所有进行中的预加载
    abortControllerRef.current.forEach(controller => controller.abort());
    abortControllerRef.current.clear();

    setResources(new Map());
    setPreloadQueue(new Set());
  }, []);

  // 获取资源统计
  const getStats = useCallback(() => {
    const resourceArray = Array.from(resources.values());
    const total = resourceArray.length;
    const loaded = resourceArray.filter(r => r.loadState === 'loaded').length;
    const loading = resourceArray.filter(r => r.loadState === 'loading').length;
    const error = resourceArray.filter(r => r.loadState === 'error').length;
    const avgLoadTime =
      resourceArray
        .filter(r => r.loadTime)
        .reduce((sum, r) => sum + (r.loadTime || 0), 0) / Math.max(loaded, 1);

    return {
      total,
      loaded,
      loading,
      error,
      progress: total > 0 ? (loaded / total) * 100 : 0,
      avgLoadTime,
      formatSupport,
    };
  }, [resources, formatSupport]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      abortControllerRef.current.forEach(controller => controller.abort());
    };
  }, []);

  return {
    resources: Array.from(resources.values()),
    formatSupport,
    addResource,
    preloadImage,
    preloadImages,
    cancelPreload,
    clearResources,
    getBestFormatUrl,
    getStats,
    isLoading: preloadQueue.size > 0,
  };
};

// 使用游戏图片资源
export const useGameImageResources = () => {
  const imageResources = useImageResources();

  // 预定义的游戏图片类别
  const preloadByCategory = useCallback(
    async (category: GameImageAsset['category'], options?: PreloadOptions) => {
      const assets = gameImageCache.getAssetsByCategory(category);
      const ids = assets.map(asset => asset.id);

      // 添加到资源管理器
      assets.forEach(asset => {
        imageResources.addResource(asset.id, {
          url: asset.url,
          thumbnail: asset.thumbnail,
          webpUrl: asset.url.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
          width: asset.width,
          height: asset.height,
        });
      });

      await imageResources.preloadImages(ids, options);
    },
    [imageResources]
  );

  // 预加载英雄头像
  const preloadHeroAvatars = useCallback(
    (heroIds: number[]) => {
      const resources = heroIds.map(id => ({
        id: `hero_avatar_${id}`,
        url: `/images/heroes/avatar_${id}.jpg`,
        webpUrl: `/images/heroes/avatar_${id}.webp`,
      }));

      resources.forEach(resource => {
        imageResources.addResource(resource.id, resource);
      });

      return imageResources.preloadImages(
        resources.map(r => r.id),
        { priority: 'high' }
      );
    },
    [imageResources]
  );

  // 预加载物品图标
  const preloadItemIcons = useCallback(
    (itemIds: number[]) => {
      const resources = itemIds.map(id => ({
        id: `item_icon_${id}`,
        url: `/images/items/item_${id}.png`,
        webpUrl: `/images/items/item_${id}.webp`,
      }));

      resources.forEach(resource => {
        imageResources.addResource(resource.id, resource);
      });

      return imageResources.preloadImages(
        resources.map(r => r.id),
        { priority: 'medium' }
      );
    },
    [imageResources]
  );

  return {
    ...imageResources,
    preloadByCategory,
    preloadHeroAvatars,
    preloadItemIcons,
  };
};

export default {
  useFormatSupport,
  useImageResources,
  useGameImageResources,
};
