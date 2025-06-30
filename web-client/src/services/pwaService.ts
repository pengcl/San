// PWA服务管理
export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

class PWAService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private installPrompt: PWAInstallPrompt | null = null;
  private updateAvailable = false;

  // 初始化PWA服务
  async init(): Promise<boolean> {
    try {
      // 在开发环境中禁用Service Worker
      if (import.meta.env.DEV) {
        console.log('🚫 开发环境中禁用Service Worker');
        return false;
      }

      // 注册Service Worker
      if ('serviceWorker' in navigator) {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service Worker registered:', this.swRegistration);

        // 监听Service Worker更新
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                this.updateAvailable = true;
                this.notifyUpdateAvailable();
              }
            });
          }
        });

        // 监听Service Worker控制器变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      }

      // 监听安装提示
      window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        this.installPrompt = e as any;
        this.notifyInstallAvailable();
      });

      // 监听应用安装
      window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        this.installPrompt = null;
        this.trackEvent('pwa_installed');
      });

      return true;
    } catch (error) {
      console.error('PWA initialization failed:', error);
      return false;
    }
  }

  // 检查是否支持PWA
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // 检查是否已安装
  isInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  // 检查是否可以安装
  canInstall(): boolean {
    return this.installPrompt !== null;
  }

  // 提示用户安装
  async promptInstall(): Promise<'accepted' | 'dismissed' | 'not-available'> {
    if (!this.installPrompt) {
      return 'not-available';
    }

    try {
      await this.installPrompt.prompt();
      const { outcome } = await this.installPrompt.userChoice;

      if (outcome === 'accepted') {
        this.trackEvent('pwa_install_accepted');
      } else {
        this.trackEvent('pwa_install_dismissed');
      }

      this.installPrompt = null;
      return outcome;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return 'dismissed';
    }
  }

  // 更新Service Worker
  async updateServiceWorker(): Promise<void> {
    if (this.swRegistration) {
      await this.swRegistration.update();
    }
  }

  // 跳过等待并激活新的Service Worker
  async skipWaiting(): Promise<void> {
    if (this.swRegistration?.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // 请求通知权限
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.trackEvent('notification_permission', { permission });
    return permission;
  }

  // 显示本地通知
  async showNotification(options: NotificationOptions): Promise<boolean> {
    const permission = await this.requestNotificationPermission();

    if (permission !== 'granted') {
      return false;
    }

    try {
      if (this.swRegistration) {
        const notificationOptions: any = {
          body: options.body || '',
          icon: options.icon || '/icons/icon-192x192.png',
          badge: options.badge || '/icons/badge-72x72.png',
          tag: options.tag || 'game-notification',
          data: options.data || {},
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
        };

        if (options.actions) {
          notificationOptions.actions = options.actions;
        }

        await this.swRegistration.showNotification(
          options.title,
          notificationOptions
        );
      } else {
        new Notification(options.title, {
          body: options.body || '',
          icon: options.icon || '/icons/icon-192x192.png',
          tag: options.tag || 'game-notification',
          data: options.data || {},
        });
      }

      return true;
    } catch (error) {
      console.error('Show notification failed:', error);
      return false;
    }
  }

  // 订阅推送通知
  async subscribePushNotification(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        ),
      });

      // 发送订阅信息到服务器
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  // 取消推送通知订阅
  async unsubscribePushNotification(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    try {
      const subscription =
        await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        // 通知服务器删除订阅
        await this.removeSubscriptionFromServer(subscription);
      }

      return true;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  // 后台同步
  async backgroundSync(tag: string, data?: any): Promise<boolean> {
    if (
      !this.swRegistration ||
      !('sync' in window.ServiceWorkerRegistration.prototype)
    ) {
      return false;
    }

    try {
      // 存储需要同步的数据
      if (data) {
        const cache = await caches.open('dynamic-v1');
        await cache.put('/offline-data', new Response(JSON.stringify(data)));
      }

      await (this.swRegistration as any).sync.register(tag);
      return true;
    } catch (error) {
      console.error('Background sync failed:', error);
      return false;
    }
  }

  // 清理缓存
  async cleanCache(): Promise<void> {
    if (this.swRegistration?.active) {
      this.swRegistration.active.postMessage({ type: 'CLEAN_CACHE' });
    }
  }

  // 获取缓存大小
  async getCacheSize(): Promise<number> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('Get cache size failed:', error);
      return 0;
    }
  }

  // 检查网络状态
  isOnline(): boolean {
    return navigator.onLine;
  }

  // 监听网络状态变化
  onNetworkChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // 获取安装状态
  getInstallationStatus() {
    return {
      isSupported: this.isSupported(),
      isInstalled: this.isInstalled(),
      canInstall: this.canInstall(),
      updateAvailable: this.updateAvailable,
    };
  }

  // 私有方法：通知更新可用
  private notifyUpdateAvailable(): void {
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('pwa-update-available'));

    // 显示更新通知
    this.showNotification({
      title: '游戏更新可用',
      body: '新版本已准备就绪，点击更新以获得最新功能',
      tag: 'update-available',
      actions: [
        { action: 'update', title: '立即更新' },
        { action: 'later', title: '稍后提醒' },
      ],
      requireInteraction: true,
    });
  }

  // 私有方法：通知可安装
  private notifyInstallAvailable(): void {
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  // 私有方法：发送订阅到服务器
  private async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('Send subscription to server failed:', error);
    }
  }

  // 私有方法：从服务器删除订阅
  private async removeSubscriptionFromServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('Remove subscription from server failed:', error);
    }
  }

  // 私有方法：转换VAPID密钥格式
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // 私有方法：事件追踪
  private trackEvent(event: string, data?: any): void {
    // 这里可以集成分析服务
    console.log('PWA Event:', event, data);
  }
}

// 导出单例实例
export const pwaService = new PWAService();

// 导出默认实例
export default pwaService;
