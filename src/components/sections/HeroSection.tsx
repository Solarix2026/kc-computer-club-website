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
  /** Hero 图像路径 */
  heroImage?: string;
  /** Hero 图像替代文字 */
  heroImageAlt?: string;
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
  heroImage,
  heroImageAlt = 'Hero Image',
  className,
}: HeroSectionProps) {
  return (
    <section className={cn('grid grid-cols-1 gap-6 min-h-160', className)}>
      {/* 主 Hero 卡片 - 两列布局 */}
      <div className="relative flex flex-col lg:flex-row items-center justify-between overflow-hidden rounded-3xl bg-[var(--surface)] p-8 md:p-12 group border border-[var(--border)] min-h-160">
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
        
        {/* 左侧内容 */}
        <div className="relative z-10 flex flex-col gap-6 max-w-2xl flex-1">
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
              <Button variant="primary" size="lg">
                立即加入
              </Button>
            </Link>
            <Link href="/activities">
              <Button variant="secondary" size="lg">
                查看活动
              </Button>
            </Link>
          </div>
        </div>

        {/* 右侧 Hero 图像 */}
        {heroImage && (
          <div className="relative z-10 flex-1 flex items-center justify-center mt-8 lg:mt-0 lg:ml-8">
            <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <img
                src={heroImage}
                alt={heroImageAlt}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
