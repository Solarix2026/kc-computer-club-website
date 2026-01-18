/* eslint-disable prettier/prettier */
'use client';

import { forwardRef, SelectHTMLAttributes, useId, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ========================================
// Select 组件
// 参考设计：activity_sign-up_page/code.html
// ========================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** 选择框标签 */
  label?: string;
  /** 选项列表 */
  options: SelectOption[];
  /** 占位符 */
  placeholder?: string;
  /** 错误信息 */
  error?: string;
  /** 提示信息 */
  hint?: string;
  /** 是否必填 */
  required?: boolean;
  /** 容器类名 */
  containerClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      label,
      options,
      placeholder,
      error,
      hint,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const generatedId = useId();
    const selectId = id || (mounted ? generatedId : '');

    useEffect(() => {
      setMounted(true);
    }, []);

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={selectId || undefined}
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* 选择框容器 */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId || undefined}
            className={cn(
              // 基础样式 - 强制深色主题(移除 bg-gray-50)
              'w-full bg-[#102219]',
              'border border-[#2a4e3d]',
              'rounded-lg px-4 py-3 pr-10 text-base',
              'text-white',
              'appearance-none cursor-pointer',
              // Focus 样式
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              'transition-all duration-200',
              // 错误样式
              error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* 下拉箭头图标 */}
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#9dabb9] pointer-events-none">
            expand_more
          </span>
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

Select.displayName = 'Select';

export { Select };
