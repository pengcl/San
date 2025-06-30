import React, { useMemo } from 'react';
import {
  LazyImage,
  ResponsiveImage,
  LazyBackground,
} from '../common/LazyImage';
import {
  generateSrcSet,
  generateSizes,
  IMAGE_BREAKPOINTS,
  IMAGE_QUALITY,
  gameImageCache,
} from '../../utils/imageOptimizer';
import type { GameImageAsset } from '../../utils/imageOptimizer';

// 英雄头像组件
interface HeroAvatarProps {
  heroId: number;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  quality?: 'ssr' | 'sr' | 'r' | 'n';
  className?: string;
  onClick?: () => void;
  priority?: boolean;
}

const AVATAR_SIZES = {
  sm: 60,
  md: 80,
  lg: 120,
  xl: 200,
};

const QUALITY_FRAMES = {
  ssr: 'border-4 border-orange-400 shadow-orange-400/50',
  sr: 'border-4 border-purple-400 shadow-purple-400/50',
  r: 'border-4 border-blue-400 shadow-blue-400/50',
  n: 'border-4 border-gray-400 shadow-gray-400/50',
};

export const HeroAvatar: React.FC<HeroAvatarProps> = ({
  heroId,
  name,
  size = 'md',
  quality = 'n',
  className = '',
  onClick,
  priority = false,
}) => {
  const pixelSize = AVATAR_SIZES[size];
  const src = `/images/heroes/avatar_${heroId}.jpg`;

  // 生成响应式图片源
  const srcSet = useMemo(() => {
    return generateSrcSet(src, [
      { width: pixelSize, quality: IMAGE_QUALITY.high },
      { width: pixelSize * 1.5, quality: IMAGE_QUALITY.high },
      { width: pixelSize * 2, quality: IMAGE_QUALITY.ultra },
    ]);
  }, [src, pixelSize]);

  const containerClasses = [
    'hero-avatar',
    'relative',
    'rounded-full',
    'overflow-hidden',
    'shadow-lg',
    QUALITY_FRAMES[quality],
    onClick && 'cursor-pointer hover:scale-105 transition-transform',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      style={{ width: pixelSize, height: pixelSize }}
      onClick={onClick}
    >
      <LazyImage
        src={src}
        srcSet={srcSet}
        sizes={`${pixelSize}px`}
        alt={`${name}头像`}
        className='w-full h-full object-cover'
        aspectRatio={1}
        priority={priority}
        fadeIn
      />

      {/* 品质光效 */}
      {quality === 'ssr' && (
        <div className='absolute inset-0 bg-gradient-radial from-orange-400/20 to-transparent animate-pulse' />
      )}
    </div>
  );
};

// 物品图标组件
interface ItemIconProps {
  itemId: number;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  className?: string;
  onClick?: () => void;
}

const ITEM_SIZES = {
  sm: 40,
  md: 60,
  lg: 80,
};

export const ItemIcon: React.FC<ItemIconProps> = ({
  itemId,
  name,
  size = 'md',
  count,
  className = '',
  onClick,
}) => {
  const pixelSize = ITEM_SIZES[size];
  const src = `/images/items/item_${itemId}.png`;

  const containerClasses = [
    'item-icon',
    'relative',
    'rounded-lg',
    'bg-slate-800',
    'border-2',
    'border-slate-600',
    onClick && 'cursor-pointer hover:border-orange-400 transition-colors',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      style={{ width: pixelSize, height: pixelSize }}
      onClick={onClick}
    >
      <LazyImage
        src={src}
        alt={`${name}图标`}
        className='w-full h-full object-contain p-1'
        aspectRatio={1}
        fadeIn
      />

      {/* 数量显示 */}
      {count && count > 1 && (
        <div className='absolute bottom-0 right-0 bg-slate-900/90 text-white text-xs px-1 rounded'>
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  );
};

// 技能图标组件
interface SkillIconProps {
  skillId: number;
  name: string;
  cooldown?: number;
  isActive?: boolean;
  isOnCooldown?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SkillIcon: React.FC<SkillIconProps> = ({
  skillId,
  name,
  cooldown,
  isActive = false,
  isOnCooldown = false,
  className = '',
  onClick,
}) => {
  const src = `/images/skills/skill_${skillId}.png`;

  const containerClasses = [
    'skill-icon',
    'relative',
    'w-16',
    'h-16',
    'rounded-lg',
    'overflow-hidden',
    'border-2',
    isActive
      ? 'border-orange-400 shadow-lg shadow-orange-400/50'
      : 'border-slate-600',
    isOnCooldown && 'opacity-50',
    onClick &&
      !isOnCooldown &&
      'cursor-pointer hover:border-orange-400 transition-all',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      onClick={!isOnCooldown ? onClick : undefined}
    >
      <LazyImage
        src={src}
        alt={`${name}技能`}
        className='w-full h-full object-cover'
        aspectRatio={1}
        fadeIn
      />

      {/* 冷却时间遮罩 */}
      {isOnCooldown && cooldown && (
        <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
          <span className='text-white font-bold text-lg'>{cooldown}</span>
        </div>
      )}

      {/* 激活效果 */}
      {isActive && !isOnCooldown && (
        <div className='absolute inset-0 bg-gradient-to-t from-orange-400/30 to-transparent animate-pulse' />
      )}
    </div>
  );
};

// 场景背景组件
interface SceneBackgroundProps {
  sceneId: string;
  name: string;
  children?: React.ReactNode;
  overlay?: boolean;
  parallax?: boolean;
  className?: string;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  sceneId,
  name,
  children,
  overlay = true,
  parallax = false,
  className = '',
}) => {
  // 根据场景ID获取不同分辨率的背景图
  const backgrounds = useMemo(
    () => ({
      mobile: `/images/backgrounds/${sceneId}_mobile.jpg`,
      desktop: `/images/backgrounds/${sceneId}_desktop.jpg`,
      wide: `/images/backgrounds/${sceneId}_wide.jpg`,
    }),
    [sceneId]
  );

  const containerClasses = [
    'scene-background',
    'relative',
    'w-full',
    'h-full',
    'overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (parallax) {
    // 视差滚动效果
    return (
      <div className={containerClasses}>
        <div className='absolute inset-0 transform scale-110'>
          <ResponsiveImage
            src={backgrounds.desktop}
            webpSrc={backgrounds.desktop.replace('.jpg', '.webp')}
            srcSet={generateSrcSet(backgrounds.desktop, [
              {
                width: IMAGE_BREAKPOINTS.mobile,
                quality: IMAGE_QUALITY.medium,
              },
              { width: IMAGE_BREAKPOINTS.desktop, quality: IMAGE_QUALITY.high },
              { width: IMAGE_BREAKPOINTS.wide, quality: IMAGE_QUALITY.ultra },
            ])}
            sizes={generateSizes()}
            alt={`${name}场景背景`}
            className='w-full h-full object-cover'
            priority
          />
        </div>

        {overlay && (
          <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60' />
        )}

        <div className='relative z-10 w-full h-full'>{children}</div>
      </div>
    );
  }

  return (
    <LazyBackground
      src={backgrounds.desktop}
      className={containerClasses}
      fadeIn
    >
      {overlay && (
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60' />
      )}

      <div className='relative z-10 w-full h-full'>{children}</div>
    </LazyBackground>
  );
};

// 卡牌图片组件
interface CardImageProps {
  cardId: number;
  name: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

const CARD_SIZES = {
  sm: { width: 120, height: 160 },
  md: { width: 180, height: 240 },
  lg: { width: 240, height: 320 },
};

export const CardImage: React.FC<CardImageProps> = ({
  cardId,
  name,
  rarity = 'common',
  size = 'md',
  animated = false,
  className = '',
  onClick,
}) => {
  const dimensions = CARD_SIZES[size];
  const baseUrl = `/images/cards/card_${cardId}`;

  // 不同稀有度的边框效果
  const rarityEffects = {
    common: 'border-gray-400',
    rare: 'border-blue-400 shadow-blue-400/30',
    epic: 'border-purple-400 shadow-purple-400/40',
    legendary: 'border-orange-400 shadow-orange-400/50 animate-pulse',
  };

  const containerClasses = [
    'card-image',
    'relative',
    'rounded-lg',
    'overflow-hidden',
    'border-2',
    'shadow-lg',
    rarityEffects[rarity],
    onClick && 'cursor-pointer hover:scale-105 transition-transform',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // 使用游戏图片缓存
  const cachedAsset = gameImageCache.getAsset(`card_${cardId}`);
  const src = cachedAsset?.url || `${baseUrl}.jpg`;
  const webpSrc = `${baseUrl}.webp`;

  return (
    <div
      className={containerClasses}
      style={{ width: dimensions.width, height: dimensions.height }}
      onClick={onClick}
    >
      <ResponsiveImage
        src={src}
        webpSrc={webpSrc}
        alt={`${name}卡牌`}
        className='w-full h-full object-cover'
        aspectRatio={dimensions.width / dimensions.height}
        fadeIn
        priority={size === 'lg'}
      />

      {/* 稀有度特效 */}
      {rarity === 'legendary' && (
        <div className='absolute inset-0 bg-gradient-radial from-orange-400/10 via-transparent to-transparent pointer-events-none' />
      )}

      {/* 动画效果 */}
      {animated && (
        <div className='absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none' />
      )}
    </div>
  );
};

// 缩略图画廊组件
interface ThumbnailGalleryProps {
  images: Array<{
    id: string;
    src: string;
    alt: string;
    thumbnail?: string;
  }>;
  columns?: number;
  gap?: number;
  onImageClick?: (id: string) => void;
  className?: string;
}

export const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({
  images,
  columns = 4,
  gap = 8,
  onImageClick,
  className = '',
}) => {
  const containerClasses = [
    'thumbnail-gallery',
    'grid',
    `grid-cols-${columns}`,
    `gap-${gap}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {images.map(image => (
        <div
          key={image.id}
          className='relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform'
          onClick={() => onImageClick?.(image.id)}
        >
          <LazyImage
            src={image.thumbnail || image.src}
            alt={image.alt}
            className='w-full h-full object-cover'
            aspectRatio={1}
            fadeIn
          />
        </div>
      ))}
    </div>
  );
};

// 预加载游戏资源Hook
export const usePreloadGameAssets = (assets: GameImageAsset[]) => {
  React.useEffect(() => {
    // 添加到缓存
    gameImageCache.addAssets(assets);

    // 预加载高优先级资源
    const priorityAssets = assets
      .filter(asset => asset.category === 'hero' || asset.category === 'ui')
      .map(asset => asset.id);

    gameImageCache.preloadAssets(priorityAssets);
  }, [assets]);
};

export default {
  HeroAvatar,
  ItemIcon,
  SkillIcon,
  SceneBackground,
  CardImage,
  ThumbnailGallery,
  usePreloadGameAssets,
};
