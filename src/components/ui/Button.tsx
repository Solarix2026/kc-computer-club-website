/* eslint-disable prettier/prettier */
'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

// ========================================
// Button 组件
// 参考设计：club_homepage_1/code.html
// ========================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示加载状态 */
  isLoading?: boolean;
  /** 是否显示发光效果 */
  glow?: boolean;
  /** 左侧图标 */
  leftIcon?: ReactNode;
  /** 右侧图标 */
  rightIcon?: ReactNode;
  /** 子元素 */
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      glow = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { breathingEffectEnabled } = useTheme();
    
    // 基础样式 - 移动端隐藏文本，只显示图标
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-bold leading-normal tracking-[0.015em]
      rounded-xl transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
      [&>span:not(.material-symbols-outlined)]:hidden md:[&>span:not(.material-symbols-outlined)]:inline
    `;

    // 变体样式
    const variantStyles = {
      primary: `
        bg-primary hover:bg-primary/90 
        text-[#111814] 
        focus:ring-primary
        ${glow && breathingEffectEnabled ? 'animate-rgb-breathing shadow-[0_0_20px_var(--primary-glow)] hover:animate-none hover:shadow-[0_0_30px_var(--primary-glow)]' : 'hover:shadow-[0_0_30px_var(--primary-glow)]'}
      `,
      secondary: `
        bg-[var(--btn-bg)] dark:bg-[var(--btn-bg)] 
        hover:bg-[var(--btn-bg-hover)] dark:hover:bg-[var(--btn-bg-hover)]
        text-[var(--btn-text)] dark:text-[var(--btn-text)]
        focus:ring-[var(--primary)]
      `,
      ghost: `
        bg-white/5 hover:bg-primary hover:text-[#111814]
        text-white 
        border border-white/10
        focus:ring-primary
      `,
      danger: `
        bg-[var(--error)] hover:bg-[#dc2626]
        text-white 
        focus:ring-[var(--error)]
      `,
      outline: `
        bg-transparent hover:bg-primary/10
        text-[var(--primary)] border border-primary/30
        focus:ring-primary
      `,
    };

    // 尺寸样式 - md 中等按钮优化为默认尺寸
    const sizeStyles = {
      sm: 'h-8 px-3 text-xs sm:h-8 sm:px-2 md:px-2',
      md: 'h-10 px-4 text-sm sm:h-9 sm:px-3 md:h-10 md:px-4',
      lg: 'h-12 px-6 text-base sm:h-10 sm:px-4 md:h-12 md:px-6',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* 加载动画 */}
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* 左侧图标 */}
        {!isLoading && leftIcon && (
          typeof leftIcon === 'string' ? (
            <span className="material-symbols-outlined text-[18px] shrink-0">{leftIcon}</span>
          ) : (
            <span className="shrink-0">{leftIcon}</span>
          )
        )}

        {/* 按钮文本 */}
        <span className="truncate">{children}</span>

        {/* 右侧图标 */}
        {rightIcon && (
          typeof rightIcon === 'string' ? (
            <span className="material-symbols-outlined text-[18px] shrink-0">{rightIcon}</span>
          ) : (
            <span className="shrink-0">{rightIcon}</span>
          )
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
