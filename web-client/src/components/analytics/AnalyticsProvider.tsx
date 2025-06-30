/**
 * Analytics Provider
 * 为整个应用提供分析服务的上下文提供者
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import AnalyticsManager, { type AnalyticsConfig } from '../../services/analytics/AnalyticsManager';

interface AnalyticsContextType {
  analytics: AnalyticsManager;
  isEnabled: boolean;
  sessionInfo: {
    sessionId: string;
    duration: number;
    events: number;
    userId?: string;
  };
  queueStatus: {
    events: number;
    performance: number;
    errors: number;
  };
  configure: (config: Partial<AnalyticsConfig>) => void;
  setEnabled: (enabled: boolean) => void;
  flush: () => Promise<void>;
  clear: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  config?: Partial<AnalyticsConfig>;
  enabled?: boolean;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  config = {},
  enabled = true,
}) => {
  const [analytics] = useState(() => AnalyticsManager.getInstance());
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [sessionInfo, setSessionInfo] = useState(analytics.getSessionInfo());
  const [queueStatus, setQueueStatus] = useState(analytics.getQueueStatus());

  // 初始化配置
  useEffect(() => {
    if (config) {
      analytics.configure({
        enabled: isEnabled,
        ...config,
      });
    }
  }, [analytics, config, isEnabled]);

  // 定期更新状态信息
  useEffect(() => {
    const updateStatus = () => {
      setSessionInfo(analytics.getSessionInfo());
      setQueueStatus(analytics.getQueueStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [analytics]);

  // 页面卸载时清理
  useEffect(() => {
    return () => {
      analytics.destroy();
    };
  }, [analytics]);

  const configure = (newConfig: Partial<AnalyticsConfig>) => {
    analytics.configure(newConfig);
  };

  const setEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    analytics.setEnabled(enabled);
  };

  const flush = async () => {
    await analytics.flush();
    setQueueStatus(analytics.getQueueStatus());
  };

  const clear = () => {
    analytics.clear();
    setQueueStatus(analytics.getQueueStatus());
  };

  const value: AnalyticsContextType = {
    analytics,
    isEnabled,
    sessionInfo,
    queueStatus,
    configure,
    setEnabled,
    flush,
    clear,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};