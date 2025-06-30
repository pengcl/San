import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
// import GameButton from './GameButton';

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  className?: string;
  maskClosable?: boolean;
  closable?: boolean;
  destroyOnClose?: boolean;
  centered?: boolean;
  zIndex?: number;
  variant?: 'default' | 'game' | 'simple';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode | null;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLoading?: boolean;
  keyboard?: boolean;
  focusTrap?: boolean;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  onClose,
  children,
  title,
  subtitle,
  width,
  height,
  maxWidth,
  maxHeight,
  className = '',
  maskClosable = true,
  closable = true,
  destroyOnClose = false,
  // centered = true,
  zIndex = 1000,
  variant = 'game',
  size = 'md',
  footer,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  confirmLoading = false,
  keyboard = true,
  focusTrap = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // 获取尺寸样式
  const getSizeStyles = () => {
    if (width || height) {
      return {
        width,
        height,
        maxWidth,
        maxHeight,
      };
    }

    const sizeMap = {
      sm: { width: '400px', maxWidth: '90vw' },
      md: { width: '600px', maxWidth: '90vw' },
      lg: { width: '800px', maxWidth: '90vw' },
      xl: { width: '1000px', maxWidth: '95vw' },
      full: { width: '95vw', height: '95vh' },
    };

    return {
      ...sizeMap[size],
      maxHeight: maxHeight || '90vh',
    };
  };

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!keyboard) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [keyboard, onClose]
  );

  // 处理焦点捕获
  const handleFocusTrap = useCallback(
    (event: KeyboardEvent) => {
      if (!focusTrap || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [focusTrap]
  );

  // 处理蒙层点击
  const handleMaskClick = (event: React.MouseEvent) => {
    if (maskClosable && event.target === event.currentTarget) {
      onClose();
    }
  };

  // 处理确认和取消
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  // 副作用处理
  useEffect(() => {
    if (open) {
      // 保存当前焦点元素
      previousActiveElement.current = document.activeElement as HTMLElement;

      // 阻止背景滚动
      document.body.style.overflow = 'hidden';

      // 添加键盘事件监听
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleFocusTrap);

      // 聚焦到模态框
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // 恢复背景滚动
      document.body.style.overflow = '';

      // 移除键盘事件监听
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTrap);

      // 恢复之前的焦点
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [open, handleKeyDown, handleFocusTrap]);

  // 获取变体样式
  const getVariantClasses = () => {
    const variants = {
      default: 'bg-white border border-gray-200 shadow-xl',
      game: 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-orange-400/50 shadow-game',
      simple: 'bg-slate-800 border border-slate-600 shadow-lg',
    };
    return variants[variant];
  };

  // 动画变体
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const modalClasses = [
    'relative',
    'rounded-xl',
    'overflow-hidden',
    'max-w-full',
    'max-h-full',
    'flex',
    'flex-col',
    getVariantClasses(),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          className='fixed inset-0 flex items-center justify-center p-4'
          style={{ zIndex }}
          variants={backdropVariants}
          initial='hidden'
          animate='visible'
          exit='hidden'
          onClick={handleMaskClick}
        >
          {/* 背景蒙层 */}
          <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' />

          {/* 模态框容器 */}
          <motion.div
            ref={modalRef}
            className={modalClasses}
            style={getSizeStyles()}
            variants={modalVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            tabIndex={-1}
            role='dialog'
            aria-modal='true'
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* 头部 */}
            {(title || subtitle || closable) && (
              <div className='flex-shrink-0 px-6 py-4 border-b border-slate-700'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1 min-w-0'>
                    {title && (
                      <h2
                        id='modal-title'
                        className='text-xl font-bold text-white mb-1'
                      >
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className='text-sm text-slate-400'>{subtitle}</p>
                    )}
                  </div>

                  {closable && (
                    <motion.button
                      className='ml-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors'
                      onClick={onClose}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>
            )}

            {/* 内容区域 */}
            <div className='flex-1 overflow-auto p-6'>{children}</div>

            {/* 底部 */}
            {footer !== null && (
              <div className='flex-shrink-0 px-6 py-4 border-t border-slate-700'>
                {footer !== undefined ? (
                  footer
                ) : (
                  <div className='flex justify-end space-x-3'>
                    {onCancel && (
                      <button
                        className='px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors'
                        onClick={handleCancel}
                      >
                        {cancelText}
                      </button>
                    )}
                    {onConfirm && (
                      <button
                        className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50'
                        onClick={handleConfirm}
                        disabled={confirmLoading}
                      >
                        {confirmLoading ? '加载中...' : confirmText}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 游戏风格装饰 */}
            {variant === 'game' && (
              <div className='absolute inset-0 pointer-events-none'>
                {/* 边角装饰 */}
                <div className='absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-orange-400/60 rounded-tl-lg' />
                <div className='absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-orange-400/60 rounded-tr-lg' />
                <div className='absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-orange-400/60 rounded-bl-lg' />
                <div className='absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-orange-400/60 rounded-br-lg' />

                {/* 光效 */}
                <div className='absolute inset-0 bg-gradient-to-b from-orange-400/5 to-transparent rounded-xl' />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 如果不应该渲染（销毁模式且未打开），则返回null
  if (destroyOnClose && !open) {
    return null;
  }

  // 使用Portal渲染到body
  return createPortal(modalContent, document.body);
};

// 静态方法 - 函数式调用
interface ModalConfig extends Omit<ModalDialogProps, 'open' | 'children'> {
  content: React.ReactNode;
}

let modalId = 0;

export const Modal = {
  // 信息框
  info: (config: ModalConfig) => {
    return Modal.show({
      ...config,
      variant: 'game',
      title: config.title || '提示',
    });
  },

  // 确认框
  confirm: (config: ModalConfig) => {
    return Modal.show({
      ...config,
      variant: 'game',
      title: config.title || '确认',
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
    });
  },

  // 警告框
  warning: (config: ModalConfig) => {
    return Modal.show({
      ...config,
      variant: 'game',
      title: config.title || '警告',
    });
  },

  // 错误框
  error: (config: ModalConfig) => {
    return Modal.show({
      ...config,
      variant: 'game',
      title: config.title || '错误',
    });
  },

  // 成功框
  success: (config: ModalConfig) => {
    return Modal.show({
      ...config,
      variant: 'game',
      title: config.title || '成功',
    });
  },

  // 通用显示方法
  show: (config: ModalConfig) => {
    const id = `modal-${++modalId}`;
    const container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);

    const close = () => {
      container.remove();
    };

    // const _ModalWrapper: React.FC = () => {
    //   const [open, setOpen] = React.useState(true);

    //   const handleClose = () => {
    //     setOpen(false);
    //     setTimeout(close, 300);
    //   };

    //   return (
    //     <ModalDialog
    //       {...config}
    //       open={open}
    //       onClose={handleClose}
    //     >
    //       {config.content}
    //     </ModalDialog>
    //   );
    // };

    // 这里需要实际的渲染逻辑，在真实项目中应该使用ReactDOM.render或者React 18的createRoot
    console.log('Modal would be rendered with config:', config);

    return { close };
  },
};

// 导出类型
export type { ModalDialogProps, ModalConfig };

// 默认导出
export default ModalDialog;
