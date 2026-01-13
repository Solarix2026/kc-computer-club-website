/* eslint-disable prettier/prettier */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { NoticesSection, EventsSection } from '@/components/sections/NoticesSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import AttendanceWidget from '@/components/attendance/AttendanceWidget';

// 模拟数据
const mockNotices = [
  {
    id: '1',
    title: '服务器维护通知',
    summary: '本周五晚 10:00 进行系统维护，届时服务将暂停。',
    category: '系统',
    icon: 'warning',
    iconColor: 'orange',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
  },
  {
    id: '2',
    title: '编程马拉松获奖名单',
    summary: '恭喜 NullPointer 队荣获第一名！',
    category: '新闻',
    icon: 'emoji_events',
    iconColor: 'green',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
  },
  {
    id: '3',
    title: '新设备入驻机房',
    summary: 'VR 设备现已开放借用，请到 304 室办理。',
    category: '更新',
    icon: 'science',
    iconColor: 'blue',
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2天前
  },
];

const mockActivities = [
  {
    id: '1',
    title: 'React 入门工作坊',
    category: '工作坊',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
    time: '17:00',
    location: '402 室',
  },
  {
    id: '2',
    title: 'LAN Party 游戏之夜',
    category: '社交',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天后
    time: '20:00',
    location: '大礼堂',
  },
];

const mockProjects = [
  {
    id: '1',
    title: '神经网络可视化工具',
    description: '一个基于 Web 的工具，实时可视化神经网络的学习过程。',
    contributors: 3,
    repoUrl: 'https://github.com',
  },
  {
    id: '2',
    title: '复古游戏引擎',
    description: '使用 C++ 构建的轻量级 2D 平台游戏引擎。',
    contributors: 2,
    repoUrl: 'https://github.com',
  },
  {
    id: '3',
    title: 'UniSchedule 课表应用',
    description: '开源的学生课程表管理移动应用。',
    contributors: 5,
    repoUrl: 'https://github.com',
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();

  // Allow viewing as guest - no authentication requirement

  return (
    <div className="min-h-screen bg-[#102219] text-white">
      {/* 导航栏 */}
      <Header
        navItems={[
          { label: '首页', href: '/', active: true },
          { label: '关于', href: '/about' },
          { label: '公告', href: '/notices' },
          { label: '活动', href: '/activities' },
        ]}
      />

      {/* 主内容 */}
      <main className="flex-1 w-full max-w-300 mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Hero 区域 */}
        <HeroSection
          clubName="电脑学会"
          statusText="正在招收新成员"
          activeUsers={24}
          capacityPercent={45}
          featuredProjectTitle="Campus AI Bot"
          featuredProjectContributors={5}
        />

        {/* 点名系统 */}
        {user && !('role' in user) && (
          <AttendanceWidget
            studentId={user.id}
            studentName={user.name}
            studentEmail={user.email}
          />
        )}

        {/* 公告与活动 Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 公告区域 - 占 2 列 */}
          <NoticesSection notices={mockNotices} />

          {/* 活动区域 - 占 1 列 */}
          <EventsSection activities={mockActivities} />
        </section>

        {/* 项目展示 */}
        <ProjectsSection projects={mockProjects} />
      </main>

      {/* 页脚 */}
      <Footer
        clubName="电脑学会"
        description="培养学生编程能力和创新思维，推动校园信息技术教育。加入我们，一起探索技术的无限可能。"
        email="club@school.edu"
        address="304 室，科技楼"
      />
    </div>
  );
}
