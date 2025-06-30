import React, { useState, useEffect, useRef } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

// 图片加载状态
type ImageLoadState = 'idle' | 'loading' | 'loaded' | 'error';

// 图片源配置
interface ImageSource {
  src: string;
  srcSet?: string;
  media?: string;
  type?: string;
}

// LazyImage组件属性
interface LazyImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src: string | ImageSource[];
  alt: string;
  placeholder?: string; // 占位图
  fallback?: string; // 加载失败时的备用图
  blur?: boolean; // 是否使用模糊效果
  aspectRatio?: number; // 宽高比
  threshold?: number; // 可见性阈值
  rootMargin?: string; // 观察器边距
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fadeIn?: boolean; // 淡入效果
  priority?: boolean; // 优先加载
  sizes?: string;
  decoding?: 'async' | 'sync' | 'auto';
}

// 默认占位图（Base64编码的1x1透明图片）
const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';

// 默认错误图
const DEFAULT_FALLBACK =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="20"%3E加载失败%3C/text%3E%3C/svg%3E';

// 获取图片源字符串
const getImageSrc = (src: string | ImageSource[]): string => {
  if (typeof src === 'string') return src;
  if (Array.isArray(src) && src.length > 0) {
    return src[0].src;
  }
  return DEFAULT_PLACEHOLDER;
};

// 预加载图片
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = DEFAULT_PLACEHOLDER,
  fallback = DEFAULT_FALLBACK,
  blur = true,
  aspectRatio,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  fadeIn = true,
  priority = false,
  sizes,
  decoding = 'async',
  className = '',
  style,
  ...rest
}) => {
  const [loadState, setLoadState] = useState<ImageLoadState>('idle');
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mounted = useRef(true);

  // 获取实际图片源
  const actualSrc = getImageSrc(src);

  // 加载图片
  const loadImage = async () => {
    if (loadState !== 'idle' || !actualSrc) return;

    setLoadState('loading');

    try {
      await preloadImage(actualSrc);

      if (!mounted.current) return;

      setCurrentSrc(actualSrc);
      setLoadState('loaded');
      onLoad?.();
    } catch (error) {
      if (!mounted.current) return;

      console.error('Image load error:', error);
      setCurrentSrc(fallback);
      setLoadState('error');
      onError?.(error as Error);
    }
  };

  // 设置Intersection Observer
  useEffect(() => {
    if (!imgRef.current || priority) {
      if (priority) {
        loadImage();
      }
      return;
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isIntersecting) {
            setIsIntersecting(true);
            loadImage();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [actualSrc, threshold, rootMargin, priority]);

  // 组件卸载时清理
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // 计算样式
  const containerStyle = {
    ...style,
    ...(aspectRatio ? { aspectRatio: aspectRatio.toString() } : {}),
  };

  // 图片类名
  const imgClassName = [
    'lazy-image',
    className,
    loadState === 'loading' && blur && 'blur-sm',
    fadeIn && 'transition-opacity duration-300',
    loadState === 'loaded' && fadeIn && 'opacity-100',
    loadState !== 'loaded' && fadeIn && 'opacity-0',
  ]
    .filter(Boolean)
    .join(' ');

  // 渲染picture元素（多源支持）
  if (Array.isArray(src) && src.length > 1) {
    return (
      <picture className='lazy-image-container'>
        {src.slice(0, -1).map((source, index) => (
          <source
            key={index}
            srcSet={
              loadState === 'loaded' ? source.srcSet || source.src : placeholder
            }
            media={source.media}
            type={source.type}
          />
        ))}
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={imgClassName}
          style={containerStyle}
          sizes={sizes}
          decoding={decoding}
          loading={priority ? 'eager' : 'lazy'}
          {...rest}
        />
      </picture>
    );
  }

  // 渲染单个img元素
  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={imgClassName}
      style={containerStyle}
      sizes={sizes}
      decoding={decoding}
      loading={priority ? 'eager' : 'lazy'}
      {...rest}
    />
  );
};

// 响应式图片组件
interface ResponsiveImageProps extends Omit<LazyImageProps, 'src'> {
  src: string;
  srcSet?: string;
  webpSrc?: string;
  webpSrcSet?: string;
  sizes?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  srcSet,
  webpSrc,
  webpSrcSet,
  sizes = '100vw',
  ...rest
}) => {
  const sources: ImageSource[] = [];

  // 添加WebP源
  if (webpSrc || webpSrcSet) {
    sources.push({
      src: webpSrc || src,
      srcSet: webpSrcSet || srcSet,
      type: 'image/webp',
    });
  }

  // 添加原始格式源
  sources.push({
    src,
    srcSet,
  });

  return <LazyImage src={sources} sizes={sizes} {...rest} />;
};

// 背景图片懒加载组件
interface LazyBackgroundProps {
  src: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  blur?: boolean;
  fadeIn?: boolean;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const LazyBackground: React.FC<LazyBackgroundProps> = ({
  src,
  placeholder = DEFAULT_PLACEHOLDER,
  className = '',
  style,
  children,
  blur = true,
  fadeIn = true,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
}) => {
  const [loadState, setLoadState] = useState<ImageLoadState>('idle');
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 加载背景图片
  const loadBackgroundImage = async () => {
    if (loadState !== 'idle' || !src) return;

    setLoadState('loading');

    try {
      await preloadImage(src);
      setCurrentSrc(src);
      setLoadState('loaded');
      onLoad?.();
    } catch (error) {
      console.error('Background image load error:', error);
      setLoadState('error');
      onError?.(error as Error);
    }
  };

  // 设置Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadBackgroundImage();
            observerRef.current?.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, threshold, rootMargin]);

  const containerClassName = [
    'lazy-background',
    className,
    loadState === 'loading' && blur && 'backdrop-blur-sm',
    fadeIn && 'transition-opacity duration-500',
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyle: React.CSSProperties = {
    ...style,
    backgroundImage: `url(${currentSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <motion.div
      ref={containerRef}
      className={containerClassName}
      style={containerStyle}
      initial={fadeIn ? { opacity: 0 } : false}
      animate={fadeIn && loadState === 'loaded' ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

// 图片预加载Hook
export const useImagePreloader = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const preloadImages = async (urls: string[]) => {
    if (urls.length === 0) return;

    setLoading(true);
    setProgress(0);
    setErrors([]);

    let loaded = 0;
    const errors: string[] = [];

    const promises = urls.map(async url => {
      try {
        await preloadImage(url);
        loaded++;
        setProgress((loaded / urls.length) * 100);
      } catch (error) {
        console.error(`Failed to preload: ${url}`, error);
        errors.push(url);
      }
    });

    await Promise.allSettled(promises);

    setLoading(false);
    setErrors(errors);

    return {
      success: urls.length - errors.length,
      failed: errors.length,
      errors,
    };
  };

  return {
    preloadImages,
    loading,
    progress,
    errors,
  };
};

export default LazyImage;
