/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useClub } from '@/contexts/ClubContext';

// ========================================
// HeroSection 组件
// 参考设计：club_homepage_1/code.html
// ========================================

interface HeroSectionProps {
  /** 社团名称 */
  clubName?: string;
  /** 主标题 */
  headline?: string;
  /** 副标题 */
  subheadline?: string;
  /** 招新状态文字 */
  statusText?: string;
  /** 活跃用户数 */
  activeUsers?: number;
  /** 容量百分比 */
  capacityPercent?: number;
  /** 特色项目标题 */
  featuredProjectTitle?: string;
  /** 特色项目贡献者数 */
  featuredProjectContributors?: number;
  className?: string;
}

export function HeroSection({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clubName: _clubName = '电脑学会',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  headline: _headline = '创造未来，加入社团。',
  subheadline = '与志同道合的开发者交流，参与开源项目，在校园中引领技术前沿。',
  statusText = '正在招收新成员',
  activeUsers = 24,
  capacityPercent = 45,
  featuredProjectTitle = 'Campus AI Bot',
  featuredProjectContributors = 5,
  className,
}: HeroSectionProps) {
  const { clubInfo } = useClub();
  // 这里假设 clubInfo.logoUrl 和 clubInfo.clubName 已经有值
  // 你可以根据实际 API 增加更多字段
  // 额外：尝试从 localStorage 读取 clubSettings 以获取官网链接
  let website = '';
  if (typeof window !== 'undefined') {
    try {
      const clubSettings = JSON.parse(localStorage.getItem('clubInfo') || '{}');
      website = clubSettings.website || '';
    } catch {}
  }
  return (
    <section className={cn('grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-120', className)}>
      {/* 主 Hero 卡片 */}
      <div className="lg:col-span-8 relative flex flex-col justify-end overflow-hidden rounded-3xl bg-[var(--surface)] p-8 md:p-12 group border border-[var(--border)]">
        {/* 抽象背景图案 */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 150%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 80% -50%, var(--primary-light) 0%, transparent 50%)'
          }}
        />
        
        {/* Logo - 左上角 */}
        <div className="absolute top-6 left-6 z-20 w-16 h-16 opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center">
          <span className="text-primary font-black text-3xl">KC</span>
        </div>
        
        <div className="relative z-10 flex flex-col gap-6 max-w-2xl">
          {/* 状态标签 */}
          <div className="inline-flex items-center w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
            <span className="flex size-2 rounded-full bg-primary mr-2 animate-pulse" />
            {statusText}
          </div>
          
          {/* 主标题 */}
          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-[var(--foreground)]">
            创造 <span className="text-primary">未来</span>。<br />
            加入社团。
          </h1>
          
          {/* 副标题 */}
          <p className="text-lg text-[var(--text-secondary)] max-w-md">
            {subheadline}
          </p>
          
          {/* CTA 按钮组 */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/activities">
              <Button variant="secondary" size="lg">
                查看活动
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* 侧边信息栏 */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* 其他信息卡片（含 logo） */}
        <div className="flex-1 rounded-3xl bg-[var(--surface)] p-6 border border-[var(--border)] flex flex-col justify-center items-center gap-3">
          <h3 className="text-[var(--text-secondary)] font-medium mb-2">其他</h3>
          {clubInfo.logoUrl ? (
            <a href={website || '#'} target="_blank" rel="noopener noreferrer" className="block mb-2">
              <img
                src={clubInfo.logoUrl}
                alt={clubInfo.clubName + ' logo'}
                className="w-20 h-20 object-contain rounded-xl border border-[var(--border)] shadow"
              />
            </a>
          ) : (
            <span className="text-4xl text-[var(--text-secondary)]">—</span>
          )}
          {clubInfo.clubName && <div className="text-sm text-[var(--text-secondary)]">{clubInfo.clubName}</div>}
        </div>

        {/* 新增：社团官网卡片 */}
        {website && (
          <div className="flex-1 rounded-3xl bg-[var(--surface)] p-6 border border-[var(--border)] flex flex-col justify-center items-center gap-2">
            <h3 className="text-[var(--text-secondary)] font-medium mb-2">社团官网</h3>
            <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all text-center">
              {website}
            </a>
          </div>
        )}
        
        {/* 特色项目卡片 */}
        <div className="flex-1 rounded-3xl bg-[var(--surface)] p-6 border border-[var(--border)] relative overflow-hidden group hover:border-primary/30 transition-colors cursor-pointer">
          <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent z-10 dark:from-black/80 from-gray-900/60" />
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-50"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--primary-light) 0%, var(--surface) 100%)'
            }}
          />
          <div className="relative z-20 h-full flex flex-col justify-end">
            <span className="text-primary text-xs font-bold uppercase tracking-wider mb-1">
              本月项目
            </span>
            <h3 className="text-xl font-bold text-white">{featuredProjectTitle}</h3>
            <div className="flex items-center text-gray-300 text-sm mt-2">
              <span className="material-symbols-outlined text-[16px] mr-1">group</span>
              {featuredProjectContributors} 位贡献者
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
