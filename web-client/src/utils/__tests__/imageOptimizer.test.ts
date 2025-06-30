import {
  checkWebPSupport,
  checkAVIFSupport,
  generateResponsiveImageUrl,
  generateSrcSet,
  generateSizes,
  gameImageCache,
  imagePerformanceMonitor,
  IMAGE_QUALITY,
  IMAGE_BREAKPOINTS,
} from '../imageOptimizer';

// Mock Image constructor
global.Image = class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';

  constructor() {
    // Simulate async loading
    setTimeout(() => {
      if (this.src.includes('webp') || this.src.includes('avif')) {
        this.onload?.();
      } else {
        this.onerror?.();
      }
    }, 10);
  }
} as any;

describe('imageOptimizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gameImageCache.clear();
    imagePerformanceMonitor.clear();
  });

  describe('Format Support Detection', () => {
    it('should detect WebP support', async () => {
      const isSupported = await checkWebPSupport();
      expect(typeof isSupported).toBe('boolean');
    });

    it('should detect AVIF support', async () => {
      const isSupported = await checkAVIFSupport();
      expect(typeof isSupported).toBe('boolean');
    });

    it('should handle format detection errors', async () => {
      // Mock Image to always fail
      global.Image = class FailingImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            this.onerror?.();
          }, 10);
        }
      } as any;

      const webpSupport = await checkWebPSupport();
      const avifSupport = await checkAVIFSupport();

      expect(webpSupport).toBe(false);
      expect(avifSupport).toBe(false);
    });
  });

  describe('URL Generation', () => {
    it('should generate responsive image URLs', () => {
      const baseUrl = '/images/hero.jpg';
      const size = { width: 400, quality: IMAGE_QUALITY.high };

      const url = generateResponsiveImageUrl(baseUrl, size, 'webp');

      expect(url).toContain('w=400');
      expect(url).toContain('q=85');
      expect(url).toContain('f=webp');
    });

    it('should handle URLs without extension', () => {
      const baseUrl = '/images/hero';
      const size = { width: 400, quality: IMAGE_QUALITY.medium };

      const url = generateResponsiveImageUrl(baseUrl, size);

      expect(url).toContain('w=400');
      expect(url).toContain('q=75');
    });

    it('should preserve query parameters', () => {
      const baseUrl = '/images/hero.jpg?version=1';
      const size = { width: 400, quality: IMAGE_QUALITY.high };

      const url = generateResponsiveImageUrl(baseUrl, size);

      expect(url).toContain('version=1');
      expect(url).toContain('w=400');
    });

    it('should generate srcSet correctly', () => {
      const baseUrl = '/images/hero.jpg';
      const sizes = [
        { width: 400, quality: IMAGE_QUALITY.medium },
        { width: 800, quality: IMAGE_QUALITY.high },
      ];

      const srcSet = generateSrcSet(baseUrl, sizes, 'webp');

      expect(srcSet).toContain('400w');
      expect(srcSet).toContain('800w');
      expect(srcSet).toContain('f=webp');
      expect(srcSet.split(',').length).toBe(2);
    });

    it('should generate sizes attribute correctly', () => {
      const sizes = generateSizes();

      expect(sizes).toContain('max-width');
      expect(sizes).toContain('100vw');
    });

    it('should generate custom sizes', () => {
      const customBreakpoints = [
        { maxWidth: 600, size: '50vw' },
        { maxWidth: 1200, size: '33vw' },
      ];

      const sizes = generateSizes(customBreakpoints);

      expect(sizes).toContain('(max-width: 600px) 50vw');
      expect(sizes).toContain('(max-width: 1200px) 33vw');
    });
  });

  describe('Game Image Cache', () => {
    const mockAsset = {
      id: 'hero_1',
      url: '/images/heroes/hero_1.jpg',
      category: 'hero' as const,
      width: 400,
      height: 600,
      thumbnail: '/images/heroes/hero_1_thumb.jpg',
    };

    it('should add and retrieve assets', () => {
      gameImageCache.addAsset(mockAsset);

      const retrieved = gameImageCache.getAsset('hero_1');
      expect(retrieved).toEqual(mockAsset);
    });

    it('should add multiple assets', () => {
      const assets = [
        mockAsset,
        { ...mockAsset, id: 'hero_2', url: '/images/heroes/hero_2.jpg' },
      ];

      gameImageCache.addAssets(assets);

      expect(gameImageCache.getAsset('hero_1')).toBeTruthy();
      expect(gameImageCache.getAsset('hero_2')).toBeTruthy();
    });

    it('should retrieve assets by category', () => {
      gameImageCache.addAssets([
        { ...mockAsset, id: 'hero_1', category: 'hero' },
        { ...mockAsset, id: 'item_1', category: 'item' },
        { ...mockAsset, id: 'hero_2', category: 'hero' },
      ]);

      const heroAssets = gameImageCache.getAssetsByCategory('hero');
      expect(heroAssets).toHaveLength(2);
      expect(heroAssets.every(asset => asset.category === 'hero')).toBe(true);
    });

    it('should check if asset exists', () => {
      gameImageCache.addAsset(mockAsset);

      expect(gameImageCache.hasAsset('hero_1')).toBe(true);
      expect(gameImageCache.hasAsset('hero_999')).toBe(false);
    });

    it('should clear cache', () => {
      gameImageCache.addAsset(mockAsset);
      expect(gameImageCache.hasAsset('hero_1')).toBe(true);

      gameImageCache.clear();
      expect(gameImageCache.hasAsset('hero_1')).toBe(false);
    });

    it('should get cache statistics', () => {
      gameImageCache.addAssets([
        { ...mockAsset, id: 'hero_1', category: 'hero' },
        { ...mockAsset, id: 'item_1', category: 'item' },
        { ...mockAsset, id: 'ui_1', category: 'ui' },
      ]);

      const stats = gameImageCache.getStats();
      expect(stats.total).toBe(3);
      expect(stats.byCategory.hero).toBe(1);
      expect(stats.byCategory.item).toBe(1);
      expect(stats.byCategory.ui).toBe(1);
    });

    it('should handle preloading assets', async () => {
      gameImageCache.addAsset(mockAsset);

      // Mock successful preload
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            this.onload?.();
          }, 10);
        }
      } as any;

      const result = await gameImageCache.preloadAssets(['hero_1']);
      expect(result).toEqual({ success: 1, failed: 0, errors: [] });
    });

    it('should handle preload failures', async () => {
      gameImageCache.addAsset(mockAsset);

      // Mock failed preload
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            this.onerror?.();
          }, 10);
        }
      } as any;

      const result = await gameImageCache.preloadAssets(['hero_1']);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('Performance Monitor', () => {
    it('should track loading times', () => {
      const id = 'test_image';

      imagePerformanceMonitor.startTiming(id);

      // Simulate some delay
      const startTime = Date.now();
      setTimeout(() => {
        const endTime = imagePerformanceMonitor.endTiming(id);
        expect(endTime).toBeGreaterThan(0);
      }, 50);
    });

    it('should record errors', () => {
      const id = 'test_image';
      const error = new Error('Load failed');

      imagePerformanceMonitor.recordError(id, error);

      const stats = imagePerformanceMonitor.getStats();
      expect(stats.errors).toBe(1);
      expect(stats.errorDetails).toHaveLength(1);
      expect(stats.errorDetails[0].error).toBe('Load failed');
    });

    it('should calculate statistics', () => {
      // Record some timings
      imagePerformanceMonitor.startTiming('img1');
      setTimeout(() => imagePerformanceMonitor.endTiming('img1'), 100);

      imagePerformanceMonitor.startTiming('img2');
      setTimeout(() => imagePerformanceMonitor.endTiming('img2'), 200);

      imagePerformanceMonitor.recordError('img3', new Error('Failed'));

      setTimeout(() => {
        const stats = imagePerformanceMonitor.getStats();
        expect(stats.totalLoads).toBe(2);
        expect(stats.errors).toBe(1);
        expect(stats.averageLoadTime).toBeGreaterThan(0);
      }, 250);
    });

    it('should clear statistics', () => {
      imagePerformanceMonitor.startTiming('img1');
      imagePerformanceMonitor.endTiming('img1');
      imagePerformanceMonitor.recordError('img2', new Error('Failed'));

      let stats = imagePerformanceMonitor.getStats();
      expect(stats.totalLoads).toBeGreaterThan(0);

      imagePerformanceMonitor.clear();
      stats = imagePerformanceMonitor.getStats();
      expect(stats.totalLoads).toBe(0);
      expect(stats.errors).toBe(0);
    });

    it('should handle concurrent timings', () => {
      const ids = ['img1', 'img2', 'img3'];

      // Start all timings
      ids.forEach(id => imagePerformanceMonitor.startTiming(id));

      // End them at different times
      setTimeout(() => imagePerformanceMonitor.endTiming('img1'), 50);
      setTimeout(() => imagePerformanceMonitor.endTiming('img2'), 100);
      setTimeout(() => imagePerformanceMonitor.endTiming('img3'), 150);

      setTimeout(() => {
        const stats = imagePerformanceMonitor.getStats();
        expect(stats.totalLoads).toBe(3);
      }, 200);
    });
  });

  describe('Constants', () => {
    it('should have correct image quality values', () => {
      expect(IMAGE_QUALITY.low).toBe(60);
      expect(IMAGE_QUALITY.medium).toBe(75);
      expect(IMAGE_QUALITY.high).toBe(85);
      expect(IMAGE_QUALITY.ultra).toBe(95);
    });

    it('should have correct breakpoint values', () => {
      expect(IMAGE_BREAKPOINTS.mobile).toBe(480);
      expect(IMAGE_BREAKPOINTS.tablet).toBe(768);
      expect(IMAGE_BREAKPOINTS.desktop).toBe(1024);
      expect(IMAGE_BREAKPOINTS.wide).toBe(1920);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty URLs', () => {
      const result = generateResponsiveImageUrl('', {
        width: 400,
        quality: 75,
      });
      expect(result).toBe('');
    });

    it('should handle invalid quality values', () => {
      const result = generateResponsiveImageUrl('/test.jpg', {
        width: 400,
        quality: -1,
      });
      expect(result).toContain('q=1'); // Should clamp to minimum

      const result2 = generateResponsiveImageUrl('/test.jpg', {
        width: 400,
        quality: 150,
      });
      expect(result2).toContain('q=100'); // Should clamp to maximum
    });

    it('should handle missing cache entries', () => {
      const result = gameImageCache.getAsset('nonexistent');
      expect(result).toBeUndefined();

      const categoryResult = gameImageCache.getAssetsByCategory(
        'nonexistent' as any
      );
      expect(categoryResult).toEqual([]);
    });

    it('should handle timing operations without start', () => {
      const result = imagePerformanceMonitor.endTiming('never_started');
      expect(result).toBeNull();
    });

    it('should handle large srcSet generation', () => {
      const baseUrl = '/test.jpg';
      const sizes = Array.from({ length: 10 }, (_, i) => ({
        width: (i + 1) * 100,
        quality: IMAGE_QUALITY.medium,
      }));

      const srcSet = generateSrcSet(baseUrl, sizes);
      expect(srcSet.split(',').length).toBe(10);
    });
  });
});
