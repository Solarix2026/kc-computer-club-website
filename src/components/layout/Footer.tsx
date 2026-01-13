/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// ========================================
// Footer 组件
// 参考设计：club_homepage_1/code.html
// ========================================

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  platform: 'github' | 'discord' | 'twitter' | 'email';
  href: string;
}

interface FooterProps {
  /** 社团名称 */
  clubName?: string;
  /** 社团描述 */
  description?: string;
  /** 快速链接 */
  quickLinks?: FooterLink[];
  /** 社交媒体链接 */
  socialLinks?: SocialLink[];
  /** 联系邮箱 */
  email?: string;
  /** 地址 */
  address?: string;
  /** 额外类名 */
  className?: string;
}

const defaultQuickLinks: FooterLink[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Notices', href: '/notices' },
  { label: 'Activities', href: '/activities' },
  { label: 'Contact', href: '/contact' },
];

const defaultSocialLinks: SocialLink[] = [
  { platform: 'github', href: '#' },
  { platform: 'discord', href: '#' },
  { platform: 'email', href: 'mailto:contact@example.com' },
];

// 社交媒体图标
const SocialIcon = ({ platform }: { platform: SocialLink['platform'] }) => {
  switch (platform) {
    case 'github':
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );
    case 'discord':
      return (
        <span className="material-symbols-outlined text-[20px]">chat</span>
      );
    case 'twitter':
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      );
    case 'email':
      return (
        <span className="material-symbols-outlined text-[20px]">mail</span>
      );
    default:
      return null;
  }
};

export function Footer({
  clubName = '电脑学会',
  description = '推动学校信息技术教育，培养学生编程能力和创新思维。加入我们，一起探索技术的无限可能。',
  quickLinks = defaultQuickLinks,
  socialLinks = defaultSocialLinks,
  email = 'contact@example.com',
  address = 'Room 304, Tech Building',
  className,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'border-t border-gray-200 dark:border-[#283930]',
        'bg-white dark:bg-[#111814]',
        'mt-12 py-12',
        className
      )}
    >
      <div className="mx-auto max-w-300 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 社团信息 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <span className="material-symbols-outlined">terminal</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {clubName}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mb-6 leading-relaxed">
              {description}
            </p>

            {/* 社交媒体链接 */}
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.href}
                  className={cn(
                    'w-8 h-8 rounded-full',
                    'bg-gray-200 dark:bg-[#283930]',
                    'flex items-center justify-center',
                    'text-gray-600 dark:text-white',
                    'hover:bg-primary hover:text-[#111814]',
                    'transition-all'
                  )}
                  target={link.platform !== 'email' ? '_blank' : undefined}
                  rel={link.platform !== 'email' ? 'noopener noreferrer' : undefined}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 联系信息 */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                {email}
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">
                  location_on
                </span>
                {address}
              </li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="border-t border-gray-200 dark:border-[#283930] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {currentYear} {clubName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
