/* eslint-disable prettier/prettier */
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// ========================================
// Modal 组件
// 参考设计：各种管理员页面的模态框
// ========================================

interface ModalProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 标题 */
  title?: string;
  /** 描述文字 */
  description?: string;
  /** 子内容 */
  children?: React.ReactNode;
  /** 宽度 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
  /** 点击遮罩层是否关闭 */
  closeOnOverlayClick?: boolean;
  /** 额外类名 */
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 防止滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 点击遮罩层关闭
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === overlayRef.current) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50',
        'flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-sm',
        'animate-in fade-in duration-200'
      )}
    >
      <div
        className={cn(
          'w-full rounded-2xl',
          'bg-white dark:bg-[#1c3128]',
          'border border-gray-200 dark:border-[#283930]',
          'shadow-xl shadow-black/20',
          'animate-in zoom-in-95 duration-200',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#283930]">
            <div>
              {title && (
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'size-8 rounded-lg',
                  'flex items-center justify-center',
                  'text-gray-500 hover:text-gray-700',
                  'dark:text-gray-400 dark:hover:text-white',
                  'hover:bg-gray-100 dark:hover:bg-[#283930]',
                  'transition-colors'
                )}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ========================================
// ConfirmModal 组件
// 确认对话框（二次确认）
// ========================================

interface ConfirmModalProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 确认回调 */
  onConfirm: () => void | Promise<void>;
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 类型 */
  variant?: 'danger' | 'warning' | 'info';
  /** 是否正在加载 */
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'info',
  loading = false,
}: ConfirmModalProps) {
  const iconMap = {
    danger: { icon: 'warning', color: 'text-red-500', bg: 'bg-red-500/10' },
    warning: { icon: 'error', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    info: { icon: 'info', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  };

  const { icon, color, bg } = iconMap[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* 图标 */}
        <div
          className={cn(
            'mx-auto size-14 rounded-full',
            'flex items-center justify-center',
            'mb-4',
            bg
          )}
        >
          <span className={cn('material-symbols-outlined text-2xl', color)}>
            {icon}
          </span>
        </div>

        {/* 标题和描述 */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {description}
          </p>
        )}

        {/* 按钮 */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
