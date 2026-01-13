/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

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
  return (
    <section className={cn('grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-120', className)}>
      {/* 主 Hero 卡片 */}
      <div className="lg:col-span-8 relative flex flex-col justify-end overflow-hidden rounded-3xl bg-[#162a21] p-8 md:p-12 group">
        {/* 抽象背景图案 */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 150%, #13ec80 0%, transparent 50%), radial-gradient(circle at 80% -50%, #1c523d 0%, transparent 50%)'
          }}
        />
        
        <div className="relative z-10 flex flex-col gap-6 max-w-2xl">
          {/* 状态标签 */}
          <div className="inline-flex items-center w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
            <span className="flex size-2 rounded-full bg-primary mr-2 animate-pulse" />
            {statusText}
          </div>
          
          {/* 主标题 */}
          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-white">
            创造 <span className="text-primary">未来</span>。<br />
            加入社团。
          </h1>
          
          {/* 副标题 */}
          <p className="text-lg text-gray-300 max-w-md">
            {subheadline}
          </p>
          
          {/* CTA 按钮组 */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/join">
              <Button variant="primary" size="lg" leftIcon="group_add" glow>
                加入我们
              </Button>
            </Link>
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
        {/* 状态卡片 */}
        <div className="flex-1 rounded-3xl bg-[#162a21] p-6 border border-white/5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">机房状态</h3>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/20 uppercase tracking-wider">
              开放中
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-white">{activeUsers}</span>
            <span className="text-gray-400 mb-1">人在线</span>
          </div>
          <div className="mt-4 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">容量 {capacityPercent}%</p>
        </div>
        
        {/* 特色项目卡片 */}
        <div className="flex-1 rounded-3xl bg-[#162a21] p-6 border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors cursor-pointer">
          <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-50"
            style={{
              backgroundImage: 'linear-gradient(135deg, #1c3128 0%, #162a21 100%)'
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
