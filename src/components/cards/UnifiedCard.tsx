/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// ========================================
// UnifiedCard 组件
// 统一的卡片设计，支持所有页面使用
// 特性：彩色头部，Logo/图片，标题，描述，状态徽章，管理员设置按钮
// ========================================

interface UnifiedCardProps {
  /** 卡片ID */
  id: string;
  /** 卡片标题 */
  title: string;
  /** 卡片描述 */
  description: string;
  /** 卡片类型 (用于路由) */
  cardType: 'notice' | 'activity' | 'project' | 'signup';
  /** 头部颜色 (主要使用梯度) */
  headerColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** 自定义头部背景 */
  headerBackground?: string;
  /** 头部图片或Logo URL */
  headerImage?: string;
  /** 头部图标 (Material Symbol) */
  headerIcon?: string;
  /** 显示的 Logo URL (右上角) */
  logoUrl?: string;
  /** 状态徽章 */
  status?: {
    label: string;
    variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  };
  /** 底部信息 (左侧) */
  footerLeft?: string;
  /** 底部信息 (右侧) */
  footerRight?: string;
  /** 是否显示管理员设置按钮 */
  showAdminButton?: boolean;
  /** 额外类名 */
  className?: string;
  /** 点击处理 */
  onClick?: () => void;
}

const headerGradients: Record<string, string> = {
  primary: 'from-primary/20 to-primary/10',
  success: 'from-green-500/20 to-green-500/10',
  warning: 'from-amber-500/20 to-amber-500/10',
  danger: 'from-red-500/20 to-red-500/10',
  info: 'from-blue-500/20 to-blue-500/10',
};

const statusColors: Record<string, string> = {
  primary: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  secondary: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const iconsByType: Record<string, string> = {
  notice: 'article',
  activity: 'event',
  project: 'folder',
  signup: 'app_registration',
};

export function UnifiedCard({
  id,
  title,
  description,
  cardType,
  headerColor = 'primary',
  headerBackground,
  headerImage,
  headerIcon = iconsByType[cardType],
  logoUrl,
  status,
  footerLeft,
  footerRight,
  showAdminButton = false,
  className,
  onClick,
}: UnifiedCardProps) {
  const { isAdmin } = useAuth();

  // 路由链接
  const cardLink = `/notice/${id}`;

  // 头部背景
  const headerBgClass = headerBackground || `bg-gradient-to-br ${headerGradients[headerColor]}`;

  return (
    <Link href={cardLink} className="block group">
      <article
        onClick={onClick}
        className={cn(
          'rounded-lg overflow-hidden',
          'border border-[var(--border)] bg-[var(--surface)]',
          'hover:border-primary/50 hover:shadow-lg',
          'transition-all duration-300',
          'h-full flex flex-col',
          'cursor-pointer',
          className
        )}
      >
        {/* 头部区域 - 彩色背景 */}
        <div className={cn('relative h-40 flex items-center justify-center', headerBgClass)}>
          {/* 头部图片 */}
          {headerImage ? (
            <img
              src={headerImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="material-symbols-outlined text-6xl text-primary/40">
              {headerIcon}
            </span>
          )}

          {/* Logo - 右上角 */}
          {logoUrl && (
            <div className="absolute top-3 right-3 w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
          )}

          {/* 状态徽章 - 右上角 (如果没有Logo) */}
          {status && !logoUrl && (
            <span
              className={cn(
                'absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-medium border',
                statusColors[status.variant]
              )}
            >
              {status.label}
            </span>
          )}

          {/* 管理员编辑按钮 - 左上角 */}
          {isAdmin && showAdminButton && (
            <Link
              href={`/admin/edit/${cardType}/${id}`}
              onClick={(e) => e.preventDefault()}
              className="absolute top-3 left-3 p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              title="编辑此项"
            >
              <span className="material-symbols-outlined text-white text-xl">edit</span>
            </Link>
          )}
        </div>

        {/* 内容区域 */}
        <div className="p-4 flex-1 flex flex-col">
          {/* 标题 + 状态 */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3
              className={cn(
                'font-bold text-lg text-[var(--foreground)]',
                'group-hover:text-primary',
                'transition-colors duration-200',
                'line-clamp-2 flex-1'
              )}
            >
              {title}
            </h3>

            {/* 如果有Logo就在这里显示状态 */}
            {status && logoUrl && (
              <span
                className={cn(
                  'flex-shrink-0 px-2 py-1 rounded text-xs font-medium border',
                  statusColors[status.variant]
                )}
              >
                {status.label}
              </span>
            )}
          </div>

          {/* 描述 */}
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 flex-1">
            {description}
          </p>

          {/* 底部信息 */}
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-3 border-t border-[var(--border)]">
            <span>{footerLeft}</span>
            {footerRight && <span>{footerRight}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}

// ========================================
// 便捷导出 - 特定卡片类型的快捷组件
// ========================================

export function NoticeCardUnified({
  id,
  title,
  summary,
  category,
  status,
  logoUrl,
}: {
  id: string;
  title: string;
  summary: string;
  category: string;
  status?: 'draft' | 'published';
  logoUrl?: string;
}) {
  return (
    <UnifiedCard
      id={id}
      title={title}
      description={summary}
      cardType="notice"
      headerColor="info"
      headerIcon="article"
      logoUrl={logoUrl}
      status={status ? { label: status === 'published' ? '已发布' : '草稿', variant: status === 'published' ? 'success' : 'secondary' } : undefined}
      footerLeft={category}
      showAdminButton
    />
  );
}

export function ActivityCardUnified({
  id,
  title,
  description,
  date,
  signupCount,
  maxSignups,
  logoUrl,
  status,
}: {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  signupCount: number;
  maxSignups?: number;
  logoUrl?: string;
  status: 'active' | 'ended' | 'cancelled';
}) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

  return (
    <UnifiedCard
      id={id}
      title={title}
      description={description}
      cardType="activity"
      headerColor="success"
      headerIcon="event"
      logoUrl={logoUrl}
      status={{
        label: status === 'active' ? '报名中' : status === 'ended' ? '已结束' : '已取消',
        variant: status === 'active' ? 'success' : 'secondary',
      }}
      footerLeft={dateStr}
      footerRight={`${signupCount}${maxSignups ? `/${maxSignups}` : ''} 人`}
      showAdminButton
    />
  );
}

export function ProjectCardUnified({
  id,
  title,
  description,
  status,
  members,
  logoUrl,
}: {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  members: any[];
  logoUrl?: string;
}) {
  const statusMap = {
    pending: { label: '待审核', variant: 'warning' as const },
    approved: { label: '已批准', variant: 'success' as const },
    rejected: { label: '已拒绝', variant: 'danger' as const },
    revision: { label: '需修改', variant: 'warning' as const },
  };

  return (
    <UnifiedCard
      id={id}
      title={title}
      description={description}
      cardType="project"
      headerColor="primary"
      headerIcon="folder"
      logoUrl={logoUrl}
      status={statusMap[status]}
      footerLeft={`${members.length} 人`}
      footerRight="项目"
      showAdminButton
    />
  );
}
