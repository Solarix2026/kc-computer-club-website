/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// ========================================
// Header 组件
// 参考设计：club_homepage_1/code.html
// ========================================

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
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
        'bg-white/95 dark:bg-[#111814]/80',
        'backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-300 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <span className="material-symbols-outlined">terminal</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            电脑社
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
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            // Loading state
            <div className="hidden md:flex items-center gap-2">
              <div className="h-8 w-24 bg-gray-300 dark:bg-[#283930] rounded animate-pulse"></div>
            </div>
          ) : isStudent && user ? (
            // Student logged in
            <div className="hidden md:flex items-center gap-3">
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
            <div className="border-t border-gray-200 dark:border-[#283930] my-2 pt-2">
              {isLoading ? (
                <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  加载中...
                </div>
              ) : isStudent && user ? (
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
