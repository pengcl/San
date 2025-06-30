/**
 * Analytics React Hook
 * 提供React组件中使用分析功能的便捷接口
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import AnalyticsManager from '../services/analytics/AnalyticsManager';

export interface UseAnalyticsOptions {
  trackPageViews?: boolean;
  trackClicks?: boolean;
  trackErrors?: boolean;
  autoTrack?: boolean;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const {
    trackPageViews = true,
    trackClicks = false,
    trackErrors = true,
    autoTrack = true,
  } = options;

  const location = useLocation();
  const analytics = useRef(AnalyticsManager.getInstance());
  const prevLocation = useRef(location.pathname);

  // 页面浏览追踪
  useEffect(() => {
    if (trackPageViews && autoTrack) {
      if (prevLocation.current !== location.pathname) {
        analytics.current.trackPageView();
        prevLocation.current = location.pathname;
      }
    }
  }, [location.pathname, trackPageViews, autoTrack]);

  // 错误边界追踪
  useEffect(() => {
    if (trackErrors && autoTrack) {
      const handleError = (error: Error) => {
        analytics.current.trackError({
          message: error.message,
          stack: error.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          sessionId: analytics.current.getSessionInfo().sessionId,
          severity: 'medium',
        });
      };

      window.addEventListener('error', handleError as any);
      return () => window.removeEventListener('error', handleError as any);
    }
  }, [trackErrors, autoTrack]);

  // 手动追踪方法
  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    analytics.current.track(eventName, properties);
  }, []);

  const trackPageView = useCallback((pageName?: string) => {
    analytics.current.trackPageView(pageName);
  }, []);

  const trackClick = useCallback((element: string, properties?: Record<string, any>) => {
    analytics.current.trackClick(element, properties);
  }, []);

  const trackGameEvent = useCallback((eventType: string, properties?: Record<string, any>) => {
    analytics.current.trackGameEvent(eventType, properties);
  }, []);

  const trackPerformance = useCallback((name: string, value: number, unit: string, metadata?: Record<string, any>) => {
    analytics.current.trackPerformance(name, value, unit, metadata);
  }, []);

  const identify = useCallback((userId: string, traits?: Record<string, any>) => {
    analytics.current.identify(userId, traits);
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    analytics.current.setUserProperties(properties);
  }, []);

  return {
    track,
    trackPageView,
    trackClick,
    trackGameEvent,
    trackPerformance,
    identify,
    setUserProperties,
    analytics: analytics.current,
  };
};

// 高阶组件用于自动追踪
export const withAnalytics = <P extends object>(
  Component: React.ComponentType<P>,
  options: UseAnalyticsOptions = {}
): React.ComponentType<P> => {
  const WrappedComponent = (props: P) => {
    useAnalytics(options);
    return React.createElement(Component, props);
  };
  return WrappedComponent;
};

// 点击追踪装饰器Hook
export const useClickTracking = (elementName: string, properties?: Record<string, any>) => {
  const { trackClick } = useAnalytics();

  const handleClick = useCallback((event: React.MouseEvent) => {
    trackClick(elementName, {
      ...properties,
      elementType: (event.target as HTMLElement).tagName,
      elementId: (event.target as HTMLElement).id,
      elementClass: (event.target as HTMLElement).className,
    });
  }, [trackClick, elementName, properties]);

  return handleClick;
};

// 性能监控Hook
export const usePerformanceTracking = (componentName: string) => {
  const { trackPerformance } = useAnalytics();
  const renderStartTime = useRef<number>();

  useEffect(() => {
    renderStartTime.current = performance.now();
  }, []);

  useEffect(() => {
    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        trackPerformance('component_render_time', renderTime, 'ms', {
          component: componentName,
        });
      }
    };
  }, [trackPerformance, componentName]);

  const trackComponentEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    trackPerformance(`component_${eventName}`, Date.now(), 'timestamp', {
      component: componentName,
      ...properties,
    });
  }, [trackPerformance, componentName]);

  return { trackComponentEvent };
};

// 游戏事件追踪Hook
export const useGameAnalytics = () => {
  const { trackGameEvent } = useAnalytics();

  const trackBattleStart = useCallback((battleData: any) => {
    trackGameEvent('battle_start', {
      battleType: battleData.type,
      playerLevel: battleData.playerLevel,
      enemyLevel: battleData.enemyLevel,
      formation: battleData.formation,
    });
  }, [trackGameEvent]);

  const trackBattleEnd = useCallback((battleResult: any) => {
    trackGameEvent('battle_end', {
      result: battleResult.victory ? 'victory' : 'defeat',
      duration: battleResult.duration,
      damageDealt: battleResult.damageDealt,
      damageTaken: battleResult.damageTaken,
      experience: battleResult.experience,
      rewards: battleResult.rewards,
    });
  }, [trackGameEvent]);

  const trackHeroAction = useCallback((action: string, heroData: any) => {
    trackGameEvent('hero_action', {
      action,
      heroId: heroData.id,
      heroLevel: heroData.level,
      heroRarity: heroData.rarity,
    });
  }, [trackGameEvent]);

  const trackResourceChange = useCallback((resource: string, change: number, reason: string) => {
    trackGameEvent('resource_change', {
      resource,
      change,
      reason,
      timestamp: Date.now(),
    });
  }, [trackGameEvent]);

  const trackFormationChange = useCallback((formationData: any) => {
    trackGameEvent('formation_change', {
      heroes: formationData.heroes.map((h: any) => h.id),
      formationType: formationData.type,
    });
  }, [trackGameEvent]);

  const trackShopPurchase = useCallback((purchaseData: any) => {
    trackGameEvent('shop_purchase', {
      itemId: purchaseData.itemId,
      itemType: purchaseData.itemType,
      cost: purchaseData.cost,
      currency: purchaseData.currency,
    });
  }, [trackGameEvent]);

  return {
    trackBattleStart,
    trackBattleEnd,
    trackHeroAction,
    trackResourceChange,
    trackFormationChange,
    trackShopPurchase,
  };
};

// 用户行为追踪Hook
export const useUserBehavior = () => {
  const { track } = useAnalytics();

  const trackFeatureUsage = useCallback((feature: string, action: string, metadata?: Record<string, any>) => {
    track('feature_usage', {
      feature,
      action,
      timestamp: Date.now(),
      ...metadata,
    });
  }, [track]);

  const trackUserPreference = useCallback((preference: string, value: any) => {
    track('user_preference', {
      preference,
      value,
      timestamp: Date.now(),
    });
  }, [track]);

  const trackTutorialStep = useCallback((step: string, completed: boolean) => {
    track('tutorial_step', {
      step,
      completed,
      timestamp: Date.now(),
    });
  }, [track]);

  const trackSearchQuery = useCallback((query: string, results: number) => {
    track('search_query', {
      query,
      results,
      timestamp: Date.now(),
    });
  }, [track]);

  return {
    trackFeatureUsage,
    trackUserPreference,
    trackTutorialStep,
    trackSearchQuery,
  };
};