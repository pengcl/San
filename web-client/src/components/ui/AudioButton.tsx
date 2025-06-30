/**
 * 带音频反馈的按钮组件
 * 扩展GameButton，增加音频反馈功能
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useAudioFeedback } from '../../hooks/useAudio';

interface AudioButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  soundType?: 'click' | 'success' | 'error' | 'none';
  onClick?: () => void;
  onMouseEnter?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

const AudioButton = forwardRef<HTMLButtonElement, AudioButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      soundType = 'click',
      onClick,
      onMouseEnter,
      className = '',
      type = 'button',
      style,
      ...props
    },
    ref
  ) => {
    const { withClickFeedback, withHoverFeedback, withSuccessFeedback, withErrorFeedback } = useAudioFeedback();

    // 根据soundType选择对应的音频反馈
    const getAudioFeedback = (handler?: () => void) => {
      if (disabled || loading || soundType === 'none') {
        return handler;
      }

      switch (soundType) {
        case 'success':
          return withSuccessFeedback(handler);
        case 'error':
          return withErrorFeedback(handler);
        case 'click':
        default:
          return withClickFeedback(handler);
      }
    };

    // 悬停音频反馈
    const handleMouseEnter = withHoverFeedback(onMouseEnter);

    // 点击音频反馈
    const handleClick = getAudioFeedback(onClick);

    // 样式变量
    const baseClasses = `
      relative inline-flex items-center justify-center
      font-medium rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      select-none overflow-hidden
    `;

    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
      primary: `
        bg-gradient-to-r from-blue-600 to-purple-600 text-white
        hover:from-blue-700 hover:to-purple-700
        focus:ring-blue-500 shadow-lg hover:shadow-xl
        border border-transparent
      `,
      secondary: `
        bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700
        hover:from-gray-200 hover:to-gray-300
        focus:ring-gray-500 shadow-md hover:shadow-lg
        border border-gray-300
      `,
      success: `
        bg-gradient-to-r from-green-500 to-emerald-600 text-white
        hover:from-green-600 hover:to-emerald-700
        focus:ring-green-500 shadow-lg hover:shadow-xl
        border border-transparent
      `,
      warning: `
        bg-gradient-to-r from-yellow-500 to-orange-500 text-white
        hover:from-yellow-600 hover:to-orange-600
        focus:ring-yellow-500 shadow-lg hover:shadow-xl
        border border-transparent
      `,
      danger: `
        bg-gradient-to-r from-red-500 to-pink-600 text-white
        hover:from-red-600 hover:to-pink-700
        focus:ring-red-500 shadow-lg hover:shadow-xl
        border border-transparent
      `,
      ghost: `
        bg-transparent text-gray-700 hover:bg-gray-100
        focus:ring-gray-500 border border-gray-300
        hover:border-gray-400
      `,
    };

    const buttonClasses = `
      ${baseClasses}
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${className}
    `;

    return (
      <motion.button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        style={style}
        whileHover={disabled || loading ? {} : { scale: 1.02 }}
        whileTap={disabled || loading ? {} : { scale: 0.98 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
        {...props}
      >
        {/* 按钮内容 */}
        <div className="flex items-center gap-2">
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          
          {loading ? (
            <div className="flex items-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>加载中...</span>
            </div>
          ) : (
            <span>{children}</span>
          )}
          
          {icon && iconPosition === 'right' && !loading && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </div>

        {/* 点击波纹效果 */}
        <motion.div
          className="absolute inset-0 bg-white rounded-lg opacity-0"
          whileTap={disabled || loading ? {} : { opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.3 }}
        />

        {/* 光泽效果 */}
        {variant !== 'ghost' && !disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300 transform -skew-x-12 translate-x-full hover:translate-x-[-100%] transition-transform duration-700" />
        )}
      </motion.button>
    );
  }
);

AudioButton.displayName = 'AudioButton';

export default AudioButton;