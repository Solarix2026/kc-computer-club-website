/* eslint-disable prettier/prettier */
'use client';

import { cn } from '@/lib/utils';
import { Button } from './Button';

// ========================================
// EmptyState 组件
// 空状态提示
// ========================================

interface EmptyStateProps {
  /** 图标 */
  icon?: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 操作按钮文字 */
  actionText?: string;
  /** 操作按钮回调 */
  onAction?: () => void;
  /** 额外类名 */
  className?: string;
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12',
        className
      )}
    >
      {/* 图标 */}
      <div
        className={cn(
          'size-16 rounded-2xl',
          'bg-gray-100 dark:bg-[#1c3128]',
          'flex items-center justify-center',
          'mb-4'
        )}
      >
        <span className="material-symbols-outlined text-3xl text-gray-400 dark:text-gray-500">
          {icon}
        </span>
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* 描述 */}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

// ========================================
// ErrorState 组件
// 错误状态提示
// ========================================

interface ErrorStateProps {
  /** 错误标题 */
  title?: string;
  /** 错误描述 */
  message?: string;
  /** 重试按钮回调 */
  onRetry?: () => void;
  /** 额外类名 */
  className?: string;
}

export function ErrorState({
  title = '出错了',
  message = '加载数据时发生错误，请稍后重试。',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12',
        className
      )}
    >
      {/* 图标 */}
      <div
        className={cn(
          'size-16 rounded-2xl',
          'bg-red-100 dark:bg-red-500/10',
          'flex items-center justify-center',
          'mb-4'
        )}
      >
        <span className="material-symbols-outlined text-3xl text-red-500">
          error
        </span>
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* 描述 */}
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        {message}
      </p>

      {/* 重试按钮 */}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} leftIcon="refresh">
          重试
        </Button>
      )}
    </div>
  );
}
