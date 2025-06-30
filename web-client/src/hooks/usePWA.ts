import { useState, useEffect } from 'react';
import { pwaService } from '../services/pwaService';

export interface PWAState {
  isSupported: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  updateAvailable: boolean;
  isOnline: boolean;
  cacheSize: number;
}

export interface PWAActions {
  install: () => Promise<'accepted' | 'dismissed' | 'not-available'>;
  update: () => Promise<void>;
  showNotification: (options: {
    title: string;
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
  }) => Promise<boolean>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribePushNotification: () => Promise<PushSubscription | null>;
  unsubscribePushNotification: () => Promise<boolean>;
  backgroundSync: (tag: string, data?: any) => Promise<boolean>;
  cleanCache: () => Promise<void>;
}

// PWA状态管理Hook
export const usePWA = (): [PWAState, PWAActions] => {
  const [state, setState] = useState<PWAState>({
    isSupported: pwaService.isSupported(),
    isInstalled: pwaService.isInstalled(),
    canInstall: pwaService.canInstall(),
    updateAvailable: false,
    isOnline: pwaService.isOnline(),
    cacheSize: 0,
  });

  useEffect(() => {
    // 初始化PWA服务
    pwaService.init();

    // 更新状态
    const updateState = async () => {
      const installationStatus = pwaService.getInstallationStatus();
      const cacheSize = await pwaService.getCacheSize();

      setState(prev => ({
        ...prev,
        ...installationStatus,
        cacheSize,
      }));
    };

    updateState();

    // 监听PWA事件
    const handleInstallAvailable = () => {
      setState(prev => ({ ...prev, canInstall: true }));
    };

    const handleUpdateAvailable = () => {
      setState(prev => ({ ...prev, updateAvailable: true }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, canInstall: false }));
    };

    // 监听网络状态变化
    const cleanupNetworkListener = pwaService.onNetworkChange(online => {
      setState(prev => ({ ...prev, isOnline: online }));
    });

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'pwa-install-available',
        handleInstallAvailable
      );
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      cleanupNetworkListener();
    };
  }, []);

  const actions: PWAActions = {
    install: async () => {
      const result = await pwaService.promptInstall();
      if (result === 'accepted') {
        setState(prev => ({ ...prev, canInstall: false }));
      }
      return result;
    },

    update: async () => {
      await pwaService.skipWaiting();
      setState(prev => ({ ...prev, updateAvailable: false }));
    },

    showNotification: options => {
      return pwaService.showNotification(options);
    },

    requestNotificationPermission: () => {
      return pwaService.requestNotificationPermission();
    },

    subscribePushNotification: () => {
      return pwaService.subscribePushNotification();
    },

    unsubscribePushNotification: () => {
      return pwaService.unsubscribePushNotification();
    },

    backgroundSync: (tag, data) => {
      return pwaService.backgroundSync(tag, data);
    },

    cleanCache: async () => {
      await pwaService.cleanCache();
      const cacheSize = await pwaService.getCacheSize();
      setState(prev => ({ ...prev, cacheSize }));
    },
  };

  return [state, actions];
};

// 简化的PWA安装Hook
export const usePWAInstall = () => {
  const [{ canInstall, isInstalled }, { install }] = usePWA();

  return {
    canInstall,
    isInstalled,
    install,
  };
};

// 简化的PWA更新Hook
export const usePWAUpdate = () => {
  const [{ updateAvailable }, { update }] = usePWA();

  return {
    updateAvailable,
    update,
  };
};

// PWA网络状态Hook
export const usePWANetworkStatus = () => {
  const [{ isOnline }] = usePWA();

  return isOnline;
};

// PWA通知Hook
export const usePWANotifications = () => {
  const [
    ,
    {
      showNotification,
      requestNotificationPermission,
      subscribePushNotification,
      unsubscribePushNotification,
    },
  ] = usePWA();
  const [permission, setPermission] =
    useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  };

  return {
    permission,
    requestPermission,
    showNotification,
    subscribePushNotification,
    unsubscribePushNotification,
    canShowNotifications: permission === 'granted',
  };
};

export default usePWA;
