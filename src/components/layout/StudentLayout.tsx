/* eslint-disable prettier/prettier */
'use client';

import { cn } from '@/lib/utils';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useClub } from '@/contexts/ClubContext';
import { ClubLogo } from '@/components/ui/ClubLogo';
import Link from 'next/link';

// ========================================
// StudentLayout 组件
// 学生侧边栏布局
// ========================================

interface StudentLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function StudentLayout({
  children,
  className,
}: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { clubInfo } = useClub();

  return (
    <div className={cn('student-layout min-h-screen bg-[var(--background)]', className)}>
      {/* 侧边栏 */}
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* 主内容区域 - 添加左边距来为固定侧边栏腾出空间 */}
      <div 
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        )}
      >
        {/* 顶部导航栏 */}
        <header
          className={cn(
            'sticky top-0 z-30 h-16',
            'bg-[var(--surface)] border-b border-[var(--border)]',
            'flex items-center justify-between px-4 sm:px-6'
          )}
        >
          {/* 左侧 - 菜单按钮 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden size-10 flex items-center justify-center rounded-lg hover:bg-[var(--border)] transition-colors text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              title="打开菜单"
            >
              <span className="material-symbols-outlined text-lg">
                {sidebarOpen ? 'close' : 'menu'}
              </span>
            </button>

            {/* 品牌 - 移动端显示 */}
            <Link href="/" className="md:hidden flex items-center gap-2">
              <ClubLogo />
              <span className="text-sm font-bold text-[var(--foreground)]">
                电脑学会
              </span>
            </Link>
          </div>

          {/* 右侧 - 主题切换 */}
          <div className="flex items-center gap-4">
            <ThemeToggle compact />
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
