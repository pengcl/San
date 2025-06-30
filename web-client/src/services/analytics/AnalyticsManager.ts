/**
 * 分析和监控管理器
 * 负责用户行为分析、性能监控、错误追踪等
 */

export interface AnalyticsConfig {
  enabled: boolean;
  userId?: string;
  sessionId: string;
  debug: boolean;
  endpoint?: string;
  batchSize: number;
  flushInterval: number;
}

export interface AnalyticsEvent {
  id: string;
  type: 'pageview' | 'click' | 'custom' | 'error' | 'performance';
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  url: string;
  userAgent: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  url: string;
  metadata?: Record<string, any>;
}

export interface ErrorEvent {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AnalyticsManager {
  private static instance: AnalyticsManager;
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private performanceQueue: PerformanceMetric[] = [];
  private errorQueue: ErrorEvent[] = [];
  private flushTimer: number | null = null;
  private sessionStartTime: number;
  private pageLoadStartTime: number;

  private constructor() {
    this.sessionStartTime = Date.now();
    this.pageLoadStartTime = performance.now();
    
    this.config = {
      enabled: true,
      sessionId: this.generateSessionId(),
      debug: import.meta.env.DEV,
      batchSize: 50,
      flushInterval: 30000, // 30秒
    };

    this.loadConfig();
    this.setupPerformanceObservers();
    this.setupErrorTracking();
    this.startFlushTimer();
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 加载配置
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('analyticsConfig');
      if (saved) {
        const savedConfig = JSON.parse(saved);
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      this.log('Failed to load analytics config:', error);
    }
  }

  /**
   * 保存配置
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('analyticsConfig', JSON.stringify(this.config));
    } catch (error) {
      this.log('Failed to save analytics config:', error);
    }
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObservers(): void {
    // Web Vitals 监控
    if ('PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.trackPerformance('LCP', entry.startTime, 'ms', {
              element: entry.element?.tagName,
              url: entry.url,
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.trackPerformance('FID', entry.processingStart - entry.startTime, 'ms', {
              eventType: entry.name,
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.trackPerformance('CLS', clsValue, 'score');
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Navigation Timing
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigation) {
              this.trackPerformance('TTFB', navigation.responseStart - navigation.requestStart, 'ms');
              this.trackPerformance('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
              this.trackPerformance('Load', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
            }
          }, 0);
        });
      } catch (error) {
        this.log('Failed to setup performance observers:', error);
      }
    }
  }

  /**
   * 设置错误追踪
   */
  private setupErrorTracking(): void {
    // JavaScript错误
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.config.userId,
        sessionId: this.config.sessionId,
        severity: 'high',
      });
    });

    // Promise rejection错误
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.config.userId,
        sessionId: this.config.sessionId,
        severity: 'medium',
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        this.trackError({
          message: `Resource loading error: ${target.tagName}`,
          filename: (target as any).src || (target as any).href,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          userId: this.config.userId,
          sessionId: this.config.sessionId,
          severity: 'low',
        });
      }
    }, true);
  }

  /**
   * 启动定时刷新
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * 追踪事件
   */
  track(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'custom',
      name: eventName,
      properties: {
        ...properties,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      },
      timestamp: Date.now(),
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.eventQueue.push(event);
    this.log('Event tracked:', event);

    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * 追踪页面浏览
   */
  trackPageView(pageName?: string): void {
    this.track('page_view', {
      page: pageName || document.title,
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      referrer: document.referrer,
      sessionDuration: Date.now() - this.sessionStartTime,
    });
  }

  /**
   * 追踪点击事件
   */
  trackClick(element: string, properties: Record<string, any> = {}): void {
    this.track('click', {
      element,
      ...properties,
    });
  }

  /**
   * 追踪性能指标
   */
  trackPerformance(name: string, value: number, unit: string, metadata?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      url: window.location.href,
      metadata,
    };

    this.performanceQueue.push(metric);
    this.log('Performance metric tracked:', metric);
  }

  /**
   * 追踪错误
   */
  trackError(error: Omit<ErrorEvent, 'timestamp'> & { timestamp?: number }): void {
    if (!this.config.enabled) return;

    const errorEvent: ErrorEvent = {
      ...error,
      timestamp: error.timestamp || Date.now(),
    };

    this.errorQueue.push(errorEvent);
    this.log('Error tracked:', errorEvent);

    // 立即发送高严重性错误
    if (error.severity === 'critical' || error.severity === 'high') {
      this.flush();
    }
  }

  /**
   * 追踪用户时长
   */
  trackTimeOnPage(): void {
    const timeOnPage = performance.now() - this.pageLoadStartTime;
    this.track('time_on_page', {
      duration: Math.round(timeOnPage),
      unit: 'ms',
    });
  }

  /**
   * 追踪游戏特定事件
   */
  trackGameEvent(eventType: string, properties: Record<string, any> = {}): void {
    this.track(`game_${eventType}`, {
      ...properties,
      category: 'game',
    });
  }

  /**
   * 用户识别
   */
  identify(userId: string, traits: Record<string, any> = {}): void {
    this.config.userId = userId;
    this.saveConfig();
    
    this.track('user_identified', {
      userId,
      traits,
    });
  }

  /**
   * 设置用户属性
   */
  setUserProperties(properties: Record<string, any>): void {
    this.track('user_properties_updated', {
      properties,
    });
  }

  /**
   * 刷新队列，发送数据
   */
  async flush(): Promise<void> {
    if (!this.config.enabled || !this.config.endpoint) {
      this.log('Analytics disabled or no endpoint configured');
      return;
    }

    const events = [...this.eventQueue];
    const performance = [...this.performanceQueue];
    const errors = [...this.errorQueue];

    if (events.length === 0 && performance.length === 0 && errors.length === 0) {
      return;
    }

    this.eventQueue = [];
    this.performanceQueue = [];
    this.errorQueue = [];

    try {
      const payload = {
        events,
        performance,
        errors,
        meta: {
          sdk: 'three-kingdoms-web-analytics',
          version: '1.0.0',
          timestamp: Date.now(),
          sessionId: this.config.sessionId,
          userId: this.config.userId,
        },
      };

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      this.log('Analytics data sent successfully');
    } catch (error) {
      this.log('Failed to send analytics data:', error);
      
      // 将数据放回队列
      this.eventQueue.unshift(...events);
      this.performanceQueue.unshift(...performance);
      this.errorQueue.unshift(...errors);
    }
  }

  /**
   * 配置分析器
   */
  configure(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();

    if (config.flushInterval) {
      this.startFlushTimer();
    }
  }

  /**
   * 启用/禁用分析
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  /**
   * 获取会话信息
   */
  getSessionInfo(): {
    sessionId: string;
    duration: number;
    events: number;
    userId?: string;
  } {
    return {
      sessionId: this.config.sessionId,
      duration: Date.now() - this.sessionStartTime,
      events: this.eventQueue.length,
      userId: this.config.userId,
    };
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): {
    events: number;
    performance: number;
    errors: number;
  } {
    return {
      events: this.eventQueue.length,
      performance: this.performanceQueue.length,
      errors: this.errorQueue.length,
    };
  }

  /**
   * 清除所有数据
   */
  clear(): void {
    this.eventQueue = [];
    this.performanceQueue = [];
    this.errorQueue = [];
  }

  /**
   * 页面卸载时发送数据
   */
  sendBeacon(): void {
    if (!this.config.enabled || !this.config.endpoint) return;

    const payload = {
      events: this.eventQueue,
      performance: this.performanceQueue,
      errors: this.errorQueue,
      meta: {
        type: 'beacon',
        timestamp: Date.now(),
        sessionId: this.config.sessionId,
        userId: this.config.userId,
      },
    };

    try {
      navigator.sendBeacon(
        this.config.endpoint,
        JSON.stringify(payload)
      );
    } catch (error) {
      this.log('Failed to send beacon:', error);
    }
  }

  /**
   * 日志输出
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[Analytics]', ...args);
    }
  }

  /**
   * 销毁分析器
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // 发送剩余数据
    this.sendBeacon();
  }
}

// 页面卸载时发送数据
window.addEventListener('beforeunload', () => {
  AnalyticsManager.getInstance().trackTimeOnPage();
  AnalyticsManager.getInstance().sendBeacon();
});

// 页面可见性变化
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    AnalyticsManager.getInstance().trackTimeOnPage();
    AnalyticsManager.getInstance().flush();
  }
});

export default AnalyticsManager;