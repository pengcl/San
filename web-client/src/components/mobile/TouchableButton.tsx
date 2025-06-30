import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTouchFeedback, useDeviceInfo } from '../../hooks/useMobile';
import { vibrate } from '../../utils/mobile';

interface TouchableButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
  longPressDuration?: number;
}

export const TouchableButton: React.FC<TouchableButtonProps> = ({
  children,
  onClick,
  onLongPress,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  hapticFeedback = true,
  rippleEffect = true,
  longPressDuration = 500,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { addTouchFeedback } = useTouchFeedback();
  const { isTouchDevice } = useDeviceInfo();
  const longPressTimer = useRef<number | null>(null);
  const isLongPressed = useRef(false);

  // 获取变体样式
  const getVariantClasses = () => {
    const variants = {
      primary:
        'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-game border-orange-400',
      secondary:
        'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-md border-slate-500',
      danger:
        'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md border-red-400',
      success:
        'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md border-green-400',
      ghost:
        'bg-transparent text-slate-300 border-slate-600 hover:bg-slate-800/50',
    };
    return variants[variant];
  };

  // 获取尺寸样式
  const getSizeClasses = () => {
    const sizes = {
      xs: 'px-2 py-1 text-xs min-h-touch min-w-touch',
      sm: 'px-3 py-2 text-sm min-h-touch min-w-touch',
      md: 'px-4 py-2 text-base min-h-touch min-w-touch',
      lg: 'px-6 py-3 text-lg min-h-12 min-w-12',
      xl: 'px-8 py-4 text-xl min-h-14 min-w-14',
    };
    return sizes[size];
  };

  // 处理触摸开始
  const handleTouchStart = (event: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return;

    isLongPressed.current = false;

    // 震动反馈
    if (hapticFeedback) {
      vibrate(25);
    }

    // 长按检测
    if (onLongPress) {
      longPressTimer.current = window.setTimeout(() => {
        isLongPressed.current = true;
        onLongPress();
        if (hapticFeedback) {
          vibrate([50, 50, 100]); // 长按震动模式
        }
      }, longPressDuration);
    }

    // 涟漪效果
    if (rippleEffect && buttonRef.current) {
      createRipple(event);
    }
  };

  // 处理触摸结束
  const handleTouchEnd = () => {
    if (disabled) return;

    // 清除长按定时器
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // 如果不是长按，则触发点击
    if (!isLongPressed.current && onClick) {
      onClick();
    }
  };

  // 处理触摸取消
  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isLongPressed.current = false;
  };

  // 创建涟漪效果
  const createRipple = (event: React.TouchEvent | React.MouseEvent) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x =
      ('touches' in event ? event.touches[0].clientX : event.clientX) -
      rect.left -
      size / 2;
    const y =
      ('touches' in event ? event.touches[0].clientY : event.clientY) -
      rect.top -
      size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  // 添加触摸反馈
  useEffect(() => {
    if (buttonRef.current) {
      return addTouchFeedback(buttonRef.current);
    }
  }, [addTouchFeedback]);

  const buttonClasses = [
    'relative',
    'overflow-hidden',
    'rounded-lg',
    'border-2',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-orange-400',
    'focus:ring-opacity-50',
    'select-none',
    'cursor-pointer',
    getSizeClasses(),
    getVariantClasses(),
    disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'transform active:scale-95 hover:shadow-lg',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const eventHandlers = isTouchDevice
    ? {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchCancel,
      }
    : {
        onMouseDown: handleTouchStart,
        onMouseUp: handleTouchEnd,
        onMouseLeave: handleTouchCancel,
      };

  return (
    <motion.button
      ref={buttonRef}
      className={buttonClasses}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      {...eventHandlers}
    >
      {children}

      {/* 添加CSS动画 */}
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </motion.button>
  );
};

export default TouchableButton;
