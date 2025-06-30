/**
 * Analytics 工具函数
 * 提供分析相关的实用工具函数
 */

import AnalyticsManager from '../services/analytics/AnalyticsManager';

/**
 * 初始化分析服务
 */
export const initAnalytics = (config?: {
  endpoint?: string;
  userId?: string;
  enabled?: boolean;
  debug?: boolean;
}) => {
  const analytics = AnalyticsManager.getInstance();
  
  if (config) {
    analytics.configure({
      endpoint: config.endpoint || import.meta.env.VITE_ANALYTICS_ENDPOINT,
      userId: config.userId,
      enabled: config.enabled ?? (import.meta.env.MODE !== 'test'),
      debug: config.debug ?? (import.meta.env.DEV),
    });
  }

  // 设置全局错误处理
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      analytics.trackError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: analytics.getSessionInfo().sessionId,
        severity: 'high',
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      analytics.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: analytics.getSessionInfo().sessionId,
        severity: 'medium',
      });
    });
  }

  return analytics;
};

/**
 * 性能监控装饰器
 */
export const withPerformanceTracking = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        AnalyticsManager.getInstance().trackPerformance(
          `function_${name}`,
          duration,
          'ms',
          { args: args.length }
        );
      });
    } else {
      const duration = performance.now() - start;
      AnalyticsManager.getInstance().trackPerformance(
        `function_${name}`,
        duration,
        'ms',
        { args: args.length }
      );
      return result;
    }
  }) as T;
};

/**
 * 创建事件追踪装饰器
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const analytics = AnalyticsManager.getInstance();
      analytics.track(eventName, {
        ...properties,
        method: propertyKey,
        className: target.constructor.name,
        timestamp: Date.now(),
      });
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
};

/**
 * 游戏事件常量
 */
export const GAME_EVENTS = {
  // 战斗事件
  BATTLE_START: 'battle_start',
  BATTLE_END: 'battle_end',
  BATTLE_PAUSE: 'battle_pause',
  BATTLE_RESUME: 'battle_resume',
  
  // 英雄事件
  HERO_RECRUIT: 'hero_recruit',
  HERO_UPGRADE: 'hero_upgrade',
  HERO_EVOLVE: 'hero_evolve',
  HERO_EQUIP: 'hero_equip',
  
  // 阵容事件
  FORMATION_SAVE: 'formation_save',
  FORMATION_LOAD: 'formation_load',
  FORMATION_BATTLE: 'formation_battle',
  
  // 资源事件
  RESOURCE_GAIN: 'resource_gain',
  RESOURCE_SPEND: 'resource_spend',
  
  // 商城事件
  SHOP_VIEW: 'shop_view',
  SHOP_PURCHASE: 'shop_purchase',
  
  // UI事件
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  MODAL_OPEN: 'modal_open',
  MODAL_CLOSE: 'modal_close',
  
  // 用户事件
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  
  // 设置事件
  SETTINGS_CHANGE: 'settings_change',
  AUDIO_TOGGLE: 'audio_toggle',
  LANGUAGE_CHANGE: 'language_change',
} as const;

/**
 * 预定义的用户属性
 */
export const USER_PROPERTIES = {
  LEVEL: 'level',
  VIP_LEVEL: 'vip_level',
  TOTAL_HEROES: 'total_heroes',
  TOTAL_BATTLES: 'total_battles',
  TOTAL_WINS: 'total_wins',
  PLAY_TIME: 'play_time',
  LAST_LOGIN: 'last_login',
  DEVICE_TYPE: 'device_type',
  SCREEN_SIZE: 'screen_size',
} as const;

/**
 * 获取设备信息
 */
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const screen = window.screen;
  
  return {
    userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenWidth: screen.width,
    screenHeight: screen.height,
    screenColorDepth: screen.colorDepth,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    touchSupport: 'ontouchstart' in window,
  };
};

/**
 * 计算页面性能指标
 */
export const getPagePerformance = () => {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  if (!navigation) return null;

  const metrics = {
    // 网络时间
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ssl: navigation.secureConnectionStart > 0 ? navigation.connectEnd - navigation.secureConnectionStart : 0,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    
    // 页面渲染时间
    domParse: navigation.domContentLoadedEventStart - navigation.responseEnd,
    domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    load: navigation.loadEventEnd - navigation.loadEventStart,
    
    // 总时间
    total: navigation.loadEventEnd - navigation.navigationStart,
  };

  // 添加绘制时间
  const firstPaint = paint.find(entry => entry.name === 'first-paint');
  const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint');
  
  if (firstPaint) {
    (metrics as any).firstPaint = firstPaint.startTime;
  }
  
  if (firstContentfulPaint) {
    (metrics as any).firstContentfulPaint = firstContentfulPaint.startTime;
  }

  return metrics;
};

/**
 * 自动追踪页面性能
 */
export const autoTrackPagePerformance = () => {
  if (typeof window === 'undefined') return;

  const analytics = AnalyticsManager.getInstance();
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      const performance = getPagePerformance();
      if (performance) {
        Object.entries(performance).forEach(([key, value]) => {
          analytics.trackPerformance(`page_${key}`, value, 'ms');
        });
      }
    }, 0);
  });
};

/**
 * 生成用户会话指纹
 */
export const generateSessionFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Analytics fingerprint', 2, 2);
  }
  
  const deviceInfo = getDeviceInfo();
  
  return btoa(JSON.stringify({
    canvas: canvas.toDataURL(),
    screen: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`,
    timezone: deviceInfo.timezone,
    language: deviceInfo.language,
    platform: deviceInfo.platform,
    userAgent: navigator.userAgent.substring(0, 100), // 截取前100字符
  }));
};

/**
 * 数据采样工具
 */
export const shouldSample = (rate: number = 1): boolean => {
  return Math.random() < rate;
};

/**
 * 批量发送工具
 */
export class BatchSender {
  private queue: any[] = [];
  private batchSize: number;
  private flushInterval: number;
  private timer: number | null = null;
  private sendFn: (data: any[]) => Promise<void>;

  constructor(
    sendFn: (data: any[]) => Promise<void>,
    batchSize: number = 10,
    flushInterval: number = 5000
  ) {
    this.sendFn = sendFn;
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.startTimer();
  }

  add(item: any) {
    this.queue.push(item);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;
    
    const batch = [...this.queue];
    this.queue = [];
    
    try {
      await this.sendFn(batch);
    } catch (error) {
      // 发送失败，重新加入队列
      this.queue.unshift(...batch);
      throw error;
    }
  }

  private startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = window.setInterval(() => {
      this.flush().catch(console.error);
    }, this.flushInterval);
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.flush().catch(console.error);
  }
}

export default {
  initAnalytics,
  withPerformanceTracking,
  trackEvent,
  GAME_EVENTS,
  USER_PROPERTIES,
  getDeviceInfo,
  getPagePerformance,
  autoTrackPagePerformance,
  generateSessionFingerprint,
  shouldSample,
  BatchSender,
};