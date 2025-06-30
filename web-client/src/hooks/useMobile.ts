import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isMobile,
  isIOS,
  isAndroid,
  isTouchDevice,
  getViewportSize,
  getDeviceType,
  isLandscape,
  isPortrait,
  getTouchPosition,
  getSwipeDirection,
  vibrate,
} from '../utils/mobile';

// 设备信息Hook
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isTouchDevice: false,
    deviceType: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    isLandscape: false,
    isPortrait: true,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo({
        isMobile: isMobile(),
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        isTouchDevice: isTouchDevice(),
        deviceType: getDeviceType(),
        isLandscape: isLandscape(),
        isPortrait: isPortrait(),
      });
    };

    updateDeviceInfo();

    // 监听屏幕方向变化
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', updateDeviceInfo);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

// 视口尺寸Hook
export const useViewportSize = () => {
  const [size, setSize] = useState(() => getViewportSize());

  useEffect(() => {
    const updateSize = () => {
      setSize(getViewportSize());
    };

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateSize, 100);
    });

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  return size;
};

// 触摸手势Hook
export const useSwipeGesture = (
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void,
  threshold: number = 50
) => {
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const [isSwping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const position = getTouchPosition(event);
    startPos.current = position;
    setIsSwiping(true);
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!startPos.current) return;

      const endPosition = getTouchPosition(event);
      const direction = getSwipeDirection(
        startPos.current,
        endPosition,
        threshold
      );

      if (direction && onSwipe) {
        onSwipe(direction);
        vibrate(50); // 轻微震动反馈
      }

      startPos.current = null;
      setIsSwiping(false);
    },
    [onSwipe, threshold]
  );

  const handleTouchCancel = useCallback(() => {
    startPos.current = null;
    setIsSwiping(false);
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    isSwping,
  };
};

// 长按手势Hook
export const useLongPress = (
  onLongPress: () => void,
  duration: number = 500
) => {
  const timerRef = useRef<number | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const start = useCallback(() => {
    setIsPressed(true);
    timerRef.current = window.setTimeout(() => {
      onLongPress();
      vibrate([50, 50, 100]); // 复杂震动反馈
    }, duration);
  }, [onLongPress, duration]);

  const cancel = useCallback(() => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlers = isTouchDevice()
    ? {
        onTouchStart: start,
        onTouchEnd: cancel,
        onTouchCancel: cancel,
      }
    : {
        onMouseDown: start,
        onMouseUp: cancel,
        onMouseLeave: cancel,
      };

  return {
    ...handlers,
    isPressed,
  };
};

// 双击手势Hook
export const useDoubleTap = (onDoubleTap: () => void, delay: number = 300) => {
  const lastTap = useRef<number>(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastTap.current;

    if (timeDiff < delay && timeDiff > 0) {
      onDoubleTap();
      vibrate(100); // 震动反馈
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [onDoubleTap, delay]);

  return isTouchDevice() ? { onTouchEnd: handleTap } : { onClick: handleTap };
};

// 触摸反馈Hook
export const useTouchFeedback = () => {
  const elementRef = useRef<HTMLElement | null>(null);

  const addTouchFeedback = useCallback((element: HTMLElement | null) => {
    if (!element || elementRef.current === element) return;

    elementRef.current = element;

    const addActiveClass = () => {
      element.classList.add('active', 'animate-touch-feedback');
      vibrate(25); // 轻微震动
    };

    const removeActiveClass = () => {
      element.classList.remove('active', 'animate-touch-feedback');
    };

    if (isTouchDevice()) {
      element.addEventListener('touchstart', addActiveClass, { passive: true });
      element.addEventListener('touchend', removeActiveClass, {
        passive: true,
      });
      element.addEventListener('touchcancel', removeActiveClass, {
        passive: true,
      });
    } else {
      element.addEventListener('mousedown', addActiveClass);
      element.addEventListener('mouseup', removeActiveClass);
      element.addEventListener('mouseleave', removeActiveClass);
    }

    return () => {
      if (isTouchDevice()) {
        element.removeEventListener('touchstart', addActiveClass);
        element.removeEventListener('touchend', removeActiveClass);
        element.removeEventListener('touchcancel', removeActiveClass);
      } else {
        element.removeEventListener('mousedown', addActiveClass);
        element.removeEventListener('mouseup', removeActiveClass);
        element.removeEventListener('mouseleave', removeActiveClass);
      }
    };
  }, []);

  return { addTouchFeedback };
};

// 安全区域Hook
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      if (typeof window === 'undefined') return;

      const computedStyle = getComputedStyle(document.documentElement);
      const getValue = (prop: string) => {
        const value = computedStyle.getPropertyValue(prop);
        return parseInt(value.replace('px', ''), 10) || 0;
      };

      setSafeArea({
        top: getValue('--sai-top'),
        bottom: getValue('--sai-bottom'),
        left: getValue('--sai-left'),
        right: getValue('--sai-right'),
      });
    };

    updateSafeArea();

    // 监听样式变化
    const observer = new MutationObserver(updateSafeArea);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(updateSafeArea, 100);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
};

// 虚拟键盘检测Hook
export const useVirtualKeyboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [height, setHeight] = useState(0);
  const initialViewportHeight = useRef<number>(window.innerHeight);

  useEffect(() => {
    const updateKeyboardStatus = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialViewportHeight.current - currentHeight;

      // 如果高度差大于100px，认为键盘弹出
      const keyboardVisible = heightDiff > 100;

      setIsVisible(keyboardVisible);
      setHeight(keyboardVisible ? heightDiff : 0);
    };

    // 监听视口变化
    window.addEventListener('resize', updateKeyboardStatus);

    // 监听 visualViewport API（如果支持）
    if ('visualViewport' in window) {
      const visualViewport = window.visualViewport!;
      visualViewport.addEventListener('resize', updateKeyboardStatus);

      return () => {
        window.removeEventListener('resize', updateKeyboardStatus);
        visualViewport.removeEventListener('resize', updateKeyboardStatus);
      };
    }

    return () => {
      window.removeEventListener('resize', updateKeyboardStatus);
    };
  }, []);

  return { isVisible, height };
};

// 网络状态Hook
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection: connection
          ? connection.effectiveType === 'slow-2g' ||
            connection.effectiveType === '2g'
          : false,
        connectionType: connection
          ? connection.effectiveType || 'unknown'
          : 'unknown',
      });
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // 监听连接变化
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);

      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};

// 设备方向锁定Hook
export const useOrientationLock = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );

  const lockOrientation = useCallback(
    async (targetOrientation: 'portrait' | 'landscape') => {
      if (!('screen' in window) || !('orientation' in window.screen)) {
        console.warn('Screen Orientation API not supported');
        return false;
      }

      try {
        const orientationType =
          targetOrientation === 'portrait'
            ? 'portrait-primary'
            : 'landscape-primary';

        await (window.screen.orientation as any).lock(orientationType);
        setIsLocked(true);
        setOrientation(targetOrientation);
        return true;
      } catch (error) {
        console.warn('Failed to lock orientation:', error);
        return false;
      }
    },
    []
  );

  const unlockOrientation = useCallback(() => {
    if (!('screen' in window) || !('orientation' in window.screen)) {
      return;
    }

    try {
      (window.screen.orientation as any).unlock();
      setIsLocked(false);
    } catch (error) {
      console.warn('Failed to unlock orientation:', error);
    }
  }, []);

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(isLandscape() ? 'landscape' : 'portrait');
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    handleOrientationChange(); // 初始设置

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return {
    isLocked,
    orientation,
    lockOrientation,
    unlockOrientation,
  };
};

export default {
  useDeviceInfo,
  useViewportSize,
  useSwipeGesture,
  useLongPress,
  useDoubleTap,
  useTouchFeedback,
  useSafeArea,
  useVirtualKeyboard,
  useNetworkStatus,
  useOrientationLock,
};
