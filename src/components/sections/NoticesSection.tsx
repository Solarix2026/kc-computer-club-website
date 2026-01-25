/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { useState, useEffect } from 'react';

// ========================================
// NoticesSection 组件
// 参考设计：club_homepage_1/code.html - Recent Notices
// ========================================

interface Notice {
  id: string;
  title: string;
  summary: string;
  category: string;
  icon: string;
  iconColor: string;
  publishedAt: string | Date;
}

interface NoticesSectionProps {
  /** 公告列表 */
  notices: Notice[];
  /** 额外类名 */
  className?: string;
}

// 分类颜色映射
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  System: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/20' },
  News: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/20' },
  Update: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/20' },
  Event: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/20' },
  Urgent: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/20' },
  // 中文分类
  系统: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/20' },
  新闻: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/20' },
  更新: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/20' },
  活动: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/20' },
  紧急: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/20' },
};

// 图标颜色映射
const iconColors: Record<string, { bg: string; text: string }> = {
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  green: { bg: 'bg-primary/10', text: 'text-primary' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400' },
};

export function NoticesSection({ notices, className }: NoticesSectionProps) {
  return (
    <div className={cn('md:col-span-2 flex flex-col gap-4', className)}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">campaign</span>
          最新公告
        </h2>
        <Link 
          href="/notices" 
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          查看全部
        </Link>
      </div>
      
      {/* 公告列表 */}
      <div className="bg-[var(--surface)] rounded-3xl p-1 border border-[var(--border)]">
        <div className="flex flex-col gap-2">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      </div>
    </div>
  );
}

// 单个公告卡片组件 - 使用 useEffect 处理客户端时间
function NoticeCard({ notice }: { notice: Notice }) {
  const [displayTime, setDisplayTime] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const date = typeof notice.publishedAt === 'string' 
      ? new Date(notice.publishedAt) 
      : notice.publishedAt;
    setDisplayTime(formatRelativeTime(date));
  }, [notice.publishedAt]);

  const date = typeof notice.publishedAt === 'string' 
    ? new Date(notice.publishedAt) 
    : notice.publishedAt;
  const colors = categoryColors[notice.category] || categoryColors.Update;
  const iconStyle = iconColors[notice.iconColor] || iconColors.green;
  
  return (
    <Link href={`/notices/${notice.id}`}>
      <div className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--surface-hover)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]">
        {/* 图标 */}
        <div className={cn(
          'shrink-0 flex items-center justify-center size-12 rounded-xl',
          iconStyle.bg,
          iconStyle.text
        )}>
          <span className="material-symbols-outlined">{notice.icon}</span>
        </div>
        
        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-[var(--foreground)] truncate group-hover:text-primary transition-colors">
              {notice.title}
            </h4>
            <span className={cn(
              'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
              colors.bg,
              colors.text,
              colors.border
            )}>
              {notice.category}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] truncate">{notice.summary}</p>
        </div>
        
        {/* 时间 - 仅在客户端渲染 */}
        {isHydrated && (
          <span className="hidden sm:block text-xs text-[var(--text-secondary)] font-mono">
            {displayTime}
          </span>
        )}
        
        {/* 箭头 */}
        <span className="material-symbols-outlined text-[var(--text-secondary)] group-hover:text-[var(--foreground)] group-hover:translate-x-1 transition-all">
          chevron_right
        </span>
      </div>
    </Link>
  );
}

// ========================================
// EventsSection 组件
// 参考设计：club_homepage_1/code.html - Upcoming Events
// ========================================

interface Activity {
  id: string;
  title: string;
  category: string;
  categoryColor?: string;
  date: string | Date;
  time: string;
  location: string;
}

interface EventsSectionProps {
  activities: Activity[];
  className?: string;
}

const categoryTextColors: Record<string, string> = {
  Workshop: 'text-primary',
  Social: 'text-purple-400',
  Competition: 'text-red-400',
  Meeting: 'text-blue-400',
  // 中文
  工作坊: 'text-primary',
  社交: 'text-purple-400',
  比赛: 'text-red-400',
  会议: 'text-blue-400',
};

export function EventsSection({ activities, className }: EventsSectionProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          即将到来
        </h2>
      </div>
      
      {/* 活动列表 */}
      <div className="flex flex-col gap-4 h-full">
        {activities.map((activity) => {
          const date = typeof activity.date === 'string' 
            ? new Date(activity.date) 
            : activity.date;
          const categoryColor = categoryTextColors[activity.category] || 'text-primary';
          
          return (
            <Link key={activity.id} href={`/activities/${activity.id}`}>
              <div className="flex flex-col bg-[var(--surface)] rounded-3xl p-5 border border-[var(--border)] hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col">
                    <span className={cn(
                      'text-xs font-bold uppercase tracking-wider mb-1',
                      categoryColor
                    )}>
                      {activity.category}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-primary transition-colors">
                      {activity.title}
                    </h3>
                  </div>
                  <div className="bg-[var(--surface-hover)] rounded-lg px-3 py-1 text-center min-w-15">
                    <span className="block text-xs text-[var(--text-secondary)] uppercase">
                      {date.toLocaleDateString('zh-CN', { month: 'short' })}
                    </span>
                    <span className="block text-xl font-bold text-[var(--foreground)]">
                      {date.getDate()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-6">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {activity.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {activity.location}
                  </div>
                </div>
                
                <button className="mt-auto w-full py-2.5 rounded-xl bg-[var(--surface-hover)] text-[var(--foreground)] text-sm font-bold hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_var(--primary-glow)]">
                  立即报名
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
