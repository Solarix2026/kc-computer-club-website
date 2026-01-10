/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

// ========================================
// AdminLayout 组件
// 参考设计：admin_dashboard/code.html
// ========================================

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  /** 当前管理员名称 */
  adminName?: string;
  /** 额外类名 */
  className?: string;
}

const navItems: NavItem[] = [
  { label: '仪表盘', href: '/admin', icon: 'dashboard' },
  { label: '公告管理', href: '/admin/notices', icon: 'campaign' },
  { label: '活动管理', href: '/admin/activities', icon: 'event' },
  { label: '报名管理', href: '/admin/signups', icon: 'how_to_reg' },
  { label: '评论管理', href: '/admin/comments', icon: 'chat' },
  { label: '管理员管理', href: '/admin/manage', icon: 'admin_panel_settings' },
  { label: '社团信息', href: '/admin/settings', icon: 'settings' },
];

export function AdminLayout({
  children,
  adminName = 'Admin',
  className,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  
  // Use actual logged-in user name if available
  const displayName = user?.name || adminName;

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className={cn('flex min-h-screen bg-[#111814]', className)}>
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 - 桌面上固定显示，手机上可切换 */}
      <aside
        className={cn(
          'fixed lg:fixed left-0 top-0 h-screen w-64',
          'bg-[#162a21] border-r border-[#283930]',
          'flex-col',
          'z-40',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#283930]">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-[#137fec]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#137fec] text-lg">
                admin_panel_settings
              </span>
            </div>
            <span className="font-bold text-white text-lg">管理后台</span>
          </Link>
          {/* 手机端关闭按钮 */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl',
                  'text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#137fec] text-white'
                    : 'text-gray-400 hover:bg-[#283930] hover:text-white'
                )}
              >
                <span className="material-symbols-outlined text-lg">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 底部区域 */}
        <div className="p-4 border-t border-[#283930]">
          {/* 管理员信息 */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1c3128] mb-4">
            <div className="size-8 rounded-full bg-[#137fec]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#137fec] text-sm">
                person
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">管理员</p>
            </div>
          </div>

          {/* 退出按钮 */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-[#0f5fcc]/20 transition-all"
            leftIcon="logout"
          >
            退出登录
          </Button>

          {/* 返回前台 */}
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-[#0f5fcc]/20 transition-all mt-1"
              leftIcon="home"
            >
              返回前台
            </Button>
          </Link>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 lg:ml-64">
        {/* 顶部导航栏 */}
        <header
          className={cn(
            'sticky top-0 z-30 h-16',
            'bg-[#111814]/80 backdrop-blur-md',
            'border-b border-[#283930]',
            'flex items-center justify-between px-4 sm:px-6'
          )}
        >
          {/* 左侧 - 汉堡菜单 + 面包屑 */}
          <div className="flex items-center gap-4">
            {/* 手机端菜单按钮 */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* 面包屑 */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link href="/admin" className="hover:text-white transition-colors">
                首页
              </Link>
              <span className="material-symbols-outlined text-xs">
                chevron_right
              </span>
              <span className="text-white">
                {navItems.find((item) => 
                  pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                )?.label || '仪表盘'}
              </span>
            </div>
          </div>

          {/* 右侧操作区域 */}
          <div className="flex items-center gap-4">
            {/* 通知按钮 */}
            <button
              className={cn(
                'size-10 rounded-xl',
                'bg-[#1c3128] hover:bg-[#283930]',
                'flex items-center justify-center',
                'text-gray-400 hover:text-white',
                'transition-all relative'
              )}
            >
              <span className="material-symbols-outlined">notifications</span>
              {/* 通知红点 */}
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full" />
            </button>

            {/* 设置按钮 */}
            <button
              className={cn(
                'size-10 rounded-xl',
                'bg-[#1c3128] hover:bg-[#283930]',
                'flex items-center justify-center',
                'text-gray-400 hover:text-white',
                'transition-all'
              )}
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
