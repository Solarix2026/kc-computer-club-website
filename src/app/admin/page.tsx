/* eslint-disable prettier/prettier */
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// ========================================
// Admin Dashboard 首页
// 参考设计：admin_dashboard/code.html
// ========================================

// 统计数据类型
interface StatCard {
  label: string;
  value: number;
  trend: number;
  trendLabel: string;
  icon: string;
  color: string;
}

// 活动数据类型
interface Activity {
  id: string;
  title: string;
  date: string;
  attendees: number;
  status: 'published' | 'draft' | 'planned';
}

// 最近活动类型
interface RecentActivityItem {
  id: string;
  type: 'member_join' | 'event_created' | 'notice_published';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

// 统计数据（模拟）
const stats: StatCard[] = [
  {
    label: '公告总数',
    value: 24,
    trend: 8,
    trendLabel: '+8 本月',
    icon: 'campaign',
    color: 'from-blue-500 to-blue-600',
  },
  {
    label: '活动总数',
    value: 12,
    trend: 3,
    trendLabel: '+3 本月',
    icon: 'event',
    color: 'from-green-500 to-green-600',
  },
  {
    label: '参与成员',
    value: 156,
    trend: 12,
    trendLabel: '+12 本月',
    icon: 'people',
    color: 'from-purple-500 to-purple-600',
  },
];

// 近期活动数据（模拟）
const upcomingActivities: Activity[] = [
  {
    id: '1',
    title: 'Python 数据科学工作坊',
    date: '2025-01-20',
    attendees: 24,
    status: 'published',
  },
  {
    id: '2',
    title: 'Web 开发训练营',
    date: '2025-01-22',
    attendees: 32,
    status: 'published',
  },
  {
    id: '3',
    title: 'AI 应用论坛',
    date: '2025-02-01',
    attendees: 0,
    status: 'draft',
  },
  {
    id: '4',
    title: '黑客马拉松 2025',
    date: '2025-02-15',
    attendees: 0,
    status: 'planned',
  },
];

// 最近活动数据（模拟）
const recentActivities: RecentActivityItem[] = [
  {
    id: '1',
    type: 'notice_published',
    title: '发布了新公告',
    description: '《2025年第一季度活动计划》',
    timestamp: '2小时前',
    icon: 'campaign',
  },
  {
    id: '2',
    type: 'event_created',
    title: '创建了新活动',
    description: 'Python 数据科学工作坊',
    timestamp: '5小时前',
    icon: 'event',
  },
  {
    id: '3',
    type: 'member_join',
    title: '有新成员加入',
    description: '李明成功报名了 Web 开发训练营',
    timestamp: '1天前',
    icon: 'person_add',
  },
];

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1220]">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-[#137fec] text-5xl">
              hourglass_bottom
            </span>
          </div>
          <p className="text-white">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout adminName="管理员">
      {/* 欢迎区域 */}
      <div className="mb-8 bg-linear-to-r from-[#137fec]/20 via-[#1a2632] to-transparent rounded-2xl border border-[#137fec]/20 p-8">
        <h1 className="text-3xl font-black text-white mb-2">欢迎回来！👋</h1>
        <p className="text-gray-400">
          这是电脑社的管理后台。您可以在这里管理公告、活动、评论和成员信息。
        </p>
      </div>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6 hover:border-[#137fec]/50 transition-colors"
          >
            {/* 图标背景 */}
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-linear-to-br ${stat.color} p-3 rounded-xl`}>
                <span className="material-symbols-outlined text-white text-2xl">
                  {stat.icon}
                </span>
              </div>
              <span className="text-green-400 text-sm font-semibold bg-green-500/10 px-3 py-1 rounded-full">
                {stat.trendLabel}
              </span>
            </div>

            {/* 统计信息 */}
            <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-4xl font-black text-white">{stat.value}</p>
            <div className="mt-4 pt-4 border-t border-[#283946]">
              <p className="text-xs text-gray-500">
                环比增长 {stat.trend > 0 ? '+' : ''}{stat.trend}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 近期活动表格 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：活动表格 */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl overflow-hidden">
            {/* 表头 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#283946]">
              <h2 className="text-xl font-bold text-white">近期活动</h2>
              <Link href="/admin/activities">
                <Button 
                  variant="primary" 
                  size="sm"
                  className="!bg-[#137fec] !hover:bg-[#0f5fcc]"
                >
                  查看全部
                </Button>
              </Link>
            </div>

            {/* 表格内容 */}
            <div className="divide-y divide-[#283946]">
              {upcomingActivities.map((activity) => {
                let statusBg = '';
                let statusText = '';
                let statusLabel = '';

                if (activity.status === 'published') {
                  statusBg = 'bg-green-500/10';
                  statusText = 'text-green-400';
                  statusLabel = '已发布';
                } else if (activity.status === 'draft') {
                  statusBg = 'bg-amber-500/10';
                  statusText = 'text-amber-400';
                  statusLabel = '草稿';
                } else {
                  statusBg = 'bg-blue-500/10';
                  statusText = 'text-blue-400';
                  statusLabel = '计划中';
                }

                return (
                  <div
                    key={activity.id}
                    className="px-6 py-4 hover:bg-[#1f2d39] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold max-w-xs truncate">
                        {activity.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusBg} ${statusText}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        {activity.date}
                      </span>
                      {activity.status === 'published' && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            group
                          </span>
                          {activity.attendees} 人已报名
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右侧：最近活动 */}
        <div className="bg-[#1a2632] border border-[#283946] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#283946]">
            <h2 className="text-xl font-bold text-white">最近活动</h2>
          </div>

          <div className="divide-y divide-[#283946]">
            {recentActivities.map((item, index) => (
              <div key={item.id} className="px-6 py-4 hover:bg-[#1f2d39] transition-colors">
                {/* 时间线点 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="size-10 rounded-full bg-[#137fec]/20 flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-[#137fec] text-lg">
                        {item.icon}
                      </span>
                    </div>
                    {index < recentActivities.length - 1 && (
                      <div className="w-0.5 h-12 bg-[#283946]" />
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 pt-1">
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <p className="text-gray-500 text-xs mt-1">{item.description}</p>
                    <p className="text-gray-600 text-xs mt-2">{item.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速操作区域 */}
      <div className="mt-8 bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">快速操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/notices/create">
            <button className="w-full p-4 rounded-xl bg-[#1f2d39] hover:bg-[#283946] transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <span className="material-symbols-outlined text-blue-400">
                    add_circle
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">发布公告</p>
                  <p className="text-gray-500 text-xs">创建新的公告信息</p>
                </div>
              </div>
            </button>
          </Link>

          <Link href="/admin/activities/create">
            <button className="w-full p-4 rounded-xl bg-[#1f2d39] hover:bg-[#283946] transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <span className="material-symbols-outlined text-green-400">
                    event_note
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">创建活动</p>
                  <p className="text-gray-500 text-xs">安排新的社团活动</p>
                </div>
              </div>
            </button>
          </Link>

          <Link href="/admin/comments">
            <button className="w-full p-4 rounded-xl bg-[#1f2d39] hover:bg-[#283946] transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <span className="material-symbols-outlined text-purple-400">
                    chat
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">管理评论</p>
                  <p className="text-gray-500 text-xs">审核和删除评论</p>
                </div>
              </div>
            </button>
          </Link>

          <Link href="/admin/manage">
            <button className="w-full p-4 rounded-xl bg-[#1f2d39] hover:bg-[#283946] transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                  <span className="material-symbols-outlined text-indigo-400">
                    admin_panel_settings
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">管理员管理</p>
                  <p className="text-gray-500 text-xs">添加/删除管理员</p>
                </div>
              </div>
            </button>
          </Link>

          <Link href="/admin/settings">
            <button className="w-full p-4 rounded-xl bg-[#1f2d39] hover:bg-[#283946] transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                  <span className="material-symbols-outlined text-amber-400">
                    settings
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">社团设置</p>
                  <p className="text-gray-500 text-xs">管理社团信息</p>
                </div>
              </div>
            </button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
