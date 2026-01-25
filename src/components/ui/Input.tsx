/* eslint-disable prettier/prettier */
'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useId, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ========================================
// Input 组件
// 参考设计：admin_login/code.html, activity_sign-up_page/code.html
// ========================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 输入框标签 */
  label?: string;
  /** 左侧图标（Material Symbol 名称或 ReactNode） */
  leftIcon?: string | ReactNode;
  /** 右侧图标（Material Symbol 名称或 ReactNode） */
  rightIcon?: string | ReactNode;
  /** 右侧图标点击事件 */
  onRightIconClick?: () => void;
  /** 错误信息 */
  error?: string;
  /** 提示信息 */
  hint?: string;
  /** 是否必填 */
  required?: boolean;
  /** 容器类名 */
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      leftIcon,
      rightIcon,
      onRightIconClick,
      error,
      hint,
      required,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const generatedId = useId();
    const inputId = id || (mounted ? generatedId : '');

    useEffect(() => {
      setMounted(true);
    }, []);

    // 渲染图标
    const renderIcon = (icon: string | ReactNode, position: 'left' | 'right') => {
      if (typeof icon === 'string') {
        return (
          <span
            className={cn(
              'material-symbols-outlined text-[20px] text-[#9dabb9]',
              position === 'left' ? 'absolute left-4 top-1/2 -translate-y-1/2' : '',
              position === 'right' && onRightIconClick
                ? 'cursor-pointer hover:text-white transition-colors'
                : ''
            )}
            onClick={position === 'right' ? onRightIconClick : undefined}
          >
            {icon}
          </span>
        );
      }
      return (
        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2',
            position === 'left' ? 'left-4' : 'right-4'
          )}
          onClick={position === 'right' ? onRightIconClick : undefined}
        >
          {icon}
        </span>
      );
    };

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={inputId || undefined}
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* 输入框容器 */}
        <div className="relative">
          {/* 左侧图标 */}
          {leftIcon && renderIcon(leftIcon, 'left')}

          {/* 输入框 */}
          <input
            ref={ref}
            id={inputId || undefined}
            type={type}
            className={cn(
              // 基础样式 - 支持亮/暗主题
              'w-full',
              'bg-white dark:bg-[#102219]',
              'border border-gray-300 dark:border-[#2a4e3d]',
              'rounded-lg px-4 py-3 text-base',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-[#9dabb9]',
              // Focus 样式
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              'transition-all duration-200',
              // 错误样式
              error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
              // 图标 padding
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              className
            )}
            {...props}
          />

          {/* 右侧图标 */}
          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              {renderIcon(rightIcon, 'right')}
            </span>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </p>
        )}

        {/* 提示信息 */}
        {hint && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
