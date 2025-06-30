import React, { useEffect } from 'react';
import { useDeviceInfo, useSafeArea } from '../../hooks/useMobile';
import { initMobile, cleanupMobile } from '../../utils/mobile';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  enableSafeArea?: boolean;
  fullscreen?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className = '',
  enableSafeArea = true,
  fullscreen = false,
}) => {
  const { isMobile, deviceType, isLandscape } = useDeviceInfo();
  const safeArea = useSafeArea();

  useEffect(() => {
    // 初始化移动端设置
    initMobile();

    return () => {
      // 清理移动端设置
      cleanupMobile();
    };
  }, []);

  const layoutClasses = [
    'mobile-layout',
    'relative',
    'w-full',
    fullscreen ? 'h-screen' : 'min-h-screen-safe',
    'overflow-hidden',
    'bg-slate-900',
    deviceType === 'mobile' ? 'mobile:text-sm' : '',
    isLandscape ? 'landscape:flex landscape:items-center' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const safeAreaStyles = enableSafeArea
    ? {
        paddingTop: `${safeArea.top}px`,
        paddingBottom: `${safeArea.bottom}px`,
        paddingLeft: `${safeArea.left}px`,
        paddingRight: `${safeArea.right}px`,
      }
    : {};

  return (
    <div className={layoutClasses} style={safeAreaStyles}>
      {children}

      {/* 移动端调试信息（仅开发环境） */}
      {import.meta.env.DEV && isMobile && (
        <div className='fixed top-safe-top left-safe-left z-50 text-xs bg-black/50 text-white p-2 rounded'>
          <div>Device: {deviceType}</div>
          <div>Orientation: {isLandscape ? 'Landscape' : 'Portrait'}</div>
          <div>
            Safe Area: T{safeArea.top} B{safeArea.bottom} L{safeArea.left} R
            {safeArea.right}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
