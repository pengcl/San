// 图片优化工具

// 图片格式
export type ImageFormat = 'webp' | 'jpeg' | 'jpg' | 'png' | 'avif';

// 图片尺寸配置
export interface ImageSize {
  width: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
}

// 响应式图片断点
export const IMAGE_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1920,
} as const;

// 图片质量预设
export const IMAGE_QUALITY = {
  low: 60,
  medium: 75,
  high: 85,
  ultra: 95,
} as const;

// 图片优化配置
export interface ImageOptimizationConfig {
  sizes: ImageSize[];
  formats: ImageFormat[];
  defaultQuality: number;
  lazyLoad: boolean;
  placeholder: 'blur' | 'none' | 'color';
  placeholderColor?: string;
}

// 默认优化配置
export const DEFAULT_IMAGE_CONFIG: ImageOptimizationConfig = {
  sizes: [
    { width: 320, quality: IMAGE_QUALITY.low },
    { width: 640, quality: IMAGE_QUALITY.medium },
    { width: 768, quality: IMAGE_QUALITY.medium },
    { width: 1024, quality: IMAGE_QUALITY.high },
    { width: 1280, quality: IMAGE_QUALITY.high },
    { width: 1920, quality: IMAGE_QUALITY.ultra },
  ],
  formats: ['webp', 'jpeg'],
  defaultQuality: IMAGE_QUALITY.medium,
  lazyLoad: true,
  placeholder: 'blur',
};

// 生成响应式图片URL
export const generateResponsiveImageUrl = (
  baseUrl: string,
  size: ImageSize,
  format?: ImageFormat
): string => {
  // 这里假设使用图片CDN服务，支持动态调整大小
  // 实际项目中需要根据具体的CDN或图片服务器配置
  const params = new URLSearchParams();

  params.set('w', size.width.toString());
  if (size.height) params.set('h', size.height.toString());
  if (size.quality) params.set('q', size.quality.toString());
  if (format) params.set('f', format);

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${params.toString()}`;
};

// 生成srcSet字符串
export const generateSrcSet = (
  baseUrl: string,
  sizes: ImageSize[],
  format?: ImageFormat
): string => {
  return sizes
    .map(size => {
      const url = generateResponsiveImageUrl(baseUrl, size, format);
      return `${url} ${size.width}w`;
    })
    .join(', ');
};

// 生成sizes属性
export const generateSizes = (
  breakpoints: Partial<typeof IMAGE_BREAKPOINTS> = IMAGE_BREAKPOINTS
): string => {
  const sizes: string[] = [];

  if (breakpoints.mobile) {
    sizes.push(`(max-width: ${breakpoints.mobile}px) 100vw`);
  }
  if (breakpoints.tablet) {
    sizes.push(`(max-width: ${breakpoints.tablet}px) 100vw`);
  }
  if (breakpoints.desktop) {
    sizes.push(`(max-width: ${breakpoints.desktop}px) 50vw`);
  }

  sizes.push('33vw'); // 默认值

  return sizes.join(', ');
};

// 获取图片尺寸
export const getImageDimensions = (
  url: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };

    img.src = url;
  });
};

// 计算宽高比
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

// 图片压缩（前端压缩，适用于用户上传）
export const compressImage = async (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'webp';
  } = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // 计算新尺寸
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为Blob
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

// 生成图片占位符（模糊效果）
export const generatePlaceholder = async (
  url: string,
  size: number = 20
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // 设置小尺寸以生成模糊效果
      const ratio = img.width / img.height;
      canvas.width = size;
      canvas.height = size / ratio;

      // 绘制缩小的图片
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 转换为base64
      resolve(canvas.toDataURL('image/jpeg', 0.4));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for placeholder'));
    };

    img.src = url;
  });
};

// 检查WebP支持
let webpSupported: boolean | undefined;

export const checkWebPSupport = (): Promise<boolean> => {
  if (webpSupported !== undefined) {
    return Promise.resolve(webpSupported);
  }

  return new Promise(resolve => {
    const webp = new Image();

    webp.onload = webp.onerror = () => {
      webpSupported = webp.height === 2;
      resolve(webpSupported);
    };

    webp.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// 检查AVIF支持
let avifSupported: boolean | undefined;

export const checkAVIFSupport = (): Promise<boolean> => {
  if (avifSupported !== undefined) {
    return Promise.resolve(avifSupported);
  }

  return new Promise(resolve => {
    const avif = new Image();

    avif.onload = avif.onerror = () => {
      avifSupported = avif.height === 2;
      resolve(avifSupported);
    };

    avif.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
  });
};

// 图片性能监控
export class ImagePerformanceMonitor {
  private loadTimes: Map<string, number> = new Map();
  private errors: Map<string, Error> = new Map();

  // 开始计时
  startTiming(url: string): void {
    this.loadTimes.set(url, performance.now());
  }

  // 结束计时
  endTiming(url: string): number | null {
    const startTime = this.loadTimes.get(url);
    if (!startTime) return null;

    const loadTime = performance.now() - startTime;
    this.loadTimes.delete(url);

    // 记录慢加载
    if (loadTime > 3000) {
      console.warn(`Slow image load: ${url} took ${loadTime.toFixed(2)}ms`);
    }

    return loadTime;
  }

  // 记录错误
  recordError(url: string, error: Error): void {
    this.errors.set(url, error);
    console.error(`Image load error: ${url}`, error);
  }

  // 获取统计信息
  getStats(): {
    totalLoads: number;
    totalErrors: number;
    averageLoadTime: number;
    slowLoads: number;
  } {
    const loadTimes = Array.from(this.loadTimes.values());
    const now = performance.now();
    const completedLoads = loadTimes.filter(time => now - time > 0);

    return {
      totalLoads: completedLoads.length,
      totalErrors: this.errors.size,
      averageLoadTime:
        completedLoads.length > 0
          ? completedLoads.reduce((sum, time) => sum + (now - time), 0) /
            completedLoads.length
          : 0,
      slowLoads: completedLoads.filter(time => now - time > 3000).length,
    };
  }

  // 清理数据
  clear(): void {
    this.loadTimes.clear();
    this.errors.clear();
  }
}

// 全局图片性能监控实例
export const imagePerformanceMonitor = new ImagePerformanceMonitor();

// 游戏图片资源管理
export interface GameImageAsset {
  id: string;
  category: 'hero' | 'item' | 'skill' | 'background' | 'ui';
  url: string;
  thumbnail?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  size?: number;
  format?: ImageFormat;
}

// 游戏图片资源缓存
export class GameImageCache {
  private cache: Map<string, GameImageAsset> = new Map();
  private preloadQueue: Set<string> = new Set();

  // 添加资源
  addAsset(asset: GameImageAsset): void {
    this.cache.set(asset.id, asset);
  }

  // 批量添加资源
  addAssets(assets: GameImageAsset[]): void {
    assets.forEach(asset => this.addAsset(asset));
  }

  // 获取资源
  getAsset(id: string): GameImageAsset | undefined {
    return this.cache.get(id);
  }

  // 获取分类资源
  getAssetsByCategory(category: GameImageAsset['category']): GameImageAsset[] {
    return Array.from(this.cache.values()).filter(
      asset => asset.category === category
    );
  }

  // 预加载资源
  async preloadAssets(ids: string[]): Promise<void> {
    const promises = ids.map(async id => {
      const asset = this.cache.get(id);
      if (!asset || this.preloadQueue.has(id)) return;

      this.preloadQueue.add(id);

      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = asset.url;
        });

        // 缓存图片尺寸
        if (!asset.width || !asset.height) {
          asset.width = img.naturalWidth;
          asset.height = img.naturalHeight;
        }
      } catch (error) {
        console.error(`Failed to preload asset: ${id}`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // 清理缓存
  clear(): void {
    this.cache.clear();
    this.preloadQueue.clear();
  }
}

// 全局游戏图片缓存实例
export const gameImageCache = new GameImageCache();

export default {
  generateResponsiveImageUrl,
  generateSrcSet,
  generateSizes,
  getImageDimensions,
  calculateAspectRatio,
  compressImage,
  generatePlaceholder,
  checkWebPSupport,
  checkAVIFSupport,
  imagePerformanceMonitor,
  gameImageCache,
};
