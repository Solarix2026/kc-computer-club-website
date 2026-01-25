/* eslint-disable prettier/prettier */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ========================================
// ActivityCard 组件
// 参考设计：club_homepage_1/code.html - Upcoming Events 部分
// ========================================

interface ActivityCardProps {
  /** 活动ID */
  id: string;
  /** 活动标题 */
  title: string;
  /** 活动描述 */
  description: string;
  /** 封面图片URL */
  coverImage?: string;
  /** 活动日期 */
  activityDate: string | Date;
  /** 地点 */
  location: string;
  /** 报名状态 */
  status: 'active' | 'ended' | 'cancelled' | 'draft';
  /** 当前报名人数 */
  signupCount?: number;
  /** 最大报名人数 */
  maxSignups?: number;
  /** 是否显示报名按钮 */
  showSignupButton?: boolean;
  /** 额外类名 */
  className?: string;
}

export function ActivityCard({
  id,
  title,
  description,
  coverImage,
  activityDate,
  location,
  status,
  signupCount = 0,
  maxSignups,
  showSignupButton = true,
  className,
}: ActivityCardProps) {
  const date = typeof activityDate === 'string' ? new Date(activityDate) : activityDate;
  const isFull = maxSignups !== undefined && signupCount >= maxSignups;
  const canSignup = status === 'active' && !isFull;

  // 格式化日期
  const formattedDate = date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article
      className={cn(
        'rounded-lg overflow-hidden',
        'border border-[var(--border)] bg-[var(--surface)]',
        'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
        'transition-all duration-300',
        'group',
        className
      )}
    >
      {/* 封面图片 */}
      <div className="relative h-48 overflow-hidden bg-primary/10">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary/50">
              event
            </span>
          </div>
        )}
        
        {/* 状态标签 */}
        <div className="absolute top-4 right-4">
          <StatusBadge status={status === 'active' ? 'active' : status === 'ended' ? 'ended' : 'pending'} />
        </div>

        {/* 日期标签 */}
        {/* eslint-disable-next-line tailwindcss/classnames-order */}
        <div className="absolute bottom-4 left-4 bg-[#111814] rounded-lg px-3 py-2 text-center min-w-15">  
          <div className="text-xs text-gray-400 uppercase">{formattedDate}</div>
          <div className="text-sm font-bold text-white">{formattedTime}</div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        <Link href={`/activities/${id}`}>
          <h3 className="font-bold text-lg text-[var(--foreground)] group-hover:text-primary transition-colors line-clamp-1 mb-2">
            {title}
          </h3>
        </Link>

        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
          {description}
        </p>

        {/* 信息区域 */}
        <div className="space-y-2 text-sm text-[var(--text-secondary)] mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-primary">
              location_on
            </span>
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-primary">
              group
            </span>
            <span>
              {signupCount} 人已报名
              {maxSignups && ` / ${maxSignups} 人`}
            </span>
          </div>
        </div>

        {/* 报名按钮 */}
        {showSignupButton && (
          <Link href={`/activities/${id}/signup`}>
            <Button
              variant={canSignup ? 'primary' : 'secondary'}
              className="w-full"
              disabled={!canSignup}
            >
              {status === 'ended'
                ? '活动已结束'
                : status === 'cancelled'
                ? '活动已取消'
                : isFull
                ? '报名已满'
                : '立即报名'}
            </Button>
          </Link>
        )}
      </div>
    </article>
  );
}

// ========================================
// ActivityCardCompact 组件
// 简洁版活动卡片（用于列表）
// ========================================

interface ActivityCardCompactProps {
  id: string;
  title: string;
  activityDate: string | Date;
  location: string;
  status: 'active' | 'ended' | 'cancelled' | 'draft';
  signupCount?: number;
  maxSignups?: number;
  className?: string;
}

export function ActivityCardCompact({
  id,
  title,
  activityDate,
  location,
  status,
  signupCount = 0,
  maxSignups,
  className,
}: ActivityCardCompactProps) {
  const date = typeof activityDate === 'string' ? new Date(activityDate) : activityDate;

  return (
    <Link href={`/activities/${id}`}>
      <div
        className={cn(
          'flex gap-4 p-4 rounded-xl',
          'bg-[var(--surface)] border border-[var(--border)]',
          'hover:border-primary/50 hover:shadow-lg',
          'transition-all duration-300',
          'cursor-pointer group',
          className
        )}
      >
        {/* 日期标签 */}
        <div className="size-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
          <span className="text-xs text-primary uppercase">
            {date.toLocaleDateString('zh-CN', { month: 'short' })}
          </span>
          <span className="text-lg font-bold text-primary">
            {date.getDate()}
          </span>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-[var(--foreground)] group-hover:text-primary transition-colors truncate">
              {title}
            </h4>
            <StatusBadge 
              status={status === 'active' ? 'active' : status === 'ended' ? 'ended' : 'pending'} 
              size="sm"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {location}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">group</span>
              {signupCount}{maxSignups && `/${maxSignups}`}
            </span>
          </div>
        </div>

        {/* 箭头 */}
        <span className="material-symbols-outlined text-[var(--text-secondary)] group-hover:text-primary transition-colors self-center">
          chevron_right
        </span>
      </div>
    </Link>
  );
}
