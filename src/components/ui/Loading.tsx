/* eslint-disable prettier/prettier */
'use client';

import { cn } from '@/lib/utils';

// ========================================
// Loading 组件
// 加载动画
// ========================================

interface LoadingProps {
  /** 大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 文字提示 */
  text?: string;
  /** 是否全屏 */
  fullScreen?: boolean;
  /** 额外类名 */
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

export function Loading({
  size = 'md',
  text,
  fullScreen = false,
  className,
}: LoadingProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div
        className={cn(
          'rounded-full border-primary/30 border-t-primary animate-spin',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#111814]/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// ========================================
// Skeleton 组件
// 骨架屏加载
// ========================================

interface SkeletonProps {
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 是否圆形 */
  circle?: boolean;
  /** 额外类名 */
  className?: string;
}

export function Skeleton({
  width,
  height,
  circle = false,
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-[#283930]',
        circle ? 'rounded-full' : 'rounded-lg',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// ========================================
// SkeletonCard 组件
// 卡片骨架屏
// ========================================

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 bg-gray-50 dark:bg-[#1c3128]',
        className
      )}
    >
      <div className="flex gap-2 mb-3">
        <Skeleton width={60} height={20} />
        <Skeleton width={40} height={20} />
      </div>
      <Skeleton width="100%" height={24} className="mb-2" />
      <Skeleton width="80%" height={16} className="mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton width={80} height={14} />
        <Skeleton width={60} height={14} />
      </div>
    </div>
  );
}

// ========================================
// SkeletonList 组件
// 列表骨架屏
// ========================================

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export function SkeletonList({ count = 3, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-[#1c3128]"
        >
          <Skeleton width={40} height={40} circle />
          <div className="flex-1">
            <Skeleton width="60%" height={16} className="mb-2" />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
