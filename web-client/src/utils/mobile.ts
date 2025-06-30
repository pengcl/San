// 移动端检测和适配工具

// 设备检测
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile',
  ];

  return (
    mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
    window.innerWidth <= 768
  );
};

// iOS 检测
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

// Android 检测
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;

  return /Android/.test(navigator.userAgent);
};

// 是否为触摸设备
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

// 获取设备像素比
export const getDevicePixelRatio = (): number => {
  if (typeof window === 'undefined') return 1;

  return window.devicePixelRatio || 1;
};

// 获取视口尺寸
export const getViewportSize = () => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

// 获取安全区域信息
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue('--sai-top') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sai-bottom') || '0', 10),
    left: parseInt(style.getPropertyValue('--sai-left') || '0', 10),
    right: parseInt(style.getPropertyValue('--sai-right') || '0', 10),
  };
};

// 检测横屏
export const isLandscape = (): boolean => {
  if (typeof window === 'undefined') return false;

  return window.innerWidth > window.innerHeight;
};

// 检测竖屏
export const isPortrait = (): boolean => {
  if (typeof window === 'undefined') return true;

  return window.innerHeight >= window.innerWidth;
};

// 获取设备类型
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const { width } = getViewportSize();

  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// 防止页面缩放
export const preventZoom = () => {
  if (typeof document === 'undefined') return;

  // 防止双击缩放
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    event => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );

  // 防止手势缩放
  document.addEventListener('gesturestart', event => {
    event.preventDefault();
  });

  document.addEventListener('gesturechange', event => {
    event.preventDefault();
  });

  document.addEventListener('gestureend', event => {
    event.preventDefault();
  });
};

// 防止页面滚动（适用于全屏游戏）
export const preventScroll = () => {
  if (typeof document === 'undefined') return;

  const preventDefault = (e: Event) => e.preventDefault();

  // 禁用触摸滚动
  document.addEventListener('touchstart', preventDefault, { passive: false });
  document.addEventListener('touchmove', preventDefault, { passive: false });

  // 禁用鼠标滚轮
  document.addEventListener('wheel', preventDefault, { passive: false });

  // 禁用键盘滚动
  document.addEventListener('keydown', e => {
    const scrollKeys = [
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      'Home',
      'End',
    ];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  });

  return () => {
    document.removeEventListener('touchstart', preventDefault);
    document.removeEventListener('touchmove', preventDefault);
    document.removeEventListener('wheel', preventDefault);
  };
};

// 启用页面滚动
export const enableScroll = () => {
  if (typeof document === 'undefined') return;

  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
};

// 禁用页面滚动
export const disableScroll = () => {
  if (typeof document === 'undefined') return;

  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
};

// 获取触摸位置
export const getTouchPosition = (event: TouchEvent | React.TouchEvent) => {
  const touch = event.touches[0] || event.changedTouches[0];
  return {
    x: touch.clientX,
    y: touch.clientY,
  };
};

// 计算两点距离
export const getDistance = (
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// 检测手势方向
export const getSwipeDirection = (
  startPos: { x: number; y: number },
  endPos: { x: number; y: number },
  threshold: number = 50
): 'left' | 'right' | 'up' | 'down' | null => {
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // 判断是否超过阈值
  if (Math.max(absDx, absDy) < threshold) {
    return null;
  }

  // 判断主要方向
  if (absDx > absDy) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
};

// 振动反馈（如果支持）
export const vibrate = (pattern: number | number[] = 100) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// 添加触摸反馈类
export const addTouchFeedback = (element: HTMLElement) => {
  if (!element) return;

  const addFeedback = () => {
    element.classList.add('animate-touch-feedback');
    vibrate(50); // 轻微振动反馈
  };

  const removeFeedback = () => {
    element.classList.remove('animate-touch-feedback');
  };

  if (isTouchDevice()) {
    element.addEventListener('touchstart', addFeedback);
    element.addEventListener('touchend', removeFeedback);
    element.addEventListener('touchcancel', removeFeedback);
  } else {
    element.addEventListener('mousedown', addFeedback);
    element.addEventListener('mouseup', removeFeedback);
    element.addEventListener('mouseleave', removeFeedback);
  }

  return () => {
    if (isTouchDevice()) {
      element.removeEventListener('touchstart', addFeedback);
      element.removeEventListener('touchend', removeFeedback);
      element.removeEventListener('touchcancel', removeFeedback);
    } else {
      element.removeEventListener('mousedown', addFeedback);
      element.removeEventListener('mouseup', removeFeedback);
      element.removeEventListener('mouseleave', removeFeedback);
    }
  };
};

// 设置安全区域CSS变量
export const setSafeAreaVars = () => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 设置CSS变量
  root.style.setProperty('--sai-top', 'env(safe-area-inset-top)');
  root.style.setProperty('--sai-bottom', 'env(safe-area-inset-bottom)');
  root.style.setProperty('--sai-left', 'env(safe-area-inset-left)');
  root.style.setProperty('--sai-right', 'env(safe-area-inset-right)');
};

// 移动端初始化
export const initMobile = () => {
  if (typeof window === 'undefined') return;

  // 设置安全区域变量
  setSafeAreaVars();

  // 防止缩放
  preventZoom();

  // 如果是移动设备，禁用页面滚动
  if (isMobile()) {
    disableScroll();
  }

  // 添加设备类型到body class
  const deviceType = getDeviceType();
  document.body.classList.add(`device-${deviceType}`);

  if (isIOS()) {
    document.body.classList.add('is-ios');
  }

  if (isAndroid()) {
    document.body.classList.add('is-android');
  }

  if (isTouchDevice()) {
    document.body.classList.add('is-touch');
  }

  // 监听屏幕方向变化
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      setSafeAreaVars();

      // 更新方向类
      document.body.classList.remove('is-landscape', 'is-portrait');
      document.body.classList.add(
        isLandscape() ? 'is-landscape' : 'is-portrait'
      );
    }, 100);
  });

  // 初始方向设置
  document.body.classList.add(isLandscape() ? 'is-landscape' : 'is-portrait');
};

// 移动端清理
export const cleanupMobile = () => {
  if (typeof document === 'undefined') return;

  enableScroll();

  // 移除设备类型类
  const deviceClasses = [
    'device-mobile',
    'device-tablet',
    'device-desktop',
    'is-ios',
    'is-android',
    'is-touch',
    'is-landscape',
    'is-portrait',
  ];
  document.body.classList.remove(...deviceClasses);
};

export default {
  isMobile,
  isIOS,
  isAndroid,
  isTouchDevice,
  getDevicePixelRatio,
  getViewportSize,
  getSafeAreaInsets,
  isLandscape,
  isPortrait,
  getDeviceType,
  preventZoom,
  preventScroll,
  enableScroll,
  disableScroll,
  getTouchPosition,
  getDistance,
  getSwipeDirection,
  vibrate,
  addTouchFeedback,
  setSafeAreaVars,
  initMobile,
  cleanupMobile,
};
