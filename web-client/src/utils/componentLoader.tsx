import React, { Suspense } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
// 临时使用简单的loading组件
const LoadingSpinner = () => (
  <div className='flex items-center justify-center p-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500'></div>
  </div>
);

// 组件加载选项接口
interface ComponentLoaderOptions {
  fallback?: React.ComponentType;
  timeout?: number;
  retries?: number;
  preload?: boolean;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
}

// 组件动态加载器
export class ComponentLoader {
  private static instance: ComponentLoader;
  private loadedComponents = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  static getInstance(): ComponentLoader {
    if (!ComponentLoader.instance) {
      ComponentLoader.instance = new ComponentLoader();
    }
    return ComponentLoader.instance;
  }

  // 懒加载组件工厂
  createLazyComponent<T extends ComponentType<any>>(
    name: string,
    importFn: () => Promise<{ default: T }>,
    options: ComponentLoaderOptions = {}
  ): LazyExoticComponent<T> {
    const { timeout = 30000, retries = 3, preload = false } = options;

    // 带超时和重试的导入函数
    const importWithRetryAndTimeout = async (): Promise<{ default: T }> => {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(
              () => reject(new Error('Component load timeout')),
              timeout
            );
          });

          const result = await Promise.race([importFn(), timeoutPromise]);

          // 缓存组件
          this.loadedComponents.set(name, result);
          return result;
        } catch (error) {
          console.warn(
            `Component ${name} load attempt ${attempt + 1} failed:`,
            error
          );

          if (attempt === retries - 1) {
            throw error;
          }

          // 指数退避
          await new Promise(resolve =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }

      throw new Error(
        `Failed to load component ${name} after ${retries} attempts`
      );
    };

    const LazyComponent = React.lazy(importWithRetryAndTimeout);

    // 预加载逻辑
    if (preload) {
      this.preloadComponent(name, importWithRetryAndTimeout);
    }

    // 简化的包装组件
    const WrappedComponent = (props: any) => (
      <Suspense fallback={<LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );

    WrappedComponent.displayName = `LazyLoaded(${name})`;
    return WrappedComponent as any;
  }

  // 预加载组件
  async preloadComponent(
    name: string,
    importFn: () => Promise<any>
  ): Promise<void> {
    if (this.loadedComponents.has(name)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const promise = importFn()
      .then(module => {
        this.loadedComponents.set(name, module);
        this.loadingPromises.delete(name);
        return module;
      })
      .catch(error => {
        console.error(`Failed to preload component ${name}:`, error);
        this.loadingPromises.delete(name);
        throw error;
      });

    this.loadingPromises.set(name, promise);
    return promise;
  }

  // 批量预加载
  async preloadComponents(
    components: Array<{
      name: string;
      importFn: () => Promise<any>;
    }>
  ): Promise<void> {
    const promises = components.map(comp =>
      this.preloadComponent(comp.name, comp.importFn)
    );

    await Promise.allSettled(promises);
  }

  // 获取加载状态
  getLoadStatus() {
    return {
      loaded: Array.from(this.loadedComponents.keys()),
      loading: Array.from(this.loadingPromises.keys()),
    };
  }

  // 清理缓存
  clearCache(componentName?: string) {
    if (componentName) {
      this.loadedComponents.delete(componentName);
      this.loadingPromises.delete(componentName);
    } else {
      this.loadedComponents.clear();
      this.loadingPromises.clear();
    }
  }
}

// 单例实例
export const componentLoader = ComponentLoader.getInstance();

// 便捷函数：创建懒加载组件
export const createLazyComponent = <T extends ComponentType<any>>(
  name: string,
  importFn: () => Promise<{ default: T }>,
  options?: ComponentLoaderOptions
) => componentLoader.createLazyComponent(name, importFn, options);

// React Hook：使用组件加载器
export const useComponentLoader = () => {
  const [status, setStatus] = React.useState(componentLoader.getLoadStatus());

  const updateStatus = React.useCallback(() => {
    setStatus(componentLoader.getLoadStatus());
  }, []);

  const preload = React.useCallback(
    (name: string, importFn: () => Promise<any>) => {
      return componentLoader
        .preloadComponent(name, importFn)
        .finally(updateStatus);
    },
    [updateStatus]
  );

  const preloadComponents = React.useCallback(
    (components: Array<{ name: string; importFn: () => Promise<any> }>) => {
      return componentLoader
        .preloadComponents(components)
        .finally(updateStatus);
    },
    [updateStatus]
  );

  const clearCache = React.useCallback(
    (componentName?: string) => {
      componentLoader.clearCache(componentName);
      updateStatus();
    },
    [updateStatus]
  );

  return {
    ...status,
    preload,
    preloadComponents,
    clearCache,
  };
};

// 懒加载的预定义组件
export const LazyComponents = {
  // UI组件
  BattleScene: createLazyComponent(
    'BattleScene',
    () => import('../components/ui/BattleScene'),
    { preload: false, timeout: 10000 }
  ),

  FormationGrid: createLazyComponent(
    'FormationGrid',
    () => import('../components/ui/FormationGrid'),
    { preload: false }
  ),

  VirtualScrollList: createLazyComponent(
    'VirtualScrollList',
    () => import('../components/ui/VirtualScrollList'),
    { preload: true } // 常用组件预加载
  ),

  StorageManager: createLazyComponent(
    'StorageManager',
    () => import('../components/ui/StorageManager'),
    { preload: false }
  ),

  // 移动端组件
  HeroCardGrid: createLazyComponent(
    'HeroCardGrid',
    () => import('../components/mobile/HeroCardGrid'),
    { preload: true }
  ),

  FormationEditor: createLazyComponent(
    'FormationEditor',
    () => import('../components/mobile/FormationEditor'),
    { preload: false }
  ),
};

// 组件预加载配置
export const componentPreloadConfig = [
  {
    name: 'VirtualScrollList',
    importFn: () => import('../components/ui/VirtualScrollList'),
    priority: 'high' as const,
  },
  {
    name: 'HeroCardGrid',
    importFn: () => import('../components/mobile/HeroCardGrid'),
    priority: 'high' as const,
  },
  {
    name: 'FormationGrid',
    importFn: () => import('../components/ui/FormationGrid'),
    priority: 'medium' as const,
  },
  {
    name: 'BattleScene',
    importFn: () => import('../components/ui/BattleScene'),
    priority: 'low' as const,
  },
];

// 智能预加载Hook
export const useSmartComponentPreload = () => {
  const { preloadComponents } = useComponentLoader();

  React.useEffect(() => {
    // 根据网络条件决定预加载策略
    const preloadByPriority = () => {
      const highPriorityComponents = componentPreloadConfig.filter(
        comp => comp.priority === 'high'
      );

      // 立即预加载高优先级组件
      preloadComponents(highPriorityComponents);

      // 延迟预加载中等优先级组件
      setTimeout(() => {
        const mediumPriorityComponents = componentPreloadConfig.filter(
          comp => comp.priority === 'medium'
        );
        preloadComponents(mediumPriorityComponents);
      }, 2000);

      // 空闲时预加载低优先级组件
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const lowPriorityComponents = componentPreloadConfig.filter(
            comp => comp.priority === 'low'
          );
          preloadComponents(lowPriorityComponents);
        });
      }
    };

    // 检查网络条件
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === '4g') {
        preloadByPriority();
      } else if (connection.effectiveType === '3g') {
        // 只预加载高优先级组件
        const highPriorityComponents = componentPreloadConfig.filter(
          comp => comp.priority === 'high'
        );
        preloadComponents(highPriorityComponents);
      }
    } else {
      // 没有网络信息API，使用默认策略
      preloadByPriority();
    }
  }, [preloadComponents]);
};

export default {
  ComponentLoader,
  componentLoader,
  createLazyComponent,
  useComponentLoader,
  useSmartComponentPreload,
  LazyComponents,
};
