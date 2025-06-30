import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pwaService } from '../../services/pwaService';

interface PWAInstallPromptProps {
  className?: string;
  onInstall?: (outcome: 'accepted' | 'dismissed') => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className = '',
  onInstall,
  onDismiss,
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationStatus, setInstallationStatus] = useState(
    pwaService.getInstallationStatus()
  );

  useEffect(() => {
    // 监听PWA安装可用事件
    const handleInstallAvailable = () => {
      setInstallationStatus(pwaService.getInstallationStatus());
      setShowPrompt(true);
    };

    // 监听应用已安装事件
    const handleAppInstalled = () => {
      setInstallationStatus(pwaService.getInstallationStatus());
      setShowPrompt(false);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 初始检查
    if (installationStatus.canInstall && !installationStatus.isInstalled) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener(
        'pwa-install-available',
        handleInstallAvailable
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [installationStatus]);

  const handleInstall = async () => {
    setIsInstalling(true);

    try {
      const outcome = await pwaService.promptInstall();

      if (outcome !== 'not-available') {
        onInstall?.(outcome);

        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  if (
    !showPrompt ||
    installationStatus.isInstalled ||
    !installationStatus.isSupported
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 ${className}`}
        >
          <div className='bg-slate-900/95 backdrop-blur-lg border border-orange-500/20 rounded-xl p-4 shadow-2xl'>
            {/* 关闭按钮 */}
            <button
              onClick={handleDismiss}
              className='absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white transition-colors'
              aria-label='关闭'
            >
              ✕
            </button>

            {/* 图标 */}
            <div className='flex items-start gap-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0'>
                📱
              </div>

              <div className='flex-1 min-w-0'>
                {/* 标题 */}
                <h3 className='text-white font-semibold text-sm mb-1'>
                  安装三国游戏
                </h3>

                {/* 描述 */}
                <p className='text-slate-300 text-xs mb-3 leading-relaxed'>
                  将游戏添加到主屏幕，享受更好的游戏体验，支持离线游戏和消息推送。
                </p>

                {/* 功能特点 */}
                <div className='space-y-1 mb-4'>
                  <div className='flex items-center gap-2 text-xs text-slate-400'>
                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                    <span>更快的启动速度</span>
                  </div>
                  <div className='flex items-center gap-2 text-xs text-slate-400'>
                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                    <span>离线游戏支持</span>
                  </div>
                  <div className='flex items-center gap-2 text-xs text-slate-400'>
                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                    <span>游戏消息推送</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className='flex gap-2'>
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className='flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-1'
                  >
                    {isInstalling ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className='w-3 h-3 border border-white/30 border-t-white rounded-full'
                        />
                        安装中...
                      </>
                    ) : (
                      <>
                        <span>📱</span>
                        立即安装
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDismiss}
                    className='px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors'
                  >
                    稍后
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// PWA状态指示器组件
interface PWAStatusIndicatorProps {
  className?: string;
}

export const PWAStatusIndicator: React.FC<PWAStatusIndicatorProps> = ({
  className = '',
}) => {
  const [status, setStatus] = useState(pwaService.getInstallationStatus());
  const [isOnline, setIsOnline] = useState(pwaService.isOnline());

  useEffect(() => {
    // 监听PWA状态变化
    const handleStatusChange = () => {
      setStatus(pwaService.getInstallationStatus());
    };

    window.addEventListener('pwa-install-available', handleStatusChange);
    window.addEventListener('pwa-update-available', handleStatusChange);
    window.addEventListener('appinstalled', handleStatusChange);

    // 监听网络状态变化
    const cleanupNetworkListener = pwaService.onNetworkChange(setIsOnline);

    return () => {
      window.removeEventListener('pwa-install-available', handleStatusChange);
      window.removeEventListener('pwa-update-available', handleStatusChange);
      window.removeEventListener('appinstalled', handleStatusChange);
      cleanupNetworkListener();
    };
  }, []);

  if (!status.isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 安装状态 */}
      {status.isInstalled && (
        <div className='flex items-center gap-1 text-xs text-green-400'>
          <div className='w-2 h-2 bg-green-400 rounded-full'></div>
          <span>已安装</span>
        </div>
      )}

      {/* 网络状态 */}
      <div
        className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}
      >
        <div
          className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}
        ></div>
        <span>{isOnline ? '在线' : '离线'}</span>
      </div>

      {/* 更新状态 */}
      {status.updateAvailable && (
        <div className='flex items-center gap-1 text-xs text-orange-400'>
          <div className='w-2 h-2 bg-orange-400 rounded-full animate-pulse'></div>
          <span>有更新</span>
        </div>
      )}
    </div>
  );
};

// PWA更新提示组件
interface PWAUpdatePromptProps {
  className?: string;
  onUpdate?: () => void;
  onDismiss?: () => void;
}

export const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({
  className = '',
  onUpdate,
  onDismiss,
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowPrompt(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      await pwaService.skipWaiting();
      onUpdate?.();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 ${className}`}
        >
          <div className='bg-slate-900/95 backdrop-blur-lg border border-orange-500/20 rounded-xl p-4 shadow-2xl'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white flex-shrink-0'>
                🔄
              </div>

              <div className='flex-1 min-w-0'>
                <h3 className='text-white font-semibold text-sm mb-1'>
                  游戏更新可用
                </h3>
                <p className='text-slate-300 text-xs mb-3'>
                  新版本已准备就绪，建议立即更新以获得最新功能和修复。
                </p>

                <div className='flex gap-2'>
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-1'
                  >
                    {isUpdating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className='w-3 h-3 border border-white/30 border-t-white rounded-full'
                        />
                        更新中...
                      </>
                    ) : (
                      '立即更新'
                    )}
                  </button>

                  <button
                    onClick={handleDismiss}
                    className='px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors'
                  >
                    稍后
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default {
  PWAInstallPrompt,
  PWAStatusIndicator,
  PWAUpdatePrompt,
};
