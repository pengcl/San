import React, { Suspense } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import LoadingScreen from '../components/ui/LoadingScreen';

// 懒加载包装器接口
interface LazyWrapperOptions {
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ children: React.ReactNode }>;
  preload?: boolean;
  retryAttempts?: number;
}

// 懒加载组件包装器
export const lazyWithOptions = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyWrapperOptions = {}
): LazyExoticComponent<T> => {
  const { retryAttempts = 3 } = options;

  // 创建带重试的导入函数
  const importWithRetry = async (): Promise<{ default: T }> => {
    for (let i = 0; i < retryAttempts; i++) {
      try {
        return await importFn();
      } catch (error) {
        console.warn(`Route import attempt ${i + 1} failed:`, error);

        if (i === retryAttempts - 1) {
          throw error;
        }

        // 指数退避
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }

    throw new Error('Max retry attempts reached');
  };

  const LazyComponent = React.lazy(importWithRetry);

  // 预加载功能
  if (options.preload) {
    // 在空闲时间预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importWithRetry().catch(err => console.warn('Preload failed:', err));
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        importWithRetry().catch(err => console.warn('Preload failed:', err));
      }, 100);
    }
  }

  return LazyComponent;
};

// 高阶组件：为懒加载组件添加Suspense
export const withSuspense = <P extends object>(
  Component: LazyExoticComponent<ComponentType<P>>,
  fallbackComponent: React.ComponentType = LoadingScreen
) => {
  const SuspenseWrapper = (props: P) => (
    <Suspense fallback={React.createElement(fallbackComponent)}>
      <Component {...props} />
    </Suspense>
  );

  SuspenseWrapper.displayName = `withSuspense(Component)`;
  return SuspenseWrapper;
};

// 路由预加载管理器
class RoutePreloader {
  private preloadedRoutes = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();

  // 预加载路由
  preload(routeName: string, importFn: () => Promise<any>): Promise<any> {
    if (this.preloadedRoutes.has(routeName)) {
      return Promise.resolve();
    }

    if (this.preloadPromises.has(routeName)) {
      return this.preloadPromises.get(routeName)!;
    }

    const promise = importFn()
      .then(module => {
        this.preloadedRoutes.add(routeName);
        this.preloadPromises.delete(routeName);
        return module;
      })
      .catch(error => {
        console.error(`Failed to preload route ${routeName}:`, error);
        this.preloadPromises.delete(routeName);
        throw error;
      });

    this.preloadPromises.set(routeName, promise);
    return promise;
  }

  // 批量预加载
  async preloadRoutes(
    routes: Array<{ name: string; importFn: () => Promise<any> }>
  ) {
    const promises = routes.map(route =>
      this.preload(route.name, route.importFn)
    );

    return Promise.allSettled(promises);
  }

  // 检查路由是否已预加载
  isPreloaded(routeName: string): boolean {
    return this.preloadedRoutes.has(routeName);
  }

  // 获取预加载状态
  getPreloadStatus() {
    return {
      preloaded: Array.from(this.preloadedRoutes),
      loading: Array.from(this.preloadPromises.keys()),
    };
  }
}

export const routePreloader = new RoutePreloader();

// React Hook：路由预加载
export const useRoutePreloader = () => {
  const [status, setStatus] = React.useState(routePreloader.getPreloadStatus());

  const updateStatus = React.useCallback(() => {
    setStatus(routePreloader.getPreloadStatus());
  }, []);

  const preload = React.useCallback(
    (routeName: string, importFn: () => Promise<any>) => {
      return routePreloader.preload(routeName, importFn).finally(updateStatus);
    },
    [updateStatus]
  );

  const preloadRoutes = React.useCallback(
    (routes: Array<{ name: string; importFn: () => Promise<any> }>) => {
      return routePreloader.preloadRoutes(routes).finally(updateStatus);
    },
    [updateStatus]
  );

  return {
    ...status,
    preload,
    preloadRoutes,
    isPreloaded: routePreloader.isPreloaded.bind(routePreloader),
  };
};

// 智能预加载Hook（基于用户行为）
export const useSmartPreload = () => {
  const { preload } = useRoutePreloader();

  React.useEffect(() => {
    // 预加载高频访问的路由
    const coreRoutes = [
      { name: 'HomePage', importFn: () => import('../pages/game/HomePage') },
      {
        name: 'HeroesPage',
        importFn: () => import('../pages/game/HeroesPage'),
      },
      {
        name: 'HeroesPageMUI',
        importFn: () => import('../pages/game/HeroesPageMUI'),
      },
    ];

    // 在网络空闲时预加载
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (
        connection.effectiveType === '4g' ||
        connection.effectiveType === 'slow-2g'
      ) {
        coreRoutes.forEach(route => {
          preload(route.name, route.importFn);
        });
      }
    } else {
      // 没有网络信息API时，延迟预加载
      setTimeout(() => {
        coreRoutes.forEach(route => {
          preload(route.name, route.importFn);
        });
      }, 2000);
    }
  }, [preload]);
};

// 路由转场动画组件
export const RouteTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`route-transition ${className}`}>{children}</div>
);

export default {
  lazyWithOptions,
  withSuspense,
  routePreloader,
  useRoutePreloader,
  useSmartPreload,
  RouteTransition,
};
