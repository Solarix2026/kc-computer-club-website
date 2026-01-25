/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { BreathingToggleCompact } from '@/components/ui/BreathingToggle';
import { cn } from '@/lib/utils';

// ========================================
// Header 组件
// 参考设计：club_homepage_1/code.html
// ========================================

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: string;
}

interface HeaderProps {
  /** 导航项 */
  navItems?: NavItem[];
  /** 额外类名 */
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { label: '首页', href: '/' },
  { label: '关于我们', href: '/about' },
  { label: '公告', href: '/notices' },
  { label: '活动', href: '/activities' },
];

export function Header({
  navItems = defaultNavItems,
  className,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isStudent, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full',
        'border-b border-gray-200 dark:border-[#283930]',
        'bg-white dark:bg-[#111814]/80',
        'backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-300 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - 使用文字代替图标 */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20">
            <span className="text-primary font-black text-lg">KC</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-black dark:text-white hidden sm:block">
            电脑学会
          </h2>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors',
                item.active
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:text-primary'
              )}
            >
              {item.label}
            </Link>
          ))}
          
          {/* 更多菜单 */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              <span>更多</span>
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-0 w-56 bg-white dark:bg-[#1a2c24] border border-gray-200 dark:border-[#283930] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                {/* 学生菜单项 */}
                <Link
                  href="/attendance"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#13ec80]/10 dark:hover:bg-[#13ec80]/10 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">event_available</span>
                  <div>
                    <div className="font-medium">签到</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">标记考勤</div>
                  </div>
                </Link>
                
                <Link
                  href="/chat"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  <div>
                    <div className="font-medium">群聊</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">加入讨论</div>
                  </div>
                </Link>
                
                <Link
                  href="/projects/submit"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">lightbulb</span>
                  <div>
                    <div className="font-medium">项目提交</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">提案新项目</div>
                  </div>
                </Link>

                <div className="border-t border-gray-200 dark:border-[#283930] my-2" />

                {/* 项目列表菜单项 */}
                <Link
                  href="/projects"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">folder</span>
                  <div>
                    <div className="font-medium">所有项目</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">浏览项目列表</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle compact className="hidden md:flex" />
          
          {/* Breathing Effect Toggle */}
          <BreathingToggleCompact />
          
          {isStudent && user ? (
            // Student logged in
            <div className="hidden md:flex items-center gap-3">
              <NotificationBell />
              <Link
                href="/profile"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                title="查看个人资料"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className={cn(
                  'flex items-center justify-center gap-2',
                  'rounded-xl bg-red-500/10 px-4 py-2',
                  'text-sm font-bold text-red-400',
                  'hover:bg-red-500 hover:text-white',
                  'transition-all duration-300'
                )}
              >
                <span className="material-symbols-outlined text-[18px]">
                  logout
                </span>
                <span>退出</span>
              </button>
            </div>
          ) : (
            // Not logged in
            <Link
              href="/auth/login"
              className={cn(
                'hidden md:flex items-center justify-center gap-2',
                'rounded-xl bg-primary/10 px-4 py-2',
                'text-sm font-bold text-primary',
                'hover:bg-primary hover:text-black',
                'transition-all duration-300'
              )}
            >
              <span className="material-symbols-outlined text-[18px]">
                login
              </span>
              <span>登录</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-900 dark:text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-[#283930] bg-white dark:bg-[#111814]">
          <nav className="flex flex-col px-4 py-4 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#283930]'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* 更多菜单 - 移动端 */}
            <div className="border-t border-gray-200 dark:border-[#283930] my-2 pt-2">
              <p className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                更多功能
              </p>
              <Link
                href="/attendance"
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-[#13ec80]/10 hover:text-primary transition-colors flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg text-primary">event_available</span>
                <div>
                  <div className="font-medium">签到</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">标记考勤</div>
                </div>
              </Link>
              <Link
                href="/chat"
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg text-blue-500">chat</span>
                <div>
                  <div className="font-medium">群聊</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">加入讨论</div>
                </div>
              </Link>
              <Link
                href="/projects/submit"
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg text-purple-500">lightbulb</span>
                <div>
                  <div className="font-medium">项目提交</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">提案新项目</div>
                </div>
              </Link>
              <Link
                href="/projects"
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg text-cyan-500">folder</span>
                <div>
                  <div className="font-medium">所有项目</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">浏览项目列表</div>
                </div>
              </Link>
            </div>
            
            {/* 用户操作 */}
            <div className="border-t border-gray-200 dark:border-[#283930] my-2 pt-2">
              {isStudent && user ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-primary/10 text-primary flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      person
                    </span>
                    个人资料
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      logout
                    </span>
                    退出
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-3 rounded-lg text-sm font-medium bg-primary/10 text-primary flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    login
                  </span>
                  登录
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
