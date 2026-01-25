/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime, truncate } from '@/lib/utils';
import { Badge, CategoryBadge } from '@/components/ui/Badge';

// ========================================
// NoticeCard 组件
// 参考设计：club_homepage_1/code.html - Recent Notices 部分
// ========================================

interface NoticeCardProps {
  /** 通知ID */
  id: string;
  /** 标题 */
  title: string;
  /** 摘要内容 */
  summary: string;
  /** 分类 */
  category: string;
  /** 发布时间 */
  publishedAt: string | Date;
  /** 是否置顶 */
  isPinned?: boolean;
  /** 是否重要 */
  isImportant?: boolean;
  /** 额外类名 */
  className?: string;
}

export function NoticeCard({
  id,
  title,
  summary,
  category,
  publishedAt,
  isPinned = false,
  isImportant = false,
  className,
}: NoticeCardProps) {
  const date = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;

  return (
    <Link href={`/notices/${id}`} className="block group">
      <article
        className={cn(
          'rounded-lg border border-[var(--border)] bg-[var(--surface)]',
          'overflow-hidden',
          'hover:border-primary/50 hover:shadow-lg',
          'transition-all duration-300',
          'cursor-pointer',
          'h-full flex flex-col',
          className
        )}
      >
        {/* 彩色头部区域 */}
        <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-5xl text-primary/40">
            article
          </span>
        </div>

        {/* 内容区域 */}
        <div className="p-4 flex-1 flex flex-col">
          {/* 标签区域 */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <CategoryBadge category={category} />
            {isPinned && (
              <Badge variant="warning" size="sm">
                <span className="material-symbols-outlined text-xs mr-1">push_pin</span>
                置顶
              </Badge>
            )}
            {isImportant && (
              <Badge variant="danger" size="sm">
                <span className="material-symbols-outlined text-xs mr-1">priority_high</span>
                重要
              </Badge>
            )}
          </div>

          {/* 标题 */}
          <h3
            className={cn(
              'font-bold text-[var(--foreground)]',
              'group-hover:text-primary',
              'transition-colors duration-200',
              'line-clamp-2 mb-2'
            )}
          >
            {title}
          </h3>

          {/* 摘要 */}
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 flex-1">
            {truncate(summary, 100)}
          </p>

          {/* 底部信息 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">
              {formatRelativeTime(date)}
            </span>
            <span
              className={cn(
                'text-xs text-primary',
                'flex items-center gap-1',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity duration-200'
              )}
            >
              阅读更多
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ========================================
// NoticeCardCompact 组件
// 简洁版通知卡片
// ========================================

interface NoticeCardCompactProps {
  id: string;
  title: string;
  category: string;
  publishedAt: string | Date;
  isImportant?: boolean;
  className?: string;
}

export function NoticeCardCompact({
  id,
  title,
  category,
  publishedAt,
  isImportant = false,
  className,
}: NoticeCardCompactProps) {
  const date = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;

  return (
    <Link href={`/notices/${id}`}>
      <div
        className={cn(
          'flex items-center gap-4 p-4 rounded-lg',
          'bg-[var(--surface)] border border-[var(--border)]',
          'hover:bg-[var(--surface)] hover:border-primary/50',
          'transition-all duration-300',
          'cursor-pointer group',
          className
        )}
      >
        {/* 分类图标 */}
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">
            {isImportant ? 'priority_high' : 'article'}
          </span>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[var(--foreground)] group-hover:text-primary transition-colors truncate">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
            <span>{category}</span>
            <span>·</span>
            <span>{formatRelativeTime(date)}</span>
          </div>
        </div>

        {/* 箭头 */}
        <span className="material-symbols-outlined text-[var(--text-secondary)] group-hover:text-primary transition-colors">
          chevron_right
        </span>
      </div>
    </Link>
  );
}
